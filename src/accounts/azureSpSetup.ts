export type AzureSpSetupPhase =
  | 'created'
  | 'authorizing'
  | 'authorized'
  | 'tenantSelectionRequired'
  | 'planning'
  | 'readyToExecute'
  | 'dispatchPending'
  | 'queued'
  | 'executing'
  | 'retrying'
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
  | 'management_group_authority_missing'
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
  | 'setup_dispatch_failed'
  | 'setup_execution_stalled'
  | 'setup_state_conflict'
  | 'setup_retry_exhausted'
  | 'target_cloud_account_conflict'
  | 'target_cloud_account_identity_mismatch'
  | 'reauthorization_required'
  | 'cost_management_visibility_unavailable'
  | 'unknown';

export type AzureSpPermissionRequirement = 'required' | 'recommended' | 'optional';
export type AzureSpPermissionStatus =
  | 'notStarted'
  | 'running'
  | 'retrying'
  | 'succeeded'
  | 'needsAdminAction'
  | 'failed'
  | 'skipped'
  | 'alreadyExists';
export type AzureSpPermissionCapabilityStatus = 'unknown' | 'likelyAllowed' | 'likelyMissing';
export type AzureSpPermissionFailureBehavior = 'blockSetup' | 'completePartial' | 'warnOnly';
export type AzureSpSetupPermissionCapabilityGroupKey =
  | 'baselineResourceInventory'
  | 'monitoringLogs'
  | 'costBillingExports'
  | 'governanceIdentity'
  | 'reservationsSavingsPlans'
  | 'optionalWriteActions';
export type AzureSpSetupPermissionCapabilityGroupStatus = AzureSpPermissionStatus | 'partial';
export type AzureSpSetupPermissionCapabilitySeverity = 'required' | 'recommended' | 'optionalAdvanced';
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
  | 'securityReader'
  | 'keyVaultReader'
  | 'rootManagementGroupReader'
  | 'managementGroupReader'
  | 'reservationsReader'
  | 'reservationsContributor'
  | 'savingsPlanReader'
  | 'graphApplicationReadAll'
  | 'graphRoleAssignmentScheduleReadDirectory'
  | 'graphRoleEligibilityScheduleReadDirectory'
  | 'graphRoleManagementReadDirectory'
  | 'graphGroupMemberReadAll'
  | 'graphUserReadAll'
  | 'graphAuditLogReadAll'
  | 'graphPolicyReadAll'
  | 'graphLicenseAssignmentReadAll'
  | 'billingScopeReader'
  | 'billingExportOperatorContributor'
  | 'costManagementProviderRegistration'
  | 'billingExportStorage'
  | 'billingExportContainer'
  | 'billingExportStorageBlobReader'
  | 'billingExportActualDaily'
  | 'billingExportAmortizedDaily'
  | 'billingExportActualBackfill'
  | 'billingExportAmortizedBackfill'
  | 'customWriteRoleDefinition'
  | 'customWriteRoleAssignment'
  | 'policyExemptionRoleDefinition'
  | 'policyExemptionRoleAssignment';

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
  | 'retrying'
  | 'skipped'
  | 'unavailable'
  | 'needsAdminAction'
  | 'failed';

export type AzureSpSetupDispatchStatus = 'none' | 'dispatchPending' | 'queued' | 'continuationPending' | 'continuationQueued';

export type AzureSpSetupExecutionOwner = 'apiLegacy' | 'cloudEngine';

export type AzureSpSetupProvisioningStatus = 'credentialPending' | 'permissionsPending' | 'ready' | 'partial' | 'needsAdminAction' | 'cancelled';

export type AzureSpSetupReaderReadiness = 'pending' | 'granted' | 'failed' | 'needsValidation';

export type AzureSpSetupCapabilityReadinessStatus = 'pending' | 'granted' | 'partial' | 'failed' | 'needsAdminAction' | 'notSelected';

export type AzureSpBillingExportMode = 'skip' | 'reuseExisting' | 'useExistingStorage' | 'createStorage';
export type AzureSpBillingExportScopeType =
  | 'subscription'
  | 'managementGroup'
  | 'billingAccount'
  | 'billingProfile'
  | 'invoiceSection'
  | 'department'
  | 'enrollmentAccount'
  | 'partnerCustomer';
