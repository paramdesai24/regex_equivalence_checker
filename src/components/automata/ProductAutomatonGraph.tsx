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
import type { ProductAutomaton } from '../../automata/equivalence/types';
import { productToGraph } from '../../utils/productToGraph';

// ─── Custom node: product state pair ──────────────────────────────────────────
interface ProductNodeData {
  label: string;
  isStart: boolean;
  isDistinguishing: boolean;
  isOnCounterexamplePath: boolean;
  acceptingA: boolean;
  acceptingB: boolean;
}

const ProductNode: React.FC<{ data: ProductNodeData }> = ({ data }) => {
  const isDist = data.isDistinguishing;
  const onPath = data.isOnCounterexamplePath;

  const borderStyle = isDist ? '2.5px double #f43f5e' : onPath ? '2px solid #f59e0b' : data.isStart ? '2px solid #6366f1' : '1.5px solid #334155';

  const boxShadow = isDist
    ? '0 0 10px rgba(244,63,94,0.3)'
    : onPath
    ? '0 0 10px rgba(245,158,11,0.25)'
    : data.isStart
    ? '0 0 8px rgba(99,102,241,0.25)'
    : 'none';

  const textColor = isDist ? '#fda4af' : onPath ? '#fde68a' : '#cbd5e1';

  return (
    <div
      title={
        isDist
          ? `${data.label} [DISTINGUISHING: A=${data.acceptingA ? 'Accept' : 'Reject'}, B=${data.acceptingB ? 'Accept' : 'Reject'}]`
          : `${data.label} [A=${data.acceptingA ? 'Accept' : 'Reject'}, B=${data.acceptingB ? 'Accept' : 'Reject'}]`
      }
      style={{
        minWidth: 70,
        height: 38,
        borderRadius: 20,
        padding: '0 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontFamily: 'monospace',
        fontWeight: 600,
        background: isDist ? '#1f131d' : onPath ? '#1a160d' : '#0f172a',
        color: textColor,
        border: borderStyle,
        boxShadow,
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />

      {data.isStart && (
        <span
          style={{
            position: 'absolute',
            left: -18,
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

const NODE_TYPES: NodeTypes = { productState: ProductNode };

// ─── Main Product Graph component ─────────────────────────────────────────────
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
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: onPath,
      type: e.isSelfLoop ? 'selfconnecting' : 'default',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: onPath ? '#f59e0b' : '#475569',
        width: onPath ? 16 : 14,
        height: onPath ? 16 : 14,
      },
      style: {
        stroke: onPath ? '#f59e0b' : '#475569',
        strokeWidth: onPath ? 2.5 : 1.5,
      },
      labelStyle: {
        fill: onPath ? '#fbbf24' : '#94a3b8',
        fontSize: 11,
        fontFamily: 'monospace',
        fontWeight: 600,
      },
      labelBgStyle: { fill: '#0f172a', fillOpacity: 0.9 },
      labelBgPadding: [3, 5] as [number, number],
      labelBgBorderRadius: 3,
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
        background: '#0b1120',
        borderRadius: 6,
        border: '1px solid #1e293b',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        onInit={onInit}
        minZoom={0.25}
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
