import React, { useState } from 'react';
import type { ProcessedRegexResult, Token } from '../automata/regex/types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface LexerInspectorProps {
  labelA: string;
  resultA: ProcessedRegexResult | null;
  labelB: string;
  resultB: ProcessedRegexResult | null;
}

function tokenColor(t: Token): string {
  if (t.type === 'LITERAL')      return 'var(--a)';
  if (t.type === 'UNION')        return '#C084FC';
  if (t.type === 'STAR')         return 'var(--warn)';
  if (t.type === 'CONCAT')       return 'var(--b)';
  return 'var(--t2)';
}

function RegexLexerCard({
  label,
  result,
  accent,
}: {
  label: string;
  result: ProcessedRegexResult | null;
  accent: string;
}) {
  if (!result) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--t3)' }}>
        <span style={{ color: accent, fontWeight: 600 }}>{label}:</span>{' '}
        <span style={{ color: 'var(--t1)' }}>{result.raw}</span>
        {result.isValid
          ? <span style={{ marginLeft: 8, color: 'var(--ok)', fontSize: 10 }}>valid</span>
          : <span style={{ marginLeft: 8, color: 'var(--err)', fontSize: 10 }}>invalid</span>
        }
      </div>

      {result.isValid && (
        <>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', display: 'flex', gap: 8, alignItems: 'baseline' }}>
            <span style={{ color: 'var(--t3)', flexShrink: 0 }}>explicit:</span>
            <span style={{ color: 'var(--warn)' }}>{result.explicitConcatString}</span>
          </div>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', display: 'flex', gap: 8, alignItems: 'baseline' }}>
            <span style={{ color: 'var(--t3)', flexShrink: 0 }}>postfix:</span>
            <span style={{ color: 'var(--ok)' }}>{result.postfixString}</span>
          </div>
          <div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--t3)', marginBottom: 6 }}>
              tokens ({result.tokens.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {result.tokens.map((t: Token, i) => (
                <span
                  key={i}
                  title={`${t.type} @ ${t.position}`}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: tokenColor(t),
                    padding: '1px 5px',
                    borderRadius: 4,
                    background: `${tokenColor(t)}18`,
                    border: `1px solid ${tokenColor(t)}30`,
                  }}
                >
                  {t.value}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export const LexerInspector: React.FC<LexerInspectorProps> = ({ labelA, resultA, labelB, resultB }) => {
  const [open, setOpen] = useState(false);

  if (!resultA && !resultB) return null;

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-sm)',
        overflow: 'hidden',
      }}
    >
      <button
        id="lexer-inspector-toggle"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '9px 14px',
          background: 'var(--s1)',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--t2)',
          fontSize: 12,
          fontWeight: 500,
          transition: 'background 120ms',
          textAlign: 'left',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--s2)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--s1)')}
      >
        <span>Regex Processing Details — Tokens · Explicit Concat · Postfix</span>
        {open
          ? <ChevronDown size={14} style={{ color: 'var(--t3)', flexShrink: 0 }} />
          : <ChevronRight size={14} style={{ color: 'var(--t3)', flexShrink: 0 }} />
        }
      </button>

      <div className={`accordion-body${open ? ' open' : ''}`}>
        <div className="accordion-inner">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
              padding: 16,
              background: 'var(--bg)',
              borderTop: '1px solid var(--border)',
            }}
          >
            <RegexLexerCard label={labelA} result={resultA} accent="var(--a)" />
            <RegexLexerCard label={labelB} result={resultB} accent="var(--b)" />
          </div>
        </div>
      </div>
    </div>
  );
};
