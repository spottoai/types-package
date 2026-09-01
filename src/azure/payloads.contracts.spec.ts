import type { SubscriptionMessage } from './payloads';
import type { Subscription } from './subscriptions';
import type * as PackageContracts from '../index';
import { POLICY_EXEMPTION_COMMAND_SCHEMA_VERSION } from '../index';
import type {
  ActionExecutionRequestMessage,
  ActionExecutionSource,
  BillingReconciliationSubscriptionMessage,
  BillingReconciliationWorkMetadata,
  AzureGuestAccessConfirmSubscriptionsRequest,
  AzureGuestAccessDeviceCodeResponse,
  AzureGuestAccessManualScanRequest,
  AzureGuestAccessStartRequest,
  AzureGuestAccessStatusResponse,
  AzureGuestAccessSubscriptionItem,
  AzureGuestAccessSubscriptionMessage,
  AzureGuestAccessSubscriptionMessageMetadata,
  AzureGuestAccessTenantItem,
  AzureGuestAccessTenantSelectionRequest,
  AzureGuestAccessTokenRelayPayload,
  AzureCloudAccountAuthContext,
  AzureDelegatedConnectionStartRequest,
  AzureDelegatedConfirmSubscriptionsRequest,
  AzureDelegatedConfirmSubscriptionsResponse,
  AzureDelegatedOnboardingResponse,
  AzureDelegatedPortalRedirectStatus,
  AzureDelegatedReconnectRequest,
  AzureDelegatedReplaceWithServicePrincipalRequest,
  AzureDelegatedReplaceWithServicePrincipalResponse,
  AzureDelegatedTenantItem,
  AzureDelegatedTenantSelectionRequest,
  AzureDelegatedTrialExtensionRequest,
  AzureDelegatedTrialExtensionResponse,
  AzureGdapSubscriptionMessage,
  AzureSpSetupExecutionRequestMessage,
  AzureSpSetupMaintenanceRequestMessage,
  CloudAccountTenantSyncRequest,
  CloudAccountsBillingReconciliationRequestMessage,
  CloudAccountsScheduledRefreshRequestMessage,
  CreatePolicyExemptionRequestMessage,
  PublicCloudAccountDto,
  ProcessPayload,
  RequestMessage,
  ReviewChecklistPayload,
  SubscriptionSyncRequest,
  WorkflowTracingOptions,
} from '../index';

type AzureSpSetupForbiddenQueueKey =
  | 'accessToken'
  | 'refreshToken'
  | 'tokenCache'
  | 'encryptedMicrosoftTokenCache'
  | 'clientSecret'
  | 'generatedClientSecretEncrypted'
  | 'credentialReference'
  | 'permissionPlan'
  | 'billingExportPlan'
  | 'selectedSubscriptionIds'
  | 'selectedPermissionInstanceKeys'
  | 'readBitmask'
  | 'writeBitmask'
  | 'stateBlobPath'
  | 'sasUrl'
  | 'messageId';

type DeepForbiddenQueueKeys<T> = T extends readonly (infer Item)[]
  ? DeepForbiddenQueueKeys<Item>
  : T extends object
    ? {
        [Key in keyof T]-?: Key extends AzureSpSetupForbiddenQueueKey ? Key : DeepForbiddenQueueKeys<T[Key]>;
      }[keyof T]
    : never;

type AssertNoForbiddenQueueKey<T> = DeepForbiddenQueueKeys<T> extends never ? true : never;

const azureSpSetupExecutionMessageHasNoForbiddenKeys: AssertNoForbiddenQueueKey<AzureSpSetupExecutionRequestMessage> = true;
const azureSpSetupMaintenanceMessageHasNoForbiddenKeys: AssertNoForbiddenQueueKey<AzureSpSetupMaintenanceRequestMessage> = true;

const azureSpSetupInitialExecutionMessage: AzureSpSetupExecutionRequestMessage = {
  schemaVersion: 1,
  entity: 'azure-sp-setup',
  action: 'execute',
  companyId: 'comp-123',
  tenantId: 'tenant-123',
  cloudAccountId: 'setup-123',
  clientId: 'setup-123',
  setupId: 'setup-123',
  executionId: 'execution-123',
  dispatchSequence: 0,
  correlationId: 'correlation-123',
  enqueuedAt: '2026-08-09T00:00:00.000Z',
};

const azureSpSetupContinuationMessage: AzureSpSetupExecutionRequestMessage = {
  ...azureSpSetupInitialExecutionMessage,
  dispatchSequence: 1,
};

const azureSpSetupMaintenanceMessage: AzureSpSetupMaintenanceRequestMessage = {
  entity: 'azure-sp-setup',
  action: 'maintain',
  companyId: '*',
  cloudAccountId: '*',
  tenantId: '*',
  clientId: '*',
  correlationId: 'azure-sp-setup:maintain:2026-08-09T00:00:00.000Z:0',
  metadata: {
    schemaVersion: 1,
    maintenanceKind: 'recover-and-cleanup',
    cutoffUtc: '2026-08-08T23:55:00.000Z',
    maxItems: 100,
    scheduledWindowUtc: '2026-08-09T00:00:00.000Z',
    batchNumber: 0,
    maxBatches: 10,
  },
};

const azureSpSetupRequestMessageCompatibility: RequestMessage = azureSpSetupInitialExecutionMessage;

