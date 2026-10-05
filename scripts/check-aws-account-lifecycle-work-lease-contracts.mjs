import assert from 'node:assert/strict';
import {
  AWS_ACCOUNT_LIFECYCLE_MAX_WORK_LEASES,
  AwsAccountLifecycleWorkLeaseError,
  hasUnexpiredAwsAccountLifecycleWorkLeases,
  isAwsAccountLifecycleIncarnationId,
  isAwsAccountLifecycleWorkLeases,
  normalizeAwsAccountLifecycleWorkLeaseDuration,
  normalizeAwsAccountLifecycleWorkLeaseIdentity,
  planAwsAccountLifecycleWorkLeaseAcquire,
  planAwsAccountLifecycleWorkLeaseRelease,
} from '../dist/common/awsAccountLifecycleWorkLease.js';

const now = new Date('2026-10-05T01:00:00.000Z');
const ownership = {
  awsAccountId: '123456789012',
  state: 'active',
  incarnationId: '4f5a72e5-3068-498b-a1f3-8c98a0ad391d',
  companyId: 'company-1',
  cloudAccountId: 'cloud-account-1',
  generation: 1,
  unrelated: { preserved: true },
};
const identity = { accountId: ownership.awsAccountId, incarnationId: ownership.incarnationId, leaseId: 'api-write-1', owner: 'invocation-1' };
const lease = (leaseId, acquiredAt = now, durationMs = 300_000) => ({
  leaseId,
  owner: identity.owner,
  acquiredAt: acquiredAt.toISOString(),
  expiresAt: new Date(acquiredAt.getTime() + durationMs).toISOString(),
});

assert.equal(AWS_ACCOUNT_LIFECYCLE_MAX_WORK_LEASES, 32);
assert.equal(normalizeAwsAccountLifecycleWorkLeaseDuration(undefined), (12 * 60 + 5) * 60 * 1000);
assert.equal(normalizeAwsAccountLifecycleWorkLeaseDuration(1), 1);
assert.equal(normalizeAwsAccountLifecycleWorkLeaseDuration(13 * 60 * 60 * 1000), 13 * 60 * 60 * 1000);
for (const duration of [0, -1, 1.5, Infinity, 13 * 60 * 60 * 1000 + 1]) assert.throws(() => normalizeAwsAccountLifecycleWorkLeaseDuration(duration));
assert.deepEqual(
  normalizeAwsAccountLifecycleWorkLeaseIdentity({
    ...identity,
    incarnationId: ` ${identity.incarnationId.toUpperCase()} `,
    leaseId: ' api-write-1 ',
  }),
  identity
);
assert.equal(isAwsAccountLifecycleIncarnationId(identity.incarnationId), true);
assert.equal(isAwsAccountLifecycleIncarnationId(identity.incarnationId.toUpperCase()), false);
assert.throws(() => normalizeAwsAccountLifecycleWorkLeaseIdentity({ ...identity, incarnationId: 'old-incarnation' }));
assert.throws(() => normalizeAwsAccountLifecycleWorkLeaseIdentity({ ...identity, accountId: '123' }));
assert.throws(() => normalizeAwsAccountLifecycleWorkLeaseIdentity({ ...identity, leaseId: 'a'.repeat(129) }));
assert.throws(() => normalizeAwsAccountLifecycleWorkLeaseIdentity({ ...identity, owner: 'a'.repeat(257) }));

const expired = lease('expired', new Date(now.getTime() - 300_001));
const existing = { ...ownership, workLeases: [lease('z-live'), expired, lease('a-live')] };
const original = structuredClone(existing);
const acquired = planAwsAccountLifecycleWorkLeaseAcquire(existing, identity, 300_000, now);
assert.equal(acquired.writeRequired, true);
assert.equal(acquired.decision.status, 'acquired');
assert.deepEqual(
  acquired.workLeases.map(item => item.leaseId),
  ['a-live', 'api-write-1', 'z-live']
);
assert.deepEqual(existing, original);
const replaced = { ...existing, workLeases: acquired.workLeases };
assert.deepEqual(replaced.unrelated, ownership.unrelated);
assert.equal(replaced.companyId, ownership.companyId);
assert.equal(replaced.generation, ownership.generation);
const replay = planAwsAccountLifecycleWorkLeaseAcquire(replaced, identity, 300_000, new Date(now.getTime() + 1));
assert.deepEqual(replay.decision, acquired.decision);
assert.equal(replay.writeRequired, false);
assert.equal(hasUnexpiredAwsAccountLifecycleWorkLeases({ workLeases: [acquired.decision.lease] }, now), true);
assert.equal(
  hasUnexpiredAwsAccountLifecycleWorkLeases({ workLeases: [acquired.decision.lease] }, new Date(acquired.decision.lease.expiresAt)),
  false
);

