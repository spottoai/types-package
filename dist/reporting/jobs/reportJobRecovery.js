"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REPORT_JOB_RECOVERY_SHARDS = exports.REPORT_WORKER_RECOVERY_TABLE = exports.REPORT_JOB_RECOVERY_TABLE = void 0;
exports.buildReportWorkerRecoveryPointerV1 = buildReportWorkerRecoveryPointerV1;
exports.parseReportWorkerRecoveryPointerV1 = parseReportWorkerRecoveryPointerV1;
exports.buildReportJobRecoveryPointerV1 = buildReportJobRecoveryPointerV1;
exports.parseReportJobRecoveryPointerV1 = parseReportJobRecoveryPointerV1;
const reportingDigest_1 = require("../shared/reportingDigest");
const reportingIds_1 = require("../shared/reportingIds");
const reportTableEntities_1 = require("../shared/reportTableEntities");
const reportJobIdentity_1 = require("./reportJobIdentity");
/** A hint precedes acceptance; consumers point-read the authoritative company job row. */
exports.REPORT_JOB_RECOVERY_TABLE = 'reportjobrecovery';
exports.REPORT_WORKER_RECOVERY_TABLE = 'reportworkerrecovery';
exports.REPORT_JOB_RECOVERY_SHARDS = Array.from({ length: 16 }, (_, shard) => `report-pub-${shard.toString(16)}`);
async function buildReportWorkerRecoveryPointerV1(input) {
    if (!['generation-completion', 'notification', 'artifact-index'].includes(input.phase))
        throw new Error('Invalid report worker recovery phase.');
    const base = await buildReportJobRecoveryPointerV1(input);
    return { ...base, PartitionKey: base.PartitionKey.replace('report-pub-', 'report-worker-'), kind: 'report-worker-recovery', phase: input.phase };
}
async function parseReportWorkerRecoveryPointerV1(entity) {
    const invalid = () => ({ ok: false, errors: ['recovery: invalid worker pointer'] });
    try {
        if (!(0, reportingIds_1.isPlainRecord)(entity))
            return invalid();
        const row = (0, reportTableEntities_1.normalizeReportTableEntity)(entity);
        if (row.kind !== 'report-worker-recovery' ||
            !['generation-completion', 'notification', 'artifact-index'].includes(String(row.phase)) ||
            typeof row.PartitionKey !== 'string' ||
            !/^report-worker-[a-f0-9]$/.test(row.PartitionKey))
            return invalid();
        const { phase: _phase, ...rest } = row;
        const parsed = await parseReportJobRecoveryPointerV1({
            ...rest,
            PartitionKey: row.PartitionKey.replace('report-worker-', 'report-pub-'),
            kind: 'report-publication-recovery',
        });
        if (!parsed.ok)
            return invalid();
        return { ok: true, value: row };
    }
    catch {
        return invalid();
    }
}
async function buildReportJobRecoveryPointerV1(input) {
    if (!(0, reportingIds_1.isReportJobCompanyId)(input.companyId) ||
        !(0, reportJobIdentity_1.isReportJobId)(input.jobId) ||
        !(0, reportingIds_1.isIsoUtcTimestamp)(input.createdAtUtc) ||
        (input.nextAttemptAtUtc !== undefined && !(0, reportingIds_1.isIsoUtcTimestamp)(input.nextAttemptAtUtc)))
        throw new Error('Invalid report recovery identity.');
    const companyHash = await (0, reportingDigest_1.sha256Hex)(input.companyId);
    return {
        PartitionKey: `report-pub-${companyHash.slice(0, 1)}`,
        RowKey: `${companyHash.slice(0, 16)}-${input.jobId}`,
        schemaVersion: 1,
        kind: 'report-publication-recovery',
        companyId: input.companyId,
        jobId: input.jobId,
        createdAtUtc: input.createdAtUtc,
        nextAttemptAtUtc: input.nextAttemptAtUtc ?? input.createdAtUtc,
        recoveryAttemptCount: 0,
    };
}
async function parseReportJobRecoveryPointerV1(entity) {
    const invalid = () => ({ ok: false, errors: ['recovery: invalid pointer'] });
    try {
        if (!(0, reportingIds_1.isPlainRecord)(entity))
            return invalid();
        const row = (0, reportTableEntities_1.normalizeReportTableEntity)(entity);
        if (!(0, reportingIds_1.hasExactlyKeys)(row, ['PartitionKey', 'RowKey', 'schemaVersion', 'kind', 'companyId', 'jobId', 'createdAtUtc', 'nextAttemptAtUtc', 'recoveryAttemptCount'], ['leaseOwner', 'leaseExpiresAtUtc']) ||
            row.schemaVersion !== 1 ||
            row.kind !== 'report-publication-recovery' ||
            !(0, reportingIds_1.isReportJobCompanyId)(row.companyId) ||
            !(0, reportJobIdentity_1.isReportJobId)(row.jobId) ||
            !(0, reportingIds_1.isIsoUtcTimestamp)(row.createdAtUtc) ||
            !(0, reportingIds_1.isIsoUtcTimestamp)(row.nextAttemptAtUtc) ||
            !Number.isSafeInteger(row.recoveryAttemptCount) ||
            Number(row.recoveryAttemptCount) < 0 ||
            (row.leaseOwner === undefined) !== (row.leaseExpiresAtUtc === undefined) ||
            (row.leaseOwner !== undefined && !(0, reportingIds_1.isBoundedPlainText)(row.leaseOwner, 256)) ||
            (row.leaseExpiresAtUtc !== undefined && !(0, reportingIds_1.isIsoUtcTimestamp)(row.leaseExpiresAtUtc)))
            return invalid();
        const canonical = await buildReportJobRecoveryPointerV1({ companyId: row.companyId, jobId: row.jobId, createdAtUtc: row.createdAtUtc });
        if (row.PartitionKey !== canonical.PartitionKey || row.RowKey !== canonical.RowKey)
            return invalid();
        return { ok: true, value: row };
    }
    catch {
        return invalid();
    }
}
//# sourceMappingURL=reportJobRecovery.js.map