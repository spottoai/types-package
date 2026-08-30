import type {
  AzureSpBillingExportPlan,
  AzureSpBillingExportResult,
  AzureSpPermissionKey,
  AzureSpPermissionManifestItem,
  AzureSpSetupPermissionSummary,
  AzureSpSetupExecuteRequest,
  AzureSpSetupExecutionRequestV1,
  AzureSpSetupCloudAccountSummaryV1,
  AzureSpSetupCancelResponse,
  AzureSpSetupMode,
  AzureSpSetupOperationResult,
  AzureSpSetupPhase,
  AzureSpSetupPlanResponse,
  AzureSpSetupResult,
  AzureSpSetupStartRequest,
  AzureSpSetupStatusResponse,
} from './azureSpSetup';
import type { AzureSpSetupDurableStateV1 } from './azureSpSetupDurable';

const keyVaultReaderPermissionKey: AzureSpPermissionKey = 'keyVaultReader';

type AzureSpSetupForbiddenPublicKey =
  | 'accessToken'
  | 'refreshToken'
  | 'tokenCache'
  | 'encryptedMicrosoftTokenCache'
  | 'clientSecret'
  | 'generatedClientSecretEncrypted'
  | 'codeVerifier'
  | 'nonce'
  | 'stateBlobPath'
  | 'stateBlobETag'
  | 'sasUrl';

type DeepForbiddenPublicKeys<T> = T extends readonly (infer Item)[]
  ? DeepForbiddenPublicKeys<Item>
  : T extends object
    ? {
        [Key in keyof T]-?: Key extends AzureSpSetupForbiddenPublicKey ? Key : DeepForbiddenPublicKeys<T[Key]>;
      }[keyof T]
    : never;

type AssertNoForbiddenPublicKey<T> = DeepForbiddenPublicKeys<T> extends never ? true : never;

type AzureSpSetupProtectedDurableKey = 'retryAttemptsByOperation' | 'targetCredentialBaselineHash';

type DeepProtectedDurableKeys<T> = T extends readonly (infer Item)[]
  ? DeepProtectedDurableKeys<Item>
  : T extends object
    ? {
        [Key in keyof T]-?: Key extends AzureSpSetupProtectedDurableKey ? Key : DeepProtectedDurableKeys<T[Key]>;
      }[keyof T]
    : never;

type AssertNoProtectedDurableKey<T> = DeepProtectedDurableKeys<T> extends never ? true : never;

const statusHasNoForbiddenPublicKeys: AssertNoForbiddenPublicKey<AzureSpSetupStatusResponse> = true;
const summaryHasNoForbiddenPublicKeys: AssertNoForbiddenPublicKey<AzureSpSetupCloudAccountSummaryV1> = true;
const executionRequestHasNoForbiddenPublicKeys: AssertNoForbiddenPublicKey<AzureSpSetupExecutionRequestV1> = true;
const statusHasNoProtectedDurableKeys: AssertNoProtectedDurableKey<AzureSpSetupStatusResponse> = true;
const summaryHasNoProtectedDurableKeys: AssertNoProtectedDurableKey<AzureSpSetupCloudAccountSummaryV1> = true;

const createModeStartRequest: AzureSpSetupStartRequest = {
  redirectAfter: '/company/comp-123/cloud-accounts',
  mode: 'createCloudAccount',
};

const permissionUpdateStartRequest: AzureSpSetupStartRequest = {
  mode: 'grantAdditionalPermissions',
  targetCloudAccountId: 'client-id-123',
};

const setupMode: AzureSpSetupMode = 'grantAdditionalPermissions';

// @ts-expect-error setup mode must use the assisted-setup mode union.
const invalidSetupMode: AzureSpSetupMode = 'repair';

const subscriptionReaderManifestItem: AzureSpPermissionManifestItem = {
  key: 'subscriptionReader',
  requirement: 'required',
  displayName: 'Reader',
  userFacingLabel: 'Read subscription resources',
  description: 'Allows Spotto to read selected Azure subscriptions.',
  scopeKind: 'subscription',
  defaultSelected: true,
  userDeselectable: false,
  requiredPrivilege: 'Owner, User Access Administrator, or Role Based Access Control Administrator',
  detectOperation: 'assignAzureRole',
  applyOperation: 'assignAzureRole',
  failureBehavior: 'blockSetup',
};

