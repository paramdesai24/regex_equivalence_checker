import React, { useMemo } from 'react';
import type { ProcessedRegexResult } from '../automata/regex/types';
import { buildNFA } from '../automata/nfa/thompson';
import { buildDFA } from '../automata/dfa/subset';
import { minimizeDFA } from '../automata/minimization/minimize';
import { checkEquivalence } from '../automata/equivalence/equivalence';
import { CounterexampleInspector } from '../components/automata/CounterexampleInspector';
import { ProductGraphPanel } from '../components/automata/ProductGraphPanel';
import { EquivalenceSteps } from '../components/automata/EquivalenceSteps';
import { CheckCircle2, XCircle, ArrowRight, AlertCircle } from 'lucide-react';

interface EquivalenceTabProps {
  resultA: ProcessedRegexResult | null;
  resultB: ProcessedRegexResult | null;
  regexA: string;
  regexB: string;
  hasCompared?: boolean;
  onGoToInput: () => void;
}

export const EquivalenceTab: React.FC<EquivalenceTabProps> = ({
  resultA,
  resultB,
  regexA,
  regexB,
  hasCompared = true,
  onGoToInput,
}) => {
  const minDfaA = useMemo(() => {
    if (!hasCompared || !resultA || !resultA.isValid || resultA.postfixTokens.length === 0) return null;
    try {
      const { nfa } = buildNFA(resultA.postfixTokens);
      const { dfa } = buildDFA(nfa);
      return minimizeDFA(dfa).minimizedDfa;
    } catch {
      return null;
    }
  }, [resultA, hasCompared]);

  const minDfaB = useMemo(() => {
    if (!hasCompared || !resultB || !resultB.isValid || resultB.postfixTokens.length === 0) return null;
    try {
      const { nfa } = buildNFA(resultB.postfixTokens);
      const { dfa } = buildDFA(nfa);
      return minimizeDFA(dfa).minimizedDfa;
    } catch {
      return null;
    }
  }, [resultB, hasCompared]);

  const eqResult = useMemo(() => {
    if (!minDfaA || !minDfaB) return null;
    try {
      return checkEquivalence(minDfaA, minDfaB);
    } catch {
      return null;
    }
  }, [minDfaA, minDfaB]);

  if (!hasCompared) {
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
          Regular expressions have been modified or not yet compared.
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
          Return to Input &amp; Compare <ArrowRight size={13} />
        </button>
      </div>
    );
  }

  if (!minDfaA || !minDfaB || !eqResult) {
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
          Enter valid regular expressions in the Input tab to verify language equivalence.
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

  const isEq = eqResult.equivalent;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Section Header */}
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
              Language Equivalence &amp; Counterexample Analysis
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
              Stage 5
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--t3)', margin: '4px 0 0' }}>
            Verified via Symmetric Difference Product Automaton (L(A) △ L(B)) and Breadth-First Search reachability.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--t3)',
          }}
        >
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--r-xs)',
              background: 'var(--s1)',
              border: '1px solid var(--border)',
            }}
          >
            Σ = {'{'}{eqResult.combinedAlphabet.join(', ')}{'}'}
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--r-xs)',
              background: 'var(--s1)',
              border: '1px solid var(--border)',
            }}
          >
            {eqResult.visitedProductStates} product states explored
          </span>
        </div>
      </div>

      {/* Prominent Technical Result Banner */}
      <div
        style={{
          borderRadius: 'var(--r-md)',
          padding: 18,
          background: isEq
            ? 'color-mix(in srgb, var(--g) 8%, var(--s0))'
            : 'color-mix(in srgb, var(--r) 8%, var(--s0))',
          border: `1px solid ${isEq ? 'color-mix(in srgb, var(--g) 30%, transparent)' : 'color-mix(in srgb, var(--r) 30%, transparent)'}`,
          boxShadow: isEq
            ? '0 0 20px -5px color-mix(in srgb, var(--g) 15%, transparent)'
            : '0 0 20px -5px color-mix(in srgb, var(--r) 15%, transparent)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 8px',
                borderRadius: 'var(--r-xs)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                background: isEq
                  ? 'color-mix(in srgb, var(--g) 18%, transparent)'
                  : 'color-mix(in srgb, var(--r) 18%, transparent)',
                color: isEq ? 'var(--g)' : 'var(--r)',
                border: `1px solid ${isEq ? 'color-mix(in srgb, var(--g) 40%, transparent)' : 'color-mix(in srgb, var(--r) 40%, transparent)'}`,
              }}
            >
              {isEq ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              {isEq ? 'Equivalent' : 'Not Equivalent'}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--t1)',
              }}
            >
              {isEq ? 'L(Regex A) = L(Regex B)' : 'L(Regex A) ≠ L(Regex B)'}
            </span>
          </div>

          <div
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: 'var(--t3)',
            }}
          >
            Algorithm: Product Automaton + BFS
          </div>
        </div>

        {isEq ? (
          <p
            style={{
              fontSize: 12,
              color: 'var(--t2)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            No distinguishing string exists. Both regular expressions accept the exact same formal language over the combined alphabet{' '}
            <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--g)' }}>
              Σ = {'{'}{eqResult.combinedAlphabet.join(', ')}{'}'}
            </code>
            . No symmetric-difference accepting state was reachable in the product automaton.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.6, margin: 0 }}>
              The languages differ. A shortest distinguishing string was discovered by Breadth-First Search on the symmetric difference product automaton:
            </p>

            {/* Counterexample Callout */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 12,
                padding: '8px 14px',
                borderRadius: 'var(--r-sm)',
                background: 'var(--bg)',
                border: '1px solid color-mix(in srgb, var(--r) 25%, var(--border))',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--t3)', fontFamily: 'var(--font-sans)' }}>
                Shortest Distinguishing String:
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--y)',
                  background: 'color-mix(in srgb, var(--y) 12%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--y) 30%, transparent)',
                  padding: '2px 8px',
                  borderRadius: 'var(--r-xs)',
                }}
              >
                "{eqResult.counterexample?.displayString}"
              </span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--t3)',
                }}
              >
                length: {eqResult.counterexample?.rawString.length ?? 0}
              </span>
            </div>

            {/* Concrete Acceptance Comparison Table */}
            <div
              style={{
                borderRadius: 'var(--r-sm)',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr
                    style={{
                      background: 'var(--s1)',
                      color: 'var(--t3)',
                      borderBottom: '1px solid var(--border)',
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    <th style={{ padding: '7px 12px', fontWeight: 600 }}>Expression</th>
                    <th style={{ padding: '7px 12px', fontWeight: 600 }}>Input String</th>
                    <th style={{ padding: '7px 12px', fontWeight: 600 }}>Language Acceptance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: 'var(--s0)', borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '7px 12px' }}>
                      <span style={{ color: 'var(--a)', fontWeight: 600 }}>Regex A:</span>{' '}
                      <span style={{ color: 'var(--t1)' }}>{regexA}</span>
                    </td>
                    <td style={{ padding: '7px 12px', color: 'var(--y)' }}>
                      "{eqResult.counterexample?.displayString}"
                    </td>
                    <td style={{ padding: '7px 12px' }}>
                      {eqResult.counterexample?.acceptedByA ? (
                        <span style={{ color: 'var(--g)', fontWeight: 700 }}>✓ ACCEPT</span>
                      ) : (
                        <span style={{ color: 'var(--r)', fontWeight: 700 }}>✗ REJECT</span>
                      )}
                    </td>
                  </tr>
                  <tr style={{ background: 'var(--s0)' }}>
                    <td style={{ padding: '7px 12px' }}>
                      <span style={{ color: 'var(--b)', fontWeight: 600 }}>Regex B:</span>{' '}
                      <span style={{ color: 'var(--t1)' }}>{regexB}</span>
                    </td>
                    <td style={{ padding: '7px 12px', color: 'var(--y)' }}>
                      "{eqResult.counterexample?.displayString}"
                    </td>
                    <td style={{ padding: '7px 12px' }}>
                      {eqResult.counterexample?.acceptedByB ? (
                        <span style={{ color: 'var(--g)', fontWeight: 700 }}>✓ ACCEPT</span>
                      ) : (
                        <span style={{ color: 'var(--r)', fontWeight: 700 }}>✗ REJECT</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Counterexample Derivation Inspector (if not equivalent) */}
      {!isEq && eqResult.counterexample && (
        <CounterexampleInspector
          counterexample={eqResult.counterexample}
          regexA={regexA}
          regexB={regexB}
        />
      )}

      {/* Product Automaton Graph Panel */}
      <ProductGraphPanel
        productAutomaton={eqResult.productAutomaton}
        counterexampleNodeIds={eqResult.counterexampleNodeIds}
        counterexampleEdgeIds={eqResult.counterexampleEdgeIds}
      />

      {/* BFS Product Exploration Steps */}
      <EquivalenceSteps steps={eqResult.steps} />
    </div>
  );
};
