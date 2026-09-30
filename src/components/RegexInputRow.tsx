import React from 'react';
import type { ProcessedRegexResult } from '../automata/regex/types';

interface RegexInputRowProps {
  label: string;       // "A" | "B"
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

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <label className="text-xs font-mono text-slate-500 w-16 shrink-0">
          Regex {label}
        </label>
        <div className={`flex-1 flex items-center border rounded px-2 py-1.5 bg-slate-900 transition ${
          isErr ? 'border-rose-700' : isOk ? 'border-slate-700' : 'border-slate-800'
        }`}>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            autoComplete="off"
            className="flex-1 bg-transparent font-mono text-sm text-slate-100 placeholder:text-slate-700 focus:outline-none"
          />
          {value && (
            <button
              onClick={() => onChange('')}
              className="text-[10px] text-slate-600 hover:text-slate-400 ml-2 transition shrink-0"
            >
              ×
            </button>
          )}
        </div>

        {/* Validity indicator */}
        {result && (
          <span className={`text-[10px] font-mono shrink-0 ${isOk ? 'text-emerald-600' : 'text-rose-500'}`}>
            {isOk ? `${result.tokens.length} tok` : 'error'}
          </span>
        )}
      </div>

      {/* Error message */}
      {result?.error && (
        <div className="ml-[72px] font-mono text-[10px] text-rose-400 leading-tight">
          {result.error.message}
          {value && (
            <div className="text-slate-700 mt-0.5 whitespace-pre">
              {value}
              {'\n'}
              <span className="text-rose-600">
                {' '.repeat(Math.min(result.error.position, value.length))}^
              </span>
            </div>
          )}
        </div>
      )}

      {/* Postfix summary when valid */}
      {result?.isValid && (
        <div className="ml-[72px] flex items-center gap-3 text-[10px] font-mono text-slate-600">
          <span>explicit: <span className="text-slate-400">{result.explicitConcatString}</span></span>
          <span>postfix: <span className="text-slate-400">{result.postfixString}</span></span>
        </div>
      )}
    </div>
  );
};
