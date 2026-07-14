import type { SubscriptionMessage } from './payloads';
import type { Subscription } from './subscriptions';
import type * as PackageContracts from '../index';
import type {
  ActionExecutionRequestMessage,
  ActionExecutionSource,
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
  CloudAccountTenantSyncRequest,
  PublicCloudAccountDto,
  ProcessPayload,
  RequestMessage,
  ReviewChecklistPayload,
  SubscriptionSyncRequest,
  WorkflowTracingOptions,
} from '../index';

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
  tracing,
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
void missingActionDefinitionId;
void missingResourceIds;
void scaleOutActionExecutionSource;
