import type {
  AzureSpBillingExportPlan,
  AzureSpBillingExportResult,
  AzureSpPermissionManifestItem,
  AzureSpSetupPermissionSummary,
  AzureSpSetupExecuteRequest,
  AzureSpSetupMode,
  AzureSpSetupOperationResult,
  AzureSpSetupPlanResponse,
  AzureSpSetupStartRequest,
  AzureSpSetupStatusResponse,
} from './azureSpSetup';

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
  operationResults: [graphOperationResult],
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

void createModeStartRequest;
void permissionUpdateStartRequest;
void setupMode;
void invalidSetupMode;
void subscriptionReaderManifestItem;
void billingExportPlan;
void billingExportResults;
void graphOperationResult;
void permissionSummary;
void statusResponse;
void planResponse;
void executeRequest;
void selectedExistingStorageExecuteRequest;
void createStorageExecuteRequest;
void invalidPlanResponse;
