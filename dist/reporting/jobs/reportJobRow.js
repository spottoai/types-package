"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildReportJobRowV1 = exports.parseReportJobRowV1 = exports.REPORT_JOB_NOTIFICATION_FIELDS = exports.REPORT_JOB_WORKER_FIELDS = exports.REPORT_JOB_PRODUCER_FIELDS = exports.REPORT_JOB_COVERAGE_SUMMARY_MAX_BYTES = exports.REPORT_JOB_TRIGGERS = exports.REPORT_JOB_ROW_SCHEMA_VERSION = void 0;
/**
 * The `reportjobs` row (core/specs/reporting/reporting-scheduler.md, "Report job table").
 *
 * PartitionKey = companyId, RowKey = jobId. Three writers own disjoint field groups and merge with ETag
 * compare-and-swap: the producer (insert only), reportworker and, from phase 6, cloud-engine's notifier.
 * The row carries no region (each region has its own table, queue and worker) and no time zone (reportworker uses
 * the company's `preferredTimezone`, else UTC). The row never holds e-mail addresses, document content, source data, Blob paths or credentials.
 */
const reportingDigest_1 = require("../shared/reportingDigest");
const reportingPaths_1 = require("../shared/reportingPaths");
const reportingIds_1 = require("../shared/reportingIds");
const reportTableEntities_1 = require("../shared/reportTableEntities");
const reportJobIdentity_1 = require("./reportJobIdentity");
const reportJobSpec_1 = require("./reportJobSpec");
const reportJobStatus_1 = require("./reportJobStatus");
exports.REPORT_JOB_ROW_SCHEMA_VERSION = 1;
exports.REPORT_JOB_TRIGGERS = ['api', 'schedule'];
/** UTF-8 byte limit of `sourceCoverageSummary` (a JSON object). */
exports.REPORT_JOB_COVERAGE_SUMMARY_MAX_BYTES = 8 * 1024;
exports.REPORT_JOB_PRODUCER_FIELDS = [
    'PartitionKey',
    'RowKey',
    'schemaVersion',
    'jobId',
    'companyId',
    'reportType',
    'trigger',
    'scheduleId',
    'definitionRevision',
    'scheduledForUtc',
    'requestedAtUtc',
    'requestedByUserId',
    'coalescedOccurrenceCount',
    'requestJson',
    'requestSha256',
    'fileName',
    'notificationPolicyId',
];
exports.REPORT_JOB_WORKER_FIELDS = [
    'status',
    'attemptCount',
    'leaseOwner',
    'leaseExpiresAtUtc',
    'startedAtUtc',
    'lastAttemptAtUtc',
    'sourceObservedAtUtc',
    'sourceSnapshotSha256',
    'sourceCoverageSummary',
    'generatedAtUtc',
    'artifactContentSha256',
    'artifactBytes',
    'completedAtUtc',
    'failureStage',
    'failureCode',
    'lastTransientErrorCode',
];
exports.REPORT_JOB_NOTIFICATION_FIELDS = ['notificationStatus'];
const REQUIRED_FIELDS = [
    'PartitionKey',
    'RowKey',
    'schemaVersion',
    'jobId',
    'companyId',
    'reportType',
    'trigger',
    'requestedAtUtc',
    'requestJson',
    'requestSha256',
    'fileName',
    'status',
    'attemptCount',
    'notificationStatus',
];
const OPTIONAL_FIELDS = [...exports.REPORT_JOB_PRODUCER_FIELDS, ...exports.REPORT_JOB_WORKER_FIELDS, ...exports.REPORT_JOB_NOTIFICATION_FIELDS].filter(field => !REQUIRED_FIELDS.includes(field));
/** Statuses reached only after the source snapshot is durable. */
const SNAPSHOT_STATUSES = ['source-ready', 'generated', 'completed', 'completed-with-notification-errors'];
/** Statuses reached only after the artifact is durable. */
const ARTIFACT_STATUSES = ['generated', 'completed', 'completed-with-notification-errors'];
const isCount = (value) => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 2147483647;
const isSha = (value) => typeof value === 'string' && reportingDigest_1.SHA256_HEX_PATTERN.test(value);
const isText = (limit) => (value) => (0, reportingIds_1.isBoundedPlainText)(value, limit);
const isOptional = (value, check) => value === undefined || check(value);
const isCoverageSummary = (value) => {
    if (typeof value !== 'string' || (0, reportingIds_1.utf8ByteLength)(value) > exports.REPORT_JOB_COVERAGE_SUMMARY_MAX_BYTES)
        return false;
    try {
        const parsed = JSON.parse(value);
        return typeof parsed === 'object' && parsed !== null;
    }
    catch {
        return false;
    }
};
/** `row` is already normalised (REST key casing, no system properties, no null values). */
const validateShape = (row, errors) => {
    const check = (field, ok) => {
        if (!ok)
            errors.push(`${field}: invalid`);
    };
    if (!(0, reportingIds_1.hasExactlyKeys)(row, REQUIRED_FIELDS, OPTIONAL_FIELDS)) {
        const unknown = Object.keys(row).filter(key => !REQUIRED_FIELDS.includes(key) && !OPTIONAL_FIELDS.includes(key));
        const missing = REQUIRED_FIELDS.filter(key => row[key] === undefined);
        if (unknown.length > 0)
            errors.push(`row: unknown fields ${unknown.join(', ')}`);
        if (missing.length > 0)
            errors.push(`row: missing fields ${missing.join(', ')}`);
    }
    check('companyId', (0, reportingIds_1.isReportJobCompanyId)(row.companyId) && row.PartitionKey === row.companyId);
    const parsedId = (0, reportJobIdentity_1.parseReportJobId)(row.jobId);
    check('jobId', parsedId !== null && row.RowKey === row.jobId);
    check('reportType', parsedId !== null && row.reportType === parsedId.reportType);
    check('trigger', row.trigger === 'api' || row.trigger === 'schedule');
    check('requestedAtUtc', (0, reportingIds_1.isIsoUtcTimestamp)(row.requestedAtUtc));
    check('requestJson', typeof row.requestJson === 'string' && (0, reportingIds_1.utf8ByteLength)(row.requestJson) <= reportJobSpec_1.REPORT_JOB_SPEC_MAX_BYTES);
    check('requestSha256', isSha(row.requestSha256));
    check('fileName', (0, reportingPaths_1.isReportFileName)(row.fileName));
    // Requesters are identified by user ID, never by e-mail address.
    check('requestedByUserId', isOptional(row.requestedByUserId, value => isText(128)(value) && !value.includes('@')));
    check('notificationPolicyId', isOptional(row.notificationPolicyId, reportingIds_1.isReportEntityId));
    check('coalescedOccurrenceCount', isOptional(row.coalescedOccurrenceCount, value => isCount(value) && value >= 1));
    if (row.trigger === 'schedule') {
        check('scheduleId', (0, reportingIds_1.isReportEntityId)(row.scheduleId));
        check('definitionRevision', isCount(row.definitionRevision) && row.definitionRevision >= 1);
        check('scheduledForUtc', (0, reportingIds_1.isIsoUtcTimestamp)(row.scheduledForUtc));
    }
    else {
        check('scheduleId', row.scheduleId === undefined);
        check('definitionRevision', row.definitionRevision === undefined);
        check('scheduledForUtc', row.scheduledForUtc === undefined);
        check('coalescedOccurrenceCount', row.coalescedOccurrenceCount === undefined);
    }
    const instant = row.trigger === 'schedule' ? row.scheduledForUtc : row.requestedAtUtc;
    check('jobId', parsedId !== null && typeof instant === 'string' && parsedId.instant.toISOString() === instant);
    check('status', (0, reportJobStatus_1.isReportJobStatus)(row.status));
    check('attemptCount', isCount(row.attemptCount));
    check('notificationStatus', (0, reportJobStatus_1.isReportJobNotificationStatus)(row.notificationStatus));
    for (const field of ['leaseExpiresAtUtc', 'startedAtUtc', 'lastAttemptAtUtc', 'sourceObservedAtUtc', 'generatedAtUtc', 'completedAtUtc']) {
        check(field, isOptional(row[field], reportingIds_1.isIsoUtcTimestamp));
    }
    check('leaseOwner', isOptional(row.leaseOwner, isText(256)));
    check('sourceSnapshotSha256', isOptional(row.sourceSnapshotSha256, isSha));
    check('artifactContentSha256', isOptional(row.artifactContentSha256, isSha));
    check('artifactBytes', isOptional(row.artifactBytes, value => isCount(value) && value >= 1));
    check('sourceCoverageSummary', isOptional(row.sourceCoverageSummary, isCoverageSummary));
    check('failureStage', isOptional(row.failureStage, reportJobStatus_1.isReportJobFailureStage));
    check('failureCode', isOptional(row.failureCode, reportJobStatus_1.isReportJobFailureCode));
    check('lastTransientErrorCode', isOptional(row.lastTransientErrorCode, isText(128)));
    // Cross-field rules: the status milestone and the fields that prove it agree.
    if (!(0, reportJobStatus_1.isReportJobStatus)(row.status))
        return;
    const status = row.status;
    if (status === 'failed') {
        check('failureCode', (0, reportJobStatus_1.isReportJobFailureCode)(row.failureCode));
        check('failureStage', (0, reportJobStatus_1.isReportJobFailureStage)(row.failureStage));
        if ((0, reportJobStatus_1.isReportJobFailureCode)(row.failureCode) && (0, reportJobStatus_1.isReportJobFailureStage)(row.failureStage)) {
            const expected = reportJobStatus_1.REPORT_JOB_FAILURE_STAGE_BY_CODE[row.failureCode];
            check('failureStage', expected === null || expected === row.failureStage);
        }
    }
    else {
        check('failureCode', row.failureCode === undefined);
        check('failureStage', row.failureStage === undefined);
    }
    if (SNAPSHOT_STATUSES.includes(status)) {
        check('sourceSnapshotSha256', isSha(row.sourceSnapshotSha256));
        check('sourceObservedAtUtc', (0, reportingIds_1.isIsoUtcTimestamp)(row.sourceObservedAtUtc));
    }
    if (ARTIFACT_STATUSES.includes(status)) {
        check('artifactContentSha256', isSha(row.artifactContentSha256));
        check('artifactBytes', isCount(row.artifactBytes) && row.artifactBytes >= 1);
        check('generatedAtUtc', (0, reportingIds_1.isIsoUtcTimestamp)(row.generatedAtUtc));
    }
    if (status === 'completed' || status === 'completed-with-notification-errors')
        check('completedAtUtc', (0, reportingIds_1.isIsoUtcTimestamp)(row.completedAtUtc));
    if (status === 'accepted')
        check('attemptCount', row.attemptCount === 0);
};
/**
 * Validates a stored row and its request. Accepts REST (`PartitionKey`) and `@azure/data-tables` (`partitionKey`)
 * key casing and ignores Table system properties. Checks keys against the body, the job ID against the trigger's
 * instant, status against the fields that prove it, the report type and scope hash against the spec, the request's
 * canonical form and `requestSha256`. Returns the row in REST casing. Never throws.
 */
