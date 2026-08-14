import { type ArtifactClaimDependencyDecision, type ArtifactDependencyDescriptor, type ArtifactPublicationDecision } from '../common/artifactEvidence.js';
type CompletedArtifactPublicationDecision = Extract<ArtifactPublicationDecision, {
    publication: 'completed';
}>;
type BillingHistoryCompletedArtifactDependency = Extract<ArtifactDependencyDescriptor, {
    publication: 'completed';
}> & {
    name: 'billing-history';
    required: true;
    generationId: string;
    digest: string;
};
type CostAnalysisCompletedArtifactClaim = Extract<ArtifactClaimDependencyDecision, {
    publication: 'completed';
}> & {
    claimId: 'cost-analysis';
    requiredDependencies: ['billing-history', ...string[]];
};
type CostAnalysisArtifactClaim = ArtifactClaimDependencyDecision & {
    claimId: 'cost-analysis';
    requiredDependencies: ['billing-history', ...string[]];
};
export type BillingCompletedArtifactPublicationDecision = CompletedArtifactPublicationDecision & {
    dependencies: [BillingHistoryCompletedArtifactDependency, ...CompletedArtifactPublicationDecision['dependencies']];
    claims: [CostAnalysisCompletedArtifactClaim, ...CompletedArtifactPublicationDecision['claims']];
};
export type BillingPartialArtifactPublicationDecision = ArtifactPublicationDecision & {
    evidence: 'partial';
    publication: 'completed' | 'partial';
    dependencies: [BillingHistoryCompletedArtifactDependency, ...ArtifactPublicationDecision['dependencies']];
    claims: [CostAnalysisArtifactClaim, ...ArtifactPublicationDecision['claims']];
};
export type BillingArtifactPublicationDecision = BillingCompletedArtifactPublicationDecision | BillingPartialArtifactPublicationDecision;
/** Validates the exact completed billing dependency and claim bound to one input generation. */
export declare const isBillingCompletedArtifactPublicationDecision: (value: unknown, generationId: string, inputManifestDigest: string) => value is BillingCompletedArtifactPublicationDecision;
/** Validates partial billing evidence bound to one authoritative input generation. */
export declare const isBillingPartialArtifactPublicationDecision: (value: unknown, generationId: string, inputManifestDigest: string) => value is BillingPartialArtifactPublicationDecision;
export {};
//# sourceMappingURL=billingArtifactEvidence.d.ts.map