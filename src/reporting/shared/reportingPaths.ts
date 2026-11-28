/**
 * The API's reporting path-segment rule (`sanitizePathSegment` in api/services/ReportingTemplates/ReportingTemplateService.ts
 * and api/services/ReportingSettings/ReportingSettingsService.ts): trim, replace runs of characters outside
 * `[A-Za-z0-9._-]` with `-`, trim leading and trailing `-`, and use the fallback when nothing is left.
 */
export const sanitizeReportingPathSegment = (value: string, fallback: string): string => {
  const normalized = value
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || fallback;
};

export const REPORTING_DOCX_EXTENSION = '.docx';
export const REPORT_FILE_NAME_MAX_LENGTH = 120;

/** Extensions a generated report can have: Word reports, Report Pack archives and health-check presentations. */
export const REPORT_FILE_EXTENSIONS = [REPORTING_DOCX_EXTENSION, '.zip', '.pptx'] as const;

/**
 * A generated-report file name as the API accepts it: unchanged by the sanitiser, ends with `.docx`, `.zip` or
 * `.pptx`, at most 120 characters, and not just the extension.
 */
export const isReportFileName = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const extension = REPORT_FILE_EXTENSIONS.find(ext => value.endsWith(ext));
  return (
    extension !== undefined &&
    value.length > extension.length &&
    value.length <= REPORT_FILE_NAME_MAX_LENGTH &&
    sanitizeReportingPathSegment(value, '') === value
  );
};
