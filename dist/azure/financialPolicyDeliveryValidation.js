"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFinancialPolicyActionCompletionCompatibleV1 = exports.isFinancialPolicyActionCompletionV1 = exports.createFinancialPolicyActionCompletionIdV1 = exports.canonicalizeFinancialPolicyActionCompletionIdentityV1 = exports.isFinancialPolicyActionAttemptCompatibleV1 = exports.isFinancialPolicyActionAttemptV1 = exports.createFinancialPolicyActionAttemptIdV1 = exports.canonicalizeFinancialPolicyActionAttemptIdentityV1 = exports.isFinancialPolicyEvaluationReadManifestCompatibleV1 = exports.isFinancialPolicyEvaluationReadManifestV1 = exports.createFinancialPolicyEvaluationReadManifestDigestV1 = exports.isFinancialPolicyEvaluationReadCurrentPointerCompatibleV1 = exports.isFinancialPolicyEvaluationReadCurrentPointerV1 = exports.createFinancialPolicyEvaluationReadCurrentPointerDigestV1 = exports.canonicalizeFinancialPolicyEvaluationReadCurrentPointerIdentityV1 = exports.isFinancialPolicyEvaluationReadProjectionCompatibleV1 = exports.isFinancialPolicyEvaluationReadProjectionV1 = exports.isFinancialPolicyDefinitionCommandV1 = exports.createFinancialPolicyDestinationsDigestV1 = void 0;
const sha256_1 = require("../common/sha256");
const exactDecimal_1 = require("../common/exactDecimal");
const financialValidationPrimitives_1 = require("./financialValidationPrimitives");
const financialAnalyticsValidation_1 = require("./financialAnalyticsValidation");
const financialPolicyDelivery_1 = require("./financialPolicyDelivery");
const financialDataflowValidation_1 = require("./financialDataflowValidation");
const financialPolicyValidation_1 = require("./financialPolicyValidation");
const SIGNAL_KINDS = new Set(['budget-current-spend', 'budget-forecast', 'cost-anomaly']);
const RESULTS = new Set(['matched', 'not-matched', 'partial', 'unavailable']);
const ACTION_STATUSES = new Set(['succeeded', 'retryable-failure', 'terminal-failure']);
const isCanonicalPolicyRevision = (value) => {
    if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value))
        return false;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && String(parsed) === value;
};
const createFinancialPolicyDestinationsDigestV1 = (destinationRefIds) => `sha256:${(0, sha256_1.sha256Utf8)((0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)([...destinationRefIds].sort()))}`;
exports.createFinancialPolicyDestinationsDigestV1 = createFinancialPolicyDestinationsDigestV1;
const isFinancialPolicyDefinitionCommandV1 = (value) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) ||
        !(0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, ['schemaVersion', 'contractVersion', 'displayName', 'effectiveState', 'coordinateRequest', 'criteria', 'schedule', 'destinationRefIds'], ['expectedRevision']) ||
        value.schemaVersion !== 1 ||
        value.contractVersion !== financialPolicyDelivery_1.FINANCIAL_POLICY_DEFINITION_COMMAND_CONTRACT_VERSION_V1 ||
        (value.expectedRevision !== undefined && !isCanonicalPolicyRevision(value.expectedRevision)) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.displayName) ||
        (value.effectiveState !== 'enabled' && value.effectiveState !== 'disabled') ||
        !Array.isArray(value.destinationRefIds)) {
        return false;
    }
    const identity = {
        schemaVersion: 1,
        contractVersion: 'financial-policy-definition/v1',
        companyId: 'contract-company',
        definitionId: 'contract-definition',
        displayName: value.displayName,
        revision: '1',
        effectiveState: value.effectiveState,
        coordinateRequest: value.coordinateRequest,
        criteria: value.criteria,
        schedule: value.schedule,
        destinationRefIds: value.destinationRefIds,
        destinationsDigest: (0, exports.createFinancialPolicyDestinationsDigestV1)(value.destinationRefIds),
        authoredAt: '2026-01-01T00:00:00.000Z',
        authoredByUserId: 'contract-author',
    };
    if (!(0, financialPolicyValidation_1.isFinancialPolicyDefinitionRevisionIdentityPreimageV1)(identity))
        return false;
    const definition = { ...identity, policyDefinitionRevisionId: (0, financialPolicyValidation_1.createFinancialPolicyDefinitionRevisionIdV1)(identity) };
    return (0, financialPolicyValidation_1.isFinancialPolicyDefinitionRevisionV1)(definition);
};
exports.isFinancialPolicyDefinitionCommandV1 = isFinancialPolicyDefinitionCommandV1;
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
        'policyDefinitionRevisionId',
        'coordinateId',
        'currentSpendCompositionId',
        'signalKind',
        'evaluatedAt',
        'result',
        'reasonCode',
        'matchedThresholds',
    ], ['analyticsProjectionId', 'analyticsProjection']) &&
    value.schemaVersion === 1 &&
    value.contractVersion === financialPolicyDelivery_1.FINANCIAL_POLICY_READ_PROJECTION_CONTRACT_VERSION_V1 &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.evaluationId) &&
    value.readProjectionId === (0, financialPolicyValidation_1.createFinancialPolicyEvaluationReadProjectionIdV1)(value.evaluationId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.companyId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.definitionId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.definitionRevision) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.policyDefinitionRevisionId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.coordinateId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.currentSpendCompositionId) &&
    (value.analyticsProjectionId === undefined || (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.analyticsProjectionId)) &&
    (value.analyticsProjection === undefined || (0, financialAnalyticsValidation_1.isFinancialAnalyticsProjectionV1)(value.analyticsProjection)) &&
    (value.analyticsProjectionId === undefined
        ? value.analyticsProjection === undefined
        : value.analyticsProjection?.analyticsProjectionId === value.analyticsProjectionId &&
            value.analyticsProjection.currentSpendCompositionId === value.currentSpendCompositionId &&
            value.analyticsProjection.coordinate.companyId === value.companyId &&
            value.analyticsProjection.coordinate.periodRole === 'projection-target') &&
    typeof value.signalKind === 'string' &&
    SIGNAL_KINDS.has(value.signalKind) &&
    (value.signalKind === 'budget-current-spend'
        ? value.analyticsProjectionId === undefined
        : value.result === 'unavailable'
            ? value.analyticsProjectionId === undefined || (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.analyticsProjectionId)
            : value.analyticsProjectionId !== undefined) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIsoInstantV1)(value.evaluatedAt) &&
    typeof value.result === 'string' &&
    RESULTS.has(value.result) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.reasonCode) &&
    isMatchedThresholds(value.matchedThresholds) &&
    Array.isArray(value.matchedThresholds) &&
    (value.result === 'matched' ? value.matchedThresholds.length > 0 : value.matchedThresholds.length === 0);
