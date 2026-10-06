import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  EdgeLabelRenderer,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
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

// ─── Self-loop edge with smooth circular arc & unclipped label ────────────────
const SelfLoopEdge: React.FC<{
  id: string;
  sourceX: number;
  sourceY: number;
  label?: string;
  data?: { label?: string };
  style?: React.CSSProperties;
  markerEnd?: string;
}> = ({ id, sourceX, sourceY, label, data, style, markerEnd }) => {
  const displayLabel = data?.label ?? label;
  // Node circle diameter is 44px, radius is 22px
  // Right handle is at (sourceX, sourceY) -> center is (sourceX - 22, sourceY)
  const cx = sourceX - 22;
  const cy = sourceY;

  // Emerge from top-right of node perimeter, loop up smoothly, and enter top-left pointing into center
  const x1 = cx + 11;
  const y1 = cy - 19;
  const cp1x = cx + 28;
  const cp1y = cy - 48;
  const cp2x = cx - 28;
  const cp2y = cy - 48;
  const x2 = cx - 11;
  const y2 = cy - 19;

  const d = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
  const labelX = cx;
  const labelY = cy - 46;

  return (
    <>
      <path
        id={id}
        d={d}
        fill="none"
        style={{ stroke: '#a1a1aa', strokeWidth: 1.5, ...style }}
        markerEnd={markerEnd}
      />
      {displayLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan px-1.5 py-0.5 rounded border border-border bg-background text-xs font-mono font-medium text-foreground shadow-2xs leading-none whitespace-nowrap select-none z-10"
          >
            {displayLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

// ─── Custom node: automata state circle ───────────────────────────────────────
interface StateNodeData {
  label: string;
  isStart: boolean;
  isAccept: boolean;
  isDead?: boolean;
  subsetLabel?: string;
}

const StateNode: React.FC<{ data: StateNodeData }> = ({ data }) => {
  const size = 44;
  const { isDead, isAccept, isStart, label, subsetLabel } = data;

  const bg = isDead ? '#f4f4f5' : '#ffffff';
  const textColor = isDead ? '#71717a' : '#09090b';
  const border = isDead
    ? '1.5px dashed #a1a1aa'
    : isAccept
    ? '2px solid #18181b'
    : isStart
    ? '2px solid #18181b'
    : '1.5px solid #a1a1aa';

  // Double ring for accepting state (automata standard: concentric ring)
  const boxShadow = isAccept
    ? '0 0 0 2.5px #ffffff, 0 0 0 4px #18181b'
    : '0 1px 2px 0 rgba(0, 0, 0, 0.04)';

  const fontSize = label.length > 3 ? 11 : 13;

  return (
    <div
      title={subsetLabel ? `${label} = ${subsetLabel}` : label}
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
        fontWeight: 500,
        background: bg,
        color: textColor,
        border,
        boxShadow,
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      {isStart && (
        <span
          style={{
            position: 'absolute',
            left: -18,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#18181b',
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1,
          }}
          aria-hidden="true"
        >
          →
        </span>
      )}
      <span>{label}</span>
    </div>
  );
};

const NODE_TYPES: NodeTypes = { state: StateNode };
const EDGE_TYPES: EdgeTypes = { selfconnecting: SelfLoopEdge as never };

export interface AutomatonGraphProps {
  nfa?: NFA;
  dfa?: DFA;
  hideDeadState?: boolean;
}

export const AutomatonGraph: React.FC<AutomatonGraphProps> = ({
  nfa,
  dfa,
  hideDeadState = false,
}) => {
  const { nodes: gNodes, edges: gEdges } = useMemo(() => {
    if (dfa) return dfaToGraph(dfa, { hideDeadState });
    if (nfa) return nfaToGraph(nfa);
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
    label: e.isSelfLoop ? undefined : e.label,
    data: { label: e.label },
    animated: false,
    type: e.isSelfLoop ? 'selfconnecting' : 'default',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#71717a',
      width: 14,
      height: 14,
    },
    style: { stroke: '#a1a1aa', strokeWidth: 1.5 },
    labelStyle: {
      fill: '#09090b',
      fontSize: 12,
      fontFamily: 'var(--font-mono)',
      fontWeight: 500,
    },
    labelBgStyle: { fill: '#ffffff', stroke: '#e4e4e7', strokeWidth: 1 },
    labelBgPadding: [4, 6] as [number, number],
    labelBgBorderRadius: 4,
  }));

  const onInit = useCallback((rf: { fitView: () => void }) => {
    rf.fitView();
  }, []);

  return (
    <div className="w-full h-[400px] rounded-md border border-border overflow-hidden bg-muted/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.16 }}
        onInit={onInit}
        minZoom={0.2}
        maxZoom={3}
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e4e4e7" gap={24} variant={BackgroundVariant.Dots} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};
