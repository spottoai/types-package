import { isArtifactOwnershipBinding, } from './artifactEvidence.js';
export const CAPABILITY_PASSPORT_SCHEMA_VERSION = 1;
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
];
const REASON_CODES = new Set(CAPABILITY_REASON_CODES);
const AGREEMENT_TYPES = new Set(['EA', 'MCA', 'CSP', 'PAYG-MOSP', 'sponsored-trial', 'unknown']);
const AGREEMENT_SOURCES = new Set(['observed', 'configured', 'unknown']);
const AVAILABILITY_VALUES = new Set(['available', 'partial', 'missing', 'unavailable', 'unknown']);
const EMPTY_EVIDENCE_VALUES = new Set(['populated', 'complete-empty', 'not-observed', 'unknown']);
const PROVIDER_OUTCOMES = new Set(['accepted', 'authoritatively-unsupported', 'unknown']);
const ATTEMPT_OUTCOMES = new Set(['succeeded', 'failed', 'partial']);
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0;
const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;
const isCanonicalIsoTimestamp = (value) => {
    if (!isNonEmptyString(value))
        return false;
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
};
const isLogicalArtifactRef = (value) => {
    if (!isNonEmptyString(value) || value.startsWith('/') || value.includes('://') || value.includes('?') || value.includes('#'))
        return false;
    if (value.includes('\\'))
        return false;
    const segments = value.split('/');
    return segments.length >= 2 && segments.every(segment => segment.length > 0 && segment !== '.' && segment !== '..');
};
const isSubscriptionBoundResourceId = (value, subscriptionId) => {
    if (!isNonEmptyString(value))
        return false;
    const segments = value.split('/');
    return (segments.length >= 4 &&
        segments[0] === '' &&
        segments[1]?.toLowerCase() === 'subscriptions' &&
        segments[2]?.toLowerCase() === subscriptionId.toLowerCase());
};
const isReasonCode = (value) => typeof value === 'string' && REASON_CODES.has(value);
const isImmutableSourceGeneration = (value) => {
    if (!isRecord(value))
        return false;
    if (!isLogicalArtifactRef(value.artifactRef) ||
        !isNonEmptyString(value.generationId) ||
        typeof value.sha256 !== 'string' ||
        !SHA256_PATTERN.test(value.sha256) ||
        !isPositiveInteger(value.schemaVersion) ||
        !isCanonicalIsoTimestamp(value.producedAt)) {
        return false;
    }
    return value.completeThrough === undefined || isCanonicalIsoTimestamp(value.completeThrough);
};
const isScopeBinding = (value, ownership) => {
    if (!isRecord(value) || value.provider !== ownership.provider || value.tenantId !== ownership.tenantId)
        return false;
    if (value.kind === 'tenant')
        return true;
    if (value.kind === 'billing-account')
        return isNonEmptyString(value.billingAccountId);
    if (value.kind === 'customer')
        return isNonEmptyString(value.customerId);
    if (value.kind === 'subscription')
        return value.subscriptionId === ownership.subscriptionId;
    return (value.kind === 'resource' &&
        value.subscriptionId === ownership.subscriptionId &&
        isSubscriptionBoundResourceId(value.normalizedResourceId, ownership.subscriptionId));
};
const isAttempt = (value) => {
    if (!isRecord(value))
        return false;
    if (value.status === 'not-attempted')
        return isReasonCode(value.reasonCode);
    if (value.status !== 'attempted' || !isCanonicalIsoTimestamp(value.startedAt) || !isCanonicalIsoTimestamp(value.completedAt))
        return false;
    if (Date.parse(value.completedAt) < Date.parse(value.startedAt) || typeof value.outcome !== 'string' || !ATTEMPT_OUTCOMES.has(value.outcome)) {
        return false;
    }
    return Array.isArray(value.reasonCodes) && value.reasonCodes.every(isReasonCode);
};
const isFreshness = (value) => {
    if (!isRecord(value))
        return false;
    if (value.status === 'unknown')
        return true;
    if ((value.status !== 'current' && value.status !== 'stale') || !isCanonicalIsoTimestamp(value.observedAt))
        return false;
    if (value.completeThrough !== undefined && !isCanonicalIsoTimestamp(value.completeThrough))
        return false;
    return value.status !== 'stale' || isNonEmptyString(value.maximumAge);
};
const isObservation = (value, ownership) => {
    if (!isRecord(value))
        return false;
    if (!isNonEmptyString(value.observationId) || !isNonEmptyString(value.capability) || !isScopeBinding(value.scope, ownership))
        return false;
    if (!isAttempt(value.attempt) || typeof value.providerSurfaceOutcome !== 'string' || !PROVIDER_OUTCOMES.has(value.providerSurfaceOutcome)) {
        return false;
    }
    if (typeof value.availability !== 'string' || !AVAILABILITY_VALUES.has(value.availability))
        return false;
    if (typeof value.emptyEvidence !== 'string' || !EMPTY_EVIDENCE_VALUES.has(value.emptyEvidence) || !isFreshness(value.freshness))
        return false;
    if (value.sourceGeneration !== undefined && !isImmutableSourceGeneration(value.sourceGeneration))
        return false;
    if (value.coverageRef !== undefined && !isLogicalArtifactRef(value.coverageRef))
        return false;
    if (value.emptyEvidence === 'complete-empty') {
        if (value.availability !== 'available' || value.attempt.status !== 'attempted' || value.attempt.outcome !== 'succeeded')
            return false;
    }
    if (value.limits !== undefined) {
        if (!isRecord(value.limits))
            return false;
        if (value.limits.expectedPages !== undefined && !isNonNegativeInteger(value.limits.expectedPages))
            return false;
        if (value.limits.receivedPages !== undefined && !isNonNegativeInteger(value.limits.receivedPages))
            return false;
        if (value.limits.throttled !== undefined && typeof value.limits.throttled !== 'boolean')
            return false;
        if (value.limits.retainedLastKnownGood !== undefined && typeof value.limits.retainedLastKnownGood !== 'boolean')
            return false;
    }
    return true;
};
const isOwnership = (value) => isArtifactOwnershipBinding(value) && 'subscriptionId' in value && isNonEmptyString(value.subscriptionId);
const isObservationSet = (value, ownership) => {
    if (!isRecord(value) || !isNonNegativeInteger(value.totalCount))
        return false;
    if (value.mode === 'inline') {
        if (!Array.isArray(value.items) || value.items.length !== value.totalCount || !value.items.every(item => isObservation(item, ownership))) {
            return false;
        }
        const observationIds = value.items.map(item => item.observationId);
        return new Set(observationIds).size === observationIds.length;
    }
    if (value.mode !== 'sharded' ||
        !isNonNegativeInteger(value.shardCount) ||
        !isLogicalArtifactRef(value.indexRef) ||
        !Array.isArray(value.shards) ||
        value.shards.length !== value.shardCount) {
        return false;
    }
    let total = 0;
    const refs = new Set();
    for (const shard of value.shards) {
        if (!isRecord(shard) ||
            !isLogicalArtifactRef(shard.artifactRef) ||
            typeof shard.sha256 !== 'string' ||
            !SHA256_PATTERN.test(shard.sha256) ||
            !isPositiveInteger(shard.itemCount) ||
            refs.has(shard.artifactRef)) {
            return false;
        }
        refs.add(shard.artifactRef);
        total += shard.itemCount;
    }
    return total === value.totalCount;
};
/** Dependency-free runtime rejection boundary for Capability Passport schema v1. */
export const isCapabilityPassport = (value) => {
    if (!isRecord(value) || value.schemaVersion !== CAPABILITY_PASSPORT_SCHEMA_VERSION)
        return false;
    if (!isNonEmptyString(value.passportId) || !isNonEmptyString(value.runId) || !isCanonicalIsoTimestamp(value.generatedAt))
        return false;
    if (!isOwnership(value.ownership))
        return false;
    if (!isRecord(value.agreementObservation))
        return false;
    if (typeof value.agreementObservation.type !== 'string' ||
        !AGREEMENT_TYPES.has(value.agreementObservation.type) ||
        typeof value.agreementObservation.source !== 'string' ||
        !AGREEMENT_SOURCES.has(value.agreementObservation.source) ||
        (value.agreementObservation.sourceGeneration !== undefined && !isImmutableSourceGeneration(value.agreementObservation.sourceGeneration))) {
        return false;
    }
    if (!isObservationSet(value.observations, value.ownership))
        return false;
    if (!isRecord(value.producerVersions) || Object.keys(value.producerVersions).length === 0)
        return false;
    if (!Object.entries(value.producerVersions).every(([name, version]) => isNonEmptyString(name) && isNonEmptyString(version)))
        return false;
    if (!Array.isArray(value.issues) ||
        !value.issues.every(issue => isRecord(issue) && isReasonCode(issue.reasonCode) && (issue.observationId === undefined || isNonEmptyString(issue.observationId)))) {
        return false;
    }
    if (value.observations.mode === 'inline') {
        const observationIds = new Set(value.observations.items.map(item => item.observationId));
        if (!value.issues.every(issue => issue.observationId === undefined || (isNonEmptyString(issue.observationId) && observationIds.has(issue.observationId)))) {
            return false;
        }
    }
    return true;
};
