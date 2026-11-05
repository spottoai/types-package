/**
 * Identifier rules shared by the background report job contracts and the report storage contracts.
 *
 * Every identifier that ends up in a Table key, a Blob path, a Service Bus MessageId (`:` separated) or a
 * file name is validated here first. The rules are deliberately narrower than what storage accepts, so an
 * accepted value is always safe in every one of those places.
 */
/** Company, cloud-account, schedule and action-group IDs: alphanumeric ends, `._-` inside, at most 80 characters. */
export declare const REPORT_ENTITY_ID_PATTERN: RegExp;
/** Azure subscription and tenant IDs (GUIDs, any case). */
export declare const REPORT_GUID_PATTERN: RegExp;
/** Calendar dates as `YYYY-MM-DD`. */
export declare const REPORT_DATE_PATTERN: RegExp;
export declare const isReportEntityId: (value: unknown) => value is string;
/**
 * Company IDs on jobs, rows and messages: an entity ID of at most 56 characters, so the Service Bus MessageId
 * `report-job:{companyId}:{jobId}` stays within its 128-character limit. Real IDs are `comp-` plus 15 characters.
 */
export declare const REPORT_JOB_COMPANY_ID_MAX_LENGTH = 56;
export declare const isReportJobCompanyId: (value: unknown) => value is string;
export declare const isReportGuid: (value: unknown) => value is string;
/** A plain-text value with no control characters, trimmed, within the length bounds. */
export declare const isBoundedPlainText: (value: unknown, maxLength: number) => value is string;
/** An exact ISO-8601 UTC timestamp as produced by `Date.prototype.toISOString`. */
export declare const isIsoUtcTimestamp: (value: unknown) => value is string;
/** A real calendar date in `YYYY-MM-DD` form. */
export declare const isCalendarDate: (value: unknown) => value is string;
/** An IANA time zone name the runtime's `Intl` recognises. */
export declare const isIanaTimeZone: (value: unknown) => value is string;
/** Number of bytes `value` occupies as UTF-8 (no dependency on `TextEncoder`). */
export declare const utf8ByteLength: (value: string) => number;
export declare const hasExactlyKeys: (value: Record<string, unknown>, required: readonly string[], optional?: readonly string[]) => boolean;
export declare const isPlainRecord: (value: unknown) => value is Record<string, unknown>;
//# sourceMappingURL=reportingIds.d.ts.map