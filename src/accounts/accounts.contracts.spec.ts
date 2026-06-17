import type {
  AzureCloudAccountSyncFeatureId,
  AzureSyncFeatureId,
  AzureSubscriptionSyncFeatureId,
  AzureGdapCapabilityStatus,
  AzureGdapAuthorizationProfileSummary,
  AzureGdapAuthorizationProfileListResponse,
  AzureGdapCloudAccountCreateRequest,
  AzureGdapCloudAccountMetadata,
  AzureGdapCloudAccountStatusResponse,
  AzureGdapCreateAuthorizationProfileRequest,
  AzureGdapDraftValidationRequest,
  AzureGdapDraftValidationResponse,
  AzureGdapEligibleAuthorizationProfilesResponse,
  AzureGdapPartnerAuthorizationStartResponse,
  AzureGdapStartPartnerAuthorizationRequest,
  AzureGdapValidationStatus,
  AzureDelegatedAuthErrorCode,
  AzureGuestAccessScanSchedulingMode,
  AzureGuestAccessStatus,
  AzureGuestAccessStatusReason,
  CloudAccount,
  CloudAccountAuthMode,
  CloudAccountScanSchedulingMode,
  CloudAccountFirstSyncNotificationStatus,
  CloudAccountSyncFeatureOptOutsUpdateRequest,
  PublicCloudAccountDto,
  SubscriptionAccount,
  SubscriptionInfoBase,
  SubscriptionSyncFeatureOptOutsUpdateRequest,
} from './accounts';
import type { CloudAccountTenantSyncRequestMessage } from '../index';
import type { CompanySubscription } from '../azure/subscriptions';
import {
  AZURE_SYNC_FEATURE_METADATA,
  AZURE_SYNC_FEATURE_ORDER,
  getAzureSyncFeatureIdsForScope,
  getAzureSyncFeatureMetadata,
  getAzureSyncFeatureOptions,
  isAzureSyncFeatureId,
  isAzureSyncFeatureSupportedInScope,
  sortAzureSyncFeatureIds,
} from './accounts';
import {
  CloudAccountReadPermission,
  SubscriptionReadPermission,
  CLOUD_ACCOUNT_READ_PERMISSIONS_METADATA,
  SUBSCRIPTION_READ_PERMISSIONS_METADATA,
} from './readPermissions';

const cloudAccountWithRecommendationEffortProfile: CloudAccount = {
  companyId: 'comp-123',
  id: 'tenant-client-id-123',
  name: 'Production Azure Tenant',
  companyName: 'Spotto',
  provider: 'Azure',
  tenantId: 'tenant-123',
  createdAt: new Date('2026-03-29T00:00:00.000Z'),
  updatedAt: new Date('2026-03-29T00:00:00.000Z'),
  createdBy: 'user-123',
  status: 'Active',
  effortProfile: 'enterprise',
  readBitmask: CloudAccountReadPermission.ManagementGroupReader | CloudAccountReadPermission.GraphApplicationReadAll,
  syncFeatureOptOuts: ['activityMonitoring', 'relationshipGraphs'],
};

const cloudAccountWithoutRecommendationEffortProfile: CloudAccount = {
  ...cloudAccountWithRecommendationEffortProfile,
  id: 'tenant-client-id-456',
  effortProfile: undefined,
};

const servicePrincipalAccountWithoutAuthMode: CloudAccount = {
  ...cloudAccountWithRecommendationEffortProfile,
  id: 'tenant-client-id-sp-compat',
};

