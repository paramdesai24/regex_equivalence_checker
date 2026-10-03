import React, { useState } from 'react';
import type { DFA, SubsetConstructionStep } from '../../automata/dfa/types';
import { AutomatonGraph } from './AutomatonGraph';
import { StateMappingTable } from './StateMappingTable';
import { DFATransitionTable } from './DFATransitionTable';
import { SubsetSteps } from './SubsetSteps';

interface DFAPanelProps {
  label: string;
  regexStr: string;
  dfa: DFA;
  steps: SubsetConstructionStep[];
  accent: 'indigo' | 'teal';
}

export const DFAPanel: React.FC<DFAPanelProps> = ({ label, regexStr, dfa, steps, accent }) => {
  const [showDeadState, setShowDeadState] = useState(true);
  const [expanded, setExpanded] = useState<'map' | 'table' | 'steps' | null>(null);

  const accentColor  = accent === 'indigo' ? 'var(--a)' : 'var(--b)';
  const borderColor  = accent === 'indigo' ? 'color-mix(in srgb, var(--a) 20%, transparent)' : 'color-mix(in srgb, var(--b) 20%, transparent)';
  const hasDeadState = dfa.deadStateId !== null;

  const visibleStates      = showDeadState ? dfa.states.length : dfa.states.filter(s => !s.isDead).length;
  const visibleTransitions = showDeadState
    ? dfa.transitions.length
    : dfa.transitions.filter(t => t.from !== dfa.deadStateId && t.to !== dfa.deadStateId).length;

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

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--t3)' }}>
            <span>states <span style={{ color: 'var(--t1)' }}>{visibleStates}</span></span>
            <span>transitions <span style={{ color: 'var(--t1)' }}>{visibleTransitions}</span></span>
            <span>start <span style={{ color: 'var(--a)' }}>{dfa.startState}</span></span>
            <span>accept <span style={{ color: 'var(--b)' }}>{dfa.acceptStates.length > 0 ? dfa.acceptStates.join(', ') : 'none'}</span></span>
          </div>

          {hasDeadState && (
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: 'var(--t2)',
                cursor: 'pointer',
                padding: '3px 8px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                background: 'var(--s1)',
                userSelect: 'none',
                transition: 'border-color 120ms',
              }}
            >
              <input
                type="checkbox"
                checked={showDeadState}
                onChange={e => setShowDeadState(e.target.checked)}
                style={{ width: 12, height: 12, accentColor: 'var(--a)', cursor: 'pointer' }}
              />
              Dead state
            </label>
          )}
        </div>
      </div>

      {/* Graph */}
      <div style={{ padding: 12, background: 'var(--bg)' }}>
        <AutomatonGraph dfa={dfa} hideDeadState={!showDeadState} />
      </div>

      {/* Collapsible sections */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <StateMappingTable states={dfa.states} expanded={expanded === 'map'} onToggle={() => setExpanded(expanded === 'map' ? null : 'map')} />
        <DFATransitionTable dfa={dfa} hideDeadState={!showDeadState} expanded={expanded === 'table'} onToggle={() => setExpanded(expanded === 'table' ? null : 'table')} />
        <SubsetSteps steps={steps} expanded={expanded === 'steps'} onToggle={() => setExpanded(expanded === 'steps' ? null : 'steps')} />
      </div>
    </div>
  );
};
