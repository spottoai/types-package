import { ActivityLog, DailySummary, MonthSummary } from './common.js';
import { DisplayMetric, MetricPlot, MetricsDefinition } from './metrics.js';
import { CostSummaryDetails, type AzureRetailPricingEvidence } from './prices.js';
import type { BenefitCostBasis, BenefitType, IBenefitCoverageBreakdownEntry } from './benefits.js';
import {
  AzureRecommendationLite,
  Recommendation,
  RecommendationDecisionContext,
  type RecommendationResource,
  type ResourceScopedRecommendation,
} from './recommendations.js';
import { SpendDataSource, SubscriptionSummary, SubscriptionSummaryLite } from './subscriptions.js';
import type { ResourceOptimizationProfile, ResourceSimpleOptimizationProfile } from './resourceOptimization.js';
import { Tags } from '../tags/tags.js';
import type { AdvisorScoreSummary } from './advisorScore.js';
import type { AzurePortalArtifactGeneration, AzurePortalVersionedArtifact } from './portalArtifacts.js';
import type { AzurePortalHealthEventsSummary, AzureResourceHealthAvailabilityStatusSummary } from './resourceHealth.js';
import type { CostComposition, EstimateLens } from './costComposition.js';
import {
  allowedArtifactIdentityField,
  allowedArtifactReferenceField,
  allowedArtifactTraversalField,
  containsForbiddenArtifactControlData,
  type AllowedArtifactReferenceField,
} from '../common/artifactControlData.js';
import {
  isArtifactOwnershipBinding,
  isArtifactPublicationDecision,
  isEnforceableArtifactOwnershipBinding,
  type ArtifactOwnershipBinding,
  type ArtifactPublicationDecision,
  type ArtifactRevisionVector,
} from '../common/artifactEvidence.js';
import { isArtifactRevisionVector, isStrictLogicalArtifactReference } from '../common/artifactEvidenceValidation.js';
import type { ArtifactDescriptor } from '../common/artifactGeneration.js';
import type { PortfolioSavingsContributionV2, SavingsAggregateV2, SavingsLifecycleFreshnessV1 } from './savings.js';
import type { FinancialAuthorityResourceProjectionV1, FinancialAuthorityViewV1 } from './financialAuthorityView.js';
import type { CurrentSpendCompositionV1 } from './financialDataflow.js';
import type { FinancialSavingsAuthorityV1, FinancialSavingsResourceProjectionV1 } from './financialSavingsAuthority.js';
import type {
  FinancialSavingsResourceQuerySelectionV1,
  FinancialSavingsSurfaceProjectionV1,
} from './financialSavingsSurfaceProjection.js';
import { encodeArtifactRunReferenceV1, isRawArtifactRunIdV1 } from './artifactRunReference.js';

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
  /**
   * Producer-owned subscription current-spend compositions for the dashboard.
   * Consumers select an exact coordinate and never rebuild spend from summary,
   * budget, resource-row, or retail-price fields.
   */
  financialCurrentSpendCompositions?: CurrentSpendCompositionV1[];
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
  /** Compact generation-bound projection used by the UI Financial Domain. */
  financialSavingsProjection?: FinancialSavingsSurfaceProjectionV1;
  /** API-selected non-monetary allocation membership for a filtered resource result. */
  financialSavingsResourceQuerySelection?: FinancialSavingsResourceQuerySelectionV1;
  /** Bounded subscription current-spend compositions produced from the same conformed authority generation. */
  financialCurrentSpendCompositions?: CurrentSpendCompositionV1[];
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
  /**
   * Total amortized spend over the rolling 30-day window.
   * Absent when the artifact has no complete amortized-basis evidence; consumers
   * must not substitute billed spend. Use `composition.amortized` for the typed
   * availability reason when a cost composition is present.
   */
  spendAmortized?: number;
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
  /**
   * Non-monetary Financial Savings Authority membership for this resource.
   * This includes unavailable scenarios so filtered resource projections can
   * preserve partial coverage without inferring money at the transport layer.
   */
  financialSavingsRecommendationIds?: string[];
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
  /** Resource-scoped, non-additive projection from the canonical conformed Financial Authority. */
  financialAuthorityProjection?: FinancialAuthorityResourceProjectionV1;
  /** Resource-scoped, non-additive projection from the matching conformed savings authority. */
  financialSavingsProjection?: FinancialSavingsResourceProjectionV1;
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
  /** Percentage of the exact affected-current denominator, when produced. */
  minPercentage?: number;
  maxAmount: number;
  /** Percentage of the exact affected-current denominator, when produced. */
  maxPercentage?: number;
  /** Source-agnostic explanations for the displayed savings amount. */
  opportunities?: SavingsOpportunity[];
  /**
   * ISO 4217 currency for monetary amounts when not inherited from a containing subscription artifact.
   * Consumers must reject a conflict with an enclosing artifact currency.
   */
  currency?: string;
}

