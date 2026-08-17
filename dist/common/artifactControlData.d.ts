export interface AllowedArtifactReferenceField {
    object: Record<string, unknown>;
    key: string;
    allowUriScheme?: boolean;
    allowUriSchemeInStringArray?: boolean;
}
/** Marks a structurally validated schema field whose logical reference name is allowed. */
export declare const allowedArtifactReferenceField: (object: unknown, key: string) => AllowedArtifactReferenceField[];
/** Marks a structurally validated identity field whose value is allowed by its owning schema. */
export declare const allowedArtifactIdentityField: (object: unknown, key: string) => AllowedArtifactReferenceField[];
/** Rejects exact normalized sensitive fields and physical-reference control data recursively. */
export declare const containsForbiddenArtifactControlData: (value: unknown, allowedReferenceFields?: AllowedArtifactReferenceField[]) => boolean;
//# sourceMappingURL=artifactControlData.d.ts.map