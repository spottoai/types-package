import type { IBenefitUtilizationSummary, IBenefitWeightedUtilizationAggregate } from './benefits';
import type { CommitmentsUtilizationSummary } from './commitmentsPlanning';
import type { AzurePortalArtifactGeneration, AzurePortalVersionedArtifact } from './portalArtifacts';
import type { CostDateBasis, ResourceCostPeriodMetadata, ResourceCostSummary } from './prices';
import type { DailyMetrics } from './metrics';
import { RecommendationCategory, type Recommendation, type RecommendationWithResources } from './recommendations';
import type { DecompositionTree } from './reports';
import type { SecureScoreEvidence, SubscriptionProperties } from './subscriptions';
import type { CompletedViewManifestV2, CurrencySavingsGroup, SavingsPotential } from './views';

const generation: AzurePortalArtifactGeneration = {
  runId: 'sub-1:run-1',
  generatedAt: '2026-07-11T00:00:00.000Z',
};

const versionedArtifact: AzurePortalVersionedArtifact = {
  schemaVersion: 1,
  artifactGeneration: generation,
};

const partialManifest: CompletedViewManifestV2 = {
  schemaVersion: 2,
  status: 'partial',
  runId: generation.runId,
  subscriptionId: 'sub-1',
  artifacts: ['summary.json', 'resources.json', 'recommendations.json'],
  artifactGeneration: generation,
  requestedArtifactCount: 3,
  completedArtifactCount: 2,
  failureKind: 'artifact-and-resource',
  completedAt: '2026-07-11T00:01:00.000Z',
  failedArtifactCount: 1,
  failedArtifacts: ['recommendations.json'],
  requestedResourceCount: 10,
  completedResourceCount: 9,
  failedResourceCount: 1,
  failedResourceIds: ['/subscriptions/sub-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-1'],
};

const nzdSavings: SavingsPotential = {
  minAmount: 100,
  minPercentage: 10,
  maxAmount: 200,
  maxPercentage: 20,
  currency: 'NZD',
};

const availableSecureScoreEvidence: SecureScoreEvidence = {
  status: 'available',
  percentage: 72,
  currentScore: 43.2,
  maxScore: 60,
  weight: 125,
  assessedResourceCount: 125,
  observedAt: '2026-07-12T00:00:00.000Z',
};

const subscriptionPropertiesWithSecureScoreEvidence: SubscriptionProperties = {
  secureScore: 72,
  secureScoreEvidence: availableSecureScoreEvidence,
  currency: 'NZD',
  currencySymbol: '$',
  foundCurrency: true,
  showAmortizedCosts: true,
};

const unavailableSecureScoreEvidence: SecureScoreEvidence = {
  status: 'unavailable',
};

const subscriptionPropertiesWithoutFabricatedSecureScore: SubscriptionProperties = {
  secureScoreEvidence: unavailableSecureScoreEvidence,
  currency: 'NZD',
  currencySymbol: '$',
  foundCurrency: true,
  showAmortizedCosts: true,
};

const currencySavings: CurrencySavingsGroup = {
  currency: 'NZD',
  savings: {
    minAmount: nzdSavings.minAmount,
    minPercentage: nzdSavings.minPercentage,
    maxAmount: nzdSavings.maxAmount,
    maxPercentage: nzdSavings.maxPercentage,
  },
};

const blendedCost: ResourceCostSummary = {
  label1: 'Compute',
  label2: 'Virtual Machines',
  specs: [],
  active: true,
  addon: false,
  spend: 30,
  spendAmortized: 25,
  quantity: 10.5,
  unitPrice: '2.857143 1/Hour',
  unitPriceAmortized: '2.380952 1/Hour',
  retailDiscount: '',
  costSource: 'blended',
  billingDateRanges: [
    { startDate: 20260701, endDate: 20260701, basis: 'billing-calendar' },
    { startDate: 20260703, endDate: 20260703, basis: 'billing-calendar' },
  ],
  estimatedDateRanges: [{ startDate: 20260702, endDate: 20260702, basis: 'company-local', timeZone: 'Pacific/Auckland' }],
};

const utcCostDateBasis: CostDateBasis = 'utc';
const companyLocalCostDateBasis: CostDateBasis = 'company-local';

const companyLocalEstimatedSpend: ResourceCostSummary = {
  ...blendedCost,
  costSource: 'estimated_metrics_pricing',
  billingDateRanges: undefined,
  estimatedDateRanges: [{ startDate: 20260714, endDate: 20260714, basis: 'company-local', timeZone: 'Pacific/Auckland' }],
};

