import assert from 'node:assert/strict';

import {
  AZURE_BILLED_ALL_CHARGES_POLICY_V1,
  canonicalizeFinancialEvidenceAssessmentIdentityV1,
  canonicalizeFinancialEvidenceBundleIdentityV1,
  canonicalizeFinancialProjectionIdentityV1,
  canonicalizeFinancialScopeBaselineIdentityV2,
  createFinancialAuthorityCoordinateIdV1,
  createFinancialAuthorityViewIdV1,
  createFinancialChargeCompositionV1,
  createFinancialDisplayRollupIdV1,
  createFinancialEligibilityAssessmentIdV1,
  createFinancialSavingsActivationIdV1,
  createFinancialSavingsAllocationIdV1,
  createFinancialSavingsAuthorityIdV1,
  createFinancialSavingsDenominatorIdV1,
  isFinancialAuthorityViewBoundToArtifactGenerationV1,
  isFinancialAuthorityViewV1,
  isFinancialSavingsAuthorityBoundToFinancialAuthorityV1,
  sha256Utf8,
} from '../dist/index.js';

const hash = value => `sha256:${sha256Utf8(value)}`;
const subscriptionRef = 'azure-subscription:sub-1';
const vmId = '/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.compute/virtualmachines/vm-1';
const requested = { startDate: '2026-07-24', endDateExclusive: '2026-08-23', dateBasis: 'utc' };
const evidenceReference = {
  evidenceRefId: hash('billing-ref'),
  role: 'billing',
  sourceKind: 'views-billing-input-shard/v1',
  generationId: 'billing-run-1',
  digestAlgorithm: 'sha256',
  evidenceDigest: hash('billing-content'),
  intrinsicTime: { kind: 'published-at', at: '2026-08-23T00:30:00.000Z' },
  effectivePeriod: requested,
};
const scenarioCoverageEvidenceReference = {
  evidenceRefId: hash('recommendation-scenario-set-ref'),
  role: 'recommendation-scenario-set',
  sourceKind: 'portal-recommendation-scenario-set/v1',
  generationId: 'portal-run-1',
  digestAlgorithm: 'sha256',
  evidenceDigest: hash('recommendation-scenario-set-content'),
  intrinsicTime: { kind: 'published-at', at: '2026-08-23T00:45:00.000Z' },
  effectivePeriod: requested,
};
const lifecycleEvidenceReference = {
  evidenceRefId: hash('recommendation-lifecycle-ref'),
  role: 'recommendation-lifecycle',
  sourceKind: 'recommendation-state/v1',
  revisionId: 'recommendation-state-revision-1',
  digestAlgorithm: 'sha256',
  evidenceDigest: hash('recommendation-lifecycle-content'),
  intrinsicTime: { kind: 'published-at', at: '2026-08-23T00:50:00.000Z' },
  effectivePeriod: requested,
};
const eligibilityRuleEvidenceReference = {
  evidenceRefId: hash('eligibility-rule-ref'),
  role: 'eligibility-rule',
  sourceKind: 'azure-savings-plan-eligibility-rule/v1',
  revisionId: 'savings-plan-rule-1',
  digestAlgorithm: 'sha256',
  evidenceDigest: hash('eligibility-rule-content'),
  intrinsicTime: { kind: 'published-at', at: '2026-08-23T00:40:00.000Z' },
  effectivePeriod: requested,
};
const commitmentQuoteEvidenceReference = {
  evidenceRefId: hash('commitment-quote-ref'),
  role: 'commitment-quote',
  sourceKind: 'azure-reservation-quote/v1',
  revisionId: 'reservation-quote-revision-1',
  digestAlgorithm: 'sha256',
  evidenceDigest: hash('commitment-quote-content'),
  intrinsicTime: { kind: 'quoted-at', at: '2026-08-23T00:35:00.000Z' },
  effectivePeriod: requested,
};
const retailRateEvidenceReference = {
  evidenceRefId: hash('retail-rate-ref'),
  role: 'retail-rate',
  sourceKind: 'azure-retail-prices/v1',
  revisionId: 'retail-rate-revision-1',
  digestAlgorithm: 'sha256',
  evidenceDigest: hash('retail-rate-content'),
  intrinsicTime: { kind: 'quoted-at', at: '2026-08-23T00:35:00.000Z' },
  effectivePeriod: requested,
};
const bundleIdentity = {
  schemaVersion: 1,
  contractVersion: 'financial-evidence-bundle/v1',
  references: [
    evidenceReference,
    eligibilityRuleEvidenceReference,
    retailRateEvidenceReference,
    commitmentQuoteEvidenceReference,
    scenarioCoverageEvidenceReference,
    lifecycleEvidenceReference,
  ],
};
const bundle = { ...bundleIdentity, bundleId: hash(canonicalizeFinancialEvidenceBundleIdentityV1(bundleIdentity)) };
const period = {
  windowKind: 'rolling-30-days',
  requested,
  observed: requested,
  coverage: [
    {
      coverageId: hash('coverage'),
      interval: requested,
      settlementState: 'settled',
      evidenceRefIds: [evidenceReference.evidenceRefId],
    },
  ],
  gaps: [],
};

const assessmentFor = (scopeKind, scopeId) => {
  const aggregate = scopeKind === 'subscription-aggregate';
  const identity = {
    schemaVersion: 1,
    contractVersion: 'financial-evidence-assessment/v1',
    policyVersion: 'financial-current-cost/v2',
    evaluatedAt: '2026-08-23T01:00:00.000Z',
    request: {
      provider: 'azure',
      providerAccountRefs: [subscriptionRef],
      scopeKind,
      scopeId,
      requestedEvidenceRoles: aggregate ? [] : ['billing'],
    },
    roleAssessments: aggregate
      ? []
      : [
          {
            role: 'billing',
            support: 'supported',
            requestState: 'requested',
            productionState: 'produced',
            matchState: 'matched',
            evidenceRefId: evidenceReference.evidenceRefId,
          },
        ],
    completeness: 'complete',
    reconciliation: 'reconciled',
    freshness: 'current',
    result: 'available',
    primaryReason: 'evidence-accepted',
    supportingReasons: [],
    evidenceBundleId: bundle.bundleId,
    summary: aggregate
      ? { requestedRoleCount: 0, producedRoleCount: 0, matchedRoleCount: 0 }
      : { requestedRoleCount: 1, producedRoleCount: 1, matchedRoleCount: 1 },
  };
  return { ...identity, assessmentId: hash(canonicalizeFinancialEvidenceAssessmentIdentityV1(identity)) };
};

