import type { ArtifactProvider } from './artifactGeneration.js';
import { hasValidOptionalArtifactRevisionComponents, isStrictLogicalArtifactReference } from './artifactEvidenceValidation.js';

export type ArtifactSupportVerdict = 'supported' | 'unsupported' | 'unknown';

export type ArtifactApplicabilityVerdict = 'applicable' | 'not-applicable' | 'unknown';

export type ArtifactAttemptOutcome =
  | 'not-attempted'
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'timed-out'
  | 'dead-lettered'
  | 'superseded';

export type ArtifactCoverageVerdict = 'complete' | 'partial' | 'none' | 'unknown';

export type ArtifactEmptyEvidenceVerdict = 'populated' | 'complete-empty' | 'not-observed' | 'unknown';

export type ArtifactFreshnessVerdict = 'current' | 'stale' | 'expired' | 'unknown';

export type ArtifactEvidenceVerdict = 'complete' | 'partial' | 'insufficient' | 'conflicting';

export type ArtifactProcessingLifecycle = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled' | 'timed-out' | 'dead-lettered' | 'superseded';

export type ArtifactPublicationVerdict = 'completed' | 'partial' | 'suppressed' | 'superseded' | 'quarantined';

export type BillingArtifactReadState = 'current' | 'stale' | 'partial' | 'fallback' | 'suppressed' | 'unavailable' | 'complete-empty';

export interface ArtifactOwnershipBinding<Provider extends ArtifactProvider = ArtifactProvider> {
  provider: Provider;
  tenantId: string;
  companyId: string;
  cloudAccountId: string;
  accountId: string;
  ownershipEpochRevision?: number;
}

export interface ArtifactRevisionVector {
  ownershipEpochRevision?: number;
  sourceRevision: number;
  policyRevision: number;
}

export type ArtifactRevisionComparison = 'newer' | 'equal' | 'older' | 'incomparable' | 'newer-ownership' | 'older-ownership' | 'unenforceable';

interface ArtifactDecisionIssue {
  code: string;
  blocking: boolean;
  dependency?: string;
}

type ArtifactNonBlockingDecisionIssue = ArtifactDecisionIssue & { blocking: false };

export interface ArtifactObservedRange {
  fromInclusive: string;
  throughExclusive: string;
  dateBasis: 'utc' | 'billing-calendar' | 'company-local';
  timeZone?: string;
}

interface ArtifactDependencyBase {
  name: string;
  required: boolean;
  support: ArtifactSupportVerdict;
  applicability: ArtifactApplicabilityVerdict;
  freshness: ArtifactFreshnessVerdict;
  generationId?: string;
  digest?: string;
  sourceRevision?: number;
  policyRevision?: number;
  observedRange?: ArtifactObservedRange;
  completeThrough?: string;
  reasonCode?: string;
}

type ArtifactPopulatedCompletedDependency = ArtifactDependencyBase & {
  support: 'supported';
  applicability: 'applicable';
  attempt: 'succeeded';
  coverage: 'complete';
  emptyEvidence: 'populated';
  evidence: 'complete';
  publication: 'completed';
  acceptedRowCount?: number;
  emptyProofRef?: never;
};

type ArtifactCompleteEmptyCompletedDependency = ArtifactDependencyBase & {
  support: 'supported';
  applicability: 'applicable';
  attempt: 'succeeded';
  coverage: 'complete';
  emptyEvidence: 'complete-empty';
  evidence: 'complete';
  publication: 'completed';
  acceptedRowCount: 0;
  emptyProofRef: string;
};

type ArtifactUnpublishedDependency = ArtifactDependencyBase & {
  attempt: ArtifactAttemptOutcome;
  coverage: ArtifactCoverageVerdict;
  evidence: ArtifactEvidenceVerdict;
  publication: Exclude<ArtifactPublicationVerdict, 'completed'>;
} & (
    | {
        emptyEvidence: Exclude<ArtifactEmptyEvidenceVerdict, 'complete-empty'>;
        acceptedRowCount?: number;
        emptyProofRef?: never;
      }
    | {
        attempt: 'succeeded';
        coverage: 'complete';
        emptyEvidence: 'complete-empty';
        acceptedRowCount: 0;
        emptyProofRef: string;
      }
  );

export type ArtifactDependencyDescriptor =
  | ArtifactPopulatedCompletedDependency
  | ArtifactCompleteEmptyCompletedDependency
  | ArtifactUnpublishedDependency;

