import React, { useState } from 'react';
import type { MinimizationStep } from '../../automata/minimization/types';
import { AccordionSection } from './AccordionSection';
import { Badge } from '../ui/badge';

interface MinimizationStepsProps {
  steps: MinimizationStep[];
  expanded?: boolean;
  onToggle?: () => void;
}

export const MinimizationSteps: React.FC<MinimizationStepsProps> = ({
  steps,
  expanded: extExpanded,
  onToggle: extToggle,
}) => {
  const [localOpen, setLocalOpen] = useState(false);
  const expanded = extExpanded !== undefined ? extExpanded : localOpen;
  const onToggle = extToggle ?? (() => setLocalOpen((o) => !o));

  return (
    <AccordionSection
      title="Hopcroft Minimization Steps"
      badge={`${steps.length} steps`}
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="divide-y divide-border/60">
        {steps.map((step) => (
          <div key={step.stepNumber} className="p-3 text-xs space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-muted-foreground text-xs w-6 shrink-0 font-mono">
                {step.stepNumber}.
              </span>
              <Badge variant="outline" className="text-xs h-5 px-1.5 font-medium">
                {step.type}
              </Badge>
              {step.type === 'SPLIT' && step.splitDetails && (
                <span className="text-muted-foreground text-xs">
                  on symbol <span className="font-medium font-mono text-foreground">'{step.splitDetails.symbol}'</span>
                </span>
              )}
            </div>

            <p className="text-muted-foreground text-xs pl-8 leading-relaxed">
              {step.description}
            </p>

            {step.partitions && step.partitions.length > 0 && step.type !== 'REACHABILITY' && (
              <div className="flex flex-wrap gap-1 pl-8 pt-0.5">
                {step.partitions.map((b, j) => (
                  <span
                    key={j}
                    className="text-xs font-mono px-1.5 py-0.5 rounded-xs bg-muted text-muted-foreground border border-border"
                  >
                    {`{${b.join(', ')}}`}
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
