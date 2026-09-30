/**
 * Core type definitions for regular expression lexical analysis,
 * validation, and syntax transformation.
 */

export type TokenType =
  | 'LITERAL'
  | 'UNION'      // |
  | 'STAR'       // *
  | 'CONCAT'     // explicit concatenation operator: .
  | 'LPAREN'     // (
  | 'RPAREN';    // )

export interface Token {
  type: TokenType;
  value: string;
  position: number; // 0-based character index in original source
}

export interface RegexValidationError {
  message: string;
  position: number;
}

export interface ProcessedRegexResult {
  raw: string;
  normalized: string;
  isValid: boolean;
  error?: RegexValidationError;
  tokens: Token[];
  tokensWithConcat: Token[];
  postfixTokens: Token[];
  explicitConcatString: string;
  postfixString: string;
}
