import { type ArtifactCoverageVerdict, type ArtifactOwnershipBinding, type ArtifactRevisionComparison, type ArtifactRevisionVector } from '../common/artifactEvidence.js';
import type { ArtifactDescriptor } from '../common/artifactGeneration.js';
import type { BillingAnalyzerMetadata } from './billingGeneration.js';
import { type BillingCompletedArtifactPublicationDecision } from './billingArtifactEvidence.js';
/** Stable diagnostic-only suffix for the latest successfully enqueued observe input. */
export declare const BILLING_ANALYZER_INPUT_OBSERVATION_POINTER_RELATIVE_PATH: "history/billing/analyzer-inputs/latest-enqueued.json";
type BillingArtifactBasis = 'actual' | 'amortized';
interface BillingAnalyzerRequestedPeriod {
    fromInclusive: string;
    throughExclusive: string;
    dateBasis: 'utc' | 'billing-calendar' | 'company-local';
    timeZone?: string;
    basis: BillingArtifactBasis;
}
interface BillingAnalyzerInputObjectDescriptor {
    path: string;
    versionId?: string;
    etag: string;
    sha256: string;
    byteCount: number;
    rowCount: number;
    basis: BillingArtifactBasis;
    currencyCode?: string;
    coverage: ArtifactCoverageVerdict;
}
interface BillingAnalyzerOutputArtifactDescriptor extends ArtifactDescriptor {
    path: string;
}
interface BillingGenerationDocumentV2 {
    schemaVersion: 2;
    status: 'completed';
    subscriptionId: string;
    generationId: string;
    ownership: ArtifactOwnershipBinding<'azure'>;
    revision: ArtifactRevisionVector;
}
type EpochFreeAzureOwnership = ArtifactOwnershipBinding<'azure'> & {
    ownershipEpochRevision?: never;
};
type EpochFreeArtifactRevision = ArtifactRevisionVector & {
    ownershipEpochRevision?: never;
};
export interface BillingAnalyzerInputManifestV2 extends BillingGenerationDocumentV2 {
    publicationKey: string;
    coveragePlanDigest: string;
    asOfUtc: string;
    stableCutoffUtc: string;
    requestedPeriods: [BillingAnalyzerRequestedPeriod, ...BillingAnalyzerRequestedPeriod[]];
    inputs: [BillingAnalyzerInputObjectDescriptor, ...BillingAnalyzerInputObjectDescriptor[]];
    manifestDigest: string;
    completedAt: string;
}
export interface BillingAnalyzerInputCurrentPointerV1 {
    schemaVersion: 1;
    status: 'completed';
    subscriptionId: string;
    generationId: string;
    ownership: ArtifactOwnershipBinding<'azure'> & {
        ownershipEpochRevision: number;
    };
    revision: ArtifactRevisionVector & {
        ownershipEpochRevision: number;
    };
    manifestPath: string;
    manifestDigest: string;
    completedAt: string;
}
/** Latest epoch-free authority for one immutable analyzer input generation. */
export interface BillingAnalyzerInputCurrentPointerV2 {
    schemaVersion: 2;
    status: 'completed';
    subscriptionId: string;
    generationId: string;
    ownership: EpochFreeAzureOwnership;
    revision: EpochFreeArtifactRevision;
    manifestPath: string;
    manifestDigest: string;
    completedAt: string;
}
export interface BillingAnalyzerRequestV2 {
    schemaVersion: 2;
    eventId: string;
    messageId: string;
    correlationId: string;
    occurredAt: string;
    idempotencyKey: string;
    publicationMode: 'observe' | 'enforce';
    subscriptionId: string;
    generationId: string;
    ownership: ArtifactOwnershipBinding<'azure'>;
    revision: ArtifactRevisionVector;
    inputManifestPath: string;
    inputManifestDigest: string;
    displayMetadata?: BillingAnalyzerMetadata;
}
/** Latest-only queue envelope for one immutable analyzer input generation. */
export interface BillingAnalyzerRequestV3 {
    schemaVersion: 3;
    eventId: string;
    messageId: string;
    correlationId: string;
    occurredAt: string;
    idempotencyKey: string;
    subscriptionId: string;
    generationId: string;
    ownership: EpochFreeAzureOwnership;
    revision: EpochFreeArtifactRevision;
    inputManifestPath: string;
    inputManifestDigest: string;
    displayMetadata?: BillingAnalyzerMetadata;
}
/** Diagnostic-only discovery pointer for the latest successfully enqueued observe input. */
export interface BillingAnalyzerInputObservationPointerV1 {
    schemaVersion: 1;
    documentType: 'billing-analyzer-input-observation-pointer';
    authority: 'diagnostic-only';
    publicationMode: 'observe';
    inputState: 'enqueued';
    subscriptionId: string;
    generationId: string;
    ownership: ArtifactOwnershipBinding<'azure'>;
    revision: ArtifactRevisionVector;
    inputManifestPath: string;
    inputManifestDigest: string;
    messageId: string;
    correlationId: string;
    enqueuedAt: string;
}
export interface BillingAnalyzerOutputManifestV2 extends BillingGenerationDocumentV2 {
    inputManifestPath: string;
    inputManifestDigest: string;
    outputBindingDigest: string;
    artifacts: [BillingAnalyzerOutputArtifactDescriptor, ...BillingAnalyzerOutputArtifactDescriptor[]];
    publicationDecision: BillingCompletedArtifactPublicationDecision;
    manifestDigest: string;
    completedAt: string;
}
export interface BillingAnalysisCurrentPointerV1 {
    schemaVersion: 1;
    status: 'completed';
    subscriptionId: string;
    generationId: string;
    ownership: ArtifactOwnershipBinding<'azure'> & {
        ownershipEpochRevision: number;
    };
    revision: ArtifactRevisionVector & {
        ownershipEpochRevision: number;
    };
    inputManifestPath: string;
    inputManifestDigest: string;
    outputManifestPath: string;
    outputManifestDigest: string;
    publicationDecision: BillingCompletedArtifactPublicationDecision;
    completedAt: string;
}
/** Latest epoch-free authority for one completed immutable analyzer output generation. */
export interface BillingAnalysisCurrentPointerV2 {
    schemaVersion: 2;
    status: 'completed';
    subscriptionId: string;
    generationId: string;
    ownership: EpochFreeAzureOwnership;
    revision: EpochFreeArtifactRevision;
    inputManifestPath: string;
    inputManifestDigest: string;
    outputManifestPath: string;
    outputManifestDigest: string;
    publicationDecision: BillingCompletedArtifactPublicationDecision;
    completedAt: string;
}
/** Immutable diagnostic record of what observe mode would have done at promotion time. */
export interface BillingAnalysisPromotionObservationV1 {
    schemaVersion: 1;
    documentType: 'billing-analysis-promotion-observation';
    authority: 'diagnostic-only';
    publicationMode: 'observe';
    processingState: 'succeeded';
    subscriptionId: string;
    generationId: string;
    ownership: ArtifactOwnershipBinding<'azure'>;
    revision: ArtifactRevisionVector;
    messageId: string;
    correlationId: string;
    inputManifestPath: string;
    inputManifestDigest: string;
    outputManifestPath: string;
    outputManifestDigest: string;
    evaluation: {
        comparison: ArtifactRevisionComparison | 'authority-absent';
        projectedOutcome: 'would-promote' | 'would-be-idempotent' | 'would-be-superseded' | 'would-quarantine' | 'not-enforceable';
        outputDigestRelation?: 'same' | 'different';
    };
    observationDigest: string;
    observedAt: string;
}
/** Builds the diagnostic-only latest-enqueued observation path for one safe subscription segment. */
export declare const buildBillingAnalyzerInputObservationPointerPath: (subscriptionId: string) => string;
/** Validates the exact diagnostic-only latest-enqueued observation logical path. */
export declare const isBillingAnalyzerInputObservationPointerPath: (value: unknown) => value is string;
/** Validates one immutable billing analyzer input manifest without performing I/O. */
export declare const isBillingAnalyzerInputManifestV2: (value: unknown) => value is BillingAnalyzerInputManifestV2;
/** Validates the enforceable current pointer for one published analyzer input generation. */
export declare const isBillingAnalyzerInputCurrentPointerV1: (value: unknown) => value is BillingAnalyzerInputCurrentPointerV1;
/** Validates the latest epoch-free current pointer for one analyzer input generation. */
export declare const isBillingAnalyzerInputCurrentPointerV2: (value: unknown) => value is BillingAnalyzerInputCurrentPointerV2;
/** Validates the V2 queue envelope and its immutable input-manifest binding. */
export declare const isBillingAnalyzerRequestV2: (value: unknown) => value is BillingAnalyzerRequestV2;
/** Validates the latest-only V3 queue envelope and immutable input-manifest binding. */
export declare const isBillingAnalyzerRequestV3: (value: unknown) => value is BillingAnalyzerRequestV3;
/** Validates a diagnostic-only latest-enqueued pointer; it is never customer authority. */
export declare const isBillingAnalyzerInputObservationPointerV1: (value: unknown) => value is BillingAnalyzerInputObservationPointerV1;
/** Validates an immutable analyzer output manifest and its exact input binding. */
export declare const isBillingAnalyzerOutputManifestV2: (value: unknown) => value is BillingAnalyzerOutputManifestV2;
/** Validates the sole promoted authority pointer for completed billing analysis. */
export declare const isBillingAnalysisCurrentPointerV1: (value: unknown) => value is BillingAnalysisCurrentPointerV1;
/** Validates the latest epoch-free promoted authority pointer for completed billing analysis. */
export declare const isBillingAnalysisCurrentPointerV2: (value: unknown) => value is BillingAnalysisCurrentPointerV2;
/** Validates an immutable diagnostic-only promotion evaluation. */
export declare const isBillingAnalysisPromotionObservationV1: (value: unknown) => value is BillingAnalysisPromotionObservationV1;
export {};
//# sourceMappingURL=billingArtifactGeneration.d.ts.map