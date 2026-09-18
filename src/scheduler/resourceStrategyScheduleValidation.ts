import {
  RESOURCE_STRATEGY_CONTRACT_LIMITS,
  type ResourceScheduleDryRunCheckName,
  type ResourceScheduleDryRunCheckProjection,
  type ResourceScheduleDryRunEvaluationProjection,
  type ResourceScheduleDryRunProjection,
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
const RESOURCE_SCHEDULE_DRY_RUN_CHECK_NAMES: readonly ResourceScheduleDryRunCheckName[] = [
  'ownership',
  'readiness',
  'mutation-contention',
  'busy-policy',
  'blackout',
  'admission-budgets',
  'notification-routing',
];
function isResourceScheduleDryRunCheckProjection(value: unknown): value is ResourceScheduleDryRunCheckProjection {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, ['name', 'status', 'reasonCodes']) ||
    !RESOURCE_SCHEDULE_DRY_RUN_CHECK_NAMES.includes(value.name as ResourceScheduleDryRunCheckName) ||
    (value.status !== 'ready' && value.status !== 'blocked') ||
    !Array.isArray(value.reasonCodes) ||
    value.reasonCodes.length > RESOURCE_STRATEGY_CONTRACT_LIMITS.dryRunReasonCodes ||
    !value.reasonCodes.every(reasonCode => isBoundedString(reasonCode, 200)) ||
    new Set(value.reasonCodes).size !== value.reasonCodes.length
  ) {
    return false;
  }
  return value.status === 'ready' ? value.reasonCodes.length === 0 : value.reasonCodes.length > 0;
}
/** Validates one bounded authoritative dry-run result for a schedule revision. */
export function isResourceScheduleDryRunProjection(value: unknown): value is ResourceScheduleDryRunProjection {
  if (
    !isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.dryRunDtoBytes) ||
    !isRecord(value) ||
    containsForbiddenKey(value) ||
    !hasOnlyKeys(value, [
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
    !isBoundedString(value.scheduleId, 200) ||
    !isPositiveInteger(value.definitionRevision) ||
    !isPositiveInteger(value.controlGeneration) ||
    !isIsoTimestamp(value.evaluatedAtUtc) ||
    !isIsoTimestamp(value.expiresAtUtc) ||
    Date.parse(value.expiresAtUtc) <= Date.parse(value.evaluatedAtUtc) ||
    Date.parse(value.expiresAtUtc) - Date.parse(value.evaluatedAtUtc) > RESOURCE_STRATEGY_CONTRACT_LIMITS.dryRunMaxTtlMs ||
    (value.freshness !== 'fresh' && value.freshness !== 'stale') ||
    !isIsoTimestamp(value.windowStartUtc) ||
    !isIsoTimestamp(value.windowEndUtc) ||
    Date.parse(value.windowEndUtc) <= Date.parse(value.windowStartUtc) ||
    !isNonNegativeInteger(value.occurrenceCount) ||
    (value.status !== 'ready' && value.status !== 'blocked') ||
    !Array.isArray(value.checks) ||
    value.checks.length !== RESOURCE_STRATEGY_CONTRACT_LIMITS.dryRunChecks ||
    !value.checks.every(isResourceScheduleDryRunCheckProjection)
  ) {
    return false;
  }
  const checkNames = value.checks.map(check => check.name);
  if (
    new Set(checkNames).size !== RESOURCE_SCHEDULE_DRY_RUN_CHECK_NAMES.length ||
    !RESOURCE_SCHEDULE_DRY_RUN_CHECK_NAMES.every(name => checkNames.includes(name))
  ) {
    return false;
  }
  return value.status === (value.checks.every(check => check.status === 'ready') ? 'ready' : 'blocked');
}
/** Validates durable progress for exactly one schedule revision dry-run evaluation. */
export function isResourceScheduleDryRunEvaluationProjection(value: unknown): value is ResourceScheduleDryRunEvaluationProjection {
  if (
    !isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) ||
    !isRecord(value) ||
    containsForbiddenKey(value) ||
    !hasOnlyKeys(value, [
      'scheduleId',
      'definitionRevision',
      'controlGeneration',
      'evaluationId',
      'status',
      'queuedAtUtc',
      'startedAtUtc',
      'updatedAtUtc',
      'completedAtUtc',
      'attemptCount',
      'nextAttemptAtUtc',
      'result',
      'error',
    ]) ||
    !isBoundedString(value.scheduleId, 200) ||
    !isPositiveInteger(value.definitionRevision) ||
    !isPositiveInteger(value.controlGeneration) ||
    !isBoundedString(value.evaluationId, 500) ||
    !['queued', 'running', 'retrying', 'ready', 'blocked', 'failed'].includes(String(value.status)) ||
    !isIsoTimestamp(value.queuedAtUtc) ||
    !isIsoTimestamp(value.updatedAtUtc) ||
    Date.parse(value.updatedAtUtc) < Date.parse(value.queuedAtUtc) ||
    !isNonNegativeInteger(value.attemptCount)
  ) {
    return false;
  }

  const startedAtUtc = value.startedAtUtc;
  if (
    startedAtUtc !== undefined &&
    (!isIsoTimestamp(startedAtUtc) ||
      Date.parse(startedAtUtc) < Date.parse(value.queuedAtUtc) ||
      Date.parse(startedAtUtc) > Date.parse(value.updatedAtUtc))
  ) {
    return false;
  }

  const completedAtUtc = value.completedAtUtc;
  if (
    completedAtUtc !== undefined &&
    (!isIsoTimestamp(completedAtUtc) ||
      startedAtUtc === undefined ||
      Date.parse(completedAtUtc) < Date.parse(startedAtUtc) ||
      Date.parse(completedAtUtc) > Date.parse(value.updatedAtUtc))
  ) {
    return false;
  }

  const nextAttemptAtUtc = value.nextAttemptAtUtc;
  if (nextAttemptAtUtc !== undefined && (!isIsoTimestamp(nextAttemptAtUtc) || Date.parse(nextAttemptAtUtc) < Date.parse(value.updatedAtUtc))) {
    return false;
  }

  const result = value.result;
  if (
    result !== undefined &&
    (!isResourceScheduleDryRunProjection(result) ||
      result.scheduleId !== value.scheduleId ||
      result.definitionRevision !== value.definitionRevision ||
      result.controlGeneration !== value.controlGeneration)
  ) {
    return false;
  }

  const error = value.error;
  if (
    error !== undefined &&
    (!isRecord(error) || !hasOnlyKeys(error, ['code', 'message']) || !isBoundedString(error.code, 200) || !isBoundedString(error.message))
  ) {
    return false;
  }

  switch (value.status) {
    case 'queued':
      return (
        value.attemptCount === 0 &&
        startedAtUtc === undefined &&
        completedAtUtc === undefined &&
        nextAttemptAtUtc === undefined &&
        result === undefined &&
        error === undefined
      );
    case 'running':
      return (
        value.attemptCount > 0 &&
        startedAtUtc !== undefined &&
        completedAtUtc === undefined &&
        nextAttemptAtUtc === undefined &&
        result === undefined &&
        error === undefined
      );
    case 'retrying':
      return (
        value.attemptCount > 0 &&
        startedAtUtc !== undefined &&
        completedAtUtc === undefined &&
        nextAttemptAtUtc !== undefined &&
        result === undefined &&
        error === undefined
      );
    case 'ready':
    case 'blocked':
      return (
        value.attemptCount > 0 &&
        startedAtUtc !== undefined &&
        completedAtUtc !== undefined &&
        nextAttemptAtUtc === undefined &&
        result !== undefined &&
        result.status === value.status &&
        error === undefined
      );
    case 'failed':
      return (
        value.attemptCount > 0 &&
        startedAtUtc !== undefined &&
        completedAtUtc !== undefined &&
        nextAttemptAtUtc === undefined &&
        result === undefined &&
        error !== undefined
      );
  }
  return false;
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
    value.allowedCommands.length <= 5 &&
    new Set(value.allowedCommands).size === value.allowedCommands.length &&
    value.allowedCommands.every(
      command =>
        typeof command === 'string' && ['pause', 'resume', 'restore-now', 'restore-and-delete', 'leave-current-state'].includes(command)
    ) &&
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
  return (
    typeof value.command === 'string' &&
    ['pause', 'resume', 'rerun-dry-run', 'restore-now', 'restore-and-delete'].includes(value.command) &&
    value.acknowledgement === undefined
  );
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
