import React, { useState } from 'react';
import type { ThompsonStep } from '../../automata/nfa/types';
import { AccordionSection } from './AccordionSection';
import { Badge } from '../ui/badge';

interface ConstructionStepsProps {
  steps: ThompsonStep[];
  expanded?: boolean;
  onToggle?: () => void;
}

export const ConstructionSteps: React.FC<ConstructionStepsProps> = ({
  steps,
  expanded: extExpanded,
  onToggle: extToggle,
}) => {
  const [localOpen, setLocalOpen] = useState(false);
  const expanded = extExpanded !== undefined ? extExpanded : localOpen;
  const onToggle = extToggle ?? (() => setLocalOpen((o) => !o));

  return (
    <AccordionSection
      title="Thompson Construction Steps"
      badge={`${steps.length} steps`}
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="divide-y divide-border/60">
        {steps.map((step, i) => (
          <div key={i} className="p-3 text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs w-6 shrink-0 font-mono">{i + 1}.</span>
              <Badge variant="outline" className="text-xs h-5 px-1.5 font-medium font-mono">
                {step.operator}
              </Badge>
              <span className="text-muted-foreground text-xs">
                {step.subject === '.'
                  ? 'concat'
                  : step.subject === '|'
                  ? 'union'
                  : step.subject === '*'
                  ? 'star'
                  : `'${step.subject}'`}
              </span>
            </div>
            <p className="text-muted-foreground text-xs pl-8 leading-relaxed">
              {step.description}
            </p>
            {step.newStates.length > 0 && (
              <div className="flex flex-wrap gap-1 pl-8 pt-0.5">
                {step.newStates.map((s) => (
                  <span
                    key={s}
                    className="text-xs font-mono px-1 py-0.5 rounded-xs bg-muted text-muted-foreground border border-border"
                  >
                    +q{s}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </AccordionSection>
  );
};
