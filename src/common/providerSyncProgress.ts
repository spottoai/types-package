import { ProviderName, ProviderScopeType } from './provider';
import type { SyncProgressIssue, SyncProgressStatus, SyncProgressStepStatus, SyncProgressSubStepStatus } from './syncProgress';

/** Sanitized failure information safe to return through a public API. */
export interface ProviderSyncProgressFailure {
  code?: string;
  message: string;
  retryable?: boolean;
  remediation?: string;
}

/**
 * Engine-owned sync identifiers and raw failure details must not cross the
 * public provider-sync progress boundary.
 */
export interface ProviderSyncProgressForbiddenInternalFields {
  requestId?: never;
  targetKey?: never;
  childRequestIds?: never;
  completedChildRequestIds?: never;
  failureReason?: never;
}

/** Public checkpoint or nested work item owned by one provider sync stage. */
export interface ProviderSyncSubStepProgress extends ProviderSyncProgressForbiddenInternalFields {
  id: string;
  label?: string;
  status: SyncProgressSubStepStatus;
  attempts?: number;
  lastUpdated?: string;
  completedAt?: string;
  note?: string;
  issue?: SyncProgressIssue;
  failure?: ProviderSyncProgressFailure;
}

/** Public progress for one provider-owned stage. */
export interface ProviderSyncStageProgress extends ProviderSyncProgressForbiddenInternalFields {
  id: string;
  label: string;
  order: number;
  status: SyncProgressStepStatus;
  statusLabel?: string;
  attempts?: number;
  active?: boolean;
  note?: string;
  expectedWorkItemCount?: number;
  completedWorkItemCount?: number;
  startedAt?: string;
  updatedAt?: string;
  completedAt?: string;
  issue?: SyncProgressIssue;
  failure?: ProviderSyncProgressFailure;
  subSteps?: ProviderSyncSubStepProgress[];
}

/** Aggregate counts for the stages selected for one provider sync run. */
export interface ProviderSyncProgressSummary {
  totalStages: number;
  completedStages: number;
  failedStages: number;
  activeStages: number;
  issueStages?: number;
}

interface ProviderSyncProgressBase extends ProviderSyncProgressForbiddenInternalFields {
  cloudAccountId: string;
  runId?: string;
  overallStatus: SyncProgressStatus;
  statusLabel: string;
  hasIssues?: boolean;
  currentStageId?: string;
  requestedAt?: string;
  startedAt?: string;
  updatedAt?: string;
  completedAt?: string;
  lastSuccessfulSyncAt?: string;
  summary: ProviderSyncProgressSummary;
  stages: ProviderSyncStageProgress[];
  failure?: ProviderSyncProgressFailure;
}

/** Public sync progress for an Azure subscription provider scope. */
export interface AzureProviderSyncProgress extends ProviderSyncProgressBase {
  providerName: ProviderName.Azure;
  providerScopeId: string;
  scopeType: ProviderScopeType.Subscription;
}

/** Public sync progress for an AWS account provider scope. */
export interface AwsProviderSyncProgress extends ProviderSyncProgressBase {
  providerName: ProviderName.Aws;
  providerScopeId: string;
  scopeType: ProviderScopeType.Account;
}

/** Provider-neutral public sync progress returned by API provider strategies. */
export type ProviderSyncProgress = AzureProviderSyncProgress | AwsProviderSyncProgress;
