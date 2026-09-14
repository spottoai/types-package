import { type EnvironmentArtifactKindV1, type EnvironmentCardinalityV1, type EnvironmentCompiledGenerationPointerV1, type EnvironmentCoverageStateV1, type EnvironmentDocumentDescriptorV1, type EnvironmentMoneyValueV1, type EnvironmentSavingsBasisV1, type EnvironmentPillarV1, type EnvironmentScopeV1, type EnvironmentSourceBindingV1, type EnvironmentSourceGenerationV1, type EnvironmentSubscriptionProjectionV1 } from './contracts.js';
/** Validates a bounded, local Portal route suitable for client-visible evidence. */
export declare const isEnvironmentPortalRouteV1: (value: unknown) => value is string;
/** Validates one admitted environment pillar. */
export declare const isEnvironmentPillarV1: (value: unknown) => value is EnvironmentPillarV1;
/** Validates the closed phase-one Azure subscription scope. */
export declare const isEnvironmentScopeV1: (value: unknown) => value is EnvironmentScopeV1;
/** Validates the client-safe identity of one authoritative source generation. */
export declare const isEnvironmentSourceGenerationV1: (value: unknown) => value is EnvironmentSourceGenerationV1;
/** Validates a byte-preserving binding to an authoritative CompletedAzureViewSetV1. */
export declare const isEnvironmentSourceBindingV1: (value: unknown) => value is EnvironmentSourceBindingV1;
/** Validates a storage-safe environment run identity independently from source identities. */
export declare const isEnvironmentRunIdV1: (value: unknown) => value is string;
/** Validates the producer projection rule and window behind a savings amount. */
export declare const isEnvironmentSavingsBasisV1: (value: unknown) => value is EnvironmentSavingsBasisV1;
/** Validates canonical decimal money with explicit currency, basis, period, and provenance. */
export declare const isEnvironmentMoneyValueV1: (value: unknown) => value is EnvironmentMoneyValueV1;
/** Validates the closed coverage-state union and state-specific freshness rules. */
export declare const isEnvironmentCoverageStateV1: (value: unknown) => value is EnvironmentCoverageStateV1;
/** Validates exact, lower-bound, and unavailable count evidence without ambiguous totals. */
export declare const isEnvironmentCardinalityV1: (value: unknown) => value is EnvironmentCardinalityV1;
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