const { setupId: _removedAzureSpSetupId, ...azureSpSetupExecutionWithoutSetupId } = azureSpSetupInitialExecutionMessage;
// @ts-expect-error execution messages require setup correlation.
const invalidAzureSpSetupExecutionWithoutSetupId: AzureSpSetupExecutionRequestMessage = azureSpSetupExecutionWithoutSetupId;

const { executionId: _removedAzureSpExecutionId, ...azureSpSetupExecutionWithoutExecutionId } = azureSpSetupInitialExecutionMessage;
// @ts-expect-error execution messages require execution correlation.
const invalidAzureSpSetupExecutionWithoutExecutionId: AzureSpSetupExecutionRequestMessage = azureSpSetupExecutionWithoutExecutionId;

const invalidAzureSpSetupExecutionMessageWithToken: AzureSpSetupExecutionRequestMessage = {
  ...azureSpSetupInitialExecutionMessage,
  // @ts-expect-error setup queue messages must never carry tokens.
  accessToken: 'not-allowed',
};

const invalidAzureSpSetupExecutionMessageWithMetadata: AzureSpSetupExecutionRequestMessage = {
  ...azureSpSetupInitialExecutionMessage,
  // @ts-expect-error execution messages cannot carry arbitrary metadata.
  metadata: { selectedSubscriptionIds: ['sub-123'] },
};

const invalidAzureSpSetupExecutionMessageWithBrokerId: AzureSpSetupExecutionRequestMessage = {
  ...azureSpSetupInitialExecutionMessage,
  // @ts-expect-error Service Bus MessageId is a broker property, not a body field.
  messageId: 'execution-123:0',
};

const invalidAzureSpSetupExecutionSchemaVersion: AzureSpSetupExecutionRequestMessage = {
  ...azureSpSetupInitialExecutionMessage,
  // @ts-expect-error execution messages require schema version 1.
  schemaVersion: 2,
};

const invalidAzureSpSetupMaintenanceSentinel: AzureSpSetupMaintenanceRequestMessage = {
  ...azureSpSetupMaintenanceMessage,
  // @ts-expect-error maintenance messages use the existing system-wide wildcard identifiers.
  companyId: 'comp-123',
};

const invalidAzureSpSetupMaintenanceSchemaVersion: AzureSpSetupMaintenanceRequestMessage = {
  ...azureSpSetupMaintenanceMessage,
  metadata: {
    ...azureSpSetupMaintenanceMessage.metadata,
    // @ts-expect-error maintenance metadata requires schema version 1.
    schemaVersion: 2,
  },
};

const subscription: Subscription = {
  companyId: 'comp-123',
  tenantId: 'tenant-123',
  tenantSubscriptionIds: ['sub-123'],
  subscriptionId: 'sub-123',
  displayName: 'Production Subscription',
  spendingLimit: false,
  quotaId: 'payg',
};

const subscriptionMessage: SubscriptionMessage = {
  subscription,
  companyId: 'comp-123',
};

const tracing: WorkflowTracingOptions = {
  enabled: true,
};

const tracedSubscriptionMessage: SubscriptionMessage = {
  subscription,
  companyId: 'comp-123',
  tracing,
};

const tracedProcessPayload: ProcessPayload = {
  subscriptionId: 'sub-123',
  tenantId: 'tenant-123',
  companyId: 'comp-123',
  subscriptionType: 'Production',
  tracing,
};

const invalidProcessPayloadSubscriptionType: ProcessPayload = {
  subscriptionId: 'sub-123',
  // @ts-expect-error ProcessPayload subscriptionType uses the canonical subscription classification.
  subscriptionType: 'Development',
};

const azureCloudAccountAuthContext: AzureCloudAccountAuthContext = {
  authMode: 'gdap',
  cloudAccountId: 'gdap-account-123',
  gdapAuthorizationCompanyId: 'root-msp-123',
  gdapAuthorizationProfileId: 'gdapauth-profile-123',
  customerTenantId: 'customer-tenant-123',
  authorityTenantId: 'customer-tenant-123',
  partnerTenantId: 'partner-tenant-123',
};

const gdapSubscriptionMessage: AzureGdapSubscriptionMessage = {
  subscription,
  companyId: 'comp-123',
  cloudAccountId: 'gdap-account-123',
  tenantId: 'customer-tenant-123',
  authMode: 'gdap',
  customerTenantId: 'customer-tenant-123',
  authorityTenantId: 'customer-tenant-123',
  partnerTenantId: 'partner-tenant-123',
  authContext: {
    authMode: 'gdap',
    cloudAccountId: 'gdap-account-123',
    gdapAuthorizationCompanyId: 'root-msp-123',
    gdapAuthorizationProfileId: 'gdapauth-profile-123',
    customerTenantId: 'customer-tenant-123',
    authorityTenantId: 'customer-tenant-123',
    partnerTenantId: 'partner-tenant-123',
  },
};

const invalidGdapSubscriptionMessageWithToken: AzureGdapSubscriptionMessage = {
  ...gdapSubscriptionMessage,
  // @ts-expect-error GDAP queue messages must not carry bearer tokens.
  authToken: 'access-token',
};

const invalidGdapSubscriptionMessageWithSecret: AzureGdapSubscriptionMessage = {
  ...gdapSubscriptionMessage,
  // @ts-expect-error GDAP queue messages must not carry client secrets.
  authClientSecret: 'client-secret',
};

const invalidGdapSubscriptionMessageWithClientId: AzureGdapSubscriptionMessage = {
  ...gdapSubscriptionMessage,
  // @ts-expect-error GDAP queue messages must not treat cloud account IDs as Azure client IDs.
  clientId: 'gdap-account-123',
};

