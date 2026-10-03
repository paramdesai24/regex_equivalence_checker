/**
 * Core type definitions for Product Automaton, Language Equivalence,
 * and Shortest Distinguishing Counterexample generation.
 */

export interface ProductState {
  /** Identifier: 'P0', 'P1', etc. */
  id: string;
  /** State ID in DFA A */
  stateA: string;
  /** State ID in DFA B */
  stateB: string;
  /** True if exactly one of stateA or stateB is accepting (A XOR B) */
  isDistinguishing: boolean;
  /** Whether stateA is an accept state in DFA A */
  acceptingA: boolean;
  /** Whether stateB is an accept state in DFA B */
  acceptingB: boolean;
  /** Display label: "(A, B)" */
  label: string;
  /** True if this is the start state (startA, startB) */
  isStart?: boolean;
}

export interface ProductTransition {
  id: string;
  from: string;
  to: string;
  symbol: string;
}

export interface ProductAutomaton {
  states: ProductState[];
  startState: string;
  transitions: ProductTransition[];
  alphabet: string[];
  distinguishingStates: string[];
}

export interface CounterexampleStep {
  stepNumber: number;
  fromProductStateId: string;
  toProductStateId: string;
  fromPair: [string, string];
  toPair: [string, string];
  symbol: string;
  stateAFrom: string;
  stateATo: string;
  stateBFrom: string;
  stateBTo: string;
}

export interface CounterexampleVerification {
  /** The raw counterexample string (empty string "" for ε) */
  rawString: string;
  /** Display formatted string ('ε' if empty) */
  displayString: string;
  /** Acceptance result in DFA A */
  acceptedByA: boolean;
  /** Acceptance result in DFA B */
  acceptedByB: boolean;
  /** Which regex accepts and which rejects */
  acceptedRegex: 'A' | 'B';
  rejectedRegex: 'A' | 'B';
  /** Detailed step-by-step state transition derivation from start state */
  derivationPath: CounterexampleStep[];
}

export interface EquivalenceStep {
  stepNumber: number;
  productStateId: string;
  pair: [string, string];
  inputPrefix: string;
  acceptingA: boolean;
  acceptingB: boolean;
  isDistinguishing: boolean;
  description: string;
}

export interface EquivalenceResult {
  /** True if L(DFA A) == L(DFA B) */
  equivalent: boolean;
  /** Shortest distinguishing counterexample, or null if equivalent */
  counterexample: CounterexampleVerification | null;
  /** Total number of product states reachable from (startA, startB) */
  visitedProductStates: number;
  /** The reachable Product Automaton */
  productAutomaton: ProductAutomaton;
  /** Step-by-step record of BFS traversal for explanation */
  steps: EquivalenceStep[];
  /** Node IDs on the counterexample path for graph highlighting */
  counterexampleNodeIds: string[];
  /** Edge IDs on the counterexample path for graph highlighting */
  counterexampleEdgeIds: string[];
  /** Combined alphabet ΣA ∪ ΣB */
  combinedAlphabet: string[];
  /** Normalization stats */
  dfaAStats: { states: number; transitions: number };
  dfaBStats: { states: number; transitions: number };
}
