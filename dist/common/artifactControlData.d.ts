export declare const ARTIFACT_CONTROL_DATA_MAX_VISITED_NODES = 100000;
export interface AllowedArtifactReferenceField {
    object: Record<string, unknown>;
    key: string;
    allowUriScheme?: boolean;
    allowUriSchemeInStringArray?: boolean;
    allowDigestLike?: boolean;
    allowControlField?: boolean;
    allowChildArtifactFields?: boolean;
}
interface IArtifactControlDataScanOptions {
    rejectDigestLikeValues?: boolean;
    requireSafeAzureResourceIds?: boolean;
    forbiddenControlFields?: ReadonlySet<string>;
    requireAllowedFieldTraversalContext?: boolean;
}
/** Marks a structurally validated schema field whose logical reference name is allowed. */
export declare const allowedArtifactReferenceField: (object: unknown, key: string) => AllowedArtifactReferenceField[];
/** Marks a structurally validated identity field whose value is allowed by its owning schema. */
export declare const allowedArtifactIdentityField: (object: unknown, key: string) => AllowedArtifactReferenceField[];
/** Rejects normalized sensitive fields and physical-reference control data with bounded traversal. */
export declare const containsForbiddenArtifactControlData: (value: unknown, allowedReferenceFields?: AllowedArtifactReferenceField[], options?: IArtifactControlDataScanOptions) => boolean;
export {};
//# sourceMappingURL=artifactControlData.d.ts.map