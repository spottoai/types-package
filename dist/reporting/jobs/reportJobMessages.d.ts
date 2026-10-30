export declare const REPORT_JOB_REQUESTED_MESSAGE_TYPE = "report-job.requested";
/** Upper bound for the serialised message body. */
export declare const REPORT_JOB_REQUESTED_MAX_BYTES: number;
export interface ReportJobRequestedV1 {
    schemaVersion: 1;
    messageType: 'report-job.requested';
    /** The single company the report is for; the row's PartitionKey. */
    companyId: string;
    /** The row's RowKey. */
    jobId: string;
    correlationId: string;
}
/** Strict guard: exact keys, valid identifiers, bounded size. Never throws. */
export declare const isReportJobRequestedV1: (value: unknown) => value is ReportJobRequestedV1;
export interface CreateReportJobRequestedInput {
    companyId: string;
    jobId: string;
    /** Default: the job ID. */
    correlationId?: string;
}
export declare const createReportJobRequestedV1: ({ companyId, jobId, correlationId }: CreateReportJobRequestedInput) => ReportJobRequestedV1;
export interface ReportJobBrokerProperties {
    messageId: string;
    correlationId: string;
    contentType: 'application/json';
    subject: 'report-job.requested';
}
/** Service Bus properties for a `ReportJobRequestedV1` send: the shared MessageId drives duplicate detection. */
export declare const buildReportJobRequestedBrokerProperties: (message: ReportJobRequestedV1) => ReportJobBrokerProperties;
//# sourceMappingURL=reportJobMessages.d.ts.map