/**
 * AutomatonGraph — renders an NFA as a directed state-transition graph
 * using React Flow.
 *
 * Receives pure NFA data; knows nothing about how the NFA was constructed.
 * All algorithm code lives in automata/nfa/thompson.ts.
 */
import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  Handle,
  Position,
  MarkerType,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { NFA } from '../../automata/nfa/types';
import type { DFA } from '../../automata/dfa/types';
import { nfaToGraph } from '../../utils/nfaToGraph';
import { dfaToGraph } from '../../utils/dfaToGraph';

// ─── Custom node: state circle ────────────────────────────────────────────────
interface StateNodeData {
  label: string;
  isStart: boolean;
  isAccept: boolean;
  isDead?: boolean;
  subsetLabel?: string;
}

const StateNode: React.FC<{ data: StateNodeData }> = ({ data }) => {
  return (
    <div
      title={data.subsetLabel ? `${data.label} = ${data.subsetLabel}` : data.label}
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: data.label.length > 3 ? 10 : 12,
        fontFamily: 'monospace',
        fontWeight: 600,
        background: data.isDead ? '#090d16' : data.isAccept ? '#1e293b' : '#0f172a',
        color: data.isDead ? '#64748b' : data.isAccept ? '#a5f3fc' : '#94a3b8',
        border: data.isDead
          ? '1.5px dashed #475569'
          : data.isAccept
          ? '2.5px double #67e8f9'   // double border = accept state
          : data.isStart
          ? '2px solid #6366f1'      // indigo = start state
          : '1.5px solid #334155',
        boxShadow: data.isAccept
          ? '0 0 8px rgba(103,232,249,0.2)'
          : data.isStart
          ? '0 0 8px rgba(99,102,241,0.25)'
          : 'none',
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      {/* Start-state arrow indicator */}
      {data.isStart && (
        <span
          style={{
            position: 'absolute',
            left: -20,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6366f1',
            fontSize: 14,
            lineHeight: 1,
          }}
        >
          →
        </span>
      )}
      <span>{data.label}</span>
    </div>
  );
};

const NODE_TYPES: NodeTypes = { state: StateNode };

// ─── Main component ───────────────────────────────────────────────────────────
export interface AutomatonGraphProps {
  nfa?: NFA;
  dfa?: DFA;
  hideDeadState?: boolean;
}

export const AutomatonGraph: React.FC<AutomatonGraphProps> = ({ nfa, dfa, hideDeadState = false }) => {
  const { nodes: gNodes, edges: gEdges } = useMemo(() => {
    if (dfa) {
      return dfaToGraph(dfa, { hideDeadState });
    }
    if (nfa) {
      return nfaToGraph(nfa);
    }
    return { nodes: [], edges: [] };
  }, [nfa, dfa, hideDeadState]);

  const nodes: Node<StateNodeData>[] = gNodes.map((n) => ({
    id: n.id,
    type: 'state',
    position: { x: n.x, y: n.y },
    data: {
      label: n.label,
      isStart: n.isStart,
      isAccept: n.isAccept,
      isDead: 'isDead' in n ? (n as { isDead?: boolean }).isDead : false,
      subsetLabel: 'subsetLabel' in n ? (n as { subsetLabel?: string }).subsetLabel : undefined,
    },
    draggable: true,
  }));

  const edges: Edge[] = gEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: false,
    type: e.isSelfLoop ? 'selfconnecting' : 'default',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#475569', width: 14, height: 14 },
    style: { stroke: '#475569', strokeWidth: 1.5 },
    labelStyle: { fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace', fontWeight: 600 },
    labelBgStyle: { fill: '#0f172a', fillOpacity: 0.85 },
    labelBgPadding: [3, 5] as [number, number],
    labelBgBorderRadius: 3,
  }));

  const onInit = useCallback((rf: { fitView: () => void }) => {
    rf.fitView();
  }, []);

  return (
    <div style={{ width: '100%', height: 340, background: '#0b1120', borderRadius: 6, border: '1px solid #1e293b' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        onInit={onInit}
        minZoom={0.3}
        maxZoom={2.5}
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1e293b" gap={24} variant={BackgroundVariant.Dots} size={1} />
        <Controls
          style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 4 }}
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
};