export type AzureSpBillingExportDataset = 'ActualCost' | 'AmortizedCost' | 'Usage';
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

export type AzureSpBillingExportTargetKeyList = [string, ...string[]];

/** Maximum subscriptions accepted by one assisted Azure setup execution. */
export const AZURE_SP_SETUP_MAX_SELECTED_SUBSCRIPTIONS = 100 as const;

export interface AzureSpBillingExportCreateStorage {
  conventionVersion?: 1;
  subscriptionId: string;
  resourceGroupName: string;
  location: string;
  storageAccountName: string;
  containerName: string;
}

export interface AzureSpBillingExportSkipSelection {
  enabled: false;
  mode: 'skip';
}

export interface AzureSpBillingExportReuseSelection {
  enabled: true;
  mode: 'reuseExisting';
  reuseTargetKeys: AzureSpBillingExportTargetKeyList;
}

export interface AzureSpBillingExportUseExistingStorageSelection {
  enabled: true;
  mode: 'useExistingStorage';
  reuseTargetKeys?: string[];
  createTargetKeys: AzureSpBillingExportTargetKeyList;
  /** Broad-scope create targets explicitly approved by the operator; must be a subset of createTargetKeys. */
  broadCreateTargetKeys?: string[];
  storageAccountResourceId: string;
  containerName: string;
}

export interface AzureSpBillingExportCreateStorageSelection {
  enabled: true;
  mode: 'createStorage';
  reuseTargetKeys?: string[];
  createTargetKeys: AzureSpBillingExportTargetKeyList;
  /** Broad-scope create targets explicitly approved by the operator; must be a subset of createTargetKeys. */
  broadCreateTargetKeys?: string[];
  createStorage: AzureSpBillingExportCreateStorage;
}

/** Mutually exclusive billing-export selection submitted by the portal. */
export type AzureSpBillingExportSelection =
  | AzureSpBillingExportSkipSelection
  | AzureSpBillingExportReuseSelection
  | AzureSpBillingExportUseExistingStorageSelection
  | AzureSpBillingExportCreateStorageSelection;

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

export interface AzureSpSetupCapabilityReadiness {
  capabilityGroupKey: AzureSpSetupPermissionCapabilityGroupKey;
  status: AzureSpSetupCapabilityReadinessStatus;
  selectedPermissionInstanceKeys: string[];
  operationResults: AzureSpSetupOperationResult[];
  verifiedAt?: string;
  errorCode?: AzureSpSetupErrorCode;
}

export interface AzureSpSetupSubscriptionReadiness {
  subscriptionId: string;
  readerReadiness: AzureSpSetupReaderReadiness;
  setupId?: string;
  executionId?: string;
  verifiedAt?: string;
  errorCode?: AzureSpSetupErrorCode;
  operationResults?: AzureSpSetupOperationResult[];
}

export interface AzureSpSetupAccountReadiness {
  provisioningStatus: AzureSpSetupProvisioningStatus;
  setupId?: string;
  executionId?: string;
  readinessVersion?: string;
  permissionManifestVersion?: string;
  result?: AzureSpSetupResult;
  capabilityReadiness: Partial<Record<AzureSpSetupPermissionCapabilityGroupKey, AzureSpSetupCapabilityReadinessStatus>>;
  subscriptionReadiness: AzureSpSetupSubscriptionReadiness[];
  lastAttemptedAt?: string;
  verifiedAt?: string;
  errorCode?: AzureSpSetupErrorCode;
}

export interface AzureSpSetupCloudAccountSummaryV1 {
  schemaVersion: 1;
  setupId: string;
  executionId: string;
  mode: AzureSpSetupMode;
  permissionManifestVersion: string;
  result: AzureSpSetupResult;
  startedAt: string;
  completedAt?: string;
  selectedSubscriptionIds: string[];
  selectedPermissionInstanceKeys: string[];
  operationResults: AzureSpSetupOperationResult[];
  capabilityReadiness: Partial<Record<AzureSpSetupPermissionCapabilityGroupKey, AzureSpSetupCapabilityReadinessStatus>>;
  subscriptionReadiness: AzureSpSetupSubscriptionReadiness[];
}

