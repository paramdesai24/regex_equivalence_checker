import React, { useState } from 'react';
import type { DFAState } from '../../automata/dfa/types';
import { AccordionSection } from './AccordionSection';

interface StateMappingTableProps {
  states: DFAState[];
  expanded?: boolean;
  onToggle?: () => void;
}

export const StateMappingTable: React.FC<StateMappingTableProps> = ({ states, expanded: extExpanded, onToggle: extToggle }) => {
  const [localOpen, setLocalOpen] = useState(false);
  const expanded = extExpanded !== undefined ? extExpanded : localOpen;
  const onToggle = extToggle ?? (() => setLocalOpen(o => !o));

  return (
    <AccordionSection
      title="DFA ↔ NFA State Subsets"
      badge={`${states.length} states`}
      expanded={expanded}
      onToggle={onToggle}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 6,
          padding: 12,
        }}
      >
        {states.map(s => {
          const subsetStr = s.nfaStates.length > 0
            ? `{${s.nfaStates.map(q => `q${q}`).join(', ')}}`
            : '∅';
          const color = s.isAccepting ? 'var(--b)' : s.isDead ? 'var(--t3)' : 'var(--a)';

          return (
            <div
              key={s.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 'var(--r-sm)',
                background: 'var(--s1)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                minWidth: 0,
              }}
            >
              <span style={{ color, fontWeight: 700, flexShrink: 0 }}>{s.id}</span>
              <span style={{ color: 'var(--t3)' }}>=</span>
              <span style={{ color: s.isDead ? 'var(--t3)' : 'var(--t2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {subsetStr}
              </span>
              {s.isAccepting && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: 9,
                    padding: '1px 5px',
                    borderRadius: 3,
                    background: 'color-mix(in srgb, var(--b) 12%, transparent)',
                    color: 'var(--b)',
                    border: '1px solid color-mix(in srgb, var(--b) 30%, transparent)',
                    flexShrink: 0,
                    letterSpacing: '0.04em',
                    fontWeight: 600,
                  }}
                >
                  accept
                </span>
              )}
            </div>
          );
        })}
      </div>
    </AccordionSection>
  );
};