const delegatedCloudAccount: CloudAccount = {
  ...cloudAccountWithRecommendationEffortProfile,
  id: 'delegated-account-123',
  authMode: 'delegatedUser',
  onboardingStatus: 'active',
  scanSchedulingMode: 'onDemandOnly',
  guestAccessStatus: 'completed',
  guestAccessStatusReason: 'billing_2m_failed',
  guestAccessRunId: 'guest-run-123',
  guestAccessLastRunId: 'guest-run-122',
  guestAccessQueuedAt: '2026-06-16T08:00:00.000Z',
  guestAccessScanStartedAt: '2026-06-16T08:01:00.000Z',
  guestAccessScanCompletedAt: '2026-06-16T08:30:00.000Z',
  guestAccessLastSuccessfulScanAt: '2026-06-16T08:30:00.000Z',
  delegatedTokenCache: 'internal-token-cache',
  delegatedSetupExpiresAt: '2026-05-17T00:00:00.000Z',
  delegatedTrialStartedAt: new Date('2026-05-10T00:00:00.000Z'),
  delegatedTrialExpiresAt: '2026-06-09T00:00:00.000Z',
  reauthRequired: false,
  lastAuthErrorCode: 'interaction_required',
  lastAuthErrorAt: '2026-05-11T00:00:00.000Z',
  connectedUserObjectId: 'user-object-123',
  connectedUserTenantId: 'tenant-123',
  connectedUserEmail: 'owner@example.com',
  connectedUserDisplayName: 'Azure Owner',
  connectedAt: '2026-05-10T00:00:00.000Z',
  lastTokenRefreshAt: new Date('2026-05-10T01:00:00.000Z'),
  lastDelegatedTokenCacheUpdatedAt: '2026-05-10T01:00:00.000Z',
};

const delegatedAuthMode: CloudAccountAuthMode = 'delegatedUser';
const gdapAuthMode: CloudAccountAuthMode = 'gdap';
const delegatedAuthErrorCode: AzureDelegatedAuthErrorCode = 'claims_challenge';
const cloudAccountScanSchedulingMode: CloudAccountScanSchedulingMode = 'daily';
const guestAccessScanSchedulingMode: AzureGuestAccessScanSchedulingMode = 'onDemandOnly';
const guestAccessStatus: AzureGuestAccessStatus = 'tenantAuthorizationRequired';
const guestAccessStatusReason: AzureGuestAccessStatusReason = 'refresh_requires_interaction';
const gdapValidationStatus: AzureGdapValidationStatus = 'degraded';

// @ts-expect-error guest access scan scheduling is on-demand only.
const invalidGuestAccessScanSchedulingMode: AzureGuestAccessScanSchedulingMode = 'daily';

const gdapCapabilityStatus: AzureGdapCapabilityStatus = {
  key: 'partnerAuthorization',
  status: 'ready',
  checkedAt: '2026-06-11T00:00:00.000Z',
};

const gdapCloudAccountMetadata: AzureGdapCloudAccountMetadata = {
  gdapAuthorizationCompanyId: 'root-msp-123',
  gdapAuthorizationProfileId: 'gdapauth-profile-123',
  gdapPartnerTenantId: 'partner-tenant-123',
  gdapCustomerTenantId: 'customer-tenant-123',
  gdapRelationshipId: 'relationship-123',
  gdapRelationshipDisplayName: 'Customer GDAP relationship',
  gdapRelationshipStatus: 'active',
  gdapAccessAssignmentId: 'assignment-123',
  gdapAccessAssignmentStatus: 'active',
  gdapSecurityGroupId: 'security-group-123',
  gdapSecurityGroupDisplayName: 'Azure Managers',
  gdapRoles: [
    {
      roleTemplateId: 'directory-readers-template-id',
      displayName: 'Directory Readers',
    },
  ],
  gdapExpiresAt: '2026-12-11T00:00:00.000Z',
  gdapPartnerAuthorizationStatus: 'ready',
  gdapAppConsentStatus: 'ready',
  gdapLastValidatedAt: '2026-06-11T00:00:00.000Z',
  gdapLastValidationStatus: 'degraded',
  gdapLastValidationErrorCode: 'cost_management_unavailable',
  gdapLastValidationMessage: 'Cost Management read access is unavailable.',
  gdapScheduledEligible: false,
  gdapScheduledEligibilityReason: 'Manual validation required before scheduled scans are enabled.',
  gdapCapabilities: [gdapCapabilityStatus],
};

