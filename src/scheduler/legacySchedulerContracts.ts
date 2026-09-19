/**
 * @deprecated Temporary: legacy (pre-generic) schedule contracts restored from before commit 38f20e3 ("finalize generic scheduler contracts") and kept
 * only until cloud-engine, api and ui migrate Bastion / legacy schedule handling to the generic scheduler contracts
 * (`./schedulerContracts`, `./resourceStrategy`; see specs/scheduler/azure-resource-strategy-scheduling-types.md).
 * Do not add new consumers. Exported from the package root only, never from the `/scheduler` subpath.
 */
// `ScheduleDetailResponse`, `ScheduleListResponse` and `ScheduleWriteRequest` are intentionally not restored: the
// generic scheduler (`./schedulerContracts`) now owns those names with new shapes.
import type {
  BastionAvailabilityWeeklyScheduleDefinition,
  BastionAvailabilityWeeklyScheduleWriteRequest,
  BastionScheduleRun,
} from './bastionSchedule';

/** @deprecated Legacy scheduler contract; see file header. */
export type ScheduleTargetType = 'recommendation-action' | 'resource-operation' | 'provider-scope-operation';
/** @deprecated Legacy scheduler contract; see file header. */
export type ScheduleSelectorType = 'single-resource' | 'selected-resources' | 'provider-scope';
/** @deprecated Legacy scheduler contract; see file header. */
export type ScheduleType = 'once' | 'recurring';
/** @deprecated Legacy scheduler contract; see file header. */
export type ScheduleStatus = 'active' | 'paused';
/** @deprecated Legacy scheduler contract; see file header. */
export type ScheduleRunStatus = 'success' | 'dispatch-failed' | 'dispatching';
/** @deprecated Legacy scheduler contract; see file header. */
export type ScheduleHistoryEventType = 'dispatch-succeeded' | 'dispatch-failed';

/** @deprecated Legacy scheduler contract; see file header. */
export type ScheduleDefinitionClass = 'atomic' | 'composite';
/** @deprecated Legacy scheduler contract; see file header. */
export type ScheduleDefinitionType = 'recommendation-action' | 'resource-operation' | 'vm-runtime-weekly' | 'bastion-availability-weekly';

/** @deprecated Legacy scheduler contract; see file header. */
export type ResourceScheduleGroupType = 'resource-schedule-definition';

/** @deprecated Legacy scheduler contract; see file header. */
export interface ScheduleTargetBase {
  companyId: string;
  providerName: string;
  providerScopeId: string;
  cloudAccountId?: string;
  resourceId?: string;
  recommendationId?: string;
  recommendationAction?: string;
  operation?: string;
  actionDefinitionId?: string;
  targetCount?: number;
  definitionId?: string;
  definitionClass?: ScheduleDefinitionClass;
  definitionType?: ScheduleDefinitionType;
  scheduleGroupId?: string;
  scheduleGroupType?: ResourceScheduleGroupType;
  compiledRuleId?: string;
  compiledOperation?: string;
}

/** @deprecated Legacy scheduler contract; see file header. */
export interface ScheduleSummary extends ScheduleTargetBase {
  scheduleId: string;
  name: string;
  targetType: ScheduleTargetType;
  selectorType: ScheduleSelectorType;
  scheduleType: ScheduleType;
  status: ScheduleStatus;
  timezone: string;
  localDateTime?: string;
  cronExpression?: string;
  nextRunUtc: string;
  pendingRunAtUtc?: string;
  pendingRunId?: string;
  lastRunAtUtc?: string;
  lastSuccessfulRunAtUtc?: string;
  lastRunStatus?: ScheduleRunStatus;
  lastRunId?: string;
  createdAtUtc: string;
  updatedAtUtc: string;
  createdByUserId?: string;
  updatedByUserId?: string;
}

/** @deprecated Legacy scheduler contract; see file header. */
export interface ScheduleDocument extends ScheduleSummary {
  selectedResourceIds?: string[];
  notes?: string;
  configuration?: Record<string, unknown>;
}

/** @deprecated Legacy scheduler contract; see file header. */
export interface ScheduleHistoryItem {
  eventId: string;
  companyId: string;
  scheduleId: string;
  scheduleRunId: string;
  eventType: ScheduleHistoryEventType;
  eventTimeUtc: string;
  batchId?: string;
  providerName: string;
  providerScopeId: string;
  message?: string;
}

