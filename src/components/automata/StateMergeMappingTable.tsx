import React, { useState } from 'react';
import type { StateMergeMapping } from '../../automata/minimization/types';
import { AccordionSection } from './AccordionSection';
import { Badge } from '../ui/badge';

interface StateMergeMappingTableProps {
  mappings: StateMergeMapping[];
  expanded?: boolean;
  onToggle?: () => void;
}

export const StateMergeMappingTable: React.FC<StateMergeMappingTableProps> = ({
  mappings,
  expanded: extExpanded,
  onToggle: extToggle,
}) => {
  const [localOpen, setLocalOpen] = useState(false);
  const expanded = extExpanded !== undefined ? extExpanded : localOpen;
  const onToggle = extToggle ?? (() => setLocalOpen((o) => !o));
  const mergedCount = mappings.filter((m) => m.originalStates.length > 1).length;

  return (
    <AccordionSection
      title="State Merge Mapping"
      badge={`${mappings.length} states${mergedCount > 0 ? ` · ${mergedCount} merged` : ''}`}
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 p-3">
        {mappings.map((m) => {
          const isMerged = m.originalStates.length > 1;

          return (
            <div
              key={m.minimizedId}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-sm bg-background border text-xs font-mono min-w-0 ${
                isMerged ? 'border-foreground/30 shadow-2xs' : 'border-border'
              }`}
            >
              <span className="font-medium text-foreground shrink-0">{m.minimizedId}</span>
              <span className="text-muted-foreground/60">←</span>
              <span
                className={`truncate ${
                  m.isDead ? 'text-muted-foreground' : 'text-foreground'
                }`}
              >
                {`{${m.originalStates.join(', ')}}`}
              </span>
              {isMerged && (
                <Badge
                  variant="secondary"
                  className="ml-auto text-xs px-1.5 py-0 h-4.5 shrink-0 font-mono font-normal"
                >
                  ×{m.originalStates.length}
                </Badge>
              )}
              {m.isAccepting && (
                <Badge
                  variant="outline"
                  className="text-xs px-1.5 py-0 h-4.5 border-emerald-300 text-emerald-700 bg-emerald-50/50 shrink-0 font-normal"
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
