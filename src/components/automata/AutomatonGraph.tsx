/**
 * AutomatonGraph — renders an NFA or DFA as a directed state-transition graph
 * using React Flow.
 *
 * Receives pure NFA/DFA data; knows nothing about how the automaton was built.
 * All algorithm code lives in automata/.
 */
import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  Handle,
  Position,
  MarkerType,
  BackgroundVariant,
  getStraightPath,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { NFA } from '../../automata/nfa/types';
import type { DFA } from '../../automata/dfa/types';
import { nfaToGraph } from '../../utils/nfaToGraph';
import { dfaToGraph } from '../../utils/dfaToGraph';

// ─── Self-loop edge (fixes "selfconnecting not found" warning) ────────────────
const SelfLoopEdge: React.FC<{
  id: string;
  sourceX: number;
  sourceY: number;
  label?: string;
  style?: React.CSSProperties;
  markerEnd?: string;
}> = ({ id, sourceX, sourceY, label, style, markerEnd }) => {
  const d = `M ${sourceX} ${sourceY - 24} C ${sourceX - 40} ${sourceY - 70}, ${sourceX + 40} ${sourceY - 70}, ${sourceX} ${sourceY - 24}`;
  const midX = sourceX;
  const midY = sourceY - 60;

  return (
    <>
      <path
        id={id}
        d={d}
        fill="none"
        style={{ stroke: 'var(--border-2)', strokeWidth: 1.5, ...style }}
        markerEnd={markerEnd}
      />
      {label && (
        <foreignObject x={midX - 20} y={midY - 10} width={40} height={20}>
          <div
            style={{
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: 'var(--t2)',
              background: 'var(--bg)',
              padding: '0 3px',
              textAlign: 'center',
              borderRadius: 2,
            }}
          >
            {label as string}
          </div>
        </foreignObject>
      )}
    </>
  );
};
void getStraightPath; // imported to keep module resolution intact

// ─── Custom node: state circle ────────────────────────────────────────────────
interface StateNodeData {
  label: string;
  isStart: boolean;
  isAccept: boolean;
  isDead?: boolean;
  subsetLabel?: string;
}

const StateNode: React.FC<{ data: StateNodeData }> = ({ data }) => {
  const size = 48;
  const borderColor = data.isDead
    ? 'var(--border)'
    : data.isAccept
    ? 'var(--b)'
    : data.isStart
    ? 'var(--a)'
    : 'var(--border-2)';

  const bg = data.isDead ? 'var(--s1)' : data.isAccept ? 'var(--b-muted)' : 'var(--s2)';
  const textColor = data.isDead ? 'var(--t3)' : data.isAccept ? 'var(--b)' : data.isStart ? 'var(--a)' : 'var(--t2)';
  const fontSize = data.label.length > 3 ? 10 : 12;

  return (
    <div
      title={data.subsetLabel ? `${data.label} = ${data.subsetLabel}` : data.label}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        background: bg,
        color: textColor,
        border: data.isDead
          ? `1.5px dashed ${borderColor}`
          : data.isAccept
          ? `2.5px double ${borderColor}`
          : `1.5px solid ${borderColor}`,
        boxShadow: data.isAccept
          ? `0 0 0 1px ${borderColor}40, 0 0 12px ${borderColor}20`
          : data.isStart
          ? `0 0 0 1px ${borderColor}40`
          : 'none',
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      {data.isStart && (
        <span
          style={{
            position: 'absolute',
            left: -22,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--a)',
            fontSize: 15,
            lineHeight: 1,
            fontWeight: 400,
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
const EDGE_TYPES: EdgeTypes = { selfconnecting: SelfLoopEdge as never };

// ─── Main component ───────────────────────────────────────────────────────────
export interface AutomatonGraphProps {
  nfa?: NFA;
  dfa?: DFA;
  hideDeadState?: boolean;
}

export const AutomatonGraph: React.FC<AutomatonGraphProps> = ({ nfa, dfa, hideDeadState = false }) => {
  const { nodes: gNodes, edges: gEdges } = useMemo(() => {
    if (dfa)  return dfaToGraph(dfa, { hideDeadState });
    if (nfa)  return nfaToGraph(nfa);
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
    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--border-2)', width: 14, height: 14 },
    style: { stroke: 'var(--border-2)', strokeWidth: 1.5 },
    labelStyle: { fill: 'var(--t2)', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600 },
    labelBgStyle: { fill: 'var(--bg)', fillOpacity: 0.9 },
    labelBgPadding: [4, 6] as [number, number],
    labelBgBorderRadius: 4,
  }));

  const onInit = useCallback((rf: { fitView: () => void }) => {
    rf.fitView();
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: 320,
        borderRadius: 'var(--r-sm)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        background: 'var(--s1)',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.35 }}
        onInit={onInit}
        minZoom={0.25}
        maxZoom={3}
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="var(--border)"
          gap={28}
          variant={BackgroundVariant.Dots}
          size={1}
        />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};
