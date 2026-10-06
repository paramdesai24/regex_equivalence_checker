import React from 'react';
import { Separator } from './ui/separator';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-border bg-background px-6 h-12 flex items-center">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-4">
        {/* Left: title & subtitle */}
        <div className="flex items-baseline gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-xs bg-foreground" aria-hidden="true" />
            <h1 className="text-base font-semibold tracking-tight leading-none text-foreground">
              Regex Equivalence Checker
            </h1>
          </div>
          <Separator orientation="vertical" className="h-3.5 hidden sm:block" />
          <span className="text-xs text-muted-foreground hidden sm:inline leading-none font-normal">
            Automata-based regular language equivalence
          </span>
        </div>
      </div>
    </header>
  );
};
