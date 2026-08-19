import type { ArtifactProvider } from './artifactGeneration.js';
export type ArtifactSupportVerdict = 'supported' | 'unsupported' | 'unknown';
export type ArtifactApplicabilityVerdict = 'applicable' | 'not-applicable' | 'unknown';
export type ArtifactAttemptOutcome = 'not-attempted' | 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled' | 'timed-out' | 'dead-lettered' | 'superseded';
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
type ArtifactNonBlockingDecisionIssue = ArtifactDecisionIssue & {
    blocking: false;
};
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
} & ({
    emptyEvidence: Exclude<ArtifactEmptyEvidenceVerdict, 'complete-empty'>;
    acceptedRowCount?: number;
    emptyProofRef?: never;
} | {
    attempt: 'succeeded';
    coverage: 'complete';
    emptyEvidence: 'complete-empty';
    acceptedRowCount: 0;
    emptyProofRef: string;
});
export type ArtifactDependencyDescriptor = ArtifactPopulatedCompletedDependency | ArtifactCompleteEmptyCompletedDependency | ArtifactUnpublishedDependency;
interface ArtifactClaimDependencyDecisionBase<Issue extends ArtifactDecisionIssue = ArtifactDecisionIssue> {
    claimId: string;
    sectionPaths: string[];
    requiredDependencies: string[];
    issues: Issue[];
}
export type ArtifactClaimDependencyDecision = (ArtifactClaimDependencyDecisionBase<ArtifactNonBlockingDecisionIssue> & {
    evidence: 'complete';
    publication: 'completed';
}) | (ArtifactClaimDependencyDecisionBase & {
    evidence: ArtifactEvidenceVerdict;
    publication: Exclude<ArtifactPublicationVerdict, 'completed'>;
});
type ArtifactCompletedDependency = Extract<ArtifactDependencyDescriptor, {
    publication: 'completed';
}>;
type ArtifactIncompleteDependency = Exclude<ArtifactDependencyDescriptor, ArtifactCompletedDependency>;
type ArtifactCompletedDecisionDependency = ArtifactCompletedDependency | (ArtifactIncompleteDependency & {
    required: false;
});
type ArtifactCompletedClaimDependencyDecision = Extract<ArtifactClaimDependencyDecision, {
    publication: 'completed';
}>;
interface ArtifactPublicationDecisionBase<Dependency extends ArtifactDependencyDescriptor = ArtifactDependencyDescriptor, Claim extends ArtifactClaimDependencyDecision = ArtifactClaimDependencyDecision, Issue extends ArtifactDecisionIssue = ArtifactDecisionIssue> {
    evidence: ArtifactEvidenceVerdict;
    dependencies: Dependency[];
    claims: Claim[];
    issues: Issue[];
}
export type ArtifactPublicationDecision = (ArtifactPublicationDecisionBase<ArtifactCompletedDecisionDependency, ArtifactCompletedClaimDependencyDecision, ArtifactNonBlockingDecisionIssue> & {
    processing: 'succeeded';
    evidence: 'complete' | 'partial';
    publication: 'completed';
}) | (ArtifactPublicationDecisionBase & {
    processing: ArtifactProcessingLifecycle;
    publication: Exclude<ArtifactPublicationVerdict, 'completed'>;
});
/** Dependency-free runtime rejection boundary for provider-neutral publication decisions. */
export declare const isArtifactPublicationDecision: (value: unknown) => value is ArtifactPublicationDecision;
/** Checks the provider-neutral ownership shape used by observe- and enforce-mode artifacts. */
export declare const isArtifactOwnershipBinding: (value: unknown) => value is ArtifactOwnershipBinding;
/** Checks that an ownership binding is valid for enforce-mode publication. */
export declare const isEnforceableArtifactOwnershipBinding: (value: unknown) => value is ArtifactOwnershipBinding & {
    ownershipEpochRevision: number;
};
/**
 * Compares ownership first, then source and policy revisions component-wise.
 * Callers must validate both vectors before comparison; this function deliberately compares the supplied values without adding a second validation policy.
 */
export declare const compareArtifactRevisionVector: (left: ArtifactRevisionVector, right: ArtifactRevisionVector) => ArtifactRevisionComparison;
export type EpochFreeArtifactRevisionComparison = 'newer' | 'equal' | 'older' | 'incomparable';
/**
 * Compares latest epoch-free authority revisions under a fixed policy revision.
 * A policy mismatch is intentionally incomparable so a policy rollout cannot
 * silently reuse source ordering without a separate contract decision.
 */
export declare const compareEpochFreeArtifactRevisionVector: (left: ArtifactRevisionVector, right: ArtifactRevisionVector) => EpochFreeArtifactRevisionComparison;
export {};
//# sourceMappingURL=artifactEvidence.d.ts.map