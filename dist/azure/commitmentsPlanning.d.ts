import type { BenefitCostBasis, BenefitScope, BenefitType, IBenefitCoverageBreakdownEntry, IBenefitUtilization, IBenefitWeightedUtilizationAggregate } from './benefits.js';
import type { SubscriptionSummaryLite } from './subscriptions.js';
export type CommitmentsPlanningVersion = '1.0' | '2.0';
export type CommitmentsCommitmentFamily = 'compute-reservation' | 'compute-savings-plan' | 'app-service-reservation' | 'managed-disk-reservation' | 'blob-storage-reserved-capacity' | 'adls-reserved-capacity' | 'azure-files-reservation' | 'redis-reserved-capacity' | 'sql-reserved-capacity' | 'mysql-reserved-capacity' | 'postgresql-reserved-capacity' | 'mariadb-reserved-capacity' | 'cosmos-db-reserved-capacity' | 'azure-openai-provisioned-throughput-reservation' | 'generic-reservation';
export type CommitmentsSourceKind = 'azure-native' | 'spotto-derived' | 'fallback-heuristic' | 'manual' | 'unknown';
export type CommitmentsConfidenceLevel = 'high' | 'medium' | 'low' | 'unknown';
export type CommitmentsRiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'none' | 'unknown';
export type CommitmentsFreshnessStatus = 'current' | 'stale' | 'partial' | 'unavailable';
export type CommitmentsCredentialStatus = 'valid' | 'expiring' | 'expired' | 'unknown';
export type CommitmentsRenewalAction = 'renew-as-is' | 'move-before-renewal' | 'rescope' | 'trade-in-to-savings-plan' | 'do-not-renew' | 'review';
export type CommitmentsReservationUnit = 'hour' | '100-tib-month' | '1-pib-month' | '10-tib-month' | '100-tib-month';
export type CommitmentsStorageAccessTier = 'hot' | 'cool' | 'archive' | 'premium' | 'transaction-optimized' | 'unknown';
export type CommitmentsStorageRedundancy = 'LRS' | 'ZRS' | 'GRS' | 'GZRS' | 'RA-GRS' | 'RA-GZRS' | 'unknown';
export type CommitmentsStorageBillingModel = 'blob-standard' | 'gpv2-standard' | 'blob-storage' | 'azure-files-payg' | 'azure-files-provisioned-v1' | 'azure-files-provisioned-v2' | 'unknown';
export interface CommitmentsPlanningView {
    version: CommitmentsPlanningVersion;
    generatedAt: string;
    month?: string;
    subscription?: SubscriptionSummaryLite;
    utilizationSummary: CommitmentsUtilizationSummary;
    expirySummary: CommitmentsExpirySummary;
    inventory: CommitmentsInventoryItem[];
    resourceCoverage: CommitmentsResourceCoverageItem[];
    obsoleteCandidates: CommitmentsObsoleteCandidate[];
    reallocationOpportunities?: CommitmentsReallocationOpportunity[];
    pricingContext: CommitmentsPricingContext;
    termStrategy: CommitmentsTermStrategyScenario[];
    freshness?: CommitmentsFreshnessSummary;
    /** @deprecated Legacy read compatibility only. New artifacts should use purchaseRecommendations. */
    vendorRecommendations?: CommitmentsVendorRecommendation[];
    purchaseRecommendations?: CommitmentsPurchaseRecommendation[];
    diagnostics?: CommitmentsPlanningDiagnostics;
    coverage?: CommitmentsCoverageSummary[];
    renewals?: CommitmentsRenewalDecision[];
    storageCapacity?: CommitmentsStorageCapacitySection;
    risk?: CommitmentsRiskSummary;
    credentialHealth?: CommitmentsCredentialHealthImpact;
    retirementImpact?: CommitmentsRetirementImpactScenario[];
    phasedOptions?: CommitmentsPhasedOption[];
}
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
    scope: BenefitScope;
    type: string;
    displayName?: string;
    status: 'active' | 'expired';
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
    platform?: 'linux' | 'windows' | 'unknown';
    reservationProductName?: string;
    reservedResourceType?: string;
    meterCategory?: string;
    meterSubCategory?: string;
    meterName?: string;
    unit?: CommitmentsReservationUnit | string;
    attributes?: Record<string, string | number | boolean | undefined>;
}
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
export interface CommitmentsMoneyAmount {
    amount: number;
    currency: string;
    source?: 'actual' | 'amortized' | 'retail' | 'negotiated' | 'payg-cost' | 'unknown';
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
export type CommitmentsPurchaseRecommendationScope = 'single-resource-group' | 'single-subscription' | 'management-group' | 'shared' | 'unknown';
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
    appliedScopeProperties?: {
        subscriptionId?: string;
        resourceGroupId?: string;
        tenantId?: string;
        managementGroupId?: string;
    };
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
        source?: 'payg-cost' | 'amortized' | 'retail' | 'unknown';
        notes?: string;
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
    breakEvenMonth?: number;
    recommended?: boolean;
    notes?: string;
}
//# sourceMappingURL=commitmentsPlanning.d.ts.map