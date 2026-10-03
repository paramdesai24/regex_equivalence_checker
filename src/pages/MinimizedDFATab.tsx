import React, { useMemo } from 'react';
import type { ProcessedRegexResult } from '../automata/regex/types';
import { buildNFA } from '../automata/nfa/thompson';
import { buildDFA } from '../automata/dfa/subset';
import { minimizeDFA } from '../automata/minimization/minimize';
import { MinimizedDFAPanel } from '../components/automata/MinimizedDFAPanel';

interface MinimizedDFATabProps {
  resultA: ProcessedRegexResult | null;
  resultB: ProcessedRegexResult | null;
  regexA: string;
  regexB: string;
  onGoToInput: () => void;
  onGoToEquivalence?: () => void;
}

export const MinimizedDFATab: React.FC<MinimizedDFATabProps> = ({
  resultA,
  resultB,
  regexA,
  regexB,
  onGoToInput,
  onGoToEquivalence,
}) => {
  const minResultA = useMemo(() => {
    if (!resultA || !resultA.isValid || resultA.postfixTokens.length === 0) return null;
    try {
      const { nfa } = buildNFA(resultA.postfixTokens);
      const { dfa } = buildDFA(nfa);
      return minimizeDFA(dfa);
    } catch {
      return null;
    }
  }, [resultA]);

  const minResultB = useMemo(() => {
    if (!resultB || !resultB.isValid || resultB.postfixTokens.length === 0) return null;
    try {
      const { nfa } = buildNFA(resultB.postfixTokens);
      const { dfa } = buildDFA(nfa);
      return minimizeDFA(dfa);
    } catch {
      return null;
    }
  }, [resultB]);

  const hasNeither = !minResultA && !minResultB;

  if (hasNeither) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500 text-sm">
          Enter valid regular expressions in the{' '}
          <button
            onClick={onGoToInput}
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition"
          >
            Input tab
          </button>{' '}
          to inspect their Minimized Deterministic Finite Automata.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Section header */}
      <div className="border-b border-slate-800 pb-3 mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">
            Minimized DFA — Hopcroft Partition Refinement
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Equivalent states are merged via iterative partition refinement into the unique minimal canonical DFA.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600">
          <span>Double = accept · Indigo = start</span>
          {onGoToEquivalence && (
            <button
              onClick={onGoToEquivalence}
              className="px-2.5 py-1 text-xs font-sans rounded border border-indigo-800 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/60 transition"
            >
              Check Equivalence →
            </button>
          )}
        </div>
      </div>

      {/* Two panels: side-by-side on wide screens */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {minResultA ? (
          <MinimizedDFAPanel
            label="Regex A"
            regexStr={regexA}
            minResult={minResultA}
            accent="indigo"
          />
        ) : (
          <div className="border border-slate-800 rounded p-6 text-center text-xs text-slate-500">
            {resultA && !resultA.isValid
              ? `Regex A has a syntax error: ${resultA.error?.message}`
              : 'Regex A: not entered.'}
          </div>
        )}

        {minResultB ? (
          <MinimizedDFAPanel
            label="Regex B"
            regexStr={regexB}
            minResult={minResultB}
            accent="teal"
          />
        ) : (
          <div className="border border-slate-800 rounded p-6 text-center text-xs text-slate-500">
            {resultB && !resultB.isValid
              ? `Regex B has a syntax error: ${resultB.error?.message}`
              : 'Regex B: not entered.'}
          </div>
        )}
      </div>
    </div>
  );
};
