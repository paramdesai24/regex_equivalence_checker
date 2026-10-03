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
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { ProductAutomaton } from '../../automata/equivalence/types';
import { productToGraph } from '../../utils/productToGraph';

// ─── Self-loop edge ───────────────────────────────────────────────────────────
const ProductSelfLoopEdge: React.FC<{
  id: string;
  sourceX: number;
  sourceY: number;
  label?: string;
  style?: React.CSSProperties;
  markerEnd?: string;
}> = ({ id, sourceX, sourceY, label, style, markerEnd }) => {
  const d = `M ${sourceX} ${sourceY - 20} C ${sourceX - 40} ${sourceY - 65}, ${sourceX + 40} ${sourceY - 65}, ${sourceX} ${sourceY - 20}`;
  const midX = sourceX;
  const midY = sourceY - 55;
  const stroke = (style as React.CSSProperties & { stroke?: string })?.stroke ?? 'var(--border-2)';
  return (
    <>
      <path id={id} d={d} fill="none" style={{ stroke, strokeWidth: 1.5, ...style }} markerEnd={markerEnd} />
      {label && (
        <foreignObject x={midX - 20} y={midY - 10} width={40} height={20}>
          <div style={{
            fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600,
            color: stroke, background: 'var(--bg)', padding: '0 3px',
            textAlign: 'center', borderRadius: 2,
          }}>
            {label as string}
          </div>
        </foreignObject>
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
  const { isDistinguishing: isDist, isOnCounterexamplePath: onPath, isStart } = data;

  const borderColor = isDist ? 'var(--err)' : onPath ? 'var(--warn)' : isStart ? 'var(--a)' : 'var(--border-2)';
  const bg         = isDist ? 'color-mix(in srgb, var(--err) 12%, var(--s1))' : onPath ? 'color-mix(in srgb, var(--warn) 8%, var(--s1))' : 'var(--s2)';
  const textColor  = isDist ? 'var(--err)' : onPath ? 'var(--warn)' : 'var(--t2)';

  return (
    <div
      title={`${data.label} [A=${data.acceptingA ? 'Accept' : 'Reject'}, B=${data.acceptingB ? 'Accept' : 'Reject'}]${isDist ? ' [DISTINGUISHING]' : ''}`}
      style={{
        minWidth: 72,
        height: 36,
        borderRadius: 18,
        padding: '0 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        background: bg,
        color: textColor,
        border: `${isDist ? '2px solid' : '1.5px solid'} ${borderColor}`,
        boxShadow: isDist ? `0 0 14px ${borderColor}30` : onPath ? `0 0 10px ${borderColor}25` : 'none',
        position: 'relative',
        transition: 'box-shadow 200ms',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      {isStart && (
        <span style={{
          position: 'absolute', left: -22, top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--a)', fontSize: 15, lineHeight: 1,
        }}>→</span>
      )}
      <span>{data.label}</span>
    </div>
  );
};

const NODE_TYPES: NodeTypes = { productState: ProductNode };
const EDGE_TYPES: EdgeTypes = { selfconnecting: ProductSelfLoopEdge as never };

// ─── Main component ───────────────────────────────────────────────────────────
interface ProductAutomatonGraphProps {
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
    const strokeColor = onPath ? 'var(--warn)' : 'var(--border-2)';
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: onPath,
      type: e.isSelfLoop ? 'selfconnecting' : 'default',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: strokeColor,
        width: onPath ? 16 : 14,
        height: onPath ? 16 : 14,
      },
      style: { stroke: strokeColor, strokeWidth: onPath ? 2 : 1.5 },
      labelStyle: {
        fill: onPath ? 'var(--warn)' : 'var(--t2)',
        fontSize: 11,
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
      },
      labelBgStyle: { fill: 'var(--bg)', fillOpacity: 0.9 },
      labelBgPadding: [4, 6] as [number, number],
      labelBgBorderRadius: 4,
    };
  });

  const onInit = useCallback((rf: { fitView: () => void }) => {
    rf.fitView();
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: 380,
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
        fitViewOptions={{ padding: 0.3 }}
        onInit={onInit}
        minZoom={0.2}
        maxZoom={3}
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--border)" gap={28} variant={BackgroundVariant.Dots} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};
