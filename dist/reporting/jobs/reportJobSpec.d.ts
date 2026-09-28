export declare const REPORT_JOB_SPEC_SCHEMA_VERSION = 1;
export declare const REPORT_JOB_REPORT_TYPES: readonly ["sdm", "architecture-assessment"];
export type ReportJobReportType = (typeof REPORT_JOB_REPORT_TYPES)[number];
export declare const REPORT_JOB_MAX_SUBSCRIPTIONS = 200;
export declare const REPORT_JOB_MAX_CLOUD_ACCOUNTS = 20;
export declare const REPORT_JOB_MAX_SERVICE_IDS = 20;
export declare const REPORT_JOB_MAX_EXPLICIT_PERIOD_DAYS = 366;
/** Maximum UTF-8 size of the canonical `requestJson`. */
export declare const REPORT_JOB_SPEC_MAX_BYTES: number;
export interface ReportJobScopeV1 {
    /** 1..20 company-owned cloud account IDs, sorted. */
    cloudAccountIds: string[];
    /** 1..200 subscription GUIDs, lower-cased and sorted. */
    subscriptionIds: string[];
}
export type ReportPeriodRuleV1 = {
    kind: 'previous-calendar-month';
} | {
    kind: 'previous-calendar-quarter';
};
/** Explicit dates (API requests only). `YYYY-MM-DD`, start <= end, at most 366 days inclusive. */
export interface ReportExplicitPeriodV1 {
    kind: 'explicit';
    startDate: string;
    endDate: string;
}
export type ReportJobPeriodV1 = ReportPeriodRuleV1 | ReportExplicitPeriodV1;
export declare const SDM_BACKGROUND_LAYOUTS: readonly ["spotto-layout", "monthly-insights"];
export type SdmBackgroundLayout = (typeof SDM_BACKGROUND_LAYOUTS)[number];
export declare const SDM_BACKGROUND_DETAIL_ROW_LIMITS: readonly [10, 25, 50, "all"];
export type SdmBackgroundDetailRowLimit = (typeof SDM_BACKGROUND_DETAIL_ROW_LIMITS)[number];
export interface SdmBackgroundConfigV1 {
    /** Company Word templates are not supported in background runs. */
    layout: SdmBackgroundLayout;
    cloudIqServiceProfile: {
        /** Service catalogue IDs, validated against the catalogue by reportworker. Order is kept. */
        selectedServiceIds: string[];
        detailRowLimit?: SdmBackgroundDetailRowLimit;
    };
}
export declare const CURRENT_STATE_AUDIENCES: readonly ["customer", "internal"];
export type CurrentStateBackgroundAudience = (typeof CURRENT_STATE_AUDIENCES)[number];
export declare const CURRENT_STATE_SECTION_KEYS: readonly ["costOpportunities", "securityPosture", "reliabilityAvailability", "quickWins", "roadmap"];
export type CurrentStateBackgroundSections = Record<(typeof CURRENT_STATE_SECTION_KEYS)[number], boolean>;
export interface CurrentStateBackgroundConfigV1 {
    audience: CurrentStateBackgroundAudience;
    sections: CurrentStateBackgroundSections;
    /** ISO 4217, upper case. */
    scopeCurrencyCode: string;
    /** 1..120 characters of plain text. Default: "<provider name> pre-sales team". */
    preparedBy?: string;
}
export interface SdmReportJobSpecV1 {
    schemaVersion: 1;
    reportType: 'sdm';
    scope: ReportJobScopeV1;
    period: ReportJobPeriodV1;
    configuration: SdmBackgroundConfigV1;
}
export interface CurrentStateReportJobSpecV1 {
    schemaVersion: 1;
    reportType: 'architecture-assessment';
    scope: ReportJobScopeV1;
    configuration: CurrentStateBackgroundConfigV1;
}
export type ReportJobSpecV1 = SdmReportJobSpecV1 | CurrentStateReportJobSpecV1;
export type ReportJobSpecParseResult = {
    ok: true;
    value: ReportJobSpecV1;
} | {
    ok: false;
    errors: string[];
};
export declare const isReportJobReportType: (value: unknown) => value is ReportJobReportType;
/**
 * Lower-cases, de-duplicates and sorts subscription IDs. Lower case is Spotto's canonical subscription ID form: the
 * request and the scope hash use it, and so do the storage keys and paths reportworker builds from it.
 */
export declare const normalizeReportSubscriptionIds: (subscriptionIds: readonly string[]) => string[];
/** Strict, normalising parser. Never throws (hostile getters are reported as an invalid spec). */
export declare const parseReportJobSpecV1: (input: unknown) => ReportJobSpecParseResult;
/**
 * The canonical `requestJson`: validated, normalised, fixed key order. Producers store exactly this string, and
 * `requestSha256` is the SHA-256 of its UTF-8 bytes. Throws on an invalid spec or one above 32 KiB.
 */
export declare const serializeReportJobSpecV1: (spec: unknown) => string;
/**
 * Parses stored `requestJson`. It must be valid JSON, a valid spec and already canonical (byte-equal to
 * `serializeReportJobSpecV1` of itself), so a hash over the stored string identifies the request exactly.
 */
export declare const parseReportJobRequestJson: (requestJson: unknown) => ReportJobSpecParseResult;
//# sourceMappingURL=reportJobSpec.d.ts.map