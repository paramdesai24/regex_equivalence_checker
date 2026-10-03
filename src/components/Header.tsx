import React from 'react';

interface HeaderProps {
  onOpenHowItWorks?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHowItWorks }) => {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        padding: '0 24px',
        height: 52,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Left: wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Logo mark */}
          <div
            aria-hidden
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'var(--a)',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="white" strokeWidth="1.5" />
              <path d="M3 9 L9 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--t1)',
              letterSpacing: '-0.01em',
              margin: 0,
              lineHeight: 1,
            }}
          >
            Regex Equivalence Checker
          </h1>

          <span
            style={{
              display: 'none',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: 'var(--t3)',
              paddingLeft: 10,
              borderLeft: '1px solid var(--border)',
            }}
            className="md-show"
          >
            Principles of Compiler Design
          </span>
        </div>

        {/* Right: pipeline crumb + help */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: 'var(--t3)',
              letterSpacing: '0.02em',
            }}
            aria-hidden
          >
            Lexer → Postfix → ε-NFA → DFA → Min-DFA → Equivalence
          </span>

          {onOpenHowItWorks && (
            <button
              id="how-it-works-btn"
              onClick={onOpenHowItWorks}
              style={{
                fontSize: 12,
                fontWeight: 500,
                padding: '4px 10px',
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--t2)',
                cursor: 'pointer',
                transition: 'color 120ms, border-color 120ms, background 120ms',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--t1)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-2)';
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--s2)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--t2)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              How It Works
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
