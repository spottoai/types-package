import { ActivityLog, DailySummary, MonthSummary } from './common.js';
import { DisplayMetric, MetricPlot, MetricsDefinition } from './metrics.js';
import { CostSummaryDetails, type AzureRetailPricingEvidence } from './prices.js';
import type { BenefitCostBasis, BenefitType, IBenefitCoverageBreakdownEntry } from './benefits.js';
import { AzureRecommendationLite, Recommendation, RecommendationDecisionContext, type RecommendationResource, type ResourceScopedRecommendation } from './recommendations.js';
import { SpendDataSource, SubscriptionSummary, SubscriptionSummaryLite } from './subscriptions.js';
import type { ResourceOptimizationProfile, ResourceSimpleOptimizationProfile } from './resourceOptimization.js';
import { Tags } from '../tags/tags.js';
import type { AdvisorScoreSummary } from './advisorScore.js';
import type { AzurePortalArtifactGeneration, AzurePortalVersionedArtifact } from './portalArtifacts.js';
import type { AzurePortalHealthEventsSummary, AzureResourceHealthAvailabilityStatusSummary } from './resourceHealth.js';
import type { CostComposition, EstimateLens } from './costComposition.js';
import { type ArtifactOwnershipBinding, type ArtifactPublicationDecision, type ArtifactRevisionVector } from '../common/artifactEvidence.js';
import type { ArtifactDescriptor } from '../common/artifactGeneration.js';
import type { PortfolioSavingsContributionV2, SavingsAggregateV2, SavingsLifecycleFreshnessV1 } from './savings.js';
import type { FinancialAuthorityResourceProjectionV1, FinancialAuthorityViewV1 } from './financialAuthorityView.js';
import type { FinancialSavingsAuthorityV1 } from './financialSavingsAuthority.js';
import type { FinancialSavingsSurfaceProjectionV1 } from './financialSavingsSurfaceProjection.js';
export interface AzureDashboardView extends AzurePortalVersionedArtifact {
    subscription: SubscriptionSummary;
    timestamp: string;
    costStartDate?: number;
    costEndDate?: number;
    calendarSummary?: MonthSummary;
    billingPeriodSummary?: MonthSummary;
    summary?: ExecutiveSummary;
    dailySummary?: DailySummary;
    costSavingsSummary?: CostSavingsSummary;
    /** Authoritative additive savings total for this complete dashboard scope. */
    savingsAggregate?: SavingsAggregateV2;
    savingsLifecycleFreshness?: SavingsLifecycleFreshnessV1;
    /** Compact generation-bound projection of the canonical Resources financial savings authority. */
    financialSavingsProjection?: FinancialSavingsSurfaceProjectionV1;
    advisorScore?: AdvisorScoreSummary;
    healthEvents?: AzurePortalHealthEventsSummary;
}
export interface ExecutiveSummary {
    summary: string;
    details: string;
}
export interface AzureResourcesView extends AzurePortalVersionedArtifact {
    subscription: SubscriptionSummaryLite;
    timestamp: string;
    resources: AzureResourcePortalItem[];
    /** 30-day billed spend not attributable to a specific resource (e.g. misc/security add-ons) */
    miscCost?: number;
    /** e.g. { "environment": ["production", "staging"], "team": ["devops", "frontend"] } */
    tags?: Record<string, string[]>;
    spottoTags?: Tags;
    costSavingsSummary?: CostSavingsSummary;
    /** Authoritative additive savings total for this complete resource scope. */
    savingsAggregate?: SavingsAggregateV2;
    /** Single generation-bound financial authority for vertically migrated resource scopes. */
    financialAuthority?: FinancialAuthorityViewV1;
    /** Savings authority bound one-to-one to the financial authority coordinates. */
    financialSavingsAuthority?: FinancialSavingsAuthorityV1;
}
/**
 * Note that many properties will not exist and is only specified here if it's custom, the rest of the properties will be looked up
 * such as icon, description, product, serviceName
 */
