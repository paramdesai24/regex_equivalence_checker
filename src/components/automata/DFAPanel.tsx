import React, { useState } from 'react';
import type { DFA, SubsetConstructionStep } from '../../automata/dfa/types';
import { AutomatonGraph } from './AutomatonGraph';
import { StateMappingTable } from './StateMappingTable';
import { DFATransitionTable } from './DFATransitionTable';
import { SubsetSteps } from './SubsetSteps';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

interface DFAPanelProps {
  label: string;
  regexStr: string;
  dfa: DFA;
  steps: SubsetConstructionStep[];
}

export const DFAPanel: React.FC<DFAPanelProps> = ({
  label,
  regexStr,
  dfa,
  steps,
}) => {
  const [showDeadState, setShowDeadState] = useState(true);
  const [expanded, setExpanded] = useState<'map' | 'table' | 'steps' | null>(null);

  const hasDeadState = dfa.deadStateId !== null;
  const visibleStates = showDeadState
    ? dfa.states.length
    : dfa.states.filter((s) => !s.isDead).length;
  const visibleTransitions = showDeadState
    ? dfa.transitions.length
    : dfa.transitions.filter(
        (t) => t.from !== dfa.deadStateId && t.to !== dfa.deadStateId
      ).length;

  return (
    <div className="rounded-md border border-border bg-card overflow-hidden">
      {/* Panel Header */}
      <div className="border-b border-border bg-muted/30 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 font-medium">
            {label}
          </Badge>
          <span className="font-mono text-[13px] font-medium text-foreground">
            {regexStr}
          </span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3 ui-meta font-mono flex-wrap">
            <span>states <span className="text-foreground font-medium">{visibleStates}</span></span>
            <span className="text-border">·</span>
            <span>transitions <span className="text-foreground font-medium">{visibleTransitions}</span></span>
            <span className="text-border">·</span>
            <span>start <span className="text-foreground font-medium">{dfa.startState}</span></span>
            <span className="text-border">·</span>
            <span>
              accept{' '}
              <span className="text-foreground font-medium">
                {dfa.acceptStates.length > 0 ? dfa.acceptStates.join(', ') : 'none'}
              </span>
            </span>
          </div>

          {hasDeadState && (
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <Switch
                id={`dead-state-toggle-${label.toLowerCase()}`}
                checked={showDeadState}
                onCheckedChange={setShowDeadState}
              />
              <Label
                htmlFor={`dead-state-toggle-${label.toLowerCase()}`}
                className="text-xs text-muted-foreground font-normal cursor-pointer select-none"
              >
                Dead state
              </Label>
            </div>
          )}
        </div>
      </div>

      {/* Graph Area */}
      <div className="p-3 bg-background">
        <AutomatonGraph dfa={dfa} hideDeadState={!showDeadState} />
      </div>

      {/* Collapsible Sections */}
      <div>
        <StateMappingTable
          states={dfa.states}
          expanded={expanded === 'map'}
          onToggle={() => setExpanded(expanded === 'map' ? null : 'map')}
        />
        <DFATransitionTable
          dfa={dfa}
          hideDeadState={!showDeadState}
          expanded={expanded === 'table'}
          onToggle={() => setExpanded(expanded === 'table' ? null : 'table')}
        />
        <SubsetSteps
          steps={steps}
          expanded={expanded === 'steps'}
          onToggle={() => setExpanded(expanded === 'steps' ? null : 'steps')}
        />
      </div>
    </div>
  );
};