for (const [owner, reason] of [
  [undefined, 'ownership-missing'],
  [{ ...ownership, awsAccountId: '210987654321' }, 'ownership-account-mismatch'],
  [{ ...ownership, state: 'offboarding' }, 'ownership-inactive'],
  [{ ...ownership, incarnationId: undefined }, 'incarnation-mismatch'],
]) {
  assert.deepEqual(planAwsAccountLifecycleWorkLeaseAcquire(owner, identity, 300_000, now), {
    decision: { status: 'settled-stale', reason },
    writeRequired: false,
  });
}
assert.deepEqual(planAwsAccountLifecycleWorkLeaseRelease({ ...ownership, state: 'offboarded' }, identity, now), {
  decision: { status: 'settled-stale', reason: 'ownership-inactive' },
  writeRequired: false,
});
const removed = planAwsAccountLifecycleWorkLeaseRelease({ ...replaced, state: 'offboarding' }, identity, now);
assert.deepEqual(removed.decision, { status: 'released', released: true });
assert.equal(removed.writeRequired, true);
assert.deepEqual(
  removed.workLeases.map(item => item.leaseId),
  ['a-live', 'z-live']
);
const cleanup = planAwsAccountLifecycleWorkLeaseRelease({ ...ownership, workLeases: [expired] }, identity, now);
assert.deepEqual(cleanup.decision, { status: 'released', released: false });
assert.equal(cleanup.writeRequired, true);
assert.equal(cleanup.workLeases, undefined);
assert.deepEqual(planAwsAccountLifecycleWorkLeaseRelease(ownership, identity, now), {
  decision: { status: 'released', released: false },
  writeRequired: false,
});

const colliding = { ...ownership, workLeases: [{ ...lease(identity.leaseId), owner: 'other-invocation' }] };
for (const invoke of [
  () => planAwsAccountLifecycleWorkLeaseAcquire(colliding, identity, 300_000, now),
  () => planAwsAccountLifecycleWorkLeaseRelease(colliding, identity, now),
]) {
  assert.throws(
    invoke,
    error => error instanceof AwsAccountLifecycleWorkLeaseError && error.code === 'aws-account-work-lease-conflict' && error.retryable
  );
}
const capacity = { ...ownership, workLeases: Array.from({ length: 32 }, (_, index) => lease(`live-${index}`)) };
assert.throws(
  () => planAwsAccountLifecycleWorkLeaseAcquire(capacity, identity, 300_000, now),
  error => error instanceof AwsAccountLifecycleWorkLeaseError && error.code === 'aws-account-work-lease-capacity' && error.retryable
);
const releasedExpiredOwner = { ...ownership, workLeases: [{ ...expired, leaseId: identity.leaseId, owner: 'other-invocation' }] };
assert.throws(() => planAwsAccountLifecycleWorkLeaseRelease(releasedExpiredOwner, identity, now), AwsAccountLifecycleWorkLeaseError);
assert.equal(planAwsAccountLifecycleWorkLeaseAcquire(releasedExpiredOwner, identity, 300_000, now).writeRequired, true);

assert.equal(isAwsAccountLifecycleWorkLeases(undefined), true);
assert.equal(isAwsAccountLifecycleWorkLeases([]), true);
for (const invalid of [
  null,
  {},
  [null],
  [lease('same'), lease('same')],
  Array.from({ length: 33 }, (_, index) => lease(`lease-${index}`)),
  [{ ...lease('bad'), leaseId: ' bad' }],
  [{ ...lease('bad'), owner: '' }],
  [{ ...lease('bad'), acquiredAt: '2026-10-05' }],
  [{ ...lease('bad'), expiresAt: now.toISOString() }],
]) {
  assert.equal(isAwsAccountLifecycleWorkLeases(invalid), false);
  assert.throws(() => planAwsAccountLifecycleWorkLeaseAcquire({ ...ownership, workLeases: invalid }, identity, 300_000, now));
}
assert.throws(() => planAwsAccountLifecycleWorkLeaseRelease(ownership, identity, new Date('invalid')));

const cjs = await import('../dist/index.js');
const esm = await import('../dist/esm/entries/root.js');
for (const exports of [cjs, esm]) {
  assert.equal(exports.AWS_ACCOUNT_LIFECYCLE_MAX_WORK_LEASES, 32);
  assert.throws(
    () => exports.planAwsAccountLifecycleWorkLeaseAcquire(colliding, identity, 300_000, now),
    error => error instanceof exports.AwsAccountLifecycleWorkLeaseError && error.retryable
  );
  assert.deepEqual(exports.planAwsAccountLifecycleWorkLeaseAcquire(existing, identity, 300_000, now), acquired);
  assert.deepEqual(exports.planAwsAccountLifecycleWorkLeaseRelease(replaced, identity, now), removed);
}
process.stdout.write('AWS account lifecycle work lease contract checks passed.\n');
