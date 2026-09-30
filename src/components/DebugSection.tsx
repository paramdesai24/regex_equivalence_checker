import React, { useState } from 'react';
import type { ProcessedRegexResult, Token } from '../automata/regex/types';
import { Bug, ArrowRight, Layers, FileCode, Check, Copy } from 'lucide-react';

interface DebugSectionProps {
  labelA: string;
  resultA: ProcessedRegexResult | null;
  labelB: string;
  resultB: ProcessedRegexResult | null;
}

export const DebugSection: React.FC<DebugSectionProps> = ({
  labelA,
  resultA,
  labelB,
  resultB,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const renderRegexDebugCard = (
    label: string,
    result: ProcessedRegexResult | null,
    accent: 'indigo' | 'emerald'
  ) => {
    if (!result) return null;

    const accentBorder =
      accent === 'indigo' ? 'border-indigo-500/30' : 'border-emerald-500/30';
    const accentBg =
      accent === 'indigo' ? 'bg-indigo-500/5' : 'bg-emerald-500/5';
    const accentBadge =
      accent === 'indigo'
        ? 'bg-indigo-500/20 text-indigo-300'
        : 'bg-emerald-500/20 text-emerald-300';

    return (
      <div
        className={`rounded-2xl border ${accentBorder} ${accentBg} p-5 space-y-4 bg-slate-900/50 backdrop-blur-sm`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold ${accentBadge}`}>
              {label}
            </span>
            <span className="font-mono text-sm text-slate-300">
              "{result.raw}"
            </span>
          </div>

          <div className="flex items-center gap-2">
            {result.isValid ? (
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                Lexically Valid
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 font-medium">
                Invalid
              </span>
            )}
          </div>
        </div>

        {/* 1. Normalized Expression */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              Normalized Expression
            </span>
            <button
              onClick={() => copyToClipboard(result.normalized, `${label}-norm`)}
              className="text-slate-500 hover:text-slate-300 transition flex items-center gap-1"
            >
              {copiedKey === `${label}-norm` ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-lg font-mono text-sm text-slate-200 border border-slate-800">
            {result.normalized || <span className="text-slate-600">(empty)</span>}
          </div>
        </div>

        {/* 2. Explicit Concatenation */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              Explicit Concatenation Notation (<code className="text-amber-300 font-mono">.</code>)
            </span>
            <button
              onClick={() => copyToClipboard(result.explicitConcatString, `${label}-concat`)}
              className="text-slate-500 hover:text-slate-300 transition flex items-center gap-1"
            >
              {copiedKey === `${label}-concat` ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-lg font-mono text-sm text-amber-300 border border-slate-800">
            {result.explicitConcatString || <span className="text-slate-600">N/A</span>}
          </div>
        </div>

        {/* 3. Token Stream */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Token Stream ({result.tokens.length} tokens)
            </span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 max-h-36 overflow-y-auto flex flex-wrap gap-1.5">
            {result.tokens.length === 0 ? (
              <span className="text-xs text-slate-600 font-mono">No tokens generated</span>
            ) : (
              result.tokens.map((token: Token, idx: number) => {
                const badgeColor =
                  token.type === 'LITERAL'
                    ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                    : token.type === 'STAR'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : token.type === 'UNION'
                    ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700';

                return (
                  <span
                    key={idx}
                    title={`Token: ${token.type} | Value: '${token.value}' | Position: ${token.position}`}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border ${badgeColor}`}
                  >
                    <span className="text-slate-400 font-bold">{token.value}</span>
                    <span className="text-[9px] text-slate-500">[{token.type}]</span>
                  </span>
                );
              })
            )}
          </div>
        </div>

        {/* 4. Postfix Expression */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">RPN</span>
              Postfix Notation (Shunting-Yard Output)
            </span>
            <button
              onClick={() => copyToClipboard(result.postfixString, `${label}-postfix`)}
              className="text-slate-500 hover:text-slate-300 transition flex items-center gap-1"
            >
              {copiedKey === `${label}-postfix` ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
          <div className="bg-slate-950 px-3 py-2.5 rounded-lg font-mono text-base font-semibold text-emerald-400 border border-slate-800 flex items-center justify-between">
            <span>{result.postfixString || <span className="text-slate-600 font-normal text-sm">N/A</span>}</span>
            <span className="text-[11px] text-slate-500 font-sans font-normal">
              Ready for Thompson Construction
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="mt-8 border border-slate-800 rounded-2xl bg-slate-900/40 p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Compiler Pipeline Debug Section
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                Task 5 Milestone
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Lexer, Precedence Parser, and Shunting-Yard intermediate representations
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderRegexDebugCard(labelA, resultA, 'indigo')}
        {renderRegexDebugCard(labelB, resultB, 'emerald')}
      </div>
    </section>
  );
};
