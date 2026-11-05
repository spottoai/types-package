import { hasExactKeys, isBoundedString, isRecord } from '../environment/internal.js';
export const AI_CHAT_ANSWER_PRESENTATION_LIMITS_V1 = Object.freeze({
    visualArtifacts: 3,
    artifacts: 5,
    artifactIdScalars: 128,
});
/** Consumers ignore unsupported optional presentation metadata without discarding the answer. */
export const isAIChatAnswerPresentationV1 = (value) => {
    if (!isRecord(value) ||
        !hasExactKeys(value, ['schemaVersion', 'kind', 'artifactIds']) ||
        value.schemaVersion !== 1 ||
        (value.kind !== 'visual' && value.kind !== 'brief' && value.kind !== 'full') ||
        !Array.isArray(value.artifactIds) ||
        value.artifactIds.length > AI_CHAT_ANSWER_PRESENTATION_LIMITS_V1.artifacts ||
        !value.artifactIds.every(id => isBoundedString(id, AI_CHAT_ANSWER_PRESENTATION_LIMITS_V1.artifactIdScalars, { trimmed: true, controls: true })) ||
        new Set(value.artifactIds).size !== value.artifactIds.length)
        return false;
    return (value.kind !== 'visual' || (value.artifactIds.length > 0 && value.artifactIds.length <= AI_CHAT_ANSWER_PRESENTATION_LIMITS_V1.visualArtifacts));
};
