import React from 'react';
import type { ProductAutomaton } from '../../automata/equivalence/types';
import { ProductAutomatonGraph } from './ProductAutomatonGraph';
import { AccordionSection } from './AccordionSection';
import { useState } from 'react';

interface ProductGraphPanelProps {
  productAutomaton: ProductAutomaton;
  counterexampleNodeIds?: string[];
  counterexampleEdgeIds?: string[];
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--t3)' }}>
      <span
        style={{
          width: 9,
          height: 9,
          borderRadius: '50%',
          border: `1.5px solid ${color}`,
          background: `${color}20`,
          flexShrink: 0,
          display: 'inline-block',
        }}
      />
      {label}
    </span>
  );
}

export const ProductGraphPanel: React.FC<ProductGraphPanelProps> = ({
  productAutomaton,
  counterexampleNodeIds = [],
  counterexampleEdgeIds = [],
}) => {
  const [open, setOpen] = useState(false);

  const distCount   = productAutomaton.distinguishingStates.length;
  const stateCount  = productAutomaton.states.length;
  const transCount  = productAutomaton.transitions.length;
  const badge = `${stateCount} states · ${transCount} trans${distCount > 0 ? ` · ${distCount} dist.` : ''}`;

  return (
    <AccordionSection
      title="Reachable Product Automaton Graph"
      badge={badge}
      expanded={open}
      onToggle={() => setOpen(o => !o)}
    >
      <div style={{ padding: 14, background: 'var(--bg)' }}>
        {/* Legend */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px 20px',
            marginBottom: 12,
            paddingBottom: 10,
            borderBottom: '1px solid var(--border)',
          }}
        >
          <LegendDot color="var(--a)" label="Start (s₀A, s₀B)" />
          <LegendDot color="var(--err)" label="Distinguishing (A XOR B)" />
          {counterexampleNodeIds.length > 0 && (
            <LegendDot color="var(--warn)" label="Shortest Counterexample Path" />
          )}
        </div>

        <ProductAutomatonGraph
          productAutomaton={productAutomaton}
          counterexampleNodeIds={counterexampleNodeIds}
          counterexampleEdgeIds={counterexampleEdgeIds}
        />
      </div>
    </AccordionSection>
  );
};
