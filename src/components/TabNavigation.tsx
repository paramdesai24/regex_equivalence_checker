import type { PipelineStage, StageTabInfo } from '../types/pipeline';
import { Terminal, Share2, Network, Minimize2, CheckCircle2 } from 'lucide-react';

interface TabNavigationProps {
  currentStage: PipelineStage;
  onSelectStage: (stage: PipelineStage) => void;
  hasCompared: boolean;
}

export const STAGES: StageTabInfo[] = [
  {
    id: 'input',
    label: 'Input & AST',
    shortDesc: 'Lexer & Postfix',
    isImplemented: true,
  },
  {
    id: 'nfa',
    label: 'ε-NFA',
    shortDesc: "Thompson's Construction",
    badge: 'Stage 2',
    isImplemented: false,
  },
  {
    id: 'dfa',
    label: 'DFA',
    shortDesc: 'Subset Construction',
    badge: 'Stage 3',
    isImplemented: false,
  },
  {
    id: 'min-dfa',
    label: 'Minimized DFA',
    shortDesc: 'Hopcroft / Equivalence',
    badge: 'Stage 4',
    isImplemented: false,
  },
  {
    id: 'equivalence',
    label: 'Equivalence',
    shortDesc: 'Product / Counterexample',
    badge: 'Stage 5',
    isImplemented: false,
  },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({
  currentStage,
  onSelectStage,
  hasCompared,
}) => {
  const getIcon = (id: PipelineStage) => {
    switch (id) {
      case 'input':
        return <Terminal className="w-4 h-4" />;
      case 'nfa':
        return <Share2 className="w-4 h-4" />;
      case 'dfa':
        return <Network className="w-4 h-4" />;
      case 'min-dfa':
        return <Minimize2 className="w-4 h-4" />;
      case 'equivalence':
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="border-b border-slate-800 bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-6">
        <nav className="flex space-x-2 overflow-x-auto py-2.5 no-scrollbar" aria-label="Pipeline Stages">
          {STAGES.map((stage) => {
            const isActive = currentStage === stage.id;

            return (
              <button
                key={stage.id}
                onClick={() => onSelectStage(stage.id)}
                className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <span
                  className={`p-1 rounded-md transition-colors ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {getIcon(stage.id)}
                </span>

                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span>{stage.label}</span>
                    {stage.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                        {stage.badge}
                      </span>
                    )}
                  </div>
                  <span className="block text-[11px] font-normal text-slate-500 group-hover:text-slate-400">
                    {stage.shortDesc}
                  </span>
                </div>

                {stage.id === 'input' && hasCompared && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