/** @deprecated Legacy scheduler contract; see file header. */
export interface SchedulerBatchRunItemBase {
  scheduleId: string;
  scheduleRunId: string;
  scheduleName?: string;
  targetType: ScheduleTargetType;
  selectorType: ScheduleSelectorType;
  scheduleType: ScheduleType;
  providerScopeId: string;
  cloudAccountId?: string;
  resourceId?: string;
  definitionId?: string;
  definitionClass?: ScheduleDefinitionClass;
  scheduleGroupId?: string;
  scheduleGroupType?: ResourceScheduleGroupType;
  compiledRuleId?: string;
  compiledOperation?: string;
  targetCount?: number;
  createdByUserId?: string;
  updatedByUserId?: string;
}

/** @deprecated Legacy scheduler contract; see file header. */
export interface NonBastionSchedulerBatchRunItem extends SchedulerBatchRunItemBase {
  selectedResourceIds?: string[];
  recommendationId?: string;
  operation?: string;
  actionDefinitionId?: string;
  recommendationAction?: string;
  definitionType?: Exclude<ScheduleDefinitionType, 'bastion-availability-weekly'>;
}

/** @deprecated Legacy scheduler contract; see file header. */
export type SchedulerBatchRunItem = NonBastionSchedulerBatchRunItem | BastionScheduleRun;

/** @deprecated Legacy scheduler contract; see file header. */
export interface SchedulerBatchQueueMessage {
  batchId: string;
  companyId: string;
  providerName: string;
  runs: SchedulerBatchRunItem[];
}

/** @deprecated Legacy scheduler contract; see file header. */
export interface BaseScheduleWriteRequest {
  name: string;
  targetType: ScheduleTargetType;
  selectorType: ScheduleSelectorType;
  providerName: string;
  providerScopeId: string;
  cloudAccountId?: string;
  resourceId?: string;
  recommendationId?: string;
  recommendationAction?: string;
  operation?: string;
  actionDefinitionId?: string;
  targetCount?: number;
  selectedResourceIds?: string[];
  notes?: string;
  configuration?: Record<string, unknown>;
  definitionId?: string;
  definitionClass?: ScheduleDefinitionClass;
  definitionType?: ScheduleDefinitionType;
  scheduleGroupId?: string;
  scheduleGroupType?: ResourceScheduleGroupType;
  compiledRuleId?: string;
  compiledOperation?: string;
}

/** @deprecated Legacy scheduler contract; see file header. */
export interface OnceScheduleWriteRequest extends BaseScheduleWriteRequest {
  scheduleType: 'once';
  localDateTime: string;
  timezone: string;
}

/** @deprecated Legacy scheduler contract; see file header. */
export interface RecurringScheduleWriteRequest extends BaseScheduleWriteRequest {
  scheduleType: 'recurring';
  cronExpression: string;
  timezone: string;
  status?: ScheduleStatus;
}

/** @deprecated Legacy scheduler contract; see file header. */
export type ResourceScheduleStatus = ScheduleStatus;
/** @deprecated Legacy scheduler contract; see file header. */
export type VmRuntimeOperation = 'start' | 'deallocate';
/** @deprecated Legacy scheduler contract; see file header. */
export type WeekdayNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** @deprecated Legacy scheduler contract; see file header. */
export interface VmRuntimeWeeklyRule {
  ruleId: string;
  daysOfWeek: WeekdayNumber[];
  timeLocal: string;
}

/** @deprecated Legacy scheduler contract; see file header. */
export interface VmRuntimePreDeallocateGuardPolicy {
  enabled: boolean;
  metric: 'cpu';
  thresholdPercent: number;
  lookbackMinutes: number;
  deferMinutes: number;
  maxDeferralsPerDay?: number;
}

/** @deprecated Legacy scheduler contract; see file header. */
export interface ResourceScheduleExecutionPolicy {
  preDeallocateGuard?: VmRuntimePreDeallocateGuardPolicy;
}

/** @deprecated Legacy scheduler contract; see file header. */
export interface VmRuntimeWeeklyConfiguration {
  startRules: VmRuntimeWeeklyRule[];
  deallocateRules: VmRuntimeWeeklyRule[];
}

