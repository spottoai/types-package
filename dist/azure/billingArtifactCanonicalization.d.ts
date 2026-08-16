import type { ArtifactOwnershipBinding, ArtifactRevisionVector } from '../common/artifactEvidence.js';
import { type BillingArtifactPublicationDecision } from './billingArtifactEvidence.js';
import type { BillingAnalysisPromotionObservationV1, BillingAnalyzerInputManifestV2, BillingAnalyzerOutputManifestV2 } from './billingArtifactGeneration.js';
import type { BillingCostAnalysisMetadataV2 } from './billingPlots.js';
/** Stable identity/evidence projection shared by billing output manifests and metadata. */
export interface BillingOutputBindingV1 {
    kind: 'billing-analysis-output';
    schemaVersion: 1;
    subscriptionId: string;
    generationId: string;
    ownership: ArtifactOwnershipBinding<'azure'>;
    revision: ArtifactRevisionVector;
    inputManifestDigest: string;
    publicationDecision: BillingArtifactPublicationDecision;
}
/** Selects the exact binding-v1 identity/evidence fields from an output manifest. */
export declare const projectBillingOutputBindingV1FromManifest: (manifest: BillingAnalyzerOutputManifestV2) => BillingOutputBindingV1;
/** Selects the exact binding-v1 identity/evidence fields from billing metadata. */
export declare const projectBillingOutputBindingV1FromMetadata: (metadata: BillingCostAnalysisMetadataV2) => BillingOutputBindingV1;
/** Returns the RFC 8785/JCS-compatible UTF-8 preimage for billing output binding SHA-256 B. */
export declare const canonicalizeBillingOutputBindingV1: (binding: BillingOutputBindingV1) => string;
/** Returns the canonical input-manifest digest preimage, excluding only top-level manifestDigest. */
export declare const canonicalizeBillingAnalyzerInputManifestV2ForDigest: (manifest: BillingAnalyzerInputManifestV2) => string;
/** Returns the canonical output-manifest digest preimage, excluding only top-level manifestDigest. */
export declare const canonicalizeBillingAnalyzerOutputManifestV2ForDigest: (manifest: BillingAnalyzerOutputManifestV2) => string;
/** Returns the exact promotion-observation digest preimage, excluding observationDigest and additive fields. */
export declare const canonicalizeBillingAnalysisPromotionObservationV1ForDigest: (observation: BillingAnalysisPromotionObservationV1) => string;
/** Returns the RFC 8785/JCS-compatible canonical JSON string for a validated JSON value. */
export declare const canonicalizeBillingArtifactJson: (value: unknown) => string;
//# sourceMappingURL=billingArtifactCanonicalization.d.ts.map