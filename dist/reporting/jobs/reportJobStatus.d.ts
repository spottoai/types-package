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
 * Each failure code and its stage. Exhausted retries/recovery take the explicit stage from the writer.
 */
/** Bounded report requirement names; no tenant-controlled strings enter failure metadata. */
export declare const REPORT_JOB_FAILURE_CODE_BY_FEATURE: {
    readonly report_resource_insights: "resource-insights-disabled";
    readonly resources: "resources-disabled";
    readonly recommendations: "recommendations-disabled";
    readonly security: "security-disabled";
    readonly perimeter_insights: "perimeter-insights-disabled";
    readonly data_protection: "data-protection-disabled";
    readonly service_retirement: "service-retirement-disabled";
    readonly licensing: "licensing-disabled";
    readonly microsoft_365_licenses: "microsoft-365-licenses-disabled";
    readonly cost_tree: "cost-tree-disabled";
    readonly commitments_planning: "commitments-planning-disabled";
    readonly recommendations_cost: "cost-recommendations-disabled";
    readonly recommendations_performance: "performance-recommendations-disabled";
    readonly recommendations_reliability: "reliability-recommendations-disabled";
    readonly recommendations_security: "security-recommendations-disabled";
    readonly recommendations_compliance: "compliance-recommendations-disabled";
    readonly recommendations_operational_excellence: "operational-excellence-recommendations-disabled";
};
export declare const REPORT_JOB_FAILURE_STAGE_BY_CODE: {
    readonly 'request-invalid': "request";
    readonly 'publication-rejected': "request";
    readonly 'recovery-exhausted': null;
    readonly 'request-hash-mismatch': "request";
    readonly 'message-row-mismatch': "request";
    readonly 'region-mismatch': "request";
    readonly 'unsupported-schema-version': "request";
    readonly 'notifications-not-enabled': "request";
    readonly 'report-type-disabled': "request";
    readonly 'company-not-found': "authorization-or-entitlement";
    readonly 'entitlement-missing': "authorization-or-entitlement";
    readonly 'requester-unresolved': "authorization-or-entitlement";
    readonly 'reporting-disabled': "authorization-or-entitlement";
    readonly 'data-exports-disabled': "authorization-or-entitlement";
    readonly 'source-feature-disabled': "authorization-or-entitlement";
    readonly 'recommendation-category-disabled': "authorization-or-entitlement";
    readonly 'action-permission-missing': "authorization-or-entitlement";
    readonly 'demo-company': "authorization-or-entitlement";
    readonly 'delivery-policy-invalid': "authorization-or-entitlement";
    readonly 'resource-insights-disabled': "authorization-or-entitlement";
    readonly 'resources-disabled': "authorization-or-entitlement";
    readonly 'recommendations-disabled': "authorization-or-entitlement";
    readonly 'security-disabled': "authorization-or-entitlement";
    readonly 'perimeter-insights-disabled': "authorization-or-entitlement";
    readonly 'data-protection-disabled': "authorization-or-entitlement";
    readonly 'service-retirement-disabled': "authorization-or-entitlement";
    readonly 'licensing-disabled': "authorization-or-entitlement";
    readonly 'microsoft-365-licenses-disabled': "authorization-or-entitlement";
    readonly 'cost-tree-disabled': "authorization-or-entitlement";
    readonly 'commitments-planning-disabled': "authorization-or-entitlement";
    readonly 'cost-recommendations-disabled': "authorization-or-entitlement";
    readonly 'performance-recommendations-disabled': "authorization-or-entitlement";
    readonly 'reliability-recommendations-disabled': "authorization-or-entitlement";
    readonly 'security-recommendations-disabled': "authorization-or-entitlement";
    readonly 'compliance-recommendations-disabled': "authorization-or-entitlement";
    readonly 'operational-excellence-recommendations-disabled': "authorization-or-entitlement";
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
 * The stage to record. `retries-exhausted` and `recovery-exhausted` require the caller's current stage.
 */
export declare const resolveReportJobFailureStage: (code: ReportJobFailureCode, currentStage?: ReportJobFailureStage) => ReportJobFailureStage;
//# sourceMappingURL=reportJobStatus.d.ts.map