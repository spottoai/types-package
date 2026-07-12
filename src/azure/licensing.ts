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

export type LicensingEvidenceBasis = 'observed-billing' | 'azure-retail' | 'public-guide' | 'unavailable';

export type LicensingConfidence = 'high' | 'medium' | 'low' | 'unknown';

export type LicensingEstimateOutcome = 'indicative-saving' | 'payg-may-be-cheaper' | 'unavailable';

export type LicensingFreshnessStatus = 'current' | 'stale' | 'partial' | 'unavailable';

export type LicensingDecisionStatus =
  | 'strong-candidate'
  | 'worth-getting-quote'
  | 'marginal-review-runtime'
  | 'payg-likely-preferable'
  | 'existing-rights-may-be-available'
  | 'eligibility-or-pricing-unresolved'
  | 'not-currently-eligible'
  | 'modernization-required-first'
  | 'benefit-already-enabled';

export type LicensingOfferQualifyingRightsStatus = 'approved' | 'unverified' | 'not-qualifying';

export type LicensingAcquisitionModel = 'annual-subscription';

export type LicensingBillingCadence = 'upfront' | 'monthly' | 'annual' | 'unknown';

export type LicensingCancellationTerms = 'non-cancellable' | 'cancellable' | 'unknown';

export type LicensingPriceUnit = 'core-pack-term';

export type LicensingScenarioType = 'advertised-public-price';

export type LicensingRequirementBasis = 'per-resource-minimum' | 'per-instance-minimum' | 'normalized-core-ratio';

export type LicensingHistoricalMonthStatus = 'observed' | 'partial' | 'zero' | 'unavailable' | 'conflicting';

export type LicensingPersistenceStatus = 'new' | 'intermittent' | 'persistent' | 'declining' | 'unknown';

export type LicensingImplementationEffort = 'low' | 'medium' | 'high' | 'unknown';

export type LicensingBooleanOrUnknown = boolean | 'unknown';

export type LicensingActionRole =
  | 'procurement'
  | 'licensing-administrator'
  | 'software-asset-manager'
  | 'billing-administrator'
  | 'azure-resource-owner'
  | 'database-owner'
  | 'finops-owner';

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
  | 'unverified-qualifying-rights'
  | 'not-qualifying-offer'
  | 'stale-public-price'
  | 'missing-fx-rate'
  | 'stale-fx-rate'
  | 'entitlement-not-confirmed'
  | 'insufficient-history'
  | 'partial-historical-coverage'
  | 'conflicting-historical-evidence'
  | 'migration-required'
  | 'system-database'
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

export interface LicensingAssumption {
  code: string;
  label: string;
  value?: string;
  explanation: string;
}

export interface LicensingDecision {
  status: LicensingDecisionStatus;
  headline: string;
  explanation: string;
  confidence: LicensingConfidence;
  attentionReasons: string[];
}

export interface LicensingResourceEvidence {
  basis: LicensingEvidenceBasis;
  confidence: LicensingConfidence;
  observationWindow?: LicensingObservationWindow;
  matchedMeterIds?: string[];
  sourceIds?: string[];
  notes?: string[];
}

export interface LicensingAzureLicenseCharge {
  monthly: LicensingMoneyAmount;
  annualized: LicensingMoneyAmount;
  basis: Exclude<LicensingEvidenceBasis, 'public-guide' | 'unavailable'>;
  confidence: LicensingConfidence;
  indicative: boolean;
  observationWindow?: LicensingObservationWindow;
  sourceIds: string[];
  assumptionCodes?: string[];
}

export interface LicensingLicenseRequirement {
  basis: LicensingRequirementBasis;
  resourceCoreCount?: number;
  instanceCount?: number;
  minimumLicensableCores: number;
  requiredLicenseCores: number;
  normalizedCoreCount?: number;
  normalizedCoreRatio?: number;
  packSizeCores: number;
  requiredPackCount: number;
}

