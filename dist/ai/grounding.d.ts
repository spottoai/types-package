import type { EnvironmentArtifactKindV1, EnvironmentCoverageStateV1 } from '../environment/contracts.js';
export declare const AI_CHAT_GROUNDING_LIMITS_V1: Readonly<{
    readonly claims: 128;
    readonly citationsPerClaim: 32;
    readonly identifierScalars: 128;
}>;
export declare const AI_CHAT_GROUNDING_REASON_CODES_V1: readonly ["grounding.not-required", "grounding.claim-extraction-failed", "grounding.missing-citation", "grounding.source-unavailable", "grounding.source-stale", "grounding.generation-mismatch", "grounding.value-mismatch", "grounding.unsupported-claim"];
export type AIChatGroundingReasonCodeV1 = (typeof AI_CHAT_GROUNDING_REASON_CODES_V1)[number];
export type AIChatGroundingStatusV1 = 'verified' | 'unverified' | 'not-required';
export type AIChatClaimVerificationStatusV1 = 'verified' | 'unverified';
export type AIEnvironmentEvidenceCoverageStatusV1 = EnvironmentCoverageStateV1['status'];
/** Client-safe environment evidence metadata with no scope, generation, storage, or runtime-handle identity. */
export interface AIEnvironmentEvidenceMatch {
    safeLabel: string;
    portalRoute: string;
    artifactKind: EnvironmentArtifactKindV1;
    sourceCompletedAt: string;
    coverageStatus: AIEnvironmentEvidenceCoverageStatusV1;
    truncated: boolean;
    citationIds: string[];
}
export interface AIChatClaimVerificationV1 {
    claimId: string;
    status: AIChatClaimVerificationStatusV1;
    citationIds: string[];
    reasonCode?: Exclude<AIChatGroundingReasonCodeV1, 'grounding.not-required'>;
}
/** Deterministic grounding result. This is evidence verification, never model confidence. */
export interface AIChatGroundingSummary {
    status: AIChatGroundingStatusV1;
    method: 'deterministic-citation-and-value';
    totalClaimCount: number;
    verifiedClaimCount: number;
    claims: AIChatClaimVerificationV1[];
    reasonCode?: AIChatGroundingReasonCodeV1;
}
/** Strictly validates client-safe environment evidence metadata. */
export declare const isAIEnvironmentEvidenceMatch: (value: unknown) => value is AIEnvironmentEvidenceMatch;
/** Strictly validates deterministic summary and claim-level citation invariants. */
export declare const isAIChatGroundingSummary: (value: unknown) => value is AIChatGroundingSummary;
//# sourceMappingURL=grounding.d.ts.map