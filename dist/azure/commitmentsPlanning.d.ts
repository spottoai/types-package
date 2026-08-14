import type { ProviderName, ProviderScope } from '../common/provider.js';
import type { BenefitCostBasis, BenefitScope, BenefitType, IBenefitCoverageBreakdownEntry, IBenefitUtilization, IBenefitWeightedUtilizationAggregate } from './benefits.js';
import type { SubscriptionSummaryLite } from './subscriptions.js';
export type CommitmentsPlanningVersion = '1.0' | '2.0';
export type CommitmentsCommitmentFamily = 'compute-reservation' | 'compute-savings-plan' | 'app-service-reservation' | 'managed-disk-reservation' | 'blob-storage-reserved-capacity' | 'adls-reserved-capacity' | 'azure-files-reservation' | 'redis-reserved-capacity' | 'sql-reserved-capacity' | 'mysql-reserved-capacity' | 'postgresql-reserved-capacity' | 'mariadb-reserved-capacity' | 'cosmos-db-reserved-capacity' | 'azure-openai-provisioned-throughput-reservation' | 'generic-reservation';
export type CommitmentsSourceKind = 'azure-native' | 'aws-native' | 'spotto-derived' | 'fallback-heuristic' | 'manual' | 'unknown';
export type CommitmentsConfidenceLevel = 'high' | 'medium' | 'low' | 'unknown';
export type CommitmentsRiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'none' | 'unknown';
export type CommitmentsFreshnessStatus = 'current' | 'stale' | 'partial' | 'unavailable';
export type CommitmentsCredentialStatus = 'valid' | 'expiring' | 'expired' | 'unknown';
export type CommitmentsRenewalAction = 'renew-as-is' | 'move-before-renewal' | 'rescope' | 'trade-in-to-savings-plan' | 'do-not-renew' | 'review';
export type CommitmentsAppliedScopeType = 'single-resource-group' | 'single-subscription' | 'linked-account' | 'management-group' | 'shared' | 'unknown';
export interface CommitmentsAppliedScopeProperties {
    subscriptionId?: string;
    resourceGroupId?: string;
    tenantId?: string;
    managementGroupId?: string;
    accountId?: string;
    region?: string;
    availabilityZone?: string;
}
/** Public identity for an Azure commitments artifact. */
export interface AzureCommitmentsPlanningProviderScope extends ProviderScope {
    providerName: ProviderName.Azure;
    companyId?: never;
    scopeType?: never;
    name?: never;
    cloudAccountId?: never;
    status?: never;
}
/** Public identity for an AWS commitments artifact. */
export interface AwsCommitmentsPlanningProviderScope extends ProviderScope {
    providerName: ProviderName.Aws;
    companyId?: never;
    scopeType?: never;
    name?: never;
    cloudAccountId?: never;
    status?: never;
}
export type CommitmentsPlanningProviderScope = AzureCommitmentsPlanningProviderScope | AwsCommitmentsPlanningProviderScope;
export type CommitmentsInventoryStatus = 'active' | 'expired' | 'cancelled' | 'failed' | 'pending' | 'split' | 'merged' | 'warning' | 'no-benefit' | 'payment-error' | 'capacity-error' | 'exchanged' | 'restricted' | 'unknown';
export type CommitmentsReservationUnit = 'hour' | '10-tib-month' | '100-tib-month' | '1-pib-month'
/** Compatibility value still emitted by the current storage-capacity producer. */
 | '10TiB'
/** Compatibility value still emitted by the current storage-capacity producer. */
 | '100TiB'
/** Compatibility value still emitted by the current storage-capacity producer. */
 | '1PiB';
export type CommitmentsStorageAccessTier = 'hot' | 'cool' | 'cold' | 'archive' | 'premium' | 'transaction-optimized' | 'unknown';
export type CommitmentsStorageRedundancy = 'LRS' | 'ZRS' | 'GRS' | 'GZRS' | 'RA-GRS' | 'RA-GZRS' | 'unknown';
export type CommitmentsStorageBillingModel = 'blob-standard' | 'gpv2-standard' | 'blob-storage' | 'azure-files-payg' | 'azure-files-provisioned-v1' | 'azure-files-provisioned-v2'
/** Compatibility value still emitted by the current storage-capacity producer. */
 | 'standard'