export interface AzureSpSetupExecutionRequestPriorOutcomeV1 {
  permissionManifestVersion?: string;
  result?: AzureSpSetupResult;
  capabilityReadiness?: Partial<Record<AzureSpSetupPermissionCapabilityGroupKey, AzureSpSetupCapabilityReadinessStatus>>;
  subscriptionReadiness?: AzureSpSetupSubscriptionReadiness[];
}

export interface AzureSpSetupExecutionRequestV1 {
  schemaVersion: 1;
  setupId: string;
  executionId: string;
  executionAttempt: number;
  mode: AzureSpSetupMode;
  companyId: string;
  tenantId: string;
  initiatedByUserId: string;
  authorizationCorrelationId: string;
  createdAt: string;
  selectedSubscriptionIds: string[];
  selectedPermissionInstanceKeys: string[];
  billingExportPlan?: AzureSpBillingExportExecutionPlan;
  cloudAccountName?: string;
  groupNames?: string[];
  readBitmask?: number;
  writeBitmask?: number;
  targetCloudAccountId?: string;
  targetAzureApplicationAppId?: string;
  targetAzureApplicationObjectId?: string;
  targetAzureServicePrincipalObjectId?: string;
  targetReadinessVersion?: string;
  targetSummaryBaselineVersion?: string;
  targetCredentialBaselineHash?: string;
  selectedExistingSubscriptionIds?: string[];
  selectedNewSubscriptionIds?: string[];
  priorOutcomeBaseline?: AzureSpSetupExecutionRequestPriorOutcomeV1;
  requestedRefreshComponents?: string[];
  snapshotHash: string;
}

