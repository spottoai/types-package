/** A producer classifies failures at the boundary that has enough context; messages never decide retry policy. */
export declare class TerminalAssessmentError extends Error {
    readonly reason: string;
    readonly retryable = false;
    constructor(reason: string);
}
export declare class RetryableAssessmentError extends Error {
    readonly reason: string;
    readonly retryable = true;
    constructor(reason: string);
}
//# sourceMappingURL=failures.d.ts.map