/** Compatibility value still emitted by the current storage-capacity producer. */
 | 'premium' | 'unknown';
export interface CommitmentsPlanningViewBase<TInventoryItem extends CommitmentsInventoryItem = CommitmentsInventoryItem, TPurchaseRecommendation extends CommitmentsPurchaseRecommendation = CommitmentsPurchaseRecommendation> {
    version: CommitmentsPlanningVersion;
    generatedAt: string;
    month?: string;
    utilizationSummary: CommitmentsUtilizationSummary;
    expirySummary: CommitmentsExpirySummary;
    inventory: TInventoryItem[];
    resourceCoverage: CommitmentsResourceCoverageItem[];
    obsoleteCandidates: CommitmentsObsoleteCandidate[];
    reallocationOpportunities?: CommitmentsReallocationOpportunity[];
    pricingContext: CommitmentsPricingContext;
    termStrategy: CommitmentsTermStrategyScenario[];
    freshness?: CommitmentsFreshnessSummary;
    /** @deprecated Legacy read compatibility only. New artifacts should use purchaseRecommendations. */
    vendorRecommendations?: CommitmentsVendorRecommendation[];
    purchaseRecommendations?: TPurchaseRecommendation[];
    diagnostics?: CommitmentsPlanningDiagnostics;
    coverage?: CommitmentsCoverageSummary[];
    renewals?: CommitmentsRenewalDecision[];
    storageCapacity?: CommitmentsStorageCapacitySection;
    risk?: CommitmentsRiskSummary;
    credentialHealth?: CommitmentsCredentialHealthImpact;
    retirementImpact?: CommitmentsRetirementImpactScenario[];
    phasedOptions?: CommitmentsPhasedOption[];
}
/**
 * Backward-compatible commitments view surface.
 *
 * New provider-aware producers and runtime validators should use
 * ProviderScopedCommitmentsPlanningView instead.
 */
