import React, { useState } from 'react';
import type { MinimizationResult } from '../../automata/minimization/types';
import { AutomatonGraph } from './AutomatonGraph';
import { StateMergeMappingTable } from './StateMergeMappingTable';
import { DFATransitionTable } from './DFATransitionTable';
import { MinimizationSteps } from './MinimizationSteps';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

interface MinimizedDFAPanelProps {
  label: string;
  regexStr: string;
  minResult: MinimizationResult;
}

export const MinimizedDFAPanel: React.FC<MinimizedDFAPanelProps> = ({
  label,
  regexStr,
  minResult,
}) => {
  const [showDeadState, setShowDeadState] = useState(true);
  const [expanded, setExpanded] = useState<'merge' | 'table' | 'steps' | null>(null);

  const dfa = minResult.minimizedDfa;
  const hasDeadState = dfa.deadStateId !== null;
  const visibleStates = showDeadState
    ? dfa.states.length
    : dfa.states.filter((s) => !s.isDead).length;
  const visibleTrans = showDeadState
    ? dfa.transitions.length
    : dfa.transitions.filter(
        (t) => t.from !== dfa.deadStateId && t.to !== dfa.deadStateId
      ).length;
  const reduced = minResult.statesRemoved > 0;

  return (
    <div className="rounded-md border border-border bg-card overflow-hidden">
      {/* Panel Header */}
      <div className="border-b border-border bg-muted/30 px-3.5 py-2.5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 font-medium">
              {label}
            </Badge>
            <span className="font-mono text-[13px] font-medium text-foreground">
              {regexStr}
            </span>
          </div>

          {hasDeadState && (
            <div className="flex items-center gap-2">
              <Switch
                id={`min-dead-state-toggle-${label.toLowerCase()}`}
                checked={showDeadState}
                onCheckedChange={setShowDeadState}
              />
              <Label
                htmlFor={`min-dead-state-toggle-${label.toLowerCase()}`}
                className="text-xs text-muted-foreground font-normal cursor-pointer select-none"
              >
                Dead state
              </Label>
            </div>
          )}
        </div>

        {/* Compact Before/After Inline Metrics Row */}
        <div className="flex flex-wrap items-center gap-3 ui-meta font-mono pt-1.5 border-t border-border/60">
          <span>
            Original:{' '}
            <span className="text-foreground font-medium">
              {minResult.originalStateCount} states / {minResult.originalTransitionCount} trans
            </span>
          </span>
          <span className="text-border">→</span>
          <span>
            Minimized:{' '}
            <span className="text-foreground font-medium">
              {visibleStates} states / {visibleTrans} trans
            </span>
          </span>

          {reduced ? (
            <Badge variant="outline" className="text-xs px-1.5 py-0 text-emerald-700 dark:text-emerald-400 border-emerald-300 bg-emerald-50/50 font-medium">
              -{minResult.statesRemoved} state{minResult.statesRemoved > 1 ? 's' : ''} ({minResult.reductionPercent}% reduction)
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground font-sans font-normal">already minimal</span>
          )}

          <div className="ml-auto flex items-center gap-3 text-xs">
            <span>start <span className="text-foreground font-medium">{dfa.startState}</span></span>
            <span className="text-border">·</span>
            <span>
              accept{' '}
              <span className="text-foreground font-medium">
                {dfa.acceptStates.length > 0 ? dfa.acceptStates.join(', ') : 'none'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Graph Area */}
      <div className="p-3 bg-background">
        <AutomatonGraph dfa={dfa} hideDeadState={!showDeadState} />
      </div>

      {/* Collapsible Sections */}
      <div>
        <StateMergeMappingTable
          mappings={minResult.stateMapping}
          expanded={expanded === 'merge'}
          onToggle={() => setExpanded(expanded === 'merge' ? null : 'merge')}
        />
        <DFATransitionTable
          dfa={dfa}
          hideDeadState={!showDeadState}
          expanded={expanded === 'table'}
          onToggle={() => setExpanded(expanded === 'table' ? null : 'table')}
        />
        <MinimizationSteps
          steps={minResult.steps}
          expanded={expanded === 'steps'}
          onToggle={() => setExpanded(expanded === 'steps' ? null : 'steps')}
        />
      </div>
    </div>
  );
};
