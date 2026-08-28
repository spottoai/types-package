"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateFinancialPolicyV1 = exports.selectFinancialBudgetComparableCurrentAmountV1 = exports.classifyFinancialBudgetPositionV1 = exports.FINANCIAL_POLICY_ALGORITHM_VERSION_V1 = void 0;
const exactDecimal_1 = require("../common/exactDecimal");
const financialDataflowValidation_1 = require("./financialDataflowValidation");
const financialPolicy_1 = require("./financialPolicy");
const financialPolicyValidation_1 = require("./financialPolicyValidation");
exports.FINANCIAL_POLICY_ALGORITHM_VERSION_V1 = 'financial-policy/shared-v1';
const compare = (left, right) => {
    const difference = (0, exactDecimal_1.subtractExactDecimalValues)((0, exactDecimal_1.parseCanonicalDecimal)(left), (0, exactDecimal_1.parseCanonicalDecimal)(right)).coefficient;
    return difference < 0n ? -1 : difference > 0n ? 1 : 0;
};
const percentageMatched = (amount, denominator, threshold) => {
    const parsedDenominator = (0, exactDecimal_1.parseCanonicalDecimal)(denominator);
    if (parsedDenominator.coefficient <= 0n)
        return false;
    const left = (0, exactDecimal_1.multiplyExactDecimalValues)((0, exactDecimal_1.parseCanonicalDecimal)(amount), (0, exactDecimal_1.parseCanonicalDecimal)('100'));
    const right = (0, exactDecimal_1.multiplyExactDecimalValues)(parsedDenominator, (0, exactDecimal_1.parseCanonicalDecimal)(threshold));
    return (0, exactDecimal_1.subtractExactDecimalValues)(left, right).coefficient >= 0n;
};
/**
 * Shared exact-decimal display classification for Budget surfaces. This is a
 * read-model policy only; alert matching continues to use the thresholds in a
 * versioned Financial Policy Definition.
 */
const classifyFinancialBudgetPositionV1 = (request) => {
    if (request.budgetAmount === undefined)
        return { status: 'unbudgeted' };
    if (request.amount === undefined)
        return { status: 'unavailable' };
    try {
        const atRiskPercent = request.atRiskPercent ?? '95';
        const amount = (0, exactDecimal_1.parseCanonicalDecimal)(request.amount);
        const budget = (0, exactDecimal_1.parseCanonicalDecimal)(request.budgetAmount);
        const risk = (0, exactDecimal_1.parseCanonicalDecimal)(atRiskPercent);
        if (budget.coefficient <= 0n || risk.coefficient < 0n || compare(atRiskPercent, '100') > 0) {
            return { status: 'unbudgeted' };
        }
        const varianceAmount = (0, exactDecimal_1.formatExactDecimalValue)((0, exactDecimal_1.subtractExactDecimalValues)(amount, budget));
        const status = compare(request.amount, request.budgetAmount) > 0
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
    }
    catch {
        return { status: 'unavailable' };
    }
};
exports.classifyFinancialBudgetPositionV1 = classifyFinancialBudgetPositionV1;
const isExpectedCalendarMonthTargetPartial = (composition) => composition.coordinate.period.windowKind === 'calendar-month' &&
    composition.amount.status === 'partial' &&
    composition.amount.reasonCodes.length === 1 &&
    composition.amount.reasonCodes[0] === 'coverage-incomplete';
/**
 * Returns the exact current amount that Budget semantics may compare. An open
 * calendar month is intentionally partial until the period closes; every
 * other partial/unavailable state remains non-comparable.
 */
const selectFinancialBudgetComparableCurrentAmountV1 = (composition) => composition.amount.status === 'available'
    ? composition.amount.amount
    : isExpectedCalendarMonthTargetPartial(composition)
        ? composition.amount.knownAmount
        : undefined;
