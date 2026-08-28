import {
  formatExactDecimalValue,
  multiplyExactDecimalValues,
  parseCanonicalDecimal,
  subtractExactDecimalValues,
} from '../common/exactDecimal';
import type { CurrentSpendCompositionV1 } from './financialDataflow';
import { createFinancialDataflowCoordinateIdV1 } from './financialDataflowValidation';
import type { FinancialAnalyticsProjectionV1 } from './financialAnalytics';
import {
  FINANCIAL_POLICY_EVALUATION_CONTRACT_VERSION_V1,
  type FinancialPolicyDefinitionRevisionV1,
  type FinancialPolicyEvaluationIdentityPreimageV1,
  type FinancialPolicyEvaluationV1,
  type FinancialPolicyMatchedThresholdV1,
} from './financialPolicy';
import {
  createFinancialPolicyEvaluationActionAuditIdV1,
  createFinancialPolicyEvaluationIdV1,
  createFinancialPolicyEvaluationReadProjectionIdV1,
  isFinancialPolicyEvaluationCompatibleV1,
} from './financialPolicyValidation';

export const FINANCIAL_POLICY_ALGORITHM_VERSION_V1 = 'financial-policy/shared-v1' as const;

export type FinancialBudgetPositionStatusV1 = 'on-track' | 'at-risk' | 'over-budget' | 'unbudgeted' | 'unavailable';

export type FinancialBudgetPositionV1 =
  | { status: 'unbudgeted' | 'unavailable' }
  | {
      status: 'on-track' | 'at-risk' | 'over-budget';
      varianceAmount: string;
      amount: string;
      budgetAmount: string;
      atRiskPercent: string;
    };

export interface FinancialPolicyKernelRequestV1 {
  definition: FinancialPolicyDefinitionRevisionV1;
  currentSpend: CurrentSpendCompositionV1;
  analytics?: Partial<Record<'forecast' | 'anomaly', FinancialAnalyticsProjectionV1>>;
  evaluatedAt: string;
}

const compare = (left: string, right: string): number => {
  const difference = subtractExactDecimalValues(parseCanonicalDecimal(left), parseCanonicalDecimal(right)).coefficient;
  return difference < 0n ? -1 : difference > 0n ? 1 : 0;
};

const percentageMatched = (amount: string, denominator: string, threshold: string): boolean => {
  const parsedDenominator = parseCanonicalDecimal(denominator);
  if (parsedDenominator.coefficient <= 0n) return false;
  const left = multiplyExactDecimalValues(parseCanonicalDecimal(amount), parseCanonicalDecimal('100'));
  const right = multiplyExactDecimalValues(parsedDenominator, parseCanonicalDecimal(threshold));
  return subtractExactDecimalValues(left, right).coefficient >= 0n;
};

/**
 * Shared exact-decimal display classification for Budget surfaces. This is a
 * read-model policy only; alert matching continues to use the thresholds in a
 * versioned Financial Policy Definition.
 */
export const classifyFinancialBudgetPositionV1 = (request: {
  amount?: string;
  budgetAmount?: string;
  atRiskPercent?: string;
}): FinancialBudgetPositionV1 => {
  if (request.budgetAmount === undefined) return { status: 'unbudgeted' };
  if (request.amount === undefined) return { status: 'unavailable' };
  try {
    const atRiskPercent = request.atRiskPercent ?? '95';
    const amount = parseCanonicalDecimal(request.amount);
    const budget = parseCanonicalDecimal(request.budgetAmount);
    const risk = parseCanonicalDecimal(atRiskPercent);
    if (budget.coefficient <= 0n || risk.coefficient < 0n || compare(atRiskPercent, '100') > 0) {
      return { status: 'unbudgeted' };
    }
    const varianceAmount = formatExactDecimalValue(subtractExactDecimalValues(amount, budget));
    const status: Extract<FinancialBudgetPositionStatusV1, 'on-track' | 'at-risk' | 'over-budget'> =
      compare(request.amount, request.budgetAmount) > 0
        ? 'over-budget'
        : percentageMatched(request.amount, request.budgetAmount, atRiskPercent)
          ? 'at-risk'
          : 'on-track';
    return {
      status,
      varianceAmount,
      amount: request.amount,
      budgetAmount: request.budgetAmount,
      atRiskPercent,
    };
  } catch {
    return { status: 'unavailable' };
  }
};

