import React, { useState } from 'react';
import type { NFA, ThompsonStep } from '../../automata/nfa/types';
import { AutomatonGraph } from './AutomatonGraph';
import { TransitionTable } from './TransitionTable';
import { ConstructionSteps } from './ConstructionSteps';
import { Badge } from '../ui/badge';

interface NFAPanelProps {
  label: string;
  regexStr: string;
  nfa: NFA;
  steps: ThompsonStep[];
}

export const NFAPanel: React.FC<NFAPanelProps> = ({ label, regexStr, nfa, steps }) => {
  const [expanded, setExpanded] = useState<'table' | 'steps' | null>(null);

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

        {/* Compact stats */}
        <div className="flex items-center gap-3 ui-meta font-mono flex-wrap">
          <span>states <span className="text-foreground font-medium">{nfa.states.length}</span></span>
          <span className="text-border">·</span>
          <span>transitions <span className="text-foreground font-medium">{nfa.transitions.length}</span></span>
          <span className="text-border">·</span>
          <span>start <span className="text-foreground font-medium">q{nfa.startState}</span></span>
          <span className="text-border">·</span>
          <span>accept <span className="text-foreground font-medium">q{nfa.acceptState}</span></span>
        </div>
      </div>

      {/* Graph Area */}
      <div className="p-3 bg-background">
        <AutomatonGraph nfa={nfa} />
      </div>

      {/* Collapsible Sections */}
      <div>
        <TransitionTable
          nfa={nfa}
          expanded={expanded === 'table'}
          onToggle={() => setExpanded(expanded === 'table' ? null : 'table')}
        />
        <ConstructionSteps
          steps={steps}
          expanded={expanded === 'steps'}
          onToggle={() => setExpanded(expanded === 'steps' ? null : 'steps')}
        />
      </div>
    </div>
  );
};