const ownerAssessment = assessmentFor('canonical-resource-owner', vmId);
const residualId = 'azure-subscription:sub-1:residual';
const residualAssessment = assessmentFor('subscription-residual', residualId);
const aggregateId = 'azure-subscription:sub-1';
const aggregateAssessment = assessmentFor('subscription-aggregate', aggregateId);
const ownerIdentity = {
  schemaVersion: 2,
  contractVersion: 'financial-scope-baseline/v2',
  provider: 'azure',
  providerAccountRefs: [subscriptionRef],
  scopeKind: 'canonical-resource-owner',
  scopeId: vmId,
  period,
  costBasis: 'billed',
  estimateLens: 'actual-only',
  requestedCurrencyCode: 'AUD',
  assessmentId: ownerAssessment.assessmentId,
  baselineKind: 'owner',
  evidenceBundleId: bundle.bundleId,
  accountingCurrency: { currencyCode: 'AUD', sourceCurrencyCode: 'AUD', evidenceRefIds: [evidenceReference.evidenceRefId] },
  chargeInclusionPolicyRef: AZURE_BILLED_ALL_CHARGES_POLICY_V1.policyRef,
  components: [
    {
      componentId: hash('vm-component'),
      billableIdentity: 'azure:compute:vm:payg',
      ownerScopeId: vmId,
      chargeClassification: 'usage',
      amount: '600.85',
      evidenceRefIds: [evidenceReference.evidenceRefId],
      coverageIds: [period.coverage[0].coverageId],
      quantity: { amount: '800', unit: '1 Hour' },
    },
  ],
};
const makeOwner = (identity, amount) => ({
  ...identity,
  status: 'available',
  baselineId: hash(canonicalizeFinancialScopeBaselineIdentityV2(identity)),
  total: { amount, currencyCode: 'AUD' },
  reconciliation: {
    status: 'reconciled',
    componentTotal: amount,
    sourceTotal: amount,
    withheldTotal: '0',
    residualTotal: '0',
    difference: '0',
  },
});
const owner = makeOwner(ownerIdentity, '600.85');
const residualIdentity = {
  ...ownerIdentity,
  scopeKind: 'subscription-residual',
  scopeId: residualId,
  assessmentId: residualAssessment.assessmentId,
  components: [
    {
      ...ownerIdentity.components[0],
      componentId: hash('residual-component'),
      billableIdentity: 'azure:subscription:residual',
      ownerScopeId: residualId,
      chargeClassification: 'residual',
      amount: '10',
      quantity: undefined,
    },
  ].map(({ quantity, ...component }) => component),
};
const residual = makeOwner(residualIdentity, '10');
const aggregateIdentity = {
  schemaVersion: 2,
  contractVersion: 'financial-scope-baseline/v2',
  provider: 'azure',
  providerAccountRefs: [subscriptionRef],
  scopeKind: 'subscription-aggregate',
  scopeId: aggregateId,
  period,
  costBasis: 'billed',
  estimateLens: 'actual-only',
  requestedCurrencyCode: 'AUD',
  assessmentId: aggregateAssessment.assessmentId,
  baselineKind: 'aggregate',
  accountingCurrencyCode: 'AUD',
  memberBaselineIds: [owner.baselineId, residual.baselineId],
  compatibility: {
    period: 'compatible',
    costBasis: 'compatible',
    estimateLens: 'compatible',
    accountingCurrency: 'compatible',
    membership: 'non-overlapping',
  },
};
const aggregate = {
  ...aggregateIdentity,
  status: 'available',
  baselineId: hash(canonicalizeFinancialScopeBaselineIdentityV2(aggregateIdentity)),
  total: { amount: '610.85', currencyCode: 'AUD' },
  reconciliation: { status: 'reconciled', memberTotal: '600.85', residualTotal: '10', difference: '0' },
};
const chargeCompositionFor = baseline =>
  createFinancialChargeCompositionV1({
    baselineId: baseline.baselineId,
    ownerScopeId: baseline.scopeId,
    period: baseline.period,
    costBasis: baseline.costBasis,
    estimateLens: baseline.estimateLens,
    accountingCurrencyCode: baseline.total.currencyCode,
    sourceTotal: baseline.total.amount,
    components: baseline.components.map(component => ({
      componentId: component.componentId,
      chargeSource: 'azure-native',
      chargeRecurrence: 'usage-based',
      chargeClassification: component.chargeClassification,
      amount: component.amount,
      evidenceRefIds: component.evidenceRefIds,
    })),
    algorithmVersion: 'financial-charge-composition/fixture-v1',
  });
const presentationFor = baseline => {
  const component = baseline.components[0];
  const descriptor = {
    baselineId: baseline.baselineId,
    componentId: component.componentId,
    displayLabel: 'D11 v2',
    displayLabelSource: 'meter-name',
    serviceName: 'Virtual Machines',
    meterName: 'D11 v2',
    productName: 'Virtual Machines Dv2 Series',
    unitOfMeasure: '1 Hour',
    evidenceRefIds: [...component.evidenceRefIds],
  };
  const rollupIdentity = {
    displayScopeId: baseline.scopeId,
    purpose: 'cost-composition',
    additivity: 'non-additive',
    displayLabel: 'Virtual Machines',
    displayLabelSource: 'service-name',
    members: [{ baselineId: baseline.baselineId, componentId: component.componentId }],
  };
  return {
    componentDescriptors: [descriptor],
    displayRollups: [{ ...rollupIdentity, displayRollupId: createFinancialDisplayRollupIdV1(rollupIdentity) }],
  };
};
const coordinateIdentity = {
  periodRole: 'current',
  period,
  costBasis: 'billed',
  estimateLens: 'actual-only',
  requestedCurrencyCode: 'AUD',
  ownerBaselines: [owner],
  residualBaseline: residual,
  aggregateBaseline: aggregate,
  chargeCompositions: [chargeCompositionFor(owner), chargeCompositionFor(residual)],
  ...presentationFor(owner),
  projections: [],
};
const coordinate = { ...coordinateIdentity, coordinateId: createFinancialAuthorityCoordinateIdV1(coordinateIdentity) };
const coordinateFor = (estimateLens, ownerAmount, ownerRate, residualAmount) => {
  const nextOwnerIdentity = {
    ...ownerIdentity,
    estimateLens,
    components: ownerIdentity.components.map(component => ({
      ...component,
      componentId: hash(`vm-component-${estimateLens}`),
      amount: ownerAmount,
      effectiveRate: { amount: ownerRate, unit: '1 Hour', currencyCode: 'AUD' },
    })),
  };
  const nextOwner = makeOwner(nextOwnerIdentity, ownerAmount);
  const nextResidualIdentity = {
    ...residualIdentity,
    estimateLens,
    components: residualIdentity.components.map(component => ({
      ...component,
      componentId: hash(`residual-component-${estimateLens}`),
      amount: residualAmount,
    })),
  };
  const nextResidual = makeOwner(nextResidualIdentity, residualAmount);
  const total = String(Number(ownerAmount) + Number(residualAmount));
  const nextAggregateIdentity = {
    ...aggregateIdentity,
    estimateLens,
    memberBaselineIds: [nextOwner.baselineId, nextResidual.baselineId],
  };
  const nextAggregate = {
    ...nextAggregateIdentity,
    status: 'available',
    baselineId: hash(canonicalizeFinancialScopeBaselineIdentityV2(nextAggregateIdentity)),
    total: { amount: total, currencyCode: 'AUD' },
    reconciliation: { status: 'reconciled', memberTotal: ownerAmount, residualTotal: residualAmount, difference: '0' },
  };
  const identity = {
    periodRole: 'current',
    period,
    costBasis: 'billed',
    estimateLens,
    requestedCurrencyCode: 'AUD',
    ownerBaselines: [nextOwner],
    residualBaseline: nextResidual,
    aggregateBaseline: nextAggregate,
    chargeCompositions: [chargeCompositionFor(nextOwner), chargeCompositionFor(nextResidual)],
    ...presentationFor(nextOwner),
    projections: [],
  };
  return { ...identity, coordinateId: createFinancialAuthorityCoordinateIdV1(identity) };
};
const actualCoordinate = coordinateFor('actual-only', '500', '0.625', '8');
const estimatedCoordinate = coordinateFor('estimates-only', '100.85', '0.1260625', '2');
const combinedCoordinate = coordinateFor('actual-plus-estimated', '600.85', '0.7510625', '10');
const authorityIdentity = {
  schemaVersion: 1,
  contractVersion: 'financial-authority-view/v1',
  provider: 'azure',
  providerAccountRefs: [subscriptionRef],
  artifactGeneration: { runId: 'portal-run-1', generatedAt: '2026-08-23T01:00:00.000Z' },
  billingGenerationId: 'billing-run-1',
  scopeCoverage: [{ resourceType: 'microsoft.compute/virtualmachines', financialRole: 'owner', scopeIds: [vmId] }],
  evidenceBundles: [bundle],
  evidenceAssessments: [ownerAssessment, residualAssessment, aggregateAssessment],
  coordinates: [actualCoordinate, combinedCoordinate, estimatedCoordinate],
};
const authority = { ...authorityIdentity, authorityId: createFinancialAuthorityViewIdV1(authorityIdentity) };

