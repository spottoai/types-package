"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildReportJobMessageId = exports.deriveReportJobIdentity = exports.isReportJobId = exports.parseReportJobId = exports.buildReportJobId = exports.buildReportJobScopeHash = exports.parseReverseTime19 = exports.buildReverseTime19 = exports.REPORT_JOB_SCOPE_HASH_PATTERN = exports.REPORT_JOB_ID_PATTERN = exports.REPORT_JOB_MAX_INSTANT_MS = exports.REPORT_JOB_MAX_REVERSE_TIME = void 0;
/**
 * Background report job identity (core/specs/reporting/reporting-scheduler.md, "Report job table").
 *
 * `jobId = {reverseTime19}-{reportType}-{scopeHash}` is the `reportjobs` RowKey and the generated report's ID.
 * The API and cloud-engine must derive it identically, so both use these functions.
 */
const reportingDigest_1 = require("../shared/reportingDigest");
const reportingIds_1 = require("../shared/reportingIds");
const reportJobSpec_1 = require("./reportJobSpec");
/** The `recommendationsevents` reverse-time convention: 19 nines minus Unix milliseconds, zero-padded to 19 digits. */
exports.REPORT_JOB_MAX_REVERSE_TIME = BigInt('9999999999999999999');
/** Latest instant accepted (9999-12-31T23:59:59.999Z). */
exports.REPORT_JOB_MAX_INSTANT_MS = 253402300799999;
exports.REPORT_JOB_ID_PATTERN = /^(\d{19})-(sdm|architecture-assessment)-([0-9a-f]{16})$/;
exports.REPORT_JOB_SCOPE_HASH_PATTERN = /^[0-9a-f]{16}$/;
/** Strings must be exact UTC ISO timestamps (`toISOString` form), so the result never depends on the host time zone. */
const toInstantMs = (instant) => {
    if (typeof instant === 'string' && !(0, reportingIds_1.isIsoUtcTimestamp)(instant))
        throw new RangeError('Report job instant strings must be UTC ISO timestamps (YYYY-MM-DDTHH:mm:ss.sssZ).');
    const ms = instant instanceof Date ? instant.getTime() : typeof instant === 'number' ? instant : Date.parse(instant);
    if (!Number.isInteger(ms) || ms < 0 || ms > exports.REPORT_JOB_MAX_INSTANT_MS)
        throw new RangeError('Report job instant must be a valid time between 1970 and 9999.');
    return ms;
};
const buildReverseTime19 = (instant) => (exports.REPORT_JOB_MAX_REVERSE_TIME - BigInt(toInstantMs(instant))).toString().padStart(19, '0');
exports.buildReverseTime19 = buildReverseTime19;
/** The instant a reverse time encodes, or `null` when it is not a valid 19-digit reverse time. */
const parseReverseTime19 = (value) => {
    if (typeof value !== 'string' || !/^\d{19}$/.test(value))
        return null;
    const ms = exports.REPORT_JOB_MAX_REVERSE_TIME - BigInt(value);
    if (ms < BigInt(0) || ms > BigInt(exports.REPORT_JOB_MAX_INSTANT_MS))
        return null;
    return new Date(Number(ms));
};
exports.parseReverseTime19 = parseReverseTime19;
/** First 16 hex characters of SHA-256 over the sorted, lower-cased subscription IDs joined with `,` (then `|{scheduleId}`). */
const buildReportJobScopeHash = async ({ subscriptionIds, scheduleId }) => {
    if (subscriptionIds.length === 0 || !subscriptionIds.every(id => typeof id === 'string' && (0, reportingIds_1.isReportGuid)(id.trim()))) {
        throw new Error('Report job scope hash needs at least one valid subscription ID.');
    }
    if (scheduleId !== undefined && !(0, reportingIds_1.isReportEntityId)(scheduleId))
        throw new Error('Report job scope hash: invalid schedule ID.');
    const preimage = (0, reportJobSpec_1.normalizeReportSubscriptionIds)(subscriptionIds).join(',') + (scheduleId === undefined ? '' : `|${scheduleId}`);
    return (await (0, reportingDigest_1.sha256Hex)(preimage)).slice(0, 16);
};
exports.buildReportJobScopeHash = buildReportJobScopeHash;
const buildReportJobId = ({ instant, reportType, scopeHash }) => {
    if (!(0, reportJobSpec_1.isReportJobReportType)(reportType))
        throw new Error('Report job ID: invalid report type.');
    if (!exports.REPORT_JOB_SCOPE_HASH_PATTERN.test(scopeHash))
        throw new Error('Report job ID: invalid scope hash.');
    return `${(0, exports.buildReverseTime19)(instant)}-${reportType}-${scopeHash}`;
};
exports.buildReportJobId = buildReportJobId;
const parseReportJobId = (jobId) => {
    if (typeof jobId !== 'string')
        return null;
    const match = exports.REPORT_JOB_ID_PATTERN.exec(jobId);
    if (!match)
        return null;
    const instant = (0, exports.parseReverseTime19)(match[1]);
    if (!instant)
        return null;
    return { reverseTime19: match[1], instant, reportType: match[2], scopeHash: match[3] };
};
exports.parseReportJobId = parseReportJobId;
const isReportJobId = (value) => (0, exports.parseReportJobId)(value) !== null;
exports.isReportJobId = isReportJobId;
/** Derives `scopeHash` and `jobId` together. */
const deriveReportJobIdentity = async (input) => {
    const scopeHash = await (0, exports.buildReportJobScopeHash)(input);
    return { jobId: (0, exports.buildReportJobId)({ instant: input.instant, reportType: input.reportType, scopeHash }), scopeHash };
};
exports.deriveReportJobIdentity = deriveReportJobIdentity;
/** Service Bus `MessageId` for `ReportJobRequestedV1`: `report-job:{companyId}:{jobId}`. */
const buildReportJobMessageId = (companyId, jobId) => {
    if (!(0, reportingIds_1.isReportJobCompanyId)(companyId))
        throw new Error('Report job message ID: invalid company ID.');
    if (!(0, exports.isReportJobId)(jobId))
        throw new Error('Report job message ID: invalid job ID.');
    return `report-job:${companyId}:${jobId}`;
};
exports.buildReportJobMessageId = buildReportJobMessageId;
//# sourceMappingURL=reportJobIdentity.js.map