exports.isFinancialPolicyEvaluationReadProjectionV1 = isFinancialPolicyEvaluationReadProjectionV1;
const isFinancialPolicyEvaluationReadProjectionCompatibleV1 = (projection, evaluation, analyticsProjection) => {
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
        policyDefinitionRevisionId: evaluation.policyDefinitionRevisionId,
        coordinateId: evaluation.coordinateId,
        currentSpendCompositionId: evaluation.currentSpendCompositionId,
        ...(evaluation.analyticsProjectionId === undefined ? {} : { analyticsProjectionId: evaluation.analyticsProjectionId }),
        ...(analyticsProjection === undefined ? {} : { analyticsProjection }),
        signalKind: evaluation.signalKind,
        evaluatedAt: evaluation.evaluatedAt,
        result: evaluation.result,
        reasonCode: evaluation.reasonCode,
        matchedThresholds: evaluation.matchedThresholds,
    };
    return ((evaluation.analyticsProjectionId === undefined
        ? analyticsProjection === undefined
        : analyticsProjection?.analyticsProjectionId === evaluation.analyticsProjectionId) &&
        (0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)(projection) === (0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)(expected));
};
exports.isFinancialPolicyEvaluationReadProjectionCompatibleV1 = isFinancialPolicyEvaluationReadProjectionCompatibleV1;
const canonicalizeFinancialPolicyEvaluationReadCurrentPointerIdentityV1 = (value) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) ||
        !(0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, [
            'schemaVersion',
            'contractVersion',
            'companyId',
            'definitionId',
            'signalKind',
            'pointerRevision',
            'definitionRevision',
            'policyDefinitionRevisionId',
            'evaluationId',
            'readProjectionId',
            'projectionArtifactDigest',
            'evaluatedAt',
            'promotedAt',
        ]) ||
        value.schemaVersion !== 1 ||
        value.contractVersion !== financialPolicyDelivery_1.FINANCIAL_POLICY_READ_CURRENT_POINTER_CONTRACT_VERSION_V1 ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.companyId) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.definitionId) ||
        typeof value.signalKind !== 'string' ||
        !SIGNAL_KINDS.has(value.signalKind) ||
        !Number.isSafeInteger(value.pointerRevision) ||
        value.pointerRevision < 1 ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.definitionRevision) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.policyDefinitionRevisionId) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.evaluationId) ||
        value.readProjectionId !== (0, financialPolicyValidation_1.createFinancialPolicyEvaluationReadProjectionIdV1)(value.evaluationId) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.projectionArtifactDigest) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIsoInstantV1)(value.evaluatedAt) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIsoInstantV1)(value.promotedAt)) {
        throw new TypeError('Invalid FinancialPolicyEvaluationReadCurrentPointerIdentityPreimageV1.');
    }
    return (0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)(value);
};
exports.canonicalizeFinancialPolicyEvaluationReadCurrentPointerIdentityV1 = canonicalizeFinancialPolicyEvaluationReadCurrentPointerIdentityV1;
const createFinancialPolicyEvaluationReadCurrentPointerDigestV1 = (value) => `sha256:${(0, sha256_1.sha256Utf8)((0, exports.canonicalizeFinancialPolicyEvaluationReadCurrentPointerIdentityV1)(value))}`;
exports.createFinancialPolicyEvaluationReadCurrentPointerDigestV1 = createFinancialPolicyEvaluationReadCurrentPointerDigestV1;
const isFinancialPolicyEvaluationReadCurrentPointerV1 = (value) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) || !Object.prototype.hasOwnProperty.call(value, 'pointerDigest'))
        return false;
    const { pointerDigest, ...identity } = value;
    try {
        return ((0, financialDataflowValidation_1.isFinancialDataflowHashV1)(pointerDigest) &&
            pointerDigest === (0, exports.createFinancialPolicyEvaluationReadCurrentPointerDigestV1)(identity));
    }
    catch {
        return false;
    }
};
exports.isFinancialPolicyEvaluationReadCurrentPointerV1 = isFinancialPolicyEvaluationReadCurrentPointerV1;
const isFinancialPolicyEvaluationReadCurrentPointerCompatibleV1 = (pointer, projection, projectionArtifactDigest) => (0, exports.isFinancialPolicyEvaluationReadCurrentPointerV1)(pointer) &&
    (0, exports.isFinancialPolicyEvaluationReadProjectionV1)(projection) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(projectionArtifactDigest) &&
    pointer.companyId === projection.companyId &&
    pointer.definitionId === projection.definitionId &&
    pointer.signalKind === projection.signalKind &&
    pointer.definitionRevision === projection.definitionRevision &&
    pointer.policyDefinitionRevisionId === projection.policyDefinitionRevisionId &&
    pointer.evaluationId === projection.evaluationId &&
    pointer.readProjectionId === projection.readProjectionId &&
    pointer.projectionArtifactDigest === projectionArtifactDigest &&
    pointer.evaluatedAt === projection.evaluatedAt;
