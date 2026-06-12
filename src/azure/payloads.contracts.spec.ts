import type { SubscriptionMessage } from './payloads';
import type { Subscription } from './subscriptions';
import type * as PackageContracts from '../index';
import type {
  ActionExecutionRequestMessage,
  ActionExecutionSource,
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
void invalidPublicDelegatedDto;
void actionExecutionRequestMessage;
void baseRequestMessage;
void tracedRequestMessage;
void missingActionDefinitionId;
void missingResourceIds;
void scaleOutActionExecutionSource;
