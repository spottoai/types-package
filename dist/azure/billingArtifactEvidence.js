"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBillingPartialArtifactPublicationDecision = exports.isBillingCompletedArtifactPublicationDecision = void 0;
const artifactEvidence_js_1 = require("../common/artifactEvidence.js");
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
const isBillingCompletedArtifactPublicationDecision = (value, generationId, inputManifestDigest) => {
    if (!(0, artifactEvidence_js_1.isArtifactPublicationDecision)(value) || value.publication !== 'completed')
        return false;
    return value.claims[0]?.publication === 'completed' && hasBillingArtifactAuthority(value, generationId, inputManifestDigest);
};
exports.isBillingCompletedArtifactPublicationDecision = isBillingCompletedArtifactPublicationDecision;
/** Validates partial billing evidence bound to one authoritative input generation. */
const isBillingPartialArtifactPublicationDecision = (value, generationId, inputManifestDigest) => (0, artifactEvidence_js_1.isArtifactPublicationDecision)(value) &&
    value.evidence === 'partial' &&
    (value.publication === 'completed' || value.publication === 'partial') &&
    hasBillingArtifactAuthority(value, generationId, inputManifestDigest);
exports.isBillingPartialArtifactPublicationDecision = isBillingPartialArtifactPublicationDecision;
//# sourceMappingURL=billingArtifactEvidence.js.map