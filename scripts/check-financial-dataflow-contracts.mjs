import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

import { runFinancialDataflowContractNegativeChecks } from './check-financial-dataflow-contract-negatives.mjs';
import { validateCoreFinancialDataflowCaseAgainstTypesV1 } from './financial-dataflow-core-types-adapter.mjs';

import {
  FINANCIAL_ANALYTICS_INPUT_CONTRACT_VERSION_V1,
  FINANCIAL_ANALYTICS_CURRENT_POINTER_CONTRACT_VERSION_V1,
  FINANCIAL_ANALYTICS_JOB_REQUEST_CONTRACT_VERSION_V1,
  FINANCIAL_ANALYTICS_PROJECTION_CONTRACT_VERSION_V1,
  FINANCIAL_CURRENT_SPEND_COMPOSITION_CONTRACT_VERSION_V1,
  FINANCIAL_POLICY_ACTION_ATTEMPT_CONTRACT_VERSION_V1,
  FINANCIAL_POLICY_DEFINITION_CONTRACT_VERSION_V1,
  FINANCIAL_POLICY_EVALUATION_CONTRACT_VERSION_V1,
  FINANCIAL_POLICY_READ_PROJECTION_CONTRACT_VERSION_V1,
  canonicalizeCurrentSpendCompositionIdentityV1,
  canonicalizeFinancialAnalyticsInputIdentityV1,
  canonicalizeFinancialScopeBaselineIdentityV2,
  createCurrentSpendCompositionIdV1,
  createCurrentSpendMembershipDigestV1,
  createFinancialAnalyticsInputIdV1,
  createFinancialAnalyticsCurrentPointerDigestV1,
  createFinancialAnalyticsJobRequestIdV1,
  createFinancialAnalyticsProjectionIdV1,
  createFinancialDataflowCoordinateIdV1,
  createFinancialPolicyActionAttemptIdV1,
  createFinancialPolicyDefinitionRevisionIdV1,
  createFinancialPolicyEvaluationActionAuditIdV1,
  createFinancialPolicyEvaluationIdV1,
  createFinancialPolicyEvaluationReadProjectionIdV1,
  isCurrentSpendCompositionV1,
  isCurrentSpendCompositionCompatibleV1,
  isFinancialAnalyticsInputSeriesV1,
  isFinancialAnalyticsInputSeriesCompatibleV1,
  isFinancialAnalyticsCurrentPointerV1,
  isFinancialAnalyticsCurrentPointerCompatibleV1,
  isFinancialAnalyticsJobRequestV1,
  isFinancialAnalyticsJobRequestCompatibleV1,
  isFinancialAnalyticsProjectionCompatibleV1,
  isFinancialAnalyticsProjectionV1,
  isFinancialBaselinePeriodV2,
  isFinancialPolicyActionAttemptCompatibleV1,
  isFinancialPolicyActionAttemptV1,
  isFinancialPolicyDefinitionRevisionV1,
  isFinancialPolicyEvaluationCompatibleV1,
  isFinancialPolicyEvaluationReadProjectionCompatibleV1,
  isFinancialPolicyEvaluationReadProjectionV1,
  isFinancialPolicyEvaluationV1,
  isFinancialDataflowValueWithinLimitsV1,
  parseFinancialDataflowJsonV1,
  toCanonicalEstimateLensV1,
  toLegacyEstimateLensV1,
} from '../dist/index.js';

const fixtureUrl = new URL('./fixtures/financial-dataflow-alignment-v1.json', import.meta.url);
const siblingCoreFixtureUrl = new URL(
  '../../core/specs/cost-savings/unified-financial-baseline/fixtures/financial-dataflow-alignment-v1.json',
  import.meta.url
);
const coreValidatorUrl = new URL(
  '../../core/specs/cost-savings/unified-financial-baseline/fixtures/validate-financial-dataflow-alignment.mjs',
  import.meta.url
);
const fixtureText = readFileSync(fixtureUrl, 'utf8');
const corpus = JSON.parse(fixtureText);
if (existsSync(siblingCoreFixtureUrl)) {
  assert.equal(
    readFileSync(siblingCoreFixtureUrl, 'utf8'),
    fixtureText,
    'Vendored Types corpus must match the sibling Core source when both are checked out.'
  );
}
if (existsSync(coreValidatorUrl)) {
  const coreValidation = spawnSync(process.execPath, [coreValidatorUrl.pathname], { encoding: 'utf8' });
  assert.equal(coreValidation.status, 0, coreValidation.stderr || coreValidation.stdout);
}
assert.equal(corpus.schemaVersion, 1);
assert.equal(corpus.contractVersion, 'financial-dataflow-alignment/v1');
assert.equal(corpus.cases.length, 8);
assert.equal(corpus.mutations.length, 24);
assert.deepEqual(
  new Set(corpus.cases.map(entry => entry.coordinate.scope.kind)),
  new Set(['subscription', 'resource', 'tag-scope', 'multi-subscription', 'resource-group'])
);
assert.deepEqual(new Set(corpus.cases.map(entry => entry.coordinate.costBasis)), new Set(['billed', 'amortized']));
assert.deepEqual(new Set(corpus.cases.map(entry => entry.coordinate.estimateLens)), new Set(['billing-only', 'include-estimates', 'estimates-only']));
const adaptedCoreCases = corpus.cases.map(validateCoreFinancialDataflowCaseAgainstTypesV1);
assert.equal(adaptedCoreCases.length, corpus.cases.length);
assert.equal(
  adaptedCoreCases.every(result => result.validatedKinds.includes('current-spend-composition')),
  true
);
for (const [coreCase, adaptedCase] of corpus.cases.map((entry, index) => [entry, adaptedCoreCases[index]])) {
  if (coreCase.analyticsInput !== undefined) assert.equal(adaptedCase.validatedKinds.includes('analytics-input'), true, coreCase.caseId);
  if (coreCase.projection !== undefined) assert.equal(adaptedCase.validatedKinds.includes('analytics-projection'), true, coreCase.caseId);
  if (coreCase.analyticsResults !== undefined) assert.equal(adaptedCase.validatedKinds.includes('analytics-results'), true, coreCase.caseId);
  if (coreCase.policyDefinition !== undefined) assert.equal(adaptedCase.validatedKinds.includes('policy-definition'), true, coreCase.caseId);
  if (coreCase.evaluation !== undefined) assert.equal(adaptedCase.validatedKinds.includes('policy-evaluation'), true, coreCase.caseId);
  if (coreCase.evaluation?.actionAttempts !== undefined)
    assert.equal(adaptedCase.validatedKinds.includes('policy-action-attempts'), true, coreCase.caseId);
}

