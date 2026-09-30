import type { Token } from './types';

/**
 * Determines whether token `t1` can end a subexpression or operand.
 */
function canEndSubexpression(token: Token): boolean {
  return (
    token.type === 'LITERAL' ||
    token.type === 'STAR' ||
    token.type === 'RPAREN'
  );
}

/**
 * Determines whether token `t2` can start a subexpression or operand.
 */
function canStartSubexpression(token: Token): boolean {
  return (
    token.type === 'LITERAL' ||
    token.type === 'LPAREN'
  );
}

/**
 * Inserts explicit concatenation tokens (`CONCAT`, represented visually as `.`)
 * between adjacent tokens where concatenation is implied.
 *
 * Examples:
 * - `ab` => `a.b`
 * - `(a|b)*abb` => `(a|b)*.a.b.b`
 * - `a(b|c)*` => `a.(b|c)*`
 *
 * @param tokens Validated token list
 * @returns New token list with explicit CONCAT tokens inserted
 */
export function insertExplicitConcat(tokens: Token[]): Token[] {
  if (tokens.length <= 1) {
    return [...tokens];
  }

  const result: Token[] = [tokens[0]];

  for (let i = 1; i < tokens.length; i++) {
    const prev = tokens[i - 1];
    const curr = tokens[i];

    if (canEndSubexpression(prev) && canStartSubexpression(curr)) {
      result.push({
        type: 'CONCAT',
        value: '.',
        position: curr.position,
      });
    }

    result.push(curr);
  }

  return result;
}

/**
 * Formats a stream of tokens into a readable string showing explicit concatenation.
 */
export function formatExplicitConcat(tokens: Token[]): string {
  return tokens.map((t) => t.value).join('');
}