const billingExportPlan: AzureSpBillingExportPlan = {
  enabledByDefault: true,
  selectedByDefault: true,
  defaultContainerName: 'spotto-cost-exports',
  defaultRootFolderPath: 'spotto',
  defaultResourceGroupName: 'rg-spotto-cost-exports',
  defaultLocation: 'australiaeast',
  detectedCompatibleExports: [
    {
      subscriptionId: 'sub-123',
      dataset: 'ActualCost',
      effectiveDefinitionType: 'Usage',
      exportName: 'existing-actual-export',
      exportResourceId: '/subscriptions/sub-123/providers/Microsoft.CostManagement/exports/existing-actual-export',
      storageAccountResourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/spottoexports',
      containerName: 'spotto-cost-exports',
      rootFolderPath: 'spotto/sub-123/actual/recurring',
      isCompatible: true,
      isActiveDaily: true,
      canBeReused: true,
    },
    {
      subscriptionId: 'sub-123',
      dataset: 'AmortizedCost',
      effectiveDefinitionType: 'AmortizedCost',
      exportName: 'existing-amortized-export',
      exportResourceId: '/subscriptions/sub-123/providers/Microsoft.CostManagement/exports/existing-amortized-export',
      storageAccountResourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/spottoexports',
      containerName: 'spotto-cost-exports',
      rootFolderPath: 'spotto/sub-123/amortized/recurring',
      isCompatible: true,
      isActiveDaily: true,
      canBeReused: true,
    },
  ],
  storageOptions: [
    {
      storageAccountResourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/spottoexports',
      subscriptionId: 'sub-123',
      resourceGroupName: 'rg',
      storageAccountName: 'spottoexports',
      location: 'australiaeast',
      isFromCompatibleExistingExport: true,
      containerName: 'spotto-cost-exports',
    },
  ],
  selectedMode: 'reuseExisting',
  selectedReuseDetectedExportResourceIds: [
    '/subscriptions/sub-123/providers/Microsoft.CostManagement/exports/existing-actual-export',
    '/subscriptions/sub-123/providers/Microsoft.CostManagement/exports/existing-amortized-export',
  ],
  selectedStorageAccountResourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/spottoexports',
  selectedContainerName: 'spotto-cost-exports',
};

const billingExportResults: AzureSpBillingExportResult[] = [
  {
    subscriptionId: 'sub-123',
    dataset: 'ActualCost',
    effectiveDefinitionType: 'Usage',
    exportKind: 'recurring',
    exportName: 'existing-actual-export',
    exportResourceId: '/subscriptions/sub-123/providers/Microsoft.CostManagement/exports/existing-actual-export',
    status: 'existing',
    storageAccountResourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/spottoexports',
    containerName: 'spotto-cost-exports',
    rootFolderPath: 'spotto/sub-123/actual/recurring',
    message: 'Existing compatible Usage export is reused for actual-cost data.',
  },
  {
    subscriptionId: 'sub-123',
    dataset: 'ActualCost',
    effectiveDefinitionType: 'Usage',
    exportKind: 'backfill',
    exportName: 'spotto-actual-backfill-202604',
    exportResourceId: '/subscriptions/sub-123/providers/Microsoft.CostManagement/exports/spotto-actual-backfill-202604',
    periodName: '202604',
    status: 'queued',
    storageAccountResourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/spottoexports',
    containerName: 'spotto-cost-exports',
    rootFolderPath: 'spotto/sub-123/actual/backfill/202604',
  },
  {
    subscriptionId: 'sub-123',
    dataset: 'ActualCost',
    effectiveDefinitionType: 'ActualCost',
    exportKind: 'recurring',
    exportName: 'spotto-actual-daily',
    exportResourceId: '/subscriptions/sub-123/providers/Microsoft.CostManagement/exports/spotto-actual-daily',
    status: 'createdRunQueued',
    storageAccountResourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/spottoexports',
    containerName: 'spotto-cost-exports',
    rootFolderPath: 'spotto/sub-123/actual/recurring',
  },
  {
    subscriptionId: 'sub-123',
    dataset: 'AmortizedCost',
    effectiveDefinitionType: 'AmortizedCost',
    exportKind: 'recurring',
    exportName: 'spotto-amortized-daily',
    status: 'unavailable',
    errorCode: 'billing_export_unavailable',
    message: 'Amortized exports are not available for this subscription agreement.',
  },
  {
    subscriptionId: 'sub-123',
    exportKind: 'storage',
    status: 'updated',
    storageAccountResourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/spottoexports',
    containerName: 'spotto-cost-exports',
    message: 'Storage Blob Data Reader grant and private container diagnostics are safe to return.',
  },
];

