import React, { useState } from 'react';
import type { DFA, SubsetConstructionStep } from '../../automata/dfa/types';
import { AutomatonGraph } from './AutomatonGraph';
import { StateMappingTable } from './StateMappingTable';
import { DFATransitionTable } from './DFATransitionTable';
import { SubsetSteps } from './SubsetSteps';

interface DFAPanelProps {
  label: string; // e.g. "Regex A"
  regexStr: string;
  dfa: DFA;
  steps: SubsetConstructionStep[];
  accent: 'indigo' | 'teal';
}

export const DFAPanel: React.FC<DFAPanelProps> = ({
  label,
  regexStr,
  dfa,
  steps,
  accent,
}) => {
  const [showDeadState, setShowDeadState] = useState(true);

  const accentClass = accent === 'indigo' ? 'text-indigo-400' : 'text-teal-400';
  const borderClass = accent === 'indigo' ? 'border-indigo-500/20' : 'border-teal-500/20';

  const hasDeadState = dfa.deadStateId !== null;
  const visibleStatesCount = showDeadState
    ? dfa.states.length
    : dfa.states.filter((s) => !s.isDead).length;
  const visibleTransitionsCount = showDeadState
    ? dfa.transitions.length
    : dfa.transitions.filter((t) => t.from !== dfa.deadStateId && t.to !== dfa.deadStateId).length;

  return (
    <div className={`border ${borderClass} border-b-0 border-x border-t`} style={{ borderRadius: 4 }}>
      {/* Panel header */}
      <div className="border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`font-mono text-xs font-semibold ${accentClass}`}>{label}</span>
          <span className="font-mono text-sm text-slate-200">{regexStr}</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
          <span>states: <span className="text-slate-300">{visibleStatesCount}</span></span>
          <span>transitions: <span className="text-slate-300">{visibleTransitionsCount}</span></span>
          <span>start: <span className="text-indigo-300">{dfa.startState}</span></span>
          <span>accept: <span className="text-cyan-300">{dfa.acceptStates.length > 0 ? dfa.acceptStates.join(', ') : 'none'}</span></span>

          {hasDeadState && (
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200 transition ml-2 border-l border-slate-800 pl-3">
              <input
                type="checkbox"
                checked={showDeadState}
                onChange={(e) => setShowDeadState(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
              />
              <span>Show Dead State</span>
            </label>
          )}
        </div>
      </div>

      {/* Graph Visualizer */}
      <div className="p-3 bg-slate-950">
        <AutomatonGraph dfa={dfa} hideDeadState={!showDeadState} />
      </div>

      {/* Collapsible Metadata Sections */}
      <div className="border-t border-slate-800 divide-y divide-slate-900">
        <StateMappingTable states={dfa.states} />
        <DFATransitionTable dfa={dfa} hideDeadState={!showDeadState} />
        <SubsetSteps steps={steps} />
      </div>
    </div>
  );
};