interface ArtifactClaimDependencyDecisionBase<Issue extends ArtifactDecisionIssue = ArtifactDecisionIssue> {
  claimId: string;
  sectionPaths: string[];
  requiredDependencies: string[];
  issues: Issue[];
}

export type ArtifactClaimDependencyDecision =
  | (ArtifactClaimDependencyDecisionBase<ArtifactNonBlockingDecisionIssue> & {
      evidence: 'complete';
      publication: 'completed';
    })
  | (ArtifactClaimDependencyDecisionBase & {
      evidence: ArtifactEvidenceVerdict;
      publication: Exclude<ArtifactPublicationVerdict, 'completed'>;
    });

type ArtifactCompletedDependency = Extract<ArtifactDependencyDescriptor, { publication: 'completed' }>;
type ArtifactIncompleteDependency = Exclude<ArtifactDependencyDescriptor, ArtifactCompletedDependency>;
type ArtifactCompletedDecisionDependency = ArtifactCompletedDependency | (ArtifactIncompleteDependency & { required: false });
type ArtifactCompletedClaimDependencyDecision = Extract<ArtifactClaimDependencyDecision, { publication: 'completed' }>;

interface ArtifactPublicationDecisionBase<
  Dependency extends ArtifactDependencyDescriptor = ArtifactDependencyDescriptor,
  Claim extends ArtifactClaimDependencyDecision = ArtifactClaimDependencyDecision,
  Issue extends ArtifactDecisionIssue = ArtifactDecisionIssue,
> {
  evidence: ArtifactEvidenceVerdict;
  dependencies: Dependency[];
  claims: Claim[];
  issues: Issue[];
}

export type ArtifactPublicationDecision =
  | (ArtifactPublicationDecisionBase<
      ArtifactCompletedDecisionDependency,
      ArtifactCompletedClaimDependencyDecision,
      ArtifactNonBlockingDecisionIssue
    > & {
      processing: 'succeeded';
      evidence: 'complete' | 'partial';
      publication: 'completed';
    })
  | (ArtifactPublicationDecisionBase & {
      processing: ArtifactProcessingLifecycle;
      publication: Exclude<ArtifactPublicationVerdict, 'completed'>;
    });

