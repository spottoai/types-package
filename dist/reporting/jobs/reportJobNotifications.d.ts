export declare const REPORT_JOB_NOTIFICATION_MESSAGE_TYPE = "report-job.notification-requested";
export declare const REPORT_JOB_NOTIFICATION_MAX_BYTES: number;
export declare const REPORT_JOB_NOTIFICATION_MAX_DESTINATIONS = 32;
export declare const REPORT_JOB_NOTIFICATION_CHANNELS: readonly ["email", "slack", "teams", "webhook"];
export type ReportJobNotificationChannel = (typeof REPORT_JOB_NOTIFICATION_CHANNELS)[number];
/** Safe public aggregates only. A grouped email counts its configured destinations, not provider calls. */
export interface ReportJobNotificationDestinationCountV1 {
    total: number;
    delivered: number;
    failed: number;
}
export type ReportJobNotificationDestinationCountsV1 = Partial<Record<ReportJobNotificationChannel, ReportJobNotificationDestinationCountV1>>;
export declare const isReportJobNotificationDestinationCountsV1: (value: unknown) => value is ReportJobNotificationDestinationCountsV1;
export declare const parseReportJobNotificationDestinationCountsV1: (json: unknown) => ReportJobNotificationDestinationCountsV1 | null;
export interface ReportJobNotificationRequestedV1 {
    schemaVersion: 1;
    messageType: 'report-job.notification-requested';
    companyId: string;
    jobId: string;
    artifactContentSha256: string;
    correlationId: string;
}
export declare const isReportJobNotificationRequestedV1: (value: unknown) => value is ReportJobNotificationRequestedV1;
export declare const createReportJobNotificationRequestedV1: (input: {
    companyId: string;
    jobId: string;
    artifactContentSha256: string;
    correlationId?: string;
}) => ReportJobNotificationRequestedV1;
/** Bounded for every valid company/job ID; JSON tuple separates identifiers without ambiguous concatenation. */
export declare const buildReportJobNotificationMessageId: (companyId: string, jobId: string) => Promise<string>;
export declare const buildReportJobNotificationBrokerProperties: (message: ReportJobNotificationRequestedV1) => Promise<{
    messageId: string;
    correlationId: string;
    contentType: "application/json";
    subject: "report-job.notification-requested";
}>;
//# sourceMappingURL=reportJobNotifications.d.ts.map