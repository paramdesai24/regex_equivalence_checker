import React, { useState } from 'react';
import type { ThompsonStep } from '../../automata/nfa/types';
import { AccordionSection } from './AccordionSection';

interface ConstructionStepsProps {
  steps: ThompsonStep[];
  expanded?: boolean;
  onToggle?: () => void;
}

const OP_COLOR: Record<ThompsonStep['operator'], string> = {
  LITERAL: 'var(--a)',
  CONCAT:  'var(--b)',
  UNION:   '#C084FC',
  STAR:    'var(--ok)',
};

export const ConstructionSteps: React.FC<ConstructionStepsProps> = ({ steps, expanded: extExpanded, onToggle: extToggle }) => {
  const [localOpen, setLocalOpen] = useState(false);
  const expanded = extExpanded !== undefined ? extExpanded : localOpen;
  const onToggle = extToggle ?? (() => setLocalOpen(o => !o));

  return (
    <AccordionSection
      title="Thompson Construction Steps"
      badge={steps.length}
      expanded={expanded}
      onToggle={onToggle}
    >
      <div style={{ fontFamily: 'var(--font-mono)' }}>
        {steps.map((step, i) => (
          <div
            key={i}
            style={{
              padding: '8px 14px',
              borderBottom: '1px solid var(--border)',
              background: i % 2 === 0 ? 'var(--bg)' : 'var(--s1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ color: 'var(--t3)', fontSize: 10, minWidth: 18 }}>{i + 1}.</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: OP_COLOR[step.operator] }}>
                {step.operator}
              </span>
              <span style={{ fontSize: 11, color: 'var(--t2)' }}>
                {step.subject === '.' ? 'concat'
                 : step.subject === '|' ? 'union'
                 : step.subject === '*' ? 'star'
                 : `'${step.subject}'`}
              </span>
            </div>
            <p style={{ fontSize: 10, color: 'var(--t3)', lineHeight: 1.4, margin: 0, paddingLeft: 26 }}>
              {step.description}
            </p>
            {step.newStates.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4, paddingLeft: 26 }}>
                {step.newStates.map(s => (
                  <span
                    key={s}
                    style={{
                      fontSize: 10,
                      padding: '1px 5px',
                      borderRadius: 4,
                      background: 'var(--s2)',
                      color: 'var(--t2)',
                      border: '1px solid var(--border)',
                    }}
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
