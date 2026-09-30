import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { InputTab } from './pages/InputTab';
import { NFATab } from './pages/NFATab';
import { PlaceholderTab } from './pages/PlaceholderTab';
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

  const handleCompare = () => setHasCompared(true);
  const handleReset = () => { setRegexA(''); setRegexB(''); setHasCompared(false); };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <Header />
      <TabNavigation
        currentStage={stage}
        onSelectStage={setStage}
        nfaReady={nfaReady}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
        {stage === 'input' && (
          <InputTab
            regexA={regexA}
            regexB={regexB}
            onChangeA={setRegexA}
            onChangeB={setRegexB}
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
          />
        )}
        {(stage === 'dfa' || stage === 'min-dfa' || stage === 'equivalence') && (
          <PlaceholderTab stage={stage} onGoToInput={() => setStage('input')} />
        )}
      </main>

      <footer className="border-t border-slate-900 py-3 px-6">
        <div className="max-w-7xl mx-auto text-[11px] font-mono text-slate-700 flex items-center justify-between">
          <span>Regex Equivalence Checker — Compiler Design Coursework</span>
          <span>Phase 2: Thompson ε-NFA complete</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