assert.equal(isFinancialAuthorityViewV1(authority), true, 'valid complete VM authority');
assert.equal(isFinancialAuthorityViewBoundToArtifactGenerationV1(authority, authority.artifactGeneration), true);
assert.equal(isFinancialAuthorityViewBoundToArtifactGenerationV1(authority, { ...authority.artifactGeneration, runId: 'other' }), false);
assert.equal(
  isFinancialAuthorityViewV1({
    ...authority,
    scopeCoverage: [{ ...authority.scopeCoverage[0], financialRole: 'display-only' }],
  }),
  false,
  'display-only inventory cannot publish an available owner baseline'
);
assert.equal(
  isFinancialAuthorityViewV1({
    ...authority,
    scopeCoverage: [{ ...authority.scopeCoverage[0], financialRole: 'unknown' }],
  }),
  false,
  'financial role is closed'
);
assert.equal(isFinancialAuthorityViewV1({ ...authority, scopeCoverage: [{ ...authority.scopeCoverage[0], scopeIds: [vmId, vmId] }] }), false);

const unclassifiedVmId = '/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.compute/virtualmachines/vm-unclassified';
const unclassifiedAssessmentIdentity = {
  schemaVersion: 1,
  contractVersion: 'financial-evidence-assessment/v1',
  policyVersion: 'financial-current-cost/v2',
  evaluatedAt: authority.artifactGeneration.generatedAt,
  request: {
    provider: 'azure',
    providerAccountRefs: [subscriptionRef],
    scopeKind: 'canonical-resource-owner',
    scopeId: unclassifiedVmId,
    requestedEvidenceRoles: ['billing'],
  },
  roleAssessments: [
    {
      role: 'billing',
      support: 'unknown',
      requestState: 'requested',
      productionState: 'not-produced',
      matchState: 'not-matched',
    },
  ],
  completeness: 'unavailable',
  reconciliation: 'not-applicable',
  freshness: 'current',
  result: 'unavailable',
  primaryReason: 'ownership-unresolved',
  supportingReasons: [],
  summary: { requestedRoleCount: 1, producedRoleCount: 0, matchedRoleCount: 0 },
};
const unclassifiedAssessment = {
  ...unclassifiedAssessmentIdentity,
  assessmentId: hash(canonicalizeFinancialEvidenceAssessmentIdentityV1(unclassifiedAssessmentIdentity)),
};
const coordinateWithUnclassifiedScope = source => {
  const unclassifiedBaseline = {
    schemaVersion: 2,
    contractVersion: 'financial-scope-baseline/v2',
    provider: 'azure',
    providerAccountRefs: [subscriptionRef],
    scopeKind: 'canonical-resource-owner',
    scopeId: unclassifiedVmId,
    period: source.period,
    costBasis: source.costBasis,
    estimateLens: source.estimateLens,
    requestedCurrencyCode: source.requestedCurrencyCode,
    assessmentId: unclassifiedAssessment.assessmentId,
    status: 'unavailable',
    unavailableReason: 'ownership-unresolved',
    summary: unclassifiedAssessment.summary,
  };
  const { coordinateId: _coordinateId, ...sourceIdentity } = source;
  const identity = { ...sourceIdentity, ownerBaselines: [...source.ownerBaselines, unclassifiedBaseline] };
  return { ...identity, coordinateId: createFinancialAuthorityCoordinateIdV1(identity) };
};
const unclassifiedAuthorityIdentity = {
  ...authorityIdentity,
  scopeCoverage: [
    authorityIdentity.scopeCoverage[0],
    {
      resourceType: 'microsoft.compute/virtualmachines',
      financialRole: 'unclassified',
      scopeIds: [unclassifiedVmId],
    },
  ],
  evidenceAssessments: [...authorityIdentity.evidenceAssessments, unclassifiedAssessment],
  coordinates: authority.coordinates.map(coordinateWithUnclassifiedScope),
};
const authorityWithUnclassifiedScope = {
  ...unclassifiedAuthorityIdentity,
  authorityId: createFinancialAuthorityViewIdV1(unclassifiedAuthorityIdentity),
};
assert.equal(
  isFinancialAuthorityViewV1(authorityWithUnclassifiedScope),
  true,
  'unclassified inventory remains covered and typed unavailable without entering the additive aggregate'
);
assert.equal(
  isFinancialAuthorityViewV1({
    ...authorityWithUnclassifiedScope,
    scopeCoverage: [...authorityWithUnclassifiedScope.scopeCoverage].reverse(),
  }),
  true,
  'authority identity canonicalizes same-type financial-role coverage independently of input order'
);
assert.equal(
  isFinancialAuthorityViewV1({ ...authority, coordinates: [{ ...actualCoordinate, ownerBaselines: [] }, combinedCoordinate, estimatedCoordinate] }),
  false
);
assert.equal(
  isFinancialAuthorityViewV1({
    ...authority,
    coordinates: [
      { ...actualCoordinate, aggregateBaseline: { ...actualCoordinate.aggregateBaseline, memberBaselineIds: [owner.baselineId] } },
      combinedCoordinate,
      estimatedCoordinate,
    ],
  }),
  false
);
const mutateCoordinate = mutate => {
  const candidate = structuredClone(authority);
  mutate(candidate.coordinates[0]);
  const { coordinateId: _coordinateId, ...coordinateIdentity } = candidate.coordinates[0];
  candidate.coordinates[0].coordinateId = createFinancialAuthorityCoordinateIdV1(coordinateIdentity);
  const { authorityId: _authorityId, ...changedAuthorityIdentity } = candidate;
  candidate.authorityId = createFinancialAuthorityViewIdV1(changedAuthorityIdentity);
  return candidate;
};
assert.equal(
  isFinancialAuthorityViewV1(
    mutateCoordinate(changed => {
      changed.componentDescriptors = [];
      changed.displayRollups = [];
    })
  ),
  false,
  'every available owner component requires one evidence-backed descriptor and display membership'
);
assert.equal(
  isFinancialAuthorityViewV1(
    mutateCoordinate(changed => {
      changed.displayRollups[0].members.push({ ...changed.displayRollups[0].members[0] });
      const { displayRollupId: _displayRollupId, ...rollupIdentity } = changed.displayRollups[0];
      changed.displayRollups[0].displayRollupId = createFinancialDisplayRollupIdV1(rollupIdentity);
    })
  ),
  false,
  'one display rollup cannot contain duplicate canonical component membership'
);
const unreconciledCombined = coordinateFor('actual-plus-estimated', '601', '0.75125', '10');
const unreconciledAuthorityIdentity = { ...authorityIdentity, coordinates: [actualCoordinate, unreconciledCombined, estimatedCoordinate] };
assert.equal(
  isFinancialAuthorityViewV1({
    ...unreconciledAuthorityIdentity,
    authorityId: createFinancialAuthorityViewIdV1(unreconciledAuthorityIdentity),
  }),
  false,
  'actual plus estimated must reconcile to the combined lens'
);
assert.equal(
  isFinancialAuthorityViewV1({
    ...authority,
    evidenceAssessments: [
      { ...ownerAssessment, request: { ...ownerAssessment.request, scopeId: residualId } },
      residualAssessment,
      aggregateAssessment,
    ],
  }),
  false,
  'baseline-to-assessment scope mismatch rejected'
);
const conflictingEvidenceReference = { ...evidenceReference, sourceKind: 'conflicting-billing-source/v1' };
const conflictingBundleIdentity = {
  schemaVersion: 1,
  contractVersion: 'financial-evidence-bundle/v1',
  references: [conflictingEvidenceReference],
};
const conflictingBundle = {
  ...conflictingBundleIdentity,
  bundleId: hash(canonicalizeFinancialEvidenceBundleIdentityV1(conflictingBundleIdentity)),
};
const conflictingEvidenceAuthorityIdentity = {
  ...authorityIdentity,
  evidenceBundles: [...authorityIdentity.evidenceBundles, conflictingBundle],
};
assert.equal(
  isFinancialAuthorityViewV1({
    ...conflictingEvidenceAuthorityIdentity,
    authorityId: createFinancialAuthorityViewIdV1(conflictingEvidenceAuthorityIdentity),
  }),
  false,
  'one evidence reference identity cannot describe conflicting immutable evidence across bundles'
);

