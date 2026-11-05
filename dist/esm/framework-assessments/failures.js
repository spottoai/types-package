/** A producer classifies failures at the boundary that has enough context; messages never decide retry policy. */
export class TerminalAssessmentError extends Error {
    constructor(reason) {
        super(reason);
        this.reason = reason;
        this.retryable = false;
        this.name = 'TerminalAssessmentError';
    }
}
export class RetryableAssessmentError extends Error {
    constructor(reason) {
        super(reason);
        this.reason = reason;
        this.retryable = true;
        this.name = 'RetryableAssessmentError';
    }
}
