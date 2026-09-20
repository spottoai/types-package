import { RESOURCE_STRATEGY_CONTRACT_LIMITS } from './resourceStrategyContracts';
import {
  isResourceStrategyScheduleCommand,
  isResourceStrategyWeeklyScheduleProjection,
  isResourceStrategyWeeklyScheduleWriteRequest,
} from './resourceStrategyScheduleValidation';
import type {
  RecommendationActionScheduleCommand,
  RecommendationActionScheduleProjection,
  RecommendationActionScheduleTarget,
  RecommendationActionScheduleWriteRequest,
  ScheduleListResponse,
  ScheduleCommand,
  ScheduleMutationRequest,
  ScheduleProjection,
  ScheduleWriteRequest,
  ScheduledOccurrenceV1,
  ScheduledRecommendationActionV1,
  SchedulerControlCommandV1,
  SchedulerControlOperationType,
  SchedulerControlRequestMessageV1,
  SchedulerOperationAcceptedResponse,
  SchedulerOperationProjection,
  SchedulerOperationResult,
} from './schedulerContracts';
import { isResourceSchedulePermissionManifestConsent } from './resourceStrategyPermissionValidation';
import { isResourceSchedulingCapabilityProjection, isResourceSchedulingReadinessProjection } from './resourceStrategyCapabilityValidation';
import { isResourceSchedulePreviewRequest, isResourceSchedulePreviewResponse } from './resourceStrategyFinancialValidation';
import {
  hasOnlyKeys,
  isBoundedParameters,
  isBoundedString,
  isIanaTimezone,
  isIsoTimestamp,
  isOptionalBoundedString,
  isPositiveInteger,
  isRecord,
  isWithinJsonByteLimit,
} from './resourceStrategyValidationShared';
import { isScheduledResourceTransitionV1 } from './resourceStrategyScheduleValidation';

const LOCAL_DATE_TIME = /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d$/u;

