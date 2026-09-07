import type { PortalAccessBootstrapResponse } from '../src/features-and-permissions/access';

const bootstrap = {
  customerId: 'company-1',
  principalType: 'user',
  principalId: 'user-1',
  catalogVersion: '3',
  featureSets: [],
  features: [],
} satisfies PortalAccessBootstrapResponse;

void bootstrap;
