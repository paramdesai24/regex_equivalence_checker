import type { DFA } from '../dfa/types';
import { findReachableStates } from './reachable';
import { validateDFADeterminism } from '../dfa/validator';
import type { MinimizationResult } from './types';

export interface MinimizationValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates the structural integrity and minimality constraints of a minimized DFA:
 * 1. Satisfies all standard DFA determinism and completeness rules.
 * 2. All minimized states are strictly reachable from the start state (no unreachable states).
 * 3. Representative consistency: all original states in a merged block transition to the same target block.
 * 4. Accepting and non-accepting states are never mixed in any merged block.
 */
export function validateMinimizedDFA(
  result: MinimizationResult,
  originalDfa: DFA
): MinimizationValidationResult {
  const errors: string[] = [];
  const minDfa = result.minimizedDfa;

  // 1. Standard DFA determinism validation
  const baseValidation = validateDFADeterminism(minDfa);
  if (!baseValidation.isValid) {
    errors.push(...baseValidation.errors);
  }

  // 2. Strict reachability check: every state in minimized DFA must be reachable
  const reachableSet = findReachableStates(minDfa);
  for (const s of minDfa.states) {
    if (!reachableSet.has(s.id)) {
      errors.push(`Minimized DFA contains unreachable state '${s.id}'.`);
    }
  }

  // 3. Check accepting/non-accepting separation in state mappings
  const origAcceptSet = new Set(originalDfa.acceptStates);
  for (const mapping of result.stateMapping) {
    const hasAccepting = mapping.originalStates.some((id) => origAcceptSet.has(id));
    const hasNonAccepting = mapping.originalStates.some((id) => !origAcceptSet.has(id));

    if (hasAccepting && hasNonAccepting) {
      errors.push(
        `Invalid merge in state '${mapping.minimizedId}': merged both accepting and non-accepting states: ${mapping.originalStates.join(', ')}.`
      );
    }
  }

  // 4. Representative consistency check across original transitions
  const origTransitionMap = new Map<string, string>();
  for (const t of originalDfa.transitions) {
    origTransitionMap.set(`${t.from},${t.symbol}`, t.to);
  }

  const origToMinMap = new Map<string, string>();
  for (const mapping of result.stateMapping) {
    for (const orig of mapping.originalStates) {
      origToMinMap.set(orig, mapping.minimizedId);
    }
  }

  for (const mapping of result.stateMapping) {
    if (mapping.originalStates.length <= 1) continue;

    for (const sym of minDfa.alphabet) {
      const targets = new Set<string>();
      for (const orig of mapping.originalStates) {
        const tgt = origTransitionMap.get(`${orig},${sym}`);
        if (tgt !== undefined) {
          const minTgt = origToMinMap.get(tgt) ?? 'UNKNOWN';
          targets.add(minTgt);
        }
      }

      if (targets.size > 1) {
        errors.push(
          `Inconsistent block behavior in '${mapping.minimizedId}' on symbol '${sym}': targets diverge into ${Array.from(targets).join(', ')}.`
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
