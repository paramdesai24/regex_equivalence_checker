import React, { useState } from 'react';
import type { ThompsonStep } from '../../automata/nfa/types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ConstructionStepsProps {
  steps: ThompsonStep[];
}

const OPERATOR_COLOR: Record<ThompsonStep['operator'], string> = {
  LITERAL: 'text-blue-400',
  CONCAT: 'text-amber-400',
  UNION: 'text-purple-400',
  STAR: 'text-emerald-400',
};

export const ConstructionSteps: React.FC<ConstructionStepsProps> = ({ steps }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-slate-800 rounded overflow-hidden text-xs">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 text-slate-300 hover:bg-slate-800 transition"
      >
        <span className="font-medium">Construction Steps ({steps.length})</span>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
      </button>

      {open && (
        <div className="divide-y divide-slate-900 max-h-64 overflow-y-auto">
          {steps.map((step, i) => (
            <div key={i} className="px-3 py-2 bg-slate-950 hover:bg-slate-900/60 transition">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-slate-500 font-mono select-none">{i + 1}.</span>
                <span className={`font-mono font-semibold ${OPERATOR_COLOR[step.operator]}`}>
                  {step.operator}
                </span>
                <span className="font-mono text-slate-400">
                  {step.subject === '.' ? 'concat' : step.subject === '|' ? 'union' : step.subject === '*' ? 'star' : `'${step.subject}'`}
                </span>
              </div>
              <p className="text-slate-400 font-mono text-[10px] leading-snug pl-5">
                {step.description}
              </p>
              {step.newStates.length > 0 && (
                <div className="flex gap-1 mt-1 pl-5 flex-wrap">
                  {step.newStates.map((s) => (
                    <span key={s} className="px-1 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                      +q{s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
