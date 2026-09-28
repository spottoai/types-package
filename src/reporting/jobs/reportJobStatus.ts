/**
 * Background report job status, failure stage and failure code vocabularies
 * (core/specs/reporting/reporting-scheduler.md, "Report job table").
 *
 * Status is a monotonic milestone: retries change `attemptCount` and the lease, never move status backwards.
 */

export const REPORT_JOB_STATUSES = [
  'accepted',
  'running',
  'source-ready',
  'generated',
  'completed',
  'completed-with-notification-errors',
  'failed',
] as const;
export type ReportJobStatus = (typeof REPORT_JOB_STATUSES)[number];

export const REPORT_JOB_TERMINAL_STATUSES: readonly ReportJobStatus[] = ['completed', 'completed-with-notification-errors', 'failed'];

/** Allowed status changes. Every non-terminal status may also move to `failed`. */
export const REPORT_JOB_STATUS_TRANSITIONS: Readonly<Record<ReportJobStatus, readonly ReportJobStatus[]>> = {
  accepted: ['running', 'failed'],
  running: ['source-ready', 'failed'],
  'source-ready': ['generated', 'failed'],
  generated: ['completed', 'completed-with-notification-errors', 'failed'],
  completed: [],
  'completed-with-notification-errors': [],
  failed: [],
};

export const isReportJobStatus = (value: unknown): value is ReportJobStatus =>
  typeof value === 'string' && (REPORT_JOB_STATUSES as readonly string[]).includes(value);

export const isTerminalReportJobStatus = (status: ReportJobStatus): boolean => REPORT_JOB_TERMINAL_STATUSES.includes(status);

export const canTransitionReportJobStatus = (from: ReportJobStatus, to: ReportJobStatus): boolean => REPORT_JOB_STATUS_TRANSITIONS[from].includes(to);

export const REPORT_JOB_NOTIFICATION_STATUSES = ['none', 'pending', 'delivered', 'partially-delivered', 'attachment-too-large', 'failed'] as const;
export type ReportJobNotificationStatus = (typeof REPORT_JOB_NOTIFICATION_STATUSES)[number];

export const isReportJobNotificationStatus = (value: unknown): value is ReportJobNotificationStatus =>
  typeof value === 'string' && (REPORT_JOB_NOTIFICATION_STATUSES as readonly string[]).includes(value);

export const REPORT_JOB_FAILURE_STAGES = [
  'request',
  'authorization-or-entitlement',
  'scope-resolution',
  'source-load',
  'report-model',
  'document-render',
  'artifact-persist',
  'notification',
] as const;
export type ReportJobFailureStage = (typeof REPORT_JOB_FAILURE_STAGES)[number];

export const isReportJobFailureStage = (value: unknown): value is ReportJobFailureStage =>
  typeof value === 'string' && (REPORT_JOB_FAILURE_STAGES as readonly string[]).includes(value);

/**
 * Each failure code and the stage it belongs to. `retries-exhausted` has no fixed stage: the writer records the
 * stage the last attempt was in.
 */
export const REPORT_JOB_FAILURE_STAGE_BY_CODE = {
  'request-invalid': 'request',
  'request-hash-mismatch': 'request',
  'message-row-mismatch': 'request',
  'region-mismatch': 'request',
  'unsupported-schema-version': 'request',
  'notifications-not-enabled': 'request',
  'report-type-disabled': 'request',
  'company-not-found': 'authorization-or-entitlement',
  'entitlement-missing': 'authorization-or-entitlement',
  'scope-not-owned': 'scope-resolution',
  'scope-load-failed': 'scope-resolution',
  'no-ready-subscriptions': 'scope-resolution',
  'source-not-ready': 'source-load',
  'source-invalid': 'source-load',
  'snapshot-too-large': 'source-load',
  'snapshot-invalid': 'source-load',
  'invalid-rate': 'report-model',
  'invalid-currency': 'report-model',
  'no-prepared-by': 'report-model',
  'model-error': 'report-model',
  'render-error': 'document-render',
  'docx-invalid': 'document-render',
  'artifact-too-large': 'document-render',
  'artifact-conflict': 'artifact-persist',
  'artifact-integrity': 'artifact-persist',
  'retries-exhausted': null,
} as const satisfies Record<string, ReportJobFailureStage | null>;

export type ReportJobFailureCode = keyof typeof REPORT_JOB_FAILURE_STAGE_BY_CODE;

export const REPORT_JOB_FAILURE_CODES = Object.keys(REPORT_JOB_FAILURE_STAGE_BY_CODE) as ReportJobFailureCode[];

export const isReportJobFailureCode = (value: unknown): value is ReportJobFailureCode =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(REPORT_JOB_FAILURE_STAGE_BY_CODE, value);

/**
 * The stage to record for a failure code. `retries-exhausted` requires the caller's current stage.
 */
export const resolveReportJobFailureStage = (code: ReportJobFailureCode, currentStage?: ReportJobFailureStage): ReportJobFailureStage => {
  const stage = REPORT_JOB_FAILURE_STAGE_BY_CODE[code];
  if (stage) return stage;
  if (!currentStage) throw new Error(`Failure code ${code} needs the stage the attempt was in.`);
  return currentStage;
};
