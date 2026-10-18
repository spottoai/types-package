/** A producer classifies failures at the boundary that has enough context; messages never decide retry policy. */
export class TerminalAssessmentError extends Error {
  readonly retryable = false;
  constructor(readonly reason: string) {
    super(reason);
    this.name = 'TerminalAssessmentError';
  }
}
export class RetryableAssessmentError extends Error {
  readonly retryable = true;
  constructor(readonly reason: string) {
    super(reason);
    this.name = 'RetryableAssessmentError';
  }
}