export interface AzureResourcePortalItem {
    /** e.g. "/subscriptions/12345678-1234-1234-1234-123456789012/resourceGroups/my-resource-group/providers/Microsoft.Web/sites/my-app-service" */
    id: string;
    /** e.g. "my-app-service" */
    name: string;
    /** e.g. Linux or Windows */
    label1?: string;
    /** e.g. 2 Cores, 4 GB RAM */
    label2?: string;
    label3?: string;
    /** e.g. "F1" or "P1" */
    sku?: string;
    /** e.g. "App Service" or "Function App" */
    serviceName?: string;
    /** e.g. "appservice" or "functionapp" */
    icon?: string;
    /** e.g. "Azure App Service is an HTTP-based service for hosting web applications, REST APIs, and mobile back ends. You can develop in your favorite language, be it .NET, .NET Core, Java, Ruby, Node.js, PHP, or Python. Applications run and scale with ease on both Windows and Linux-based environments." */
    description?: string;
    /** e.g. "https://azure.microsoft.com/en-us/products/app-service/" */
    product?: string;
    /** e.g. "Microsoft.Web/sites" */
    type: string;
    /** e.g. "West US" */
    location: string;
    /** Total spend over the last 30 days */
    spend: number;
    /** Total spend over the last 30 days, taking into account reserved instances and savings plans */
    spendAmortized: number;
    /** Billing-backed portion of spend over the last 30 days */
    spendActual?: number;
    /** Billing-backed portion of amortized spend over the last 30 days */
    spendAmortizedActual?: number;
    /** Estimated portion of spend over the last 30 days */
    spendEstimated?: number;
    /** Estimated portion of amortized spend over the last 30 days */
    spendAmortizedEstimated?: number;
    /** Number of covered days in the fixed 30-day spend window */
    coverageDays?: number;
    /** Source of spend value */
    spendSource?: SpendDataSource;
    /** Confidence for spend source attribution */
    spendSourceConfidence?: 'high' | 'unknown';
    /** Optional source detail such as estimator method */
    spendSourceDetail?: string;
    /** Last day with actual billed cost for this resource in the current window */
    billingActualThroughDate?: number;
    /** First day of estimation gap (typically billingActualThroughDate + 1) */
    estimationCutoffStartDate?: number;
    composition?: CostComposition;
    /** Which savings basis should be shown for this resource */
    savingsBasis?: CostSavingsSpendBasis;
    /** Canonical resource ID that owns this savings amount for aggregation */
    savingsOwnerResourceId?: string;
    /** Resource IDs that may display this savings amount as context */
    savingsDisplayResourceIds?: string[];
    /** Billable component key used with the owner ID to prevent double counting */
    billableComponentKey?: string;
    /** Aggregation rule for this savings amount */
    savingsAggregationPolicy?: CostSavingsAggregationPolicy;
    savings?: SavingsPotential;
    /** Canonical additive contribution owned by this resource projection. */
    portfolioContribution?: PortfolioSavingsContributionV2;
    recommendations: AzureRecommendationLite[];
    /** Spotto recommendations */
    customRecommendations: AzureRecommendationLite[];
    /** e.g. { "environment": "production", "team": "devops" } */
    tags?: Record<string, string>;
    spottoTags?: Tags;
    /** e.g. 1715769600000 (Unix timestamp in milliseconds) */
    createdTime?: number;
    benefitsCoverage?: BenefitCoverageSummary;
    /** This is simplfied */
    optimizationProfile?: ResourceSimpleOptimizationProfile;
    /** VM-specific same-region price/performance lookup data. */
    vmPricePerformance?: VmPricePerformanceInsights;
    /** Current Azure Resource Health availability status for this resource, when available. */
    resourceHealth?: AzureResourceHealthAvailabilityStatusSummary;
}
export interface SavingsOpportunity {
    /** Stable identifier for the customer-facing savings opportunity. */
    id: string;
    /** Customer-facing explanation of the action or scenario that produces the saving. */
    label: string;
    /** Monthly saving represented by this opportunity. */
    amount: number;
    /** Percentage of the same monthly baseline, when available. */
    percentage?: number;
}
export interface SavingsPotential {
    minAmount: number;
    minPercentage: number;
    maxAmount: number;
    maxPercentage: number;
    /** Source-agnostic explanations for the displayed savings amount. */
    opportunities?: SavingsOpportunity[];
    /**
     * ISO 4217 currency for monetary amounts when not inherited from a containing subscription artifact.
     * Consumers must reject a conflict with an enclosing artifact currency.
     */
    currency?: string;
}
/** Monetary savings kept separate by one canonical ISO currency during cross-scope aggregation. */
export type CurrencySavingsValue = Omit<SavingsPotential, 'currency'> & {
    currency?: never;
};
export interface CurrencySavingsGroup {
    currency: string;
    savings: CurrencySavingsValue;
}
export type CostSavingsSpendBasis = 'billed' | 'amortized';
export type CostSavingsAggregationPolicy = 'owner-component' | 'resource';
export interface BenefitCoverageSummary {
    windowStart: string;
    windowEnd: string;
    coveredQuantity: number;
    benefitIds: string[];
    benefitNames: string[];
    /** Explicit benefit classifications represented by this coverage window. */
    benefitTypes?: BenefitType[];
    basis?: BenefitCostBasis;
    eligibleQuantity?: number;
    eligibleCost?: number;
    coveredCost?: number;
    uncoveredCost?: number;
    coveragePercent?: number;
    benefitBreakdown?: IBenefitCoverageBreakdownEntry[];
    warning?: string;
}
export interface AzureResourcePluginView {
    currency: string;
    currencySymbol: string;
    timestamp: string;
    resources: AzureResourcePluginItem[];
    costStartDate?: number;
    costEndDate?: number;
}
export interface AzureResourcePluginItem {
    id: string;
    name: string;
    type: string;
    location: string;
    recommendations?: Recommendation[];
    /** Canonical deduplicated savings for this resource. */
    savings?: SavingsPotential;
    /** Optional linked context explaining related recommendations for this resource. */
    recommendationDecisionContexts?: RecommendationDecisionContext[];
    cost?: CostSummaryDetails;
    /** Billing-backed portion of cost total */
    spendActual?: number;
    /** Billing-backed portion of amortized cost total */
    spendAmortizedActual?: number;
    /** Estimated portion of cost total */
    spendEstimated?: number;
    /** Estimated portion of amortized cost total */
    spendAmortizedEstimated?: number;
    /** Source of cost value */
    costSource?: SpendDataSource;
    /** Confidence for cost source attribution */
    costSourceConfidence?: 'high' | 'unknown';
    /** Optional source detail such as estimator method */
    costSourceDetail?: string;
    /** Last day with actual billed cost for this resource in the current window */
    billingActualThroughDate?: number;
    /** First day of estimation gap (typically billingActualThroughDate + 1) */
    estimationCutoffStartDate?: number;
    composition?: CostComposition;
    metrics?: DisplayMetric[];
    activityLogs?: ActivityLog[];
    benefitsCoverage?: BenefitCoverageSummary;
    optimizationProfile?: ResourceOptimizationProfile;
    /** VM-specific same-region price/performance lookup data. */
    vmPricePerformance?: VmPricePerformanceInsights;
}
export interface AzureResourcePluginItemDetailed {
    currency: string;
    currencySymbol: string;
    location: string;
    costStartDate?: number;
    costEndDate?: number;
    timestamp: string;
    id: string;
    /** Added to help identify the company */
    companyId?: string;
    type: string;
    name: string;
    /** Resource-specific display name resolved by the artifact producer. */
    serviceName?: string;
    /** Resource-specific icon key resolved by the artifact producer. */
    icon?: string;
    /** Resource-specific description resolved by the artifact producer. */
    description?: string;
    /** Resource-specific product URL resolved by the artifact producer. */
    product?: string;
    recommendations?: ResourceScopedRecommendation[];
    /** Canonical deduplicated savings for this resource. */
    savings?: SavingsPotential;
    /** Optional linked context explaining related recommendations for this resource. */
    recommendationDecisionContexts?: RecommendationDecisionContext[];
    cost?: CostSummaryDetails;
    spendActual?: number;
    spendAmortizedActual?: number;
    spendEstimated?: number;
    spendAmortizedEstimated?: number;
    costSource?: SpendDataSource;
    costSourceConfidence?: 'high' | 'unknown';
    costSourceDetail?: string;
    billingActualThroughDate?: number;
    estimationCutoffStartDate?: number;
    composition?: CostComposition;
    metrics?: DisplayMetric[];
    activityLogs?: ActivityLog[];
    properties?: Record<string, string>;
    plots?: MetricPlot[];
    metricsDefinitions?: MetricsDefinition[];
    subscription: string;
    resourceGroup: string;
    tags?: Record<string, string>;
    spottoTags?: Tags;
    benefitsCoverage?: BenefitCoverageSummary;
    optimizationProfile?: ResourceOptimizationProfile;
    /** VM-specific same-region price/performance lookup data. */
    vmPricePerformance?: VmPricePerformanceInsights;
    /** Resource-scoped, non-additive projection from the canonical Portal financial authority. */
    financialAuthorityProjection?: FinancialAuthorityResourceProjectionV1;
    /** Generic compute hosting model alternatives, including cross-platform options. */
    computeAlternatives?: ComputeAlternativesInsights;
}
export type VmPricePerformanceOsType = 'linux' | 'windows';
/** Operating system installed on the VM or VM scale set. */
export type VmPricePerformanceGuestOsType = 'linux' | 'windows';
/** How Windows licensing is represented in the VM catalog price. */
export type VmPricePerformanceWindowsLicensePricing = 'azure-hybrid-benefit' | 'license-included' | 'not-applicable';
export type VmPricePerformanceTier = 'standard' | 'spot' | 'low' | string;
export type VmPricePerformancePurchaseOption = 'payg' | 'devtest' | 'reserved1y' | 'reserved3y' | 'savingsplan1y' | 'savingsplan3y' | 'spot' | string;
export type VmPricePerformanceBenchmarkConfidence = 'low' | 'medium' | 'high' | 'unknown';
export type VmPricePerformanceComparisonEligibility = 'default' | 'excluded-tier' | 'excluded-burstable' | 'excluded-low-confidence' | 'unavailable-in-subscription' | 'feature-trade-off' | string;
export type VmPricePerformanceComparisonBasis = 'payg-retail' | 'spot-estimate' | 'reservation-coverage';
export type VmReservationCompatibility = 'full' | 'partial' | 'none' | 'unknown';
export type VmReservationCompatibilityReason = 'same-flexibility-group-within-covered-units' | 'same-flexibility-group-exceeds-covered-units' | 'different-flexibility-group' | 'instance-flexibility-disabled' | 'missing-instance-flexibility-setting' | 'missing-flexibility-evidence' | string;
export interface VmReservationCoverageContext {
    benefitType: 'reservation';
    benefitIds?: string[];
    benefitNames?: string[];
    coveragePercent?: number;
    flexibilityGroup?: string;
    currentNormalizedUnits?: number;
    coveredNormalizedUnits?: number;
    instanceFlexibility: 'on' | 'off' | 'unknown';
    evidenceSource: 'azure-reservations-catalog' | 'billing-coverage-only';
}
export interface VmReservationCoverageImpact {
    compatibility: VmReservationCompatibility;
    reason: VmReservationCompatibilityReason;
    flexibilityGroup?: string;
    normalizedUnitsRequired?: number;
    normalizedUnitsCovered?: number;
    normalizedUnitsDelta?: number;
}
export interface VmPricePerformanceCatalogSource {
    /** Lowercase static lookup file, e.g. `vm-usd-australiaeast.csv`. */
    fileName: string;
    /** Canonical region key used by the lookup file, e.g. `australiaeast`. */
    region: string;
    /** The current catalog is generated in USD for tenant-neutral comparison. */
    currencyCode: 'USD';
    /** Subscription/display currency used for user-facing price fields when available. */
    displayCurrencyCode?: string;
    displayPricingSource?: 'Azure Retail Prices API' | string;
    generatedAt?: string;
}
export type VmPricePerformanceCapabilityImpactSeverity = 'info' | 'warning' | 'blocking' | 'unknown' | string;
export type VmPricePerformanceCapabilityImpactBasis = 'sku-capability' | 'current-setting' | 'observed-usage' | 'unknown' | string;
export type VmPricePerformanceCapabilityImpactMateriality = 'used' | 'not-used' | 'unknown' | 'not-applicable' | string;
export interface VmPricePerformanceCurrentRuntimeSettings {
    osDiskStorageAccountType?: string;
    dataDiskStorageAccountTypes?: string[];
    dataDiskCount?: number;
    premiumDiskInUse?: boolean;
    premiumOsDiskInUse?: boolean;
    premiumDataDiskInUse?: boolean;
    premiumDataDiskCount?: number;
    ultraSsdEnabled?: boolean;
    ephemeralOsDiskConfigured?: boolean;
    acceleratedNetworkingKnown?: boolean;
    acceleratedNetworkingEnabled?: boolean;
    networkInterfaceCount?: number;
    resourceDiskUsageKnown?: boolean;
    resourceDiskInUse?: boolean;
    resourceDiskUsageBytes?: number;
}
export interface VmPricePerformanceCapabilityImpact {
    /** Matches the existing lost-capability key when the impact describes a lost SKU capability. */
    key: string;
    label?: string;
    severity: VmPricePerformanceCapabilityImpactSeverity;
    basis: VmPricePerformanceCapabilityImpactBasis;
    materiality?: VmPricePerformanceCapabilityImpactMateriality;
    currentValue?: unknown;
    alternativeValue?: unknown;
    message?: string;
}
/**
 * Azure-reported Kusto SKU availability and capacity constraints for a
 * catalogue alternative. These fields are capability metadata, not financial
 * evidence, and must never be used alone to project whole-cluster cost.
 */
