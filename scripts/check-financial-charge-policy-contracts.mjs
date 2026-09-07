import assert from 'node:assert/strict';

import {
  AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_REF_V1,
  isAzureChargeableSavingsV1,
  isAzureCompanyChargeableSavingsResponseV1,
  isAzureFinancialChargeClassificationV1,
  isAzureFinancialChargeCoverageV1,
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
