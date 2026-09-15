import type { EnvironmentBoundedListV1, EnvironmentCoverageStateV1, EnvironmentLogicalEvidenceReferenceV1, EnvironmentProjectionWarningV1, EnvironmentSeverityV1 } from './contracts.js';
export declare const ENVIRONMENT_TENANT_DOCUMENT_NAMES_V1: readonly ["projection.json", "environment-index.md", "identity.md", "governance.md", "commitments.md"];
export type EnvironmentTenantDocumentNameV1 = (typeof ENVIRONMENT_TENANT_DOCUMENT_NAMES_V1)[number];
export type EnvironmentTenantMarkdownDocumentNameV1 = Exclude<EnvironmentTenantDocumentNameV1, 'projection.json'>;
export interface EnvironmentTenantScopeV1 {
    kind: 'azure-tenant';
    tenantId: string;
}
export interface EnvironmentTenantSourceBindingV1 {
    kind: 'azure-tenant-sync';
    scope: EnvironmentTenantScopeV1;
    tenantSyncRunId: string;
    completedAt: string;
}
export interface EnvironmentTenantSourceCoverageV1 {
    tenantSync: EnvironmentCoverageStateV1;
    governance: EnvironmentCoverageStateV1;
    identity: EnvironmentCoverageStateV1;
    commitments: EnvironmentCoverageStateV1;
}
export interface EnvironmentTenantIdentitySummaryV1 {
    applicationCount: number;
    servicePrincipalCount: number;
    globalAdministratorCount: number;
    permanentGlobalAdministratorCount: number;
    eligibleGlobalAdministratorCount: number;
    mfaKnownGlobalAdministratorCount: number;
}
export interface EnvironmentTenantGovernanceSummaryV1 {
    managementGroupCount: number;
    subscriptionCount: number;
    policyAssignmentCount: number;
    policyExemptionCount: number;
    roleAssignmentCount: number;
    privilegedAssignmentCount: number;
    customRoleCount: number;
    findingCount: number;
}
export interface EnvironmentTenantCommitmentSummaryV1 {
    reservationCount: number;
    savingsPlanCount: number;
    expiringWithin90DaysCount: number;
}
export interface EnvironmentTenantGlobalAdministratorV1 {
    principalId: string;
    safeLabel: string;
    principalType: 'user' | 'group' | 'servicePrincipal' | 'unknown';
    assignmentModes: Array<'permanent' | 'eligible' | 'active' | 'unknown'>;
    mfaStatus: 'mfa' | 'unknown';
    sourceReferences: EnvironmentLogicalEvidenceReferenceV1[];
}
export interface EnvironmentTenantGovernanceFindingV1 {
    findingId: string;
    safeLabel: string;
    severity: EnvironmentSeverityV1;
    category?: string;
    scopeType?: string;
    sourceReferences: EnvironmentLogicalEvidenceReferenceV1[];
}
export interface EnvironmentTenantCommitmentV1 {
    commitmentId: string;
    kind: 'reservation' | 'savings-plan';
    safeLabel: string;
    status?: string;
    expiry?: string;
    quantity?: number;
    sourceReferences: EnvironmentLogicalEvidenceReferenceV1[];
}
export interface EnvironmentTenantProjectionV1 {
    schemaVersion: 1;
    scope: EnvironmentTenantScopeV1;
    sourceBinding: EnvironmentTenantSourceBindingV1;
    generatedAt: string;
    tenant: {
        safeLabel: string;
    };
    sourceCoverage: EnvironmentTenantSourceCoverageV1;
    identitySummary: EnvironmentTenantIdentitySummaryV1;
    governanceSummary: EnvironmentTenantGovernanceSummaryV1;
    commitmentSummary: EnvironmentTenantCommitmentSummaryV1;
    globalAdministrators: EnvironmentBoundedListV1<EnvironmentTenantGlobalAdministratorV1>;
    governanceFindings: EnvironmentBoundedListV1<EnvironmentTenantGovernanceFindingV1>;
    commitments: EnvironmentBoundedListV1<EnvironmentTenantCommitmentV1>;
    warnings: EnvironmentBoundedListV1<EnvironmentProjectionWarningV1>;
    sourceReferences: EnvironmentLogicalEvidenceReferenceV1[];
}
export type EnvironmentTenantDocumentDescriptorV1 = {
    name: 'projection.json';
    mediaType: 'application/json';
    byteCount: number;
    contentSha256: string;
    approximateTokenCount: number;
} | {
    name: EnvironmentTenantMarkdownDocumentNameV1;
    mediaType: 'text/markdown; charset=utf-8';
    byteCount: number;
    contentSha256: string;
    approximateTokenCount: number;
};
export interface EnvironmentTenantCompiledGenerationPointerV1 {
    schemaVersion: 1;
    status: 'completed';
    environmentRunId: string;
    scope: EnvironmentTenantScopeV1;
    sourceBinding: EnvironmentTenantSourceBindingV1;
    treeDigestSha256: string;
    fileCount: (typeof ENVIRONMENT_TENANT_DOCUMENT_NAMES_V1)['length'];
    generatedAt: string;
}
/** Builds the canonical logical subject for a tenant environment artifact. */
export declare const buildEnvironmentTenantScopeQualifiedSubjectV1: (scope: EnvironmentTenantScopeV1) => string;
/** Validates a tenant environment scope. */
export declare const isEnvironmentTenantScopeV1: (value: unknown) => value is EnvironmentTenantScopeV1;
/** Validates the completed tenant-sync generation bound to a tenant environment generation. */
export declare const isEnvironmentTenantSourceBindingV1: (value: unknown) => value is EnvironmentTenantSourceBindingV1;
/** Validates the strict tenant environment projection. */
export declare const isEnvironmentTenantProjectionV1: (value: unknown) => value is EnvironmentTenantProjectionV1;
/** Validates one tenant environment document descriptor. */
export declare const isEnvironmentTenantDocumentDescriptorV1: (value: unknown) => value is EnvironmentTenantDocumentDescriptorV1;
/** Validates the exact five-file tenant environment descriptor set. */
export declare const isEnvironmentTenantDocumentDescriptorSetV1: (value: unknown) => value is EnvironmentTenantDocumentDescriptorV1[];
/** Builds the canonical tenant tree-digest preimage. */
export declare const buildEnvironmentTenantTreeDigestPreimageV1: (descriptors: readonly EnvironmentTenantDocumentDescriptorV1[]) => string;
/** Validates the atomically visible tenant environment completion pointer. */
export declare const isEnvironmentTenantCompiledGenerationPointerV1: (value: unknown) => value is EnvironmentTenantCompiledGenerationPointerV1;
/** Narrow syntax guard used before tenant references are passed to the common parser. */
export declare const isEnvironmentTenantLogicalReferenceV1: (value: unknown) => value is EnvironmentLogicalEvidenceReferenceV1;
//# sourceMappingURL=tenant.d.ts.map