const gdapCloudAccount: CloudAccount = {
  ...cloudAccountWithRecommendationEffortProfile,
  id: 'gdap-account-123',
  authMode: 'gdap',
  tenantId: 'customer-tenant-123',
  gdapAuthorizationCompanyId: 'root-msp-123',
  gdapAuthorizationProfileId: 'gdapauth-profile-123',
  gdapPartnerTenantId: 'partner-tenant-123',
  gdapCustomerTenantId: 'customer-tenant-123',
  gdapRelationshipId: 'relationship-123',
  gdapRelationshipDisplayName: 'Customer GDAP relationship',
  gdapRelationshipStatus: 'active',
  gdapAccessAssignmentId: 'assignment-123',
  gdapAccessAssignmentStatus: 'active',
  gdapSecurityGroupId: 'security-group-123',
  gdapSecurityGroupDisplayName: 'Azure Managers',
  gdapRolesJson: JSON.stringify(gdapCloudAccountMetadata.gdapRoles),
  gdapExpiresAt: '2026-12-11T00:00:00.000Z',
  gdapPartnerAuthorizationStatus: 'ready',
  gdapAppConsentStatus: 'ready',
  gdapLastValidatedAt: new Date('2026-06-11T00:00:00.000Z'),
  gdapLastValidationStatus: 'degraded',
  gdapLastValidationErrorCode: 'cost_management_unavailable',
  gdapLastValidationMessage: 'Cost Management read access is unavailable.',
  gdapScheduledEligible: false,
  gdapScheduledEligibilityReason: 'Manual validation required before scheduled scans are enabled.',
  gdapCapabilities: [gdapCapabilityStatus],
  gdapCredentialReference: 'internal-gdap-credential-reference',
};

const gdapAuthorizationProfileSummary: AzureGdapAuthorizationProfileSummary = {
  id: 'gdapauth-profile-123',
  companyId: 'root-msp-123',
  displayName: 'Root MSP GDAP authorization',
  partnerTenantId: 'partner-tenant-123',
  authorizationStatus: 'ready',
  hasCredential: true,
  authorizedAt: '2026-06-11T00:00:00.000Z',
  expiresAt: '2026-12-11T00:00:00.000Z',
  lastValidatedAt: '2026-06-11T00:00:00.000Z',
  lastValidationStatus: 'ready',
  createdAt: '2026-06-10T00:00:00.000Z',
  updatedAt: '2026-06-11T00:00:00.000Z',
};

const invalidGdapAuthorizationProfileSummaryWithCredentialReference: AzureGdapAuthorizationProfileSummary = {
  ...gdapAuthorizationProfileSummary,
  // @ts-expect-error public authorization profile summaries must not expose credential references.
  credentialReference: 'cloudaccounts/credentials/gdap/profile-token-cache.json',
};

const gdapAuthorizationProfileListResponse: AzureGdapAuthorizationProfileListResponse = {
  profiles: [gdapAuthorizationProfileSummary],
};

const gdapEligibleAuthorizationProfilesResponse: AzureGdapEligibleAuthorizationProfilesResponse = {
  rootCompanyId: 'root-msp-123',
  profiles: [gdapAuthorizationProfileSummary],
};

const gdapCreateAuthorizationProfileRequest: AzureGdapCreateAuthorizationProfileRequest = {
  displayName: 'Root MSP GDAP authorization',
  partnerTenantId: 'partner-tenant-123',
};

const gdapStartPartnerAuthorizationRequest: AzureGdapStartPartnerAuthorizationRequest = {
  redirectAfter: '/companies/root-msp-123/cloud-accounts/connect-gdap',
};

const gdapPartnerAuthorizationStartResponse: AzureGdapPartnerAuthorizationStartResponse = {
  profileId: 'gdapauth-profile-123',
  authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=spotto-gdap-client-id',
  expiresAt: '2026-06-11T01:00:00.000Z',
};

const gdapDraftValidationRequest: AzureGdapDraftValidationRequest = {
  gdapAuthorizationCompanyId: 'root-msp-123',
  gdapAuthorizationProfileId: 'gdapauth-profile-123',
  gdapPartnerTenantId: 'partner-tenant-123',
  gdapCustomerTenantId: 'customer-tenant-123',
  tenantId: 'customer-tenant-123',
  gdapRelationshipId: 'relationship-123',
  gdapAccessAssignmentId: 'assignment-123',
  gdapSecurityGroupId: 'security-group-123',
};

const gdapDraftValidationResponse: AzureGdapDraftValidationResponse = {
  valid: true,
  status: 'ready',
  profile: gdapAuthorizationProfileSummary,
  capabilities: [gdapCapabilityStatus],
  message: 'GDAP validation succeeded.',
};