const isExpectedCalendarMonthTargetPartial = (composition: CurrentSpendCompositionV1): boolean =>
  composition.coordinate.period.windowKind === 'calendar-month' &&
  composition.amount.status === 'partial' &&
  composition.amount.reasonCodes.length === 1 &&
  composition.amount.reasonCodes[0] === 'coverage-incomplete';

/**
 * Returns the exact current amount that Budget semantics may compare. An open
 * calendar month is intentionally partial until the period closes; every
 * other partial/unavailable state remains non-comparable.
 */
export const selectFinancialBudgetComparableCurrentAmountV1 = (
  composition: CurrentSpendCompositionV1
): string | undefined =>
  composition.amount.status === 'available'
    ? composition.amount.amount
    : isExpectedCalendarMonthTargetPartial(composition)
      ? composition.amount.knownAmount
      : undefined;

const budgetThresholds = (
  amount: string,
  budget: string,
  thresholds: { amounts: string[]; percents: string[] }
): FinancialPolicyMatchedThresholdV1[] => [
  ...thresholds.amounts
    .filter(threshold => compare(amount, threshold) >= 0)
    .map(configuredValue => ({ thresholdKind: 'amount' as const, configuredValue })),
  ...thresholds.percents
    .filter(threshold => percentageMatched(amount, budget, threshold))
    .map(configuredValue => ({ thresholdKind: 'percent' as const, configuredValue })),
];

const anomalyThresholds = (
  definition: FinancialPolicyDefinitionRevisionV1,
  projection: FinancialAnalyticsProjectionV1
): FinancialPolicyMatchedThresholdV1[] => {
  if (definition.criteria.kind !== 'cost-anomaly' || projection.status === 'unavailable' || projection.result.kind !== 'anomaly') return [];
  const configured: FinancialPolicyMatchedThresholdV1[] = [
    ...(definition.criteria.minimumAmount === undefined
      ? []
      : [{ thresholdKind: 'minimum-amount' as const, configuredValue: definition.criteria.minimumAmount }]),
    ...(definition.criteria.minimumDelta === undefined
      ? []
      : [{ thresholdKind: 'minimum-delta' as const, configuredValue: definition.criteria.minimumDelta }]),
    ...(definition.criteria.minimumPercentChange === undefined
      ? []
      : [{ thresholdKind: 'minimum-percent-change' as const, configuredValue: definition.criteria.minimumPercentChange }]),
  ];
  return projection.result.events.some(event =>
    configured.every(threshold => {
      if (threshold.thresholdKind === 'minimum-amount') return compare(event.observed.amount, threshold.configuredValue) >= 0;
      if (threshold.thresholdKind === 'minimum-delta') return compare(event.delta.amount, threshold.configuredValue) >= 0;
      return percentageMatched(event.delta.amount, event.expected.amount, threshold.configuredValue);
    })
  )
    ? configured
    : [];
};

const materialize = (
  identity: FinancialPolicyEvaluationIdentityPreimageV1,
  definition: FinancialPolicyDefinitionRevisionV1,
  currentSpend: CurrentSpendCompositionV1,
  analytics?: FinancialAnalyticsProjectionV1
): FinancialPolicyEvaluationV1 => {
  const evaluationId = createFinancialPolicyEvaluationIdV1(identity);
  const evaluation = {
    ...identity,
    evaluationId,
    readProjectionId: createFinancialPolicyEvaluationReadProjectionIdV1(evaluationId),
    actionAuditId: createFinancialPolicyEvaluationActionAuditIdV1(evaluationId),
  } as FinancialPolicyEvaluationV1;
  if (!isFinancialPolicyEvaluationCompatibleV1(evaluation, definition, currentSpend, analytics)) {
    throw new TypeError('Financial policy evaluation does not bind its definition and exact financial inputs.');
  }
  return evaluation;
};

