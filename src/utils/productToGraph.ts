import type { ProductAutomaton } from '../automata/equivalence/types';
import type { GraphNode, GraphEdge } from './nfaToGraph';

export interface ProductGraphNode extends GraphNode {
  isDistinguishing: boolean;
  isOnCounterexamplePath: boolean;
  pairLabel: string;
  acceptingA: boolean;
  acceptingB: boolean;
}

export interface ProductGraphEdge extends GraphEdge {
  isOnCounterexamplePath: boolean;
}

/**
 * Lays out product states in left-to-right layers via BFS from start product state.
 */
function layoutProductStates(
  states: ProductAutomaton['states'],
  transitions: ProductAutomaton['transitions'],
  startStateId: string
): Map<string, { x: number; y: number }> {
  const layers = new Map<string, number>();
  const queue: string[] = [startStateId];
  layers.set(startStateId, 0);

  const adj = new Map<string, string[]>();
  for (const t of transitions) {
    if (!adj.has(t.from)) adj.set(t.from, []);
    adj.get(t.from)!.push(t.to);
  }

  while (queue.length > 0) {
    const cur = queue.shift()!;
    const curLayer = layers.get(cur)!;
    const neighbors = adj.get(cur) ?? [];
    for (const next of neighbors) {
      if (!layers.has(next)) {
        layers.set(next, curLayer + 1);
        queue.push(next);
      }
    }
  }

  const maxLayer = Math.max(0, ...Array.from(layers.values()));
  for (const s of states) {
    if (!layers.has(s.id)) layers.set(s.id, maxLayer + 1);
  }

  const byLayer = new Map<number, string[]>();
  for (const [sId, l] of layers) {
    if (!byLayer.has(l)) byLayer.set(l, []);
    byLayer.get(l)!.push(sId);
  }

  const HGAP = 190;
  const VGAP = 100;
  const positions = new Map<string, { x: number; y: number }>();

  for (const [layer, statesInLayer] of byLayer) {
    const totalH = (statesInLayer.length - 1) * VGAP;
    statesInLayer.forEach((sId, i) => {
      positions.set(sId, {
        x: layer * HGAP + 60,
        y: i * VGAP - totalH / 2 + 180,
      });
    });
  }

  return positions;
}

export function productToGraph(
  pa: ProductAutomaton,
  counterexampleNodeIds: string[] = [],
  counterexampleEdgeIds: string[] = []
): { nodes: ProductGraphNode[]; edges: ProductGraphEdge[] } {
  const pathNodeSet = new Set(counterexampleNodeIds);
  const pathEdgeSet = new Set(counterexampleEdgeIds);

  const positions = layoutProductStates(pa.states, pa.transitions, pa.startState);

  const nodes: ProductGraphNode[] = pa.states.map((s) => {
    const pos = positions.get(s.id) ?? { x: 60, y: 60 };
    return {
      id: s.id,
      label: s.label,
      pairLabel: s.label,
      isStart: s.id === pa.startState,
      isAccept: s.isDistinguishing,
      isDistinguishing: s.isDistinguishing,
      isOnCounterexamplePath: pathNodeSet.has(s.id),
      acceptingA: s.acceptingA,
      acceptingB: s.acceptingB,
      x: pos.x,
      y: pos.y,
    };
  });

  // Group parallel edges (same from -> to) and sort merged labels
  const edgeMap = new Map<
    string,
    {
      symbols: Set<string>;
      isSelfLoop: boolean;
      edgeIds: string[];
      isOnPath: boolean;
    }
  >();

  for (const t of pa.transitions) {
    const key = `${t.from}->${t.to}`;
    const onPath = pathEdgeSet.has(t.id);

    if (!edgeMap.has(key)) {
      edgeMap.set(key, {
        symbols: new Set([t.symbol]),
        isSelfLoop: t.from === t.to,
        edgeIds: [t.id],
        isOnPath: onPath,
      });
    } else {
      const entry = edgeMap.get(key)!;
      entry.symbols.add(t.symbol);
      entry.edgeIds.push(t.id);
      if (onPath) entry.isOnPath = true;
    }
  }

  const edges: ProductGraphEdge[] = Array.from(edgeMap.entries()).map(([key, val], i) => {
    const [src, tgt] = key.split('->');
    const sortedSymbols = Array.from(val.symbols).sort().join(',');

    return {
      id: `p-e${i}-${key}`,
      source: src,
      target: tgt,
      label: sortedSymbols,
      isSelfLoop: val.isSelfLoop,
      isOnCounterexamplePath: val.isOnPath,
    };
  });

  return { nodes, edges };
}
