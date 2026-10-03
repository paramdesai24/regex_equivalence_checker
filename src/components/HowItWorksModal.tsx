import React, { useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PIPELINE_STEPS = [
  {
    num: 1,
    name: 'Regex Processing',
    algorithm: "Dijkstra's Shunting-Yard Algorithm",
    description:
      'Scans character-by-character, verifies parenthesization and operator placement, inserts explicit concatenation operators (e.g. ab → a·b), and translates infix to postfix Reverse Polish Notation.',
  },
  {
    num: 2,
    name: "Thompson's Construction",
    algorithm: 'Syntax-Directed ε-NFA Synthesis',
    description:
      "Processes postfix tokens in a single pass using an NFA fragment stack. Operands push two-state sub-automata; union, concat, and Kleene star operators pop fragments and compose them via ε-transitions in O(n) time.",
  },
  {
    num: 3,
    name: 'Subset Construction',
    algorithm: 'Powerset / ε-Closure Traversal',
    description:
      'Eliminates non-determinism by converting NFA subsets into single DFA states. Transitions are evaluated as ε-closure(move(S, a)). Missing transitions route to an explicit DEAD trap state.',
  },
  {
    num: 4,
    name: 'DFA Minimization',
    algorithm: 'Hopcroft Partition Refinement',
    description:
      'Prunes unreachable states, partitions reachable states into accepting and non-accepting blocks (P₀ = {F, Q \\ F}), and iteratively splits blocks on alphabet transitions until fixed-point convergence to yield the unique canonical minimal DFA.',
  },
  {
    num: 5,
    name: 'Product Automaton',
    algorithm: 'Symmetric Difference (L(A) △ L(B))',
    description:
      'Unifies alphabets (Σ = ΣA ∪ ΣB) and completes both DFAs. Lazily constructs reachable ordered pairs (sA, sB). A state is distinguishing iff exactly one component accepts: (sA ∈ FA) ⊕ (sB ∈ FB).',
  },
  {
    num: 6,
    name: 'Shortest Counterexample',
    algorithm: 'Breadth-First Search (BFS)',
    description:
      'Explores the product graph in order of increasing word length. The first distinguishing state reached produces the shortest counterexample string, with lexicographically sorted alphabet exploration ensuring deterministic tie-breaking.',
  },
];

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          background: 'var(--s0)',
          border: '1px solid var(--border-2)',
          borderRadius: 'var(--r-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px var(--border-2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--s1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--r-sm)',
                background: 'color-mix(in srgb, var(--a) 15%, transparent)',
                border: '1px solid color-mix(in srgb, var(--a) 30%, transparent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--a)',
              }}
            >
              <BookOpen size={15} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>
                Pipeline &amp; Formal Algorithms Overview
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--t3)' }}>
                Principles of Compiler Design — Six-stage automata equivalence verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 5,
              borderRadius: 'var(--r-sm)',
              background: 'transparent',
              border: '1px solid transparent',
              color: 'var(--t3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--t1)';
              e.currentTarget.style.background = 'var(--s2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--t3)';
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content list */}
        <div
          style={{
            padding: '16px 20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {PIPELINE_STEPS.map((s) => (
            <div
              key={s.num}
              style={{
                display: 'flex',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 'var(--r-md)',
                background: 'var(--s1)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 'var(--r-xs)',
                  background: 'color-mix(in srgb, var(--a) 15%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--a) 30%, transparent)',
                  color: 'var(--a)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {s.num}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--t1)' }}>{s.name}</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      padding: '1px 6px',
                      borderRadius: 'var(--r-xs)',
                      background: 'var(--s2)',
                      border: '1px solid var(--border-2)',
                      color: 'var(--t3)',
                    }}
                  >
                    {s.algorithm}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--t2)', lineHeight: 1.5 }}>
                  {s.description}
                </p>
              </div>
            </div>
          ))}

          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--r-md)',
              background: 'color-mix(in srgb, var(--a) 6%, var(--s1))',
              border: '1px solid color-mix(in srgb, var(--a) 25%, var(--border))',
              fontSize: 11,
              color: 'var(--t2)',
              lineHeight: 1.5,
              marginTop: 4,
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--t1)' }}>Equivalence Criterion: </span>
            Two regular expressions are equivalent if and only if their accepted languages are identical (L(R₁) = L(R₂)). This holds iff no string is accepted by the symmetric-difference product automaton (L(R₁) △ L(R₂) = ∅).
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '12px 20px',
            borderTop: '1px solid var(--border)',
            background: 'var(--s1)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '5px 14px',
              borderRadius: 'var(--r-sm)',
              background: 'var(--s2)',
              border: '1px solid var(--border-2)',
              color: 'var(--t1)',
              fontSize: 12,
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--s3)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--s2)')}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
