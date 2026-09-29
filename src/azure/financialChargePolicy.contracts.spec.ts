import type {
  AzureChargeableSavingsV1,
  AzureFinancialChargeCoverageV1,
  AzureFinancialChargeSpendBreakdownV1,
  AzureProviderScopeFinancialChargeSpendBreakdownV1,
  AzureResourceFinancialChargeSpendBreakdownV1,
  AzurePolicyBoundSavingsAggregateV1,
  AzureDashboardView,
  AzureNativeFinancialSummaryV1,
  AzureNativeSubscriptionFinancialStatsV1,
  AzureResourcePortalItem,
  DecompositionTree,
  DecompositionTreeFinancialChargeSourceCostsV1,
  DecompositionTreeNodeFinancialChargeSourceCostsV1,
  RecommendationResource,
} from '../index.js';
import {
  isAzureFinancialChargeSpendBreakdownV1,
  isDecompositionTreeFinancialChargeSourceCostsV1,
  isDecompositionTreeNodeFinancialChargeSourceCostsV1,
} from '../index.js';

const rollingSpendBreakdown: AzureProviderScopeFinancialChargeSpendBreakdownV1 = {
  contractVersion: 'financial-charge-spend/v1',
  policyRef: 'azure-cloud-services-excluding-marketplace/v1',
  generationId: 'billing-generation-1',
  subject: { kind: 'provider-scope', providerScopeId: 'subscription-1' },
  period: {
    startDate: '2026-08-08',
    endDateExclusive: '2026-09-07',
  },
  currencyCode: 'NZD',
  minorUnitScale: 2,
  status: 'partial',
  allCharge: {
    billed: { status: 'available', totalMinorUnits: 17_000, billingBackedMinorUnits: 15_000, estimatedMinorUnits: 2_000 },
    amortized: { status: 'available', totalMinorUnits: 16_000, billingBackedMinorUnits: 14_000, estimatedMinorUnits: 2_000 },
  },
  azureNative: {
    billed: { status: 'available', totalMinorUnits: 10_000, billingBackedMinorUnits: 9_000, estimatedMinorUnits: 1_000 },
    amortized: { status: 'available', totalMinorUnits: 9_500, billingBackedMinorUnits: 8_500, estimatedMinorUnits: 1_000 },
  },
  marketplace: {
    billed: { status: 'available', totalMinorUnits: 5_000, billingBackedMinorUnits: 4_000, estimatedMinorUnits: 1_000 },
    amortized: { status: 'available', totalMinorUnits: 4_500, billingBackedMinorUnits: 3_500, estimatedMinorUnits: 1_000 },
  },
  unknown: {
    billed: { status: 'available', totalMinorUnits: 2_000, billingBackedMinorUnits: 2_000, estimatedMinorUnits: 0 },
    amortized: { status: 'available', totalMinorUnits: 2_000, billingBackedMinorUnits: 2_000, estimatedMinorUnits: 0 },
  },
  unknownMaterial: { nonZeroRowCount: 1, billedAbsoluteMinorUnits: 2_000, amortizedAbsoluteMinorUnits: 2_000 },
};

const azureNativeSubscriptionFinancialStats: AzureNativeSubscriptionFinancialStatsV1 = {
  contractVersion: 'azure-native-subscription-financial-stats/v1',
  policyRef: 'azure-cloud-services-excluding-marketplace/v1',
  status: 'partial',
  financialChargeSpend: rollingSpendBreakdown,
  resourcesByLocation: [],
  resourcesByType: [],
  spend30Days: 100,
};

const azureNativeFinancialSummary: AzureNativeFinancialSummaryV1 = {
  contractVersion: 'azure-native-financial-summary/v1',
  policyRef: 'azure-cloud-services-excluding-marketplace/v1',
  status: 'partial',
  cost: 100,
  costAmortized: 95,
  financialChargeSpend: rollingSpendBreakdown,
  resourceTypes: [],
};

const resourceRollingSpendBreakdown: AzureResourceFinancialChargeSpendBreakdownV1 = {
  ...rollingSpendBreakdown,
  subject: {
    kind: 'resource',
    providerScopeId: 'subscription-1',
    resourceId: '/subscriptions/subscription-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-1',
  },
};

