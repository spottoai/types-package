import assert from 'node:assert/strict';

import {
  AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_V1,
  createFinancialCurrentSpendSurfaceProjectionIdV1,
  createFinancialResourceSurfaceProjectionIdV1,
  createFinancialSurfaceCoordinateIdV1,
  createRecommendationLifecycleOverlayIdV2,
  isFinancialCurrentSpendSurfaceProjectionV1,
  isFinancialResourceSurfaceProjectionV1,
  isRecommendationLifecycleOverlayV2,
  projectFinancialResourceSurfaceMemberV1,
  projectFinancialResourceSurfaceWithoutScenariosV1,
} from '../dist/index.js';

const hash = character => `sha256:${character.repeat(64)}`;
const artifactGeneration = { runId: 'run-1', generatedAt: '2026-09-07T00:00:00.000Z' };
const period = {
  windowKind: 'rolling-30-days',
  requested: { startDate: '2026-08-09', endDateExclusive: '2026-09-08', dateBasis: 'utc' },
  observed: { startDate: '2026-08-09', endDateExclusive: '2026-09-08', dateBasis: 'utc' },
};
const coordinateIdentity = {
  periodRole: 'current-spend',
  period,
  costBasis: 'billed',
  estimateLens: 'include-estimates',
  chargeInclusionPolicyRef: AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_V1.policyRef,
  requestedCurrencyCode: 'NZD',
};
const coordinate = {
  ...coordinateIdentity,
  coordinateId: createFinancialSurfaceCoordinateIdV1(coordinateIdentity),
};

const currentIdentity = {
  schemaVersion: 1,
  contractVersion: 'financial-current-spend-surface-projection/v1',
  provider: 'azure',
  providerAccountRefs: ['azure-subscription:sub-1'],
  artifactGeneration,
  financialAuthorityId: hash('3'),
  scope: { kind: 'subscription', scopeId: 'azure-subscription:sub-1', scopeFingerprint: hash('4') },
  coordinates: [
    {
      ...coordinate,
      currentSpendCompositionId: hash('9'),
      value: {
        status: 'available',
        amount: '0',
        currencyCode: 'NZD',
        completeness: 'complete',
        excludedAmount: '25.5',
        withheldAmount: '0',
      },
    },
  ],
};
const current = {
  ...currentIdentity,
  projectionId: createFinancialCurrentSpendSurfaceProjectionIdV1(currentIdentity),
};
assert.equal(isFinancialCurrentSpendSurfaceProjectionV1(current), true, 'Exact zero remains available.');
assert.equal(
  isFinancialCurrentSpendSurfaceProjectionV1({
    ...current,
    coordinates: [{ ...current.coordinates[0], currentSpendCompositionId: hash('8') }],
  }),
  false,
  'Current-spend composition binding is part of the projection identity.'
);
assert.equal(
  isFinancialCurrentSpendSurfaceProjectionV1({
    ...current,
    artifactGeneration: { ...current.artifactGeneration, runId: 'run-2' },
  }),
  false,
  'Generation changes require a new projection identity.'
);
assert.equal(
  isFinancialCurrentSpendSurfaceProjectionV1({
    ...current,
    coordinates: [
      {
        ...current.coordinates[0],
        coordinateId: createFinancialSurfaceCoordinateIdV1({ ...coordinateIdentity, costBasis: 'amortized' }),
        costBasis: 'amortized',
      },
    ],
  }),
  false,
  'A billed coordinate cannot be relabelled amortized under the old identity.'
);
assert.equal(
  isFinancialCurrentSpendSurfaceProjectionV1({
    ...current,
    projectionId: createFinancialCurrentSpendSurfaceProjectionIdV1({
      ...currentIdentity,
      coordinates: [{ ...currentIdentity.coordinates[0], costBasis: 'amortized' }],
    }),
    coordinates: [{ ...current.coordinates[0], costBasis: 'amortized' }],
  }),
  false,
  'A coordinate id must bind its own basis and policy dimensions.'
);
assert.equal(
  isFinancialCurrentSpendSurfaceProjectionV1({
    ...current,
    coordinates: [{ ...current.coordinates[0], evidenceBundles: [] }],
  }),
  false,
  'Surface coordinates cannot carry evidence bundles.'
);
assert.equal(
  isFinancialCurrentSpendSurfaceProjectionV1({
    ...current,
    coordinates: [{ ...current.coordinates[0], value: { ...current.coordinates[0].value, currencyCode: undefined } }],
  }),
  false,
  'Available money requires currency evidence.'
);

