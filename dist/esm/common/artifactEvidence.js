import { hasValidOptionalArtifactRevisionComponents, isStrictLogicalArtifactReference } from './artifactEvidenceValidation.js';
const SUPPORT_VERDICTS = new Set(['supported', 'unsupported', 'unknown']);
const APPLICABILITY_VERDICTS = new Set(['applicable', 'not-applicable', 'unknown']);
const ATTEMPT_OUTCOMES = new Set([
    'not-attempted',
    'queued',
    'running',
    'succeeded',
    'failed',
    'cancelled',
    'timed-out',
    'dead-lettered',
    'superseded',
]);
const COVERAGE_VERDICTS = new Set(['complete', 'partial', 'none', 'unknown']);
const EMPTY_EVIDENCE_VERDICTS = new Set(['populated', 'complete-empty', 'not-observed', 'unknown']);
const FRESHNESS_VERDICTS = new Set(['current', 'stale', 'expired', 'unknown']);
const EVIDENCE_VERDICTS = new Set(['complete', 'partial', 'insufficient', 'conflicting']);
const PROCESSING_LIFECYCLES = new Set(['queued', 'running', 'succeeded', 'failed', 'cancelled', 'timed-out', 'dead-lettered', 'superseded']);
const PUBLICATION_VERDICTS = new Set(['completed', 'partial', 'suppressed', 'superseded', 'quarantined']);
const PROVIDERS = new Set(['azure', 'aws']);
const DATE_BASES = new Set(['utc', 'billing-calendar', 'company-local']);
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0;
const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;
const isStringIn = (value, values) => typeof value === 'string' && values.has(value);
const isCanonicalIsoTimestamp = (value) => {
    if (!isNonEmptyString(value))
        return false;
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
};
const isArtifactDecisionIssue = (value) => isRecord(value) &&
    isNonEmptyString(value.code) &&
    typeof value.blocking === 'boolean' &&
    (value.dependency === undefined || isNonEmptyString(value.dependency));
