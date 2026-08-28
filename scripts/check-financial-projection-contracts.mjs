import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

import { canonicalizeFinancialProjectionIdentityV1, isFinancialProjectionEnvelopeV1 } from '../dist/index.js';

const identity = {
  schemaVersion: 1,
  contractVersion: 'financial-projection/v1',
  provider: 'azure',
  providerAccountRefs: ['azure-subscription:sub-1'],
  scopeId: '/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.compute/virtualmachines/vm-1',
  scenarioId: 'vm-alternative:d2as-v5',
  operationKind: 'replace-rate',
  baselineCostBasis: 'billed',
  baselineEstimateLens: 'actual-only',
  targetCostBasis: 'billed',
  targetProvenance: 'retail-derived',
  targetPeriodConvention: 'same-observed-quantity',
  affectedComponentIds: [`sha256:${'1'.repeat(64)}`],
  accountingCurrencyCode: 'AUD',
  targetEvidenceBundleId: `sha256:${'2'.repeat(64)}`,
  targetAssessmentId: `sha256:${'3'.repeat(64)}`,
  baselineId: `sha256:${'4'.repeat(64)}`,
  appliedComponentTargets: [
    {
      componentId: `sha256:${'1'.repeat(64)}`,
      targetAmount: '50',
      targetConfigurationId: 'azure-vm-sku:standard-d2as-v5',
      targetEvidenceRefIds: [`sha256:${'6'.repeat(64)}`],
      sourceQuantity: { amount: '100', unit: 'hour' },
      targetRate: { amount: '0.5', currencyCode: 'AUD', quantityUnit: 'hour' },
    },
  ],
};
const projection = {
  ...identity,
  status: 'available',
  projectionId: `sha256:${createHash('sha256').update(canonicalizeFinancialProjectionIdentityV1(identity)).digest('hex')}`,
  current: { total: '100', affected: '80', unchanged: '20' },
  target: { total: '70', affected: '50', unchanged: '20' },
  change: { delta: '-30', savings: '30', increase: '0' },
  reconciliation: { status: 'reconciled', difference: '0' },
};

assert.equal(isFinancialProjectionEnvelopeV1(projection), true);

const unclassifiedUnavailable = {
  schemaVersion: 1,
  contractVersion: 'financial-projection/v1',
  provider: 'azure',
  providerAccountRefs: ['azure-subscription:sub-1'],
  scopeId: '/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.unknown/widgets/widget-1',
  scenarioId: 'unknown-financial-scenario',
  operationKind: 'unclassified',
  baselineCostBasis: 'billed',
  baselineEstimateLens: 'actual-only',
  targetCostBasis: 'billed',
  targetProvenance: 'estimated',
  targetPeriodConvention: 'same-period-quantity',
  affectedComponentIds: [],
  status: 'unavailable',
  unavailableReason: 'target-evidence-unavailable',
};
assert.equal(
  isFinancialProjectionEnvelopeV1(unclassifiedUnavailable),
  true,
  'An unclassified strategy may be represented only as explicit target-evidence-unavailable.'
);
assert.equal(
  isFinancialProjectionEnvelopeV1({ ...unclassifiedUnavailable, unavailableReason: 'baseline-unavailable' }),
  false,
  'An unclassified strategy cannot hide another failure reason.'
);
assert.equal(
  isFinancialProjectionEnvelopeV1({ ...unclassifiedUnavailable, affectedComponentIds: [`sha256:${'1'.repeat(64)}`] }),
  false,
  'An unclassified strategy cannot claim affected components without target evidence.'
);

const commitmentIdentity = {
  ...identity,
  scenarioId: 'reservation:one-year:d11-v2',
  operationKind: 'commitment-coverage',
  targetProvenance: 'provider-quote-derived',
  targetPeriodConvention: 'normalized-average-month',
  targetPeriodProfile: {
    kind: 'normalized-average-month',
    annualDayCount: 365,
    monthDivisor: 12,
    hoursPerDay: 24,
    normalizedHours: '730',
  },
  appliedComponentTargets: [
    {
      componentId: identity.affectedComponentIds[0],
      targetAmount: '492',
      targetConfigurationId: 'azure-reservation:d11-v2:one-year',
      targetEvidenceRefIds: [`sha256:${'6'.repeat(64)}`],
      commitmentCoverage: {
        instrumentKind: 'reservation',
        productId: 'azure-reservation:d11-v2:one-year',
        quote: { kind: 'whole-term', amount: '2400', currencyCode: 'AUD', termMonths: 12, termDayCount: 365 },
        purchaseQuantity: '1',
        eligibleQuantity: { amount: '1460', unit: 'hour' },
        existingCoveredQuantity: { amount: '0', unit: 'hour' },
        coveredQuantity: { amount: '730', unit: 'hour' },
        commitmentCharge: { amount: '200', currencyCode: 'AUD' },
        uncoveredQuantity: { amount: '730', unit: 'hour' },
        uncoveredRate: { amount: '0.4', currencyCode: 'AUD', quantityUnit: 'hour' },
        uncoveredRemainderRule: 'billing-derived-effective-rate',
        effectivePeriod: { startDate: '2026-04-01', endDateExclusive: '2027-04-01', dateBasis: 'billing-calendar' },
      },
    },
  ],
};
const commitmentProjection = {
  ...commitmentIdentity,
  status: 'available',
  projectionId: `sha256:${createHash('sha256').update(canonicalizeFinancialProjectionIdentityV1(commitmentIdentity)).digest('hex')}`,
  current: { total: '584', affected: '584', unchanged: '0' },
  target: { total: '492', affected: '492', unchanged: '0' },
  change: { delta: '-92', savings: '92', increase: '0' },
  reconciliation: { status: 'reconciled', difference: '0' },
};
assert.equal(isFinancialProjectionEnvelopeV1(commitmentProjection), true, 'Whole-term reservation target must replay exactly.');

