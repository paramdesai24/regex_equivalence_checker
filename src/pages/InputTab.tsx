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
  { label: 'Non-equiv', a: '(a|b)*', b: 'a*b*' },
  { label: 'Star identity', a: '(a|b)*', b: '(a*b*)*' },
  { label: 'Suffix pattern', a: '(a|b)*abb', b: '(a|b)*a(a|b)*' },
  { label: 'Factoring', a: 'a(b|c)*', b: 'ab*|ac*' },
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
  const bothValid = resultA?.isValid && resultB?.isValid;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Presets */}
      <div>
        <div className="text-[11px] text-slate-600 mb-2 font-mono">presets:</div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => { onChangeA(p.a); onChangeB(p.b); }}
              className="text-[11px] font-mono px-2.5 py-1 border border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200 rounded transition"
            >
              {p.label} <span className="text-slate-600">({p.a} / {p.b})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-3">
        <RegexInputRow
          label="A"
          value={regexA}
          onChange={onChangeA}
          result={resultA}
          placeholder="e.g. (a|b)*abb"
        />
        <RegexInputRow
          label="B"
          value={regexB}
          onChange={onChangeB}
          result={resultB}
          placeholder="e.g. a*b*"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1 border-t border-slate-900">
        <button
          onClick={onCompare}
          disabled={!canCompare}
          className={`px-4 py-1.5 text-xs font-medium rounded border transition ${
            canCompare
              ? 'border-indigo-700 bg-indigo-900/40 text-indigo-300 hover:bg-indigo-800/50'
              : 'border-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          Compare
        </button>

        {bothValid && hasCompared && (
          <button
            onClick={onGoToNFA}
            className="px-4 py-1.5 text-xs font-medium rounded border border-teal-800 bg-teal-900/30 text-teal-300 hover:bg-teal-800/40 transition"
          >
            View ε-NFA →
          </button>
        )}

        <button
          onClick={onReset}
          className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
        >
          Reset
        </button>

        <span className="text-[10px] font-mono text-slate-700 ml-auto">
          a–z, 0–9, |, *, ( )
        </span>
      </div>

      {/* Lexer inspector — collapsed by default */}
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
