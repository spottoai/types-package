export type ScheduleTargetType =
  | 'recommendation-action'
  | 'resource-operation'
  | 'provider-scope-operation';
export type ScheduleSelectorType =
  | 'single-resource'
  | 'selected-resources'
  | 'provider-scope';
export type ScheduleType = 'once' | 'recurring';
export type ScheduleStatus = 'active' | 'paused';
export type ScheduleRunStatus =
  | 'success'
  | 'dispatch-failed'
  | 'dispatching';
export type ScheduleHistoryEventType =
  | 'dispatch-succeeded'
  | 'dispatch-failed';

export type ScheduleDefinitionClass = 'atomic' | 'composite';
export type ScheduleDefinitionType =
  | 'recommendation-action'
  | 'resource-operation'
  | 'vm-runtime-weekly';

export type ResourceScheduleGroupType = 'resource-schedule-definition';

export interface ScheduleTargetBase {
  companyId: string;
  providerName: string;
  providerScopeId: string;
  cloudAccountId?: string;
  resourceId?: string;
  recommendationId?: string;
  recommendationAction?: string;
  operation?: string;
  targetCount?: number;
  definitionId?: string;
  definitionClass?: ScheduleDefinitionClass;
  definitionType?: ScheduleDefinitionType;
  scheduleGroupId?: string;
  scheduleGroupType?: ResourceScheduleGroupType;
  compiledRuleId?: string;
  compiledOperation?: string;
}

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

export interface ScheduleDocument extends ScheduleSummary {
  selectedResourceIds?: string[];
  notes?: string;
  configuration?: Record<string, unknown>;
}

export type ScheduleDetailResponse = ScheduleDocument;

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

export interface SchedulerBatchRunItem {
  scheduleId: string;
  scheduleRunId: string;
  targetType: ScheduleTargetType;
  scheduleType: ScheduleType;
  providerScopeId: string;
  cloudAccountId?: string;
  resourceId?: string;
  recommendationId?: string;
  operation?: string;
  recommendationAction?: string;
  definitionId?: string;
  definitionClass?: ScheduleDefinitionClass;
  definitionType?: ScheduleDefinitionType;
  scheduleGroupId?: string;
  scheduleGroupType?: ResourceScheduleGroupType;
  compiledRuleId?: string;
  compiledOperation?: string;
}

export interface SchedulerBatchQueueMessage {
  batchId: string;
  companyId: string;
  providerName: string;
  runs: SchedulerBatchRunItem[];
}

export interface ScheduleListResponse {
  results: ScheduleSummary[];
  continuation?: {
    nextScheduleId?: string;
  };
}

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

export interface OnceScheduleWriteRequest extends BaseScheduleWriteRequest {
  scheduleType: 'once';
  localDateTime: string;
  timezone: string;
}

export interface RecurringScheduleWriteRequest extends BaseScheduleWriteRequest {
  scheduleType: 'recurring';
  cronExpression: string;
  timezone: string;
  status?: ScheduleStatus;
}

export type ScheduleWriteRequest =
  | OnceScheduleWriteRequest
  | RecurringScheduleWriteRequest;

export type ResourceScheduleStatus = ScheduleStatus;
export type VmRuntimeOperation = 'start' | 'deallocate';
export type WeekdayNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface VmRuntimeWeeklyRule {
  ruleId: string;
  daysOfWeek: WeekdayNumber[];
  timeLocal: string;
}

export interface VmRuntimePreDeallocateGuardPolicy {
  enabled: boolean;
  metric: 'cpu';
  thresholdPercent: number;
  lookbackMinutes: number;
  deferMinutes: number;
  maxDeferralsPerDay?: number;
}

export interface ResourceScheduleExecutionPolicy {
  preDeallocateGuard?: VmRuntimePreDeallocateGuardPolicy;
}

export interface VmRuntimeWeeklyConfiguration {
  startRules: VmRuntimeWeeklyRule[];
  deallocateRules: VmRuntimeWeeklyRule[];
}

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

export interface AtomicResourceScheduleDefinition
  extends ResourceScheduleDefinitionBase {
  definitionClass: 'atomic';
  definitionType: 'recommendation-action' | 'resource-operation';
  scheduleId?: string;
  targetType: Extract<
    ScheduleTargetType,
    'recommendation-action' | 'resource-operation'
  >;
  selectorType: Extract<
    ScheduleSelectorType,
    'single-resource' | 'selected-resources' | 'provider-scope'
  >;
  scheduleType: ScheduleType;
  localDateTime?: string;
  cronExpression?: string;
  recommendationId?: string;
  recommendationAction?: string;
  operation?: string;
  targetCount?: number;
  selectedResourceIds?: string[];
  configuration?: Record<string, unknown>;
}

export interface VmRuntimeWeeklyScheduleDefinition
  extends ResourceScheduleDefinitionBase {
  definitionClass: 'composite';
  definitionType: 'vm-runtime-weekly';
  resourceId: string;
  targetResourceType: 'Microsoft.Compute/virtualMachines';
  configuration: VmRuntimeWeeklyConfiguration;
}

export type ResourceScheduleDefinition =
  | AtomicResourceScheduleDefinition
  | VmRuntimeWeeklyScheduleDefinition;

export interface ResourceScheduleListResponse {
  results: ResourceScheduleDefinition[];
  continuation?: {
    nextPartitionKey?: string;
    nextRowKey?: string;
  };
}

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
  targetType: Extract<
    ScheduleTargetType,
    'recommendation-action' | 'resource-operation'
  >;
  selectorType: Extract<
    ScheduleSelectorType,
    'single-resource' | 'selected-resources' | 'provider-scope'
  >;
  scheduleType: ScheduleType;
  localDateTime?: string;
  cronExpression?: string;
  recommendationId?: string;
  recommendationAction?: string;
  operation?: string;
  targetCount?: number;
  selectedResourceIds?: string[];
  configuration?: Record<string, unknown>;
}

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

export type ResourceScheduleDefinitionWriteRequest =
  | AtomicResourceScheduleWriteRequest
  | VmRuntimeWeeklyScheduleWriteRequest;
