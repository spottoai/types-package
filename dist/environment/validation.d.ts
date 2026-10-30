import { type EnvironmentArtifactKindV1, type EnvironmentCompiledGenerationPointerV1, type EnvironmentDocumentDescriptorV1, type EnvironmentMoneyValueV1, type EnvironmentScopeV1, type EnvironmentSourceBindingV1, type EnvironmentSourceGenerationV1, type EnvironmentSubscriptionProjectionV1 } from './contracts.js';
export { isEnvironmentSavingsBasisV1 } from './moneyValidation.js';
export { isEnvironmentCardinalityV1, isEnvironmentCoverageStateV1, isEnvironmentPillarV1 } from './valueValidation.js';
/** Validates a bounded, local Portal route suitable for client-visible evidence. */
export declare const isEnvironmentPortalRouteV1: (value: unknown) => value is string;
/** Validates the closed phase-one Azure subscription scope. */
export declare const isEnvironmentScopeV1: (value: unknown) => value is EnvironmentScopeV1;
/** Validates the client-safe identity of one authoritative source generation. */
export declare const isEnvironmentSourceGenerationV1: (value: unknown) => value is EnvironmentSourceGenerationV1;
/** Validates a byte-preserving binding to an authoritative CompletedAzureViewSetV1. */
export declare const isEnvironmentSourceBindingV1: (value: unknown) => value is EnvironmentSourceBindingV1;
/** Validates a storage-safe environment run identity independently from source identities. */
export declare const isEnvironmentRunIdV1: (value: unknown) => value is string;
export declare const isEnvironmentMoneyValueV1: (value: unknown) => value is EnvironmentMoneyValueV1;
/** Validates the strict, bounded multi-pillar subscription environment projection. */
export declare const isEnvironmentSubscriptionProjectionV1: (value: unknown) => value is EnvironmentSubscriptionProjectionV1;
/** Validates one descriptor from the exact V1 multi-pillar document allowlist. */
export declare const isEnvironmentDocumentDescriptorV1: (value: unknown) => value is EnvironmentDocumentDescriptorV1;
/** Validates that descriptors contain every allowlisted V1 document exactly once. */
export declare const isEnvironmentDocumentDescriptorSetV1: (value: unknown) => value is EnvironmentDocumentDescriptorV1[];
/** Validates an atomically visible completed environment-generation pointer. */
export declare const isEnvironmentCompiledGenerationPointerV1: (value: unknown) => value is EnvironmentCompiledGenerationPointerV1;
/** Validates an artifact kind without widening the closed V1 union. */
export declare const isEnvironmentArtifactKindV1: (value: unknown) => value is EnvironmentArtifactKindV1;
/** Validates the V1 safe-label bound used by customer-visible evidence metadata. */
export declare const isEnvironmentSafeLabelV1: (value: unknown) => value is string;
//# sourceMappingURL=validation.d.ts.map