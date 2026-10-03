import React from 'react';
import { X } from 'lucide-react';

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
      'Scans character-by-character, verifies parenthesization and operator placement, inserts explicit concatenation operators (e.g. ab → a.b), and translates infix to postfix Reverse Polish Notation.',
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
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Pipeline &amp; Formal Algorithms Overview
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Principles of Compiler Design — Six-stage automata equivalence verification
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
          {PIPELINE_STEPS.map((s) => (
            <div
              key={s.num}
              className="p-3 border border-slate-800/80 rounded bg-slate-950/50 flex gap-3 text-xs"
            >
              <div className="w-5 h-5 rounded border border-indigo-800 bg-indigo-950/50 text-indigo-300 font-mono flex items-center justify-center text-[10px] shrink-0 font-semibold">
                {s.num}
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-200">{s.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">
                    {s.algorithm}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}

          <div className="p-3 rounded border border-slate-800 bg-slate-900/50 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Equivalence Criterion: </span>
            Two regular expressions are equivalent if and only if their accepted languages are identical (L(R₁) = L(R₂)). This holds iff no string is accepted by the symmetric-difference product automaton (L(R₁) △ L(R₂) = ∅).
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs rounded border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
