"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isResourceStrategyWeeklyScheduleSuggestion = isResourceStrategyWeeklyScheduleSuggestion;
exports.isResourceStrategyWeeklyScheduleWriteRequest = isResourceStrategyWeeklyScheduleWriteRequest;
exports.isResourceStrategyWeeklyScheduleProjection = isResourceStrategyWeeklyScheduleProjection;
exports.isResourceScheduleDryRunProjection = isResourceScheduleDryRunProjection;
exports.isScheduledResourceTransitionV1 = isScheduledResourceTransitionV1;
exports.isResourceSchedulingExecutionProjection = isResourceSchedulingExecutionProjection;
exports.isResourceSchedulingExecutionHistoryResponse = isResourceSchedulingExecutionHistoryResponse;
exports.isResourceStrategyScheduleCommand = isResourceStrategyScheduleCommand;
exports.isResourceStrategyWeeklyScheduleListResponse = isResourceStrategyWeeklyScheduleListResponse;
const resourceStrategyContracts_1 = require("./resourceStrategyContracts");
const resourceStrategyValidationShared_1 = require("./resourceStrategyValidationShared");
function isWeeklyRule(value) {
    return ((0, resourceStrategyValidationShared_1.isRecord)(value) &&
        (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['ruleId', 'transition', 'daysOfWeek', 'desiredStateAtLocal', 'parameters']) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.ruleId, 200) &&
        (value.transition === 'reduce' || value.transition === 'restore') &&
        Array.isArray(value.daysOfWeek) &&
        value.daysOfWeek.length > 0 &&
        value.daysOfWeek.length <= resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.ruleDays &&
        new Set(value.daysOfWeek).size === value.daysOfWeek.length &&
        value.daysOfWeek.every(day => Number.isInteger(day) && day >= 0 && day <= 6) &&
        (0, resourceStrategyValidationShared_1.isTime)(value.desiredStateAtLocal) &&
        (value.parameters === undefined || (0, resourceStrategyValidationShared_1.isBoundedParameters)(value.parameters)));
}
function isResourceStrategyWeeklyScheduleSuggestion(value) {
    if (!(0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) || !(0, resourceStrategyValidationShared_1.isRecord)(value) || (0, resourceStrategyValidationShared_1.containsForbiddenKey)(value))
        return false;
    if (!(0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, [
        'definitionType',
        'capability',
        'defaultParameters',
        'rules',
        'busyPolicy',
        'blackoutDatesLocal',
        'activeFromUtc',
        'activeUntilUtc',
        'acknowledgementVersion',
        'firstExecutionAcknowledgementVersion',
    ]) ||
        value.definitionType !== 'resource-strategy-weekly' ||
        !(0, resourceStrategyValidationShared_1.isCapabilityRef)(value.capability) ||
        (value.defaultParameters !== undefined && !(0, resourceStrategyValidationShared_1.isBoundedParameters)(value.defaultParameters)) ||
        !Array.isArray(value.rules) ||
        value.rules.length === 0 ||
        value.rules.length > resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.rules ||
        !value.rules.every(isWeeklyRule) ||
        new Set(value.rules.map(rule => rule.ruleId)).size !== value.rules.length ||
        !(0, resourceStrategyValidationShared_1.isOptionalBoundedString)(value.acknowledgementVersion, 200) ||
        !(0, resourceStrategyValidationShared_1.isOptionalBoundedString)(value.firstExecutionAcknowledgementVersion, 200)) {
        return false;
    }
    if (value.busyPolicy !== undefined) {
        if (!(0, resourceStrategyValidationShared_1.isRecord)(value.busyPolicy) ||
            !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(value.busyPolicy, ['mode', 'maxDelayMinutes']) ||
            !['skip', 'wait-until-deadline', 'force'].includes(String(value.busyPolicy.mode)) ||
            (value.busyPolicy.maxDelayMinutes !== undefined && !(0, resourceStrategyValidationShared_1.isNonNegativeInteger)(value.busyPolicy.maxDelayMinutes))) {
            return false;
        }
    }
    if (value.blackoutDatesLocal !== undefined &&
        (!Array.isArray(value.blackoutDatesLocal) ||
            value.blackoutDatesLocal.length > resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.metadataItems ||
            !value.blackoutDatesLocal.every(resourceStrategyValidationShared_1.isDate))) {
        return false;
    }
    if (value.activeFromUtc !== undefined && !(0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.activeFromUtc))
        return false;
    if (value.activeUntilUtc !== undefined && !(0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.activeUntilUtc))
        return false;
    if (typeof value.activeFromUtc === 'string' &&
        typeof value.activeUntilUtc === 'string' &&
        Date.parse(value.activeFromUtc) > Date.parse(value.activeUntilUtc)) {
        return false;
    }
    return true;
}
function isResourceStrategyWeeklyScheduleWriteRequest(value) {
    if (!(0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) || !(0, resourceStrategyValidationShared_1.isRecord)(value) || (0, resourceStrategyValidationShared_1.containsForbiddenKey)(value))
        return false;
    if (!(0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, [
        'definitionType',
        'providerScopeId',
        'cloudAccountId',
        'resourceId',
        'capability',
        'name',
        'timezone',
        'defaultParameters',
        'rules',
        'busyPolicy',
        'blackoutDatesLocal',
        'activeFromUtc',
        'activeUntilUtc',
        'initialMode',
        'notificationPolicyId',
        'acknowledgementVersion',
        'firstExecutionAcknowledgementVersion',
        'notes',
    ])) {
        return false;
    }
    if (value.definitionType !== 'resource-strategy-weekly' ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.providerScopeId, 300) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.cloudAccountId, 200) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.resourceId, 2000) ||
        !(0, resourceStrategyValidationShared_1.isCapabilityRef)(value.capability) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.name) ||
        !(0, resourceStrategyValidationShared_1.isIanaTimezone)(value.timezone) ||
        (value.defaultParameters !== undefined && !(0, resourceStrategyValidationShared_1.isBoundedParameters)(value.defaultParameters)) ||
        !Array.isArray(value.rules) ||
        value.rules.length === 0 ||
        value.rules.length > resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.rules ||
        !value.rules.every(isWeeklyRule) ||
        new Set(value.rules.map(rule => rule.ruleId)).size !== value.rules.length ||
        !['draft', 'dry-run', 'active'].includes(String(value.initialMode)) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.notificationPolicyId, 200) ||
        !(0, resourceStrategyValidationShared_1.isOptionalBoundedString)(value.acknowledgementVersion, 200) ||
        !(0, resourceStrategyValidationShared_1.isOptionalBoundedString)(value.firstExecutionAcknowledgementVersion, 200) ||
        !(0, resourceStrategyValidationShared_1.isOptionalBoundedString)(value.notes)) {
        return false;
    }
    if (value.busyPolicy !== undefined) {
        if (!(0, resourceStrategyValidationShared_1.isRecord)(value.busyPolicy) ||
            !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(value.busyPolicy, ['mode', 'maxDelayMinutes']) ||
            !['skip', 'wait-until-deadline', 'force'].includes(String(value.busyPolicy.mode)) ||
            (value.busyPolicy.maxDelayMinutes !== undefined && !(0, resourceStrategyValidationShared_1.isNonNegativeInteger)(value.busyPolicy.maxDelayMinutes))) {
            return false;
        }
    }
    if (value.blackoutDatesLocal !== undefined &&
        (!Array.isArray(value.blackoutDatesLocal) ||
            value.blackoutDatesLocal.length > resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.metadataItems ||
            !value.blackoutDatesLocal.every(resourceStrategyValidationShared_1.isDate))) {
        return false;
    }
    if (value.activeFromUtc !== undefined && !(0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.activeFromUtc))
        return false;
    if (value.activeUntilUtc !== undefined && !(0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.activeUntilUtc))
        return false;
    if (typeof value.activeFromUtc === 'string' &&
        typeof value.activeUntilUtc === 'string' &&
        Date.parse(value.activeFromUtc) > Date.parse(value.activeUntilUtc)) {
        return false;
    }
    return true;
}
function isResourceStrategyWeeklyScheduleProjection(value) {
    if (!(0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) ||
        !(0, resourceStrategyValidationShared_1.isRecord)(value) ||
        !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, [
            'scheduleId',
            'definitionRevision',
            'controlGeneration',
            'etag',
            'status',
            'definition',
            'permissionManifest',
            'createdAtUtc',
            'createdBy',
            'updatedAtUtc',
            'updatedBy',
            'acknowledgement',
            'firstExecutionAcknowledgement',
        ])) {
        return false;
    }
    const isAcknowledgement = (item) => (0, resourceStrategyValidationShared_1.isRecord)(item) &&
        (0, resourceStrategyValidationShared_1.hasOnlyKeys)(item, ['version', 'acknowledgedAtUtc', 'acknowledgedBy']) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(item.version, 200) &&
        (0, resourceStrategyValidationShared_1.isIsoTimestamp)(item.acknowledgedAtUtc) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(item.acknowledgedBy, 200);
    return ((0, resourceStrategyValidationShared_1.isBoundedString)(value.scheduleId, 200) &&
        (0, resourceStrategyValidationShared_1.isPositiveInteger)(value.definitionRevision) &&
        (0, resourceStrategyValidationShared_1.isPositiveInteger)(value.controlGeneration) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.etag, 500) &&
        ['draft', 'dry-run', 'active', 'paused', 'restore-only'].includes(String(value.status)) &&
        isResourceStrategyWeeklyScheduleWriteRequest(value.definition) &&
        isManifestRef(value.permissionManifest) &&
        (0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.createdAtUtc) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.createdBy, 200) &&
        (0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.updatedAtUtc) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.updatedBy, 200) &&
        (value.acknowledgement === undefined || isAcknowledgement(value.acknowledgement)) &&
        (value.firstExecutionAcknowledgement === undefined || isAcknowledgement(value.firstExecutionAcknowledgement)));
}
const RESOURCE_SCHEDULE_DRY_RUN_CHECK_NAMES = [
    'ownership',
    'readiness',
    'mutation-contention',
    'busy-policy',
    'blackout',
    'admission-budgets',
    'evidence-freshness',
    'notification-routing',
];
function isResourceScheduleDryRunCheckProjection(value) {
    if (!(0, resourceStrategyValidationShared_1.isRecord)(value) ||
        !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['name', 'status', 'reasonCodes']) ||
        !RESOURCE_SCHEDULE_DRY_RUN_CHECK_NAMES.includes(value.name) ||
        (value.status !== 'ready' && value.status !== 'blocked') ||
        !Array.isArray(value.reasonCodes) ||
        value.reasonCodes.length > resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.dryRunReasonCodes ||
        !value.reasonCodes.every(reasonCode => (0, resourceStrategyValidationShared_1.isBoundedString)(reasonCode, 200)) ||
        new Set(value.reasonCodes).size !== value.reasonCodes.length) {
        return false;
    }
    return value.status === 'ready' ? value.reasonCodes.length === 0 : value.reasonCodes.length > 0;
}
/** Validates one bounded authoritative dry-run result for a schedule revision. */
function isResourceScheduleDryRunProjection(value) {
    if (!(0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.dryRunDtoBytes) ||
        !(0, resourceStrategyValidationShared_1.isRecord)(value) ||
        (0, resourceStrategyValidationShared_1.containsForbiddenKey)(value) ||
        !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, [
            'scheduleId',
            'definitionRevision',
            'controlGeneration',
            'evaluatedAtUtc',
            'expiresAtUtc',
            'freshness',
            'windowStartUtc',
            'windowEndUtc',
            'occurrenceCount',
            'status',
            'checks',
        ]) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.scheduleId, 200) ||
        !(0, resourceStrategyValidationShared_1.isPositiveInteger)(value.definitionRevision) ||
        !(0, resourceStrategyValidationShared_1.isPositiveInteger)(value.controlGeneration) ||
        !(0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.evaluatedAtUtc) ||
        !(0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.expiresAtUtc) ||
        Date.parse(value.expiresAtUtc) <= Date.parse(value.evaluatedAtUtc) ||
        Date.parse(value.expiresAtUtc) - Date.parse(value.evaluatedAtUtc) > resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.dryRunMaxTtlMs ||
        (value.freshness !== 'fresh' && value.freshness !== 'stale') ||
        !(0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.windowStartUtc) ||
        !(0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.windowEndUtc) ||
        Date.parse(value.windowEndUtc) <= Date.parse(value.windowStartUtc) ||
        !(0, resourceStrategyValidationShared_1.isNonNegativeInteger)(value.occurrenceCount) ||
        (value.status !== 'ready' && value.status !== 'blocked') ||
        !Array.isArray(value.checks) ||
        value.checks.length !== resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.dryRunChecks ||
        !value.checks.every(isResourceScheduleDryRunCheckProjection)) {
        return false;
    }
    const checkNames = value.checks.map(check => check.name);
    if (new Set(checkNames).size !== RESOURCE_SCHEDULE_DRY_RUN_CHECK_NAMES.length ||
        !RESOURCE_SCHEDULE_DRY_RUN_CHECK_NAMES.every(name => checkNames.includes(name))) {
        return false;
    }
    return value.status === (value.checks.every(check => check.status === 'ready') ? 'ready' : 'blocked');
}
function isManifestRef(value) {
    return ((0, resourceStrategyValidationShared_1.isRecord)(value) &&
        (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['version', 'contentHash']) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.version, 200) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.contentHash, 200));
}
function isScheduledResourceTransitionV1(value) {
    return ((0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) &&
        (0, resourceStrategyValidationShared_1.isRecord)(value) &&
        !(0, resourceStrategyValidationShared_1.containsForbiddenKey)(value.parameters) &&
        (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, [
            'schemaVersion',
            'companyId',
            'providerScopeId',
            'cloudAccountId',
            'resourceId',
            'scheduleId',
            'definitionRevision',
            'controlGeneration',
            'ruleId',
            'occurrenceKey',
            'scheduleRunId',
            'desiredStateAtUtc',
            'dispatchNotBeforeUtc',
            'reduceDeadlineUtc',
            'capability',
            'transition',
            'parameters',
            'permissionManifest',
            'correlationId',
        ]) &&
        value.schemaVersion === 1 &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.companyId, 200) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.providerScopeId, 300) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.cloudAccountId, 200) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.resourceId, 2000) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.scheduleId, 200) &&
        (0, resourceStrategyValidationShared_1.isPositiveInteger)(value.definitionRevision) &&
        (0, resourceStrategyValidationShared_1.isPositiveInteger)(value.controlGeneration) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.ruleId, 200) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.occurrenceKey, 500) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.scheduleRunId, 200) &&
        (0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.desiredStateAtUtc) &&
        (0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.dispatchNotBeforeUtc) &&
        (value.reduceDeadlineUtc === undefined || (0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.reduceDeadlineUtc)) &&
        (0, resourceStrategyValidationShared_1.isCapabilityRef)(value.capability) &&
        (value.transition === 'reduce' || value.transition === 'restore') &&
        (0, resourceStrategyValidationShared_1.isBoundedParameters)(value.parameters) &&
        isManifestRef(value.permissionManifest) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.correlationId, 200));
}
function isResourceSchedulingExecutionProjection(value) {
    if (!(0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) ||
        !(0, resourceStrategyValidationShared_1.isRecord)(value) ||
        !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, [
            'companyId',
            'resourceId',
            'scheduleId',
            'definitionRevision',
            'controlGeneration',
            'lifecycleState',
            'activeRecoveryCycleId',
            'restoreOwed',
            'lastRun',
            'allowedCommands',
            'updatedAtUtc',
        ])) {
        return false;
    }
    if (value.lastRun !== undefined) {
        const lastRun = value.lastRun;
        if (!(0, resourceStrategyValidationShared_1.isRecord)(lastRun) ||
            !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(lastRun, ['scheduleRunId', 'transition', 'phase', 'outcome', 'desiredStateAtUtc', 'updatedAtUtc', 'reasonCode']) ||
            !(0, resourceStrategyValidationShared_1.isBoundedString)(lastRun.scheduleRunId, 200) ||
            !['reduce', 'restore'].includes(String(lastRun.transition)) ||
            (lastRun.phase !== undefined &&
                !['queued', 'leased', 'preflight', 'capturing-baseline', 'executing', 'polling', 'verifying'].includes(String(lastRun.phase))) ||
            (lastRun.outcome !== undefined &&
                !['succeeded', 'no-op', 'skipped', 'blocked', 'failed', 'superseded', 'expired'].includes(String(lastRun.outcome))) ||
            !(0, resourceStrategyValidationShared_1.isIsoTimestamp)(lastRun.desiredStateAtUtc) ||
            !(0, resourceStrategyValidationShared_1.isIsoTimestamp)(lastRun.updatedAtUtc) ||
            !(0, resourceStrategyValidationShared_1.isOptionalBoundedString)(lastRun.reasonCode, 200)) {
            return false;
        }
        if ((lastRun.phase === undefined) === (lastRun.outcome === undefined))
            return false;
    }
    return ((0, resourceStrategyValidationShared_1.isBoundedString)(value.companyId, 200) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.resourceId, 2000) &&
        (0, resourceStrategyValidationShared_1.isOptionalBoundedString)(value.scheduleId, 200) &&
        (value.definitionRevision === undefined || (0, resourceStrategyValidationShared_1.isPositiveInteger)(value.definitionRevision)) &&
        (0, resourceStrategyValidationShared_1.isPositiveInteger)(value.controlGeneration) &&
        ['unknown', 'normal', 'reducing', 'reduced', 'restoring', 'reduce-failed', 'restore-failed', 'drifted', 'target-missing', 'stranded'].includes(String(value.lifecycleState)) &&
        (0, resourceStrategyValidationShared_1.isOptionalBoundedString)(value.activeRecoveryCycleId, 200) &&
        typeof value.restoreOwed === 'boolean' &&
        Array.isArray(value.allowedCommands) &&
        value.allowedCommands.length <= 4 &&
        new Set(value.allowedCommands).size === value.allowedCommands.length &&
        value.allowedCommands.every(command => ['pause', 'resume', 'restore-now', 'leave-current-state'].includes(String(command))) &&
        (0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.updatedAtUtc));
}
function isResourceSchedulingExecutionHistoryItem(value) {
    return ((0, resourceStrategyValidationShared_1.isRecord)(value) &&
        (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, [
            'scheduleRunId',
            'resourceId',
            'transition',
            'desiredStateAtUtc',
            'claimedAtUtc',
            'completedAtUtc',
            'outcome',
            'reasonCode',
            'attemptCount',
        ]) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.scheduleRunId, 200) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.resourceId, 2000) &&
        (value.transition === 'reduce' || value.transition === 'restore') &&
        (0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.desiredStateAtUtc) &&
        (0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.claimedAtUtc) &&
        (value.completedAtUtc === undefined || (0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.completedAtUtc)) &&
        (value.outcome === undefined ||
            ['succeeded', 'no-op', 'skipped', 'blocked', 'failed', 'superseded', 'expired'].includes(String(value.outcome))) &&
        (0, resourceStrategyValidationShared_1.isOptionalBoundedString)(value.reasonCode, 200) &&
        (0, resourceStrategyValidationShared_1.isPositiveInteger)(value.attemptCount) &&
        ((value.completedAtUtc === undefined && value.outcome === undefined) || (value.completedAtUtc !== undefined && value.outcome !== undefined)));
}
function isResourceSchedulingExecutionHistoryResponse(value) {
    return ((0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) &&
        (0, resourceStrategyValidationShared_1.isRecord)(value) &&
        (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['execution', 'runs']) &&
        isResourceSchedulingExecutionProjection(value.execution) &&
        Array.isArray(value.runs) &&
        value.runs.length <= 100 &&
        value.runs.every(isResourceSchedulingExecutionHistoryItem));
}
function isResourceStrategyScheduleCommand(value) {
    if (!(0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) ||
        !(0, resourceStrategyValidationShared_1.isRecord)(value) ||
        !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['command', 'idempotencyKey', 'acknowledgement']) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.idempotencyKey, 200)) {
        return false;
    }
    if (value.command === 'leave-current-state')
        return (0, resourceStrategyValidationShared_1.isBoundedString)(value.acknowledgement, 2000);
    return ['pause', 'resume', 'rerun-dry-run', 'restore-now'].includes(String(value.command)) && value.acknowledgement === undefined;
}
function isResourceStrategyWeeklyScheduleListResponse(value) {
    return ((0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) &&
        (0, resourceStrategyValidationShared_1.isRecord)(value) &&
        (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['results', 'continuation']) &&
        Array.isArray(value.results) &&
        value.results.length <= resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.listResults &&
        value.results.every(isResourceStrategyWeeklyScheduleProjection) &&
        (value.continuation === undefined ||
            ((0, resourceStrategyValidationShared_1.isRecord)(value.continuation) && (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value.continuation, ['cursor']) && (0, resourceStrategyValidationShared_1.isBoundedString)(value.continuation.cursor, 2000))));
}
//# sourceMappingURL=resourceStrategyScheduleValidation.js.map