const rollingReservationIdentity = structuredClone(commitmentIdentity);
rollingReservationIdentity.scenarioId = 'reservation:one-year:d11-v2:rolling-30-days';
rollingReservationIdentity.targetPeriodConvention = 'same-period-quantity';
rollingReservationIdentity.targetPeriodProfile = {
  kind: 'observed-period',
  dayCount: 30,
  hoursPerDay: 24,
  hourCount: '720',
  currencyMinorUnitScale: 2,
  roundingMode: 'half-even',
};
rollingReservationIdentity.appliedComponentTargets[0].targetAmount = '493.26';
rollingReservationIdentity.appliedComponentTargets[0].commitmentCoverage.coveredQuantity.amount = '720';
rollingReservationIdentity.appliedComponentTargets[0].commitmentCoverage.uncoveredQuantity.amount = '740';
rollingReservationIdentity.appliedComponentTargets[0].commitmentCoverage.commitmentCharge = {
  amount: '197.26',
  currencyCode: 'AUD',
};
const rollingReservationProjection = {
  ...rollingReservationIdentity,
  status: 'available',
  projectionId: `sha256:${createHash('sha256').update(canonicalizeFinancialProjectionIdentityV1(rollingReservationIdentity)).digest('hex')}`,
  current: { total: '584', affected: '584', unchanged: '0' },
  target: { total: '493.26', affected: '493.26', unchanged: '0' },
  change: { delta: '-90.74', savings: '90.74', increase: '0' },
  reconciliation: { status: 'reconciled', difference: '0' },
};
assert.equal(
  isFinancialProjectionEnvelopeV1(rollingReservationProjection),
  true,
  'Whole-term reservation quote must allocate and round explicitly to the observed 30-day period.'
);

const removalIdentity = {
  ...identity,
  scenarioId: 'licence:remove-windows',
  operationKind: 'remove-component',
  targetProvenance: 'configuration-derived',
  appliedComponentTargets: [
    {
      componentId: identity.affectedComponentIds[0],
      targetAmount: '0',
      targetConfigurationId: 'azure-vm-os:linux',
      targetEvidenceRefIds: [`sha256:${'6'.repeat(64)}`],
      configurationTransformation: {
        kind: 'remove-component',
        targetQuantity: { amount: '0', unit: 'hour' },
        ruleEvidenceRefId: `sha256:${'6'.repeat(64)}`,
      },
    },
  ],
};
const removalProjection = {
  ...removalIdentity,
  status: 'available',
  projectionId: `sha256:${createHash('sha256').update(canonicalizeFinancialProjectionIdentityV1(removalIdentity)).digest('hex')}`,
  current: { total: '40', affected: '40', unchanged: '0' },
  target: { total: '0', affected: '0', unchanged: '0' },
  change: { delta: '-40', savings: '40', increase: '0' },
  reconciliation: { status: 'reconciled', difference: '0' },
};
assert.equal(isFinancialProjectionEnvelopeV1(removalProjection), true, 'Configuration-derived removal must remain replayable.');