const savingsAuthorityIdentity = {
  schemaVersion: 1,
  contractVersion: 'financial-savings-authority/v1',
  financialAuthorityId: authority.authorityId,
  artifactGeneration: authority.artifactGeneration,
  eligibilityBaselines: [],
  eligibilityAssessments: [],
  coordinates: authority.coordinates.map(authorityCoordinate => ({
    status: 'unavailable',
    coordinateId: authorityCoordinate.coordinateId,
    currentAggregateBaselineId: authorityCoordinate.aggregateBaseline.baselineId,
    unavailableReason: 'unmigrated-scenario-producer',
  })),
};
const savingsAuthority = {
  ...savingsAuthorityIdentity,
  savingsAuthorityId: createFinancialSavingsAuthorityIdV1(savingsAuthorityIdentity),
};
const withSavingsAuthorityId = candidate => {
  const { savingsAuthorityId: _savingsAuthorityId, ...identity } = candidate;
  return { ...identity, savingsAuthorityId: createFinancialSavingsAuthorityIdV1(identity) };
};
assert.equal(
  isFinancialSavingsAuthorityBoundToFinancialAuthorityV1(savingsAuthority, authority),
  true,
  'unavailable savings is explicitly bound to every financial coordinate'
);
assert.equal(
  isFinancialSavingsAuthorityBoundToFinancialAuthorityV1({ ...savingsAuthority, coordinates: savingsAuthority.coordinates.slice(1) }, authority),
  false,
  'partial savings coordinate coverage rejected'
);
assert.equal(
  isFinancialSavingsAuthorityBoundToFinancialAuthorityV1(
    {
      ...savingsAuthority,
      coordinates: savingsAuthority.coordinates.map((entry, index) => (index === 0 ? { ...entry, unavailableReason: 'unknown-reason' } : entry)),
    },
    authority
  ),
  false,
  'unknown unavailable reason rejected'
);
assert.equal(
  isFinancialSavingsAuthorityBoundToFinancialAuthorityV1(
    withSavingsAuthorityId({ ...savingsAuthority, undeclaredMigrationState: 'legacy' }),
    authority
  ),
  false,
  'undeclared savings-authority fields rejected even when included in the identity digest'
);
assert.equal(
  isFinancialSavingsAuthorityBoundToFinancialAuthorityV1(
    withSavingsAuthorityId({
      ...savingsAuthority,
      coordinates: savingsAuthority.coordinates.map((entry, index) => {
        if (index !== 0) return entry;
        const { currentAggregateBaselineId: _currentAggregateBaselineId, ...withoutBaselineBinding } = entry;
        return withoutBaselineBinding;
      }),
    }),
    authority
  ),
  false,
  'an available aggregate baseline requires an explicit savings-coordinate baseline binding'
);

