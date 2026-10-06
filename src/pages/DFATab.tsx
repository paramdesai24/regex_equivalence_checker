import React, { useMemo } from 'react';
import type { ProcessedRegexResult } from '../automata/regex/types';
import { buildNFA } from '../automata/nfa/thompson';
import { buildDFA } from '../automata/dfa/subset';
import { DFAPanel } from '../components/automata/DFAPanel';
import { Button } from '../components/ui/button';
import { ArrowRight } from 'lucide-react';

interface DFATabProps {
  resultA: ProcessedRegexResult | null;
  resultB: ProcessedRegexResult | null;
  regexA: string;
  regexB: string;
  onGoToInput: () => void;
  onGoToMinDFA?: () => void;
}

export const DFATab: React.FC<DFATabProps> = ({
  resultA,
  resultB,
  regexA,
  regexB,
  onGoToInput,
  onGoToMinDFA,
}) => {
  const dfaResultA = useMemo(() => {
    if (!resultA || !resultA.isValid || resultA.postfixTokens.length === 0) return null;
    try {
      const { nfa } = buildNFA(resultA.postfixTokens);
      return buildDFA(nfa);
    } catch {
      return null;
    }
  }, [resultA]);

  const dfaResultB = useMemo(() => {
    if (!resultB || !resultB.isValid || resultB.postfixTokens.length === 0) return null;
    try {
      const { nfa } = buildNFA(resultB.postfixTokens);
      return buildDFA(nfa);
    } catch {
      return null;
    }
  }, [resultB]);

  const hasNeither = !dfaResultA && !dfaResultB;

  if (hasNeither) {
    return (
      <div className="py-16 px-6 text-center border border-dashed border-border rounded-lg max-w-xl mx-auto space-y-3">
        <p className="ui-body text-muted-foreground">
          Enter valid regular expressions and run compare to inspect their Deterministic Finite Automata.
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
              DFA — Subset Construction (Powerset Algorithm)
            </h2>
            <span className="ui-meta font-mono">
              (Stage 3)
            </span>
          </div>
          <p className="ui-body-small">
            Determinized via ε-closure and transition operations. Missing transitions route to an explicit dead state.
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

          {onGoToMinDFA && (
            <Button
              variant="outline"
              size="default"
              onClick={onGoToMinDFA}
              className="gap-1.5 text-[13px] font-normal h-8"
            >
              <span>View Minimized DFA</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>

      {/* Side-by-side or stacked panels */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {dfaResultA ? (
          <DFAPanel
            label="Regex A"
            regexStr={regexA}
            dfa={dfaResultA.dfa}
            steps={dfaResultA.steps}
          />
        ) : (
          <div className="p-6 rounded-md border border-border bg-muted/20 text-center ui-body-small">
            {resultA && !resultA.isValid
              ? `Regex A syntax error: ${resultA.error?.message}`
              : 'Regex A: not entered.'}
          </div>
        )}

        {dfaResultB ? (
          <DFAPanel
            label="Regex B"
            regexStr={regexB}
            dfa={dfaResultB.dfa}
            steps={dfaResultB.steps}
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
