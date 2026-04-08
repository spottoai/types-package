import type { CloudAccount } from './accounts';
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

const cloudAccountWithTenantSyncState: CloudAccount = {
  ...cloudAccountWithRecommendationEffortProfile,
  id: 'tenant-client-id-789',
  tenantSyncStatus: 'Requested',
  tenantSyncRequestedAt: new Date('2026-04-02T00:00:00.000Z'),
  tenantSyncSource: 'manual',
};

void cloudAccountWithRecommendationEffortProfile;
void cloudAccountWithoutRecommendationEffortProfile;
void cloudAccountWithTenantSyncState;

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
void tenantSyncRequestMessage;
void invalidTenantSyncRequestMessage;
void combinedSubscriptionReadPermission;
void combinedCloudAccountReadPermission;
void subscriptionReadPermissionMetadataShapeCheck;
void cloudAccountReadPermissionMetadataShapeCheck;
