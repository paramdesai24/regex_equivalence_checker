import React, { useState } from 'react';
import type { EquivalenceStep } from '../../automata/equivalence/types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface EquivalenceStepsProps {
  steps: EquivalenceStep[];
}

export const EquivalenceSteps: React.FC<EquivalenceStepsProps> = ({ steps }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-slate-800 rounded overflow-hidden text-xs">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 text-slate-300 hover:bg-slate-800 transition"
      >
        <span className="font-medium font-mono">
          BFS Product Exploration Steps ({steps.length} steps)
        </span>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
      </button>

      {open && (
        <div className="divide-y divide-slate-900 max-h-64 overflow-y-auto font-mono text-[11px]">
          {steps.map((step) => {
            const isDist = step.isDistinguishing;

            return (
              <div
                key={step.stepNumber}
                className={`px-3 py-2 ${
                  isDist ? 'bg-rose-950/25' : 'bg-slate-950'
                } hover:bg-slate-900/60 transition`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-slate-500 select-none">{step.stepNumber}.</span>
                  <span className="text-indigo-300 font-semibold">
                    ({step.pair[0]}, {step.pair[1]})
                  </span>
                  <span className="text-slate-500">prefix:</span>
                  <span className="text-amber-300 font-semibold">
                    "{step.inputPrefix === '' ? 'ε' : step.inputPrefix}"
                  </span>

                  {isDist ? (
                    <span className="ml-auto text-[9px] px-1 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                      DISTINGUISHING
                    </span>
                  ) : (
                    <span className="ml-auto text-[9px] text-slate-600">
                      A:{step.acceptingA ? 'acc' : 'rej'}, B:{step.acceptingB ? 'acc' : 'rej'}
                    </span>
                  )}
                </div>

                <p className="text-slate-400 text-[10px] leading-snug pl-4">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
