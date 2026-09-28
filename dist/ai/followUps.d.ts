export declare const AI_CHAT_FOLLOW_UP_LIMITS_V1: Readonly<{
    readonly suggestions: 3;
    readonly identifierScalars: 64;
    readonly textScalars: 160;
}>;
/**
 * A follow-up question derived from the answer it accompanies (for example a drill-down on the top item).
 * Selecting one sends `text` as the next question; it carries no hidden instructions or tool arguments.
 */
export interface AIChatFollowUpSuggestionV1 {
    suggestionId: string;
    text: string;
}
/** Strictly validates a bounded list of follow-up suggestions with unique ids and unique text. */
export declare const isAIChatFollowUpSuggestions: (value: unknown) => value is AIChatFollowUpSuggestionV1[];
//# sourceMappingURL=followUps.d.ts.map