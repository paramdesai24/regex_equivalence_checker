import React from 'react';
import { RegexInputRow } from '../components/RegexInputRow';
import { LexerInspector } from '../components/LexerInspector';
import type { ProcessedRegexResult } from '../automata/regex/types';

interface InputTabProps {
  regexA: string;
  regexB: string;
  onChangeA: (v: string) => void;
  onChangeB: (v: string) => void;
  resultA: ProcessedRegexResult | null;
  resultB: ProcessedRegexResult | null;
  hasCompared: boolean;
  onCompare: () => void;
  onReset: () => void;
  onGoToNFA: () => void;
}

const PRESETS = [
  { label: 'Star identity',        tag: 'equiv',  a: '(a|b)*',    b: '(a*b*)*'   },
  { label: 'Union commutativity',  tag: 'equiv',  a: 'a|b',       b: 'b|a'       },
  { label: 'Star order diff',      tag: 'cx: ba', a: '(a|b)*',    b: 'a*b*'      },
  { label: 'Empty-string diff',    tag: 'cx: ε',  a: 'a*',        b: 'aa*'       },
  { label: 'Suffix pattern diff',  tag: 'cx: abb',a: '(a|b)*abb', b: '(a|b)*ab'  },
];

export const InputTab: React.FC<InputTabProps> = ({
  regexA,
  regexB,
  onChangeA,
  onChangeB,
  resultA,
  resultB,
  hasCompared,
  onCompare,
  onReset,
  onGoToNFA,
}) => {
  const canCompare = regexA.trim().length > 0 && regexB.trim().length > 0;
  const bothValid  = resultA?.isValid && resultB?.isValid;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 760 }}>

      {/* Presets */}
      <section>
        <div
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'var(--t3)',
            marginBottom: 10,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Demonstration presets
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => { onChangeA(p.a); onChangeB(p.b); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border)',
                background: 'var(--s1)',
                cursor: 'pointer',
                transition: 'border-color 120ms, background 120ms',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-2)';
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--s2)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--s1)';
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--t1)' }}>{p.label}</span>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  color: p.tag.startsWith('equiv') ? 'var(--ok)' : 'var(--warn)',
                  padding: '1px 5px',
                  borderRadius: 3,
                  background: p.tag.startsWith('equiv')
                    ? 'color-mix(in srgb, var(--ok) 12%, transparent)'
                    : 'color-mix(in srgb, var(--warn) 12%, transparent)',
                }}
              >
                {p.tag}
              </span>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--t3)' }}>
                {p.a} / {p.b}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Regex inputs */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <RegexInputRow label="A" value={regexA} onChange={onChangeA} result={resultA} placeholder="e.g. (a|b)*abb" />
        <RegexInputRow label="B" value={regexB} onChange={onChangeB} result={resultB} placeholder="e.g. a*b*" />
      </section>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          paddingTop: 4,
          borderTop: '1px solid var(--border)',
        }}
      >
        <button
          id="compare-btn"
          onClick={onCompare}
          disabled={!canCompare}
          style={{
            padding: '7px 18px',
            borderRadius: 'var(--r-sm)',
            border: `1px solid ${canCompare ? 'var(--a)' : 'var(--border)'}`,
            background: canCompare ? 'color-mix(in srgb, var(--a) 15%, transparent)' : 'transparent',
            color: canCompare ? 'var(--a)' : 'var(--t3)',
            fontWeight: 600,
            fontSize: 12,
            cursor: canCompare ? 'pointer' : 'not-allowed',
            transition: 'background 120ms, border-color 120ms',
          }}
          onMouseEnter={e => {
            if (canCompare) (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--a) 22%, transparent)';
          }}
          onMouseLeave={e => {
            if (canCompare) (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--a) 15%, transparent)';
          }}
        >
          Compare →
        </button>

        {bothValid && hasCompared && (
          <button
            id="view-nfa-btn"
            onClick={onGoToNFA}
            style={{
              padding: '7px 16px',
              borderRadius: 'var(--r-sm)',
              border: '1px solid var(--border-2)',
              background: 'var(--s1)',
              color: 'var(--t1)',
              fontWeight: 500,
              fontSize: 12,
              cursor: 'pointer',
              transition: 'background 120ms, border-color 120ms',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--s2)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--s1)';
            }}
          >
            View ε-NFA →
          </button>
        )}

        <button
          id="reset-btn"
          onClick={onReset}
          style={{
            padding: '7px 12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--t3)',
            fontSize: 12,
            transition: 'color 120ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--t1)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--t3)')}
        >
          Reset
        </button>

        <span
          style={{
            marginLeft: 'auto',
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            color: 'var(--t3)',
          }}
        >
          a–z · 0–9 · | · * · ( )
        </span>
      </div>

      {/* Lexer details */}
      {hasCompared && (
        <LexerInspector
          labelA="A"
          resultA={resultA}
          labelB="B"
          resultB={resultB}
        />
      )}
    </div>
  );
};
