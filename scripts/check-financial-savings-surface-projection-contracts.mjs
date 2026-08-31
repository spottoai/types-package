import assert from 'node:assert/strict';

import {
  buildFinancialSavingsSurfaceProjectionV1,
  createFinancialSavingsSurfaceProjectionIdV1,
  isFinancialSavingsSurfaceProjectionV1,
  projectFinancialSavingsSurfaceQueryV1,
  projectFinancialSavingsSurfaceResourceQueryV1,
} from '../dist/index.js';

const generation = { runId: 'run-1', generatedAt: '2026-08-31T00:00:00.000Z' };
const coordinateId = `sha256:${'3'.repeat(64)}`;
const baselineId = `sha256:${'4'.repeat(64)}`;
const allocationId = `sha256:${'5'.repeat(64)}`;
const resourceId = '/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.compute/virtualmachines/vm-1';
const recommendationId = 'vm-rightsize';
const resourcesView = {
  artifactGeneration: generation,
  resources: [{ id: resourceId }],
  financialAuthority: {
    authorityId: `sha256:${'1'.repeat(64)}`,
    provider: 'azure',
    providerAccountRefs: ['sub-1'],
    artifactGeneration: generation,
    coordinates: [
      {
        coordinateId,
        periodRole: 'current',
        period: {
          windowKind: 'rolling-30-days',
          requested: { startDate: '2026-08-01', endDateExclusive: '2026-08-31', dateBasis: 'utc' },
          coverage: [],
          gaps: [],
        },
        costBasis: 'billed',
        estimateLens: 'actual-plus-estimated',
        aggregateBaseline: { status: 'available', baselineId, total: { amount: '100', currencyCode: 'AUD' } },
      },
    ],
  },
  financialSavingsAuthority: {
    savingsAuthorityId: `sha256:${'2'.repeat(64)}`,
    financialAuthorityId: `sha256:${'1'.repeat(64)}`,
    artifactGeneration: generation,
    coordinates: [
      {
        status: 'available',
        coordinateId,
        currentAggregateBaselineId: baselineId,
        accountingCurrencyCode: 'AUD',
        minorUnitScale: 2,
        roundingMode: 'half-away-from-zero',
        activations: [],
        allocations: [
          {
            allocationId,
            ownerScopeId: resourceId,
            recommendationId,
            savingsMinorUnits: 1234,
          },
        ],
        aggregate: { allocationIds: [allocationId], savingsMinorUnits: 1234 },
      },
    ],
  },
};

const projection = buildFinancialSavingsSurfaceProjectionV1(resourcesView, 'dashboard');
assert.equal(isFinancialSavingsSurfaceProjectionV1(projection), true);
assert.deepEqual(projection.lifecycleBindings, [{ resourceId, recommendationId, allocationIds: [allocationId] }]);

const forgedBinding = structuredClone(projection);
forgedBinding.lifecycleBindings[0].recommendationId = 'another-recommendation';
const { projectionId: _forgedProjectionId, ...forgedIdentity } = forgedBinding;
forgedBinding.projectionId = createFinancialSavingsSurfaceProjectionIdV1(forgedIdentity);
assert.equal(
  isFinancialSavingsSurfaceProjectionV1(forgedBinding),
  false,
  'A lifecycle binding must match the recommendation that owns every bound allocation.'
);

const recommendationProjection = buildFinancialSavingsSurfaceProjectionV1(resourcesView, 'recommendations');
const filteredRecommendations = projectFinancialSavingsSurfaceQueryV1(
  recommendationProjection,
  [recommendationId],
  `sha256:${'8'.repeat(64)}`
);
assert.deepEqual(filteredRecommendations.lifecycleBindings, recommendationProjection.lifecycleBindings);

const resourceProjection = buildFinancialSavingsSurfaceProjectionV1(resourcesView, 'resources');
const filteredResources = projectFinancialSavingsSurfaceResourceQueryV1(
  resourceProjection,
  [allocationId],
  [recommendationId],
  `sha256:${'9'.repeat(64)}`
);
assert.deepEqual(filteredResources.lifecycleBindings, resourceProjection.lifecycleBindings);

console.log('Financial savings surface lifecycle binding contracts passed.');