exports.isFinancialPolicyEvaluationReadCurrentPointerCompatibleV1 = isFinancialPolicyEvaluationReadCurrentPointerCompatibleV1;
const isReadManifestIdentity = (value) => (0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) &&
    (0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, [
        'schemaVersion',
        'contractVersion',
        'companyId',
        'definitionId',
        'policyDefinitionRevisionId',
        'definitionRevision',
        'evaluationId',
        'readProjectionId',
        'signalKind',
        'projection',
        'publishedAt',
    ]) &&
    value.schemaVersion === 1 &&
    value.contractVersion === financialPolicyDelivery_1.FINANCIAL_POLICY_READ_MANIFEST_CONTRACT_VERSION_V1 &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.companyId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.definitionId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.policyDefinitionRevisionId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.definitionRevision) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.evaluationId) &&
    value.readProjectionId === (0, financialPolicyValidation_1.createFinancialPolicyEvaluationReadProjectionIdV1)(value.evaluationId) &&
    typeof value.signalKind === 'string' &&
    SIGNAL_KINDS.has(value.signalKind) &&
    (0, financialDataflowValidation_1.isFinancialDataflowJsonGzipArtifactDescriptorV1)(value.projection) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIsoInstantV1)(value.publishedAt);
const createFinancialPolicyEvaluationReadManifestDigestV1 = (value) => {
    if (!isReadManifestIdentity(value))
        throw new TypeError('Invalid FinancialPolicyEvaluationReadManifestIdentityPreimageV1.');
    return `sha256:${(0, sha256_1.sha256Utf8)((0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)(value))}`;
};
exports.createFinancialPolicyEvaluationReadManifestDigestV1 = createFinancialPolicyEvaluationReadManifestDigestV1;
const isFinancialPolicyEvaluationReadManifestV1 = (value) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) || !Object.prototype.hasOwnProperty.call(value, 'manifestDigest'))
        return false;
    const { manifestDigest, ...identity } = value;
    try {
        return ((0, financialDataflowValidation_1.isFinancialDataflowHashV1)(manifestDigest) &&
            manifestDigest === (0, exports.createFinancialPolicyEvaluationReadManifestDigestV1)(identity));
    }
    catch {
        return false;
    }
};
exports.isFinancialPolicyEvaluationReadManifestV1 = isFinancialPolicyEvaluationReadManifestV1;
const isFinancialPolicyEvaluationReadManifestCompatibleV1 = (manifest, projection, verifiedProjectionArtifactDigest) => (0, exports.isFinancialPolicyEvaluationReadManifestV1)(manifest) &&
    (0, exports.isFinancialPolicyEvaluationReadProjectionV1)(projection) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(verifiedProjectionArtifactDigest) &&
    manifest.companyId === projection.companyId &&
    manifest.definitionId === projection.definitionId &&
    manifest.policyDefinitionRevisionId === projection.policyDefinitionRevisionId &&
    manifest.definitionRevision === projection.definitionRevision &&
    manifest.evaluationId === projection.evaluationId &&
    manifest.readProjectionId === projection.readProjectionId &&
    manifest.signalKind === projection.signalKind &&
    manifest.publishedAt === projection.evaluatedAt &&
    manifest.projection.sha256 === verifiedProjectionArtifactDigest;
