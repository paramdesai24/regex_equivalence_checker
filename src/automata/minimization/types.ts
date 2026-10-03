import type { DFA } from '../dfa/types';

/**
 * Core type definitions for DFA Minimization (Hopcroft-style Partition Refinement).
 */

export interface MinimizedDFAState {
  /** Identifier for the minimized state: 'A', 'B', etc. */
  id: string;
  /** The set of original DFA state IDs merged into this minimized state */
  originalStates: string[];
  /** True if this minimized state is an accept state */
  isAccepting: boolean;
  /** True if this is an explicit trap/dead state */
  isDead?: boolean;
}

export type MinimizationStepType =
  | 'REACHABILITY'
  | 'INITIAL_PARTITION'
  | 'SPLIT'
  | 'CONVERGENCE';

export interface MinimizationStep {
  stepNumber: number;
  type: MinimizationStepType;
  description: string;
  /** Snapshot of all partition blocks at this step */
  partitions: string[][];
  /** Details if this step was a partition split */
  splitDetails?: {
    symbol: string;
    splitBlock: string[];
    resultingBlocks: string[][];
  };
  /** Details if this step was reachability pruning */
  reachabilityDetails?: {
    reachableStates: string[];
    removedStates: string[];
  };
}

export interface StateMergeMapping {
  minimizedId: string;
  originalStates: string[];
  isAccepting: boolean;
  isDead: boolean;
}

export interface MinimizationResult {
  /** The minimized DFA in standard DFA representation */
  minimizedDfa: DFA;
  /** Detailed metadata for each merged state */
  minimizedStates: MinimizedDFAState[];
  /** Original metrics before minimization */
  originalStateCount: number;
  originalTransitionCount: number;
  /** Minimized metrics */
  minimizedStateCount: number;
  minimizedTransitionCount: number;
  /** Number of states eliminated */
  statesRemoved: number;
  /** Percentage reduction: e.g. 40 (meaning 40%) */
  reductionPercent: number;
  /** Step-by-step partition history for inspection */
  steps: MinimizationStep[];
  /** Unreachable states pruned prior to partition refinement */
  reachableStates: string[];
  removedUnreachableStates: string[];
  /** Explicit mapping: Minimized State -> Original States */
  stateMapping: StateMergeMapping[];
}
