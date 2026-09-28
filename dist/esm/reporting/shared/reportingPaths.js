/**
 * The API's reporting path-segment rule (`sanitizePathSegment` in api/services/ReportingTemplates/ReportingTemplateService.ts
 * and api/services/ReportingSettings/ReportingSettingsService.ts): trim, replace runs of characters outside
 * `[A-Za-z0-9._-]` with `-`, trim leading and trailing `-`, and use the fallback when nothing is left.
 */
export const sanitizeReportingPathSegment = (value, fallback) => {
    const normalized = value
        .trim()
        .replace(/[^A-Za-z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return normalized || fallback;
};
export const REPORTING_DOCX_EXTENSION = '.docx';
export const REPORT_FILE_NAME_MAX_LENGTH = 120;
/**
 * A generated-report file name as the API accepts it: unchanged by the sanitiser, ends with `.docx`,
 * at most 120 characters, and not just the extension.
 */
export const isReportFileName = (value) => typeof value === 'string' &&
    value.length > REPORTING_DOCX_EXTENSION.length &&
    value.length <= REPORT_FILE_NAME_MAX_LENGTH &&
    value.endsWith(REPORTING_DOCX_EXTENSION) &&
    sanitizeReportingPathSegment(value, '') === value;
