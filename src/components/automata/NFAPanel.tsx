import React from 'react';
import type { NFA, ThompsonStep } from '../../automata/nfa/types';
import { AutomatonGraph } from './AutomatonGraph';
import { TransitionTable } from './TransitionTable';
import { ConstructionSteps } from './ConstructionSteps';

interface NFAPanelProps {
  label: string;         // e.g. "Regex A"
  regexStr: string;      // the original regex string
  nfa: NFA;
  steps: ThompsonStep[];
  accent: 'indigo' | 'teal';
}

export const NFAPanel: React.FC<NFAPanelProps> = ({ label, regexStr, nfa, steps, accent }) => {
  const accentClass = accent === 'indigo' ? 'text-indigo-400' : 'text-teal-400';
  const borderClass = accent === 'indigo' ? 'border-indigo-500/20' : 'border-teal-500/20';

  return (
    <div className={`border ${borderClass} border-b-0 border-x border-t`} style={{ borderRadius: 4 }}>
      {/* Panel header */}
      <div className="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div>
          <span className={`font-mono text-xs font-semibold ${accentClass} mr-2`}>{label}</span>
          <span className="font-mono text-sm text-slate-200">{regexStr}</span>
        </div>
        <div className="text-[11px] font-mono text-slate-500 flex gap-3">
          <span>states: <span className="text-slate-300">{nfa.states.length}</span></span>
          <span>transitions: <span className="text-slate-300">{nfa.transitions.length}</span></span>
          <span>start: <span className="text-indigo-300">q{nfa.startState}</span></span>
          <span>accept: <span className="text-teal-300">q{nfa.acceptState}</span></span>
        </div>
      </div>

      {/* Graph */}
      <div className="p-3 bg-slate-950">
        <AutomatonGraph nfa={nfa} />
      </div>

      {/* Collapsible metadata */}
      <div className="border-t border-slate-800 divide-y divide-slate-900">
        <TransitionTable nfa={nfa} />
        <ConstructionSteps steps={steps} />
      </div>
    </div>
  );
};
