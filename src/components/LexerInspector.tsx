import React, { useState } from 'react';
import type { ProcessedRegexResult, Token } from '../automata/regex/types';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible';
import { Badge } from './ui/badge';

interface LexerInspectorProps {
  labelA: string;
  resultA: ProcessedRegexResult | null;
  labelB: string;
  resultB: ProcessedRegexResult | null;
}

function TokenChip({ token, index }: { token: Token; index: number }) {
  return (
    <span
      key={index}
      title={`${token.type} at index ${token.position}`}
      className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-sm bg-muted text-foreground border border-border/70"
    >
      <span className="font-medium">{token.value}</span>
      <span className="text-xs text-muted-foreground font-mono">{token.type.toLowerCase()}</span>
    </span>
  );
}

function RegexDetailsPane({
  label,
  result,
}: {
  label: string;
  result: ProcessedRegexResult | null;
}) {
  if (!result) return null;

  return (
    <div className="space-y-2.5 min-w-0">
      <div className="flex items-center justify-between text-[13px]">
        <span className="font-sans font-medium text-foreground">Regex {label}</span>
        <Badge
          variant={result.isValid ? 'outline' : 'destructive'}
          className="text-xs font-mono font-medium px-2 py-0.5"
        >
          {result.isValid ? `${result.tokens.length} tokens` : 'invalid'}
        </Badge>
      </div>

      {result.isValid && (
        <div className="space-y-2 font-mono text-[13px] bg-muted/30 p-3 rounded-md border border-border/70 leading-relaxed">
          <div className="flex items-baseline gap-2">
            <span className="text-muted-foreground w-16 shrink-0 font-normal">raw:</span>
            <span className="text-foreground select-all font-medium">{result.raw}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-muted-foreground w-16 shrink-0 font-normal">explicit:</span>
            <span className="text-foreground select-all font-medium">{result.explicitConcatString}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-muted-foreground w-16 shrink-0 font-normal">postfix:</span>
            <span className="text-foreground select-all font-medium">{result.postfixString}</span>
          </div>

          <div className="pt-2 border-t border-border/60">
            <div className="text-xs text-muted-foreground mb-1.5 font-sans font-medium">
              Token stream:
            </div>
            <div className="flex flex-wrap gap-1">
              {result.tokens.map((t, i) => (
                <TokenChip key={i} token={t} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const LexerInspector: React.FC<LexerInspectorProps> = ({
  labelA,
  resultA,
  labelB,
  resultB,
}) => {
  const [open, setOpen] = useState(false);

  if (!resultA && !resultB) return null;

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="border border-border rounded-md bg-background overflow-hidden"
    >
      <CollapsibleTrigger asChild>
        <button
          id="lexer-inspector-toggle"
          type="button"
          className="w-full flex items-center justify-between px-3.5 py-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors select-none cursor-pointer tracking-normal leading-normal"
        >
          <div className="flex items-center gap-2">
            {open ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <span>Regex processing details</span>
          </div>
          <span className="text-xs text-muted-foreground font-normal">
            Tokens · Explicit concat · Postfix
          </span>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="p-3.5 pt-2 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/10">
          <RegexDetailsPane label={labelA} result={resultA} />
          <RegexDetailsPane label={labelB} result={resultB} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
