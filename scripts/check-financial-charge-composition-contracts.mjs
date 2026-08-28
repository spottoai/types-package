import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import * as contracts from '../dist/index.js';

const baselineId = `sha256:${'1'.repeat(64)}`;
const component = (componentId, chargeSource, chargeRecurrence, chargeClassification, amount) => ({
  componentId,
  chargeSource,
  chargeRecurrence,
  chargeClassification,
  amount,
  evidenceRefIds: [`sha256:${'2'.repeat(64)}`],
});

assert.equal(typeof contracts.createFinancialChargeCompositionV1, 'function');
assert.equal(typeof contracts.selectFinancialChargesV1, 'function');
assert.equal(typeof contracts.isFinancialChargeCompositionV1, 'function');

const policyBoundCoordinate = {
  companyId: 'company-1',
  provider: 'azure',
  providerAccountRefs: ['azure-subscription:sub-1'],
  scope: { kind: 'subscription', scopeId: 'azure-subscription:sub-1', scopeFingerprint: `sha256:${'9'.repeat(64)}` },
  periodRole: 'current-spend',
  period: {
    windowKind: 'rolling-30-days',
    requested: { startDate: '2026-07-01', endDateExclusive: '2026-07-31', dateBasis: 'utc' },
  },
  costBasis: 'billed',
  estimateLens: 'billing-only',
  requestedCurrencyCode: 'AUD',
  accountingCurrency: { status: 'resolved', currencyCode: 'AUD' },
  chargeInclusionPolicyRef: contracts.AZURE_BILLED_ALL_CHARGES_POLICY_V1.policyRef,
};
assert.equal(contracts.isFinancialDataflowCoordinateV1(policyBoundCoordinate), true);
const { chargeInclusionPolicyRef: _removedPolicy, ...coordinateWithoutPolicy } = policyBoundCoordinate;
assert.equal(contracts.isFinancialDataflowCoordinateV1(coordinateWithoutPolicy), false);

const composition = contracts.createFinancialChargeCompositionV1({
  baselineId,
  ownerScopeId: 'azure-resource:vm-1',
  period: {
    windowKind: 'rolling-30-days',
    requested: { startDate: '2026-07-01', endDateExclusive: '2026-07-31', dateBasis: 'utc' },
    observed: { startDate: '2026-07-01', endDateExclusive: '2026-07-31', dateBasis: 'utc' },
    coverage: [
      {
        coverageId: `sha256:${'3'.repeat(64)}`,
        interval: { startDate: '2026-07-01', endDateExclusive: '2026-07-31', dateBasis: 'utc' },
        settlementState: 'settled',
        evidenceRefIds: [`sha256:${'2'.repeat(64)}`],
      },
    ],
    gaps: [],
  },
  costBasis: 'billed',
  estimateLens: 'actual-only',
  accountingCurrencyCode: 'AUD',
  sourceTotal: '155',
  components: [
    component(`sha256:${'4'.repeat(64)}`, 'azure-native', 'recurring', 'usage', '100'),
    component(`sha256:${'5'.repeat(64)}`, 'marketplace', 'one-time', 'purchase', '50'),
    component(`sha256:${'6'.repeat(64)}`, 'marketplace', 'recurring', 'refund', '-10'),
    component(`sha256:${'7'.repeat(64)}`, 'unknown', 'usage-based', 'credit', '-5'),
    component(`sha256:${'8'.repeat(64)}`, 'azure-native', 'usage-based', 'usage', '20'),
  ],
  algorithmVersion: 'financial-charge-composition/cloud-v1',
});

assert.equal(contracts.isFinancialChargeCompositionV1(composition), true);
assert.equal(composition.reconciliation.difference, '0');
assert.equal(composition.reconciliation.bucketTotal, '155');

const allCharges = contracts.selectFinancialChargesV1(
  composition,
  contracts.AZURE_BILLED_ALL_CHARGES_POLICY_V1.policyRef
);
assert.deepEqual(allCharges, {
  status: 'available',
  includedAmount: '155',
  excludedAmount: '0',
  withheldAmount: '0',
  forecastEligibleAmount: '105',
  oneTimeAmount: '50',
  unknownRecurrenceAmount: '0',
  forecastStatus: 'available',
  currencyCode: 'AUD',
});

const cloudServices = contracts.selectFinancialChargesV1(
  composition,
  contracts.AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_V1.policyRef
);
assert.deepEqual(cloudServices, {
  status: 'partial',
  includedAmount: '120',
  excludedAmount: '40',
  withheldAmount: '-5',
  forecastEligibleAmount: '120',
  oneTimeAmount: '0',
  unknownRecurrenceAmount: '0',
  forecastStatus: 'partial',
  forecastReasonCodes: ['charge-source-unknown'],
  currencyCode: 'AUD',
  reasonCodes: ['charge-source-unknown'],
});

const tampered = structuredClone(composition);
tampered.buckets[0].amount = '99';
assert.equal(contracts.isFinancialChargeCompositionV1(tampered), false);

