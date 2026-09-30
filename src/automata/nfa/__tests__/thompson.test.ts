import { describe, it, expect } from 'vitest';
import { buildNFA } from '../thompson';
import { processRegex } from '../../regex/index';
import type { NFA, Transition } from '../types';

/** Helper: run the full pipeline and return the NFA. */
function nfaOf(expr: string): NFA {
  const res = processRegex(expr);
  if (!res.isValid) throw new Error(`Invalid regex: ${res.error?.message}`);
  return buildNFA(res.postfixTokens).nfa;
}

/** Count transitions matching a predicate. */
function countTransitions(nfa: NFA, pred: (t: Transition) => boolean): number {
  return nfa.transitions.filter(pred).length;
}

/** Check whether a specific transition (from → symbol → to) exists. */
function hasTransition(nfa: NFA, from: number, symbol: string | null, to: number): boolean {
  return nfa.transitions.some(
    (t) => t.from === from && t.symbol === symbol && t.to === to
  );
}

// ─────────────────────────────────────────────────────────────────────────────
describe("Thompson's Construction — Literal", () => {
  it('produces exactly 2 states for single literal "a"', () => {
    const nfa = nfaOf('a');
    expect(nfa.states).toHaveLength(2);
  });

  it('produces exactly 1 transition for "a"', () => {
    const nfa = nfaOf('a');
    expect(nfa.transitions).toHaveLength(1);
  });

  it('the one transition carries the symbol "a"', () => {
    const nfa = nfaOf('a');
    expect(nfa.transitions[0].symbol).toBe('a');
  });

  it('start state → accept state via "a"', () => {
    const nfa = nfaOf('a');
    expect(hasTransition(nfa, nfa.startState, 'a', nfa.acceptState)).toBe(true);
  });

  it('alphabet contains only "a"', () => {
    const nfa = nfaOf('a');
    expect(nfa.alphabet).toEqual(['a']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("Thompson's Construction — Concatenation (ab)", () => {
  it('produces 4 states for "ab"', () => {
    const nfa = nfaOf('ab');
    expect(nfa.states).toHaveLength(4);
  });

  it('produces exactly 3 transitions: a-transition, ε-transition, b-transition', () => {
    const nfa = nfaOf('ab');
    expect(nfa.transitions).toHaveLength(3);
  });

  it('has one "a" transition, one "b" transition, one ε transition', () => {
    const nfa = nfaOf('ab');
    expect(countTransitions(nfa, (t) => t.symbol === 'a')).toBe(1);
    expect(countTransitions(nfa, (t) => t.symbol === 'b')).toBe(1);
    expect(countTransitions(nfa, (t) => t.symbol === null)).toBe(1);
  });

  it('alphabet is ["a", "b"]', () => {
    const nfa = nfaOf('ab');
    expect(nfa.alphabet.sort()).toEqual(['a', 'b']);
  });

  it('the ε-transition connects the two sub-fragments', () => {
    const nfa = nfaOf('ab');
    // The ε transition's from-state must not be start and its to-state not accept
    const eps = nfa.transitions.find((t) => t.symbol === null)!;
    expect(eps.from).not.toBe(nfa.startState);
    expect(eps.to).not.toBe(nfa.acceptState);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("Thompson's Construction — Union (a|b)", () => {
  it('produces 6 states for "a|b"', () => {
    const nfa = nfaOf('a|b');
    expect(nfa.states).toHaveLength(6);
  });

  it('produces 6 transitions: a, b, and 4 ε', () => {
    const nfa = nfaOf('a|b');
    expect(nfa.transitions).toHaveLength(6);
    expect(countTransitions(nfa, (t) => t.symbol === null)).toBe(4);
    expect(countTransitions(nfa, (t) => t.symbol === 'a')).toBe(1);
    expect(countTransitions(nfa, (t) => t.symbol === 'b')).toBe(1);
  });

  it('start state has exactly 2 ε-transitions (branching)', () => {
    const nfa = nfaOf('a|b');
    const outgoing = nfa.transitions.filter(
      (t) => t.from === nfa.startState && t.symbol === null
    );
    expect(outgoing).toHaveLength(2);
  });

  it('accept state has exactly 2 incoming ε-transitions (merging)', () => {
    const nfa = nfaOf('a|b');
    const incoming = nfa.transitions.filter(
      (t) => t.to === nfa.acceptState && t.symbol === null
    );
    expect(incoming).toHaveLength(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("Thompson's Construction — Kleene Star (a*)", () => {
  it('produces 4 states for "a*"', () => {
    const nfa = nfaOf('a*');
    expect(nfa.states).toHaveLength(4);
  });

  it('produces 5 transitions: 1 "a" and 4 ε', () => {
    const nfa = nfaOf('a*');
    expect(nfa.transitions).toHaveLength(5);
    expect(countTransitions(nfa, (t) => t.symbol === null)).toBe(4);
  });

  it('bypass ε-transition exists from start to accept', () => {
    const nfa = nfaOf('a*');
    expect(hasTransition(nfa, nfa.startState, null, nfa.acceptState)).toBe(true);
  });

  it('start state connects to the inner fragment via ε', () => {
    const nfa = nfaOf('a*');
    const outgoing = nfa.transitions.filter(
      (t) => t.from === nfa.startState && t.symbol === null
    );
    expect(outgoing).toHaveLength(2); // bypass + enter
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("Thompson's Construction — Composite expressions", () => {
  it('"(a|b)*" produces 8 states', () => {
    const nfa = nfaOf('(a|b)*');
    expect(nfa.states).toHaveLength(8);
  });

  it('"(a|b)*" bypass ε-transition from start to accept exists', () => {
    const nfa = nfaOf('(a|b)*');
    expect(hasTransition(nfa, nfa.startState, null, nfa.acceptState)).toBe(true);
  });

  it('"(a|b)*abb" produces 14 states', () => {
    const nfa = nfaOf('(a|b)*abb');
    expect(nfa.states).toHaveLength(14);
  });

  it('"(a|b)*abb" has "a" and "b" in alphabet', () => {
    const nfa = nfaOf('(a|b)*abb');
    expect(nfa.alphabet.sort()).toEqual(['a', 'b']);
  });

  it('"a(b|c)*" has 3 alphabet symbols', () => {
    const nfa = nfaOf('a(b|c)*');
    expect(nfa.alphabet.sort()).toEqual(['a', 'b', 'c']);
  });

  it('"a(b|c)*" startState is different from acceptState', () => {
    const nfa = nfaOf('a(b|c)*');
    expect(nfa.startState).not.toBe(nfa.acceptState);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("Thompson's Construction — Construction steps", () => {
  it('records one step for a single literal', () => {
    const res = processRegex('a');
    const { steps } = buildNFA(res.postfixTokens);
    expect(steps).toHaveLength(1);
    expect(steps[0].operator).toBe('LITERAL');
  });

  it('records steps for "ab": LITERAL, LITERAL, CONCAT', () => {
    const res = processRegex('ab');
    const { steps } = buildNFA(res.postfixTokens);
    expect(steps).toHaveLength(3);
    expect(steps.map((s) => s.operator)).toEqual(['LITERAL', 'LITERAL', 'CONCAT']);
  });

  it('records steps for "a|b": LITERAL, LITERAL, UNION', () => {
    const res = processRegex('a|b');
    const { steps } = buildNFA(res.postfixTokens);
    expect(steps.map((s) => s.operator)).toEqual(['LITERAL', 'LITERAL', 'UNION']);
  });

  it('records steps for "a*": LITERAL, STAR', () => {
    const res = processRegex('a*');
    const { steps } = buildNFA(res.postfixTokens);
    expect(steps.map((s) => s.operator)).toEqual(['LITERAL', 'STAR']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("Thompson's Construction — Error handling", () => {
  it('each NFA starts independently from q0', () => {
    const nfaA = nfaOf('a');
    const nfaB = nfaOf('b');
    expect(nfaA.startState).toBe(0);
    expect(nfaB.startState).toBe(0);
  });

  it('two separate NFAs do not share state IDs because of isolation', () => {
    const resA = processRegex('a');
    const resB = processRegex('b');
    const { nfa: nfaA } = buildNFA(resA.postfixTokens);
    const { nfa: nfaB } = buildNFA(resB.postfixTokens);
    // Each should have states [0, 1] independently
    expect(nfaA.states).toEqual([0, 1]);
    expect(nfaB.states).toEqual([0, 1]);
  });
});
