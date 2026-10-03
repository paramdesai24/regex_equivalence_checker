interface HeaderProps {
  onOpenHowItWorks?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHowItWorks }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-slate-100 tracking-tight">
            Regex Equivalence Checker
          </h1>
          <span className="text-slate-700">|</span>
          <span className="text-xs text-slate-500">
            Automata Visualizer — Principles of Compiler Design
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline text-[11px] font-mono text-slate-600">
            Lexer → Postfix → ε-NFA → DFA → Min-DFA → Equivalence
          </span>
          {onOpenHowItWorks && (
            <button
              onClick={onOpenHowItWorks}
              className="text-[11px] font-mono px-2 py-0.5 rounded border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition"
            >
              How It Works
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
