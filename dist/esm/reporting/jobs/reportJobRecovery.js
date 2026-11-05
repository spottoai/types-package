import { sha256Hex } from '../shared/reportingDigest.js';
import { hasExactlyKeys, isBoundedPlainText, isIsoUtcTimestamp, isPlainRecord, isReportJobCompanyId } from '../shared/reportingIds.js';
import { normalizeReportTableEntity } from '../shared/reportTableEntities.js';
import { isReportJobId } from './reportJobIdentity.js';
/** A hint precedes acceptance; consumers point-read the authoritative company job row. */
export const REPORT_JOB_RECOVERY_TABLE = 'reportjobrecovery';
export const REPORT_WORKER_RECOVERY_TABLE = 'reportworkerrecovery';
export const REPORT_JOB_RECOVERY_SHARDS = Array.from({ length: 16 }, (_, shard) => `report-pub-${shard.toString(16)}`);
export async function buildReportWorkerRecoveryPointerV1(input) {
    if (!['generation-completion', 'notification', 'artifact-index'].includes(input.phase))
        throw new Error('Invalid report worker recovery phase.');
    const base = await buildReportJobRecoveryPointerV1(input);
    return { ...base, PartitionKey: base.PartitionKey.replace('report-pub-', 'report-worker-'), kind: 'report-worker-recovery', phase: input.phase };
}
export async function parseReportWorkerRecoveryPointerV1(entity) {
    const invalid = () => ({ ok: false, errors: ['recovery: invalid worker pointer'] });
    try {
        if (!isPlainRecord(entity))
            return invalid();
        const row = normalizeReportTableEntity(entity);
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
export async function buildReportJobRecoveryPointerV1(input) {
    if (!isReportJobCompanyId(input.companyId) ||
        !isReportJobId(input.jobId) ||
        !isIsoUtcTimestamp(input.createdAtUtc) ||
        (input.nextAttemptAtUtc !== undefined && !isIsoUtcTimestamp(input.nextAttemptAtUtc)))
        throw new Error('Invalid report recovery identity.');
    const companyHash = await sha256Hex(input.companyId);
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
export async function parseReportJobRecoveryPointerV1(entity) {
    const invalid = () => ({ ok: false, errors: ['recovery: invalid pointer'] });
    try {
        if (!isPlainRecord(entity))
            return invalid();
        const row = normalizeReportTableEntity(entity);
        if (!hasExactlyKeys(row, ['PartitionKey', 'RowKey', 'schemaVersion', 'kind', 'companyId', 'jobId', 'createdAtUtc', 'nextAttemptAtUtc', 'recoveryAttemptCount'], ['leaseOwner', 'leaseExpiresAtUtc']) ||
            row.schemaVersion !== 1 ||
            row.kind !== 'report-publication-recovery' ||
            !isReportJobCompanyId(row.companyId) ||
            !isReportJobId(row.jobId) ||
            !isIsoUtcTimestamp(row.createdAtUtc) ||
            !isIsoUtcTimestamp(row.nextAttemptAtUtc) ||
            !Number.isSafeInteger(row.recoveryAttemptCount) ||
            Number(row.recoveryAttemptCount) < 0 ||
            (row.leaseOwner === undefined) !== (row.leaseExpiresAtUtc === undefined) ||
            (row.leaseOwner !== undefined && !isBoundedPlainText(row.leaseOwner, 256)) ||
            (row.leaseExpiresAtUtc !== undefined && !isIsoUtcTimestamp(row.leaseExpiresAtUtc)))
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
