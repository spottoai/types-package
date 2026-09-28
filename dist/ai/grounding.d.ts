import type { EnvironmentArtifactKindV1, EnvironmentCoverageStateV1 } from '../environment/contracts.js';
export declare const AI_CHAT_GROUNDING_LIMITS_V1: Readonly<{
    readonly claims: 128;
    readonly citationsPerClaim: 32;
    readonly identifierScalars: 128;
    readonly figures: 128;
    readonly figureTextScalars: 96;
}>;
export declare const AI_CHAT_GROUNDING_REASON_CODES_V1: readonly ["grounding.not-required", "grounding.claim-extraction-failed", "grounding.missing-citation", "grounding.source-unavailable", "grounding.source-stale", "grounding.generation-mismatch", "grounding.value-mismatch", "grounding.unsupported-claim", "grounding.figure-unreferenced", "grounding.reference-unresolved"];
export type AIChatGroundingReasonCodeV1 = (typeof AI_CHAT_GROUNDING_REASON_CODES_V1)[number];
/** `partial` is produced only by the `server-rendered-figures` method. */
export type AIChatGroundingStatusV1 = 'verified' | 'partial' | 'unverified' | 'not-required';
export type AIChatClaimVerificationStatusV1 = 'verified' | 'unverified';
export type AIEnvironmentEvidenceCoverageStatusV1 = EnvironmentCoverageStateV1['status'];
/**
 * `deterministic-citation-and-value`: the model restated each value and declared claims that the server compared.
 * `server-rendered-figures`: the model wrote figure references and the server rendered every verified figure from
 * bound evidence, so `claims` is empty and `figures` carries the per-figure result.
 */
export type AIChatGroundingMethodV1 = 'deterministic-citation-and-value' | 'server-rendered-figures';
export type AIChatGroundedFigureKindV1 = 'money' | 'percentage' | 'quantity' | 'date';
export type AIChatGroundedFigureStatusV1 = 'verified' | 'unverified';
/**
 * HTML attribute the API puts on the element wrapping each figure in the answer. Its value is the figure's
 * `figureId`, so clients anchor provenance without matching text.
 */
export declare const AI_CHAT_GROUNDED_FIGURE_ANCHOR_ATTRIBUTE_V1 = "data-spotto-figure";
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
    reasonCode?: Exclude<AIChatGroundingReasonCodeV1, 'grounding.not-required' | AIChatFigureOnlyReasonCodeV1>;
}
type AIChatFigureOnlyReasonCodeV1 = 'grounding.figure-unreferenced' | 'grounding.reference-unresolved';
/**
 * One figure visible in the final answer. A verified figure was rendered by the server from the cited evidence;
 * an unverified figure was typed by the model and was not checked.
 */
export interface AIChatGroundedFigureV1 {
    figureId: string;
    status: AIChatGroundedFigureStatusV1;
    kind: AIChatGroundedFigureKindV1;
    /** Exact visible text of the figure, for example `NZ$705.72 per month`. */
    text: string;
    /** At least one citation when verified; empty when unverified. */
    citationIds: string[];
    /** Required when unverified. */
    reasonCode?: 'grounding.figure-unreferenced';
}
/** Deterministic grounding result. This is evidence verification, never model confidence. */
export interface AIChatGroundingSummary {
    status: AIChatGroundingStatusV1;
    method: AIChatGroundingMethodV1;
    totalClaimCount: number;
    verifiedClaimCount: number;
    claims: AIChatClaimVerificationV1[];
    /** Present only, and always, with the `server-rendered-figures` method. */
    figures?: AIChatGroundedFigureV1[];
    reasonCode?: AIChatGroundingReasonCodeV1;
}
/** Strictly validates client-safe environment evidence metadata. */
export declare const isAIEnvironmentEvidenceMatch: (value: unknown) => value is AIEnvironmentEvidenceMatch;
/** Strictly validates one grounded figure. */
export declare const isAIChatGroundedFigureV1: (value: unknown) => value is AIChatGroundedFigureV1;
/** Strictly validates deterministic summary, claim-level and figure-level citation invariants. */
export declare const isAIChatGroundingSummary: (value: unknown) => value is AIChatGroundingSummary;
export {};
//# sourceMappingURL=grounding.d.ts.map