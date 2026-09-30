import type { Token, ProcessedRegexResult, RegexValidationError } from './types';
import { tokenize } from './tokenizer';
import { validateTokens } from './validator';
import { insertExplicitConcat, formatExplicitConcat } from './concatenation';
import { toPostfix, formatPostfix } from './postfix';

export * from './types';
export * from './tokenizer';
export * from './validator';
export * from './concatenation';
export * from './postfix';

/**
 * Parses and processes a regular expression string through the complete compiler frontend:
 * 1. Normalization & lexical analysis (Tokenization)
 * 2. Syntactic validation (Grammar & operator placement rules)
 * 3. Implicit concatenation insertion (Explicit '.' tokens)
 * 4. Postfix conversion using Dijkstra's Shunting-Yard algorithm
 *
 * @param input Raw regular expression from user
 * @returns Fully processed result with tokens, explicit forms, postfix, or structured error
 */
export function processRegex(input: string): ProcessedRegexResult {
  const raw = input;
  const normalized = input.trim();

  const emptyResult = (error?: RegexValidationError): ProcessedRegexResult => ({
    raw,
    normalized,
    isValid: false,
    error,
    tokens: [],
    tokensWithConcat: [],
    postfixTokens: [],
    explicitConcatString: '',
    postfixString: '',
  });

  if (!normalized) {
    return emptyResult({
      message: 'Regex expression cannot be empty.',
      position: 0,
    });
  }

  // 1. Tokenize
  let tokens: Token[];
  try {
    tokens = tokenize(raw);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    // Extract position if available from message
    const match = message.match(/position (\d+)/);
    const position = match ? parseInt(match[1], 10) : 0;
    return emptyResult({ message, position });
  }

  // 2. Validate
  try {
    validateTokens(tokens);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const match = message.match(/position (\d+)/);
    const position = match ? parseInt(match[1], 10) : 0;
    return {
      raw,
      normalized,
      isValid: false,
      error: { message, position },
      tokens,
      tokensWithConcat: [],
      postfixTokens: [],
      explicitConcatString: '',
      postfixString: '',
    };
  }

  // 3. Insert Explicit Concatenation
  const tokensWithConcat = insertExplicitConcat(tokens);
  const explicitConcatString = formatExplicitConcat(tokensWithConcat);

  // 4. Convert to Postfix (Shunting-Yard)
  let postfixTokens: Token[] = [];
  let postfixString = '';
  try {
    postfixTokens = toPostfix(tokensWithConcat);
    postfixString = formatPostfix(postfixTokens);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      raw,
      normalized,
      isValid: false,
      error: { message, position: 0 },
      tokens,
      tokensWithConcat,
      postfixTokens: [],
      explicitConcatString,
      postfixString: '',
    };
  }

  return {
    raw,
    normalized,
    isValid: true,
    tokens,
    tokensWithConcat,
    postfixTokens,
    explicitConcatString,
    postfixString,
  };
}
