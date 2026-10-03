import type { NFA, StateId } from '../nfa/types';
import type { DFA, DFAState, DFATransition, SubsetConstructionResult, SubsetConstructionStep } from './types';
import { epsilonClosure } from './epsilonClosure';
import { move } from './move';
import { getDFAStateName } from './stateNaming';

/**
 * Creates a canonical string key for a set of NFA states.
 * Form: "0,1,4" (strictly sorted numeric IDs).
 * Two sets containing the same state IDs will produce identical keys.
 */
export function canonicalSubsetKey(states: Iterable<StateId>): string {
  const arr = Array.from(new Set(states)).sort((a, b) => a - b);
  return arr.join(',');
}

/**
 * Formats a list of NFA states for display (e.g. "{q0, q1, q4}").
 */
export function formatSubset(states: StateId[]): string {
  if (states.length === 0) return '∅';
  return `{${states.map((s) => `q${s}`).join(', ')}}`;
}

export interface SubsetConstructionOptions {
  /** If true, creates an explicit DEAD trap state for missing transitions. Defaults to true. */
  includeDeadState?: boolean;
}

/**
 * Converts an ε-NFA into an equivalent Deterministic Finite Automaton (DFA)
 * using the standard subset (powerset) construction algorithm.
 *
 * Algorithm Overview:
 * 1. Initial DFA state A = ε-closure({nfa.startState}).
 * 2. For each unprocessed DFA state U (representing NFA subset S) and each symbol a ∈ Σ:
 *    T_subset = ε-closure(move(S, a))
 *    If T_subset is non-empty:
 *      Map T_subset to an existing or fresh DFA state.
 *      Add transition U –a→ T.
 *    Else:
 *      Route to explicit DEAD state (if enabled) with self-loops on all symbols.
 * 3. A DFA state is accepting iff its NFA-state subset contains nfa.acceptState.
 *
 * Determinism guarantee:
 * For every state and symbol, there is exactly one target state.
 */
export function buildDFA(
  nfa: NFA,
  options: SubsetConstructionOptions = {}
): SubsetConstructionResult {
  const includeDead = options.includeDeadState ?? true;
  const alphabet = [...nfa.alphabet].sort();
  const steps: SubsetConstructionStep[] = [];

  // Map: canonical key -> DFAState
  const stateMap = new Map<string, DFAState>();
  const dfaStates: DFAState[] = [];
  const transitions: DFATransition[] = [];
  const queue: DFAState[] = [];

  let nextNameIndex = 0;
  let stepCounter = 1;

  // 1. Initial State: ε-closure({startState})
  const startClosureSet = epsilonClosure(nfa, [nfa.startState]);
  const startSubset = Array.from(startClosureSet).sort((a, b) => a - b);
  const startKey = canonicalSubsetKey(startSubset);

  const startId = getDFAStateName(nextNameIndex++);
  const startIsAccepting = startSubset.includes(nfa.acceptState);

  const startState: DFAState = {
    id: startId,
    nfaStates: startSubset,
    isAccepting: startIsAccepting,
  };

  stateMap.set(startKey, startState);
  dfaStates.push(startState);
  queue.push(startState);

  steps.push({
    stepNumber: stepCounter++,
    type: 'START',
    sourceState: startState.id,
    sourceSubset: startSubset,
    targetState: startState.id,
    closureResult: startSubset,
    isNewState: true,
    description: `Initialize start state ${startState.id} = ε-closure({q${nfa.startState}}) = ${formatSubset(startSubset)}${startIsAccepting ? ' [Accepting]' : ''}.`,
  });

  let deadState: DFAState | null = null;
  let deadStateId: string | null = null;

  const getOrCreateDeadState = (): DFAState => {
    if (!deadState) {
      deadState = {
        id: 'DEAD',
        nfaStates: [],
        isAccepting: false,
        isDead: true,
      };
      deadStateId = deadState.id;
      dfaStates.push(deadState);
      // Dead state loops to itself on every alphabet symbol
      for (const sym of alphabet) {
        transitions.push({
          from: 'DEAD',
          to: 'DEAD',
          symbol: sym,
        });
      }
    }
    return deadState;
  };

  // 2. Process worklist queue
  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentSubset = current.nfaStates;

    for (const sym of alphabet) {
      const moveSet = move(nfa, currentSubset, sym);
      const moveSorted = Array.from(moveSet).sort((a, b) => a - b);

      if (moveSorted.length === 0) {
        // Empty move -> routes to dead state if included
        if (includeDead) {
          const isFirstDead = deadStateId === null;
          const trap = getOrCreateDeadState();
          transitions.push({
            from: current.id,
            to: trap.id,
            symbol: sym,
          });

          steps.push({
            stepNumber: stepCounter++,
            type: 'TRANSITION',
            sourceState: current.id,
            sourceSubset: currentSubset,
            symbol: sym,
            moveResult: [],
            closureResult: [],
            targetState: trap.id,
            isNewState: isFirstDead,
            description: `move(${current.id}, '${sym}') = ∅ → transition ${current.id} –${sym}→ ${trap.id} (trap state).`,
          });
        }
        continue;
      }

      const closureSet = epsilonClosure(nfa, moveSorted);
      const closureSorted = Array.from(closureSet).sort((a, b) => a - b);
      const closureKey = canonicalSubsetKey(closureSorted);

      let targetState = stateMap.get(closureKey);
      let isNew = false;

      if (!targetState) {
        isNew = true;
        const newId = getDFAStateName(nextNameIndex++);
        const isAccepting = closureSorted.includes(nfa.acceptState);

        targetState = {
          id: newId,
          nfaStates: closureSorted,
          isAccepting,
        };

        stateMap.set(closureKey, targetState);
        dfaStates.push(targetState);
        queue.push(targetState);
      }

      transitions.push({
        from: current.id,
        to: targetState.id,
        symbol: sym,
      });

      steps.push({
        stepNumber: stepCounter++,
        type: 'TRANSITION',
        sourceState: current.id,
        sourceSubset: currentSubset,
        symbol: sym,
        moveResult: moveSorted,
        closureResult: closureSorted,
        targetState: targetState.id,
        isNewState: isNew,
        description: `move(${current.id}, '${sym}') = ${formatSubset(moveSorted)} → ε-closure = ${formatSubset(closureSorted)} (${isNew ? `new state ${targetState.id}` : `existing state ${targetState.id}`}). Add transition ${current.id} –${sym}→ ${targetState.id}.`,
      });
    }
  }

  const acceptStates = dfaStates.filter((s) => s.isAccepting).map((s) => s.id);

  const dfa: DFA = {
    states: dfaStates,
    startState: startState.id,
    acceptStates,
    transitions,
    alphabet,
    deadStateId,
  };

  return { dfa, steps };
}
