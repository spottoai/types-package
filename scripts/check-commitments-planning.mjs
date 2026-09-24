import assert from 'node:assert/strict';

import {
  AWS_PORTAL_COMMITMENTS_PLANNING_LOGICAL_NAME,
  AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  validateAwsCommitmentsPlanningViewIdentity,
  validateAwsPortalCommitmentsPlanningArtifact,
} from '../dist/aws/index.js';

const accountId = '123456789012';
const baseView = {
  providerScope: { providerName: 'aws', providerScopeId: accountId },
  inventory: [
    {
      id: 'ri-1',
      sourceKind: 'aws-native',
      provider: 'aws',
      appliedScopeType: 'linked-account',
      appliedScopeProperties: { accountId, region: 'ap-southeast-2' },
      shape: { provider: 'aws' },
    },
  ],
  purchaseRecommendations: [
    {
      id: 'rec-1',
      purchaseScope: 'linked-account',
      appliedScopeProperties: { accountId },
      source: { sourceKind: 'aws-native' },
      targetShape: { provider: 'aws' },
    },
  ],
};

assert.doesNotThrow(() => validateAwsCommitmentsPlanningViewIdentity(baseView, accountId));

const reject = (mutate, pattern) => {
  const value = structuredClone(baseView);
  mutate(value);
  assert.throws(() => validateAwsCommitmentsPlanningViewIdentity(value, accountId), pattern);
};

reject(value => {
  value.providerScope.companyId = 'company-1';
}, /undeclared fields: companyId/);
reject(value => {
  value.inventory[0].appliedScopeProperties.accountId = '999999999999';
}, /must match its exact binding/);
reject(value => {
  value.inventory[0].sourceId = 'arn:aws:ec2:ap-southeast-2:999999999999:reserved-instances\/ri-1';
}, /must match its exact binding/);
reject(value => {
  value.subscription = { subscriptionId: 'legacy' };
}, /subscription is not allowed/);
reject(value => {
  value.purchaseRecommendations[0].pricingQuote = {};
}, /pricingQuote is not allowed/);
reject(value => {
  value.credentialHealth = {};
}, /credentialHealth is not allowed/);
reject(value => {
  value.storageCapacity = {};
}, /storageCapacity is not allowed/);

console.log('AWS commitments planning identity checks passed.');

const generatedAt = '2026-08-13T00:00:00.000Z';
const publicArtifact = {
  schemaVersion: AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  portalSchemaVersion: AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  provider: 'aws',
  accountId,
  artifactType: 'commitments-planning',
  artifactGeneration: { runId: 'portal-run-1', generatedAt },
  logicalName: AWS_PORTAL_COMMITMENTS_PLANNING_LOGICAL_NAME,
  version: '2.0',
  generatedAt,
  ...baseView,
  utilizationSummary: { total: 1, withData: 0, byBenefitType: [] },
  expirySummary: { expired: 0, expiring30d: 0, expiring60d: 0, expiring90d: 0, expiring180d: 0 },
  inventory: [
    {
      ...baseView.inventory[0],
      benefitType: 'reservation',
      scope: 'Single',
      type: 'ec2-reserved-instance',
      status: 'active',
      shape: { provider: 'aws', attributes: { offeringClass: 'standard' } },
    },
  ],
  resourceCoverage: [],
  obsoleteCandidates: [],
  pricingContext: { source: 'unknown' },
  termStrategy: [],
};

assert.equal(validateAwsPortalCommitmentsPlanningArtifact(publicArtifact), publicArtifact);

const rejectPublic = (mutate, pattern) => {
  const value = structuredClone(publicArtifact);
  mutate(value);
  assert.throws(() => validateAwsPortalCommitmentsPlanningArtifact(value), pattern);
};

rejectPublic(value => {
  value.logicalName = 'other.json.gz';
}, /logicalName must match/);
rejectPublic(value => {
  value.providerScope.companyId = 'company-1';
}, /undeclared fields: companyId/);
rejectPublic(value => {
  value.inventory[0].appliedScopeProperties.accountId = '999999999999';
}, /must match its exact binding/);
rejectPublic(value => {
  value.inventory[0].sourceId = 'arn:aws:ec2:ap-southeast-2:999999999999:reserved-instances\/ri-1';
}, /must match its exact binding/);
rejectPublic(value => {
  value.inventory[0].undeclaredFinancialDetail = 1;
}, /undeclared fields: undeclaredFinancialDetail/);
rejectPublic(value => {
  value.inventory[0].shape.unknownShapeField = true;
}, /undeclared fields: unknownShapeField/);
rejectPublic(value => {
  value.inventory[0].breakCostEstimate = { status: 'estimated', policySource: 'azure-policy', confidence: 'high' };
}, /breakCostEstimate is not allowed|undeclared fields: breakCostEstimate/);
rejectPublic(value => {
  value.subscription = { subscriptionId: 'azure-subscription' };
}, /undeclared fields: subscription|subscription is not allowed/);
rejectPublic(value => {
  value.purchaseRecommendations[0].pricingQuote = { response: { raw: true } };
}, /pricingQuote is not allowed|undeclared fields: pricingQuote/);
rejectPublic(value => {
  value.runtimeState = { retries: 1 };
}, /undeclared fields: runtimeState/);