export interface LicensingAdvertisedOffer {
  productKey: string;
  productName: string;
  offerId?: string;
  productFamily: Exclude<LicensingProductFamily, 'unknown'>;
  productVersion?: string;
  edition: string;
  acquisitionModel: LicensingAcquisitionModel;
  qualifyingRightsStatus: LicensingOfferQualifyingRightsStatus;
  advertisedUnitPrice: LicensingMoneyAmount;
  priceUnit: LicensingPriceUnit;
  packSizeCores: number;
  commitmentTermMonths: number;
  billingCadence: LicensingBillingCadence;
  cancellationTerms: LicensingCancellationTerms;
  taxTreatment: string;
  sourceId: string;
  asOf: string;
  reviewAfter?: string;
  expiresAt?: string;
}

export interface LicensingCurrencyConversion {
  sourceCurrency: string;
  displayCurrency: string;
  rate: string;
  asOf: string;
  sourceId: string;
  sourceUnitPrice: LicensingMoneyAmount;
  convertedUnitPrice: LicensingMoneyAmount;
}

export interface LicensingRuntimeScenario {
  expectedRuntimeMonths: number;
  licenseTermsRequired: number;
  committedLicenseCost: LicensingMoneyAmount;
  azureLicenseChargeAvoided: LicensingMoneyAmount;
  netBenefit: LicensingMoneyAmount;
  roiPercent?: number;
}

export interface LicensingPurchaseScenarioEconomics {
  fullTermInvestment: LicensingMoneyAmount;
  monthlyEquivalent: LicensingMoneyAmount;
  grossAvoidedOverTerm: LicensingMoneyAmount;
  netBenefitOverTerm: LicensingMoneyAmount;
  netBenefitMonthlyEquivalent: LicensingMoneyAmount;
  paybackMonths: number;
  roiOverTermPercent: number;
  breakEvenUtilizationPercent: number;
  maximumUsageReductionBeforeLossPercent: number;
  runtimeScenarios: LicensingRuntimeScenario[];
}

export interface LicensingPurchaseScenarioCalculation {
  version: '1.0';
  fullTermInvestmentBasis: 'converted-unit-price-times-required-packs';
  runtimeLicenseCostBasis: 'whole-committed-terms-required';
  paybackBasis: 'full-term-investment-divided-by-monthly-avoidable-charge';
  moneyDecimalPlaces: number;
  ratioDecimalPlaces: number;
}

export interface LicensingPurchaseScenario {
  scenarioType: LicensingScenarioType;
  offer: LicensingAdvertisedOffer;
  conversion?: LicensingCurrencyConversion;
  calculation: LicensingPurchaseScenarioCalculation;
  economics: LicensingPurchaseScenarioEconomics;
  confidence: LicensingConfidence;
  sourceIds: string[];
  assumptionCodes: string[];
}

export interface LicensingResourceEconomics {
  azureLicenseCharge?: LicensingAzureLicenseCharge;
  purchaseScenario?: LicensingPurchaseScenario;
  outcome: LicensingEstimateOutcome;
  recommendationSavings?: SavingsPotential;
  unavailableReason?: LicensingReasonCode;
}

export interface LicensingHistoricalWindow {
  startDate: string;
  endDate: string;
  stableCutoffDate: string;
  lookbackMonths: number;
  basis: 'stable-actual-billing';
}

export interface LicensingHistoricalMonth {
  month: string;
  status: LicensingHistoricalMonthStatus;
  includedCharge?: LicensingMoneyAmount;
  observedStartDate?: string;
  observedEndDate?: string;
  sourceIds: string[];
  reasonCodes: LicensingReasonCode[];
}

export interface LicensingHistoricalCoverage {
  observedMonths: number;
  partialMonths: number;
  zeroMonths: number;
  unavailableMonths: number;
  conflictingMonths: number;
}

