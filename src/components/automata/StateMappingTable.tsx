import React, { useState } from 'react';
import type { DFAState } from '../../automata/dfa/types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface StateMappingTableProps {
  states: DFAState[];
}

export const StateMappingTable: React.FC<StateMappingTableProps> = ({ states }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-slate-800 rounded overflow-hidden text-xs">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 text-slate-300 hover:bg-slate-800 transition"
      >
        <span className="font-medium font-mono">DFA ↔ NFA State Subsets ({states.length} states)</span>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
      </button>

      {open && (
        <div className="p-3 bg-slate-950 font-mono text-[11px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto">
          {states.map((s) => {
            const subsetStr = s.nfaStates.length > 0
              ? `{${s.nfaStates.map((q) => `q${q}`).join(', ')}}`
              : '∅ (Trap)';
            return (
              <div
                key={s.id}
                className="flex items-center gap-2 p-1.5 rounded bg-slate-900/50 border border-slate-850 hover:bg-slate-900 transition"
              >
                <span className={`font-semibold shrink-0 ${s.isAccepting ? 'text-cyan-300' : s.isDead ? 'text-slate-500' : 'text-indigo-300'}`}>
                  {s.id}
                </span>
                <span className="text-slate-600">=</span>
                <span className={`truncate ${s.isDead ? 'text-slate-500 italic' : 'text-slate-300'}`}>
                  {subsetStr}
                </span>
                {s.isAccepting && (
                  <span className="ml-auto text-[9px] px-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 shrink-0">
                    accept
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
