import type { ArtifactProvider } from './artifactGeneration.js';
import {
  isArtifactOwnershipBinding,
  type ArtifactEmptyEvidenceVerdict,
  type ArtifactFreshnessVerdict,
  type ArtifactOwnershipBinding,
} from './artifactEvidence.js';

export const CAPABILITY_PASSPORT_SCHEMA_VERSION = 1 as const;

export type CapabilityPassportSchemaVersion = typeof CAPABILITY_PASSPORT_SCHEMA_VERSION;

export const CAPABILITY_REASON_CODES = [
  'not-requested',
  'permission-denied',
  'not-found',
  'throttled',
  'timeout',
  'pagination-incomplete',
  'source-partial',
  'source-empty',
  'source-unsupported',
  'retained-last-known-good',
  'currency-unresolved',
  'unknown',
] as const;

export type CapabilityReasonCode = (typeof CAPABILITY_REASON_CODES)[number];

type CapabilityScopeBase<Provider extends ArtifactProvider = ArtifactProvider> = {
  provider: Provider;
  tenantId: string;
};

export type CapabilityScopeBinding<Provider extends ArtifactProvider = ArtifactProvider> =
  | (CapabilityScopeBase<Provider> & { kind: 'tenant' })
  | (CapabilityScopeBase<Provider> & { kind: 'billing-account'; billingAccountId: string })
  | (CapabilityScopeBase<Provider> & { kind: 'customer'; customerId: string })
  | (CapabilityScopeBase<Provider> & { kind: 'subscription'; subscriptionId: string })
  | (CapabilityScopeBase<Provider> & {
      kind: 'resource';
      subscriptionId: string;
      normalizedResourceId: string;
    });

export interface ImmutableSourceGeneration {
  artifactRef: string;
  generationId: string;
  sha256: string;
  schemaVersion: number;
  producedAt: string;
  completeThrough?: string;
}

export type CapabilityAttempt =
  | { status: 'not-attempted'; reasonCode: CapabilityReasonCode }
  | {
      status: 'attempted';
      startedAt: string;
      completedAt: string;
      outcome: 'succeeded' | 'failed' | 'partial';
      reasonCodes: CapabilityReasonCode[];
    };

export type CapabilityFreshness =
  | { status: Extract<ArtifactFreshnessVerdict, 'current'>; observedAt: string; completeThrough?: string }
  | { status: Extract<ArtifactFreshnessVerdict, 'stale'>; observedAt: string; completeThrough?: string; maximumAge: string }
  | { status: Extract<ArtifactFreshnessVerdict, 'unknown'> };

export interface CapabilityObservation<Provider extends ArtifactProvider = ArtifactProvider> {
  observationId: string;
  capability: string;
  scope: CapabilityScopeBinding<Provider>;
  attempt: CapabilityAttempt;
  providerSurfaceOutcome: 'accepted' | 'authoritatively-unsupported' | 'unknown';
  availability: 'available' | 'partial' | 'missing' | 'unavailable' | 'unknown';
  emptyEvidence: ArtifactEmptyEvidenceVerdict;
  freshness: CapabilityFreshness;
  sourceGeneration?: ImmutableSourceGeneration;
  coverageRef?: string;
  limits?: {
    expectedPages?: number;
    receivedPages?: number;
    throttled?: boolean;
    retainedLastKnownGood?: boolean;
  };
}

export type CapabilityObservationSet<Provider extends ArtifactProvider = ArtifactProvider> =
  | { mode: 'inline'; totalCount: number; items: CapabilityObservation<Provider>[] }
  | {
      mode: 'sharded';
      totalCount: number;
      shardCount: number;
      indexRef: string;
      shards: Array<{ artifactRef: string; sha256: string; itemCount: number }>;
    };

export type CapabilityAgreementType = 'EA' | 'MCA' | 'CSP' | 'PAYG-MOSP' | 'sponsored-trial' | 'unknown';

export interface CapabilityPassport<Provider extends ArtifactProvider = ArtifactProvider> {
  schemaVersion: CapabilityPassportSchemaVersion;
  passportId: string;
  generatedAt: string;
  runId: string;
  ownership: ArtifactOwnershipBinding<Provider> & {
    subscriptionId: string;
  };
  agreementObservation: {
    type: CapabilityAgreementType;
    source: 'observed' | 'configured' | 'unknown';
    sourceGeneration?: ImmutableSourceGeneration;
  };
  observations: CapabilityObservationSet<Provider>;
  producerVersions: Record<string, string>;
  issues: Array<{ reasonCode: CapabilityReasonCode; observationId?: string }>;
}

