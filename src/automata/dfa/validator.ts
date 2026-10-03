import type { DFA } from './types';

export interface DeterminismValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates that a DFA satisfies deterministic finite automaton properties:
 * 1. Exactly one start state exists among the states.
 * 2. Every state ID in transitions belongs to the DFA's states.
 * 3. No state has more than one transition on the same symbol (no non-determinism).
 * 4. If dead state is included, every state has exactly one transition per alphabet symbol (completeness).
 */
export function validateDFADeterminism(dfa: DFA): DeterminismValidationResult {
  const errors: string[] = [];
  const stateIds = new Set(dfa.states.map((s) => s.id));

  // 1. Start state validity
  if (!stateIds.has(dfa.startState)) {
    errors.push(`Start state '${dfa.startState}' not found in DFA states.`);
  }

  // 2. Accept states validity
  for (const acc of dfa.acceptStates) {
    if (!stateIds.has(acc)) {
      errors.push(`Accept state '${acc}' not found in DFA states.`);
    }
  }

  // 3. Outgoing transitions per state and symbol
  const transitionMap = new Map<string, string>(); // "from,symbol" -> target

  for (const t of dfa.transitions) {
    if (!stateIds.has(t.from)) {
      errors.push(`Transition source '${t.from}' not found in DFA states.`);
    }
    if (!stateIds.has(t.to)) {
      errors.push(`Transition target '${t.to}' not found in DFA states.`);
    }
    if (!dfa.alphabet.includes(t.symbol)) {
      errors.push(`Transition symbol '${t.symbol}' not present in DFA alphabet.`);
    }

    const key = `${t.from},${t.symbol}`;
    const existing = transitionMap.get(key);
    if (existing && existing !== t.to) {
      errors.push(
        `Non-deterministic branch detected: state '${t.from}' has multiple transitions for symbol '${t.symbol}' -> '${existing}' and '${t.to}'.`
      );
    } else {
      transitionMap.set(key, t.to);
    }
  }

  // 4. Completeness check if dead state is included
  if (dfa.deadStateId !== null) {
    for (const state of dfa.states) {
      for (const sym of dfa.alphabet) {
        const key = `${state.id},${sym}`;
        if (!transitionMap.has(key)) {
          errors.push(`DFA is incomplete: state '${state.id}' has no transition for symbol '${sym}'.`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
