/**
 * Converts an NFA into React Flow nodes and edges for graph rendering.
 *
 * Isolation: this file only does data transformation.
 * No React Flow imports here — types only, so algorithms stay testable.
 */
import type { NFA, StateId } from '../automata/nfa/types';

export interface GraphNode {
  id: string;
  label: string;
  isStart: boolean;
  isAccept: boolean;
  /** Rough layout position (simple layered BFS placement). */
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  /** True when source === target (self-loop). */
  isSelfLoop: boolean;
}

/**
 * Lay out states in a left-to-right layered arrangement via BFS from start state.
 */
function layoutStates(
  states: StateId[],
  transitions: NFA['transitions'],
  startState: StateId
): Map<StateId, { x: number; y: number }> {
  const layers = new Map<StateId, number>();
  const queue: StateId[] = [startState];
  layers.set(startState, 0);
  while (queue.length > 0) {
    const cur = queue.shift()!;
    const curLayer = layers.get(cur)!;
    for (const t of transitions) {
      if (t.from === cur && !layers.has(t.to)) {
        layers.set(t.to, curLayer + 1);
        queue.push(t.to);
      }
    }
  }
  // Any unreached states go to end layer
  const maxLayer = Math.max(0, ...[...layers.values()]);
  for (const s of states) {
    if (!layers.has(s)) layers.set(s, maxLayer + 1);
  }

  // Group by layer, assign y within layer
  const byLayer = new Map<number, StateId[]>();
  for (const [s, l] of layers) {
    if (!byLayer.has(l)) byLayer.set(l, []);
    byLayer.get(l)!.push(s);
  }

  const HGAP = 160;
  const VGAP = 100;
  const positions = new Map<StateId, { x: number; y: number }>();
  for (const [layer, statesInLayer] of byLayer) {
    const totalH = (statesInLayer.length - 1) * VGAP;
    statesInLayer.forEach((s, i) => {
      positions.set(s, {
        x: layer * HGAP + 60,
        y: i * VGAP - totalH / 2 + 200,
      });
    });
  }
  return positions;
}

export function nfaToGraph(nfa: NFA): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const positions = layoutStates(nfa.states, nfa.transitions, nfa.startState);

  const nodes: GraphNode[] = nfa.states.map((s) => {
    const pos = positions.get(s) ?? { x: 60, y: 60 };
    return {
      id: `q${s}`,
      label: `q${s}`,
      isStart: s === nfa.startState,
      isAccept: s === nfa.acceptState,
      x: pos.x,
      y: pos.y,
    };
  });

  // Group parallel edges (same from→to) and merge their labels
  const edgeMap = new Map<string, { label: string; isSelfLoop: boolean }>();
  for (const t of nfa.transitions) {
    const key = `${t.from}->${t.to}`;
    const sym = t.symbol ?? 'ε';
    if (edgeMap.has(key)) {
      edgeMap.get(key)!.label += `,${sym}`;
    } else {
      edgeMap.set(key, { label: sym, isSelfLoop: t.from === t.to });
    }
  }

  const edges: GraphEdge[] = [...edgeMap.entries()].map(([key, val], i) => {
    const [src, tgt] = key.split('->');
    return {
      id: `e${i}-${key}`,
      source: `q${src}`,
      target: `q${tgt}`,
      label: val.label,
      isSelfLoop: val.isSelfLoop,
    };
  });

  return { nodes, edges };
}
