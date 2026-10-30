"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReportJobListResponseV1 = exports.buildReportJobCreateResponseV1 = exports.buildReportJobProjectionV1 = exports.isReportJobProjectionV1 = exports.isReportJobListQueryV1 = exports.isReportJobCreateResponseV1 = exports.consumesReportJobApiGenerationSlot = exports.isReportJobIdempotencyKey = exports.buildReportJobAdmissionFingerprintV1 = exports.isReportJobCreateRequestV1 = exports.parseReportJobCreateRequestV1 = exports.REPORT_JOB_LIST_MAX_RESULTS = exports.REPORT_JOB_API_DUPLICATE_WINDOW_MS = exports.REPORT_JOB_API_GENERATION_LIMIT = void 0;
const reportingDigest_1 = require("../shared/reportingDigest");
const reportJobSaga_1 = require("./reportJobSaga");
const reportingIds_1 = require("../shared/reportingIds");
const reportingPaths_1 = require("../shared/reportingPaths");
const reportPack_1 = require("./reportPack");
const reportJobIdentity_1 = require("./reportJobIdentity");
const reportJobNotifications_1 = require("./reportJobNotifications");
const reportJobRow_1 = require("./reportJobRow");
const reportJobSpec_1 = require("./reportJobSpec");
const reportJobStatus_1 = require("./reportJobStatus");
exports.REPORT_JOB_API_GENERATION_LIMIT = 5;
exports.REPORT_JOB_API_DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
exports.REPORT_JOB_LIST_MAX_RESULTS = 100;
const parseReportJobCreateRequestV1 = (value) => {
    try {
        if (!(0, reportingIds_1.isPlainRecord)(value) ||
            !(0, reportingIds_1.hasExactlyKeys)(value, ['schemaVersion', 'report'], ['notificationPolicyId']) ||
            value.schemaVersion !== 1 ||
            (value.notificationPolicyId !== undefined && !(0, reportingIds_1.isReportEntityId)(value.notificationPolicyId)))
            return { ok: false, errors: ['request: invalid fields'] };
        const report = (0, reportJobSpec_1.parseReportJobSpecV1)(value.report);
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
exports.parseReportJobCreateRequestV1 = parseReportJobCreateRequestV1;
const isReportJobCreateRequestV1 = (value) => (0, exports.parseReportJobCreateRequestV1)(value).ok;
exports.isReportJobCreateRequestV1 = isReportJobCreateRequestV1;
/** Caller/company binding and atomic reservation are repository responsibilities, not part of this hash. */
const buildReportJobAdmissionFingerprintV1 = async (request) => {
    const parsed = (0, exports.parseReportJobCreateRequestV1)(request);
    if (!parsed.ok)
        throw new Error('Invalid report job create request.');
    return (0, reportingDigest_1.sha256Hex)(JSON.stringify([(0, reportJobSpec_1.serializeReportJobSpecV1)(parsed.value.report), parsed.value.notificationPolicyId ?? null]));
};
exports.buildReportJobAdmissionFingerprintV1 = buildReportJobAdmissionFingerprintV1;
const isReportJobIdempotencyKey = (value) => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/.test(value);
exports.isReportJobIdempotencyKey = isReportJobIdempotencyKey;
/** A generated job awaiting notification has released its generation slot. Never substitutes for atomic admission. */
const consumesReportJobApiGenerationSlot = (row) => row.trigger === 'api' &&
    (['accepted', 'running', 'source-ready'].includes(row.status) ||
        (row.status === 'generated' && row.notificationPolicyId === undefined && row.notificationStatus === 'none'));
exports.consumesReportJobApiGenerationSlot = consumesReportJobApiGenerationSlot;
const statusPath = (companyId, jobId) => `/companies/${companyId}/reporting/jobs/${jobId}`;
const downloadPath = (companyId, jobId) => `/companies/${companyId}/reporting/reports/${jobId}`;
const isReportJobCreateResponseV1 = (value) => {
    if (!(0, reportingIds_1.isPlainRecord)(value) ||
        !(0, reportingIds_1.hasExactlyKeys)(value, ['jobId', 'reportId', 'fileName', 'status', 'statusUrl']) ||
        !(0, reportJobIdentity_1.isReportJobId)(value.jobId) ||
        value.reportId !== value.jobId ||
        !(0, reportingPaths_1.isReportFileName)(value.fileName) ||
        !(0, reportJobStatus_1.isReportJobStatus)(value.status) ||
        typeof value.statusUrl !== 'string')
        return false;
    const parts = value.statusUrl.split('/');
    return parts.length === 6 && (0, reportingIds_1.isReportJobCompanyId)(parts[2]) && value.statusUrl === statusPath(parts[2], value.jobId);
};
exports.isReportJobCreateResponseV1 = isReportJobCreateResponseV1;
const isReportJobListQueryV1 = (value) => (0, reportingIds_1.isPlainRecord)(value) &&
    (0, reportingIds_1.hasExactlyKeys)(value, [], ['pageSize', 'cursor', 'status', 'trigger', 'scheduleId', 'reportType', 'progressStatus']) &&
    (value.progressStatus === undefined || reportJobSaga_1.REPORT_PROGRESS_STATUSES.includes(value.progressStatus)) &&
    (value.pageSize === undefined ||
        (typeof value.pageSize === 'number' &&
            Number.isInteger(value.pageSize) &&
            value.pageSize >= 1 &&
            value.pageSize <= exports.REPORT_JOB_LIST_MAX_RESULTS)) &&
    (value.cursor === undefined || (0, reportingIds_1.isBoundedPlainText)(value.cursor, 2000)) &&
    (value.status === undefined || (0, reportJobStatus_1.isReportJobStatus)(value.status)) &&
    (value.trigger === undefined || value.trigger === 'api' || value.trigger === 'schedule') &&
    (value.scheduleId === undefined || (0, reportingIds_1.isReportEntityId)(value.scheduleId)) &&
    (value.reportType === undefined || (0, reportJobSpec_1.isReportJobReportType)(value.reportType));
exports.isReportJobListQueryV1 = isReportJobListQueryV1;
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
const isReportJobProjectionV1 = (value) => {
    try {
        if (!(0, reportingIds_1.isPlainRecord)(value) ||
            !(0, reportingIds_1.hasExactlyKeys)(value, projectionRequired, projectionOptional) ||
            value.schemaVersion !== 1 ||
            !(0, reportingIds_1.isReportJobCompanyId)(value.companyId) ||
            !(0, reportJobIdentity_1.isReportJobId)(value.jobId) ||
            value.reportId !== value.jobId ||
            !(0, reportJobSpec_1.isReportJobReportType)(value.reportType) ||
            !(0, reportJobStatus_1.isReportJobStatus)(value.status) ||
            !isCount(value.attemptCount) ||
            !(0, reportingPaths_1.isReportFileName)(value.fileName) ||
            !(0, reportPack_1.isReportJobFileNameForType)(value.fileName, String(value.reportType)) ||
            !(0, reportJobStatus_1.isReportJobNotificationStatus)(value.notificationStatus) ||
            !(0, reportingIds_1.isIsoUtcTimestamp)(value.requestedAtUtc))
            return false;
        if (!(0, reportJobSpec_1.isReportJobScopeV1)(value.scope))
            return false;
        if (value.reportType === 'sdm' ? !(0, reportJobSpec_1.isReportJobPeriodV1)(value.period) : value.period !== undefined)
            return false;
        const identity = (0, reportJobIdentity_1.parseReportJobId)(value.jobId);
        if (!identity ||
            identity.reportType !== value.reportType ||
            identity.instant.toISOString() !== (value.trigger === 'schedule' ? value.scheduledForUtc : value.requestedAtUtc))
            return false;
        if (value.status === 'accepted' && value.attemptCount !== 0)
            return false;
        if (['source-ready', 'generated', 'completed', 'completed-with-notification-errors'].includes(value.status) &&
            !(0, reportingIds_1.isIsoUtcTimestamp)(value.sourceObservedAtUtc))
            return false;
        if (['generated', 'completed', 'completed-with-notification-errors'].includes(value.status) &&
            (!(0, reportingIds_1.isIsoUtcTimestamp)(value.generatedAtUtc) || !isCount(value.artifactBytes) || value.artifactBytes < 1))
            return false;
        if (value.trigger === 'schedule') {
            if (value.reportType === 'sdm' && (0, reportJobSpec_1.isReportJobPeriodV1)(value.period) && value.period.kind === 'explicit')
                return false;
            if (!(0, reportingIds_1.isReportEntityId)(value.scheduleId) ||
                !isCount(value.definitionRevision) ||
                value.definitionRevision < 1 ||
                !(0, reportingIds_1.isIsoUtcTimestamp)(value.scheduledForUtc) ||
                (value.coalescedOccurrenceCount !== undefined && (!isCount(value.coalescedOccurrenceCount) || value.coalescedOccurrenceCount < 1)))
                return false;
        }
        else if (value.trigger !== 'api' ||
            ['scheduleId', 'definitionRevision', 'scheduledForUtc', 'coalescedOccurrenceCount'].some(key => value[key] !== undefined))
            return false;
        for (const key of ['startedAtUtc', 'sourceObservedAtUtc', 'generatedAtUtc', 'completedAtUtc', 'notificationCompletedAtUtc'])
            if (value[key] !== undefined && !(0, reportingIds_1.isIsoUtcTimestamp)(value[key]))
                return false;
        if (value.progress !== undefined && !(0, reportJobSaga_1.isReportJobProgressV1)(value.progress))
            return false;
        if (value.status === 'failed') {
            if (!(0, reportJobStatus_1.isReportJobFailureCode)(value.failureCode) || !(0, reportJobStatus_1.isReportJobFailureStage)(value.failureStage))
                return false;
            const stage = reportJobStatus_1.REPORT_JOB_FAILURE_STAGE_BY_CODE[value.failureCode];
            if (stage !== null && stage !== value.failureStage)
                return false;
        }
        else if (value.failureCode !== undefined || value.failureStage !== undefined)
            return false;
        if (value.artifactBytes !== undefined && (!isCount(value.artifactBytes) || value.artifactBytes < 1))
            return false;
        if (value.notificationAttemptCount !== undefined && !isCount(value.notificationAttemptCount))
            return false;
        if (value.notificationDestinationCounts !== undefined && !(0, reportJobNotifications_1.isReportJobNotificationDestinationCountsV1)(value.notificationDestinationCounts))
            return false;
        const completed = value.status === 'completed' || value.status === 'completed-with-notification-errors';
        if (completed &&
            (!(0, reportingIds_1.isIsoUtcTimestamp)(value.completedAtUtc) ||
                !isCount(value.artifactBytes) ||
                value.artifactBytes < 1 ||
                !(0, reportingIds_1.isIsoUtcTimestamp)(value.generatedAtUtc)))
            return false;
        return (value.downloadUrl === undefined ||
            ((completed || value.status === 'generated') && value.downloadUrl === downloadPath(value.companyId, value.jobId)));
    }
    catch {
        return false;
    }
};
exports.isReportJobProjectionV1 = isReportJobProjectionV1;
const buildReportJobProjectionV1 = async (entity) => {
    const parsed = await (0, reportJobRow_1.parseReportJobRowV1)(entity);
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
        projection.notificationDestinationCounts = (0, reportJobNotifications_1.parseReportJobNotificationDestinationCountsV1)(row.notificationDestinationCounts) ?? undefined;
    if (row.status === 'generated' || row.status === 'completed' || row.status === 'completed-with-notification-errors')
        projection.downloadUrl = downloadPath(row.companyId, row.jobId);
    if (!(0, exports.isReportJobProjectionV1)(projection))
        throw new Error('Invalid report job projection.');
    return projection;
};
exports.buildReportJobProjectionV1 = buildReportJobProjectionV1;
const buildReportJobCreateResponseV1 = async (entity) => {
    const parsed = await (0, reportJobRow_1.parseReportJobRowV1)(entity);
    if (!parsed.ok)
        throw new Error('Invalid report job row.');
    const row = parsed.row;
    return { jobId: row.jobId, reportId: row.jobId, fileName: row.fileName, status: row.status, statusUrl: statusPath(row.companyId, row.jobId) };
};
exports.buildReportJobCreateResponseV1 = buildReportJobCreateResponseV1;
const isReportJobListResponseV1 = (value) => {
    try {
        return ((0, reportingIds_1.isPlainRecord)(value) &&
            (0, reportingIds_1.hasExactlyKeys)(value, ['results'], ['continuation']) &&
            Array.isArray(value.results) &&
            value.results.length <= exports.REPORT_JOB_LIST_MAX_RESULTS &&
            value.results.every(exports.isReportJobProjectionV1) &&
            (0, reportingIds_1.utf8ByteLength)(JSON.stringify(value)) <= 1024 * 1024 &&
            (value.continuation === undefined ||
                ((0, reportingIds_1.isPlainRecord)(value.continuation) && (0, reportingIds_1.hasExactlyKeys)(value.continuation, ['cursor']) && (0, reportingIds_1.isBoundedPlainText)(value.continuation.cursor, 2000))));
    }
    catch {
        return false;
    }
};
exports.isReportJobListResponseV1 = isReportJobListResponseV1;
//# sourceMappingURL=reportJobApi.js.map