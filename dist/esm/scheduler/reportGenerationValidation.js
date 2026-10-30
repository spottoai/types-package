import { hasExactlyKeys, isBoundedPlainText, isCalendarDate, isIanaTimeZone, isIsoUtcTimestamp, isPlainRecord, isReportEntityId, isReportJobCompanyId, } from '../reporting/shared/reportingIds.js';
import { isReportJobId, parseReportJobId } from '../reporting/jobs/reportJobIdentity.js';
import { parseReportJobSpecV1 } from '../reporting/jobs/reportJobSpec.js';
import { isWithinJsonByteLimit } from './resourceStrategyValidationShared.js';
import { RESOURCE_STRATEGY_CONTRACT_LIMITS } from './resourceStrategyContracts.js';
const bounded = (value) => isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes);
const positive = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 1 && value <= 2147483647;
const localTime = (value) => typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
export const isScheduledReportJobSpecV1 = (value) => {
    const parsed = parseReportJobSpecV1(value);
    return parsed.ok && (parsed.value.reportType !== 'sdm' || parsed.value.period.kind !== 'explicit');
};
export const isReportGenerationScheduleTiming = (value) => {
    if (!isPlainRecord(value))
        return false;
    if (value.triggerType === 'once')
        return (hasExactlyKeys(value, ['triggerType', 'localDateTime']) &&
            typeof value.localDateTime === 'string' &&
            value.localDateTime.length === 16 &&
            value.localDateTime[10] === 'T' &&
            isCalendarDate(value.localDateTime.slice(0, 10)) &&
            localTime(value.localDateTime.slice(11)));
    if (value.triggerType !== 'recurring' || !localTime(value.localTime))
        return false;
    const keys = ['triggerType', 'cadence', 'localTime'];
    if (value.cadence === 'daily')
        return hasExactlyKeys(value, keys);
    if (value.cadence === 'weekly')
        return (hasExactlyKeys(value, [...keys, 'dayOfWeek']) &&
            typeof value.dayOfWeek === 'number' &&
            Number.isInteger(value.dayOfWeek) &&
            value.dayOfWeek >= 0 &&
            value.dayOfWeek <= 6);
    return ((value.cadence === 'monthly' || value.cadence === 'quarterly') &&
        hasExactlyKeys(value, [...keys, 'dayOfMonth']) &&
        (value.dayOfMonth === 'last' || (positive(value.dayOfMonth) && value.dayOfMonth <= 31)));
};
export const isReportGenerationScheduleWriteRequest = (value) => {
    try {
        return (bounded(value) &&
            isPlainRecord(value) &&
            hasExactlyKeys(value, ['definitionType', 'name', 'timezone', 'timing', 'report', 'initialMode'], ['notificationPolicyId']) &&
            value.definitionType === 'report-generation' &&
            isBoundedPlainText(value.name, 500) &&
            isIanaTimeZone(value.timezone) &&
            isReportGenerationScheduleTiming(value.timing) &&
            isScheduledReportJobSpecV1(value.report) &&
            (value.notificationPolicyId === undefined || isReportEntityId(value.notificationPolicyId)) &&
            (value.initialMode === 'active' || value.initialMode === 'paused'));
    }
    catch {
        return false;
    }
};
export const isReportGenerationScheduleCommand = (value) => isPlainRecord(value) &&
    hasExactlyKeys(value, ['command', 'idempotencyKey']) &&
    (value.command === 'pause' || value.command === 'resume') &&
    isBoundedPlainText(value.idempotencyKey, 200);
export const isReportGenerationScheduleProjection = (value) => {
    try {
        if (!bounded(value) ||
            !isPlainRecord(value) ||
            !hasExactlyKeys(value, [
                'scheduleId',
                'definitionRevision',
                'controlGeneration',
                'etag',
                'status',
                'definition',
                'createdAtUtc',
                'createdBy',
                'updatedAtUtc',
                'updatedBy',
            ], ['nextOccurrenceAtUtc', 'lastOccurrenceAtUtc', 'lastOccurrenceOutcome', 'lastJobId', 'pauseReason', 'lastOccurrenceSettledAtUtc']) ||
            !isReportEntityId(value.scheduleId) ||
            !positive(value.definitionRevision) ||
            !positive(value.controlGeneration) ||
            !isBoundedPlainText(value.etag, 2000) ||
            value.etag === '*' ||
            !['active', 'paused', 'completed'].includes(String(value.status)) ||
            !isReportGenerationScheduleWriteRequest(value.definition) ||
            !isIsoUtcTimestamp(value.createdAtUtc) ||
            !isIsoUtcTimestamp(value.updatedAtUtc) ||
            !isBoundedPlainText(value.createdBy, 500) ||
            !isBoundedPlainText(value.updatedBy, 500))
            return false;
        if (value.pauseReason !== undefined && (value.status !== 'paused' || value.pauseReason !== 'owner-access-unavailable'))
            return false;
        if (value.lastOccurrenceSettledAtUtc !== undefined && (!value.lastOccurrenceAtUtc || !isIsoUtcTimestamp(value.lastOccurrenceSettledAtUtc)))
            return false;
        if (value.nextOccurrenceAtUtc !== undefined && !isIsoUtcTimestamp(value.nextOccurrenceAtUtc))
            return false;
        if ((value.lastOccurrenceAtUtc === undefined) !== (value.lastOccurrenceOutcome === undefined) ||
            (value.lastOccurrenceAtUtc !== undefined && !isIsoUtcTimestamp(value.lastOccurrenceAtUtc)))
            return false;
        if (value.lastOccurrenceOutcome === 'accepted')
            return isReportJobId(value.lastJobId) && parseReportJobId(value.lastJobId)?.reportType === value.definition.report.reportType;
        return ((value.lastOccurrenceOutcome === undefined || value.lastOccurrenceOutcome === 'failed' || value.lastOccurrenceOutcome === 'skipped') &&
            value.lastJobId === undefined);
    }
    catch {
        return false;
    }
};
export const isScheduledReportGenerationV1 = (value) => {
    try {
        return (bounded(value) &&
            isPlainRecord(value) &&
            hasExactlyKeys(value, [
                'schemaVersion',
                'definitionType',
                'companyId',
                'scheduleId',
                'definitionRevision',
                'controlGeneration',
                'occurrenceKey',
                'scheduleRunId',
                'dueAtUtc',
                'report',
                'correlationId',
            ], ['notificationPolicyId', 'coalescedOccurrenceCount']) &&
            value.schemaVersion === 1 &&
            value.definitionType === 'report-generation' &&
            isReportJobCompanyId(value.companyId) &&
            isReportEntityId(value.scheduleId) &&
            positive(value.definitionRevision) &&
            positive(value.controlGeneration) &&
            isBoundedPlainText(value.occurrenceKey, 2000) &&
            isBoundedPlainText(value.scheduleRunId, 500) &&
            isIsoUtcTimestamp(value.dueAtUtc) &&
            isScheduledReportJobSpecV1(value.report) &&
            isBoundedPlainText(value.correlationId, 128) &&
            (value.notificationPolicyId === undefined || isReportEntityId(value.notificationPolicyId)) &&
            (value.coalescedOccurrenceCount === undefined || positive(value.coalescedOccurrenceCount)));
    }
    catch {
        return false;
    }
};
