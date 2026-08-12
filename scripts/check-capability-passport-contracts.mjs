import assert from 'node:assert/strict';
import { isCapabilityPassport } from '../dist/common/capabilityPassport.js';

const observation = {
  observationId: 'billing',
  capability: 'billing.history',
  scope: { kind: 'subscription', provider: 'azure', tenantId: 'tenant-1', subscriptionId: 'sub-1' },
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
  freshness: { status: 'current', observedAt: '2026-08-13T00:01:00.000Z' },
};

const passport = {
  schemaVersion: 1,
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
  agreementObservation: { type: 'unknown', source: 'unknown' },
  observations: { mode: 'inline', totalCount: 1, items: [observation] },
  producerVersions: { 'cloud-engine': '1.0.0' },
  issues: [],
};

assert.equal(isCapabilityPassport(passport), true, 'accepts the schema-v1 passport');
assert.equal(isCapabilityPassport({ ...passport, additiveNextField: true }), true, 'accepts additive next fields');

const observationCases = [
  {
    name: 'partial observation',
    observation: {
      ...observation,
      attempt: { ...observation.attempt, outcome: 'partial', reasonCodes: ['source-partial'] },
      availability: 'partial',
    },
    issues: [{ reasonCode: 'source-partial', observationId: observation.observationId }],
  },
  {
    name: 'permission-denied observation',
    observation: {
      ...observation,
      attempt: { ...observation.attempt, outcome: 'failed', reasonCodes: ['permission-denied'] },
      providerSurfaceOutcome: 'unknown',
      availability: 'unavailable',
      freshness: { status: 'unknown' },
    },
    issues: [{ reasonCode: 'permission-denied', observationId: observation.observationId }],
  },
  {
    name: 'failed observation',
    observation: {
      ...observation,
      attempt: { ...observation.attempt, outcome: 'failed', reasonCodes: ['unknown'] },
      providerSurfaceOutcome: 'unknown',
      availability: 'unknown',
      freshness: { status: 'unknown' },
    },
    issues: [{ reasonCode: 'unknown', observationId: observation.observationId }],
  },
  {
    name: 'not-attempted observation',
    observation: {
      ...observation,
      attempt: { status: 'not-attempted', reasonCode: 'not-requested' },
      providerSurfaceOutcome: 'unknown',
      availability: 'unknown',
      freshness: { status: 'unknown' },
    },
    issues: [],
  },
];

for (const fixture of observationCases) {
  assert.equal(
    isCapabilityPassport({
      ...passport,
      observations: { mode: 'inline', totalCount: 1, items: [fixture.observation] },
      issues: fixture.issues,
    }),
    true,
    `accepts a ${fixture.name}`
  );
}

assert.equal(isCapabilityPassport({ ...passport, schemaVersion: 2 }), false, 'rejects an unknown schema version');
assert.equal(
  isCapabilityPassport({ ...passport, observations: { ...passport.observations, totalCount: 2 } }),
  false,
  'rejects an inline count mismatch'
);
assert.equal(
  isCapabilityPassport({
    ...passport,
    observations: { ...passport.observations, items: [observation, { ...observation }] },
  }),
  false,
  'rejects duplicate observation IDs'
);
assert.equal(isCapabilityPassport({ ...passport, generatedAt: '2026-08-13' }), false, 'rejects non-canonical timestamps');
assert.equal(
  isCapabilityPassport({
    ...passport,
    observations: {
      mode: 'inline',
      totalCount: 1,
      items: [{ ...observation, emptyEvidence: 'complete-empty', availability: 'missing' }],
    },
  }),
  false,
  'does not let missing data claim a complete empty result'
);

const shardedPassport = {
  ...passport,
  observations: {
    mode: 'sharded',
    totalCount: 2,
    shardCount: 1,
    indexRef: 'history/capability-passports/runs/run-1/observations/index.json',
    shards: [
      {
        artifactRef: 'history/capability-passports/runs/run-1/observations/part-0001.json',
        sha256: 'a'.repeat(64),
        itemCount: 2,
      },
    ],
  },
};
assert.equal(isCapabilityPassport(shardedPassport), true, 'accepts a complete digest-bound shard index');
assert.equal(
  isCapabilityPassport({ ...shardedPassport, observations: { ...shardedPassport.observations, totalCount: 3 } }),
  false,
  'rejects a sharded total mismatch'
);
assert.equal(
  isCapabilityPassport({
    ...shardedPassport,
    observations: { ...shardedPassport.observations, indexRef: 'https://storage.example/index.json' },
  }),
  false,
  'rejects an unsafe artifact reference'
);
assert.equal(
  isCapabilityPassport({
    ...shardedPassport,
    observations: {
      ...shardedPassport.observations,
      shards: [{ ...shardedPassport.observations.shards[0], sha256: 'not-a-sha256' }],
    },
  }),
  false,
  'rejects an invalid shard digest'
);
assert.equal(
  isCapabilityPassport({
    ...passport,
    observations: {
      mode: 'inline',
      totalCount: 1,
      items: [
        {
          ...observation,
          scope: {
            kind: 'resource',
            provider: 'azure',
            tenantId: 'tenant-1',
            subscriptionId: 'sub-1',
            normalizedResourceId: '/subscriptions/sub-2/resourceGroups/rg-1/providers/Microsoft.Compute/virtualMachines/vm-1',
          },
        },
      ],
    },
  }),
  false,
  'rejects a resource observation bound to another subscription'
);
assert.equal(
  isCapabilityPassport({
    ...passport,
    observations: {
      mode: 'inline',
      totalCount: 1,
      items: [{ ...observation, scope: { ...observation.scope, tenantId: 'tenant-2' } }],
    },
  }),
  false,
  'rejects an observation scope that mismatches ownership'
);
assert.equal(
  isCapabilityPassport({ ...shardedPassport, issues: [{ reasonCode: 'unknown', observationId: 42 }] }),
  false,
  'rejects a malformed issue reference in a sharded passport'
);

process.stdout.write('Capability Passport contract checks passed.\n');