exports.isFinancialPolicyEvaluationReadManifestCompatibleV1 = isFinancialPolicyEvaluationReadManifestCompatibleV1;
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
const canonicalizeFinancialPolicyActionCompletionIdentityV1 = (value) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) ||
        !(0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, [
            'schemaVersion',
            'contractVersion',
            'actionAuditId',
            'evaluationId',
            'companyId',
            'destinationRefId',
            'completedAt',
            'executorVersion',
        ]) ||
        value.schemaVersion !== 1 ||
        value.contractVersion !== financialPolicyDelivery_1.FINANCIAL_POLICY_ACTION_COMPLETION_CONTRACT_VERSION_V1 ||
        !(0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.actionAuditId) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.evaluationId) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.companyId) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.destinationRefId) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIsoInstantV1)(value.completedAt) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.executorVersion)) {
        throw new TypeError('Invalid FinancialPolicyActionCompletionIdentityPreimageV1.');
    }
    return (0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)(value);
};
exports.canonicalizeFinancialPolicyActionCompletionIdentityV1 = canonicalizeFinancialPolicyActionCompletionIdentityV1;
const createFinancialPolicyActionCompletionIdV1 = (value) => `sha256:${(0, sha256_1.sha256Utf8)((0, exports.canonicalizeFinancialPolicyActionCompletionIdentityV1)(value))}`;
exports.createFinancialPolicyActionCompletionIdV1 = createFinancialPolicyActionCompletionIdV1;
const isFinancialPolicyActionCompletionV1 = (value) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) || !Object.prototype.hasOwnProperty.call(value, 'completionId'))
        return false;
    const { completionId, ...identity } = value;
    try {
        return ((0, financialDataflowValidation_1.isFinancialDataflowHashV1)(completionId) &&
            completionId === (0, exports.createFinancialPolicyActionCompletionIdV1)(identity));
    }
    catch {
        return false;
    }
};
exports.isFinancialPolicyActionCompletionV1 = isFinancialPolicyActionCompletionV1;
const isFinancialPolicyActionCompletionCompatibleV1 = (completion, evaluation, definition) => (0, exports.isFinancialPolicyActionCompletionV1)(completion) &&
    (0, financialPolicyValidation_1.isFinancialPolicyEvaluationV1)(evaluation) &&
    (0, financialPolicyValidation_1.isFinancialPolicyDefinitionRevisionV1)(definition) &&
    completion.actionAuditId === evaluation.actionAuditId &&
    completion.evaluationId === evaluation.evaluationId &&
    completion.companyId === evaluation.companyId &&
    completion.completedAt === evaluation.evaluatedAt &&
    definition.companyId === completion.companyId &&
    definition.destinationRefIds.includes(completion.destinationRefId);
exports.isFinancialPolicyActionCompletionCompatibleV1 = isFinancialPolicyActionCompletionCompatibleV1;
//# sourceMappingURL=financialPolicyDeliveryValidation.js.map