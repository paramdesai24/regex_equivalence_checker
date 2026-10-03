import type { ProductAutomaton } from './types';

export interface ProductAutomatonValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates the structural integrity and symmetric-difference correctness
 * of a constructed Product Automaton.
 */
export function validateProductAutomaton(
  pa: ProductAutomaton
): ProductAutomatonValidationResult {
  const errors: string[] = [];
  const stateIds = new Set(pa.states.map((s) => s.id));
  const seenPairs = new Set<string>();

  // 1. Start state validity
  if (!stateIds.has(pa.startState)) {
    errors.push(`Start state '${pa.startState}' not found in product states.`);
  }

  // 2. Uniqueness and symmetric-difference condition for each state
  for (const s of pa.states) {
    const pairKey = `${s.stateA},${s.stateB}`;
    if (seenPairs.has(pairKey)) {
      errors.push(`Duplicate product state pair detected: ${pairKey}.`);
    } else {
      seenPairs.add(pairKey);
    }

    const expectedDist = (s.acceptingA && !s.acceptingB) || (!s.acceptingA && s.acceptingB);
    if (s.isDistinguishing !== expectedDist) {
      errors.push(
        `State '${s.id}' distinguishing flag mismatch: got ${s.isDistinguishing}, expected ${expectedDist} (acceptingA=${s.acceptingA}, acceptingB=${s.acceptingB}).`
      );
    }
  }

  // 3. Transition validity
  for (const t of pa.transitions) {
    if (!stateIds.has(t.from)) {
      errors.push(`Transition source '${t.from}' not found in product states.`);
    }
    if (!stateIds.has(t.to)) {
      errors.push(`Transition target '${t.to}' not found in product states.`);
    }
    if (!pa.alphabet.includes(t.symbol)) {
      errors.push(`Transition symbol '${t.symbol}' not in product alphabet.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
