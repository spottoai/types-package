/**
 * The `reportjobs` row (core/specs/reporting/reporting-scheduler.md, "Report job table").
 *
 * PartitionKey = companyId, RowKey = jobId. Three writers own disjoint field groups and merge with ETag
 * compare-and-swap: the producer (insert only), reportworker and, from phase 6, cloud-engine's notifier.
 * The row carries no region (each region has its own table, queue and worker) and no time zone (reportworker uses
 * the company's `preferredTimezone`, else UTC). The row never holds e-mail addresses, document content, source data, Blob paths or credentials.
 */
import { sha256Hex, SHA256_HEX_PATTERN } from '../shared/reportingDigest.js';
import { isReportFileName } from '../shared/reportingPaths.js';
import { hasExactlyKeys, isBoundedPlainText, isIsoUtcTimestamp, isPlainRecord, isReportEntityId, isReportJobCompanyId, utf8ByteLength, } from '../shared/reportingIds.js';
import { normalizeReportTableEntity } from '../shared/reportTableEntities.js';
import { buildReportJobScopeHash, deriveReportJobIdentity, parseReportJobId } from './reportJobIdentity.js';
import { parseReportJobRequestJson, REPORT_JOB_SPEC_MAX_BYTES, serializeReportJobSpecV1, } from './reportJobSpec.js';
import { isReportJobFailureCode, isReportJobFailureStage, isReportJobNotificationStatus, isReportJobStatus, REPORT_JOB_FAILURE_STAGE_BY_CODE, } from './reportJobStatus.js';
export const REPORT_JOB_ROW_SCHEMA_VERSION = 1;
export const REPORT_JOB_TRIGGERS = ['api', 'schedule'];
/** UTF-8 byte limit of `sourceCoverageSummary` (a JSON object). */
export const REPORT_JOB_COVERAGE_SUMMARY_MAX_BYTES = 8 * 1024;
export const REPORT_JOB_PRODUCER_FIELDS = [
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
export const REPORT_JOB_WORKER_FIELDS = [
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
export const REPORT_JOB_NOTIFICATION_FIELDS = ['notificationStatus'];
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
const OPTIONAL_FIELDS = [...REPORT_JOB_PRODUCER_FIELDS, ...REPORT_JOB_WORKER_FIELDS, ...REPORT_JOB_NOTIFICATION_FIELDS].filter(field => !REQUIRED_FIELDS.includes(field));
/** Statuses reached only after the source snapshot is durable. */
const SNAPSHOT_STATUSES = ['source-ready', 'generated', 'completed', 'completed-with-notification-errors'];
/** Statuses reached only after the artifact is durable. */
const ARTIFACT_STATUSES = ['generated', 'completed', 'completed-with-notification-errors'];
const isCount = (value) => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 2147483647;
const isSha = (value) => typeof value === 'string' && SHA256_HEX_PATTERN.test(value);
const isText = (limit) => (value) => isBoundedPlainText(value, limit);
const isOptional = (value, check) => value === undefined || check(value);
const isCoverageSummary = (value) => {
    if (typeof value !== 'string' || utf8ByteLength(value) > REPORT_JOB_COVERAGE_SUMMARY_MAX_BYTES)
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
    if (!hasExactlyKeys(row, REQUIRED_FIELDS, OPTIONAL_FIELDS)) {
        const unknown = Object.keys(row).filter(key => !REQUIRED_FIELDS.includes(key) && !OPTIONAL_FIELDS.includes(key));
        const missing = REQUIRED_FIELDS.filter(key => row[key] === undefined);
        if (unknown.length > 0)
            errors.push(`row: unknown fields ${unknown.join(', ')}`);
        if (missing.length > 0)
            errors.push(`row: missing fields ${missing.join(', ')}`);
    }
    check('companyId', isReportJobCompanyId(row.companyId) && row.PartitionKey === row.companyId);
    const parsedId = parseReportJobId(row.jobId);
    check('jobId', parsedId !== null && row.RowKey === row.jobId);
    check('reportType', parsedId !== null && row.reportType === parsedId.reportType);
    check('trigger', row.trigger === 'api' || row.trigger === 'schedule');
    check('requestedAtUtc', isIsoUtcTimestamp(row.requestedAtUtc));
    check('requestJson', typeof row.requestJson === 'string' && utf8ByteLength(row.requestJson) <= REPORT_JOB_SPEC_MAX_BYTES);
    check('requestSha256', isSha(row.requestSha256));
    check('fileName', isReportFileName(row.fileName));
    // Requesters are identified by user ID, never by e-mail address.
    check('requestedByUserId', isOptional(row.requestedByUserId, value => isText(128)(value) && !value.includes('@')));
    check('notificationPolicyId', isOptional(row.notificationPolicyId, isReportEntityId));
    check('coalescedOccurrenceCount', isOptional(row.coalescedOccurrenceCount, value => isCount(value) && value >= 1));
    if (row.trigger === 'schedule') {
        check('scheduleId', isReportEntityId(row.scheduleId));
        check('definitionRevision', isCount(row.definitionRevision) && row.definitionRevision >= 1);
        check('scheduledForUtc', isIsoUtcTimestamp(row.scheduledForUtc));
    }
    else {
        check('scheduleId', row.scheduleId === undefined);
        check('definitionRevision', row.definitionRevision === undefined);
        check('scheduledForUtc', row.scheduledForUtc === undefined);
        check('coalescedOccurrenceCount', row.coalescedOccurrenceCount === undefined);
    }
    const instant = row.trigger === 'schedule' ? row.scheduledForUtc : row.requestedAtUtc;
    check('jobId', parsedId !== null && typeof instant === 'string' && parsedId.instant.toISOString() === instant);
    check('status', isReportJobStatus(row.status));
    check('attemptCount', isCount(row.attemptCount));
    check('notificationStatus', isReportJobNotificationStatus(row.notificationStatus));
    for (const field of ['leaseExpiresAtUtc', 'startedAtUtc', 'lastAttemptAtUtc', 'sourceObservedAtUtc', 'generatedAtUtc', 'completedAtUtc']) {
        check(field, isOptional(row[field], isIsoUtcTimestamp));
    }
    check('leaseOwner', isOptional(row.leaseOwner, isText(256)));
    check('sourceSnapshotSha256', isOptional(row.sourceSnapshotSha256, isSha));
    check('artifactContentSha256', isOptional(row.artifactContentSha256, isSha));
    check('artifactBytes', isOptional(row.artifactBytes, value => isCount(value) && value >= 1));
    check('sourceCoverageSummary', isOptional(row.sourceCoverageSummary, isCoverageSummary));
    check('failureStage', isOptional(row.failureStage, isReportJobFailureStage));
    check('failureCode', isOptional(row.failureCode, isReportJobFailureCode));
    check('lastTransientErrorCode', isOptional(row.lastTransientErrorCode, isText(128)));
    // Cross-field rules: the status milestone and the fields that prove it agree.
    if (!isReportJobStatus(row.status))
        return;
    const status = row.status;
    if (status === 'failed') {
        check('failureCode', isReportJobFailureCode(row.failureCode));
        check('failureStage', isReportJobFailureStage(row.failureStage));
        if (isReportJobFailureCode(row.failureCode) && isReportJobFailureStage(row.failureStage)) {
            const expected = REPORT_JOB_FAILURE_STAGE_BY_CODE[row.failureCode];
            check('failureStage', expected === null || expected === row.failureStage);
        }
    }
    else {
        check('failureCode', row.failureCode === undefined);
        check('failureStage', row.failureStage === undefined);
    }
    if (SNAPSHOT_STATUSES.includes(status)) {
        check('sourceSnapshotSha256', isSha(row.sourceSnapshotSha256));
        check('sourceObservedAtUtc', isIsoUtcTimestamp(row.sourceObservedAtUtc));
    }
    if (ARTIFACT_STATUSES.includes(status)) {
        check('artifactContentSha256', isSha(row.artifactContentSha256));
        check('artifactBytes', isCount(row.artifactBytes) && row.artifactBytes >= 1);
        check('generatedAtUtc', isIsoUtcTimestamp(row.generatedAtUtc));
    }
    if (status === 'completed' || status === 'completed-with-notification-errors')
        check('completedAtUtc', isIsoUtcTimestamp(row.completedAtUtc));
    if (status === 'accepted')
        check('attemptCount', row.attemptCount === 0);
};
/**
 * Validates a stored row and its request. Accepts REST (`PartitionKey`) and `@azure/data-tables` (`partitionKey`)
 * key casing and ignores Table system properties. Checks keys against the body, the job ID against the trigger's
 * instant, status against the fields that prove it, the report type and scope hash against the spec, the request's
 * canonical form and `requestSha256`. Returns the row in REST casing. Never throws.
 */
export const parseReportJobRowV1 = async (entity) => {
    try {
        if (!isPlainRecord(entity))
            return { ok: false, code: 'request-invalid', errors: ['row: must be an object'] };
        const normalized = normalizeReportTableEntity(entity);
        if (normalized.schemaVersion !== REPORT_JOB_ROW_SCHEMA_VERSION) {
            return { ok: false, code: 'unsupported-schema-version', errors: ['schemaVersion: unsupported'] };
        }
        const errors = [];
        validateShape(normalized, errors);
        if (errors.length > 0)
            return { ok: false, code: 'request-invalid', errors: Array.from(new Set(errors)) };
        const row = normalized;
        if ((await sha256Hex(row.requestJson)) !== row.requestSha256) {
            return { ok: false, code: 'request-hash-mismatch', errors: ['requestSha256: does not match requestJson'] };
        }
        const spec = parseReportJobRequestJson(row.requestJson);
        if (!spec.ok)
            return { ok: false, code: 'request-invalid', errors: spec.errors };
        if (spec.value.reportType !== row.reportType)
            return { ok: false, code: 'request-invalid', errors: ['reportType: does not match the request'] };
        const scopeHash = await buildReportJobScopeHash({
            subscriptionIds: spec.value.scope.subscriptionIds,
            scheduleId: row.trigger === 'schedule' ? row.scheduleId : undefined,
        });
        if (parseReportJobId(row.jobId)?.scopeHash !== scopeHash) {
            return { ok: false, code: 'request-invalid', errors: ['jobId: scope hash does not match the request'] };
        }
        return { ok: true, row, spec: spec.value };
    }
    catch {
        return { ok: false, code: 'request-invalid', errors: ['row: unreadable'] };
    }
};
/**
 * Builds the row a producer inserts (status `accepted`, attempt 0, notification `none`), with the job ID derived
 * from the trigger's instant and the request. The result is validated with `parseReportJobRowV1`; invalid input throws.
 */
export const buildReportJobRowV1 = async (input) => {
    const requestJson = serializeReportJobSpecV1(input.spec);
    const spec = parseReportJobRequestJson(requestJson);
    if (!spec.ok)
        throw new Error(`Invalid report job spec: ${spec.errors.join('; ')}`);
    const schedule = input.trigger === 'schedule' ? input : undefined;
    const { jobId } = await deriveReportJobIdentity({
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
        requestSha256: await sha256Hex(requestJson),
        fileName: input.fileName,
        ...(input.notificationPolicyId === undefined ? {} : { notificationPolicyId: input.notificationPolicyId }),
        status: 'accepted',
        attemptCount: 0,
        notificationStatus: 'none',
    };
    const parsed = await parseReportJobRowV1(row);
    if (!parsed.ok)
        throw new Error(`Invalid report job row: ${parsed.errors.join('; ')}`);
    return row;
};
