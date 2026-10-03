import React, { useState } from 'react';
import type { DFA } from '../../automata/dfa/types';
import { AccordionSection } from './AccordionSection';

interface DFATransitionTableProps {
  dfa: DFA;
  hideDeadState?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}

export const DFATransitionTable: React.FC<DFATransitionTableProps> = ({
  dfa,
  hideDeadState = false,
  expanded: extExpanded,
  onToggle: extToggle,
}) => {
  const [localOpen, setLocalOpen] = useState(false);
  const expanded = extExpanded !== undefined ? extExpanded : localOpen;
  const onToggle = extToggle ?? (() => setLocalOpen(o => !o));

  const visibleStates = dfa.states.filter(s => !hideDeadState || !s.isDead);

  const transitionMap = new Map<string, string>();
  for (const t of dfa.transitions) {
    transitionMap.set(`${t.from},${t.symbol}`, t.to);
  }

  return (
    <AccordionSection
      title="DFA Transition Table"
      badge={`${visibleStates.length} × ${dfa.alphabet.length}`}
      expanded={expanded}
      onToggle={onToggle}
      overflow
    >
      <table style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: 11, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--s1)', position: 'sticky', top: 0 }}>
            <th style={{ textAlign: 'left', padding: '6px 14px', fontWeight: 600, color: 'var(--t3)', fontSize: 10, letterSpacing: '0.04em' }}>STATE</th>
            {dfa.alphabet.map(sym => (
              <th key={sym} style={{ textAlign: 'left', padding: '6px 14px', fontWeight: 600, color: 'var(--warn)', fontSize: 10, letterSpacing: '0.04em' }}>
                {sym}
              </th>
            ))}
            <th style={{ textAlign: 'left', padding: '6px 14px', fontWeight: 600, color: 'var(--t3)', fontSize: 10, letterSpacing: '0.04em' }}>ACCEPT</th>
          </tr>
        </thead>
        <tbody>
          {visibleStates.map((s, i) => {
            const isStart  = s.id === dfa.startState;
            const isAccept = s.isAccepting;
            const rowBg    = i % 2 === 0 ? 'var(--bg)' : 'var(--s1)';
            return (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--border)', background: rowBg }}>
                <td style={{ padding: '5px 14px' }}>
                  {isStart && <span style={{ color: 'var(--a)', marginRight: 4 }}>→</span>}
                  {isAccept && <span style={{ color: 'var(--b)', marginRight: 4 }}>*</span>}
                  <span style={{ color: isAccept ? 'var(--b)' : isStart ? 'var(--a)' : s.isDead ? 'var(--t3)' : 'var(--t1)', fontWeight: 600 }}>
                    {s.id}
                  </span>
                </td>
                {dfa.alphabet.map(sym => {
                  const target = transitionMap.get(`${s.id},${sym}`) ?? '—';
                  return (
                    <td key={sym} style={{ padding: '5px 14px', color: target === 'DEAD' || target === '—' ? 'var(--t3)' : 'var(--t1)' }}>
                      {target}
                    </td>
                  );
                })}
                <td style={{ padding: '5px 14px', color: isAccept ? 'var(--ok)' : 'var(--t3)', fontWeight: isAccept ? 600 : 400 }}>
                  {isAccept ? 'Yes' : 'No'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </AccordionSection>
  );
};