const SUPPORT_VERDICTS = new Set<string>(['supported', 'unsupported', 'unknown']);
const APPLICABILITY_VERDICTS = new Set<string>(['applicable', 'not-applicable', 'unknown']);
const ATTEMPT_OUTCOMES = new Set<string>([
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
const COVERAGE_VERDICTS = new Set<string>(['complete', 'partial', 'none', 'unknown']);
const EMPTY_EVIDENCE_VERDICTS = new Set<string>(['populated', 'complete-empty', 'not-observed', 'unknown']);
const FRESHNESS_VERDICTS = new Set<string>(['current', 'stale', 'expired', 'unknown']);
const EVIDENCE_VERDICTS = new Set<string>(['complete', 'partial', 'insufficient', 'conflicting']);
const PROCESSING_LIFECYCLES = new Set<string>(['queued', 'running', 'succeeded', 'failed', 'cancelled', 'timed-out', 'dead-lettered', 'superseded']);
const PUBLICATION_VERDICTS = new Set<string>(['completed', 'partial', 'suppressed', 'superseded', 'quarantined']);
const PROVIDERS = new Set<string>(['azure', 'aws']);
const DATE_BASES = new Set<string>(['utc', 'billing-calendar', 'company-local']);
const SHA256_PATTERN = /^[a-f0-9]{64}$/;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const isNonNegativeInteger = (value: unknown): value is number => Number.isInteger(value) && (value as number) >= 0;
const isPositiveInteger = (value: unknown): value is number => Number.isInteger(value) && (value as number) > 0;
const isStringIn = (value: unknown, values: Set<string>): value is string => typeof value === 'string' && values.has(value);

const isCanonicalIsoTimestamp = (value: unknown): value is string => {
  if (!isNonEmptyString(value)) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
};

const isArtifactDecisionIssue = (value: unknown): value is ArtifactDecisionIssue =>
  isRecord(value) &&
  isNonEmptyString(value.code) &&
  typeof value.blocking === 'boolean' &&
  (value.dependency === undefined || isNonEmptyString(value.dependency));

const isObservedRange = (value: unknown): value is ArtifactObservedRange => {
  if (
    !isRecord(value) ||
    !isCanonicalIsoTimestamp(value.fromInclusive) ||
    !isCanonicalIsoTimestamp(value.throughExclusive) ||
    Date.parse(value.throughExclusive) <= Date.parse(value.fromInclusive) ||
    !isStringIn(value.dateBasis, DATE_BASES)
  ) {
    return false;
  }
  return value.timeZone === undefined || isNonEmptyString(value.timeZone);
};

const isArtifactDependencyDescriptor = (value: unknown): value is ArtifactDependencyDescriptor => {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.name) ||
    typeof value.required !== 'boolean' ||
    !isStringIn(value.support, SUPPORT_VERDICTS) ||
    !isStringIn(value.applicability, APPLICABILITY_VERDICTS) ||
    !isStringIn(value.attempt, ATTEMPT_OUTCOMES) ||
    !isStringIn(value.coverage, COVERAGE_VERDICTS) ||
    !isStringIn(value.emptyEvidence, EMPTY_EVIDENCE_VERDICTS) ||
    !isStringIn(value.freshness, FRESHNESS_VERDICTS) ||
    !isStringIn(value.evidence, EVIDENCE_VERDICTS) ||
    !isStringIn(value.publication, PUBLICATION_VERDICTS)
  ) {
    return false;
  }
  if (value.generationId !== undefined && !isNonEmptyString(value.generationId)) return false;
  if (value.digest !== undefined && (typeof value.digest !== 'string' || !SHA256_PATTERN.test(value.digest))) return false;
  if (!hasValidOptionalArtifactRevisionComponents(value)) return false;
  if (value.observedRange !== undefined && !isObservedRange(value.observedRange)) return false;
  if (value.completeThrough !== undefined && !isCanonicalIsoTimestamp(value.completeThrough)) return false;
  if (value.reasonCode !== undefined && !isNonEmptyString(value.reasonCode)) return false;
  if (value.acceptedRowCount !== undefined && !isNonNegativeInteger(value.acceptedRowCount)) return false;

  if (value.emptyEvidence === 'complete-empty') {
    if (
      value.attempt !== 'succeeded' ||
      value.coverage !== 'complete' ||
      value.acceptedRowCount !== 0 ||
      !isStrictLogicalArtifactReference(value.emptyProofRef)
    ) {
      return false;
    }
  } else if (value.emptyProofRef !== undefined) {
    return false;
  }

  if (value.publication === 'completed') {
    return (
      value.support === 'supported' &&
      value.applicability === 'applicable' &&
      value.attempt === 'succeeded' &&
      value.coverage === 'complete' &&
      (value.emptyEvidence === 'populated' || value.emptyEvidence === 'complete-empty') &&
      value.evidence === 'complete'
    );
  }
  return true;
};

const isArtifactClaimDependencyDecision = (value: unknown): value is ArtifactClaimDependencyDecision => {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.claimId) ||
    !Array.isArray(value.sectionPaths) ||
    !value.sectionPaths.every(isNonEmptyString) ||
    !Array.isArray(value.requiredDependencies) ||
    !value.requiredDependencies.every(isNonEmptyString) ||
    !isStringIn(value.evidence, EVIDENCE_VERDICTS) ||
    !isStringIn(value.publication, PUBLICATION_VERDICTS) ||
    !Array.isArray(value.issues) ||
    !value.issues.every(isArtifactDecisionIssue)
  ) {
    return false;
  }
  return value.publication !== 'completed' || (value.evidence === 'complete' && !value.issues.some(issue => issue.blocking));
};

const hasUniqueValues = (values: string[]): boolean => new Set(values).size === values.length;