assert.equal(toCanonicalEstimateLensV1('actual-only'), 'billing-only');
assert.equal(toCanonicalEstimateLensV1('actual-plus-estimated'), 'include-estimates');
assert.equal(toCanonicalEstimateLensV1('estimates-only'), 'estimates-only');
assert.equal(toLegacyEstimateLensV1('billing-only'), 'actual-only');
assert.equal(toLegacyEstimateLensV1('include-estimates'), 'actual-plus-estimated');
assert.equal(toLegacyEstimateLensV1('estimates-only'), 'estimates-only');

const hash = character => `sha256:${character.repeat(64)}`;
assert.throws(() => parseFinancialDataflowJsonV1('\u00a0{}'), SyntaxError, 'Only RFC 8259 JSON whitespace is accepted.');
assert.equal(
  isFinancialDataflowValueWithinLimitsV1({ payload: 'x'.repeat(5_242_881) }),
  false,
  'Already-parsed validator inputs must obey the aggregate byte limit.'
);
assert.equal(
  isFinancialDataflowValueWithinLimitsV1({ payload: '\u0000'.repeat(900_000) }),
  false,
  'Aggregate byte accounting must include JSON escaping, not only the decoded string bytes.'
);
assert.equal(isFinancialDataflowValueWithinLimitsV1([undefined, Number.NaN]), false, 'Only actual JSON values can enter canonicalization.');
const referenceId = hash('1');
const coverageId = hash('2');
const period = {
  windowKind: 'calendar-month',
  requested: { startDate: '2026-08-01', endDateExclusive: '2026-09-01', dateBasis: 'company-local', timeZone: 'Pacific/Auckland' },
  observed: { startDate: '2026-08-01', endDateExclusive: '2026-09-01', dateBasis: 'company-local', timeZone: 'Pacific/Auckland' },
  coverage: [
    {
      coverageId,
      interval: { startDate: '2026-08-01', endDateExclusive: '2026-09-01', dateBasis: 'company-local', timeZone: 'Pacific/Auckland' },
      settlementState: 'unsettled',
      evidenceRefIds: [referenceId],
    },
  ],
  gaps: [],
};
assert.equal(isFinancialBaselinePeriodV2({ ...period, windowKind: 'daily' }), false, 'A daily baseline period must span exactly one day.');
assert.equal(
  isFinancialBaselinePeriodV2({
    ...period,
    windowKind: 'rolling-30-days',
    requested: { ...period.requested, endDateExclusive: '2026-08-30' },
    observed: { ...period.observed, endDateExclusive: '2026-08-30' },
    coverage: [{ ...period.coverage[0], interval: { ...period.coverage[0].interval, endDateExclusive: '2026-08-30' } }],
  }),
  false,
  'A rolling-30-days baseline period must span exactly 30 days.'
);
assert.equal(
  isFinancialBaselinePeriodV2({
    ...period,
    requested: { ...period.requested, startDate: '2026-08-02', endDateExclusive: '2026-09-02' },
    observed: { ...period.observed, startDate: '2026-08-02', endDateExclusive: '2026-09-02' },
    coverage: [
      {
        ...period.coverage[0],
        interval: { ...period.coverage[0].interval, startDate: '2026-08-02', endDateExclusive: '2026-09-02' },
      },
    ],
  }),
  false,
  'A calendar-month baseline period must use exact calendar-month boundaries.'
);
assert.equal(
  isFinancialBaselinePeriodV2({ ...period, windowKind: 'provider-billing-period' }),
  false,
  'A provider billing period must bind its provider period identity.'
);
assert.equal(
  isFinancialBaselinePeriodV2({ ...period, providerBillingPeriodId: 'provider-period:unexpected' }),
  false,
  'A non-provider window cannot carry a provider billing period identity.'
);
const incompleteCoveragePeriod = {
  ...period,
  coverage: [
    {
      ...period.coverage[0],
      interval: {
        ...period.coverage[0].interval,
        endDateExclusive: '2026-08-02',
      },
    },
  ],
};
assert.equal(
  isFinancialBaselinePeriodV2(incompleteCoveragePeriod),
  false,
  'Produced coverage intervals must collectively span the declared observed interval.'
);
const coordinate = {
  companyId: 'fixture-company:alpha',
  provider: 'azure',
  providerAccountRefs: ['fixture-subscription:aud'],
  scope: {
    kind: 'subscription',
    scopeId: 'fixture-subscription:aud',
    scopeFingerprint: hash('3'),
  },
  periodRole: 'current-spend',
  period,
  costBasis: 'billed',
  estimateLens: 'include-estimates',
  requestedCurrencyCode: 'AUD',
  accountingCurrency: { status: 'resolved', currencyCode: 'AUD' },
};
const members = [
  { memberScopeId: 'fixture-resource:one', baselineId: hash('4'), status: 'included' },
  { memberScopeId: 'fixture-resource:two', baselineId: hash('5'), status: 'included' },
];
const compositionIdentity = {
  schemaVersion: 1,
  contractVersion: FINANCIAL_CURRENT_SPEND_COMPOSITION_CONTRACT_VERSION_V1,
  coordinate,
  members,
  amount: { status: 'available', amount: '348', currencyCode: 'AUD' },
  membershipDigest: createCurrentSpendMembershipDigestV1(members),
  algorithmVersion: 'current-spend-composition/v1',
};
const composition = {
  ...compositionIdentity,
  compositionId: createCurrentSpendCompositionIdV1(compositionIdentity),
};
assert.equal(isCurrentSpendCompositionV1(composition), true);
assert.equal(
  canonicalizeCurrentSpendCompositionIdentityV1(compositionIdentity),
  canonicalizeCurrentSpendCompositionIdentityV1({ ...compositionIdentity, members: [...members].reverse() }),
  'Composition identity must canonicalize set-like member order.'
);

