export const ACTIVITY_LOG_TAXONOMY_VERSION = 'v1';
export const ACTIVITY_LOG_ANALYSIS_VERSION = 'v1';
export const CONFORMED_ACTIVITY_ANALYSIS_SCHEMA_VERSION = 1;
export const PORTAL_ACTIVITY_ANALYSIS_RESPONSE_SCHEMA_VERSION = 1;
export const CONFORMED_ACTIVITY_ANALYSIS_LIMITS_V1 = Object.freeze({
    sourceShardFingerprintCodeUnits: 512 * 1024,
});
export const PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1 = Object.freeze({
    tagAssignmentsPerEvent: 32,
    facetTagRows: 64,
    facetOperationRows: 4096,
    facetProviderRows: 512,
    facetResourceTypeRows: 4096,
    facetResultRows: 256,
    facetOperationEffectRows: 8,
    facetExecutionOriginRows: 8,
    activitySeries: 10000,
    resourceSummaries: 10000,
    operationSummaries: 4096,
    securitySensitive: 4096,
    powerPatterns: 4096,
    operationCountsPerItem: 256,
    resultCountsPerItem: 256,
    tagCountsPerItem: 64,
    executionOriginCountsPerItem: 8,
    evidenceIdsPerItem: 20,
    reasonCodesPerItem: 32,
    resourceIdCodeUnits: 2048,
    operationCodeUnits: 512,
    providerCodeUnits: 256,
    resourceTypeCodeUnits: 512,
    resourceNameCodeUnits: 512,
    reasonCodeUnits: 128,
    responseUtf8Bytes: 33554432,
});
export const ACTIVITY_LOG_TAG_IDS = [
    'actor.manual',
    'actor.workload-automation',
    'actor.azure-platform',
    'actor.unknown',
    'change.material',
    'intent.credential-access',
    'intent.remote-execution',
    'intent.power-control',
    'security.sensitive-operation',
    'security.credential-access',
    'security.remote-execution',
    'security.privileged-access-change',
    'security.security-boundary-change',
    'security.protection-control-change',
    'security.destructive-action',
    'scheduler.power-operation',
];
const CANONICAL_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const CONFORMED_ACTIVITY_ANALYSIS_NAME = /^activity-logs\/activity_analysis-(\d{4}-(?:0[1-9]|1[0-2]))\.json$/;
export function buildConformedActivityAnalysisLogicalName(month) {
    if (!CANONICAL_MONTH.test(month)) {
        throw new Error('Activity Analysis month must use canonical YYYY-MM format.');
    }
    return `activity-logs/activity_analysis-${month}.json`;
}
export function parseConformedActivityAnalysisLogicalName(logicalName) {
    return CONFORMED_ACTIVITY_ANALYSIS_NAME.exec(logicalName)?.[1];
}
