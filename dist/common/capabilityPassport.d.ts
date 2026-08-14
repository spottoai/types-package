import type { ArtifactProvider } from './artifactGeneration.js';
import { type ArtifactEmptyEvidenceVerdict, type ArtifactFreshnessVerdict, type ArtifactOwnershipBinding } from './artifactEvidence.js';
export declare const CAPABILITY_PASSPORT_SCHEMA_VERSION: 1;
export type CapabilityPassportSchemaVersion = typeof CAPABILITY_PASSPORT_SCHEMA_VERSION;
export declare const CAPABILITY_REASON_CODES: readonly ["not-requested", "permission-denied", "not-found", "throttled", "timeout", "pagination-incomplete", "source-partial", "source-empty", "source-unsupported", "retained-last-known-good", "currency-unresolved", "unknown"];
export type CapabilityReasonCode = (typeof CAPABILITY_REASON_CODES)[number];
type CapabilityScopeBase<Provider extends ArtifactProvider = ArtifactProvider> = {
    provider: Provider;
    tenantId: string;
};
export type CapabilityScopeBinding<Provider extends ArtifactProvider = ArtifactProvider> = (CapabilityScopeBase<Provider> & {
    kind: 'tenant';
}) | (CapabilityScopeBase<Provider> & {
    kind: 'billing-account';
    billingAccountId: string;
}) | (CapabilityScopeBase<Provider> & {
    kind: 'customer';
    customerId: string;
}) | (CapabilityScopeBase<Provider> & {
    kind: 'subscription';
    subscriptionId: string;
}) | (CapabilityScopeBase<Provider> & {
    kind: 'resource';
    subscriptionId: string;
    normalizedResourceId: string;
});
export interface ImmutableSourceGeneration {
    artifactRef: string;
    generationId: string;
    sha256: string;
    schemaVersion: number;
    producedAt: string;
    completeThrough?: string;
}
export type CapabilityAttempt = {
    status: 'not-attempted';
    reasonCode: CapabilityReasonCode;
} | {
    status: 'attempted';
    startedAt: string;
    completedAt: string;
    outcome: 'succeeded' | 'failed' | 'partial';
    reasonCodes: CapabilityReasonCode[];
};
export type CapabilityFreshness = {
    status: Extract<ArtifactFreshnessVerdict, 'current'>;
    observedAt: string;
    completeThrough?: string;
} | {
    status: Extract<ArtifactFreshnessVerdict, 'stale'>;
    observedAt: string;
    completeThrough?: string;
    maximumAge: string;
} | {
    status: Extract<ArtifactFreshnessVerdict, 'unknown'>;
};
export interface CapabilityObservation<Provider extends ArtifactProvider = ArtifactProvider> {
    observationId: string;
    capability: string;
    scope: CapabilityScopeBinding<Provider>;
    attempt: CapabilityAttempt;
    providerSurfaceOutcome: 'accepted' | 'authoritatively-unsupported' | 'unknown';
    availability: 'available' | 'partial' | 'missing' | 'unavailable' | 'unknown';
    emptyEvidence: ArtifactEmptyEvidenceVerdict;
    freshness: CapabilityFreshness;
    sourceGeneration?: ImmutableSourceGeneration;
    coverageRef?: string;
    limits?: {
        expectedPages?: number;
        receivedPages?: number;
        throttled?: boolean;
        retainedLastKnownGood?: boolean;
    };
}
export type CapabilityObservationSet<Provider extends ArtifactProvider = ArtifactProvider> = {
    mode: 'inline';
    totalCount: number;
    items: CapabilityObservation<Provider>[];
} | {
    mode: 'sharded';
    totalCount: number;
    shardCount: number;
    indexRef: string;
    shards: Array<{
        artifactRef: string;
        sha256: string;
        itemCount: number;
    }>;
};
export type CapabilityAgreementType = 'EA' | 'MCA' | 'CSP' | 'PAYG-MOSP' | 'sponsored-trial' | 'unknown';
export interface CapabilityPassport<Provider extends ArtifactProvider = ArtifactProvider> {
    schemaVersion: CapabilityPassportSchemaVersion;
    passportId: string;
    generatedAt: string;
    runId: string;
    ownership: ArtifactOwnershipBinding<Provider> & {
        subscriptionId: string;
    };
    agreementObservation: {
        type: CapabilityAgreementType;
        source: 'observed' | 'configured' | 'unknown';
        sourceGeneration?: ImmutableSourceGeneration;
    };
    observations: CapabilityObservationSet<Provider>;
    producerVersions: Record<string, string>;
    issues: Array<{
        reasonCode: CapabilityReasonCode;
        observationId?: string;
    }>;
}
/** Dependency-free runtime rejection boundary for Capability Passport schema v1. */
export declare const isCapabilityPassport: (value: unknown) => value is CapabilityPassport;
export {};
//# sourceMappingURL=capabilityPassport.d.ts.map