const parseReportJobRowV1 = async (entity) => {
    try {
        if (!(0, reportingIds_1.isPlainRecord)(entity))
            return { ok: false, code: 'request-invalid', errors: ['row: must be an object'] };
        const normalized = (0, reportTableEntities_1.normalizeReportTableEntity)(entity);
        if (normalized.schemaVersion !== exports.REPORT_JOB_ROW_SCHEMA_VERSION) {
            return { ok: false, code: 'unsupported-schema-version', errors: ['schemaVersion: unsupported'] };
        }
        const errors = [];
        validateShape(normalized, errors);
        if (errors.length > 0)
            return { ok: false, code: 'request-invalid', errors: Array.from(new Set(errors)) };
        const row = normalized;
        if ((await (0, reportingDigest_1.sha256Hex)(row.requestJson)) !== row.requestSha256) {
            return { ok: false, code: 'request-hash-mismatch', errors: ['requestSha256: does not match requestJson'] };
        }
        const spec = (0, reportJobSpec_1.parseReportJobRequestJson)(row.requestJson);
        if (!spec.ok)
            return { ok: false, code: 'request-invalid', errors: spec.errors };
        if (spec.value.reportType !== row.reportType)
            return { ok: false, code: 'request-invalid', errors: ['reportType: does not match the request'] };
        const scopeHash = await (0, reportJobIdentity_1.buildReportJobScopeHash)({
            subscriptionIds: spec.value.scope.subscriptionIds,
            scheduleId: row.trigger === 'schedule' ? row.scheduleId : undefined,
        });
        if ((0, reportJobIdentity_1.parseReportJobId)(row.jobId)?.scopeHash !== scopeHash) {
            return { ok: false, code: 'request-invalid', errors: ['jobId: scope hash does not match the request'] };
        }
        return { ok: true, row, spec: spec.value };
    }
    catch {
        return { ok: false, code: 'request-invalid', errors: ['row: unreadable'] };
    }
};
exports.parseReportJobRowV1 = parseReportJobRowV1;
/**
 * Builds the row a producer inserts (status `accepted`, attempt 0, notification `none`), with the job ID derived
 * from the trigger's instant and the request. The result is validated with `parseReportJobRowV1`; invalid input throws.
 */
