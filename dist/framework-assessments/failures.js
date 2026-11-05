"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryableAssessmentError = exports.TerminalAssessmentError = void 0;
/** A producer classifies failures at the boundary that has enough context; messages never decide retry policy. */
class TerminalAssessmentError extends Error {
    constructor(reason) {
        super(reason);
        this.reason = reason;
        this.retryable = false;
        this.name = 'TerminalAssessmentError';
    }
}
exports.TerminalAssessmentError = TerminalAssessmentError;
class RetryableAssessmentError extends Error {
    constructor(reason) {
        super(reason);
        this.reason = reason;
        this.retryable = true;
        this.name = 'RetryableAssessmentError';
    }
}
exports.RetryableAssessmentError = RetryableAssessmentError;
//# sourceMappingURL=failures.js.map