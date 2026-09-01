/** Phase-one environment-memory contract constants shared by producers and consumers. */
export const ENVIRONMENT_CONTRACT_LIMITS_V1 = Object.freeze({
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
export const ENVIRONMENT_DOCUMENT_NAMES_V1 = ['projection.json', 'environment-index.md', 'pillars/cost.md'];
export const ENVIRONMENT_ARTIFACT_KINDS_V1 = ['subscription-summary', 'subscription-resources', 'subscription-recommendations'];
