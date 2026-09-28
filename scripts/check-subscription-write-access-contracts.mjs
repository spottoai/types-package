import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import * as esm from '../dist/esm/entries/root.js';

const require = createRequire(import.meta.url);
const cjs = require('../dist/index.js');

for (const [label, api] of [
  ['esm', esm],
  ['cjs', cjs],
]) {
  const {
    KNOWN_WRITE_PERMISSION_MASK,
    SUBSCRIPTION_WRITE_CAPABILITY_KEYS,
    SUBSCRIPTION_WRITE_CAPABILITY_PERMISSIONS,
    WritePermission,
    deriveSubscriptionWriteBitmasks,
    hasEffectiveWritePermission,
    isSubscriptionWriteAccessDocumentV1,
  } = api;

  // Existing bits never move.
  assert.equal(WritePermission.DismissRecommendations, 1, label);
  assert.equal(WritePermission.StorageInventory, 2, label);
  assert.equal(WritePermission.PolicyExemptions, 4, label);
  assert.equal(WritePermission.ResourceScheduling, 8, label);
  assert.equal(WritePermission.RemediationCleanup, 16, label);
  assert.equal(WritePermission.RemediationRightsize, 32, label);
  assert.equal(WritePermission.CommitmentsManage, 64, label);
  assert.equal(KNOWN_WRITE_PERMISSION_MASK, 127, label);

  // Every capability maps to a distinct known bit.
  const bits = SUBSCRIPTION_WRITE_CAPABILITY_KEYS.map(key => SUBSCRIPTION_WRITE_CAPABILITY_PERMISSIONS[key]);
  assert.equal(new Set(bits).size, bits.length, label);
  assert.equal(
    bits.reduce((mask, bit) => mask | bit, 0),
    KNOWN_WRITE_PERMISSION_MASK,
    label
  );

  const unavailable = { status: 'unavailable', missingActions: ['Microsoft.Compute/disks/delete'] };
  const capabilities = Object.fromEntries(SUBSCRIPTION_WRITE_CAPABILITY_KEYS.map(key => [key, unavailable]));
  capabilities.advisorDismissSync = { status: 'available' };
  capabilities.resourceScheduling = { status: 'partial', grantedScopeCount: 3, grantedScopes: ['/subscriptions/sub-1/resourceGroups/rg-dev'] };
  capabilities.policyExemptions = { status: 'unknown', reasonCode: 'throttled' };

  const derived = deriveSubscriptionWriteBitmasks(capabilities);
  assert.deepEqual(derived, { effectiveWriteBitmask: 1 | 8, partialWriteBitmask: 8 }, label);
  assert.equal(hasEffectiveWritePermission(derived.effectiveWriteBitmask, WritePermission.ResourceScheduling), true, label);
  assert.equal(hasEffectiveWritePermission(derived.effectiveWriteBitmask, WritePermission.PolicyExemptions), false, label);
  assert.equal(hasEffectiveWritePermission(undefined, WritePermission.DismissRecommendations), false, label);
  // A bit unknown to this version never satisfies a check.
  assert.equal(hasEffectiveWritePermission(1 << 20, 1 << 20), false, label);

  const complete = {
    schemaVersion: 1,
    provider: 'azure',
    companyId: 'comp-123',
    cloudAccountId: 'cloud-123',
    subscriptionId: 'sub-1',
    principalObjectId: 'sp-object-id',
    checkedAt: '2026-09-28T00:00:00.000Z',
    checkStatus: 'complete',
    ...derived,
    capabilities,
  };
  const failed = {
    schemaVersion: 1,
    provider: 'azure',
    companyId: 'comp-123',
    cloudAccountId: 'cloud-123',
    subscriptionId: 'sub-1',
    checkedAt: '2026-09-28T00:00:00.000Z',
    checkStatus: 'failed',
    reasonCode: 'throttled',
  };

  assert.equal(isSubscriptionWriteAccessDocumentV1(complete), true, label);
  assert.equal(isSubscriptionWriteAccessDocumentV1(failed), true, label);
  assert.equal(isSubscriptionWriteAccessDocumentV1(JSON.parse(JSON.stringify(complete))), true, label);

  // Forward compatibility: a newer producer's extra capability and bit are ignored.
  assert.equal(
    isSubscriptionWriteAccessDocumentV1({
      ...complete,
      effectiveWriteBitmask: complete.effectiveWriteBitmask | (1 << 20),
      capabilities: { ...capabilities, futureCapability: { status: 'available' } },
    }),
    true,
    label
  );

  const { advisorDismissSync: _omitted, ...missingOne } = capabilities;
  for (const invalid of [
    null,
    [],
    { ...complete, schemaVersion: 2 },
    { ...complete, provider: 'aws' },
    { ...complete, companyId: '' },
    { ...complete, checkedAt: 'not-a-date' },
    { ...complete, checkStatus: 'pending' },
    { ...complete, effectiveWriteBitmask: 0 },
    { ...complete, partialWriteBitmask: 0 },
    { ...complete, effectiveWriteBitmask: -1 },
    { ...complete, effectiveWriteBitmask: 1.5 },
    { ...complete, partialWriteBitmask: complete.partialWriteBitmask | 2 },
    { ...complete, capabilities: missingOne },
    { ...complete, capabilities: { ...capabilities, advisorDismissSync: { status: 'granted' } } },
    { ...complete, capabilities: { ...capabilities, resourceScheduling: { status: 'partial' } } },
    { ...complete, capabilities: { ...capabilities, storageInventory: { status: 'unavailable', missingActions: [''] } } },
    {
      ...complete,
      capabilities: {
        ...capabilities,
        resourceScheduling: { status: 'partial', grantedScopeCount: 51, grantedScopes: Array.from({ length: 51 }, (_, i) => `/scope/${i}`) },
      },
    },
    { ...failed, reasonCode: undefined },
  ]) {
    assert.equal(isSubscriptionWriteAccessDocumentV1(invalid), false, `${label}: ${JSON.stringify(invalid)}`);
  }

  const throwing = { ...complete };
  Object.defineProperty(throwing, 'capabilities', {
    enumerable: true,
    get() {
      throw new Error('adversarial accessor');
    },
  });
  assert.equal(isSubscriptionWriteAccessDocumentV1(throwing), false, label);
}

console.log('subscription write access contracts ok');