export interface CommitmentsPlanningView extends CommitmentsPlanningViewBase {
    providerScope?: CommitmentsPlanningProviderScope;
    subscription?: SubscriptionSummaryLite;
}
/** Legacy Azure wire shape retained unchanged while Azure producers migrate. */
export interface LegacyCommitmentsPlanningView extends CommitmentsPlanningView {
    providerScope?: never;
}
/** Provider-aware Azure wire shape. Route validation must compare both identities. */
export interface AzureCommitmentsPlanningView extends CommitmentsPlanningView {
    providerScope: AzureCommitmentsPlanningProviderScope;
    subscription: SubscriptionSummaryLite;
}
/** AWS wire shape with an account identity and AWS-specific inventory and recommendation evidence. */
export interface AwsCommitmentsPlanningView extends CommitmentsPlanningViewBase<AwsCommitmentsInventoryItem, AwsCommitmentsPurchaseRecommendation> {
    providerScope: AwsCommitmentsPlanningProviderScope;
    subscription?: never;
    credentialHealth?: never;
    storageCapacity?: never;
}
/** Strict provider-aware contract for new producers and validation boundaries. */
export type ProviderScopedCommitmentsPlanningView = AzureCommitmentsPlanningView | AwsCommitmentsPlanningView;
export interface CommitmentsUtilizationSummary {
    total: number;
    withData: number;
    sevenDayAverage?: number;
    thirtyDayAverage?: number;
    sevenDayAggregates?: IBenefitWeightedUtilizationAggregate[];
    thirtyDayAggregates?: IBenefitWeightedUtilizationAggregate[];
    byBenefitType: Array<{
        benefitType: BenefitType;
        total: number;
        withData: number;
        sevenDayAverage?: number;
        thirtyDayAverage?: number;
        sevenDayAggregates?: IBenefitWeightedUtilizationAggregate[];
        thirtyDayAggregates?: IBenefitWeightedUtilizationAggregate[];
    }>;
}
export interface CommitmentsExpirySummary {
    expired: number;
    expiring30d: number;
    expiring60d: number;
    expiring90d: number;
    expiring180d: number;
}
export interface CommitmentsInventoryItem {
    id: string;
    benefitType: BenefitType;
    commitmentFamily?: CommitmentsCommitmentFamily;
    sourceKind?: CommitmentsSourceKind;
    sourceId?: string;
    provider?: ProviderName;
    shape?: CommitmentShape;
    scope: BenefitScope;
    appliedScopeType?: CommitmentsAppliedScopeType;
    appliedScopeProperties?: CommitmentsAppliedScopeProperties;
    type: string;
    displayName?: string;
    status: CommitmentsInventoryStatus;
    subscriptionId?: string;
    purchaseDate?: string;
    expiryDate?: string;
    daysToExpiry?: number;
    reservedQuantity?: number;
    commitmentAmount?: number;
    commitmentCurrencyCode?: string;
    commitmentGrain?: string;
    commitmentUnit?: string;
    skuName?: string;
    skuDescription?: string;
    location?: string;
    term?: string;
    termMonths?: number;
    billingPlan?: string;
    billingScopeId?: string;
    appliedScopeDisplayName?: string;
    provisioningState?: string;
    renew?: boolean;
    purchasedQuantity?: number;
    usedQuantity?: number;
    remainingQuantity?: number;
    totalReservedQuantity?: number;
    reservedHours?: number;
    usedHours?: number;
    utilization?: IBenefitUtilization;
    coveragePercent?: number;
    annualCommittedCost?: CommitmentsMoneyAmount;
    optimizationImpact?: CommitmentsMoneyAmount;
    doNotRenewAnnualImpact?: CommitmentsMoneyAmount;
    breakCostEstimate?: CommitmentsBreakCostEstimate;
    riskLevel?: CommitmentsRiskLevel;
    confidence?: CommitmentsConfidenceLevel;
    linkedRecommendationIds?: string[];
    storageDimensions?: CommitmentsStorageDimensions;
    renewalDecisionIds?: string[];
    retirementImpactIds?: string[];
}
export interface CommitmentsResourceCoverageItem {
    resourceId: string;
    resourceName?: string;
    resourceType?: string;
    month?: string;
    windowStart?: string;
    windowEnd?: string;
    currency?: string;
    benefitIds: string[];
    benefitNames: string[];
    basis?: BenefitCostBasis;
    coveredQuantity?: number;
    eligibleQuantity?: number;
    coveredCost?: number;
    eligibleCost?: number;
    uncoveredCost?: number;
    coveragePercent?: number;
    recommendationIds?: string[];
    recommendationType?: CommitmentsRecommendationType;
    recommendedAction?: CommitmentsRecommendationAction;
    eligibility?: CommitmentEligibilityMetadata;
    recommendationImpact?: {
        amount?: number;
        currency?: string;
        source?: 'payg-cost' | 'amortized' | 'retail' | 'unknown';
    };
    source?: CommitmentsSourceMetadata;
    benefitBreakdown?: IBenefitCoverageBreakdownEntry[];
}
export type CommitmentsRecommendationType = 'reserved-instance' | 'savings-plan' | 'hybrid';
export type CommitmentEligibilityStatus = 'available_now' | 'unlockable' | 'savings_plan_only' | 'not_eligible' | 'unknown';
export type CommitmentRecommendationAction = 'buy' | 'unlock' | 'savings-plan' | 'none';
export type CommitmentsRecommendationAction = 'buy' | 'unlock' | 'savings-plan' | 'none' | 'exchange' | 'resize' | 'review';
export interface CommitmentShape {
    provider?: 'azure' | 'aws' | 'gcp' | 'unknown';
    resourceType?: string;
    commitmentFamily?: CommitmentsCommitmentFamily;
    skuName?: string;
    normalizedSkuName?: string;
    location?: string;
    region?: string;
    availabilityZone?: string;
    platform?: 'linux' | 'windows' | 'unknown';
    reservationProductName?: string;
    reservedResourceType?: string;
    meterCategory?: string;
    meterSubCategory?: string;
    meterName?: string;
    unit?: CommitmentsReservationUnit | string;
    attributes?: Record<string, string | number | boolean | undefined>;
}
export type AwsCommitmentShape = Omit<CommitmentShape, 'provider'> & {
    provider: 'aws';
};
export interface CommitmentEligibilityBlocker {
    code: 'unsupported-current-shape' | 'dynamic-workload' | 'existing-coverage' | 'missing-usage-evidence' | 'missing-price-meter' | 'non-covered-charge' | 'unsupported-charge-category' | 'unsupported-reservation-family' | 'unknown';
    message: string;
    source?: string;
    sourceUrl?: string;
    severity?: 'info' | 'warning' | 'blocking';
}
export interface CommitmentUnlockAction {
    id: string;
    label: string;
    description?: string;
    actionType?: 'review' | 'upgrade' | 'resize' | 'migrate' | 'validate-baseline' | 'refresh-estimate' | 'other';
    order?: number;
    source?: string;
}
export interface CommitmentQuotePolicy {
    mode: 'current-shape' | 'target-shape' | 'savings-plan' | 'not-quoteable' | 'unknown';
    allowCalculatePrice: boolean;
    allowRetailFallback: boolean;
    quoteShape?: 'current' | 'target';
    reason?: string;
}
export interface CommitmentUnlockFinancialLedger {
    currentEligibleAnnualCost?: CommitmentsMoneyAmount;
    targetPaygAnnualCost?: CommitmentsMoneyAmount;
    targetShapeAnnualDelta?: CommitmentsMoneyAmount;
    targetReservationAnnualCost?: CommitmentsMoneyAmount;
    expectedAnnualSavingsAfterReservation?: CommitmentsMoneyAmount;
    netAnnualImpactVsCurrent?: CommitmentsMoneyAmount;
    notes?: string[];
}
export type CommitmentTargetSelectionStrategy = 'capacity-equivalent' | 'charge-equivalent' | 'source-backed' | 'target-required-but-missing';
export interface CommitmentEligibilityMetadata {
    status: CommitmentEligibilityStatus;
    action: CommitmentRecommendationAction;
    currentShape?: CommitmentShape;
    targetShape?: CommitmentShape;
    targetSelectionStrategy?: CommitmentTargetSelectionStrategy;
    targetSelectionReason?: string;
    blockers?: CommitmentEligibilityBlocker[];
    unlockActions?: CommitmentUnlockAction[];
    quotePolicy?: CommitmentQuotePolicy;
    unlockFinancialLedger?: CommitmentUnlockFinancialLedger;
    source?: CommitmentsSourceMetadata;
    confidence?: CommitmentsConfidenceLevel;
}
export interface CommitmentsSourceMetadata {
    sourceKind: CommitmentsSourceKind;
    sourceId?: string;
    sourceName?: string;
    generatedAt?: string;
    observedAt?: string;
    notes?: string[];
}
export type AwsCommitmentsSourceMetadata = Omit<CommitmentsSourceMetadata, 'sourceKind'> & {
    sourceKind: 'aws-native';
};
export type AwsCommitmentEligibilityMetadata = Omit<CommitmentEligibilityMetadata, 'currentShape' | 'targetShape' | 'quotePolicy' | 'unlockFinancialLedger' | 'source'> & {
    currentShape?: AwsCommitmentShape;
    targetShape?: AwsCommitmentShape;
    quotePolicy?: never;
    unlockFinancialLedger?: never;
    source?: AwsCommitmentsSourceMetadata;
};
export interface CommitmentsMoneyAmount {
    amount: number;
    currency: string;
    source?: 'actual' | 'amortized' | 'retail' | 'negotiated' | 'payg-cost' | 'unknown';
    windowStart?: string;
    windowEnd?: string;
    flags?: string[];
}
export interface CommitmentsBreakCostEstimate {
    status: 'estimated' | 'unavailable';
    netBreakCost?: number;
    refundAmount?: number;
    cancellationFee?: number;
    currency?: string;
    policySource: 'azure-policy' | 'billing-scope-policy' | 'not-collected' | 'unknown';
    confidence: CommitmentsConfidenceLevel;
    notes?: string;
    refundLimitConsumed?: number;
    refundLimitMax?: number;
    refundLimitRemaining?: number;
    projectedRefundLimitRemaining?: number;
    refundLimitCurrency?: string;
    policyErrors?: string[];
}
export interface CommitmentsResourceReference {
    resourceId: string;
    resourceName?: string;
    resourceType?: string;
    subscriptionId?: string;
    subscriptionName?: string;
    resourceGroup?: string;
    location?: string;
}
export interface CommitmentsFreshnessEntry {
    section: string;
    status: CommitmentsFreshnessStatus;
    generatedAt?: string;
    observedAt?: string;
    lastSuccessfulSyncAt?: string;
    reason?: string;
    sourceKind?: CommitmentsSourceKind;
}
export interface CommitmentsFreshnessSummary {
    status: CommitmentsFreshnessStatus;
    generatedAt: string;
    entries: CommitmentsFreshnessEntry[];
    warnings?: string[];
}
export interface CommitmentsVendorRecommendation {
    id: string;
    commitmentFamily: CommitmentsCommitmentFamily;
    source: CommitmentsSourceMetadata;
    action: CommitmentsRecommendationAction | CommitmentsRenewalAction;
    title?: string;
    description?: string;
    confidence?: CommitmentsConfidenceLevel;
    riskLevel?: CommitmentsRiskLevel;
    estimatedAnnualSavings?: CommitmentsMoneyAmount;
    estimatedAnnualCost?: CommitmentsMoneyAmount;
    impactedResources?: CommitmentsResourceReference[];
    linkedCommitmentIds?: string[];
}
export type CommitmentsPurchaseRecommendationScope = 'single-resource-group' | 'single-subscription' | 'linked-account' | 'management-group' | 'shared' | 'unknown';
export type CommitmentsPurchaseRecommendationCoverageState = 'uncovered' | 'partially-covered' | 'covered' | 'unknown';
export interface CommitmentsPurchaseRecommendationTermOption {
    termMonths: number;
    currentMonthly?: number;
    targetMonthly?: number;
    potentialMonthlySavings?: number;
    estimatedAnnualSavings?: CommitmentsMoneyAmount;
    estimatedAnnualCost?: CommitmentsMoneyAmount;
    estimatedTermSavings?: CommitmentsMoneyAmount;
    estimatedTermCost?: CommitmentsMoneyAmount;
}
export interface CommitmentsReservationPurchaseQuote {
    generatedAt: string;
    status: 'quoted' | 'estimated' | 'unavailable';
    source?: 'calculate-price' | 'retail-prices';
    request: {
        skuName: string;
        location: string;
        currencyCode?: string;
        quantity: number;
        term: 'P1Y' | 'P3Y' | 'P5Y';
        billingPlan: 'Upfront' | 'Monthly';
        reservedResourceType?: string;
        appliedScopeType: 'Single' | 'Shared' | 'ManagementGroup' | 'SingleResourceGroup';
        billingScopeId: string;
        currentShape?: CommitmentShape;
        targetShape?: CommitmentShape;
        quoteShape?: CommitmentShape;
        eligibility?: CommitmentEligibilityMetadata;
        quotePolicy?: CommitmentQuotePolicy;
        instanceFlexibility?: 'On' | 'Off';
        appliedScopeProperties?: {
            subscriptionId?: string;
            resourceGroupId?: string;
            tenantId?: string;
            managementGroupId?: string;
        };
    };
    response?: unknown;
    billingCurrencyTotal?: {
        amount: number;
        currency: string;
    };
    pricingCurrencyTotal?: {
        amount: number;
        currency: string;
    };
    paymentSchedule?: unknown[];
    reservationOrderId?: string;
    error?: {
        status?: number;
        message?: string;
        eligibility?: CommitmentEligibilityMetadata;
        blockers?: CommitmentEligibilityBlocker[];
        unlockActions?: CommitmentUnlockAction[];
    };
}
export interface CommitmentsPurchaseRecommendation {
    id: string;
    groupKey: string;
    commitmentFamily: CommitmentsCommitmentFamily;
    action: CommitmentRecommendationAction;
    eligibility?: CommitmentEligibilityMetadata;
    currentShape?: CommitmentShape;
    targetShape?: CommitmentShape;
    blockers?: CommitmentEligibilityBlocker[];
    unlockActions?: CommitmentUnlockAction[];
    quotePolicy?: CommitmentQuotePolicy;
    unlockFinancialLedger?: CommitmentUnlockFinancialLedger;
    purchaseScope?: CommitmentsPurchaseRecommendationScope;
    appliedScopeProperties?: CommitmentsAppliedScopeProperties;
    source?: CommitmentsSourceMetadata;
    title?: string;
    description?: string;
    confidence?: CommitmentsConfidenceLevel;
    riskLevel?: CommitmentsRiskLevel;
    location?: string;
    skuName?: string;
    normalizedSkuName?: string;
    resourceType?: string;
    vmSizeFlexibilityGroup?: string;
    termMonths?: number;
    quantity?: number;
    coverageState?: CommitmentsPurchaseRecommendationCoverageState;
    estimatedAnnualSavings?: CommitmentsMoneyAmount;
    estimatedAnnualCost?: CommitmentsMoneyAmount;
    estimatedTermSavings?: CommitmentsMoneyAmount;
    estimatedTermCost?: CommitmentsMoneyAmount;
    termOptions?: CommitmentsPurchaseRecommendationTermOption[];
    pricingQuote?: CommitmentsReservationPurchaseQuote;
    impactedResources?: CommitmentsResourceReference[];
    sourceRecommendationIds?: string[];
    linkedCommitmentIds?: string[];
    notes?: string[];
}
export interface AwsCommitmentsAppliedScopeProperties {
    accountId: string;
    region?: string;
    availabilityZone?: string;
}
export type AwsCommitmentsInventoryItem = Omit<CommitmentsInventoryItem, 'sourceKind' | 'provider' | 'shape' | 'appliedScopeType' | 'appliedScopeProperties' | 'subscriptionId' | 'breakCostEstimate' | 'storageDimensions'> & {
    sourceKind: 'aws-native';
    provider: ProviderName.Aws;
    shape?: AwsCommitmentShape;
    subscriptionId?: never;
    breakCostEstimate?: never;
    storageDimensions?: never;
    appliedScopeType: 'linked-account';
    appliedScopeProperties: AwsCommitmentsAppliedScopeProperties;
};
export type AwsCommitmentsPurchaseRecommendation = Omit<CommitmentsPurchaseRecommendation, 'eligibility' | 'source' | 'currentShape' | 'targetShape' | 'quotePolicy' | 'unlockFinancialLedger' | 'purchaseScope' | 'appliedScopeProperties' | 'pricingQuote'> & {
    eligibility?: AwsCommitmentEligibilityMetadata;
    source: AwsCommitmentsSourceMetadata;
    currentShape?: AwsCommitmentShape;
    targetShape: AwsCommitmentShape;
    quotePolicy?: never;
    unlockFinancialLedger?: never;
    purchaseScope: 'linked-account';
    appliedScopeProperties: AwsCommitmentsAppliedScopeProperties;
    pricingQuote?: never;
};
export interface CommitmentsPlanningDiagnostics {
    purchaseRecommendations?: CommitmentsPurchaseRecommendationDiagnostics;
}
export interface CommitmentsPurchaseRecommendationDiagnostics {
    generatedAt?: string;
    inputCounts?: Record<string, number>;
    outputCounts?: {
        total: number;
        byAction?: Partial<Record<CommitmentRecommendationAction, number>>;
        byStatus?: Partial<Record<CommitmentEligibilityStatus, number>>;
        bySourceKind?: Partial<Record<CommitmentsSourceKind, number>>;
        unattributed?: number;
    };
    suppressedCounts?: Record<string, number>;
    notes?: string[];
}
export interface CommitmentsCoverageSummary {
    commitmentFamily: CommitmentsCommitmentFamily;
    basis?: BenefitCostBasis;
    windowStart?: string;
    windowEnd?: string;
    eligibleCost?: CommitmentsMoneyAmount;
    coveredCost?: CommitmentsMoneyAmount;
    uncoveredCost?: CommitmentsMoneyAmount;
    coveragePercent?: number;
    impactedResources?: CommitmentsResourceReference[];
    source?: CommitmentsSourceMetadata;
}
export interface CommitmentsRiskSummary {
    overallRisk: CommitmentsRiskLevel;
    overcommitmentRisk?: CommitmentsRiskLevel;
    undercoverageRisk?: CommitmentsRiskLevel;
    staleDataRisk?: CommitmentsRiskLevel;
    currency?: string;
    expectedWaste?: number;
    expectedUncoveredCost?: number;
    notes?: string[];
}
export interface CommitmentsStorageDimensions {
    serviceFamily: 'blob' | 'adls-gen2' | 'azure-files';
    accountKind?: 'StorageV2' | 'BlobStorage' | 'FileStorage' | 'Storage' | string;
    billingModel?: CommitmentsStorageBillingModel;
    accessTier?: CommitmentsStorageAccessTier;
    redundancy?: CommitmentsStorageRedundancy;
    location?: string;
    unit: CommitmentsReservationUnit;
    eligible: boolean;
    eligibilityReasons?: string[];
}
export interface CommitmentsCapacityTrendPoint {
    month: string;
    usedTiB?: number;
    eligibleTiB?: number;
    coveredTiB?: number;
    cost?: CommitmentsMoneyAmount;
}
export interface CommitmentsStorageCapacityCandidate {
    id: string;
    commitmentFamily: Extract<CommitmentsCommitmentFamily, 'blob-storage-reserved-capacity' | 'adls-reserved-capacity' | 'azure-files-reservation'>;
    storageDimensions: CommitmentsStorageDimensions;
    recommendedUnits: number;
    unitSizeTiB: 10 | 100 | 1024;
    termMonths: 12 | 36;
    currentMonthlyEligibleTiB?: number;
    projectedCoveredTiB?: number;
    projectedWasteTiB?: number;
    estimatedAnnualSavings?: CommitmentsMoneyAmount;
    estimatedAnnualCost?: CommitmentsMoneyAmount;
    confidence?: CommitmentsConfidenceLevel;
    riskLevel?: CommitmentsRiskLevel;
    trend?: CommitmentsCapacityTrendPoint[];
    impactedResources?: CommitmentsResourceReference[];
    source?: CommitmentsSourceMetadata;
}
export interface CommitmentsStorageCapacitySection {
    candidates: CommitmentsStorageCapacityCandidate[];
    suppressedCandidates?: Array<{
        id: string;
        commitmentFamily: CommitmentsCommitmentFamily;
        reason: string;
        missingDimensions?: string[];
        impactedResources?: CommitmentsResourceReference[];
    }>;
    summary?: {
        totalCandidates: number;
        estimatedAnnualSavings?: CommitmentsMoneyAmount;
        estimatedAnnualCost?: CommitmentsMoneyAmount;
        riskLevel?: CommitmentsRiskLevel;
    };
}
export type CommitmentsRecommendationReviewReason = 'commitment-direct' | 'modernization-before-renewal' | 'rightsizing-before-renewal' | 'licensing-before-renewal' | 'location-or-scope-change' | 'resource-risk';
export interface CommitmentsRecommendationReviewSummary {
    id: string;
    name: string;
    category?: string;
    subCategory?: string;
    impact?: string;
    effort?: string;
    risk?: string;
    priorityTier?: string;
    headline?: string;
    plainSummary?: string;
    normalizedScore?: number;
    finalScore?: number;
    estimatedSavings?: CommitmentsMoneyAmount;
    resourceIds: string[];
    reasons: CommitmentsRecommendationReviewReason[];
}
export interface CommitmentsRenewalDecision {
    id: string;
    commitmentId: string;
    commitmentFamily: CommitmentsCommitmentFamily;
    action: CommitmentsRenewalAction;
    title?: string;
    expiryDate?: string;
    daysToExpiry?: number;
    confidence?: CommitmentsConfidenceLevel;
    riskLevel?: CommitmentsRiskLevel;
    estimatedAnnualSavings?: CommitmentsMoneyAmount;
    estimatedAnnualCostDelta?: CommitmentsMoneyAmount;
    modernizationTarget?: {
        currentSku?: string;
        targetSku?: string;
        currentFamily?: string;
        targetFamily?: string;
        reasonCodes?: string[];
    };
    impactedResources?: CommitmentsResourceReference[];
    recommendationsToReview?: CommitmentsRecommendationReviewSummary[];
    source?: CommitmentsSourceMetadata;
}
export interface CommitmentsRetirementImpactScenario {
    id: string;
    commitmentId?: string;
    commitmentFamily?: CommitmentsCommitmentFamily;
    scenario: 'do-not-renew' | 'expired' | 'credential-expired' | 'credential-expiring';
    title?: string;
    effectiveDate?: string;
    incrementalMonthlyCost?: CommitmentsMoneyAmount;
    incrementalAnnualCost?: CommitmentsMoneyAmount;
    impactedResources?: CommitmentsResourceReference[];
    linkedRetirementIds?: string[];
    confidence?: CommitmentsConfidenceLevel;
    riskLevel?: CommitmentsRiskLevel;
    source?: CommitmentsSourceMetadata;
}
export interface CommitmentsCredentialHealthImpact {
    status: CommitmentsCredentialStatus;
    cloudAccountId?: string;
    credentialId?: string;
    expiresAt?: string;
    lastSuccessfulSyncAt?: string;
    staleSections: string[];
    impactedResourceCount?: number;
    impactedResources?: CommitmentsResourceReference[];
    impactedCommitmentIds?: string[];
    warnings?: string[];
}
export interface CommitmentsPhasedOption {
    id: string;
    label: 'starter' | 'recommended' | 'aggressive' | 'custom';
    commitmentFamily: CommitmentsCommitmentFamily;
    action: CommitmentsRecommendationAction | CommitmentsRenewalAction;
    termMonths?: 12 | 36;
    quantity?: number;
    hourlyCommitmentAmount?: CommitmentsMoneyAmount;
    annualCommitmentCost?: CommitmentsMoneyAmount;
    estimatedAnnualSavings?: CommitmentsMoneyAmount;
    expectedCoveragePercent?: number;
    expectedWastePercent?: number;
    confidence?: CommitmentsConfidenceLevel;
    riskLevel?: CommitmentsRiskLevel;
    impactedResources?: CommitmentsResourceReference[];
    source?: CommitmentsSourceMetadata;
}
export type CommitmentsObsoleteCandidateType = 'underutilized' | 'coverage-drift' | 'sku-mismatch' | 'near-expiry';
export type CommitmentsSuggestedAction = 'renew' | 'let-expire' | 'exchange' | 'resize' | 'review';
export interface CommitmentsObsoleteCandidate {
    id: string;
    candidateType: CommitmentsObsoleteCandidateType;
    reasonCodes: string[];
    suggestedAction: CommitmentsSuggestedAction;
    confidence?: number;
    impactEstimate?: {
        amount?: number;
        currency?: string;
        currencySymbol?: string;
        source?: 'payg-cost' | 'amortized' | 'retail' | 'unknown';
        notes?: string;
        windowStart?: string;
        windowEnd?: string;
        flags?: string[];
    };
    relatedBenefitIds?: string[];
}
export interface CommitmentsReallocationResourceReference {
    resourceId: string;
    resourceName?: string;
    resourceType?: string;
    subscriptionId?: string;
    subscriptionName?: string;
}
export interface CommitmentsReallocationOpportunity {
    id: string;
    fromResource: CommitmentsReallocationResourceReference;
    toResource: CommitmentsReallocationResourceReference;
    estimatedNetSavings?: number;
    currency?: string;
    source?: 'payg-cost' | 'amortized' | 'retail' | 'unknown';
    confidence?: number;
    assumptions?: string[];
    benefitIds?: string[];
    benefitNames?: string[];
    recommendationIds?: string[];
    obsoleteCandidateIds?: string[];
}
export interface CommitmentsPricingContext {
    source: 'retail' | 'negotiated' | 'unknown' | 'recommendation-apis';
    currency?: string;
    assumptions?: string[];
    confidenceNotes?: string;
    calculatorDeepLink?: string;
}
export interface CommitmentsPolicyInputs {
    earlyTerminationFeePercent?: number;
    rollingCancellationCap?: number;
    exchangeAllowed: boolean;
    policyVersion: string;
}
export interface CommitmentsTermStrategyScenario {
    scenarioId: string;
    termMonths: number;
    breakMonth?: number;
    policyInputs: CommitmentsPolicyInputs;
    projectedGrossSavings?: number;
    projectedBreakCost?: number;
    projectedNetSavings?: number;
    /** Net savings normalized to a 12-month comparison period. */
    annualizedProjectedNetSavings?: number;
    breakEvenMonth?: number;
    recommended?: boolean;
    currency?: string;
    notes?: string;
}
//# sourceMappingURL=commitmentsPlanning.d.ts.map