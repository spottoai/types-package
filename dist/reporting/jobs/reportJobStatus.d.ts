/**
 * Background report job status, failure stage and failure code vocabularies
 * (core/specs/reporting/reporting-scheduler.md, "Report job table").
 *
 * Status is a monotonic milestone: retries change `attemptCount` and the lease, never move status backwards.
 */
export declare const REPORT_JOB_STATUSES: readonly ["accepted", "running", "source-ready", "generated", "completed", "completed-with-notification-errors", "failed"];
export type ReportJobStatus = (typeof REPORT_JOB_STATUSES)[number];
export declare const REPORT_JOB_TERMINAL_STATUSES: readonly ReportJobStatus[];
/** Allowed status changes. Every non-terminal status may also move to `failed`. */
export declare const REPORT_JOB_STATUS_TRANSITIONS: Readonly<Record<ReportJobStatus, readonly ReportJobStatus[]>>;
export declare const isReportJobStatus: (value: unknown) => value is ReportJobStatus;
export declare const isTerminalReportJobStatus: (status: ReportJobStatus) => boolean;
export declare const canTransitionReportJobStatus: (from: ReportJobStatus, to: ReportJobStatus) => boolean;
export declare const REPORT_JOB_NOTIFICATION_STATUSES: readonly ["none", "pending", "delivered", "partially-delivered", "attachment-too-large", "failed"];
export type ReportJobNotificationStatus = (typeof REPORT_JOB_NOTIFICATION_STATUSES)[number];
export declare const isReportJobNotificationStatus: (value: unknown) => value is ReportJobNotificationStatus;
export declare const REPORT_JOB_FAILURE_STAGES: readonly ["request", "authorization-or-entitlement", "scope-resolution", "source-load", "report-model", "document-render", "artifact-persist", "notification"];
export type ReportJobFailureStage = (typeof REPORT_JOB_FAILURE_STAGES)[number];
export declare const isReportJobFailureStage: (value: unknown) => value is ReportJobFailureStage;
/**
 * Each failure code and the stage it belongs to. `retries-exhausted` has no fixed stage: the writer records the
 * stage the last attempt was in.
 */
export declare const REPORT_JOB_FAILURE_STAGE_BY_CODE: {
    readonly 'request-invalid': "request";
    readonly 'request-hash-mismatch': "request";
    readonly 'message-row-mismatch': "request";
    readonly 'region-mismatch': "request";
    readonly 'unsupported-schema-version': "request";
    readonly 'notifications-not-enabled': "request";
    readonly 'report-type-disabled': "request";
    readonly 'company-not-found': "authorization-or-entitlement";
    readonly 'entitlement-missing': "authorization-or-entitlement";
    readonly 'scope-not-owned': "scope-resolution";
    readonly 'scope-load-failed': "scope-resolution";
    readonly 'no-ready-subscriptions': "scope-resolution";
    readonly 'source-not-ready': "source-load";
    readonly 'source-invalid': "source-load";
    readonly 'snapshot-too-large': "source-load";
    readonly 'snapshot-invalid': "source-load";
    readonly 'invalid-rate': "report-model";
    readonly 'invalid-currency': "report-model";
    readonly 'no-prepared-by': "report-model";
    readonly 'model-error': "report-model";
    readonly 'render-error': "document-render";
    readonly 'docx-invalid': "document-render";
    readonly 'artifact-too-large': "document-render";
    readonly 'artifact-conflict': "artifact-persist";
    readonly 'artifact-integrity': "artifact-persist";
    readonly 'retries-exhausted': null;
};
export type ReportJobFailureCode = keyof typeof REPORT_JOB_FAILURE_STAGE_BY_CODE;
export declare const REPORT_JOB_FAILURE_CODES: ReportJobFailureCode[];
export declare const isReportJobFailureCode: (value: unknown) => value is ReportJobFailureCode;
/**
 * The stage to record for a failure code. `retries-exhausted` requires the caller's current stage.
 */
export declare const resolveReportJobFailureStage: (code: ReportJobFailureCode, currentStage?: ReportJobFailureStage) => ReportJobFailureStage;
//# sourceMappingURL=reportJobStatus.d.ts.map