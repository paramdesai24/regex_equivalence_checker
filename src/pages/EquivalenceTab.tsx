import React, { useMemo } from 'react';
import type { ProcessedRegexResult } from '../automata/regex/types';
import { buildNFA } from '../automata/nfa/thompson';
import { buildDFA } from '../automata/dfa/subset';
import { minimizeDFA } from '../automata/minimization/minimize';
import { checkEquivalence } from '../automata/equivalence/equivalence';
import { CounterexampleInspector } from '../components/automata/CounterexampleInspector';
import { ProductGraphPanel } from '../components/automata/ProductGraphPanel';
import { EquivalenceSteps } from '../components/automata/EquivalenceSteps';

interface EquivalenceTabProps {
  resultA: ProcessedRegexResult | null;
  resultB: ProcessedRegexResult | null;
  regexA: string;
  regexB: string;
  hasCompared?: boolean;
  onGoToInput: () => void;
}

export const EquivalenceTab: React.FC<EquivalenceTabProps> = ({
  resultA,
  resultB,
  regexA,
  regexB,
  hasCompared = true,
  onGoToInput,
}) => {
  const minDfaA = useMemo(() => {
    if (!hasCompared || !resultA || !resultA.isValid || resultA.postfixTokens.length === 0) return null;
    try {
      const { nfa } = buildNFA(resultA.postfixTokens);
      const { dfa } = buildDFA(nfa);
      return minimizeDFA(dfa).minimizedDfa;
    } catch {
      return null;
    }
  }, [resultA, hasCompared]);

  const minDfaB = useMemo(() => {
    if (!hasCompared || !resultB || !resultB.isValid || resultB.postfixTokens.length === 0) return null;
    try {
      const { nfa } = buildNFA(resultB.postfixTokens);
      const { dfa } = buildDFA(nfa);
      return minimizeDFA(dfa).minimizedDfa;
    } catch {
      return null;
    }
  }, [resultB, hasCompared]);

  const eqResult = useMemo(() => {
    if (!minDfaA || !minDfaB) return null;
    try {
      return checkEquivalence(minDfaA, minDfaB);
    } catch {
      return null;
    }
  }, [minDfaA, minDfaB]);

  if (!hasCompared) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500 text-sm">
          Regular expressions have been modified or not yet compared. Return to the{' '}
          <button
            onClick={onGoToInput}
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition"
          >
            Input tab
          </button>{' '}
          and click <span className="text-slate-300 font-mono text-xs">Compare →</span> to run equivalence checking.
        </p>
      </div>
    );
  }

  if (!minDfaA || !minDfaB || !eqResult) {
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
          to verify language equivalence.
        </p>
      </div>
    );
  }

  const isEq = eqResult.equivalent;

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Section Header */}
      <div className="border-b border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">
            Language Equivalence & Counterexample Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified via Product Automaton (Symmetric Difference) and Breadth-First Search reachability.
          </p>
        </div>
        <div className="text-[11px] font-mono text-slate-600">
          Σ = {'{'}{eqResult.combinedAlphabet.join(', ')}{'}'} · {eqResult.visitedProductStates} product states checked
        </div>
      </div>

      {/* Prominent Technical Result Banner */}
      <div
        className={`border rounded p-4 ${
          isEq
            ? 'bg-emerald-950/20 border-emerald-800/80 text-emerald-200'
            : 'bg-rose-950/20 border-rose-800/80 text-rose-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wide border ${
                isEq
                  ? 'bg-emerald-900/60 border-emerald-700 text-emerald-300'
                  : 'bg-rose-900/60 border-rose-700 text-rose-300'
              }`}
            >
              {isEq ? '✓ Equivalent' : '✗ Not Equivalent'}
            </span>
            <span className="font-mono text-sm font-bold">
              {isEq ? 'L(Regex A) = L(Regex B)' : 'L(Regex A) ≠ L(Regex B)'}
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Algorithm: Product Automaton + BFS
          </div>
        </div>

        {isEq ? (
          <p className="text-xs text-emerald-300/90 leading-relaxed font-mono">
            No distinguishing string exists. Both regular expressions accept the exact same formal language over the combined alphabet Σ = {'{'}{eqResult.combinedAlphabet.join(', ')}{'}'}. No symmetric-difference accepting state was reachable in the product automaton.
          </p>
        ) : (
          <div className="space-y-3 font-mono">
            <p className="text-xs text-rose-300/90 leading-relaxed">
              The languages differ. A shortest distinguishing string was discovered by Breadth-First Search on the symmetric difference product automaton:
            </p>

            {/* Counterexample Callout */}
            <div className="flex flex-wrap items-center gap-3 p-2.5 rounded bg-slate-950 border border-rose-900/60">
              <span className="text-xs text-slate-400">Shortest Distinguishing String:</span>
              <span className="text-sm font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800">
                "{eqResult.counterexample?.displayString}"
              </span>
              <span className="text-[11px] text-slate-500 ml-auto">
                (length: {eqResult.counterexample?.rawString.length ?? 0})
              </span>
            </div>

            {/* Concrete Acceptance Comparison Table */}
            <div className="border border-slate-800 rounded overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <th className="px-3 py-1.5 font-semibold">Expression</th>
                    <th className="px-3 py-1.5 font-semibold">Input String</th>
                    <th className="px-3 py-1.5 font-semibold">Language Acceptance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  <tr className="bg-slate-950">
                    <td className="px-3 py-1.5 text-indigo-300 font-semibold">
                      Regex A: <span className="text-slate-200">{regexA}</span>
                    </td>
                    <td className="px-3 py-1.5 text-amber-300">"{eqResult.counterexample?.displayString}"</td>
                    <td className="px-3 py-1.5">
                      {eqResult.counterexample?.acceptedByA ? (
                        <span className="text-emerald-400 font-bold">✓ ACCEPT</span>
                      ) : (
                        <span className="text-rose-400 font-bold">✗ REJECT</span>
                      )}
                    </td>
                  </tr>
                  <tr className="bg-slate-950">
                    <td className="px-3 py-1.5 text-teal-300 font-semibold">
                      Regex B: <span className="text-slate-200">{regexB}</span>
                    </td>
                    <td className="px-3 py-1.5 text-amber-300">"{eqResult.counterexample?.displayString}"</td>
                    <td className="px-3 py-1.5">
                      {eqResult.counterexample?.acceptedByB ? (
                        <span className="text-emerald-400 font-bold">✓ ACCEPT</span>
                      ) : (
                        <span className="text-rose-400 font-bold">✗ REJECT</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Counterexample Derivation Inspector (if not equivalent) */}
      {!isEq && eqResult.counterexample && (
        <CounterexampleInspector
          counterexample={eqResult.counterexample}
          regexA={regexA}
          regexB={regexB}
        />
      )}

      {/* Product Automaton Graph Panel */}
      <ProductGraphPanel
        productAutomaton={eqResult.productAutomaton}
        counterexampleNodeIds={eqResult.counterexampleNodeIds}
        counterexampleEdgeIds={eqResult.counterexampleEdgeIds}
      />

      {/* BFS Product Exploration Steps */}
      <EquivalenceSteps steps={eqResult.steps} />
    </div>
  );
};
