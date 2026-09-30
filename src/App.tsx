import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { InputSection } from './components/InputSection';
import { PlaceholderTab } from './components/PlaceholderTab';
import type { PipelineStage } from './types/pipeline';
import { processRegex } from './automata/regex';

export function App() {
  const [currentStage, setCurrentStage] = useState<PipelineStage>('input');
  const [regexA, setRegexA] = useState<string>('(a|b)*abb');
  const [regexB, setRegexB] = useState<string>('a*b*');
  const [hasCompared, setHasCompared] = useState<boolean>(true);

  // Parse regexes reactively
  const resultA = useMemo(() => {
    if (!regexA.trim()) return null;
    return processRegex(regexA);
  }, [regexA]);

  const resultB = useMemo(() => {
    if (!regexB.trim()) return null;
    return processRegex(regexB);
  }, [regexB]);

  const handleCompare = () => {
    setHasCompared(true);
  };

  const handleReset = () => {
    setRegexA('');
    setRegexB('');
    setHasCompared(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Header />
      <TabNavigation
        currentStage={currentStage}
        onSelectStage={setCurrentStage}
        hasCompared={hasCompared}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {currentStage === 'input' ? (
          <InputSection
            regexA={regexA}
            regexB={regexB}
            onChangeA={setRegexA}
            onChangeB={setRegexB}
            resultA={resultA}
            resultB={resultB}
            hasCompared={hasCompared}
            onCompare={handleCompare}
            onReset={handleReset}
          />
        ) : (
          <PlaceholderTab
            stage={currentStage}
            onGoToInput={() => setCurrentStage('input')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Regex Equivalence Checker & Automata Visualizer — Principles of Compiler Design
          </div>
          <div className="font-mono text-slate-600">
            Pipeline: Lexer → Shunting-Yard → ε-NFA → DFA → Hopcroft → Product Automaton
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