/** Dependency-free runtime rejection boundary for provider-neutral publication decisions. */
export const isArtifactPublicationDecision = (value: unknown): value is ArtifactPublicationDecision => {
  if (
    !isRecord(value) ||
    !isStringIn(value.processing, PROCESSING_LIFECYCLES) ||
    !isStringIn(value.evidence, EVIDENCE_VERDICTS) ||
    !isStringIn(value.publication, PUBLICATION_VERDICTS) ||
    !Array.isArray(value.dependencies) ||
    !value.dependencies.every(isArtifactDependencyDescriptor) ||
    !Array.isArray(value.claims) ||
    !value.claims.every(isArtifactClaimDependencyDecision) ||
    !Array.isArray(value.issues) ||
    !value.issues.every(isArtifactDecisionIssue)
  ) {
    return false;
  }
  const dependencyNames = value.dependencies.map(dependency => dependency.name);
  const claimIds = value.claims.map(claim => claim.claimId);
  if (!hasUniqueValues(dependencyNames) || !hasUniqueValues(claimIds)) return false;
  if (!value.claims.every(claim => hasUniqueValues(claim.requiredDependencies))) return false;
  if (value.publication !== 'completed') return true;
  const completedDependencies = new Set(
    value.dependencies.filter(dependency => dependency.publication === 'completed').map(dependency => dependency.name)
  );
  return (
    value.processing === 'succeeded' &&
    (value.evidence === 'complete' || value.evidence === 'partial') &&
    value.dependencies.every(dependency => !dependency.required || dependency.publication === 'completed') &&
    value.claims.every(
      claim => claim.publication === 'completed' && claim.requiredDependencies.every(dependency => completedDependencies.has(dependency))
    ) &&
    !value.issues.some(issue => issue.blocking)
  );
};

/** Checks the provider-neutral ownership shape used by observe- and enforce-mode artifacts. */
export const isArtifactOwnershipBinding = (value: unknown): value is ArtifactOwnershipBinding =>
  isRecord(value) &&
  isStringIn(value.provider, PROVIDERS) &&
  isNonEmptyString(value.tenantId) &&
  isNonEmptyString(value.companyId) &&
  isNonEmptyString(value.cloudAccountId) &&
  isNonEmptyString(value.accountId) &&
  (value.ownershipEpochRevision === undefined || isPositiveInteger(value.ownershipEpochRevision));

/** Checks that an ownership binding is valid for enforce-mode publication. */
export const isEnforceableArtifactOwnershipBinding = (value: unknown): value is ArtifactOwnershipBinding & { ownershipEpochRevision: number } =>
  isArtifactOwnershipBinding(value) && value.ownershipEpochRevision !== undefined;

/**
 * Compares ownership first, then source and policy revisions component-wise.
 * Callers must validate both vectors before comparison; this function deliberately compares the supplied values without adding a second validation policy.
 */
export const compareArtifactRevisionVector = (left: ArtifactRevisionVector, right: ArtifactRevisionVector): ArtifactRevisionComparison => {
  if (left.ownershipEpochRevision === undefined || right.ownershipEpochRevision === undefined) return 'unenforceable';
  if (left.ownershipEpochRevision > right.ownershipEpochRevision) return 'newer-ownership';
  if (left.ownershipEpochRevision < right.ownershipEpochRevision) return 'older-ownership';

  const sourceComparison = Math.sign(left.sourceRevision - right.sourceRevision);
  const policyComparison = Math.sign(left.policyRevision - right.policyRevision);
  if (sourceComparison === 0 && policyComparison === 0) return 'equal';
  if (sourceComparison >= 0 && policyComparison >= 0) return 'newer';
  if (sourceComparison <= 0 && policyComparison <= 0) return 'older';
  return 'incomparable';
};

export type EpochFreeArtifactRevisionComparison = 'newer' | 'equal' | 'older' | 'incomparable';

/**
 * Compares latest epoch-free authority revisions under a fixed policy revision.
 * A policy mismatch is intentionally incomparable so a policy rollout cannot
 * silently reuse source ordering without a separate contract decision.
 */
export const compareEpochFreeArtifactRevisionVector = (
  left: ArtifactRevisionVector,
  right: ArtifactRevisionVector
): EpochFreeArtifactRevisionComparison => {
  if (left.ownershipEpochRevision !== undefined || right.ownershipEpochRevision !== undefined) return 'incomparable';
  if (
    !Number.isSafeInteger(left.sourceRevision) ||
    left.sourceRevision < 1 ||
    !Number.isSafeInteger(right.sourceRevision) ||
    right.sourceRevision < 1 ||
    !Number.isSafeInteger(left.policyRevision) ||
    left.policyRevision < 1 ||
    !Number.isSafeInteger(right.policyRevision) ||
    right.policyRevision < 1 ||
    left.policyRevision !== right.policyRevision
  ) {
    return 'incomparable';
  }
  if (left.sourceRevision > right.sourceRevision) return 'newer';
  if (left.sourceRevision < right.sourceRevision) return 'older';
  return 'equal';
};
