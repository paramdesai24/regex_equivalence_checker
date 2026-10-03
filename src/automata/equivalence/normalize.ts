import type { DFA, DFAState, DFATransition } from '../dfa/types';

/**
 * Computes the union alphabet Σ = ΣA ∪ ΣB, sorted lexicographically.
 */
export function getCombinedAlphabet(dfaA: DFA, dfaB: DFA): string[] {
  const set = new Set<string>([...dfaA.alphabet, ...dfaB.alphabet]);
  return Array.from(set).sort();
}

/**
 * Normalizes a DFA so that it is formally complete over a target alphabet.
 *
 * Guarantees:
 * - Every state s ∈ Q has exactly one outgoing transition for every symbol c ∈ targetAlphabet.
 * - Missing transitions are routed to an explicit non-accepting DEAD trap state.
 * - Does not mutate the original DFA object.
 */
export function completeDFA(dfa: DFA, targetAlphabet: string[]): DFA {
  const sortedAlphabet = [...targetAlphabet].sort();

  // Index existing transitions: "from,symbol" -> to
  const existingMap = new Map<string, string>();
  for (const t of dfa.transitions) {
    existingMap.set(`${t.from},${t.symbol}`, t.to);
  }

  const newStates: DFAState[] = dfa.states.map((s) => ({ ...s }));
  const newTransitions: DFATransition[] = [...dfa.transitions];

  let deadId = dfa.deadStateId;

  const getOrCreateDeadState = (): string => {
    if (deadId) return deadId;

    deadId = 'DEAD';
    newStates.push({
      id: deadId,
      nfaStates: [],
      isAccepting: false,
      isDead: true,
    });

    for (const sym of sortedAlphabet) {
      newTransitions.push({
        from: deadId,
        to: deadId,
        symbol: sym,
      });
      existingMap.set(`${deadId},${sym}`, deadId);
    }

    return deadId;
  };

  // Ensure every existing state has a transition for every symbol in targetAlphabet
  for (const s of dfa.states) {
    for (const sym of sortedAlphabet) {
      if (!existingMap.has(`${s.id},${sym}`)) {
        const trapId = getOrCreateDeadState();
        newTransitions.push({
          from: s.id,
          to: trapId,
          symbol: sym,
        });
        existingMap.set(`${s.id},${sym}`, trapId);
      }
    }
  }

  // If dead state was created, ensure it is registered in deadStateId
  return {
    states: newStates,
    startState: dfa.startState,
    acceptStates: [...dfa.acceptStates],
    transitions: newTransitions,
    alphabet: sortedAlphabet,
    deadStateId: deadId,
  };
}
