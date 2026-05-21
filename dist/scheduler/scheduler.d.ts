export type ScheduleTargetType = 'recommendation-action' | 'resource-operation' | 'provider-scope-operation';
export type ScheduleSelectorType = 'single-resource' | 'selected-resources' | 'provider-scope';
export type ScheduleType = 'once' | 'recurring';
export type ScheduleStatus = 'active' | 'paused';
export type ScheduleRunStatus = 'success' | 'dispatch-failed' | 'dispatching';
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
export interface SchedulerBatchRunItem {
    scheduleId: string;
    scheduleRunId: string;
    scheduleName: string;
    targetType: ScheduleTargetType;
    selectorType: ScheduleSelectorType;
    scheduleType: ScheduleType;
    providerScopeId: string;
    cloudAccountId?: string;
    resourceId?: string;
    selectedResourceIds?: string[];
    recommendationId?: string;
    operation?: string;
    recommendationAction?: string;
    targetCount?: number;
    createdByUserId?: string;
    updatedByUserId?: string;
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
//# sourceMappingURL=scheduler.d.ts.map
