import React, { useState } from 'react';
import type { NFA, Transition } from '../../automata/nfa/types';
import { AccordionSection } from './AccordionSection';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../ui/table';

interface TransitionTableProps {
  nfa: NFA;
  expanded?: boolean;
  onToggle?: () => void;
}

export const TransitionTable: React.FC<TransitionTableProps> = ({
  nfa,
  expanded: extExpanded,
  onToggle: extToggle,
}) => {
  const [localOpen, setLocalOpen] = useState(false);
  const expanded = extExpanded !== undefined ? extExpanded : localOpen;
  const onToggle = extToggle ?? (() => setLocalOpen((o) => !o));

  const sorted = [...nfa.transitions].sort(
    (a, b) => a.from - b.from || (a.symbol ?? 'ε').localeCompare(b.symbol ?? 'ε')
  );

  return (
    <AccordionSection
      title="Transition Table"
      badge={`${nfa.transitions.length} transitions`}
      expanded={expanded}
      onToggle={onToggle}
      overflow
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">From state</TableHead>
            <TableHead className="w-1/3">Symbol</TableHead>
            <TableHead className="w-1/3">To state</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((t: Transition, i) => (
            <TableRow key={i}>
              <TableCell className="font-mono font-medium text-foreground">q{t.from}</TableCell>
              <TableCell className="font-mono text-muted-foreground">{t.symbol ?? 'ε'}</TableCell>
              <TableCell className="font-mono font-medium text-foreground">q{t.to}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AccordionSection>
  );
};
