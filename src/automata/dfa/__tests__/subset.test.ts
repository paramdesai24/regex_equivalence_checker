import { describe, it, expect } from 'vitest';
import type { NFA } from '../../nfa/types';
import { processRegex } from '../../regex/index';
import { buildNFA } from '../../nfa/thompson';
import { epsilonClosure } from '../epsilonClosure';
import { move } from '../move';
import { getDFAStateName } from '../stateNaming';
import { buildDFA, canonicalSubsetKey } from '../subset';
import { validateDFADeterminism } from '../validator';
import { simulateNFA, simulateDFA } from '../simulation';

/** Helper: full pipeline from regex string to DFA */
function dfaOf(expr: string) {
  const p = processRegex(expr);
  if (!p.isValid) throw new Error(`Invalid regex: ${p.error?.message}`);
  const { nfa } = buildNFA(p.postfixTokens);
  return { nfa, ...buildDFA(nfa) };
}

// ─────────────────────────────────────────────────────────────────────────────
describe('State Naming Generator', () => {
  it('generates standard single letters A through Z', () => {
    expect(getDFAStateName(0)).toBe('A');
    expect(getDFAStateName(1)).toBe('B');
    expect(getDFAStateName(25)).toBe('Z');
  });

  it('generates two-letter bijective names AA, AB, ..., AZ, BA', () => {
    expect(getDFAStateName(26)).toBe('AA');
    expect(getDFAStateName(27)).toBe('AB');
    expect(getDFAStateName(51)).toBe('AZ');
    expect(getDFAStateName(52)).toBe('BA');
  });

  it('throws for negative indices', () => {
    expect(() => getDFAStateName(-1)).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Canonical Subset Identity', () => {
  it('treats sets with different insertion order as identical keys', () => {
    const key1 = canonicalSubsetKey([3, 1, 4]);
    const key2 = canonicalSubsetKey([1, 4, 3]);
    const key3 = canonicalSubsetKey([4, 3, 1, 1]);
    expect(key1).toBe('1,3,4');
    expect(key2).toBe('1,3,4');
    expect(key3).toBe('1,3,4');
  });

  it('handles empty set', () => {
    expect(canonicalSubsetKey([])).toBe('');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('epsilonClosure primitive', () => {
  it('returns original state when no epsilon transitions exist', () => {
    const nfa: NFA = {
      states: [0, 1],
      startState: 0,
      acceptState: 1,
      transitions: [{ from: 0, to: 1, symbol: 'a' }],
      alphabet: ['a'],
    };
    const closure = epsilonClosure(nfa, [0]);
    expect(Array.from(closure)).toEqual([0]);
  });

  it('follows a chain of epsilon transitions q0 –ε→ q1 –ε→ q2', () => {
    const nfa: NFA = {
      states: [0, 1, 2],
      startState: 0,
      acceptState: 2,
      transitions: [
        { from: 0, to: 1, symbol: null },
        { from: 1, to: 2, symbol: null },
      ],
      alphabet: [],
    };
    const closure = epsilonClosure(nfa, [0]);
    expect(Array.from(closure).sort((a, b) => a - b)).toEqual([0, 1, 2]);
  });

  it('follows branching epsilon transitions', () => {
    const nfa: NFA = {
      states: [0, 1, 2],
      startState: 0,
      acceptState: 2,
      transitions: [
        { from: 0, to: 1, symbol: null },
        { from: 0, to: 2, symbol: null },
      ],
      alphabet: [],
    };
    const closure = epsilonClosure(nfa, [0]);
    expect(Array.from(closure).sort((a, b) => a - b)).toEqual([0, 1, 2]);
  });

  it('terminates safely on epsilon cycles q0 –ε→ q1 –ε→ q0', () => {
    const nfa: NFA = {
      states: [0, 1],
      startState: 0,
      acceptState: 1,
      transitions: [
        { from: 0, to: 1, symbol: null },
        { from: 1, to: 0, symbol: null },
      ],
      alphabet: [],
    };
    const closure = epsilonClosure(nfa, [0]);
    expect(Array.from(closure).sort((a, b) => a - b)).toEqual([0, 1]);
  });

  it('does NOT follow transitions with non-null symbols', () => {
    const nfa: NFA = {
      states: [0, 1, 2],
      startState: 0,
      acceptState: 2,
      transitions: [
        { from: 0, to: 1, symbol: null },
        { from: 1, to: 2, symbol: 'a' },
      ],
      alphabet: ['a'],
    };
    const closure = epsilonClosure(nfa, [0]);
    expect(Array.from(closure).sort((a, b) => a - b)).toEqual([0, 1]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('move primitive', () => {
  const nfa: NFA = {
    states: [0, 1, 2, 3],
    startState: 0,
    acceptState: 3,
    transitions: [
      { from: 0, to: 1, symbol: 'a' },
      { from: 0, to: 2, symbol: 'b' },
      { from: 1, to: 3, symbol: 'a' },
      { from: 1, to: 2, symbol: null }, // epsilon should be ignored by move
    ],
    alphabet: ['a', 'b'],
  };

  it('finds direct symbol transitions from a single state', () => {
    expect(Array.from(move(nfa, [0], 'a'))).toEqual([1]);
    expect(Array.from(move(nfa, [0], 'b'))).toEqual([2]);
  });

  it('returns empty set if no matching transitions exist', () => {
    expect(Array.from(move(nfa, [2], 'a'))).toEqual([]);
  });

  it('finds target states from multiple source states', () => {
    const targets = Array.from(move(nfa, [0, 1], 'a')).sort((a, b) => a - b);
    expect(targets).toEqual([1, 3]);
  });

  it('strictly ignores epsilon transitions', () => {
    const targets = Array.from(move(nfa, [1], 'a'));
    expect(targets).toEqual([3]);
    expect(move(nfa, [1], 'b').size).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Subset Construction (buildDFA)', () => {
  it('constructs a valid DFA for single literal "a"', () => {
    const { dfa } = dfaOf('a');
    expect(dfa.states.length).toBeGreaterThanOrEqual(2);
    expect(dfa.acceptStates.length).toBe(1);
    expect(dfa.startState).toBe('A');

    const validation = validateDFADeterminism(dfa);
    expect(validation.isValid).toBe(true);
  });

  it('constructs a valid DFA for concatenation "ab"', () => {
    const { dfa } = dfaOf('ab');
    const validation = validateDFADeterminism(dfa);
    expect(validation.isValid).toBe(true);
    expect(dfa.acceptStates.length).toBeGreaterThan(0);
  });

  it('constructs a valid DFA for union "a|b"', () => {
    const { dfa } = dfaOf('a|b');
    const validation = validateDFADeterminism(dfa);
    expect(validation.isValid).toBe(true);
    expect(dfa.acceptStates.length).toBeGreaterThan(0);
  });

  it('start state is accepting for "a*"', () => {
    const { dfa } = dfaOf('a*');
    expect(dfa.acceptStates).toContain(dfa.startState);
    const validation = validateDFADeterminism(dfa);
    expect(validation.isValid).toBe(true);
  });

  it('start state is accepting for "(a|b)*"', () => {
    const { dfa } = dfaOf('(a|b)*');
    expect(dfa.acceptStates).toContain(dfa.startState);
    const validation = validateDFADeterminism(dfa);
    expect(validation.isValid).toBe(true);
  });

  it('constructs deterministic DFA for classic "(a|b)*abb"', () => {
    const { dfa, steps } = dfaOf('(a|b)*abb');
    expect(dfa.alphabet).toEqual(['a', 'b']);
    expect(dfa.startState).toBe('A');
    expect(steps.length).toBeGreaterThan(0);

    const validation = validateDFADeterminism(dfa);
    expect(validation.isValid).toBe(true);

    // There should be no duplicate DFA state names
    const names = dfa.states.map((s) => s.id);
    expect(names.length).toBe(new Set(names).size);

    // There must be at least one accept state
    expect(dfa.acceptStates.length).toBeGreaterThan(0);
  });

  it('supports 3-symbol alphabet "a(b|c)*"', () => {
    const { dfa } = dfaOf('a(b|c)*');
    expect(dfa.alphabet).toEqual(['a', 'b', 'c']);
    const validation = validateDFADeterminism(dfa);
    expect(validation.isValid).toBe(true);
  });

  it('records construction steps with move and closure results', () => {
    const { steps } = dfaOf('ab');
    expect(steps[0].type).toBe('START');
    expect(steps[0].description).toMatch(/Initialize start state/);

    const transitionSteps = steps.filter((s) => s.type === 'TRANSITION');
    expect(transitionSteps.length).toBeGreaterThan(0);
    expect(transitionSteps[0].symbol).toBeDefined();
    expect(transitionSteps[0].targetState).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Dead State Handling', () => {
  it('creates an explicit DEAD trap state when transitions into ∅ occur', () => {
    const { dfa } = dfaOf('a');
    expect(dfa.deadStateId).toBe('DEAD');
    const dead = dfa.states.find((s) => s.id === 'DEAD');
    expect(dead).toBeDefined();
    expect(dead?.isDead).toBe(true);
    expect(dead?.isAccepting).toBe(false);

    // Dead state loops to itself on every alphabet symbol
    const deadLoops = dfa.transitions.filter((t) => t.from === 'DEAD');
    expect(deadLoops.map((t) => t.symbol).sort()).toEqual(dfa.alphabet.sort());
    expect(deadLoops.every((t) => t.to === 'DEAD')).toBe(true);
  });

  it('completeness: every DFA state has a transition for every alphabet symbol', () => {
    const { dfa } = dfaOf('(a|b)*abb');
    for (const state of dfa.states) {
      for (const sym of dfa.alphabet) {
        const trans = dfa.transitions.filter((t) => t.from === state.id && t.symbol === sym);
        expect(trans).toHaveLength(1);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Determinism Validation Helper', () => {
  it('passes on valid DFAs', () => {
    const { dfa } = dfaOf('(a|b)*abb');
    const result = validateDFADeterminism(dfa);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('catches non-deterministic multiple transitions on same symbol', () => {
    const { dfa } = dfaOf('a');
    // Inject invalid duplicate transition
    dfa.transitions.push({ from: 'A', to: 'DEAD', symbol: 'a' });
    const result = validateDFADeterminism(dfa);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('Non-deterministic branch'))).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Language Simulation Sanity Tests (NFA vs DFA agreement)', () => {
  const testCases = [
    {
      regex: '(a|b)*abb',
      strings: [
        { str: 'abb', expected: true },
        { str: 'aabb', expected: true },
        { str: 'babb', expected: true },
        { str: 'ababb', expected: true },
        { str: 'bbbbabb', expected: true },
        { str: 'ab', expected: false },
        { str: 'abba', expected: false },
        { str: 'a', expected: false },
        { str: 'b', expected: false },
        { str: '', expected: false },
      ],
    },
    {
      regex: 'a(b|c)*',
      strings: [
        { str: 'a', expected: true },
        { str: 'ab', expected: true },
        { str: 'ac', expected: true },
        { str: 'abcbc', expected: true },
        { str: '', expected: false },
        { str: 'b', expected: false },
        { str: 'c', expected: false },
        { str: 'aa', expected: false },
      ],
    },
    {
      regex: 'a*b*',
      strings: [
        { str: '', expected: true },
        { str: 'a', expected: true },
        { str: 'b', expected: true },
        { str: 'aaaa', expected: true },
        { str: 'bbbb', expected: true },
        { str: 'aabb', expected: true },
        { str: 'ba', expected: false },
        { str: 'aba', expected: false },
      ],
    },
    {
      regex: '(a*b*)*',
      strings: [
        { str: '', expected: true },
        { str: 'a', expected: true },
        { str: 'b', expected: true },
        { str: 'ab', expected: true },
        { str: 'ba', expected: true },
        { str: 'ababa', expected: true },
      ],
    },
  ];

  testCases.forEach(({ regex, strings }) => {
    describe(`Regex: ${regex}`, () => {
      const { nfa, dfa } = dfaOf(regex);

      strings.forEach(({ str, expected }) => {
        it(`input "${str}" -> expected ${expected ? 'ACCEPT' : 'REJECT'}`, () => {
          const nfaResult = simulateNFA(nfa, str);
          const dfaResult = simulateDFA(dfa, str);

          // Both must match expected
          expect(nfaResult).toBe(expected);
          expect(dfaResult).toBe(expected);
          // And must agree with each other
          expect(dfaResult).toBe(nfaResult);
        });
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Isolation between Regex A and B', () => {
  it('generates independent DFAs without state leakage', () => {
    const { dfa: dfaA } = dfaOf('(a|b)*abb');
    const { dfa: dfaB } = dfaOf('a*b*');

    expect(dfaA.startState).toBe('A');
    expect(dfaB.startState).toBe('A');

    // States are independent
    expect(dfaA.states).not.toBe(dfaB.states);
  });
});
