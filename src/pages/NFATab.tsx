import React, { useMemo } from 'react';
import type { ProcessedRegexResult } from '../automata/regex/types';
import { buildNFA } from '../automata/nfa/thompson';
import { NFAPanel } from '../components/automata/NFAPanel';

interface NFATabProps {
  resultA: ProcessedRegexResult | null;
  resultB: ProcessedRegexResult | null;
  regexA: string;
  regexB: string;
  onGoToInput: () => void;
}

export const NFATab: React.FC<NFATabProps> = ({ resultA, resultB, regexA, regexB, onGoToInput }) => {
  const buildResult = (result: ProcessedRegexResult | null) => {
    if (!result || !result.isValid || result.postfixTokens.length === 0) return null;
    try {
      return buildNFA(result.postfixTokens);
    } catch {
      return null;
    }
  };

  const nfaResultA = useMemo(() => buildResult(resultA), [resultA]);
  const nfaResultB = useMemo(() => buildResult(resultB), [resultB]);

  const hasNeither = !nfaResultA && !nfaResultB;

  if (hasNeither) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500 text-sm">
          Enter valid regular expressions in the{' '}
          <button onClick={onGoToInput} className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition">
            Input tab
          </button>{' '}
          to inspect their ε-NFAs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Section header */}
      <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">ε-NFA — Thompson's Construction</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Each NFA is built independently from its postfix token stream. ε denotes epsilon-transitions.
          </p>
        </div>
        <div className="text-[11px] font-mono text-slate-600">
          Double circle = accept state · Indigo border = start state
        </div>
      </div>

      {/* Two panels: side-by-side on wide screens */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {nfaResultA ? (
          <NFAPanel
            label="Regex A"
            regexStr={regexA}
            nfa={nfaResultA.nfa}
            steps={nfaResultA.steps}
            accent="indigo"
          />
        ) : (
          <div className="border border-slate-800 rounded p-6 text-center text-xs text-slate-500">
            {resultA && !resultA.isValid
              ? `Regex A has a syntax error: ${resultA.error?.message}`
              : 'Regex A: not entered.'}
          </div>
        )}

        {nfaResultB ? (
          <NFAPanel
            label="Regex B"
            regexStr={regexB}
            nfa={nfaResultB.nfa}
            steps={nfaResultB.steps}
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
