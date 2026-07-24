import { ActivityLog, DailySummary, MonthSummary } from './common.js';
import { DisplayMetric, MetricPlot, MetricsDefinition } from './metrics.js';
import { CostSummaryDetails } from './prices.js';
import type { BenefitCostBasis, IBenefitCoverageBreakdownEntry } from './benefits.js';
import { AzureRecommendationLite, Recommendation, RecommendationDecisionContext } from './recommendations.js';
import { SpendDataSource, SubscriptionSummary, SubscriptionSummaryLite } from './subscriptions.js';
import { ResourceCostEstimationSummary, ResourceSimpleCostEstimationSummary } from './costEstimation';
import { Tags } from '../tags/tags.js';
import type { AdvisorScoreSummary } from './advisorScore.js';
import type { AzurePortalArtifactGeneration, AzurePortalVersionedArtifact } from './portalArtifacts.js';
import type { AzurePortalHealthEventsSummary, AzureResourceHealthAvailabilityStatusSummary } from './resourceHealth.js';
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
    costEstimation?: ResourceSimpleCostEstimationSummary;
    /** VM-specific same-region price/performance lookup data. */
    vmPricePerformance?: VmPricePerformanceInsights;
    /** Current Azure Resource Health availability status for this resource, when available. */
    resourceHealth?: AzureResourceHealthAvailabilityStatusSummary;
}
export interface SavingsPotential {
    minAmount: number;
    minPercentage: number;
    maxAmount: number;
    maxPercentage: number;
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
    metrics?: DisplayMetric[];
    activityLogs?: ActivityLog[];
    benefitsCoverage?: BenefitCoverageSummary;
    costEstimation?: ResourceCostEstimationSummary;
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
    recommendations?: Recommendation[];
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
    costEstimation?: ResourceCostEstimationSummary;
    /** VM-specific same-region price/performance lookup data. */
    vmPricePerformance?: VmPricePerformanceInsights;
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
    localMonthlyPrice?: number;
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
export interface CompletedViewManifestV2Base extends CompletedViewManifestV2RequestedCounts {
    schemaVersion: 2;
    runId: string;
    subscriptionId: string;
    /** Requested artifact paths for this generation. */
    artifacts: string[];
    artifactGeneration: CompletedViewArtifactGeneration;
    costSavings?: CompletedViewCostSavingsManifest;
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
export type AnyCompletedViewManifest = CompletedViewManifest | CompletedViewManifestV2;
//# sourceMappingURL=views.d.ts.map