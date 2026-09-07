import assert from 'node:assert/strict';

import {
  AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_REF_V1,
  isAzureChargeableSavingsV1,
  isAzureCompanyChargeableSavingsResponseV1,
  isAzureFinancialChargeClassificationV1,
  isAzureFinancialChargeCoverageV1,
  isAzureFinancialChargeSpendBreakdownV1,
  isAzureNativeFinancialSummaryV1,
  isAzureNativeSubscriptionFinancialStatsV1,
  isAzureResourceFinancialChargeSpendBreakdownForResourceV1,
  isAzurePolicyBoundSavingsAggregateV1,
  isAzurePublisherTypeEvidenceV1,
} from '../dist/index.js';

const coordinate = {
  generationId: 'billing-generation-1',
  providerName: 'azure',
  providerScopeId: 'subscription-1',
  basis: 'billed',
  period: { startDate: '2026-08-01', endDateExclusive: '2026-09-01' },
  currencyCode: 'NZD',
  minorUnitScale: 2,
};

const completeCoverage = {
  contractVersion: 'financial-charge-policy/v1',
  policyRef: AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_REF_V1,
  coordinate,
  status: 'complete',
  sourceTotals: {
    allChargeMinorUnits: 15_000,
    azureNativeMinorUnits: 10_000,
    marketplaceMinorUnits: 5_000,
    unknownMinorUnits: 0,
    unknownAbsoluteMinorUnits: 0,
    rowCount: 2,
    azureNativeRowCount: 1,
    marketplaceRowCount: 1,
    unknownRowCount: 0,
    unknownNonZeroRowCount: 0,
  },
  unknownObjects: [],
};

const cancellingUnknownObject = {
  objectKey: 'subscription-1|billing-component|unassigned',
  name: 'Unassigned billing component',
  resourceType: 'billing-component',
  billableComponentKey: 'third-party-license',
  signedCostMinorUnits: 0,
  absoluteCostMinorUnits: 4_000,
  rowCount: 2,
  nonZeroRowCount: 2,
  reasonCodes: ['publisher-type-unsupported'],
};

const partialCoverage = {
  ...completeCoverage,
  status: 'partial',
  sourceTotals: {
    ...completeCoverage.sourceTotals,
    unknownAbsoluteMinorUnits: 4_000,
    rowCount: 4,
    unknownRowCount: 2,
    unknownNonZeroRowCount: 2,
  },
  unknownObjects: [cancellingUnknownObject],
};

const savingsAggregate = {
  contractVersion: 'savings/v2',
  generationId: coordinate.generationId,
  scopeKey: 'azure:subscription-1:subscription-full:all',
  scope: {
    kind: 'subscription-full',
    providerName: 'azure',
    providerScopeId: coordinate.providerScopeId,
    filterFingerprint: 'all',
  },
  allocationCount: 1,
  totals: {
    currency: coordinate.currencyCode,
    minorUnitScale: coordinate.minorUnitScale,
    currentMonthlyMinorUnits: 10_000,
    minSavingsMinorUnits: 1_000,
    maxSavingsMinorUnits: 2_000,
  },
};

const policySavings = {
  contractVersion: 'financial-charge-policy/v1',
  policyRef: AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_REF_V1,
  coordinate,
  coverage: completeCoverage,
  savingsAggregate,
};

const availableChargeableSavings = {
  contractVersion: 'financial-charge-policy/v1',
  policyRef: AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_REF_V1,
  coordinate,
  status: 'available',
  coverage: completeCoverage,
  savingsAggregate,
  chargeableMaxSavingsMinorUnits: 2_000,
};

