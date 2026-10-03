import React from 'react';
import type { PipelineStage } from '../types/pipeline';

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
  implemented: boolean;
}

const TABS: TabDef[] = [
  { id: 'input',       label: 'Input',         implemented: true },
  { id: 'nfa',         label: 'ε-NFA',         implemented: true },
  { id: 'dfa',         label: 'DFA',           implemented: true },
  { id: 'min-dfa',     label: 'Min-DFA',       implemented: true },
  { id: 'equivalence', label: 'Equivalence',   implemented: true },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({
  currentStage,
  onSelectStage,
  nfaReady,
  dfaReady = nfaReady,
  minDfaReady = dfaReady,
  equivalenceReady = minDfaReady,
}) => {
  return (
    <div className="border-b border-slate-800 bg-slate-950 px-6">
      <nav className="max-w-7xl mx-auto flex" aria-label="Pipeline stages">
        {TABS.map((tab, i) => {
          const isActive = currentStage === tab.id;
          const isReady =
            (tab.id === 'nfa' && nfaReady) ||
            (tab.id === 'dfa' && dfaReady) ||
            (tab.id === 'min-dfa' && minDfaReady) ||
            (tab.id === 'equivalence' && equivalenceReady);

          return (
            <React.Fragment key={tab.id}>
              <button
                onClick={() => onSelectStage(tab.id)}
                className={`
                  relative px-4 py-2.5 text-xs font-medium transition-colors whitespace-nowrap
                  ${isActive
                    ? 'text-slate-100 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-indigo-400'
                    : tab.implemented
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-400'}
                `}
              >
                {tab.label}
                {isReady && !isActive && (
                  <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 align-middle" />
                )}
                {!tab.implemented && (
                  <span className="ml-1.5 text-[9px] text-slate-700">soon</span>
                )}
              </button>
              {i < TABS.length - 1 && (
                <span className="text-slate-800 flex items-center px-0.5 text-xs">›</span>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
};
