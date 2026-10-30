import { type ReportJobProgressV1, type ReportProgressStatus } from './reportJobSaga';
import { type ReportJobNotificationDestinationCountsV1 } from './reportJobNotifications';
import { type ReportJobRowV1, type ReportJobTrigger } from './reportJobRow';
import { type ReportJobPeriodV1, type ReportJobReportType, type ReportJobScopeV1, type ReportJobSpecV1 } from './reportJobSpec';
import { type ReportJobFailureCode, type ReportJobFailureStage, type ReportJobNotificationStatus, type ReportJobStatus } from './reportJobStatus';
export declare const REPORT_JOB_API_GENERATION_LIMIT = 5;
export declare const REPORT_JOB_API_DUPLICATE_WINDOW_MS: number;
export declare const REPORT_JOB_LIST_MAX_RESULTS = 100;
export interface ReportJobCreateRequestV1 {
    schemaVersion: 1;
    report: ReportJobSpecV1;
    notificationPolicyId?: string;
}
export declare const parseReportJobCreateRequestV1: (value: unknown) => {
    ok: true;
    value: ReportJobCreateRequestV1;
} | {
    ok: false;
    errors: string[];
};
export declare const isReportJobCreateRequestV1: (value: unknown) => value is ReportJobCreateRequestV1;
/** Caller/company binding and atomic reservation are repository responsibilities, not part of this hash. */
export declare const buildReportJobAdmissionFingerprintV1: (request: ReportJobCreateRequestV1) => Promise<string>;
export declare const isReportJobIdempotencyKey: (value: unknown) => value is string;
/** A generated job awaiting notification has released its generation slot. Never substitutes for atomic admission. */
export declare const consumesReportJobApiGenerationSlot: (row: Pick<ReportJobRowV1, "trigger" | "status" | "notificationStatus" | "notificationPolicyId">) => boolean;
export interface ReportJobCreateResponseV1 {
    jobId: string;
    reportId: string;
    fileName: string;
    status: ReportJobStatus;
    statusUrl: string;
}
export declare const isReportJobCreateResponseV1: (value: unknown) => value is ReportJobCreateResponseV1;
export interface ReportJobListQueryV1 {
    progressStatus?: ReportProgressStatus;
    pageSize?: number;
    cursor?: string;
    status?: ReportJobStatus;
    trigger?: ReportJobTrigger;
    scheduleId?: string;
    reportType?: ReportJobReportType;
}
export declare const isReportJobListQueryV1: (value: unknown) => value is ReportJobListQueryV1;
/** Deliberate whitelist: no request JSON, configuration, worker lease, paths or recipient details. */
export interface ReportJobProjectionV1 {
    progress?: ReportJobProgressV1;
    schemaVersion: 1;
    companyId: string;
    jobId: string;
    reportId: string;
    reportType: ReportJobReportType;
    trigger: ReportJobTrigger;
    scheduleId?: string;
    definitionRevision?: number;
    scheduledForUtc?: string;
    coalescedOccurrenceCount?: number;
    requestedAtUtc: string;
    scope: ReportJobScopeV1;
    period?: ReportJobPeriodV1;
    status: ReportJobStatus;
    attemptCount: number;
    startedAtUtc?: string;
    sourceObservedAtUtc?: string;
    generatedAtUtc?: string;
    completedAtUtc?: string;
    failureStage?: ReportJobFailureStage;
    failureCode?: ReportJobFailureCode;
    fileName: string;
    artifactBytes?: number;
    notificationStatus: ReportJobNotificationStatus;
    notificationAttemptCount?: number;
    notificationDestinationCounts?: ReportJobNotificationDestinationCountsV1;
    notificationCompletedAtUtc?: string;
    downloadUrl?: string;
}
export declare const isReportJobProjectionV1: (value: unknown) => value is ReportJobProjectionV1;
export declare const buildReportJobProjectionV1: (entity: unknown) => Promise<ReportJobProjectionV1>;
export declare const buildReportJobCreateResponseV1: (entity: unknown) => Promise<ReportJobCreateResponseV1>;
export interface ReportJobListResponseV1 {
    results: ReportJobProjectionV1[];
    continuation?: {
        cursor: string;
    };
}
export declare const isReportJobListResponseV1: (value: unknown) => value is ReportJobListResponseV1;
//# sourceMappingURL=reportJobApi.d.ts.map