"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENVIRONMENT_ARTIFACT_KINDS_V1 = exports.ENVIRONMENT_DOCUMENT_NAMES_V1 = exports.ENVIRONMENT_CONTRACT_LIMITS_V1 = void 0;
/** Phase-one environment-memory contract constants shared by producers and consumers. */
exports.ENVIRONMENT_CONTRACT_LIMITS_V1 = Object.freeze({
    completedPointerBytes: 16 * 1024,
    projectionBytes: 64 * 1024,
    environmentIndexBytes: 4 * 1024,
    costPillarBytes: 8 * 1024,
    boundedListItems: 50,
    customerStringScalars: 4096,
    safeLabelScalars: 512,
    scopeIdentifierScalars: 2048,
    environmentRunIdAsciiCharacters: 128,
    sourceIdentityScalars: 256,
    logicalReferencePayloadBytes: 4 * 1024,
    validatedContainerDepth: 8,
});
exports.ENVIRONMENT_DOCUMENT_NAMES_V1 = ['projection.json', 'environment-index.md', 'pillars/cost.md'];
exports.ENVIRONMENT_ARTIFACT_KINDS_V1 = ['subscription-summary', 'subscription-resources', 'subscription-recommendations'];
//# sourceMappingURL=contracts.js.map