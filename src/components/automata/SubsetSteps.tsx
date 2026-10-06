import React, { useState } from 'react';
import type { SubsetConstructionStep } from '../../automata/dfa/types';
import { AccordionSection } from './AccordionSection';
import { Badge } from '../ui/badge';

interface SubsetStepsProps {
  steps: SubsetConstructionStep[];
  expanded?: boolean;
  onToggle?: () => void;
}

export const SubsetSteps: React.FC<SubsetStepsProps> = ({
  steps,
  expanded: extExpanded,
  onToggle: extToggle,
}) => {
  const [localOpen, setLocalOpen] = useState(false);
  const expanded = extExpanded !== undefined ? extExpanded : localOpen;
  const onToggle = extToggle ?? (() => setLocalOpen((o) => !o));

  return (
    <AccordionSection
      title="Subset Construction Steps"
      badge={`${steps.length} steps`}
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="divide-y divide-border/60">
        {steps.map((step) => {
          const isStart = step.type === 'START';
          return (
            <div key={step.stepNumber} className="p-3 text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs w-6 shrink-0 font-mono">
                  {step.stepNumber}.
                </span>
                {isStart ? (
                  <Badge variant="outline" className="text-xs h-5 px-1.5 font-medium">
                    Start
                  </Badge>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-muted-foreground">Process</span>
                    <span className="font-medium font-mono text-foreground">{step.sourceState}</span>
                    <span className="text-muted-foreground">on</span>
                    <span className="font-medium font-mono text-foreground">'{step.symbol}'</span>
                  </div>
                )}
                {step.isNewState && (
                  <Badge variant="secondary" className="ml-auto text-xs h-5 px-1.5 font-normal">
                    new state
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-xs pl-8 leading-relaxed">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </AccordionSection>
  );
};