const resourceFinancialSpend: Pick<AzureResourcePortalItem, 'financialChargeSpend'> = {
  financialChargeSpend: resourceRollingSpendBreakdown,
};

const invalidResourceFinancialSpend: Pick<AzureResourcePortalItem, 'financialChargeSpend'> = {
  // @ts-expect-error A provider-scope aggregate cannot be attached to a resource item.
  financialChargeSpend: rollingSpendBreakdown,
};

const dashboardFinancialSpend: Pick<AzureDashboardView, 'financialChargeSpend'> = {
  financialChargeSpend: rollingSpendBreakdown,
};

const recommendationResourceFinancialSpend: Pick<RecommendationResource, 'financialChargeSpend'> = {
  financialChargeSpend: resourceRollingSpendBreakdown,
};

const coverage: AzureFinancialChargeCoverageV1 = {
  contractVersion: 'financial-charge-policy/v1',
  policyRef: 'azure-cloud-services-excluding-marketplace/v1',
  coordinate: {
    generationId: 'billing-generation-1',
    providerName: 'azure',
    providerScopeId: 'subscription-1',
    basis: 'billed',
    period: {
      startDate: '2026-08-01',
      endDateExclusive: '2026-09-01',
    },
    currencyCode: 'NZD',
    minorUnitScale: 2,
  },
  status: 'partial',
  sourceTotals: {
    allChargeMinorUnits: 15_000,
    azureNativeMinorUnits: 10_000,
    marketplaceMinorUnits: 5_000,
    unknownMinorUnits: 0,
    unknownAbsoluteMinorUnits: 4_000,
    rowCount: 4,
    azureNativeRowCount: 1,
    marketplaceRowCount: 1,
    unknownRowCount: 2,
    unknownNonZeroRowCount: 2,
  },
  unknownObjects: [
    {
      objectKey: 'subscription-1|billing-component|unassigned',
      name: 'Unassigned billing component',
      resourceType: 'billing-component',
      billableComponentKey: 'third-party-license',
      signedCostMinorUnits: 0,
      absoluteCostMinorUnits: 4_000,
      rowCount: 2,
      nonZeroRowCount: 2,
      reasonCodes: ['publisher-type-unsupported'],
    },
  ],
};

const policySavings: AzurePolicyBoundSavingsAggregateV1 = {
  contractVersion: 'financial-charge-policy/v1',
  policyRef: coverage.policyRef,
  coordinate: coverage.coordinate,
  coverage,
  savingsAggregate: {
    contractVersion: 'savings/v2',
    generationId: coverage.coordinate.generationId,
    scopeKey: 'azure:subscription-1:subscription-full:all',
    scope: {
      kind: 'subscription-full',
      providerName: 'azure',
      providerScopeId: coverage.coordinate.providerScopeId,
      filterFingerprint: 'all',
    },
    allocationCount: 1,
    totals: {
      currency: coverage.coordinate.currencyCode,
      minorUnitScale: coverage.coordinate.minorUnitScale,
      currentMonthlyMinorUnits: 10_000,
      minSavingsMinorUnits: 1_000,
      maxSavingsMinorUnits: 2_000,
    },
  },
};

const unavailableChargeableSavings: AzureChargeableSavingsV1 = {
  contractVersion: 'financial-charge-policy/v1',
  policyRef: coverage.policyRef,
  coordinate: coverage.coordinate,
  status: 'unavailable',
  coverage,
  reasonCodes: ['partial-source-coverage'],
};

// @ts-expect-error A partial result cannot be represented as an available chargeable result.
const invalidAvailableChargeableSavings: AzureChargeableSavingsV1 = {
  ...unavailableChargeableSavings,
  status: 'available',
  chargeableMaxSavingsMinorUnits: policySavings.savingsAggregate.totals.maxSavingsMinorUnits,
};

