import type {
  AzureSpBillingExportPlan,
  AzureSpPermissionManifestItem,
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
      exportName: 'existing-actual-export',
      exportResourceId: '/subscriptions/sub-123/providers/Microsoft.CostManagement/exports/existing-actual-export',
      storageAccountResourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/spottoexports',
      containerName: 'spotto-cost-exports',
      rootFolderPath: 'spotto/sub-123/actual/recurring',
      isCompatible: true,
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
  selectedContainerName: 'spotto-cost-exports',
};

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
  billingExportPlan,
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
void graphOperationResult;
void statusResponse;
void planResponse;
void executeRequest;
void invalidPlanResponse;
