import type { Token } from '../regex/types';
import type { NFA, Transition, ThompsonStep, ThompsonResult, StateId } from './types';

/**
 * Thompson's Construction — converts a postfix token stream into an ε-NFA.
 *
 * Why postfix? A postfix stream is evaluated left-to-right with a stack,
 * which maps directly onto Thompson's "NFA fragment stack" pattern.
 * Each operand pushes a fragment; each operator pops fragments, combines
 * them, and pushes the result.  No recursion or AST traversal is needed.
 *
 * Time complexity: O(n) — each token is processed exactly once.
 *
 * The algorithm is described in Aho, Lam, Sethi & Ullman — "Compilers:
 * Principles, Techniques, and Tools" (the Dragon Book), Section 3.7.
 */

/**
 * An NFA fragment on the construction stack.
 * It carries just enough state to compose with neighbours.
 */
interface NFAFragment {
  startState: StateId;
  acceptState: StateId;
  transitions: Transition[];
  states: StateId[];
  alphabet: Set<string>;
}

/** Monotonically increasing counter, reset per build call via closure. */
function makeCounter(start = 0): () => StateId {
  let n = start;
  return () => n++;
}

/** Create a fresh empty fragment around two new state IDs. */
function makeFrag(
  next: () => StateId
): { q0: StateId; q1: StateId } {
  return { q0: next(), q1: next() };
}

/**
 * Build an ε-NFA from a validated postfix token array.
 *
 * @param postfixTokens  Output of toPostfix(); must not contain LPAREN/RPAREN.
 * @returns              A complete NFA plus recorded construction steps.
 * @throws               If the token sequence is structurally invalid.
 */
