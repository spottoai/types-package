/**
 * V1 billing artifact object limits in bytes.
 *
 * `StoredBytes` limits apply to the exact persisted object before content
 * decoding. `DecodedBytes` limits apply after decoding or decompression.
 */
export declare const BILLING_ARTIFACT_OBJECT_LIMITS_V1: Readonly<{
    readonly pointerStoredBytes: number;
    readonly observationStoredBytes: number;
    readonly manifestStoredBytes: number;
    readonly metadataStoredBytes: number;
    readonly metadataDecodedBytes: number;
    readonly plotStoredBytes: number;
    readonly plotDecodedBytes: number;
    readonly inputObjectStoredBytes: number;
    readonly inputObjectDecodedBytes: number;
    readonly maxInputObjects: 12;
}>;
//# sourceMappingURL=billingArtifactLimits.d.ts.map