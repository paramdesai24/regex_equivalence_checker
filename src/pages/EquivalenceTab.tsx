import React, { useMemo } from 'react';
import type { ProcessedRegexResult } from '../automata/regex/types';
import { buildNFA } from '../automata/nfa/thompson';
import { buildDFA } from '../automata/dfa/subset';
import { minimizeDFA } from '../automata/minimization/minimize';
import { checkEquivalence } from '../automata/equivalence/equivalence';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../components/ui/table';
import { Check, X, ArrowRight } from 'lucide-react';

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
      <div className="py-16 px-6 text-center border border-dashed border-border rounded-lg max-w-xl mx-auto space-y-3">
        <p className="ui-body text-muted-foreground">
          Regular expressions have been modified or not yet compared.
        </p>
        <Button variant="outline" size="default" onClick={onGoToInput} className="gap-1.5 text-[13px] font-medium h-8.5">
          <span>Return to Input and compare</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  }

  if (!minDfaA || !minDfaB || !eqResult) {
    return (
      <div className="py-16 px-6 text-center border border-dashed border-border rounded-lg max-w-xl mx-auto space-y-3">
        <p className="ui-body text-muted-foreground">
          Enter valid regular expressions in the Input tab to verify language equivalence.
        </p>
        <Button variant="outline" size="default" onClick={onGoToInput} className="gap-1.5 text-[13px] font-medium h-8.5">
          <span>Go to Input tab</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  }

  const isEq = eqResult.equivalent;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="section-title">
              Language Equivalence &amp; Counterexample Analysis
            </h2>
            <span className="ui-meta font-mono">
              (Stage 5)
            </span>
          </div>
          <p className="ui-body-small">
            Verified via Symmetric Difference Product Automaton (L(A) △ L(B)) and BFS reachability.
          </p>
        </div>

        <div className="flex items-center gap-3 ui-meta font-mono">
          <span>Σ = {'{'}{eqResult.combinedAlphabet.join(', ')}{'}'}</span>
          <span className="text-border">·</span>
          <span>{eqResult.visitedProductStates} product states explored</span>
        </div>
      </div>

      {/* Prominent Technical Verdict Banner */}
      <div
        className={`rounded-md border p-4 space-y-3 ${
          isEq
            ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20'
            : 'border-red-200 bg-red-50/40 dark:border-red-900/50 dark:bg-red-950/20'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Badge
              variant={isEq ? 'success' : 'destructive'}
              className="text-xs font-medium h-6 px-2.5 gap-1.5"
            >
              {isEq ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              <span>{isEq ? 'Equivalent' : 'Not equivalent'}</span>
            </Badge>

            <span className="result-verdict">
              {isEq ? 'L(Regex A) = L(Regex B)' : 'L(Regex A) ≠ L(Regex B)'}
            </span>
          </div>

          <span className="ui-meta font-mono">
            Algorithm: Product Automaton + BFS
          </span>
        </div>

        {isEq ? (
          <p className="ui-body-small text-foreground/80">
            No distinguishing string exists. Both expressions define the same formal language over the combined alphabet{' '}
            <code className="code-text font-medium text-foreground">
              Σ = {'{'}{eqResult.combinedAlphabet.join(', ')}{'}'}
            </code>
            . No symmetric-difference state was reachable in the product automaton ({eqResult.visitedProductStates} product states explored).
          </p>
        ) : (
          <div className="space-y-3 pt-1">
            <p className="ui-body-small text-foreground/80">
              The languages differ. Breadth-First Search on the symmetric difference product automaton found a shortest distinguishing string:
            </p>

            {/* Shortest Distinguishing String Callout */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-md bg-background border border-border">
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium text-muted-foreground">Shortest distinguishing string:</span>
                <span className="code-value-lg bg-muted/60 px-3 py-1 rounded border border-border text-foreground select-all tracking-normal">
                  "{eqResult.counterexample?.displayString}"
                </span>
              </div>
              <span className="ui-meta font-mono">
                length: {eqResult.counterexample?.rawString.length ?? 0}
              </span>
            </div>

            {/* Acceptance Comparison Table */}
            <div className="rounded-md border border-border bg-background overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Expression</TableHead>
                    <TableHead className="w-1/3">Input String</TableHead>
                    <TableHead className="w-1/3 text-right">Acceptance Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <span className="text-muted-foreground mr-1.5 font-sans font-medium">Regex A:</span>
                      <span className="code-text font-medium text-foreground">{regexA}</span>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      "{eqResult.counterexample?.displayString}"
                    </TableCell>
                    <TableCell className="text-right font-sans">
                      {eqResult.counterexample?.acceptedByA ? (
                        <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50/50 font-medium text-xs">
                          Accept
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-300 text-red-700 bg-red-50/50 font-medium text-xs">
                          Reject
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <span className="text-muted-foreground mr-1.5 font-sans font-medium">Regex B:</span>
                      <span className="code-text font-medium text-foreground">{regexB}</span>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      "{eqResult.counterexample?.displayString}"
                    </TableCell>
                    <TableCell className="text-right font-sans">
                      {eqResult.counterexample?.acceptedByB ? (
                        <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50/50 font-medium text-xs">
                          Accept
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-300 text-red-700 bg-red-50/50 font-medium text-xs">
                          Reject
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
