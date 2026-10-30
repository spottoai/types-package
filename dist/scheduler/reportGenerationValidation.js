"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isScheduledReportGenerationV1 = exports.isReportGenerationScheduleProjection = exports.isReportGenerationScheduleCommand = exports.isReportGenerationScheduleWriteRequest = exports.isReportGenerationScheduleTiming = exports.isScheduledReportJobSpecV1 = void 0;
const reportingIds_1 = require("../reporting/shared/reportingIds");
const reportJobIdentity_1 = require("../reporting/jobs/reportJobIdentity");
const reportJobSpec_1 = require("../reporting/jobs/reportJobSpec");
const resourceStrategyValidationShared_1 = require("./resourceStrategyValidationShared");
const resourceStrategyContracts_1 = require("./resourceStrategyContracts");
const bounded = (value) => (0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes);
const positive = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 1 && value <= 2147483647;
const localTime = (value) => typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
const isScheduledReportJobSpecV1 = (value) => {
    const parsed = (0, reportJobSpec_1.parseReportJobSpecV1)(value);
    return parsed.ok && (parsed.value.reportType !== 'sdm' || parsed.value.period.kind !== 'explicit');
};
exports.isScheduledReportJobSpecV1 = isScheduledReportJobSpecV1;
const isReportGenerationScheduleTiming = (value) => {
    if (!(0, reportingIds_1.isPlainRecord)(value))
        return false;
    if (value.triggerType === 'once')
        return ((0, reportingIds_1.hasExactlyKeys)(value, ['triggerType', 'localDateTime']) &&
            typeof value.localDateTime === 'string' &&
            value.localDateTime.length === 16 &&
            value.localDateTime[10] === 'T' &&
            (0, reportingIds_1.isCalendarDate)(value.localDateTime.slice(0, 10)) &&
            localTime(value.localDateTime.slice(11)));
    if (value.triggerType !== 'recurring' || !localTime(value.localTime))
        return false;
    const keys = ['triggerType', 'cadence', 'localTime'];
    if (value.cadence === 'daily')
        return (0, reportingIds_1.hasExactlyKeys)(value, keys);
    if (value.cadence === 'weekly')
        return ((0, reportingIds_1.hasExactlyKeys)(value, [...keys, 'dayOfWeek']) &&
            typeof value.dayOfWeek === 'number' &&
            Number.isInteger(value.dayOfWeek) &&
            value.dayOfWeek >= 0 &&
            value.dayOfWeek <= 6);
    return ((value.cadence === 'monthly' || value.cadence === 'quarterly') &&
        (0, reportingIds_1.hasExactlyKeys)(value, [...keys, 'dayOfMonth']) &&
        (value.dayOfMonth === 'last' || (positive(value.dayOfMonth) && value.dayOfMonth <= 31)));
};
exports.isReportGenerationScheduleTiming = isReportGenerationScheduleTiming;
const isReportGenerationScheduleWriteRequest = (value) => {
    try {
        return (bounded(value) &&
            (0, reportingIds_1.isPlainRecord)(value) &&
            (0, reportingIds_1.hasExactlyKeys)(value, ['definitionType', 'name', 'timezone', 'timing', 'report', 'initialMode'], ['notificationPolicyId']) &&
            value.definitionType === 'report-generation' &&
            (0, reportingIds_1.isBoundedPlainText)(value.name, 500) &&
            (0, reportingIds_1.isIanaTimeZone)(value.timezone) &&
            (0, exports.isReportGenerationScheduleTiming)(value.timing) &&
            (0, exports.isScheduledReportJobSpecV1)(value.report) &&
            (value.notificationPolicyId === undefined || (0, reportingIds_1.isReportEntityId)(value.notificationPolicyId)) &&
            (value.initialMode === 'active' || value.initialMode === 'paused'));
    }
    catch {
        return false;
    }
};
exports.isReportGenerationScheduleWriteRequest = isReportGenerationScheduleWriteRequest;
const isReportGenerationScheduleCommand = (value) => (0, reportingIds_1.isPlainRecord)(value) &&
    (0, reportingIds_1.hasExactlyKeys)(value, ['command', 'idempotencyKey']) &&
    (value.command === 'pause' || value.command === 'resume') &&
    (0, reportingIds_1.isBoundedPlainText)(value.idempotencyKey, 200);