const resourceIdentity = {
  schemaVersion: 1,
  contractVersion: 'financial-resource-surface-projection/v1',
  provider: 'azure',
  providerAccountRefs: ['azure-subscription:sub-1'],
  artifactGeneration,
  financialAuthorityId: hash('3'),
  coordinates: [coordinate],
  resources: [
    {
      resourceId: '/subscriptions/sub-1/resources/vm-1',
      resourceType: 'microsoft.compute/virtualmachines',
      financialRole: 'owner',
      values: [
        {
          coordinateId: coordinate.coordinateId,
          status: 'partial',
          knownAmount: '14.25',
          currencyCode: 'NZD',
          completeness: 'partial',
          excludedAmount: '2',
          withheldAmount: '1.5',
          reasonCodes: ['billing-coverage-partial'],
        },
      ],
      scenarios: [
        {
          scenarioId: 'vm-rightsize-1',
          coordinateId: coordinate.coordinateId,
          recommendationId: 'rec-1',
          category: 'cost',
          status: 'available',
          currentAmount: '14.25',
          targetAmount: '10',
          changeAmount: '-4.25',
          currencyCode: 'NZD',
          additivity: 'non-additive',
        },
      ],
    },
    {
      resourceId: '/subscriptions/sub-1/resources/kusto-1',
      resourceType: 'microsoft.kusto/clusters',
      financialRole: 'owner',
      values: [
        {
          coordinateId: coordinate.coordinateId,
          status: 'available',
          amount: '600.85',
          currencyCode: 'NZD',
          completeness: 'complete',
          excludedAmount: '0',
          withheldAmount: '0',
        },
      ],
      scenarios: [
        {
          scenarioId: 'kusto-engine-alternative-1',
          coordinateId: coordinate.coordinateId,
          recommendationId: 'rec-2',
          category: 'cost',
          status: 'unavailable',
          reasonCodes: ['whole-cluster-target-evidence-unavailable'],
          additivity: 'non-additive',
        },
      ],
    },
  ],
};
const resourceProjection = {
  ...resourceIdentity,
  projectionId: createFinancialResourceSurfaceProjectionIdV1(resourceIdentity),
};
assert.equal(isFinancialResourceSurfaceProjectionV1(resourceProjection), true);
const selectedResourceProjection = projectFinancialResourceSurfaceMemberV1(
  resourceProjection,
  '/SUBSCRIPTIONS/SUB-1/RESOURCES/VM-1/'
);
assert.equal(isFinancialResourceSurfaceProjectionV1(selectedResourceProjection), true);
assert.equal(selectedResourceProjection.resources.length, 1, 'Detail selection carries one resource only.');
assert.equal(selectedResourceProjection.resources[0].resourceId, resourceIdentity.resources[0].resourceId);
assert.equal(
  selectedResourceProjection.projectionId,
  createFinancialResourceSurfaceProjectionIdV1({
    ...resourceIdentity,
    resources: [resourceIdentity.resources[0]],
  }),
  'Detail selection receives an independently content-addressed identity.'
);
assert.equal(projectFinancialResourceSurfaceMemberV1(resourceProjection, '/subscriptions/sub-1/resources/missing'), undefined);
const currentSpendOnlyProjection = projectFinancialResourceSurfaceWithoutScenariosV1(selectedResourceProjection);
assert.equal(isFinancialResourceSurfaceProjectionV1(currentSpendOnlyProjection), true);
assert.equal(currentSpendOnlyProjection.resources[0].scenarios, undefined);
assert.deepEqual(currentSpendOnlyProjection.resources[0].values, selectedResourceProjection.resources[0].values);
assert.equal(
  isFinancialResourceSurfaceProjectionV1({
    ...resourceProjection,
    resources: [
      {
        ...resourceProjection.resources[0],
        scenarios: [resourceProjection.resources[0].scenarios[0], resourceProjection.resources[0].scenarios[0]],
      },
      ...resourceProjection.resources.slice(1),
    ],
  }),
  false,
  'A scenario may not repeat within the same coordinate.'
);
assert.equal(
  createFinancialResourceSurfaceProjectionIdV1({
    ...resourceIdentity,
    resources: [...resourceIdentity.resources].reverse(),
  }),
  resourceProjection.projectionId,
  'Resource insertion order cannot change identity.'
);
assert.equal(
  isFinancialResourceSurfaceProjectionV1({
    ...resourceProjection,
    resources: [{ ...resourceProjection.resources[0], ownerBaseline: {} }, ...resourceProjection.resources.slice(1)],
  }),
  false,
  'Resource surfaces cannot carry baseline authority.'
);
assert.equal(
  isFinancialResourceSurfaceProjectionV1({
    ...resourceProjection,
    resources: [
      {
        ...resourceProjection.resources[0],
        scenarios: [{ ...resourceProjection.resources[0].scenarios[0], additivity: 'additive' }],
      },
      ...resourceProjection.resources.slice(1),
    ],
  }),
  false,
  'Alternative scenarios are never additive.'
);

const lifecycleIdentity = {
  schemaVersion: 2,
  contractVersion: 'recommendation-lifecycle-overlay/v2',
  companyId: 'company-1',
  provider: 'azure',
  providerScopeId: 'sub-1',
  revision: 'revision-1',
  generatedAt: '2026-09-07T00:01:00.000Z',
  status: 'complete',
  states: [
    {
      recommendationId: 'rec-1',
      scope: 'resource',
      resourceId: '/subscriptions/sub-1/resources/vm-1',
      status: 'Archived',
      statusStartAt: '2026-09-06T00:00:00.000Z',
      updatedAt: '2026-09-06T00:00:00.000Z',
      revision: 'state-revision-1',
    },
  ],
};
const lifecycle = {
  ...lifecycleIdentity,
  overlayId: createRecommendationLifecycleOverlayIdV2(lifecycleIdentity),
};
assert.equal(isRecommendationLifecycleOverlayV2(lifecycle), true);
assert.equal(isRecommendationLifecycleOverlayV2({ ...lifecycle, savings: '10' }), false, 'Lifecycle overlays are non-monetary.');

console.log('Compact financial surface and recommendation lifecycle overlay contracts passed.');
