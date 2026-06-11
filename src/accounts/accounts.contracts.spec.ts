import type {
  AzureDelegatedAuthErrorCode,
  CloudAccount,
  CloudAccountAuthMode,
  CloudAccountFirstSyncNotificationStatus,
  PublicCloudAccountDto,
} from './accounts';
import type { CloudAccountTenantSyncRequestMessage } from '../index';
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
const delegatedAuthErrorCode: AzureDelegatedAuthErrorCode = 'claims_challenge';

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
  connectedUserEmail: 'owner@example.com',
  secretPreview: 'abc*****',
  writeSecretPreview: 'xyz*****',
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
void delegatedAuthErrorCode;
void publicCloudAccountDto;
void invalidPublicCloudAccountTokenCacheDto;
void invalidPublicCloudAccountSecretDto;
void invalidPublicCloudAccountWriteSecretDto;
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