const invalidGdapSubscriptionMessageWithCredentialReference: AzureGdapSubscriptionMessage = {
  ...gdapSubscriptionMessage,
  // @ts-expect-error GDAP queue messages should load credential references from storage.
  credentialReference: 'internal-gdap-credential-reference',
};

const invalidGdapSubscriptionMessageWithAuthContextCredentialReference: AzureGdapSubscriptionMessage = {
  ...gdapSubscriptionMessage,
  authContext: {
    authMode: 'gdap',
    cloudAccountId: 'gdap-account-123',
    customerTenantId: 'customer-tenant-123',
    partnerTenantId: 'partner-tenant-123',
    // @ts-expect-error GDAP queue auth context must not carry credential references.
    credentialReference: 'internal-gdap-credential-reference',
  },
};

const subscriptionSyncRequest: SubscriptionSyncRequest = {
  tracing,
};

const tenantSyncRequest: CloudAccountTenantSyncRequest = {
  tracing,
};

void subscriptionMessage;
void tracedSubscriptionMessage;
void tracedProcessPayload;
void invalidProcessPayloadSubscriptionType;
void azureCloudAccountAuthContext;
void gdapSubscriptionMessage;
void invalidGdapSubscriptionMessageWithToken;
void invalidGdapSubscriptionMessageWithSecret;
void invalidGdapSubscriptionMessageWithClientId;
void invalidGdapSubscriptionMessageWithCredentialReference;
void invalidGdapSubscriptionMessageWithAuthContextCredentialReference;
void subscriptionSyncRequest;
void tenantSyncRequest;

const guestAccessSubscriptionMessageMetadata: AzureGuestAccessSubscriptionMessageMetadata = {
  guestAccessRun: true,
  scanSchedulingMode: 'onDemandOnly',
  guestAccessSource: 'initial',
  authFlow: 'azurePowerShellDeviceCode',
};

const guestAccessSubscriptionMessage: AzureGuestAccessSubscriptionMessage = {
  subscription,
  companyId: 'comp-123',
  cloudAccountId: 'guest-account-123',
  tenantId: 'tenant-123',
  clientId: 'guest-account-123',
  authMode: 'delegatedUser',
  sagaRunId: 'guest-run-123',
  metadata: guestAccessSubscriptionMessageMetadata,
  refreshComponents: ['queries', 'billing'],
};

const guestAccessReviewChecklistPayload: ReviewChecklistPayload = {
  companyId: 'comp-123',
  cloudAccountId: 'guest-account-123',
  tenantId: 'tenant-123',
  subscriptionIds: ['sub-123'],
  checklistId: 'alz',
  authMode: 'delegatedUser',
  guestAccessRunId: 'guest-run-123',
  metadata: {
    ...guestAccessSubscriptionMessageMetadata,
    guestAccessRunId: 'guest-run-123',
  },
};

const invalidGuestAccessReviewChecklistPayloadWithToken: ReviewChecklistPayload = {
  ...guestAccessReviewChecklistPayload,
  // @ts-expect-error review checklist queue payloads do not carry bearer tokens.
  accessToken: 'access-token',
};

const invalidGuestAccessSubscriptionMessageWithToken: AzureGuestAccessSubscriptionMessage = {
  ...guestAccessSubscriptionMessage,
  // @ts-expect-error guest access queue messages must not carry bearer tokens.
  authToken: 'access-token',
};

const invalidGuestAccessSubscriptionMessageWithSecret: AzureGuestAccessSubscriptionMessage = {
  ...guestAccessSubscriptionMessage,
  // @ts-expect-error guest access queue messages must not carry client secrets.
  authClientSecret: 'client-secret',
};

const invalidGuestAccessSubscriptionMessageWithCredentialReference: AzureGuestAccessSubscriptionMessage = {
  ...guestAccessSubscriptionMessage,
  // @ts-expect-error guest access queue messages must not carry token relay storage locators.
  credentialReference: 'internal-token-relay-reference',
};

const invalidGuestAccessSubscriptionMessageWithScheduledSource: AzureGuestAccessSubscriptionMessage = {
  ...guestAccessSubscriptionMessage,
  metadata: {
    ...guestAccessSubscriptionMessageMetadata,
    // @ts-expect-error guest access queue metadata supports initial/manual sources only.
    guestAccessSource: 'scheduled',
  },
};

const invalidGuestAccessSubscriptionMessageWithPeriodicMode: AzureGuestAccessSubscriptionMessage = {
  ...guestAccessSubscriptionMessage,
  metadata: {
    ...guestAccessSubscriptionMessageMetadata,
    // @ts-expect-error guest access queue metadata is on-demand only.
    scanSchedulingMode: 'daily',
  },
};

void guestAccessSubscriptionMessageMetadata;
void guestAccessSubscriptionMessage;
void guestAccessReviewChecklistPayload;
void invalidGuestAccessReviewChecklistPayloadWithToken;
void invalidGuestAccessSubscriptionMessageWithToken;
void invalidGuestAccessSubscriptionMessageWithSecret;
void invalidGuestAccessSubscriptionMessageWithCredentialReference;
void invalidGuestAccessSubscriptionMessageWithScheduledSource;
void invalidGuestAccessSubscriptionMessageWithPeriodicMode;

// @ts-expect-error SubscriptionMessage.companyId is required for queue payload compatibility.
const invalidSubscriptionMessage: SubscriptionMessage = {
  subscription,
};

void invalidSubscriptionMessage;

