import type { NFA, StateId } from '../nfa/types';

/**
 * Computes the ε-closure of a given set of NFA states.
 *
 * Formal definition:
 * ε-closure(S) is the set of all NFA states reachable from some state s ∈ S
 * by taking zero or more ε-transitions (transitions with symbol === null).
 *
 * Implementation:
 * - Uses an iterative stack (DFS traversal) to avoid call stack limits.
 * - Tracks visited states in a Set to handle cycles safely (e.g. q0 –ε→ q1 –ε→ q0).
 *
 * @param nfa The NFA containing states and transitions
 * @param states Initial set or array of NFA state IDs (S)
 * @returns A new Set of StateIds representing ε-closure(S)
 */
export function epsilonClosure(
  nfa: NFA,
  states: Iterable<StateId>
): Set<StateId> {
  const closure = new Set<StateId>();
  const stack: StateId[] = [];

  // Seed stack and closure with all input states (zero-step reachable)
  for (const s of states) {
    closure.add(s);
    stack.push(s);
  }

  // Pre-index epsilon transitions for fast O(1) lookup per state
  const epsilonAdj = new Map<StateId, StateId[]>();
  for (const t of nfa.transitions) {
    if (t.symbol === null) {
      const targets = epsilonAdj.get(t.from);
      if (targets) {
        targets.push(t.to);
      } else {
        epsilonAdj.set(t.from, [t.to]);
      }
    }
  }

  while (stack.length > 0) {
    const current = stack.pop()!;
    const neighbors = epsilonAdj.get(current);
    if (!neighbors) continue;

    for (const next of neighbors) {
      if (!closure.has(next)) {
        closure.add(next);
        stack.push(next);
      }
    }
  }

  return closure;
}