exports.isReportGenerationScheduleCommand = isReportGenerationScheduleCommand;
const isReportGenerationScheduleProjection = (value) => {
    try {
        if (!bounded(value) ||
            !(0, reportingIds_1.isPlainRecord)(value) ||
            !(0, reportingIds_1.hasExactlyKeys)(value, [
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
            !(0, reportingIds_1.isReportEntityId)(value.scheduleId) ||
            !positive(value.definitionRevision) ||
            !positive(value.controlGeneration) ||
            !(0, reportingIds_1.isBoundedPlainText)(value.etag, 2000) ||
            value.etag === '*' ||
            !['active', 'paused', 'completed'].includes(String(value.status)) ||
            !(0, exports.isReportGenerationScheduleWriteRequest)(value.definition) ||
            !(0, reportingIds_1.isIsoUtcTimestamp)(value.createdAtUtc) ||
            !(0, reportingIds_1.isIsoUtcTimestamp)(value.updatedAtUtc) ||
            !(0, reportingIds_1.isBoundedPlainText)(value.createdBy, 500) ||
            !(0, reportingIds_1.isBoundedPlainText)(value.updatedBy, 500))
            return false;
        if (value.pauseReason !== undefined && (value.status !== 'paused' || value.pauseReason !== 'owner-access-unavailable'))
            return false;
        if (value.lastOccurrenceSettledAtUtc !== undefined && (!value.lastOccurrenceAtUtc || !(0, reportingIds_1.isIsoUtcTimestamp)(value.lastOccurrenceSettledAtUtc)))
            return false;
        if (value.nextOccurrenceAtUtc !== undefined && !(0, reportingIds_1.isIsoUtcTimestamp)(value.nextOccurrenceAtUtc))
            return false;
        if ((value.lastOccurrenceAtUtc === undefined) !== (value.lastOccurrenceOutcome === undefined) ||
            (value.lastOccurrenceAtUtc !== undefined && !(0, reportingIds_1.isIsoUtcTimestamp)(value.lastOccurrenceAtUtc)))
            return false;
        if (value.lastOccurrenceOutcome === 'accepted')
            return (0, reportJobIdentity_1.isReportJobId)(value.lastJobId) && (0, reportJobIdentity_1.parseReportJobId)(value.lastJobId)?.reportType === value.definition.report.reportType;
        return ((value.lastOccurrenceOutcome === undefined || value.lastOccurrenceOutcome === 'failed' || value.lastOccurrenceOutcome === 'skipped') &&
            value.lastJobId === undefined);
    }
    catch {
        return false;
    }
};
exports.isReportGenerationScheduleProjection = isReportGenerationScheduleProjection;
const isScheduledReportGenerationV1 = (value) => {
    try {
        return (bounded(value) &&
            (0, reportingIds_1.isPlainRecord)(value) &&
            (0, reportingIds_1.hasExactlyKeys)(value, [
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
            (0, reportingIds_1.isReportJobCompanyId)(value.companyId) &&
            (0, reportingIds_1.isReportEntityId)(value.scheduleId) &&
            positive(value.definitionRevision) &&
            positive(value.controlGeneration) &&
            (0, reportingIds_1.isBoundedPlainText)(value.occurrenceKey, 2000) &&
            (0, reportingIds_1.isBoundedPlainText)(value.scheduleRunId, 500) &&
            (0, reportingIds_1.isIsoUtcTimestamp)(value.dueAtUtc) &&
            (0, exports.isScheduledReportJobSpecV1)(value.report) &&
            (0, reportingIds_1.isBoundedPlainText)(value.correlationId, 128) &&
            (value.notificationPolicyId === undefined || (0, reportingIds_1.isReportEntityId)(value.notificationPolicyId)) &&
            (value.coalescedOccurrenceCount === undefined || positive(value.coalescedOccurrenceCount)));
    }
    catch {
        return false;
    }
};
exports.isScheduledReportGenerationV1 = isScheduledReportGenerationV1;
//# sourceMappingURL=reportGenerationValidation.js.map