const REASON_CODES = new Set<string>(CAPABILITY_REASON_CODES);
const AGREEMENT_TYPES = new Set<string>(['EA', 'MCA', 'CSP', 'PAYG-MOSP', 'sponsored-trial', 'unknown']);
const AGREEMENT_SOURCES = new Set<string>(['observed', 'configured', 'unknown']);
const AVAILABILITY_VALUES = new Set<string>(['available', 'partial', 'missing', 'unavailable', 'unknown']);
const EMPTY_EVIDENCE_VALUES = new Set<string>(['populated', 'complete-empty', 'not-observed', 'unknown']);
const PROVIDER_OUTCOMES = new Set<string>(['accepted', 'authoritatively-unsupported', 'unknown']);
const ATTEMPT_OUTCOMES = new Set<string>(['succeeded', 'failed', 'partial']);
const SHA256_PATTERN = /^[a-f0-9]{64}$/;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const isNonNegativeInteger = (value: unknown): value is number => Number.isInteger(value) && (value as number) >= 0;
const isPositiveInteger = (value: unknown): value is number => Number.isInteger(value) && (value as number) > 0;

const isCanonicalIsoTimestamp = (value: unknown): value is string => {
  if (!isNonEmptyString(value)) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
};

const isLogicalArtifactRef = (value: unknown): value is string => {
  if (!isNonEmptyString(value) || value.startsWith('/') || value.includes('://') || value.includes('?') || value.includes('#')) return false;
  if (value.includes('\\')) return false;
  const segments = value.split('/');
  return segments.length >= 2 && segments.every(segment => segment.length > 0 && segment !== '.' && segment !== '..');
};

const isSubscriptionBoundResourceId = (value: unknown, subscriptionId: string): value is string => {
  if (!isNonEmptyString(value)) return false;
  const segments = value.split('/');
  return (
    segments.length >= 4 &&
    segments[0] === '' &&
    segments[1]?.toLowerCase() === 'subscriptions' &&
    segments[2]?.toLowerCase() === subscriptionId.toLowerCase()
  );
};

const isReasonCode = (value: unknown): value is CapabilityReasonCode => typeof value === 'string' && REASON_CODES.has(value);

const isImmutableSourceGeneration = (value: unknown): value is ImmutableSourceGeneration => {
  if (!isRecord(value)) return false;
  if (
    !isLogicalArtifactRef(value.artifactRef) ||
    !isNonEmptyString(value.generationId) ||
    typeof value.sha256 !== 'string' ||
    !SHA256_PATTERN.test(value.sha256) ||
    !isPositiveInteger(value.schemaVersion) ||
    !isCanonicalIsoTimestamp(value.producedAt)
  ) {
    return false;
  }
  return value.completeThrough === undefined || isCanonicalIsoTimestamp(value.completeThrough);
};

const isScopeBinding = (value: unknown, ownership: CapabilityPassport['ownership']): value is CapabilityScopeBinding => {
  if (!isRecord(value) || value.provider !== ownership.provider || value.tenantId !== ownership.tenantId) return false;
  if (value.kind === 'tenant') return true;
  if (value.kind === 'billing-account') return isNonEmptyString(value.billingAccountId);
  if (value.kind === 'customer') return isNonEmptyString(value.customerId);
  if (value.kind === 'subscription') return value.subscriptionId === ownership.subscriptionId;
  return (
    value.kind === 'resource' &&
    value.subscriptionId === ownership.subscriptionId &&
    isSubscriptionBoundResourceId(value.normalizedResourceId, ownership.subscriptionId)
  );
};

const isAttempt = (value: unknown): value is CapabilityAttempt => {
  if (!isRecord(value)) return false;
  if (value.status === 'not-attempted') return isReasonCode(value.reasonCode);
  if (value.status !== 'attempted' || !isCanonicalIsoTimestamp(value.startedAt) || !isCanonicalIsoTimestamp(value.completedAt)) return false;
  if (Date.parse(value.completedAt) < Date.parse(value.startedAt) || typeof value.outcome !== 'string' || !ATTEMPT_OUTCOMES.has(value.outcome)) {
    return false;
  }
  return Array.isArray(value.reasonCodes) && value.reasonCodes.every(isReasonCode);
};

const isFreshness = (value: unknown): value is CapabilityFreshness => {
  if (!isRecord(value)) return false;
  if (value.status === 'unknown') return true;
  if ((value.status !== 'current' && value.status !== 'stale') || !isCanonicalIsoTimestamp(value.observedAt)) return false;
  if (value.completeThrough !== undefined && !isCanonicalIsoTimestamp(value.completeThrough)) return false;
  return value.status !== 'stale' || isNonEmptyString(value.maximumAge);
};

