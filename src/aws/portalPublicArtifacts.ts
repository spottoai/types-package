import type { JsonObject, JsonValue } from '../common/artifactGeneration';
import type { AwsPublicArtifactEnvelope } from './publicArtifacts';
import type { AwsPortalAiAudience } from './portalPublicArtifactHistoryTypes';
import type {
  AwsPortalBillingBenefitCoverage,
  AwsPortalBillingBenefitCoverageWarning,
  AwsPortalBillingCommitmentSpend,
  AwsPortalBillingCostView,
  AwsPortalRecommendationLatestActionExecution,
  AwsPortalRecommendationSavingsVerification,
  AwsPortalRecommendationTemplateProvenanceSource,
} from './portalPublicArtifactNestedEvidence';
import { sha256AwsPluginIdentity } from './pluginPublicArtifacts';

export const AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION = 1 as const;
export const AWS_PORTAL_RESOURCE_COLLECTION_LOGICAL_NAME = 'resources.json.gz' as const;
export const AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME = 'account-summary.json.gz' as const;
export const AWS_PORTAL_ACCOUNT_SUMMARY_AI_COST_SUMMARY_LOGICAL_NAME = 'account-summary-ai-cost-summary.json.gz' as const;

export type AwsPortalHistorySha256 = string;
export type AwsPortalResourceCollectionHistoryLogicalName = `resources-history--${string}.json.gz`;
export type AwsPortalAccountSummaryHistoryLogicalName = `account-summary-history--${string}.json.gz`;
export type AwsPortalPublicLogicalName =
  | typeof AWS_PORTAL_RESOURCE_COLLECTION_LOGICAL_NAME
  | typeof AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME
  | typeof AWS_PORTAL_ACCOUNT_SUMMARY_AI_COST_SUMMARY_LOGICAL_NAME
  | AwsPortalResourceCollectionHistoryLogicalName
  | AwsPortalAccountSummaryHistoryLogicalName;

export function buildAwsPortalResourceCollectionHistoryLogicalName(
  identitySha256: AwsPortalHistorySha256
): AwsPortalResourceCollectionHistoryLogicalName {
  assertSha256(identitySha256, 'identitySha256');
  return `resources-history--${identitySha256}.json.gz`;
}

export function buildAwsPortalAccountSummaryHistoryLogicalName(identitySha256: AwsPortalHistorySha256): AwsPortalAccountSummaryHistoryLogicalName {
  assertSha256(identitySha256, 'identitySha256');
  return `account-summary-history--${identitySha256}.json.gz`;
}

export interface AwsPortalBillingPeriod {
  start: string;
  end: string;
}

export type AwsPortalBillingScope =
  | { source: 'cur'; reportName: string; billingPeriod: AwsPortalBillingPeriod }
  | { source: 'cur-2.0-data-exports'; exportName: string; billingPeriod: AwsPortalBillingPeriod };

export interface AwsPortalMetricTimeWindow {
  start: string;
  end: string;
}

export interface AwsPortalResourceCollectionScope<AccountId extends string = string> {
  provider: 'aws';
  accountId: AccountId;
  billing: AwsPortalBillingScope;
  resourceRegions: string[];
  metricTimeWindow: AwsPortalMetricTimeWindow;
  tagRuleScope?: { companyId: string };
}

export interface AwsPortalAccountSummaryScope<AccountId extends string = string> {
  provider: 'aws';
  accountId: AccountId;
  billing: AwsPortalBillingScope;
  comparisonBillingPeriod?: AwsPortalBillingPeriod;
  resourceRegions: string[];
  metricTimeWindow: AwsPortalMetricTimeWindow;
}

