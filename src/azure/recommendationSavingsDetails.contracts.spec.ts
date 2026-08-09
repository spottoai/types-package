import { RecommendationCategory } from '../index.js';
import type { RecommendationResource, ResourceRecommendationSavingsDetails, ResourceScopedRecommendation } from '../index.js';

const savingsDetails: ResourceRecommendationSavingsDetails = {
  headlineScenario: {
    id: 'three-year-savings-plan',
    label: '3-year Savings Plan',
    action: 'Purchase the 3-year commitment for this eligible workload.',
    monthlySavings: 10.66,
    targetMonthlyCost: 183.76,
  },
  affectedCost: {
    label: 'commitment-eligible compute cost',
    currentMonthlyCost: 194.42,
    savingsPercentage: 5.48,
  },
  resourceSpend: {
    last30Days: 333.31,
    savingsPercentage: 3.2,
  },
  calculationBasis: {
    type: 'commitment-pricing',
    windowStart: '2026-07-03',
    windowEnd: '2026-08-01',
  },
};

const resourceWithDetails: RecommendationResource = {
  id: '/subscriptions/sub/resourceGroups/rg/providers/Microsoft.Compute/virtualMachineScaleSets/vmss',
  name: 'vmss',
  type: 'microsoft.compute/virtualmachinescalesets',
  spend: 333.31,
  spendAmortized: 333.31,
  savingsDetails,
};

const legacyResourceWithoutDetails: RecommendationResource = {
  id: '/subscriptions/sub/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm',
  name: 'vm',
  type: 'microsoft.compute/virtualmachines',
  spend: 100,
  spendAmortized: 100,
};

const projectedMonthlyDetails: ResourceRecommendationSavingsDetails = {
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
  calculationBasis: {
    type: 'projected-monthly',
    windowStart: '2026-07-20',
    windowEnd: '2026-08-06',
  },
};

const scopedRecommendation: ResourceScopedRecommendation = {
  id: 'compute-snapshots_old',
  name: 'Aged Snapshots',
  category: RecommendationCategory.Cost,
  impact: 'Medium',
  savingsDetails: projectedMonthlyDetails,
};

const invalidCalculationBasis: ResourceRecommendationSavingsDetails = {
  ...savingsDetails,
  calculationBasis: {
    // @ts-expect-error Cost Estimation terminology is not part of this contract.
    type: 'estimated-cost',
  },
};

const missingHeadlineAction: ResourceRecommendationSavingsDetails = {
  ...savingsDetails,
  // @ts-expect-error A headline scenario without an action cannot explain how to achieve the saving.
  headlineScenario: {
    id: 'business-hours',
    label: 'Schedule Business Hours',
    monthlySavings: 70,
    targetMonthlyCost: 31,
  },
};

void resourceWithDetails;
void legacyResourceWithoutDetails;
void invalidCalculationBasis;
void missingHeadlineAction;
void scopedRecommendation;
