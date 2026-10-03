import React, { useState } from 'react';
import type { SubsetConstructionStep } from '../../automata/dfa/types';
import { AccordionSection } from './AccordionSection';

interface SubsetStepsProps {
  steps: SubsetConstructionStep[];
  expanded?: boolean;
  onToggle?: () => void;
}

export const SubsetSteps: React.FC<SubsetStepsProps> = ({ steps, expanded: extExpanded, onToggle: extToggle }) => {
  const [localOpen, setLocalOpen] = useState(false);
  const expanded = extExpanded !== undefined ? extExpanded : localOpen;
  const onToggle = extToggle ?? (() => setLocalOpen(o => !o));

  return (
    <AccordionSection
      title="Subset Construction Steps"
      badge={steps.length}
      expanded={expanded}
      onToggle={onToggle}
    >
      <div style={{ fontFamily: 'var(--font-mono)' }}>
        {steps.map((step, i) => {
          const isStart = step.type === 'START';
          return (
            <div
              key={step.stepNumber}
              style={{
                padding: '8px 14px',
                borderBottom: '1px solid var(--border)',
                background: i % 2 === 0 ? 'var(--bg)' : 'var(--s1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ color: 'var(--t3)', fontSize: 10, minWidth: 18 }}>{step.stepNumber}.</span>
                {isStart ? (
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--a)' }}>START</span>
                ) : (
                  <>
                    <span style={{ fontSize: 11, color: 'var(--t3)' }}>Process</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--a)' }}>{step.sourceState}</span>
                    <span style={{ fontSize: 11, color: 'var(--t3)' }}>on</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--warn)' }}>'{step.symbol}'</span>
                  </>
                )}
                {step.isNewState && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: 9,
                      padding: '1px 5px',
                      borderRadius: 3,
                      background: 'color-mix(in srgb, var(--a) 12%, transparent)',
                      color: 'var(--a)',
                      border: '1px solid color-mix(in srgb, var(--a) 30%, transparent)',
                      fontWeight: 600,
                    }}
                  >
                    new state
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
