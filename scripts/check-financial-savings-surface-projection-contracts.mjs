import assert from 'node:assert/strict';

import {
  AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_V1,
  buildFinancialSavingsSurfaceProjectionV1,
  createFinancialChargeCompositionV1,
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

const azureComponentId = `sha256:${'a'.repeat(64)}`;
const marketplaceComponentId = `sha256:${'b'.repeat(64)}`;
const policyBaselineId = `sha256:${'c'.repeat(64)}`;
const marketplaceAllocationId = `sha256:${'d'.repeat(64)}`;
const marketplaceRecommendationId = 'marketplace-rightsize';
const policyResourcesView = structuredClone(resourcesView);
const policyFinancialCoordinate = policyResourcesView.financialAuthority.coordinates[0];
policyFinancialCoordinate.aggregateBaseline = {
  status: 'available',
  baselineKind: 'aggregate',
  baselineId,
  memberBaselineIds: [policyBaselineId],
  total: { amount: '150', currencyCode: 'AUD' },
};
policyFinancialCoordinate.chargeCompositions = [
  createFinancialChargeCompositionV1({
    baselineId: policyBaselineId,
    ownerScopeId: resourceId,
    period: policyFinancialCoordinate.period,
    costBasis: policyFinancialCoordinate.costBasis,
    estimateLens: policyFinancialCoordinate.estimateLens,
    accountingCurrencyCode: 'AUD',
    sourceTotal: '150',
    components: [
      {
        componentId: azureComponentId,
        chargeSource: 'azure-native',
        chargeRecurrence: 'usage-based',
        chargeClassification: 'usage',
        amount: '100',
        evidenceRefIds: [`sha256:${'e'.repeat(64)}`],
      },
      {
        componentId: marketplaceComponentId,
        chargeSource: 'marketplace',
        chargeRecurrence: 'one-time',
        chargeClassification: 'purchase',
        amount: '50',
        evidenceRefIds: [`sha256:${'f'.repeat(64)}`],
      },
    ],
    algorithmVersion: 'financial-charge-composition/test-v1',
  }),
];
policyResourcesView.financialSavingsAuthority.coordinates[0].allocations = [
  {
    allocationId,
    ownerScopeId: resourceId,
    recommendationId,
    baselineId: policyBaselineId,
    billableComponentIds: [azureComponentId],
    savingsMinorUnits: 1234,
  },
  {
    allocationId: marketplaceAllocationId,
    ownerScopeId: resourceId,
    recommendationId: marketplaceRecommendationId,
    baselineId: policyBaselineId,
    billableComponentIds: [marketplaceComponentId],
    savingsMinorUnits: 500,
  },
];
policyResourcesView.financialSavingsAuthority.coordinates[0].aggregate = {
  allocationIds: [allocationId, marketplaceAllocationId],
  savingsMinorUnits: 1734,
};

const excludedMarketplaceProjection = buildFinancialSavingsSurfaceProjectionV1(
  policyResourcesView,
  'recommendations',
  AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_V1.policyRef
);
assert.equal(isFinancialSavingsSurfaceProjectionV1(excludedMarketplaceProjection), true);
assert.deepEqual(excludedMarketplaceProjection.coordinates[0], {
  ...excludedMarketplaceProjection.coordinates[0],
  status: 'available',
  chargeInclusionPolicyRef: AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_V1.policyRef,
  currentAggregate: { amount: '100', currencyCode: 'AUD' },
  recommendationContributions: [
    {
      recommendationId,
      allocationIds: [allocationId],
      savingsMinorUnits: 1234,
      allocations: [{ allocationId, savingsMinorUnits: 1234 }],
    },
  ],
  aggregate: { allocationIds: [allocationId], savingsMinorUnits: 1234 },
});
assert.deepEqual(excludedMarketplaceProjection.lifecycleBindings, [
  { resourceId, recommendationId, allocationIds: [allocationId] },
]);

const mixedAllocationId = `sha256:${'7'.repeat(64)}`;
const mixedRecommendationId = 'mixed-source-rightsize';
const mixedPolicyResourcesView = structuredClone(policyResourcesView);
mixedPolicyResourcesView.financialSavingsAuthority.coordinates[0].allocations = [
  {
    allocationId: mixedAllocationId,
    ownerScopeId: resourceId,
    recommendationId: mixedRecommendationId,
    baselineId: policyBaselineId,
    billableComponentIds: [azureComponentId, marketplaceComponentId],
    savingsMinorUnits: 200,
  },
];
mixedPolicyResourcesView.financialSavingsAuthority.coordinates[0].aggregate = {
  allocationIds: [mixedAllocationId],
  savingsMinorUnits: 200,
};
const mixedProjection = buildFinancialSavingsSurfaceProjectionV1(
  mixedPolicyResourcesView,
  'recommendations',
  AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_V1.policyRef
);
assert.deepEqual(mixedProjection.coordinates[0], {
  ...mixedProjection.coordinates[0],
  status: 'partial',
  currentAggregate: { amount: '100', currencyCode: 'AUD' },
  unavailableRecommendationIds: [mixedRecommendationId],
  recommendationContributions: [],
  aggregate: { allocationIds: [], savingsMinorUnits: 0 },
});
assert.equal(mixedProjection.lifecycleBindings, undefined);

const unknownComponentId = `sha256:${'8'.repeat(64)}`;
const unknownPolicyResourcesView = structuredClone(policyResourcesView);
unknownPolicyResourcesView.financialAuthority.coordinates[0].aggregateBaseline.total.amount = '160';
unknownPolicyResourcesView.financialAuthority.coordinates[0].chargeCompositions = [
  createFinancialChargeCompositionV1({
    baselineId: policyBaselineId,
    ownerScopeId: resourceId,
    period: policyFinancialCoordinate.period,
    costBasis: policyFinancialCoordinate.costBasis,
    estimateLens: policyFinancialCoordinate.estimateLens,
    accountingCurrencyCode: 'AUD',
    sourceTotal: '160',
    components: [
      {
        componentId: azureComponentId,
        chargeSource: 'azure-native',
        chargeRecurrence: 'usage-based',
        chargeClassification: 'usage',
        amount: '100',
        evidenceRefIds: [`sha256:${'e'.repeat(64)}`],
      },
      {
        componentId: marketplaceComponentId,
        chargeSource: 'marketplace',
        chargeRecurrence: 'one-time',
        chargeClassification: 'purchase',
        amount: '50',
        evidenceRefIds: [`sha256:${'f'.repeat(64)}`],
      },
      {
        componentId: unknownComponentId,
        chargeSource: 'unknown',
        chargeRecurrence: 'unknown',
        chargeClassification: 'residual',
        amount: '10',
        evidenceRefIds: [`sha256:${'9'.repeat(64)}`],
      },
    ],
    algorithmVersion: 'financial-charge-composition/test-v1',
  }),
];
const unknownProjection = buildFinancialSavingsSurfaceProjectionV1(
  unknownPolicyResourcesView,
  'recommendations',
  AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_V1.policyRef
);
assert.equal(unknownProjection.coordinates[0].status, 'unavailable');
assert.equal(unknownProjection.coordinates[0].unavailableReason, 'allocation-unavailable');

const missingCompositionBaselineId = `sha256:${'6'.repeat(64)}`;
const duplicateCompositionResourcesView = structuredClone(policyResourcesView);
duplicateCompositionResourcesView.financialAuthority.coordinates[0].aggregateBaseline.memberBaselineIds = [
  policyBaselineId,
  missingCompositionBaselineId,
];
duplicateCompositionResourcesView.financialAuthority.coordinates[0].aggregateBaseline.total.amount = '300';
duplicateCompositionResourcesView.financialAuthority.coordinates[0].chargeCompositions = [
  structuredClone(policyResourcesView.financialAuthority.coordinates[0].chargeCompositions[0]),
  structuredClone(policyResourcesView.financialAuthority.coordinates[0].chargeCompositions[0]),
];
const duplicateCompositionProjection = buildFinancialSavingsSurfaceProjectionV1(
  duplicateCompositionResourcesView,
  'recommendations',
  AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_V1.policyRef
);
assert.equal(
  duplicateCompositionProjection.coordinates[0].status,
  'unavailable',
  'Duplicate charge compositions must not disguise a missing aggregate member composition.'
);

console.log('Financial savings surface lifecycle binding contracts passed.');