const createOwnerBaseline = ({ scopeId, amount, componentCharacter }) => {
  const evidenceRefId = hash(componentCharacter);
  const memberCoverageId = hash(componentCharacter === 'd' ? 'e' : 'f');
  const memberPeriod = {
    ...period,
    coverage: period.coverage.map(coverage => ({
      ...coverage,
      coverageId: memberCoverageId,
      evidenceRefIds: [evidenceRefId],
    })),
  };
  const baselineIdentity = {
    schemaVersion: 2,
    contractVersion: 'financial-scope-baseline/v2',
    provider: 'azure',
    providerAccountRefs: [...coordinate.providerAccountRefs],
    scopeKind: 'canonical-resource-owner',
    scopeId,
    period: memberPeriod,
    costBasis: coordinate.costBasis,
    estimateLens: toLegacyEstimateLensV1(coordinate.estimateLens),
    requestedCurrencyCode: 'AUD',
    assessmentId: hash('a'),
    baselineKind: 'owner',
    evidenceBundleId: hash('b'),
    accountingCurrency: { currencyCode: 'AUD', sourceCurrencyCode: 'AUD', evidenceRefIds: [evidenceRefId] },
    chargeInclusionPolicyRef: { policyId: 'fixture-charge-policy/v1', policyDigest: hash('c') },
    components: [
      {
        componentId: hash(componentCharacter === 'd' ? '7' : '8'),
        billableIdentity: `fixture-billable:${scopeId}`,
        ownerScopeId: scopeId,
        chargeClassification: 'usage',
        amount,
        evidenceRefIds: [evidenceRefId],
        coverageIds: [memberCoverageId],
      },
    ],
  };
  return {
    ...baselineIdentity,
    status: 'available',
    baselineId: `sha256:${createHash('sha256').update(canonicalizeFinancialScopeBaselineIdentityV2(baselineIdentity)).digest('hex')}`,
    total: { amount, currencyCode: 'AUD' },
    reconciliation: {
      status: 'reconciled',
      componentTotal: amount,
      sourceTotal: amount,
      withheldTotal: '0',
      residualTotal: '0',
      difference: '0',
    },
  };
};
const reconciledBaselines = [
  createOwnerBaseline({ scopeId: 'fixture-resource:reconciled-one', amount: '200', componentCharacter: 'd' }),
  createOwnerBaseline({ scopeId: 'fixture-resource:reconciled-two', amount: '148', componentCharacter: 'e' }),
];
const reconciledMembers = reconciledBaselines.map(baseline => ({
  memberScopeId: baseline.scopeId,
  baselineId: baseline.baselineId,
  status: 'included',
}));
const reconciledCompositionIdentity = {
  ...compositionIdentity,
  members: reconciledMembers,
  membershipDigest: createCurrentSpendMembershipDigestV1(reconciledMembers),
};
const reconciledComposition = {
  ...reconciledCompositionIdentity,
  compositionId: createCurrentSpendCompositionIdV1(reconciledCompositionIdentity),
};
assert.equal(isCurrentSpendCompositionCompatibleV1(reconciledComposition, reconciledBaselines), true);
const unavailableBaseline = {
  schemaVersion: 2,
  contractVersion: 'financial-scope-baseline/v2',
  provider: 'azure',
  providerAccountRefs: [...coordinate.providerAccountRefs],
  scopeKind: 'canonical-resource-owner',
  scopeId: 'fixture-resource:missing-baseline',
  period: reconciledBaselines[1].period,
  costBasis: coordinate.costBasis,
  estimateLens: toLegacyEstimateLensV1(coordinate.estimateLens),
  requestedCurrencyCode: 'AUD',
  assessmentId: hash('a'),
  status: 'unavailable',
  unavailableReason: 'evidence-not-produced',
  summary: { requestedRoleCount: 1, producedRoleCount: 0, matchedRoleCount: 0 },
};
const sourceBoundPartialMembers = [
  reconciledMembers[0],
  { memberScopeId: unavailableBaseline.scopeId, status: 'unavailable', reasonCode: unavailableBaseline.unavailableReason },
];
const sourceBoundPartialIdentity = {
  ...compositionIdentity,
  members: sourceBoundPartialMembers,
  amount: { status: 'partial', knownAmount: '200', currencyCode: 'AUD', reasonCodes: ['evidence-not-produced'] },
  membershipDigest: createCurrentSpendMembershipDigestV1(sourceBoundPartialMembers),
};
const sourceBoundPartial = {
  ...sourceBoundPartialIdentity,
  compositionId: createCurrentSpendCompositionIdV1(sourceBoundPartialIdentity),
};
assert.equal(isCurrentSpendCompositionCompatibleV1(sourceBoundPartial, [reconciledBaselines[0], unavailableBaseline]), true);
const fabricatedReasonIdentity = {
  ...sourceBoundPartialIdentity,
  amount: { ...sourceBoundPartialIdentity.amount, reasonCodes: ['coverage-incomplete'] },
};
assert.equal(
  isCurrentSpendCompositionCompatibleV1({ ...fabricatedReasonIdentity, compositionId: createCurrentSpendCompositionIdV1(fabricatedReasonIdentity) }, [
    reconciledBaselines[0],
    unavailableBaseline,
  ]),
  false,
  'Composition availability reasons must be derived from the exact member baseline states.'
);
const fabricatedCompositionIdentity = {
  ...reconciledCompositionIdentity,
  amount: { status: 'available', amount: '999999', currencyCode: 'AUD' },
};
const fabricatedComposition = {
  ...fabricatedCompositionIdentity,
  compositionId: createCurrentSpendCompositionIdV1(fabricatedCompositionIdentity),
};
assert.equal(
  isCurrentSpendCompositionCompatibleV1(fabricatedComposition, reconciledBaselines),
  false,
  'Composition money must equal the exact sum of its referenced V2 baselines.'
);

const zeroIdentity = {
  ...compositionIdentity,
  members: [{ memberScopeId: 'fixture-resource:zero', baselineId: hash('6'), status: 'included' }],
  amount: { status: 'available', amount: '0', currencyCode: 'AUD' },
};
zeroIdentity.membershipDigest = createCurrentSpendMembershipDigestV1(zeroIdentity.members);
assert.equal(isCurrentSpendCompositionV1({ ...zeroIdentity, compositionId: createCurrentSpendCompositionIdV1(zeroIdentity) }), true);

