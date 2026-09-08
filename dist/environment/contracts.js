"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENVIRONMENT_EFFORTS_V1 = exports.ENVIRONMENT_IMPACTS_V1 = exports.ENVIRONMENT_SEVERITIES_V1 = exports.ENVIRONMENT_FINDING_KINDS_V1 = exports.ENVIRONMENT_ARTIFACT_KINDS_V1 = exports.ENVIRONMENT_DOCUMENT_NAMES_V1 = exports.ENVIRONMENT_PILLARS_V1 = exports.ENVIRONMENT_CONTRACT_LIMITS_V1 = void 0;
/** Single pre-release multi-pillar environment contract shared by producers and consumers. */
exports.ENVIRONMENT_CONTRACT_LIMITS_V1 = Object.freeze({
    completedPointerBytes: 16 * 1024,
    projectionBytes: 256 * 1024,
    environmentIndexBytes: 8 * 1024,
    pillarDocumentBytes: 8 * 1024,
    boundedListItems: 50,
    /**
     * Row cap for the optional structured detail sections. Deliberately far below
     * `boundedListItems`: the core lists already consume most of the projection byte budget,
     * and a detail section is a summary, not an inventory.
     */
    sectionListItems: 10,
    customerStringScalars: 4096,
    safeLabelScalars: 512,
    scopeIdentifierScalars: 2048,
    environmentRunIdAsciiCharacters: 128,
    sourceIdentityScalars: 256,
    logicalReferencePayloadBytes: 4 * 1024,
    validatedContainerDepth: 10,
});
exports.ENVIRONMENT_PILLARS_V1 = ['cost', 'security', 'governance', 'reliability', 'performance', 'operations'];
exports.ENVIRONMENT_DOCUMENT_NAMES_V1 = [
    'projection.json',
    'environment-index.md',
    'pillars/cost.md',
    'pillars/security.md',
    'pillars/governance.md',
    'pillars/reliability.md',
    'pillars/performance.md',
    'pillars/operations.md',
];
exports.ENVIRONMENT_ARTIFACT_KINDS_V1 = [
    'subscription-summary',
    'subscription-resources',
    'subscription-recommendations',
    'subscription-service-retirements',
    'subscription-monitor-alerts',
    'subscription-data-protection',
    'subscription-system-tracks',
    'subscription-metrics',
    // API-issued evidence kind: a bounded projection of one compiled `projection.json` detail section
    // (commitments, budgets, idle resources, ...). Never emitted by the compiler as a source reference.
    'subscription-projection',
    'tenant-governance',
    'tenant-governance-access',
    'tenant-reservations',
    'tenant-savings-plans',
    'tenant-applications',
    'tenant-service-principals',
];
exports.ENVIRONMENT_FINDING_KINDS_V1 = [
    'recommendation',
    'security-posture',
    'public-exposure',
    'governance',
    'compliance',
    'service-retirement',
    'data-protection',
    'health',
    'performance',
    'scaling',
    'operations',
    'monitoring',
    'topology',
];
exports.ENVIRONMENT_SEVERITIES_V1 = ['critical', 'high', 'medium', 'low', 'informational', 'unknown'];
exports.ENVIRONMENT_IMPACTS_V1 = ['high', 'medium', 'low', 'unknown'];
exports.ENVIRONMENT_EFFORTS_V1 = ['high', 'medium', 'low', 'unknown'];
//# sourceMappingURL=contracts.js.map