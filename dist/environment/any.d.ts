import type { EnvironmentScopeV1, EnvironmentLogicalEvidenceReferenceV1, ParsedEnvironmentLogicalEvidenceReferenceV1 } from './contracts.js';
import type { EnvironmentTenantScopeV1 } from './tenant.js';
import type { EnvironmentAwsAccountScopeV1, EnvironmentAwsLogicalEvidenceReferenceV1, ParsedEnvironmentAwsLogicalArtifactReferenceV1, ParsedEnvironmentAwsLogicalResourceReferenceV1 } from './awsContracts.js';
export type EnvironmentAnyScopeV1 = EnvironmentScopeV1 | EnvironmentTenantScopeV1 | EnvironmentAwsAccountScopeV1;
export type EnvironmentAnyLogicalEvidenceReferenceV1 = EnvironmentLogicalEvidenceReferenceV1 | EnvironmentAwsLogicalEvidenceReferenceV1;
export type ParsedEnvironmentAnyLogicalEvidenceReferenceV1 = ({
    provider: 'azure';
} & ParsedEnvironmentLogicalEvidenceReferenceV1) | ({
    provider: 'aws';
} & (ParsedEnvironmentAwsLogicalArtifactReferenceV1 | ParsedEnvironmentAwsLogicalResourceReferenceV1)) | {
    provider: 'aws';
    kind: 'artifact';
    artifactKind: 'environment-capability-evidence';
    scope: EnvironmentAwsAccountScopeV1;
    subject: string;
};
/** Provider dispatch does not widen the established Azure-specific guards. */
export declare const isEnvironmentAnyScopeV1: (value: unknown) => value is EnvironmentAnyScopeV1;
export declare const buildEnvironmentAnyScopeQualifiedSubjectV1: (scope: EnvironmentAnyScopeV1) => string;
export declare const parseEnvironmentAnyScopeQualifiedSubjectV1: (value: unknown) => EnvironmentAnyScopeV1 | null;
/** Exact identity equality; canonicalization and authorization remain caller responsibilities. */
export declare const environmentScopesEqualV1: (left: unknown, right: unknown) => boolean;
/** One parser for citation registries, API adapters and MCP; malformed input returns null. */
export declare const parseEnvironmentAnyLogicalEvidenceReferenceV1: (value: unknown) => ParsedEnvironmentAnyLogicalEvidenceReferenceV1 | null;
export declare const isEnvironmentAnyLogicalEvidenceReferenceV1: (value: unknown) => value is EnvironmentAnyLogicalEvidenceReferenceV1;
//# sourceMappingURL=any.d.ts.map