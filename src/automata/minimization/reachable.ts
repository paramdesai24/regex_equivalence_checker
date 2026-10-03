import type { DFA } from '../dfa/types';

/**
 * Finds all state IDs reachable from the start state of a DFA using BFS traversal.
 */
export function findReachableStates(dfa: DFA): Set<string> {
  const reachable = new Set<string>();
  const queue: string[] = [];

  const start = dfa.startState;
  if (!dfa.states.some((s) => s.id === start)) {
    return reachable;
  }

  reachable.add(start);
  queue.push(start);

  // Pre-index transitions for fast adjacency lookup
  const adj = new Map<string, string[]>();
  for (const t of dfa.transitions) {
    const list = adj.get(t.from);
    if (list) {
      list.push(t.to);
    } else {
      adj.set(t.from, [t.to]);
    }
  }

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const neighbors = adj.get(curr);
    if (!neighbors) continue;

    for (const next of neighbors) {
      if (!reachable.has(next)) {
        reachable.add(next);
        queue.push(next);
      }
    }
  }

  return reachable;
}

export interface PruneResult {
  prunedDfa: DFA;
  reachable: string[];
  removed: string[];
}

/**
 * Prunes unreachable states and their associated transitions from a DFA.
 */
export function pruneUnreachableStates(dfa: DFA): PruneResult {
  const reachableSet = findReachableStates(dfa);
  const allStateIds = dfa.states.map((s) => s.id);

  const reachable = allStateIds.filter((id) => reachableSet.has(id)).sort();
  const removed = allStateIds.filter((id) => !reachableSet.has(id)).sort();

  const prunedStates = dfa.states.filter((s) => reachableSet.has(s.id));
  const prunedTransitions = dfa.transitions.filter(
    (t) => reachableSet.has(t.from) && reachableSet.has(t.to)
  );
  const prunedAccept = dfa.acceptStates.filter((id) => reachableSet.has(id));
  const prunedDeadId =
    dfa.deadStateId && reachableSet.has(dfa.deadStateId) ? dfa.deadStateId : null;

  const prunedDfa: DFA = {
    states: prunedStates,
    startState: dfa.startState,
    acceptStates: prunedAccept,
    transitions: prunedTransitions,
    alphabet: [...dfa.alphabet].sort(),
    deadStateId: prunedDeadId,
  };

  return {
    prunedDfa,
    reachable,
    removed,
  };
}