const baselineIdentity = {
  schemaVersion: 2,
  contractVersion: 'financial-scope-baseline/v2',
  provider: 'azure',
  providerAccountRefs: ['azure-subscription:sub-1'],
  scopeKind: 'canonical-resource-owner',
  scopeId: 'azure-resource:vm-1',
  period: composition.period,
  costBasis: 'billed',
  estimateLens: 'actual-only',
  requestedCurrencyCode: 'AUD',
  assessmentId: `sha256:${'a'.repeat(64)}`,
  baselineKind: 'owner',
  evidenceBundleId: `sha256:${'b'.repeat(64)}`,
  accountingCurrency: {
    currencyCode: 'AUD',
    sourceCurrencyCode: 'AUD',
    evidenceRefIds: [`sha256:${'2'.repeat(64)}`],
  },
  chargeInclusionPolicyRef: contracts.AZURE_BILLED_ALL_CHARGES_POLICY_V1.policyRef,
  components: [
    { componentId: `sha256:${'4'.repeat(64)}`, billableIdentity: 'billing:azure', ownerScopeId: 'azure-resource:vm-1', chargeClassification: 'usage', amount: '100', evidenceRefIds: [`sha256:${'2'.repeat(64)}`], coverageIds: [`sha256:${'3'.repeat(64)}`] },
    { componentId: `sha256:${'5'.repeat(64)}`, billableIdentity: 'billing:marketplace-purchase', ownerScopeId: 'azure-resource:vm-1', chargeClassification: 'purchase', amount: '50', evidenceRefIds: [`sha256:${'2'.repeat(64)}`], coverageIds: [`sha256:${'3'.repeat(64)}`] },
    { componentId: `sha256:${'6'.repeat(64)}`, billableIdentity: 'billing:marketplace-refund', ownerScopeId: 'azure-resource:vm-1', chargeClassification: 'refund', amount: '-10', evidenceRefIds: [`sha256:${'2'.repeat(64)}`], coverageIds: [`sha256:${'3'.repeat(64)}`] },
    { componentId: `sha256:${'7'.repeat(64)}`, billableIdentity: 'billing:unknown-credit', ownerScopeId: 'azure-resource:vm-1', chargeClassification: 'credit', amount: '-5', evidenceRefIds: [`sha256:${'2'.repeat(64)}`], coverageIds: [`sha256:${'3'.repeat(64)}`] },
    { componentId: `sha256:${'8'.repeat(64)}`, billableIdentity: 'billing:azure-metered', ownerScopeId: 'azure-resource:vm-1', chargeClassification: 'usage', amount: '20', evidenceRefIds: [`sha256:${'2'.repeat(64)}`], coverageIds: [`sha256:${'3'.repeat(64)}`] },
  ],
};
const actualBaselineId = `sha256:${createHash('sha256')
  .update(contracts.canonicalizeFinancialScopeBaselineIdentityV2(baselineIdentity))
  .digest('hex')}`;
const baseline = {
  ...baselineIdentity,
  status: 'available',
  baselineId: actualBaselineId,
  total: { amount: '155', currencyCode: 'AUD' },
  reconciliation: { status: 'reconciled', componentTotal: '155', sourceTotal: '155', withheldTotal: '0', residualTotal: '0', difference: '0' },
};
const boundComposition = contracts.createFinancialChargeCompositionV1({
  baselineId: actualBaselineId,
  ownerScopeId: baseline.scopeId,
  period: baseline.period,
  costBasis: baseline.costBasis,
  estimateLens: baseline.estimateLens,
  accountingCurrencyCode: 'AUD',
  sourceTotal: '155',
  components: composition.buckets.flatMap(bucket => bucket.componentIds.map(componentId => ({
    componentId,
    chargeSource: bucket.chargeSource,
    chargeRecurrence: bucket.chargeRecurrence,
    chargeClassification: bucket.chargeClassification,
    amount: baseline.components.find(item => item.componentId === componentId).amount,
    evidenceRefIds: [`sha256:${'2'.repeat(64)}`],
  }))),
  algorithmVersion: 'financial-charge-composition/cloud-v1',
});

const cloudCoordinate = {
  ...policyBoundCoordinate,
  chargeInclusionPolicyRef: contracts.AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_V1.policyRef,
};
const currentSpend = contracts.composeCurrentSpendV1({
  coordinate: cloudCoordinate,
  baselines: [baseline],
  chargeCompositions: [boundComposition],
});
assert.equal(currentSpend.amount.status, 'partial');
assert.equal(currentSpend.amount.knownAmount, '120');
assert.equal(currentSpend.chargeSelection.excludedAmount, '40');
assert.equal(currentSpend.chargeSelection.withheldAmount, '-5');
assert.equal(currentSpend.chargeSelection.forecastEligibleAmount, '120');
assert.equal(currentSpend.members[0].chargeCompositionId, boundComposition.chargeCompositionId);

const unknownRecurrenceComposition = contracts.createFinancialChargeCompositionV1({
  baselineId: `sha256:${'c'.repeat(64)}`,
  ownerScopeId: 'azure-resource:unknown-recurrence',
  period: composition.period,
  costBasis: 'billed',
  estimateLens: 'actual-only',
  accountingCurrencyCode: 'AUD',
  sourceTotal: '7',
  components: [component(`sha256:${'d'.repeat(64)}`, 'azure-native', 'unknown', 'usage', '7')],
  algorithmVersion: 'financial-charge-composition/cloud-v1',
});
assert.deepEqual(
  contracts.selectFinancialChargesV1(
    unknownRecurrenceComposition,
    contracts.AZURE_BILLED_ALL_CHARGES_POLICY_V1.policyRef
  ),
  {
    status: 'available',
    includedAmount: '7',
    excludedAmount: '0',
    withheldAmount: '0',
    forecastEligibleAmount: '0',
    oneTimeAmount: '0',
    unknownRecurrenceAmount: '7',
    forecastStatus: 'partial',
    forecastReasonCodes: ['charge-recurrence-unknown'],
    currencyCode: 'AUD',
  }
);

console.log('Financial charge composition contracts passed.');