const projectionIdentity = {
  schemaVersion: 1,
  contractVersion: 'financial-projection/v1',
  provider: 'azure',
  providerAccountRefs: [subscriptionRef],
  scopeId: vmId,
  scenarioId: 'recommendation-1',
  operationKind: 'replace-rate',
  baselineCostBasis: 'billed',
  baselineEstimateLens: 'actual-only',
  targetCostBasis: 'billed',
  targetProvenance: 'retail-derived',
  targetPeriodConvention: 'same-observed-quantity',
  affectedComponentIds: [actualCoordinate.ownerBaselines[0].components[0].componentId],
  accountingCurrencyCode: 'AUD',
  targetEvidenceBundleId: bundle.bundleId,
  targetAssessmentId: ownerAssessment.assessmentId,
  baselineId: actualCoordinate.ownerBaselines[0].baselineId,
  appliedComponentTargets: [
    {
      componentId: actualCoordinate.ownerBaselines[0].components[0].componentId,
      targetAmount: '400',
      targetConfigurationId: 'azure-vm-sku:standard-d2as-v5',
      targetEvidenceRefIds: [retailRateEvidenceReference.evidenceRefId],
      sourceQuantity: { amount: '800', unit: '1 Hour' },
      targetRate: { amount: '0.5', currencyCode: 'AUD', quantityUnit: '1 Hour' },
    },
  ],
};
const projection = {
  ...projectionIdentity,
  status: 'available',
  projectionId: hash(canonicalizeFinancialProjectionIdentityV1(projectionIdentity)),
  current: { total: '500', affected: '500', unchanged: '0' },
  target: { total: '400', affected: '400', unchanged: '0' },
  change: { delta: '-100', savings: '100', increase: '0' },
  reconciliation: { status: 'reconciled', difference: '0' },
};
const { coordinateId: _actualCoordinateId, ...actualCoordinateWithoutId } = actualCoordinate;
const projectedActualIdentity = { ...actualCoordinateWithoutId, projections: [projection] };
const projectedActualCoordinate = {
  ...projectedActualIdentity,
  coordinateId: createFinancialAuthorityCoordinateIdV1(projectedActualIdentity),
};
const projectedAuthorityIdentity = {
  ...authorityIdentity,
  coordinates: [projectedActualCoordinate, combinedCoordinate, estimatedCoordinate],
};
const projectedAuthority = {
  ...projectedAuthorityIdentity,
  authorityId: createFinancialAuthorityViewIdV1(projectedAuthorityIdentity),
};
assert.equal(isFinancialAuthorityViewV1(projectedAuthority), true, 'authority with one exact projection is valid');
const quantityAndRateProjectionIdentity = {
  ...projectionIdentity,
  scenarioId: 'recommendation-quantity-and-rate',
  operationKind: 'replace-quantity-and-rate',
  targetPeriodConvention: 'same-period-quantity',
  appliedComponentTargets: [
    {
      componentId: actualCoordinate.ownerBaselines[0].components[0].componentId,
      targetAmount: '400',
      targetConfigurationId: 'azure-resource-optimization:target-tier',
      targetEvidenceRefIds: [retailRateEvidenceReference.evidenceRefId],
      targetQuantity: { amount: '1000', unit: '1 Hour' },
      targetRate: { amount: '0.4', currencyCode: 'AUD', quantityUnit: '1 Hour' },
    },
  ],
};
const quantityAndRateProjection = {
  ...quantityAndRateProjectionIdentity,
  status: 'available',
  projectionId: hash(canonicalizeFinancialProjectionIdentityV1(quantityAndRateProjectionIdentity)),
  current: { total: '500', affected: '500', unchanged: '0' },
  target: { total: '400', affected: '400', unchanged: '0' },
  change: { delta: '-100', savings: '100', increase: '0' },
  reconciliation: { status: 'reconciled', difference: '0' },
};
const quantityAndRateCoordinateIdentity = { ...actualCoordinateWithoutId, projections: [quantityAndRateProjection] };
const quantityAndRateCoordinate = {
  ...quantityAndRateCoordinateIdentity,
  coordinateId: createFinancialAuthorityCoordinateIdV1(quantityAndRateCoordinateIdentity),
};
const quantityAndRateAuthorityIdentity = {
  ...authorityIdentity,
  coordinates: [quantityAndRateCoordinate, combinedCoordinate, estimatedCoordinate],
};
assert.equal(
  isFinancialAuthorityViewV1({
    ...quantityAndRateAuthorityIdentity,
    authorityId: createFinancialAuthorityViewIdV1(quantityAndRateAuthorityIdentity),
  }),
  true,
  'authority accepts an exact quantity-and-rate projection replayed from target evidence'
);
const normalizedCommitmentIdentity = {
  ...projectionIdentity,
  scenarioId: 'reservation:normalized-month',
  operationKind: 'commitment-coverage',
  targetProvenance: 'provider-quote-derived',
  targetPeriodConvention: 'normalized-average-month',
  targetPeriodProfile: {
    kind: 'normalized-average-month',
    annualDayCount: 365,
    monthDivisor: 12,
    hoursPerDay: 24,
    normalizedHours: '730',
  },
  appliedComponentTargets: [
    {
      componentId: actualCoordinate.ownerBaselines[0].components[0].componentId,
      targetAmount: '235',
      targetConfigurationId: 'azure-reservation:d11-v2:one-year',
      targetEvidenceRefIds: [commitmentQuoteEvidenceReference.evidenceRefId],
      commitmentCoverage: {
        instrumentKind: 'reservation',
        productId: 'azure-reservation:d11-v2:one-year',
        quote: { kind: 'whole-term', amount: '2400', currencyCode: 'AUD', termMonths: 12, termDayCount: 365 },
        purchaseQuantity: '1',
        eligibleQuantity: { amount: '800', unit: '1 Hour' },
        existingCoveredQuantity: { amount: '0', unit: '1 Hour' },
        coveredQuantity: { amount: '730', unit: '1 Hour' },
        commitmentCharge: { amount: '200', currencyCode: 'AUD' },
        uncoveredQuantity: { amount: '70', unit: '1 Hour' },
        uncoveredRate: { amount: '0.5', currencyCode: 'AUD', quantityUnit: '1 Hour' },
        uncoveredRemainderRule: 'billing-derived-effective-rate',
        effectivePeriod: { startDate: '2026-08-01', endDateExclusive: '2027-08-01', dateBasis: 'billing-calendar' },
      },
    },
  ],
};
const normalizedCommitmentProjection = {
  ...normalizedCommitmentIdentity,
  status: 'available',
  projectionId: hash(canonicalizeFinancialProjectionIdentityV1(normalizedCommitmentIdentity)),
  current: { total: '500', affected: '500', unchanged: '0' },
  target: { total: '235', affected: '235', unchanged: '0' },
  change: { delta: '-265', savings: '265', increase: '0' },
  reconciliation: { status: 'reconciled', difference: '0' },
};
const normalizedCommitmentCoordinateIdentity = {
  ...actualCoordinateWithoutId,
  projections: [normalizedCommitmentProjection],
};
const normalizedCommitmentCoordinate = {
  ...normalizedCommitmentCoordinateIdentity,
  coordinateId: createFinancialAuthorityCoordinateIdV1(normalizedCommitmentCoordinateIdentity),
};
const normalizedCommitmentAuthorityIdentity = {
  ...authorityIdentity,
  coordinates: [normalizedCommitmentCoordinate, combinedCoordinate, estimatedCoordinate],
};
const normalizedCommitmentAuthority = {
  ...normalizedCommitmentAuthorityIdentity,
  authorityId: createFinancialAuthorityViewIdV1(normalizedCommitmentAuthorityIdentity),
};
assert.equal(
  isFinancialAuthorityViewV1(normalizedCommitmentAuthority),
  false,
  'A normalized-average-month commitment target must not subtract from an observed rolling-30-day owner baseline.'
);
const observedCommitmentIdentity = structuredClone(normalizedCommitmentIdentity);
observedCommitmentIdentity.scenarioId = 'reservation:rolling-30-days';
observedCommitmentIdentity.targetPeriodConvention = 'same-period-quantity';
observedCommitmentIdentity.targetPeriodProfile = {
  kind: 'observed-period',
  dayCount: 30,
  hoursPerDay: 24,
  hourCount: '720',
  currencyMinorUnitScale: 2,
  roundingMode: 'half-even',
};
observedCommitmentIdentity.appliedComponentTargets[0].targetAmount = '247.26';
observedCommitmentIdentity.appliedComponentTargets[0].commitmentCoverage.coveredQuantity.amount = '720';
observedCommitmentIdentity.appliedComponentTargets[0].commitmentCoverage.uncoveredQuantity.amount = '80';
observedCommitmentIdentity.appliedComponentTargets[0].commitmentCoverage.uncoveredRate.amount = '0.625';
observedCommitmentIdentity.appliedComponentTargets[0].commitmentCoverage.commitmentCharge.amount = '197.26';
const observedCommitmentProjection = {
  ...observedCommitmentIdentity,
  status: 'available',
  projectionId: hash(canonicalizeFinancialProjectionIdentityV1(observedCommitmentIdentity)),
  current: { total: '500', affected: '500', unchanged: '0' },
  target: { total: '247.26', affected: '247.26', unchanged: '0' },
  change: { delta: '-252.74', savings: '252.74', increase: '0' },
  reconciliation: { status: 'reconciled', difference: '0' },
};
const observedCommitmentCoordinateIdentity = {
  ...actualCoordinateWithoutId,
  projections: [observedCommitmentProjection],
};
const observedCommitmentCoordinate = {
  ...observedCommitmentCoordinateIdentity,
  coordinateId: createFinancialAuthorityCoordinateIdV1(observedCommitmentCoordinateIdentity),
};
const observedCommitmentAuthorityIdentity = {
  ...authorityIdentity,
  coordinates: [observedCommitmentCoordinate, combinedCoordinate, estimatedCoordinate],
};
const observedCommitmentAuthority = {
  ...observedCommitmentAuthorityIdentity,
  authorityId: createFinancialAuthorityViewIdV1(observedCommitmentAuthorityIdentity),
};
assert.equal(
  isFinancialAuthorityViewV1(observedCommitmentAuthority),
  true,
  'Observed-period commitment targets must replay against the exact rolling-30-day baseline quantity and effective rate.'
);
const mutateProjectedAuthority = mutate => {
  const candidate = structuredClone(projectedAuthority);
  const changedProjection = candidate.coordinates[0].projections[0];
  mutate(changedProjection);
  const {
    status: _projectionStatus,
    projectionId: _projectionId,
    current: _projectionCurrent,
    target: _projectionTarget,
    change: _projectionChange,
    reconciliation: _projectionReconciliation,
    ...changedProjectionIdentity
  } = changedProjection;
  changedProjection.projectionId = hash(canonicalizeFinancialProjectionIdentityV1(changedProjectionIdentity));
  const { coordinateId: _coordinateId, ...changedCoordinateIdentity } = candidate.coordinates[0];
  candidate.coordinates[0].coordinateId = createFinancialAuthorityCoordinateIdV1(changedCoordinateIdentity);
  const { authorityId: _authorityId, ...changedAuthorityIdentity } = candidate;
  candidate.authorityId = createFinancialAuthorityViewIdV1(changedAuthorityIdentity);
  return candidate;
};
assert.equal(
  isFinancialAuthorityViewV1(
    mutateProjectedAuthority(changedProjection => {
      const componentId = hash('component-not-in-current-baseline');
      changedProjection.affectedComponentIds = [componentId];
      changedProjection.appliedComponentTargets[0].componentId = componentId;
    })
  ),
  false,
  'projection affected components must belong to the referenced current baseline'
);
assert.equal(
  isFinancialAuthorityViewV1(
    mutateProjectedAuthority(changedProjection => {
      changedProjection.current = { total: '499', affected: '499', unchanged: '0' };
      changedProjection.target = { total: '399', affected: '399', unchanged: '0' };
    })
  ),
  false,
  'projection current amounts must be recomputed from the referenced baseline components'
);
assert.throws(
  () =>
    mutateProjectedAuthority(changedProjection => {
      changedProjection.appliedComponentTargets[0].sourceQuantity.amount = '799';
    }),
  /Invalid FinancialProjectionIdentityPreimageV1/,
  'projection applied inputs must first replay to their declared target amount'
);
assert.equal(
  isFinancialAuthorityViewV1(
    mutateProjectedAuthority(changedProjection => {
      changedProjection.appliedComponentTargets[0].targetEvidenceRefIds = [hash('unbound-target-evidence')];
    })
  ),
  false,
  'projection applied targets must identify evidence references inside the bound target bundle'
);

