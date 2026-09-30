import React from 'react';
import { GitCompare, Sparkles, BookOpen } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
              <GitCompare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Regex Equivalence Checker
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                  Compiler Design Project
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Compares two regular expressions by converting them into finite automata step-by-step
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto text-xs text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>PCD Lab Coursework</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 1: Lexer & Shunting-Yard</span>
          </div>
        </div>
      </div>
    </header>
  );
};
