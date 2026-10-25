import { hasExactKeys, isBoundedString, isRecord } from '../environment/internal.js';

export const AI_CHAT_ANSWER_PRESENTATION_LIMITS_V1 = Object.freeze({
  visualArtifacts: 3,
  artifacts: 5,
  artifactIdScalars: 128,
} as const);

/** Server-owned final presentation, independent of response mode, route and model confidence. */
export interface AIChatAnswerPresentationV1 {
  schemaVersion: 1;
  kind: 'visual' | 'brief' | 'full';
  /** References to accepted artifacts in this response, in reading order. */
  artifactIds: string[];
}

/** Consumers ignore unsupported optional presentation metadata without discarding the answer. */
export const isAIChatAnswerPresentationV1 = (value: unknown): value is AIChatAnswerPresentationV1 => {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ['schemaVersion', 'kind', 'artifactIds']) ||
    value.schemaVersion !== 1 ||
    (value.kind !== 'visual' && value.kind !== 'brief' && value.kind !== 'full') ||
    !Array.isArray(value.artifactIds) ||
    value.artifactIds.length > AI_CHAT_ANSWER_PRESENTATION_LIMITS_V1.artifacts ||
    !value.artifactIds.every(id => isBoundedString(id, AI_CHAT_ANSWER_PRESENTATION_LIMITS_V1.artifactIdScalars, { trimmed: true, controls: true })) ||
    new Set(value.artifactIds).size !== value.artifactIds.length
  )
    return false;
  return (
    value.kind !== 'visual' || (value.artifactIds.length > 0 && value.artifactIds.length <= AI_CHAT_ANSWER_PRESENTATION_LIMITS_V1.visualArtifacts)
  );
};