const gdapCloudAccountStatusResponse: AzureGdapCloudAccountStatusResponse = {
  cloudAccountId: 'gdap-account-123',
  companyId: 'customer-company-123',
  status: 'degraded',
  partnerAuthorizationStatus: 'ready',
  appConsentStatus: 'ready',
  lastValidatedAt: '2026-06-11T00:00:00.000Z',
  lastValidationStatus: 'degraded',
  lastValidationErrorCode: 'cost_management_unavailable',
  lastValidationMessage: 'Cost Management read access is unavailable.',
  scheduledEligible: false,
  scheduledEligibilityReason: 'Manual validation required before scheduled scans are enabled.',
  capabilities: [gdapCapabilityStatus],
};

const gdapCloudAccountCreateRequest: AzureGdapCloudAccountCreateRequest = {
  companyId: 'customer-company-123',
  name: 'GDAP Azure Account',
  provider: 'Azure',
  authMode: 'gdap',
  tenantId: 'customer-tenant-123',
  gdapCustomerTenantId: 'customer-tenant-123',
  gdapPartnerTenantId: 'partner-tenant-123',
  gdapRelationshipId: 'relationship-123',
  gdapAccessAssignmentId: 'assignment-123',
  gdapSecurityGroupId: 'security-group-123',
  gdapAuthorizationCompanyId: 'root-msp-123',
  gdapAuthorizationProfileId: 'gdapauth-profile-123',
};

const publicCloudAccountDto: PublicCloudAccountDto = {
  companyId: 'comp-123',
  id: 'delegated-account-123',
  name: 'Delegated Azure Account',
  companyName: 'Spotto',
  provider: 'Azure',
  authMode: 'delegatedUser',
  tenantId: 'tenant-123',
  createdAt: new Date('2026-03-29T00:00:00.000Z'),
  updatedAt: new Date('2026-03-29T00:00:00.000Z'),
  createdBy: 'user-123',
  status: 'Active',
  onboardingStatus: 'active',
  scanSchedulingMode: 'onDemandOnly',
  guestAccessStatus: 'completed',
  guestAccessStatusReason: 'billing_2m_failed',
  guestAccessRunId: 'guest-run-123',
  guestAccessLastSuccessfulScanAt: '2026-06-16T08:30:00.000Z',
  connectedUserEmail: 'owner@example.com',
  secretPreview: 'abc*****',
  writeSecretPreview: 'xyz*****',
  syncFeatureOptOuts: ['billing'],
};

const azureSyncFeatureId: AzureSyncFeatureId = 'activityMonitoring';

// @ts-expect-error resource inventory is always enabled and cannot be configured as an opt-out.
const invalidAzureSyncFeatureId: AzureSyncFeatureId = 'resourceInventory';

const azureSyncFeatureOrderShapeCheck: readonly AzureSyncFeatureId[] = AZURE_SYNC_FEATURE_ORDER;
const azureCloudAccountSyncFeatureId: AzureCloudAccountSyncFeatureId = 'availabilityZones';
const azureSubscriptionSyncFeatureId: AzureSubscriptionSyncFeatureId = 'activityMonitoring';

// @ts-expect-error availability zones are cloud-account scoped and cannot be configured directly on a subscription.
const invalidAzureSubscriptionSyncFeatureId: AzureSubscriptionSyncFeatureId = 'availabilityZones';

const azureSyncFeatureMetadataShapeCheck = AZURE_SYNC_FEATURE_METADATA.map(item => ({
  id: item.id,
  displayName: item.displayName,
  description: item.description,
  supportedScopes: item.supportedScopes,
  warning: 'warning' in item ? item.warning : undefined,
}));

const azureSyncFeatureHelperShapeCheck: {
  isKnown: boolean;
  availabilityZonesCloudAccountOnly: boolean;
  subscriptionOptions: readonly { id: AzureSyncFeatureId }[];
  subscriptionOptionIds: AzureSyncFeatureId[];
  metadata: { id: AzureSyncFeatureId };
  sorted: AzureSyncFeatureId[];
} = {
  isKnown: isAzureSyncFeatureId('activityMonitoring'),
  availabilityZonesCloudAccountOnly:
    isAzureSyncFeatureSupportedInScope('availabilityZones', 'cloudAccount') &&
    !isAzureSyncFeatureSupportedInScope('availabilityZones', 'subscription'),
  subscriptionOptions: getAzureSyncFeatureOptions('subscription'),
  subscriptionOptionIds: getAzureSyncFeatureIdsForScope('subscription'),
  metadata: getAzureSyncFeatureMetadata('billing'),
  sorted: sortAzureSyncFeatureIds(['pricing', 'activityMonitoring']),
};

