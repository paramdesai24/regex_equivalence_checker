import type { PipelineStage } from '../types/pipeline';
import { Share2, Network, Minimize2, CheckCircle2, Clock, ArrowLeft } from 'lucide-react';

interface PlaceholderTabProps {
  stage: PipelineStage;
  onGoToInput: () => void;
}

export const PlaceholderTab: React.FC<PlaceholderTabProps> = ({ stage, onGoToInput }) => {
  const getStageMetadata = () => {
    switch (stage) {
      case 'nfa':
        return {
          title: "ε-NFA Construction (Thompson's Algorithm)",
          algorithm: "Thompson's Construction from Postfix Expression",
          description:
            'Converts the regular expression into a Non-Deterministic Finite Automaton with ε-transitions. Each literal creates a simple 2-state NFA, and operators (union, concat, star) compose smaller sub-NFAs.',
          icon: <Share2 className="w-10 h-10 text-indigo-400" />,
          nextMilestone: 'Stage 2',
        };
      case 'dfa':
        return {
          title: 'DFA Conversion (Subset Construction)',
          algorithm: 'Powerset / Subset Construction using ε-Closure',
          description:
            'Converts the ε-NFA into a Deterministic Finite Automaton by grouping reachable states under ε-closures. Ensures every state has exactly one deterministic transition per alphabet symbol.',
          icon: <Network className="w-10 h-10 text-cyan-400" />,
          nextMilestone: 'Stage 3',
        };
      case 'min-dfa':
        return {
          title: 'DFA Minimization (Hopcroft / Table-Filling)',
          algorithm: 'Equivalence Partitioning of Distinguishable States',
          description:
            'Reduces the DFA to its unique minimal canonical form by eliminating equivalent states and unreachable configurations.',
          icon: <Minimize2 className="w-10 h-10 text-amber-400" />,
          nextMilestone: 'Stage 4',
        };
      case 'equivalence':
        return {
          title: 'Language Equivalence & Counterexample Generator',
          algorithm: 'Product Automaton (Symmetric Difference) + BFS Search',
          description:
            'Checks whether L(Regex A) == L(Regex B). If not equivalent, performs Breadth-First Search (BFS) on the symmetric difference automaton to discover the shortest counterexample string (accepted by one, rejected by the other).',
          icon: <CheckCircle2 className="w-10 h-10 text-emerald-400" />,
          nextMilestone: 'Stage 5',
        };
      default:
        return {
          title: 'Stage Pipeline',
          algorithm: 'Upcoming Component',
          description: 'This stage will be populated in subsequent milestones.',
          icon: <Clock className="w-10 h-10 text-slate-400" />,
          nextMilestone: 'Planned',
        };
    }
  };

  const meta = getStageMetadata();

  return (
    <div className="py-12 px-6 flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6">
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        {meta.icon}
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Status: Not generated yet ({meta.nextMilestone})</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-100">{meta.title}</h2>
        <p className="text-sm text-indigo-300 font-mono font-medium">{meta.algorithm}</p>
        <p className="text-sm text-slate-400 max-w-lg mx-auto pt-2 leading-relaxed">
          {meta.description}
        </p>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 max-w-md w-full text-left space-y-1.5">
        <div className="font-semibold text-slate-300">Phase 1 Status:</div>
        <p>
          Regex tokenization, syntactic validation, explicit concatenation, and Shunting-Yard
          postfix conversion are fully operational in the <span className="text-indigo-400 font-semibold">Input</span> tab.
        </p>
      </div>

      <button
        onClick={onGoToInput}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition shadow-lg shadow-indigo-600/20"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Input & Lexer
      </button>
    </div>
  );
};
