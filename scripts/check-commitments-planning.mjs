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

console.log('AWS commitments planning immutable public artifact checks passed.');
