/** A hint precedes acceptance; consumers point-read the authoritative company job row. */
export declare const REPORT_JOB_RECOVERY_TABLE = "reportjobrecovery";
export declare const REPORT_WORKER_RECOVERY_TABLE = "reportworkerrecovery";
export declare const REPORT_JOB_RECOVERY_SHARDS: string[];
export interface ReportJobRecoveryPointerV1 {
    PartitionKey: string;
    RowKey: string;
    schemaVersion: 1;
    kind: 'report-publication-recovery';
    companyId: string;
    jobId: string;
    createdAtUtc: string;
    nextAttemptAtUtc: string;
    recoveryAttemptCount: number;
    leaseOwner?: string;
    leaseExpiresAtUtc?: string;
}
export type ReportWorkerRecoveryPhase = 'generation-completion' | 'notification' | 'artifact-index';
export interface ReportWorkerRecoveryPointerV1 extends Omit<ReportJobRecoveryPointerV1, 'kind'> {
    kind: 'report-worker-recovery';
    phase: ReportWorkerRecoveryPhase;
}
export declare function buildReportWorkerRecoveryPointerV1(input: {
    companyId: string;
    jobId: string;
    createdAtUtc: string;
    nextAttemptAtUtc?: string;
    phase: ReportWorkerRecoveryPhase;
}): Promise<ReportWorkerRecoveryPointerV1>;
export declare function parseReportWorkerRecoveryPointerV1(entity: unknown): Promise<{
    ok: true;
    value: ReportWorkerRecoveryPointerV1;
} | {
    ok: false;
    errors: string[];
}>;
export declare function buildReportJobRecoveryPointerV1(input: {
    companyId: string;
    jobId: string;
    createdAtUtc: string;
    nextAttemptAtUtc?: string;
}): Promise<ReportJobRecoveryPointerV1>;
export declare function parseReportJobRecoveryPointerV1(entity: unknown): Promise<{
    ok: true;
    value: ReportJobRecoveryPointerV1;
} | {
    ok: false;
    errors: string[];
}>;
//# sourceMappingURL=reportJobRecovery.d.ts.map