import { describe, it, expect } from 'vitest';
import { tokenize } from '../tokenizer';
import { validateTokens } from '../validator';
import { insertExplicitConcat, formatExplicitConcat } from '../concatenation';
import { toPostfix, formatPostfix } from '../postfix';
import { processRegex } from '../index';

describe('Regex Tokenizer', () => {
  it('tokenizes (a|b)*abb with correct token sequence and positions', () => {
    const tokens = tokenize('(a|b)*abb');
    expect(tokens.map((t) => t.type)).toEqual([
      'LPAREN',
      'LITERAL',
      'UNION',
      'LITERAL',
      'RPAREN',
      'STAR',
      'LITERAL',
      'LITERAL',
      'LITERAL',
    ]);
    expect(tokens.map((t) => t.value)).toEqual([
      '(',
      'a',
      '|',
      'b',
      ')',
      '*',
      'a',
      'b',
      'b',
    ]);
  });

  it('rejects unsupported characters with accurate position', () => {
    expect(() => tokenize('a$b')).toThrow(/Unsupported character '\$' at position 1/);
    expect(() => tokenize('a@b')).toThrow(/Unsupported character '@' at position 1/);
  });

  it('ignores whitespace while maintaining original character positions', () => {
    const tokens = tokenize('a |  b');
    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toEqual({ type: 'LITERAL', value: 'a', position: 0 });
    expect(tokens[1]).toEqual({ type: 'UNION', value: '|', position: 2 });
    expect(tokens[2]).toEqual({ type: 'LITERAL', value: 'b', position: 5 });
  });
});

describe('Regex Validator', () => {
  it('rejects empty input', () => {
    expect(() => validateTokens([])).toThrow(/cannot be empty/);
    const result = processRegex('');
    expect(result.isValid).toBe(false);
    expect(result.error?.message).toMatch(/cannot be empty/);
  });

  it('rejects unclosed left parenthesis "("', () => {
    const tokens = tokenize('(');
    expect(() => validateTokens(tokens)).toThrow(/Unclosed parenthesis/);
  });

  it('rejects unclosed left parenthesis in "(a|b"', () => {
    const tokens = tokenize('(a|b');
    expect(() => validateTokens(tokens)).toThrow(/Unclosed parenthesis/);
  });

  it('rejects unexpected closing parenthesis in "a(b))"', () => {
    const tokens = tokenize('a(b))');
    expect(() => validateTokens(tokens)).toThrow(/Unexpected closing parenthesis/);
  });

  it('rejects leading union "|a"', () => {
    const tokens = tokenize('|a');
    expect(() => validateTokens(tokens)).toThrow(/Invalid union operator '|' at position 0/);
  });

  it('rejects trailing union "a|"', () => {
    const tokens = tokenize('a|');
    expect(() => validateTokens(tokens)).toThrow(/Invalid union operator '|' at position 1/);
  });

  it('rejects consecutive union "a||b"', () => {
    const tokens = tokenize('a||b');
    expect(() => validateTokens(tokens)).toThrow(/Invalid union operator at position 2/);
  });

  it('rejects leading star "*a"', () => {
    const tokens = tokenize('*a');
    expect(() => validateTokens(tokens)).toThrow(/Invalid star operator '\*' at position 0/);
  });

  it('rejects empty subexpressions "()"', () => {
    const tokens = tokenize('a()b');
    expect(() => validateTokens(tokens)).toThrow(/Empty subexpression/);
  });
});