const publicCloudAccount: PublicCloudAccountDto = {
  companyId: 'comp-123',
  id: 'delegated-account-123',
  name: 'Delegated Azure Account',
  companyName: 'Spotto',
  provider: 'Azure',
  authMode: 'delegatedUser',
  tenantId: 'tenant-123',
  createdAt: new Date('2026-05-10T00:00:00.000Z'),
  updatedAt: new Date('2026-05-10T00:00:00.000Z'),
  createdBy: 'user-123',
  status: 'Active',
  onboardingStatus: 'active',
  connectedUserEmail: 'owner@example.com',
};

const guestAccessStartRequest: AzureGuestAccessStartRequest = {
  displayName: 'Customer Tenant Guest Scan',
};

const guestAccessDeviceCodeResponse: AzureGuestAccessDeviceCodeResponse = {
  setupId: 'setup-123',
  userCode: 'ABCD-EFGH',
  deviceCodeExpiresAt: '2026-06-16T09:00:00.000Z',
  verificationUri: 'https://microsoft.com/devicelogin',
  verificationUriComplete: 'https://microsoft.com/devicelogin?user_code=ABCD-EFGH',
  message: 'Use the code to sign in.',
  intervalSeconds: 5,
  status: 'deviceCodePending',
};

const guestAccessTenantItem: AzureGuestAccessTenantItem = {
  tenantId: 'tenant-123',
  displayName: 'Customer Tenant',
  domainName: 'customer.example',
  selected: true,
};

const guestAccessSubscriptionItem: AzureGuestAccessSubscriptionItem = {
  subscriptionId: 'sub-123',
  displayName: 'Production Subscription',
  tenantId: 'tenant-123',
  state: 'Enabled',
  selectable: true,
};

const guestAccessTenantSelectionRequest: AzureGuestAccessTenantSelectionRequest = {
  tenantId: 'tenant-123',
};

const guestAccessConfirmSubscriptionsRequest: AzureGuestAccessConfirmSubscriptionsRequest = {
  subscriptionIds: ['sub-123'],
  displayName: 'Customer Guest Scan',
};

const guestAccessManualScanRequest: AzureGuestAccessManualScanRequest = {
  refreshComponents: ['queries', 'billing'],
};

const guestAccessReviewChecklistManualScanRequest: AzureGuestAccessManualScanRequest = {
  workload: {
    kind: 'reviewChecklist',
    checklistId: 'alz',
    subscriptionIds: ['sub-123'],
  },
};

const guestAccessStatusResponse: AzureGuestAccessStatusResponse = {
  setupId: 'setup-123',
  cloudAccountId: 'guest-account-123',
  tenantId: 'tenant-123',
  status: 'completed',
  statusReason: 'billing_2m_failed',
  connectedUser: {
    username: 'guest@example.com',
    name: 'Guest User',
    objectId: 'user-object-123',
  },
  cloudAccount: publicCloudAccount,
  tenants: [guestAccessTenantItem],
  subscriptions: [guestAccessSubscriptionItem],
  workload: guestAccessReviewChecklistManualScanRequest.workload,
  scanSchedulingMode: 'onDemandOnly',
  guestAccessRunId: 'guest-run-123',
  guestAccessLastSuccessfulScanAt: '2026-06-16T08:30:00.000Z',
};

const invalidGuestAccessStatusResponseWithPeriodicMode: AzureGuestAccessStatusResponse = {
  ...guestAccessStatusResponse,
  // @ts-expect-error guest access status responses must be on-demand only.
  scanSchedulingMode: 'weekly',
};

// @ts-expect-error guest access does not expose a schedule update request DTO.
type InvalidGuestAccessScheduleUpdateRequest = PackageContracts.AzureGuestAccessScheduleUpdateRequest;

const guestAccessTokenRelayPayload: AzureGuestAccessTokenRelayPayload = {
  authFlow: 'azurePowerShellDeviceCode',
  authorityHost: 'https://login.microsoftonline.com',
  authorityTenantId: 'tenant-123',
  selectedTenantId: 'tenant-123',
  clientId: '1950a258-227b-4e31-a9cf-717495945fc2',
  scopes: ['https://management.azure.com/user_impersonation', 'offline_access'],
  tokenType: 'Bearer',
  accessToken: 'access-token',
  accessTokenExpiresAt: '2026-06-16T09:00:00.000Z',
  refreshToken: 'refresh-token',
  connectedUser: {
    homeAccountId: 'home-account-123',
    username: 'guest@example.com',
    name: 'Guest User',
    objectId: 'user-object-123',
  },
  receivedAt: '2026-06-16T08:00:00.000Z',
  updatedAt: '2026-06-16T08:00:00.000Z',
};

const invalidGuestAccessTokenRelayPayloadWithVersion: AzureGuestAccessTokenRelayPayload = {
  ...guestAccessTokenRelayPayload,
  // @ts-expect-error guest access token relay payloads must not include a version property.
  version: 1,
};

void guestAccessStartRequest;
void guestAccessDeviceCodeResponse;
void guestAccessTenantItem;
void guestAccessSubscriptionItem;
void guestAccessTenantSelectionRequest;
void guestAccessConfirmSubscriptionsRequest;
void guestAccessManualScanRequest;
void guestAccessStatusResponse;
void invalidGuestAccessStatusResponseWithPeriodicMode;
void (null as unknown as InvalidGuestAccessScheduleUpdateRequest);
void guestAccessTokenRelayPayload;
void invalidGuestAccessTokenRelayPayloadWithVersion;