void policySavings;
void unavailableChargeableSavings;
void invalidAvailableChargeableSavings;
void rollingSpendBreakdown;
void resourceRollingSpendBreakdown;
void resourceFinancialSpend;
void invalidResourceFinancialSpend;
void dashboardFinancialSpend;
void recommendationResourceFinancialSpend;
void azureNativeSubscriptionFinancialStats;
void azureNativeFinancialSummary;
if (!isAzureFinancialChargeSpendBreakdownV1(rollingSpendBreakdown)) {
  throw new Error('rolling spend breakdown contract must validate');
}

const mixedLeafSourceCosts: DecompositionTreeNodeFinancialChargeSourceCostsV1 = {
  current: {
    billed: {
      allChargeMinorUnits: 12_500,
      azureNativeMinorUnits: 10_000,
      marketplaceMinorUnits: 3_000,
      unknownMinorUnits: -500,
      unknownAbsoluteMinorUnits: 700,
      unknownNonZeroRowCount: 2,
      status: 'partial',
    },
  },
  previous: {
    billed: {
      allChargeMinorUnits: 9_000,
      azureNativeMinorUnits: 9_000,
      marketplaceMinorUnits: 0,
      unknownMinorUnits: 0,
      unknownAbsoluteMinorUnits: 0,
      unknownNonZeroRowCount: 0,
      status: 'complete',
    },
    amortized: {
      allChargeMinorUnits: 8_800,
      azureNativeMinorUnits: 8_800,
      marketplaceMinorUnits: 0,
      unknownMinorUnits: 0,
      unknownAbsoluteMinorUnits: 0,
      unknownNonZeroRowCount: 0,
      status: 'complete',
    },
  },
};

const treeSourceCosts: DecompositionTreeFinancialChargeSourceCostsV1 = {
  contractVersion: 'financial-charge-source-costs/v1',
  policyRef: 'azure-cloud-services-excluding-marketplace/v1',
  minorUnitScale: 2,
  ...mixedLeafSourceCosts,
};

const treeWithSourceCosts: DecompositionTree = {
  root: {
    name: 'Subscription',
    cost: 125,
    percentageOfTotal: 100,
    financialChargeSourceCosts: mixedLeafSourceCosts,
    children: [
      {
        name: 'mixed-vm',
        cost: 125,
        percentageOfTotal: 100,
        financialChargeSourceCosts: mixedLeafSourceCosts,
        meterDetails: [
          {
            meter: 'D4s v5',
            meterCategory: 'Virtual Machines',
            meterSubCategory: 'Dsv5 Series',
            quantity: 720,
            cost: 100,
            financialChargeSource: 'azure-native',
          },
          {
            meter: 'Per VM',
            meterCategory: 'Azure Applications',
            meterSubCategory: 'Vendor image',
            quantity: 1,
            cost: 30,
            financialChargeSource: 'marketplace',
          },
        ],
      },
    ],
  },
  period: { startDate: '2026-08-31', endDate: '2026-09-28', type: 'rolling_30_days' },
  lastUpdated: '2026-09-29T00:00:00.000Z',
  totalSpend: 125,
  currency: 'NZD',
  currencySymbol: '$',
  version: '2.1',
  financialChargeSourceCosts: treeSourceCosts,
};

const invalidNodeSourceCosts: DecompositionTreeNodeFinancialChargeSourceCostsV1 = {
  // @ts-expect-error Each period must carry a billed split; amortized alone is not a source split.
  current: { amortized: mixedLeafSourceCosts.previous?.amortized },
};

void treeWithSourceCosts;
void invalidNodeSourceCosts;
if (!isDecompositionTreeFinancialChargeSourceCostsV1(treeSourceCosts)) {
  throw new Error('tree source costs contract must validate');
}
if (!isDecompositionTreeNodeFinancialChargeSourceCostsV1(mixedLeafSourceCosts)) {
  throw new Error('node source costs contract must validate');
}
if (
  isDecompositionTreeNodeFinancialChargeSourceCostsV1({
    current: { billed: { ...mixedLeafSourceCosts.current?.billed, allChargeMinorUnits: 12_501 } },
  })
) {
  throw new Error('node source costs must reconcile to the all-charge amount');
}
if (isDecompositionTreeNodeFinancialChargeSourceCostsV1({ ...treeSourceCosts })) {
  throw new Error('node source costs must not repeat the tree-level contract header');
}
