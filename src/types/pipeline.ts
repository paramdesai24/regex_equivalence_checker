import type { ProcessedRegexResult } from '../automata/regex/types';

export type PipelineStage = 'input' | 'nfa' | 'dfa' | 'min-dfa' | 'equivalence';

export interface StageTabInfo {
  id: PipelineStage;
  label: string;
  shortDesc: string;
  badge?: string;
  isImplemented: boolean;
}

export interface PipelineComparisonState {
  regexA: string;
  regexB: string;
  resultA: ProcessedRegexResult | null;
  resultB: ProcessedRegexResult | null;
  hasCompared: boolean;
}