const startRequest: AzureDelegatedConnectionStartRequest = {
  redirectAfter: '/company/comp-123/settings/cloud-accounts',
};

const reconnectRequest: AzureDelegatedReconnectRequest = {
  redirectAfter: '/company/comp-123/settings/cloud-accounts',
};

// @ts-expect-error redirect-first start endpoint must not expose a JSON success response DTO.
type InvalidDelegatedConnectionStartResponse = PackageContracts.AzureDelegatedConnectionStartResponse;

// @ts-expect-error redirect-first reconnect endpoint must not expose a JSON success response DTO.
type InvalidDelegatedReconnectResponse = PackageContracts.AzureDelegatedReconnectResponse;

const tenantSelectionRequest: AzureDelegatedTenantSelectionRequest = {
  tenantId: 'tenant-123',
  redirectAfter: '/company/comp-123/settings/cloud-accounts',
};

// @ts-expect-error redirect-first tenant-selection endpoint must not expose a JSON success response DTO.
type InvalidDelegatedTenantSelectionResponse = PackageContracts.AzureDelegatedTenantSelectionResponse;

const portalRedirectStatus: AzureDelegatedPortalRedirectStatus = {
  phase: 'tenantSelectionRequired',
  status: 'pending',
  companyId: 'comp-123',
};

const tenantItem: AzureDelegatedTenantItem = {
  tenantId: 'tenant-123',
  label: 'Spotto Tenant',
  isAlreadyConnected: true,
  connectedAuthMode: 'servicePrincipal',
};

const onboardingResponse: AzureDelegatedOnboardingResponse = {
  status: 'subscriptionSelectionRequired',
  phase: 'tenantSelectionRequired',
  cloudAccount: publicCloudAccount,
  tenants: [tenantItem],
  selectedTenantId: 'tenant-123',
  capabilities: [
    {
      capability: 'resourceRead',
      isAvailable: true,
      status: 'available',
    },
  ],
  subscriptions: [
    {
      subscriptionId: 'sub-123',
      displayName: 'Production Subscription',
      tenantId: 'tenant-123',
      isVisible: true,
      isResourceReadable: true,
      isSelectable: true,
    },
    {
      subscriptionId: 'sub-456',
      displayName: 'Unreadable Subscription',
      tenantId: 'tenant-123',
      isVisible: true,
      isResourceReadable: false,
      isSelectable: false,
      warningCode: 'missingPermission',
      warningMessage: 'Reader access is required before this subscription can be selected.',
    },
  ],
};

const confirmSubscriptionsRequest: AzureDelegatedConfirmSubscriptionsRequest = {
  subscriptionIds: ['sub-123'],
};

const confirmSubscriptionsResponse: AzureDelegatedConfirmSubscriptionsResponse = {
  cloudAccount: publicCloudAccount,
  subscriptions: onboardingResponse.subscriptions ?? [],
  onboardingStatus: 'active',
};

const replaceWithServicePrincipalRequest: AzureDelegatedReplaceWithServicePrincipalRequest = {
  clientId: 'client-123',
  tenantId: 'tenant-123',
  secret: 'service-principal-secret',
  secretExpiresAt: '2027-05-10T00:00:00.000Z',
};

const replaceWithServicePrincipalResponse: AzureDelegatedReplaceWithServicePrincipalResponse = {
  cloudAccount: {
    ...publicCloudAccount,
    authMode: 'servicePrincipal',
  },
};

const trialExtensionRequest: AzureDelegatedTrialExtensionRequest = {
  expiresAt: '2026-06-09T00:00:00.000Z',
};

// @ts-expect-error AzureDelegatedTrialExtensionRequest.expiresAt is required.
const invalidTrialExtensionRequest: AzureDelegatedTrialExtensionRequest = {};

const trialExtensionResponse: AzureDelegatedTrialExtensionResponse = {
  companyId: 'comp-123',
  companyLifecycle: 'trial',
  azureDelegatedTrialExpiresAt: '2026-06-09T00:00:00.000Z',
};

const invalidPublicDelegatedDto: PublicCloudAccountDto = {
  companyId: 'comp-123',
  id: 'delegated-account-123',
  name: 'Delegated Azure Account',
  companyName: 'Spotto',
  provider: 'Azure',
  createdAt: new Date('2026-05-10T00:00:00.000Z'),
  updatedAt: new Date('2026-05-10T00:00:00.000Z'),
  createdBy: 'user-123',
  status: 'Active',
  // @ts-expect-error public cloud-account DTOs must not expose service-principal secrets.
  secret: 'service-principal-secret',
};

const actionExecutionSource: ActionExecutionSource = {
  kind: 'schedule',
  scheduleId: 'schedule-1',
  scheduleRunId: 'run-1',
  occurrenceId: 'schedule-1:2026-05-19T08:00:00Z',
  desiredOutcome: 'running',
};

const actionExecutionRequestMessage: ActionExecutionRequestMessage = {
  entity: 'actions',
  action: 'execute',
  companyId: 'company-1',
  cloudAccountId: 'cloud-account-1',
  tenantId: 'tenant-1',
  clientId: 'client-1',
  subscriptionId: 'subscription-1',
  providerName: 'azure',
  providerScopeId: 'subscription-1',
  actionDefinitionId: 'compute-virtualmachines_start',
  resourceIds: ['/subscriptions/subscription-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm1'],
  byUserId: 'user-1',
  source: actionExecutionSource,
  tracing,
};

const baseRequestMessage: RequestMessage = actionExecutionRequestMessage;