export interface LicensingHistoricalEvidence {
  window: LicensingHistoricalWindow;
  grossPotential?: LicensingMoneyAmount;
  averageObservedMonthlyCharge?: LicensingMoneyAmount;
  minimumObservedMonthlyCharge?: LicensingMoneyAmount;
  maximumObservedMonthlyCharge?: LicensingMoneyAmount;
  consecutiveObservedMonths: number;
  firstObservedChargeDate?: string;
  lastObservedChargeDate?: string;
  persistence: LicensingPersistenceStatus;
  confidence: LicensingConfidence;
  coverage: LicensingHistoricalCoverage;
  months: LicensingHistoricalMonth[];
  sourceIds: string[];
  reasonCodes: LicensingReasonCode[];
}

export interface LicensingActionLink {
  label: string;
  url: string;
}

export interface LicensingActionStep {
  order: number;
  code: string;
  title: string;
  description: string;
  link?: LicensingActionLink;
}

export interface LicensingActionProfile {
  implementationEffort: LicensingImplementationEffort;
  serviceRestartRequired: LicensingBooleanOrUnknown;
  reversible: LicensingBooleanOrUnknown;
  procurementRequired: LicensingBooleanOrUnknown;
  licenseTrackingRequired: boolean;
  renewalRequired: LicensingBooleanOrUnknown;
  renewalIntervalMonths?: number;
  rolesRequired: LicensingActionRole[];
  steps: LicensingActionStep[];
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
  configurationStatus: LicensingConfigurationStatus;
  technicalEligibilityStatus: LicensingTechnicalEligibilityStatus;
  coverageStatus: LicensingCoverageStatus;
  entitlementStatus: LicensingEntitlementStatus;
  reasonCodes: LicensingReasonCode[];
  explanations?: string[];
  decision: LicensingDecision;
  evidence: LicensingResourceEvidence;
  licenseRequirement?: LicensingLicenseRequirement;
  economics: LicensingResourceEconomics;
  historicalEvidence?: LicensingHistoricalEvidence;
  actionProfile: LicensingActionProfile;
  recommendationIds?: string[];
  commitmentContext?: LicensingCommitmentContext;
}

export interface LicensingStatusCount<TStatus extends string> {
  status: TStatus;
  count: number;
}

export interface LicensingCurrencySummary {
  currency: string;
  chargeEvidenceResourceCount: number;
  purchaseScenarioResourceCount: number;
  historicalEvidenceResourceCount: number;
  potentialAzureLicenseChargeAvoidedMonthly?: number;
  advertisedFullTermInvestment?: number;
  advertisedMonthlyEquivalent?: number;
  advertisedNetBenefitOverTerm?: number;
  advertisedNetBenefitMonthlyEquivalent?: number;
  advertisedPaybackMonths?: number;
  historicalGrossPotential?: number;
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
  assumptions: LicensingAssumption[];
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
  historicalBilling?: LicensingFreshnessInput;
  azureRetail: LicensingFreshnessInput;
  publicPricing: LicensingFreshnessInput;
  fx: LicensingFreshnessInput;
}

export interface LicensingDiagnostics {
  candidateCount?: number;
  analysedCount?: number;
  chargeEstimateCount?: number;
  purchaseScenarioCount?: number;
  unavailableChargeCount?: number;
  unavailablePurchaseScenarioCount?: number;
  historicalEvidenceCount?: number;
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
  licensingResourceIds?: string[];
  decision: LicensingDecision;
  licenseRequirement?: LicensingLicenseRequirement;
  azureLicenseCharge?: LicensingAzureLicenseCharge;
  purchaseScenario?: LicensingPurchaseScenario;
  historicalEvidence?: LicensingHistoricalEvidence;
  actionProfile?: LicensingActionProfile;
  outcome: LicensingEstimateOutcome;
  confidence: LicensingConfidence;
  reasonCodes: LicensingReasonCode[];
}
