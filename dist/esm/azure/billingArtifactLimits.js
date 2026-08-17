/**
 * V1 billing artifact object limits in bytes.
 *
 * `StoredBytes` limits apply to the exact persisted object before content
 * decoding. `DecodedBytes` limits apply after decoding or decompression.
 */
export const BILLING_ARTIFACT_OBJECT_LIMITS_V1 = Object.freeze({
    pointerStoredBytes: 64 * 1024,
    observationStoredBytes: 64 * 1024,
    manifestStoredBytes: 1024 * 1024,
    metadataStoredBytes: 4 * 1024 * 1024,
    metadataDecodedBytes: 16 * 1024 * 1024,
    plotStoredBytes: 32 * 1024 * 1024,
    plotDecodedBytes: 128 * 1024 * 1024,
    inputObjectStoredBytes: 32 * 1024 * 1024,
    inputObjectDecodedBytes: 128 * 1024 * 1024,
    maxInputObjects: 12,
});
