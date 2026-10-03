import React, { useState } from 'react';
import type { ProductAutomaton } from '../../automata/equivalence/types';
import { ProductAutomatonGraph } from './ProductAutomatonGraph';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ProductGraphPanelProps {
  productAutomaton: ProductAutomaton;
  counterexampleNodeIds?: string[];
  counterexampleEdgeIds?: string[];
}

export const ProductGraphPanel: React.FC<ProductGraphPanelProps> = ({
  productAutomaton,
  counterexampleNodeIds = [],
  counterexampleEdgeIds = [],
}) => {
  const [open, setOpen] = useState(false);

  const distCount = productAutomaton.distinguishingStates.length;
  const stateCount = productAutomaton.states.length;
  const transCount = productAutomaton.transitions.length;

  return (
    <div className="border border-slate-800 rounded overflow-hidden text-xs">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 text-slate-300 hover:bg-slate-800 transition"
      >
        <span className="font-medium font-mono">
          Reachable Product Automaton Graph ({stateCount} states, {transCount} trans
          {distCount > 0 ? `, ${distCount} distinguishing` : ''})
        </span>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
      </button>

      {open && (
        <div className="p-3 bg-slate-950 space-y-2">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-500 border-b border-slate-900 pb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-indigo-500 bg-indigo-950" />
              <span>Start State (s0A, s0B)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-rose-500 bg-rose-950" />
              <span>Distinguishing (A XOR B)</span>
            </span>
            {counterexampleNodeIds.length > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-amber-500 bg-amber-950" />
                <span>Shortest Counterexample Path</span>
              </span>
            )}
          </div>

          <ProductAutomatonGraph
            productAutomaton={productAutomaton}
            counterexampleNodeIds={counterexampleNodeIds}
            counterexampleEdgeIds={counterexampleEdgeIds}
          />
        </div>
      )}
    </div>
  );
};
