import React, { useState } from 'react';
import type { ProcessedRegexResult, Token } from '../automata/regex/types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface LexerInspectorProps {
  labelA: string;
  resultA: ProcessedRegexResult | null;
  labelB: string;
  resultB: ProcessedRegexResult | null;
}

function RegexLexerCard({ label, result }: { label: string; result: ProcessedRegexResult | null }) {
  if (!result) return null;
  return (
    <div className="space-y-3 min-w-0">
      <div className="text-[11px] font-mono text-slate-500">
        {label}: <span className="text-slate-300">{result.raw}</span>
        {result.isValid
          ? <span className="ml-2 text-emerald-600">valid</span>
          : <span className="ml-2 text-rose-500">invalid</span>}
      </div>

      {result.isValid && (
        <>
          {/* Explicit concat */}
          <div className="flex items-baseline gap-2 text-[11px] font-mono">
            <span className="text-slate-600 shrink-0">explicit:</span>
            <span className="text-amber-400">{result.explicitConcatString}</span>
          </div>
          {/* Postfix */}
          <div className="flex items-baseline gap-2 text-[11px] font-mono">
            <span className="text-slate-600 shrink-0">postfix: </span>
            <span className="text-emerald-400">{result.postfixString}</span>
          </div>
          {/* Token stream */}
          <div>
            <div className="text-[10px] text-slate-600 mb-1">tokens ({result.tokens.length})</div>
            <div className="flex flex-wrap gap-1">
              {result.tokens.map((t: Token, i) => {
                const c =
                  t.type === 'LITERAL' ? 'text-sky-400'
                  : t.type === 'UNION' ? 'text-purple-400'
                  : t.type === 'STAR' ? 'text-amber-400'
                  : 'text-slate-400';
                return (
                  <span
                    key={i}
                    title={`${t.type} @ ${t.position}`}
                    className={`font-mono text-[10px] ${c}`}
                  >
                    {t.value}
                  </span>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export const LexerInspector: React.FC<LexerInspectorProps> = ({ labelA, resultA, labelB, resultB }) => {
  const [open, setOpen] = useState(false);

  if (!resultA && !resultB) return null;

  return (
    <div className="border border-slate-800 rounded overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2 bg-slate-900 text-xs text-slate-400 hover:bg-slate-800 transition"
      >
        <span className="font-medium">Lexer / Postfix Inspector</span>
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-950">
          <RegexLexerCard label={labelA} result={resultA} />
          <RegexLexerCard label={labelB} result={resultB} />
        </div>
      )}
    </div>
  );
};
