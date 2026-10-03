import React, { useState } from 'react';
import type { EquivalenceStep } from '../../automata/equivalence/types';
import { AccordionSection } from './AccordionSection';

interface EquivalenceStepsProps {
  steps: EquivalenceStep[];
}

export const EquivalenceSteps: React.FC<EquivalenceStepsProps> = ({ steps }) => {
  const [open, setOpen] = useState(false);

  return (
    <AccordionSection
      title="BFS Product Exploration Steps"
      badge={steps.length}
      expanded={open}
      onToggle={() => setOpen(o => !o)}
    >
      <div style={{ fontFamily: 'var(--font-mono)' }}>
        {steps.map((step, i) => {
          const isDist = step.isDistinguishing;
          return (
            <div
              key={step.stepNumber}
              style={{
                padding: '8px 14px',
                borderBottom: '1px solid var(--border)',
                background: isDist
                  ? 'color-mix(in srgb, var(--err) 6%, var(--bg))'
                  : i % 2 === 0 ? 'var(--bg)' : 'var(--s1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                <span style={{ color: 'var(--t3)', fontSize: 10, minWidth: 18 }}>{step.stepNumber}.</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--a)' }}>
                  ({step.pair[0]}, {step.pair[1]})
                </span>
                <span style={{ fontSize: 11, color: 'var(--t3)' }}>prefix:</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--warn)' }}>
                  "{step.inputPrefix === '' ? 'ε' : step.inputPrefix}"
                </span>
                {isDist ? (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: 9,
                      padding: '1px 5px',
                      borderRadius: 3,
                      background: 'color-mix(in srgb, var(--err) 15%, transparent)',
                      color: 'var(--err)',
                      border: '1px solid color-mix(in srgb, var(--err) 35%, transparent)',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    DISTINGUISHING
                  </span>
                ) : (
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--t3)' }}>
                    A:{step.acceptingA ? 'acc' : 'rej'} · B:{step.acceptingB ? 'acc' : 'rej'}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 10, color: 'var(--t3)', lineHeight: 1.4, margin: 0, paddingLeft: 26 }}>
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </AccordionSection>
  );
};