const freshPublicArtifact = structuredClone(publicArtifact);
freshPublicArtifact.freshness = {
  status: 'partial',
  generatedAt,
  entries: [
    {
      section: 'inventory',
      status: 'stale',
      lastSuccessfulSyncAt: '2026-08-11T00:00:00.000Z',
      ageHours: 48,
      reasonCode: 'collection-stale',
    },
  ],
};
assert.equal(validateAwsPortalCommitmentsPlanningArtifact(freshPublicArtifact), freshPublicArtifact);
for (const mutate of [
  entry => {
    entry.ageHours = Number.POSITIVE_INFINITY;
  },
  entry => {
    entry.status = 'unavailable';
  },
  entry => {
    entry.reasonCode = 'COLLECTION-STALE';
  },
]) {
  const value = structuredClone(freshPublicArtifact);
  mutate(value.freshness.entries[0]);
  assert.throws(() => validateAwsPortalCommitmentsPlanningArtifact(value), /ageHours must be|reasonCode must be/);
}

console.log('AWS commitments planning immutable public artifact checks passed.');

const {
  COMMITMENTS_FRESHNESS_REASON_CODES,
  isCommitmentsFreshnessAgeHours,
  isCommitmentsFreshnessEntry,
  isCommitmentsFreshnessReasonCode,
  isCommitmentsFreshnessSummary,
} = await import('../dist/index.js');

assert.deepEqual(
  [...COMMITMENTS_FRESHNESS_REASON_CODES],
  ['collection-stale', 'permission-denied', 'collection-failed', 'not-collected', 'status-invalid']
);
assert.equal(isCommitmentsFreshnessReasonCode('not-collected'), true);
assert.equal(isCommitmentsFreshnessReasonCode('stale'), false);
for (const age of [0, 0.1, 12.3, 60, 8760.5]) assert.equal(isCommitmentsFreshnessAgeHours(age), true, `accepts ageHours ${age}`);
for (const age of [-0.1, 1.25, Number.NaN, Number.POSITIVE_INFINITY, '1']) {
  assert.equal(isCommitmentsFreshnessAgeHours(age), false, `rejects ageHours ${String(age)}`);
}

const azureEntry = {
  section: 'inventory',
  status: 'stale',
  generatedAt: '2026-08-13T00:00:00.000Z',
  lastSuccessfulSyncAt: '2026-08-10T12:00:00.000Z',
  ageHours: 60,
  reasonCode: 'collection-stale',
  reason: 'Reservation inventory is older than 48 hours.',
  sourceKind: 'azure-native',
};
const azureSummary = {
  status: 'stale',
  generatedAt: '2026-08-13T00:00:00.000Z',
  entries: [
    azureEntry,
    { section: 'savings-plan-inventory', status: 'unavailable', reasonCode: 'permission-denied' },
    { section: 'storageCapacity', status: 'partial', reasonCode: 'collection-failed' },
    { section: 'resourceCoverage', status: 'unavailable', reasonCode: 'not-collected' },
    { section: 'reservation-inventory', status: 'partial', reasonCode: 'status-invalid' },
    { section: 'legacy', status: 'current', generatedAt: '2026-08-13T00:00:00.000Z' },
  ],
  warnings: ['Reservation inventory is older than 48 hours.'],
};
assert.equal(isCommitmentsFreshnessEntry(azureEntry), true);
assert.equal(isCommitmentsFreshnessSummary(azureSummary), true);
for (const mutate of [
  entry => {
    entry.ageHours = -1;
  },
  entry => {
    entry.ageHours = 60.04;
  },
  entry => {
    entry.ageHours = '60';
  },
  entry => {
    delete entry.lastSuccessfulSyncAt;
  },
  entry => {
    entry.reasonCode = 'throttled';
  },
  entry => {
    entry.status = 'unavailable';
  },
  entry => {
    entry.status = 'expired';
  },
  entry => {
    entry.lastSuccessfulSyncAt = 'yesterday';
  },
  entry => {
    entry.sourceKind = 'guess';
  },
  entry => {
    delete entry.section;
  },
]) {
  const entry = structuredClone(azureEntry);
  mutate(entry);
  assert.equal(isCommitmentsFreshnessEntry(entry), false, `rejects invalid freshness entry ${JSON.stringify(entry)}`);
}
assert.equal(isCommitmentsFreshnessSummary({ ...azureSummary, status: 'fresh' }), false);
assert.equal(isCommitmentsFreshnessSummary({ ...azureSummary, generatedAt: undefined }), false);
assert.equal(isCommitmentsFreshnessSummary({ ...azureSummary, entries: [{ ...azureEntry, reasonCode: 'throttled' }] }), false);

console.log('Azure commitments freshness guard checks passed.');
