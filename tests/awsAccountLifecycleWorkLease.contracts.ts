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
  type AwsAccountLifecycleWorkLeaseAcquireRequest,
  type AwsAccountLifecycleWorkLeaseOwnership,
  type AwsAccountLifecycleWorkLeasePlan,
  type AwsAccountLifecycleWorkLeaseDecision,
} from '../src/index.js';

const ownership: AwsAccountLifecycleWorkLeaseOwnership = {
  awsAccountId: '123456789012',
  state: 'active',
  incarnationId: '4f5a72e5-3068-498b-a1f3-8c98a0ad391d',
};
const request: AwsAccountLifecycleWorkLeaseAcquireRequest = {
  accountId: ownership.awsAccountId,
  incarnationId: ownership.incarnationId ?? '',
  leaseId: 'manual-write-1',
  owner: 'api-invocation-1',
  leaseDurationMs: 300_000,
};
const normalized = normalizeAwsAccountLifecycleWorkLeaseIdentity(request);
const now = new Date('2026-10-05T01:00:00.000Z');
const plan: AwsAccountLifecycleWorkLeasePlan<AwsAccountLifecycleWorkLeaseDecision> = planAwsAccountLifecycleWorkLeaseAcquire(
  ownership,
  normalized,
  normalizeAwsAccountLifecycleWorkLeaseDuration(request.leaseDurationMs),
  now
);
void plan;
void planAwsAccountLifecycleWorkLeaseRelease(ownership, request, now);
void hasUnexpiredAwsAccountLifecycleWorkLeases(ownership, now);
void isAwsAccountLifecycleWorkLeases(ownership.workLeases);
void isAwsAccountLifecycleIncarnationId(ownership.incarnationId);
void new AwsAccountLifecycleWorkLeaseError('aws-account-work-lease-capacity');
void AWS_ACCOUNT_LIFECYCLE_MAX_WORK_LEASES;
