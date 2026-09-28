import { type ReportJobReportType } from './reportJobSpec';
/** The `recommendationsevents` reverse-time convention: 19 nines minus Unix milliseconds, zero-padded to 19 digits. */
export declare const REPORT_JOB_MAX_REVERSE_TIME: bigint;
/** Latest instant accepted (9999-12-31T23:59:59.999Z). */
export declare const REPORT_JOB_MAX_INSTANT_MS = 253402300799999;
export declare const REPORT_JOB_ID_PATTERN: RegExp;
export declare const REPORT_JOB_SCOPE_HASH_PATTERN: RegExp;
export declare const buildReverseTime19: (instant: Date | number | string) => string;
/** The instant a reverse time encodes, or `null` when it is not a valid 19-digit reverse time. */
export declare const parseReverseTime19: (value: unknown) => Date | null;
export interface ReportJobScopeHashInput {
    subscriptionIds: readonly string[];
    /** Present for scheduled jobs, so two schedules with the same scope and time never collide. */
    scheduleId?: string;
}
/** First 16 hex characters of SHA-256 over the sorted, lower-cased subscription IDs joined with `,` (then `|{scheduleId}`). */
export declare const buildReportJobScopeHash: ({ subscriptionIds, scheduleId }: ReportJobScopeHashInput) => Promise<string>;
export interface ReportJobIdParts {
    instant: Date | number | string;
    reportType: ReportJobReportType;
    scopeHash: string;
}
export declare const buildReportJobId: ({ instant, reportType, scopeHash }: ReportJobIdParts) => string;
export interface ParsedReportJobId {
    reverseTime19: string;
    instant: Date;
    reportType: ReportJobReportType;
    scopeHash: string;
}
export declare const parseReportJobId: (jobId: unknown) => ParsedReportJobId | null;
export declare const isReportJobId: (value: unknown) => value is string;
export interface ReportJobIdentityInput extends ReportJobScopeHashInput {
    /** `scheduledForUtc` for scheduled jobs, the acceptance time for all others. */
    instant: Date | number | string;
    reportType: ReportJobReportType;
}
/** Derives `scopeHash` and `jobId` together. */
export declare const deriveReportJobIdentity: (input: ReportJobIdentityInput) => Promise<{
    jobId: string;
    scopeHash: string;
}>;
/** Service Bus `MessageId` for `ReportJobRequestedV1`: `report-job:{companyId}:{jobId}`. */
export declare const buildReportJobMessageId: (companyId: string, jobId: string) => string;
//# sourceMappingURL=reportJobIdentity.d.ts.map