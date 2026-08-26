"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFinancialPolicyEvaluationCompatibleV1 = exports.isFinancialPolicyEvaluationV1 = exports.createFinancialPolicyEvaluationActionAuditIdV1 = exports.createFinancialPolicyEvaluationReadProjectionIdV1 = exports.createFinancialPolicyEvaluationIdV1 = exports.canonicalizeFinancialPolicyEvaluationIdentityV1 = exports.isFinancialPolicyDefinitionRevisionV1 = exports.createFinancialPolicyDefinitionRevisionIdV1 = exports.canonicalizeFinancialPolicyDefinitionRevisionIdentityV1 = void 0;
const exactDecimal_1 = require("../common/exactDecimal");
const sha256_1 = require("../common/sha256");
const financialValidationPrimitives_1 = require("./financialValidationPrimitives");
const financialPolicy_1 = require("./financialPolicy");
const financialDataflowValidation_1 = require("./financialDataflowValidation");
const financialDataflowValidation_2 = require("./financialDataflowValidation");
const financialAnalyticsValidation_1 = require("./financialAnalyticsValidation");
const COST_BASES = new Set(['billed', 'amortized']);
const ESTIMATE_LENSES = new Set(['billing-only', 'include-estimates', 'estimates-only']);
const MATCHED_THRESHOLD_KINDS = new Set(['amount', 'percent', 'minimum-amount', 'minimum-delta', 'minimum-percent-change']);
const MAX_THRESHOLDS = 64;
const MAX_DESTINATIONS = 256;
const isCanonicalDecimal = (value) => typeof value === 'string' && (0, financialValidationPrimitives_1.isCanonicalExactMoney)({ amount: value, currencyCode: 'AUD' });
const isNonNegativeDecimal = (value) => {
    if (!isCanonicalDecimal(value))
        return false;
    try {
        return (0, exactDecimal_1.parseCanonicalDecimal)(value).coefficient >= 0n;
    }
    catch {
        return false;
    }
};
const compareCanonicalDecimals = (left, right) => {
    const difference = (0, exactDecimal_1.subtractExactDecimalValues)((0, exactDecimal_1.parseCanonicalDecimal)(left), (0, exactDecimal_1.parseCanonicalDecimal)(right)).coefficient;
    return difference < 0n ? -1 : difference > 0n ? 1 : 0;
};
const isPercentageThresholdMatched = (amount, denominator, threshold) => {
    const parsedDenominator = (0, exactDecimal_1.parseCanonicalDecimal)(denominator);
    if (parsedDenominator.coefficient <= 0n)
        return false;
    const scaledAmount = (0, exactDecimal_1.multiplyExactDecimalValues)((0, exactDecimal_1.parseCanonicalDecimal)(amount), (0, exactDecimal_1.parseCanonicalDecimal)('100'));
    const scaledThreshold = (0, exactDecimal_1.multiplyExactDecimalValues)(parsedDenominator, (0, exactDecimal_1.parseCanonicalDecimal)(threshold));
    return (0, exactDecimal_1.subtractExactDecimalValues)(scaledAmount, scaledThreshold).coefficient >= 0n;
};
const isThresholdSet = (value) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) ||
        !(0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, ['amounts', 'percents']) ||
        !Array.isArray(value.amounts) ||
        !Array.isArray(value.percents) ||
        value.amounts.length + value.percents.length === 0 ||
        value.amounts.length + value.percents.length > MAX_THRESHOLDS ||
        !value.amounts.every(isNonNegativeDecimal) ||
        !value.percents.every(isNonNegativeDecimal)) {
        return false;
    }
    return new Set(value.amounts).size === value.amounts.length && new Set(value.percents).size === value.percents.length;
};
const isCoordinateRequest = (value, companyId) => (0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) &&
    (0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, [
        'provider',
        'providerAccountRefs',
        'scope',
        'period',
        'costBasis',
        'estimateLens',
        'requiredAccountingCurrencyCode',
    ]) &&
    value.provider === 'azure' &&
    (0, financialDataflowValidation_1.isFinancialDataflowSortedUniqueStringsV1)(value.providerAccountRefs, financialDataflowValidation_1.FINANCIAL_DATAFLOW_LIMITS_V1.maximumProviderAccounts) &&
    value.providerAccountRefs.length > 0 &&
    (0, financialDataflowValidation_1.isFinancialDataflowScopeV1)(value.scope) &&
    (0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value.period) &&
    (0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value.period, ['kind', 'timeZone']) &&
    (value.period.kind === 'calendar-month' || value.period.kind === 'rolling-30-days') &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.period.timeZone) &&
    typeof value.costBasis === 'string' &&
    COST_BASES.has(value.costBasis) &&
    typeof value.estimateLens === 'string' &&
    ESTIMATE_LENSES.has(value.estimateLens) &&
    (0, financialDataflowValidation_1.isFinancialDataflowCurrencyV1)(value.requiredAccountingCurrencyCode) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(companyId);
