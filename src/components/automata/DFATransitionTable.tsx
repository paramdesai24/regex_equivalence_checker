import React, { useState } from 'react';
import type { DFA } from '../../automata/dfa/types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface DFATransitionTableProps {
  dfa: DFA;
  hideDeadState?: boolean;
}

export const DFATransitionTable: React.FC<DFATransitionTableProps> = ({ dfa, hideDeadState = false }) => {
  const [open, setOpen] = useState(true);

  // Filter states if hideDeadState is active
  const visibleStates = dfa.states.filter((s) => !hideDeadState || !s.isDead);

  // Map for O(1) transition lookup: "from,symbol" -> to
  const transitionMap = new Map<string, string>();
  for (const t of dfa.transitions) {
    transitionMap.set(`${t.from},${t.symbol}`, t.to);
  }

  return (
    <div className="border border-slate-800 rounded overflow-hidden text-xs">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 text-slate-300 hover:bg-slate-800 transition"
      >
        <span className="font-medium font-mono">DFA Transition Table ({visibleStates.length} states × {dfa.alphabet.length} symbols)</span>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
      </button>

      {open && (
        <div className="overflow-x-auto max-h-56 overflow-y-auto">
          <table className="w-full font-mono text-[11px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 sticky top-0 bg-slate-950">
                <th className="text-left px-3 py-1.5 font-semibold">State</th>
                {dfa.alphabet.map((sym) => (
                  <th key={sym} className="text-left px-3 py-1.5 font-semibold text-amber-300">
                    {sym}
                  </th>
                ))}
                <th className="text-left px-3 py-1.5 font-semibold">Accepting</th>
              </tr>
            </thead>
            <tbody>
              {visibleStates.map((s, i) => {
                const isStart = s.id === dfa.startState;
                const isAccept = s.isAccepting;
                const prefix = isStart && isAccept ? '→ * ' : isStart ? '→ ' : isAccept ? '* ' : '  ';

                return (
                  <tr
                    key={s.id}
                    className={`border-b border-slate-900 ${i % 2 === 0 ? 'bg-slate-950' : 'bg-slate-900/40'} hover:bg-slate-800/50`}
                  >
                    <td className={`px-3 py-1 font-semibold ${isAccept ? 'text-cyan-300' : isStart ? 'text-indigo-300' : s.isDead ? 'text-slate-500' : 'text-slate-300'}`}>
                      <span className="text-slate-500 select-none mr-1">{prefix}</span>
                      {s.id}
                    </td>
                    {dfa.alphabet.map((sym) => {
                      const target = transitionMap.get(`${s.id},${sym}`) ?? '—';
                      const isTargetDead = target === 'DEAD';
                      return (
                        <td
                          key={sym}
                          className={`px-3 py-1 ${isTargetDead ? 'text-slate-600' : 'text-slate-200'}`}
                        >
                          {target}
                        </td>
                      );
                    })}
                    <td className="px-3 py-1">
                      {isAccept ? (
                        <span className="text-cyan-400 font-semibold">Yes</span>
                      ) : (
                        <span className="text-slate-600">No</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
