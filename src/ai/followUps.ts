import { hasExactKeys, isBoundedString, isRecord } from '../environment/internal.js';
import type { AIChatWorkspaceInternalLink } from './workspaceArtifacts.js';

export const AI_CHAT_FOLLOW_UP_LIMITS_V1 = Object.freeze({
  suggestions: 3,
  identifierScalars: 64,
  textScalars: 160,
} as const);

/**
 * A follow-up question derived from the answer it accompanies (for example a drill-down on the top item).
 * Selecting one sends `text` as the next question; it carries no hidden instructions or tool arguments.
 */
export interface AIChatFollowUpSuggestionV1 {
  suggestionId: string;
  text: string;
}

const isSuggestion = (value: unknown): value is AIChatFollowUpSuggestionV1 =>
  isRecord(value) &&
  hasExactKeys(value, ['suggestionId', 'text']) &&
  isBoundedString(value.suggestionId, AI_CHAT_FOLLOW_UP_LIMITS_V1.identifierScalars, { trimmed: true, controls: true }) &&
  isBoundedString(value.text, AI_CHAT_FOLLOW_UP_LIMITS_V1.textScalars, { trimmed: true, controls: true });

/** Strictly validates a bounded list of follow-up suggestions with unique ids and unique text. */
export const isAIChatFollowUpSuggestions = (value: unknown): value is AIChatFollowUpSuggestionV1[] =>
  Array.isArray(value) &&
  value.length <= AI_CHAT_FOLLOW_UP_LIMITS_V1.suggestions &&
  value.every(isSuggestion) &&
  new Set(value.map(suggestion => suggestion.suggestionId)).size === value.length &&
  new Set(value.map(suggestion => suggestion.text.toLowerCase())).size === value.length;

/**
 * An answer-level navigation button (interactive answers, 1.1.24). Built by the server from the turn's own visuals and
 * resolved scope, never named by the model; the route is always a company-anchored Portal route, which the Portal
 * re-checks against its own allowlist.
 */
export interface AIChatAnswerNextActionV1 {
  actionId: string;
  /** Title Case, at most 40 characters, product-agnostic. */
  label: string;
  link: AIChatWorkspaceInternalLink;
}

export const AI_CHAT_ANSWER_NEXT_ACTION_LIMITS_V1 = Object.freeze({ actions: 3, labelChars: 40 } as const);

/** A drill-down click: opaque references only. The server rebuilds the question from its stored binding. */
export interface AIChatDrillDownInvocationV1 {
  turnId: string;
  artifactId: string;
  elementKey: string;
}
