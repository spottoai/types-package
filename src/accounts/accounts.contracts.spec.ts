import type { CloudAccount } from './accounts';

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
  recommendationEffortEstimateProfileName: 'enterprise',
};

const cloudAccountWithoutRecommendationEffortProfile: CloudAccount = {
  ...cloudAccountWithRecommendationEffortProfile,
  id: 'tenant-client-id-456',
  recommendationEffortEstimateProfileName: undefined,
};

void cloudAccountWithRecommendationEffortProfile;
void cloudAccountWithoutRecommendationEffortProfile;

const invalidCloudAccountRecommendationEffortProfile: CloudAccount = {
  ...cloudAccountWithRecommendationEffortProfile,
  // @ts-expect-error recommendation effort profile must use the recommendation profile-name union.
  recommendationEffortEstimateProfileName: 'manual',
};

void invalidCloudAccountRecommendationEffortProfile;