const graphOperationResult: AzureSpSetupOperationResult = {
  operationKey: 'graphApplicationReadAll:tenant-123',
  permissionKey: 'graphApplicationReadAll',
  instanceKey: 'graphApplicationReadAll:tenant-123',
  operationKind: 'grantGraphAppRole',
  idempotencyKey: 'tenant-123:client-id-123:graphApplicationReadAll',
  status: 'alreadyExists',
  externalResourceId: 'graph-sp-object-id:application-read-all-role-id',
  completedAt: '2026-05-11T00:00:00.000Z',
};

const graphAuditLogOperationResult: AzureSpSetupOperationResult = {
  operationKey: 'graphAuditLogReadAll:https://graph.microsoft.com/AuditLog.Read.All',
  permissionKey: 'graphAuditLogReadAll',
  instanceKey: 'graphAuditLogReadAll:https://graph.microsoft.com/AuditLog.Read.All',
  operationKind: 'grantGraphAppRole',
  idempotencyKey: 'tenant-123:graphAuditLogReadAll:https://graph.microsoft.com/AuditLog.Read.All',
  status: 'granted',
  externalResourceId: 'graph-sp-object-id:audit-log-read-all-role-id',
  completedAt: '2026-05-11T00:00:00.000Z',
};

const permissionSummary: AzureSpSetupPermissionSummary = {
  posture: 'recommendedReadOnly',
  title: 'Recommended read-only setup',
  description: 'Spotto will reuse the existing service principal and enable missing read-only access for selected subscriptions.',
  mode: 'grantAdditionalPermissions',
  modeLabel: 'Update existing service principal',
  modeDescription: 'Reuses the existing Azure service principal and enables missing access only.',
  recommendedReadOnlyByDefault: true,
  optionalWriteSelectedByDefault: false,
  totalPermissionCount: 1,
  selectedByDefaultCount: 1,
  selectedForExecutionCount: 1,
  optionalWritePermissionCount: 0,
  capabilityGroups: [
    {
      key: 'baselineResourceInventory',
      displayName: 'Baseline resource inventory',
      description: 'Reader access for selected Azure subscriptions.',
      requirement: 'required',
      severity: 'required',
      selectedByDefault: true,
      selectedForExecution: true,
      status: 'alreadyExists',
      benefit: 'Enables read-only Azure resource inventory and recurring scans.',
      skippedImpact: 'Setup cannot complete unless at least one selected subscription has Reader access.',
      permissionInstanceKeys: ['subscriptionReader:/subscriptions/sub-123'],
      selectedPermissionInstanceKeys: ['subscriptionReader:/subscriptions/sub-123'],
      counts: {
        total: 1,
        selectedByDefault: 1,
        selectedForExecution: 1,
        succeeded: 0,
        alreadyExists: 1,
        failed: 0,
        skipped: 0,
        notStarted: 0,
        running: 0,
      },
    },
  ],
};

