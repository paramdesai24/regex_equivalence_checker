import React, { useState } from 'react';
import type { DFAState } from '../../automata/dfa/types';
import { AccordionSection } from './AccordionSection';
import { Badge } from '../ui/badge';

interface StateMappingTableProps {
  states: DFAState[];
  expanded?: boolean;
  onToggle?: () => void;
}

export const StateMappingTable: React.FC<StateMappingTableProps> = ({
  states,
  expanded: extExpanded,
  onToggle: extToggle,
}) => {
  const [localOpen, setLocalOpen] = useState(false);
  const expanded = extExpanded !== undefined ? extExpanded : localOpen;
  const onToggle = extToggle ?? (() => setLocalOpen((o) => !o));

  return (
    <AccordionSection
      title="DFA ↔ NFA State Subsets"
      badge={`${states.length} states`}
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-3">
        {states.map((s) => {
          const subsetStr =
            s.nfaStates.length > 0
              ? `{${s.nfaStates.map((q) => `q${q}`).join(', ')}}`
              : '∅';

          return (
            <div
              key={s.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-background border border-border text-[13px] font-mono min-w-0"
            >
              <span className="font-semibold text-foreground shrink-0">{s.id}</span>
              <span className="text-muted-foreground/60">=</span>
              <span
                className={`truncate ${
                  s.isDead ? 'text-muted-foreground' : 'text-foreground'
                }`}
              >
                {subsetStr}
              </span>
              {s.isAccepting && (
                <Badge
                  variant="outline"
                  className="ml-auto text-xs px-1.5 py-0 border-emerald-300 text-emerald-700 bg-emerald-50/50 shrink-0 font-sans font-medium"
                >
                  accept
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </AccordionSection>
  );
};
