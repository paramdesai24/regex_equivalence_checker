import type { NFA, StateId } from '../nfa/types';

/**
 * Computes the set of NFA states directly reachable from a set of states
 * via a specific input symbol.
 *
 * Formal definition:
 * move(S, a) = { to | from ∈ S and from –a→ to }
 *
 * Note: move does NOT include epsilon transitions; epsilon transitions are
 * handled separately by epsilonClosure(move(S, a)).
 *
 * @param nfa The NFA containing transitions
 * @param states Set or array of source state IDs
 * @param symbol Input symbol to match (must not be ε/null)
 * @returns Set of directly reachable target state IDs
 */
export function move(
  nfa: NFA,
  states: Iterable<StateId>,
  symbol: string
): Set<StateId> {
  const result = new Set<StateId>();
  const stateSet = states instanceof Set ? states : new Set(states);

  for (const t of nfa.transitions) {
    if (t.symbol === symbol && stateSet.has(t.from)) {
      result.add(t.to);
    }
  }

  return result;
}
