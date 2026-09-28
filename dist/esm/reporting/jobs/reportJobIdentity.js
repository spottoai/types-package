/**
 * Background report job identity (core/specs/reporting/reporting-scheduler.md, "Report job table").
 *
 * `jobId = {reverseTime19}-{reportType}-{scopeHash}` is the `reportjobs` RowKey and the generated report's ID.
 * The API and cloud-engine must derive it identically, so both use these functions.
 */
import { sha256Hex } from '../shared/reportingDigest.js';
import { isIsoUtcTimestamp, isReportEntityId, isReportGuid, isReportJobCompanyId } from '../shared/reportingIds.js';
import { isReportJobReportType, normalizeReportSubscriptionIds } from './reportJobSpec.js';
/** The `recommendationsevents` reverse-time convention: 19 nines minus Unix milliseconds, zero-padded to 19 digits. */
export const REPORT_JOB_MAX_REVERSE_TIME = BigInt('9999999999999999999');
/** Latest instant accepted (9999-12-31T23:59:59.999Z). */
export const REPORT_JOB_MAX_INSTANT_MS = 253402300799999;
export const REPORT_JOB_ID_PATTERN = /^(\d{19})-(sdm|architecture-assessment)-([0-9a-f]{16})$/;
export const REPORT_JOB_SCOPE_HASH_PATTERN = /^[0-9a-f]{16}$/;
/** Strings must be exact UTC ISO timestamps (`toISOString` form), so the result never depends on the host time zone. */
const toInstantMs = (instant) => {
    if (typeof instant === 'string' && !isIsoUtcTimestamp(instant))
        throw new RangeError('Report job instant strings must be UTC ISO timestamps (YYYY-MM-DDTHH:mm:ss.sssZ).');
    const ms = instant instanceof Date ? instant.getTime() : typeof instant === 'number' ? instant : Date.parse(instant);
    if (!Number.isInteger(ms) || ms < 0 || ms > REPORT_JOB_MAX_INSTANT_MS)
        throw new RangeError('Report job instant must be a valid time between 1970 and 9999.');
    return ms;
};
export const buildReverseTime19 = (instant) => (REPORT_JOB_MAX_REVERSE_TIME - BigInt(toInstantMs(instant))).toString().padStart(19, '0');
/** The instant a reverse time encodes, or `null` when it is not a valid 19-digit reverse time. */
export const parseReverseTime19 = (value) => {
    if (typeof value !== 'string' || !/^\d{19}$/.test(value))
        return null;
    const ms = REPORT_JOB_MAX_REVERSE_TIME - BigInt(value);
    if (ms < BigInt(0) || ms > BigInt(REPORT_JOB_MAX_INSTANT_MS))
        return null;
    return new Date(Number(ms));
};
/** First 16 hex characters of SHA-256 over the sorted, lower-cased subscription IDs joined with `,` (then `|{scheduleId}`). */
export const buildReportJobScopeHash = async ({ subscriptionIds, scheduleId }) => {
    if (subscriptionIds.length === 0 || !subscriptionIds.every(id => typeof id === 'string' && isReportGuid(id.trim()))) {
        throw new Error('Report job scope hash needs at least one valid subscription ID.');
    }
    if (scheduleId !== undefined && !isReportEntityId(scheduleId))
        throw new Error('Report job scope hash: invalid schedule ID.');
    const preimage = normalizeReportSubscriptionIds(subscriptionIds).join(',') + (scheduleId === undefined ? '' : `|${scheduleId}`);
    return (await sha256Hex(preimage)).slice(0, 16);
};
export const buildReportJobId = ({ instant, reportType, scopeHash }) => {
    if (!isReportJobReportType(reportType))
        throw new Error('Report job ID: invalid report type.');
    if (!REPORT_JOB_SCOPE_HASH_PATTERN.test(scopeHash))
        throw new Error('Report job ID: invalid scope hash.');
    return `${buildReverseTime19(instant)}-${reportType}-${scopeHash}`;
};
export const parseReportJobId = (jobId) => {
    if (typeof jobId !== 'string')
        return null;
    const match = REPORT_JOB_ID_PATTERN.exec(jobId);
    if (!match)
        return null;
    const instant = parseReverseTime19(match[1]);
    if (!instant)
        return null;
    return { reverseTime19: match[1], instant, reportType: match[2], scopeHash: match[3] };
};
export const isReportJobId = (value) => parseReportJobId(value) !== null;
/** Derives `scopeHash` and `jobId` together. */
export const deriveReportJobIdentity = async (input) => {
    const scopeHash = await buildReportJobScopeHash(input);
    return { jobId: buildReportJobId({ instant: input.instant, reportType: input.reportType, scopeHash }), scopeHash };
};
/** Service Bus `MessageId` for `ReportJobRequestedV1`: `report-job:{companyId}:{jobId}`. */
export const buildReportJobMessageId = (companyId, jobId) => {
    if (!isReportJobCompanyId(companyId))
        throw new Error('Report job message ID: invalid company ID.');
    if (!isReportJobId(jobId))
        throw new Error('Report job message ID: invalid job ID.');
    return `report-job:${companyId}:${jobId}`;
};
