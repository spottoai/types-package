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
];
export const REPORT_JOB_TERMINAL_STATUSES = ['completed', 'completed-with-notification-errors', 'failed'];
/** Allowed status changes. Every non-terminal status may also move to `failed`. */
export const REPORT_JOB_STATUS_TRANSITIONS = {
    accepted: ['running', 'failed'],
    running: ['source-ready', 'failed'],
    'source-ready': ['generated', 'failed'],
    generated: ['completed', 'completed-with-notification-errors', 'failed'],
    completed: [],
    'completed-with-notification-errors': [],
    failed: [],
};
export const isReportJobStatus = (value) => typeof value === 'string' && REPORT_JOB_STATUSES.includes(value);
export const isTerminalReportJobStatus = (status) => REPORT_JOB_TERMINAL_STATUSES.includes(status);
export const canTransitionReportJobStatus = (from, to) => REPORT_JOB_STATUS_TRANSITIONS[from].includes(to);
export const REPORT_JOB_NOTIFICATION_STATUSES = ['none', 'pending', 'delivered', 'partially-delivered', 'attachment-too-large', 'failed'];
export const isReportJobNotificationStatus = (value) => typeof value === 'string' && REPORT_JOB_NOTIFICATION_STATUSES.includes(value);
export const REPORT_JOB_FAILURE_STAGES = [
    'request',
    'authorization-or-entitlement',
    'scope-resolution',
    'source-load',
    'report-model',
    'document-render',
    'artifact-persist',
    'notification',
];
export const isReportJobFailureStage = (value) => typeof value === 'string' && REPORT_JOB_FAILURE_STAGES.includes(value);
/**
 * Each failure code and its stage. Exhausted retries/recovery take the explicit stage from the writer.
 */
/** Bounded report requirement names; no tenant-controlled strings enter failure metadata. */
export const REPORT_JOB_FAILURE_CODE_BY_FEATURE = {
    report_resource_insights: 'resource-insights-disabled',
    resources: 'resources-disabled',
    recommendations: 'recommendations-disabled',
    security: 'security-disabled',
    perimeter_insights: 'perimeter-insights-disabled',
    data_protection: 'data-protection-disabled',
    service_retirement: 'service-retirement-disabled',
    licensing: 'licensing-disabled',
    microsoft_365_licenses: 'microsoft-365-licenses-disabled',
    cost_tree: 'cost-tree-disabled',
    commitments_planning: 'commitments-planning-disabled',
    recommendations_cost: 'cost-recommendations-disabled',
    recommendations_performance: 'performance-recommendations-disabled',
    recommendations_reliability: 'reliability-recommendations-disabled',
    recommendations_security: 'security-recommendations-disabled',
    recommendations_compliance: 'compliance-recommendations-disabled',
    recommendations_operational_excellence: 'operational-excellence-recommendations-disabled',
};
export const REPORT_JOB_FAILURE_STAGE_BY_CODE = {
    'request-invalid': 'request',
    'publication-rejected': 'request',
    'recovery-exhausted': null,
    'request-hash-mismatch': 'request',
    'message-row-mismatch': 'request',
    'region-mismatch': 'request',
    'unsupported-schema-version': 'request',
    'notifications-not-enabled': 'request',
    'report-type-disabled': 'request',
    'company-not-found': 'authorization-or-entitlement',
    'entitlement-missing': 'authorization-or-entitlement',
    'requester-unresolved': 'authorization-or-entitlement',
    'reporting-disabled': 'authorization-or-entitlement',
    'data-exports-disabled': 'authorization-or-entitlement',
    'source-feature-disabled': 'authorization-or-entitlement',
    'recommendation-category-disabled': 'authorization-or-entitlement',
    'action-permission-missing': 'authorization-or-entitlement',
    'demo-company': 'authorization-or-entitlement',
    'delivery-policy-invalid': 'authorization-or-entitlement',
    'resource-insights-disabled': 'authorization-or-entitlement',
    'resources-disabled': 'authorization-or-entitlement',
    'recommendations-disabled': 'authorization-or-entitlement',
    'security-disabled': 'authorization-or-entitlement',
    'perimeter-insights-disabled': 'authorization-or-entitlement',
    'data-protection-disabled': 'authorization-or-entitlement',
    'service-retirement-disabled': 'authorization-or-entitlement',
    'licensing-disabled': 'authorization-or-entitlement',
    'microsoft-365-licenses-disabled': 'authorization-or-entitlement',
    'cost-tree-disabled': 'authorization-or-entitlement',
    'commitments-planning-disabled': 'authorization-or-entitlement',
    'cost-recommendations-disabled': 'authorization-or-entitlement',
    'performance-recommendations-disabled': 'authorization-or-entitlement',
    'reliability-recommendations-disabled': 'authorization-or-entitlement',
    'security-recommendations-disabled': 'authorization-or-entitlement',
    'compliance-recommendations-disabled': 'authorization-or-entitlement',
    'operational-excellence-recommendations-disabled': 'authorization-or-entitlement',
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
export const REPORT_JOB_FAILURE_CODES = Object.keys(REPORT_JOB_FAILURE_STAGE_BY_CODE);
export const isReportJobFailureCode = (value) => typeof value === 'string' && Object.prototype.hasOwnProperty.call(REPORT_JOB_FAILURE_STAGE_BY_CODE, value);
/**
 * The stage to record. `retries-exhausted` and `recovery-exhausted` require the caller's current stage.
 */
export const resolveReportJobFailureStage = (code, currentStage) => {
    const stage = REPORT_JOB_FAILURE_STAGE_BY_CODE[code];
    if (stage)
        return stage;
    if (!currentStage)
        throw new Error(`Failure code ${code} needs the stage the attempt was in.`);
    return currentStage;
};
