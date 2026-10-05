/** Existing account-lifecycle work-lease policy, shared by CAS storage adapters. */
export const AWS_ACCOUNT_LIFECYCLE_MAX_WORK_LEASES = 32;
const DEFAULT_LEASE_DURATION_MS = 12 * 60 * 60 * 1000 + 5 * 60 * 1000;
const MAX_LEASE_DURATION_MS = 13 * 60 * 60 * 1000;

export interface AwsAccountLifecycleWorkLeaseRecord {
  leaseId: string;
  owner: string;
  acquiredAt: string;
  expiresAt: string;
}

/** The policy does not authorize company/connection membership; adapters must. */
export interface AwsAccountLifecycleWorkLeaseOwnership {
  awsAccountId: string;
  incarnationId?: string;
  state: 'provisioning' | 'active' | 'offboarding' | 'offboarded';
  workLeases?: AwsAccountLifecycleWorkLeaseRecord[];
}

export interface AwsAccountLifecycleWorkLeaseIdentity {
  accountId: string;
  incarnationId: string;
  leaseId: string;
  owner: string;
}

export interface AwsAccountLifecycleWorkLeaseAcquireRequest extends AwsAccountLifecycleWorkLeaseIdentity {
  leaseDurationMs?: number;
}

type StaleWorkLeaseDecision = {
  status: 'settled-stale';
  reason: 'ownership-missing' | 'ownership-account-mismatch' | 'ownership-inactive' | 'incarnation-mismatch';
};

export type AwsAccountLifecycleWorkLeaseDecision = { status: 'acquired'; lease: AwsAccountLifecycleWorkLeaseRecord } | StaleWorkLeaseDecision;
export type AwsAccountLifecycleWorkLeaseReleaseDecision = { status: 'released'; released: boolean } | StaleWorkLeaseDecision;

export interface AwsAccountLifecycleWorkLeasePlan<Decision> {
  decision: Decision;
  writeRequired: boolean;
  /** Replace this field alone after a successful ETag CAS; preserve the outer saga. */
  workLeases?: AwsAccountLifecycleWorkLeaseRecord[];
}

export class AwsAccountLifecycleWorkLeaseError extends Error {
  readonly retryable = true;
  constructor(readonly code: 'aws-account-work-lease-capacity' | 'aws-account-work-lease-conflict') {
    super('AWS account lifecycle work lease could not be persisted.');
    this.name = 'AwsAccountLifecycleWorkLeaseError';
  }
}

export function isAwsAccountLifecycleIncarnationId(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u.test(value);
}

function isTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
}

/** Same acceptance policy as the engine's account lifecycle saga storage reader. */
export function isAwsAccountLifecycleWorkLeases(value: unknown): value is AwsAccountLifecycleWorkLeaseRecord[] | undefined {
  if (value === undefined) return true;
  if (!Array.isArray(value) || value.length > AWS_ACCOUNT_LIFECYCLE_MAX_WORK_LEASES) return false;
  const ids = new Set<string>();
  for (const candidate of value) {
    if (candidate === null || typeof candidate !== 'object') return false;
    const lease = candidate as Record<string, unknown>;
    if (
      typeof lease.leaseId !== 'string' ||
      !lease.leaseId.trim() ||
      lease.leaseId.length > 128 ||
      lease.leaseId !== lease.leaseId.trim() ||
      typeof lease.owner !== 'string' ||
      !lease.owner.trim() ||
      lease.owner.length > 256 ||
      lease.owner !== lease.owner.trim() ||
      !isTimestamp(lease.acquiredAt) ||
      !isTimestamp(lease.expiresAt) ||
      Date.parse(lease.expiresAt) <= Date.parse(lease.acquiredAt) ||
      ids.has(lease.leaseId)
    )
      return false;
    ids.add(lease.leaseId);
  }
  return true;
}

function normalizeRequired(value: string, name: string, maxLength: number): string {
  const normalized = value?.trim();
  if (!normalized || normalized.length > maxLength) throw new Error(`AWS account lifecycle work lease ${name} is invalid.`);
  return normalized;
}

export function normalizeAwsAccountLifecycleWorkLeaseIdentity(request: AwsAccountLifecycleWorkLeaseIdentity): AwsAccountLifecycleWorkLeaseIdentity {
  const accountId = request.accountId?.trim();
  if (!/^\d{12}$/u.test(accountId)) throw new Error('AWS account lifecycle work lease accountId must be a 12-digit AWS account id.');
  const incarnationId = request.incarnationId?.trim().toLowerCase();
  if (!isAwsAccountLifecycleIncarnationId(incarnationId)) throw new Error('AWS account lifecycle work lease incarnationId must be a UUID v4.');
  return {
    accountId,
    incarnationId,
    leaseId: normalizeRequired(request.leaseId, 'leaseId', 128),
    owner: normalizeRequired(request.owner, 'owner', 256),
  };
}

export function normalizeAwsAccountLifecycleWorkLeaseDuration(value: number | undefined): number {
  const duration = value ?? DEFAULT_LEASE_DURATION_MS;
  if (!Number.isSafeInteger(duration) || duration < 1 || duration > MAX_LEASE_DURATION_MS)
    throw new Error('AWS account lifecycle work lease duration is invalid.');
  return duration;
}

