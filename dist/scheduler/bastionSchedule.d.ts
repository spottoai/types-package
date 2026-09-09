import type { ResourceScheduleDefinitionBase, SchedulerBatchRunItemBase, WeekdayNumber } from './scheduler';
export type BastionScheduleDefinitionType = 'bastion-availability-weekly';
export type BastionAvailabilityOperation = 'remove' | 'restore';
export interface BastionAvailabilityWindow {
    windowId: string;
    daysOfWeek: WeekdayNumber[];
    accessStartTimeLocal: string;
    accessEndTimeLocal: string;
}
export interface BastionAvailabilityWeeklyConfiguration {
    accessWindows: BastionAvailabilityWindow[];
}
export interface BastionAvailabilityWeeklyScheduleWriteRequest {
    definitionType: BastionScheduleDefinitionType;
    name: string;
    providerName: string;
    providerScopeId: string;
    cloudAccountId: string;
    resourceId: string;
    targetResourceType?: 'Microsoft.Network/bastionHosts';
    timezone: string;
    notes?: string;
    acknowledgementVersion: 'bastion-delete-recreate-v1';
    configuration: BastionAvailabilityWeeklyConfiguration;
}
export interface BastionAvailabilityWeeklyScheduleDefinition extends ResourceScheduleDefinitionBase {
    definitionClass: 'composite';
    definitionType: BastionScheduleDefinitionType;
    cloudAccountId: string;
    resourceId: string;
    targetResourceType: 'Microsoft.Network/bastionHosts';
    definitionRevision: number;
    acknowledgementVersion: 'bastion-delete-recreate-v1';
    configuration: BastionAvailabilityWeeklyConfiguration;
    executionPolicy?: never;
}
interface BastionScheduleRunBase extends SchedulerBatchRunItemBase {
    targetType: 'resource-operation';
    selectorType: 'single-resource';
    scheduleType: 'recurring';
    cloudAccountId: string;
    resourceId: string;
    definitionId: string;
    definitionClass: 'composite';
    definitionType: BastionScheduleDefinitionType;
    compiledRuleId: string;
    definitionRevision: number;
    scheduledForUtc: string;
}
export interface BastionRemoveScheduleRun extends BastionScheduleRunBase {
    compiledOperation: 'remove';
    controlGeneration: number;
}
export interface BastionRestoreScheduleRun extends BastionScheduleRunBase {
    compiledOperation: 'restore';
    controlGeneration?: never;
}
export type BastionScheduleRun = BastionRemoveScheduleRun | BastionRestoreScheduleRun;
export interface BastionScheduleControlV1 {
    schemaVersion: 1;
    companyId: string;
    resourceId: string;
    definitionId: string;
    definitionRevision: number;
    controlGeneration: number;
    desiredStatus: 'active' | 'paused';
    updatedAtUtc: string;
}
export type BastionScheduleReadinessStatus = 'confirmed' | 'missing' | 'unknown' | 'unsupported';
export type BastionScheduleReadinessReasonCode = 'feature-disabled' | 'resource-not-found' | 'unsupported-profile' | 'unsupported-region' | 'missing-permission' | 'permission-unknown' | 'management-lock';
export interface BastionScheduleReadinessV1 {
    schemaVersion: 1;
    status: BastionScheduleReadinessStatus;
    companyId: string;
    cloudAccountId: string;
    subscriptionId: string;
    resourceId: string;
    requiredActions: string[];
    missingActions: string[];
    reasonCode?: BastionScheduleReadinessReasonCode;
    checkedAtUtc: string;
}
export type BastionAvailabilityPhase = 'available' | 'removing' | 'absent' | 'restoring';
export type BastionAvailabilityResult = 'succeeded' | 'skipped' | 'blocked' | 'failed' | 'pending';
export type BastionAvailabilityReasonCode = 'feature-disabled' | 'resource-not-found' | 'unsupported-profile' | 'unsupported-region' | 'missing-permission' | 'permission-unknown' | 'management-lock' | 'active-sessions' | 'session-state-unknown' | 'snapshot-failed' | 'active-snapshot-missing' | 'source-drift' | 'dependency-missing' | 'dependency-drift' | 'stale-run' | 'continuation-overdue' | 'azure-operation-failed' | 'restore-timeout';
export interface BastionAvailabilityStatusV1 {
    schemaVersion: 1;
    companyId: string;
    resourceId: string;
    definitionId: string;
    definitionRevision: number;
    phase: BastionAvailabilityPhase;
    lastOperation: BastionAvailabilityOperation;
    lastResult: BastionAvailabilityResult;
    reasonCode?: BastionAvailabilityReasonCode;
    snapshotCapturedAtUtc?: string;
    restoreAvailable: boolean;
    updatedAtUtc: string;
}
export interface BastionPauseResponse {
    status: 'paused' | 'pause-pending';
    resourceId: string;
    controlGeneration: number;
    requestedAtUtc: string;
}
export interface BastionRestoreNowResponse {
    accepted: boolean;
    scheduleRunId: string;
    resourceId: string;
    requestedAtUtc: string;
}
export {};
//# sourceMappingURL=bastionSchedule.d.ts.map