export function buildNFA(postfixTokens: Token[]): ThompsonResult {
  const next = makeCounter(0); // State counter starts at q0 for each NFA
  const stack: NFAFragment[] = [];
  const steps: ThompsonStep[] = [];

  for (const token of postfixTokens) {
    switch (token.type) {
      case 'LITERAL': {
        // ─── Literal rule ───────────────────────────────────────────────────
        // Create q0 --symbol--> q1
        const { q0, q1 } = makeFrag(next);
        const t: Transition = { from: q0, to: q1, symbol: token.value };
        const frag: NFAFragment = {
          startState: q0,
          acceptState: q1,
          transitions: [t],
          states: [q0, q1],
          alphabet: new Set([token.value]),
        };
        stack.push(frag);
        steps.push({
          operator: 'LITERAL',
          subject: token.value,
          description: `Create q${q0} –${token.value}→ q${q1}`,
          newStates: [q0, q1],
          newTransitions: [t],
        });
        break;
      }

      case 'CONCAT': {
        // ─── Concatenation rule ─────────────────────────────────────────────
        // Pop B, then A.  Connect A's accept to B's start via ε.
        // Result: start = A.start, accept = B.accept
        if (stack.length < 2) {
          throw new Error('Invalid postfix expression: CONCAT requires two operands on the stack.');
        }
        const b = stack.pop()!;
        const a = stack.pop()!;
        const epsilonT: Transition = { from: a.acceptState, to: b.startState, symbol: null };
        const frag: NFAFragment = {
          startState: a.startState,
          acceptState: b.acceptState,
          transitions: [...a.transitions, epsilonT, ...b.transitions],
          states: [...a.states, ...b.states],
          alphabet: new Set([...a.alphabet, ...b.alphabet]),
        };
        stack.push(frag);
        steps.push({
          operator: 'CONCAT',
          subject: '.',
          description: `Concatenate: add q${a.acceptState} –ε→ q${b.startState}`,
          newStates: [],
          newTransitions: [epsilonT],
        });
        break;
      }

      case 'UNION': {
        // ─── Union rule ─────────────────────────────────────────────────────
        // Pop B, then A.  Create new start (qs) and accept (qa).
        //   qs –ε→ A.start,   qs –ε→ B.start
        //   A.accept –ε→ qa,  B.accept –ε→ qa
        if (stack.length < 2) {
          throw new Error('Invalid postfix expression: UNION requires two operands on the stack.');
        }
        const b = stack.pop()!;
        const a = stack.pop()!;
        const qs = next(); // new start
        const qa = next(); // new accept
        const t1: Transition = { from: qs, to: a.startState, symbol: null };
        const t2: Transition = { from: qs, to: b.startState, symbol: null };
        const t3: Transition = { from: a.acceptState, to: qa, symbol: null };
        const t4: Transition = { from: b.acceptState, to: qa, symbol: null };
        const frag: NFAFragment = {
          startState: qs,
          acceptState: qa,
          transitions: [t1, t2, ...a.transitions, ...b.transitions, t3, t4],
          states: [qs, qa, ...a.states, ...b.states],
          alphabet: new Set([...a.alphabet, ...b.alphabet]),
        };
        stack.push(frag);
        steps.push({
          operator: 'UNION',
          subject: '|',
          description:
            `Union: new start q${qs}, new accept q${qa}. ` +
            `q${qs} –ε→ q${a.startState}, q${qs} –ε→ q${b.startState}, ` +
            `q${a.acceptState} –ε→ q${qa}, q${b.acceptState} –ε→ q${qa}`,
          newStates: [qs, qa],
          newTransitions: [t1, t2, t3, t4],
        });
        break;
      }

      case 'STAR': {
        // ─── Kleene Star rule ────────────────────────────────────────────────
        // Pop A.  Create new start (qs) and accept (qa).
        //   qs –ε→ qa          (bypass: accept zero repetitions)
        //   qs –ε→ A.start     (enter loop)
        //   A.accept –ε→ A.start  (repeat)
        //   A.accept –ε→ qa    (exit loop)
        if (stack.length < 1) {
          throw new Error('Invalid postfix expression: STAR requires one operand on the stack.');
        }
        const a = stack.pop()!;
        const qs = next();
        const qa = next();
        const t1: Transition = { from: qs, to: qa, symbol: null };           // bypass
        const t2: Transition = { from: qs, to: a.startState, symbol: null }; // enter
        const t3: Transition = { from: a.acceptState, to: a.startState, symbol: null }; // repeat
        const t4: Transition = { from: a.acceptState, to: qa, symbol: null }; // exit
        const frag: NFAFragment = {
          startState: qs,
          acceptState: qa,
          transitions: [t1, t2, ...a.transitions, t3, t4],
          states: [qs, qa, ...a.states],
          alphabet: new Set([...a.alphabet]),
        };
        stack.push(frag);
        steps.push({
          operator: 'STAR',
          subject: '*',
          description:
            `Kleene star: new start q${qs}, new accept q${qa}. ` +
            `Bypass: q${qs} –ε→ q${qa}. ` +
            `Loop: q${qs} –ε→ q${a.startState}, q${a.acceptState} –ε→ q${a.startState}, q${a.acceptState} –ε→ q${qa}`,
          newStates: [qs, qa],
          newTransitions: [t1, t2, t3, t4],
        });
        break;
      }

      // LPAREN / RPAREN should never appear in postfix but guard anyway
      case 'LPAREN':
      case 'RPAREN':
        throw new Error(`Unexpected token type '${token.type}' in postfix stream.`);
    }
  }

  if (stack.length === 0) {
    throw new Error('Invalid postfix expression: no NFA was constructed (empty token stream).');
  }
  if (stack.length > 1) {
    throw new Error(
      `Invalid postfix expression: ${stack.length} fragments remain on the stack (expected 1).`
    );
  }

  const finalFrag = stack[0];

  // Deduplicate states (duplicates can appear if the same StateId appears in
  // multiple sub-fragment arrays due to sharing — this is a safety measure)
  const uniqueStates = [...new Set(finalFrag.states)].sort((a, b) => a - b);

  const nfa: NFA = {
    states: uniqueStates,
    startState: finalFrag.startState,
    acceptState: finalFrag.acceptState,
    transitions: finalFrag.transitions,
    alphabet: [...finalFrag.alphabet].sort(),
  };

  return { nfa, steps };
}