function listUnexpiredLeases(ownership: Pick<AwsAccountLifecycleWorkLeaseOwnership, 'workLeases'>, now: Date): AwsAccountLifecycleWorkLeaseRecord[] {
  if (!Number.isFinite(now.getTime())) throw new Error('AWS account lifecycle work lease clock is invalid.');
  if (!isAwsAccountLifecycleWorkLeases(ownership.workLeases)) throw new Error('AWS account lifecycle work lease records are invalid.');
  return (ownership.workLeases ?? []).filter(lease => Date.parse(lease.expiresAt) > now.getTime()).map(lease => ({ ...lease }));
}

export function hasUnexpiredAwsAccountLifecycleWorkLeases(ownership: Pick<AwsAccountLifecycleWorkLeaseOwnership, 'workLeases'>, now: Date): boolean {
  return listUnexpiredLeases(ownership, now).length > 0;
}

function staleDecision(
  ownership: AwsAccountLifecycleWorkLeaseOwnership | undefined,
  identity: AwsAccountLifecycleWorkLeaseIdentity,
  allowedStates: AwsAccountLifecycleWorkLeaseOwnership['state'][]
): StaleWorkLeaseDecision | undefined {
  if (!ownership) return { status: 'settled-stale', reason: 'ownership-missing' };
  if (ownership.awsAccountId !== identity.accountId) return { status: 'settled-stale', reason: 'ownership-account-mismatch' };
  if (!allowedStates.includes(ownership.state)) return { status: 'settled-stale', reason: 'ownership-inactive' };
  if (ownership.incarnationId !== identity.incarnationId) return { status: 'settled-stale', reason: 'incarnation-mismatch' };
  return undefined;
}

function sortLeases(leases: AwsAccountLifecycleWorkLeaseRecord[]): AwsAccountLifecycleWorkLeaseRecord[] {
  return [...leases].sort((left, right) => left.leaseId.localeCompare(right.leaseId));
}

/** A plan never writes storage. Publish workLeases only after the adapter's CAS succeeds. */
export function planAwsAccountLifecycleWorkLeaseAcquire(
  ownership: AwsAccountLifecycleWorkLeaseOwnership | undefined,
  identity: AwsAccountLifecycleWorkLeaseIdentity,
  leaseDurationMs: number,
  now: Date
): AwsAccountLifecycleWorkLeasePlan<AwsAccountLifecycleWorkLeaseDecision> {
  const normalized = normalizeAwsAccountLifecycleWorkLeaseIdentity(identity);
  const duration = normalizeAwsAccountLifecycleWorkLeaseDuration(leaseDurationMs);
  const stale = staleDecision(ownership, normalized, ['active']);
  if (stale) return { decision: stale, writeRequired: false };
  // staleDecision proves presence, but retain an explicit guard for strict consumers.
  if (!ownership) throw new Error('AWS account lifecycle work lease ownership is missing.');
  const live = listUnexpiredLeases(ownership, now);
  const existing = live.find(lease => lease.leaseId === normalized.leaseId);
  if (existing) {
    if (existing.owner !== normalized.owner) throw new AwsAccountLifecycleWorkLeaseError('aws-account-work-lease-conflict');
    return { decision: { status: 'acquired', lease: existing }, writeRequired: false };
  }
  if (live.length >= AWS_ACCOUNT_LIFECYCLE_MAX_WORK_LEASES) throw new AwsAccountLifecycleWorkLeaseError('aws-account-work-lease-capacity');
  const lease = {
    leaseId: normalized.leaseId,
    owner: normalized.owner,
    acquiredAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + duration).toISOString(),
  };
  return { decision: { status: 'acquired', lease }, writeRequired: true, workLeases: sortLeases([...live, lease]) };
}

export function planAwsAccountLifecycleWorkLeaseRelease(
  ownership: AwsAccountLifecycleWorkLeaseOwnership | undefined,
  identity: AwsAccountLifecycleWorkLeaseIdentity,
  now: Date
): AwsAccountLifecycleWorkLeasePlan<AwsAccountLifecycleWorkLeaseReleaseDecision> {
  const normalized = normalizeAwsAccountLifecycleWorkLeaseIdentity(identity);
  const stale = staleDecision(ownership, normalized, ['active', 'offboarding']);
  if (stale) return { decision: stale, writeRequired: false };
  if (!ownership) throw new Error('AWS account lifecycle work lease ownership is missing.');
  if (!isAwsAccountLifecycleWorkLeases(ownership.workLeases)) throw new Error('AWS account lifecycle work lease records are invalid.');
  const existing = ownership.workLeases?.find(lease => lease.leaseId === normalized.leaseId);
  if (existing && existing.owner !== normalized.owner) throw new AwsAccountLifecycleWorkLeaseError('aws-account-work-lease-conflict');
  const retained = listUnexpiredLeases(ownership, now).filter(lease => lease.leaseId !== normalized.leaseId);
  const released = existing !== undefined;
  const writeRequired = released || retained.length !== (ownership.workLeases?.length ?? 0);
  return {
    decision: { status: 'released', released },
    writeRequired,
    ...(writeRequired && retained.length ? { workLeases: sortLeases(retained) } : {}),
  };
}
