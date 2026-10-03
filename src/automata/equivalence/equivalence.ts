import type { DFA } from '../dfa/types';
import { simulateDFA } from '../dfa/simulation';
import { getCombinedAlphabet, completeDFA } from './normalize';
import type {
  ProductState,
  ProductTransition,
  ProductAutomaton,
  CounterexampleStep,
  CounterexampleVerification,
  EquivalenceStep,
  EquivalenceResult,
} from './types';

/**
 * Computes language equivalence between two DFAs using a Product Automaton,
 * Symmetric Difference, and Breadth-First Search (BFS).
 *
 * Mathematical Foundation:
 * Two languages are equivalent iff their symmetric difference is empty:
 * L(A) = L(B)  <=>  L(A) △ L(B) = (L(A) ∩ ~L(B)) ∪ (~L(A) ∩ L(B)) = ∅
 *
 * Algorithm Overview:
 * 1. Normalize both DFAs to the combined alphabet Σ = ΣA ∪ ΣB with explicit dead states.
 * 2. Start at product state (startA, startB) corresponding to input prefix ε.
 * 3. Explore reachable product states (sA, sB) using BFS:
 *    A state is distinguishing iff: (sA ∈ FA) XOR (sB ∈ FB).
 * 4. The first distinguishing state encountered via BFS yields the shortest distinguishing
 *    counterexample string, with deterministic lexicographical tie-breaking.
 */