const partialIdentity = {
  ...compositionIdentity,
  members: [
    { memberScopeId: 'fixture-resource:one', baselineId: hash('4'), status: 'included' },
    { memberScopeId: 'fixture-resource:missing', status: 'unavailable', reasonCode: 'evidence-not-produced' },
  ],
  amount: { status: 'partial', knownAmount: '-5', currencyCode: 'AUD', reasonCodes: ['evidence-not-produced'] },
};
partialIdentity.membershipDigest = createCurrentSpendMembershipDigestV1(partialIdentity.members);
assert.equal(isCurrentSpendCompositionV1({ ...partialIdentity, compositionId: createCurrentSpendCompositionIdV1(partialIdentity) }), true);

const historyPeriod = {
  windowKind: 'rolling-30-days',
  requested: { startDate: '2026-07-02', endDateExclusive: '2026-08-01', dateBasis: 'company-local', timeZone: 'Pacific/Auckland' },
  observed: { startDate: '2026-07-02', endDateExclusive: '2026-08-01', dateBasis: 'company-local', timeZone: 'Pacific/Auckland' },
  coverage: [
    {
      coverageId: hash('7'),
      interval: { startDate: '2026-07-02', endDateExclusive: '2026-08-01', dateBasis: 'company-local', timeZone: 'Pacific/Auckland' },
      settlementState: 'mixed',
      evidenceRefIds: [referenceId],
    },
  ],
  gaps: [{ startDate: '2026-07-02', endDateExclusive: '2026-07-30', dateBasis: 'company-local', timeZone: 'Pacific/Auckland' }],
};
const inputIdentity = {
  schemaVersion: 1,
  contractVersion: FINANCIAL_ANALYTICS_INPUT_CONTRACT_VERSION_V1,
  coordinate: { ...coordinate, periodRole: 'analytics-input', period: historyPeriod },
  granularity: 'daily',
  producerGenerationId: 'fixture-generation:analytics-input:one',
  points: [
    { date: '2026-07-30', compositionId: hash('8'), status: 'available', amount: '-20' },
    { date: '2026-07-31', compositionId: hash('9'), status: 'partial', knownAmount: '12', reasonCodes: ['evidence-not-produced'] },
  ],
  gaps: [{ startDate: '2026-07-02', endDateExclusive: '2026-07-30', reasonCodes: ['evidence-not-produced'] }],
  coverage: { availableDayCount: 1, partialDayCount: 1, unavailableDayCount: 28 },
  algorithmVersion: 'financial-analytics-input/v1',
};
const dailyInterval = {
  startDate: '2026-07-30',
  endDateExclusive: '2026-07-31',
  dateBasis: 'company-local',
  timeZone: 'Pacific/Auckland',
};
const dailyPeriod = {
  windowKind: 'daily',
  requested: dailyInterval,
  observed: dailyInterval,
  coverage: [{ coverageId: hash('7'), interval: dailyInterval, settlementState: 'settled', evidenceRefIds: [referenceId] }],
  gaps: [],
};
assert.equal(isFinancialBaselinePeriodV2(dailyPeriod), true, 'Daily is a first-class baseline window, not only an analytics label.');
const dailyCompositionIdentity = {
  ...compositionIdentity,
  coordinate: { ...coordinate, period: dailyPeriod },
  members: [{ memberScopeId: 'fixture-resource:daily', baselineId: hash('8'), status: 'included' }],
  amount: { status: 'available', amount: '-20', currencyCode: 'AUD' },
};
dailyCompositionIdentity.membershipDigest = createCurrentSpendMembershipDigestV1(dailyCompositionIdentity.members);
const dailyComposition = {
  ...dailyCompositionIdentity,
  compositionId: createCurrentSpendCompositionIdV1(dailyCompositionIdentity),
};
assert.equal(isCurrentSpendCompositionV1(dailyComposition), true, 'Daily is a first-class baseline window, not only an analytics label.');
const partialDailyInterval = {
  startDate: '2026-07-31',
  endDateExclusive: '2026-08-01',
  dateBasis: 'company-local',
  timeZone: 'Pacific/Auckland',
};
const partialDailyPeriod = {
  windowKind: 'daily',
  requested: partialDailyInterval,
  observed: partialDailyInterval,
  coverage: [{ coverageId: hash('9'), interval: partialDailyInterval, settlementState: 'mixed', evidenceRefIds: [referenceId] }],
  gaps: [],
};
const partialDailyMembers = [
  { memberScopeId: 'fixture-resource:daily-known', baselineId: hash('a'), status: 'included' },
  { memberScopeId: 'fixture-resource:daily-missing', status: 'unavailable', reasonCode: 'evidence-not-produced' },
];
const partialDailyCompositionIdentity = {
  ...compositionIdentity,
  coordinate: { ...coordinate, period: partialDailyPeriod },
  members: partialDailyMembers,
  amount: { status: 'partial', knownAmount: '12', currencyCode: 'AUD', reasonCodes: ['evidence-not-produced'] },
  membershipDigest: createCurrentSpendMembershipDigestV1(partialDailyMembers),
};
const partialDailyComposition = {
  ...partialDailyCompositionIdentity,
  compositionId: createCurrentSpendCompositionIdV1(partialDailyCompositionIdentity),
};
inputIdentity.points = [
  { date: '2026-07-30', compositionId: dailyComposition.compositionId, status: 'available', amount: '-20' },
  {
    date: '2026-07-31',
    compositionId: partialDailyComposition.compositionId,
    status: 'partial',
    knownAmount: '12',
    reasonCodes: ['evidence-not-produced'],
  },
];
const input = { ...inputIdentity, analyticsInputId: createFinancialAnalyticsInputIdV1(inputIdentity) };
assert.equal(isFinancialAnalyticsInputSeriesV1(input), true);
assert.equal(isFinancialAnalyticsInputSeriesCompatibleV1(input, [dailyComposition, partialDailyComposition]), true);
const fabricatedInputIdentity = {
  ...inputIdentity,
  points: inputIdentity.points.map(point => (point.date === '2026-07-30' ? { ...point, amount: '-21' } : point)),
};
const fabricatedInput = { ...fabricatedInputIdentity, analyticsInputId: createFinancialAnalyticsInputIdV1(fabricatedInputIdentity) };
assert.equal(
  isFinancialAnalyticsInputSeriesCompatibleV1(fabricatedInput, [dailyComposition, partialDailyComposition]),
  false,
  'Analytics point money must equal its referenced daily composition.'
);
assert.equal(
  canonicalizeFinancialAnalyticsInputIdentityV1(inputIdentity),
  canonicalizeFinancialAnalyticsInputIdentityV1({ ...inputIdentity, points: [...inputIdentity.points].reverse() }),
  'Input identity must canonicalize daily point order.'
);

