import React from 'react';
import type { CounterexampleVerification } from '../../automata/equivalence/types';
import { AccordionSection } from './AccordionSection';
import { useState } from 'react';

interface CounterexampleInspectorProps {
  counterexample: CounterexampleVerification;
  regexA: string;
  regexB: string;
}

function AcceptancePill({ accepted, label, regex }: { accepted: boolean; label: string; regex: string }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 'var(--r-sm)',
        border: `1px solid ${accepted ? 'color-mix(in srgb, var(--ok) 30%, transparent)' : 'color-mix(in srgb, var(--err) 30%, transparent)'}`,
        background: accepted ? 'color-mix(in srgb, var(--ok) 8%, transparent)' : 'color-mix(in srgb, var(--err) 8%, transparent)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        minWidth: 0,
      }}
    >
      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--t3)' }}>
        Regex <span style={{ color: label === 'A' ? 'var(--a)' : 'var(--b)', fontWeight: 700 }}>{label}</span>:{' '}
        <span style={{ color: 'var(--t1)' }}>{regex}</span>
      </span>
      <span
        style={{
          fontSize: 12,
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          color: accepted ? 'var(--ok)' : 'var(--err)',
        }}
      >
        {accepted ? '✓ ACCEPTS' : '✗ REJECTS'}
      </span>
    </div>
  );
}

export const CounterexampleInspector: React.FC<CounterexampleInspectorProps> = ({
  counterexample,
  regexA,
  regexB,
}) => {
  const [open, setOpen] = useState(true);
  const isEpsilon = counterexample.rawString === '';

  return (
    <AccordionSection
      title={`Counterexample Derivation Path  w = "${counterexample.displayString}"`}
      expanded={open}
      onToggle={() => setOpen(o => !o)}
      overflow
    >
      <div style={{ padding: 14, background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Accept/Reject pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
          <AcceptancePill accepted={counterexample.acceptedByA} label="A" regex={regexA} />
          <AcceptancePill accepted={counterexample.acceptedByB} label="B" regex={regexB} />
        </div>

        {isEpsilon ? (
          <div
            style={{
              padding: 12,
              borderRadius: 'var(--r-sm)',
              border: '1px solid var(--border)',
              background: 'var(--s1)',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              color: 'var(--t2)',
              lineHeight: 1.5,
            }}
          >
            <span style={{ color: 'var(--warn)', fontWeight: 600 }}>Immediate ε-difference:</span> The initial product state
            is already distinguishing on the empty string <span style={{ color: 'var(--t1)' }}>ε</span>. One automaton
            accepts ε while the other rejects it.
          </div>
        ) : (
          <div style={{ borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              <thead>
                <tr style={{ background: 'var(--s2)', borderBottom: '1px solid var(--border)' }}>
                  {['Step', 'Symbol', 'Product State', 'DFA A', 'DFA B'].map(h => (
                    <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--t3)', fontSize: 10, letterSpacing: '0.04em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Start row */}
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                  <td style={{ padding: '6px 12px', color: 'var(--t3)' }}>0</td>
                  <td style={{ padding: '6px 12px', color: 'var(--t3)' }}>—</td>
                  <td style={{ padding: '6px 12px', color: 'var(--a)', fontWeight: 600 }}>
                    ({counterexample.derivationPath[0]?.fromPair[0]}, {counterexample.derivationPath[0]?.fromPair[1]})
                  </td>
                  <td style={{ padding: '6px 12px', color: 'var(--t3)' }}>Start</td>
                  <td style={{ padding: '6px 12px', color: 'var(--t3)' }}>Start</td>
                </tr>

                {counterexample.derivationPath.map((step, idx) => {
                  const isLast = idx === counterexample.derivationPath.length - 1;
                  return (
                    <tr
                      key={step.stepNumber}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: isLast ? 'color-mix(in srgb, var(--err) 6%, var(--bg))' : idx % 2 === 0 ? 'var(--bg)' : 'var(--s1)',
                      }}
                    >
                      <td style={{ padding: '6px 12px', color: 'var(--t3)' }}>{step.stepNumber}</td>
                      <td style={{ padding: '6px 12px', color: 'var(--warn)', fontWeight: 700 }}>'{step.symbol}'</td>
                      <td style={{ padding: '6px 12px' }}>
                        <span style={{ color: isLast ? 'var(--err)' : 'var(--t1)', fontWeight: isLast ? 700 : 400 }}>
                          ({step.toPair[0]}, {step.toPair[1]})
                        </span>
                        {isLast && (
                          <span
                            style={{
                              marginLeft: 6,
                              fontSize: 9,
                              padding: '1px 5px',
                              borderRadius: 3,
                              background: 'color-mix(in srgb, var(--err) 15%, transparent)',
                              color: 'var(--err)',
                              border: '1px solid color-mix(in srgb, var(--err) 35%, transparent)',
                              fontWeight: 700,
                            }}
                          >
                            DIST
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '6px 12px', color: 'var(--t3)' }}>
                        {step.stateAFrom} –{step.symbol}→ {step.stateATo}
                      </td>
                      <td style={{ padding: '6px 12px', color: 'var(--t3)' }}>
                        {step.stateBFrom} –{step.symbol}→ {step.stateBTo}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AccordionSection>
  );
};
