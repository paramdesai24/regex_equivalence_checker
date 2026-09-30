import React from 'react';
import type { PipelineStage } from '../types/pipeline';

interface PlaceholderTabProps {
  stage: PipelineStage;
  onGoToInput: () => void;
}

const META: Record<string, { title: string; next: string; desc: string }> = {
  dfa: {
    title: 'DFA — Subset Construction',
    next: 'Stage 3',
    desc: 'Converts the ε-NFA to a DFA using ε-closure and the subset (powerset) construction algorithm.',
  },
  'min-dfa': {
    title: 'Minimized DFA — Hopcroft / Table-Filling',
    next: 'Stage 4',
    desc: 'Partitions DFA states by distinguishability and merges equivalent states into the canonical minimal DFA.',
  },
  equivalence: {
    title: 'Language Equivalence — Product Automaton + BFS',
    next: 'Stage 5',
    desc: 'Checks L(A) = L(B) by running a symmetric-difference product automaton. If not equivalent, BFS finds the shortest distinguishing string.',
  },
};

export const PlaceholderTab: React.FC<PlaceholderTabProps> = ({ stage, onGoToInput }) => {
  const m = META[stage] ?? { title: stage, next: '?', desc: '' };
  return (
    <div className="py-16 max-w-lg">
      <p className="text-xs font-mono text-slate-600 mb-2">{m.next} — not implemented yet</p>
      <h2 className="text-sm font-semibold text-slate-300 mb-3">{m.title}</h2>
      <p className="text-xs text-slate-500 leading-relaxed mb-6">{m.desc}</p>
      <button
        onClick={onGoToInput}
        className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition"
      >
        ← Return to Input
      </button>
    </div>
  );
};
