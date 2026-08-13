import { RecommendationCategory } from '../index.js';
import type {
  AzureResourcePluginItemDetailed,
  AzureResourcePortalItem,
  RecommendationResource,
  ResourceOptimizationProfile,
  ResourceOptimizationScenario,
} from '../index.js';

const scenario: ResourceOptimizationScenario = {
  tierKey: 'hot-cold-mix',
  label: 'General Block Blob v2 – Hot & Cold Mix',
  recommendationIds: ['storage-storageaccounts_v1'],
  parameters: {},
  segments: [],
  summaryTotals: {},
  projectedMonthlyCost: 1.88,
  savingsAmount: 43.3,
  savingsPercent: 1.73,
};

const profile: ResourceOptimizationProfile = {
  sourceProfile: 'optimization-profiles/microsoft.storage-storageaccounts.json',
  currency: 'NZD',
  currentCost: 45.18,
  scenarios: [scenario],
};

const portalResource: AzureResourcePortalItem = {
  id: '/subscriptions/sub/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/example',
  name: 'example',
  type: 'microsoft.storage/storageaccounts',
  location: 'australiaeast',
  spend: 2504.38,
  spendAmortized: 2504.38,
  coverageDays: 22,
  recommendations: [],
  customRecommendations: [],
  optimizationProfile: {
    currency: 'NZD',
    currentCost: 45.18,
    scenarios: [
      {
        tierKey: scenario.tierKey,
        label: scenario.label,
        recommendationIds: scenario.recommendationIds,
        projectedMonthlyCost: scenario.projectedMonthlyCost,
        savingsAmount: scenario.savingsAmount,
      },
    ],
  },
};

const pluginResource: AzureResourcePluginItemDetailed = {
  id: portalResource.id,
  name: portalResource.name,
  type: portalResource.type,
  location: portalResource.location,
  subscription: 'sub',
  resourceGroup: 'rg',
  currency: 'NZD',
  currencySymbol: '$',
  timestamp: '2026-07-24T00:00:00.000Z',
  savings: {
    minAmount: 0,
    minPercentage: 0,
    maxAmount: 48.61,
    maxPercentage: 100,
  },
  recommendations: [
    {
      id: 'compute-snapshots_old',
      name: 'Aged Snapshots',
      category: RecommendationCategory.Cost,
      impact: 'Medium',
      savingsDetails: {
        headlineScenario: {
          id: 'remove-resource',
          label: 'Aged Snapshots',
          action: 'Review retention requirements, then delete this snapshot if it is no longer required.',
          monthlySavings: 48.61,
          targetMonthlyCost: 0,
        },
        affectedCost: {
          label: 'Projected monthly snapshot cost',
          currentMonthlyCost: 48.61,
          savingsPercentage: 100,
        },
        calculationBasis: { type: 'projected-monthly' },
      },
    },
  ],
  optimizationProfile: profile,
};

const recommendationResource: RecommendationResource = {
  id: portalResource.id,
  name: portalResource.name,
  type: portalResource.type,
  spend: portalResource.spend,
  spendAmortized: portalResource.spendAmortized,
  savingsBasis: 'billed',
  optimizationProfile: portalResource.optimizationProfile,
};

const recommendationResourceWithInvalidBasis: RecommendationResource = {
  ...recommendationResource,
  // @ts-expect-error Recommendation savings can only declare a billed or amortized basis.
  savingsBasis: 'retail',
};

// @ts-expect-error Clean cut removes the optimization-shaped costEstimation property.
void portalResource.costEstimation;
// @ts-expect-error Clean cut removes the optimization-shaped costEstimation property.
void pluginResource.costEstimation;
// @ts-expect-error Clean cut removes the optimization-shaped costEstimation property.
void recommendationResource.costEstimation;

void pluginResource;
void recommendationResource;
void recommendationResourceWithInvalidBasis;
