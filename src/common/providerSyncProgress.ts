import { ProviderName, ProviderScopeType } from './provider';
import type { SyncProgressStatus, SyncProgressStepStatus } from './syncProgress';

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

/** Public progress for one provider-owned stage. */
export interface ProviderSyncStageProgress extends ProviderSyncProgressForbiddenInternalFields {
  id: string;
  label: string;
  order: number;
  status: SyncProgressStepStatus;
  statusLabel?: string;
  expectedWorkItemCount?: number;
  completedWorkItemCount?: number;
  startedAt?: string;
  updatedAt?: string;
  completedAt?: string;
  failure?: ProviderSyncProgressFailure;
}

/** Aggregate counts for the stages selected for one provider sync run. */
export interface ProviderSyncProgressSummary {
  totalStages: number;
  completedStages: number;
  failedStages: number;
  activeStages: number;
}

interface ProviderSyncProgressBase extends ProviderSyncProgressForbiddenInternalFields {
  cloudAccountId: string;
  runId?: string;
  overallStatus: SyncProgressStatus;
  statusLabel: string;
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
