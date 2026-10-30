"use strict";
/**
 * Identifier rules shared by the background report job contracts and the report storage contracts.
 *
 * Every identifier that ends up in a Table key, a Blob path, a Service Bus MessageId (`:` separated) or a
 * file name is validated here first. The rules are deliberately narrower than what storage accepts, so an
 * accepted value is always safe in every one of those places.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPlainRecord = exports.hasExactlyKeys = exports.utf8ByteLength = exports.isIanaTimeZone = exports.isCalendarDate = exports.isIsoUtcTimestamp = exports.isBoundedPlainText = exports.isReportGuid = exports.isReportJobCompanyId = exports.REPORT_JOB_COMPANY_ID_MAX_LENGTH = exports.isReportEntityId = exports.REPORT_DATE_PATTERN = exports.REPORT_GUID_PATTERN = exports.REPORT_ENTITY_ID_PATTERN = void 0;
/** Company, cloud-account, schedule and action-group IDs: alphanumeric ends, `._-` inside, at most 80 characters. */
exports.REPORT_ENTITY_ID_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,78}[A-Za-z0-9])?$/;
/** Azure subscription and tenant IDs (GUIDs, any case). */
exports.REPORT_GUID_PATTERN = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
/** Calendar dates as `YYYY-MM-DD`. */
exports.REPORT_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const hasControlCharacter = (value) => {
    for (let index = 0; index < value.length; index += 1) {
        const code = value.charCodeAt(index);
        if (code < 0x20 || code === 0x7f)
            return true;
    }
    return false;
};
const isReportEntityId = (value) => typeof value === 'string' && exports.REPORT_ENTITY_ID_PATTERN.test(value);
exports.isReportEntityId = isReportEntityId;
/**
 * Company IDs on jobs, rows and messages: an entity ID of at most 56 characters, so the Service Bus MessageId
 * `report-job:{companyId}:{jobId}` stays within its 128-character limit. Real IDs are `comp-` plus 15 characters.
 */
exports.REPORT_JOB_COMPANY_ID_MAX_LENGTH = 56;
const isReportJobCompanyId = (value) => (0, exports.isReportEntityId)(value) && value.length <= exports.REPORT_JOB_COMPANY_ID_MAX_LENGTH;
exports.isReportJobCompanyId = isReportJobCompanyId;
const isReportGuid = (value) => typeof value === 'string' && exports.REPORT_GUID_PATTERN.test(value);
exports.isReportGuid = isReportGuid;
/** A plain-text value with no control characters, trimmed, within the length bounds. */
const isBoundedPlainText = (value, maxLength) => typeof value === 'string' && value.length > 0 && value.length <= maxLength && value === value.trim() && !hasControlCharacter(value);
exports.isBoundedPlainText = isBoundedPlainText;
/** An exact ISO-8601 UTC timestamp as produced by `Date.prototype.toISOString`. */
const isIsoUtcTimestamp = (value) => {
    if (typeof value !== 'string' || value.length !== 24)
        return false;
    const time = Date.parse(value);
    return Number.isFinite(time) && new Date(time).toISOString() === value;
};
exports.isIsoUtcTimestamp = isIsoUtcTimestamp;
/** A real calendar date in `YYYY-MM-DD` form. */
const isCalendarDate = (value) => {
    if (typeof value !== 'string' || !exports.REPORT_DATE_PATTERN.test(value))
        return false;
    const time = Date.parse(`${value}T00:00:00.000Z`);
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
};
exports.isCalendarDate = isCalendarDate;
/** An IANA time zone name the runtime's `Intl` recognises. */
const isIanaTimeZone = (value) => {
    if (typeof value !== 'string' || value.length === 0 || value.length > 64)
        return false;
    if (!/^(?:UTC|[A-Za-z][A-Za-z0-9_+-]*(?:\/[A-Za-z0-9_+-]+){1,2})$/.test(value))
        return false;
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: value });
        return true;
    }
    catch {
        return false;
    }
};
exports.isIanaTimeZone = isIanaTimeZone;
/** Number of bytes `value` occupies as UTF-8 (no dependency on `TextEncoder`). */
const utf8ByteLength = (value) => {
    let bytes = 0;
    for (let index = 0; index < value.length; index += 1) {
        const code = value.charCodeAt(index);
        if (code < 0x80)
            bytes += 1;
        else if (code < 0x800)
            bytes += 2;
        else if (code >= 0xd800 && code <= 0xdbff && index + 1 < value.length) {
            const next = value.charCodeAt(index + 1);
            if (next >= 0xdc00 && next <= 0xdfff) {
                bytes += 4;
                index += 1;
            }
            else
                bytes += 3;
        }
        else
            bytes += 3;
    }
    return bytes;
};
exports.utf8ByteLength = utf8ByteLength;
const hasExactlyKeys = (value, required, optional = []) => {
    const keys = Object.keys(value);
    const allowed = new Set([...required, ...optional]);
    return required.every(key => Object.prototype.hasOwnProperty.call(value, key)) && keys.every(key => allowed.has(key));
};
exports.hasExactlyKeys = hasExactlyKeys;
const isPlainRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
exports.isPlainRecord = isPlainRecord;
//# sourceMappingURL=reportingIds.js.map