export interface KustoClusterSkuConfiguration {
    sourceKustoSkuName: string;
    sourceTier: string;
    sourceCapacity: number;
    targetKustoSkuName: string;
    targetTier: string;
    targetCapacity: number;
    targetMinimumCapacity: number;
    targetMaximumCapacity: number;
    targetDefaultCapacity: number;
    capacitySelectionBasis: 'current-capacity' | 'target-minimum';
}
export interface VmPricePerformanceSku {
    armSkuName: string;
    region: string;
    currencyCode: 'USD';
    /**
     * Legacy catalog operating-system dimension. This describes the pricing row,
     * not necessarily the guest operating system. Prefer `pricingOsType`.
     */
    osType: VmPricePerformanceOsType;
    /** Operating-system dimension used to select this catalog pricing row. */
    pricingOsType?: VmPricePerformanceOsType;
    tier: VmPricePerformanceTier;
    purchaseOption: VmPricePerformancePurchaseOption;
    hourlyPriceUsd?: number;
    monthlyPriceUsd?: number;
    /** Subscription-currency retail price. Prefer this over USD fields for UI display. */
    localCurrencyCode?: string;
    localCurrencySymbol?: string;
    localHourlyPrice?: number;
    /** Exact decimal representation consumed by the financial projection engine. */
    localHourlyPriceExact?: string;
    localMonthlyPrice?: number;
    /** Content-bound retail-rate evidence. Monetary projections require this. */
    retailRateEvidence?: AzureRetailPricingEvidence;
    /** Azure-reported capability metadata for a Kusto engine SKU candidate. */
    kustoClusterConfiguration?: KustoClusterSkuConfiguration;
    numberOfCores?: number;
    memoryGB?: number;
    maxDataDiskCount?: number;
    maxRemoteStorageDisks?: number;
    resourceDiskSizeMB?: number;
    family?: string;
    sizeFamily?: string;
    cpuArchitecture?: string;
    supportsPremiumDisk?: boolean;
    acceleratedNetworking?: boolean;
    rdmaEnabled?: boolean;
    hyperVGenerations?: string[];
    hasGpu?: boolean;
    gpuCount?: number;
    gpuMemoryGB?: number;
    gpuModel?: string;
    hasTempDisk?: boolean;
    tempDiskType?: string;
    maxTempStorageDisks?: number;
    tempDiskSizePerDiskMiB?: number;
    hasNvmeTempDisk?: boolean;
    nvmeDiskCount?: number;
    nvmeDiskSizePerDiskMiB?: number;
    maxNics?: number;
    maxNetworkBandwidthMbps?: number;
    supportsEphemeralOsDisk?: boolean;
    azureSiteRecoverySkuEligible?: boolean;
    azureSiteRecoverySkuIneligibleReasons?: string[];
    supportedRemoteDiskTypes?: string[];
    benchmarkScore?: number;
    benchmarkConfidence?: VmPricePerformanceBenchmarkConfidence;
    pricePerPerformance?: number;
    performancePerDollar?: number;
    pricePerCoreUsd?: number;
    pricePerMemoryGBUsd?: number;
    localPricePerCore?: number;
    localPricePerMemoryGB?: number;
    comparisonEligibility?: VmPricePerformanceComparisonEligibility;
    /** Azure Reservation Catalog instance-size-flexibility group. */
    reservationFlexibilityGroup?: string;
    /** Azure Reservation Catalog normalized-unit ratio for this SKU. */
    reservationNormalizedUnits?: number;
}
export interface VmPricePerformanceAlternative extends VmPricePerformanceSku {
    rank: number;
    savingsHourlyUsd?: number;
    savingsMonthlyUsd?: number;
    localSavingsHourly?: number;
    localSavingsMonthly?: number;
    localSavingsPercent?: number;
    savingsPercent?: number;
    performanceDeltaPercent?: number;
    pricePerPerformanceDeltaPercent?: number;
    reason?: string;
    alternativeCategory?: string;
    lostCapabilities?: string[];
    burstableFit?: VmBurstableFitEvidence;
    capabilityImpacts?: VmPricePerformanceCapabilityImpact[];
    reservationCoverageImpact?: VmReservationCoverageImpact;
}
export type VmBurstableFit = 'strong' | 'possible';
export type VmBurstableAlternativeRole = 'lowest-cost' | 'balanced' | 'maximum-headroom' | 'additional';
export type VmBurstableDemandNormalizationBasis = 'benchmark-capacity' | 'core-count';
export interface VmBurstableCreditScenarioEvidence {
    creditsExhausted: boolean;
    estimatedThrottleHours: number;
    minimumCredits: number;
    endingCredits: number;
    bankingTimePercent: number;
    consumingTimePercent: number;
}
export interface VmBurstableFitEvidence {
    fit: VmBurstableFit;
    role: VmBurstableAlternativeRole;
    demandNormalizationBasis: VmBurstableDemandNormalizationBasis;
    baselineCpuPercent: number;
    baselineCpuCores: number;
    projectedAverageCpuPercent: number;
    projectedP95CpuPercent: number;
    projectedP99CpuPercent: number;
    projectedMemoryP95Percent?: number;
    projectedMemoryP99Percent?: number;
    growthStressPercent: number;
    observedHours: number;
    observed: VmBurstableCreditScenarioEvidence;
    growthStress: VmBurstableCreditScenarioEvidence;
}
export interface VmPricePerformanceTradeOffAlternative extends VmPricePerformanceAlternative {
    /** Capabilities that are present on the current SKU but are absent or lower on this alternative. */
    lostCapabilities: string[];
}
export interface VmPricePerformanceInsights {
    /** Keep the first version intentionally simple: compare alternatives only in the resource's current region. */
    comparisonScope: 'same-region';
    /** Authority used for user-visible comparisons and recommendation semantics. */
    comparisonBasis?: VmPricePerformanceComparisonBasis;
    /** Subscription/display currency used for user-facing price fields when available. */
    displayCurrencyCode?: string;
    displayCurrencySymbol?: string;
    /** Operating system installed on the resource. */
    guestOsType?: VmPricePerformanceGuestOsType;
    /** Operating-system dimension used for catalog pricing and comparison rows. */
    pricingOsType?: VmPricePerformanceOsType;
    /** Explains whether a Windows license is included in, or excluded from, the displayed catalog price. */
    windowsLicensePricing?: VmPricePerformanceWindowsLicensePricing;
    /** True only when the displayed catalog price includes the Windows license component. */
    windowsLicenseIncludedInPrice?: boolean;
    current?: VmPricePerformanceSku;
    /** Present when current billing usage is covered by an active Reservation. */
    reservationCoverage?: VmReservationCoverageContext;
    /** Current VM/VMSS configuration facts used to decide whether lost SKU capabilities are material. */
    currentRuntimeSettings?: VmPricePerformanceCurrentRuntimeSettings;
    /** Feature-compatible alternatives that are safe default candidates. */
    alternatives: VmPricePerformanceAlternative[];
    /** Burstable VM alternatives that require burst-credit validation and workload compatibility review. */
    burstableAlternatives?: VmPricePerformanceAlternative[];
    /** Cheaper or better price/performance options that require review because they lose current SKU capabilities. */
    tradeOffAlternatives?: VmPricePerformanceTradeOffAlternative[];
    source: VmPricePerformanceCatalogSource;
}
export type ComputeAlternativesComparisonScope = 'same-resource' | 'same-plan' | 'workload' | 'estimated-workload';
export type ComputeServiceKind = 'virtual-machine' | 'virtual-machine-scale-set' | 'app-service-plan' | 'functions-flex-consumption' | 'functions-premium' | 'functions-consumption' | 'container-apps' | 'azure-kubernetes-service' | 'azure-batch' | 'azure-container-instances' | 'unknown' | string;
export type ComputeAlternativeCategory = 'same-platform' | 'cross-platform';
export type ComputeAlternativeFit = 'good' | 'possible' | 'tradeoff' | 'poor' | 'blocked';
export type ComputeAlternativeConfidence = 'high' | 'medium' | 'low' | 'unknown';
export type ComputeAlternativeCostBasis = 'observed' | 'retail' | 'scenario' | 'amortized' | 'estimated' | 'requiresTelemetry' | string;
export type ComputeAlternativeOsType = 'windows' | 'linux' | 'mixed' | 'unknown';
export type ComputeAlternativeScalingModel = 'fixed' | 'manual' | 'autoscale' | 'event-driven' | 'scale-to-zero' | 'always-ready' | 'node-pool' | 'unknown' | string;
export type ComputeAlternativeMigrationEffort = 'configuration' | 'redeploy' | 'runtime-migration' | 'containerization' | 'application-refactor' | 'architecture-redesign' | 'unknown';
export type ComputeAlternativeSeverity = 'info' | 'warning' | 'blocking' | 'unknown' | string;
export interface ComputeAlternativesSource {
    generatedAt?: string;
    pricingSource?: string;
    evidenceSource?: string;
    displayCurrencyCode?: string;
    notes?: string[];
}
export interface ComputeCapacitySummary {
    vcpu?: number;
    memoryGB?: number;
    instanceCount?: number;
    minInstances?: number;
    maxInstances?: number;
    minReplicas?: number;
    maxReplicas?: number;
    storageGB?: number;
}
export interface ComputeScalingSummary {
    model?: ComputeAlternativeScalingModel;
    scaleToZero?: boolean;
    autoscaleEnabled?: boolean;
    alwaysReadyInstances?: number;
    prewarmedInstances?: number;
    minInstances?: number;
    maxInstances?: number;
    minReplicas?: number;
    maxReplicas?: number;
    notes?: string[];
}
export interface ComputeUtilizationSummary {
    cpuAveragePercent?: number;
    cpuP95Percent?: number;
    cpuP99Percent?: number;
    cpuMaxPercent?: number;
    memoryAveragePercent?: number;
    memoryP95Percent?: number;
    memoryP99Percent?: number;
    memoryMaxPercent?: number;
    queueP95?: number;
    queueMax?: number;
    runningTimePercent?: number;
}
export interface ComputeAlternativePricing {
    currencyCode?: string;
    currencySymbol?: string;
    hourlyPrice?: number;
    monthlyPrice?: number;
    reservationEligible?: boolean;
    savingsPlanEligible?: boolean;
    freeAllowanceEligible?: boolean;
    basis: ComputeAlternativeCostBasis;
    explanation?: string;
}
export interface ComputeMonthlyCostEstimate {
    low?: number;
    expected?: number;
    high?: number;
    currencyCode?: string;
    currencySymbol?: string;
    basis: ComputeAlternativeCostBasis;
    confidence: ComputeAlternativeConfidence;
    explanation: string;
}
export interface ComputeSavingsEstimate {
    monthlyLow?: number;
    monthlyExpected?: number;
    monthlyHigh?: number;
    percentLow?: number;
    percentExpected?: number;
    percentHigh?: number;
    basis: ComputeAlternativeCostBasis;
}
export interface ComputeOperationalModel {
    managedService?: boolean;
    osManagementRequired?: boolean;
    supportsDeploymentSlots?: boolean;
    supportsRevisions?: boolean;
    supportsManagedIdentity?: boolean;
    supportsPrivateNetworking?: boolean;
    supportsZoneRedundancy?: boolean;
    notes?: string[];
}
export interface ComputeMigrationSummary {
    effort: ComputeAlternativeMigrationEffort;
    requiresCodeChange?: boolean;
    requiresContainerization?: boolean;
    requiresRuntimeMigration?: boolean;
    requiresNetworkChanges?: boolean;
    requiresDataMigration?: boolean;
    notes?: string[];
}
export interface ComputeAlternativeEvidence {
    label: string;
    value: string;
    severity?: ComputeAlternativeSeverity;
    source?: string;
}
export interface ComputeAlternativeBlocker {
    key: string;
    label: string;
    severity: ComputeAlternativeSeverity;
    message: string;
}
export interface ComputeAlternativeTradeoff {
    key: string;
    label: string;
    severity?: ComputeAlternativeSeverity;
    message: string;
}
export interface ComputeAlternativeCurrent {
    service: ComputeServiceKind;
    label: string;
    resourceType: string;
    skuName?: string;
    planType?: string;
    osType?: ComputeAlternativeOsType;
    region?: string;
    monthlyCost?: number;
    costBasis?: ComputeAlternativeCostBasis;
    capacity?: ComputeCapacitySummary;
    scaling?: ComputeScalingSummary;
    utilization?: ComputeUtilizationSummary;
}
export interface ComputeAlternative {
    id: string;
    service: ComputeServiceKind;
    label: string;
    category: ComputeAlternativeCategory;
    fit: ComputeAlternativeFit;
    confidence: ComputeAlternativeConfidence;
    rank?: number;
    summary: string;
    monthlyCostEstimate?: ComputeMonthlyCostEstimate;
    savingsEstimate?: ComputeSavingsEstimate;
    pricing?: ComputeAlternativePricing;
    capacity?: ComputeCapacitySummary;
    scaling?: ComputeScalingSummary;
    operationalModel?: ComputeOperationalModel;
    migration?: ComputeMigrationSummary;
    evidence: ComputeAlternativeEvidence[];
    blockers?: ComputeAlternativeBlocker[];
    tradeoffs?: ComputeAlternativeTradeoff[];
    assumptions?: string[];
    nextSteps?: string[];
}
export interface ComputeAlternativesInsights {
    version: 1;
    comparisonScope: ComputeAlternativesComparisonScope;
    displayCurrencyCode?: string;
    displayCurrencySymbol?: string;
    current: ComputeAlternativeCurrent;
    alternatives: ComputeAlternative[];
    source: ComputeAlternativesSource;
}
/** This is used by the plugin summaryu (e.g. A list of all the VMs on the VMs page) */
export interface AzurePluginResourcesLite {
    currency: string;
    currencySymbol: string;
    resources: AzurePluginResourceLite[];
}
export interface AzurePluginResourceLite {
    resourceId: string;
    /** Total spend over the last 30 days */
    spend: number;
    /** Total amortized spend over the last 30 days */
    amortizedSpend: number;
    recommendations: AzureRecommendationLite[];
    /** Spotto recommendations */
    customRecommendations: AzureRecommendationLite[];
}
export interface CostSavingsSummary {
    currency: string;
    currencySymbol?: string;
    costStartDate?: number;
    costEndDate?: number;
    totals: {
        currentMonthly: number;
        potentialMonthly: number;
        minSavings: number;
        maxSavings: number;
        minSavingsPercent?: number;
        maxSavingsPercent?: number;
    };
    categories: CostSavingsCategoryBreakdown[];
    billingBasis?: CostSavingsBillingBasis;
    savingsBasis?: CostSavingsSummaryBasis;
}
export interface CostSavingsBillingBasis {
    rule: 'exclude_latest_billing_date_estimated_rows_and_billing_lag' | string;
    source?: string;
    observedStartDate?: number;
    observedEndDate?: number;
    stableStartDate?: number;
    stableEndDate?: number;
    excludedDates: number[];
    totalRows: number;
    stableRows: number;
    excludedRows: number;
    excludedEstimatedRows: number;
    excludedLatestDateRows: number;
    excludedBillingLagRows: number;
    billingLagDays: number;
    stableCutoffDate?: number;
    includesEstimatedRows: boolean;
    selectedLens?: EstimateLens;
}
export interface CostSavingsSummaryBasis {
    categoryScope: 'Cost' | string;
    projection: 'projected_monthly' | string;
    observedPeriod: 'stable_billing_window' | 'mixed_stable_and_legacy' | string;
    excludesEstimatedRows: boolean;
    appliesTo: 'all_included_savings' | 'stable_savings_only' | string;
    containsLegacySavings: boolean;
}
export interface CostSavingsCategoryBreakdown {
    key: string;
    label: string;
    recommendationCount: number;
    resourceCount: number;
    currentMonthly: number;
    potentialMonthly: number;
    minSavings: number;
    maxSavings: number;
    sampleRecommendations: string[];
    sampleResources: string[];
}
export interface StableWholeResourceDeletionBackfillDiagnostics {
    recommendationCount: number;
    resourceCount: number;
    stableBillingRowCount: number;
    stableSpendIndexResourceCount: number;
    registeredResourceCount: number;
    missingStableSpendResourceCount: number;
    missingStableSpendReasonCounts: Record<string, number>;
    relatedResourceCount: number;
    registeredMaxMonthlySavings: number;
    registeredRecommendations: Record<string, {
        resourceCount: number;
        maxMonthlySavings: number;
    }>;
    missingStableSpendResourceSamples: string[];
}
export interface CompletedViewCostSavingsManifest {
    costStartDate?: number;
    costEndDate?: number;
    billingBasis?: CostSavingsBillingBasis;
    savingsBasis?: CostSavingsSummaryBasis;
    stableWholeResourceDeletionBackfill?: StableWholeResourceDeletionBackfillDiagnostics;
}
export type CompletedViewArtifactGeneration = AzurePortalArtifactGeneration;
/** Legacy manifest shape retained for backward-compatible readers and writers. */
export interface CompletedViewManifest {
    status: 'in_progress' | 'completed';
    runId: string;
    subscriptionId: string;
    artifacts: string[];
    artifactGeneration: CompletedViewArtifactGeneration;
    costSavings?: CompletedViewCostSavingsManifest;
    startedAt?: string;
    completedAt?: string;
}
export interface CompletedViewManifestV2RequestedCounts {
    requestedArtifactCount: number;
    requestedResourceCount: number;
}
export type CompletedViewEconomicsDependency = {
    generationId: string;
    fingerprint?: string;
    status?: never;
} | {
    status: 'unverified';
    generationId?: never;
    fingerprint?: never;
};
export interface CompletedViewGenerationDependencies {
    economics?: CompletedViewEconomicsDependency;
    [dependency: string]: unknown;
}
export interface CompletedViewManifestV2Base extends CompletedViewManifestV2RequestedCounts {
    schemaVersion: 2;
    runId: string;
    subscriptionId: string;
    /** Requested artifact paths for this generation. */
    artifacts: string[];
    artifactGeneration: CompletedViewArtifactGeneration;
    costSavings?: CompletedViewCostSavingsManifest;
    /** Source generations that readers can use to prevent cross-view mixing. */
    dependencies?: CompletedViewGenerationDependencies;
}
export interface CompletedViewManifestV2ProgressCounts {
    completedArtifactCount: number;
    completedResourceCount: number;
}
export type CompletedViewManifestV2PartialFailure = {
    failureKind: 'artifact';
    failedArtifactCount: number;
    failedArtifacts: [string, ...string[]];
    failedResourceCount: 0;
    failedResourceIds: [];
} | {
    failureKind: 'resource';
    failedArtifactCount: 0;
    failedArtifacts: [];
    failedResourceCount: number;
    failedResourceIds: [string, ...string[]];
} | {
    failureKind: 'artifact-and-resource';
    failedArtifactCount: number;
    failedArtifacts: [string, ...string[]];
    failedResourceCount: number;
    failedResourceIds: [string, ...string[]];
};
/**
 * Strict generation manifest for new writers. Runtime readers must additionally
 * validate non-negative integer counts, requested/completed/failed reconciliation,
 * bounded failure samples, and equality of `runId` and `artifactGeneration.runId`.
 */
