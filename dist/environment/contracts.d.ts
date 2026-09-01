/** Phase-one environment-memory contract constants shared by producers and consumers. */
export declare const ENVIRONMENT_CONTRACT_LIMITS_V1: Readonly<{
    readonly completedPointerBytes: number;
    readonly projectionBytes: number;
    readonly environmentIndexBytes: number;
    readonly costPillarBytes: number;
    readonly boundedListItems: 50;
    readonly customerStringScalars: 4096;
    readonly safeLabelScalars: 512;
    readonly scopeIdentifierScalars: 2048;
    readonly environmentRunIdAsciiCharacters: 128;
    readonly sourceIdentityScalars: 256;
    readonly logicalReferencePayloadBytes: number;
    readonly validatedContainerDepth: 8;
}>;
export declare const ENVIRONMENT_DOCUMENT_NAMES_V1: readonly ["projection.json", "environment-index.md", "pillars/cost.md"];
export declare const ENVIRONMENT_ARTIFACT_KINDS_V1: readonly ["subscription-summary", "subscription-resources", "subscription-recommendations"];
export type EnvironmentDocumentNameV1 = (typeof ENVIRONMENT_DOCUMENT_NAMES_V1)[number];
export type EnvironmentArtifactKindV1 = (typeof ENVIRONMENT_ARTIFACT_KINDS_V1)[number];
export type EnvironmentMoneyBasisV1 = 'billed' | 'amortized';
export type EnvironmentSavingsAdditivityV1 = 'additive' | 'scenario-non-additive';
export type EnvironmentMoneyProvenanceV1 = 'subscription-summary' | 'subscription-resources' | 'cost-savings-summary' | 'savings-aggregate' | 'recommendation';
export interface EnvironmentScopeV1 {
    kind: 'azure-subscription';
    tenantId: string;
    companyId: string;
    subscriptionId: string;
}
export interface EnvironmentSourceGenerationV1 {
    viewSetSchemaVersion: 1;
    publicationId: string;
    portalRunId: string;
    pluginRunId: string;
    economicsGenerationId: string;
    economicsFingerprint: string;
    completedAt: string;
}
export interface EnvironmentSourceBindingV1 extends EnvironmentSourceGenerationV1 {
    kind: 'azure-subscription-view-set';
    scope: EnvironmentScopeV1;
}
export type EnvironmentLogicalArtifactReferenceV1 = `spotto://artifact/v1/${EnvironmentArtifactKindV1}/${string}`;
export type EnvironmentLogicalResourceReferenceV1 = `spotto://resource/v1/${string}`;
export type EnvironmentLogicalEvidenceReferenceV1 = EnvironmentLogicalArtifactReferenceV1 | EnvironmentLogicalResourceReferenceV1;
export interface ParsedEnvironmentLogicalArtifactReferenceV1 {
    kind: 'artifact';
    artifactKind: EnvironmentArtifactKindV1;
    subject: string;
}
export interface ParsedEnvironmentLogicalResourceReferenceV1 {
    kind: 'resource';
    resourceId: string;
}
export type ParsedEnvironmentLogicalEvidenceReferenceV1 = ParsedEnvironmentLogicalArtifactReferenceV1 | ParsedEnvironmentLogicalResourceReferenceV1;
export interface EnvironmentMoneyValueV1 {
    amount: string;
    currencyCode: string;
    basis: EnvironmentMoneyBasisV1;
    period: string;
    provenance: EnvironmentMoneyProvenanceV1;
    savingsAdditivity?: EnvironmentSavingsAdditivityV1;
}
interface EnvironmentCoverageBaseV1 {
    observedAt?: string;
    completeThrough?: string;
}
export interface EnvironmentCompleteCoverageStateV1 extends EnvironmentCoverageBaseV1 {
    status: 'complete';
    reason?: never;
}
export interface EnvironmentPartialCoverageStateV1 extends EnvironmentCoverageBaseV1 {
    status: 'partial';
    reason: string;
}
export interface EnvironmentUnavailableCoverageStateV1 {
    status: 'unavailable';
    reason: string;
    observedAt?: never;
    completeThrough?: never;
}
export interface EnvironmentStaleCoverageStateV1 extends EnvironmentCoverageBaseV1 {
    status: 'stale';
    reason: string;
    observedAt: string;
}
export interface EnvironmentNotCollectedCoverageStateV1 {
    status: 'not-collected';
    reason: string;
    observedAt?: never;
    completeThrough?: never;
}
export type EnvironmentCoverageStateV1 = EnvironmentCompleteCoverageStateV1 | EnvironmentPartialCoverageStateV1 | EnvironmentUnavailableCoverageStateV1 | EnvironmentStaleCoverageStateV1 | EnvironmentNotCollectedCoverageStateV1;
export interface EnvironmentBoundedListV1<T> {
    items: T[];
    totalCount: number;
    includedCount: number;
    truncated: boolean;
    continuationReference?: EnvironmentLogicalEvidenceReferenceV1;
}
export interface EnvironmentSubscriptionSummaryV1 {
    safeLabel: string;
    portalRoute: string;
}
export interface EnvironmentSourceCoverageV1 {
    subscriptionSummary: EnvironmentCoverageStateV1;
    resources: EnvironmentCoverageStateV1;
    recommendations: EnvironmentCoverageStateV1;
    costs: EnvironmentCoverageStateV1;
    savings: EnvironmentCoverageStateV1;
}
export interface EnvironmentCostSummaryV1 {
    observedCost?: EnvironmentMoneyValueV1;
    potentialSavings?: EnvironmentMoneyValueV1;
    resourceCount?: number;
    recommendationCount?: number;
}
export interface EnvironmentCostRollupV1 {
    key: string;
    safeLabel: string;
    resourceCount: number;
    observedCost?: EnvironmentMoneyValueV1;
    potentialSavings?: EnvironmentMoneyValueV1;
    sourceReferences: EnvironmentLogicalEvidenceReferenceV1[];
}
export interface EnvironmentCostDriverV1 {
    key: string;
    safeLabel: string;
    description?: string;
    observedCost?: EnvironmentMoneyValueV1;
    portalRoute?: string;
    resourceReference?: EnvironmentLogicalResourceReferenceV1;
    sourceReferences: EnvironmentLogicalEvidenceReferenceV1[];
}
export interface EnvironmentCostRecommendationV1 {
    recommendationId: string;
    safeLabel: string;
    description?: string;
    potentialSavings?: EnvironmentMoneyValueV1;
    portalRoute: string;
    sourceReferences: EnvironmentLogicalEvidenceReferenceV1[];
}
export interface EnvironmentCostChangeV1 {
    key: string;
    safeLabel: string;
    description: string;
    direction: 'increase' | 'decrease' | 'unchanged' | 'unknown';
    amount?: EnvironmentMoneyValueV1;
    sourceReferences: EnvironmentLogicalEvidenceReferenceV1[];
}
export interface EnvironmentProjectionWarningV1 {
    code: string;
    safeLabel: string;
    detail?: string;
    sourceReferences: EnvironmentLogicalEvidenceReferenceV1[];
}
export interface EnvironmentSubscriptionCostProjectionV1 {
    schemaVersion: 1;
    scope: EnvironmentScopeV1;
    sourceBinding: EnvironmentSourceBindingV1;
    generatedAt: string;
    subscription: EnvironmentSubscriptionSummaryV1;
    sourceCoverage: EnvironmentSourceCoverageV1;
    costSummary: EnvironmentCostSummaryV1;
    serviceFamilyRollups: EnvironmentBoundedListV1<EnvironmentCostRollupV1>;
    estateCostRollups: EnvironmentBoundedListV1<EnvironmentCostRollupV1>;
    costDrivers: EnvironmentBoundedListV1<EnvironmentCostDriverV1>;
    recommendations: EnvironmentBoundedListV1<EnvironmentCostRecommendationV1>;
    changes: EnvironmentBoundedListV1<EnvironmentCostChangeV1>;
    warnings: EnvironmentBoundedListV1<EnvironmentProjectionWarningV1>;
    sourceReferences: EnvironmentLogicalEvidenceReferenceV1[];
}
export type EnvironmentDocumentDescriptorV1 = {
    name: 'projection.json';
    mediaType: 'application/json';
    byteCount: number;
    contentSha256: string;
    approximateTokenCount: number;
} | {
    name: 'environment-index.md' | 'pillars/cost.md';
    mediaType: 'text/markdown; charset=utf-8';
    byteCount: number;
    contentSha256: string;
    approximateTokenCount: number;
};
export interface EnvironmentCompiledGenerationPointerV1 {
    schemaVersion: 1;
    status: 'completed';
    environmentRunId: string;
    scope: EnvironmentScopeV1;
    sourceBinding: EnvironmentSourceBindingV1;
    treeDigestSha256: string;
    fileCount: 3;
    generatedAt: string;
}
export {};
//# sourceMappingURL=contracts.d.ts.map