exports.selectFinancialBudgetComparableCurrentAmountV1 = selectFinancialBudgetComparableCurrentAmountV1;
const budgetThresholds = (amount, budget, thresholds) => [
    ...thresholds.amounts
        .filter(threshold => compare(amount, threshold) >= 0)
        .map(configuredValue => ({ thresholdKind: 'amount', configuredValue })),
    ...thresholds.percents
        .filter(threshold => percentageMatched(amount, budget, threshold))
        .map(configuredValue => ({ thresholdKind: 'percent', configuredValue })),
];
const anomalyThresholds = (definition, projection) => {
    if (definition.criteria.kind !== 'cost-anomaly' || projection.status === 'unavailable' || projection.result.kind !== 'anomaly')
        return [];
    const configured = [
        ...(definition.criteria.minimumAmount === undefined
            ? []
            : [{ thresholdKind: 'minimum-amount', configuredValue: definition.criteria.minimumAmount }]),
        ...(definition.criteria.minimumDelta === undefined
            ? []
            : [{ thresholdKind: 'minimum-delta', configuredValue: definition.criteria.minimumDelta }]),
        ...(definition.criteria.minimumPercentChange === undefined
            ? []
            : [{ thresholdKind: 'minimum-percent-change', configuredValue: definition.criteria.minimumPercentChange }]),
    ];
    return projection.result.events.some(event => configured.every(threshold => {
        if (threshold.thresholdKind === 'minimum-amount')
            return compare(event.observed.amount, threshold.configuredValue) >= 0;
        if (threshold.thresholdKind === 'minimum-delta')
            return compare(event.delta.amount, threshold.configuredValue) >= 0;
        return percentageMatched(event.delta.amount, event.expected.amount, threshold.configuredValue);
    }))
        ? configured
        : [];
};
const materialize = (identity, definition, currentSpend, analytics) => {
    const evaluationId = (0, financialPolicyValidation_1.createFinancialPolicyEvaluationIdV1)(identity);
    const evaluation = {
        ...identity,
        evaluationId,
        readProjectionId: (0, financialPolicyValidation_1.createFinancialPolicyEvaluationReadProjectionIdV1)(evaluationId),
        actionAuditId: (0, financialPolicyValidation_1.createFinancialPolicyEvaluationActionAuditIdV1)(evaluationId),
    };
    if (!(0, financialPolicyValidation_1.isFinancialPolicyEvaluationCompatibleV1)(evaluation, definition, currentSpend, analytics)) {
        throw new TypeError('Financial policy evaluation does not bind its definition and exact financial inputs.');
    }
    return evaluation;
};
const evaluateFinancialPolicyV1 = (request) => {
    if (request.definition.effectiveState !== 'enabled')
        return [];
    const common = {
        schemaVersion: 1,
        contractVersion: financialPolicy_1.FINANCIAL_POLICY_EVALUATION_CONTRACT_VERSION_V1,
        companyId: request.definition.companyId,
        policyDefinitionRevisionId: request.definition.policyDefinitionRevisionId,
        definitionId: request.definition.definitionId,
        definitionRevision: request.definition.revision,
        coordinateId: (0, financialDataflowValidation_1.createFinancialDataflowCoordinateIdV1)(request.currentSpend.coordinate),
        currentSpendCompositionId: request.currentSpend.compositionId,
        evaluatedAt: request.evaluatedAt,
        policyAlgorithmVersion: exports.FINANCIAL_POLICY_ALGORITHM_VERSION_V1,
    };
    if (request.definition.criteria.kind === 'budget') {
        const evaluations = [];
        const currentThresholds = request.definition.criteria.currentSpendThresholds;
        if (currentThresholds) {
            const expectedOpenCalendarMonth = isExpectedCalendarMonthTargetPartial(request.currentSpend);
            const comparableCurrentAmount = (0, exports.selectFinancialBudgetComparableCurrentAmountV1)(request.currentSpend);
            const matched = comparableCurrentAmount === undefined
                ? []
                : budgetThresholds(comparableCurrentAmount, request.definition.criteria.budget.amount, currentThresholds);
            const unavailable = request.currentSpend.amount.status === 'unavailable';
            const partial = request.currentSpend.amount.status === 'partial' && !expectedOpenCalendarMonth;
            evaluations.push(materialize({
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
            }, request.definition, request.currentSpend));
        }
        const forecastThresholds = request.definition.criteria.forecastThresholds;
        if (forecastThresholds) {
            const projection = request.analytics?.forecast;
            if (!projection) {
                evaluations.push(materialize({
                    ...common,
                    signalKind: 'budget-forecast',
                    result: 'unavailable',
                    reasonCode: 'analytics-projection-unavailable',
                    matchedThresholds: [],
                }, request.definition, request.currentSpend));
            }
            else {
                const unavailable = projection.status === 'unavailable' || request.currentSpend.amount.status === 'unavailable';
                const partial = projection.status === 'partial' ||
                    (request.currentSpend.amount.status === 'partial' && !isExpectedCalendarMonthTargetPartial(request.currentSpend));
                const matched = !unavailable && !partial && projection.result.kind === 'forecast'
                    ? budgetThresholds(projection.result.projectedTotal.amount, request.definition.criteria.budget.amount, forecastThresholds)
                    : [];
                evaluations.push(materialize({
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
                }, request.definition, request.currentSpend, projection));
            }
        }
        return evaluations;
    }
    const projection = request.analytics?.anomaly;
    if (!projection) {
        return [
            materialize({
                ...common,
                signalKind: 'cost-anomaly',
                result: 'unavailable',
                reasonCode: 'analytics-projection-unavailable',
                matchedThresholds: [],
            }, request.definition, request.currentSpend),
        ];
    }
    const unavailable = projection.status === 'unavailable' || request.currentSpend.amount.status === 'unavailable';
    const partial = projection.status === 'partial' || request.currentSpend.amount.status === 'partial';
    const matched = unavailable || partial ? [] : anomalyThresholds(request.definition, projection);
    return [
        materialize({
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
        }, request.definition, request.currentSpend, projection),
    ];
};
exports.evaluateFinancialPolicyV1 = evaluateFinancialPolicyV1;
//# sourceMappingURL=financialPolicyKernel.js.map