const isCriteria = (value, currencyCode) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value))
        return false;
    if (value.kind === 'budget') {
        return ((0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, ['kind', 'budget'], ['currentSpendThresholds', 'forecastThresholds']) &&
            (0, financialValidationPrimitives_1.isCanonicalExactMoney)(value.budget) &&
            isNonNegativeDecimal(value.budget.amount) &&
            value.budget.currencyCode === currencyCode &&
            (value.currentSpendThresholds !== undefined || value.forecastThresholds !== undefined) &&
            (value.currentSpendThresholds === undefined || isThresholdSet(value.currentSpendThresholds)) &&
            (value.forecastThresholds === undefined || isThresholdSet(value.forecastThresholds)));
    }
    return (value.kind === 'cost-anomaly' &&
        (0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, ['kind'], ['minimumAmount', 'minimumDelta', 'minimumPercentChange']) &&
        (value.minimumAmount !== undefined || value.minimumDelta !== undefined || value.minimumPercentChange !== undefined) &&
        (value.minimumAmount === undefined || isNonNegativeDecimal(value.minimumAmount)) &&
        (value.minimumDelta === undefined || isNonNegativeDecimal(value.minimumDelta)) &&
        (value.minimumPercentChange === undefined || isNonNegativeDecimal(value.minimumPercentChange)));
};
const isDefinitionIdentity = (value) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) ||
        !(0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, [
            'schemaVersion',
            'contractVersion',
            'companyId',
            'definitionId',
            'revision',
            'effectiveState',
            'coordinateRequest',
            'criteria',
            'schedule',
            'destinationRefIds',
            'destinationsDigest',
            'authoredAt',
            'authoredByUserId',
        ]) ||
        value.schemaVersion !== 1 ||
        value.contractVersion !== financialPolicy_1.FINANCIAL_POLICY_DEFINITION_CONTRACT_VERSION_V1 ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.companyId) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.definitionId) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.revision) ||
        !['enabled', 'disabled', 'deleted'].includes(String(value.effectiveState)) ||
        !isCoordinateRequest(value.coordinateRequest, value.companyId) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value.coordinateRequest) ||
        !isCriteria(value.criteria, String(value.coordinateRequest.requiredAccountingCurrencyCode)) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value.schedule) ||
        !(0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value.schedule, ['cadenceMinutes']) ||
        !Number.isSafeInteger(value.schedule.cadenceMinutes) ||
        Number(value.schedule.cadenceMinutes) < 1 ||
        Number(value.schedule.cadenceMinutes) > 10080 ||
        !(0, financialDataflowValidation_1.isFinancialDataflowSortedUniqueStringsV1)(value.destinationRefIds, MAX_DESTINATIONS) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.destinationsDigest) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIsoInstantV1)(value.authoredAt) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.authoredByUserId)) {
        return false;
    }
    return value.effectiveState !== 'enabled' || value.destinationRefIds.length > 0;
};
const canonicalizeFinancialPolicyDefinitionRevisionIdentityV1 = (value) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowValueWithinLimitsV1)(value) || !isDefinitionIdentity(value)) {
        throw new TypeError('Invalid FinancialPolicyDefinitionRevisionIdentityPreimageV1.');
    }
    const criteria = value.criteria.kind === 'budget'
        ? {
            ...value.criteria,
            ...(value.criteria.currentSpendThresholds === undefined
                ? {}
                : {
                    currentSpendThresholds: {
                        amounts: [...value.criteria.currentSpendThresholds.amounts].sort(),
                        percents: [...value.criteria.currentSpendThresholds.percents].sort(),
                    },
                }),
            ...(value.criteria.forecastThresholds === undefined
                ? {}
                : {
                    forecastThresholds: {
                        amounts: [...value.criteria.forecastThresholds.amounts].sort(),
                        percents: [...value.criteria.forecastThresholds.percents].sort(),
                    },
                }),
        }
        : value.criteria;
    return (0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)({
        ...value,
        coordinateRequest: {
            ...value.coordinateRequest,
            providerAccountRefs: [...value.coordinateRequest.providerAccountRefs].sort(),
        },
        criteria,
        destinationRefIds: [...value.destinationRefIds].sort(),
    });
};
exports.canonicalizeFinancialPolicyDefinitionRevisionIdentityV1 = canonicalizeFinancialPolicyDefinitionRevisionIdentityV1;
const createFinancialPolicyDefinitionRevisionIdV1 = (value) => `sha256:${(0, sha256_1.sha256Utf8)((0, exports.canonicalizeFinancialPolicyDefinitionRevisionIdentityV1)(value))}`;
exports.createFinancialPolicyDefinitionRevisionIdV1 = createFinancialPolicyDefinitionRevisionIdV1;
const isFinancialPolicyDefinitionRevisionV1 = (value) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowValueWithinLimitsV1)(value) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) ||
        !Object.prototype.hasOwnProperty.call(value, 'policyDefinitionRevisionId'))
        return false;
    const { policyDefinitionRevisionId, ...identity } = value;
    return ((0, financialDataflowValidation_1.isFinancialDataflowHashV1)(policyDefinitionRevisionId) &&
        isDefinitionIdentity(identity) &&
        policyDefinitionRevisionId === (0, exports.createFinancialPolicyDefinitionRevisionIdV1)(identity));
};
exports.isFinancialPolicyDefinitionRevisionV1 = isFinancialPolicyDefinitionRevisionV1;
const isMatchedThresholds = (value) => Array.isArray(value) &&
    value.length <= MAX_THRESHOLDS &&
    value.every(threshold => (0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(threshold) &&
        (0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(threshold, ['thresholdKind', 'configuredValue']) &&
        typeof threshold.thresholdKind === 'string' &&
        MATCHED_THRESHOLD_KINDS.has(threshold.thresholdKind) &&
        isNonNegativeDecimal(threshold.configuredValue)) &&
    new Set(value.map(threshold => `${String(threshold.thresholdKind)}\u0000${String(threshold.configuredValue)}`)).size === value.length;
const isEvaluationIdentity = (value) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) ||
        !(0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, [
            'schemaVersion',
            'contractVersion',
            'companyId',
            'policyDefinitionRevisionId',
            'definitionId',
            'definitionRevision',
            'coordinateId',
            'currentSpendCompositionId',
            'signalKind',
            'evaluatedAt',
            'policyAlgorithmVersion',
            'result',
            'reasonCode',
            'matchedThresholds',
        ], ['analyticsProjectionId']) ||
        value.schemaVersion !== 1 ||
        value.contractVersion !== financialPolicy_1.FINANCIAL_POLICY_EVALUATION_CONTRACT_VERSION_V1 ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.companyId) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.policyDefinitionRevisionId) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.definitionId) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.definitionRevision) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.coordinateId) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.currentSpendCompositionId) ||
        !['budget-current-spend', 'budget-forecast', 'cost-anomaly'].includes(String(value.signalKind)) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIsoInstantV1)(value.evaluatedAt) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.policyAlgorithmVersion) ||
        !['matched', 'not-matched', 'partial', 'unavailable'].includes(String(value.result)) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.reasonCode) ||
        !isMatchedThresholds(value.matchedThresholds)) {
        return false;
    }
    const analyticsRequired = value.signalKind === 'budget-forecast' || value.signalKind === 'cost-anomaly';
    return analyticsRequired ? (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.analyticsProjectionId) : value.analyticsProjectionId === undefined;
};
const canonicalizeFinancialPolicyEvaluationIdentityV1 = (value) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowValueWithinLimitsV1)(value) || !isEvaluationIdentity(value)) {
        throw new TypeError('Invalid FinancialPolicyEvaluationIdentityPreimageV1.');
    }
    return (0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)({
        ...value,
        matchedThresholds: [...value.matchedThresholds].sort((left, right) => `${left.thresholdKind}\u0000${left.configuredValue}`.localeCompare(`${right.thresholdKind}\u0000${right.configuredValue}`)),
    });
};
exports.canonicalizeFinancialPolicyEvaluationIdentityV1 = canonicalizeFinancialPolicyEvaluationIdentityV1;
const createFinancialPolicyEvaluationIdV1 = (value) => `sha256:${(0, sha256_1.sha256Utf8)((0, exports.canonicalizeFinancialPolicyEvaluationIdentityV1)(value))}`;
exports.createFinancialPolicyEvaluationIdV1 = createFinancialPolicyEvaluationIdV1;
const createFinancialPolicyEvaluationReadProjectionIdV1 = (evaluationId) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowHashV1)(evaluationId))
        throw new TypeError('Invalid evaluationId.');
    return `${evaluationId}:read`;
};
exports.createFinancialPolicyEvaluationReadProjectionIdV1 = createFinancialPolicyEvaluationReadProjectionIdV1;
const createFinancialPolicyEvaluationActionAuditIdV1 = (evaluationId) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowHashV1)(evaluationId))
        throw new TypeError('Invalid evaluationId.');
    return `${evaluationId}:action`;
};
exports.createFinancialPolicyEvaluationActionAuditIdV1 = createFinancialPolicyEvaluationActionAuditIdV1;
const isFinancialPolicyEvaluationV1 = (value) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowValueWithinLimitsV1)(value) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) ||
        !(0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, [
            'schemaVersion',
            'contractVersion',
            'evaluationId',
            'companyId',
            'policyDefinitionRevisionId',
            'definitionId',
            'definitionRevision',
            'coordinateId',
            'currentSpendCompositionId',
            'signalKind',
            'evaluatedAt',
            'policyAlgorithmVersion',
            'result',
            'reasonCode',
            'matchedThresholds',
            'readProjectionId',
            'actionAuditId',
        ], ['analyticsProjectionId'])) {
        return false;
    }
    const { evaluationId, readProjectionId, actionAuditId, ...identity } = value;
    return ((0, financialDataflowValidation_1.isFinancialDataflowHashV1)(evaluationId) &&
        isEvaluationIdentity(identity) &&
        evaluationId === (0, exports.createFinancialPolicyEvaluationIdV1)(identity) &&
        readProjectionId === (0, exports.createFinancialPolicyEvaluationReadProjectionIdV1)(evaluationId) &&
        actionAuditId === (0, exports.createFinancialPolicyEvaluationActionAuditIdV1)(evaluationId));
};
exports.isFinancialPolicyEvaluationV1 = isFinancialPolicyEvaluationV1;
const sameStrings = (left, right) => {
    if (left.length !== right.length)
        return false;
    const sortedLeft = [...left].sort();
    const sortedRight = [...right].sort();
    return sortedLeft.every((value, index) => value === sortedRight[index]);
};
const thresholdKey = (threshold) => `${threshold.thresholdKind}\u0000${threshold.configuredValue}`;
const hasExactMatchedThresholds = (actual, expected) => {
    if (actual.length !== expected.length)
        return false;
    const expectedKeys = new Set(expected.map(thresholdKey));
    return actual.every(threshold => expectedKeys.has(thresholdKey(threshold)));
};
const budgetMatchedThresholds = (amount, budget, thresholds) => [
    ...thresholds.amounts
        .filter(threshold => compareCanonicalDecimals(amount, threshold) >= 0)
        .map(configuredValue => ({ thresholdKind: 'amount', configuredValue })),
    ...thresholds.percents
        .filter(threshold => isPercentageThresholdMatched(amount, budget, threshold))
        .map(configuredValue => ({ thresholdKind: 'percent', configuredValue })),
];
const safeBudgetMatchedThresholds = (amount, budget, thresholds) => {
    try {
        return budgetMatchedThresholds(amount, budget, thresholds);
    }
    catch {
        return undefined;
    }
};
const anomalyMatchedThresholds = (definition, analyticsProjection) => {
    if (definition.criteria.kind !== 'cost-anomaly' || analyticsProjection.status === 'unavailable' || analyticsProjection.result.kind !== 'anomaly') {
        return [];
    }
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
    const matched = analyticsProjection.result.events.some(event => configured.every(threshold => {
        if (threshold.thresholdKind === 'minimum-amount')
            return compareCanonicalDecimals(event.observed.amount, threshold.configuredValue) >= 0;
        if (threshold.thresholdKind === 'minimum-delta')
            return compareCanonicalDecimals(event.delta.amount, threshold.configuredValue) >= 0;
        return isPercentageThresholdMatched(event.delta.amount, event.expected.amount, threshold.configuredValue);
    }));
    return matched ? configured : [];
};
const safeAnomalyMatchedThresholds = (definition, analyticsProjection) => {
    try {
        return anomalyMatchedThresholds(definition, analyticsProjection);
    }
    catch {
        return undefined;
    }
};
/** Validates definition, coordinate, financial input, and signal links after authorization. */
const isFinancialPolicyEvaluationCompatibleV1 = (evaluation, definition, currentSpendComposition, analyticsProjection) => {
    if (!(0, exports.isFinancialPolicyEvaluationV1)(evaluation) ||
        !(0, exports.isFinancialPolicyDefinitionRevisionV1)(definition) ||
        !(0, financialDataflowValidation_2.isCurrentSpendCompositionV1)(currentSpendComposition)) {
        return false;
    }
    const coordinate = currentSpendComposition.coordinate;
    const request = definition.coordinateRequest;
    const currency = coordinate.accountingCurrency.status === 'resolved' ? coordinate.accountingCurrency.currencyCode : undefined;
    const periodTimeZone = coordinate.period.requested.timeZone;
    if (definition.effectiveState !== 'enabled' ||
        evaluation.companyId !== definition.companyId ||
        evaluation.companyId !== coordinate.companyId ||
        evaluation.policyDefinitionRevisionId !== definition.policyDefinitionRevisionId ||
        evaluation.definitionId !== definition.definitionId ||
        evaluation.definitionRevision !== definition.revision ||
        evaluation.coordinateId !== (0, financialDataflowValidation_1.createFinancialDataflowCoordinateIdV1)(coordinate) ||
        evaluation.currentSpendCompositionId !== currentSpendComposition.compositionId ||
        request.provider !== coordinate.provider ||
        !sameStrings(request.providerAccountRefs, coordinate.providerAccountRefs) ||
        request.scope.kind !== coordinate.scope.kind ||
        request.scope.scopeId !== coordinate.scope.scopeId ||
        request.scope.scopeFingerprint !== coordinate.scope.scopeFingerprint ||
        request.costBasis !== coordinate.costBasis ||
        request.estimateLens !== coordinate.estimateLens ||
        request.requiredAccountingCurrencyCode !== currency ||
        coordinate.requestedCurrencyCode !== request.requiredAccountingCurrencyCode ||
        request.period.kind !== coordinate.period.windowKind ||
        request.period.timeZone !== periodTimeZone) {
        return false;
    }
    if (evaluation.result === 'matched' ? evaluation.matchedThresholds.length === 0 : evaluation.matchedThresholds.length > 0)
        return false;
    let configuredAmounts = [];
    let configuredPercents = [];
    if (evaluation.signalKind === 'budget-current-spend' || evaluation.signalKind === 'budget-forecast') {
        if (definition.criteria.kind !== 'budget')
            return false;
        const thresholds = evaluation.signalKind === 'budget-current-spend' ? definition.criteria.currentSpendThresholds : definition.criteria.forecastThresholds;
        if (thresholds === undefined)
            return false;
        configuredAmounts = thresholds.amounts;
        configuredPercents = thresholds.percents;
    }
    else {
        if (definition.criteria.kind !== 'cost-anomaly')
            return false;
    }
    for (const threshold of evaluation.matchedThresholds) {
        if (threshold.thresholdKind === 'amount' && !configuredAmounts.includes(threshold.configuredValue))
            return false;
        if (threshold.thresholdKind === 'percent' && !configuredPercents.includes(threshold.configuredValue))
            return false;
        if (threshold.thresholdKind === 'minimum-amount' &&
            (definition.criteria.kind !== 'cost-anomaly' || threshold.configuredValue !== definition.criteria.minimumAmount))
            return false;
        if (threshold.thresholdKind === 'minimum-delta' &&
            (definition.criteria.kind !== 'cost-anomaly' || threshold.configuredValue !== definition.criteria.minimumDelta))
            return false;
        if (threshold.thresholdKind === 'minimum-percent-change' &&
            (definition.criteria.kind !== 'cost-anomaly' || threshold.configuredValue !== definition.criteria.minimumPercentChange))
            return false;
    }
    if (evaluation.signalKind === 'budget-current-spend') {
        if (evaluation.analyticsProjectionId !== undefined || analyticsProjection !== undefined)
            return false;
        if (currentSpendComposition.amount.status === 'unavailable') {
            return evaluation.result === 'unavailable' && evaluation.matchedThresholds.length === 0;
        }
        if (currentSpendComposition.amount.status === 'partial') {
            return evaluation.result === 'partial' && evaluation.matchedThresholds.length === 0;
        }
        if (definition.criteria.kind !== 'budget' || definition.criteria.currentSpendThresholds === undefined)
            return false;
        const expectedThresholds = safeBudgetMatchedThresholds(currentSpendComposition.amount.amount, definition.criteria.budget.amount, definition.criteria.currentSpendThresholds);
        if (expectedThresholds === undefined)
            return false;
        return (evaluation.result === (expectedThresholds.length > 0 ? 'matched' : 'not-matched') &&
            hasExactMatchedThresholds(evaluation.matchedThresholds, expectedThresholds));
    }
    if (!(0, financialAnalyticsValidation_1.isFinancialAnalyticsProjectionV1)(analyticsProjection) ||
        evaluation.analyticsProjectionId !== analyticsProjection.analyticsProjectionId ||
        analyticsProjection.coordinate.companyId !== coordinate.companyId ||
        analyticsProjection.coordinate.scope.scopeFingerprint !== coordinate.scope.scopeFingerprint ||
        analyticsProjection.coordinate.costBasis !== coordinate.costBasis ||
        analyticsProjection.coordinate.estimateLens !== coordinate.estimateLens ||
        (0, financialDataflowValidation_1.canonicalizeFinancialDataflowCoordinateV1)({ ...analyticsProjection.coordinate, periodRole: 'current-spend' }) !==
            (0, financialDataflowValidation_1.canonicalizeFinancialDataflowCoordinateV1)(coordinate) ||
        analyticsProjection.coordinate.accountingCurrency.status !== 'resolved' ||
        analyticsProjection.coordinate.accountingCurrency.currencyCode !== currency) {
        return false;
    }
    const expectedAnalyticsKind = evaluation.signalKind === 'budget-forecast' ? 'forecast' : 'anomaly';
    const actualAnalyticsKind = analyticsProjection.status === 'unavailable' ? analyticsProjection.resultKind : analyticsProjection.result.kind;
    if (actualAnalyticsKind !== expectedAnalyticsKind)
        return false;
    if (currentSpendComposition.amount.status === 'unavailable' || analyticsProjection.status === 'unavailable') {
        return evaluation.result === 'unavailable' && evaluation.matchedThresholds.length === 0;
    }
    if (currentSpendComposition.amount.status === 'partial' || analyticsProjection.status === 'partial') {
        return evaluation.result === 'partial' && evaluation.matchedThresholds.length === 0;
    }
    if (evaluation.result !== 'matched' && evaluation.result !== 'not-matched')
        return false;
    if (evaluation.signalKind === 'budget-forecast') {
        if (definition.criteria.kind !== 'budget' ||
            definition.criteria.forecastThresholds === undefined ||
            analyticsProjection.result.kind !== 'forecast') {
            return false;
        }
        const expectedThresholds = safeBudgetMatchedThresholds(analyticsProjection.result.projectedTotal.amount, definition.criteria.budget.amount, definition.criteria.forecastThresholds);
        if (expectedThresholds === undefined)
            return false;
        return (evaluation.result === (expectedThresholds.length > 0 ? 'matched' : 'not-matched') &&
            hasExactMatchedThresholds(evaluation.matchedThresholds, expectedThresholds));
    }
    if (analyticsProjection.result.kind !== 'anomaly')
        return false;
    const expectedThresholds = safeAnomalyMatchedThresholds(definition, analyticsProjection);
    if (expectedThresholds === undefined)
        return false;
    return (evaluation.result === (expectedThresholds.length > 0 ? 'matched' : 'not-matched') &&
        hasExactMatchedThresholds(evaluation.matchedThresholds, expectedThresholds));
};
exports.isFinancialPolicyEvaluationCompatibleV1 = isFinancialPolicyEvaluationCompatibleV1;
//# sourceMappingURL=financialPolicyValidation.js.map