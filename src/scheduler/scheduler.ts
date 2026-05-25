export type ScheduleTargetType = 'recommendation-action' | 'resource-operation' | 'provider-scope-operation';
export type ScheduleSelectorType = 'single-resource' | 'selected-resources' | 'provider-scope';
export type ScheduleType = 'once' | 'recurring';
export type ScheduleStatus = 'active' | 'paused';
export type ScheduleRunStatus = 'success' | 'dispatch-failed' | 'dispatching';
export type ScheduleHistoryEventType = 'dispatch-succeeded' | 'dispatch-failed';

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
  actionDefinitionId?: string;
  recommendationAction?: string;
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
  actionDefinitionId?: string;
  targetCount?: number;
  selectedResourceIds?: string[];
  notes?: string;
  configuration?: Record<string, unknown>;
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

export type ScheduleWriteRequest = OnceScheduleWriteRequest | RecurringScheduleWriteRequest;
