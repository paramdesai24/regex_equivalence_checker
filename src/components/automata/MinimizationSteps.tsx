import React, { useState } from 'react';
import type { MinimizationStep } from '../../automata/minimization/types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface MinimizationStepsProps {
  steps: MinimizationStep[];
}

export const MinimizationSteps: React.FC<MinimizationStepsProps> = ({ steps }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-slate-800 rounded overflow-hidden text-xs">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 text-slate-300 hover:bg-slate-800 transition"
      >
        <span className="font-medium font-mono">
          Minimization Steps ({steps.length} steps)
        </span>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
      </button>

      {open && (
        <div className="divide-y divide-slate-900 max-h-64 overflow-y-auto font-mono text-[11px]">
          {steps.map((step) => {
            const isReach = step.type === 'REACHABILITY';
            const isInit = step.type === 'INITIAL_PARTITION';
            const isSplit = step.type === 'SPLIT';
            const isConv = step.type === 'CONVERGENCE';

            return (
              <div
                key={step.stepNumber}
                className="px-3 py-2 bg-slate-950 hover:bg-slate-900/60 transition"
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-slate-500 select-none">{step.stepNumber}.</span>
                  {isReach && (
                    <span className="text-sky-400 font-semibold">REACHABILITY</span>
                  )}
                  {isInit && (
                    <span className="text-indigo-400 font-semibold">INITIAL PARTITION (P₀)</span>
                  )}
                  {isSplit && (
                    <>
                      <span className="text-amber-400 font-semibold">PARTITION SPLIT</span>
                      {step.splitDetails && (
                        <span className="text-slate-400">
                          on symbol <span className="text-amber-300 font-semibold">'{step.splitDetails.symbol}'</span>
                        </span>
                      )}
                    </>
                  )}
                  {isConv && (
                    <span className="text-emerald-400 font-semibold">CONVERGENCE</span>
                  )}
                </div>

                <p className="text-slate-400 text-[10px] leading-snug pl-4">
                  {step.description}
                </p>

                {/* Partition representation preview */}
                {step.partitions && step.partitions.length > 0 && !isReach && (
                  <div className="flex flex-wrap gap-1 mt-1 pl-4">
                    {step.partitions.map((b, i) => (
                      <span
                        key={i}
                        className="px-1 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[10px]"
                      >
                        {`{${b.join(', ')}}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
