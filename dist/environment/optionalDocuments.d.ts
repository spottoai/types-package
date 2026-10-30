export { isEnvironmentCapabilityIdentifierV1 } from './capabilityIdentifiers.js';
import type { EnvironmentScopeV1, EnvironmentSourceBindingV1, EnvironmentCoverageStateV1, EnvironmentBoundedListV1, EnvironmentMoneyValueV1, EnvironmentLogicalEvidenceReferenceV1 } from './contracts.js';
import type { EnvironmentTenantScopeV1, EnvironmentTenantSourceBindingV1 } from './tenant.js';
import type { EnvironmentAwsAccountScopeV1, EnvironmentAwsAccountSourceBindingV1, EnvironmentAwsLogicalEvidenceReferenceV1 } from './awsContracts.js';
export type EnvironmentCapabilityScopeV1 = EnvironmentScopeV1 | EnvironmentTenantScopeV1 | EnvironmentAwsAccountScopeV1;
export type EnvironmentCapabilitySourceBindingV1 = EnvironmentSourceBindingV1 | EnvironmentTenantSourceBindingV1 | EnvironmentAwsAccountSourceBindingV1;
export interface EnvironmentContentIntegrityV1 {
    mediaType: 'text/markdown; charset=utf-8' | 'application/json';
    byteCount: number;
    contentSha256: string;
    approximateTokenCount: number;
}
interface EnvironmentCapabilityEvidenceBaseV1 {
    evidenceId: string;
    title: string;
    requiredFeatures: readonly string[];
}
export type EnvironmentCapabilityEvidenceDescriptorV1 = (EnvironmentCapabilityEvidenceBaseV1 & {
    mode: 'immutable';
    fileName: string;
    content: EnvironmentContentIntegrityV1 & {
        mediaType: 'application/json';
    };
}) | (EnvironmentCapabilityEvidenceBaseV1 & {
    mode: 'runtime';
    projectorId: string;
});
export interface EnvironmentCapabilityDocumentV1 {
    documentId: string;
    fileName: string;
    /** Owning registered Portal feature; API must authorize this feature independently. */
    capabilityId: string;
    title: string;
    scope: EnvironmentCapabilityScopeV1;
    requiredFeatures: readonly string[];
    content: EnvironmentContentIntegrityV1 & {
        mediaType: 'text/markdown; charset=utf-8';
    };
    evidence: readonly EnvironmentCapabilityEvidenceDescriptorV1[];
}
export interface EnvironmentCapabilityFactV1 {
    factId: string;
    label: string;
    value: {
        kind: 'text';
        value: string;
    } | {
        kind: 'boolean';
        value: boolean;
    } | {
        kind: 'quantity';
        amount: string;
        unit: string;
        basis: 'observed' | 'authoritative-total' | 'estimated';
    } | {
        kind: 'money';
        value: EnvironmentMoneyValueV1<string>;
        meaning: 'observed-spend' | 'price' | 'potential-savings' | 'review-value';
        valuation: 'source-snapshot' | 'current-company';
        additivity: 'non-additive' | 'additive-within-group';
        additiveGroupId?: string;
    } | {
        kind: 'unknown';
        reason: string;
    };
}
export interface EnvironmentCapabilityFactsV1 {
    schemaVersion: 1;
    capabilityId: string;
    documentId: string;
    evidenceId: string;
    scope: EnvironmentCapabilityScopeV1;
    sourceBinding: EnvironmentCapabilitySourceBindingV1;
    observedAt: string;
    coverage: EnvironmentCoverageStateV1;
    sections: readonly {
        sectionId: string;
        title: string;
        facts: Omit<EnvironmentBoundedListV1<EnvironmentCapabilityFactV1>, 'continuationReference'> & {
            continuationReference?: EnvironmentLogicalEvidenceReferenceV1 | EnvironmentAwsLogicalEvidenceReferenceV1;
        };
    }[];
}
export declare const isEnvironmentCapabilityFileNameV1: (value: unknown, mediaType: EnvironmentContentIntegrityV1["mediaType"]) => value is string;
export declare const isEnvironmentCapabilityScopeV1: (value: unknown) => value is EnvironmentCapabilityScopeV1;
export declare function environmentCapabilityScopesEqualV1(left: EnvironmentCapabilityScopeV1, right: EnvironmentCapabilityScopeV1): boolean;
export declare const isEnvironmentCapabilitySourceBindingV1: (value: unknown) => value is EnvironmentCapabilitySourceBindingV1;
export declare const isEnvironmentCapabilityEvidenceDescriptorV1: (value: unknown) => value is EnvironmentCapabilityEvidenceDescriptorV1;
export declare const isEnvironmentCapabilityDocumentV1: (value: unknown) => value is EnvironmentCapabilityDocumentV1;
export declare const isEnvironmentCapabilityDocumentSetV1: (value: unknown, scope: EnvironmentCapabilityScopeV1) => value is EnvironmentCapabilityDocumentV1[];
export declare function getEnvironmentOptionalDocumentDescriptorsV1(pointer: {
    scope: EnvironmentCapabilityScopeV1;
    optionalDocuments?: readonly EnvironmentCapabilityDocumentV1[];
}): readonly EnvironmentCapabilityDocumentV1[];
export declare const isEnvironmentCapabilityFactV1: (value: unknown) => value is EnvironmentCapabilityFactV1;
export declare const isEnvironmentCapabilityFactsV1: (value: unknown) => value is EnvironmentCapabilityFactsV1;
export declare const isEnvironmentImmutableCapabilityFactsV1: (value: unknown) => value is EnvironmentCapabilityFactsV1;
//# sourceMappingURL=optionalDocuments.d.ts.map