export type AzureSpSetupPhase =
  | 'created'
  | 'authorizing'
  | 'authorized'
  | 'tenantSelectionRequired'
  | 'planning'
  | 'readyToExecute'
  | 'executing'
  | 'completed'
  | 'needsAdminAction'
  | 'failed'
  | 'cancelled'
  | 'expired';

export type AzureSpSetupResult = 'none' | 'complete' | 'partial' | 'needsAdminAction' | 'failed' | 'cancelled' | 'expired';

export type AzureSpSetupMode = 'createCloudAccount' | 'grantAdditionalPermissions';

export type AzureSpSetupErrorCode =
  | 'access_denied'
  | 'duplicate_tenant'
  | 'target_cloud_account_required'
  | 'target_cloud_account_not_found'
  | 'target_cloud_account_tenant_mismatch'
  | 'target_cloud_account_not_service_principal'
  | 'insufficient_entra_permission'
  | 'insufficient_rbac_permission'
  | 'tenant_selection_required'
  | 'no_readable_subscription_selected'
  | 'subscription_reader_assignment_failed'
  | 'service_principal_validation_failed'
  | 'graph_admin_consent_failed'
  | 'billing_export_storage_failed'
  | 'billing_export_failed'
  | 'billing_export_unavailable'
  | 'provider_registration_failed'
  | 'optional_assignment_failed'
  | 'setup_expired'
  | 'setup_cancelled'
  | 'azure_propagation_pending'
  | 'unknown';

export type AzureSpPermissionRequirement = 'required' | 'recommended' | 'optional';
export type AzureSpPermissionStatus = 'notStarted' | 'running' | 'succeeded' | 'failed' | 'skipped' | 'alreadyExists';
export type AzureSpPermissionCapabilityStatus = 'unknown' | 'likelyAllowed' | 'likelyMissing';
export type AzureSpPermissionFailureBehavior = 'blockSetup' | 'completePartial' | 'warnOnly';
export type AzureSpPermissionScopeKind =
  | 'tenant'
  | 'application'
  | 'servicePrincipal'
  | 'subscription'
  | 'tenantRoot'
  | 'managementGroup'
  | 'provider'
  | 'storageAccount'
  | 'storageContainer'
  | 'costManagementExport';

export type AzureSpPermissionKey =
  | 'entraApplication'
  | 'entraServicePrincipal'
  | 'entraClientSecret'
  | 'subscriptionReader'
  | 'tenantRootReader'
  | 'monitoringReader'
  | 'logAnalyticsReader'
  | 'rootManagementGroupReader'
  | 'managementGroupReader'
  | 'reservationsReader'
  | 'savingsPlanReader'
  | 'graphApplicationReadAll'
  | 'costManagementProviderRegistration'
  | 'billingExportStorage'
  | 'billingExportContainer'
  | 'billingExportStorageBlobReader'
  | 'billingExportActualDaily'
  | 'billingExportAmortizedDaily'
  | 'billingExportActualBackfill'
  | 'billingExportAmortizedBackfill'
  | 'customWriteRoleDefinition'
  | 'customWriteRoleAssignment';

export type AzureSpOperationKind =
  | 'discoverApplication'
  | 'createApplication'
  | 'discoverServicePrincipal'
  | 'createServicePrincipal'
  | 'createClientSecret'
  | 'assignAzureRole'
  | 'grantGraphAppRole'
  | 'registerProvider'
  | 'prepareStorage'
  | 'prepareContainer'
  | 'createOrUpdateCostExport'
  | 'queueCostExportRun'
  | 'createOrUpdateCustomRole'
  | 'validateServicePrincipal'
  | 'queueFirstSync';

export type AzureSpOperationPlannedAction = 'none' | 'create' | 'update' | 'grant' | 'queue' | 'skip';
export type AzureSpOperationCurrentState = 'missing' | 'alreadyExists' | 'unavailable' | 'unknown';
export type AzureSpOperationResultStatus =
  | 'notStarted'
  | 'running'
  | 'alreadyExists'
  | 'created'
  | 'updated'
  | 'granted'
  | 'queued'
  | 'skipped'
  | 'unavailable'
  | 'failed';

