import React from 'react';
import type { ProcessedRegexResult } from '../automata/regex/types';

interface RegexInputRowProps {
  label: string;       // "A" | "B"
  value: string;
  onChange: (v: string) => void;
  result: ProcessedRegexResult | null;
  placeholder?: string;
}

export const RegexInputRow: React.FC<RegexInputRowProps> = ({
  label,
  value,
  onChange,
  result,
  placeholder = 'e.g. (a|b)*',
}) => {
  const isErr = result ? !result.isValid : false;
  const isOk  = result ? result.isValid : false;
  const accentColor = label === 'A' ? 'var(--a)' : 'var(--b)';
  const borderColor = isErr ? 'var(--err)' : isOk ? 'var(--border-2)' : 'var(--border)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Label badge */}
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--r-sm)',
            background: 'var(--s2)',
            border: `1px solid ${accentColor}40`,
            display: 'grid',
            placeItems: 'center',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: accentColor,
            flexShrink: 0,
          }}
        >
          {label}
        </span>

        {/* Input field */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 12px',
            height: 38,
            borderRadius: 'var(--r-sm)',
            border: `1px solid ${borderColor}`,
            background: 'var(--s1)',
            transition: 'border-color 150ms',
          }}
        >
          <input
            id={`regex-input-${label.toLowerCase()}`}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              color: 'var(--t1)',
              minWidth: 0,
            }}
          />
          {value && (
            <button
              aria-label="Clear"
              onClick={() => onChange('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--t3)',
                padding: '2px 4px',
                lineHeight: 1,
                fontSize: 14,
                borderRadius: 4,
                transition: 'color 120ms',
                flexShrink: 0,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--t2)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--t3)')}
            >
              ×
            </button>
          )}
        </div>

        {/* Validity pill */}
        {result && (
          <span
            style={{
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              padding: '2px 7px',
              borderRadius: 4,
              background: isOk ? 'color-mix(in srgb, var(--ok) 10%, transparent)' : 'color-mix(in srgb, var(--err) 10%, transparent)',
              border: `1px solid ${isOk ? 'color-mix(in srgb, var(--ok) 30%, transparent)' : 'color-mix(in srgb, var(--err) 30%, transparent)'}`,
              color: isOk ? 'var(--ok)' : 'var(--err)',
              flexShrink: 0,
              letterSpacing: '0.02em',
            }}
          >
            {isOk ? `${result.tokens.length} tok` : 'error'}
          </span>
        )}
      </div>

      {/* Error message */}
      {result?.error && (
        <div
          style={{
            marginLeft: 38,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--err)',
            lineHeight: 1.4,
          }}
        >
          {result.error.message}
          {value && (
            <div style={{ color: 'var(--t3)', marginTop: 2, whiteSpace: 'pre' }}>
              {value}
              {'\n'}
              <span style={{ color: 'var(--err)' }}>
                {' '.repeat(Math.min(result.error.position, value.length))}^
              </span>
            </div>
          )}
        </div>
      )}

      {/* Postfix summary */}
      {result?.isValid && (
        <div
          style={{
            marginLeft: 38,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px 16px',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'var(--t3)',
          }}
        >
          <span>explicit: <span style={{ color: 'var(--t2)' }}>{result.explicitConcatString}</span></span>
          <span>postfix: <span style={{ color: 'var(--t2)' }}>{result.postfixString}</span></span>
        </div>
      )}
    </div>
  );
};
