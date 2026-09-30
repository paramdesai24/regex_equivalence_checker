import React, { useState } from 'react';
import type { NFA, Transition } from '../../automata/nfa/types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface TransitionTableProps {
  nfa: NFA;
}

export const TransitionTable: React.FC<TransitionTableProps> = ({ nfa }) => {
  const [open, setOpen] = useState(true);

  const sorted = [...nfa.transitions].sort(
    (a, b) => a.from - b.from || (a.symbol ?? 'ε').localeCompare(b.symbol ?? 'ε')
  );

  return (
    <div className="border border-slate-800 rounded overflow-hidden text-xs">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 text-slate-300 hover:bg-slate-800 transition"
      >
        <span className="font-medium font-mono">Transition Table ({nfa.transitions.length} rows)</span>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
      </button>

      {open && (
        <div className="overflow-x-auto max-h-56 overflow-y-auto">
          <table className="w-full font-mono text-[11px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 sticky top-0 bg-slate-950">
                <th className="text-left px-3 py-1.5 font-semibold">From</th>
                <th className="text-left px-3 py-1.5 font-semibold">Symbol</th>
                <th className="text-left px-3 py-1.5 font-semibold">To</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t: Transition, i) => (
                <tr
                  key={i}
                  className={`border-b border-slate-900 ${i % 2 === 0 ? 'bg-slate-950' : 'bg-slate-900/40'} hover:bg-slate-800/50`}
                >
                  <td className="px-3 py-1 text-indigo-300">q{t.from}</td>
                  <td className="px-3 py-1 text-amber-300">{t.symbol ?? 'ε'}</td>
                  <td className="px-3 py-1 text-cyan-300">q{t.to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