const statusResponse: AzureSpSetupStatusResponse = {
  setupId: 'setup-123',
  companyId: 'comp-123',
  mode: 'grantAdditionalPermissions',
  phase: 'readyToExecute',
  result: 'none',
  selectedTenantId: 'tenant-123',
  targetCloudAccountId: 'client-id-123',
  targetCloudAccountName: 'Production Azure',
  targetAzureApplicationAppId: 'client-id-123',
  permissionManifestVersion: 'azure-sp-setup-2026-05-11',
  targetPermissionManifestVersion: 'azure-sp-setup-2026-05-11',
  permissionPlan: [
    {
      key: 'subscriptionReader',
      instanceKey: 'subscriptionReader:/subscriptions/sub-123',
      requirement: 'required',
      scopeKind: 'subscription',
      displayName: 'Reader',
      userFacingLabel: 'Read subscription resources',
      description: 'Allows Spotto to read selected Azure subscriptions.',
      scope: '/subscriptions/sub-123',
      externalResourceId: '/subscriptions/sub-123/providers/Microsoft.Authorization/roleAssignments/role-assignment-id',
      idempotencyKey: 'tenant-123:sp-object-123:reader:/subscriptions/sub-123',
      roleDefinitionName: 'Reader',
      requiredPrivilege: 'Owner, User Access Administrator, or Role Based Access Control Administrator',
      selectedByDefault: true,
      isDeselectable: false,
      capabilityStatus: 'likelyAllowed',
      currentState: 'alreadyExists',
      plannedAction: 'none',
      detectOperation: 'assignAzureRole',
      applyOperation: 'assignAzureRole',
      failureBehavior: 'blockSetup',
      status: 'alreadyExists',
    },
  ],
  permissionSummary,
  billingExportPlan,
  billingExportResults,
  operationResults: [graphOperationResult, graphAuditLogOperationResult],
  progress: [
    {
      key: 'readerAccess',
      status: 'alreadyExists',
      message: 'Reader access already exists.',
    },
  ],
  expiresAt: '2026-05-11T01:00:00.000Z',
  canRetry: false,
  canExecute: true,
};

const planResponse: AzureSpSetupPlanResponse = {
  ...statusResponse,
  phase: 'readyToExecute',
  permissionPlan: statusResponse.permissionPlan ?? [],
  subscriptions: [
    {
      subscriptionId: 'sub-123',
      displayName: 'Production Subscription',
      tenantId: 'tenant-123',
      state: 'Enabled',
      isVisible: true,
      isReadableCandidate: true,
      isSelectedByDefault: true,
    },
  ],
};

const executeRequest: AzureSpSetupExecuteRequest = {
  subscriptionIds: ['sub-123'],
  selectedPermissionInstanceKeys: ['subscriptionReader:/subscriptions/sub-123'],
  billingExports: {
    enabled: true,
    mode: 'reuseExisting',
    reuseDetectedExportResourceIds: ['/subscriptions/sub-123/providers/Microsoft.CostManagement/exports/existing-actual-export'],
    containerName: 'spotto-cost-exports',
  },
  cloudAccountName: 'Production Azure',
  groupNames: ['Production'],
  readBitmask: 0,
  writeBitmask: 0,
};

const selectedExistingStorageExecuteRequest: AzureSpSetupExecuteRequest = {
  subscriptionIds: ['sub-123'],
  selectedPermissionInstanceKeys: ['subscriptionReader:/subscriptions/sub-123', 'billingExportStorage:sub-123'],
  billingExports: {
    enabled: true,
    mode: 'useExistingStorage',
    storageAccountResourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/spottoexports',
    containerName: 'spotto-cost-exports',
  },
};

const createStorageExecuteRequest: AzureSpSetupExecuteRequest = {
  subscriptionIds: ['sub-123'],
  selectedPermissionInstanceKeys: ['subscriptionReader:/subscriptions/sub-123', 'billingExportStorage:sub-123'],
  billingExports: {
    enabled: true,
    mode: 'createStorage',
    createStorage: {
      subscriptionId: 'sub-123',
      resourceGroupName: 'rg-spotto-cost-exports',
      location: 'australiaeast',
      storageAccountName: 'spottoexports123',
      containerName: 'spotto-cost-exports',
    },
  },
};

const invalidPlanResponse: AzureSpSetupPlanResponse = {
  ...planResponse,
  permissionPlan: [
    // @ts-expect-error permission plan instances must include an idempotency key.
    {
      key: 'subscriptionReader',
      instanceKey: 'subscriptionReader:/subscriptions/sub-456',
      requirement: 'required',
      scopeKind: 'subscription',
      displayName: 'Reader',
      userFacingLabel: 'Read subscription resources',
      description: 'Allows Spotto to read selected Azure subscriptions.',
      scope: '/subscriptions/sub-456',
      requiredPrivilege: 'Owner',
      selectedByDefault: true,
      isDeselectable: false,
      capabilityStatus: 'unknown',
      currentState: 'missing',
      plannedAction: 'grant',
      detectOperation: 'assignAzureRole',
      applyOperation: 'assignAzureRole',
      failureBehavior: 'blockSetup',
      status: 'notStarted',
    },
  ],
};