const buildReportJobRowV1 = async (input) => {
    const requestJson = (0, reportJobSpec_1.serializeReportJobSpecV1)(input.spec);
    const spec = (0, reportJobSpec_1.parseReportJobRequestJson)(requestJson);
    if (!spec.ok)
        throw new Error(`Invalid report job spec: ${spec.errors.join('; ')}`);
    const schedule = input.trigger === 'schedule' ? input : undefined;
    const { jobId } = await (0, reportJobIdentity_1.deriveReportJobIdentity)({
        instant: schedule ? schedule.scheduledForUtc : input.requestedAtUtc,
        reportType: spec.value.reportType,
        subscriptionIds: spec.value.scope.subscriptionIds,
        scheduleId: schedule?.scheduleId,
    });
    const row = {
        PartitionKey: input.companyId,
        RowKey: jobId,
        schemaVersion: 1,
        jobId,
        companyId: input.companyId,
        reportType: spec.value.reportType,
        trigger: input.trigger,
        ...(schedule
            ? {
                scheduleId: schedule.scheduleId,
                definitionRevision: schedule.definitionRevision,
                scheduledForUtc: schedule.scheduledForUtc,
                ...(schedule.coalescedOccurrenceCount === undefined ? {} : { coalescedOccurrenceCount: schedule.coalescedOccurrenceCount }),
            }
            : {}),
        requestedAtUtc: input.requestedAtUtc,
        ...(input.requestedByUserId === undefined ? {} : { requestedByUserId: input.requestedByUserId }),
        requestJson,
        requestSha256: await (0, reportingDigest_1.sha256Hex)(requestJson),
        fileName: input.fileName,
        ...(input.notificationPolicyId === undefined ? {} : { notificationPolicyId: input.notificationPolicyId }),
        status: 'accepted',
        attemptCount: 0,
        notificationStatus: 'none',
    };
    const parsed = await (0, exports.parseReportJobRowV1)(row);
    if (!parsed.ok)
        throw new Error(`Invalid report job row: ${parsed.errors.join('; ')}`);
    return row;
};
exports.buildReportJobRowV1 = buildReportJobRowV1;
//# sourceMappingURL=reportJobRow.js.map