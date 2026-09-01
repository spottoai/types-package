import { type EnvironmentArtifactKindV1, type EnvironmentLogicalArtifactReferenceV1, type EnvironmentLogicalEvidenceReferenceV1, type EnvironmentLogicalResourceReferenceV1, type ParsedEnvironmentLogicalArtifactReferenceV1, type ParsedEnvironmentLogicalEvidenceReferenceV1, type ParsedEnvironmentLogicalResourceReferenceV1 } from './contracts.js';
/** Builds an opaque logical artifact reference. The decoded subject is never a storage path. */
export declare const buildEnvironmentLogicalArtifactReferenceV1: (artifactKind: EnvironmentArtifactKindV1, canonicalScopeQualifiedSubject: string) => EnvironmentLogicalArtifactReferenceV1;
/** Parses a V1 logical artifact reference into its allowlisted kind and opaque subject. */
export declare const parseEnvironmentLogicalArtifactReferenceV1: (value: unknown) => ParsedEnvironmentLogicalArtifactReferenceV1 | null;
/** Builds an opaque logical Azure resource reference from a canonical resource ID. */
export declare const buildEnvironmentLogicalResourceReferenceV1: (canonicalAzureResourceId: string) => EnvironmentLogicalResourceReferenceV1;
/** Parses a V1 logical resource reference into a canonical Azure resource ID. */
export declare const parseEnvironmentLogicalResourceReferenceV1: (value: unknown) => ParsedEnvironmentLogicalResourceReferenceV1 | null;
/** Parses either closed V1 logical evidence-reference kind. */
export declare const parseEnvironmentLogicalEvidenceReferenceV1: (value: unknown) => ParsedEnvironmentLogicalEvidenceReferenceV1 | null;
/** Returns true when a value is a canonical V1 logical artifact reference. */
export declare const isEnvironmentLogicalArtifactReferenceV1: (value: unknown) => value is EnvironmentLogicalArtifactReferenceV1;
/** Returns true when a value is a canonical V1 logical resource reference. */
export declare const isEnvironmentLogicalResourceReferenceV1: (value: unknown) => value is EnvironmentLogicalResourceReferenceV1;
/** Returns true when a value is one of the closed V1 logical evidence-reference kinds. */
export declare const isEnvironmentLogicalEvidenceReferenceV1: (value: unknown) => value is EnvironmentLogicalEvidenceReferenceV1;
//# sourceMappingURL=references.d.ts.map