const durableActivePhases: AzureSpSetupPhase[] = ['dispatchPending', 'queued', 'executing', 'retrying'];
const durableTerminalPhases: AzureSpSetupPhase[] = ['completed', 'needsAdminAction', 'failed', 'cancelled', 'expired'];
const durableTerminalResults: AzureSpSetupResult[] = ['complete', 'partial', 'needsAdminAction', 'failed', 'cancelled', 'expired'];

// @ts-expect-error terminal results retain the existing vocabulary.
const invalidTerminalResult: AzureSpSetupResult = 'succeeded';

const independentReaderResults: AzureSpSetupOperationResult[] = [
  {
    operationKey: 'rootManagementGroupReader:tenant-123',
    permissionKey: 'rootManagementGroupReader',
    instanceKey: 'rootManagementGroupReader:/providers/Microsoft.Management/managementGroups/tenant-123',
    operationKind: 'assignAzureRole',
    idempotencyKey: 'tenant-123:sp-object-123:reader:root-management-group',
    status: 'needsAdminAction',
    errorCode: 'management_group_authority_missing',
    safeMessage: 'Root management group Reader access requires another administrator.',
  },
  {
    operationKey: 'subscriptionReader:sub-123',
    permissionKey: 'subscriptionReader',
    instanceKey: 'subscriptionReader:/subscriptions/sub-123',
    operationKind: 'assignAzureRole',
    idempotencyKey: 'tenant-123:sp-object-123:reader:sub-123',
    status: 'granted',
  },
  {
    operationKey: 'subscriptionReader:sub-456',
    permissionKey: 'subscriptionReader',
    instanceKey: 'subscriptionReader:/subscriptions/sub-456',
    operationKind: 'assignAzureRole',
    idempotencyKey: 'tenant-123:sp-object-123:reader:sub-456',
    status: 'failed',
    errorCode: 'subscription_reader_assignment_failed',
  },
];

const invalidReaderResultWithFallbackScope: AzureSpSetupOperationResult = {
  ...independentReaderResults[0],
  // @ts-expect-error root and subscription Reader work is independent; no fallback scope is represented.
  requestedScopeKind: 'managementGroup',
};

const repairExecutionRequest: AzureSpSetupExecutionRequestV1 = {
  schemaVersion: 1,
  setupId: 'setup-123',
  executionId: 'execution-123',
  executionAttempt: 1,
  mode: 'grantAdditionalPermissions',
  companyId: 'comp-123',
  tenantId: 'tenant-123',
  initiatedByUserId: 'user-123',
  authorizationCorrelationId: 'authorization-123',
  createdAt: '2026-08-09T00:00:00.000Z',
  selectedSubscriptionIds: ['sub-123', 'sub-456'],
  selectedPermissionInstanceKeys: [
    'rootManagementGroupReader:/providers/Microsoft.Management/managementGroups/tenant-123',
    'subscriptionReader:/subscriptions/sub-123',
    'subscriptionReader:/subscriptions/sub-456',
  ],
  cloudAccountName: 'Production Azure',
  targetCloudAccountId: 'client-id-123',
  targetAzureApplicationAppId: 'client-id-123',
  targetAzureApplicationObjectId: 'application-object-123',
  targetAzureServicePrincipalObjectId: 'service-principal-object-123',
  targetReadinessVersion: 'readiness-7',
  targetSummaryBaselineVersion: 'summary-6',
  targetCredentialBaselineHash: 'sha256:stored-account-credential-baseline',
  selectedExistingSubscriptionIds: ['sub-123'],
  selectedNewSubscriptionIds: ['sub-456'],
  priorOutcomeBaseline: {
    permissionManifestVersion: 'azure-sp-setup-2026-08-09',
    result: 'partial',
  },
  requestedRefreshComponents: ['resourceInventory', 'billing'],
  snapshotHash: 'sha256:canonical-non-secret-snapshot',
};

const invalidExecutionRequestWithToken: AzureSpSetupExecutionRequestV1 = {
  ...repairExecutionRequest,
  // @ts-expect-error immutable execution requests cannot contain Microsoft tokens.
  accessToken: 'not-allowed',
};

