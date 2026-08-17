import type { PortfolioBudgetRow, PortfolioDataCoverage, PortfolioDataStatus, PortfolioAttentionSummary, PortfolioExpiryRow, PortfolioMonthEndRow, PortfolioReportSummary, PortfolioReportRow, PortfolioSowRow } from './portfolioOperations';
export declare const PORTFOLIO_PROJECTION_PREVIOUS_SCHEMA_VERSION: "2026-07-26";
export declare const PORTFOLIO_PROJECTION_SCHEMA_VERSION: "2026-08-02";
export declare const PORTFOLIO_PROJECTION_COMPATIBLE_SCHEMA_VERSIONS: readonly ["2026-07-26", "2026-08-02"];
export declare const PORTFOLIO_PROJECTION_DETAIL_LIMIT = 60;
/** Legacy fixed-shard count used to read compatible manifests published before byte-bounded packing. */
export declare const PORTFOLIO_PROJECTION_DETAIL_SHARD_COUNT = 16;
/** Publishers target small detail artifacts and start a new shard before either target is crossed. */
export declare const PORTFOLIO_PROJECTION_DETAIL_TARGET_COMPRESSED_BYTES: number;
export declare const PORTFOLIO_PROJECTION_DETAIL_TARGET_DECODED_BYTES: number;
/** Aggregate decoded payload budget for a single Worker projection read. */
export declare const PORTFOLIO_PROJECTION_MAX_REQUEST_DECODED_BYTES: number;
export declare const PORTFOLIO_PROJECTION_MAX_COMPRESSED_BYTES: number;
export declare const PORTFOLIO_PROJECTION_MAX_DECODED_BYTES: number;
export declare const PORTFOLIO_CLOUD_ACCOUNT_SUMMARY_SCHEMA_VERSION: "2026-08-13";
export type PortfolioProjectionSchemaVersion = (typeof PORTFOLIO_PROJECTION_COMPATIBLE_SCHEMA_VERSIONS)[number];
export type PortfolioProjectionScopeType = 'company-self' | 'company-hierarchy';
export type PortfolioProjectionGroup = 'cloud' | 'delivery';
export type PortfolioProjectionPrimaryArtifactKind = 'estate' | 'insights' | 'operations' | 'delivery';
export type PortfolioProjectionArtifactKind = PortfolioProjectionPrimaryArtifactKind | 'details';
export type PortfolioProjectionBuildStatus = 'complete' | 'partial';
export type PortfolioProjectionFreshnessStatus = 'current' | 'stale' | 'expired' | 'unavailable';
export type PortfolioCurrencyStatus = 'single' | 'mixed' | 'unavailable';
export type PortfolioCloudProvider = 'azure' | 'aws' | 'gcp' | 'other' | 'unknown';
export type PortfolioEnvironment = 'Production' | 'Non-Production' | 'Mixed' | 'Unknown';
export type PortfolioOperationalStatus = 'healthy' | 'needs-attention' | 'critical' | 'not-assessed';
export type PortfolioAttentionSeverity = 'critical' | 'high' | 'medium' | 'low';
export type PortfolioAttentionDomain = 'security' | 'reliability' | 'finops' | 'expiry' | 'reporting' | 'service-opportunity' | 'sync';
export interface PortfolioCurrencyAmount {
    currency: string;
    amount: number;
}
export interface PortfolioCurrencyCoverage {
    status: PortfolioCurrencyStatus;
    currencies: string[];
    missingValueCount: number;
}
export interface PortfolioProjectionFailure {
    source: 'accounts' | 'budgets' | 'commitments' | 'cost' | 'credentials' | 'data-protection' | 'governance' | 'hierarchy' | 'recommendations' | 'reporting' | 'resource-health' | 'perimeter' | 'security' | 'service-retirements' | 'subscriptions';
    code: string;
    companyId?: string;
    cloudAccountId?: string;
    subscriptionId?: string;
    retryable?: boolean;
}
export interface PortfolioProjectionCounts {
    descendantCompanies: number;
    contributingCompanies: number;
    cloudAccounts: number;
    subscriptions: number;
    readySubscriptions: number;
}
export interface PortfolioProjectionCoverage {
    status: PortfolioProjectionBuildStatus;
    expectedCompanies: number;
    loadedCompanies: number;
    expectedCloudAccounts: number;
    loadedCloudAccounts: number;
    expectedSubscriptions: number;
    loadedSubscriptions: number;
    failures: PortfolioProjectionFailure[];
}
export interface PortfolioProjectionMetadata {
    schemaVersion: PortfolioProjectionSchemaVersion;
    scopeCompanyId: string;
    scopeType: PortfolioProjectionScopeType;
    generationId: string;
    generatedAt: string;
    sourceObservedAt?: string;
    freshness: PortfolioProjectionFreshnessStatus;
    hierarchyRootCompanyId: string;
    hierarchyVersion?: string;
    inputDigest: string;
    counts: PortfolioProjectionCounts;
    coverage: PortfolioProjectionCoverage;
    currencyCoverage: PortfolioCurrencyCoverage;
}
export interface PortfolioProjectionArtifactDescriptor {
    kind: PortfolioProjectionArtifactKind;
    /** Present only when kind is `details`; zero-based within that manifest's packed shard set. */
    shardIndex?: number;
    /** Present only when kind is `details`; total packed shards in the manifest. */
    shardCount?: number;
    /** Company contributions present in this detail shard. Used for authorization-relevant reads. */
    companyIds?: string[];
    path: string;
    contentHash: string;
    byteSize: number;
    compressedByteSize?: number;
    rowCount: number;
}
export interface PortfolioProjectionManifest {
    schemaVersion: PortfolioProjectionSchemaVersion;
    group: PortfolioProjectionGroup;
    scopeCompanyId: string;
    scopeType: PortfolioProjectionScopeType;
    generationId: string;
    generatedAt: string;
    sourceObservedAt?: string;
    hierarchyRootCompanyId: string;
    hierarchyVersion?: string;
    /** Digest of canonical account membership for bounded reconciliation without reading every account summary. */
    sourceMembershipDigest?: string;
    inputGenerationIds: string[];
    inputDigest: string;
    buildStatus: PortfolioProjectionBuildStatus;
    artifacts: PortfolioProjectionArtifactDescriptor[];
    coverage: PortfolioProjectionCoverage;
    freshness: PortfolioProjectionFreshnessStatus;
    warnings: string[];
}
export interface PortfolioBoundedSection<TItem> {
    items: TItem[];
    totalCount: number;
    limit: number;
    truncated: boolean;
}
export interface PortfolioRetainedSectionMetadata {
    totalCount: number;
    retainedCount: number;
    limit: number;
    truncated: boolean;
}
export interface PortfolioCloudAccountRow {
    id: string;
    companyId: string;
    companyName: string;
    cloudAccountId: string;
    cloudAccountName: string;
    provider: PortfolioCloudProvider;
    providerAccountId?: string;
    environment: PortfolioEnvironment;
    subscriptionCount: number;
    loadedSubscriptionCount?: number;
    readySubscriptionCount: number;
    notReadySubscriptionCount: number;
    subscriptionCoverage: 'complete' | 'partial' | 'unavailable';
    currency?: string;
    currencies?: string[];
    currencyStatus: PortfolioCurrencyStatus;
    syncStatus: PortfolioOperationalStatus;
    latestCompletedAt?: string;
    sourceObservedAt?: string;
    secureScore?: number;
    advisorScore?: number;
    recommendationCount: number;
    mustDoCount: number;
    budgetStatus?: 'healthy' | 'at-risk' | 'over-budget' | 'unavailable';
    commitmentCoveragePercent?: number;
    spend: PortfolioCurrencyAmount[];
    savingsOpportunity: PortfolioCurrencyAmount[];
    navigationCompanyId: string;
}
export interface PortfolioEstateCompanyContribution {
    companyId: string;
    companyName: string;
    parentCompanyId?: string;
    rootCompanyId: string;
    accounts: PortfolioCloudAccountRow[];
    /** Full account count and retained-detail metadata for compact hierarchy artifacts. */
    accountRetention?: PortfolioRetainedSectionMetadata;
    expectedCloudAccounts: number;
    expectedSubscriptions: number;
    /** Loaded totals remain available when detailed account rows are compacted. */
    loadedCloudAccounts?: number;
    loadedSubscriptions?: number;
    readySubscriptions?: number;
    failures: PortfolioProjectionFailure[];
}
export interface PortfolioEstateProjection {
    metadata: PortfolioProjectionMetadata;
    accounts: PortfolioCloudAccountRow[];
    /** Full account count and retained-detail metadata for the top-level account list. */
    accountRetention?: PortfolioRetainedSectionMetadata;
    companyContributions: PortfolioEstateCompanyContribution[];
}
export interface PortfolioInsightEvidence {
    source: string;
    sourceId?: string;
    observedAt?: string;
    value?: number;
    unit?: string;
    currency?: string;
}
export interface PortfolioAttentionItem {
    id: string;
    companyId: string;
    companyName: string;
    cloudAccountId?: string;
    subscriptionId?: string;
    domain: PortfolioAttentionDomain;
    severity: PortfolioAttentionSeverity;
    title: string;
    description: string;
    dueAt?: string;
    observedAt?: string;
    navigationPath?: string;
    evidence: PortfolioInsightEvidence[];
}
export interface PortfolioRecommendationSummary {
    total: number;
    mustDo: number;
    highImpact: number;
    affectedResources: number;
    affectedSubscriptions: number;
    savingsOpportunity: PortfolioCurrencyAmount[];
}
export interface PortfolioOperationalPostureSummary {
    activeServiceHealthEvents: number;
    unavailableResources: number;
    degradedResources: number;
    failedBackups: number;
    staleBackups: number;
    highRiskGovernanceFindings: number;
    perimeterExposureFindings: number;
    /** Optional only while the immediately preceding projection schema remains readable. */
    coverage?: {
        serviceHealth: PortfolioDataStatus;
        resourceHealth: PortfolioDataStatus;
        dataProtection: PortfolioDataStatus;
        governance: PortfolioDataStatus;
        perimeter: PortfolioDataStatus;
    };
}
export interface PortfolioInsightsCompanyContribution {
    companyId: string;
    companyName: string;
    status: PortfolioOperationalStatus;
    recommendationSummary: PortfolioRecommendationSummary;
    operationalPosture: PortfolioOperationalPostureSummary;
    secureScoreWeightedTotal: number;
    secureScoreWeight: number;
    advisorScoreWeightedTotal: number;
    advisorScoreWeight: number;
    attention: PortfolioAttentionItem[];
    risks: PortfolioAttentionItem[];
    serviceOpportunities: PortfolioAttentionItem[];
    /** Optional only for compatibility with the immediately preceding projection schema. */
    attentionRetention?: PortfolioRetainedSectionMetadata;
    riskRetention?: PortfolioRetainedSectionMetadata;
    serviceOpportunityRetention?: PortfolioRetainedSectionMetadata;
    attentionSummary?: PortfolioAttentionSummary;
    riskSummary?: PortfolioAttentionSummary;
    serviceOpportunitySummary?: PortfolioAttentionSummary;
    failures: PortfolioProjectionFailure[];
}
export interface PortfolioInsightsProjection {
    metadata: PortfolioProjectionMetadata;
    recommendationSummary: PortfolioRecommendationSummary;
    operationalPosture: PortfolioOperationalPostureSummary;
    attention: PortfolioBoundedSection<PortfolioAttentionItem>;
    risks: PortfolioBoundedSection<PortfolioAttentionItem>;
    serviceOpportunities: PortfolioBoundedSection<PortfolioAttentionItem>;
    companyContributions: PortfolioInsightsCompanyContribution[];
}
export interface PortfolioFinopsSummary {
    spendActual: PortfolioCurrencyAmount[];
    spendPreviousPeriod: PortfolioCurrencyAmount[];
    savingsOpportunity: PortfolioCurrencyAmount[];
    totalBudgets: number;
    overBudget: number;
    forecastOverBudget: number;
    atRisk: number;
    costAnomalies: number;
    /** Optional only while the immediately preceding projection schema remains readable. */
    coverage?: {
        spend: PortfolioDataStatus;
        budgets: PortfolioDataStatus;
        costAnomalies: PortfolioDataStatus;
        commitments: PortfolioDataStatus;
    };
}
export interface PortfolioExpiryTotals {
    total: number;
    expired: number;
    expiringWithin30Days: number;
    expiringWithin90Days: number;
}
export interface PortfolioOperationsCompanyContribution {
    companyId: string;
    companyName: string;
    finops: PortfolioFinopsSummary;
    expiryTotals: PortfolioExpiryTotals;
    budgets: PortfolioBudgetRow[];
    expiries: PortfolioExpiryRow[];
    attention: PortfolioAttentionItem[];
    budgetRetention?: PortfolioRetainedSectionMetadata;
    expiryRetention?: PortfolioRetainedSectionMetadata;
    attentionRetention?: PortfolioRetainedSectionMetadata;
    attentionSummary?: PortfolioAttentionSummary;
    failures: PortfolioProjectionFailure[];
}
export interface PortfolioOperationsProjection {
    metadata: PortfolioProjectionMetadata;
    finops: PortfolioFinopsSummary;
    expiryTotals: PortfolioExpiryTotals;
    budgets: PortfolioBoundedSection<PortfolioBudgetRow>;
    expiries: PortfolioBoundedSection<PortfolioExpiryRow>;
    attention: PortfolioBoundedSection<PortfolioAttentionItem>;
    companyContributions: PortfolioOperationsCompanyContribution[];
}
export interface PortfolioCloudAccountSummaryMetadata {
    schemaVersion: typeof PORTFOLIO_CLOUD_ACCOUNT_SUMMARY_SCHEMA_VERSION;
    companyId: string;
    cloudAccountId: string;
    provider: PortfolioCloudProvider;
    providerAccountId?: string;
    tenantRunId: string;
    sourceRunStartedAt?: string;
    generationId: string;
    generatedAt: string;
    sourceObservedAt?: string;
    inputDigest: string;
    inputSubscriptionIds: string[];
    inputGenerationIds?: string[];
    expectedSubscriptions: number;
    loadedSubscriptions: number;
    coverage: PortfolioProjectionBuildStatus;
    freshness: PortfolioProjectionFreshnessStatus;
    failures: PortfolioProjectionFailure[];
    currencyCoverage: PortfolioCurrencyCoverage;
}
export interface PortfolioCloudAccountSummary {
    metadata: PortfolioCloudAccountSummaryMetadata;
    estate: PortfolioEstateCompanyContribution;
    insights: PortfolioInsightsCompanyContribution;
    operations: PortfolioOperationsCompanyContribution;
}
export interface PortfolioCloudAccountSummaryArtifactDescriptor {
    kind: 'summary';
    path: string;
    contentHash: string;
    byteSize: number;
    compressedByteSize?: number;
    rowCount: number;
}
export interface PortfolioCloudAccountSummaryManifest {
    schemaVersion: typeof PORTFOLIO_CLOUD_ACCOUNT_SUMMARY_SCHEMA_VERSION;
    group: 'cloud-account';
    companyId: string;
    cloudAccountId: string;
    provider: PortfolioCloudProvider;
    providerAccountId?: string;
    tenantRunId: string;
    sourceRunStartedAt?: string;
    generationId: string;
    generatedAt: string;
    sourceObservedAt?: string;
    inputDigest: string;
    inputSubscriptionIds: string[];
    inputGenerationIds?: string[];
    buildStatus: PortfolioProjectionBuildStatus;
    freshness: PortfolioProjectionFreshnessStatus;
    failures: PortfolioProjectionFailure[];
    artifact: PortfolioCloudAccountSummaryArtifactDescriptor;
    warnings: string[];
}
export interface PortfolioDeliverySummary {
    totalIssuedSows: number;
    approvedSows: number;
    unapprovedSows: number;
    issuedThisMonth: number;
    monthEndComplete: number;
    monthEndIncomplete: number;
    monthEndUnavailable: number;
}
export interface PortfolioDeliveryCompanyContribution {
    companyId: string;
    companyName: string;
    summary: PortfolioDeliverySummary;
    reports: PortfolioReportRow[];
    sows: PortfolioSowRow[];
    monthEnd: PortfolioMonthEndRow[];
    attention: PortfolioAttentionItem[];
    reportRetention?: PortfolioRetainedSectionMetadata;
    sowRetention?: PortfolioRetainedSectionMetadata;
    monthEndRetention?: PortfolioRetainedSectionMetadata;
    attentionRetention?: PortfolioRetainedSectionMetadata;
    reportSummary?: PortfolioReportSummary;
    attentionSummary?: PortfolioAttentionSummary;
    failures: PortfolioProjectionFailure[];
}
export interface PortfolioDeliveryProjection {
    metadata: PortfolioProjectionMetadata;
    summary: PortfolioDeliverySummary;
    reports: PortfolioBoundedSection<PortfolioReportRow>;
    sows: PortfolioBoundedSection<PortfolioSowRow>;
    monthEnd: PortfolioBoundedSection<PortfolioMonthEndRow>;
    attention: PortfolioBoundedSection<PortfolioAttentionItem>;
    companyContributions: PortfolioDeliveryCompanyContribution[];
}
export interface PortfolioCloudProjectionDetailShard {
    schemaVersion: PortfolioProjectionSchemaVersion;
    group: 'cloud';
    scopeCompanyId: string;
    generationId: string;
    shardIndex: number;
    shardCount: number;
    companyIds: string[];
    estate: PortfolioEstateCompanyContribution[];
    insights: PortfolioInsightsCompanyContribution[];
    operations: PortfolioOperationsCompanyContribution[];
}
export interface PortfolioDeliveryProjectionDetailShard {
    schemaVersion: PortfolioProjectionSchemaVersion;
    group: 'delivery';
    scopeCompanyId: string;
    generationId: string;
    shardIndex: number;
    shardCount: number;
    companyIds: string[];
    delivery: PortfolioDeliveryCompanyContribution[];
}
export type PortfolioProjectionDetailShard = PortfolioCloudProjectionDetailShard | PortfolioDeliveryProjectionDetailShard;
export interface PortfolioManagementSummary {
    companiesHealthy: number;
    companiesNeedingAttention: number;
    companiesCritical: number;
    companiesNotAssessed: number;
    budgetsOver: number;
    budgetsForecastOver: number;
    risks: number;
    /** Full-scope count of companies with at least one active recommendation risk. */
    companiesWithRisks?: number;
    /** Full-scope count of companies with at least one active Critical or High recommendation risk. */
    companiesWithHighRisks?: number;
    actionsDueWithin30Days: number;
    reportingDue: number;
}
export interface PortfolioCompanyHealthRow {
    companyId: string;
    companyName: string;
    status: PortfolioOperationalStatus;
    coverage: PortfolioDataStatus;
    primaryAttention?: PortfolioAttentionItem;
}
export interface PortfolioOverviewResponse {
    scopeCompanyId: string;
    generatedAt: string;
    management: PortfolioManagementSummary;
    /** Optional only while clients may receive the immediately preceding projection schema. */
    companies?: PortfolioBoundedSection<PortfolioCompanyHealthRow>;
    accounts: PortfolioBoundedSection<PortfolioCloudAccountRow>;
    attention: PortfolioBoundedSection<PortfolioAttentionItem>;
    risks: PortfolioBoundedSection<PortfolioAttentionItem>;
    serviceOpportunities: PortfolioBoundedSection<PortfolioAttentionItem>;
    recommendations: PortfolioRecommendationSummary;
    operationalPosture: PortfolioOperationalPostureSummary;
    finops: PortfolioFinopsSummary;
    delivery: PortfolioDeliverySummary;
    coverage: PortfolioDataCoverage;
    sourceFreshness: Array<{
        source: PortfolioProjectionPrimaryArtifactKind;
        status: PortfolioProjectionFreshnessStatus;
        generatedAt?: string;
        sourceObservedAt?: string;
    }>;
    currencyCoverage: PortfolioCurrencyCoverage;
}
//# sourceMappingURL=portfolioProjections.d.ts.map