export const evaluateFinancialPolicyV1 = (request: FinancialPolicyKernelRequestV1): FinancialPolicyEvaluationV1[] => {
  if (request.definition.effectiveState !== 'enabled') return [];
  const common = {
    schemaVersion: 1 as const,
    contractVersion: FINANCIAL_POLICY_EVALUATION_CONTRACT_VERSION_V1,
    companyId: request.definition.companyId,
    policyDefinitionRevisionId: request.definition.policyDefinitionRevisionId,
    definitionId: request.definition.definitionId,
    definitionRevision: request.definition.revision,
    coordinateId: createFinancialDataflowCoordinateIdV1(request.currentSpend.coordinate),
    currentSpendCompositionId: request.currentSpend.compositionId,
    evaluatedAt: request.evaluatedAt,
    policyAlgorithmVersion: FINANCIAL_POLICY_ALGORITHM_VERSION_V1,
  };
  if (request.definition.criteria.kind === 'budget') {
    const evaluations: FinancialPolicyEvaluationV1[] = [];
    const currentThresholds = request.definition.criteria.currentSpendThresholds;
    if (currentThresholds) {
      const expectedOpenCalendarMonth = isExpectedCalendarMonthTargetPartial(request.currentSpend);
      const comparableCurrentAmount = selectFinancialBudgetComparableCurrentAmountV1(request.currentSpend);
      const matched = comparableCurrentAmount === undefined
        ? []
        : budgetThresholds(comparableCurrentAmount, request.definition.criteria.budget.amount, currentThresholds);
      const unavailable = request.currentSpend.amount.status === 'unavailable';
      const partial = request.currentSpend.amount.status === 'partial' && !expectedOpenCalendarMonth;
      evaluations.push(
        materialize(
          {
            ...common,
            signalKind: 'budget-current-spend',
            result: unavailable ? 'unavailable' : partial ? 'partial' : matched.length > 0 ? 'matched' : 'not-matched',
            reasonCode: unavailable
              ? 'current-spend-unavailable'
              : partial
                ? 'current-spend-partial'
                : expectedOpenCalendarMonth && matched.length > 0
                  ? 'current-spend-threshold-matched-open-period'
                  : expectedOpenCalendarMonth
                    ? 'current-spend-threshold-not-matched-open-period'
                : matched.length > 0
                  ? 'current-spend-threshold-matched'
                  : 'current-spend-threshold-not-matched',
            matchedThresholds: matched,
          },
          request.definition,
          request.currentSpend
        )
      );
    }
    const forecastThresholds = request.definition.criteria.forecastThresholds;
    if (forecastThresholds) {
      const projection = request.analytics?.forecast;
      if (!projection) {
        evaluations.push(
          materialize(
            {
              ...common,
              signalKind: 'budget-forecast',
              result: 'unavailable',
              reasonCode: 'analytics-projection-unavailable',
              matchedThresholds: [],
            },
            request.definition,
            request.currentSpend
          )
        );
      } else {
        const unavailable = projection.status === 'unavailable' || request.currentSpend.amount.status === 'unavailable';
        const partial =
          projection.status === 'partial' ||
          (request.currentSpend.amount.status === 'partial' && !isExpectedCalendarMonthTargetPartial(request.currentSpend));
        const matched =
          !unavailable && !partial && projection.result.kind === 'forecast'
            ? budgetThresholds(projection.result.projectedTotal.amount, request.definition.criteria.budget.amount, forecastThresholds)
            : [];
        evaluations.push(
          materialize(
            {
              ...common,
              analyticsProjectionId: projection.analyticsProjectionId,
              signalKind: 'budget-forecast',
              result: unavailable ? 'unavailable' : partial ? 'partial' : matched.length > 0 ? 'matched' : 'not-matched',
              reasonCode: unavailable
                ? 'forecast-unavailable'
                : partial
                  ? 'forecast-partial'
                  : matched.length > 0
                    ? 'forecast-threshold-matched'
                    : 'forecast-threshold-not-matched',
              matchedThresholds: matched,
            },
            request.definition,
            request.currentSpend,
            projection
          )
        );
      }
    }
    return evaluations;
  }
  const projection = request.analytics?.anomaly;
  if (!projection) {
    return [
      materialize(
        {
          ...common,
          signalKind: 'cost-anomaly',
          result: 'unavailable',
          reasonCode: 'analytics-projection-unavailable',
          matchedThresholds: [],
        },
        request.definition,
        request.currentSpend
      ),
    ];
  }
  const unavailable = projection.status === 'unavailable' || request.currentSpend.amount.status === 'unavailable';
  const partial = projection.status === 'partial' || request.currentSpend.amount.status === 'partial';
  const matched = unavailable || partial ? [] : anomalyThresholds(request.definition, projection);
  return [
    materialize(
      {
        ...common,
        analyticsProjectionId: projection.analyticsProjectionId,
        signalKind: 'cost-anomaly',
        result: unavailable ? 'unavailable' : partial ? 'partial' : matched.length > 0 ? 'matched' : 'not-matched',
        reasonCode: unavailable
          ? 'anomaly-unavailable'
          : partial
            ? 'anomaly-partial'
            : matched.length > 0
              ? 'anomaly-threshold-matched'
              : 'anomaly-threshold-not-matched',
        matchedThresholds: matched,
      },
      request.definition,
      request.currentSpend,
      projection
    ),
  ];
};