const isObservation = (value: unknown, ownership: CapabilityPassport['ownership']): value is CapabilityObservation => {
  if (!isRecord(value)) return false;
  if (!isNonEmptyString(value.observationId) || !isNonEmptyString(value.capability) || !isScopeBinding(value.scope, ownership)) return false;
  if (!isAttempt(value.attempt) || typeof value.providerSurfaceOutcome !== 'string' || !PROVIDER_OUTCOMES.has(value.providerSurfaceOutcome)) {
    return false;
  }
  if (typeof value.availability !== 'string' || !AVAILABILITY_VALUES.has(value.availability)) return false;
  if (typeof value.emptyEvidence !== 'string' || !EMPTY_EVIDENCE_VALUES.has(value.emptyEvidence) || !isFreshness(value.freshness)) return false;
  if (value.sourceGeneration !== undefined && !isImmutableSourceGeneration(value.sourceGeneration)) return false;
  if (value.coverageRef !== undefined && !isLogicalArtifactRef(value.coverageRef)) return false;
  if (value.emptyEvidence === 'complete-empty') {
    if (value.availability !== 'available' || value.attempt.status !== 'attempted' || value.attempt.outcome !== 'succeeded') return false;
  }
  if (value.limits !== undefined) {
    if (!isRecord(value.limits)) return false;
    if (value.limits.expectedPages !== undefined && !isNonNegativeInteger(value.limits.expectedPages)) return false;
    if (value.limits.receivedPages !== undefined && !isNonNegativeInteger(value.limits.receivedPages)) return false;
    if (value.limits.throttled !== undefined && typeof value.limits.throttled !== 'boolean') return false;
    if (value.limits.retainedLastKnownGood !== undefined && typeof value.limits.retainedLastKnownGood !== 'boolean') return false;
  }
  return true;
};

const isOwnership = (value: unknown): value is CapabilityPassport['ownership'] =>
  isArtifactOwnershipBinding(value) && 'subscriptionId' in value && isNonEmptyString(value.subscriptionId);

const isObservationSet = (value: unknown, ownership: CapabilityPassport['ownership']): value is CapabilityObservationSet => {
  if (!isRecord(value) || !isNonNegativeInteger(value.totalCount)) return false;
  if (value.mode === 'inline') {
    if (!Array.isArray(value.items) || value.items.length !== value.totalCount || !value.items.every(item => isObservation(item, ownership))) {
      return false;
    }
    const observationIds = value.items.map(item => (item as CapabilityObservation).observationId);
    return new Set(observationIds).size === observationIds.length;
  }
  if (
    value.mode !== 'sharded' ||
    !isNonNegativeInteger(value.shardCount) ||
    !isLogicalArtifactRef(value.indexRef) ||
    !Array.isArray(value.shards) ||
    value.shards.length !== value.shardCount
  ) {
    return false;
  }
  let total = 0;
  const refs = new Set<string>();
  for (const shard of value.shards) {
    if (
      !isRecord(shard) ||
      !isLogicalArtifactRef(shard.artifactRef) ||
      typeof shard.sha256 !== 'string' ||
      !SHA256_PATTERN.test(shard.sha256) ||
      !isPositiveInteger(shard.itemCount) ||
      refs.has(shard.artifactRef)
    ) {
      return false;
    }
    refs.add(shard.artifactRef);
    total += shard.itemCount;
  }
  return total === value.totalCount;
};

/** Dependency-free runtime rejection boundary for Capability Passport schema v1. */
export const isCapabilityPassport = (value: unknown): value is CapabilityPassport => {
  if (!isRecord(value) || value.schemaVersion !== CAPABILITY_PASSPORT_SCHEMA_VERSION) return false;
  if (!isNonEmptyString(value.passportId) || !isNonEmptyString(value.runId) || !isCanonicalIsoTimestamp(value.generatedAt)) return false;
  if (!isOwnership(value.ownership)) return false;
  if (!isRecord(value.agreementObservation)) return false;
  if (
    typeof value.agreementObservation.type !== 'string' ||
    !AGREEMENT_TYPES.has(value.agreementObservation.type) ||
    typeof value.agreementObservation.source !== 'string' ||
    !AGREEMENT_SOURCES.has(value.agreementObservation.source) ||
    (value.agreementObservation.sourceGeneration !== undefined && !isImmutableSourceGeneration(value.agreementObservation.sourceGeneration))
  ) {
    return false;
  }
  if (!isObservationSet(value.observations, value.ownership)) return false;
  if (!isRecord(value.producerVersions) || Object.keys(value.producerVersions).length === 0) return false;
  if (!Object.entries(value.producerVersions).every(([name, version]) => isNonEmptyString(name) && isNonEmptyString(version))) return false;
  if (
    !Array.isArray(value.issues) ||
    !value.issues.every(
      issue => isRecord(issue) && isReasonCode(issue.reasonCode) && (issue.observationId === undefined || isNonEmptyString(issue.observationId))
    )
  ) {
    return false;
  }

  if (value.observations.mode === 'inline') {
    const observationIds = new Set(value.observations.items.map(item => item.observationId));
    if (
      !value.issues.every(
        issue => issue.observationId === undefined || (isNonEmptyString(issue.observationId) && observationIds.has(issue.observationId))
      )
    ) {
      return false;
    }
  }
  return true;
};
