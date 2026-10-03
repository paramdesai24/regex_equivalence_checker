/**
 * Shared accordion section wrapper used by all collapsible table/steps components.
 */
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface AccordionSectionProps {
  title: string;
  badge?: string | number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  /** If true, the content area uses overflow-x-auto (for tables). */
  overflow?: boolean;
}

export const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  badge,
  expanded,
  onToggle,
  children,
  overflow = false,
}) => {
  return (
    <div style={{ borderTop: '1px solid var(--border)' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '9px 14px',
          background: 'var(--s1)',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 120ms',
          textAlign: 'left',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--s2)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--s1)')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
              color: 'var(--t2)',
            }}
          >
            {title}
          </span>
          {badge !== undefined && (
            <span
              style={{
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                padding: '1px 5px',
                borderRadius: 4,
                background: 'var(--s3)',
                color: 'var(--t3)',
              }}
            >
              {badge}
            </span>
          )}
        </div>
        {expanded
          ? <ChevronDown size={13} style={{ color: 'var(--t3)', flexShrink: 0 }} />
          : <ChevronRight size={13} style={{ color: 'var(--t3)', flexShrink: 0 }} />
        }
      </button>

      <div className={`accordion-body${expanded ? ' open' : ''}`}>
        <div className="accordion-inner">
          <div
            style={{
              overflowX: overflow ? 'auto' : undefined,
              overflowY: 'auto',
              maxHeight: 240,
              background: 'var(--bg)',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