const jobRequestIdentity = {
  schemaVersion: 1,
  contractVersion: FINANCIAL_ANALYTICS_JOB_REQUEST_CONTRACT_VERSION_V1,
  companyId: coordinate.companyId,
  coordinateId: createFinancialDataflowCoordinateIdV1(input.coordinate),
  analyticsInputId: input.analyticsInputId,
  inputGenerationId: input.producerGenerationId,
  inputArtifactDigest: hash('c'),
  requestedResultKinds: ['forecast'],
};
const jobRequest = {
  ...jobRequestIdentity,
  requestId: createFinancialAnalyticsJobRequestIdV1(jobRequestIdentity),
  requestedAt: '2026-08-10T00:00:00.000Z',
};
assert.equal(isFinancialAnalyticsJobRequestV1(jobRequest), true);
assert.equal(isFinancialAnalyticsJobRequestCompatibleV1(jobRequest, input, jobRequest.inputArtifactDigest), true);
assert.equal(isFinancialAnalyticsJobRequestCompatibleV1(jobRequest, input, hash('e')), false, 'Verified input bytes must match the queued digest.');
assert.equal(
  jobRequest.requestId,
  createFinancialAnalyticsJobRequestIdV1(jobRequestIdentity),
  'Retries must reuse the same request identity rather than include enqueue time.'
);

const targetCoordinate = { ...coordinate, periodRole: 'projection-target' };
const unsupportedProjectionIdentity = {
  schemaVersion: 1,
  contractVersion: FINANCIAL_ANALYTICS_PROJECTION_CONTRACT_VERSION_V1,
  coordinate: { ...targetCoordinate, scope: { ...targetCoordinate.scope, kind: 'resource-group', scopeId: 'fixture-resource-group:unsupported' } },
  outputGenerationId: 'fixture-generation:analytics-output:unsupported',
  method: 'unsupported-scope',
  algorithmVersion: 'forecast-capability/v1',
  producedAt: '2026-08-10T00:00:00.000Z',
  status: 'unavailable',
  resultKind: 'forecast',
  reasonCodes: ['unsupported-scope'],
};
let unsupportedProjection;
assert.doesNotThrow(() => {
  unsupportedProjection = {
    ...unsupportedProjectionIdentity,
    analyticsProjectionId: createFinancialAnalyticsProjectionIdV1(unsupportedProjectionIdentity),
  };
}, 'An unsupported scope must be representable without fabricating an analytics input identity.');
assert.equal(isFinancialAnalyticsProjectionV1(unsupportedProjection), true);
assert.equal(isFinancialAnalyticsProjectionCompatibleV1(unsupportedProjection), true);
const forecastIdentity = {
  schemaVersion: 1,
  contractVersion: FINANCIAL_ANALYTICS_PROJECTION_CONTRACT_VERSION_V1,
  analyticsInputId: input.analyticsInputId,
  currentSpendCompositionId: composition.compositionId,
  coordinate: targetCoordinate,
  outputGenerationId: 'fixture-generation:analytics-output:one',
  method: 'ets',
  algorithmVersion: 'forecast-ets/v1',
  producedAt: '2026-08-10T00:00:00.000Z',
  status: 'available',
  result: {
    kind: 'forecast',
    projectedTotal: { amount: '420', currencyCode: 'AUD' },
    projectedRemaining: { amount: '72', currencyCode: 'AUD' },
  },
};
const forecast = { ...forecastIdentity, analyticsProjectionId: createFinancialAnalyticsProjectionIdV1(forecastIdentity) };
assert.equal(isFinancialAnalyticsProjectionV1(forecast), true);
assert.equal(isFinancialAnalyticsProjectionCompatibleV1(forecast, input, composition), true);

const comparisonInterval = {
  startDate: '2026-07-01',
  endDateExclusive: '2026-08-01',
  dateBasis: 'company-local',
  timeZone: 'Pacific/Auckland',
};
const comparisonPeriod = {
  windowKind: 'calendar-month',
  requested: comparisonInterval,
  observed: comparisonInterval,
  coverage: [{ coverageId: hash('6'), interval: comparisonInterval, settlementState: 'settled', evidenceRefIds: [referenceId] }],
  gaps: [],
};
const comparisonCompositionIdentity = {
  ...compositionIdentity,
  coordinate: { ...coordinate, periodRole: 'comparison', period: comparisonPeriod },
  amount: { status: 'available', amount: '300', currencyCode: 'AUD' },
};
const comparisonComposition = {
  ...comparisonCompositionIdentity,
  compositionId: createCurrentSpendCompositionIdV1(comparisonCompositionIdentity),
};
const trendIdentity = {
  schemaVersion: 1,
  contractVersion: FINANCIAL_ANALYTICS_PROJECTION_CONTRACT_VERSION_V1,
  analyticsInputId: input.analyticsInputId,
  currentSpendCompositionId: composition.compositionId,
  coordinate: targetCoordinate,
  outputGenerationId: 'fixture-generation:analytics-output:trend',
  method: 'exact-comparison',
  algorithmVersion: 'trend-comparison/v1',
  producedAt: '2026-08-10T00:00:00.000Z',
  status: 'available',
  result: {
    kind: 'trend',
    comparisonCompositionId: comparisonComposition.compositionId,
    direction: 'increasing',
    change: { amount: '48', currencyCode: 'AUD' },
    percentChange: '16',
  },
};
const trend = { ...trendIdentity, analyticsProjectionId: createFinancialAnalyticsProjectionIdV1(trendIdentity) };
assert.equal(isFinancialAnalyticsProjectionCompatibleV1(trend, input, composition, comparisonComposition), true);
const incomparablePeriodCompositionIdentity = {
  ...comparisonCompositionIdentity,
  coordinate: { ...comparisonCompositionIdentity.coordinate, period: dailyPeriod },
};
const incomparablePeriodComposition = {
  ...incomparablePeriodCompositionIdentity,
  compositionId: createCurrentSpendCompositionIdV1(incomparablePeriodCompositionIdentity),
};
const incomparablePeriodTrendIdentity = {
  ...trendIdentity,
  result: { ...trendIdentity.result, comparisonCompositionId: incomparablePeriodComposition.compositionId },
};
const incomparablePeriodTrend = {
  ...incomparablePeriodTrendIdentity,
  analyticsProjectionId: createFinancialAnalyticsProjectionIdV1(incomparablePeriodTrendIdentity),
};
assert.equal(
  isFinancialAnalyticsProjectionCompatibleV1(incomparablePeriodTrend, input, composition, incomparablePeriodComposition),
  false,
  'Trend cannot compare monetary totals from different window kinds.'
);
const fabricatedTrendIdentity = {
  ...trendIdentity,
  result: { ...trendIdentity.result, change: { amount: '49', currencyCode: 'AUD' } },
};
const fabricatedTrend = {
  ...fabricatedTrendIdentity,
  analyticsProjectionId: createFinancialAnalyticsProjectionIdV1(fabricatedTrendIdentity),
};
assert.equal(
  isFinancialAnalyticsProjectionCompatibleV1(fabricatedTrend, input, composition, comparisonComposition),
  false,
  'Trend money must reconcile to current minus comparison composition.'
);

