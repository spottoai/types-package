export declare const AI_CHAT_ANSWER_PRESENTATION_LIMITS_V1: Readonly<{
    readonly visualArtifacts: 3;
    readonly artifacts: 5;
    readonly artifactIdScalars: 128;
}>;
/** Server-owned final presentation, independent of response mode, route and model confidence. */
export interface AIChatAnswerPresentationV1 {
    schemaVersion: 1;
    kind: 'visual' | 'brief' | 'full';
    /** References to accepted artifacts in this response, in reading order. */
    artifactIds: string[];
}
/** Consumers ignore unsupported optional presentation metadata without discarding the answer. */
export declare const isAIChatAnswerPresentationV1: (value: unknown) => value is AIChatAnswerPresentationV1;
//# sourceMappingURL=answerPresentation.d.ts.map