/** Monetary savings kept separate by one canonical ISO currency during cross-scope aggregation. */
export type CurrencySavingsValue = Omit<SavingsPotential, 'currency'> & { currency?: never };

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
  /** Resource-scoped, non-additive projection from the matching Portal savings authority. */
  financialSavingsProjection?: FinancialSavingsResourceProjectionV1;
  /** Mutable lifecycle freshness gate applied by the authorized API read. */
  savingsLifecycleFreshness?: SavingsLifecycleFreshnessV1;
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

export type VmPricePerformanceComparisonEligibility =
  | 'default'
  | 'excluded-tier'
  | 'excluded-burstable'
  | 'excluded-low-confidence'
  | 'unavailable-in-subscription'
  | 'feature-trade-off'
  | string;

export type VmPricePerformanceComparisonBasis = 'payg-retail' | 'spot-estimate' | 'reservation-coverage';

export type VmReservationCompatibility = 'full' | 'partial' | 'none' | 'unknown';

export type VmReservationCompatibilityReason =
  | 'same-flexibility-group-within-covered-units'
  | 'same-flexibility-group-exceeds-covered-units'
  | 'different-flexibility-group'
  | 'instance-flexibility-disabled'
  | 'missing-instance-flexibility-setting'
  | 'missing-flexibility-evidence'
  | string;

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

export type ComputeServiceKind =
  | 'virtual-machine'
  | 'virtual-machine-scale-set'
  | 'app-service-plan'
  | 'functions-flex-consumption'
  | 'functions-premium'
  | 'functions-consumption'
  | 'container-apps'
  | 'azure-kubernetes-service'
  | 'azure-batch'
  | 'azure-container-instances'
  | 'unknown'
  | string;

export type ComputeAlternativeCategory = 'same-platform' | 'cross-platform';

export type ComputeAlternativeFit = 'good' | 'possible' | 'tradeoff' | 'poor' | 'blocked';

export type ComputeAlternativeConfidence = 'high' | 'medium' | 'low' | 'unknown';

export type ComputeAlternativeCostBasis = 'observed' | 'retail' | 'scenario' | 'amortized' | 'estimated' | 'requiresTelemetry' | string;

export type ComputeAlternativeOsType = 'windows' | 'linux' | 'mixed' | 'unknown';

export type ComputeAlternativeScalingModel =
  | 'fixed'
  | 'manual'
  | 'autoscale'
  | 'event-driven'
  | 'scale-to-zero'
  | 'always-ready'
  | 'node-pool'
  | 'unknown'
  | string;

export type ComputeAlternativeMigrationEffort =
  | 'configuration'
  | 'redeploy'
  | 'runtime-migration'
  | 'containerization'
  | 'application-refactor'
  | 'architecture-redesign'
  | 'unknown';

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
    currentMonthly: number; // Sum of deduped currentMonthly across all cost savings ranges
    potentialMonthly: number; // currentMonthly - maxSavings
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
  key: string; // Normalised identifier (e.g. "rightsizing")
  label: string; // Human-readable label
  recommendationCount: number;
  resourceCount: number; // Unique resource IDs within the category
  currentMonthly: number;
  potentialMonthly: number;
  minSavings: number;
  maxSavings: number;
  sampleRecommendations: string[]; // Up to N IDs for drilldowns
  sampleResources: string[]; // Up to N IDs
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
  registeredRecommendations: Record<string, { resourceCount: number; maxMonthlySavings: number }>;
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