const anomalyIdentity = {
  schemaVersion: 1,
  contractVersion: FINANCIAL_ANALYTICS_PROJECTION_CONTRACT_VERSION_V1,
  analyticsInputId: input.analyticsInputId,
  coordinate: targetCoordinate,
  outputGenerationId: 'fixture-generation:analytics-output:anomaly',
  method: 'fixture-anomaly',
  algorithmVersion: 'anomaly/v1',
  producedAt: '2026-08-10T00:00:00.000Z',
  status: 'available',
  result: {
    kind: 'anomaly',
    events: [
      {
        date: '2026-07-30',
        observed: { amount: '-20', currencyCode: 'AUD' },
        expected: { amount: '-25', currencyCode: 'AUD' },
        delta: { amount: '5', currencyCode: 'AUD' },
        score: '2',
      },
    ],
  },
};
const anomaly = { ...anomalyIdentity, analyticsProjectionId: createFinancialAnalyticsProjectionIdV1(anomalyIdentity) };
assert.equal(isFinancialAnalyticsProjectionCompatibleV1(anomaly, input), true);
const fabricatedAnomalyIdentity = {
  ...anomalyIdentity,
  result: {
    ...anomalyIdentity.result,
    events: anomalyIdentity.result.events.map(event => ({
      ...event,
      observed: { amount: '-19', currencyCode: 'AUD' },
      delta: { amount: '6', currencyCode: 'AUD' },
    })),
  },
};
const fabricatedAnomaly = {
  ...fabricatedAnomalyIdentity,
  analyticsProjectionId: createFinancialAnalyticsProjectionIdV1(fabricatedAnomalyIdentity),
};
assert.equal(
  isFinancialAnalyticsProjectionCompatibleV1(fabricatedAnomaly, input),
  false,
  'Anomaly observed money must equal the bound daily analytics point.'
);

const pointerIdentity = {
  schemaVersion: 1,
  contractVersion: FINANCIAL_ANALYTICS_CURRENT_POINTER_CONTRACT_VERSION_V1,
  coordinateId: createFinancialDataflowCoordinateIdV1(targetCoordinate),
  pointerRevision: 1,
  outputGenerationId: 'fixture-generation:analytics-output:one',
  analyticsProjectionId: forecast.analyticsProjectionId,
  projectionArtifactDigest: hash('d'),
  promotedAt: '2026-08-10T00:00:30.000Z',
};
const pointer = { ...pointerIdentity, pointerDigest: createFinancialAnalyticsCurrentPointerDigestV1(pointerIdentity) };
assert.equal(isFinancialAnalyticsCurrentPointerV1(pointer), true);
assert.equal(isFinancialAnalyticsCurrentPointerCompatibleV1(pointer, forecast, pointer.projectionArtifactDigest), true);
const wrongGenerationProjectionIdentity = { ...forecastIdentity, outputGenerationId: 'fixture-generation:analytics-output:wrong' };
const wrongGenerationProjection = {
  ...wrongGenerationProjectionIdentity,
  analyticsProjectionId: createFinancialAnalyticsProjectionIdV1(wrongGenerationProjectionIdentity),
};
assert.equal(
  isFinancialAnalyticsCurrentPointerCompatibleV1(pointer, wrongGenerationProjection, pointer.projectionArtifactDigest),
  false,
  'Promotion pointer must bind the projection output generation.'
);

const definitionIdentity = {
  schemaVersion: 1,
  contractVersion: FINANCIAL_POLICY_DEFINITION_CONTRACT_VERSION_V1,
  companyId: coordinate.companyId,
  definitionId: 'fixture-policy:budget',
  revision: '7',
  effectiveState: 'enabled',
  coordinateRequest: {
    provider: 'azure',
    providerAccountRefs: [...coordinate.providerAccountRefs],
    scope: coordinate.scope,
    period: { kind: 'calendar-month', timeZone: 'Pacific/Auckland' },
    costBasis: coordinate.costBasis,
    estimateLens: coordinate.estimateLens,
    requiredAccountingCurrencyCode: 'AUD',
  },
  criteria: {
    kind: 'budget',
    budget: { amount: '400', currencyCode: 'AUD' },
    currentSpendThresholds: { amounts: ['350'], percents: ['80', '100'] },
    forecastThresholds: { amounts: ['410'], percents: ['100'] },
  },
  schedule: { cadenceMinutes: 60 },
  destinationRefIds: ['fixture-destination:email:one'],
  destinationsDigest: hash('a'),
  authoredAt: '2026-08-09T00:00:00.000Z',
  authoredByUserId: 'fixture-user:author',
};
const definition = {
  ...definitionIdentity,
  policyDefinitionRevisionId: createFinancialPolicyDefinitionRevisionIdV1(definitionIdentity),
};
assert.equal(isFinancialPolicyDefinitionRevisionV1(definition), true);