export function checkEquivalence(dfaA: DFA, dfaB: DFA): EquivalenceResult {
  const combinedAlphabet = getCombinedAlphabet(dfaA, dfaB);

  // Conceptually complete both DFAs over the unified alphabet
  const normA = completeDFA(dfaA, combinedAlphabet);
  const normB = completeDFA(dfaB, combinedAlphabet);

  const acceptSetA = new Set(normA.acceptStates);
  const acceptSetB = new Set(normB.acceptStates);

  // Pre-index transitions: "state,symbol" -> nextState
  const transMapA = new Map<string, string>();
  for (const t of normA.transitions) {
    transMapA.set(`${t.from},${t.symbol}`, t.to);
  }

  const transMapB = new Map<string, string>();
  for (const t of normB.transitions) {
    transMapB.set(`${t.from},${t.symbol}`, t.to);
  }

  // Reachable product automaton data
  const productStates: ProductState[] = [];
  const productTransitions: ProductTransition[] = [];
  const stateByPair = new Map<string, ProductState>();

  let nextStateNum = 0;
  let edgeCounter = 0;
  let stepNumber = 1;

  const getOrCreateProductState = (
    stateA: string,
    stateB: string,
    isStart = false
  ): { state: ProductState; isNew: boolean } => {
    const key = `${stateA},${stateB}`;
    const existing = stateByPair.get(key);
    if (existing) {
      return { state: existing, isNew: false };
    }

    const accA = acceptSetA.has(stateA);
    const accB = acceptSetB.has(stateB);
    const isDistinguishing = (accA && !accB) || (!accA && accB);

    const newState: ProductState = {
      id: `P${nextStateNum++}`,
      stateA,
      stateB,
      isDistinguishing,
      acceptingA: accA,
      acceptingB: accB,
      label: `(${stateA}, ${stateB})`,
      isStart,
    };

    stateByPair.set(key, newState);
    productStates.push(newState);
    return { state: newState, isNew: true };
  };

  // Parent tracking for counterexample backtrace
  interface ParentLink {
    prevId: string;
    prevPair: [string, string];
    currPair: [string, string];
    symbol: string;
    stateAFrom: string;
    stateATo: string;
    stateBFrom: string;
    stateBTo: string;
    edgeId: string;
  }
  const parentMap = new Map<string, ParentLink>();

  const steps: EquivalenceStep[] = [];

  // Initialize start product state
  const { state: startState } = getOrCreateProductState(
    normA.startState,
    normB.startState,
    true
  );

  let distinguishingState: ProductState | null = null;
  let distinguishingPrefix = '';

  steps.push({
    stepNumber: stepNumber++,
    productStateId: startState.id,
    pair: [startState.stateA, startState.stateB],
    inputPrefix: 'ε',
    acceptingA: startState.acceptingA,
    acceptingB: startState.acceptingB,
    isDistinguishing: startState.isDistinguishing,
    description: `Visit initial product state ${startState.label} on prefix ε. Regex A: ${
      startState.acceptingA ? 'Accept' : 'Reject'
    }, Regex B: ${startState.acceptingB ? 'Accept' : 'Reject'}.${
      startState.isDistinguishing ? ' [DISTINGUISHING]' : ''
    }`,
  });

  if (startState.isDistinguishing) {
    distinguishingState = startState;
    distinguishingPrefix = '';
  }

  // BFS Queue: [productState, currentPrefix]
  const queue: { state: ProductState; prefix: string }[] = [
    { state: startState, prefix: '' },
  ];

  // Maximum reachable state limit to avoid explosion on pathologically unbounded pairs
  const MAX_PRODUCT_STATES = 500;

  while (queue.length > 0) {
    const { state: current, prefix } = queue.shift()!;

    // Combined alphabet is sorted lexicographically: explores 'a' before 'b'
    for (const sym of combinedAlphabet) {
      const nextA = transMapA.get(`${current.stateA},${sym}`) ?? normA.deadStateId ?? 'DEAD';
      const nextB = transMapB.get(`${current.stateB},${sym}`) ?? normB.deadStateId ?? 'DEAD';

      const { state: nextProduct, isNew } = getOrCreateProductState(nextA, nextB);

      const edgeId = `pe-${edgeCounter++}-${current.id}->${nextProduct.id}-${sym}`;
      productTransitions.push({
        id: edgeId,
        from: current.id,
        to: nextProduct.id,
        symbol: sym,
      });

      if (isNew) {
        parentMap.set(nextProduct.id, {
          prevId: current.id,
          prevPair: [current.stateA, current.stateB],
          currPair: [nextA, nextB],
          symbol: sym,
          stateAFrom: current.stateA,
          stateATo: nextA,
          stateBFrom: current.stateB,
          stateBTo: nextB,
          edgeId,
        });

        const nextPrefix = prefix + sym;

        steps.push({
          stepNumber: stepNumber++,
          productStateId: nextProduct.id,
          pair: [nextProduct.stateA, nextProduct.stateB],
          inputPrefix: nextPrefix,
          acceptingA: nextProduct.acceptingA,
          acceptingB: nextProduct.acceptingB,
          isDistinguishing: nextProduct.isDistinguishing,
          description: `Transition ${current.label} –${sym}→ ${nextProduct.label} (prefix "${nextPrefix}"). Regex A: ${
            nextProduct.acceptingA ? 'Accept' : 'Reject'
          }, Regex B: ${nextProduct.acceptingB ? 'Accept' : 'Reject'}.${
            nextProduct.isDistinguishing ? ' [DISTINGUISHING]' : ''
          }`,
        });

        if (!distinguishingState && nextProduct.isDistinguishing) {
          distinguishingState = nextProduct;
          distinguishingPrefix = nextPrefix;
        }

        if (productStates.length < MAX_PRODUCT_STATES) {
          queue.push({ state: nextProduct, prefix: nextPrefix });
        }
      }
    }
  }

  // Counterexample derivation reconstruction
  let counterexample: CounterexampleVerification | null = null;
  const counterexampleNodeIds: string[] = [];
  const counterexampleEdgeIds: string[] = [];

  if (distinguishingState) {
    const rawString = distinguishingPrefix;
    const displayString = rawString === '' ? 'ε' : rawString;

    // Verify through simulation on both normalized DFAs
    const accA = simulateDFA(normA, rawString);
    const accB = simulateDFA(normB, rawString);

    if (accA === accB) {
      throw new Error(
        `Internal algorithm error: generated counterexample "${displayString}" does not distinguish DFA A and DFA B.`
      );
    }

    // Backtrace from distinguishing state to start state
    const revSteps: CounterexampleStep[] = [];
    let currId = distinguishingState.id;
    counterexampleNodeIds.push(currId);

    while (currId !== startState.id) {
      const link = parentMap.get(currId);
      if (!link) break;

      counterexampleEdgeIds.push(link.edgeId);
      revSteps.push({
        stepNumber: 0,
        fromProductStateId: link.prevId,
        toProductStateId: currId,
        fromPair: link.prevPair,
        toPair: link.currPair,
        symbol: link.symbol,
        stateAFrom: link.stateAFrom,
        stateATo: link.stateATo,
        stateBFrom: link.stateBFrom,
        stateBTo: link.stateBTo,
      });

      currId = link.prevId;
      counterexampleNodeIds.push(currId);
    }

    counterexampleNodeIds.reverse();
    counterexampleEdgeIds.reverse();

    const derivationPath = revSteps.reverse().map((s, idx) => ({
      ...s,
      stepNumber: idx + 1,
    }));

    counterexample = {
      rawString,
      displayString,
      acceptedByA: accA,
      acceptedByB: accB,
      acceptedRegex: accA ? 'A' : 'B',
      rejectedRegex: accA ? 'B' : 'A',
      derivationPath,
    };
  }

  const distinguishingStates = productStates
    .filter((s) => s.isDistinguishing)
    .map((s) => s.id);

  const productAutomaton: ProductAutomaton = {
    states: productStates,
    startState: startState.id,
    transitions: productTransitions,
    alphabet: combinedAlphabet,
    distinguishingStates,
  };

  return {
    equivalent: distinguishingState === null,
    counterexample,
    visitedProductStates: productStates.length,
    productAutomaton,
    steps,
    counterexampleNodeIds,
    counterexampleEdgeIds,
    combinedAlphabet,
    dfaAStats: { states: dfaA.states.length, transitions: dfaA.transitions.length },
    dfaBStats: { states: dfaB.states.length, transitions: dfaB.transitions.length },
  };
}
