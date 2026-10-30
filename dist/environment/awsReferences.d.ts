import type { EnvironmentAwsAccountScopeV1, EnvironmentAwsArtifactKindV1, EnvironmentAwsLogicalArtifactReferenceV1, EnvironmentAwsLogicalEvidenceReferenceV1, EnvironmentAwsLogicalResourceReferenceV1, ParsedEnvironmentAwsLogicalArtifactReferenceV1, ParsedEnvironmentAwsLogicalResourceReferenceV1 } from './awsContracts.js';
/** Canonical scope-qualified identifier, never a path or authorization grant. */
export declare const buildEnvironmentAwsAccountScopeQualifiedSubjectV1: (scope: EnvironmentAwsAccountScopeV1) => string;
export declare const buildEnvironmentAwsLogicalArtifactReferenceV1: (artifactKind: EnvironmentAwsArtifactKindV1, scope: EnvironmentAwsAccountScopeV1) => EnvironmentAwsLogicalArtifactReferenceV1;
export declare const buildEnvironmentAwsLogicalResourceReferenceV1: (scope: EnvironmentAwsAccountScopeV1, resourceType: string, resourceId: string) => EnvironmentAwsLogicalResourceReferenceV1;
export declare const parseEnvironmentAwsLogicalArtifactReferenceV1: (value: unknown) => ParsedEnvironmentAwsLogicalArtifactReferenceV1 | null;
export declare const parseEnvironmentAwsLogicalResourceReferenceV1: (value: unknown) => ParsedEnvironmentAwsLogicalResourceReferenceV1 | null;
export declare const isEnvironmentAwsLogicalArtifactReferenceV1: (value: unknown) => value is EnvironmentAwsLogicalArtifactReferenceV1;
export declare const isEnvironmentAwsLogicalResourceReferenceV1: (value: unknown) => value is EnvironmentAwsLogicalResourceReferenceV1;
export declare const isEnvironmentAwsLogicalEvidenceReferenceV1: (value: unknown) => value is EnvironmentAwsLogicalEvidenceReferenceV1;
/** Non-throwing kind admission for compiler and provider-neutral consumers. */
export declare const isEnvironmentAwsArtifactKindV1: (value: unknown) => value is EnvironmentAwsArtifactKindV1;
//# sourceMappingURL=awsReferences.d.ts.map