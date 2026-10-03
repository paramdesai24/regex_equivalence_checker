import React, { useState } from 'react';
import type { NFA, ThompsonStep } from '../../automata/nfa/types';
import { AutomatonGraph } from './AutomatonGraph';
import { TransitionTable } from './TransitionTable';
import { ConstructionSteps } from './ConstructionSteps';

interface NFAPanelProps {
  label: string;
  regexStr: string;
  nfa: NFA;
  steps: ThompsonStep[];
  accent: 'indigo' | 'teal';
}

export const NFAPanel: React.FC<NFAPanelProps> = ({ label, regexStr, nfa, steps, accent }) => {
  const [expanded, setExpanded] = useState<'table' | 'steps' | null>(null);
  const accentColor = accent === 'indigo' ? 'var(--a)' : 'var(--b)';
  const borderColor = accent === 'indigo' ? 'color-mix(in srgb, var(--a) 20%, transparent)' : 'color-mix(in srgb, var(--b) 20%, transparent)';

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--r-md)',
        overflow: 'hidden',
        background: 'var(--s1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: '1px solid var(--border)',
          padding: '10px 14px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          background: 'var(--s2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: accentColor,
              padding: '2px 6px',
              borderRadius: 4,
              background: `${accentColor}18`,
              border: `1px solid ${accentColor}30`,
              letterSpacing: '0.04em',
            }}
          >
            {label}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--t1)', fontWeight: 500 }}>
            {regexStr}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 12,
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'var(--t3)',
            flexWrap: 'wrap',
          }}
        >
          <span>states <span style={{ color: 'var(--t1)' }}>{nfa.states.length}</span></span>
          <span>transitions <span style={{ color: 'var(--t1)' }}>{nfa.transitions.length}</span></span>
          <span>start <span style={{ color: 'var(--a)' }}>q{nfa.startState}</span></span>
          <span>accept <span style={{ color: 'var(--b)' }}>q{nfa.acceptState}</span></span>
        </div>
      </div>

      {/* Graph */}
      <div style={{ padding: 12, background: 'var(--bg)' }}>
        <AutomatonGraph nfa={nfa} />
      </div>

      {/* Collapsible sections */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <TransitionTable nfa={nfa} expanded={expanded === 'table'} onToggle={() => setExpanded(expanded === 'table' ? null : 'table')} />
        <ConstructionSteps steps={steps} expanded={expanded === 'steps'} onToggle={() => setExpanded(expanded === 'steps' ? null : 'steps')} />
      </div>
    </div>
  );
};
