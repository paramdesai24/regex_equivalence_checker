import type { Token } from './types';

/**
 * Validates a stream of regular expression tokens according to formal grammar rules.
 * Throws an Error with position information if any syntax violation is detected.
 *
 * Rules:
 * 1. Tokens must not be empty.
 * 2. Parentheses must be strictly balanced.
 * 3. Empty subexpressions `()` are rejected.
 * 4. Kleene star `*` must be preceded by an operand (LITERAL, RPAREN).
 * 5. Union `|` must have a valid non-empty operand on both sides.
 *    - Cannot appear at the start or immediately after `(`
 *    - Cannot appear at the end or immediately before `)`
 *    - Cannot be consecutive: `a||b`
 */
export function validateTokens(tokens: Token[]): void {
  if (tokens.length === 0) {
    throw new Error('Regex expression cannot be empty.');
  }

  // 1. Parentheses balance check with stack
  const parenStack: number[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'LPAREN') {
      parenStack.push(token.position);
    } else if (token.type === 'RPAREN') {
      if (parenStack.length === 0) {
        throw new Error(`Unexpected closing parenthesis ')' at position ${token.position}.`);
      }
      parenStack.pop();
    }
  }

  if (parenStack.length > 0) {
    const unclosedPos = parenStack[parenStack.length - 1];
    throw new Error(`Unclosed parenthesis '(' at position ${unclosedPos}.`);
  }

  // 2. Syntax and operator placement validation
  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i];
    const prev = i > 0 ? tokens[i - 1] : null;
    const next = i < tokens.length - 1 ? tokens[i + 1] : null;

    // Check empty subexpression `()`
    if (current.type === 'LPAREN' && next && next.type === 'RPAREN') {
      throw new Error(`Empty subexpression '()' at position ${current.position}.`);
    }

    // Check Kleene Star `*`
    if (current.type === 'STAR') {
      if (!prev) {
        throw new Error(
          `Invalid star operator '*' at position ${current.position}: missing preceding expression.`
        );
      }
      if (prev.type === 'LPAREN') {
        throw new Error(
          `Invalid star operator '*' at position ${current.position}: cannot follow open parenthesis '('.`
        );
      }
      if (prev.type === 'UNION') {
        throw new Error(
          `Invalid star operator '*' at position ${current.position}: cannot follow union operator '|'.`
        );
      }
      if (prev.type === 'STAR') {
        throw new Error(
          `Redundant or invalid consecutive star '*' at position ${current.position}.`
        );
      }
    }

    // Check Union `|`
    if (current.type === 'UNION') {
      // Left-side validation
      if (!prev) {
        throw new Error(
          `Invalid union operator '|' at position ${current.position}: missing left-hand expression.`
        );
      }
      if (prev.type === 'UNION') {
        throw new Error(`Invalid union operator at position ${current.position}.`);
      }
      if (prev.type === 'LPAREN') {
        throw new Error(
          `Invalid union operator '|' at position ${current.position}: missing left-hand expression.`
        );
      }

      // Right-side validation
      if (!next) {
        throw new Error(
          `Invalid union operator '|' at position ${current.position}: missing right-hand expression.`
        );
      }
      if (next.type === 'RPAREN') {
        throw new Error(
          `Invalid union operator '|' at position ${current.position}: missing right-hand expression.`
        );
      }
      if (next.type === 'UNION') {
        throw new Error(`Invalid union operator at position ${next.position}.`);
      }
    }
  }
}
