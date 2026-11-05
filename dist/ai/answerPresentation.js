"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAIChatAnswerPresentationV1 = exports.AI_CHAT_ANSWER_PRESENTATION_LIMITS_V1 = void 0;
const internal_js_1 = require("../environment/internal.js");
exports.AI_CHAT_ANSWER_PRESENTATION_LIMITS_V1 = Object.freeze({
    visualArtifacts: 3,
    artifacts: 5,
    artifactIdScalars: 128,
});
/** Consumers ignore unsupported optional presentation metadata without discarding the answer. */
const isAIChatAnswerPresentationV1 = (value) => {
    if (!(0, internal_js_1.isRecord)(value) ||
        !(0, internal_js_1.hasExactKeys)(value, ['schemaVersion', 'kind', 'artifactIds']) ||
        value.schemaVersion !== 1 ||
        (value.kind !== 'visual' && value.kind !== 'brief' && value.kind !== 'full') ||
        !Array.isArray(value.artifactIds) ||
        value.artifactIds.length > exports.AI_CHAT_ANSWER_PRESENTATION_LIMITS_V1.artifacts ||
        !value.artifactIds.every(id => (0, internal_js_1.isBoundedString)(id, exports.AI_CHAT_ANSWER_PRESENTATION_LIMITS_V1.artifactIdScalars, { trimmed: true, controls: true })) ||
        new Set(value.artifactIds).size !== value.artifactIds.length)
        return false;
    return (value.kind !== 'visual' || (value.artifactIds.length > 0 && value.artifactIds.length <= exports.AI_CHAT_ANSWER_PRESENTATION_LIMITS_V1.visualArtifacts));
};
exports.isAIChatAnswerPresentationV1 = isAIChatAnswerPresentationV1;
//# sourceMappingURL=answerPresentation.js.map