import type { NFA } from '../nfa/types';
import type { DFA } from './types';
import { epsilonClosure } from './epsilonClosure';
import { move } from './move';

/**
 * Simulates an NFA on an input string.
 * Returns true if the string is accepted by the NFA, false otherwise.
 */
export function simulateNFA(nfa: NFA, input: string): boolean {
  let currentStates = epsilonClosure(nfa, [nfa.startState]);

  for (const char of input) {
    if (currentStates.size === 0) break;
    const moved = move(nfa, currentStates, char);
    currentStates = epsilonClosure(nfa, moved);
  }

  return currentStates.has(nfa.acceptState);
}

/**
 * Simulates a DFA on an input string.
 * Returns true if the string is accepted by the DFA, false otherwise.
 */
export function simulateDFA(dfa: DFA, input: string): boolean {
  // Build fast transition lookup: "from,symbol" -> to
  const transitionMap = new Map<string, string>();
  for (const t of dfa.transitions) {
    transitionMap.set(`${t.from},${t.symbol}`, t.to);
  }

  let currentState = dfa.startState;

  for (const char of input) {
    const nextState = transitionMap.get(`${currentState},${char}`);
    if (!nextState) {
      return false; // No transition -> rejected
    }
    currentState = nextState;
  }

  return dfa.acceptStates.includes(currentState);
}
