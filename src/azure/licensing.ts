import type { SubscriptionSummaryLite } from './subscriptions';
import type { SavingsPotential } from './views';

export type LicensingPlanningVersion = '1.0';

export type LicensingProductFamily = 'windows-server' | 'sql-server' | 'unknown';

export type LicensingServiceModel =
  | 'virtual-machine'
  | 'virtual-machine-scale-set'
  | 'sql-virtual-machine'
  | 'sql-database'
  | 'sql-elastic-pool'
  | 'sql-managed-instance'
  | 'unknown';

export type LicensingConfigurationStatus = 'enabled' | 'disabled' | 'not-applicable' | 'unknown';

export type LicensingTechnicalEligibilityStatus = 'eligible' | 'conditionally-eligible' | 'ineligible' | 'unknown';

export type LicensingCoverageStatus = 'covered' | 'partially-covered' | 'uncovered' | 'unknown';

export type LicensingEntitlementStatus = 'customer-confirmed' | 'unknown';

export type LicensingSavingsBasis = 'observed-billing' | 'azure-retail' | 'public-guide' | 'unavailable';

export type LicensingConfidence = 'high' | 'medium' | 'low' | 'unknown';

export type LicensingEstimateOutcome = 'saving' | 'payg-may-be-cheaper' | 'unavailable';

export type LicensingFreshnessStatus = 'current' | 'stale' | 'partial' | 'unavailable';

export type LicensingReasonCode =
  | 'hybrid-benefit-enabled'
  | 'hybrid-benefit-disabled'
  | 'eligible-opportunity'
  | 'centrally-managed-coverage'
  | 'partial-billing-coverage'
  | 'insufficient-billing-evidence'
  | 'unsupported-service-model'
  | 'unsupported-purchasing-model'
  | 'unsupported-edition'
  | 'missing-resource-shape'
  | 'missing-retail-price'
  | 'ambiguous-retail-price'
  | 'missing-public-price'
  | 'stale-public-price'
  | 'missing-fx-rate'
  | 'stale-fx-rate'
  | 'entitlement-not-confirmed'
  | 'unknown';

export interface LicensingMoneyAmount {
  amount: number;
  currency: string;
}

export interface LicensingObservationWindow {
  start: string;
  end: string;
  stableDays?: number;
}

export interface LicensingEstimateSource {
  id: string;
  type: 'billing' | 'azure-retail' | 'public-guide' | 'fx' | 'rule' | 'unknown';
  name?: string;
  url?: string;
  asOf?: string;
  snapshotId?: string;
}

export interface LicensingEstimate {
  monthly?: LicensingMoneyAmount;
  annual?: LicensingMoneyAmount;
  basis: LicensingSavingsBasis;
  confidence: LicensingConfidence;
  indicative: boolean;
  observationWindow?: LicensingObservationWindow;
  sourceIds?: string[];
  assumptions?: string[];
}

export interface LicensingResourceEconomics {
  azureSoftwareCharge?: LicensingEstimate;
  grossAzureSaving?: LicensingEstimate;
  indicativeAcquisitionCost?: LicensingEstimate;
  indicativeNetBenefit?: LicensingEstimate;
  annualInvestment?: LicensingEstimate;
  outcome: LicensingEstimateOutcome;
  breakEvenMonths?: number;
  recommendationSavings?: SavingsPotential;
  unavailableReason?: LicensingReasonCode;
}

export interface LicensingResourceEvidence {
  basis: LicensingSavingsBasis;
  confidence: LicensingConfidence;
  observationWindow?: LicensingObservationWindow;
  matchedMeterIds?: string[];
  sourceIds?: string[];
  notes?: string[];
}

export interface LicensingCommitmentContext {
  recommendationIds?: string[];
  commitmentIds?: string[];
  coveragePercent?: number;
  summary?: string;
}

