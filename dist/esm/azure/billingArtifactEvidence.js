import { isArtifactPublicationDecision, } from '../common/artifactEvidence.js';
const hasBillingArtifactAuthority = (value, generationId, inputManifestDigest) => {
    const billingHistory = value.dependencies[0];
    const costAnalysis = value.claims[0];
    return (billingHistory?.name === 'billing-history' &&
        billingHistory.required === true &&
        billingHistory.publication === 'completed' &&
        billingHistory.generationId === generationId &&
        billingHistory.digest === inputManifestDigest &&
        costAnalysis?.claimId === 'cost-analysis' &&
        costAnalysis.requiredDependencies[0] === 'billing-history');
};
/** Validates the exact completed billing dependency and claim bound to one input generation. */
export const isBillingCompletedArtifactPublicationDecision = (value, generationId, inputManifestDigest) => {
    if (!isArtifactPublicationDecision(value) || value.publication !== 'completed')
        return false;
    return value.claims[0]?.publication === 'completed' && hasBillingArtifactAuthority(value, generationId, inputManifestDigest);
};
/** Validates partial billing evidence bound to one authoritative input generation. */
export const isBillingPartialArtifactPublicationDecision = (value, generationId, inputManifestDigest) => isArtifactPublicationDecision(value) &&
    value.evidence === 'partial' &&
    (value.publication === 'completed' || value.publication === 'partial') &&
    hasBillingArtifactAuthority(value, generationId, inputManifestDigest);
