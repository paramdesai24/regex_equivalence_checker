import React, { useState } from 'react';
import type { ProductAutomaton } from '../../automata/equivalence/types';
import { ProductAutomatonGraph } from './ProductAutomatonGraph';
import { AccordionSection } from './AccordionSection';

interface ProductGraphPanelProps {
  productAutomaton: ProductAutomaton;
  counterexampleNodeIds?: string[];
  counterexampleEdgeIds?: string[];
}

function LegendIndicator({
  colorClass,
  borderClass,
  label,
}: {
  colorClass: string;
  borderClass: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className={`w-2.5 h-2.5 rounded-full ${colorClass} ${borderClass} inline-block shrink-0`}
      />
      <span>{label}</span>
    </span>
  );
}

export const ProductGraphPanel: React.FC<ProductGraphPanelProps> = ({
  productAutomaton,
  counterexampleNodeIds = [],
  counterexampleEdgeIds = [],
}) => {
  const [open, setOpen] = useState(true);

  const distCount = productAutomaton.distinguishingStates.length;
  const stateCount = productAutomaton.states.length;
  const transCount = productAutomaton.transitions.length;
  const badge = `${stateCount} states · ${transCount} trans${
    distCount > 0 ? ` · ${distCount} dist.` : ''
  }`;

  return (
    <AccordionSection
      title="Reachable Product Automaton Graph"
      badge={badge}
      expanded={open}
      onToggle={() => setOpen((o) => !o)}
    >
      <div className="p-3.5 space-y-3 bg-background">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 pb-2 border-b border-border">
          <LegendIndicator
            colorClass="bg-foreground"
            borderClass="border border-foreground"
            label="Start state (s₀A, s₀B)"
          />
          <LegendIndicator
            colorClass="bg-red-100"
            borderClass="border border-red-500"
            label="Distinguishing (L(A) △ L(B))"
          />
          {counterexampleNodeIds.length > 0 && (
            <LegendIndicator
              colorClass="bg-amber-100"
              borderClass="border border-amber-600"
              label="Counterexample Path"
            />
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
