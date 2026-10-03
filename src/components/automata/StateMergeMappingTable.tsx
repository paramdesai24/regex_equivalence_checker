import React, { useState } from 'react';
import type { StateMergeMapping } from '../../automata/minimization/types';
import { AccordionSection } from './AccordionSection';

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
  const onToggle = extToggle ?? (() => setLocalOpen(o => !o));
  const mergedCount = mappings.filter(m => m.originalStates.length > 1).length;

  return (
    <AccordionSection
      title="State Merge Mapping"
      badge={`${mappings.length} states${mergedCount > 0 ? ` · ${mergedCount} merged` : ''}`}
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
        {mappings.map(m => {
          const isMerged = m.originalStates.length > 1;
          const color = m.isAccepting ? 'var(--b)' : m.isDead ? 'var(--t3)' : 'var(--a)';

          return (
            <div
              key={m.minimizedId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 'var(--r-sm)',
                background: 'var(--s1)',
                border: `1px solid ${isMerged ? 'color-mix(in srgb, var(--a) 30%, transparent)' : 'var(--border)'}`,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                minWidth: 0,
              }}
            >
              <span style={{ color, fontWeight: 700, flexShrink: 0 }}>{m.minimizedId}</span>
              <span style={{ color: 'var(--t3)' }}>←</span>
              <span style={{ color: m.isDead ? 'var(--t3)' : 'var(--t2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {`{${m.originalStates.join(', ')}}`}
              </span>
              {isMerged && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: 9,
                    padding: '1px 5px',
                    borderRadius: 3,
                    background: 'color-mix(in srgb, var(--a) 12%, transparent)',
                    color: 'var(--a)',
                    border: '1px solid color-mix(in srgb, var(--a) 30%, transparent)',
                    flexShrink: 0,
                    fontWeight: 600,
                  }}
                >
                  ×{m.originalStates.length}
                </span>
              )}
              {m.isAccepting && (
                <span
                  style={{
                    fontSize: 9,
                    padding: '1px 5px',
                    borderRadius: 3,
                    background: 'color-mix(in srgb, var(--b) 12%, transparent)',
                    color: 'var(--b)',
                    border: '1px solid color-mix(in srgb, var(--b) 30%, transparent)',
                    flexShrink: 0,
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
