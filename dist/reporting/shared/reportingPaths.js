"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReportFileName = exports.REPORT_FILE_NAME_MAX_LENGTH = exports.REPORTING_DOCX_EXTENSION = exports.sanitizeReportingPathSegment = void 0;
/**
 * The API's reporting path-segment rule (`sanitizePathSegment` in api/services/ReportingTemplates/ReportingTemplateService.ts
 * and api/services/ReportingSettings/ReportingSettingsService.ts): trim, replace runs of characters outside
 * `[A-Za-z0-9._-]` with `-`, trim leading and trailing `-`, and use the fallback when nothing is left.
 */
const sanitizeReportingPathSegment = (value, fallback) => {
    const normalized = value
        .trim()
        .replace(/[^A-Za-z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return normalized || fallback;
};
exports.sanitizeReportingPathSegment = sanitizeReportingPathSegment;
exports.REPORTING_DOCX_EXTENSION = '.docx';
exports.REPORT_FILE_NAME_MAX_LENGTH = 120;
/**
 * A generated-report file name as the API accepts it: unchanged by the sanitiser, ends with `.docx`,
 * at most 120 characters, and not just the extension.
 */
const isReportFileName = (value) => typeof value === 'string' &&
    value.length > exports.REPORTING_DOCX_EXTENSION.length &&
    value.length <= exports.REPORT_FILE_NAME_MAX_LENGTH &&
    value.endsWith(exports.REPORTING_DOCX_EXTENSION) &&
    (0, exports.sanitizeReportingPathSegment)(value, '') === value;
exports.isReportFileName = isReportFileName;
//# sourceMappingURL=reportingPaths.js.map