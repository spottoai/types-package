import type {
  AzureSpBillingExportPlan,
  AzureSpBillingExportResult,
  AzureSpSetupAccountReadiness,
  AzureSpSetupDispatchStatus,
  AzureSpSetupErrorCode,
  AzureSpSetupExecutionOwner,
  AzureSpSetupExecutionRequestV1,
  AzureSpSetupMode,
  AzureSpSetupOperationResult,
  AzureSpSetupPermissionPlanItem,
  AzureSpSetupPhase,
  AzureSpSetupProgressStep,
  AzureSpSetupResult,
  AzureSpSetupSubscriptionOption,
  AzureSpSetupSubscriptionReadiness,
  AzureSpSetupTenant,
} from './azureSpSetup';

export interface AzureSpSetupManagementGroupOption {
  managementGroupId: string;
  displayName: string;
  scope: string;
}

export type AzureSpSetupRetryCategory = 'throttling' | 'transient' | 'propagation' | 'reauthorization' | 'stateConflict' | 'unknown';

export type AzureSpSetupTargetedRefreshStatus = 'none' | 'pending' | 'queued' | 'completed' | 'failed';

export interface AzureSpSetupTargetedRefreshCheckpoint {
  subscriptionId?: string;
  refreshKind: string;
  idempotencyKey: string;
  status: AzureSpSetupTargetedRefreshStatus;
  pendingAt?: string;
  queuedAt?: string;
  completedAt?: string;
  errorCode?: AzureSpSetupErrorCode;
}

/**
 * Authoritative version-1 setup persistence shared by the API and cloud-engine.
 * @internal protected persistence — never return or log this shape as a public DTO.
 */
export interface AzureSpSetupDurableStateV1 {
  schemaVersion: 1;
  stateRevision: number;
  setupId: string;
  mode: AzureSpSetupMode;
  companyId: string;
  initiatedByUserId: string;
  initiatedByEmail?: string;
  phase: AzureSpSetupPhase;
  result: AzureSpSetupResult;
  codeVerifier: string;
  nonce: string;
  redirectAfter?: string;
  selectedTenantId?: string;
  /** @internal protected persistence */
  encryptedMicrosoftTokenCache?: string;
  microsoftTokenCacheTenantId?: string;
  microsoftTokenCacheUpdatedAt?: string;
  targetCloudAccountId?: string;
  targetCloudAccountName?: string;
  targetAzureApplicationAppId?: string;
  targetAzureServicePrincipalObjectId?: string;
  azureApplicationObjectId?: string;
  azureApplicationAppId?: string;
  azureServicePrincipalObjectId?: string;
  /** @internal protected persistence */
  generatedClientSecretEncrypted?: string;
  generatedClientSecretKeyId?: string;
  generatedClientSecretExpiresAt?: string;
  permissionManifestVersion: string;
  targetPermissionManifestVersion?: string;
  discoveredTenants?: AzureSpSetupTenant[];
  selectedSubscriptionIds?: string[];
  subscriptions?: AzureSpSetupSubscriptionOption[];
  managementGroups?: AzureSpSetupManagementGroupOption[];
  permissionPlan?: AzureSpSetupPermissionPlanItem[];
  billingExportPlan?: AzureSpBillingExportPlan;
  billingExportResults?: AzureSpBillingExportResult[];
  billingExportBackfillMarkers?: string[];
  operationResults?: AzureSpSetupOperationResult[];
  progress?: AzureSpSetupProgressStep[];
  selectedPermissionInstanceKeys?: string[];
  resultCloudAccountId?: string;
  resultCloudAccountName?: string;
  errorCode?: AzureSpSetupErrorCode;
  errorMessage?: string;
  authorizationCodeReceivedAt?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  completedAt?: string;
  cancelledAt?: string;
  executionId?: string;
  executionAttempt?: number;
  leaseOwner?: string;
  leaseExpiresAt?: string;
  lastHeartbeatAt?: string;
  /** @internal storage-adapter metadata */
  stateBlobPath?: string;
  stateBlobUpdatedAt?: string;
  previousStateRevision?: number;
  /** @internal storage-adapter metadata */
  stateBlobETag?: string;
  executionRequest?: AzureSpSetupExecutionRequestV1;
  executionRequestHash?: string;
  executionOwner?: AzureSpSetupExecutionOwner;
  dispatchStatus?: AzureSpSetupDispatchStatus;
  dispatchSequence?: number;
  dispatchMessageId?: string;
  dispatchPendingAt?: string;
  dispatchAcknowledgedAt?: string;
  dispatchAttemptCount?: number;
  dispatchNextAttemptAt?: string;
  dispatchLastErrorCode?: AzureSpSetupErrorCode;
  cancellationRequestedAt?: string;
  currentCheckpoint?: string;
  retryCategory?: AzureSpSetupRetryCategory;
  retryCount?: number;
  retryAfterAt?: string;
  nextDispatchSequence?: number;
  continuationMessageId?: string;
  continuationPendingAt?: string;
  continuationQueuedAt?: string;
  accountReadiness?: AzureSpSetupAccountReadiness;
  subscriptionReadiness?: AzureSpSetupSubscriptionReadiness[];
  targetReadinessVersion?: string;
  targetSummaryBaselineVersion?: string;
  targetClaimId?: string;
  targetClaimOwner?: string;
  targetClaimExpiresAt?: string;
  targetedRefreshCheckpoints?: AzureSpSetupTargetedRefreshCheckpoint[];
}