const quantityAndRateIdentity = {
  ...identity,
  scenarioId: 'storage:cool-tier',
  operationKind: 'replace-quantity-and-rate',
  appliedComponentTargets: [
    {
      componentId: identity.affectedComponentIds[0],
      targetAmount: '36',
      targetConfigurationId: 'azure-storage-tier:cool',
      targetEvidenceRefIds: [`sha256:${'6'.repeat(64)}`],
      targetQuantity: { amount: '120', unit: 'gb-month' },
      targetRate: { amount: '0.3', currencyCode: 'AUD', quantityUnit: 'gb-month' },
    },
  ],
};
const quantityAndRateProjection = {
  ...quantityAndRateIdentity,
  status: 'available',
  projectionId: `sha256:${createHash('sha256').update(canonicalizeFinancialProjectionIdentityV1(quantityAndRateIdentity)).digest('hex')}`,
  current: { total: '60', affected: '60', unchanged: '0' },
  target: { total: '36', affected: '36', unchanged: '0' },
  change: { delta: '-24', savings: '24', increase: '0' },
  reconciliation: { status: 'reconciled', difference: '0' },
};
assert.equal(
  isFinancialProjectionEnvelopeV1(quantityAndRateProjection),
  true,
  'A simultaneous target quantity and rate change must replay target money from both exact inputs.'
);
const forgedQuantityAndRate = structuredClone(quantityAndRateProjection);
forgedQuantityAndRate.appliedComponentTargets[0].targetAmount = '35';
assert.equal(
  isFinancialProjectionEnvelopeV1(forgedQuantityAndRate),
  false,
  'A producer-provided target total cannot override the replayed quantity-rate product.'
);

const invalidCommitmentAmount = structuredClone(commitmentIdentity);
invalidCommitmentAmount.appliedComponentTargets[0].targetAmount = '491';
assert.throws(
  () => canonicalizeFinancialProjectionIdentityV1(invalidCommitmentAmount),
  /Invalid FinancialProjectionIdentityPreimageV1/,
  'Commitment target money must be recomputed from fixed charge plus uncovered remainder.'
);
const incompleteSavingsPlan = structuredClone(commitmentIdentity);
incompleteSavingsPlan.scenarioId = 'savings-plan:missing-tier-allocation';
incompleteSavingsPlan.appliedComponentTargets[0].commitmentCoverage.instrumentKind = 'savings-plan';
assert.throws(
  () => canonicalizeFinancialProjectionIdentityV1(incompleteSavingsPlan),
  /Invalid FinancialProjectionIdentityPreimageV1/,
  'Savings Plan must remain unavailable until cross-component tier and commitment allocation is replayable.'
);
const missingNormalization = structuredClone(commitmentIdentity);
delete missingNormalization.targetPeriodProfile;
assert.throws(
  () => canonicalizeFinancialProjectionIdentityV1(missingNormalization),
  /Invalid FinancialProjectionIdentityPreimageV1/,
  'Normalized-average-month targets require the exact normalization profile.'
);
const mislabelledRemoval = structuredClone(removalIdentity);
mislabelledRemoval.targetProvenance = 'estimated';
assert.throws(
  () => canonicalizeFinancialProjectionIdentityV1(mislabelledRemoval),
  /Invalid FinancialProjectionIdentityPreimageV1/,
  'Deterministic removal must not masquerade as estimated money.'
);

const reject = (mutate, label) => {
  const candidate = structuredClone(projection);
  mutate(candidate);
  assert.equal(isFinancialProjectionEnvelopeV1(candidate), false, label);
};
reject(value => {
  value.projectionId = `sha256:${'f'.repeat(64)}`;
}, 'Forged projection identity must fail closed.');
reject(value => {
  value.target.total = '71';
}, 'Target total must reconcile.');
reject(value => {
  value.change.savings = '29';
}, 'Savings must be recomputed from current and target totals.');
reject(value => {
  value.accountingCurrencyCode = 'USD';
}, 'Identity mutation must invalidate the projection ID.');
reject(value => {
  delete value.appliedComponentTargets;
}, 'Available projections require replayable applied target inputs.');
reject(value => {
  value.appliedComponentTargets[0].targetAmount = '49';
}, 'Applied target amounts must reconcile to target affected.');
reject(value => {
  value.appliedComponentTargets[0].targetEvidenceRefIds = [];
}, 'Applied targets require precise evidence references.');

const unavailable = {
  ...Object.fromEntries(Object.entries(identity).filter(([key]) => !['baselineId', 'appliedComponentTargets'].includes(key))),
  status: 'unavailable',
  unavailableReason: 'baseline-unavailable',
};
assert.equal(isFinancialProjectionEnvelopeV1(unavailable), true);
assert.equal(isFinancialProjectionEnvelopeV1({ ...unavailable, savings: '0' }), false);

const unavailableWithoutTargetEvidence = {
  ...Object.fromEntries(
    Object.entries(identity).filter(
      ([key]) => !['baselineId', 'targetEvidenceBundleId', 'targetAssessmentId', 'appliedComponentTargets'].includes(key)
    )
  ),
  affectedComponentIds: [],
  status: 'unavailable',
  unavailableReason: 'target-evidence-unavailable',
};
assert.equal(
  isFinancialProjectionEnvelopeV1(unavailableWithoutTargetEvidence),
  true,
  'Missing target evidence must remain a typed unavailable scenario without fabricated evidence IDs.'
);

console.log('Financial projection contracts passed.');
