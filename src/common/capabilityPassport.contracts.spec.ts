import {
  CAPABILITY_PASSPORT_SCHEMA_VERSION,
  isCapabilityPassport,
  type CapabilityPassport,
  type CapabilityObservation,
} from './capabilityPassport.js';

const completedObservation = {
  observationId: 'billing',
  capability: 'billing.history',
  scope: {
    kind: 'subscription',
    provider: 'azure',
    tenantId: 'tenant-1',
    subscriptionId: 'sub-1',
  },
  attempt: {
    status: 'attempted',
    startedAt: '2026-08-13T00:00:00.000Z',
    completedAt: '2026-08-13T00:01:00.000Z',
    outcome: 'succeeded',
    reasonCodes: [],
  },
  providerSurfaceOutcome: 'accepted',
  availability: 'available',
  emptyEvidence: 'unknown',
  freshness: {
    status: 'current',
    observedAt: '2026-08-13T00:01:00.000Z',
  },
} as const satisfies CapabilityObservation;

const passport = {
  schemaVersion: CAPABILITY_PASSPORT_SCHEMA_VERSION,
  passportId: 'run-1:sub-1',
  generatedAt: '2026-08-13T00:02:00.000Z',
  runId: 'run-1',
  ownership: {
    provider: 'azure',
    tenantId: 'tenant-1',
    companyId: 'company-1',
    cloudAccountId: 'cloud-account-1',
    accountId: 'sub-1',
    subscriptionId: 'sub-1',
  },
  agreementObservation: {
    type: 'unknown',
    source: 'unknown',
  },
  observations: {
    mode: 'inline',
    totalCount: 1,
    items: [completedObservation],
  },
  producerVersions: {
    'cloud-engine': '1.0.0',
  },
  issues: [],
} as const satisfies CapabilityPassport;

const additiveNextPassport = {
  ...passport,
  futureTopLevelField: 'accepted by runtime validation',
};

void passport;
void additiveNextPassport;
void isCapabilityPassport;
