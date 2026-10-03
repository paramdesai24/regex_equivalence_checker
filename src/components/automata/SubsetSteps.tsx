import React, { useState } from 'react';
import type { SubsetConstructionStep } from '../../automata/dfa/types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SubsetStepsProps {
  steps: SubsetConstructionStep[];
}

export const SubsetSteps: React.FC<SubsetStepsProps> = ({ steps }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-slate-800 rounded overflow-hidden text-xs">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 text-slate-300 hover:bg-slate-800 transition"
      >
        <span className="font-medium font-mono">Subset Construction Steps ({steps.length})</span>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
      </button>

      {open && (
        <div className="divide-y divide-slate-900 max-h-64 overflow-y-auto font-mono text-[11px]">
          {steps.map((step) => {
            const isStart = step.type === 'START';

            return (
              <div key={step.stepNumber} className="px-3 py-2 bg-slate-950 hover:bg-slate-900/60 transition">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-slate-500 select-none">{step.stepNumber}.</span>
                  {isStart ? (
                    <span className="text-indigo-400 font-semibold">START STATE</span>
                  ) : (
                    <>
                      <span className="text-slate-400">Process</span>
                      <span className="text-indigo-300 font-semibold">{step.sourceState}</span>
                      <span className="text-slate-500">on</span>
                      <span className="text-amber-300 font-semibold">'{step.symbol}'</span>
                    </>
                  )}
                  {step.isNewState && (
                    <span className="ml-auto text-[9px] px-1 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                      new state
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
