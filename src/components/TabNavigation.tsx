import React from 'react';
import type { PipelineStage } from '../types/pipeline';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';

interface TabNavigationProps {
  currentStage: PipelineStage;
  onSelectStage: (stage: PipelineStage) => void;
  nfaReady: boolean;
  dfaReady?: boolean;
  minDfaReady?: boolean;
  equivalenceReady?: boolean;
}

interface TabDef {
  id: PipelineStage;
  label: string;
}

const TABS: TabDef[] = [
  { id: 'input', label: 'Input' },
  { id: 'nfa', label: 'ε-NFA' },
  { id: 'dfa', label: 'DFA' },
  { id: 'min-dfa', label: 'Minimized DFA' },
  { id: 'equivalence', label: 'Equivalence' },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({
  currentStage,
  onSelectStage,
  nfaReady,
  dfaReady = nfaReady,
  minDfaReady = dfaReady,
  equivalenceReady = minDfaReady,
}) => {
  const isReady = (id: PipelineStage) => {
    if (id === 'input') return true;
    if (id === 'nfa') return nfaReady;
    if (id === 'dfa') return dfaReady;
    if (id === 'min-dfa') return minDfaReady;
    if (id === 'equivalence') return equivalenceReady;
    return false;
  };

  return (
    <div className="border-b border-border bg-background px-6">
      <TooltipProvider delayDuration={300}>
        <nav
          className="max-w-7xl mx-auto flex items-center gap-1 -mb-px"
          aria-label="Pipeline stages"
          role="tablist"
        >
          {TABS.map((tab) => {
            const active = currentStage === tab.id;
            const ready = isReady(tab.id);
            const disabled = !ready && tab.id !== 'input';

            const buttonEl = (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onSelectStage(tab.id)}
                disabled={disabled}
                aria-selected={active}
                role="tab"
                className={cn(
                  'h-9.5 px-3.5 text-[13px] font-medium border-b-2 transition-colors inline-flex items-center gap-2 select-none cursor-pointer tracking-normal leading-none',
                  active
                    ? 'border-foreground text-foreground font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                  disabled && 'opacity-40 cursor-not-allowed hover:text-muted-foreground'
                )}
              >
                <span>{tab.label}</span>
              </button>
            );

            if (disabled) {
              return (
                <Tooltip key={tab.id}>
                  <TooltipTrigger asChild>{buttonEl}</TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Compare expressions to view {tab.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return buttonEl;
          })}
        </nav>
      </TooltipProvider>
    </div>
  );
};
