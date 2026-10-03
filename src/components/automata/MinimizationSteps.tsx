import React, { useState } from 'react';
import type { MinimizationStep } from '../../automata/minimization/types';
import { AccordionSection } from './AccordionSection';

interface MinimizationStepsProps {
  steps: MinimizationStep[];
  expanded?: boolean;
  onToggle?: () => void;
}

const TYPE_COLOR: Record<string, string> = {
  REACHABILITY:       'var(--a)',
  INITIAL_PARTITION:  '#C084FC',
  SPLIT:              'var(--warn)',
  CONVERGENCE:        'var(--ok)',
};

export const MinimizationSteps: React.FC<MinimizationStepsProps> = ({ steps, expanded: extExpanded, onToggle: extToggle }) => {
  const [localOpen, setLocalOpen] = useState(false);
  const expanded = extExpanded !== undefined ? extExpanded : localOpen;
  const onToggle = extToggle ?? (() => setLocalOpen(o => !o));

  return (
    <AccordionSection
      title="Hopcroft Minimization Steps"
      badge={steps.length}
      expanded={expanded}
      onToggle={onToggle}
    >
      <div style={{ fontFamily: 'var(--font-mono)' }}>
        {steps.map((step, i) => (
          <div
            key={step.stepNumber}
            style={{
              padding: '8px 14px',
              borderBottom: '1px solid var(--border)',
              background: i % 2 === 0 ? 'var(--bg)' : 'var(--s1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
              <span style={{ color: 'var(--t3)', fontSize: 10, minWidth: 18 }}>{step.stepNumber}.</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: TYPE_COLOR[step.type] ?? 'var(--t2)' }}>
                {step.type}
              </span>
              {step.type === 'SPLIT' && step.splitDetails && (
                <span style={{ fontSize: 11, color: 'var(--t3)' }}>
                  on <span style={{ color: 'var(--warn)', fontWeight: 700 }}>'{step.splitDetails.symbol}'</span>
                </span>
              )}
            </div>

            <p style={{ fontSize: 10, color: 'var(--t3)', lineHeight: 1.4, margin: 0, paddingLeft: 26 }}>
              {step.description}
            </p>

            {step.partitions && step.partitions.length > 0 && step.type !== 'REACHABILITY' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6, paddingLeft: 26 }}>
                {step.partitions.map((b, j) => (
                  <span
                    key={j}
                    style={{
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: 'var(--s2)',
                      color: 'var(--t2)',
                      border: '1px solid var(--border)',
                    }}
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
