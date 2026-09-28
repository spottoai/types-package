import { type ReportJobReportType, type ReportJobSpecV1 } from './reportJobSpec';
import { type ReportJobFailureCode, type ReportJobFailureStage, type ReportJobNotificationStatus, type ReportJobStatus } from './reportJobStatus';
export declare const REPORT_JOB_ROW_SCHEMA_VERSION = 1;
export declare const REPORT_JOB_TRIGGERS: readonly ["api", "schedule"];
export type ReportJobTrigger = (typeof REPORT_JOB_TRIGGERS)[number];
/** UTF-8 byte limit of `sourceCoverageSummary` (a JSON object). */
export declare const REPORT_JOB_COVERAGE_SUMMARY_MAX_BYTES: number;
/** Written once by the API or the scheduler adapter; immutable afterwards. */
export interface ReportJobProducerFieldsV1 {
    PartitionKey: string;
    RowKey: string;
    schemaVersion: 1;
    jobId: string;
    companyId: string;
    reportType: ReportJobReportType;
    trigger: ReportJobTrigger;
    /** Schedule jobs only. */
    scheduleId?: string;
    /** Schedule jobs only. */
    definitionRevision?: number;
    /** Schedule jobs only: the occurrence the job is for (the job ID's instant). */
    scheduledForUtc?: string;
    /** When the producer accepted the job (the job ID's instant for API jobs). */
    requestedAtUtc: string;
    requestedByUserId?: string;
    coalescedOccurrenceCount?: number;
    /** Canonical `serializeReportJobSpecV1` output. */
    requestJson: string;
    requestSha256: string;
    fileName: string;
    notificationPolicyId?: string;
}
/** Merged by reportworker. The producer inserts `status: 'accepted'` and `attemptCount: 0`. */
export interface ReportJobWorkerFieldsV1 {
    status: ReportJobStatus;
    attemptCount: number;
    leaseOwner?: string;
    leaseExpiresAtUtc?: string;
    startedAtUtc?: string;
    lastAttemptAtUtc?: string;
    sourceObservedAtUtc?: string;
    sourceSnapshotSha256?: string;
    /** A JSON object, at most 8 KiB of UTF-8. */
    sourceCoverageSummary?: string;
    generatedAtUtc?: string;
    artifactContentSha256?: string;
    artifactBytes?: number;
    completedAtUtc?: string;
    failureStage?: ReportJobFailureStage;
    failureCode?: ReportJobFailureCode;
    lastTransientErrorCode?: string;
}
/** Merged by cloud-engine's notifier (phase 6). The producer inserts `notificationStatus: 'none'`. */
export interface ReportJobNotificationFieldsV1 {
    notificationStatus: ReportJobNotificationStatus;
}
export type ReportJobRowV1 = ReportJobProducerFieldsV1 & ReportJobWorkerFieldsV1 & ReportJobNotificationFieldsV1;
export declare const REPORT_JOB_PRODUCER_FIELDS: readonly ["PartitionKey", "RowKey", "schemaVersion", "jobId", "companyId", "reportType", "trigger", "scheduleId", "definitionRevision", "scheduledForUtc", "requestedAtUtc", "requestedByUserId", "coalescedOccurrenceCount", "requestJson", "requestSha256", "fileName", "notificationPolicyId"];
export declare const REPORT_JOB_WORKER_FIELDS: readonly ["status", "attemptCount", "leaseOwner", "leaseExpiresAtUtc", "startedAtUtc", "lastAttemptAtUtc", "sourceObservedAtUtc", "sourceSnapshotSha256", "sourceCoverageSummary", "generatedAtUtc", "artifactContentSha256", "artifactBytes", "completedAtUtc", "failureStage", "failureCode", "lastTransientErrorCode"];
export declare const REPORT_JOB_NOTIFICATION_FIELDS: readonly ["notificationStatus"];
export type ReportJobRowParseResult = {
    ok: true;
    row: ReportJobRowV1;
    spec: ReportJobSpecV1;
} | {
    ok: false;
    code: Extract<ReportJobFailureCode, 'request-invalid' | 'request-hash-mismatch' | 'unsupported-schema-version'>;
    errors: string[];
};
/**
 * Validates a stored row and its request. Accepts REST (`PartitionKey`) and `@azure/data-tables` (`partitionKey`)
 * key casing and ignores Table system properties. Checks keys against the body, the job ID against the trigger's
 * instant, status against the fields that prove it, the report type and scope hash against the spec, the request's
 * canonical form and `requestSha256`. Returns the row in REST casing. Never throws.
 */
export declare const parseReportJobRowV1: (entity: unknown) => Promise<ReportJobRowParseResult>;
export type BuildReportJobRowInput = {
    companyId: string;
    spec: ReportJobSpecV1;
    fileName: string;
    requestedAtUtc: string;
    requestedByUserId?: string;
    notificationPolicyId?: string;
} & ({
    trigger: 'api';
} | {
    trigger: 'schedule';
    scheduleId: string;
    definitionRevision: number;
    scheduledForUtc: string;
    coalescedOccurrenceCount?: number;
});
/**
 * Builds the row a producer inserts (status `accepted`, attempt 0, notification `none`), with the job ID derived
 * from the trigger's instant and the request. The result is validated with `parseReportJobRowV1`; invalid input throws.
 */
export declare const buildReportJobRowV1: (input: BuildReportJobRowInput) => Promise<ReportJobRowV1>;
//# sourceMappingURL=reportJobRow.d.ts.map