import {
  RESOURCE_STRATEGY_CONTRACT_LIMITS,
  type ResourceSchedulePermissionManifestRef,
  type ResourceSchedulingExecutionHistoryItem,
  type ResourceSchedulingExecutionHistoryResponse,
  type ResourceSchedulingExecutionProjection,
  type ResourceStrategyScheduleCommand,
  type ResourceStrategyWeeklyRule,
  type ResourceStrategyWeeklyScheduleSuggestion,
  type ResourceStrategyWeeklyScheduleListResponse,
  type ResourceStrategyWeeklyScheduleProjection,
  type ResourceStrategyWeeklyScheduleWriteRequest,
  type ScheduledResourceTransitionV1,
} from './resourceStrategyContracts';
import {
  containsForbiddenKey,
  hasOnlyKeys,
  isBoundedParameters,
  isBoundedString,
  isCapabilityRef,
  isDate,
  isIanaTimezone,
  isIsoTimestamp,
  isNonNegativeInteger,
  isOptionalBoundedString,
  isPositiveInteger,
  isRecord,
  isTime,
  isWithinJsonByteLimit,
} from './resourceStrategyValidationShared';

function isWeeklyRule(value: unknown): value is ResourceStrategyWeeklyRule {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ['ruleId', 'transition', 'daysOfWeek', 'desiredStateAtLocal', 'parameters']) &&
    isBoundedString(value.ruleId, 200) &&
    (value.transition === 'reduce' || value.transition === 'restore') &&
    Array.isArray(value.daysOfWeek) &&
    value.daysOfWeek.length > 0 &&
    value.daysOfWeek.length <= RESOURCE_STRATEGY_CONTRACT_LIMITS.ruleDays &&
    new Set(value.daysOfWeek).size === value.daysOfWeek.length &&
    value.daysOfWeek.every(day => Number.isInteger(day) && day >= 0 && day <= 6) &&
    isTime(value.desiredStateAtLocal) &&
    (value.parameters === undefined || isBoundedParameters(value.parameters))
  );
}
export function isResourceStrategyWeeklyScheduleSuggestion(value: unknown): value is ResourceStrategyWeeklyScheduleSuggestion {
  if (!isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) || !isRecord(value) || containsForbiddenKey(value))
    return false;
  if (
    !hasOnlyKeys(value, [
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
    !isCapabilityRef(value.capability) ||
    (value.defaultParameters !== undefined && !isBoundedParameters(value.defaultParameters)) ||
    !Array.isArray(value.rules) ||
    value.rules.length === 0 ||
    value.rules.length > RESOURCE_STRATEGY_CONTRACT_LIMITS.rules ||
    !value.rules.every(isWeeklyRule) ||
    new Set(value.rules.map(rule => rule.ruleId)).size !== value.rules.length ||
    !isOptionalBoundedString(value.acknowledgementVersion, 200) ||
    !isOptionalBoundedString(value.firstExecutionAcknowledgementVersion, 200)
  ) {
    return false;
  }
  if (value.busyPolicy !== undefined) {
    if (
      !isRecord(value.busyPolicy) ||
      !hasOnlyKeys(value.busyPolicy, ['mode', 'maxDelayMinutes']) ||
      !['skip', 'wait-until-deadline', 'force'].includes(String(value.busyPolicy.mode)) ||
      (value.busyPolicy.maxDelayMinutes !== undefined && !isNonNegativeInteger(value.busyPolicy.maxDelayMinutes))
    ) {
      return false;
    }
  }
  if (
    value.blackoutDatesLocal !== undefined &&
    (!Array.isArray(value.blackoutDatesLocal) ||
      value.blackoutDatesLocal.length > RESOURCE_STRATEGY_CONTRACT_LIMITS.metadataItems ||
      !value.blackoutDatesLocal.every(isDate))
  ) {
    return false;
  }
  if (value.activeFromUtc !== undefined && !isIsoTimestamp(value.activeFromUtc)) return false;
  if (value.activeUntilUtc !== undefined && !isIsoTimestamp(value.activeUntilUtc)) return false;
  if (
    typeof value.activeFromUtc === 'string' &&
    typeof value.activeUntilUtc === 'string' &&
    Date.parse(value.activeFromUtc) > Date.parse(value.activeUntilUtc)
  ) {
    return false;
  }
  return true;
}
export function isResourceStrategyWeeklyScheduleWriteRequest(value: unknown): value is ResourceStrategyWeeklyScheduleWriteRequest {
  if (!isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) || !isRecord(value) || containsForbiddenKey(value))
    return false;
  if (
    !hasOnlyKeys(value, [
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
    ])
  ) {
    return false;
  }
  if (
    value.definitionType !== 'resource-strategy-weekly' ||
    !isBoundedString(value.providerScopeId, 300) ||
    !isBoundedString(value.cloudAccountId, 200) ||
    !isBoundedString(value.resourceId, 2000) ||
    !isCapabilityRef(value.capability) ||
    !isBoundedString(value.name) ||
    !isIanaTimezone(value.timezone) ||
    (value.defaultParameters !== undefined && !isBoundedParameters(value.defaultParameters)) ||
    !Array.isArray(value.rules) ||
    value.rules.length === 0 ||
    value.rules.length > RESOURCE_STRATEGY_CONTRACT_LIMITS.rules ||
    !value.rules.every(isWeeklyRule) ||
    new Set(value.rules.map(rule => rule.ruleId)).size !== value.rules.length ||
    !['draft', 'dry-run', 'active'].includes(String(value.initialMode)) ||
    !isBoundedString(value.notificationPolicyId, 200) ||
    !isOptionalBoundedString(value.acknowledgementVersion, 200) ||
    !isOptionalBoundedString(value.firstExecutionAcknowledgementVersion, 200) ||
    !isOptionalBoundedString(value.notes)
  ) {
    return false;
  }
  if (value.busyPolicy !== undefined) {
    if (
      !isRecord(value.busyPolicy) ||
      !hasOnlyKeys(value.busyPolicy, ['mode', 'maxDelayMinutes']) ||
      !['skip', 'wait-until-deadline', 'force'].includes(String(value.busyPolicy.mode)) ||
      (value.busyPolicy.maxDelayMinutes !== undefined && !isNonNegativeInteger(value.busyPolicy.maxDelayMinutes))
    ) {
      return false;
    }
  }
  if (
    value.blackoutDatesLocal !== undefined &&
    (!Array.isArray(value.blackoutDatesLocal) ||
      value.blackoutDatesLocal.length > RESOURCE_STRATEGY_CONTRACT_LIMITS.metadataItems ||
      !value.blackoutDatesLocal.every(isDate))
  ) {
    return false;
  }
  if (value.activeFromUtc !== undefined && !isIsoTimestamp(value.activeFromUtc)) return false;
  if (value.activeUntilUtc !== undefined && !isIsoTimestamp(value.activeUntilUtc)) return false;
  if (
    typeof value.activeFromUtc === 'string' &&
    typeof value.activeUntilUtc === 'string' &&
    Date.parse(value.activeFromUtc) > Date.parse(value.activeUntilUtc)
  ) {
    return false;
  }
  return true;
}
export function isResourceStrategyWeeklyScheduleProjection(value: unknown): value is ResourceStrategyWeeklyScheduleProjection {
  if (
    !isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) ||
    !isRecord(value) ||
    !hasOnlyKeys(value, [
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
    ])
  ) {
    return false;
  }
  const isAcknowledgement = (item: unknown): boolean =>
    isRecord(item) &&
    hasOnlyKeys(item, ['version', 'acknowledgedAtUtc', 'acknowledgedBy']) &&
    isBoundedString(item.version, 200) &&
    isIsoTimestamp(item.acknowledgedAtUtc) &&
    isBoundedString(item.acknowledgedBy, 200);
  return (
    isBoundedString(value.scheduleId, 200) &&
    isPositiveInteger(value.definitionRevision) &&
    isPositiveInteger(value.controlGeneration) &&
    isBoundedString(value.etag, 500) &&
    ['draft', 'dry-run', 'active', 'paused', 'restore-only'].includes(String(value.status)) &&
    isResourceStrategyWeeklyScheduleWriteRequest(value.definition) &&
    isManifestRef(value.permissionManifest) &&
    isIsoTimestamp(value.createdAtUtc) &&
    isBoundedString(value.createdBy, 200) &&
    isIsoTimestamp(value.updatedAtUtc) &&
    isBoundedString(value.updatedBy, 200) &&
    (value.acknowledgement === undefined || isAcknowledgement(value.acknowledgement)) &&
    (value.firstExecutionAcknowledgement === undefined || isAcknowledgement(value.firstExecutionAcknowledgement))
  );
}
function isManifestRef(value: unknown): value is ResourceSchedulePermissionManifestRef {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ['version', 'contentHash']) &&
    isBoundedString(value.version, 200) &&
    isBoundedString(value.contentHash, 200)
  );
}
export function isScheduledResourceTransitionV1(value: unknown): value is ScheduledResourceTransitionV1 {
  return (
    isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) &&
    isRecord(value) &&
    !containsForbiddenKey(value.parameters) &&
    hasOnlyKeys(value, [
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
    isBoundedString(value.companyId, 200) &&
    isBoundedString(value.providerScopeId, 300) &&
    isBoundedString(value.cloudAccountId, 200) &&
    isBoundedString(value.resourceId, 2000) &&
    isBoundedString(value.scheduleId, 200) &&
    isPositiveInteger(value.definitionRevision) &&
    isPositiveInteger(value.controlGeneration) &&
    isBoundedString(value.ruleId, 200) &&
    isBoundedString(value.occurrenceKey, 500) &&
    isBoundedString(value.scheduleRunId, 200) &&
    isIsoTimestamp(value.desiredStateAtUtc) &&
    isIsoTimestamp(value.dispatchNotBeforeUtc) &&
    (value.reduceDeadlineUtc === undefined || isIsoTimestamp(value.reduceDeadlineUtc)) &&
    isCapabilityRef(value.capability) &&
    (value.transition === 'reduce' || value.transition === 'restore') &&
    isBoundedParameters(value.parameters) &&
    isManifestRef(value.permissionManifest) &&
    isBoundedString(value.correlationId, 200)
  );
}
export function isResourceSchedulingExecutionProjection(value: unknown): value is ResourceSchedulingExecutionProjection {
  if (
    !isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) ||
    !isRecord(value) ||
    !hasOnlyKeys(value, [
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
    ])
  ) {
    return false;
  }
  if (value.lastRun !== undefined) {
    const lastRun = value.lastRun;
    if (
      !isRecord(lastRun) ||
      !hasOnlyKeys(lastRun, ['scheduleRunId', 'transition', 'phase', 'outcome', 'desiredStateAtUtc', 'updatedAtUtc', 'reasonCode']) ||
      !isBoundedString(lastRun.scheduleRunId, 200) ||
      !['reduce', 'restore'].includes(String(lastRun.transition)) ||
      (lastRun.phase !== undefined &&
        !['queued', 'leased', 'preflight', 'capturing-baseline', 'executing', 'polling', 'verifying'].includes(String(lastRun.phase))) ||
      (lastRun.outcome !== undefined &&
        !['succeeded', 'no-op', 'skipped', 'blocked', 'failed', 'superseded', 'expired'].includes(String(lastRun.outcome))) ||
      !isIsoTimestamp(lastRun.desiredStateAtUtc) ||
      !isIsoTimestamp(lastRun.updatedAtUtc) ||
      !isOptionalBoundedString(lastRun.reasonCode, 200)
    ) {
      return false;
    }
    if ((lastRun.phase === undefined) === (lastRun.outcome === undefined)) return false;
  }
  return (
    isBoundedString(value.companyId, 200) &&
    isBoundedString(value.resourceId, 2000) &&
    isOptionalBoundedString(value.scheduleId, 200) &&
    (value.definitionRevision === undefined || isPositiveInteger(value.definitionRevision)) &&
    isPositiveInteger(value.controlGeneration) &&
    ['unknown', 'normal', 'reducing', 'reduced', 'restoring', 'reduce-failed', 'restore-failed', 'drifted', 'target-missing', 'stranded'].includes(
      String(value.lifecycleState)
    ) &&
    isOptionalBoundedString(value.activeRecoveryCycleId, 200) &&
    typeof value.restoreOwed === 'boolean' &&
    Array.isArray(value.allowedCommands) &&
    value.allowedCommands.length <= 4 &&
    new Set(value.allowedCommands).size === value.allowedCommands.length &&
    value.allowedCommands.every(command => ['pause', 'resume', 'restore-now', 'leave-current-state'].includes(String(command))) &&
    isIsoTimestamp(value.updatedAtUtc)
  );
}
function isResourceSchedulingExecutionHistoryItem(value: unknown): value is ResourceSchedulingExecutionHistoryItem {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, [
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
    isBoundedString(value.scheduleRunId, 200) &&
    isBoundedString(value.resourceId, 2000) &&
    (value.transition === 'reduce' || value.transition === 'restore') &&
    isIsoTimestamp(value.desiredStateAtUtc) &&
    isIsoTimestamp(value.claimedAtUtc) &&
    (value.completedAtUtc === undefined || isIsoTimestamp(value.completedAtUtc)) &&
    (value.outcome === undefined ||
      ['succeeded', 'no-op', 'skipped', 'blocked', 'failed', 'superseded', 'expired'].includes(String(value.outcome))) &&
    isOptionalBoundedString(value.reasonCode, 200) &&
    isPositiveInteger(value.attemptCount) &&
    ((value.completedAtUtc === undefined && value.outcome === undefined) || (value.completedAtUtc !== undefined && value.outcome !== undefined))
  );
}
export function isResourceSchedulingExecutionHistoryResponse(value: unknown): value is ResourceSchedulingExecutionHistoryResponse {
  return (
    isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) &&
    isRecord(value) &&
    hasOnlyKeys(value, ['execution', 'runs']) &&
    isResourceSchedulingExecutionProjection(value.execution) &&
    Array.isArray(value.runs) &&
    value.runs.length <= 100 &&
    value.runs.every(isResourceSchedulingExecutionHistoryItem)
  );
}
export function isResourceStrategyScheduleCommand(value: unknown): value is ResourceStrategyScheduleCommand {
  if (
    !isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) ||
    !isRecord(value) ||
    !hasOnlyKeys(value, ['command', 'idempotencyKey', 'acknowledgement']) ||
    !isBoundedString(value.idempotencyKey, 200)
  ) {
    return false;
  }
  if (value.command === 'leave-current-state') return isBoundedString(value.acknowledgement, 2000);
  return ['pause', 'resume', 'restore-now'].includes(String(value.command)) && value.acknowledgement === undefined;
}
export function isResourceStrategyWeeklyScheduleListResponse(value: unknown): value is ResourceStrategyWeeklyScheduleListResponse {
  return (
    isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) &&
    isRecord(value) &&
    hasOnlyKeys(value, ['results', 'continuation']) &&
    Array.isArray(value.results) &&
    value.results.length <= RESOURCE_STRATEGY_CONTRACT_LIMITS.listResults &&
    value.results.every(isResourceStrategyWeeklyScheduleProjection) &&
    (value.continuation === undefined ||
      (isRecord(value.continuation) && hasOnlyKeys(value.continuation, ['cursor']) && isBoundedString(value.continuation.cursor, 2000)))
  );
}
