import React from 'react';
import type { PipelineStage } from '../types/pipeline';

interface TabNavigationProps {
  currentStage: PipelineStage;
  onSelectStage: (stage: PipelineStage) => void;
  nfaReady: boolean;
  dfaReady?: boolean;
  minDfaReady?: boolean;
  equivalenceReady?: boolean;
}

interface TabDef {
  id: PipelineStage;
  label: string;
  short: string;
  step: number;
}

const TABS: TabDef[] = [
  { id: 'input',       label: 'Input',       short: 'Input',  step: 1 },
  { id: 'nfa',         label: 'ε-NFA',       short: 'ε-NFA',  step: 2 },
  { id: 'dfa',         label: 'DFA',         short: 'DFA',    step: 3 },
  { id: 'min-dfa',     label: 'Min-DFA',     short: 'Min',    step: 4 },
  { id: 'equivalence', label: 'Equivalence', short: 'Equiv',  step: 5 },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({
  currentStage,
  onSelectStage,
  nfaReady,
  dfaReady = nfaReady,
  minDfaReady = dfaReady,
  equivalenceReady = minDfaReady,
}) => {
  const isReady = (id: PipelineStage) => {
    if (id === 'input')       return true;
    if (id === 'nfa')         return nfaReady;
    if (id === 'dfa')         return dfaReady;
    if (id === 'min-dfa')     return minDfaReady;
    if (id === 'equivalence') return equivalenceReady;
    return false;
  };

  return (
    <div
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        padding: '0 24px',
      }}
    >
      <nav
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'stretch',
          gap: 0,
        }}
        aria-label="Pipeline stages"
      >
        {TABS.map((tab) => {
          const active = currentStage === tab.id;
          const ready = isReady(tab.id);
          const locked = !ready && tab.id !== 'input';

          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => onSelectStage(tab.id)}
              disabled={locked}
              aria-selected={active}
              role="tab"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '0 14px',
                height: 40,
                fontSize: 12,
                fontWeight: active ? 600 : 500,
                fontFamily: 'var(--font-sans)',
                background: 'transparent',
                border: 'none',
                borderBottom: active ? '2px solid var(--a)' : '2px solid transparent',
                color: active ? 'var(--t1)' : locked ? 'var(--t3)' : 'var(--t2)',
                cursor: locked ? 'default' : 'pointer',
                transition: 'color 120ms, border-color 120ms',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.01em',
                marginBottom: -1,
              }}
              onMouseEnter={e => {
                if (!active && !locked) {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--t1)';
                }
              }}
              onMouseLeave={e => {
                if (!active && !locked) {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--t2)';
                }
              }}
            >
              {/* Step number chip */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  fontSize: 9,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  background: active ? 'var(--a)' : 'var(--s2)',
                  color: active ? '#fff' : 'var(--t3)',
                  flexShrink: 0,
                  transition: 'background 120ms, color 120ms',
                }}
              >
                {tab.step}
              </span>

              {tab.label}

              {/* Readiness dot (data available, not active) */}
              {ready && !active && !locked && (
                <span
                  aria-hidden
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: 'var(--a)',
                    flexShrink: 0,
                    opacity: 0.7,
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