const activationIdentity = {
  scenarioId: 'recommendation-1',
  recommendationId: 'recommendation-1',
  projectionId: projection.projectionId,
  lifecycleState: 'Active',
  lifecycleVersion: 'recommendation-state-revision-1',
  lifecycleEvidenceRefId: lifecycleEvidenceReference.evidenceRefId,
  result: 'included',
  reason: 'active',
  evaluatedAt: '2026-08-23T01:00:00.000Z',
  policyVersion: 'financial-savings-activation/v1',
};
const activation = {
  ...activationIdentity,
  activationId: createFinancialSavingsActivationIdV1(activationIdentity),
};
const allocationIdentity = {
  ownerScopeId: vmId,
  billableComponentIds: [...projection.affectedComponentIds],
  scenarioId: 'recommendation-1',
  recommendationId: 'recommendation-1',
  baselineId: projection.baselineId,
  projectionId: projection.projectionId,
  denominatorId: createFinancialSavingsDenominatorIdV1({
    kind: 'projection-affected-current',
    baselineId: projection.baselineId,
    componentIds: projection.affectedComponentIds,
    amount: projection.current.affected,
    currencyCode: projection.accountingCurrencyCode,
  }),
  eligibility: { kind: 'not-applicable' },
  activationId: activation.activationId,
  savingsMinorUnits: 10_000,
};
const allocation = {
  ...allocationIdentity,
  allocationId: createFinancialSavingsAllocationIdV1(allocationIdentity),
};
const availableSavingsIdentity = {
  schemaVersion: 1,
  contractVersion: 'financial-savings-authority/v1',
  financialAuthorityId: projectedAuthority.authorityId,
  artifactGeneration: projectedAuthority.artifactGeneration,
  eligibilityBaselines: [],
  eligibilityAssessments: [],
  coordinates: projectedAuthority.coordinates.map(authorityCoordinate =>
    authorityCoordinate.coordinateId === projectedActualCoordinate.coordinateId
      ? {
          status: 'available',
          coordinateId: authorityCoordinate.coordinateId,
          currentAggregateBaselineId: authorityCoordinate.aggregateBaseline.baselineId,
          accountingCurrencyCode: 'AUD',
          minorUnitScale: 2,
          roundingMode: 'half-away-from-zero',
          scenarioCoverage: {
            status: 'complete',
            evidenceRefId: scenarioCoverageEvidenceReference.evidenceRefId,
            scenarioIds: ['recommendation-1'],
          },
          activations: [activation],
          allocations: [allocation],
          resourceContributions: [{ ownerScopeId: vmId, allocationIds: [allocation.allocationId], savingsMinorUnits: 10_000 }],
          recommendationContributions: [
            {
              ownerScopeId: vmId,
              recommendationId: 'recommendation-1',
              allocationIds: [allocation.allocationId],
              savingsMinorUnits: 10_000,
            },
          ],
          aggregate: { allocationIds: [allocation.allocationId], savingsMinorUnits: 10_000 },
        }
      : {
          status: 'unavailable',
          coordinateId: authorityCoordinate.coordinateId,
          currentAggregateBaselineId: authorityCoordinate.aggregateBaseline.baselineId,
          unavailableReason: 'projection-unavailable',
        }
  ),
};
const availableSavingsAuthority = {
  ...availableSavingsIdentity,
  savingsAuthorityId: createFinancialSavingsAuthorityIdV1(availableSavingsIdentity),
};
assert.equal(
  isFinancialSavingsAuthorityBoundToFinancialAuthorityV1(availableSavingsAuthority, projectedAuthority),
  true,
  'available savings binds an exact projection, lifecycle activation, allocation, resource contribution, and aggregate'
);
const overlappingProjectionIdentity = { ...projectionIdentity, scenarioId: 'recommendation-2' };
const overlappingProjection = {
  ...projection,
  ...overlappingProjectionIdentity,
  projectionId: hash(canonicalizeFinancialProjectionIdentityV1(overlappingProjectionIdentity)),
};
const { coordinateId: _projectedCoordinateId, ...projectedCoordinateWithoutId } = projectedActualCoordinate;
const overlapCoordinateIdentity = { ...projectedCoordinateWithoutId, projections: [projection, overlappingProjection] };
const overlapCoordinate = { ...overlapCoordinateIdentity, coordinateId: createFinancialAuthorityCoordinateIdV1(overlapCoordinateIdentity) };
const overlapAuthorityIdentity = { ...projectedAuthorityIdentity, coordinates: [overlapCoordinate, combinedCoordinate, estimatedCoordinate] };
const overlapAuthority = { ...overlapAuthorityIdentity, authorityId: createFinancialAuthorityViewIdV1(overlapAuthorityIdentity) };
const overlappingActivationIdentity = {
  ...activationIdentity,
  scenarioId: 'recommendation-2',
  recommendationId: 'recommendation-2',
  projectionId: overlappingProjection.projectionId,
};
const overlappingActivation = {
  ...overlappingActivationIdentity,
  activationId: createFinancialSavingsActivationIdV1(overlappingActivationIdentity),
};
const overlappingAllocationIdentity = {
  ...allocationIdentity,
  scenarioId: 'recommendation-2',
  recommendationId: 'recommendation-2',
  projectionId: overlappingProjection.projectionId,
  activationId: overlappingActivation.activationId,
};
const overlappingAllocation = {
  ...overlappingAllocationIdentity,
  allocationId: createFinancialSavingsAllocationIdV1(overlappingAllocationIdentity),
};
const overlappingSavingsIdentity = {
  ...availableSavingsIdentity,
  financialAuthorityId: overlapAuthority.authorityId,
  coordinates: availableSavingsIdentity.coordinates.map(coordinate =>
    coordinate.status === 'available'
      ? {
          ...coordinate,
          coordinateId: overlapCoordinate.coordinateId,
          scenarioCoverage: { ...coordinate.scenarioCoverage, scenarioIds: ['recommendation-1', 'recommendation-2'] },
          activations: [activation, overlappingActivation],
          allocations: [allocation, overlappingAllocation],
          resourceContributions: [
            {
              ownerScopeId: vmId,
              allocationIds: [allocation.allocationId, overlappingAllocation.allocationId],
              savingsMinorUnits: 20_000,
            },
          ],
          recommendationContributions: [
            {
              ownerScopeId: vmId,
              recommendationId: 'recommendation-1',
              allocationIds: [allocation.allocationId],
              savingsMinorUnits: 10_000,
            },
            {
              ownerScopeId: vmId,
              recommendationId: 'recommendation-2',
              allocationIds: [overlappingAllocation.allocationId],
              savingsMinorUnits: 10_000,
            },
          ],
          aggregate: { allocationIds: [allocation.allocationId, overlappingAllocation.allocationId], savingsMinorUnits: 20_000 },
        }
      : coordinate
  ),
};
assert.equal(
  isFinancialSavingsAuthorityBoundToFinancialAuthorityV1(
    { ...overlappingSavingsIdentity, savingsAuthorityId: createFinancialSavingsAuthorityIdV1(overlappingSavingsIdentity) },
    overlapAuthority
  ),
  false,
  'one current baseline component cannot contribute through multiple active savings allocations'
);