const evaluationIdentity = {
  schemaVersion: 1,
  contractVersion: FINANCIAL_POLICY_EVALUATION_CONTRACT_VERSION_V1,
  companyId: coordinate.companyId,
  policyDefinitionRevisionId: definition.policyDefinitionRevisionId,
  definitionId: definition.definitionId,
  definitionRevision: definition.revision,
  coordinateId: createFinancialDataflowCoordinateIdV1(coordinate),
  currentSpendCompositionId: composition.compositionId,
  analyticsProjectionId: forecast.analyticsProjectionId,
  signalKind: 'budget-forecast',
  evaluatedAt: '2026-08-10T00:01:00.000Z',
  policyAlgorithmVersion: 'financial-policy-evaluator/v1',
  result: 'matched',
  reasonCode: 'forecast-threshold-amount-matched',
  matchedThresholds: [
    { thresholdKind: 'amount', configuredValue: '410' },
    { thresholdKind: 'percent', configuredValue: '100' },
  ],
};
const materializePolicyEvaluation = identity => {
  const identityId = createFinancialPolicyEvaluationIdV1(identity);
  return {
    ...identity,
    evaluationId: identityId,
    readProjectionId: createFinancialPolicyEvaluationReadProjectionIdV1(identityId),
    actionAuditId: createFinancialPolicyEvaluationActionAuditIdV1(identityId),
  };
};
const evaluation = materializePolicyEvaluation(evaluationIdentity);
const evaluationId = evaluation.evaluationId;
assert.equal(isFinancialPolicyEvaluationV1(evaluation), true);
assert.equal(isFinancialPolicyEvaluationCompatibleV1(evaluation, definition, composition, forecast), true);

const wrongKindUnavailableIdentity = {
  ...forecastIdentity,
  status: 'unavailable',
  resultKind: 'anomaly',
  reasonCodes: ['analytics-input-stale'],
};
delete wrongKindUnavailableIdentity.result;
const wrongKindUnavailable = {
  ...wrongKindUnavailableIdentity,
  analyticsProjectionId: createFinancialAnalyticsProjectionIdV1(wrongKindUnavailableIdentity),
};
const wrongKindUnavailableEvaluation = materializePolicyEvaluation({
  ...evaluationIdentity,
  analyticsProjectionId: wrongKindUnavailable.analyticsProjectionId,
  result: 'unavailable',
  reasonCode: 'analytics-projection-unavailable',
  matchedThresholds: [],
});
assert.equal(
  isFinancialPolicyEvaluationCompatibleV1(wrongKindUnavailableEvaluation, definition, composition, wrongKindUnavailable),
  false,
  'A budget-forecast evaluation cannot bind an unavailable anomaly projection.'
);
const wrongKindPartialIdentity = {
  ...anomalyIdentity,
  status: 'partial',
  reasonCodes: ['coverage-incomplete'],
};
const wrongKindPartial = {
  ...wrongKindPartialIdentity,
  analyticsProjectionId: createFinancialAnalyticsProjectionIdV1(wrongKindPartialIdentity),
};
const wrongKindPartialEvaluation = materializePolicyEvaluation({
  ...evaluationIdentity,
  analyticsProjectionId: wrongKindPartial.analyticsProjectionId,
  result: 'partial',
  reasonCode: 'analytics-projection-partial',
  matchedThresholds: [],
});
assert.equal(
  isFinancialPolicyEvaluationCompatibleV1(wrongKindPartialEvaluation, definition, composition, wrongKindPartial),
  false,
  'A budget-forecast evaluation cannot bind a partial anomaly projection.'
);

const falseMatchedCurrentSpendIdentity = {
  ...evaluationIdentity,
  analyticsProjectionId: undefined,
  signalKind: 'budget-current-spend',
  result: 'matched',
  reasonCode: 'current-threshold-amount-matched',
  matchedThresholds: [{ thresholdKind: 'amount', configuredValue: '350' }],
};
delete falseMatchedCurrentSpendIdentity.analyticsProjectionId;
const falseMatchedCurrentSpendEvaluation = materializePolicyEvaluation(falseMatchedCurrentSpendIdentity);
assert.equal(
  isFinancialPolicyEvaluationCompatibleV1(falseMatchedCurrentSpendEvaluation, definition, composition),
  false,
  'A current-spend value below the configured threshold cannot be claimed as matched.'
);
const maximumScaleDecimal = `0.${'1'.repeat(126)}`;
const maximumScaleCompositionIdentity = {
  ...compositionIdentity,
  amount: { status: 'available', amount: maximumScaleDecimal, currencyCode: 'AUD' },
};
const maximumScaleComposition = {
  ...maximumScaleCompositionIdentity,
  compositionId: createCurrentSpendCompositionIdV1(maximumScaleCompositionIdentity),
};
const maximumScaleDefinitionIdentity = {
  ...definitionIdentity,
  definitionId: 'fixture-policy:maximum-scale',
  criteria: {
    kind: 'budget',
    budget: { amount: maximumScaleDecimal, currencyCode: 'AUD' },
    currentSpendThresholds: { amounts: [], percents: [maximumScaleDecimal] },
  },
};
const maximumScaleDefinition = {
  ...maximumScaleDefinitionIdentity,
  policyDefinitionRevisionId: createFinancialPolicyDefinitionRevisionIdV1(maximumScaleDefinitionIdentity),
};
const maximumScaleEvaluation = materializePolicyEvaluation({
  ...falseMatchedCurrentSpendIdentity,
  policyDefinitionRevisionId: maximumScaleDefinition.policyDefinitionRevisionId,
  definitionId: maximumScaleDefinition.definitionId,
  currentSpendCompositionId: maximumScaleComposition.compositionId,
  result: 'not-matched',
  reasonCode: 'precision-unsupported',
  matchedThresholds: [],
});
assert.doesNotThrow(() => {
  assert.equal(isFinancialPolicyEvaluationCompatibleV1(maximumScaleEvaluation, maximumScaleDefinition, maximumScaleComposition), false);
}, 'A boolean compatibility validator must fail closed rather than throw on a legal maximum-scale combination.');

const partialComposition = {
  ...partialIdentity,
  compositionId: createCurrentSpendCompositionIdV1(partialIdentity),
};
const partialCurrentSpendEvaluation = materializePolicyEvaluation({
  ...falseMatchedCurrentSpendIdentity,
  currentSpendCompositionId: partialComposition.compositionId,
  result: 'partial',
  reasonCode: 'current-spend-partial',
  matchedThresholds: [],
});
assert.equal(
  isFinancialPolicyEvaluationCompatibleV1(partialCurrentSpendEvaluation, definition, partialComposition),
  true,
  'Partial current spend must remain a partial policy result without matched thresholds.'
);