export type AzureSpBillingExportMode = 'skip' | 'reuseExisting' | 'useExistingStorage' | 'createStorage';
export type AzureSpBillingExportDataset = 'ActualCost' | 'AmortizedCost';
export type AzureSpBillingExportEffectiveDefinitionType = 'ActualCost' | 'Usage' | 'AmortizedCost';
export type AzureSpBillingExportResultStatus =
  | 'notStarted'
  | 'existing'
  | 'created'
  | 'updated'
  | 'createdRunQueued'
  | 'queued'
  | 'requeued'
  | 'failed'
  | 'unavailable'
  | 'skipped';

export interface AzureSpSetupStartRequest {
  redirectAfter?: string;
  mode?: AzureSpSetupMode;
  targetCloudAccountId?: string;
}

export interface AzureSpSetupStartResponse {
  setupId: string;
  authorizationUrl: string;
  expiresAt: string;
}

export interface AzureSpSetupTenant {
  tenantId: string;
  displayName?: string;
  label: string;
  isAlreadyConnected: boolean;
  connectedCloudAccountId?: string;
  requiresTenantAuthorization: boolean;
}

export interface AzureSpSetupSubscriptionOption {
  subscriptionId: string;
  displayName: string;
  tenantId: string;
  state?: string;
  isVisible: boolean;
  isReadableCandidate: boolean;
  isSelectedByDefault: boolean;
  warningCode?: string;
  warningMessage?: string;
}

export interface AzureSpPermissionManifestItem {
  key: AzureSpPermissionKey;
  requirement: AzureSpPermissionRequirement;
  displayName: string;
  userFacingLabel: string;
  description: string;
  scopeKind: AzureSpPermissionScopeKind;
  defaultSelected: boolean;
  userDeselectable: boolean;
  requiredPrivilege: string;
  detectOperation: AzureSpOperationKind;
  applyOperation: AzureSpOperationKind;
  failureBehavior: AzureSpPermissionFailureBehavior;
}

export interface AzureSpSetupPermissionPlanItem {
  key: AzureSpPermissionKey;
  instanceKey: string;
  requirement: AzureSpPermissionRequirement;
  scopeKind: AzureSpPermissionScopeKind;
  displayName: string;
  userFacingLabel: string;
  description: string;
  scope: string;
  externalResourceId?: string;
  idempotencyKey: string;
  roleDefinitionName?: string;
  requiredPrivilege: string;
  selectedByDefault: boolean;
  isDeselectable: boolean;
  capabilityStatus: AzureSpPermissionCapabilityStatus;
  capabilityReason?: string;
  currentState: AzureSpOperationCurrentState;
  plannedAction: AzureSpOperationPlannedAction;
  detectOperation: AzureSpOperationKind;
  applyOperation: AzureSpOperationKind;
  failureBehavior: AzureSpPermissionFailureBehavior;
  status: AzureSpPermissionStatus;
  errorCode?: AzureSpSetupErrorCode;
  message?: string;
}

export interface AzureSpSetupOperationResult {
  operationKey: string;
  permissionKey?: AzureSpPermissionKey;
  instanceKey?: string;
  operationKind: AzureSpOperationKind;
  idempotencyKey: string;
  externalResourceId?: string;
  status: AzureSpOperationResultStatus;
  safeMessage?: string;
  errorCode?: AzureSpSetupErrorCode;
  startedAt?: string;
  completedAt?: string;
}

export interface AzureSpSetupProgressStep {
  key:
    | 'microsoftAuthorization'
    | 'tenantSelection'
    | 'servicePrincipal'
    | 'credential'
    | 'readerAccess'
    | 'optionalPermissions'
    | 'billingExports'
    | 'spottoValidation'
    | 'cloudAccountSaved'
    | 'firstSyncQueued';
  status: AzureSpPermissionStatus;
  message?: string;
}

export interface AzureSpBillingExportStorageOption {
  storageAccountResourceId: string;
  subscriptionId: string;
  resourceGroupName: string;
  storageAccountName: string;
  location?: string;
  isFromCompatibleExistingExport: boolean;
  containerName?: string;
}

export interface AzureSpBillingExportDetectedExport {
  subscriptionId: string;
  dataset: AzureSpBillingExportDataset;
  effectiveDefinitionType?: AzureSpBillingExportEffectiveDefinitionType;
  exportName: string;
  exportResourceId: string;
  storageAccountResourceId: string;
  containerName: string;
  rootFolderPath?: string;
  isCompatible: boolean;
  isActiveDaily?: boolean;
  canBeReused?: boolean;
}

