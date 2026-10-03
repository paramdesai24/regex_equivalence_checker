import { describe, it, expect } from 'vitest';
import { processRegex } from '../../regex/index';
import { buildNFA } from '../../nfa/thompson';
import { buildDFA } from '../../dfa/subset';
import { minimizeDFA } from '../../minimization/minimize';
import { simulateDFA } from '../../dfa/simulation';
import { checkEquivalence } from '../equivalence';
import { getCombinedAlphabet, completeDFA } from '../normalize';
import { validateProductAutomaton } from '../validator';

/** Helper: complete pipeline from regex string to Minimized DFA */
function getMinDFA(expr: string) {
  const p = processRegex(expr);
  if (!p.isValid) throw new Error(`Invalid regex: ${p.error?.message}`);
  const { nfa } = buildNFA(p.postfixTokens);
  const { dfa } = buildDFA(nfa);
  return minimizeDFA(dfa).minimizedDfa;
}

/** Helper: full pipeline comparing two regex strings */
function compareRegex(exprA: string, exprB: string) {
  const minA = getMinDFA(exprA);
  const minB = getMinDFA(exprB);
  return { minA, minB, ...checkEquivalence(minA, minB) };
}

// ─────────────────────────────────────────────────────────────────────────────
describe('Alphabet Normalization & DFA Completion', () => {
  it('computes sorted union of alphabets', () => {
    const minA = getMinDFA('a');
    const minB = getMinDFA('b');
    const combined = getCombinedAlphabet(minA, minB);
    expect(combined).toEqual(['a', 'b']);
  });

  it('completes a DFA over missing symbols via DEAD trap state', () => {
    const minA = getMinDFA('a'); // alphabet only has 'a'
    const completed = completeDFA(minA, ['a', 'b']);

    expect(completed.alphabet).toEqual(['a', 'b']);
    expect(completed.deadStateId).toBeDefined();

    // Every state must have a transition for both 'a' and 'b'
    for (const s of completed.states) {
      expect(completed.transitions.some((t) => t.from === s.id && t.symbol === 'a')).toBe(true);
      expect(completed.transitions.some((t) => t.from === s.id && t.symbol === 'b')).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Equivalent Regular Expressions', () => {
  const equivalentPairs = [
    { a: '(a|b)*', b: '(a*b*)*', desc: 'Star closure identity' },
    { a: 'a|b', b: 'b|a', desc: 'Commutativity of union' },
    { a: '(a|b)*abb', b: '(a|b)*abb', desc: 'Identical expressions' },
    { a: 'a(b|c)', b: 'ab|ac', desc: 'Distributive property of concatenation' },
    { a: 'a*', b: 'a*|a*', desc: 'Idempotence of union' },
  ];

  equivalentPairs.forEach(({ a, b, desc }) => {
    it(`identifies equivalent pair: "${a}" == "${b}" (${desc})`, () => {
      const res = compareRegex(a, b);
      expect(res.equivalent).toBe(true);
      expect(res.counterexample).toBeNull();
      expect(res.visitedProductStates).toBeGreaterThan(0);

      const validation = validateProductAutomaton(res.productAutomaton);
      expect(validation.isValid).toBe(true);
      expect(res.productAutomaton.distinguishingStates).toHaveLength(0);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Non-Equivalent Regular Expressions & Shortest Counterexample', () => {
  it('correctly disproves "(a|b)*" == "a*b*" with shortest counterexample "ba"', () => {
    const res = compareRegex('(a|b)*', 'a*b*');
    expect(res.equivalent).toBe(false);
    expect(res.counterexample).not.toBeNull();

    // "ba" is accepted by (a|b)* and rejected by a*b*
    expect(res.counterexample?.rawString).toBe('ba');
    expect(res.counterexample?.displayString).toBe('ba');
    expect(res.counterexample?.acceptedByA).toBe(true);
    expect(res.counterexample?.acceptedByB).toBe(false);

    // Verify simulation difference
    expect(simulateDFA(res.minA, 'ba')).toBe(true);
    expect(simulateDFA(res.minB, 'ba')).toBe(false);
  });

  it('correctly handles empty string counterexample ε (a* vs aa*)', () => {
    // a* accepts "", but aa* requires at least one 'a'
    const res = compareRegex('a*', 'aa*');
    expect(res.equivalent).toBe(false);
    expect(res.counterexample).not.toBeNull();
    expect(res.counterexample?.rawString).toBe('');
    expect(res.counterexample?.displayString).toBe('ε');

    expect(res.counterexample?.acceptedByA).toBe(true);
    expect(res.counterexample?.acceptedByB).toBe(false);
    expect(simulateDFA(res.minA, '')).toBe(true);
    expect(simulateDFA(res.minB, '')).toBe(false);
  });

  it('disproves "ab" vs "a|b"', () => {
    const res = compareRegex('ab', 'a|b');
    expect(res.equivalent).toBe(false);
    expect(res.counterexample).not.toBeNull();

    const ce = res.counterexample!.rawString;
    expect(simulateDFA(res.minA, ce)).not.toBe(simulateDFA(res.minB, ce));
  });

  it('disproves "(a|b)*abb" vs "(a|b)*ab"', () => {
    const res = compareRegex('(a|b)*abb', '(a|b)*ab');
    expect(res.equivalent).toBe(false);
    expect(res.counterexample).not.toBeNull();

    const ce = res.counterexample!.rawString;
    expect(simulateDFA(res.minA, ce)).not.toBe(simulateDFA(res.minB, ce));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Alphabet Disparity & Deterministic Tie-Breaking', () => {
  it('identifies counterexample involving symbol present in only one regex (a* vs (a|b)*)', () => {
    const res = compareRegex('a*', '(a|b)*');
    expect(res.equivalent).toBe(false);
    expect(res.counterexample).not.toBeNull();

    // Shortest string accepted by (a|b)* but rejected by a* is "b"
    expect(res.counterexample?.rawString).toBe('b');
    expect(res.counterexample?.acceptedByA).toBe(false);
    expect(res.counterexample?.acceptedByB).toBe(true);
  });

  it('deterministically selects lexicographically smallest string when lengths tie ("a" vs "b")', () => {
    // Both 'a' and 'b' are length-1 distinguishing strings.
    // Alphabet is sorted ['a', 'b'], so BFS must choose 'a'.
    const res = compareRegex('a', 'b');
    expect(res.equivalent).toBe(false);
    expect(res.counterexample?.rawString).toBe('a');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Reachable Product Automaton Structural Validation', () => {
  it('satisfies all product automaton structural invariants on complex expressions', () => {
    // Epsilon counterexample: (a|b)*abb vs a*b* (a*b* accepts "", (a|b)*abb rejects "")
    const resEps = compareRegex('(a|b)*abb', 'a*b*');
    const valEps = validateProductAutomaton(resEps.productAutomaton);
    expect(valEps.isValid).toBe(true);
    expect(valEps.errors).toHaveLength(0);
    expect(resEps.counterexample?.displayString).toBe('ε');
    expect(resEps.counterexampleNodeIds.length).toBe(1);
    expect(resEps.counterexampleEdgeIds).toHaveLength(0);

    // Multi-step counterexample: (a|b)* vs a*b* (both accept "", distinguishing string is "ba")
    const resMulti = compareRegex('(a|b)*', 'a*b*');
    const valMulti = validateProductAutomaton(resMulti.productAutomaton);
    expect(valMulti.isValid).toBe(true);
    expect(resMulti.counterexample?.displayString).toBe('ba');
    expect(resMulti.counterexampleNodeIds.length).toBeGreaterThan(1);
    expect(resMulti.counterexampleEdgeIds.length).toBeGreaterThan(0);
  });

  it('handles explicit epsilon literal in regex (a* vs ε|aa*) as equivalent', () => {
    // ε|aa* generates L = {ε} U {a, aa, aaa, ...} = a*
    const res = compareRegex('a*', 'ε|aa*');
    expect(res.equivalent).toBe(true);
    expect(res.counterexample).toBeNull();
  });

  it('proves ε vs ε is equivalent and ε vs a has shortest counterexample ε', () => {
    const resSame = compareRegex('ε', 'ε');
    expect(resSame.equivalent).toBe(true);

    const resDiff = compareRegex('ε', 'a');
    expect(resDiff.equivalent).toBe(false);
    expect(resDiff.counterexample?.displayString).toBe('ε');
    expect(resDiff.counterexample?.acceptedByA).toBe(true);
    expect(resDiff.counterexample?.acceptedByB).toBe(false);
  });

  it('ensures ε is treated as an epsilon transition rather than an alphabet symbol', () => {
    const p = processRegex('ε|a');
    expect(p.isValid).toBe(true);
    const nfaRes = buildNFA(p.postfixTokens);
    expect(nfaRes.nfa.alphabet).toEqual(['a']);
    const dfaRes = buildDFA(nfaRes.nfa);
    expect(dfaRes.dfa.alphabet).toEqual(['a']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Specified Coursework Edge Cases & Malformed Inputs', () => {
  it('correctly compares "a" vs "a"', () => {
    const res = compareRegex('a', 'a');
    expect(res.equivalent).toBe(true);
    expect(res.counterexample).toBeNull();
  });

  it('correctly compares "a" vs "b"', () => {
    const res = compareRegex('a', 'b');
    expect(res.equivalent).toBe(false);
    expect(res.counterexample?.rawString).toBe('a');
  });

  it('correctly compares "a*" vs "aa*"', () => {
    const res = compareRegex('a*', 'aa*');
    expect(res.equivalent).toBe(false);
    expect(res.counterexample?.displayString).toBe('ε');
    expect(res.counterexample?.rawString).toBe('');
  });

  it('correctly compares "(a|b)*" vs "(a*b*)*"', () => {
    const res = compareRegex('(a|b)*', '(a*b*)*');
    expect(res.equivalent).toBe(true);
    expect(res.counterexample).toBeNull();
  });

  it('correctly compares "(a|b)*" vs "a*b*"', () => {
    const res = compareRegex('(a|b)*', 'a*b*');
    expect(res.equivalent).toBe(false);
    expect(res.counterexample?.rawString).toBe('ba');
  });

  it('correctly compares "(a|b)*abb" vs "(a|b)*abb"', () => {
    const res = compareRegex('(a|b)*abb', '(a|b)*abb');
    expect(res.equivalent).toBe(true);
    expect(res.counterexample).toBeNull();
  });

  it('correctly compares "(a|b)*abb" vs "(a|b)*ab"', () => {
    const res = compareRegex('(a|b)*abb', '(a|b)*ab');
    expect(res.equivalent).toBe(false);
    // Shortest string accepted by B but rejected by A is "ab" (length 2)
    expect(res.counterexample?.rawString).toBe('ab');
    expect(res.counterexample?.acceptedByA).toBe(false);
    expect(res.counterexample?.acceptedByB).toBe(true);
  });

  it('safely rejects malformed inputs without throwing unexpected exceptions', () => {
    const malformed = ['a||b', '*a', '(a|b', '()'];
    for (const expr of malformed) {
      const res = processRegex(expr);
      expect(res.isValid).toBe(false);
      expect(res.error).toBeDefined();
      expect(res.error?.message).toBeTruthy();
    }
  });
});
