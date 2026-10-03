import React, { useState } from 'react';
import type { NFA, Transition } from '../../automata/nfa/types';
import { AccordionSection } from './AccordionSection';

interface TransitionTableProps {
  nfa: NFA;
  expanded?: boolean;
  onToggle?: () => void;
}

export const TransitionTable: React.FC<TransitionTableProps> = ({ nfa, expanded: extExpanded, onToggle: extToggle }) => {
  const [localOpen, setLocalOpen] = useState(false);
  const expanded = extExpanded !== undefined ? extExpanded : localOpen;
  const onToggle = extToggle ?? (() => setLocalOpen(o => !o));

  const sorted = [...nfa.transitions].sort(
    (a, b) => a.from - b.from || (a.symbol ?? 'ε').localeCompare(b.symbol ?? 'ε')
  );

  return (
    <AccordionSection
      title="Transition Table"
      badge={`${nfa.transitions.length} rows`}
      expanded={expanded}
      onToggle={onToggle}
      overflow
    >
      <table style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: 11, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--s1)', position: 'sticky', top: 0 }}>
            <th style={{ textAlign: 'left', padding: '6px 14px', fontWeight: 600, color: 'var(--t3)', letterSpacing: '0.04em', fontSize: 10 }}>FROM</th>
            <th style={{ textAlign: 'left', padding: '6px 14px', fontWeight: 600, color: 'var(--t3)', letterSpacing: '0.04em', fontSize: 10 }}>SYM</th>
            <th style={{ textAlign: 'left', padding: '6px 14px', fontWeight: 600, color: 'var(--t3)', letterSpacing: '0.04em', fontSize: 10 }}>TO</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((t: Transition, i) => (
            <tr
              key={i}
              style={{
                borderBottom: '1px solid var(--border)',
                background: i % 2 === 0 ? 'var(--bg)' : 'var(--s1)',
              }}
            >
              <td style={{ padding: '5px 14px', color: 'var(--a)' }}>q{t.from}</td>
              <td style={{ padding: '5px 14px', color: 'var(--warn)' }}>{t.symbol ?? 'ε'}</td>
              <td style={{ padding: '5px 14px', color: 'var(--b)' }}>q{t.to}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AccordionSection>
  );
};
