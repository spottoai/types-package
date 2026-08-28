import assert from 'node:assert/strict';

import {
  createCurrentSpendCompositionIdV1,
  createCurrentSpendMembershipDigestV1,
  createFinancialAnalyticsProjectionIdV1,
  createFinancialPolicyEvaluationActionAuditIdV1,
  createFinancialPolicyEvaluationIdV1,
  createFinancialPolicyEvaluationReadProjectionIdV1,
  isCurrentSpendCompositionV1,
  isFinancialAnalyticsInputSeriesV1,
  isFinancialAnalyticsProjectionCompatibleV1,
  isFinancialAnalyticsProjectionV1,
  isFinancialPolicyDefinitionRevisionV1,
  isFinancialPolicyEvaluationCompatibleV1,
  isFinancialPolicyEvaluationV1,
  parseFinancialDataflowJsonV1,
} from '../dist/index.js';

export const runFinancialDataflowContractNegativeChecks = context => {
  const {
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
    input,
    partialIdentity,
    targetCoordinate,
  } = context;
  const rejects = (validator, value, message) => assert.equal(validator(value), false, message);

  rejects(isCurrentSpendCompositionV1, { ...composition, compositionId: hash('f') }, 'Forged composition ID must fail.');
  rejects(isCurrentSpendCompositionV1, { ...composition, extra: true }, 'Undeclared composition fields must fail.');
  rejects(isCurrentSpendCompositionV1, { ...composition, members: [...composition.members, composition.members[0]] }, 'Duplicate members must fail.');
  rejects(
    isCurrentSpendCompositionV1,
    { ...composition, coordinate: { ...coordinate, accountingCurrency: { status: 'resolved', currencyCode: 'aud' } } },
    'Invalid currency must fail.'
  );
  rejects(isCurrentSpendCompositionV1, Object.assign(Object.create({ polluted: true }), composition), 'Non-plain prototypes must fail.');
  rejects(
    isCurrentSpendCompositionV1,
    { ...composition, members: [{ ...composition.members[0], memberScopeId: 'x'.repeat(2049) }] },
    'Oversized identifiers must fail.'
  );
  rejects(
    isCurrentSpendCompositionV1,
    { ...composition, members: Array.from({ length: 20_001 }, (_, index) => ({ ...composition.members[0], memberScopeId: `resource-${index}` })) },
    'Oversized member collections must fail before digest work.'
  );
  rejects(isCurrentSpendCompositionV1, { ...composition, membershipDigest: hash('e') }, 'Membership digest drift must fail.');

  const unavailableOnlyMembers = [{ memberScopeId: 'fixture-resource:missing', status: 'unavailable', reasonCode: 'evidence-not-produced' }];
  const partialWithoutKnownMember = {
    ...partialIdentity,
    members: unavailableOnlyMembers,
    membershipDigest: createCurrentSpendMembershipDigestV1(unavailableOnlyMembers),
  };
  assert.throws(
    () => createCurrentSpendCompositionIdV1(partialWithoutKnownMember),
    /invalid/i,
    'Partial money requires at least one included authority member.'
  );
  rejects(
    isCurrentSpendCompositionV1,
    { ...composition, coordinate: { ...coordinate, requestedCurrencyCode: 'USD' } },
    'Resolved currency must match the requested currency.'
  );
  rejects(
    isFinancialAnalyticsInputSeriesV1,
    {
      ...input,
      coordinate: {
        ...input.coordinate,
        period: {
          ...input.coordinate.period,
          requested: { ...input.coordinate.period.requested, startDate: '2026-02-30' },
        },
      },
    },
    'Invalid dates must fail.'
  );
  rejects(
    isFinancialAnalyticsInputSeriesV1,
    {
      ...input,
      gaps: [{ ...input.gaps[0], endDateExclusive: '2026-07-31' }],
      coverage: { availableDayCount: 1, partialDayCount: 1, unavailableDayCount: 29 },
    },
    'Daily points and gaps must not overlap.'
  );
  rejects(
    isFinancialAnalyticsProjectionV1,
    { ...forecast, result: { ...forecast.result, projectedTotal: { amount: 420, currencyCode: 'AUD' } } },
    'Unsafe numeric money must fail.'
  );
  const invalidAnomalyIdentity = {
    ...forecastIdentity,
    result: {
      kind: 'anomaly',
      events: [
        {
          date: '2026-08-10',
          observed: { amount: '30', currencyCode: 'AUD' },
          expected: { amount: '10', currencyCode: 'AUD' },
          delta: { amount: '19', currencyCode: 'AUD' },
          score: '0.95',
        },
      ],
    },
  };
  assert.throws(
    () => createFinancialAnalyticsProjectionIdV1(invalidAnomalyIdentity),
    /invalid/i,
    'Anomaly delta must exactly reconcile observed minus expected.'
  );
  assert.equal(
    isFinancialAnalyticsProjectionCompatibleV1(
      forecast,
      { ...input, coordinate: { ...input.coordinate, scope: { ...input.coordinate.scope, scopeFingerprint: hash('b') } } },
      composition
    ),
    false,
    'Scope relabelling must fail compatibility.'
  );
  assert.equal(
    isFinancialPolicyEvaluationCompatibleV1(evaluation, { ...definition, revision: '8' }, composition, forecast),
    false,
    'Definition revision drift must fail compatibility.'
  );

  const previousPeriod = {
    ...targetCoordinate.period,
    requested: { ...targetCoordinate.period.requested, startDate: '2026-07-01', endDateExclusive: '2026-08-01' },
  };
  const staleIdentity = { ...forecastIdentity, coordinate: { ...targetCoordinate, period: previousPeriod } };
  const staleProjection = { ...staleIdentity, analyticsProjectionId: createFinancialAnalyticsProjectionIdV1(staleIdentity) };
  assert.equal(
    isFinancialPolicyEvaluationCompatibleV1(evaluation, definition, composition, staleProjection),
    false,
    'Policy analytics must match the exact current-period coordinate.'
  );

  const { chargeSelection: _availableChargeSelection, ...unavailableCompositionCommon } = compositionIdentity;
  const unavailableCompositionIdentity = {
    ...unavailableCompositionCommon,
    members: unavailableOnlyMembers,
    membershipDigest: createCurrentSpendMembershipDigestV1(unavailableOnlyMembers),
    amount: { status: 'unavailable', reasonCodes: ['evidence-not-produced'] },
  };
  const unavailableComposition = {
    ...unavailableCompositionIdentity,
    compositionId: createCurrentSpendCompositionIdV1(unavailableCompositionIdentity),
  };
  const unavailableCurrentEvaluationIdentity = {
    ...evaluationIdentity,
    currentSpendCompositionId: unavailableComposition.compositionId,
    signalKind: 'budget-current-spend',
    reasonCode: 'current-threshold-amount-matched',
    matchedThresholds: [{ thresholdKind: 'amount', configuredValue: '350' }],
  };
  delete unavailableCurrentEvaluationIdentity.analyticsProjectionId;
  const unavailableCurrentEvaluationId = createFinancialPolicyEvaluationIdV1(unavailableCurrentEvaluationIdentity);
  const unavailableCurrentEvaluation = {
    ...unavailableCurrentEvaluationIdentity,
    evaluationId: unavailableCurrentEvaluationId,
    readProjectionId: createFinancialPolicyEvaluationReadProjectionIdV1(unavailableCurrentEvaluationId),
    actionAuditId: createFinancialPolicyEvaluationActionAuditIdV1(unavailableCurrentEvaluationId),
  };
  assert.equal(
    isFinancialPolicyEvaluationCompatibleV1(unavailableCurrentEvaluation, definition, unavailableComposition),
    false,
    'Unavailable current spend cannot produce a matched evaluation.'
  );
  rejects(
    isFinancialPolicyDefinitionRevisionV1,
    { ...definition, criteria: { ...definition.criteria, budget: { amount: '-1', currencyCode: 'AUD' } } },
    'Budget amounts must be non-negative.'
  );
  assert.equal(
    isFinancialPolicyEvaluationV1({ ...evaluation, readProjectionId: `${evaluationId}:wrong` }),
    false,
    'Read/action identity drift must fail.'
  );

  assert.throws(() => parseFinancialDataflowJsonV1('{"schemaVersion":1,"schemaVersion":2}'), /duplicate/i);
  assert.throws(() => parseFinancialDataflowJsonV1('['.repeat(66) + ']'.repeat(66)), /depth/i);
  assert.throws(() => parseFinancialDataflowJsonV1('{"value":1e400}'), /non-finite/i);
};
