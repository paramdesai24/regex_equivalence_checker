import React, { useState } from 'react';
import type { MinimizationResult } from '../../automata/minimization/types';
import { AutomatonGraph } from './AutomatonGraph';
import { StateMergeMappingTable } from './StateMergeMappingTable';
import { DFATransitionTable } from './DFATransitionTable';
import { MinimizationSteps } from './MinimizationSteps';

interface MinimizedDFAPanelProps {
  label: string; // e.g. "Regex A"
  regexStr: string;
  minResult: MinimizationResult;
  accent: 'indigo' | 'teal';
}

export const MinimizedDFAPanel: React.FC<MinimizedDFAPanelProps> = ({
  label,
  regexStr,
  minResult,
  accent,
}) => {
  const [showDeadState, setShowDeadState] = useState(true);

  const dfa = minResult.minimizedDfa;
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
      {/* Panel header with before/after comparison */}
      <div className="border-b border-slate-800 px-4 py-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`font-mono text-xs font-semibold ${accentClass}`}>{label}</span>
            <span className="font-mono text-sm text-slate-200">{regexStr}</span>
          </div>

          {hasDeadState && (
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-mono text-slate-400 hover:text-slate-200 transition">
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

        {/* Compact Before / After Metrics Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-slate-500 border-t border-slate-900 pt-2">
          <div>
            <span>Original: </span>
            <span className="text-slate-300">{minResult.originalStateCount} states</span>
            <span className="text-slate-600"> / </span>
            <span className="text-slate-300">{minResult.originalTransitionCount} trans</span>
          </div>

          <span className="text-slate-700 select-none">→</span>

          <div>
            <span>Minimized: </span>
            <span className="text-emerald-400 font-semibold">{visibleStatesCount} states</span>
            <span className="text-slate-600"> / </span>
            <span className="text-emerald-400 font-semibold">{visibleTransitionsCount} trans</span>
          </div>

          {minResult.statesRemoved > 0 ? (
            <div className="text-indigo-400 font-semibold bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-900/50">
              -{minResult.statesRemoved} state{minResult.statesRemoved > 1 ? 's' : ''} ({minResult.reductionPercent}% reduction)
            </div>
          ) : (
            <div className="text-slate-500 bg-slate-900/60 px-1.5 py-0.5 rounded">
              already minimal (0% reduction)
            </div>
          )}

          <div className="ml-auto flex items-center gap-3">
            <span>start: <span className="text-indigo-300">{dfa.startState}</span></span>
            <span>
              accept: <span className="text-cyan-300">{dfa.acceptStates.length > 0 ? dfa.acceptStates.join(', ') : 'none'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Graph Visualizer */}
      <div className="p-3 bg-slate-950">
        <AutomatonGraph dfa={dfa} hideDeadState={!showDeadState} />
      </div>

      {/* Collapsible Metadata Sections */}
      <div className="border-t border-slate-800 divide-y divide-slate-900">
        <StateMergeMappingTable mappings={minResult.stateMapping} />
        <DFATransitionTable dfa={dfa} hideDeadState={!showDeadState} />
        <MinimizationSteps steps={minResult.steps} />
      </div>
    </div>
  );
};
