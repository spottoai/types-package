import type { PortalAccessBootstrapResponse } from '../src/features-and-permissions/access';

const bootstrap = {
  customerId: 'company-1',
  principalType: 'user',
  principalId: 'user-1',
  catalogVersion: '3',
  featureSets: [],
  features: [],
  runtimeCapabilities: {
    aiActivityLogAnalysisEnabled: false,
  },
} satisfies PortalAccessBootstrapResponse;

void bootstrap;

// @ts-expect-error runtime capability bootstrap is required and fail-closed.
const missingRuntimeCapabilities: PortalAccessBootstrapResponse = {
  customerId: 'company-1',
  principalType: 'user',
  principalId: 'user-1',
  catalogVersion: '3',
  featureSets: [],
  features: [],
};

void missingRuntimeCapabilities;

const unknownRuntimeCapability: PortalAccessBootstrapResponse = {
  ...bootstrap,
  runtimeCapabilities: {
    aiActivityLogAnalysisEnabled: false,
    // @ts-expect-error runtime capability keys are an exact shared contract.
    unexpectedCapability: true,
  },
};

void unknownRuntimeCapability;