export interface AzureSpBillingExportPlan {
  enabledByDefault: boolean;
  selectedByDefault: boolean;
  defaultContainerName: 'spotto-cost-exports';
  defaultRootFolderPath: 'spotto';
  defaultResourceGroupName: 'rg-spotto-cost-exports';
  defaultLocation: 'australiaeast';
  detectedCompatibleExports: AzureSpBillingExportDetectedExport[];
  storageOptions: AzureSpBillingExportStorageOption[];
  selectedMode?: AzureSpBillingExportMode;
  selectedReuseDetectedExportResourceIds?: string[];
  selectedStorageAccountResourceId?: string;
  selectedContainerName?: string;
  createStorage?: {
    subscriptionId: string;
    resourceGroupName: string;
    location: string;
    storageAccountName: string;
    containerName: string;
  };
}

export interface AzureSpBillingExportResult {
  subscriptionId: string;
  dataset?: AzureSpBillingExportDataset;
  effectiveDefinitionType?: AzureSpBillingExportEffectiveDefinitionType;
  exportKind: 'recurring' | 'backfill' | 'storage' | 'providerRegistration';
  exportName?: string;
  exportResourceId?: string;
  periodName?: string;
  status: AzureSpBillingExportResultStatus;
  storageAccountResourceId?: string;
  containerName?: string;
  rootFolderPath?: string;
  errorCode?: AzureSpSetupErrorCode;
  message?: string;
}

export interface AzureSpSetupStatusResponse {
  setupId: string;
  companyId: string;
  mode: AzureSpSetupMode;
  phase: AzureSpSetupPhase;
  result: AzureSpSetupResult;
  selectedTenantId?: string;
  targetCloudAccountId?: string;
  targetCloudAccountName?: string;
  targetAzureApplicationAppId?: string;
  permissionManifestVersion?: string;
  targetPermissionManifestVersion?: string;
  tenants?: AzureSpSetupTenant[];
  subscriptions?: AzureSpSetupSubscriptionOption[];
  permissionPlan?: AzureSpSetupPermissionPlanItem[];
  billingExportPlan?: AzureSpBillingExportPlan;
  billingExportResults?: AzureSpBillingExportResult[];
  operationResults?: AzureSpSetupOperationResult[];
  progress?: AzureSpSetupProgressStep[];
  resultCloudAccountId?: string;
  resultCloudAccountName?: string;
  errorCode?: AzureSpSetupErrorCode;
  errorMessage?: string;
  expiresAt: string;
  canRetry: boolean;
  canExecute: boolean;
  executionId?: string;
  executionAttempt?: number;
  leaseExpiresAt?: string;
}

export interface AzureSpSetupSelectTenantRequest {
  tenantId: string;
}

export interface AzureSpSetupSelectTenantResponse extends AzureSpSetupStatusResponse {
  selectedTenantId: string;
  authorizationUrl?: string;
}

export interface AzureSpSetupAuthorizeTenantResponse {
  setupId: string;
  authorizationUrl: string;
  expiresAt: string;
}

export interface AzureSpSetupPlanRequest {
  subscriptionIds: string[];
  selectedPermissionInstanceKeys?: string[];
  useTenantRootReader?: boolean;
  billingExports?: {
    enabled: boolean;
    mode?: AzureSpBillingExportMode;
    reuseDetectedExportResourceIds?: string[];
    storageAccountResourceId?: string;
    createStorage?: {
      subscriptionId: string;
      resourceGroupName: string;
      location: string;
      storageAccountName: string;
      containerName: string;
    };
    containerName?: string;
  };
}

export interface AzureSpSetupPlanResponse extends AzureSpSetupStatusResponse {
  phase: 'readyToExecute';
  permissionPlan: AzureSpSetupPermissionPlanItem[];
  subscriptions: AzureSpSetupSubscriptionOption[];
}

export interface AzureSpSetupExecuteRequest {
  subscriptionIds: string[];
  selectedPermissionInstanceKeys: string[];
  billingExports?: AzureSpSetupPlanRequest['billingExports'];
  cloudAccountName?: string;
  groupNames?: string[];
  readBitmask?: number;
  writeBitmask?: number;
}

export type AzureSpSetupExecuteResponse = AzureSpSetupStatusResponse;

export interface AzureSpSetupExecuteSuccessResponse extends AzureSpSetupStatusResponse {
  phase: 'completed';
  result: 'complete' | 'partial';
  resultCloudAccountId: string;
}

export interface AzureSpSetupCancelResponse extends AzureSpSetupStatusResponse {
  phase: 'cancelled';
  result: 'cancelled';
}
