import React, { useState } from 'react';
import type { CounterexampleVerification } from '../../automata/equivalence/types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CounterexampleInspectorProps {
  counterexample: CounterexampleVerification;
  regexA: string;
  regexB: string;
}

export const CounterexampleInspector: React.FC<CounterexampleInspectorProps> = ({
  counterexample,
  regexA,
  regexB,
}) => {
  const [open, setOpen] = useState(true);

  const isEpsilon = counterexample.rawString === '';

  return (
    <div className="border border-slate-800 rounded overflow-hidden text-xs">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 text-slate-300 hover:bg-slate-800 transition"
      >
        <span className="font-medium font-mono">
          Counterexample Derivation Path (w = "{counterexample.displayString}")
        </span>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
      </button>

      {open && (
        <div className="p-3 bg-slate-950 space-y-3 font-mono text-[11px]">
          {/* Summary Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div
              className={`p-2 rounded border ${
                counterexample.acceptedByA
                  ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
              }`}
            >
              <div className="font-semibold text-slate-300 text-[11px]">Regex A: {regexA}</div>
              <div className="mt-0.5 font-bold">
                {counterexample.acceptedByA ? '✓ ACCEPTED' : '✗ REJECTED'}
              </div>
            </div>

            <div
              className={`p-2 rounded border ${
                counterexample.acceptedByB
                  ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
              }`}
            >
              <div className="font-semibold text-slate-300 text-[11px]">Regex B: {regexB}</div>
              <div className="mt-0.5 font-bold">
                {counterexample.acceptedByB ? '✓ ACCEPTED' : '✗ REJECTED'}
              </div>
            </div>
          </div>

          {/* Derivation Steps */}
          {isEpsilon ? (
            <div className="text-slate-400 text-[11px] bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <span className="text-amber-300 font-semibold">Immediate ε-difference:</span> The
              initial product state is already distinguishing on the empty string{' '}
              <span className="text-slate-200">ε</span>. One automaton accepts the empty language
              prefix while the other rejects it.
            </div>
          ) : (
            <div className="border border-slate-850 rounded overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <th className="px-3 py-1.5">Step</th>
                    <th className="px-3 py-1.5">Symbol</th>
                    <th className="px-3 py-1.5">Product State</th>
                    <th className="px-3 py-1.5">DFA A Move</th>
                    <th className="px-3 py-1.5">DFA B Move</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {/* Step 0: Start */}
                  <tr className="bg-slate-950 text-slate-300">
                    <td className="px-3 py-1 text-slate-500">0</td>
                    <td className="px-3 py-1 text-slate-600">—</td>
                    <td className="px-3 py-1 text-indigo-300 font-semibold">
                      ({counterexample.derivationPath[0]?.fromPair[0]},{' '}
                      {counterexample.derivationPath[0]?.fromPair[1]})
                    </td>
                    <td className="px-3 py-1 text-slate-400">Start</td>
                    <td className="px-3 py-1 text-slate-400">Start</td>
                  </tr>

                  {/* Following steps */}
                  {counterexample.derivationPath.map((step, idx) => {
                    const isLast = idx === counterexample.derivationPath.length - 1;

                    return (
                      <tr
                        key={step.stepNumber}
                        className={
                          isLast
                            ? 'bg-rose-950/20 text-rose-200 font-semibold'
                            : 'bg-slate-950 text-slate-300'
                        }
                      >
                        <td className="px-3 py-1 text-slate-500">{step.stepNumber}</td>
                        <td className="px-3 py-1 text-amber-300 font-bold">'{step.symbol}'</td>
                        <td className="px-3 py-1">
                          <span
                            className={
                              isLast
                                ? 'text-rose-400 font-bold underline'
                                : 'text-slate-200'
                            }
                          >
                            ({step.toPair[0]}, {step.toPair[1]})
                          </span>
                          {isLast && (
                            <span className="ml-1 text-[9px] px-1 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300">
                              distinguishing
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-1 text-slate-400">
                          {step.stateAFrom} –{step.symbol}→ {step.stateATo}
                        </td>
                        <td className="px-3 py-1 text-slate-400">
                          {step.stateBFrom} –{step.symbol}→ {step.stateBTo}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