const isObservedRange = (value) => {
    if (!isRecord(value) ||
        !isCanonicalIsoTimestamp(value.fromInclusive) ||
        !isCanonicalIsoTimestamp(value.throughExclusive) ||
        Date.parse(value.throughExclusive) <= Date.parse(value.fromInclusive) ||
        !isStringIn(value.dateBasis, DATE_BASES)) {
        return false;
    }
    return value.timeZone === undefined || isNonEmptyString(value.timeZone);
};
const isArtifactDependencyDescriptor = (value) => {
    if (!isRecord(value) ||
        !isNonEmptyString(value.name) ||
        typeof value.required !== 'boolean' ||
        !isStringIn(value.support, SUPPORT_VERDICTS) ||
        !isStringIn(value.applicability, APPLICABILITY_VERDICTS) ||
        !isStringIn(value.attempt, ATTEMPT_OUTCOMES) ||
        !isStringIn(value.coverage, COVERAGE_VERDICTS) ||
        !isStringIn(value.emptyEvidence, EMPTY_EVIDENCE_VERDICTS) ||
        !isStringIn(value.freshness, FRESHNESS_VERDICTS) ||
        !isStringIn(value.evidence, EVIDENCE_VERDICTS) ||
        !isStringIn(value.publication, PUBLICATION_VERDICTS)) {
        return false;
    }
    if (value.generationId !== undefined && !isNonEmptyString(value.generationId))
        return false;
    if (value.digest !== undefined && (typeof value.digest !== 'string' || !SHA256_PATTERN.test(value.digest)))
        return false;
    if (!hasValidOptionalArtifactRevisionComponents(value))
        return false;
    if (value.observedRange !== undefined && !isObservedRange(value.observedRange))
        return false;
    if (value.completeThrough !== undefined && !isCanonicalIsoTimestamp(value.completeThrough))
        return false;
    if (value.reasonCode !== undefined && !isNonEmptyString(value.reasonCode))
        return false;
    if (value.acceptedRowCount !== undefined && !isNonNegativeInteger(value.acceptedRowCount))
        return false;
    if (value.emptyEvidence === 'complete-empty') {
        if (value.attempt !== 'succeeded' ||
            value.coverage !== 'complete' ||
            value.acceptedRowCount !== 0 ||
            !isStrictLogicalArtifactReference(value.emptyProofRef)) {
            return false;
        }
    }
    else if (value.emptyProofRef !== undefined) {
        return false;
    }
    if (value.publication === 'completed') {
        return (value.support === 'supported' &&
            value.applicability === 'applicable' &&
            value.attempt === 'succeeded' &&
            value.coverage === 'complete' &&
            (value.emptyEvidence === 'populated' || value.emptyEvidence === 'complete-empty') &&
            value.evidence === 'complete');
    }
    return true;
};
const isArtifactClaimDependencyDecision = (value) => {
    if (!isRecord(value) ||
        !isNonEmptyString(value.claimId) ||
        !Array.isArray(value.sectionPaths) ||
        !value.sectionPaths.every(isNonEmptyString) ||
        !Array.isArray(value.requiredDependencies) ||
        !value.requiredDependencies.every(isNonEmptyString) ||
        !isStringIn(value.evidence, EVIDENCE_VERDICTS) ||
        !isStringIn(value.publication, PUBLICATION_VERDICTS) ||
        !Array.isArray(value.issues) ||
        !value.issues.every(isArtifactDecisionIssue)) {
        return false;
    }
    return value.publication !== 'completed' || (value.evidence === 'complete' && !value.issues.some(issue => issue.blocking));
};
const hasUniqueValues = (values) => new Set(values).size === values.length;
/** Dependency-free runtime rejection boundary for provider-neutral publication decisions. */
export const isArtifactPublicationDecision = (value) => {
    if (!isRecord(value) ||
        !isStringIn(value.processing, PROCESSING_LIFECYCLES) ||
        !isStringIn(value.evidence, EVIDENCE_VERDICTS) ||
        !isStringIn(value.publication, PUBLICATION_VERDICTS) ||
        !Array.isArray(value.dependencies) ||
        !value.dependencies.every(isArtifactDependencyDescriptor) ||
        !Array.isArray(value.claims) ||
        !value.claims.every(isArtifactClaimDependencyDecision) ||
        !Array.isArray(value.issues) ||
        !value.issues.every(isArtifactDecisionIssue)) {
        return false;
    }
    const dependencyNames = value.dependencies.map(dependency => dependency.name);
    const claimIds = value.claims.map(claim => claim.claimId);
    if (!hasUniqueValues(dependencyNames) || !hasUniqueValues(claimIds))
        return false;
    if (!value.claims.every(claim => hasUniqueValues(claim.requiredDependencies)))
        return false;
    if (value.publication !== 'completed')
        return true;
    const completedDependencies = new Set(value.dependencies.filter(dependency => dependency.publication === 'completed').map(dependency => dependency.name));
    return (value.processing === 'succeeded' &&
        (value.evidence === 'complete' || value.evidence === 'partial') &&
        value.dependencies.every(dependency => !dependency.required || dependency.publication === 'completed') &&
        value.claims.every(claim => claim.publication === 'completed' && claim.requiredDependencies.every(dependency => completedDependencies.has(dependency))) &&
        !value.issues.some(issue => issue.blocking));
};
/** Checks the provider-neutral ownership shape used by observe- and enforce-mode artifacts. */
export const isArtifactOwnershipBinding = (value) => isRecord(value) &&
    isStringIn(value.provider, PROVIDERS) &&
    isNonEmptyString(value.tenantId) &&
    isNonEmptyString(value.companyId) &&
    isNonEmptyString(value.cloudAccountId) &&
    isNonEmptyString(value.accountId) &&
    (value.ownershipEpochRevision === undefined || isPositiveInteger(value.ownershipEpochRevision));
/** Checks that an ownership binding is valid for enforce-mode publication. */
export const isEnforceableArtifactOwnershipBinding = (value) => isArtifactOwnershipBinding(value) && value.ownershipEpochRevision !== undefined;
/**
 * Compares ownership first, then source and policy revisions component-wise.
 * Callers must validate both vectors before comparison; this function deliberately compares the supplied values without adding a second validation policy.
 */
export const compareArtifactRevisionVector = (left, right) => {
    if (left.ownershipEpochRevision === undefined || right.ownershipEpochRevision === undefined)
        return 'unenforceable';
    if (left.ownershipEpochRevision > right.ownershipEpochRevision)
        return 'newer-ownership';
    if (left.ownershipEpochRevision < right.ownershipEpochRevision)
        return 'older-ownership';
    const sourceComparison = Math.sign(left.sourceRevision - right.sourceRevision);
    const policyComparison = Math.sign(left.policyRevision - right.policyRevision);
    if (sourceComparison === 0 && policyComparison === 0)
        return 'equal';
    if (sourceComparison >= 0 && policyComparison >= 0)
        return 'newer';
    if (sourceComparison <= 0 && policyComparison <= 0)
        return 'older';
    return 'incomparable';
};
