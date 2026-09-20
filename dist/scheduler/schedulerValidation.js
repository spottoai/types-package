"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRecommendationActionScheduleWriteRequest = isRecommendationActionScheduleWriteRequest;
exports.isScheduleWriteRequest = isScheduleWriteRequest;
exports.isScheduleMutationRequest = isScheduleMutationRequest;
exports.isRecommendationActionScheduleCommand = isRecommendationActionScheduleCommand;
exports.isScheduleCommand = isScheduleCommand;
exports.isRecommendationActionScheduleProjection = isRecommendationActionScheduleProjection;
exports.isScheduleProjection = isScheduleProjection;
exports.isScheduleListResponse = isScheduleListResponse;
exports.isScheduledRecommendationActionV1 = isScheduledRecommendationActionV1;
exports.isScheduledOccurrenceV1 = isScheduledOccurrenceV1;
exports.isSchedulerControlRequestMessageV1 = isSchedulerControlRequestMessageV1;
exports.isSchedulerOperationAcceptedResponse = isSchedulerOperationAcceptedResponse;
exports.isSchedulerOperationProjection = isSchedulerOperationProjection;
const resourceStrategyContracts_1 = require("./resourceStrategyContracts");
const resourceStrategyScheduleValidation_1 = require("./resourceStrategyScheduleValidation");
const resourceStrategyPermissionValidation_1 = require("./resourceStrategyPermissionValidation");
const resourceStrategyCapabilityValidation_1 = require("./resourceStrategyCapabilityValidation");
const resourceStrategyFinancialValidation_1 = require("./resourceStrategyFinancialValidation");
const resourceStrategyValidationShared_1 = require("./resourceStrategyValidationShared");
const resourceStrategyScheduleValidation_2 = require("./resourceStrategyScheduleValidation");
const LOCAL_DATE_TIME = /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d$/u;
function isLocalDateTime(value) {
    if (typeof value !== 'string' || !LOCAL_DATE_TIME.test(value))
        return false;
    const parsed = new Date(`${value}:00.000Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 16) === value;
}
function isFiveFieldCronExpression(value) {
    return (0, resourceStrategyValidationShared_1.isBoundedString)(value, 500) && value.trim() === value && value.split(/\s+/u).length === 5;
}
function isRecommendationActionScheduleTarget(value) {
    if (!(0, resourceStrategyValidationShared_1.isRecord)(value))
        return false;
    if (value.selectorType === 'single-resource') {
        return (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['selectorType', 'resourceId']) && (0, resourceStrategyValidationShared_1.isBoundedString)(value.resourceId, 2000);
    }
    if (value.selectorType === 'selected-resources') {
        return ((0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['selectorType', 'resourceIds']) &&
            Array.isArray(value.resourceIds) &&
            value.resourceIds.length > 0 &&
            value.resourceIds.length <= 100 &&
            new Set(value.resourceIds).size === value.resourceIds.length &&
            value.resourceIds.every(resourceId => (0, resourceStrategyValidationShared_1.isBoundedString)(resourceId, 2000)));
    }
    return value.selectorType === 'provider-scope' && (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['selectorType']);
}
function isRecommendationActionScheduleWriteRequest(value) {
    try {
        if (!(0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) || !(0, resourceStrategyValidationShared_1.isRecord)(value))
            return false;
        if (!(0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, [
            'definitionType',
            'name',
            'timezone',
            'trigger',
            'providerScopeId',
            'cloudAccountId',
            'recommendationId',
            'operation',
            'target',
            'initialMode',
            'notes',
            'configuration',
        ]) ||
            value.definitionType !== 'recommendation-action' ||
            !(0, resourceStrategyValidationShared_1.isBoundedString)(value.name, 500) ||
            !(0, resourceStrategyValidationShared_1.isIanaTimezone)(value.timezone) ||
            !(0, resourceStrategyValidationShared_1.isBoundedString)(value.providerScopeId, 500) ||
            !(0, resourceStrategyValidationShared_1.isOptionalBoundedString)(value.cloudAccountId, 500) ||
            !(0, resourceStrategyValidationShared_1.isBoundedString)(value.recommendationId, 500) ||
            value.operation !== 'implement' ||
            !isRecommendationActionScheduleTarget(value.target) ||
            (value.initialMode !== 'active' && value.initialMode !== 'paused') ||
            !(0, resourceStrategyValidationShared_1.isOptionalBoundedString)(value.notes, 4000) ||
            (value.configuration !== undefined && !(0, resourceStrategyValidationShared_1.isBoundedParameters)(value.configuration)) ||
            !(0, resourceStrategyValidationShared_1.isRecord)(value.trigger)) {
            return false;
        }
        if (value.trigger.triggerType === 'once') {
            return (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value.trigger, ['triggerType', 'localDateTime']) && isLocalDateTime(value.trigger.localDateTime);
        }
        return (value.trigger.triggerType === 'recurring' &&
            (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value.trigger, ['triggerType', 'cronExpression']) &&
            isFiveFieldCronExpression(value.trigger.cronExpression));
    }
    catch {
        return false;
    }
}
function isScheduleWriteRequest(value) {
    return (0, resourceStrategyScheduleValidation_1.isResourceStrategyWeeklyScheduleWriteRequest)(value) || isRecommendationActionScheduleWriteRequest(value);
}
function isScheduleMutationRequest(value) {
    return ((0, resourceStrategyValidationShared_1.isRecord)(value) &&
        (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['definition', 'permissionConsent']) &&
        isScheduleWriteRequest(value.definition) &&
        (value.permissionConsent === undefined || (0, resourceStrategyPermissionValidation_1.isResourceSchedulePermissionManifestConsent)(value.permissionConsent)));
}
function isRecommendationActionScheduleCommand(value) {
    return ((0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) &&
        (0, resourceStrategyValidationShared_1.isRecord)(value) &&
        (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['command', 'idempotencyKey']) &&
        (value.command === 'pause' || value.command === 'resume') &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.idempotencyKey, 200));
}
function isScheduleCommand(value) {
    return isRecommendationActionScheduleCommand(value) || (0, resourceStrategyScheduleValidation_1.isResourceStrategyScheduleCommand)(value);
}
function isRecommendationActionScheduleProjection(value) {
    try {
        if (!(0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) || !(0, resourceStrategyValidationShared_1.isRecord)(value))
            return false;
        return ((0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, [
            'scheduleId',
            'definitionRevision',
            'controlGeneration',
            'etag',
            'status',
            'definition',
            'nextOccurrenceAtUtc',
            'lastOccurrenceAtUtc',
            'lastOccurrenceOutcome',
            'createdAtUtc',
            'createdBy',
            'updatedAtUtc',
            'updatedBy',
        ]) &&
            (0, resourceStrategyValidationShared_1.isBoundedString)(value.scheduleId, 500) &&
            (0, resourceStrategyValidationShared_1.isPositiveInteger)(value.definitionRevision) &&
            (0, resourceStrategyValidationShared_1.isPositiveInteger)(value.controlGeneration) &&
            (0, resourceStrategyValidationShared_1.isBoundedString)(value.etag, 2000) &&
            ['active', 'paused', 'completed'].includes(String(value.status)) &&
            isRecommendationActionScheduleWriteRequest(value.definition) &&
            (value.nextOccurrenceAtUtc === undefined || (0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.nextOccurrenceAtUtc)) &&
            (value.lastOccurrenceAtUtc === undefined || (0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.lastOccurrenceAtUtc)) &&
            (value.lastOccurrenceOutcome === undefined || ['succeeded', 'failed', 'skipped'].includes(String(value.lastOccurrenceOutcome))) &&
            (value.lastOccurrenceAtUtc === undefined) === (value.lastOccurrenceOutcome === undefined) &&
            (0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.createdAtUtc) &&
            (0, resourceStrategyValidationShared_1.isBoundedString)(value.createdBy, 500) &&
            (0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.updatedAtUtc) &&
            (0, resourceStrategyValidationShared_1.isBoundedString)(value.updatedBy, 500));
    }
    catch {
        return false;
    }
}
function isScheduleProjection(value) {
    return (0, resourceStrategyScheduleValidation_1.isResourceStrategyWeeklyScheduleProjection)(value) || isRecommendationActionScheduleProjection(value);
}
function isScheduleListResponse(value) {
    return ((0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) &&
        (0, resourceStrategyValidationShared_1.isRecord)(value) &&
        (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['results', 'continuation']) &&
        Array.isArray(value.results) &&
        value.results.length <= resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.listResults &&
        value.results.every(isScheduleProjection) &&
        (value.continuation === undefined ||
            ((0, resourceStrategyValidationShared_1.isRecord)(value.continuation) && (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value.continuation, ['cursor']) && (0, resourceStrategyValidationShared_1.isBoundedString)(value.continuation.cursor, 2000))));
}
function isScheduledRecommendationActionV1(value) {
    try {
        return ((0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) &&
            (0, resourceStrategyValidationShared_1.isRecord)(value) &&
            (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, [
                'schemaVersion',
                'definitionType',
                'companyId',
                'providerScopeId',
                'cloudAccountId',
                'scheduleId',
                'definitionRevision',
                'controlGeneration',
                'occurrenceKey',
                'scheduleRunId',
                'dueAtUtc',
                'recommendationId',
                'operation',
                'target',
                'configuration',
                'correlationId',
            ]) &&
            value.schemaVersion === 1 &&
            value.definitionType === 'recommendation-action' &&
            (0, resourceStrategyValidationShared_1.isBoundedString)(value.companyId, 500) &&
            (0, resourceStrategyValidationShared_1.isBoundedString)(value.providerScopeId, 500) &&
            (0, resourceStrategyValidationShared_1.isOptionalBoundedString)(value.cloudAccountId, 500) &&
            (0, resourceStrategyValidationShared_1.isBoundedString)(value.scheduleId, 500) &&
            (0, resourceStrategyValidationShared_1.isPositiveInteger)(value.definitionRevision) &&
            (0, resourceStrategyValidationShared_1.isPositiveInteger)(value.controlGeneration) &&
            (0, resourceStrategyValidationShared_1.isBoundedString)(value.occurrenceKey, 2000) &&
            (0, resourceStrategyValidationShared_1.isBoundedString)(value.scheduleRunId, 500) &&
            (0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.dueAtUtc) &&
            (0, resourceStrategyValidationShared_1.isBoundedString)(value.recommendationId, 500) &&
            value.operation === 'implement' &&
            isRecommendationActionScheduleTarget(value.target) &&
            (0, resourceStrategyValidationShared_1.isBoundedParameters)(value.configuration) &&
            (0, resourceStrategyValidationShared_1.isBoundedString)(value.correlationId, 500));
    }
    catch {
        return false;
    }
}
function isScheduledOccurrenceV1(value) {
    return (0, resourceStrategyScheduleValidation_2.isScheduledResourceTransitionV1)(value) || isScheduledRecommendationActionV1(value);
}
const schedulerOperationTypes = new Set([
    'refresh-capabilities',
    'create-schedule',
    'update-schedule',
    'delete-schedule',
    'apply-schedule-command',
    'refresh-readiness',
    'preview-resource-schedule',
]);
function isEmptyOrBoundedString(value, maxLength) {
    return typeof value === 'string' && value.length <= maxLength;
}
function isSchedulerControlCommandV1(value) {
    if (!(0, resourceStrategyValidationShared_1.isRecord)(value) || typeof value.commandType !== 'string' || !schedulerOperationTypes.has(value.commandType)) {
        return false;
    }
    switch (value.commandType) {
        case 'refresh-capabilities':
            return (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['commandType']);
        case 'create-schedule':
            return ((0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['commandType', 'definition', 'permissionConsent', 'idempotencyKey']) &&
                isScheduleWriteRequest(value.definition) &&
                (value.permissionConsent === undefined || (0, resourceStrategyPermissionValidation_1.isResourceSchedulePermissionManifestConsent)(value.permissionConsent)) &&
                (0, resourceStrategyValidationShared_1.isBoundedString)(value.idempotencyKey, 200));
        case 'update-schedule':
            return ((0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['commandType', 'scheduleId', 'definition', 'permissionConsent', 'expectedEtag', 'idempotencyKey']) &&
                (0, resourceStrategyValidationShared_1.isBoundedString)(value.scheduleId, 500) &&
                isScheduleWriteRequest(value.definition) &&
                (value.permissionConsent === undefined || (0, resourceStrategyPermissionValidation_1.isResourceSchedulePermissionManifestConsent)(value.permissionConsent)) &&
                (0, resourceStrategyValidationShared_1.isBoundedString)(value.expectedEtag, 2000) &&
                (0, resourceStrategyValidationShared_1.isBoundedString)(value.idempotencyKey, 200));
        case 'delete-schedule':
            return ((0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['commandType', 'scheduleId', 'expectedEtag', 'idempotencyKey']) &&
                (0, resourceStrategyValidationShared_1.isBoundedString)(value.scheduleId, 500) &&
                (0, resourceStrategyValidationShared_1.isBoundedString)(value.expectedEtag, 2000) &&
                (0, resourceStrategyValidationShared_1.isBoundedString)(value.idempotencyKey, 200));
        case 'apply-schedule-command':
            return ((0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['commandType', 'scheduleId', 'expectedEtag', 'scheduleCommand']) &&
                (0, resourceStrategyValidationShared_1.isBoundedString)(value.scheduleId, 500) &&
                (0, resourceStrategyValidationShared_1.isBoundedString)(value.expectedEtag, 2000) &&
                isScheduleCommand(value.scheduleCommand));
        case 'refresh-readiness':
            return ((0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['commandType', 'cloudAccountId', 'providerScopeId', 'resourceId', 'capability']) &&
                (0, resourceStrategyValidationShared_1.isBoundedString)(value.cloudAccountId, 500) &&
                (0, resourceStrategyValidationShared_1.isBoundedString)(value.providerScopeId, 500) &&
                (0, resourceStrategyValidationShared_1.isBoundedString)(value.resourceId, 2000) &&
                (0, resourceStrategyValidationShared_1.isRecord)(value.capability) &&
                (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value.capability, ['capabilityId', 'capabilityVersion']) &&
                (0, resourceStrategyValidationShared_1.isBoundedString)(value.capability.capabilityId, 200) &&
                (0, resourceStrategyValidationShared_1.isPositiveInteger)(value.capability.capabilityVersion));
        case 'preview-resource-schedule':
            return (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['commandType', 'request']) && (0, resourceStrategyFinancialValidation_1.isResourceSchedulePreviewRequest)(value.request);
    }
    return false;
}
function isSchedulerControlRequestMessageV1(value) {
    try {
        return ((0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) &&
            (0, resourceStrategyValidationShared_1.isRecord)(value) &&
            (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, [
                'schemaVersion',
                'entity',
                'action',
                'companyId',
                'cloudAccountId',
                'tenantId',
                'clientId',
                'operationId',
                'requestedAtUtc',
                'actorId',
                'correlationId',
                'command',
            ]) &&
            value.schemaVersion === 1 &&
            value.entity === 'scheduler' &&
            value.action === 'control' &&
            (0, resourceStrategyValidationShared_1.isBoundedString)(value.companyId, 500) &&
            isEmptyOrBoundedString(value.cloudAccountId, 500) &&
            isEmptyOrBoundedString(value.tenantId, 500) &&
            isEmptyOrBoundedString(value.clientId, 500) &&
            (0, resourceStrategyValidationShared_1.isBoundedString)(value.operationId, 200) &&
            (0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.requestedAtUtc) &&
            (0, resourceStrategyValidationShared_1.isBoundedString)(value.actorId, 500) &&
            (0, resourceStrategyValidationShared_1.isBoundedString)(value.correlationId, 500) &&
            isSchedulerControlCommandV1(value.command));
    }
    catch {
        return false;
    }
}
function isSchedulerOperationAcceptedResponse(value) {
    return ((0, resourceStrategyValidationShared_1.isRecord)(value) &&
        (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['schemaVersion', 'operationId', 'status', 'submittedAtUtc']) &&
        value.schemaVersion === 1 &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.operationId, 200) &&
        value.status === 'accepted' &&
        (0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.submittedAtUtc));
}
function isSchedulerOperationResult(value, operationType) {
    if (!(0, resourceStrategyValidationShared_1.isRecord)(value) || typeof value.resultType !== 'string')
        return false;
    if (value.resultType === 'capabilities') {
        return (operationType === 'refresh-capabilities' &&
            (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['resultType', 'capabilities']) &&
            Array.isArray(value.capabilities) &&
            value.capabilities.every(resourceStrategyCapabilityValidation_1.isResourceSchedulingCapabilityProjection));
    }
    if (value.resultType === 'schedule') {
        return (['create-schedule', 'update-schedule', 'apply-schedule-command'].includes(operationType) &&
            (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['resultType', 'schedule']) &&
            isScheduleProjection(value.schedule));
    }
    if (value.resultType === 'deleted') {
        return operationType === 'delete-schedule' && (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['resultType']);
    }
    if (value.resultType === 'readiness') {
        return (operationType === 'refresh-readiness' &&
            (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['resultType', 'readiness']) &&
            (0, resourceStrategyCapabilityValidation_1.isResourceSchedulingReadinessProjection)(value.readiness));
    }
    return (value.resultType === 'preview' &&
        operationType === 'preview-resource-schedule' &&
        (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['resultType', 'preview']) &&
        (0, resourceStrategyFinancialValidation_1.isResourceSchedulePreviewResponse)(value.preview));
}
function isSchedulerOperationProjection(value) {
    try {
        if (!(0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) ||
            !(0, resourceStrategyValidationShared_1.isRecord)(value) ||
            value.schemaVersion !== 1 ||
            !(0, resourceStrategyValidationShared_1.isBoundedString)(value.companyId, 500) ||
            !(0, resourceStrategyValidationShared_1.isBoundedString)(value.operationId, 200) ||
            typeof value.operationType !== 'string' ||
            !schedulerOperationTypes.has(value.operationType) ||
            !(0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.submittedAtUtc) ||
            !(0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.updatedAtUtc)) {
            return false;
        }
        const operationType = value.operationType;
        if (value.status === 'pending') {
            return (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['schemaVersion', 'companyId', 'operationId', 'operationType', 'status', 'submittedAtUtc', 'updatedAtUtc']);
        }
        if (value.status === 'succeeded') {
            return ((0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, [
                'schemaVersion',
                'companyId',
                'operationId',
                'operationType',
                'status',
                'submittedAtUtc',
                'updatedAtUtc',
                'completedAtUtc',
                'result',
            ]) &&
                (0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.completedAtUtc) &&
                isSchedulerOperationResult(value.result, operationType));
        }
        return (value.status === 'failed' &&
            (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, [
                'schemaVersion',
                'companyId',
                'operationId',
                'operationType',
                'status',
                'submittedAtUtc',
                'updatedAtUtc',
                'completedAtUtc',
                'error',
            ]) &&
            (0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.completedAtUtc) &&
            (0, resourceStrategyValidationShared_1.isRecord)(value.error) &&
            (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value.error, ['code', 'message', 'retryable']) &&
            (0, resourceStrategyValidationShared_1.isBoundedString)(value.error.code, 100) &&
            (0, resourceStrategyValidationShared_1.isBoundedString)(value.error.message, 500) &&
            typeof value.error.retryable === 'boolean');
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=schedulerValidation.js.map