const companyLocalEstimatedRow = {
  cost: 10,
  costAmortized: 10,
  quantity: 100,
  date: 20260714,
  dateBasis: 'company-local',
  dateTimeZone: 'Pacific/Auckland',
  meterCategory: 'Cognitive Services',
  meterSubCategory: 'Azure OpenAI',
  serviceName: 'Cognitive Services',
  meter: 'Input Tokens',
  serviceTier: 'Standard',
  resourceGuid: 'resource-guid',
} satisfies import('./prices').ResourceSpend;

const dailyFinancialPeriod: ResourceCostPeriodMetadata = {
  kind: 'daily',
  name: 'daily_2026-07-14',
  label: 'Jul 14, 2026',
  date: '2026-07-14',
  startDate: 20260714,
  endDate: 20260714,
  basis: 'billing-calendar',
};

const companyLocalDailyMetric: DailyMetrics = {
  date: 20260714,
  basis: 'company-local',
  timeZone: 'Pacific/Auckland',
  spend: 10,
  costAmortized: 10,
  summary: [],
};

const decompositionTreeWithFinancialBasis: DecompositionTree = {
  root: { name: 'subscription', cost: 0, percentageOfTotal: 100 },
  period: {
    startDate: '2026-07-14',
    endDate: '2026-07-14',
    type: 'calendar_day',
    basis: 'billing-calendar',
  },
  lastUpdated: '2026-07-15T00:00:00.000Z',
  totalSpend: 0,
  currency: 'NZD',
  currencySymbol: '$',
};

const recommendationWithPercentageImpact: Recommendation = {
  id: 'rec-1',
  name: 'Reduce compute cost',
  category: RecommendationCategory.Cost,
  impact: 'High',
  costImpact: -40,
  costImpactUnit: 'percent',
};

const recommendationWithCurrencyGroups: RecommendationWithResources = {
  recommendation: recommendationWithPercentageImpact,
  resources: [],
  savingsByCurrency: [currencySavings],
};

const weightedUtilization: IBenefitWeightedUtilizationAggregate = {
  used: 99,
  reserved: 100,
  unit: 'hours',
  percentage: 99,
  sampleCount: 2,
};

const benefitsUtilization: IBenefitUtilizationSummary = {
  total: 2,
  withData: 2,
  thirtyDayAverage: 99,
  thirtyDayAggregates: [weightedUtilization],
  byBenefitType: [
    {
      benefitType: 'reservation',
      total: 2,
      withData: 2,
      thirtyDayAverage: 99,
      thirtyDayAggregates: [weightedUtilization],
    },
  ],
};

const commitmentsUtilization: CommitmentsUtilizationSummary = {
  total: 2,
  withData: 2,
  thirtyDayAverage: 99,
  thirtyDayAggregates: [weightedUtilization],
  byBenefitType: benefitsUtilization.byBenefitType,
};

const invalidManifest: CompletedViewManifestV2 = {
  ...partialManifest,
  // @ts-expect-error manifest state is a closed vocabulary.
  status: 'failed',
};

const invalidCurrencySavings: CurrencySavingsGroup = {
  currency: 'USD',
  savings: {
    ...currencySavings.savings,
    // @ts-expect-error grouped savings cannot contradict the outer currency.
    currency: 'EUR',
  },
};

// @ts-expect-error currency-weighted utilization requires an ISO currency.
const invalidCurrencyUtilization: IBenefitWeightedUtilizationAggregate = {
  used: 10,
  reserved: 20,
  unit: 'currency',
};

const invalidRecommendationImpact: Recommendation = {
  ...recommendationWithPercentageImpact,
  // @ts-expect-error cost impact is percentage points, never currency.
  costImpactUnit: 'currency',
};

void versionedArtifact;
void companyLocalDailyMetric;
void partialManifest;
void currencySavings;
void subscriptionPropertiesWithSecureScoreEvidence;
void unavailableSecureScoreEvidence;
void subscriptionPropertiesWithoutFabricatedSecureScore;
void blendedCost;
void utcCostDateBasis;
void companyLocalCostDateBasis;
void companyLocalEstimatedSpend;
void companyLocalEstimatedRow;
void dailyFinancialPeriod;
void decompositionTreeWithFinancialBasis;
void recommendationWithPercentageImpact;
void recommendationWithCurrencyGroups;
void commitmentsUtilization;
void invalidManifest;
void invalidRecommendationImpact;
void invalidCurrencySavings;
void invalidCurrencyUtilization;