describe('Explicit Concatenation', () => {
  it('converts "ab" into "a.b"', () => {
    const tokens = tokenize('ab');
    const withConcat = insertExplicitConcat(tokens);
    expect(formatExplicitConcat(withConcat)).toBe('a.b');
  });

  it('converts "(a|b)*abb" into "(a|b)*.a.b.b"', () => {
    const tokens = tokenize('(a|b)*abb');
    const withConcat = insertExplicitConcat(tokens);
    expect(formatExplicitConcat(withConcat)).toBe('(a|b)*.a.b.b');
  });

  it('converts "a(b|c)*" into "a.(b|c)*"', () => {
    const tokens = tokenize('a(b|c)*');
    const withConcat = insertExplicitConcat(tokens);
    expect(formatExplicitConcat(withConcat)).toBe('a.(b|c)*');
  });

  it('converts "(a)(b)" into "(a).(b)"', () => {
    const tokens = tokenize('(a)(b)');
    const withConcat = insertExplicitConcat(tokens);
    expect(formatExplicitConcat(withConcat)).toBe('(a).(b)');
  });
});

describe('Postfix Conversion (Shunting-Yard)', () => {
  it('directly converts token stream via toPostfix and formatPostfix', () => {
    const tokens = insertExplicitConcat(tokenize('a|b'));
    const postfixTokens = toPostfix(tokens);
    expect(formatPostfix(postfixTokens)).toBe('ab|');
  });

  const getPostfix = (expr: string) => {
    const res = processRegex(expr);
    if (!res.isValid) throw new Error(res.error?.message);
    return res.postfixString;
  };

  it('converts "a" -> "a"', () => {
    expect(getPostfix('a')).toBe('a');
  });

  it('converts "ab" -> "ab."', () => {
    expect(getPostfix('ab')).toBe('ab.');
  });

  it('converts "a|b" -> "ab|"', () => {
    expect(getPostfix('a|b')).toBe('ab|');
  });

  it('converts "a*" -> "a*"', () => {
    expect(getPostfix('a*')).toBe('a*');
  });

  it('converts "(a|b)*" -> "ab|*"', () => {
    expect(getPostfix('(a|b)*')).toBe('ab|*');
  });

  it('converts "(a|b)*abb" -> "ab|*a.b.b."', () => {
    expect(getPostfix('(a|b)*abb')).toBe('ab|*a.b.b.');
  });

  it('converts "a(b|c)*" -> "abc|*."', () => {
    expect(getPostfix('a(b|c)*')).toBe('abc|*.');
  });

  it('respects precedence where concatenation binds tighter than union: "a|bc" -> "abc.|"', () => {
    expect(getPostfix('a|bc')).toBe('abc.|');
  });

  it('supports numeric literals: "0(1|0)*1"', () => {
    const res = processRegex('0(1|0)*1');
    expect(res.isValid).toBe(true);
    expect(res.explicitConcatString).toBe('0.(1|0)*.1');
    expect(res.postfixString).toBe('010|*.1.');
  });
});

describe('Frontend Integration - Valid and Invalid test matrix', () => {
  const validInputs = [
    'a',
    'ab',
    'a|b',
    'a*',
    '(a|b)*',
    '(a|b)*abb',
    'a(b|c)*',
  ];

  validInputs.forEach((expr) => {
    it(`validates and processes "${expr}" successfully`, () => {
      const res = processRegex(expr);
      expect(res.isValid).toBe(true);
      expect(res.postfixTokens.length).toBeGreaterThan(0);
      expect(res.error).toBeUndefined();
    });
  });

  const invalidInputs = [
    { expr: '', desc: 'empty input' },
    { expr: '(', desc: 'single unclosed paren' },
    { expr: 'a|', desc: 'trailing union' },
    { expr: '|a', desc: 'leading union' },
    { expr: 'a||b', desc: 'consecutive union' },
    { expr: '*a', desc: 'leading star' },
    { expr: '(a|b', desc: 'unclosed parenthesis' },
    { expr: 'a(b))', desc: 'extra closing parenthesis' },
  ];

  invalidInputs.forEach(({ expr, desc }) => {
    it(`correctly identifies invalid input "${expr}" (${desc})`, () => {
      const res = processRegex(expr);
      expect(res.isValid).toBe(false);
      expect(res.error).toBeDefined();
      expect(res.error?.message.length).toBeGreaterThan(0);
    });
  });
});
