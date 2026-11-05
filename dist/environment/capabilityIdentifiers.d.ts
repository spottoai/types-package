import type { EnvironmentCapabilityScopeV1 } from './optionalDocuments.js';
/** Bounded identifiers are policy-neutral: API owns registered-feature authorization. */
export declare const isEnvironmentCapabilityIdentifierV1: (value: unknown) => value is string;
export interface ParsedEnvironmentCapabilityEvidenceReferenceV1 {
    scope: EnvironmentCapabilityScopeV1;
    capabilityId: string;
    documentId: string;
    evidenceId: string;
}
/** Canonical tuple parsing is independent of pointer/projection validators to keep ESM initialization acyclic. */
export declare function parseEnvironmentCapabilityEvidenceSubjectV1(value: string): ParsedEnvironmentCapabilityEvidenceReferenceV1 | null;
//# sourceMappingURL=capabilityIdentifiers.d.ts.map