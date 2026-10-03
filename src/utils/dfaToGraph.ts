import type { DFA } from '../automata/dfa/types';
import type { GraphNode, GraphEdge } from './nfaToGraph';

export interface DFAGraphNode extends GraphNode {
  isDead?: boolean;
  subsetLabel?: string;
}

export interface DFAToGraphOptions {
  hideDeadState?: boolean;
}

/**
 * Lays out DFA states in a left-to-right layered arrangement via BFS from the start state.
 * If a DEAD state is present, it is placed in its own distinct bottom position.
 */
function layoutDFAStates(
  stateIds: string[],
  transitions: DFA['transitions'],
  startState: string,
  deadStateId: string | null
): Map<string, { x: number; y: number }> {
  const layers = new Map<string, number>();
  const queue: string[] = [startState];
  layers.set(startState, 0);

  // Group transitions by from
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
      // Don't let dead state absorb BFS layout layers
      if (next === deadStateId) continue;
      if (!layers.has(next)) {
        layers.set(next, curLayer + 1);
        queue.push(next);
      }
    }
  }

  // Any remaining regular states go to maxLayer + 1
  const maxLayer = Math.max(0, ...Array.from(layers.values()));
  for (const id of stateIds) {
    if (id !== deadStateId && !layers.has(id)) {
      layers.set(id, maxLayer + 1);
    }
  }

  // Group normal states by layer
  const byLayer = new Map<number, string[]>();
  for (const [s, l] of layers) {
    if (!byLayer.has(l)) byLayer.set(l, []);
    byLayer.get(l)!.push(s);
  }

  const HGAP = 170;
  const VGAP = 110;
  const positions = new Map<string, { x: number; y: number }>();

  for (const [layer, statesInLayer] of byLayer) {
    const totalH = (statesInLayer.length - 1) * VGAP;
    statesInLayer.forEach((s, i) => {
      positions.set(s, {
        x: layer * HGAP + 60,
        y: i * VGAP - totalH / 2 + 180,
      });
    });
  }

  // If dead state exists and is in stateIds, position it below the main diagram
  if (deadStateId && stateIds.includes(deadStateId)) {
    const midX = (maxLayer * HGAP) / 2 + 60;
    positions.set(deadStateId, {
      x: midX,
      y: 320,
    });
  }

  return positions;
}

export function dfaToGraph(
  dfa: DFA,
  options: DFAToGraphOptions = {}
): { nodes: DFAGraphNode[]; edges: GraphEdge[] } {
  const hideDead = options.hideDeadState ?? false;

  const validStates = dfa.states.filter((s) => !hideDead || !s.isDead);
  const validStateIds = new Set(validStates.map((s) => s.id));

  const validTransitions = dfa.transitions.filter(
    (t) => validStateIds.has(t.from) && validStateIds.has(t.to)
  );

  const positions = layoutDFAStates(
    validStates.map((s) => s.id),
    validTransitions,
    dfa.startState,
    dfa.deadStateId
  );

  const nodes: DFAGraphNode[] = validStates.map((s) => {
    const pos = positions.get(s.id) ?? { x: 60, y: 60 };
    const subsetLabel = s.nfaStates.length > 0 ? `{${s.nfaStates.map((q) => `q${q}`).join(',')}}` : '∅';
    return {
      id: s.id,
      label: s.id,
      isStart: s.id === dfa.startState,
      isAccept: s.isAccepting,
      isDead: !!s.isDead,
      subsetLabel,
      x: pos.x,
      y: pos.y,
    };
  });

  // Group parallel edges (same from -> to) and sort merged labels alphabetically
  const edgeMap = new Map<string, { symbols: Set<string>; isSelfLoop: boolean }>();
  for (const t of validTransitions) {
    const key = `${t.from}->${t.to}`;
    if (!edgeMap.has(key)) {
      edgeMap.set(key, { symbols: new Set([t.symbol]), isSelfLoop: t.from === t.to });
    } else {
      edgeMap.get(key)!.symbols.add(t.symbol);
    }
  }

  const edges: GraphEdge[] = Array.from(edgeMap.entries()).map(([key, val], i) => {
    const [src, tgt] = key.split('->');
    const sortedSymbols = Array.from(val.symbols).sort().join(',');
    return {
      id: `dfa-e${i}-${key}`,
      source: src,
      target: tgt,
      label: sortedSymbols,
      isSelfLoop: val.isSelfLoop,
    };
  });

  return { nodes, edges };
}
