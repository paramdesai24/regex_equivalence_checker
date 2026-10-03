import type { DFA, DFAState, DFATransition } from '../dfa/types';
import { getDFAStateName } from '../dfa/stateNaming';
import { pruneUnreachableStates } from './reachable';
import type {
  MinimizationResult,
  MinimizationStep,
  MinimizedDFAState,
  StateMergeMapping,
} from './types';

/**
 * Minimizes a DFA using the Hopcroft-style partition refinement algorithm.
 *
 * Algorithm Overview:
 * 1. Prune any unreachable states from the DFA start state.
 * 2. Form initial partition P0:
 *    - Block 1: Accepting states (F)
 *    - Block 2: Non-accepting states (Q \ F)
 * 3. Iteratively split blocks on each alphabet symbol until stabilization:
 *    Two states s1, s2 in block B remain in the same sub-block iff for all
 *    symbols a ∈ Σ, δ(s1, a) and δ(s2, a) lead to states in the same partition block.
 * 4. Construct the Minimized DFA:
 *    - Each final partition block becomes one state.
 *    - The block containing original start state becomes the new start state ('A').
 *    - A block is accepting iff any of its member states was accepting.
 *    - Transitions are mapped using any representative state from each block.
 */
export function minimizeDFA(dfa: DFA): MinimizationResult {
  const originalStateCount = dfa.states.length;
  const originalTransitionCount = dfa.transitions.length;

  const steps: MinimizationStep[] = [];
  let stepNumber = 1;

  // 1. Remove unreachable states
  const { prunedDfa, reachable, removed } = pruneUnreachableStates(dfa);

  steps.push({
    stepNumber: stepNumber++,
    type: 'REACHABILITY',
    description:
      removed.length > 0
        ? `Pruned ${removed.length} unreachable state(s): ${removed.join(', ')}. Reachable: ${reachable.join(', ')}.`
        : `All ${reachable.length} state(s) are reachable from start state '${dfa.startState}'.`,
    partitions: [reachable],
    reachabilityDetails: {
      reachableStates: reachable,
      removedStates: removed,
    },
  });

  // Degenerate case: no reachable states
  if (prunedDfa.states.length === 0) {
    const emptyDfa: DFA = {
      states: [],
      startState: '',
      acceptStates: [],
      transitions: [],
      alphabet: [...dfa.alphabet],
      deadStateId: null,
    };
    return {
      minimizedDfa: emptyDfa,
      minimizedStates: [],
      originalStateCount,
      originalTransitionCount,
      minimizedStateCount: 0,
      minimizedTransitionCount: 0,
      statesRemoved: originalStateCount,
      reductionPercent: 100,
      steps,
      reachableStates: reachable,
      removedUnreachableStates: removed,
      stateMapping: [],
    };
  }

  // 2. Initial Partition: Accepting vs Non-Accepting
  const acceptSet = new Set(prunedDfa.acceptStates);
  const acceptingBlock = prunedDfa.states
    .filter((s) => acceptSet.has(s.id))
    .map((s) => s.id)
    .sort();
  const nonAcceptingBlock = prunedDfa.states
    .filter((s) => !acceptSet.has(s.id))
    .map((s) => s.id)
    .sort();

  let partitions: string[][] = [];
  if (acceptingBlock.length > 0) partitions.push(acceptingBlock);
  if (nonAcceptingBlock.length > 0) partitions.push(nonAcceptingBlock);

  steps.push({
    stepNumber: stepNumber++,
    type: 'INITIAL_PARTITION',
    description: `Initial partition P0: Accepting = {${acceptingBlock.join(', ') || '∅'}}, Non-accepting = {${nonAcceptingBlock.join(', ') || '∅'}}.`,
    partitions: partitions.map((b) => [...b]),
  });

  // Fast transition lookup: "from,symbol" -> to
  const transitionMap = new Map<string, string>();
  for (const t of prunedDfa.transitions) {
    transitionMap.set(`${t.from},${t.symbol}`, t.to);
  }

  const alphabet = [...prunedDfa.alphabet].sort();

  // Helper: map each state to its current block index
  const getBlockIndexMap = (currentPartitions: string[][]): Map<string, number> => {
    const map = new Map<string, number>();
    currentPartitions.forEach((block, idx) => {
      for (const s of block) {
        map.set(s, idx);
      }
    });
    return map;
  };

  // 3. Partition Refinement Loop
  let changed = true;
  let iteration = 1;

  while (changed) {
    changed = false;
    const blockIndexMap = getBlockIndexMap(partitions);
    const nextPartitions: string[][] = [];

    for (const block of partitions) {
      if (block.length <= 1) {
        nextPartitions.push(block);
        continue;
      }

      // Check if this block can be split by any symbol
      let wasSplit = false;

      for (const sym of alphabet) {
        // Group states in block by the partition block index their transition leads to
        const subGroups = new Map<number, string[]>();

        for (const state of block) {
          const target = transitionMap.get(`${state},${sym}`);
          const targetBlockIdx = target !== undefined ? (blockIndexMap.get(target) ?? -1) : -1;

          const group = subGroups.get(targetBlockIdx);
          if (group) {
            group.push(state);
          } else {
            subGroups.set(targetBlockIdx, [state]);
          }
        }

        if (subGroups.size > 1) {
          // Block splits on symbol `sym`
          const resultingBlocks = Array.from(subGroups.values())
            .map((b) => b.sort())
            .sort((a, b) => a[0].localeCompare(b[0]));

          steps.push({
            stepNumber: stepNumber++,
            type: 'SPLIT',
            description: `Iteration ${iteration}: Block {${block.join(', ')}} splits on '${sym}' into ${resultingBlocks.map((b) => `{${b.join(', ')}}`).join(', ')}.`,
            partitions: [...nextPartitions, ...resultingBlocks],
            splitDetails: {
              symbol: sym,
              splitBlock: block,
              resultingBlocks,
            },
          });

          for (const sub of resultingBlocks) {
            nextPartitions.push(sub);
          }

          wasSplit = true;
          changed = true;
          break; // Stop testing other symbols on this block for this iteration
        }
      }

      if (!wasSplit) {
        nextPartitions.push(block);
      }
    }

    partitions = nextPartitions;
    iteration++;
  }

  // Record convergence step
  steps.push({
    stepNumber: stepNumber++,
    type: 'CONVERGENCE',
    description: `Partition refinement stabilized after ${iteration - 1} iteration(s). Total equivalent blocks: ${partitions.length}.`,
    partitions: partitions.map((b) => [...b]),
  });

  // 4. Construct Minimized DFA
  // Order blocks deterministically:
  // Put the block containing the start state first (index 0 -> 'A')
  const startBlockIdx = partitions.findIndex((b) => b.includes(prunedDfa.startState));
  const startBlock = partitions[startBlockIdx >= 0 ? startBlockIdx : 0];
  const otherBlocks = partitions
    .filter((_, idx) => idx !== (startBlockIdx >= 0 ? startBlockIdx : 0))
    .sort((a, b) => a[0].localeCompare(b[0]));

  const orderedBlocks = [startBlock, ...otherBlocks];

  // Map original state to new minimized state ID
  const originalToMinimizedId = new Map<string, string>();
  const minimizedStates: MinimizedDFAState[] = [];
  const stateMapping: StateMergeMapping[] = [];

  orderedBlocks.forEach((block, idx) => {
    const minId = getDFAStateName(idx);
    const isAccepting = block.some((s) => acceptSet.has(s));
    const containsDead =
      prunedDfa.deadStateId !== null && block.includes(prunedDfa.deadStateId);

    // Also check if block acts as a dead trap (non-accepting and all transitions self-loop)
    const rep = block[0];
    const isTrap =
      !isAccepting &&
      alphabet.every((sym) => {
        const tgt = transitionMap.get(`${rep},${sym}`);
        return tgt !== undefined && block.includes(tgt);
      });

    const isDead = containsDead || (isTrap && block.length === 1 && block[0] === 'DEAD');

    const minState: MinimizedDFAState = {
      id: minId,
      originalStates: block,
      isAccepting,
      isDead,
    };

    minimizedStates.push(minState);

    for (const s of block) {
      originalToMinimizedId.set(s, minId);
    }

    stateMapping.push({
      minimizedId: minId,
      originalStates: block,
      isAccepting,
      isDead: !!isDead,
    });
  });

  // Build Minimized Transitions
  const minTransitions: DFATransition[] = [];
  const minAcceptStates: string[] = [];

  for (const minState of minimizedStates) {
    if (minState.isAccepting) {
      minAcceptStates.push(minState.id);
    }

    const representative = minState.originalStates[0];
    for (const sym of alphabet) {
      const targetOriginal = transitionMap.get(`${representative},${sym}`);
      if (targetOriginal !== undefined) {
        const targetMinId = originalToMinimizedId.get(targetOriginal);
        if (targetMinId) {
          minTransitions.push({
            from: minState.id,
            to: targetMinId,
            symbol: sym,
          });
        }
      }
    }
  }

  // Detect minimized dead state ID
  const deadStateObj = minimizedStates.find((s) => s.isDead);
  const deadStateId = deadStateObj ? deadStateObj.id : null;

  // Convert minimized states to standard DFAState objects
  const dfaStateList: DFAState[] = minimizedStates.map((ms) => ({
    id: ms.id,
    nfaStates: [], // Preserves DFA interface compatibility
    isAccepting: ms.isAccepting,
    isDead: ms.isDead,
  }));

  const minimizedDfa: DFA = {
    states: dfaStateList,
    startState: minimizedStates[0].id,
    acceptStates: minAcceptStates.sort(),
    transitions: minTransitions,
    alphabet,
    deadStateId,
  };

  const minimizedStateCount = minimizedDfa.states.length;
  const minimizedTransitionCount = minimizedDfa.transitions.length;
  const statesRemoved = originalStateCount - minimizedStateCount;
  const reductionPercent =
    originalStateCount > 0 ? Math.round((statesRemoved / originalStateCount) * 100) : 0;

  return {
    minimizedDfa,
    minimizedStates,
    originalStateCount,
    originalTransitionCount,
    minimizedStateCount,
    minimizedTransitionCount,
    statesRemoved,
    reductionPercent,
    steps,
    reachableStates: reachable,
    removedUnreachableStates: removed,
    stateMapping,
  };
}
