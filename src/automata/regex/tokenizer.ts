import type { Token, TokenType } from './types';

/**
 * Checks whether a character is a valid literal symbol.
 * Supported literals: alphanumeric characters (a-z, A-Z, 0-9).
 * Can be extended easily for Greek epsilon 'ε' or other alphabet symbols.
 */
export function isLiteralChar(char: string): boolean {
  return /^[a-zA-Z0-9ε]$/.test(char);
}

/**
 * Tokenizes a raw regular expression string into a sequence of Tokens.
 * Whitespace is skipped while maintaining accurate character offsets for diagnostics.
 *
 * @throws Error if an unrecognized character is encountered
 */
export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    // Skip whitespace
    if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
      continue;
    }

    let type: TokenType;

    switch (char) {
      case '(':
        type = 'LPAREN';
        break;
      case ')':
        type = 'RPAREN';
        break;
      case '|':
        type = 'UNION';
        break;
      case '*':
        type = 'STAR';
        break;
      default:
        if (isLiteralChar(char)) {
          type = 'LITERAL';
        } else {
          throw new Error(
            `Unsupported character '${char}' at position ${i}. Only alphanumeric characters and operators (, ), |, * are supported.`
          );
        }
    }

    tokens.push({
      type,
      value: char,
      position: i,
    });
  }

  return tokens;
}