const tracedRequestMessage: RequestMessage = {
  entity: 'cloudaccounts',
  action: 'refreshcomponents',
  companyId: 'company-1',
  cloudAccountId: 'cloud-account-1',
  tenantId: 'tenant-1',
  clientId: 'client-1',
  refreshComponents: ['costestimation'],
  tracing,
};

const billingReconciliationWorkMetadata: BillingReconciliationWorkMetadata = {
  schemaVersion: 1,
  trigger: 'scheduled',
  policyVersion: 'closed-month-v1',
  requestedMonths: ['2026-05', '2026-04', '2026-03'],
  continuationCursor: null,
};

const billingReconciliationRequestMessage: CloudAccountsBillingReconciliationRequestMessage = {
  requestId: 'billing-reconciliation-request-1',
  entity: 'cloudaccounts',
  action: 'reconcile-billing',
  companyId: '*',
  cloudAccountId: '*',
  tenantId: '*',
  clientId: '*',
  source: 'scheduled',
  metadata: {
    triggeredBy: 'billing-reconciliation-cron',
  },
};

const baseBillingReconciliationRequestMessage: RequestMessage = billingReconciliationRequestMessage;

const scheduledRefreshRequestMessage: CloudAccountsScheduledRefreshRequestMessage = {
  entity: 'cloudaccounts',
  action: 'refresh',
  companyId: '*',
  cloudAccountId: '*',
  tenantId: '*',
  clientId: '*',
  source: 'scheduled',
  requestId: 'refresh:scheduled:2026-08-30T12:00:00.000Z',
};

const scheduledComponentRefreshRequestMessage: CloudAccountsScheduledRefreshRequestMessage = {
  ...scheduledRefreshRequestMessage,
  action: 'refreshcomponents',
  refreshComponents: ['billing', 'activities'],
  requestId: 'refreshcomponents:scheduled:2026-08-30T16:30:00.000Z',
};

const baseScheduledRefreshRequestMessage: RequestMessage = scheduledRefreshRequestMessage;

// requestId is optional for rollout compatibility: an older API emits the message without it.
const { requestId: _removedScheduledRefreshRequestId, ...scheduledRefreshWithoutRequestId } = scheduledRefreshRequestMessage;
const legacyScheduledRefreshRequestMessage: CloudAccountsScheduledRefreshRequestMessage = scheduledRefreshWithoutRequestId;

const invalidScheduledRefreshAction: CloudAccountsScheduledRefreshRequestMessage = {
  ...scheduledRefreshRequestMessage,
  // @ts-expect-error Scheduled refresh uses the refresh or refreshcomponents action.
  action: 'reconcile-billing',
};

const invalidScheduledRefreshCompanyWildcard: CloudAccountsScheduledRefreshRequestMessage = {
  ...scheduledRefreshRequestMessage,
  // @ts-expect-error The scheduled refresh command must not be scoped to one company.
  companyId: 'comp-123',
};

const invalidScheduledRefreshSource: CloudAccountsScheduledRefreshRequestMessage = {
  ...scheduledRefreshRequestMessage,
  // @ts-expect-error Scheduled refresh messages are emitted by cron only.
  source: 'manual',
};

const billingReconciliationSubscriptionMessage: BillingReconciliationSubscriptionMessage = {
  requestId: billingReconciliationRequestMessage.requestId,
  subscription,
  companyId: 'comp-123',
  cloudAccountId: 'cloud-account-123',
  tenantId: 'tenant-123',
  clientId: 'client-123',
  refreshComponents: ['billing'],
  metadata: {
    billingReconciliation: billingReconciliationWorkMetadata,
  },
};

const baseBillingReconciliationSubscriptionMessage: SubscriptionMessage = billingReconciliationSubscriptionMessage;

const { requestId: _removedBillingReconciliationRequestId, ...billingReconciliationRequestWithoutRequestId } = billingReconciliationRequestMessage;
// @ts-expect-error Billing reconciliation wildcard requests require a request identity.
const missingBillingReconciliationRequestId: CloudAccountsBillingReconciliationRequestMessage = billingReconciliationRequestWithoutRequestId;

const invalidBillingReconciliationEntity: CloudAccountsBillingReconciliationRequestMessage = {
  ...billingReconciliationRequestMessage,
  // @ts-expect-error Billing reconciliation wildcard requests target cloudaccounts.
  entity: 'cloudaccount',
};

const invalidBillingReconciliationAction: CloudAccountsBillingReconciliationRequestMessage = {
  ...billingReconciliationRequestMessage,
  // @ts-expect-error Billing reconciliation wildcard requests use the reconcile-billing action.
  action: 'refreshcomponents',
};

const invalidBillingReconciliationSource: CloudAccountsBillingReconciliationRequestMessage = {
  ...billingReconciliationRequestMessage,
  // @ts-expect-error The first shared reconciliation trigger is scheduled only.
  source: 'manual',
};

const invalidBillingReconciliationCompanyWildcard: CloudAccountsBillingReconciliationRequestMessage = {
  ...billingReconciliationRequestMessage,
  // @ts-expect-error The global command must not be scoped to one company.
  companyId: 'comp-123',
};

const invalidBillingReconciliationCloudAccountWildcard: CloudAccountsBillingReconciliationRequestMessage = {
  ...billingReconciliationRequestMessage,
  // @ts-expect-error The global command must not be scoped to one cloud account.
  cloudAccountId: 'cloud-account-123',
};

