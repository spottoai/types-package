"use strict";
/**
 * Background report job status, failure stage and failure code vocabularies
 * (core/specs/reporting/reporting-scheduler.md, "Report job table").
 *
 * Status is a monotonic milestone: retries change `attemptCount` and the lease, never move status backwards.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveReportJobFailureStage = exports.isReportJobFailureCode = exports.REPORT_JOB_FAILURE_CODES = exports.REPORT_JOB_FAILURE_STAGE_BY_CODE = exports.isReportJobFailureStage = exports.REPORT_JOB_FAILURE_STAGES = exports.isReportJobNotificationStatus = exports.REPORT_JOB_NOTIFICATION_STATUSES = exports.canTransitionReportJobStatus = exports.isTerminalReportJobStatus = exports.isReportJobStatus = exports.REPORT_JOB_STATUS_TRANSITIONS = exports.REPORT_JOB_TERMINAL_STATUSES = exports.REPORT_JOB_STATUSES = void 0;
exports.REPORT_JOB_STATUSES = [
    'accepted',
    'running',
    'source-ready',
    'generated',
    'completed',
    'completed-with-notification-errors',
    'failed',
];
exports.REPORT_JOB_TERMINAL_STATUSES = ['completed', 'completed-with-notification-errors', 'failed'];
/** Allowed status changes. Every non-terminal status may also move to `failed`. */
exports.REPORT_JOB_STATUS_TRANSITIONS = {
    accepted: ['running', 'failed'],
    running: ['source-ready', 'failed'],
    'source-ready': ['generated', 'failed'],
    generated: ['completed', 'completed-with-notification-errors', 'failed'],
    completed: [],
    'completed-with-notification-errors': [],
    failed: [],
};
const isReportJobStatus = (value) => typeof value === 'string' && exports.REPORT_JOB_STATUSES.includes(value);
exports.isReportJobStatus = isReportJobStatus;
const isTerminalReportJobStatus = (status) => exports.REPORT_JOB_TERMINAL_STATUSES.includes(status);
exports.isTerminalReportJobStatus = isTerminalReportJobStatus;
const canTransitionReportJobStatus = (from, to) => exports.REPORT_JOB_STATUS_TRANSITIONS[from].includes(to);
exports.canTransitionReportJobStatus = canTransitionReportJobStatus;
exports.REPORT_JOB_NOTIFICATION_STATUSES = ['none', 'pending', 'delivered', 'partially-delivered', 'attachment-too-large', 'failed'];
const isReportJobNotificationStatus = (value) => typeof value === 'string' && exports.REPORT_JOB_NOTIFICATION_STATUSES.includes(value);
exports.isReportJobNotificationStatus = isReportJobNotificationStatus;
exports.REPORT_JOB_FAILURE_STAGES = [
    'request',
    'authorization-or-entitlement',
    'scope-resolution',
    'source-load',
    'report-model',
    'document-render',
    'artifact-persist',
    'notification',
];
const isReportJobFailureStage = (value) => typeof value === 'string' && exports.REPORT_JOB_FAILURE_STAGES.includes(value);
exports.isReportJobFailureStage = isReportJobFailureStage;
/**
 * Each failure code and the stage it belongs to. `retries-exhausted` has no fixed stage: the writer records the
 * stage the last attempt was in.
 */
exports.REPORT_JOB_FAILURE_STAGE_BY_CODE = {
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
};
exports.REPORT_JOB_FAILURE_CODES = Object.keys(exports.REPORT_JOB_FAILURE_STAGE_BY_CODE);
const isReportJobFailureCode = (value) => typeof value === 'string' && Object.prototype.hasOwnProperty.call(exports.REPORT_JOB_FAILURE_STAGE_BY_CODE, value);
exports.isReportJobFailureCode = isReportJobFailureCode;
/**
 * The stage to record for a failure code. `retries-exhausted` requires the caller's current stage.
 */
const resolveReportJobFailureStage = (code, currentStage) => {
    const stage = exports.REPORT_JOB_FAILURE_STAGE_BY_CODE[code];
    if (stage)
        return stage;
    if (!currentStage)
        throw new Error(`Failure code ${code} needs the stage the attempt was in.`);
    return currentStage;
};
exports.resolveReportJobFailureStage = resolveReportJobFailureStage;
//# sourceMappingURL=reportJobStatus.js.map