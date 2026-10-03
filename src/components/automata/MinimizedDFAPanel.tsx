import React, { useState } from 'react';
import type { MinimizationResult } from '../../automata/minimization/types';
import { AutomatonGraph } from './AutomatonGraph';
import { StateMergeMappingTable } from './StateMergeMappingTable';
import { DFATransitionTable } from './DFATransitionTable';
import { MinimizationSteps } from './MinimizationSteps';

interface MinimizedDFAPanelProps {
  label: string;
  regexStr: string;
  minResult: MinimizationResult;
  accent: 'indigo' | 'teal';
}

export const MinimizedDFAPanel: React.FC<MinimizedDFAPanelProps> = ({
  label,
  regexStr,
  minResult,
  accent,
}) => {
  const [showDeadState, setShowDeadState] = useState(true);
  const [expanded, setExpanded] = useState<'merge' | 'table' | 'steps' | null>(null);

  const dfa           = minResult.minimizedDfa;
  const accentColor   = accent === 'indigo' ? 'var(--a)' : 'var(--b)';
  const borderColor   = accent === 'indigo' ? 'color-mix(in srgb, var(--a) 20%, transparent)' : 'color-mix(in srgb, var(--b) 20%, transparent)';
  const hasDeadState  = dfa.deadStateId !== null;
  const visibleStates = showDeadState ? dfa.states.length : dfa.states.filter(s => !s.isDead).length;
  const visibleTrans  = showDeadState ? dfa.transitions.length : dfa.transitions.filter(t => t.from !== dfa.deadStateId && t.to !== dfa.deadStateId).length;
  const reduced       = minResult.statesRemoved > 0;

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
          background: 'var(--s2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600,
                color: accentColor, padding: '2px 6px', borderRadius: 4,
                background: `${accentColor}18`, border: `1px solid ${accentColor}30`,
              }}
            >
              {label}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--t1)', fontWeight: 500 }}>
              {regexStr}
            </span>
          </div>

          {hasDeadState && (
            <label
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--t2)',
                cursor: 'pointer', padding: '3px 8px',
                borderRadius: 4, border: '1px solid var(--border)',
                background: 'var(--s1)', userSelect: 'none',
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

        {/* Before / After metrics row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '4px 16px',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'var(--t3)',
            borderTop: '1px solid var(--border)',
            paddingTop: 8,
          }}
        >
          <span>
            Original: <span style={{ color: 'var(--t1)' }}>{minResult.originalStateCount} states</span>
            {' / '}
            <span style={{ color: 'var(--t1)' }}>{minResult.originalTransitionCount} trans</span>
          </span>

          <span style={{ color: 'var(--border-2)' }}>→</span>

          <span>
            Minimized: <span style={{ color: 'var(--ok)', fontWeight: 600 }}>{visibleStates} states</span>
            {' / '}
            <span style={{ color: 'var(--ok)', fontWeight: 600 }}>{visibleTrans} trans</span>
          </span>

          {reduced ? (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 4,
                background: 'color-mix(in srgb, var(--a) 12%, transparent)',
                color: 'var(--a)',
                border: '1px solid color-mix(in srgb, var(--a) 30%, transparent)',
                fontWeight: 600,
              }}
            >
              -{minResult.statesRemoved} state{minResult.statesRemoved > 1 ? 's' : ''} ({minResult.reductionPercent}% reduction)
            </span>
          ) : (
            <span style={{ color: 'var(--t3)', fontSize: 10 }}>already minimal</span>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
            <span>start <span style={{ color: 'var(--a)' }}>{dfa.startState}</span></span>
            <span>accept <span style={{ color: 'var(--b)' }}>{dfa.acceptStates.length > 0 ? dfa.acceptStates.join(', ') : 'none'}</span></span>
          </div>
        </div>
      </div>

      {/* Graph */}
      <div style={{ padding: 12, background: 'var(--bg)' }}>
        <AutomatonGraph dfa={dfa} hideDeadState={!showDeadState} />
      </div>

      {/* Collapsible sections */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <StateMergeMappingTable
          mappings={minResult.stateMapping}
          expanded={expanded === 'merge'}
          onToggle={() => setExpanded(expanded === 'merge' ? null : 'merge')}
        />
        <DFATransitionTable
          dfa={dfa}
          hideDeadState={!showDeadState}
          expanded={expanded === 'table'}
          onToggle={() => setExpanded(expanded === 'table' ? null : 'table')}
        />
        <MinimizationSteps
          steps={minResult.steps}
          expanded={expanded === 'steps'}
          onToggle={() => setExpanded(expanded === 'steps' ? null : 'steps')}
        />
      </div>
    </div>
  );
};
