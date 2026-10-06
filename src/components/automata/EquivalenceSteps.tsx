import React, { useState } from 'react';
import type { EquivalenceStep } from '../../automata/equivalence/types';
import { AccordionSection } from './AccordionSection';
import { Badge } from '../ui/badge';

interface EquivalenceStepsProps {
  steps: EquivalenceStep[];
}

export const EquivalenceSteps: React.FC<EquivalenceStepsProps> = ({ steps }) => {
  const [open, setOpen] = useState(false);

  return (
    <AccordionSection
      title="BFS Product Exploration Steps"
      badge={`${steps.length} steps`}
      expanded={open}
      onToggle={() => setOpen((o) => !o)}
    >
      <div className="divide-y divide-border/60">
        {steps.map((step) => {
          const isDist = step.isDistinguishing;

          return (
            <div
              key={step.stepNumber}
              className={`p-3 text-xs space-y-1 ${
                isDist ? 'bg-red-50/40 dark:bg-red-950/20' : ''
              }`}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-muted-foreground text-xs w-6 shrink-0 font-mono">
                  {step.stepNumber}.
                </span>
                <span className="font-medium font-mono text-foreground">
                  ({step.pair[0]}, {step.pair[1]})
                </span>
                <span className="text-muted-foreground">prefix:</span>
                <span className="font-medium font-mono text-foreground">
                  "{step.inputPrefix === '' ? 'ε' : step.inputPrefix}"
                </span>

                {isDist ? (
                  <Badge variant="destructive" className="ml-auto text-xs h-5 px-1.5 font-medium">
                    Distinguishing
                  </Badge>
                ) : (
                  <span className="ml-auto text-xs font-mono text-muted-foreground">
                    A: {step.acceptingA ? 'acc' : 'rej'} · B: {step.acceptingB ? 'acc' : 'rej'}
                  </span>
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