const accountSummary: AzureSpSetupCloudAccountSummaryV1 = {
  schemaVersion: 1,
  setupId: 'setup-123',
  executionId: 'execution-123',
  mode: 'grantAdditionalPermissions',
  permissionManifestVersion: 'azure-sp-setup-2026-08-09',
  result: 'partial',
  startedAt: '2026-08-09T00:00:00.000Z',
  completedAt: '2026-08-09T00:10:00.000Z',
  selectedSubscriptionIds: ['sub-123', 'sub-456'],
  selectedPermissionInstanceKeys: repairExecutionRequest.selectedPermissionInstanceKeys,
  operationResults: independentReaderResults,
  capabilityReadiness: {
    baselineResourceInventory: 'partial',
  },
  subscriptionReadiness: [
    {
      subscriptionId: 'sub-123',
      readerReadiness: 'granted',
      setupId: 'setup-123',
      executionId: 'execution-123',
      verifiedAt: '2026-08-09T00:09:00.000Z',
    },
    {
      subscriptionId: 'sub-456',
      readerReadiness: 'failed',
      setupId: 'setup-123',
      executionId: 'execution-123',
      errorCode: 'subscription_reader_assignment_failed',
    },
  ],
};

const publicDurableStatus: AzureSpSetupStatusResponse = {
  ...statusResponse,
  phase: 'retrying',
  dispatchStatus: 'continuationPending',
  dispatchSequence: 1,
  retryAfterAt: '2026-08-09T00:12:00.000Z',
  lastHeartbeatAt: '2026-08-09T00:10:00.000Z',
  executionOwner: 'cloudEngine',
  cancellationRequestedAt: '2026-08-09T00:10:30.000Z',
  canCancel: true,
  canResume: false,
  canRepair: true,
  requiresReauthorization: false,
  accountReadiness: {
    provisioningStatus: 'partial',
    setupId: 'setup-123',
    executionId: 'execution-123',
    readinessVersion: 'readiness-7',
    permissionManifestVersion: 'azure-sp-setup-2026-08-09',
    result: 'partial',
    capabilityReadiness: accountSummary.capabilityReadiness,
    subscriptionReadiness: accountSummary.subscriptionReadiness,
  },
  subscriptionReadiness: accountSummary.subscriptionReadiness,
};

const activeCancellationResponse: AzureSpSetupCancelResponse = {
  ...statusResponse,
  phase: 'executing',
  cancellationRequestedAt: '2026-08-09T00:10:30.000Z',
  canCancel: false,
};

const settledCancellationResponse: AzureSpSetupCancelResponse = {
  ...statusResponse,
  phase: 'cancelled',
  result: 'cancelled',
};

const invalidPublicStatusWithEncryptedState: AzureSpSetupStatusResponse = {
  ...publicDurableStatus,
  // @ts-expect-error public status is an allowlist and cannot expose protected token state.
  encryptedMicrosoftTokenCache: 'not-allowed',
};

const invalidPublicStatusWithRetryAttempts: AzureSpSetupStatusResponse = {
  ...publicDurableStatus,
  // @ts-expect-error per-operation retry counters are protected durable state, not public status.
  retryAttemptsByOperation: { 'readerValidation:sub-123': 2 },
};

const invalidPublicStatusWithCredentialBaseline: AzureSpSetupStatusResponse = {
  ...publicDurableStatus,
  // @ts-expect-error the credential baseline hash is protected durable state, not public status.
  targetCredentialBaselineHash: 'sha256:stored-account-credential-baseline',
};

const invalidAccountSummaryWithRetryAttempts: AzureSpSetupCloudAccountSummaryV1 = {
  ...accountSummary,
  // @ts-expect-error per-operation retry counters are protected durable state, not a public account summary.
  retryAttemptsByOperation: { 'readerValidation:sub-123': 2 },
};

const invalidAccountSummaryWithCredentialBaseline: AzureSpSetupCloudAccountSummaryV1 = {
  ...accountSummary,
  // @ts-expect-error the credential baseline hash is protected durable state, not a public account summary.
  targetCredentialBaselineHash: 'sha256:stored-account-credential-baseline',
};

