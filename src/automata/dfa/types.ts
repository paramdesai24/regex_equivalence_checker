import type { StateId } from '../nfa/types';

/**
 * Core type definitions for Deterministic Finite Automata (DFA)
 * and the Subset Construction algorithm.
 */

export interface DFAState {
  /** Readable identifier: 'A', 'B', ..., 'Z', 'AA', etc. Or 'DEAD' for dead/trap state */
  id: string;
  /** The sorted set of underlying NFA state IDs this DFA state represents */
  nfaStates: StateId[];
  /** True if this DFA state contains the NFA's accept state */
  isAccepting: boolean;
  /** True if this is an explicit trap/dead state (representing the empty set ∅) */
  isDead?: boolean;
}

export interface DFATransition {
  from: string;
  to: string;
  symbol: string;
}

export interface DFA {
  states: DFAState[];
  startState: string;
  acceptStates: string[];
  transitions: DFATransition[];
  alphabet: string[];
  /** The ID of the trap state if present, or null */
  deadStateId: string | null;
}

/**
 * A recorded step during subset construction for educational transparency.
 */
export interface SubsetConstructionStep {
  stepNumber: number;
  type: 'START' | 'TRANSITION';
  sourceState: string;
  sourceSubset: StateId[];
  symbol?: string;
  moveResult?: StateId[];
  closureResult?: StateId[];
  targetState: string;
  isNewState: boolean;
  description: string;
}

export interface SubsetConstructionResult {
  dfa: DFA;
  steps: SubsetConstructionStep[];
}