export type CompletedViewManifestV2 = CompletedViewManifestV2Base & ((CompletedViewManifestV2ProgressCounts & {
    status: 'in_progress';
    startedAt: string;
    completedAt?: never;
    failedArtifactCount: 0;
    failedResourceCount: 0;
    failedArtifacts?: never;
    failedResourceIds?: never;
}) | {
    status: 'completed';
    startedAt?: string;
    completedAt: string;
    completedArtifactCount?: never;
    completedResourceCount?: never;
    failedArtifactCount: 0;
    failedResourceCount: 0;
    failedArtifacts?: never;
    failedResourceIds?: never;
} | (CompletedViewManifestV2ProgressCounts & CompletedViewManifestV2PartialFailure & {
    status: 'partial';
    startedAt?: string;
    completedAt: string;
}));
interface CompletedViewArtifactDescriptor extends ArtifactDescriptor {
    path: string;
}
export type PublishedViewCoverage = 'complete' | 'partial';
export declare const PUBLISHED_VIEW_OBJECT_LIMITS_V1: {
    readonly maxArtifacts: 512;
    readonly maxClaims: 128;
    readonly maxDependencies: 256;
    readonly maxIssues: 512;
    readonly maxClaimBindings: 512;
    readonly maxSectionPaths: 512;
};
interface PublishedViewClaimBinding {
    claimId: string;
    sectionPaths: [string, ...string[]];
}
interface PublishedViewArtifactDescriptor extends CompletedViewArtifactDescriptor {
    claimBindings: [PublishedViewClaimBinding, ...PublishedViewClaimBinding[]];
}
type EpochFreeAzureViewOwnership = ArtifactOwnershipBinding<'azure'> & {
    ownershipEpochRevision?: never;
};
type EpochFreeViewRevision = ArtifactRevisionVector & {
    ownershipEpochRevision?: never;
};
/** Completed, evidence-aware portal or plugin generation for reader-first enforcement. */
export interface CompletedViewManifestV3 extends CompletedViewManifestV2RequestedCounts {
    schemaVersion: 3;
    status: 'completed';
    runId: string;
    subscriptionId: string;
    artifacts: [CompletedViewArtifactDescriptor, ...CompletedViewArtifactDescriptor[]];
    artifactGeneration: CompletedViewArtifactGeneration;
    costSavings?: CompletedViewCostSavingsManifest;
    failedArtifactCount: 0;
    failedResourceCount: 0;
    ownership: ArtifactOwnershipBinding<'azure'>;
    revision: ArtifactRevisionVector;
    compositeDependencyDigest: string;
    publicationDecision: ArtifactPublicationDecision;
    completedAt: string;
}
/** Claim-projected portal or plugin generation that can retain authoritative partial coverage. */
export interface PublishedViewManifestV4 extends CompletedViewManifestV2RequestedCounts {
    schemaVersion: 4;
    status: 'published';
    coverage: PublishedViewCoverage;
    runId: string;
    subscriptionId: string;
    artifacts: [PublishedViewArtifactDescriptor, ...PublishedViewArtifactDescriptor[]];
    artifactGeneration: CompletedViewArtifactGeneration;
    costSavings?: CompletedViewCostSavingsManifest;
    failedArtifactCount: 0;
    failedResourceCount: 0;
    ownership: EpochFreeAzureViewOwnership;
    revision: EpochFreeViewRevision;
    compositeDependencyDigest: string;
    publicationDecision: ArtifactPublicationDecision;
    completedAt: string;
}
export type AnyCompletedViewManifest = CompletedViewManifest | CompletedViewManifestV2 | CompletedViewManifestV3;
export interface AzureViewSetSurfaceReference {
    /** Immutable generation run ID declared by the surface completed manifest. */
    runId: string;
    /** Subscription-relative logical path to the immutable run-local manifest. */
    manifestPath: string;
    completedAt: string;
}
export interface CompletedAzureViewSetV1 {
    schemaVersion: 1;
    status: 'completed';
    subscriptionId: string;
    /** Correlates the exact portal and plugin results supplied by one orchestrator. */
    publicationId: string;
    portal: AzureViewSetSurfaceReference;
    plugin: AzureViewSetSurfaceReference;
    economics: {
        generationId: string;
        fingerprint: string;
    };
    completedAt: string;
}
type CompletedArtifactPublicationDecision = Extract<ArtifactPublicationDecision, {
    publication: 'completed';
}>;
interface AzureViewSetV2SurfaceReference {
    runId: string;
    manifestPath: string;
    manifestDigest: string;
    ownership: ArtifactOwnershipBinding<'azure'> & {
        ownershipEpochRevision: number;
    };
    revision: ArtifactRevisionVector & {
        ownershipEpochRevision: number;
    };
    compositeDependencyDigest: string;
    completedAt: string;
}
interface PublishedAzureViewSetV3SurfaceReference {
    runId: string;
    manifestPath: string;
    manifestDigest: string;
    coverage: PublishedViewCoverage;
    ownership: EpochFreeAzureViewOwnership;
    revision: EpochFreeViewRevision;
    compositeDependencyDigest: string;
    completedAt: string;
}
/** Sole promoted authority for one evidence-enforced portal/plugin generation pair. */
export interface CompletedAzureViewSetV2 {
    schemaVersion: 2;
    status: 'completed';
    subscriptionId: string;
    publicationId: string;
    ownership: ArtifactOwnershipBinding<'azure'> & {
        ownershipEpochRevision: number;
    };
    revision: ArtifactRevisionVector & {
        ownershipEpochRevision: number;
    };
    portal: AzureViewSetV2SurfaceReference;
    plugin: AzureViewSetV2SurfaceReference;
    compositeDependencyDigest: string;
    publicationDecision: CompletedArtifactPublicationDecision;
    completedAt: string;
}
/** Promoted authority for one claim-projected portal/plugin generation pair. */
export interface PublishedAzureViewSetV3 {
    schemaVersion: 3;
    status: 'published';
    coverage: PublishedViewCoverage;
    subscriptionId: string;
    publicationId: string;
    ownership: EpochFreeAzureViewOwnership;
    revision: EpochFreeViewRevision;
    portal: PublishedAzureViewSetV3SurfaceReference;
    plugin: PublishedAzureViewSetV3SurfaceReference;
    compositeDependencyDigest: string;
    publicationDecision: CompletedArtifactPublicationDecision;
    completedAt: string;
}
export interface AzureRecommendationResourceEvidenceEntry {
    recommendationId: string;
    /** Full presentation evidence, retained even when no active aggregate entry exists. */
    recommendation: Recommendation;
    resources: AzureRecommendationResourceEvidenceResource[];
}
/** Evidence preserves unavailable amortized spend as absent instead of fabricating actual cost. */
export type AzureRecommendationResourceEvidenceResource = Omit<RecommendationResource, 'spendAmortized'> & {
    spendAmortized?: number;
};
export interface AzureRecommendationResourceEvidenceDocument {
    schemaVersion: 1;
    artifactGeneration: CompletedViewArtifactGeneration;
    recommendations: AzureRecommendationResourceEvidenceEntry[];
}
/** Dependency-free rejection boundary for customer-readable cross-surface pointers. */
export declare const isCompletedAzureViewSetV1: (value: unknown) => value is CompletedAzureViewSetV1;
/** Validates an evidence-aware completed portal or plugin generation manifest. */
export declare const isCompletedViewManifestV3: (value: unknown) => value is CompletedViewManifestV3;
/** Validates a claim-projected portal or plugin generation under the latest epoch-free authority contract. */
export declare const isPublishedViewManifestV4: (value: unknown) => value is PublishedViewManifestV4;
/** Validates the promoted pointer for an evidence-enforced portal/plugin view pair. */
export declare const isCompletedAzureViewSetV2: (value: unknown) => value is CompletedAzureViewSetV2;
/** Validates the promoted pointer for one claim-projected portal/plugin generation pair. */
export declare const isPublishedAzureViewSetV3: (value: unknown) => value is PublishedAzureViewSetV3;
export {};
//# sourceMappingURL=views.d.ts.map