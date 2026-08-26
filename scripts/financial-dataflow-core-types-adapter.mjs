import { createHash } from 'node:crypto';

import {
  FINANCIAL_CURRENT_SPEND_COMPOSITION_CONTRACT_VERSION_V1,
  FINANCIAL_ANALYTICS_INPUT_CONTRACT_VERSION_V1,
  FINANCIAL_ANALYTICS_PROJECTION_CONTRACT_VERSION_V1,
  FINANCIAL_POLICY_ACTION_ATTEMPT_CONTRACT_VERSION_V1,
  FINANCIAL_POLICY_DEFINITION_CONTRACT_VERSION_V1,
  FINANCIAL_POLICY_EVALUATION_CONTRACT_VERSION_V1,
  FINANCIAL_POLICY_READ_PROJECTION_CONTRACT_VERSION_V1,
  createCurrentSpendCompositionIdV1,
  createCurrentSpendMembershipDigestV1,
  createFinancialAnalyticsInputIdV1,
  createFinancialAnalyticsProjectionIdV1,
  createFinancialDataflowCoordinateIdV1,
  createFinancialPolicyActionAttemptIdV1,
  createFinancialPolicyDefinitionRevisionIdV1,
  createFinancialPolicyEvaluationActionAuditIdV1,
  createFinancialPolicyEvaluationIdV1,
  createFinancialPolicyEvaluationReadProjectionIdV1,
  isCurrentSpendCompositionV1,
  isFinancialAnalyticsInputSeriesCompatibleV1,
  isFinancialAnalyticsInputSeriesV1,
  isFinancialAnalyticsProjectionCompatibleV1,
  isFinancialAnalyticsProjectionV1,
  isFinancialPolicyActionAttemptCompatibleV1,
  isFinancialPolicyActionAttemptV1,
  isFinancialPolicyDefinitionRevisionV1,
  isFinancialPolicyEvaluationCompatibleV1,
  isFinancialPolicyEvaluationReadProjectionCompatibleV1,
  isFinancialPolicyEvaluationReadProjectionV1,
  isFinancialPolicyEvaluationV1,
  multiplyExactDecimalValues,
  parseCanonicalDecimal,
  subtractExactDecimalValues,
} from '../dist/index.js';

const hashIdentity = value => `sha256:${createHash('sha256').update(String(value)).digest('hex')}`;

const isAtLeast = (left, right) => subtractExactDecimalValues(parseCanonicalDecimal(left), parseCanonicalDecimal(right)).coefficient >= 0n;

const reachesPercent = (amount, denominator, percent) => {
  const parsedDenominator = parseCanonicalDecimal(denominator);
  if (parsedDenominator.coefficient <= 0n) return false;
  const scaledAmount = multiplyExactDecimalValues(parseCanonicalDecimal(amount), parseCanonicalDecimal('100'));
  const scaledThreshold = multiplyExactDecimalValues(parsedDenominator, parseCanonicalDecimal(percent));
  return subtractExactDecimalValues(scaledAmount, scaledThreshold).coefficient >= 0n;
};

const toInterval = period => ({
  startDate: period.startDate,
  endDateExclusive: period.endDateExclusive,
  dateBasis: period.dateBasis,
  ...(period.timeZone === undefined ? {} : { timeZone: period.timeZone }),
});

const toPeriod = (period, caseId) => {
  const interval = toInterval(period);
  return {
    windowKind: period.windowKind,
    requested: interval,
    observed: interval,
    coverage: [
      {
        coverageId: hashIdentity(`${caseId}:coverage`),
        interval,
        settlementState: 'unknown',
        evidenceRefIds: [hashIdentity(`${caseId}:evidence`)],
      },
    ],
    gaps: [],
  };
};

const toCoordinate = testCase => ({
  ...testCase.coordinate,
  providerAccountRefs: [...testCase.coordinate.providerAccountRefs].sort(),
  period: toPeriod(testCase.coordinate.period, testCase.caseId),
  ...(testCase.coordinate.accountingCurrency.status === 'resolved'
    ? { requestedCurrencyCode: testCase.coordinate.accountingCurrency.currencyCode }
    : {}),
});

const nextCalendarDate = value => new Date(Date.parse(`${value}T00:00:00.000Z`) + 86_400_000).toISOString().slice(0, 10);

