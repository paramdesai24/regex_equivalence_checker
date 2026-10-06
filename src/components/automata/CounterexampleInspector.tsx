import React, { useState } from 'react';
import type { CounterexampleVerification } from '../../automata/equivalence/types';
import { AccordionSection } from './AccordionSection';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../ui/table';
import { Badge } from '../ui/badge';

interface CounterexampleInspectorProps {
  counterexample: CounterexampleVerification;
  regexA: string;
  regexB: string;
}

export const CounterexampleInspector: React.FC<CounterexampleInspectorProps> = ({
  counterexample,
}) => {
  const [open, setOpen] = useState(false);
  const isEpsilon = counterexample.rawString === '';

  return (
    <AccordionSection
      title={`Counterexample Derivation Path: "${counterexample.displayString}"`}
      badge={`length ${counterexample.rawString.length}`}
      expanded={open}
      onToggle={() => setOpen((o) => !o)}
      overflow
    >
      <div className="p-3 bg-background space-y-3">
        {isEpsilon ? (
          <div className="p-3 rounded-md border border-border bg-muted/20 text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Empty string (ε) difference:</span> The start product state is immediately distinguishing because exactly one automaton accepts ε while the other rejects it.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Step</TableHead>
                <TableHead className="w-20">Symbol</TableHead>
                <TableHead>Product State</TableHead>
                <TableHead>DFA A Transition</TableHead>
                <TableHead>DFA B Transition</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-muted-foreground font-mono">0</TableCell>
                <TableCell className="text-muted-foreground font-mono">—</TableCell>
                <TableCell className="font-medium font-mono text-foreground">
                  ({counterexample.derivationPath[0]?.fromPair[0]}, {counterexample.derivationPath[0]?.fromPair[1]})
                </TableCell>
                <TableCell className="text-muted-foreground">Start</TableCell>
                <TableCell className="text-muted-foreground">Start</TableCell>
              </TableRow>

              {counterexample.derivationPath.map((step, idx) => {
                const isLast = idx === counterexample.derivationPath.length - 1;

                return (
                  <TableRow
                    key={step.stepNumber}
                    className={isLast ? 'bg-red-50/40 dark:bg-red-950/20' : ''}
                  >
                    <TableCell className="text-muted-foreground font-mono">{step.stepNumber}</TableCell>
                    <TableCell className="font-medium font-mono text-foreground">'{step.symbol}'</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={isLast ? 'text-red-700 dark:text-red-400 font-medium font-mono' : 'text-foreground font-mono'}>
                          ({step.toPair[0]}, {step.toPair[1]})
                        </span>
                        {isLast && (
                          <Badge variant="destructive" className="text-xs h-5 px-1.5 font-medium">
                            Distinguishing
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono">
                      {step.stateAFrom} –{step.symbol}→ {step.stateATo}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono">
                      {step.stateBFrom} –{step.symbol}→ {step.stateBTo}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </AccordionSection>
  );
};
