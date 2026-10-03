import { describe, it, expect } from 'vitest';
import type { DFA } from '../../dfa/types';
import { processRegex } from '../../regex/index';
import { buildNFA } from '../../nfa/thompson';
import { buildDFA } from '../../dfa/subset';
import { simulateDFA } from '../../dfa/simulation';
import { findReachableStates, pruneUnreachableStates } from '../reachable';
import { minimizeDFA } from '../minimize';
import { validateMinimizedDFA } from '../validator';

/** Helper: full pipeline from regex to minimized DFA */
function pipeline(expr: string) {
  const p = processRegex(expr);
  if (!p.isValid) throw new Error(`Invalid regex: ${p.error?.message}`);
  const { nfa } = buildNFA(p.postfixTokens);
  const { dfa } = buildDFA(nfa);
  const minResult = minimizeDFA(dfa);
  return { nfa, dfa, minResult, minDfa: minResult.minimizedDfa };
}

// ─────────────────────────────────────────────────────────────────────────────
describe('Reachability Pruning (findReachableStates / pruneUnreachableStates)', () => {
  it('correctly identifies reachable and unreachable states in a disconnected DFA', () => {
    const dfa: DFA = {
      states: [
        { id: 'A', nfaStates: [], isAccepting: false },
        { id: 'B', nfaStates: [], isAccepting: true },
        { id: 'C', nfaStates: [], isAccepting: false }, // unreachable
        { id: 'D', nfaStates: [], isAccepting: false }, // unreachable
      ],
      startState: 'A',
      acceptStates: ['B'],
      transitions: [
        { from: 'A', to: 'B', symbol: 'a' },
        { from: 'A', to: 'A', symbol: 'b' },
        { from: 'B', to: 'B', symbol: 'a' },
        { from: 'B', to: 'B', symbol: 'b' },
        { from: 'C', to: 'D', symbol: 'a' },
        { from: 'D', to: 'C', symbol: 'b' },
      ],
      alphabet: ['a', 'b'],
      deadStateId: null,
    };

    const reachable = findReachableStates(dfa);
    expect(Array.from(reachable).sort()).toEqual(['A', 'B']);

    const { prunedDfa, removed } = pruneUnreachableStates(dfa);
    expect(removed).toEqual(['C', 'D']);
    expect(prunedDfa.states.map((s) => s.id).sort()).toEqual(['A', 'B']);
    expect(prunedDfa.transitions.every((t) => t.from !== 'C' && t.to !== 'C')).toBe(true);
  });

  it('preserves all states when all are reachable', () => {
    const dfa: DFA = {
      states: [
        { id: 'A', nfaStates: [], isAccepting: false },
        { id: 'B', nfaStates: [], isAccepting: true },
      ],
      startState: 'A',
      acceptStates: ['B'],
      transitions: [
        { from: 'A', to: 'B', symbol: '0' },
        { from: 'B', to: 'A', symbol: '1' },
      ],
      alphabet: ['0', '1'],
      deadStateId: null,
    };

    const { removed, reachable } = pruneUnreachableStates(dfa);
    expect(removed).toHaveLength(0);
    expect(reachable.sort()).toEqual(['A', 'B']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Partition Refinement & State Merging', () => {
  it('merges obviously equivalent states with identical transitions and acceptance', () => {
    // DFA where B and C have identical outgoing transitions to the same targets
    // and both are non-accepting
    const dfa: DFA = {
      states: [
        { id: 'A', nfaStates: [], isAccepting: false },
        { id: 'B', nfaStates: [], isAccepting: false },
        { id: 'C', nfaStates: [], isAccepting: false },
        { id: 'D', nfaStates: [], isAccepting: true },
      ],
      startState: 'A',
      acceptStates: ['D'],
      transitions: [
        { from: 'A', to: 'B', symbol: '0' },
        { from: 'A', to: 'C', symbol: '1' },
        // B transitions
        { from: 'B', to: 'B', symbol: '0' },
        { from: 'B', to: 'D', symbol: '1' },
        // C transitions (identical behavior to B)
        { from: 'C', to: 'B', symbol: '0' },
        { from: 'C', to: 'D', symbol: '1' },
        // D transitions
        { from: 'D', to: 'D', symbol: '0' },
        { from: 'D', to: 'D', symbol: '1' },
      ],
      alphabet: ['0', '1'],
      deadStateId: null,
    };

    const result = minimizeDFA(dfa);
    expect(result.minimizedStateCount).toBe(3); // A, {B,C}, D
    expect(result.statesRemoved).toBe(1);

    // Verify B and C are merged in the state mapping
    const mergedState = result.stateMapping.find((m) => m.originalStates.includes('B'));
    expect(mergedState).toBeDefined();
    expect(mergedState?.originalStates.sort()).toEqual(['B', 'C']);

    const validation = validateMinimizedDFA(result, dfa);
    expect(validation.isValid).toBe(true);
  });

  it('keeps distinguishable states separate even if they look similar on first step', () => {
    // B and C are both non-accepting.
    // On '0': both go to D.
    // On '1': B goes to E (accepting), but C goes to F (non-accepting).
    // B and C must NOT be merged!
    const dfa: DFA = {
      states: [
        { id: 'A', nfaStates: [], isAccepting: false },
        { id: 'B', nfaStates: [], isAccepting: false },
        { id: 'C', nfaStates: [], isAccepting: false },
        { id: 'D', nfaStates: [], isAccepting: false },
        { id: 'E', nfaStates: [], isAccepting: true },
        { id: 'F', nfaStates: [], isAccepting: false },
      ],
      startState: 'A',
      acceptStates: ['E'],
      transitions: [
        { from: 'A', to: 'B', symbol: '0' },
        { from: 'A', to: 'C', symbol: '1' },
        { from: 'B', to: 'D', symbol: '0' },
        { from: 'B', to: 'E', symbol: '1' }, // leads to accepting E
        { from: 'C', to: 'D', symbol: '0' },
        { from: 'C', to: 'F', symbol: '1' }, // leads to non-accepting F
        { from: 'D', to: 'D', symbol: '0' },
        { from: 'D', to: 'D', symbol: '1' },
        { from: 'E', to: 'E', symbol: '0' },
        { from: 'E', to: 'E', symbol: '1' },
        { from: 'F', to: 'F', symbol: '0' },
        { from: 'F', to: 'F', symbol: '1' },
      ],
      alphabet: ['0', '1'],
      deadStateId: null,
    };

    const result = minimizeDFA(dfa);
    const bMapping = result.stateMapping.find((m) => m.originalStates.includes('B'));
    const cMapping = result.stateMapping.find((m) => m.originalStates.includes('C'));

    expect(bMapping?.minimizedId).not.toBe(cMapping?.minimizedId);
  });

  it('never merges accepting and non-accepting states', () => {
    const dfa: DFA = {
      states: [
        { id: 'A', nfaStates: [], isAccepting: false },
        { id: 'B', nfaStates: [], isAccepting: true },
      ],
      startState: 'A',
      acceptStates: ['B'],
      transitions: [
        { from: 'A', to: 'B', symbol: 'a' },
        { from: 'B', to: 'B', symbol: 'a' },
      ],
      alphabet: ['a'],
      deadStateId: null,
    };

    const result = minimizeDFA(dfa);
    expect(result.minimizedStateCount).toBe(2);
    for (const m of result.stateMapping) {
      if (m.isAccepting) {
        expect(m.originalStates).not.toContain('A');
      } else {
        expect(m.originalStates).not.toContain('B');
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('DEAD State Handling in Minimization', () => {
  it('merges an explicit DEAD state with another equivalent sink state', () => {
    // Both DEAD and SINK are non-accepting states that loop to themselves on all symbols
    const dfa: DFA = {
      states: [
        { id: 'A', nfaStates: [], isAccepting: true },
        { id: 'DEAD', nfaStates: [], isAccepting: false, isDead: true },
        { id: 'SINK', nfaStates: [], isAccepting: false },
      ],
      startState: 'A',
      acceptStates: ['A'],
      transitions: [
        { from: 'A', to: 'DEAD', symbol: '0' },
        { from: 'A', to: 'SINK', symbol: '1' },
        { from: 'DEAD', to: 'DEAD', symbol: '0' },
        { from: 'DEAD', to: 'DEAD', symbol: '1' },
        { from: 'SINK', to: 'SINK', symbol: '0' },
        { from: 'SINK', to: 'SINK', symbol: '1' },
      ],
      alphabet: ['0', '1'],
      deadStateId: 'DEAD',
    };

    const result = minimizeDFA(dfa);
    expect(result.minimizedStateCount).toBe(2); // A, {DEAD, SINK}

    const deadMapping = result.stateMapping.find((m) => m.originalStates.includes('DEAD'));
    expect(deadMapping?.originalStates).toContain('SINK');
  });

  it('keeps DEAD state separate from a non-accepting state that can reach accept', () => {
    const dfa: DFA = {
      states: [
        { id: 'A', nfaStates: [], isAccepting: false },
        { id: 'B', nfaStates: [], isAccepting: true },
        { id: 'DEAD', nfaStates: [], isAccepting: false, isDead: true },
      ],
      startState: 'A',
      acceptStates: ['B'],
      transitions: [
        { from: 'A', to: 'B', symbol: 'a' },
        { from: 'A', to: 'DEAD', symbol: 'b' },
        { from: 'B', to: 'B', symbol: 'a' },
        { from: 'B', to: 'DEAD', symbol: 'b' },
        { from: 'DEAD', to: 'DEAD', symbol: 'a' },
        { from: 'DEAD', to: 'DEAD', symbol: 'b' },
      ],
      alphabet: ['a', 'b'],
      deadStateId: 'DEAD',
    };

    const result = minimizeDFA(dfa);
    // A can reach B (accepting), DEAD can never reach B. They must remain separate.
    const aMapping = result.stateMapping.find((m) => m.originalStates.includes('A'));
    expect(aMapping?.originalStates).not.toContain('DEAD');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Minimization of Real Regex Automata', () => {
  const testRegexes = [
    'a',
    'ab',
    'a|b',
    'a*',
    '(a|b)*',
    '(a|b)*abb',
    'a(b|c)*',
    'a*b*',
    '(a*b*)*',
  ];

  testRegexes.forEach((expr) => {
    it(`minimizes "${expr}" with valid determinism and reachable states`, () => {
      const { dfa, minResult, minDfa } = pipeline(expr);

      expect(minResult.minimizedStateCount).toBeLessThanOrEqual(minResult.originalStateCount);
      expect(minDfa.startState).toBe('A');

      const validation = validateMinimizedDFA(minResult, dfa);
      expect(validation.isValid).toBe(true);

      // Verify reachability of all states in minimized DFA
      const reachable = findReachableStates(minDfa);
      expect(reachable.size).toBe(minDfa.states.length);
    });
  });

  it('demonstrates state reduction on redundant regexes', () => {
    // (a|b)* has redundant states in standard subset construction that merge
    const { minResult } = pipeline('(a|b)*');
    expect(minResult.minimizedStateCount).toBeLessThanOrEqual(minResult.originalStateCount);
    expect(minResult.reductionPercent).toBeGreaterThanOrEqual(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Language Preservation (Original DFA vs Minimized DFA Simulation)', () => {
  const testSuites = [
    {
      regex: '(a|b)*abb',
      inputs: [
        'abb',
        'aabb',
        'babb',
        'ababb',
        'bbbbabb',
        'ab',
        'abba',
        'a',
        'b',
        '',
        'bbbb',
      ],
    },
    {
      regex: 'a(b|c)*',
      inputs: ['a', 'ab', 'ac', 'abcbc', '', 'b', 'c', 'aa', 'abbc'],
    },
    {
      regex: 'a*b*',
      inputs: ['', 'a', 'b', 'aaaa', 'bbbb', 'aabb', 'ba', 'aba', 'bba'],
    },
    {
      regex: '(a|b)*',
      inputs: ['', 'a', 'b', 'ab', 'ba', 'aaaa', 'bbbb', 'ababba'],
    },
    {
      regex: 'a|b',
      inputs: ['a', 'b', '', 'ab', 'ba', 'c'],
    },
  ];

  testSuites.forEach(({ regex, inputs }) => {
    describe(`Language preservation for: "${regex}"`, () => {
      const { dfa, minDfa } = pipeline(regex);

      inputs.forEach((str) => {
        it(`preserves acceptance for input "${str}"`, () => {
          const originalAcc = simulateDFA(dfa, str);
          const minAcc = simulateDFA(minDfa, str);
          expect(minAcc).toBe(originalAcc);
        });
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Deterministic Output & Step Transparency', () => {
  it('produces identical output and naming on repeated minimization calls', () => {
    const { dfa } = pipeline('(a|b)*abb');
    const run1 = minimizeDFA(dfa);
    const run2 = minimizeDFA(dfa);

    expect(run1.minimizedDfa.states.map((s) => s.id)).toEqual(
      run2.minimizedDfa.states.map((s) => s.id)
    );
    expect(run1.minimizedDfa.transitions).toEqual(run2.minimizedDfa.transitions);
    expect(run1.minimizedDfa.acceptStates).toEqual(run2.minimizedDfa.acceptStates);
  });

  it('records step-by-step partition history starting with reachability and initial partition', () => {
    const { minResult } = pipeline('(a|b)*abb');
    expect(minResult.steps.length).toBeGreaterThanOrEqual(3);

    expect(minResult.steps[0].type).toBe('REACHABILITY');
    expect(minResult.steps[1].type).toBe('INITIAL_PARTITION');

    const lastStep = minResult.steps[minResult.steps.length - 1];
    expect(lastStep.type).toBe('CONVERGENCE');
  });
});
