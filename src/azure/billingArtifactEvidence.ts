import {
  isArtifactPublicationDecision,
  type ArtifactClaimDependencyDecision,
  type ArtifactDependencyDescriptor,
  type ArtifactPublicationDecision,
} from '../common/artifactEvidence.js';

type CompletedArtifactPublicationDecision = Extract<ArtifactPublicationDecision, { publication: 'completed' }>;

export type BillingCompletedArtifactPublicationDecision = CompletedArtifactPublicationDecision & {
  dependencies: [ArtifactDependencyDescriptor, ...ArtifactDependencyDescriptor[]];
  claims: [ArtifactClaimDependencyDecision, ...ArtifactClaimDependencyDecision[]];
};

/** Validates the exact completed billing dependency and claim bound to one input generation. */
export const isBillingCompletedArtifactPublicationDecision = (
  value: unknown,
  generationId: string,
  inputManifestDigest: string
): value is BillingCompletedArtifactPublicationDecision => {
  if (!isArtifactPublicationDecision(value) || value.publication !== 'completed') return false;

  const billingDependencies = value.dependencies.filter(dependency => dependency.name === 'billing-history');
  const costAnalysisClaims = value.claims.filter(claim => claim.claimId === 'cost-analysis');
  if (billingDependencies.length !== 1 || costAnalysisClaims.length !== 1) return false;

  const billingHistory = billingDependencies[0];
  const costAnalysis = costAnalysisClaims[0];
  return (
    billingHistory.required &&
    billingHistory.publication === 'completed' &&
    billingHistory.generationId === generationId &&
    billingHistory.digest === inputManifestDigest &&
    costAnalysis.publication === 'completed' &&
    costAnalysis.requiredDependencies.includes('billing-history')
  );
};
