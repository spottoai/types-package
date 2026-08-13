/** Validates a generation-relative logical artifact reference without accepting physical-path encodings. */
export declare const isStrictLogicalArtifactReference: (value: unknown) => value is string;
interface RuntimeArtifactRevisionVector {
    ownershipEpochRevision?: number;
    sourceRevision: number;
    policyRevision: number;
}
/** Validates the positive source/policy revision vector shared by evidence producers and consumers. */
export declare const isArtifactRevisionVector: (value: unknown) => value is RuntimeArtifactRevisionVector;
/** Validates optional dependency revision components using the shared revision-vector rules. */
export declare const hasValidOptionalArtifactRevisionComponents: (value: {
    sourceRevision?: unknown;
    policyRevision?: unknown;
}) => boolean;
export {};
//# sourceMappingURL=artifactEvidenceValidation.d.ts.map