export declare const ARTIFACT_RUN_REFERENCE_V1_LIMITS: Readonly<{
    maxRawUtf8Bytes: 256;
    maxEncodedSegmentLength: 345;
}>;
/** Validates a semantic workflow run ID before it is encoded for a storage namespace. */
export declare const isRawArtifactRunIdV1: (value: unknown) => value is string;
/** Encodes the complete semantic run ID into an injective, path-safe V1 namespace segment. */
export declare const encodeArtifactRunReferenceV1: (rawRunId: string) => string;
/** Validates the bounded path-safe shape emitted by `encodeArtifactRunReferenceV1`. */
export declare const isArtifactRunReferenceV1: (value: unknown) => value is string;
//# sourceMappingURL=artifactRunReference.d.ts.map