/** @deprecated Legacy scheduler contract; see file header. */
export interface ResourceScheduleDefinitionBase {
  definitionId: string;
  definitionClass: ScheduleDefinitionClass;
  definitionType: ScheduleDefinitionType;
  companyId: string;
  providerName: string;
  providerScopeId: string;
  cloudAccountId?: string;
  resourceId?: string;
  targetResourceType: string;
  name: string;
  timezone: string;
  status: ResourceScheduleStatus;
  notes?: string;
  executionPolicy?: ResourceScheduleExecutionPolicy;
  compiledScheduleIds?: string[];
  nextRunUtc?: string;
  lastRunAtUtc?: string;
  lastSuccessfulRunAtUtc?: string;
  lastRunStatus?: ScheduleRunStatus;
  createdAtUtc: string;
  updatedAtUtc: string;
  createdByUserId?: string;
  updatedByUserId?: string;
}

/** @deprecated Legacy scheduler contract; see file header. */
export interface AtomicResourceScheduleDefinition extends ResourceScheduleDefinitionBase {
  definitionClass: 'atomic';
  definitionType: 'recommendation-action' | 'resource-operation';
  scheduleId?: string;
  targetType: Extract<ScheduleTargetType, 'recommendation-action' | 'resource-operation'>;
  selectorType: Extract<ScheduleSelectorType, 'single-resource' | 'selected-resources' | 'provider-scope'>;
  scheduleType: ScheduleType;
  localDateTime?: string;
  cronExpression?: string;
  recommendationId?: string;
  recommendationAction?: string;
  operation?: string;
  actionDefinitionId?: string;
  targetCount?: number;
  selectedResourceIds?: string[];
  configuration?: Record<string, unknown>;
}

/** @deprecated Legacy scheduler contract; see file header. */
export interface VmRuntimeWeeklyScheduleDefinition extends ResourceScheduleDefinitionBase {
  definitionClass: 'composite';
  definitionType: 'vm-runtime-weekly';
  resourceId: string;
  targetResourceType: 'Microsoft.Compute/virtualMachines';
  configuration: VmRuntimeWeeklyConfiguration;
}

/** @deprecated Legacy scheduler contract; see file header. */
export type ResourceScheduleDefinition =
  AtomicResourceScheduleDefinition | VmRuntimeWeeklyScheduleDefinition | BastionAvailabilityWeeklyScheduleDefinition;

/** @deprecated Legacy scheduler contract; see file header. */
export interface ResourceScheduleListResponse {
  results: ResourceScheduleDefinition[];
  continuation?: {
    nextPartitionKey?: string;
    nextRowKey?: string;
  };
}

/** @deprecated Legacy scheduler contract; see file header. */
export interface AtomicResourceScheduleWriteRequest {
  definitionClass?: 'atomic';
  definitionType: 'recommendation-action' | 'resource-operation';
  name: string;
  providerName: string;
  providerScopeId: string;
  cloudAccountId?: string;
  resourceId?: string;
  targetResourceType: string;
  timezone?: string;
  notes?: string;
  executionPolicy?: ResourceScheduleExecutionPolicy;
  targetType: Extract<ScheduleTargetType, 'recommendation-action' | 'resource-operation'>;
  selectorType: Extract<ScheduleSelectorType, 'single-resource' | 'selected-resources' | 'provider-scope'>;
  scheduleType: ScheduleType;
  localDateTime?: string;
  cronExpression?: string;
  recommendationId?: string;
  recommendationAction?: string;
  operation?: string;
  actionDefinitionId?: string;
  targetCount?: number;
  selectedResourceIds?: string[];
  configuration?: Record<string, unknown>;
}

/** @deprecated Legacy scheduler contract; see file header. */
export interface VmRuntimeWeeklyScheduleWriteRequest {
  definitionClass?: 'composite';
  definitionType: 'vm-runtime-weekly';
  name: string;
  providerName: string;
  providerScopeId: string;
  cloudAccountId?: string;
  resourceId: string;
  targetResourceType?: 'Microsoft.Compute/virtualMachines';
  timezone?: string;
  notes?: string;
  executionPolicy?: ResourceScheduleExecutionPolicy;
  configuration: VmRuntimeWeeklyConfiguration;
}

/** @deprecated Legacy scheduler contract; see file header. */
export type ResourceScheduleDefinitionWriteRequest =
  AtomicResourceScheduleWriteRequest | VmRuntimeWeeklyScheduleWriteRequest | BastionAvailabilityWeeklyScheduleWriteRequest;
