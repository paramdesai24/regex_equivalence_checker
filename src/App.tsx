import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { HowItWorksModal } from './components/HowItWorksModal';
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
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

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
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--t1)',
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header onOpenHowItWorks={() => setHowItWorksOpen(true)} />
      <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
      <TabNavigation
        currentStage={stage}
        onSelectStage={setStage}
        nfaReady={nfaReady}
        dfaReady={dfaReady}
        minDfaReady={minDfaReady}
        equivalenceReady={equivalenceReady}
      />

      <main
        style={{
          flex: 1,
          maxWidth: 1280,
          width: '100%',
          margin: '0 auto',
          padding: '20px 24px',
          boxSizing: 'border-box',
        }}
      >
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

      <footer
        style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--s0)',
          padding: '10px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'var(--t3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <span>Regex Equivalence Checker — Principles of Compiler Design</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--g)',
                display: 'inline-block',
              }}
            />
            Pipeline: Shunting-Yard → Thompson → Subset → Hopcroft → Product BFS
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