export type CompletedViewEconomicsDependency =
  | {
      generationId: string;
      fingerprint?: string;
      status?: never;
    }
  | {
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

export type CompletedViewManifestV2PartialFailure =
  | {
      failureKind: 'artifact';
      failedArtifactCount: number;
      failedArtifacts: [string, ...string[]];
      failedResourceCount: 0;
      failedResourceIds: [];
    }
  | {
      failureKind: 'resource';
      failedArtifactCount: 0;
      failedArtifacts: [];
      failedResourceCount: number;
      failedResourceIds: [string, ...string[]];
    }
  | {
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
export type CompletedViewManifestV2 = CompletedViewManifestV2Base &
  (
    | (CompletedViewManifestV2ProgressCounts & {
        status: 'in_progress';
        startedAt: string;
        completedAt?: never;
        failedArtifactCount: 0;
        failedResourceCount: 0;
        failedArtifacts?: never;
        failedResourceIds?: never;
      })
    | {
        status: 'completed';
        startedAt?: string;
        completedAt: string;
        completedArtifactCount?: never;
        completedResourceCount?: never;
        failedArtifactCount: 0;
        failedResourceCount: 0;
        failedArtifacts?: never;
        failedResourceIds?: never;
      }
    | (CompletedViewManifestV2ProgressCounts &
        CompletedViewManifestV2PartialFailure & {
          status: 'partial';
          startedAt?: string;
          completedAt: string;
        })
  );

interface CompletedViewArtifactDescriptor extends ArtifactDescriptor {
  path: string;
}

export type PublishedViewCoverage = 'complete' | 'partial';

export const PUBLISHED_VIEW_OBJECT_LIMITS_V1 = {
  maxArtifacts: 512,
  maxClaims: 128,
  maxDependencies: 256,
  maxIssues: 512,
  maxClaimBindings: 512,
  maxSectionPaths: 512,
} as const;

interface PublishedViewClaimBinding {
  claimId: string;
  sectionPaths: [string, ...string[]];
}

interface PublishedViewArtifactDescriptor extends CompletedViewArtifactDescriptor {
  claimBindings: [PublishedViewClaimBinding, ...PublishedViewClaimBinding[]];
}

type EpochFreeAzureViewOwnership = ArtifactOwnershipBinding<'azure'> & { ownershipEpochRevision?: never };
type EpochFreeViewRevision = ArtifactRevisionVector & { ownershipEpochRevision?: never };

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

type CompletedArtifactPublicationDecision = Extract<ArtifactPublicationDecision, { publication: 'completed' }>;

interface AzureViewSetV2SurfaceReference {
  runId: string;
  manifestPath: string;
  manifestDigest: string;
  ownership: ArtifactOwnershipBinding<'azure'> & { ownershipEpochRevision: number };
  revision: ArtifactRevisionVector & { ownershipEpochRevision: number };
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
  ownership: ArtifactOwnershipBinding<'azure'> & { ownershipEpochRevision: number };
  revision: ArtifactRevisionVector & { ownershipEpochRevision: number };
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

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const isCanonicalIsoTimestamp = (value: unknown): value is string => {
  if (!isNonEmptyString(value)) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const isLogicalManifestPath = (value: unknown): value is string => {
  if (!isNonEmptyString(value)) return false;
  if (value.startsWith('/') || value.includes('://') || value.includes('?') || value.includes('#') || value.includes('\\')) return false;
  const segments = value.split('/');
  return segments.length >= 2 && segments.every(segment => segment.length > 0 && segment !== '.' && segment !== '..');
};

const isViewSetSurfaceReference = (value: unknown): value is AzureViewSetSurfaceReference =>
  isRecord(value) && isNonEmptyString(value.runId) && isLogicalManifestPath(value.manifestPath) && isCanonicalIsoTimestamp(value.completedAt);

/** Dependency-free rejection boundary for customer-readable cross-surface pointers. */
export const isCompletedAzureViewSetV1 = (value: unknown): value is CompletedAzureViewSetV1 => {
  if (!isRecord(value)) return false;
  if (value.schemaVersion !== 1 || value.status !== 'completed') return false;
  if (!isNonEmptyString(value.subscriptionId) || !isNonEmptyString(value.publicationId) || !isCanonicalIsoTimestamp(value.completedAt)) {
    return false;
  }
  if (!isViewSetSurfaceReference(value.portal) || !isViewSetSurfaceReference(value.plugin)) return false;
  if (!isRecord(value.economics)) return false;
  return isNonEmptyString(value.economics.generationId) && isNonEmptyString(value.economics.fingerprint);
};

const VIEW_CONTENT_ENCODINGS = new Set<string>(['identity', 'gzip']);
const SHA256_PATTERN = /^[a-f0-9]{64}$/;

const hasControlCharacters = (value: string): boolean =>
  Array.from(value).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);

const isStrictNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() === value && value.length > 0 && !hasControlCharacters(value);

const isPositiveSafeInteger = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) > 0;
const isNonNegativeSafeInteger = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0;
const isSha256 = (value: unknown): value is string => typeof value === 'string' && SHA256_PATTERN.test(value);

const allowedViewArtifactPaths = (artifacts: unknown): AllowedArtifactReferenceField[] =>
  Array.isArray(artifacts) ? artifacts.flatMap(artifact => allowedArtifactReferenceField(artifact, 'path')) : [];

const containsForbiddenViewArtifactControlData = (value: unknown, allowedReferenceFields: AllowedArtifactReferenceField[] = []): boolean =>
  containsForbiddenArtifactControlData(value, allowedReferenceFields, {
    requireAllowedFieldTraversalContext: true,
  });

const allowedPublicationDecisionIdentityFields = (decision: unknown): AllowedArtifactReferenceField[] => {
  if (!isRecord(decision)) return [];
  const dependencies = Array.isArray(decision.dependencies) ? decision.dependencies : [];
  return [
    ...allowedArtifactTraversalField(decision, 'dependencies'),
    ...dependencies.flatMap(dependency => allowedArtifactIdentityField(dependency, 'generationId')),
  ];
};

const allowedPublishedCostSavingsIdentityFields = (manifest: unknown): AllowedArtifactReferenceField[] => {
  if (!isRecord(manifest) || !isRecord(manifest.costSavings)) return [];
  const costSavings = manifest.costSavings;
  const diagnostics = costSavings.stableWholeResourceDeletionBackfill;
  return [
    ...allowedArtifactTraversalField(manifest, 'costSavings'),
    ...allowedArtifactTraversalField(costSavings, 'stableWholeResourceDeletionBackfill'),
    ...(isRecord(diagnostics)
      ? [
          {
            object: diagnostics,
            key: 'missingStableSpendResourceSamples',
            allowUriSchemeInStringArray: true,
          } satisfies AllowedArtifactReferenceField,
        ]
      : []),
  ];
};

const isSafePathSegment = (value: unknown): value is string =>
  isStrictNonEmptyString(value) && !/[\\/?#%]/.test(value) && value !== '.' && value !== '..';

const isStrictCanonicalIsoTimestamp = (value: unknown): value is string => {
  if (!isStrictNonEmptyString(value)) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
};

const isEnforceableAzureOwnershipBinding = (value: unknown): value is ArtifactOwnershipBinding<'azure'> & { ownershipEpochRevision: number } =>
  isEnforceableArtifactOwnershipBinding(value) && value.provider === 'azure';

const hasMatchingViewOwnership = (subscriptionId: unknown, ownership: unknown, revision: unknown, enforceable: boolean): boolean => {
  if (!isSafePathSegment(subscriptionId) || !isArtifactRevisionVector(revision)) return false;
  if (!isArtifactOwnershipBinding(ownership)) return false;
  if (enforceable && !isEnforceableArtifactOwnershipBinding(ownership)) return false;
  if (ownership.provider !== 'azure' || ownership.accountId !== subscriptionId) return false;
  return ownership.ownershipEpochRevision === revision.ownershipEpochRevision;
};

const isEpochFreeAzureViewOwnership = (value: unknown): value is EpochFreeAzureViewOwnership =>
  isArtifactOwnershipBinding(value) && value.provider === 'azure' && !Object.prototype.hasOwnProperty.call(value, 'ownershipEpochRevision');

const isEpochFreeViewRevision = (value: unknown): value is EpochFreeViewRevision =>
  isArtifactRevisionVector(value) && !Object.prototype.hasOwnProperty.call(value, 'ownershipEpochRevision');

const hasEpochFreeMatchingViewOwnership = (subscriptionId: unknown, ownership: unknown, revision: unknown): boolean =>
  isEpochFreeAzureViewOwnership(ownership) &&
  isEpochFreeViewRevision(revision) &&
  hasMatchingViewOwnership(subscriptionId, ownership, revision, false);

const isViewArtifactDescriptor = (value: unknown, runId: string, runReference: string = runId): value is CompletedViewArtifactDescriptor =>
  isRecord(value) &&
  isStrictLogicalArtifactReference(value.path) &&
  value.path.startsWith(`runs/${runReference}/`) &&
  value.path.length > `runs/${runReference}/`.length &&
  isStrictNonEmptyString(value.name) &&
  value.mediaType === 'application/json' &&
  typeof value.contentEncoding === 'string' &&
  VIEW_CONTENT_ENCODINGS.has(value.contentEncoding) &&
  isNonNegativeSafeInteger(value.byteLength) &&
  isSha256(value.sha256);

const isPublishedViewCoverage = (value: unknown): value is PublishedViewCoverage => value === 'complete' || value === 'partial';

const isProjectedSectionPathForArtifact = (value: unknown, artifactPath: string): value is string => {
  if (!isStrictNonEmptyString(value)) return false;
  if (value === artifactPath) return true;
  if (!value.startsWith(`${artifactPath}#/`)) return false;
  const pointer = value.slice(artifactPath.length + 1);
  return !pointer.includes('\\') && !pointer.includes('?') && !/%(?:2f|2F|5c|5C)/.test(pointer);
};

const parseProjectedSectionPath = (value: string): { artifactPath: string; pointerSegments: string[] } | undefined => {
  const fragmentIndex = value.indexOf('#');
  const artifactPath = fragmentIndex < 0 ? value : value.slice(0, fragmentIndex);
  if (!isStrictLogicalArtifactReference(artifactPath) || !isProjectedSectionPathForArtifact(value, artifactPath)) return undefined;
  return {
    artifactPath,
    pointerSegments: fragmentIndex < 0 ? [] : value.slice(fragmentIndex + 2).split('/'),
  };
};

const doProjectedSectionsOverlap = (left: string, right: string): boolean => {
  const parsedLeft = parseProjectedSectionPath(left);
  const parsedRight = parseProjectedSectionPath(right);
  if (!parsedLeft || !parsedRight || parsedLeft.artifactPath !== parsedRight.artifactPath) return false;
  if (parsedLeft.pointerSegments.length === 0 || parsedRight.pointerSegments.length === 0) return true;
  const sharedLength = Math.min(parsedLeft.pointerSegments.length, parsedRight.pointerSegments.length);
  for (let index = 0; index < sharedLength; index += 1) {
    const leftSegment = parsedLeft.pointerSegments[index];
    const rightSegment = parsedRight.pointerSegments[index];
    if (leftSegment === rightSegment) continue;
    if (leftSegment === '*' || leftSegment === '**' || rightSegment === '*' || rightSegment === '**') return true;
    return false;
  }
  return true;
};

const hasUnambiguousPublishedClaimSections = (decision: ArtifactPublicationDecision): boolean => {
  const declaredSections: string[] = [];
  for (const claim of decision.claims) {
    if (new Set(claim.sectionPaths).size !== claim.sectionPaths.length) return false;
    for (const sectionPath of claim.sectionPaths) {
      if (!parseProjectedSectionPath(sectionPath)) return false;
      if (declaredSections.some(declaredSection => doProjectedSectionsOverlap(declaredSection, sectionPath))) return false;
      declaredSections.push(sectionPath);
    }
  }
  return true;
};

const isPublishedViewArtifactDescriptor = (value: unknown, runId: string): value is PublishedViewArtifactDescriptor => {
  const runReference = encodeArtifactRunReferenceV1(runId);
  if (!isViewArtifactDescriptor(value, runId, runReference) || !isRecord(value)) return false;
  const runPrefix = `runs/${runReference}/`;
  if (value.name !== value.path.slice(runPrefix.length)) return false;
  if (
    !Array.isArray(value.claimBindings) ||
    value.claimBindings.length === 0 ||
    value.claimBindings.length > PUBLISHED_VIEW_OBJECT_LIMITS_V1.maxClaimBindings
  ) {
    return false;
  }
  const claimIds = new Set<string>();
  for (const binding of value.claimBindings) {
    if (!isRecord(binding) || !isStrictNonEmptyString(binding.claimId) || claimIds.has(binding.claimId)) return false;
    claimIds.add(binding.claimId);
    if (
      !Array.isArray(binding.sectionPaths) ||
      binding.sectionPaths.length === 0 ||
      binding.sectionPaths.length > PUBLISHED_VIEW_OBJECT_LIMITS_V1.maxSectionPaths
    ) {
      return false;
    }
    if (new Set(binding.sectionPaths).size !== binding.sectionPaths.length) return false;
    if (!binding.sectionPaths.every(sectionPath => isProjectedSectionPathForArtifact(sectionPath, value.path))) return false;
  }
  return true;
};

const hasPublishedViewDecisionBounds = (decision: ArtifactPublicationDecision): boolean => {
  if (
    decision.claims.length === 0 ||
    decision.claims.length > PUBLISHED_VIEW_OBJECT_LIMITS_V1.maxClaims ||
    decision.dependencies.length > PUBLISHED_VIEW_OBJECT_LIMITS_V1.maxDependencies ||
    decision.issues.length > PUBLISHED_VIEW_OBJECT_LIMITS_V1.maxIssues
  ) {
    return false;
  }
  let sectionPathCount = 0;
  let issueCount = decision.issues.length;
  for (const claim of decision.claims) {
    sectionPathCount += claim.sectionPaths.length;
    issueCount += claim.issues.length;
    if (sectionPathCount > PUBLISHED_VIEW_OBJECT_LIMITS_V1.maxSectionPaths || issueCount > PUBLISHED_VIEW_OBJECT_LIMITS_V1.maxIssues) {
      return false;
    }
  }
  return true;
};

const hasPublishedViewArtifactBounds = (artifacts: readonly PublishedViewArtifactDescriptor[]): boolean => {
  let claimBindingCount = 0;
  let sectionPathCount = 0;
  for (const artifact of artifacts) {
    claimBindingCount += artifact.claimBindings.length;
    for (const binding of artifact.claimBindings) sectionPathCount += binding.sectionPaths.length;
    if (claimBindingCount > PUBLISHED_VIEW_OBJECT_LIMITS_V1.maxClaimBindings || sectionPathCount > PUBLISHED_VIEW_OBJECT_LIMITS_V1.maxSectionPaths) {
      return false;
    }
  }
  return true;
};

const hasRequiredViewDependencies = (decision: ArtifactPublicationDecision): boolean => {
  const dependencies = new Map(decision.dependencies.map(dependency => [dependency.name, dependency]));
  const billing = dependencies.get('billing');
  const economics = dependencies.get('economics');
  if (!billing || !economics) return false;

  for (const dependency of [billing, economics]) {
    if (dependency.publication === 'completed' && (!isStrictNonEmptyString(dependency.generationId) || !isSha256(dependency.digest))) {
      return false;
    }
  }

  const completedDependencies = new Set(
    decision.dependencies.filter(dependency => dependency.publication === 'completed').map(dependency => dependency.name)
  );
  return decision.claims.every(
    claim => claim.publication !== 'completed' || claim.requiredDependencies.every(dependency => completedDependencies.has(dependency))
  );
};

/** Validates an evidence-aware completed portal or plugin generation manifest. */
export const isCompletedViewManifestV3 = (value: unknown): value is CompletedViewManifestV3 => {
  if (
    !isRecord(value) ||
    containsForbiddenViewArtifactControlData(value, [
      ...allowedArtifactTraversalField(value, 'artifacts'),
      ...allowedViewArtifactPaths(value.artifacts),
    ])
  )
    return false;
  if (value.schemaVersion !== 3 || value.status !== 'completed') return false;
  if (!isSafePathSegment(value.runId) || !hasMatchingViewOwnership(value.subscriptionId, value.ownership, value.revision, false)) return false;
  if (
    !isRecord(value.artifactGeneration) ||
    value.artifactGeneration.runId !== value.runId ||
    !isStrictCanonicalIsoTimestamp(value.artifactGeneration.generatedAt)
  ) {
    return false;
  }
  if (!Array.isArray(value.artifacts) || value.artifacts.length === 0) return false;
  if (!value.artifacts.every(artifact => isViewArtifactDescriptor(artifact, value.runId as string))) return false;
  if (
    new Set(value.artifacts.map(artifact => artifact.path)).size !== value.artifacts.length ||
    new Set(value.artifacts.map(artifact => artifact.name)).size !== value.artifacts.length
  ) {
    return false;
  }
  if (
    !isPositiveSafeInteger(value.requestedArtifactCount) ||
    value.requestedArtifactCount !== value.artifacts.length ||
    !isNonNegativeSafeInteger(value.requestedResourceCount) ||
    value.failedArtifactCount !== 0 ||
    value.failedResourceCount !== 0 ||
    !isSha256(value.compositeDependencyDigest) ||
    !isStrictCanonicalIsoTimestamp(value.completedAt)
  ) {
    return false;
  }
  return isArtifactPublicationDecision(value.publicationDecision) && hasRequiredViewDependencies(value.publicationDecision);
};

const hasExactPublishedClaimProjection = (artifacts: readonly PublishedViewArtifactDescriptor[], decision: ArtifactPublicationDecision): boolean => {
  if (!hasUnambiguousPublishedClaimSections(decision)) return false;
  const claimById = new Map(decision.claims.map(claim => [claim.claimId, claim]));
  const completedClaims = decision.claims.filter(claim => claim.publication === 'completed');
  if (completedClaims.length === 0) return false;

  const expectedBindings = new Set<string>();
  for (const claim of completedClaims) {
    if (claim.sectionPaths.length === 0 || new Set(claim.sectionPaths).size !== claim.sectionPaths.length) return false;
    for (const sectionPath of claim.sectionPaths) expectedBindings.add(`${claim.claimId}\0${sectionPath}`);
  }

  const actualBindings = new Set<string>();
  for (const artifact of artifacts) {
    for (const binding of artifact.claimBindings) {
      const claim = claimById.get(binding.claimId);
      if (!claim || claim.publication !== 'completed') return false;
      for (const sectionPath of binding.sectionPaths) {
        if (!claim.sectionPaths.includes(sectionPath)) return false;
        const key = `${binding.claimId}\0${sectionPath}`;
        if (actualBindings.has(key)) return false;
        actualBindings.add(key);
      }
    }
  }

  return expectedBindings.size === actualBindings.size && Array.from(expectedBindings).every(binding => actualBindings.has(binding));
};

const isPublishedDecisionForCoverage = (decision: ArtifactPublicationDecision, coverage: PublishedViewCoverage): boolean => {
  if (!hasRequiredViewDependencies(decision) || decision.processing !== 'succeeded') return false;
  const completedClaimCount = decision.claims.filter(claim => claim.publication === 'completed').length;
  if (coverage === 'complete') {
    return decision.publication === 'completed' && decision.evidence === 'complete' && completedClaimCount === decision.claims.length;
  }
  return (
    decision.publication === 'partial' && decision.evidence === 'partial' && completedClaimCount > 0 && completedClaimCount < decision.claims.length
  );
};

/** Validates a claim-projected portal or plugin generation under the latest epoch-free authority contract. */
export const isPublishedViewManifestV4 = (value: unknown): value is PublishedViewManifestV4 => {
  const allowedReferences = isRecord(value)
    ? [
        ...allowedArtifactIdentityField(value, 'runId'),
        ...allowedArtifactTraversalField(value, 'artifactGeneration'),
        ...allowedArtifactIdentityField(value.artifactGeneration, 'runId'),
        ...allowedArtifactTraversalField(value, 'artifacts'),
        ...allowedViewArtifactPaths(value.artifacts),
        ...allowedArtifactTraversalField(value, 'publicationDecision'),
        ...allowedPublicationDecisionIdentityFields(value.publicationDecision),
        ...allowedPublishedCostSavingsIdentityFields(value),
      ]
    : [];
  if (!isRecord(value) || containsForbiddenViewArtifactControlData(value, allowedReferences)) {
    return false;
  }
  if (value.schemaVersion !== 4 || value.status !== 'published' || !isPublishedViewCoverage(value.coverage)) return false;
  if (!isRawArtifactRunIdV1(value.runId) || !hasEpochFreeMatchingViewOwnership(value.subscriptionId, value.ownership, value.revision)) return false;
  if (
    !isRecord(value.artifactGeneration) ||
    value.artifactGeneration.runId !== value.runId ||
    !isStrictCanonicalIsoTimestamp(value.artifactGeneration.generatedAt)
  ) {
    return false;
  }
  if (!Array.isArray(value.artifacts) || value.artifacts.length === 0 || value.artifacts.length > PUBLISHED_VIEW_OBJECT_LIMITS_V1.maxArtifacts) {
    return false;
  }
  if (!value.artifacts.every(artifact => isPublishedViewArtifactDescriptor(artifact, value.runId as string))) return false;
  if (!hasPublishedViewArtifactBounds(value.artifacts)) return false;
  if (
    new Set(value.artifacts.map(artifact => artifact.path)).size !== value.artifacts.length ||
    new Set(value.artifacts.map(artifact => artifact.name)).size !== value.artifacts.length
  ) {
    return false;
  }
  if (
    !isPositiveSafeInteger(value.requestedArtifactCount) ||
    value.requestedArtifactCount !== value.artifacts.length ||
    !isNonNegativeSafeInteger(value.requestedResourceCount) ||
    value.failedArtifactCount !== 0 ||
    value.failedResourceCount !== 0 ||
    !isSha256(value.compositeDependencyDigest) ||
    !isStrictCanonicalIsoTimestamp(value.completedAt) ||
    !isArtifactPublicationDecision(value.publicationDecision) ||
    !hasPublishedViewDecisionBounds(value.publicationDecision)
  ) {
    return false;
  }
  return (
    isPublishedDecisionForCoverage(value.publicationDecision, value.coverage) &&
    hasExactPublishedClaimProjection(value.artifacts, value.publicationDecision)
  );
};

const hasSameOwnership = (left: ArtifactOwnershipBinding<'azure'>, right: ArtifactOwnershipBinding<'azure'>): boolean =>
  left.provider === right.provider &&
  left.tenantId === right.tenantId &&
  left.companyId === right.companyId &&
  left.cloudAccountId === right.cloudAccountId &&
  left.accountId === right.accountId &&
  left.ownershipEpochRevision === right.ownershipEpochRevision;

const hasSameRevision = (left: ArtifactRevisionVector, right: ArtifactRevisionVector): boolean =>
  left.ownershipEpochRevision === right.ownershipEpochRevision &&
  left.sourceRevision === right.sourceRevision &&
  left.policyRevision === right.policyRevision;

const isViewSetV2SurfaceReference = (
  value: unknown,
  surface: 'portal' | 'plugin',
  subscriptionId: string,
  ownership: ArtifactOwnershipBinding<'azure'>,
  revision: ArtifactRevisionVector,
  compositeDependencyDigest: string
): value is AzureViewSetV2SurfaceReference => {
  if (!isRecord(value) || !isSafePathSegment(value.runId)) return false;
  const expectedManifestName = surface === 'portal' ? 'completed-view-manifest.json' : 'completed-plugin-generation.json';
  if (value.manifestPath !== `runs/${value.runId}/${expectedManifestName}` || !isStrictLogicalArtifactReference(value.manifestPath)) return false;
  if (!isEnforceableAzureOwnershipBinding(value.ownership) || !isArtifactRevisionVector(value.revision)) return false;
  if (!hasMatchingViewOwnership(subscriptionId, value.ownership, value.revision, true)) return false;
  if (!hasSameOwnership(ownership, value.ownership) || !hasSameRevision(revision, value.revision)) return false;
  return (
    isSha256(value.manifestDigest) &&
    value.compositeDependencyDigest === compositeDependencyDigest &&
    isStrictCanonicalIsoTimestamp(value.completedAt)
  );
};

const isPublishedViewSetV3SurfaceReference = (
  value: unknown,
  surface: 'portal' | 'plugin',
  subscriptionId: string,
  ownership: ArtifactOwnershipBinding<'azure'>,
  revision: ArtifactRevisionVector,
  compositeDependencyDigest: string
): value is PublishedAzureViewSetV3SurfaceReference => {
  if (!isRecord(value) || !isRawArtifactRunIdV1(value.runId) || !isPublishedViewCoverage(value.coverage)) return false;
  const expectedManifestName = surface === 'portal' ? 'published-view-manifest.json' : 'published-plugin-generation.json';
  const runReference = encodeArtifactRunReferenceV1(value.runId);
  if (value.manifestPath !== `runs/${runReference}/${expectedManifestName}` || !isStrictLogicalArtifactReference(value.manifestPath)) return false;
  if (
    !isEpochFreeAzureViewOwnership(value.ownership) ||
    !isEpochFreeViewRevision(value.revision) ||
    !hasEpochFreeMatchingViewOwnership(subscriptionId, value.ownership, value.revision)
  ) {
    return false;
  }
  if (!hasSameOwnership(ownership, value.ownership) || !hasSameRevision(revision, value.revision)) return false;
  return (
    isSha256(value.manifestDigest) &&
    value.compositeDependencyDigest === compositeDependencyDigest &&
    isStrictCanonicalIsoTimestamp(value.completedAt)
  );
};

const hasMatchingSurfaceDependency = (
  decision: ArtifactPublicationDecision,
  name: 'portal' | 'plugin',
  surface: Pick<AzureViewSetV2SurfaceReference, 'runId' | 'manifestDigest'>
): boolean => {
  const dependency = decision.dependencies.find(candidate => candidate.name === name);
  return (
    dependency !== undefined &&
    dependency.required &&
    dependency.publication === 'completed' &&
    dependency.generationId === surface.runId &&
    dependency.digest === surface.manifestDigest
  );
};

/** Validates the promoted pointer for an evidence-enforced portal/plugin view pair. */
export const isCompletedAzureViewSetV2 = (value: unknown): value is CompletedAzureViewSetV2 => {
  const allowedReferences = isRecord(value)
    ? [
        ...allowedArtifactTraversalField(value, 'portal'),
        ...allowedArtifactTraversalField(value, 'plugin'),
        ...allowedArtifactReferenceField(value.portal, 'manifestPath'),
        ...allowedArtifactReferenceField(value.plugin, 'manifestPath'),
      ]
    : [];
  if (!isRecord(value) || containsForbiddenViewArtifactControlData(value, allowedReferences)) return false;
  if (value.schemaVersion !== 2 || value.status !== 'completed') return false;
  if (
    !isSafePathSegment(value.subscriptionId) ||
    !isStrictNonEmptyString(value.publicationId) ||
    !isEnforceableAzureOwnershipBinding(value.ownership) ||
    !isArtifactRevisionVector(value.revision) ||
    !hasMatchingViewOwnership(value.subscriptionId, value.ownership, value.revision, true)
  ) {
    return false;
  }
  if (!isSha256(value.compositeDependencyDigest) || !isStrictCanonicalIsoTimestamp(value.completedAt)) return false;
  if (
    !isViewSetV2SurfaceReference(value.portal, 'portal', value.subscriptionId, value.ownership, value.revision, value.compositeDependencyDigest) ||
    !isViewSetV2SurfaceReference(value.plugin, 'plugin', value.subscriptionId, value.ownership, value.revision, value.compositeDependencyDigest)
  ) {
    return false;
  }
  const laterSurfaceCompletedAt =
    Date.parse(value.portal.completedAt) >= Date.parse(value.plugin.completedAt) ? value.portal.completedAt : value.plugin.completedAt;
  if (value.completedAt !== laterSurfaceCompletedAt) return false;
  return (
    isArtifactPublicationDecision(value.publicationDecision) &&
    value.publicationDecision.publication === 'completed' &&
    hasMatchingSurfaceDependency(value.publicationDecision, 'portal', value.portal) &&
    hasMatchingSurfaceDependency(value.publicationDecision, 'plugin', value.plugin)
  );
};

/** Validates the promoted pointer for one claim-projected portal/plugin generation pair. */
export const isPublishedAzureViewSetV3 = (value: unknown): value is PublishedAzureViewSetV3 => {
  const allowedReferences = isRecord(value)
    ? [
        ...allowedArtifactIdentityField(value, 'publicationId'),
        ...allowedArtifactTraversalField(value, 'portal'),
        ...allowedArtifactTraversalField(value, 'plugin'),
        ...allowedArtifactIdentityField(value.portal, 'runId'),
        ...allowedArtifactIdentityField(value.plugin, 'runId'),
        ...allowedArtifactReferenceField(value.portal, 'manifestPath'),
        ...allowedArtifactReferenceField(value.plugin, 'manifestPath'),
        ...allowedArtifactTraversalField(value, 'publicationDecision'),
        ...allowedPublicationDecisionIdentityFields(value.publicationDecision),
      ]
    : [];
  if (!isRecord(value) || containsForbiddenViewArtifactControlData(value, allowedReferences)) return false;
  if (value.schemaVersion !== 3 || value.status !== 'published' || !isPublishedViewCoverage(value.coverage)) return false;
  if (
    !isSafePathSegment(value.subscriptionId) ||
    !isStrictNonEmptyString(value.publicationId) ||
    !isEpochFreeAzureViewOwnership(value.ownership) ||
    !isEpochFreeViewRevision(value.revision) ||
    !hasEpochFreeMatchingViewOwnership(value.subscriptionId, value.ownership, value.revision)
  ) {
    return false;
  }
  if (!isSha256(value.compositeDependencyDigest) || !isStrictCanonicalIsoTimestamp(value.completedAt)) return false;
  if (
    !isPublishedViewSetV3SurfaceReference(
      value.portal,
      'portal',
      value.subscriptionId,
      value.ownership,
      value.revision,
      value.compositeDependencyDigest
    ) ||
    !isPublishedViewSetV3SurfaceReference(
      value.plugin,
      'plugin',
      value.subscriptionId,
      value.ownership,
      value.revision,
      value.compositeDependencyDigest
    )
  ) {
    return false;
  }
  const expectedCoverage = value.portal.coverage === 'complete' && value.plugin.coverage === 'complete' ? 'complete' : 'partial';
  if (value.coverage !== expectedCoverage) return false;
  const laterSurfaceCompletedAt =
    Date.parse(value.portal.completedAt) >= Date.parse(value.plugin.completedAt) ? value.portal.completedAt : value.plugin.completedAt;
  if (value.completedAt !== laterSurfaceCompletedAt) return false;
  return (
    isArtifactPublicationDecision(value.publicationDecision) &&
    hasPublishedViewDecisionBounds(value.publicationDecision) &&
    value.publicationDecision.publication === 'completed' &&
    value.publicationDecision.evidence === value.coverage &&
    hasMatchingSurfaceDependency(value.publicationDecision, 'portal', value.portal) &&
    hasMatchingSurfaceDependency(value.publicationDecision, 'plugin', value.plugin)
  );
};
