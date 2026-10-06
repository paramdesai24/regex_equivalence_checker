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
import type { ProductAutomaton } from '../../automata/equivalence/types';
import { productToGraph } from '../../utils/productToGraph';

// ─── Self-loop edge with smooth arc and EdgeLabelRenderer ────────────────────
const ProductSelfLoopEdge: React.FC<{
  id: string;
  sourceX: number;
  sourceY: number;
  label?: string;
  data?: { label?: string };
  style?: React.CSSProperties;
  markerEnd?: string;
}> = ({ id, sourceX, sourceY, label, data, style, markerEnd }) => {
  const displayLabel = data?.label ?? label;
  const cx = sourceX - 34;
  const cy = sourceY;

  const x1 = cx + 12;
  const y1 = cy - 16;
  const cp1x = cx + 28;
  const cp1y = cy - 46;
  const cp2x = cx - 28;
  const cp2y = cy - 46;
  const x2 = cx - 12;
  const y2 = cy - 16;

  const d = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
  const labelX = cx;
  const labelY = cy - 44;
  const stroke = (style as React.CSSProperties & { stroke?: string })?.stroke ?? '#a1a1aa';

  return (
    <>
      <path id={id} d={d} fill="none" style={{ stroke, strokeWidth: 1.5, ...style }} markerEnd={markerEnd} />
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

// ─── Product state node ───────────────────────────────────────────────────────
interface ProductNodeData {
  label: string;
  isStart: boolean;
  isDistinguishing: boolean;
  isOnCounterexamplePath: boolean;
  acceptingA: boolean;
  acceptingB: boolean;
}

const ProductNode: React.FC<{ data: ProductNodeData }> = ({ data }) => {
  const { isDistinguishing: isDist, isOnCounterexamplePath: onPath, isStart, label, acceptingA, acceptingB } = data;

  const bg = isDist
    ? '#fef2f2'
    : onPath
    ? '#fffbeb'
    : '#ffffff';

  const borderColor = isDist
    ? '#dc2626'
    : onPath
    ? '#d97706'
    : isStart
    ? '#18181b'
    : '#a1a1aa';

  const textColor = isDist
    ? '#991b1b'
    : onPath
    ? '#92400e'
    : '#09090b';

  return (
    <div
      title={`${label} [A=${acceptingA ? 'Accept' : 'Reject'}, B=${acceptingB ? 'Accept' : 'Reject'}]${isDist ? ' (Distinguishing)' : ''}`}
      style={{
        minWidth: 68,
        height: 32,
        borderRadius: 6,
        padding: '0 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontFamily: 'var(--font-mono)',
        fontWeight: 500,
        background: bg,
        color: textColor,
        border: `${isDist || isStart ? '2px' : '1.5px'} solid ${borderColor}`,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
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

const NODE_TYPES: NodeTypes = { productState: ProductNode };
const EDGE_TYPES: EdgeTypes = { selfconnecting: ProductSelfLoopEdge as never };

export interface ProductAutomatonGraphProps {
  productAutomaton: ProductAutomaton;
  counterexampleNodeIds?: string[];
  counterexampleEdgeIds?: string[];
}

export const ProductAutomatonGraph: React.FC<ProductAutomatonGraphProps> = ({
  productAutomaton,
  counterexampleNodeIds = [],
  counterexampleEdgeIds = [],
}) => {
  const { nodes: gNodes, edges: gEdges } = useMemo(
    () => productToGraph(productAutomaton, counterexampleNodeIds, counterexampleEdgeIds),
    [productAutomaton, counterexampleNodeIds, counterexampleEdgeIds]
  );

  const nodes: Node<ProductNodeData>[] = gNodes.map((n) => ({
    id: n.id,
    type: 'productState',
    position: { x: n.x, y: n.y },
    data: {
      label: n.label,
      isStart: n.isStart,
      isDistinguishing: n.isDistinguishing,
      isOnCounterexamplePath: n.isOnCounterexamplePath,
      acceptingA: n.acceptingA,
      acceptingB: n.acceptingB,
    },
    draggable: true,
  }));

  const edges: Edge[] = gEdges.map((e) => {
    const onPath = e.isOnCounterexamplePath;
    const strokeColor = onPath ? '#b45309' : '#a1a1aa';
    const markerColor = onPath ? '#b45309' : '#71717a';

    return {
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.isSelfLoop ? undefined : e.label,
      data: { label: e.label },
      animated: onPath,
      type: e.isSelfLoop ? 'selfconnecting' : 'default',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: markerColor,
        width: 14,
        height: 14,
      },
      style: { stroke: strokeColor, strokeWidth: onPath ? 2 : 1.5 },
      labelStyle: {
        fill: onPath ? '#92400e' : '#09090b',
        fontSize: 12,
        fontFamily: 'var(--font-mono)',
        fontWeight: 500,
      },
      labelBgStyle: {
        fill: '#ffffff',
        stroke: onPath ? '#fde68a' : '#e4e4e7',
        strokeWidth: 1,
      },
      labelBgPadding: [4, 6] as [number, number],
      labelBgBorderRadius: 4,
    };
  });

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
