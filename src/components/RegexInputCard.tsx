import type { ProcessedRegexResult } from '../automata/regex/types';
import { AlertCircle, CheckCircle, Code, ListFilter } from 'lucide-react';

interface RegexInputCardProps {
  label: string;
  name: string;
  value: string;
  onChange: (val: string) => void;
  result: ProcessedRegexResult | null;
  placeholder?: string;
  accentColor?: 'indigo' | 'emerald';
}

export const RegexInputCard: React.FC<RegexInputCardProps> = ({
  label,
  value,
  onChange,
  result,
  placeholder = 'e.g. (a|b)*abb',
  accentColor = 'indigo',
}) => {
  const isErr = result ? !result.isValid : false;
  const isVal = result ? result.isValid : false;

  const borderColor = isErr
    ? 'border-rose-500/60 focus-within:border-rose-500 ring-rose-500/10'
    : isVal
    ? accentColor === 'indigo'
      ? 'border-indigo-500/50 focus-within:border-indigo-400 ring-indigo-500/10'
      : 'border-emerald-500/50 focus-within:border-emerald-400 ring-emerald-500/10'
    : 'border-slate-800 focus-within:border-slate-600 ring-slate-800/10';

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              accentColor === 'indigo' ? 'bg-indigo-400' : 'bg-emerald-400'
            }`}
          />
          <h2 className="text-base font-semibold text-slate-100">{label}</h2>
        </div>

        {/* Validation Status Badge */}
        {result && (
          <div>
            {result.isValid ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle className="w-3 h-3" />
                Valid Syntax
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <AlertCircle className="w-3 h-3" />
                Syntax Error
              </span>
            )}
          </div>
        )}
      </div>

      {/* Input Field Area */}
      <div
        className={`relative flex items-center bg-slate-950/80 rounded-xl border ${borderColor} focus-within:ring-4 transition-all duration-150 px-4 py-3`}
      >
        <Code className="w-4 h-4 text-slate-500 mr-3 flex-shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          className="w-full bg-transparent font-mono text-base text-slate-100 placeholder:text-slate-600 focus:outline-none tracking-wide"
        />
        {value.length > 0 && (
          <button
            onClick={() => onChange('')}
            className="text-xs text-slate-500 hover:text-slate-300 px-2 py-0.5 rounded hover:bg-slate-800 transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Position Error Details */}
      {result && result.error && (
        <div className="bg-rose-950/30 border border-rose-800/50 rounded-xl p-3.5 text-xs text-rose-300 flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-200">{result.error.message}</p>
            {value.length > 0 && (
              <div className="font-mono text-slate-300 bg-slate-900/90 px-2 py-1 rounded border border-rose-900/40 text-[13px] whitespace-pre">
                {value}
                {'\n'}
                <span className="text-rose-400 font-bold">
                  {' '.repeat(Math.min(result.error.position, Math.max(0, value.length - 1)))}
                  ▲ (index {result.error.position})
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real-time tokens summary preview */}
      {result && result.isValid && (
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5">
            <ListFilter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tokens: {result.tokens.length}</span>
            <span className="text-slate-600">•</span>
            <span>Explicit Concat: <code className="text-indigo-300 font-mono text-[11px]">{result.explicitConcatString}</code></span>
          </div>
          <div className="font-mono text-slate-400">
            Postfix: <span className="text-emerald-300 font-semibold">{result.postfixString}</span>
          </div>
        </div>
      )}
    </div>
  );
};
