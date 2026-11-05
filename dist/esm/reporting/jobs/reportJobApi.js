import { sha256Hex } from '../shared/reportingDigest.js';
import { isReportJobProgressV1, REPORT_PROGRESS_STATUSES } from './reportJobSaga.js';
import { hasExactlyKeys, isBoundedPlainText, isIsoUtcTimestamp, isPlainRecord, isReportEntityId, isReportJobCompanyId, utf8ByteLength, } from '../shared/reportingIds.js';
import { isReportFileName } from '../shared/reportingPaths.js';
import { isReportJobFileNameForType } from './reportPack.js';
import { isReportJobId, parseReportJobId } from './reportJobIdentity.js';
import { isReportJobNotificationDestinationCountsV1, parseReportJobNotificationDestinationCountsV1, } from './reportJobNotifications.js';
import { parseReportJobRowV1 } from './reportJobRow.js';
import { isReportJobReportType, isReportJobScopeV1, isReportJobPeriodV1, parseReportJobSpecV1, serializeReportJobSpecV1, } from './reportJobSpec.js';
import { isReportJobFailureCode, isReportJobFailureStage, isReportJobNotificationStatus, isReportJobStatus, REPORT_JOB_FAILURE_STAGE_BY_CODE, } from './reportJobStatus.js';
export const REPORT_JOB_API_GENERATION_LIMIT = 5;
export const REPORT_JOB_API_DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
export const REPORT_JOB_LIST_MAX_RESULTS = 100;
export const parseReportJobCreateRequestV1 = (value) => {
    try {
        if (!isPlainRecord(value) ||
            !hasExactlyKeys(value, ['schemaVersion', 'report'], ['notificationPolicyId']) ||
            value.schemaVersion !== 1 ||
            (value.notificationPolicyId !== undefined && !isReportEntityId(value.notificationPolicyId)))
            return { ok: false, errors: ['request: invalid fields'] };
        const report = parseReportJobSpecV1(value.report);
        if (!report.ok)
            return report;
        return {
            ok: true,
            value: {
                schemaVersion: 1,
                report: report.value,
                ...(value.notificationPolicyId === undefined ? {} : { notificationPolicyId: value.notificationPolicyId }),
            },
        };
    }
    catch {
        return { ok: false, errors: ['request: unreadable'] };
    }
};
export const isReportJobCreateRequestV1 = (value) => parseReportJobCreateRequestV1(value).ok;
/** Caller/company binding and atomic reservation are repository responsibilities, not part of this hash. */
export const buildReportJobAdmissionFingerprintV1 = async (request) => {
    const parsed = parseReportJobCreateRequestV1(request);
    if (!parsed.ok)
        throw new Error('Invalid report job create request.');
    return sha256Hex(JSON.stringify([serializeReportJobSpecV1(parsed.value.report), parsed.value.notificationPolicyId ?? null]));
};
export const isReportJobIdempotencyKey = (value) => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/.test(value);
/** A generated job awaiting notification has released its generation slot. Never substitutes for atomic admission. */
export const consumesReportJobApiGenerationSlot = (row) => row.trigger === 'api' &&
    (['accepted', 'running', 'source-ready'].includes(row.status) ||
        (row.status === 'generated' && row.notificationPolicyId === undefined && row.notificationStatus === 'none'));
const statusPath = (companyId, jobId) => `/companies/${companyId}/reporting/jobs/${jobId}`;
const downloadPath = (companyId, jobId) => `/companies/${companyId}/reporting/reports/${jobId}`;
export const isReportJobCreateResponseV1 = (value) => {
    if (!isPlainRecord(value) ||
        !hasExactlyKeys(value, ['jobId', 'reportId', 'fileName', 'status', 'statusUrl']) ||
        !isReportJobId(value.jobId) ||
        value.reportId !== value.jobId ||
        !isReportFileName(value.fileName) ||
        !isReportJobStatus(value.status) ||
        typeof value.statusUrl !== 'string')
        return false;
    const parts = value.statusUrl.split('/');
    return parts.length === 6 && isReportJobCompanyId(parts[2]) && value.statusUrl === statusPath(parts[2], value.jobId);
};
export const isReportJobListQueryV1 = (value) => isPlainRecord(value) &&
    hasExactlyKeys(value, [], ['pageSize', 'cursor', 'status', 'trigger', 'scheduleId', 'reportType', 'progressStatus']) &&
    (value.progressStatus === undefined || REPORT_PROGRESS_STATUSES.includes(value.progressStatus)) &&
    (value.pageSize === undefined ||
        (typeof value.pageSize === 'number' &&
            Number.isInteger(value.pageSize) &&
            value.pageSize >= 1 &&
            value.pageSize <= REPORT_JOB_LIST_MAX_RESULTS)) &&
    (value.cursor === undefined || isBoundedPlainText(value.cursor, 2000)) &&
    (value.status === undefined || isReportJobStatus(value.status)) &&
    (value.trigger === undefined || value.trigger === 'api' || value.trigger === 'schedule') &&
    (value.scheduleId === undefined || isReportEntityId(value.scheduleId)) &&
    (value.reportType === undefined || isReportJobReportType(value.reportType));
