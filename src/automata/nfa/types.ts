/**
 * NFA data structure definitions for Thompson's Construction.
 *
 * Design note: StateId is a plain number so that state names (q0, q1, ...) are
 * deterministic and human-readable.  Each NFA produced by Thompson's algorithm
 * exposes exactly one start state and one accept state — this is a deliberate
 * property of Thompson NFAs that later DFA construction relies on.
 */

export type StateId = number;

/** The string used to represent an ε-transition in the UI. */
export const EPSILON = 'ε' as const;

export interface Transition {
  from: StateId;
  to: StateId;
  /** null means ε-transition internally; display as 'ε' in the UI. */
  symbol: string | null;
}

export interface NFA {
  /** All reachable state IDs in this automaton. */
  states: StateId[];
  startState: StateId;
  acceptState: StateId;
  transitions: Transition[];
  /** Alphabet symbols used (excludes ε). */
  alphabet: string[];
}

/**
 * A recorded step from Thompson's Construction algorithm, used for the
 * educational step-by-step inspector.
 */
export interface ThompsonStep {
  /** Which Thompson rule was applied. */
  operator: 'LITERAL' | 'CONCAT' | 'UNION' | 'STAR';
  /** The token value / sub-expression this step acts on. */
  subject: string;
  /** Human-readable one-line description of what was done. */
  description: string;
  /** IDs of newly introduced states in this step (for highlighting). */
  newStates: StateId[];
  /** Transitions introduced in this step (for highlighting). */
  newTransitions: Transition[];
}

export interface ThompsonResult {
  nfa: NFA;
  steps: ThompsonStep[];
}