const invalidBillingReconciliationTenantWildcard: CloudAccountsBillingReconciliationRequestMessage = {
  ...billingReconciliationRequestMessage,
  // @ts-expect-error The global command must not be scoped to one tenant.
  tenantId: 'tenant-123',
};

const invalidBillingReconciliationClientWildcard: CloudAccountsBillingReconciliationRequestMessage = {
  ...billingReconciliationRequestMessage,
  // @ts-expect-error The global command must not be scoped to one client.
  clientId: 'client-123',
};

const { metadata: _removedBillingReconciliationTriggerMetadata, ...billingReconciliationRequestWithoutMetadata } =
  billingReconciliationRequestMessage;
// @ts-expect-error Billing reconciliation wildcard requests require trigger metadata.
const missingBillingReconciliationTriggerMetadata: CloudAccountsBillingReconciliationRequestMessage = billingReconciliationRequestWithoutMetadata;

const invalidBillingReconciliationTriggerMetadata: CloudAccountsBillingReconciliationRequestMessage = {
  ...billingReconciliationRequestMessage,
  metadata: {
    // @ts-expect-error The shared trigger metadata identifies the reconciliation cron.
    triggeredBy: 'component-refresh-cron',
  },
};

// @ts-expect-error Reconciliation work requires the selected month list.
const incompleteBillingReconciliationWorkMetadata: BillingReconciliationWorkMetadata = {
  schemaVersion: 1,
  trigger: 'scheduled',
  policyVersion: 'closed-month-v1',
};

const { policyVersion: _removedBillingReconciliationPolicyVersion, ...billingReconciliationWorkWithoutPolicyVersion } =
  billingReconciliationWorkMetadata;
// @ts-expect-error Reconciliation work requires the policy version used to select months.
const missingBillingReconciliationPolicyVersion: BillingReconciliationWorkMetadata = billingReconciliationWorkWithoutPolicyVersion;

const invalidBillingReconciliationSchemaVersion: BillingReconciliationWorkMetadata = {
  ...billingReconciliationWorkMetadata,
  // @ts-expect-error Reconciliation work currently uses schema version 1.
  schemaVersion: 2,
};

const invalidBillingReconciliationWorkTrigger: BillingReconciliationWorkMetadata = {
  ...billingReconciliationWorkMetadata,
  // @ts-expect-error The first reconciliation work trigger is scheduled only.
  trigger: 'manual',
};

const invalidBillingReconciliationSubscriptionComponent: BillingReconciliationSubscriptionMessage = {
  ...billingReconciliationSubscriptionMessage,
  // @ts-expect-error Reconciliation subscription work is billing-only.
  refreshComponents: ['activities'],
};

const { metadata: _removedBillingReconciliationWork, ...billingReconciliationSubscriptionWithoutMetadata } = billingReconciliationSubscriptionMessage;
// @ts-expect-error Reconciliation subscription work requires its nested work metadata.
const missingBillingReconciliationWork: BillingReconciliationSubscriptionMessage = billingReconciliationSubscriptionWithoutMetadata;

// @ts-expect-error ActionExecutionRequestMessage.actionDefinitionId is required.
const missingActionDefinitionId: ActionExecutionRequestMessage = {
  entity: 'actions',
  action: 'execute',
  companyId: 'company-1',
  cloudAccountId: 'cloud-account-1',
  tenantId: 'tenant-1',
  clientId: 'client-1',
  resourceIds: ['/subscriptions/subscription-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm1'],
};

// @ts-expect-error ActionExecutionRequestMessage.resourceIds is required.
const missingResourceIds: ActionExecutionRequestMessage = {
  entity: 'actions',
  action: 'execute',
  companyId: 'company-1',
  cloudAccountId: 'cloud-account-1',
  tenantId: 'tenant-1',
  clientId: 'client-1',
  actionDefinitionId: 'compute-virtualmachines_start',
};

const scaleOutActionExecutionSource: ActionExecutionSource = {
  kind: 'schedule',
  desiredOutcome: 'scale-out',
};

const createPolicyExemptionRequestMessage: CreatePolicyExemptionRequestMessage = {
  entity: 'governance',
  action: 'create-policy-exemption',
  schemaVersion: POLICY_EXEMPTION_COMMAND_SCHEMA_VERSION,
  providerName: 'azure',
  companyId: 'company-1',
  cloudAccountId: 'cloud-account-1',
  tenantId: 'tenant-1',
  clientId: 'client-1',
  subscriptionId: 'subscription-1',
  eventId: 'policy-exemption-event-1',
  byUserId: 'user-1',
  requestId: 'policy-exemption-request-1',
  targetScope: '/subscriptions/subscription-1/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/storage1',
  policyAssignmentId: '/subscriptions/subscription-1/providers/Microsoft.Authorization/policyAssignments/iso-27001',
  policyDefinitionReferenceIds: ['storagePublicAccess'],
  category: 'Waiver',
  displayName: 'Temporary public access waiver',
  description: 'Public access is accepted while the private endpoint migration completes.',
  expiresOn: '2026-09-01T00:00:00.000Z',
  metadata: {
    ticketRef: 'SEC-123',
    requestedBy: 'Platform team',
    approvedBy: 'Security',
  },
};

const { policyDefinitionReferenceIds: _removedPolicyDefinitionReferenceIds, ...policyExemptionWithoutReferenceIds } =
  createPolicyExemptionRequestMessage;
// @ts-expect-error CreatePolicyExemptionRequestMessage.policyDefinitionReferenceIds is required.
const missingPolicyExemptionReferenceIds: CreatePolicyExemptionRequestMessage = policyExemptionWithoutReferenceIds;

