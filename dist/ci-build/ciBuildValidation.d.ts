import { type CiBuildCollectRequestMessage, type CiBuildLatestPointer, type CiBuildSummaryArtifact } from './ciBuild';
export declare function isCiBuildCollectRequestMessage(value: unknown): value is CiBuildCollectRequestMessage;
/** Structural guard for the CI build summary artifact. Actors and personal identifiers are never published. */
export declare function isCiBuildSummaryArtifact(value: unknown): value is CiBuildSummaryArtifact;
export declare function isCiBuildLatestPointer(value: unknown): value is CiBuildLatestPointer;
//# sourceMappingURL=ciBuildValidation.d.ts.map