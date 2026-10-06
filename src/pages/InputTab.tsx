import React from 'react';
import { RegexInputRow } from '../components/RegexInputRow';
import { LexerInspector } from '../components/LexerInspector';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import type { ProcessedRegexResult } from '../automata/regex/types';
import { ArrowRight } from 'lucide-react';

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
  { label: 'Equivalent (star identity)', a: '(a|b)*', b: '(a*b*)*' },
  { label: 'Equivalent (union commutativity)', a: 'a|b', b: 'b|a' },
  { label: 'Non-equivalent (order diff)', a: '(a|b)*', b: 'a*b*' },
  { label: 'Empty string difference', a: 'a*', b: 'aa*' },
  { label: 'Suffix pattern difference', a: '(a|b)*abb', b: '(a|b)*ab' },
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
    <div className="space-y-6 max-w-4xl">
      {/* Page Title & Intro */}
      <div className="space-y-1.5">
        <h2 className="page-title">
          Compare regular expressions
        </h2>
        <p className="page-subtitle">
          Enter two regular expressions over alphanumeric characters with union (<code className="code-text font-medium text-foreground">|</code>), Kleene star (<code className="code-text font-medium text-foreground">*</code>), and parentheses grouping.
        </p>
      </div>

      {/* Preset shortcuts */}
      <div className="space-y-2">
        <div className="ui-label text-muted-foreground">
          Presets
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Button
              key={p.label}
              variant="outline"
              size="default"
              onClick={() => {
                onChangeA(p.a);
                onChangeB(p.b);
              }}
              className="h-8 px-3 text-[13px] font-normal text-muted-foreground hover:text-foreground"
            >
              <span>{p.label}</span>
              <span className="font-mono text-xs text-muted-foreground/80 ml-1.5 font-normal">
                ({p.a} vs {p.b})
              </span>
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Dual Regex Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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

      {/* Primary Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2.5">
          <Button
            id="compare-btn"
            variant="default"
            size="lg"
            onClick={onCompare}
            disabled={!canCompare}
            className="text-[13px] font-medium px-4 h-9"
          >
            Compare expressions
          </Button>

          {bothValid && hasCompared && (
            <Button
              id="view-nfa-btn"
              variant="outline"
              size="lg"
              onClick={onGoToNFA}
              className="text-[13px] font-normal h-9 gap-1.5"
            >
              <span>View ε-NFA</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          )}

          <Button
            id="reset-btn"
            variant="ghost"
            size="lg"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground text-[13px] font-normal h-9"
          >
            Reset
          </Button>
        </div>

        <div className="ui-meta font-mono">
          Alphabet: a–z, 0–9 · Operators: |, *, ( )
        </div>
      </div>

      {/* Lexer / Postfix Inspector */}
      {hasCompared && (
        <div className="pt-2">
          <LexerInspector
            labelA="A"
            resultA={resultA}
            labelB="B"
            resultB={resultB}
          />
        </div>
      )}
    </div>
  );
};
