import type { AzureChargeableSavingsV1, AzureFinancialChargeCoverageV1, AzurePolicyBoundSavingsAggregateV1 } from '../index.js';

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
