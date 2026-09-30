import React from 'react';
import { RegexInputCard } from './RegexInputCard';
import { DebugSection } from './DebugSection';
import type { ProcessedRegexResult } from '../automata/regex/types';
import { Play, RotateCcw, Sparkles, Layers, ArrowRight } from 'lucide-react';

interface PresetItem {
  title: string;
  desc: string;
  regexA: string;
  regexB: string;
}

const PRESETS: PresetItem[] = [
  {
    title: 'Non-Equivalent (Coursework Example)',
    desc: 'Counterexample will eventually be "ba"',
    regexA: '(a|b)*',
    regexB: 'a*b*',
  },
  {
    title: 'Star Identity (Equivalent)',
    desc: '(a|b)* is equivalent to (a*b*)*',
    regexA: '(a|b)*',
    regexB: '(a*b*)*',
  },
  {
    title: 'Concatenation & Star Pattern',
    desc: 'Strings ending with abb',
    regexA: '(a|b)*abb',
    regexB: '(a|b)*a(a|b)*',
  },
  {
    title: 'Distributive Law / Factoring',
    desc: 'Testing parentheses and branch unions',
    regexA: 'a(b|c)*',
    regexB: 'ab*|ac*',
  },
];

interface InputSectionProps {
  regexA: string;
  regexB: string;
  onChangeA: (val: string) => void;
  onChangeB: (val: string) => void;
  resultA: ProcessedRegexResult | null;
  resultB: ProcessedRegexResult | null;
  hasCompared: boolean;
  onCompare: () => void;
  onReset: () => void;
}

export const InputSection: React.FC<InputSectionProps> = ({
  regexA,
  regexB,
  onChangeA,
  onChangeB,
  resultA,
  resultB,
  hasCompared,
  onCompare,
  onReset,
}) => {
  const canCompare = regexA.trim().length > 0 && regexB.trim().length > 0;

  return (
    <div className="space-y-8">
      {/* Educational Presets Bar */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-3">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Quick Example Presets for Testing & Viva:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                onChangeA(preset.regexA);
                onChangeB(preset.regexB);
              }}
              className="text-left p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-indigo-500/40 transition group"
            >
              <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 flex items-center justify-between">
                <span>{preset.title}</span>
                <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 transition" />
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono truncate">
                A: {preset.regexA} | B: {preset.regexB}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Dual Regex Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RegexInputCard
          label="Regex A (Reference Expression)"
          name="regexA"
          value={regexA}
          onChange={onChangeA}
          result={resultA}
          placeholder="e.g. (a|b)*abb"
          accentColor="indigo"
        />

        <RegexInputCard
          label="Regex B (Candidate Expression)"
          name="regexB"
          value={regexB}
          onChange={onChangeB}
          result={resultB}
          placeholder="e.g. a*b*"
          accentColor="emerald"
        />
      </div>

      {/* Action Controls: Compare & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-y border-slate-800/80">
        <div className="flex items-center gap-2">
          <button
            onClick={onCompare}
            disabled={!canCompare}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg ${
              canCompare
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 active:scale-[0.98]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            Compare Expressions
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 border border-slate-800 transition"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
          <span>Supported Grammar:</span>
          <span className="text-slate-400 font-semibold">a-z, 0-9, |, *, (), implicit concat</span>
        </div>
      </div>

      {/* Area Reserved for Future Visualization and Equivalence Results */}
      <section className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-6 text-center space-y-4">
        <div className="max-w-md mx-auto space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-slate-900 text-indigo-400 border border-slate-800">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">
            Automata Visualization & Results Canvas
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Reserved area for interactive state-machine graphs (D3 / Cytoscape / Graphviz),
            state transition tables, and language equivalence verdicts.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-slate-400 font-mono">
            1. ε-NFA Graphs
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-slate-400 font-mono">
            2. Subset DFAs
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-slate-400 font-mono">
            3. Minimized DFAs
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-slate-400 font-mono">
            4. BFS Counterexample
          </div>
        </div>
      </section>

      {/* Development/Debug Section (Task 5 requirement) */}
      {hasCompared && (
        <DebugSection
          labelA="Regex A"
          resultA={resultA}
          labelB="Regex B"
          resultB={resultB}
        />
      )}
    </div>
  );
};