function isLocalDateTime(value: unknown): value is string {
  if (typeof value !== 'string' || !LOCAL_DATE_TIME.test(value)) return false;
  const parsed = new Date(`${value}:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 16) === value;
}

function isFiveFieldCronExpression(value: unknown): value is string {
  return isBoundedString(value, 500) && value.trim() === value && value.split(/\s+/u).length === 5;
}

function isRecommendationActionScheduleTarget(value: unknown): value is RecommendationActionScheduleTarget {
  if (!isRecord(value)) return false;
  if (value.selectorType === 'single-resource') {
    return hasOnlyKeys(value, ['selectorType', 'resourceId']) && isBoundedString(value.resourceId, 2000);
  }
  if (value.selectorType === 'selected-resources') {
    return (
      hasOnlyKeys(value, ['selectorType', 'resourceIds']) &&
      Array.isArray(value.resourceIds) &&
      value.resourceIds.length > 0 &&
      value.resourceIds.length <= 100 &&
      new Set(value.resourceIds).size === value.resourceIds.length &&
      value.resourceIds.every(resourceId => isBoundedString(resourceId, 2000))
    );
  }
  return value.selectorType === 'provider-scope' && hasOnlyKeys(value, ['selectorType']);
}

export function isRecommendationActionScheduleWriteRequest(value: unknown): value is RecommendationActionScheduleWriteRequest {
  try {
    if (!isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) || !isRecord(value)) return false;
    if (
      !hasOnlyKeys(value, [
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
      !isBoundedString(value.name, 500) ||
      !isIanaTimezone(value.timezone) ||
      !isBoundedString(value.providerScopeId, 500) ||
      !isOptionalBoundedString(value.cloudAccountId, 500) ||
      !isBoundedString(value.recommendationId, 500) ||
      value.operation !== 'implement' ||
      !isRecommendationActionScheduleTarget(value.target) ||
      (value.initialMode !== 'active' && value.initialMode !== 'paused') ||
      !isOptionalBoundedString(value.notes, 4000) ||
      (value.configuration !== undefined && !isBoundedParameters(value.configuration)) ||
      !isRecord(value.trigger)
    ) {
      return false;
    }
    if (value.trigger.triggerType === 'once') {
      return hasOnlyKeys(value.trigger, ['triggerType', 'localDateTime']) && isLocalDateTime(value.trigger.localDateTime);
    }
    return (
      value.trigger.triggerType === 'recurring' &&
      hasOnlyKeys(value.trigger, ['triggerType', 'cronExpression']) &&
      isFiveFieldCronExpression(value.trigger.cronExpression)
    );
  } catch {
    return false;
  }
}

export function isScheduleWriteRequest(value: unknown): value is ScheduleWriteRequest {
  return isResourceStrategyWeeklyScheduleWriteRequest(value) || isRecommendationActionScheduleWriteRequest(value);
}

export function isScheduleMutationRequest(value: unknown): value is ScheduleMutationRequest {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ['definition', 'permissionConsent']) &&
    isScheduleWriteRequest(value.definition) &&
    (value.permissionConsent === undefined || isResourceSchedulePermissionManifestConsent(value.permissionConsent))
  );
}

export function isRecommendationActionScheduleCommand(value: unknown): value is RecommendationActionScheduleCommand {
  return (
    isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) &&
    isRecord(value) &&
    hasOnlyKeys(value, ['command', 'idempotencyKey']) &&
    (value.command === 'pause' || value.command === 'resume') &&
    isBoundedString(value.idempotencyKey, 200)
  );
}

export function isScheduleCommand(value: unknown): value is ScheduleCommand {
  return isRecommendationActionScheduleCommand(value) || isResourceStrategyScheduleCommand(value);
}

export function isRecommendationActionScheduleProjection(value: unknown): value is RecommendationActionScheduleProjection {
  try {
    if (!isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) || !isRecord(value)) return false;
    return (
      hasOnlyKeys(value, [
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
      isBoundedString(value.scheduleId, 500) &&
      isPositiveInteger(value.definitionRevision) &&
      isPositiveInteger(value.controlGeneration) &&
      isBoundedString(value.etag, 2000) &&
      ['active', 'paused', 'completed'].includes(String(value.status)) &&
      isRecommendationActionScheduleWriteRequest(value.definition) &&
      (value.nextOccurrenceAtUtc === undefined || isIsoTimestamp(value.nextOccurrenceAtUtc)) &&
      (value.lastOccurrenceAtUtc === undefined || isIsoTimestamp(value.lastOccurrenceAtUtc)) &&
      (value.lastOccurrenceOutcome === undefined || ['succeeded', 'failed', 'skipped'].includes(String(value.lastOccurrenceOutcome))) &&
      (value.lastOccurrenceAtUtc === undefined) === (value.lastOccurrenceOutcome === undefined) &&
      isIsoTimestamp(value.createdAtUtc) &&
      isBoundedString(value.createdBy, 500) &&
      isIsoTimestamp(value.updatedAtUtc) &&
      isBoundedString(value.updatedBy, 500)
    );
  } catch {
    return false;
  }
}

export function isScheduleProjection(value: unknown): value is ScheduleProjection {
  return isResourceStrategyWeeklyScheduleProjection(value) || isRecommendationActionScheduleProjection(value);
}

export function isScheduleListResponse(value: unknown): value is ScheduleListResponse {
  return (
    isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) &&
    isRecord(value) &&
    hasOnlyKeys(value, ['results', 'continuation']) &&
    Array.isArray(value.results) &&
    value.results.length <= RESOURCE_STRATEGY_CONTRACT_LIMITS.listResults &&
    value.results.every(isScheduleProjection) &&
    (value.continuation === undefined ||
      (isRecord(value.continuation) && hasOnlyKeys(value.continuation, ['cursor']) && isBoundedString(value.continuation.cursor, 2000)))
  );
}

export function isScheduledRecommendationActionV1(value: unknown): value is ScheduledRecommendationActionV1 {
  try {
    return (
      isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) &&
      isRecord(value) &&
      hasOnlyKeys(value, [
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
      isBoundedString(value.companyId, 500) &&
      isBoundedString(value.providerScopeId, 500) &&
      isOptionalBoundedString(value.cloudAccountId, 500) &&
      isBoundedString(value.scheduleId, 500) &&
      isPositiveInteger(value.definitionRevision) &&
      isPositiveInteger(value.controlGeneration) &&
      isBoundedString(value.occurrenceKey, 2000) &&
      isBoundedString(value.scheduleRunId, 500) &&
      isIsoTimestamp(value.dueAtUtc) &&
      isBoundedString(value.recommendationId, 500) &&
      value.operation === 'implement' &&
      isRecommendationActionScheduleTarget(value.target) &&
      isBoundedParameters(value.configuration) &&
      isBoundedString(value.correlationId, 500)
    );
  } catch {
    return false;
  }
}

export function isScheduledOccurrenceV1(value: unknown): value is ScheduledOccurrenceV1 {
  return isScheduledResourceTransitionV1(value) || isScheduledRecommendationActionV1(value);
}

const schedulerOperationTypes = new Set<SchedulerControlOperationType>([
  'refresh-capabilities',
  'create-schedule',
  'update-schedule',
  'delete-schedule',
  'apply-schedule-command',
  'refresh-readiness',
  'preview-resource-schedule',
]);

function isEmptyOrBoundedString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.length <= maxLength;
}

function isSchedulerControlCommandV1(value: unknown): value is SchedulerControlCommandV1 {
  if (!isRecord(value) || typeof value.commandType !== 'string' || !schedulerOperationTypes.has(value.commandType as SchedulerControlOperationType)) {
    return false;
  }
  switch (value.commandType) {
    case 'refresh-capabilities':
      return hasOnlyKeys(value, ['commandType']);
    case 'create-schedule':
      return (
        hasOnlyKeys(value, ['commandType', 'definition', 'permissionConsent', 'idempotencyKey']) &&
        isScheduleWriteRequest(value.definition) &&
        (value.permissionConsent === undefined || isResourceSchedulePermissionManifestConsent(value.permissionConsent)) &&
        isBoundedString(value.idempotencyKey, 200)
      );
    case 'update-schedule':
      return (
        hasOnlyKeys(value, ['commandType', 'scheduleId', 'definition', 'permissionConsent', 'expectedEtag', 'idempotencyKey']) &&
        isBoundedString(value.scheduleId, 500) &&
        isScheduleWriteRequest(value.definition) &&
        (value.permissionConsent === undefined || isResourceSchedulePermissionManifestConsent(value.permissionConsent)) &&
        isBoundedString(value.expectedEtag, 2000) &&
        isBoundedString(value.idempotencyKey, 200)
      );
    case 'delete-schedule':
      return (
        hasOnlyKeys(value, ['commandType', 'scheduleId', 'expectedEtag', 'idempotencyKey']) &&
        isBoundedString(value.scheduleId, 500) &&
        isBoundedString(value.expectedEtag, 2000) &&
        isBoundedString(value.idempotencyKey, 200)
      );
    case 'apply-schedule-command':
      return (
        hasOnlyKeys(value, ['commandType', 'scheduleId', 'expectedEtag', 'scheduleCommand']) &&
        isBoundedString(value.scheduleId, 500) &&
        isBoundedString(value.expectedEtag, 2000) &&
        isScheduleCommand(value.scheduleCommand)
      );
    case 'refresh-readiness':
      return (
        hasOnlyKeys(value, ['commandType', 'cloudAccountId', 'providerScopeId', 'resourceId', 'capability']) &&
        isBoundedString(value.cloudAccountId, 500) &&
        isBoundedString(value.providerScopeId, 500) &&
        isBoundedString(value.resourceId, 2000) &&
        isRecord(value.capability) &&
        hasOnlyKeys(value.capability, ['capabilityId', 'capabilityVersion']) &&
        isBoundedString(value.capability.capabilityId, 200) &&
        isPositiveInteger(value.capability.capabilityVersion)
      );
    case 'preview-resource-schedule':
      return hasOnlyKeys(value, ['commandType', 'request']) && isResourceSchedulePreviewRequest(value.request);
  }
  return false;
}

export function isSchedulerControlRequestMessageV1(value: unknown): value is SchedulerControlRequestMessageV1 {
  try {
    return (
      isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) &&
      isRecord(value) &&
      hasOnlyKeys(value, [
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
      isBoundedString(value.companyId, 500) &&
      isEmptyOrBoundedString(value.cloudAccountId, 500) &&
      isEmptyOrBoundedString(value.tenantId, 500) &&
      isEmptyOrBoundedString(value.clientId, 500) &&
      isBoundedString(value.operationId, 200) &&
      isIsoTimestamp(value.requestedAtUtc) &&
      isBoundedString(value.actorId, 500) &&
      isBoundedString(value.correlationId, 500) &&
      isSchedulerControlCommandV1(value.command)
    );
  } catch {
    return false;
  }
}

export function isSchedulerOperationAcceptedResponse(value: unknown): value is SchedulerOperationAcceptedResponse {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ['schemaVersion', 'operationId', 'status', 'submittedAtUtc']) &&
    value.schemaVersion === 1 &&
    isBoundedString(value.operationId, 200) &&
    value.status === 'accepted' &&
    isIsoTimestamp(value.submittedAtUtc)
  );
}

function isSchedulerOperationResult(value: unknown, operationType: SchedulerControlOperationType): value is SchedulerOperationResult {
  if (!isRecord(value) || typeof value.resultType !== 'string') return false;
  if (value.resultType === 'capabilities') {
    return (
      operationType === 'refresh-capabilities' &&
      hasOnlyKeys(value, ['resultType', 'capabilities']) &&
      Array.isArray(value.capabilities) &&
      value.capabilities.every(isResourceSchedulingCapabilityProjection)
    );
  }
  if (value.resultType === 'schedule') {
    return (
      ['create-schedule', 'update-schedule', 'apply-schedule-command'].includes(operationType) &&
      hasOnlyKeys(value, ['resultType', 'schedule']) &&
      isScheduleProjection(value.schedule)
    );
  }
  if (value.resultType === 'deleted') {
    return operationType === 'delete-schedule' && hasOnlyKeys(value, ['resultType']);
  }
  if (value.resultType === 'readiness') {
    return (
      operationType === 'refresh-readiness' &&
      hasOnlyKeys(value, ['resultType', 'readiness']) &&
      isResourceSchedulingReadinessProjection(value.readiness)
    );
  }
  return (
    value.resultType === 'preview' &&
    operationType === 'preview-resource-schedule' &&
    hasOnlyKeys(value, ['resultType', 'preview']) &&
    isResourceSchedulePreviewResponse(value.preview)
  );
}

export function isSchedulerOperationProjection(value: unknown): value is SchedulerOperationProjection {
  try {
    if (
      !isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) ||
      !isRecord(value) ||
      value.schemaVersion !== 1 ||
      !isBoundedString(value.companyId, 500) ||
      !isBoundedString(value.operationId, 200) ||
      typeof value.operationType !== 'string' ||
      !schedulerOperationTypes.has(value.operationType as SchedulerControlOperationType) ||
      !isIsoTimestamp(value.submittedAtUtc) ||
      !isIsoTimestamp(value.updatedAtUtc)
    ) {
      return false;
    }
    const operationType = value.operationType as SchedulerControlOperationType;
    if (value.status === 'pending') {
      return hasOnlyKeys(value, ['schemaVersion', 'companyId', 'operationId', 'operationType', 'status', 'submittedAtUtc', 'updatedAtUtc']);
    }
    if (value.status === 'succeeded') {
      return (
        hasOnlyKeys(value, [
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
        isIsoTimestamp(value.completedAtUtc) &&
        isSchedulerOperationResult(value.result, operationType)
      );
    }
    return (
      value.status === 'failed' &&
      hasOnlyKeys(value, [
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
      isIsoTimestamp(value.completedAtUtc) &&
      isRecord(value.error) &&
      hasOnlyKeys(value.error, ['code', 'message', 'retryable']) &&
      isBoundedString(value.error.code, 100) &&
      isBoundedString(value.error.message, 500) &&
      typeof value.error.retryable === 'boolean'
    );
  } catch {
    return false;
  }
}
