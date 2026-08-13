import { type ArtifactCoverageVerdict, type ArtifactOwnershipBinding, type ArtifactRevisionVector } from '../common/artifactEvidence.js';
import type { ArtifactDescriptor } from '../common/artifactGeneration.js';
import type { BillingAnalyzerMetadata } from './billingGeneration.js';
import { type BillingCompletedArtifactPublicationDecision } from './billingArtifactEvidence.js';
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
/** Validates one immutable billing analyzer input manifest without performing I/O. */
export declare const isBillingAnalyzerInputManifestV2: (value: unknown) => value is BillingAnalyzerInputManifestV2;
/** Validates the enforceable current pointer for one published analyzer input generation. */
export declare const isBillingAnalyzerInputCurrentPointerV1: (value: unknown) => value is BillingAnalyzerInputCurrentPointerV1;
/** Validates the V2 queue envelope and its immutable input-manifest binding. */
export declare const isBillingAnalyzerRequestV2: (value: unknown) => value is BillingAnalyzerRequestV2;
/** Validates an immutable analyzer output manifest and its exact input binding. */
export declare const isBillingAnalyzerOutputManifestV2: (value: unknown) => value is BillingAnalyzerOutputManifestV2;
/** Validates the sole promoted authority pointer for completed billing analysis. */
export declare const isBillingAnalysisCurrentPointerV1: (value: unknown) => value is BillingAnalysisCurrentPointerV1;
export {};
//# sourceMappingURL=billingArtifactGeneration.d.ts.map