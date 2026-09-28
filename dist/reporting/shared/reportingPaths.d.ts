/**
 * The API's reporting path-segment rule (`sanitizePathSegment` in api/services/ReportingTemplates/ReportingTemplateService.ts
 * and api/services/ReportingSettings/ReportingSettingsService.ts): trim, replace runs of characters outside
 * `[A-Za-z0-9._-]` with `-`, trim leading and trailing `-`, and use the fallback when nothing is left.
 */
export declare const sanitizeReportingPathSegment: (value: string, fallback: string) => string;
export declare const REPORTING_DOCX_EXTENSION = ".docx";
export declare const REPORT_FILE_NAME_MAX_LENGTH = 120;
/**
 * A generated-report file name as the API accepts it: unchanged by the sanitiser, ends with `.docx`,
 * at most 120 characters, and not just the extension.
 */
export declare const isReportFileName: (value: unknown) => value is string;
//# sourceMappingURL=reportingPaths.d.ts.map