const unavailableMembers = [{ memberScopeId: 'fixture-resource:unavailable', status: 'unavailable', reasonCode: 'evidence-not-produced' }];
const unavailableCompositionIdentity = {
  ...compositionIdentity,
  members: unavailableMembers,
  amount: { status: 'unavailable', reasonCodes: ['evidence-not-produced'] },
  membershipDigest: createCurrentSpendMembershipDigestV1(unavailableMembers),
};
const unavailableComposition = {
  ...unavailableCompositionIdentity,
  compositionId: createCurrentSpendCompositionIdV1(unavailableCompositionIdentity),
};
const unavailableCurrentSpendEvaluation = materializePolicyEvaluation({
  ...falseMatchedCurrentSpendIdentity,
  currentSpendCompositionId: unavailableComposition.compositionId,
  result: 'unavailable',
  reasonCode: 'current-spend-unavailable',
  matchedThresholds: [],
});
assert.equal(
  isFinancialPolicyEvaluationCompatibleV1(unavailableCurrentSpendEvaluation, definition, unavailableComposition),
  true,
  'Unavailable current spend must remain unavailable without manufacturing zero or matched thresholds.'
);

const anomalyDefinitionIdentity = {
  ...definitionIdentity,
  definitionId: 'fixture-policy:cost-anomaly',
  criteria: { kind: 'cost-anomaly', minimumDelta: '5' },
};
const anomalyDefinition = {
  ...anomalyDefinitionIdentity,
  policyDefinitionRevisionId: createFinancialPolicyDefinitionRevisionIdV1(anomalyDefinitionIdentity),
};
const anomalyEvaluationIdentity = {
  ...evaluationIdentity,
  policyDefinitionRevisionId: anomalyDefinition.policyDefinitionRevisionId,
  definitionId: anomalyDefinition.definitionId,
  definitionRevision: anomalyDefinition.revision,
  analyticsProjectionId: anomaly.analyticsProjectionId,
  signalKind: 'cost-anomaly',
  reasonCode: 'minimum-delta-matched',
  matchedThresholds: [{ thresholdKind: 'minimum-delta', configuredValue: '5' }],
};
const anomalyEvaluation = materializePolicyEvaluation(anomalyEvaluationIdentity);
assert.equal(isFinancialPolicyEvaluationCompatibleV1(anomalyEvaluation, anomalyDefinition, composition, anomaly), true);

const belowThresholdDefinitionIdentity = {
  ...anomalyDefinitionIdentity,
  revision: '8',
  criteria: { kind: 'cost-anomaly', minimumDelta: '6' },
};
const belowThresholdDefinition = {
  ...belowThresholdDefinitionIdentity,
  policyDefinitionRevisionId: createFinancialPolicyDefinitionRevisionIdV1(belowThresholdDefinitionIdentity),
};
const falseMatchedAnomalyEvaluation = materializePolicyEvaluation({
  ...anomalyEvaluationIdentity,
  policyDefinitionRevisionId: belowThresholdDefinition.policyDefinitionRevisionId,
  definitionRevision: belowThresholdDefinition.revision,
  matchedThresholds: [{ thresholdKind: 'minimum-delta', configuredValue: '6' }],
});
assert.equal(
  isFinancialPolicyEvaluationCompatibleV1(falseMatchedAnomalyEvaluation, belowThresholdDefinition, composition, anomaly),
  false,
  'An anomaly below the configured exact threshold cannot be claimed as matched.'
);

const readProjection = {
  schemaVersion: 1,
  contractVersion: FINANCIAL_POLICY_READ_PROJECTION_CONTRACT_VERSION_V1,
  readProjectionId: evaluation.readProjectionId,
  evaluationId: evaluation.evaluationId,
  companyId: evaluation.companyId,
  definitionId: evaluation.definitionId,
  definitionRevision: evaluation.definitionRevision,
  coordinateId: evaluation.coordinateId,
  currentSpendCompositionId: evaluation.currentSpendCompositionId,
  analyticsProjectionId: evaluation.analyticsProjectionId,
  signalKind: evaluation.signalKind,
  evaluatedAt: evaluation.evaluatedAt,
  result: evaluation.result,
  reasonCode: evaluation.reasonCode,
  matchedThresholds: evaluation.matchedThresholds,
};
assert.equal(isFinancialPolicyEvaluationReadProjectionV1(readProjection), true);
assert.equal(isFinancialPolicyEvaluationReadProjectionCompatibleV1(readProjection, evaluation), true);
assert.equal(Object.prototype.hasOwnProperty.call(readProjection, 'actionAuditId'), false);

const actionAttemptIdentity = {
  schemaVersion: 1,
  contractVersion: FINANCIAL_POLICY_ACTION_ATTEMPT_CONTRACT_VERSION_V1,
  actionAuditId: evaluation.actionAuditId,
  evaluationId: evaluation.evaluationId,
  companyId: evaluation.companyId,
  destinationRefId: definition.destinationRefIds[0],
  attemptNumber: 1,
  attemptedAt: '2026-08-10T00:02:00.000Z',
  status: 'retryable-failure',
  reasonCode: 'destination-temporarily-unavailable',
  executorVersion: 'financial-policy-action/v1',
};
const actionAttempt = {
  ...actionAttemptIdentity,
  actionAttemptId: createFinancialPolicyActionAttemptIdV1(actionAttemptIdentity),
};
assert.equal(isFinancialPolicyActionAttemptV1(actionAttempt), true);
assert.equal(isFinancialPolicyActionAttemptCompatibleV1(actionAttempt, evaluation, definition), true);
const retryIdentity = { ...actionAttemptIdentity, attemptNumber: 2, attemptedAt: '2026-08-10T00:03:00.000Z' };
const retry = { ...retryIdentity, actionAttemptId: createFinancialPolicyActionAttemptIdV1(retryIdentity) };
assert.equal(isFinancialPolicyActionAttemptCompatibleV1(retry, evaluation, definition), true);
assert.notEqual(retry.actionAttemptId, actionAttempt.actionAttemptId);
assert.equal(retry.actionAuditId, actionAttempt.actionAuditId);

runFinancialDataflowContractNegativeChecks({
  composition,
  compositionIdentity,
  coordinate,
  definition,
  evaluation,
  evaluationId,
  evaluationIdentity,
  forecast,
  forecastIdentity,
  hash,
  historyPeriod,
  input,
  partialIdentity,
  period,
  targetCoordinate,
});

console.log(
  `Financial dataflow contracts valid: ${corpus.cases.length} vendored Core semantic cases adapted to Types; ${corpus.mutations.length} Core mutation vectors registered; Types exact negative compatibility checks passed.`
);
