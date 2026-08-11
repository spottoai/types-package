import assert from 'node:assert/strict';

import { validateAwsCommitmentsPlanningViewIdentity } from '../dist/aws/index.js';

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
