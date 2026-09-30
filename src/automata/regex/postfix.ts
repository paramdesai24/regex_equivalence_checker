import type { Token, TokenType } from './types';

/**
 * Returns the operator precedence for Shunting-Yard algorithm.
 * Higher number indicates higher binding precedence.
 *
 * 1. Union (|) = 1
 * 2. Concatenation (.) = 2
 * 3. Star (*) = 3 (unary postfix)
 */
function getPrecedence(type: TokenType): number {
  switch (type) {
    case 'UNION':
      return 1;
    case 'CONCAT':
      return 2;
    case 'STAR':
      return 3;
    default:
      return 0;
  }
}

/**
 * Converts an explicit-concatenation token stream into Postfix (Reverse Polish)
 * notation using the Dijkstra Shunting-Yard algorithm adapted for regular expressions.
 *
 * @param tokens Tokens with explicit CONCAT tokens inserted
 * @returns Token array in postfix order
 */
export function toPostfix(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const opStack: Token[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'LITERAL':
        output.push(token);
        break;

      case 'STAR':
        // Kleene star is a unary postfix operator that immediately binds to
        // the top operand/subexpression on the output queue.
        output.push(token);
        break;

      case 'LPAREN':
        opStack.push(token);
        break;

      case 'RPAREN':
        while (opStack.length > 0 && opStack[opStack.length - 1].type !== 'LPAREN') {
          output.push(opStack.pop()!);
        }
        if (opStack.length === 0) {
          throw new Error(`Mismatched parenthesis at position ${token.position}`);
        }
        // Discard the matching LPAREN
        opStack.pop();
        break;

      case 'CONCAT':
      case 'UNION':
        // Both CONCAT (.) and UNION (|) are left-associative binary operators
        while (
          opStack.length > 0 &&
          opStack[opStack.length - 1].type !== 'LPAREN' &&
          getPrecedence(opStack[opStack.length - 1].type) >= getPrecedence(token.type)
        ) {
          output.push(opStack.pop()!);
        }
        opStack.push(token);
        break;
    }
  }

  // Drain remaining operators from stack
  while (opStack.length > 0) {
    const op = opStack.pop()!;
    if (op.type === 'LPAREN' || op.type === 'RPAREN') {
      throw new Error(`Mismatched parenthesis in expression.`);
    }
    output.push(op);
  }

  return output;
}

/**
 * Formats a postfix token array into a readable string.
 * Example: `[a, b, |, *, a, ., b, ., b, .]` => `ab|*a.b.b.`
 */
export function formatPostfix(tokens: Token[]): string {
  return tokens.map((t) => t.value).join('');
}
