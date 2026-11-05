import type { AIChatWorkspaceInternalLink } from './workspaceArtifacts.js';
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
/**
 * An answer-level navigation button (interactive answers, 1.1.24). Built by the server from the turn's own visuals and
 * resolved scope, never named by the model; the route is always a company-anchored Portal route, which the Portal
 * re-checks against its own allowlist.
 */
export interface AIChatAnswerNextActionV1 {
    actionId: string;
    /** Title Case, at most 40 characters, product-agnostic. */
    label: string;
    link: AIChatWorkspaceInternalLink;
}
export declare const AI_CHAT_ANSWER_NEXT_ACTION_LIMITS_V1: Readonly<{
    readonly actions: 3;
    readonly labelChars: 40;
}>;
/** A drill-down click: opaque references only. The server rebuilds the question from its stored binding. */
export interface AIChatDrillDownInvocationV1 {
    turnId: string;
    artifactId: string;
    elementKey: string;
}
//# sourceMappingURL=followUps.d.ts.map