const rollingSpendBreakdown = {
  contractVersion: 'financial-charge-spend/v1',
  policyRef: AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_REF_V1,
  generationId: coordinate.generationId,
  subject: { kind: 'provider-scope', providerScopeId: coordinate.providerScopeId },
  period: {
    startDate: '2026-08-08',
    endDateExclusive: '2026-09-07',
  },
  currencyCode: coordinate.currencyCode,
  minorUnitScale: coordinate.minorUnitScale,
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

const azureNativeFinancialSummary = {
  contractVersion: 'azure-native-financial-summary/v1',
  policyRef: AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_REF_V1,
  status: 'partial',
  cost: 100,
  costAmortized: 95,
  financialChargeSpend: rollingSpendBreakdown,
  resourceTypes: [{ name: 'Virtual Machines', cost: 100, costAmortized: 95 }],
};

const azureNativeSubscriptionFinancialStats = {
  contractVersion: 'azure-native-subscription-financial-stats/v1',
  policyRef: AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_REF_V1,
  status: 'partial',
  financialChargeSpend: rollingSpendBreakdown,
  resourcesByLocation: [],
  resourcesByType: [],
  spend30Days: 100,
  spend30DaysBillingBacked: 90,
  spend30DaysEstimated: 10,
};

assert.equal(isAzurePublisherTypeEvidenceV1({ status: 'available', publisherType: 'Marketplace', publisherName: 'Nerdio' }), true);
assert.equal(isAzurePublisherTypeEvidenceV1({ status: 'unavailable', reasonCode: 'publisher-type-unsupported' }), true);
assert.equal(isAzurePublisherTypeEvidenceV1({ status: 'unavailable', reasonCode: 'publisher-type-unrecognized' }), false);
assert.equal(isAzureFinancialChargeClassificationV1({ source: 'marketplace', publisherType: 'Marketplace' }), true);
assert.equal(isAzureFinancialChargeClassificationV1({ source: 'azure-native', publisherType: 'Microsoft' }), true);
assert.equal(
  isAzureFinancialChargeClassificationV1({
    source: 'unknown',
    reasonCode: 'publisher-type-unrecognized',
    publisherType: 'Partner',
  }),
  true
);
assert.equal(
  isAzureFinancialChargeClassificationV1({ source: 'azure-native', publisherType: 'Marketplace' }),
  false,
  'classification cannot contradict normalized publisher evidence'
);

assert.equal(isAzureFinancialChargeSpendBreakdownV1(rollingSpendBreakdown), true);
assert.equal(isAzureNativeFinancialSummaryV1(azureNativeFinancialSummary), true);
assert.equal(isAzureNativeSubscriptionFinancialStatsV1(azureNativeSubscriptionFinancialStats), true);
assert.equal(
  isAzureNativeFinancialSummaryV1({
    ...azureNativeFinancialSummary,
    resourceTypes: [{ name: 'Virtual Machines', cost: Number.NaN }],
  }),
  false,
  'daily/month Azure-native display projections reject non-finite money'
);
assert.equal(
  isAzureNativeSubscriptionFinancialStatsV1({
    ...azureNativeSubscriptionFinancialStats,
    spend30Days: Number.POSITIVE_INFINITY,
  }),
  false,
  'subscription Azure-native display projections reject non-finite money'
);
const resourceBreakdown = {
  ...rollingSpendBreakdown,
  subject: {
    kind: 'resource',
    providerScopeId: coordinate.providerScopeId,
    resourceId: '/subscriptions/subscription-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-1',
  },
};
assert.equal(
  isAzureResourceFinancialChargeSpendBreakdownForResourceV1(
    resourceBreakdown,
    '/SUBSCRIPTIONS/SUBSCRIPTION-1/RESOURCEGROUPS/RG/PROVIDERS/MICROSOFT.COMPUTE/VIRTUALMACHINES/VM-1/'
  ),
  true,
  'resource subject matching is case-insensitive and ignores trailing slashes'
);
assert.equal(
  isAzureResourceFinancialChargeSpendBreakdownForResourceV1(
    resourceBreakdown,
    '/subscriptions/subscription-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-2'
  ),
  false,
  'resource rolling spend must bind to the enclosing resource ID'
);
assert.equal(
  isAzureFinancialChargeSpendBreakdownV1({
    ...rollingSpendBreakdown,
    subject: { kind: 'resource', providerScopeId: coordinate.providerScopeId, resourceId: ' ' },
  }),
  false,
  'resource rolling spend requires a non-empty resource subject'
);
assert.equal(
  isAzureFinancialChargeSpendBreakdownV1({
    ...rollingSpendBreakdown,
    allCharge: {
      ...rollingSpendBreakdown.allCharge,
      billed: { ...rollingSpendBreakdown.allCharge.billed, totalMinorUnits: 16_999 },
    },
  }),
  false,
  'rolling spend source partitions must reconcile to all-charge spend'
);
assert.equal(
  isAzureFinancialChargeSpendBreakdownV1({ ...rollingSpendBreakdown, status: 'complete' }),
  false,
  'rolling spend with material unknown charges cannot claim complete coverage'
);
assert.equal(
  isAzureFinancialChargeSpendBreakdownV1({
    ...rollingSpendBreakdown,
    status: 'complete',
    unknown: {
      billed: { status: 'available', totalMinorUnits: 0, billingBackedMinorUnits: 0, estimatedMinorUnits: 0 },
      amortized: { status: 'available', totalMinorUnits: 0, billingBackedMinorUnits: 0, estimatedMinorUnits: 0 },
    },
    unknownMaterial: { nonZeroRowCount: 2, billedAbsoluteMinorUnits: 4_000, amortizedAbsoluteMinorUnits: 4_000 },
  }),
  false,
  'signed-zero material unknown rows cannot claim complete coverage'
);
assert.equal(
  isAzureFinancialChargeSpendBreakdownV1({
    ...rollingSpendBreakdown,
    status: 'partial',
    unknown: {
      billed: { status: 'available', totalMinorUnits: 0, billingBackedMinorUnits: 0, estimatedMinorUnits: 0 },
      amortized: { status: 'available', totalMinorUnits: 0, billingBackedMinorUnits: 0, estimatedMinorUnits: 0 },
    },
    unknownMaterial: { nonZeroRowCount: 0, billedAbsoluteMinorUnits: 0, amortizedAbsoluteMinorUnits: 0 },
  }),
  false,
  'partial rolling coverage requires material unknown evidence'
);
assert.equal(
  isAzureFinancialChargeSpendBreakdownV1({
    ...rollingSpendBreakdown,
    period: { startDate: '2026-02-30', endDateExclusive: '2026-03-02' },
  }),
  false,
  'rolling coverage rejects normalized but nonexistent calendar dates'
);
assert.equal(
  isAzureFinancialChargeSpendBreakdownV1({
    ...rollingSpendBreakdown,
    allCharge: {
      ...rollingSpendBreakdown.allCharge,
      billed: {
        status: 'available',
        totalMinorUnits: Number.MAX_SAFE_INTEGER - 1,
        billingBackedMinorUnits: Number.MAX_SAFE_INTEGER - 1,
        estimatedMinorUnits: 0,
      },
    },
    azureNative: {
      ...rollingSpendBreakdown.azureNative,
      billed: {
        status: 'available',
        totalMinorUnits: Number.MAX_SAFE_INTEGER,
        billingBackedMinorUnits: Number.MAX_SAFE_INTEGER,
        estimatedMinorUnits: 0,
      },
    },
    marketplace: {
      ...rollingSpendBreakdown.marketplace,
      billed: { status: 'available', totalMinorUnits: 2, billingBackedMinorUnits: 2, estimatedMinorUnits: 0 },
    },
    unknown: {
      ...rollingSpendBreakdown.unknown,
      billed: { status: 'available', totalMinorUnits: -2, billingBackedMinorUnits: -2, estimatedMinorUnits: 0 },
    },
    unknownMaterial: { nonZeroRowCount: 1, billedAbsoluteMinorUnits: 2, amortizedAbsoluteMinorUnits: 2_000 },
  }),
  false,
  'rolling source reconciliation rejects unsafe intermediate sums'
);
assert.equal(
  isAzureFinancialChargeSpendBreakdownV1({
    ...rollingSpendBreakdown,
    azureNative: {
      ...rollingSpendBreakdown.azureNative,
      billed: { ...rollingSpendBreakdown.azureNative.billed, estimatedMinorUnits: 999 },
    },
  }),
  false,
  'each source total must equal billing-backed plus estimated spend'
);
assert.equal(
  isAzureFinancialChargeSpendBreakdownV1({
    ...rollingSpendBreakdown,
    allCharge: {
      ...rollingSpendBreakdown.allCharge,
      amortized: { status: 'unavailable', reasonCode: 'billing-unavailable' },
    },
    azureNative: {
      ...rollingSpendBreakdown.azureNative,
      amortized: { status: 'unavailable', reasonCode: 'billing-unavailable' },
    },
    marketplace: {
      ...rollingSpendBreakdown.marketplace,
      amortized: { status: 'unavailable', reasonCode: 'billing-unavailable' },
    },
    unknown: {
      ...rollingSpendBreakdown.unknown,
      amortized: { status: 'unavailable', reasonCode: 'billing-unavailable' },
    },
  }),
  true,
  'missing amortized evidence is explicit and does not require a fabricated zero'
);
assert.equal(
  isAzureFinancialChargeSpendBreakdownV1({
    ...rollingSpendBreakdown,
    unknown: {
      ...rollingSpendBreakdown.unknown,
      amortized: { status: 'unavailable', reasonCode: 'billing-unavailable' },
    },
  }),
  false,
  'one source cannot silently lose a basis while the all-charge partition remains available'
);

assert.equal(isAzureFinancialChargeCoverageV1(completeCoverage), true);
assert.equal(isAzureFinancialChargeCoverageV1(partialCoverage), true, 'signed-zero unknown rows still make coverage partial');
assert.equal(isAzurePolicyBoundSavingsAggregateV1(policySavings), true);
assert.equal(isAzureChargeableSavingsV1(availableChargeableSavings), true);
assert.equal(
  isAzureFinancialChargeCoverageV1({ ...completeCoverage, sourceTotals: { ...completeCoverage.sourceTotals, allChargeMinorUnits: 14_999 } }),
  false,
  'source partitions must reconcile to all-charge cost'
);
assert.equal(
  isAzureFinancialChargeCoverageV1({ ...partialCoverage, status: 'complete' }),
  false,
  'non-zero unknown rows cannot be complete even when their signed net is zero'
);
for (const requiredField of ['name', 'resourceType', 'signedCostMinorUnits']) {
  const invalidObject = { ...cancellingUnknownObject };
  delete invalidObject[requiredField];
  assert.equal(
    isAzureFinancialChargeCoverageV1({ ...partialCoverage, unknownObjects: [invalidObject] }),
    false,
    `unknown object requires ${requiredField}`
  );
}
assert.equal(
  isAzureChargeableSavingsV1({
    ...availableChargeableSavings,
    coverage: partialCoverage,
  }),
  false,
  'partial coverage cannot expose chargeable savings'
);
assert.equal(
  isAzureChargeableSavingsV1({ ...availableChargeableSavings, chargeableMaxSavingsMinorUnits: 1_999 }),
  false,
  'chargeable savings must equal the canonical maximum monthly potential savings'
);
assert.equal(
  isAzurePolicyBoundSavingsAggregateV1({
    ...policySavings,
    savingsAggregate: { ...savingsAggregate, generationId: 'different-generation' },
  }),
  false,
  'savings and charge coverage must share one generation'
);

const companyResponse = {
  contractVersion: 'financial-charge-policy/v1',
  policyRef: AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_REF_V1,
  companyId: 'company-1',
  scopeResults: [
    {
      providerScopeId: coordinate.providerScopeId,
      status: 'available',
      generationId: coordinate.generationId,
      basis: coordinate.basis,
      period: coordinate.period,
      currencyCode: coordinate.currencyCode,
      minorUnitScale: coordinate.minorUnitScale,
      chargeableMaxSavingsMinorUnits: 2_000,
    },
  ],
  companyTotal: {
    status: 'available',
    basis: coordinate.basis,
    period: coordinate.period,
    currencyCode: coordinate.currencyCode,
    minorUnitScale: coordinate.minorUnitScale,
    chargeableMaxSavingsMinorUnits: 2_000,
  },
};
assert.equal(isAzureCompanyChargeableSavingsResponseV1(companyResponse), true);
assert.equal(
  isAzureCompanyChargeableSavingsResponseV1({
    ...companyResponse,
    scopeResults: [
      {
        providerScopeId: coordinate.providerScopeId,
        status: 'unavailable',
        reasonCodes: ['partial-source-coverage'],
        chargeableSavings: { ...availableChargeableSavings, status: 'unavailable' },
      },
    ],
    companyTotal: { status: 'unavailable', reasonCodes: ['partial-source-coverage'] },
  }),
  false,
  'billing projection cannot expose resource-level unavailable authority'
);
assert.equal(
  isAzureCompanyChargeableSavingsResponseV1({
    ...companyResponse,
    scopeResults: [{ ...companyResponse.scopeResults[0], period: { startDate: '2026-07-01', endDateExclusive: '2026-08-01' } }],
  }),
  false,
  'company total requires coordinate-compatible scope periods'
);

console.log('Financial charge policy contract checks passed.');
