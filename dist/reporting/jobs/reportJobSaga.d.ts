import { type ReportJobFailureCode, type ReportJobNotificationStatus, type ReportJobStatus } from './reportJobStatus';
export declare const REPORT_ARTIFACT_RETENTION_DAYS = 30;
export declare const REPORT_ARTIFACT_RETENTION_MS: number;
export declare const REPORT_SAGA_PHASES: readonly ["queued", "source-load", "render", "artifact-persist", "notification", "complete", "retention"];
export type ReportSagaPhase = (typeof REPORT_SAGA_PHASES)[number];
export declare const REPORT_PROGRESS_STATUSES: readonly ["queued", "generating", "retrying", "sending", "sent", "partially-sent", "ready", "not-delivered", "failed", "expired"];
export type ReportProgressStatus = (typeof REPORT_PROGRESS_STATUSES)[number];
export interface ReportSagaStepV1 {
    phase: ReportSagaPhase;
    status: 'running' | 'completed' | 'failed';
    startedAtUtc: string;
    updatedAtUtc: string;
}
/** Public lifecycle summary. No storage addresses, lease owners, recipients or request JSON. */
export interface ReportJobProgressV1 {
    status: ReportProgressStatus;
    phase: ReportSagaPhase;
    updatedAtUtc: string;
    artifactExpiresAtUtc?: string;
    artifactExpiredAtUtc?: string;
    nextAttemptAtUtc?: string;
    deliveryFailureCode?: ReportJobFailureCode;
    steps: ReportSagaStepV1[];
}
/** Private per-run workflow file. Admission and execution leases remain fenced by the job Table ETag. */
export interface ReportSagaV1 {
    version: 1;
    companyId: string;
    jobId: string;
    requestSha256: string;
    rowEtag: string;
    rowVersion: string;
    status: ReportJobStatus;
    notificationStatus: ReportJobNotificationStatus;
    generationAttemptCount: number;
    notificationAttemptCount: number;
    updatedAtUtc: string;
    leaseExpiresAtUtc?: string;
    nextAttemptAtUtc?: string;
    artifactExpiresAtUtc?: string;
    artifactExpiredAtUtc?: string;
    retentionState?: 'deleting' | 'expired';
    artifactAvailableAtUtc?: string;
    artifactContentSha256?: string;
    steps: ReportSagaStepV1[];
}
export declare const isReportJobProgressV1: (value: unknown) => value is ReportJobProgressV1;
export declare const isReportSagaV1: (value: unknown) => value is ReportSagaV1;
//# sourceMappingURL=reportJobSaga.d.ts.map