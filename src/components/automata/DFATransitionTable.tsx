import React, { useState } from 'react';
import type { DFA } from '../../automata/dfa/types';
import { AccordionSection } from './AccordionSection';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../ui/table';

interface DFATransitionTableProps {
  dfa: DFA;
  hideDeadState?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}

export const DFATransitionTable: React.FC<DFATransitionTableProps> = ({
  dfa,
  hideDeadState = false,
  expanded: extExpanded,
  onToggle: extToggle,
}) => {
  const [localOpen, setLocalOpen] = useState(false);
  const expanded = extExpanded !== undefined ? extExpanded : localOpen;
  const onToggle = extToggle ?? (() => setLocalOpen((o) => !o));

  const visibleStates = dfa.states.filter((s) => !hideDeadState || !s.isDead);

  const transitionMap = new Map<string, string>();
  for (const t of dfa.transitions) {
    transitionMap.set(`${t.from},${t.symbol}`, t.to);
  }

  return (
    <AccordionSection
      title="DFA Transition Table"
      badge={`${visibleStates.length} × ${dfa.alphabet.length}`}
      expanded={expanded}
      onToggle={onToggle}
      overflow
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>State</TableHead>
            {dfa.alphabet.map((sym) => (
              <TableHead key={sym}>{sym}</TableHead>
            ))}
            <TableHead className="text-right">Accepting</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleStates.map((s) => {
            const isStart = s.id === dfa.startState;
            const isAccept = s.isAccepting;

            return (
              <TableRow key={s.id}>
                <TableCell className="font-mono font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    {isStart && <span className="text-muted-foreground text-xs" title="Start state">→</span>}
                    {isAccept && <span className="text-foreground text-xs" title="Accept state">*</span>}
                    <span className={s.isDead ? 'text-muted-foreground' : 'text-foreground'}>
                      {s.id}
                    </span>
                  </span>
                </TableCell>
                {dfa.alphabet.map((sym) => {
                  const target = transitionMap.get(`${s.id},${sym}`) ?? '—';
                  const isDeadTarget = target === 'DEAD';
                  return (
                    <TableCell
                      key={sym}
                      className={`font-mono ${isDeadTarget || target === '—' ? 'text-muted-foreground/60' : 'text-foreground'}`}
                    >
                      {target}
                    </TableCell>
                  );
                })}
                <TableCell className="text-right font-sans">
                  {isAccept ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">Yes</span>
                  ) : (
                    <span className="text-muted-foreground/60 font-normal">No</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </AccordionSection>
  );
};