const { action: _removedPolicyExemptionAction, ...policyExemptionWithoutAction } = createPolicyExemptionRequestMessage;
// @ts-expect-error CreatePolicyExemptionRequestMessage.action is required.
const missingPolicyExemptionAction: CreatePolicyExemptionRequestMessage = policyExemptionWithoutAction;

const { targetScope: _removedPolicyExemptionTarget, ...policyExemptionWithoutTarget } = createPolicyExemptionRequestMessage;
// @ts-expect-error CreatePolicyExemptionRequestMessage.targetScope is required.
const missingPolicyExemptionTarget: CreatePolicyExemptionRequestMessage = policyExemptionWithoutTarget;

const { policyAssignmentId: _removedPolicyAssignmentId, ...policyExemptionWithoutAssignment } = createPolicyExemptionRequestMessage;
// @ts-expect-error CreatePolicyExemptionRequestMessage.policyAssignmentId is required.
const missingPolicyExemptionAssignment: CreatePolicyExemptionRequestMessage = policyExemptionWithoutAssignment;

const { category: _removedPolicyExemptionCategory, ...policyExemptionWithoutCategory } = createPolicyExemptionRequestMessage;
// @ts-expect-error CreatePolicyExemptionRequestMessage.category is required.
const missingPolicyExemptionCategory: CreatePolicyExemptionRequestMessage = policyExemptionWithoutCategory;

const { description: _removedPolicyExemptionDescription, ...policyExemptionWithoutDescription } = createPolicyExemptionRequestMessage;
// @ts-expect-error CreatePolicyExemptionRequestMessage.description is required.
const missingPolicyExemptionDescription: CreatePolicyExemptionRequestMessage = policyExemptionWithoutDescription;

const invalidPolicyExemptionSchemaVersion: CreatePolicyExemptionRequestMessage = {
  ...createPolicyExemptionRequestMessage,
  // @ts-expect-error Policy exemption queue messages require the published schema version.
  schemaVersion: '2.0.0',
};

void publicCloudAccount;
void startRequest;
void reconnectRequest;
void (null as unknown as InvalidDelegatedConnectionStartResponse);
void (null as unknown as InvalidDelegatedReconnectResponse);
void tenantSelectionRequest;
void (null as unknown as InvalidDelegatedTenantSelectionResponse);
void portalRedirectStatus;
void tenantItem;
void onboardingResponse;
void confirmSubscriptionsRequest;
void confirmSubscriptionsResponse;
void replaceWithServicePrincipalRequest;
void replaceWithServicePrincipalResponse;
void trialExtensionRequest;
void invalidTrialExtensionRequest;
void trialExtensionResponse;
void guestAccessReviewChecklistManualScanRequest;
void invalidPublicDelegatedDto;
void actionExecutionRequestMessage;
void baseRequestMessage;
void tracedRequestMessage;
void billingReconciliationWorkMetadata;
void billingReconciliationRequestMessage;
void baseBillingReconciliationRequestMessage;
void billingReconciliationSubscriptionMessage;
void baseBillingReconciliationSubscriptionMessage;
void missingBillingReconciliationRequestId;
void invalidBillingReconciliationEntity;
void invalidBillingReconciliationAction;
void invalidBillingReconciliationSource;
void invalidBillingReconciliationCompanyWildcard;
void invalidBillingReconciliationCloudAccountWildcard;
void invalidBillingReconciliationTenantWildcard;
void invalidBillingReconciliationClientWildcard;
void missingBillingReconciliationTriggerMetadata;
void invalidBillingReconciliationTriggerMetadata;
void incompleteBillingReconciliationWorkMetadata;
void missingBillingReconciliationPolicyVersion;
void invalidBillingReconciliationSchemaVersion;
void invalidBillingReconciliationWorkTrigger;
void invalidBillingReconciliationSubscriptionComponent;
void missingBillingReconciliationWork;
void missingActionDefinitionId;
void missingResourceIds;
void scaleOutActionExecutionSource;
void createPolicyExemptionRequestMessage;
void missingPolicyExemptionReferenceIds;
void missingPolicyExemptionAction;
void missingPolicyExemptionTarget;
void missingPolicyExemptionAssignment;
void missingPolicyExemptionCategory;
void missingPolicyExemptionDescription;
void invalidPolicyExemptionSchemaVersion;
void azureSpSetupExecutionMessageHasNoForbiddenKeys;
void azureSpSetupMaintenanceMessageHasNoForbiddenKeys;
void azureSpSetupInitialExecutionMessage;
void azureSpSetupContinuationMessage;
void azureSpSetupMaintenanceMessage;
void azureSpSetupRequestMessageCompatibility;
void invalidAzureSpSetupExecutionWithoutSetupId;
void invalidAzureSpSetupExecutionWithoutExecutionId;
void invalidAzureSpSetupExecutionMessageWithToken;
void invalidAzureSpSetupExecutionMessageWithMetadata;
void invalidAzureSpSetupExecutionMessageWithBrokerId;
void invalidAzureSpSetupExecutionSchemaVersion;
void invalidAzureSpSetupMaintenanceSentinel;
void invalidAzureSpSetupMaintenanceSchemaVersion;
void scheduledRefreshRequestMessage;
void scheduledComponentRefreshRequestMessage;
void baseScheduledRefreshRequestMessage;
void legacyScheduledRefreshRequestMessage;
void invalidScheduledRefreshAction;
void invalidScheduledRefreshCompanyWildcard;
void invalidScheduledRefreshSource;