export interface LicensingResourceItem {
  resourceId: string;
  resourceName: string;
  resourceType: string;
  subscriptionId: string;
  subscriptionName?: string;
  resourceGroup?: string;
  location?: string;
  serviceModel: LicensingServiceModel;
  productFamily: LicensingProductFamily;
  edition?: string;
  skuName?: string;
  pricingTier?: string;
  vCpuCount?: number;
  vCoreCount?: number;
  licensableCoreCount?: number;
  normalizedCoreCount?: number;
  packSize?: number;
  requiredPackCount?: number;
  configurationStatus: LicensingConfigurationStatus;
  technicalEligibilityStatus: LicensingTechnicalEligibilityStatus;
  coverageStatus: LicensingCoverageStatus;
  entitlementStatus: LicensingEntitlementStatus;
  reasonCodes: LicensingReasonCode[];
  explanations?: string[];
  evidence?: LicensingResourceEvidence;
  economics?: LicensingResourceEconomics;
  recommendationIds?: string[];
  commitmentContext?: LicensingCommitmentContext;
}

export interface LicensingStatusCount<TStatus extends string> {
  status: TStatus;
  count: number;
}

export interface LicensingCurrencySummary {
  currency: string;
  azureSoftwareChargeMonthly?: number;
  grossAzureSavingMonthly?: number;
  indicativeAcquisitionCostMonthly?: number;
  indicativeNetBenefitMonthly?: number;
  annualInvestment?: number;
}

export interface LicensingSummary {
  resourceCount: number;
  appliedCount: number;
  opportunityCount: number;
  needsReviewCount: number;
  ineligibleCount: number;
  configuration: Array<LicensingStatusCount<LicensingConfigurationStatus>>;
  technicalEligibility: Array<LicensingStatusCount<LicensingTechnicalEligibilityStatus>>;
  coverage: Array<LicensingStatusCount<LicensingCoverageStatus>>;
  entitlement: Array<LicensingStatusCount<LicensingEntitlementStatus>>;
  byProductFamily?: Array<{ productFamily: LicensingProductFamily; count: number }>;
  byServiceModel?: Array<{ serviceModel: LicensingServiceModel; count: number }>;
  currencies: LicensingCurrencySummary[];
}

export interface LicensingPricingSnapshot {
  id: string;
  sourceName: string;
  sourceUrl?: string;
  baseCurrency: string;
  asOf: string;
  retrievedAt?: string;
  reviewAfter?: string;
  indicative: boolean;
}

export interface LicensingPricingContext {
  displayCurrency?: string;
  publicPriceSnapshot?: LicensingPricingSnapshot;
  fxSnapshot?: LicensingPricingSnapshot;
  azureRetailAsOf?: string;
  sources: LicensingEstimateSource[];
  assumptions?: string[];
  disclaimer: string;
}

export interface LicensingFreshnessInput {
  status: LicensingFreshnessStatus;
  asOf?: string;
  ageDays?: number;
  warning?: string;
}

export interface LicensingFreshness {
  status: LicensingFreshnessStatus;
  resources: LicensingFreshnessInput;
  billing: LicensingFreshnessInput;
  azureRetail: LicensingFreshnessInput;
  publicPricing: LicensingFreshnessInput;
  fx: LicensingFreshnessInput;
}

export interface LicensingDiagnostics {
  candidateCount?: number;
  analysedCount?: number;
  estimateCount?: number;
  unavailableEstimateCount?: number;
  reasonCounts?: Partial<Record<LicensingReasonCode, number>>;
  boundedSampleResourceIds?: string[];
  durationMs?: number;
}

export interface LicensingPlanningView {
  version: LicensingPlanningVersion;
  generatedAt: string;
  sourceRunId?: string;
  subscription?: SubscriptionSummaryLite;
  summary: LicensingSummary;
  resources: LicensingResourceItem[];
  pricingContext: LicensingPricingContext;
  freshness: LicensingFreshness;
  warnings?: string[];
  diagnostics?: LicensingDiagnostics;
}

export interface LicensingRecommendationRenderData {
  kind: 'licensing-estimate';
  productFamily: LicensingProductFamily;
  serviceModel?: LicensingServiceModel;
  resourceIds: string[];
  requiredCoreCount?: number;
  requiredPackCount?: number;
  grossAzureSavingMonthly?: LicensingMoneyAmount;
  indicativeAcquisitionCostMonthly?: LicensingMoneyAmount;
  indicativeNetBenefitMonthly?: LicensingMoneyAmount;
  outcome: LicensingEstimateOutcome;
  confidence: LicensingConfidence;
  basis: LicensingSavingsBasis;
  priceSnapshotId?: string;
  fxSnapshotId?: string;
  sourceIds?: string[];
  assumptions?: string[];
  reasonCodes?: LicensingReasonCode[];
  licensingResourceIds?: string[];
}