const cloudAccountSyncFeatureOptOutsUpdateRequest: CloudAccountSyncFeatureOptOutsUpdateRequest = {
  syncFeatureOptOuts: ['activityMonitoring', 'commitments', 'availabilityZones'],
};

const subscriptionSyncFeatureOptOutsUpdateRequest: SubscriptionSyncFeatureOptOutsUpdateRequest = {
  syncFeatureOptOuts: ['activityMonitoring', 'relationshipGraphs'],
};

const invalidSubscriptionSyncFeatureOptOutsUpdateRequest: SubscriptionSyncFeatureOptOutsUpdateRequest = {
  // @ts-expect-error availabilityZones is not configurable at subscription scope.
  syncFeatureOptOuts: ['availabilityZones'],
};

const invalidCloudAccountSyncFeatureOptOutsUpdateRequest: CloudAccountSyncFeatureOptOutsUpdateRequest = {
  // @ts-expect-error resourceInventory is not part of AzureSyncFeatureId.
  syncFeatureOptOuts: ['resourceInventory'],
};

const subscriptionInfoBaseWithSyncFeatureOptOuts: SubscriptionInfoBase = {
  name: 'Production Subscription',
  cloudAccountId: 'tenant-client-id-123',
  cloudAccountName: 'Production Azure Tenant',
  syncFeatureOptOuts: ['activityMonitoring'],
};

const subscriptionAccountWithSyncFeatureOptOuts: SubscriptionAccount = {
  ...subscriptionInfoBaseWithSyncFeatureOptOuts,
  id: 'sub-123',
  companyId: 'comp-123',
};

const companySubscriptionWithSyncFeatureOptOuts: CompanySubscription = {
  ...subscriptionInfoBaseWithSyncFeatureOptOuts,
  id: 'sub-123',
  companyId: 'comp-123',
};

const publicGdapCloudAccountDto: PublicCloudAccountDto = {
  ...publicCloudAccountDto,
  id: 'gdap-account-123',
  name: 'GDAP Azure Account',
  authMode: 'gdap',
  tenantId: 'customer-tenant-123',
  onboardingStatus: undefined,
  connectedUserEmail: undefined,
  gdapPartnerTenantId: 'partner-tenant-123',
  gdapAuthorizationCompanyId: 'root-msp-123',
  gdapAuthorizationProfileId: 'gdapauth-profile-123',
  gdapCustomerTenantId: 'customer-tenant-123',
  gdapRelationshipId: 'relationship-123',
  gdapRelationshipStatus: 'active',
  gdapAccessAssignmentId: 'assignment-123',
  gdapAccessAssignmentStatus: 'active',
  gdapPartnerAuthorizationStatus: 'ready',
  gdapAppConsentStatus: 'ready',
  gdapLastValidatedAt: '2026-06-11T00:00:00.000Z',
  gdapLastValidationStatus: 'degraded',
  gdapLastValidationErrorCode: 'cost_management_unavailable',
  gdapLastValidationMessage: 'Cost Management read access is unavailable.',
  gdapScheduledEligible: false,
  gdapScheduledEligibilityReason: 'Manual validation required before scheduled scans are enabled.',
  gdapCapabilities: [gdapCapabilityStatus],
};

const invalidPublicCloudAccountTokenCacheDto: PublicCloudAccountDto = {
  companyId: 'comp-123',
  id: 'public-account-123',
  name: 'Public Azure Account',
  companyName: 'Spotto',
  provider: 'Azure',
  createdAt: new Date('2026-05-10T00:00:00.000Z'),
  updatedAt: new Date('2026-05-10T00:00:00.000Z'),
  createdBy: 'user-123',
  status: 'Active',
  // @ts-expect-error public cloud-account DTOs must not expose token cache data.
  delegatedTokenCache: 'internal-token-cache',
};

const invalidPublicCloudAccountTokenRelayPayloadDto: PublicCloudAccountDto = {
  companyId: 'comp-123',
  id: 'public-account-token-relay-123',
  name: 'Public Azure Account With Token Relay',
  companyName: 'Spotto',
  provider: 'Azure',
  createdAt: new Date('2026-06-16T00:00:00.000Z'),
  updatedAt: new Date('2026-06-16T00:00:00.000Z'),
  createdBy: 'user-123',
  status: 'Active',
  // @ts-expect-error public cloud-account DTOs must not expose guest access token relay payloads.
  guestAccessTokenRelayPayload: 'encrypted-or-raw-token-relay-payload',
};

