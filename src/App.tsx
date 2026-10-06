import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { InputTab } from './pages/InputTab';
import { NFATab } from './pages/NFATab';
import { DFATab } from './pages/DFATab';
import { MinimizedDFATab } from './pages/MinimizedDFATab';
import { EquivalenceTab } from './pages/EquivalenceTab';
import type { PipelineStage } from './types/pipeline';
import { processRegex } from './automata/regex';

export function App() {
  const [stage, setStage] = useState<PipelineStage>('input');
  const [regexA, setRegexA] = useState('(a|b)*abb');
  const [regexB, setRegexB] = useState('a*b*');
  const [hasCompared, setHasCompared] = useState(true);

  const resultA = useMemo(() => regexA.trim() ? processRegex(regexA) : null, [regexA]);
  const resultB = useMemo(() => regexB.trim() ? processRegex(regexB) : null, [regexB]);

  const nfaReady = !!(resultA?.isValid && resultB?.isValid && hasCompared);
  const dfaReady = nfaReady;
  const minDfaReady = dfaReady;
  const equivalenceReady = minDfaReady;

  const handleRegexAChange = (v: string) => {
    setRegexA(v);
    setHasCompared(false);
  };

  const handleRegexBChange = (v: string) => {
    setRegexB(v);
    setHasCompared(false);
  };

  const handleCompare = () => setHasCompared(true);
  const handleReset = () => {
    setRegexA('');
    setRegexB('');
    setHasCompared(false);
    setStage('input');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />
      <TabNavigation
        currentStage={stage}
        onSelectStage={setStage}
        nfaReady={nfaReady}
        dfaReady={dfaReady}
        minDfaReady={minDfaReady}
        equivalenceReady={equivalenceReady}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 box-border">
        {stage === 'input' && (
          <InputTab
            regexA={regexA}
            regexB={regexB}
            onChangeA={handleRegexAChange}
            onChangeB={handleRegexBChange}
            resultA={resultA}
            resultB={resultB}
            hasCompared={hasCompared}
            onCompare={handleCompare}
            onReset={handleReset}
            onGoToNFA={() => setStage('nfa')}
          />
        )}
        {stage === 'nfa' && (
          <NFATab
            resultA={resultA}
            resultB={resultB}
            regexA={regexA}
            regexB={regexB}
            onGoToInput={() => setStage('input')}
            onGoToDFA={() => setStage('dfa')}
          />
        )}
        {stage === 'dfa' && (
          <DFATab
            resultA={resultA}
            resultB={resultB}
            regexA={regexA}
            regexB={regexB}
            onGoToInput={() => setStage('input')}
            onGoToMinDFA={() => setStage('min-dfa')}
          />
        )}
        {stage === 'min-dfa' && (
          <MinimizedDFATab
            resultA={resultA}
            resultB={resultB}
            regexA={regexA}
            regexB={regexB}
            onGoToInput={() => setStage('input')}
            onGoToEquivalence={() => setStage('equivalence')}
          />
        )}
        {stage === 'equivalence' && (
          <EquivalenceTab
            resultA={resultA}
            resultB={resultB}
            regexA={regexA}
            regexB={regexB}
            hasCompared={hasCompared}
            onGoToInput={() => setStage('input')}
          />
        )}
      </main>

      <footer className="border-t border-border bg-background px-6 py-3">
        <div className="max-w-7xl mx-auto" />
      </footer>
    </div>
  );
}

export default App;