const toMember = member =>
  member.status === 'included'
    ? { memberScopeId: member.memberScopeId, baselineId: hashIdentity(member.baselineId), status: 'included' }
    : { memberScopeId: member.memberScopeId, status: 'unavailable', reasonCode: member.reasonCode };

/** Adapts one contract-neutral Core case into the exact Types contract and executes its validators. */
export const validateCoreFinancialDataflowCaseAgainstTypesV1 = testCase => {
  const coordinate = toCoordinate(testCase);
  const members = testCase.composition.members.map(toMember);
  const compositionIdentity = {
    schemaVersion: 1,
    contractVersion: FINANCIAL_CURRENT_SPEND_COMPOSITION_CONTRACT_VERSION_V1,
    coordinate,
    members,
    amount: testCase.composition.amount,
    membershipDigest: createCurrentSpendMembershipDigestV1(members),
    algorithmVersion: testCase.composition.algorithmVersion,
  };
  const composition = {
    ...compositionIdentity,
    compositionId: createCurrentSpendCompositionIdV1(compositionIdentity),
  };
  if (!isCurrentSpendCompositionV1(composition)) {
    throw new TypeError(`Core case ${testCase.caseId} does not adapt to CurrentSpendCompositionV1.`);
  }
  const validatedKinds = ['current-spend-composition'];
  let comparisonComposition;
  if (testCase.comparisonComposition !== undefined) {
    const comparisonMembers = testCase.comparisonComposition.members.map(toMember);
    const comparisonIdentity = {
      schemaVersion: 1,
      contractVersion: FINANCIAL_CURRENT_SPEND_COMPOSITION_CONTRACT_VERSION_V1,
      coordinate: {
        ...coordinate,
        periodRole: 'comparison',
        period: toPeriod(testCase.comparisonComposition.period, `${testCase.caseId}:comparison`),
      },
      members: comparisonMembers,
      amount: testCase.comparisonComposition.amount,
      membershipDigest: createCurrentSpendMembershipDigestV1(comparisonMembers),
      algorithmVersion: testCase.comparisonComposition.algorithmVersion,
    };
    comparisonComposition = {
      ...comparisonIdentity,
      compositionId: createCurrentSpendCompositionIdV1(comparisonIdentity),
    };
    if (!isCurrentSpendCompositionV1(comparisonComposition)) {
      throw new TypeError(`Core case ${testCase.caseId} does not adapt its comparison to CurrentSpendCompositionV1.`);
    }
  }
  let analyticsInput;
  let dailyCompositions = [];
  if (testCase.analyticsInput !== undefined) {
    dailyCompositions = testCase.analyticsInput.points.map((point, index) => {
      const interval = {
        startDate: point.date,
        endDateExclusive: nextCalendarDate(point.date),
        dateBasis: testCase.analyticsInput.period.dateBasis,
        ...(testCase.analyticsInput.period.timeZone === undefined ? {} : { timeZone: testCase.analyticsInput.period.timeZone }),
      };
      const dailyMembers =
        point.status === 'available'
          ? [
              {
                memberScopeId: `${testCase.coordinate.scope.scopeId}:daily:${point.date}`,
                baselineId: hashIdentity(point.compositionId),
                status: 'included',
              },
            ]
          : [
              {
                memberScopeId: `${testCase.coordinate.scope.scopeId}:daily:${point.date}:known`,
                baselineId: hashIdentity(`${point.compositionId}:known`),
                status: 'included',
              },
              {
                memberScopeId: `${testCase.coordinate.scope.scopeId}:daily:${point.date}:missing`,
                status: 'unavailable',
                reasonCode: point.reasonCodes[0],
              },
            ];
      const dailyIdentity = {
        schemaVersion: 1,
        contractVersion: FINANCIAL_CURRENT_SPEND_COMPOSITION_CONTRACT_VERSION_V1,
        coordinate: {
          ...coordinate,
          periodRole: 'current-spend',
          period: {
            windowKind: 'daily',
            requested: interval,
            observed: interval,
            coverage: [
              {
                coverageId: hashIdentity(`${testCase.caseId}:daily:${point.date}:coverage`),
                interval,
                settlementState: point.status === 'available' ? 'settled' : 'mixed',
                evidenceRefIds: [hashIdentity(`${testCase.caseId}:daily:${point.date}:evidence`)],
              },
            ],
            gaps: [],
          },
        },
        members: dailyMembers,
        amount:
          point.status === 'available'
            ? { status: 'available', amount: point.amount, currencyCode: coordinate.accountingCurrency.currencyCode }
            : {
                status: 'partial',
                knownAmount: point.knownAmount,
                currencyCode: coordinate.accountingCurrency.currencyCode,
                reasonCodes: point.reasonCodes,
              },
        membershipDigest: createCurrentSpendMembershipDigestV1(dailyMembers),
        algorithmVersion: 'current-spend-composition/core-adapter-v1',
      };
      return { ...dailyIdentity, compositionId: createCurrentSpendCompositionIdV1(dailyIdentity), corePointIndex: index };
    });
    const dailyCompositionByIndex = new Map(dailyCompositions.map(item => [item.corePointIndex, item]));
    dailyCompositions = dailyCompositions.map(({ corePointIndex: _corePointIndex, ...item }) => item);
    const requested = toInterval(testCase.analyticsInput.period);
    const analyticsPeriod = {
      windowKind: testCase.analyticsInput.period.windowKind,
      requested,
      ...(testCase.analyticsInput.points.length === 0 ? {} : { observed: requested }),
      coverage: testCase.analyticsInput.points.map((point, index) => ({
        coverageId: hashIdentity(`${testCase.caseId}:analytics:${point.date}:coverage`),
        interval: {
          startDate: point.date,
          endDateExclusive: nextCalendarDate(point.date),
          dateBasis: testCase.analyticsInput.period.dateBasis,
          ...(testCase.analyticsInput.period.timeZone === undefined ? {} : { timeZone: testCase.analyticsInput.period.timeZone }),
        },
        settlementState: point.status === 'available' ? 'settled' : 'mixed',
        evidenceRefIds: [hashIdentity(`${testCase.caseId}:analytics:${point.date}:evidence`)],
      })),
      gaps: testCase.analyticsInput.gaps.map(gap => ({
        startDate: gap.startDate,
        endDateExclusive: gap.endDateExclusive,
        dateBasis: testCase.analyticsInput.period.dateBasis,
        ...(testCase.analyticsInput.period.timeZone === undefined ? {} : { timeZone: testCase.analyticsInput.period.timeZone }),
      })),
    };
    const inputIdentity = {
      schemaVersion: 1,
      contractVersion: FINANCIAL_ANALYTICS_INPUT_CONTRACT_VERSION_V1,
      coordinate: { ...coordinate, periodRole: 'analytics-input', period: analyticsPeriod },
      granularity: 'daily',
      producerGenerationId: testCase.analyticsInput.producerGenerationId,
      points: testCase.analyticsInput.points.map((point, index) => ({
        ...point,
        compositionId: dailyCompositionByIndex.get(index).compositionId,
      })),
      gaps: testCase.analyticsInput.gaps,
      coverage: testCase.analyticsInput.coverage,
      algorithmVersion: 'financial-analytics-input/core-adapter-v1',
    };
    analyticsInput = { ...inputIdentity, analyticsInputId: createFinancialAnalyticsInputIdV1(inputIdentity) };
    if (!isFinancialAnalyticsInputSeriesV1(analyticsInput) || !isFinancialAnalyticsInputSeriesCompatibleV1(analyticsInput, dailyCompositions)) {
      throw new TypeError(`Core case ${testCase.caseId} does not adapt to FinancialAnalyticsInputSeriesV1.`);
    }
    validatedKinds.push('analytics-input');
  }
  let analyticsProjection;
  if (testCase.projection !== undefined) {
    const projectionIdentity = {
      schemaVersion: 1,
      contractVersion: FINANCIAL_ANALYTICS_PROJECTION_CONTRACT_VERSION_V1,
      ...(analyticsInput === undefined ? {} : { analyticsInputId: analyticsInput.analyticsInputId }),
      ...(testCase.projection.currentSpendCompositionId === undefined ? {} : { currentSpendCompositionId: composition.compositionId }),
      coordinate: { ...coordinate, periodRole: 'projection-target' },
      outputGenerationId: testCase.projection.outputGenerationId,
      method: `core-${testCase.projection.resultKind}`,
      algorithmVersion: testCase.projection.algorithmVersion,
      producedAt: testCase.projection.producedAt,
      status: testCase.projection.status,
      ...(testCase.projection.status === 'unavailable'
        ? { resultKind: testCase.projection.resultKind, reasonCodes: testCase.projection.reasonCodes }
        : {
            ...(testCase.projection.status === 'partial' ? { reasonCodes: testCase.projection.reasonCodes } : {}),
            result: {
              kind: 'forecast',
              projectedTotal: testCase.projection.projectedTotal,
              projectedRemaining: testCase.projection.projectedRemaining,
            },
          }),
    };
    analyticsProjection = {
      ...projectionIdentity,
      analyticsProjectionId: createFinancialAnalyticsProjectionIdV1(projectionIdentity),
    };
    const compatible =
      analyticsInput === undefined
        ? isFinancialAnalyticsProjectionCompatibleV1(analyticsProjection, undefined, composition)
        : isFinancialAnalyticsProjectionCompatibleV1(analyticsProjection, analyticsInput, composition);
    if (!isFinancialAnalyticsProjectionV1(analyticsProjection) || !compatible) {
      throw new TypeError(`Core case ${testCase.caseId} does not adapt to FinancialAnalyticsProjectionV1.`);
    }
    validatedKinds.push('analytics-projection');
  }
  const analyticsResults = [];
  if (testCase.analyticsResults !== undefined) {
    if (analyticsInput === undefined) {
      throw new TypeError(`Core case ${testCase.caseId} has analytics results without an analytics input.`);
    }
    for (const coreResult of testCase.analyticsResults) {
      const projectionIdentity = {
        schemaVersion: 1,
        contractVersion: FINANCIAL_ANALYTICS_PROJECTION_CONTRACT_VERSION_V1,
        analyticsInputId: analyticsInput.analyticsInputId,
        ...(coreResult.resultKind === 'trend' ? { currentSpendCompositionId: composition.compositionId } : {}),
        coordinate: { ...coordinate, periodRole: 'projection-target' },
        outputGenerationId: coreResult.outputGenerationId,
        method: coreResult.method,
        algorithmVersion: coreResult.algorithmVersion,
        producedAt: coreResult.producedAt,
        status: 'available',
        result:
          coreResult.resultKind === 'trend'
            ? {
                kind: 'trend',
                comparisonCompositionId: comparisonComposition?.compositionId,
                direction: coreResult.direction,
                change: coreResult.change,
                ...(coreResult.percentChange === undefined ? {} : { percentChange: coreResult.percentChange }),
              }
            : { kind: 'anomaly', events: coreResult.events },
      };
      const projection = {
        ...projectionIdentity,
        analyticsProjectionId: createFinancialAnalyticsProjectionIdV1(projectionIdentity),
      };
      const compatible = isFinancialAnalyticsProjectionCompatibleV1(
        projection,
        analyticsInput,
        coreResult.resultKind === 'trend' ? composition : undefined,
        coreResult.resultKind === 'trend' ? comparisonComposition : undefined
      );
      if (!isFinancialAnalyticsProjectionV1(projection) || !compatible) {
        throw new TypeError(`Core case ${testCase.caseId} ${coreResult.resultKind} result does not adapt to FinancialAnalyticsProjectionV1.`);
      }
      analyticsResults.push(projection);
    }
    validatedKinds.push('analytics-results');
  }
  let policyDefinition;
  if (testCase.policyDefinition !== undefined) {
    const coreDefinition = testCase.policyDefinition;
    const definitionIdentity = {
      schemaVersion: 1,
      contractVersion: FINANCIAL_POLICY_DEFINITION_CONTRACT_VERSION_V1,
      companyId: coordinate.companyId,
      definitionId: coreDefinition.definitionId,
      revision: coreDefinition.revision,
      effectiveState: coreDefinition.effectiveState,
      coordinateRequest: {
        provider: coordinate.provider,
        providerAccountRefs: [...coordinate.providerAccountRefs],
        scope: coordinate.scope,
        period: { kind: coordinate.period.windowKind, timeZone: coordinate.period.requested.timeZone ?? 'UTC' },
        costBasis: coordinate.costBasis,
        estimateLens: coordinate.estimateLens,
        requiredAccountingCurrencyCode: coordinate.accountingCurrency.currencyCode,
      },
      criteria:
        coreDefinition.policyKind === 'budget'
          ? {
              kind: 'budget',
              budget: coreDefinition.budget,
              ...(coreDefinition.currentSpendThresholds === undefined ? {} : { currentSpendThresholds: coreDefinition.currentSpendThresholds }),
              ...(coreDefinition.forecastThresholds === undefined ? {} : { forecastThresholds: coreDefinition.forecastThresholds }),
            }
          : {
              kind: 'cost-anomaly',
              ...(coreDefinition.minimumAmount === undefined ? {} : { minimumAmount: coreDefinition.minimumAmount }),
              ...(coreDefinition.minimumDelta === undefined ? {} : { minimumDelta: coreDefinition.minimumDelta }),
              ...(coreDefinition.minimumPercentChange === undefined ? {} : { minimumPercentChange: coreDefinition.minimumPercentChange }),
            },
      schedule: { cadenceMinutes: 60 },
      destinationRefIds: [...coreDefinition.destinationRefIds].sort(),
      destinationsDigest: coreDefinition.destinationsDigest,
      authoredAt: coreDefinition.authoredAt,
      authoredByUserId: coreDefinition.authoredByUserId,
    };
    policyDefinition = {
      ...definitionIdentity,
      policyDefinitionRevisionId: createFinancialPolicyDefinitionRevisionIdV1(definitionIdentity),
    };
    if (!isFinancialPolicyDefinitionRevisionV1(policyDefinition)) {
      throw new TypeError(`Core case ${testCase.caseId} does not adapt to FinancialPolicyDefinitionRevisionV1.`);
    }
    validatedKinds.push('policy-definition');
  }
  let policyEvaluation;
  let policyReadProjection;
  let policyActionAttempts = [];
  if (testCase.evaluation !== undefined) {
    if (policyDefinition === undefined) throw new TypeError(`Core case ${testCase.caseId} has an evaluation without a definition.`);
    const coreEvaluation = testCase.evaluation;
    let matchedThresholds = [];
    if (coreEvaluation.result === 'matched' && policyDefinition.criteria.kind === 'budget') {
      const thresholds =
        coreEvaluation.signalKind === 'budget-current-spend'
          ? policyDefinition.criteria.currentSpendThresholds
          : policyDefinition.criteria.forecastThresholds;
      const signalAmount =
        coreEvaluation.signalKind === 'budget-current-spend' ? composition.amount.amount : analyticsProjection?.result?.projectedTotal?.amount;
      if (thresholds === undefined || signalAmount === undefined) {
        throw new TypeError(`Core case ${testCase.caseId} cannot derive matched budget thresholds.`);
      }
      matchedThresholds = [
        ...thresholds.amounts
          .filter(threshold => isAtLeast(signalAmount, threshold))
          .map(configuredValue => ({ thresholdKind: 'amount', configuredValue })),
        ...thresholds.percents
          .filter(threshold => reachesPercent(signalAmount, policyDefinition.criteria.budget.amount, threshold))
          .map(configuredValue => ({ thresholdKind: 'percent', configuredValue })),
      ];
    }
    const evaluationIdentity = {
      schemaVersion: 1,
      contractVersion: FINANCIAL_POLICY_EVALUATION_CONTRACT_VERSION_V1,
      companyId: coordinate.companyId,
      policyDefinitionRevisionId: policyDefinition.policyDefinitionRevisionId,
      definitionId: coreEvaluation.definitionId,
      definitionRevision: coreEvaluation.definitionRevision,
      coordinateId: createFinancialDataflowCoordinateIdV1(coordinate),
      currentSpendCompositionId: composition.compositionId,
      ...(coreEvaluation.signalKind === 'budget-current-spend' ? {} : { analyticsProjectionId: analyticsProjection?.analyticsProjectionId }),
      signalKind: coreEvaluation.signalKind,
      evaluatedAt: coreEvaluation.evaluatedAt,
      policyAlgorithmVersion: coreEvaluation.policyAlgorithmVersion,
      result: coreEvaluation.result,
      reasonCode: coreEvaluation.reasonCode,
      matchedThresholds,
    };
    const evaluationId = createFinancialPolicyEvaluationIdV1(evaluationIdentity);
    policyEvaluation = {
      ...evaluationIdentity,
      evaluationId,
      readProjectionId: createFinancialPolicyEvaluationReadProjectionIdV1(evaluationId),
      actionAuditId: createFinancialPolicyEvaluationActionAuditIdV1(evaluationId),
    };
    const structurallyValidEvaluation = isFinancialPolicyEvaluationV1(policyEvaluation);
    const compatibleEvaluation = isFinancialPolicyEvaluationCompatibleV1(policyEvaluation, policyDefinition, composition, analyticsProjection);
    if (!structurallyValidEvaluation || !compatibleEvaluation) {
      throw new TypeError(
        `Core case ${testCase.caseId} does not adapt to FinancialPolicyEvaluationV1 (structural=${structurallyValidEvaluation}, compatible=${compatibleEvaluation}).`
      );
    }
    policyReadProjection = {
      schemaVersion: 1,
      contractVersion: FINANCIAL_POLICY_READ_PROJECTION_CONTRACT_VERSION_V1,
      readProjectionId: policyEvaluation.readProjectionId,
      evaluationId: policyEvaluation.evaluationId,
      companyId: policyEvaluation.companyId,
      definitionId: policyEvaluation.definitionId,
      definitionRevision: policyEvaluation.definitionRevision,
      coordinateId: policyEvaluation.coordinateId,
      currentSpendCompositionId: policyEvaluation.currentSpendCompositionId,
      ...(policyEvaluation.analyticsProjectionId === undefined ? {} : { analyticsProjectionId: policyEvaluation.analyticsProjectionId }),
      signalKind: policyEvaluation.signalKind,
      evaluatedAt: policyEvaluation.evaluatedAt,
      result: policyEvaluation.result,
      reasonCode: policyEvaluation.reasonCode,
      matchedThresholds: policyEvaluation.matchedThresholds,
    };
    if (
      !isFinancialPolicyEvaluationReadProjectionV1(policyReadProjection) ||
      !isFinancialPolicyEvaluationReadProjectionCompatibleV1(policyReadProjection, policyEvaluation)
    ) {
      throw new TypeError(`Core case ${testCase.caseId} does not adapt to FinancialPolicyEvaluationReadProjectionV1.`);
    }
    validatedKinds.push('policy-evaluation');
    const coreAttempts = coreEvaluation.actionAttempts ?? [];
    policyActionAttempts = coreAttempts.map(attempt => {
      const attemptIdentity = {
        schemaVersion: 1,
        contractVersion: FINANCIAL_POLICY_ACTION_ATTEMPT_CONTRACT_VERSION_V1,
        actionAuditId: policyEvaluation.actionAuditId,
        evaluationId: policyEvaluation.evaluationId,
        companyId: policyEvaluation.companyId,
        destinationRefId: policyDefinition.destinationRefIds[0],
        attemptNumber: attempt.attempt,
        attemptedAt: new Date(Date.parse(policyEvaluation.evaluatedAt) + attempt.attempt * 1000).toISOString(),
        status: attempt.status,
        reasonCode: attempt.status === 'succeeded' ? 'delivered' : 'destination-temporarily-unavailable',
        executorVersion: 'financial-policy-action/core-adapter-v1',
      };
      return { ...attemptIdentity, actionAttemptId: createFinancialPolicyActionAttemptIdV1(attemptIdentity) };
    });
    if (
      !policyActionAttempts.every(
        attempt =>
          isFinancialPolicyActionAttemptV1(attempt) && isFinancialPolicyActionAttemptCompatibleV1(attempt, policyEvaluation, policyDefinition)
      )
    ) {
      throw new TypeError(`Core case ${testCase.caseId} does not adapt to FinancialPolicyActionAttemptV1.`);
    }
    if (coreAttempts.length > 0) validatedKinds.push('policy-action-attempts');
  }
  return {
    caseId: testCase.caseId,
    validatedKinds,
    coordinate,
    composition,
    comparisonComposition,
    analyticsInput,
    analyticsProjection,
    analyticsResults,
    policyDefinition,
    policyEvaluation,
    policyReadProjection,
    policyActionAttempts,
    dailyCompositions,
  };
};