const invalidPublicCloudAccountTokenRelayReferenceDto: PublicCloudAccountDto = {
  companyId: 'comp-123',
  id: 'public-account-token-relay-ref-123',
  name: 'Public Azure Account With Token Relay Reference',
  companyName: 'Spotto',
  provider: 'Azure',
  createdAt: new Date('2026-06-16T00:00:00.000Z'),
  updatedAt: new Date('2026-06-16T00:00:00.000Z'),
  createdBy: 'user-123',
  status: 'Active',
  // @ts-expect-error public cloud-account DTOs must not expose token relay storage locators.
  guestAccessTokenRelayReference: 'cloudaccounts/guest-access/token-relay/run.json',
};

const invalidPublicCloudAccountSecretDto: PublicCloudAccountDto = {
  companyId: 'comp-123',
  id: 'public-account-secret-123',
  name: 'Public Azure Account With Secret',
  companyName: 'Spotto',
  provider: 'Azure',
  createdAt: new Date('2026-05-10T00:00:00.000Z'),
  updatedAt: new Date('2026-05-10T00:00:00.000Z'),
  createdBy: 'user-123',
  status: 'Active',
  // @ts-expect-error public cloud-account DTOs must not expose read secrets.
  secret: 'service-principal-secret',
};

const invalidPublicCloudAccountWriteSecretDto: PublicCloudAccountDto = {
  companyId: 'comp-123',
  id: 'public-account-write-secret-123',
  name: 'Public Azure Account With Write Secret',
  companyName: 'Spotto',
  provider: 'Azure',
  createdAt: new Date('2026-05-10T00:00:00.000Z'),
  updatedAt: new Date('2026-05-10T00:00:00.000Z'),
  createdBy: 'user-123',
  status: 'Active',
  // @ts-expect-error public cloud-account DTOs must not expose write secrets.
  writeSecret: 'write-service-principal-secret',
};

const invalidPublicCloudAccountGdapCredentialReferenceDto: PublicCloudAccountDto = {
  companyId: 'comp-123',
  id: 'public-gdap-account-123',
  name: 'Public GDAP Azure Account',
  companyName: 'Spotto',
  provider: 'Azure',
  authMode: 'gdap',
  createdAt: new Date('2026-06-11T00:00:00.000Z'),
  updatedAt: new Date('2026-06-11T00:00:00.000Z'),
  createdBy: 'user-123',
  status: 'Active',
  // @ts-expect-error public cloud-account DTOs must not expose GDAP credential references.
  gdapCredentialReference: 'internal-gdap-credential-reference',
};

const cloudAccountWithTenantSyncState: CloudAccount = {
  ...cloudAccountWithRecommendationEffortProfile,
  id: 'tenant-client-id-789',
  tenantSyncStatus: 'Requested',
  tenantSyncRequestedAt: new Date('2026-04-02T00:00:00.000Z'),
  tenantSyncSource: 'manual',
};

const cloudAccountWithFirstSyncNotification: CloudAccount = {
  ...cloudAccountWithRecommendationEffortProfile,
  id: 'tenant-client-id-first-sync',
  firstSyncNotificationStatus: 'Pending',
  firstSyncNotificationUserId: 'user-123',
};

const firstSyncNotificationStatus: CloudAccountFirstSyncNotificationStatus = 'Sending';

