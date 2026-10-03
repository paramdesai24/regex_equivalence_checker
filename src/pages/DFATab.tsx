import React, { useMemo } from 'react';
import type { ProcessedRegexResult } from '../automata/regex/types';
import { buildNFA } from '../automata/nfa/thompson';
import { buildDFA } from '../automata/dfa/subset';
import { DFAPanel } from '../components/automata/DFAPanel';
import { ArrowRight, AlertCircle } from 'lucide-react';

interface DFATabProps {
  resultA: ProcessedRegexResult | null;
  resultB: ProcessedRegexResult | null;
  regexA: string;
  regexB: string;
  onGoToInput: () => void;
  onGoToMinDFA?: () => void;
}

export const DFATab: React.FC<DFATabProps> = ({
  resultA,
  resultB,
  regexA,
  regexB,
  onGoToInput,
  onGoToMinDFA,
}) => {
  const dfaResultA = useMemo(() => {
    if (!resultA || !resultA.isValid || resultA.postfixTokens.length === 0) return null;
    try {
      const { nfa } = buildNFA(resultA.postfixTokens);
      return buildDFA(nfa);
    } catch {
      return null;
    }
  }, [resultA]);

  const dfaResultB = useMemo(() => {
    if (!resultB || !resultB.isValid || resultB.postfixTokens.length === 0) return null;
    try {
      const { nfa } = buildNFA(resultB.postfixTokens);
      return buildDFA(nfa);
    } catch {
      return null;
    }
  }, [resultB]);

  const hasNeither = !dfaResultA && !dfaResultB;

  if (hasNeither) {
    return (
      <div
        style={{
          padding: '64px 24px',
          textAlign: 'center',
          background: 'var(--s0)',
          border: '1px dashed var(--border-2)',
          borderRadius: 'var(--r-lg)',
          marginTop: 20,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'var(--s1)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'var(--t3)',
          }}
        >
          <AlertCircle size={20} />
        </div>
        <p style={{ color: 'var(--t2)', fontSize: 13, marginBottom: 12 }}>
          Enter valid regular expressions to inspect their Deterministic Finite Automata (DFA).
        </p>
        <button
          onClick={onGoToInput}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontFamily: 'var(--font-sans)',
            padding: '6px 14px',
            borderRadius: 'var(--r-sm)',
            background: 'var(--s1)',
            border: '1px solid var(--border-2)',
            color: 'var(--t1)',
            cursor: 'pointer',
            transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--s2)';
            e.currentTarget.style.borderColor = 'var(--border-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--s1)';
            e.currentTarget.style.borderColor = 'var(--border-2)';
          }}
        >
          Go to Input tab <ArrowRight size={13} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Section header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          paddingBottom: 14,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--t1)',
                letterSpacing: '-0.01em',
                margin: 0,
              }}
            >
              DFA — Subset Construction (Powerset Algorithm)
            </h2>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--a)',
                background: 'color-mix(in srgb, var(--a) 12%, transparent)',
                border: '1px solid color-mix(in srgb, var(--a) 25%, transparent)',
                padding: '1px 6px',
                borderRadius: 'var(--r-xs)',
              }}
            >
              Stage 3
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--t3)', margin: '4px 0 0' }}>
            Determinized via ε-closure and move operations. Missing transitions route to an explicit DEAD trap state.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--t3)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--a)',
                }}
              />
              Start
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  border: '1.5px double var(--b)',
                }}
              />
              Accept
            </span>
          </div>

          {onGoToMinDFA && (
            <button
              onClick={onGoToMinDFA}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 12px',
                borderRadius: 'var(--r-sm)',
                background: 'var(--s1)',
                border: '1px solid var(--border-2)',
                color: 'var(--t1)',
                fontSize: 12,
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--s2)';
                e.currentTarget.style.borderColor = 'var(--border-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--s1)';
                e.currentTarget.style.borderColor = 'var(--border-2)';
              }}
            >
              View Minimized DFA <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Two panels */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: 16,
        }}
      >
        {dfaResultA ? (
          <DFAPanel
            label="Regex A"
            regexStr={regexA}
            dfa={dfaResultA.dfa}
            steps={dfaResultA.steps}
            accent="indigo"
          />
        ) : (
          <div
            style={{
              padding: 24,
              borderRadius: 'var(--r-md)',
              background: 'var(--s0)',
              border: '1px solid var(--border)',
              textAlign: 'center',
              fontSize: 12,
              color: 'var(--t3)',
            }}
          >
            {resultA && !resultA.isValid
              ? `Regex A syntax error: ${resultA.error?.message}`
              : 'Regex A: not entered.'}
          </div>
        )}

        {dfaResultB ? (
          <DFAPanel
            label="Regex B"
            regexStr={regexB}
            dfa={dfaResultB.dfa}
            steps={dfaResultB.steps}
            accent="teal"
          />
        ) : (
          <div
            style={{
              padding: 24,
              borderRadius: 'var(--r-md)',
              background: 'var(--s0)',
              border: '1px solid var(--border)',
              textAlign: 'center',
              fontSize: 12,
              color: 'var(--t3)',
            }}
          >
            {resultB && !resultB.isValid
              ? `Regex B syntax error: ${resultB.error?.message}`
              : 'Regex B: not entered.'}
          </div>
        )}
      </div>
    </div>
  );
};
