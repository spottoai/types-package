/**
 * @deprecated Temporary: Bastion schedule contracts restored from before commit 38f20e3 ("finalize generic scheduler contracts") and kept
 * only until cloud-engine, api and ui migrate Bastion / legacy schedule handling to the generic scheduler contracts
 * (`./schedulerContracts`, `./resourceStrategy`; see specs/scheduler/azure-resource-strategy-scheduling-types.md).
 * Do not add new consumers. Exported from the package root only, never from the `/scheduler` subpath.
 */
import type { ResourceScheduleDefinitionBase, SchedulerBatchRunItemBase, WeekdayNumber } from './legacySchedulerContracts';

/** @deprecated Temporary Bastion scheduler contract; see file header. */
export type BastionScheduleDefinitionType = 'bastion-availability-weekly';
/** @deprecated Temporary Bastion scheduler contract; see file header. */
export type BastionAvailabilityOperation = 'remove' | 'restore';

/** @deprecated Temporary Bastion scheduler contract; see file header. */
export interface BastionAvailabilityWindow {
  windowId: string;
  daysOfWeek: WeekdayNumber[];
  accessStartTimeLocal: string;
  accessEndTimeLocal: string;
}

/** @deprecated Temporary Bastion scheduler contract; see file header. */
export interface BastionAvailabilityWeeklyConfiguration {
  accessWindows: BastionAvailabilityWindow[];
}

/** @deprecated Temporary Bastion scheduler contract; see file header. */
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

/** @deprecated Temporary Bastion scheduler contract; see file header. */
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

/** @deprecated Temporary Bastion scheduler contract; see file header. */
export interface BastionRemoveScheduleRun extends BastionScheduleRunBase {
  compiledOperation: 'remove';
  controlGeneration: number;
}

/** @deprecated Temporary Bastion scheduler contract; see file header. */
export interface BastionRestoreScheduleRun extends BastionScheduleRunBase {
  compiledOperation: 'restore';
  controlGeneration?: never;
}

/** @deprecated Temporary Bastion scheduler contract; see file header. */
export type BastionScheduleRun = BastionRemoveScheduleRun | BastionRestoreScheduleRun;

/** @deprecated Temporary Bastion scheduler contract; see file header. */
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

/** @deprecated Temporary Bastion scheduler contract; see file header. */
export type BastionScheduleReadinessStatus = 'confirmed' | 'missing' | 'unknown' | 'unsupported';

/** @deprecated Temporary Bastion scheduler contract; see file header. */
export type BastionScheduleReadinessReasonCode =
  | 'feature-disabled'
  | 'resource-not-found'
  | 'unsupported-profile'
  | 'unsupported-region'
  | 'missing-permission'
  | 'permission-unknown'
  | 'management-lock';

/** @deprecated Temporary Bastion scheduler contract; see file header. */
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

/** @deprecated Temporary Bastion scheduler contract; see file header. */
export type BastionAvailabilityPhase = 'available' | 'removing' | 'absent' | 'restoring';

/** @deprecated Temporary Bastion scheduler contract; see file header. */
export type BastionAvailabilityResult = 'succeeded' | 'skipped' | 'blocked' | 'failed' | 'pending';

/** @deprecated Temporary Bastion scheduler contract; see file header. */
export type BastionAvailabilityReasonCode =
  | 'feature-disabled'
  | 'resource-not-found'
  | 'unsupported-profile'
  | 'unsupported-region'
  | 'missing-permission'
  | 'permission-unknown'
  | 'management-lock'
  | 'active-sessions'
  | 'session-state-unknown'
  | 'snapshot-failed'
  | 'active-snapshot-missing'
  | 'source-drift'
  | 'dependency-missing'
  | 'dependency-drift'
  | 'stale-run'
  | 'continuation-overdue'
  | 'azure-operation-failed'
  | 'restore-timeout';

/** @deprecated Temporary Bastion scheduler contract; see file header. */
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

/** @deprecated Temporary Bastion scheduler contract; see file header. */
export interface BastionPauseResponse {
  status: 'paused' | 'pause-pending';
  resourceId: string;
  controlGeneration: number;
  requestedAtUtc: string;
}

/** @deprecated Temporary Bastion scheduler contract; see file header. */
export interface BastionRestoreNowResponse {
  accepted: boolean;
  scheduleRunId: string;
  resourceId: string;
  requestedAtUtc: string;
}
