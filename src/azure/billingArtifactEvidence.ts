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

const hasBillingArtifactAuthority = (value: ArtifactPublicationDecision, generationId: string, inputManifestDigest: string): boolean => {
  const billingHistory = value.dependencies[0];
  const costAnalysis = value.claims[0];
  return (
    billingHistory?.name === 'billing-history' &&
    billingHistory.required === true &&
    billingHistory.publication === 'completed' &&
    billingHistory.generationId === generationId &&
    billingHistory.digest === inputManifestDigest &&
    costAnalysis?.claimId === 'cost-analysis' &&
    costAnalysis.requiredDependencies[0] === 'billing-history'
  );
};

/** Validates the exact completed billing dependency and claim bound to one input generation. */
export const isBillingCompletedArtifactPublicationDecision = (
  value: unknown,
  generationId: string,
  inputManifestDigest: string
): value is BillingCompletedArtifactPublicationDecision => {
  if (!isArtifactPublicationDecision(value) || value.publication !== 'completed') return false;
  return value.claims[0]?.publication === 'completed' && hasBillingArtifactAuthority(value, generationId, inputManifestDigest);
};

/** Validates partial billing evidence bound to one authoritative input generation. */
export const isBillingPartialArtifactPublicationDecision = (
  value: unknown,
  generationId: string,
  inputManifestDigest: string
): value is BillingPartialArtifactPublicationDecision =>
  isArtifactPublicationDecision(value) &&
  value.evidence === 'partial' &&
  (value.publication === 'completed' || value.publication === 'partial') &&
  hasBillingArtifactAuthority(value, generationId, inputManifestDigest);