const eligibilityEvidenceAssessmentIdentity = {
  schemaVersion: 1,
  contractVersion: 'financial-evidence-assessment/v1',
  policyVersion: 'financial-eligibility-evidence/v1',
  evaluatedAt: '2026-08-23T01:00:00.000Z',
  request: {
    provider: 'azure',
    providerAccountRefs: [subscriptionRef],
    scopeKind: 'canonical-resource-owner',
    scopeId: vmId,
    requestedEvidenceRoles: ['eligibility-rule'],
  },
  roleAssessments: [
    {
      role: 'eligibility-rule',
      support: 'supported',
      requestState: 'requested',
      productionState: 'produced',
      matchState: 'matched',
      evidenceRefId: eligibilityRuleEvidenceReference.evidenceRefId,
    },
  ],
  completeness: 'complete',
  reconciliation: 'reconciled',
  freshness: 'current',
  result: 'available',
  primaryReason: 'evidence-accepted',
  supportingReasons: [],
  evidenceBundleId: bundle.bundleId,
  summary: { requestedRoleCount: 1, producedRoleCount: 1, matchedRoleCount: 1 },
};
const eligibilityEvidenceAssessment = {
  ...eligibilityEvidenceAssessmentIdentity,
  assessmentId: hash(canonicalizeFinancialEvidenceAssessmentIdentityV1(eligibilityEvidenceAssessmentIdentity)),
};
const eligibilityComponent = {
  ...ownerIdentity.components[0],
  componentId: hash('eligibility-vm-component'),
  amount: '348',
};
const eligibilityBaselineIdentity = {
  ...ownerIdentity,
  period: { ...period, windowKind: 'stable-billing-window' },
  assessmentId: eligibilityEvidenceAssessment.assessmentId,
  chargeInclusionPolicyRef: { policyId: 'azure-savings-plan-eligibility/v1', policyDigest: hash('eligibility-policy') },
  components: [eligibilityComponent],
};
const eligibilityBaseline = makeOwner(eligibilityBaselineIdentity, '348');
const denominator = {
  kind: 'eligible-spend',
  baselineId: eligibilityBaseline.baselineId,
  componentIds: [eligibilityComponent.componentId],
  amount: '348',
  currencyCode: 'AUD',
};
const eligibilityIdentity = {
  schemaVersion: 1,
  contractVersion: 'financial-eligibility-assessment/v1',
  provider: 'azure',
  providerAccountRefs: [subscriptionRef],
  scopeId: vmId,
  scenarioId: 'recommendation-1',
  benefitKind: 'savings-plan',
  ruleVersion: eligibilityRuleEvidenceReference.revisionId,
  evaluatedAt: '2026-08-23T01:00:00.000Z',
  status: 'available',
  ruleEvidenceRefId: eligibilityRuleEvidenceReference.evidenceRefId,
  eligibilityBaselineId: eligibilityBaseline.baselineId,
  denominator: {
    denominatorId: createFinancialSavingsDenominatorIdV1(denominator),
    kind: 'eligible-spend',
    componentIds: denominator.componentIds,
    amount: denominator.amount,
    currencyCode: denominator.currencyCode,
  },
  eligibleComponentIds: [eligibilityComponent.componentId],
  excludedComponentIds: [],
  currentBaselineMapping: {
    currentBaselineId: projection.baselineId,
    compatibility: 'compatible',
    mappings: [
      {
        currentComponentId: projection.affectedComponentIds[0],
        eligibilityComponentIds: [eligibilityComponent.componentId],
      },
    ],
  },
};
const eligibilityAssessment = {
  ...eligibilityIdentity,
  eligibilityId: createFinancialEligibilityAssessmentIdV1(eligibilityIdentity),
};
const eligibilityAuthorityIdentity = {
  ...projectedAuthorityIdentity,
  evidenceAssessments: [...projectedAuthorityIdentity.evidenceAssessments, eligibilityEvidenceAssessment],
};
const eligibilityAuthority = {
  ...eligibilityAuthorityIdentity,
  authorityId: createFinancialAuthorityViewIdV1(eligibilityAuthorityIdentity),
};
assert.equal(isFinancialAuthorityViewV1(eligibilityAuthority), true, 'eligibility evidence assessment belongs to the authority generation');
const mappedAllocationIdentity = {
  ...allocationIdentity,
  denominatorId: eligibilityAssessment.denominator.denominatorId,
  eligibility: {
    kind: 'mapped',
    eligibilityId: eligibilityAssessment.eligibilityId,
    eligibilityBaselineId: eligibilityBaseline.baselineId,
    currentComponentIds: [...projection.affectedComponentIds],
    eligibilityComponentIds: [eligibilityComponent.componentId],
  },
};
const mappedAllocation = {
  ...mappedAllocationIdentity,
  allocationId: createFinancialSavingsAllocationIdV1(mappedAllocationIdentity),
};
const mappedSavingsIdentity = {
  ...availableSavingsIdentity,
  financialAuthorityId: eligibilityAuthority.authorityId,
  eligibilityBaselines: [eligibilityBaseline],
  eligibilityAssessments: [eligibilityAssessment],
  coordinates: availableSavingsIdentity.coordinates.map(coordinate =>
    coordinate.status === 'available'
      ? {
          ...coordinate,
          allocations: [mappedAllocation],
          resourceContributions: [
            { ownerScopeId: vmId, allocationIds: [mappedAllocation.allocationId], savingsMinorUnits: mappedAllocation.savingsMinorUnits },
          ],
          recommendationContributions: [
            {
              ownerScopeId: vmId,
              recommendationId: mappedAllocation.recommendationId,
              allocationIds: [mappedAllocation.allocationId],
              savingsMinorUnits: mappedAllocation.savingsMinorUnits,
            },
          ],
          aggregate: { allocationIds: [mappedAllocation.allocationId], savingsMinorUnits: mappedAllocation.savingsMinorUnits },
        }
      : coordinate
  ),
};
const mappedSavingsAuthority = {
  ...mappedSavingsIdentity,
  savingsAuthorityId: createFinancialSavingsAuthorityIdV1(mappedSavingsIdentity),
};
assert.equal(
  isFinancialSavingsAuthorityBoundToFinancialAuthorityV1(mappedSavingsAuthority, eligibilityAuthority),
  true,
  'mapped eligibility binds rule evidence, eligibility baseline, exact denominator, current components, and allocation'
);
const staleRuleSavings = structuredClone(mappedSavingsAuthority);
staleRuleSavings.eligibilityAssessments[0].ruleVersion = 'savings-plan-rule-stale';
const { eligibilityId: _staleEligibilityId, ...staleEligibilityIdentity } = staleRuleSavings.eligibilityAssessments[0];
staleRuleSavings.eligibilityAssessments[0].eligibilityId = createFinancialEligibilityAssessmentIdV1(staleEligibilityIdentity);
staleRuleSavings.coordinates[0].allocations[0].eligibility.eligibilityId = staleRuleSavings.eligibilityAssessments[0].eligibilityId;
const { allocationId: _staleAllocationId, ...staleAllocationIdentity } = staleRuleSavings.coordinates[0].allocations[0];
staleRuleSavings.coordinates[0].allocations[0].allocationId = createFinancialSavingsAllocationIdV1(staleAllocationIdentity);
staleRuleSavings.coordinates[0].resourceContributions[0].allocationIds = [staleRuleSavings.coordinates[0].allocations[0].allocationId];
staleRuleSavings.coordinates[0].aggregate.allocationIds = [staleRuleSavings.coordinates[0].allocations[0].allocationId];
const { savingsAuthorityId: _staleSavingsAuthorityId, ...staleSavingsIdentity } = staleRuleSavings;
staleRuleSavings.savingsAuthorityId = createFinancialSavingsAuthorityIdV1(staleSavingsIdentity);
assert.equal(
  isFinancialSavingsAuthorityBoundToFinancialAuthorityV1(staleRuleSavings, eligibilityAuthority),
  false,
  'eligibility rule version must match the revision of rule evidence in the eligibility baseline bundle'
);
const mutateAvailableSavings = mutate => {
  const candidate = structuredClone(availableSavingsAuthority);
  mutate(candidate.coordinates[0]);
  return withSavingsAuthorityId(candidate);
};
assert.equal(
  isFinancialSavingsAuthorityBoundToFinancialAuthorityV1(
    mutateAvailableSavings(coordinate => {
      coordinate.scenarioCoverage.undeclaredCoverage = 'partial';
    }),
    projectedAuthority
  ),
  false,
  'undeclared nested savings fields rejected'
);
assert.equal(
  isFinancialSavingsAuthorityBoundToFinancialAuthorityV1(
    mutateAvailableSavings(coordinate => {
      coordinate.activations[0].lifecycleState = 'Archived';
      coordinate.activations[0].reason = 'archived';
    }),
    projectedAuthority
  ),
  false,
  'Archived lifecycle cannot be included in active savings'
);
assert.equal(
  isFinancialSavingsAuthorityBoundToFinancialAuthorityV1(
    mutateAvailableSavings(coordinate => {
      coordinate.activations.push({ ...coordinate.activations[0], activationId: hash('activation-duplicate') });
    }),
    projectedAuthority
  ),
  false,
  'one covered recommendation has exactly one activation decision'
);
assert.equal(
  isFinancialSavingsAuthorityBoundToFinancialAuthorityV1(
    mutateAvailableSavings(coordinate => {
      coordinate.activations[0].activationId = hash('forged-activation');
      coordinate.allocations[0].activationId = coordinate.activations[0].activationId;
    }),
    projectedAuthority
  ),
  false,
  'activation identity is recomputed from lifecycle and projection evidence'
);
assert.equal(
  isFinancialSavingsAuthorityBoundToFinancialAuthorityV1(
    mutateAvailableSavings(coordinate => {
      coordinate.allocations[0].allocationId = hash('forged-allocation');
      coordinate.resourceContributions[0].allocationIds = [coordinate.allocations[0].allocationId];
      coordinate.aggregate.allocationIds = [coordinate.allocations[0].allocationId];
    }),
    projectedAuthority
  ),
  false,
  'allocation identity is recomputed from owner, projection, activation, and money'
);
assert.equal(
  isFinancialSavingsAuthorityBoundToFinancialAuthorityV1(
    mutateAvailableSavings(coordinate => {
      coordinate.allocations[0].denominatorId = hash('forged-denominator');
      const { allocationId: _allocationId, ...changedAllocationIdentity } = coordinate.allocations[0];
      coordinate.allocations[0].allocationId = createFinancialSavingsAllocationIdV1(changedAllocationIdentity);
      coordinate.resourceContributions[0].allocationIds = [coordinate.allocations[0].allocationId];
      coordinate.aggregate.allocationIds = [coordinate.allocations[0].allocationId];
    }),
    projectedAuthority
  ),
  false,
  'denominator identity is recomputed from the exact baseline component subset and amount'
);
assert.equal(
  isFinancialSavingsAuthorityBoundToFinancialAuthorityV1(
    mutateAvailableSavings(coordinate => {
      coordinate.allocations[0].eligibility = {
        kind: 'mapped',
        eligibilityId: hash('orphan-eligibility'),
        eligibilityBaselineId: hash('orphan-eligibility-baseline'),
        currentComponentIds: [...coordinate.allocations[0].billableComponentIds],
        eligibilityComponentIds: [hash('orphan-eligibility-component')],
      };
      const { allocationId: _allocationId, ...changedAllocationIdentity } = coordinate.allocations[0];
      coordinate.allocations[0].allocationId = createFinancialSavingsAllocationIdV1(changedAllocationIdentity);
      coordinate.resourceContributions[0].allocationIds = [coordinate.allocations[0].allocationId];
      coordinate.aggregate.allocationIds = [coordinate.allocations[0].allocationId];
    }),
    projectedAuthority
  ),
  false,
  'mapped eligibility must resolve to generation-bound eligibility evidence rather than an orphan identity'
);
assert.equal(
  isFinancialSavingsAuthorityBoundToFinancialAuthorityV1(
    mutateAvailableSavings(coordinate => {
      coordinate.scenarioCoverage.evidenceRefId = hash('unbound-scenario-coverage');
    }),
    projectedAuthority
  ),
  false,
  'scenario coverage must resolve to generation-bound evidence'
);
assert.equal(
  isFinancialSavingsAuthorityBoundToFinancialAuthorityV1(
    mutateAvailableSavings(coordinate => {
      coordinate.activations[0].lifecycleEvidenceRefId = hash('unbound-lifecycle-evidence');
      const { activationId: _activationId, ...changedActivationIdentity } = coordinate.activations[0];
      coordinate.activations[0].activationId = createFinancialSavingsActivationIdV1(changedActivationIdentity);
      coordinate.allocations[0].activationId = coordinate.activations[0].activationId;
      const { allocationId: _allocationId, ...changedAllocationIdentity } = coordinate.allocations[0];
      coordinate.allocations[0].allocationId = createFinancialSavingsAllocationIdV1(changedAllocationIdentity);
      coordinate.resourceContributions[0].allocationIds = [coordinate.allocations[0].allocationId];
      coordinate.aggregate.allocationIds = [coordinate.allocations[0].allocationId];
    }),
    projectedAuthority
  ),
  false,
  'activation lifecycle must resolve to version-matched generation-bound evidence'
);

