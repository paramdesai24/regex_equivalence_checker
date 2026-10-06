import React from 'react';
import type { ProcessedRegexResult } from '../automata/regex/types';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegexInputRowProps {
  label: string; // "A" | "B"
  value: string;
  onChange: (v: string) => void;
  result: ProcessedRegexResult | null;
  placeholder?: string;
}

export const RegexInputRow: React.FC<RegexInputRowProps> = ({
  label,
  value,
  onChange,
  result,
  placeholder = 'e.g. (a|b)*',
}) => {
  const isErr = result ? !result.isValid : false;
  const isOk = result ? result.isValid : false;
  const inputId = `regex-input-${label.toLowerCase()}`;

  return (
    <div className="space-y-1.5 flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <Label htmlFor={inputId} className="ui-label">
          Regex {label}
        </Label>
        {result && (
          <Badge
            variant={isOk ? 'outline' : 'destructive'}
            className={cn(
              'text-xs font-mono font-medium px-2 py-0.5',
              isOk ? 'text-muted-foreground border-border' : ''
            )}
          >
            {isOk ? `${result.tokens.length} tokens` : 'Syntax error'}
          </Badge>
        )}
      </div>

      <div className="relative flex items-center">
        <Input
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          className={cn(
            'h-10 text-sm font-mono pr-8 transition-colors',
            isErr && 'border-red-400 focus-visible:ring-red-400 bg-red-50/20'
          )}
        />
        {value && (
          <button
            type="button"
            aria-label={`Clear regex ${label}`}
            onClick={() => onChange('')}
            className="absolute right-2.5 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Error state with character caret */}
      {result?.error && (
        <div className="text-xs font-mono text-destructive pt-0.5 space-y-0.5 leading-snug">
          <div>{result.error.message}</div>
          {value && (
            <div className="text-muted-foreground whitespace-pre font-mono text-xs leading-tight select-none">
              {value}
              {'\n'}
              <span className="text-destructive font-semibold">
                {' '.repeat(Math.min(result.error.position, value.length))}^
              </span>
            </div>
          )}
        </div>
      )}

      {/* Technical postfix / explicit summary */}
      {result?.isValid && (
        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground pt-0.5 truncate leading-normal">
          <span className="truncate">
            explicit: <span className="text-foreground font-medium">{result.explicitConcatString}</span>
          </span>
          <span className="text-border">·</span>
          <span className="truncate">
            postfix: <span className="text-foreground font-medium">{result.postfixString}</span>
          </span>
        </div>
      )}
    </div>
  );
};