const projectionRequired = [
    'schemaVersion',
    'companyId',
    'jobId',
    'reportId',
    'reportType',
    'trigger',
    'requestedAtUtc',
    'scope',
    'status',
    'attemptCount',
    'fileName',
    'notificationStatus',
];
const projectionOptional = [
    'progress',
    'scheduleId',
    'definitionRevision',
    'scheduledForUtc',
    'coalescedOccurrenceCount',
    'period',
    'startedAtUtc',
    'sourceObservedAtUtc',
    'generatedAtUtc',
    'completedAtUtc',
    'failureStage',
    'failureCode',
    'artifactBytes',
    'notificationAttemptCount',
    'notificationDestinationCounts',
    'notificationCompletedAtUtc',
    'downloadUrl',
];
const isCount = (value) => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 2147483647;
export const isReportJobProjectionV1 = (value) => {
    try {
        if (!isPlainRecord(value) ||
            !hasExactlyKeys(value, projectionRequired, projectionOptional) ||
            value.schemaVersion !== 1 ||
            !isReportJobCompanyId(value.companyId) ||
            !isReportJobId(value.jobId) ||
            value.reportId !== value.jobId ||
            !isReportJobReportType(value.reportType) ||
            !isReportJobStatus(value.status) ||
            !isCount(value.attemptCount) ||
            !isReportFileName(value.fileName) ||
            !isReportJobFileNameForType(value.fileName, String(value.reportType)) ||
            !isReportJobNotificationStatus(value.notificationStatus) ||
            !isIsoUtcTimestamp(value.requestedAtUtc))
            return false;
        if (!isReportJobScopeV1(value.scope))
            return false;
        if (value.reportType === 'sdm' ? !isReportJobPeriodV1(value.period) : value.period !== undefined)
            return false;
        const identity = parseReportJobId(value.jobId);
        if (!identity ||
            identity.reportType !== value.reportType ||
            identity.instant.toISOString() !== (value.trigger === 'schedule' ? value.scheduledForUtc : value.requestedAtUtc))
            return false;
        if (value.status === 'accepted' && value.attemptCount !== 0)
            return false;
        if (['source-ready', 'generated', 'completed', 'completed-with-notification-errors'].includes(value.status) &&
            !isIsoUtcTimestamp(value.sourceObservedAtUtc))
            return false;
        if (['generated', 'completed', 'completed-with-notification-errors'].includes(value.status) &&
            (!isIsoUtcTimestamp(value.generatedAtUtc) || !isCount(value.artifactBytes) || value.artifactBytes < 1))
            return false;
        if (value.trigger === 'schedule') {
            if (value.reportType === 'sdm' && isReportJobPeriodV1(value.period) && value.period.kind === 'explicit')
                return false;
            if (!isReportEntityId(value.scheduleId) ||
                !isCount(value.definitionRevision) ||
                value.definitionRevision < 1 ||
                !isIsoUtcTimestamp(value.scheduledForUtc) ||
                (value.coalescedOccurrenceCount !== undefined && (!isCount(value.coalescedOccurrenceCount) || value.coalescedOccurrenceCount < 1)))
                return false;
        }
        else if (value.trigger !== 'api' ||
            ['scheduleId', 'definitionRevision', 'scheduledForUtc', 'coalescedOccurrenceCount'].some(key => value[key] !== undefined))
            return false;
        for (const key of ['startedAtUtc', 'sourceObservedAtUtc', 'generatedAtUtc', 'completedAtUtc', 'notificationCompletedAtUtc'])
            if (value[key] !== undefined && !isIsoUtcTimestamp(value[key]))
                return false;
        if (value.progress !== undefined && !isReportJobProgressV1(value.progress))
            return false;
        if (value.status === 'failed') {
            if (!isReportJobFailureCode(value.failureCode) || !isReportJobFailureStage(value.failureStage))
                return false;
            const stage = REPORT_JOB_FAILURE_STAGE_BY_CODE[value.failureCode];
            if (stage !== null && stage !== value.failureStage)
                return false;
        }
        else if (value.failureCode !== undefined || value.failureStage !== undefined)
            return false;
        if (value.artifactBytes !== undefined && (!isCount(value.artifactBytes) || value.artifactBytes < 1))
            return false;
        if (value.notificationAttemptCount !== undefined && !isCount(value.notificationAttemptCount))
            return false;
        if (value.notificationDestinationCounts !== undefined && !isReportJobNotificationDestinationCountsV1(value.notificationDestinationCounts))
            return false;
        const completed = value.status === 'completed' || value.status === 'completed-with-notification-errors';
        if (completed &&
            (!isIsoUtcTimestamp(value.completedAtUtc) ||
                !isCount(value.artifactBytes) ||
                value.artifactBytes < 1 ||
                !isIsoUtcTimestamp(value.generatedAtUtc)))
            return false;
        return (value.downloadUrl === undefined ||
            ((completed || value.status === 'generated') && value.downloadUrl === downloadPath(value.companyId, value.jobId)));
    }
    catch {
        return false;
    }
};
export const buildReportJobProjectionV1 = async (entity) => {
    const parsed = await parseReportJobRowV1(entity);
    if (!parsed.ok)
        throw new Error('Invalid report job row.');
    const row = parsed.row;
    const projection = {
        schemaVersion: 1,
        companyId: row.companyId,
        jobId: row.jobId,
        reportId: row.jobId,
        reportType: row.reportType,
        trigger: row.trigger,
        requestedAtUtc: row.requestedAtUtc,
        scope: parsed.spec.scope,
        ...(parsed.spec.reportType === 'sdm' ? { period: parsed.spec.period } : {}),
        status: row.status,
        attemptCount: row.attemptCount,
        fileName: row.fileName,
        notificationStatus: row.notificationStatus,
    };
    for (const key of projectionOptional) {
        if (key === 'period' || key === 'downloadUrl' || key === 'notificationDestinationCounts' || key === 'progress')
            continue;
        const value = row[key];
        if (value !== undefined)
            Object.assign(projection, { [key]: value });
    }
    if (row.notificationDestinationCounts !== undefined)
        projection.notificationDestinationCounts = parseReportJobNotificationDestinationCountsV1(row.notificationDestinationCounts) ?? undefined;
    if (row.status === 'generated' || row.status === 'completed' || row.status === 'completed-with-notification-errors')
        projection.downloadUrl = downloadPath(row.companyId, row.jobId);
    if (!isReportJobProjectionV1(projection))
        throw new Error('Invalid report job projection.');
    return projection;
};
export const buildReportJobCreateResponseV1 = async (entity) => {
    const parsed = await parseReportJobRowV1(entity);
    if (!parsed.ok)
        throw new Error('Invalid report job row.');
    const row = parsed.row;
    return { jobId: row.jobId, reportId: row.jobId, fileName: row.fileName, status: row.status, statusUrl: statusPath(row.companyId, row.jobId) };
};
export const isReportJobListResponseV1 = (value) => {
    try {
        return (isPlainRecord(value) &&
            hasExactlyKeys(value, ['results'], ['continuation']) &&
            Array.isArray(value.results) &&
            value.results.length <= REPORT_JOB_LIST_MAX_RESULTS &&
            value.results.every(isReportJobProjectionV1) &&
            utf8ByteLength(JSON.stringify(value)) <= 1024 * 1024 &&
            (value.continuation === undefined ||
                (isPlainRecord(value.continuation) && hasExactlyKeys(value.continuation, ['cursor']) && isBoundedPlainText(value.continuation.cursor, 2000))));
    }
    catch {
        return false;
    }
};
