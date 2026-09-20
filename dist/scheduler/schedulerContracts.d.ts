import type { ResourceSchedulePreviewRequest, ResourceSchedulePreviewResponse, ResourceSchedulePermissionManifestConsent, ResourceStrategyScheduleCommand, ResourceStrategyWeeklyScheduleProjection, ResourceStrategyWeeklyScheduleWriteRequest, ResourceSchedulingCapabilityRef, ResourceSchedulingCapabilityProjection, ResourceSchedulingReadinessProjection, ScheduledResourceTransitionV1 } from './resourceStrategyContracts';
export type RecommendationActionScheduleTrigger = {
    triggerType: 'once';
    localDateTime: string;
} | {
    triggerType: 'recurring';
    cronExpression: string;
};
export type RecommendationActionScheduleTarget = {
    selectorType: 'single-resource';
    resourceId: string;
} | {
    selectorType: 'selected-resources';
    resourceIds: string[];
} | {
    selectorType: 'provider-scope';
};
export interface RecommendationActionScheduleWriteRequest {
    definitionType: 'recommendation-action';
    name: string;
    timezone: string;
    trigger: RecommendationActionScheduleTrigger;
    providerScopeId: string;
    cloudAccountId?: string;
    recommendationId: string;
    operation: 'implement';
    target: RecommendationActionScheduleTarget;
    initialMode: 'active' | 'paused';
    notes?: string;
    configuration?: Record<string, unknown>;
}
export type RecommendationActionScheduleStatus = 'active' | 'paused' | 'completed';
export type RecommendationActionScheduleOutcome = 'succeeded' | 'failed' | 'skipped';
export interface RecommendationActionScheduleProjection {
    scheduleId: string;
    definitionRevision: number;
    controlGeneration: number;
    etag: string;
    status: RecommendationActionScheduleStatus;
    definition: RecommendationActionScheduleWriteRequest;
    nextOccurrenceAtUtc?: string;
    lastOccurrenceAtUtc?: string;
    lastOccurrenceOutcome?: RecommendationActionScheduleOutcome;
    createdAtUtc: string;
    createdBy: string;
    updatedAtUtc: string;
    updatedBy: string;
}
export type ScheduleWriteRequest = ResourceStrategyWeeklyScheduleWriteRequest | RecommendationActionScheduleWriteRequest;
export interface ScheduleMutationRequest {
    definition: ScheduleWriteRequest;
    permissionConsent?: ResourceSchedulePermissionManifestConsent;
}
export type ScheduleProjection = ResourceStrategyWeeklyScheduleProjection | RecommendationActionScheduleProjection;
export type ScheduleDetailResponse = ScheduleProjection;
export type RecommendationActionScheduleCommand = {
    command: 'pause';
    idempotencyKey: string;
} | {
    command: 'resume';
    idempotencyKey: string;
};
export type ScheduleCommand = ResourceStrategyScheduleCommand | RecommendationActionScheduleCommand;
export interface ScheduleListResponse {
    results: ScheduleProjection[];
    continuation?: {
        cursor: string;
    };
}
export interface ScheduledRecommendationActionV1 {
    schemaVersion: 1;
    definitionType: 'recommendation-action';
    companyId: string;
    providerScopeId: string;
    cloudAccountId?: string;
    scheduleId: string;
    definitionRevision: number;
    controlGeneration: number;
    occurrenceKey: string;
    scheduleRunId: string;
    dueAtUtc: string;
    recommendationId: string;
    operation: 'implement';
    target: RecommendationActionScheduleTarget;
    configuration: Record<string, unknown>;
    correlationId: string;
}
export type ScheduledOccurrenceV1 = ScheduledResourceTransitionV1 | ScheduledRecommendationActionV1;
export type SchedulerControlOperationType = 'create-schedule' | 'update-schedule' | 'delete-schedule' | 'apply-schedule-command' | 'refresh-readiness' | 'preview-resource-schedule' | 'refresh-capabilities';
export type SchedulerControlCommandV1 = {
    commandType: 'refresh-capabilities';
} | {
    commandType: 'create-schedule';
    definition: ScheduleWriteRequest;
    permissionConsent?: ResourceSchedulePermissionManifestConsent;
    idempotencyKey: string;
} | {
    commandType: 'update-schedule';
    scheduleId: string;
    definition: ScheduleWriteRequest;
    permissionConsent?: ResourceSchedulePermissionManifestConsent;
    expectedEtag: string;
    idempotencyKey: string;
} | {
    commandType: 'delete-schedule';
    scheduleId: string;
    expectedEtag: string;
    idempotencyKey: string;
} | {
    commandType: 'apply-schedule-command';
    scheduleId: string;
    expectedEtag: string;
    scheduleCommand: ScheduleCommand;
} | {
    commandType: 'refresh-readiness';
    cloudAccountId: string;
    providerScopeId: string;
    resourceId: string;
    capability: ResourceSchedulingCapabilityRef;
} | {
    commandType: 'preview-resource-schedule';
    request: ResourceSchedulePreviewRequest;
};
/** Internal API-to-cloud-engine command carried by the existing request queue. */
export interface SchedulerControlRequestMessageV1 {
    schemaVersion: 1;
    entity: 'scheduler';
    action: 'control';
    companyId: string;
    cloudAccountId: string;
    tenantId: string;
    clientId: string;
    operationId: string;
    requestedAtUtc: string;
    actorId: string;
    correlationId: string;
    command: SchedulerControlCommandV1;
}
export interface SchedulerOperationAcceptedResponse {
    schemaVersion: 1;
    operationId: string;
    status: 'accepted';
    submittedAtUtc: string;
}
export type SchedulerOperationResult = {
    resultType: 'capabilities';
    capabilities: ResourceSchedulingCapabilityProjection[];
} | {
    resultType: 'schedule';
    schedule: ScheduleProjection;
} | {
    resultType: 'deleted';
} | {
    resultType: 'readiness';
    readiness: ResourceSchedulingReadinessProjection;
} | {
    resultType: 'preview';
    preview: ResourceSchedulePreviewResponse;
};
interface SchedulerOperationProjectionBase {
    schemaVersion: 1;
    companyId: string;
    operationId: string;
    operationType: SchedulerControlOperationType;
    submittedAtUtc: string;
    updatedAtUtc: string;
}
export type SchedulerOperationProjection = (SchedulerOperationProjectionBase & {
    status: 'pending';
}) | (SchedulerOperationProjectionBase & {
    status: 'succeeded';
    completedAtUtc: string;
    result: SchedulerOperationResult;
}) | (SchedulerOperationProjectionBase & {
    status: 'failed';
    completedAtUtc: string;
    error: {
        code: string;
        message: string;
        retryable: boolean;
    };
});
export {};
//# sourceMappingURL=schedulerContracts.d.ts.map