export interface AzureSpSetupTargetConflictDetails {
  errorCode: 'target_cloud_account_conflict';
  activeSetupId: string;
  activeExecutionId?: string;
  targetCloudAccountId: string;
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

export interface AzureSpSetupPermissionCapabilityCounts {
  total: number;
  selectedByDefault: number;
  selectedForExecution: number;
  succeeded: number;
  alreadyExists: number;
  failed: number;
  skipped: number;
  notStarted: number;
  running: number;
  needsAdminAction: number;
  retrying: number;
}

export interface AzureSpSetupPermissionCapabilitySummary {
  key: AzureSpSetupPermissionCapabilityGroupKey;
  displayName: string;
  description: string;
  requirement: AzureSpPermissionRequirement;
  severity: AzureSpSetupPermissionCapabilitySeverity;
  selectedByDefault: boolean;
  selectedForExecution: boolean;
  status: AzureSpSetupPermissionCapabilityGroupStatus;
  benefit: string;
  skippedImpact: string;
  permissionInstanceKeys: string[];
  selectedPermissionInstanceKeys: string[];
  counts: AzureSpSetupPermissionCapabilityCounts;
}

export interface AzureSpSetupPermissionSummary {
  posture: 'recommendedReadOnly';
  title: string;
  description: string;
  mode: AzureSpSetupMode;
  modeLabel: string;
  modeDescription: string;
  recommendedReadOnlyByDefault: true;
  optionalWriteSelectedByDefault: boolean;
  totalPermissionCount: number;
  selectedByDefaultCount: number;
  selectedForExecutionCount: number;
  optionalWritePermissionCount: number;
  capabilityGroups: AzureSpSetupPermissionCapabilitySummary[];
}

export interface AzureSpBillingExportStorageOption {
  storageAccountResourceId: string;
  subscriptionId: string;
  resourceGroupName: string;
  storageAccountName: string;
  location?: string;
  isFromCompatibleExistingExport: boolean;
  containerName?: string;
  ownershipStatus?: 'owned' | 'exportReferenced';
  discoverySource?: 'deterministicName' | 'ownershipTags' | 'compatibleExport';
}

export interface AzureSpBillingExportStorageRecommendation {
  subscriptionId: string;
  resourceGroupName: string;
  storageAccountName: string;
  location: string;
  availableLocations: string[];
  existingStorageAccountResourceId?: string;
}

/** Versioned storage identity shared by assisted and manual Azure onboarding. */
export const AZURE_SP_BILLING_STORAGE_CONVENTION_V1 = {
  version: 1,
  namePrefix: 'billingexports',
  candidateCount: 20,
  defaultLocation: 'australiaeast',
  purposeTagName: 'SpottoPurpose',
  purposeTagValue: 'BillingExports',
  tenantTagName: 'SpottoTenantId',
  aliasTagName: 'spotto',
  aliasTagValue: 'billing-exports',
} as const;

export interface AzureSpBillingExportDetectedExport {
  scopeType: AzureSpBillingExportScopeType;
  scope: string;
  subscriptionId?: string;
  exportScopeLabel?: string;
  requiresBillingScopeReader?: boolean;
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

export interface AzureSpBillingExportTargetBase {
  targetKey: string;
  action: 'create' | 'reuseExisting';
  scope: string;
  scopeLabel?: string;
  exportName: string;
  selectedByDefault: boolean;
  requiredForCompleteness: boolean;
}

export interface AzureSpBillingExportReuseTarget extends AzureSpBillingExportTargetBase {
  action: 'reuseExisting';
  scopeType: AzureSpBillingExportScopeType;
  subscriptionId?: string;
  dataset: AzureSpBillingExportDataset;
  effectiveDefinitionType: AzureSpBillingExportEffectiveDefinitionType;
  exportResourceId: string;
  storageAccountResourceId: string;
  containerName: string;
  rootFolderPath?: string;
}

export interface AzureSpBillingExportSubscriptionCreateTarget extends AzureSpBillingExportTargetBase {
  action: 'create';
  scopeType: 'subscription';
  subscriptionId: string;
  dataset: 'ActualCost' | 'AmortizedCost';
}

export interface AzureSpBillingExportManagementGroupCreateTarget extends AzureSpBillingExportTargetBase {
  action: 'create';
  scopeType: 'managementGroup';
  managementGroupId: string;
  dataset: 'Usage';
}

export interface AzureSpBillingExportHierarchyCreateTarget extends AzureSpBillingExportTargetBase {
  action: 'create';
  scopeType: 'billingAccount' | 'billingProfile' | 'invoiceSection';
  dataset: 'ActualCost' | 'AmortizedCost';
}

export type AzureSpBillingExportCreateTarget =
  | AzureSpBillingExportSubscriptionCreateTarget
  | AzureSpBillingExportManagementGroupCreateTarget
  | AzureSpBillingExportHierarchyCreateTarget;

export type AzureSpBillingExportTarget = AzureSpBillingExportReuseTarget | AzureSpBillingExportCreateTarget;

export interface AzureSpBillingExportDiscoveryWarning {
  code: 'discoveryUnavailable' | 'resultTruncated';
  message: string;
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
  storageRecommendations?: AzureSpBillingExportStorageRecommendation[];
  discoveryComplete: boolean;
  discoveryWarnings: AzureSpBillingExportDiscoveryWarning[];
  targets: AzureSpBillingExportTarget[];
  selection: AzureSpBillingExportSelection;
}

/** Immutable, resolved billing-export work stored in the execution snapshot. */
export type AzureSpBillingExportExecutionPlan = Pick<AzureSpBillingExportPlan, 'selection' | 'targets'>;

export interface AzureSpBillingExportResult {
  targetKey: string;
  scopeType: AzureSpBillingExportScopeType;
  scope: string;
  subscriptionId?: string;
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
  permissionSummary?: AzureSpSetupPermissionSummary;
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
  dispatchStatus?: AzureSpSetupDispatchStatus;
  dispatchSequence?: number;
  queuedAt?: string;
  retryAfterAt?: string;
  lastHeartbeatAt?: string;
  executionOwner?: AzureSpSetupExecutionOwner;
  cancellationRequestedAt?: string;
  canCancel?: boolean;
  canResume?: boolean;
  canRepair?: boolean;
  requiresReauthorization?: boolean;
  accountReadiness?: AzureSpSetupAccountReadiness;
  subscriptionReadiness?: AzureSpSetupSubscriptionReadiness[];
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
  billingExports?: AzureSpBillingExportSelection;
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

/** Status returned after cancellation is requested; active work settles asynchronously. */
export type AzureSpSetupCancelResponse = AzureSpSetupStatusResponse;
