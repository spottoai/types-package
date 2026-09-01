import type { EnvironmentDocumentDescriptorV1, EnvironmentScopeV1 } from './contracts.js';
/**
 * Builds the canonical scope-qualified artifact subject used inside opaque
 * logical references. The JSON tuple is an identifier, never a storage path.
 */
export declare const buildEnvironmentScopeQualifiedSubjectV1: (scope: EnvironmentScopeV1) => string;
/**
 * Produces the exact compact UTF-8 tree-digest preimage. Hashing remains the
 * caller's responsibility so this helper stays browser-safe.
 */
export declare const buildEnvironmentTreeDigestPreimageV1: (descriptors: readonly EnvironmentDocumentDescriptorV1[]) => string;
//# sourceMappingURL=canonicalization.d.ts.map