export function buildAwsPortalResourceCollectionHistoryIdentityKey(scope: AwsPortalResourceCollectionScope, generatedAt: string): string {
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

export function buildAwsPortalResourceCollectionHistoryLogicalNameForScope(
  scope: AwsPortalResourceCollectionScope,
  generatedAt: string
): AwsPortalResourceCollectionHistoryLogicalName {
  return buildAwsPortalResourceCollectionHistoryLogicalName(sha256Text(buildAwsPortalResourceCollectionHistoryIdentityKey(scope, generatedAt)));
}

export function buildAwsPortalAccountSummaryHistoryIdentityKey(
  scope: Omit<AwsPortalAccountSummaryScope, 'comparisonBillingPeriod' | 'metricTimeWindow'>
): string {
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

export function buildAwsPortalAccountSummaryHistoryLogicalNameForScope(
  scope: Omit<AwsPortalAccountSummaryScope, 'comparisonBillingPeriod' | 'metricTimeWindow'>
): AwsPortalAccountSummaryHistoryLogicalName {
  return buildAwsPortalAccountSummaryHistoryLogicalName(sha256Text(buildAwsPortalAccountSummaryHistoryIdentityKey(scope)));
}

export function buildAwsPortalAccountSummaryTargetKey(scope: AwsPortalAccountSummaryScope): string {
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

export function buildAwsPortalAccountSummaryAiCostSummaryTargetKey(scope: AwsPortalAccountSummaryScope, audience: AwsPortalAiAudience): string {
  const sourceTargetKey = buildAwsPortalAccountSummaryTargetKey(scope);
  return `account-summary-ai-cost-summary|${sourceTargetKey.slice('account-summary|'.length)}|audience:${audience}`;
}

export type AwsPortalDiscoveryFamily =
  | 'ec2-instance'
  | 'ebs-volume'
  | 'efs-file-system'
  | 'lambda-function'
  | 'elasticache-cache-cluster'
  | 'elasticache-serverless-cache'
  | 'vpc'
  | 'subnet'
  | 'route-table'
  | 'internet-gateway'
  | 'nat-gateway'
  | 'network-interface'
  | 'virtual-private-gateway'
  | 'load-balancer-v2'
  | 'classic-load-balancer'
  | 'security-group'
  | 'rds-db-cluster'
  | 'rds-db-instance';

export type AwsPortalMetricFamily =
  | 'ec2-core-utilization'
  | 'ebs-volume-performance'
  | 'lambda-function-performance'
  | 'load-balancer-v2-network-traffic'
  | 'load-balancer-v2-application-traffic'
  | 'rds-db-instance-utilization';

export type AwsPortalRecommendationSource =
  | 'custom'
  | 'compute-optimizer'
  | 'cost-optimization-hub'
  | 'resilience-hub'
  | 'security-hub'
  | 'trusted-advisor'
  | 'well-architected';

export interface AwsPortalFreshness {
  lastSuccessfulRefreshAt?: string;
  hasSuccessfulRefresh: boolean;
}

export interface AwsPortalBillingFreshness {
  lastSuccessfulImportAt?: string;
  hasSuccessfulImport: boolean;
}

export interface AwsPortalBillingEvidenceScope<AccountId extends string = string> {
  provider: 'aws';
  source: 'cur' | 'cur-2.0-data-exports';
  scope: 'account';
  accountId: AccountId;
  reportName: string;
  billingPeriod: AwsPortalBillingPeriod;
}

export interface AwsPortalBillingSummary {
  totalPersistedExpenseCount: number;
  emptyScope: boolean;
  metadataFound: boolean;
  metadataMatchesRequestedBillingPeriod: boolean;
}

export interface AwsPortalBillingCostAggregate {
  currency: string;
  expenseCount: number;
  baseCostAmount: number;
  amortizedCostAmount?: number;
  amortizedExpenseCount?: number;
}

export interface AwsPortalBillingGroupedResult<Item extends object = JsonObject> {
  totalGroupCount: number;
  returnedGroupCount: number;
  truncated: boolean;
  items: Item[];
}

export type AwsPortalBillingLabeledCost<Label extends string> = AwsPortalBillingCostAggregate & {
  [Key in Label]: string;
};

export interface AwsPortalVirtualTagEvidence {
  status: 'available' | 'missing' | 'malformed' | 'unsupported';
  source: 'spotto-tags';
  generatedAt: string;
  rulesHash?: string;
  enabledRuleCount: number;
  appliedRuleCount: number;
  taggedResourceCount: number;
  unsupportedRuleCount: number;
  reason?: string;
}

export interface AwsPortalRecommendationScope<AccountId extends string = string> {
  provider: 'aws';
  source: AwsPortalRecommendationSource;
  scope: 'account';
  accountId: AccountId;
  resourceRegions: string[];
}

export interface AwsPortalRecommendationCoverage<AccountId extends string = string> {
  source: AwsPortalRecommendationSource;
  scope: AwsPortalRecommendationScope<AccountId>;
  summary: AwsPortalRecommendationSummary;
  counts: AwsPortalRecommendationCounts;
  savings: AwsPortalRecommendationSavings;
  sourceEvidence?: AwsPortalRecommendationSourceEvidence;
  actionHealth?: AwsPortalRecommendationActionHealth;
}

export interface AwsPortalRecommendationSummary {
  totalStateCount: number;
  currentStateCount: number;
  missingStateCount: number;
  snapshotBackedCount: number;
  orphanSnapshotCount: number;
  matchedStateCount: number;
  filteredOutStateCount: number;
  emptyScope: boolean;
  emptyResult: boolean;
}

export interface AwsPortalRecommendationCounts {
  byLifecycleStatus: Array<{ lifecycleStatus: string; count: number }>;
  bySourcePresence: Array<{ sourcePresence: string; count: number }>;
  byCategory: Array<{ category: string; count: number }>;
  byRegion: Array<{ region: string; count: number }>;
  bySourceService: Array<{ sourceService: string; count: number }>;
  byResourceType: Array<{ resourceType: string; count: number }>;
  byActionType: Array<{ actionType: string; count: number }>;
  byImplementationEffort: Array<{ implementationEffort: string; count: number }>;
}

export interface AwsPortalRecommendationSavings {
  snapshotBackedMatchedCount: number;
  positiveEstimatedSavingsRecommendationCount: number;
  nonPositiveEstimatedSavingsCount: number;
  missingEstimatedSavingsCount: number;
  missingCurrencyCodeCount: number;
  emptySavings: boolean;
  mixedCurrencies: boolean;
  byCurrency: Array<{
    currencyCode: string;
    recommendationCount: number;
    totalEstimatedMonthlySavings: number;
  }>;
}

export interface AwsPortalRecommendationSourceEvidence extends AwsPortalRecommendationSummary {
  partialSourceEvidence: boolean;
  oldestRecommendationSynchronizedAt?: string;
  latestRecommendationSynchronizedAt?: string;
  exactScopeCoverage?: JsonObject;
}

export interface AwsPortalRecommendationActionHealth {
  latestActionCount: number;
  byLatestActionStatus: Array<{ status: string; count: number }>;
}

export interface AwsPortalRecommendationActionability {
  latestActionStableMaterializationKey: string;
  latestActionExecution: AwsPortalRecommendationLatestActionExecution;
  savingsVerification?: AwsPortalRecommendationSavingsVerification;
}

export interface AwsPortalRecommendationTemplateProvenance {
  status: 'available-no-template-items' | 'missing-template-evidence' | 'missing-confidence-evidence' | 'available-with-confidence';
  templateBackedRecommendationCount: number;
  missingTemplateRecommendationCount: number;
  internalTemplateCount: number;
  externalTemplateCount: number;
  confidenceBackedRecommendationCount: number;
  templateRecommendationWithoutConfidenceCount: number;
  lowestConfidenceSources: AwsPortalRecommendationTemplateProvenanceSource[];
  minimumConfidencePercentage?: number;
  maximumConfidencePercentage?: number;
  averageConfidencePercentage?: number;
}

export interface AwsPortalResourceDetailItem {
  stableKey: string;
  family: AwsPortalDiscoveryFamily;
  resourceRegion: string;
  resourceType: string;
  resourceArn?: string;
  resourceId?: string;
  resourceName?: string;
  tags?: Record<string, string>;
  spottoTags?: Record<string, { v: string; a: number }>;
  discovery: { freshness: AwsPortalFreshness; summary: JsonObject };
  billing?: {
    costProvenance: { costSource: 'billing'; costSourceConfidence: 'high' };
    matchedExpenseCount: number;
    totalsByCurrency: AwsPortalBillingCostAggregate[];
    costViewByCurrency: AwsPortalBillingCostView[];
    commitmentSpend: AwsPortalBillingCommitmentSpend;
    benefitsCoverage?: AwsPortalBillingBenefitCoverage;
    coverageWarning?: AwsPortalBillingBenefitCoverageWarning;
  };
  metrics?: {
    supported: boolean;
    families: Array<{ metricFamily: AwsPortalMetricFamily; summary: JsonObject; coverage: JsonObject }>;
  };
  recommendations?: {
    matchedRecommendationCount: number;
    sources: AwsPortalRecommendationSource[];
    actionability?: AwsPortalRecommendationActionability;
    templateProvenance?: AwsPortalRecommendationTemplateProvenance;
    counts: JsonObject;
    savings: JsonObject;
  };
}

export interface AwsPortalResourceCollectionBody<AccountId extends string = string> {
  generatedAt: string;
  scope: AwsPortalResourceCollectionScope<AccountId>;
  summary: {
    totalDiscoveredResourceCount: number;
    returnedResourceCount: number;
    emptyCollection: boolean;
    truncated: boolean;
    unmatchedRecommendationResourceCount: number;
    unmatchedBillingExpenseCount: number;
  };
  coverage: {
    billing: {
      scope: AwsPortalBillingEvidenceScope<AccountId>;
      freshness: AwsPortalBillingFreshness;
      summary: AwsPortalBillingSummary;
      totalsByCurrency: AwsPortalBillingGroupedResult<AwsPortalBillingCostAggregate>;
      pricingReferenceEstimation?: JsonObject;
      estimatedBillingAuthority?: JsonObject;
    };
    discovery: {
      families: Array<{
        family: AwsPortalDiscoveryFamily;
        resourceRegion: string;
        freshness: AwsPortalFreshness;
        summary: JsonObject;
        groupedTotals: JsonObject;
      }>;
    };
    metrics: {
      families: Array<{
        metricFamily: AwsPortalMetricFamily;
        resourceRegion: string;
        requestedMonths: string[];
        availableMonths: string[];
        missingMonths: string[];
        coverage: JsonObject;
        summary: JsonObject;
      }>;
    };
    recommendations: { sources: AwsPortalRecommendationCoverage<AccountId>[] };
    virtualTags?: AwsPortalVirtualTagEvidence;
  };
  resources: AwsPortalResourceDetailItem[];
}

type AwsPortalQualifiedEnvelope<
  ArtifactType extends 'resource-collection' | 'account-summary',
  AccountId extends string,
  RunId extends string,
> = AwsPublicArtifactEnvelope<ArtifactType, AccountId, RunId> & {
  portalSchemaVersion: typeof AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION;
  logicalName: ArtifactType extends 'resource-collection'
    ? typeof AWS_PORTAL_RESOURCE_COLLECTION_LOGICAL_NAME
    : typeof AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME;
};

export type AwsPortalResourceCollectionDetailArtifact<AccountId extends string = string, RunId extends string = string> = AwsPortalQualifiedEnvelope<
  'resource-collection',
  AccountId,
  RunId
> &
  AwsPortalResourceCollectionBody<AccountId>;

export interface AwsPortalAccountSummaryBodyV2<AccountId extends string = string> {
  generatedAt: string;
  scope: AwsPortalAccountSummaryScope<AccountId>;
  account: {
    metadataFound: boolean;
    providerAccountId: AccountId;
    cloudAccountId?: string;
    accountName?: string;
    validatedAt: string;
    providerPartition?: string;
    summary: JsonObject;
    firstUsefulRecommendationReadiness?: JsonObject;
  };
  billing: {
    scope: AwsPortalBillingEvidenceScope<AccountId>;
    freshness: AwsPortalBillingFreshness;
    summary: AwsPortalBillingSummary;
    totalsByCurrency: AwsPortalBillingGroupedResult<AwsPortalBillingCostAggregate>;
    costViewByCurrency: JsonValue[];
    groupedCosts: {
      byChargeCategory: AwsPortalBillingGroupedResult<AwsPortalBillingLabeledCost<'chargeCategory'>>;
      byServiceCode: AwsPortalBillingGroupedResult<AwsPortalBillingLabeledCost<'serviceCode'>>;
      byServiceCategory?: AwsPortalBillingGroupedResult<AwsPortalBillingLabeledCost<'serviceCategory'>>;
    };
    commitmentSpend?: JsonObject;
    resourceAttribution?: JsonObject;
    calendarSummary?: JsonObject;
    periodSummary?: JsonObject;
    spendTrend?: JsonObject;
    comparison?: JsonObject;
  };
  discovery: {
    families: Array<{
      family: AwsPortalDiscoveryFamily;
      resourceRegion: string;
      freshness: AwsPortalFreshness;
      summary: JsonObject;
      groupedTotals: JsonObject;
    }>;
  };
  metrics: {
    families: Array<{
      metricFamily: AwsPortalMetricFamily;
      resourceRegion: string;
      status: 'available' | 'not-found';
      requestedMonths: string[];
      availableMonths: string[];
      missingMonths: string[];
      freshness: AwsPortalFreshness;
      readiness: JsonObject;
      summary?: JsonObject;
    }>;
  };
  recommendations: { sources: AwsPortalRecommendationCoverage<AccountId>[] };
}

export type AwsPortalAccountSummaryDetailArtifact<AccountId extends string = string, RunId extends string = string> = AwsPortalQualifiedEnvelope<
  'account-summary',
  AccountId,
  RunId
> &
  AwsPortalAccountSummaryBodyV2<AccountId>;

function assertSha256(value: string, field: string): void {
  if (!/^[a-f0-9]{64}$/.test(value)) throw new Error(`${field} must be a lowercase hexadecimal SHA-256.`);
}

function sha256Text(value: string): string {
  return sha256AwsPluginIdentity(value);
}
