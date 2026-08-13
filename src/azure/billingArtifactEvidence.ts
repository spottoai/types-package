import {
  isArtifactPublicationDecision,
  type ArtifactClaimDependencyDecision,
  type ArtifactDependencyDescriptor,
  type ArtifactPublicationDecision,
} from '../common/artifactEvidence.js';

type CompletedArtifactPublicationDecision = Extract<ArtifactPublicationDecision, { publication: 'completed' }>;
type BillingHistoryCompletedArtifactDependency = Extract<ArtifactDependencyDescriptor, { publication: 'completed' }> & {
  name: 'billing-history';
  required: true;
  generationId: string;
  digest: string;
};
type CostAnalysisCompletedArtifactClaim = Extract<ArtifactClaimDependencyDecision, { publication: 'completed' }> & {
  claimId: 'cost-analysis';
  requiredDependencies: ['billing-history', ...string[]];
};

export type BillingCompletedArtifactPublicationDecision = CompletedArtifactPublicationDecision & {
  dependencies: [BillingHistoryCompletedArtifactDependency, ...CompletedArtifactPublicationDecision['dependencies']];
  claims: [CostAnalysisCompletedArtifactClaim, ...CompletedArtifactPublicationDecision['claims']];
};

/** Validates the exact completed billing dependency and claim bound to one input generation. */
export const isBillingCompletedArtifactPublicationDecision = (
  value: unknown,
  generationId: string,
  inputManifestDigest: string
): value is BillingCompletedArtifactPublicationDecision => {
  if (!isArtifactPublicationDecision(value) || value.publication !== 'completed') return false;

  const billingHistory = value.dependencies[0];
  const costAnalysis = value.claims[0];
  return (
    billingHistory?.name === 'billing-history' &&
    billingHistory.required === true &&
    billingHistory.publication === 'completed' &&
    billingHistory.generationId === generationId &&
    billingHistory.digest === inputManifestDigest &&
    costAnalysis?.claimId === 'cost-analysis' &&
    costAnalysis.publication === 'completed' &&
    costAnalysis.requiredDependencies[0] === 'billing-history'
  );
};