void cloudAccountWithRecommendationEffortProfile;
void cloudAccountWithoutRecommendationEffortProfile;
void servicePrincipalAccountWithoutAuthMode;
void delegatedCloudAccount;
void delegatedAuthMode;
void gdapAuthMode;
void delegatedAuthErrorCode;
void cloudAccountScanSchedulingMode;
void guestAccessScanSchedulingMode;
void guestAccessStatus;
void guestAccessStatusReason;
void invalidGuestAccessScanSchedulingMode;
void gdapValidationStatus;
void gdapCapabilityStatus;
void gdapCloudAccountMetadata;
void gdapCloudAccount;
void gdapAuthorizationProfileSummary;
void invalidGdapAuthorizationProfileSummaryWithCredentialReference;
void gdapAuthorizationProfileListResponse;
void gdapEligibleAuthorizationProfilesResponse;
void gdapCreateAuthorizationProfileRequest;
void gdapStartPartnerAuthorizationRequest;
void gdapPartnerAuthorizationStartResponse;
void gdapDraftValidationRequest;
void gdapDraftValidationResponse;
void gdapCloudAccountStatusResponse;
void gdapCloudAccountCreateRequest;
void publicCloudAccountDto;
void azureSyncFeatureId;
void invalidAzureSyncFeatureId;
void azureSyncFeatureOrderShapeCheck;
void azureCloudAccountSyncFeatureId;
void azureSubscriptionSyncFeatureId;
void invalidAzureSubscriptionSyncFeatureId;
void azureSyncFeatureMetadataShapeCheck;
void azureSyncFeatureHelperShapeCheck;
void cloudAccountSyncFeatureOptOutsUpdateRequest;
void subscriptionSyncFeatureOptOutsUpdateRequest;
void invalidSubscriptionSyncFeatureOptOutsUpdateRequest;
void invalidCloudAccountSyncFeatureOptOutsUpdateRequest;
void subscriptionInfoBaseWithSyncFeatureOptOuts;
void subscriptionAccountWithSyncFeatureOptOuts;
void companySubscriptionWithSyncFeatureOptOuts;
void publicGdapCloudAccountDto;
void invalidPublicCloudAccountTokenCacheDto;
void invalidPublicCloudAccountTokenRelayPayloadDto;
void invalidPublicCloudAccountTokenRelayReferenceDto;
void invalidPublicCloudAccountSecretDto;
void invalidPublicCloudAccountWriteSecretDto;
void invalidPublicCloudAccountGdapCredentialReferenceDto;
void cloudAccountWithTenantSyncState;
void cloudAccountWithFirstSyncNotification;
void firstSyncNotificationStatus;

const combinedSubscriptionReadPermission = SubscriptionReadPermission.MonitoringReader | SubscriptionReadPermission.LogAnalyticsDataReader;

const combinedCloudAccountReadPermission = CloudAccountReadPermission.ReservationsReader | CloudAccountReadPermission.SavingsPlanReader;

const subscriptionReadPermissionMetadataShapeCheck = SUBSCRIPTION_READ_PERMISSIONS_METADATA.map(item => ({
  id: item.id,
  displayName: item.displayName,
  requiredRoles: item.requiredRoles,
}));

const cloudAccountReadPermissionMetadataShapeCheck = CLOUD_ACCOUNT_READ_PERMISSIONS_METADATA.map(item => ({
  id: item.id,
  displayName: item.displayName,
  requiredRoles: item.requiredRoles,
}));

const invalidCloudAccountRecommendationEffortProfile: CloudAccount = {
  ...cloudAccountWithRecommendationEffortProfile,
  // @ts-expect-error recommendation effort profile must use the recommendation profile-name union.
  effortProfile: 'manual',
};

const invalidFirstSyncNotificationStatus: CloudAccount = {
  ...cloudAccountWithRecommendationEffortProfile,
  // @ts-expect-error first sync notification status must use the supported status union.
  firstSyncNotificationStatus: 'Queued',
};

const tenantSyncRequestMessage: CloudAccountTenantSyncRequestMessage = {
  entity: 'cloudaccount',
  action: 'tenant-sync',
  companyId: 'comp-123',
  cloudAccountId: 'tenant-client-id-123',
  tenantId: 'tenant-123',
  clientId: 'tenant-client-id-123',
  source: 'manual',
};

// @ts-expect-error CloudAccountTenantSyncRequestMessage.source is required.
const invalidTenantSyncRequestMessage: CloudAccountTenantSyncRequestMessage = {
  entity: 'cloudaccount',
  action: 'tenant-sync',
  companyId: 'comp-123',
  cloudAccountId: 'tenant-client-id-123',
  tenantId: 'tenant-123',
  clientId: 'tenant-client-id-123',
};

void invalidCloudAccountRecommendationEffortProfile;
void invalidFirstSyncNotificationStatus;
void tenantSyncRequestMessage;
void invalidTenantSyncRequestMessage;
void combinedSubscriptionReadPermission;
void combinedCloudAccountReadPermission;
void subscriptionReadPermissionMetadataShapeCheck;
void cloudAccountReadPermissionMetadataShapeCheck;
