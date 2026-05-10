import type { CloudAccountTenantSyncRequestMessage, SubscriptionMessage } from './payloads';
import type { Subscription } from './subscriptions';
import type * as PackageContracts from '../index';
import type {
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
  PublicCloudAccountDto,
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

void subscriptionMessage;

// @ts-expect-error SubscriptionMessage.companyId is required for queue payload compatibility.
const invalidSubscriptionMessage: SubscriptionMessage = {
  subscription,
};

void invalidSubscriptionMessage;

const tenantSyncMessage: CloudAccountTenantSyncRequestMessage = {
  entity: 'cloudaccount',
  action: 'tenant-sync',
  companyId: 'comp-123',
  cloudAccountId: 'cloud-account-123',
  tenantId: 'tenant-123',
  clientId: 'client-123',
  source: 'onboarding',
  runId: 'tenant-sync-run-123',
};

void tenantSyncMessage;

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
