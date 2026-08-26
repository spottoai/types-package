"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFinancialPolicyActionAttemptCompatibleV1 = exports.isFinancialPolicyActionAttemptV1 = exports.createFinancialPolicyActionAttemptIdV1 = exports.canonicalizeFinancialPolicyActionAttemptIdentityV1 = exports.isFinancialPolicyEvaluationReadProjectionCompatibleV1 = exports.isFinancialPolicyEvaluationReadProjectionV1 = void 0;
const sha256_1 = require("../common/sha256");
const exactDecimal_1 = require("../common/exactDecimal");
const financialValidationPrimitives_1 = require("./financialValidationPrimitives");
const financialPolicyDelivery_1 = require("./financialPolicyDelivery");
const financialDataflowValidation_1 = require("./financialDataflowValidation");
const financialPolicyValidation_1 = require("./financialPolicyValidation");
const SIGNAL_KINDS = new Set(['budget-current-spend', 'budget-forecast', 'cost-anomaly']);
const RESULTS = new Set(['matched', 'not-matched', 'partial', 'unavailable']);
const ACTION_STATUSES = new Set(['succeeded', 'retryable-failure', 'terminal-failure']);
const isNonNegativeDecimal = (value) => {
    if (typeof value !== 'string' || !(0, financialValidationPrimitives_1.isCanonicalExactMoney)({ amount: value, currencyCode: 'AUD' }))
        return false;
    try {
        return (0, exactDecimal_1.parseCanonicalDecimal)(value).coefficient >= 0n;
    }
    catch {
        return false;
    }
};
const isMatchedThresholds = (value) => Array.isArray(value) &&
    value.length <= 64 &&
    value.every(threshold => (0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(threshold) &&
        (0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(threshold, ['thresholdKind', 'configuredValue']) &&
        ['amount', 'percent', 'minimum-amount', 'minimum-delta', 'minimum-percent-change'].includes(String(threshold.thresholdKind)) &&
        isNonNegativeDecimal(threshold.configuredValue)) &&
    new Set(value.map(threshold => `${String(threshold.thresholdKind)}\u0000${String(threshold.configuredValue)}`)).size === value.length;
const isFinancialPolicyEvaluationReadProjectionV1 = (value) => (0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) &&
    (0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, [
        'schemaVersion',
        'contractVersion',
        'readProjectionId',
        'evaluationId',
        'companyId',
        'definitionId',
        'definitionRevision',
        'coordinateId',
        'currentSpendCompositionId',
        'signalKind',
        'evaluatedAt',
        'result',
        'reasonCode',
        'matchedThresholds',
    ], ['analyticsProjectionId']) &&
    value.schemaVersion === 1 &&
    value.contractVersion === financialPolicyDelivery_1.FINANCIAL_POLICY_READ_PROJECTION_CONTRACT_VERSION_V1 &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.evaluationId) &&
    value.readProjectionId === (0, financialPolicyValidation_1.createFinancialPolicyEvaluationReadProjectionIdV1)(value.evaluationId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.companyId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.definitionId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.definitionRevision) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.coordinateId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.currentSpendCompositionId) &&
    (value.analyticsProjectionId === undefined || (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.analyticsProjectionId)) &&
    typeof value.signalKind === 'string' &&
    SIGNAL_KINDS.has(value.signalKind) &&
    (value.signalKind === 'budget-current-spend' ? value.analyticsProjectionId === undefined : value.analyticsProjectionId !== undefined) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIsoInstantV1)(value.evaluatedAt) &&
    typeof value.result === 'string' &&
    RESULTS.has(value.result) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.reasonCode) &&
    isMatchedThresholds(value.matchedThresholds) &&
    Array.isArray(value.matchedThresholds) &&
    (value.result === 'matched' ? value.matchedThresholds.length > 0 : value.matchedThresholds.length === 0);
