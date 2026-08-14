import { sha256AwsPluginIdentity } from './pluginPublicArtifacts.js';
export const AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION = 1;
export const AWS_PORTAL_RESOURCE_COLLECTION_LOGICAL_NAME = 'resources.json.gz';
export const AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME = 'account-summary.json.gz';
export const AWS_PORTAL_ACCOUNT_SUMMARY_AI_COST_SUMMARY_LOGICAL_NAME = 'account-summary-ai-cost-summary.json.gz';
export function buildAwsPortalResourceCollectionHistoryLogicalName(identitySha256) {
    assertSha256(identitySha256, 'identitySha256');
    return `resources-history--${identitySha256}.json.gz`;
}
export function buildAwsPortalAccountSummaryHistoryLogicalName(identitySha256) {
    assertSha256(identitySha256, 'identitySha256');
    return `account-summary-history--${identitySha256}.json.gz`;
}
export function buildAwsPortalResourceCollectionHistoryIdentityKey(scope, generatedAt) {
    return [
        'resource-collection-history',
        scope.provider,
        scope.accountId,
        scope.billing.source,
        scope.billing.source === 'cur' ? `report:${scope.billing.reportName}` : `export:${scope.billing.exportName}`,
        scope.billing.billingPeriod.start,
        scope.billing.billingPeriod.end,
        scope.resourceRegions.join(','),
        scope.metricTimeWindow.start,
        scope.metricTimeWindow.end,
        ...(scope.tagRuleScope ? [`tag-rules:company:${scope.tagRuleScope.companyId}`] : []),
        generatedAt,
    ].join('|');
}
export function buildAwsPortalResourceCollectionHistoryLogicalNameForScope(scope, generatedAt) {
    return buildAwsPortalResourceCollectionHistoryLogicalName(sha256Text(buildAwsPortalResourceCollectionHistoryIdentityKey(scope, generatedAt)));
}
export function buildAwsPortalAccountSummaryHistoryIdentityKey(scope) {
    return [
        'account-summary-history',
        scope.provider,
        scope.accountId,
        scope.billing.source,
        scope.billing.source === 'cur' ? `report:${scope.billing.reportName}` : `export:${scope.billing.exportName}`,
        scope.resourceRegions.join(','),
        scope.billing.billingPeriod.start,
        scope.billing.billingPeriod.end,
    ].join('|');
}
export function buildAwsPortalAccountSummaryHistoryLogicalNameForScope(scope) {
    return buildAwsPortalAccountSummaryHistoryLogicalName(sha256Text(buildAwsPortalAccountSummaryHistoryIdentityKey(scope)));
}
export function buildAwsPortalAccountSummaryTargetKey(scope) {
    return [
        'account-summary',
        scope.provider,
        scope.accountId,
        scope.billing.source,
        scope.billing.source === 'cur' ? `report:${scope.billing.reportName}` : `export:${scope.billing.exportName}`,
        scope.billing.billingPeriod.start,
        scope.billing.billingPeriod.end,
        scope.resourceRegions.join(','),
        scope.metricTimeWindow.start,
        scope.metricTimeWindow.end,
        ...(scope.comparisonBillingPeriod ? [`comparison:${scope.comparisonBillingPeriod.start}:${scope.comparisonBillingPeriod.end}`] : []),
    ].join('|');
}
export function buildAwsPortalAccountSummaryAiCostSummaryTargetKey(scope, audience) {
    const sourceTargetKey = buildAwsPortalAccountSummaryTargetKey(scope);
    return `account-summary-ai-cost-summary|${sourceTargetKey.slice('account-summary|'.length)}|audience:${audience}`;
}
function assertSha256(value, field) {
    if (!/^[a-f0-9]{64}$/.test(value))
        throw new Error(`${field} must be a lowercase hexadecimal SHA-256.`);
}
function sha256Text(value) {
    return sha256AwsPluginIdentity(value);
}
