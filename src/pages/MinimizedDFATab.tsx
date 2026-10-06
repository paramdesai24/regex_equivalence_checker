import React, { useMemo } from 'react';
import type { ProcessedRegexResult } from '../automata/regex/types';
import { buildNFA } from '../automata/nfa/thompson';
import { buildDFA } from '../automata/dfa/subset';
import { minimizeDFA } from '../automata/minimization/minimize';
import { MinimizedDFAPanel } from '../components/automata/MinimizedDFAPanel';
import { Button } from '../components/ui/button';
import { ArrowRight } from 'lucide-react';

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
      <div className="py-16 px-6 text-center border border-dashed border-border rounded-lg max-w-xl mx-auto space-y-3">
        <p className="ui-body text-muted-foreground">
          Enter valid regular expressions and run compare to inspect their Minimized DFAs.
        </p>
        <Button variant="outline" size="default" onClick={onGoToInput} className="gap-1.5 text-[13px] font-medium h-8.5">
          <span>Go to Input tab</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="section-title">
              Minimized DFA — Hopcroft Partition Refinement
            </h2>
            <span className="ui-meta font-mono">
              (Stage 4)
            </span>
          </div>
          <p className="ui-body-small">
            Indistinguishable states merged via partition refinement into the unique canonical minimal DFA.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 ui-meta font-mono">
            <span className="inline-flex items-center gap-1.5">
              <span className="font-semibold text-foreground">→</span> Start
            </span>
            <span className="text-border">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-foreground inline-block shadow-[0_0_0_1.5px_#fff,0_0_0_2.5px_#18181b]" />
              Accept
            </span>
          </div>

          {onGoToEquivalence && (
            <Button
              variant="outline"
              size="default"
              onClick={onGoToEquivalence}
              className="gap-1.5 text-[13px] font-normal h-8"
            >
              <span>Check Equivalence</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>

      {/* Side-by-side or stacked panels */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {minResultA ? (
          <MinimizedDFAPanel
            label="Regex A"
            regexStr={regexA}
            minResult={minResultA}
          />
        ) : (
          <div className="p-6 rounded-md border border-border bg-muted/20 text-center ui-body-small">
            {resultA && !resultA.isValid
              ? `Regex A syntax error: ${resultA.error?.message}`
              : 'Regex A: not entered.'}
          </div>
        )}

        {minResultB ? (
          <MinimizedDFAPanel
            label="Regex B"
            regexStr={regexB}
            minResult={minResultB}
          />
        ) : (
          <div className="p-6 rounded-md border border-border bg-muted/20 text-center ui-body-small">
            {resultB && !resultB.isValid
              ? `Regex B syntax error: ${resultB.error?.message}`
              : 'Regex B: not entered.'}
          </div>
        )}
      </div>
    </div>
  );
};