const staleScenarioReference = {
  ...scenarioCoverageEvidenceReference,
  evidenceRefId: hash('stale-recommendation-scenario-set-ref'),
  generationId: 'portal-run-before-current',
};
const staleScenarioBundleIdentity = {
  schemaVersion: 1,
  contractVersion: 'financial-evidence-bundle/v1',
  references: [staleScenarioReference],
};
const staleScenarioBundle = {
  ...staleScenarioBundleIdentity,
  bundleId: hash(canonicalizeFinancialEvidenceBundleIdentityV1(staleScenarioBundleIdentity)),
};
const staleScenarioAuthorityIdentity = {
  ...projectedAuthorityIdentity,
  evidenceBundles: [...projectedAuthorityIdentity.evidenceBundles, staleScenarioBundle],
};
const staleScenarioAuthority = {
  ...staleScenarioAuthorityIdentity,
  authorityId: createFinancialAuthorityViewIdV1(staleScenarioAuthorityIdentity),
};
const staleScenarioSavings = structuredClone(availableSavingsAuthority);
staleScenarioSavings.financialAuthorityId = staleScenarioAuthority.authorityId;
staleScenarioSavings.coordinates[0].scenarioCoverage.evidenceRefId = staleScenarioReference.evidenceRefId;
const { savingsAuthorityId: _staleScenarioSavingsId, ...staleScenarioSavingsIdentity } = staleScenarioSavings;
staleScenarioSavings.savingsAuthorityId = createFinancialSavingsAuthorityIdV1(staleScenarioSavingsIdentity);
assert.equal(
  isFinancialSavingsAuthorityBoundToFinancialAuthorityV1(staleScenarioSavings, staleScenarioAuthority),
  false,
  'scenario coverage evidence must belong to the exact Portal authority run'
);

const futureEvidenceReference = {
  ...lifecycleEvidenceReference,
  evidenceRefId: hash('future-lifecycle-evidence-ref'),
  intrinsicTime: { kind: 'published-at', at: '2026-08-23T01:00:00.001Z' },
};
const futureEvidenceBundleIdentity = {
  schemaVersion: 1,
  contractVersion: 'financial-evidence-bundle/v1',
  references: [futureEvidenceReference],
};
const futureEvidenceBundle = {
  ...futureEvidenceBundleIdentity,
  bundleId: hash(canonicalizeFinancialEvidenceBundleIdentityV1(futureEvidenceBundleIdentity)),
};
const futureEvidenceAuthorityIdentity = {
  ...projectedAuthorityIdentity,
  evidenceBundles: [...projectedAuthorityIdentity.evidenceBundles, futureEvidenceBundle],
};
assert.equal(
  isFinancialAuthorityViewV1({
    ...futureEvidenceAuthorityIdentity,
    authorityId: createFinancialAuthorityViewIdV1(futureEvidenceAuthorityIdentity),
  }),
  false,
  'financial authority cannot consume evidence observed or published after its generation time'
);

console.log('Financial authority view contract checks passed.');