const legacySetupState = {
  setupId: 'legacy-setup-123',
  mode: 'createCloudAccount' as const,
  companyId: 'comp-123',
  initiatedByUserId: 'user-123',
  phase: 'readyToExecute' as const,
  result: 'none' as const,
  codeVerifier: 'legacy-code-verifier',
  nonce: 'legacy-nonce',
  permissionManifestVersion: 'azure-sp-setup-2026-05-11',
  createdAt: '2026-08-08T00:00:00.000Z',
  updatedAt: '2026-08-08T00:05:00.000Z',
  expiresAt: '2026-08-08T01:00:00.000Z',
};

const migratedLegacySetupState: AzureSpSetupDurableStateV1 = {
  ...legacySetupState,
  schemaVersion: 1,
  stateRevision: 0,
};

const protectedDurableSetupState: AzureSpSetupDurableStateV1 = {
  ...migratedLegacySetupState,
  phase: 'retrying',
  executionId: 'execution-123',
  executionAttempt: 1,
  encryptedMicrosoftTokenCache: 'fake-encrypted-token-cache',
  generatedClientSecretEncrypted: 'fake-encrypted-client-secret',
  generatedClientSecretKeyId: 'azure-password-key-id',
  executionRequest: repairExecutionRequest,
  executionRequestHash: repairExecutionRequest.snapshotHash,
  executionOwner: 'cloudEngine',
  dispatchStatus: 'continuationPending',
  dispatchSequence: 1,
  dispatchMessageId: 'execution-123:1',
  dispatchPendingAt: '2026-08-09T00:10:00.000Z',
  dispatchAttemptCount: 1,
  cancellationRequestedAt: '2026-08-09T00:10:30.000Z',
  previousStateRevision: 0,
  stateBlobETag: 'opaque-etag',
  currentCheckpoint: 'permissions:subscriptionReader:sub-456',
  retryCategory: 'propagation',
  retryCount: 1,
  retryAttemptsByOperation: {
    'credentialValidation:client-id-123': 2,
    'readerValidation:sub-456': 1,
  },
  retryAfterAt: '2026-08-09T00:12:00.000Z',
  nextDispatchSequence: 2,
  continuationMessageId: 'execution-123:2',
  accountReadiness: publicDurableStatus.accountReadiness,
  subscriptionReadiness: accountSummary.subscriptionReadiness,
  targetClaimId: 'sha256:company-and-target-account',
  targetClaimOwner: 'worker-123',
  targetClaimExpiresAt: '2026-08-09T00:15:00.000Z',
  targetCredentialBaselineHash: repairExecutionRequest.targetCredentialBaselineHash,
  targetedRefreshCheckpoints: [
    {
      subscriptionId: 'sub-123',
      refreshKind: 'resourceInventory',
      idempotencyKey: 'execution-123:repair:client-id-123:sub-123:resourceInventory',
      status: 'pending',
      pendingAt: '2026-08-09T00:10:00.000Z',
    },
  ],
};

void createModeStartRequest;
void keyVaultReaderPermissionKey;
void statusHasNoForbiddenPublicKeys;
void summaryHasNoForbiddenPublicKeys;
void executionRequestHasNoForbiddenPublicKeys;
void statusHasNoProtectedDurableKeys;
void summaryHasNoProtectedDurableKeys;
void permissionUpdateStartRequest;
void setupMode;
void invalidSetupMode;
void subscriptionReaderManifestItem;
void billingExportPlan;
void billingExportResults;
void graphOperationResult;
void graphAuditLogOperationResult;
void permissionSummary;
void statusResponse;
void planResponse;
void executeRequest;
void selectedExistingStorageExecuteRequest;
void createStorageExecuteRequest;
void invalidPlanResponse;
void durableActivePhases;
void durableTerminalPhases;
void durableTerminalResults;
void invalidTerminalResult;
void independentReaderResults;
void invalidReaderResultWithFallbackScope;
void repairExecutionRequest;
void invalidExecutionRequestWithToken;
void accountSummary;
void publicDurableStatus;
void activeCancellationResponse;
void settledCancellationResponse;
void invalidPublicStatusWithEncryptedState;
void invalidPublicStatusWithRetryAttempts;
void invalidPublicStatusWithCredentialBaseline;
void invalidAccountSummaryWithRetryAttempts;
void invalidAccountSummaryWithCredentialBaseline;
void migratedLegacySetupState;
void protectedDurableSetupState;