exports.isFinancialPolicyEvaluationReadProjectionV1 = isFinancialPolicyEvaluationReadProjectionV1;
const isFinancialPolicyEvaluationReadProjectionCompatibleV1 = (projection, evaluation) => {
    if (!(0, exports.isFinancialPolicyEvaluationReadProjectionV1)(projection) || !(0, financialPolicyValidation_1.isFinancialPolicyEvaluationV1)(evaluation))
        return false;
    const expected = {
        schemaVersion: 1,
        contractVersion: financialPolicyDelivery_1.FINANCIAL_POLICY_READ_PROJECTION_CONTRACT_VERSION_V1,
        readProjectionId: evaluation.readProjectionId,
        evaluationId: evaluation.evaluationId,
        companyId: evaluation.companyId,
        definitionId: evaluation.definitionId,
        definitionRevision: evaluation.definitionRevision,
        coordinateId: evaluation.coordinateId,
        currentSpendCompositionId: evaluation.currentSpendCompositionId,
        ...(evaluation.analyticsProjectionId === undefined ? {} : { analyticsProjectionId: evaluation.analyticsProjectionId }),
        signalKind: evaluation.signalKind,
        evaluatedAt: evaluation.evaluatedAt,
        result: evaluation.result,
        reasonCode: evaluation.reasonCode,
        matchedThresholds: evaluation.matchedThresholds,
    };
    return (0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)(projection) === (0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)(expected);
};
exports.isFinancialPolicyEvaluationReadProjectionCompatibleV1 = isFinancialPolicyEvaluationReadProjectionCompatibleV1;
const isActionAttemptIdentity = (value) => (0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) &&
    (0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, [
        'schemaVersion',
        'contractVersion',
        'actionAuditId',
        'evaluationId',
        'companyId',
        'destinationRefId',
        'attemptNumber',
        'attemptedAt',
        'status',
        'reasonCode',
        'executorVersion',
    ]) &&
    value.schemaVersion === 1 &&
    value.contractVersion === financialPolicyDelivery_1.FINANCIAL_POLICY_ACTION_ATTEMPT_CONTRACT_VERSION_V1 &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.evaluationId) &&
    value.actionAuditId === (0, financialPolicyValidation_1.createFinancialPolicyEvaluationActionAuditIdV1)(value.evaluationId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.companyId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.destinationRefId) &&
    Number.isSafeInteger(value.attemptNumber) &&
    Number(value.attemptNumber) > 0 &&
    (0, financialDataflowValidation_1.isFinancialDataflowIsoInstantV1)(value.attemptedAt) &&
    typeof value.status === 'string' &&
    ACTION_STATUSES.has(value.status) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.reasonCode) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.executorVersion);
const canonicalizeFinancialPolicyActionAttemptIdentityV1 = (value) => {
    if (!isActionAttemptIdentity(value))
        throw new TypeError('Invalid FinancialPolicyActionAttemptIdentityPreimageV1.');
    return (0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)(value);
};
exports.canonicalizeFinancialPolicyActionAttemptIdentityV1 = canonicalizeFinancialPolicyActionAttemptIdentityV1;
const createFinancialPolicyActionAttemptIdV1 = (value) => `sha256:${(0, sha256_1.sha256Utf8)((0, exports.canonicalizeFinancialPolicyActionAttemptIdentityV1)(value))}`;
exports.createFinancialPolicyActionAttemptIdV1 = createFinancialPolicyActionAttemptIdV1;
const isFinancialPolicyActionAttemptV1 = (value) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) || !Object.prototype.hasOwnProperty.call(value, 'actionAttemptId'))
        return false;
    const { actionAttemptId, ...identity } = value;
    return ((0, financialDataflowValidation_1.isFinancialDataflowHashV1)(actionAttemptId) &&
        isActionAttemptIdentity(identity) &&
        actionAttemptId === (0, exports.createFinancialPolicyActionAttemptIdV1)(identity));
};
exports.isFinancialPolicyActionAttemptV1 = isFinancialPolicyActionAttemptV1;
const isFinancialPolicyActionAttemptCompatibleV1 = (attempt, evaluation, definition) => (0, exports.isFinancialPolicyActionAttemptV1)(attempt) &&
    (0, financialPolicyValidation_1.isFinancialPolicyEvaluationV1)(evaluation) &&
    (0, financialPolicyValidation_1.isFinancialPolicyDefinitionRevisionV1)(definition) &&
    definition.effectiveState === 'enabled' &&
    evaluation.result === 'matched' &&
    attempt.evaluationId === evaluation.evaluationId &&
    attempt.actionAuditId === evaluation.actionAuditId &&
    attempt.companyId === evaluation.companyId &&
    Date.parse(attempt.attemptedAt) >= Date.parse(evaluation.evaluatedAt) &&
    evaluation.policyDefinitionRevisionId === definition.policyDefinitionRevisionId &&
    definition.destinationRefIds.includes(attempt.destinationRefId);
exports.isFinancialPolicyActionAttemptCompatibleV1 = isFinancialPolicyActionAttemptCompatibleV1;
//# sourceMappingURL=financialPolicyDeliveryValidation.js.map