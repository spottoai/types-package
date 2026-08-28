"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFinancialAnalyticsBatchResponseCompatibleV1 = exports.isFinancialAnalyticsBatchResponseV1 = exports.isFinancialAnalyticsBatchQueryV1 = exports.isFinancialAnalyticsOutputManifestCompatibleV1 = exports.isFinancialAnalyticsOutputManifestV1 = exports.createFinancialAnalyticsOutputManifestDigestV1 = exports.isFinancialAnalyticsCurrentPointerCompatibleV1 = exports.isFinancialAnalyticsCurrentPointerV1 = exports.createFinancialAnalyticsCurrentPointerDigestV1 = exports.canonicalizeFinancialAnalyticsCurrentPointerIdentityV1 = exports.isFinancialAnalyticsJobRequestCompatibleV1 = exports.isFinancialAnalyticsJobRequestV1 = exports.createFinancialAnalyticsOutputGenerationIdV1 = exports.createFinancialAnalyticsJobRequestIdV1 = exports.canonicalizeFinancialAnalyticsJobRequestIdentityV1 = void 0;
const sha256_1 = require("../common/sha256");
const financialAnalyticsValidation_1 = require("./financialAnalyticsValidation");
const financialAnalyticsDelivery_1 = require("./financialAnalyticsDelivery");
const financialDataflowValidation_1 = require("./financialDataflowValidation");
const RESULT_KINDS = new Set(['forecast', 'trend', 'anomaly']);
const MAX_REQUESTED_OUTPUTS = 16;
const MAX_BATCH_QUERY_ITEMS = 200;
const isRequestedOutput = (value) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) ||
        !(0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, ['resultKind', 'targetCoordinate'], ['currentSpendCompositionId', 'comparisonSpendCompositionId']) ||
        !RESULT_KINDS.has(String(value.resultKind)) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowCoordinateV1)(value.targetCoordinate) ||
        value.targetCoordinate.periodRole !== 'projection-target' ||
        (value.currentSpendCompositionId !== undefined && !(0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.currentSpendCompositionId)) ||
        (value.comparisonSpendCompositionId !== undefined && !(0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.comparisonSpendCompositionId))) {
        return false;
    }
    if (value.resultKind === 'forecast')
        return value.currentSpendCompositionId !== undefined && value.comparisonSpendCompositionId === undefined;
    if (value.resultKind === 'trend')
        return value.currentSpendCompositionId !== undefined && value.comparisonSpendCompositionId !== undefined;
    return value.currentSpendCompositionId !== undefined && value.comparisonSpendCompositionId === undefined;
};
const requestedOutputKey = (value) => `${value.resultKind}\u0000${(0, financialDataflowValidation_1.createFinancialDataflowCoordinateIdV1)(value.targetCoordinate)}`;
const sameCoordinateWithRole = (target, source, sourceRole) => (0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)({ ...target, periodRole: sourceRole }) === (0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)(source);
const periodContains = (container, target) => container.period.requested.dateBasis === target.period.requested.dateBasis &&
    container.period.requested.timeZone === target.period.requested.timeZone &&
    container.period.requested.startDate <= target.period.requested.startDate &&
    container.period.requested.endDateExclusive >= target.period.requested.endDateExclusive;
const isJobRequestIdentity = (value) => (0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) &&
    (0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, [
        'schemaVersion',
        'contractVersion',
        'companyId',
        'coordinateId',
        'analyticsInputId',
        'inputGenerationId',
        'inputArtifactDigest',
        'requestedOutputs',
        'requestedAt',
    ]) &&
    value.schemaVersion === 1 &&
    value.contractVersion === financialAnalyticsDelivery_1.FINANCIAL_ANALYTICS_JOB_REQUEST_CONTRACT_VERSION_V1 &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.companyId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.coordinateId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.analyticsInputId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.inputGenerationId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.inputArtifactDigest) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIsoInstantV1)(value.requestedAt) &&
    Array.isArray(value.requestedOutputs) &&
    value.requestedOutputs.length > 0 &&
    value.requestedOutputs.length <= MAX_REQUESTED_OUTPUTS &&
    value.requestedOutputs.every(isRequestedOutput) &&
    new Set(value.requestedOutputs.map(requestedOutputKey)).size === value.requestedOutputs.length;
const canonicalizeFinancialAnalyticsJobRequestIdentityV1 = (value) => {
    if (!isJobRequestIdentity(value))
        throw new TypeError('Invalid FinancialAnalyticsJobRequestIdentityPreimageV1.');
    return (0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)({
        ...value,
        requestedOutputs: [...value.requestedOutputs].sort((left, right) => requestedOutputKey(left).localeCompare(requestedOutputKey(right))),
    });
};
exports.canonicalizeFinancialAnalyticsJobRequestIdentityV1 = canonicalizeFinancialAnalyticsJobRequestIdentityV1;
const createFinancialAnalyticsJobRequestIdV1 = (value) => `sha256:${(0, sha256_1.sha256Utf8)((0, exports.canonicalizeFinancialAnalyticsJobRequestIdentityV1)(value))}`;
exports.createFinancialAnalyticsJobRequestIdV1 = createFinancialAnalyticsJobRequestIdV1;
/** Stable immutable output generation selected by one exact job output. */
const createFinancialAnalyticsOutputGenerationIdV1 = (requestId, output) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowHashV1)(requestId) || !isRequestedOutput(output)) {
        throw new TypeError('Invalid financial analytics output generation identity.');
    }
    return `financial-analytics-${(0, sha256_1.sha256Utf8)((0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)({
        requestId,
        resultKind: output.resultKind,
        targetCoordinate: output.targetCoordinate,
    }))}`;
};
exports.createFinancialAnalyticsOutputGenerationIdV1 = createFinancialAnalyticsOutputGenerationIdV1;
const isFinancialAnalyticsJobRequestV1 = (value) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) ||
        !(0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, [
            'schemaVersion',
            'contractVersion',
            'requestId',
            'companyId',
            'coordinateId',
            'analyticsInputId',
            'inputGenerationId',
            'inputArtifactDigest',
            'requestedOutputs',
            'requestedAt',
        ]))
        return false;
    const { requestId, ...identity } = value;
    return ((0, financialDataflowValidation_1.isFinancialDataflowHashV1)(requestId) &&
        isJobRequestIdentity(identity) &&
        requestId === (0, exports.createFinancialAnalyticsJobRequestIdV1)(identity));
};
exports.isFinancialAnalyticsJobRequestV1 = isFinancialAnalyticsJobRequestV1;
/** Binds an identity-only queue request to already-verified immutable input bytes. */
const isFinancialAnalyticsJobRequestCompatibleV1 = (request, input, verifiedInputArtifactDigest) => (0, exports.isFinancialAnalyticsJobRequestV1)(request) &&
    (0, financialAnalyticsValidation_1.isFinancialAnalyticsInputSeriesV1)(input) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(verifiedInputArtifactDigest) &&
    request.companyId === input.coordinate.companyId &&
    request.coordinateId === (0, financialDataflowValidation_1.createFinancialDataflowCoordinateIdV1)(input.coordinate) &&
    request.analyticsInputId === input.analyticsInputId &&
    request.inputGenerationId === input.producerGenerationId &&
    request.inputArtifactDigest === verifiedInputArtifactDigest &&
    request.requestedOutputs.every(output => {
        const current = output.currentSpendCompositionId === undefined
            ? undefined
            : input.referenceCompositions.find(composition => composition.compositionId === output.currentSpendCompositionId);
        const comparison = output.comparisonSpendCompositionId === undefined
            ? undefined
            : input.referenceCompositions.find(composition => composition.compositionId === output.comparisonSpendCompositionId);
        return (output.targetCoordinate.companyId === input.coordinate.companyId &&
            output.targetCoordinate.provider === input.coordinate.provider &&
            (0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)(output.targetCoordinate.providerAccountRefs) ===
                (0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)(input.coordinate.providerAccountRefs) &&
            (0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)(output.targetCoordinate.scope) === (0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)(input.coordinate.scope) &&
            output.targetCoordinate.costBasis === input.coordinate.costBasis &&
            output.targetCoordinate.estimateLens === input.coordinate.estimateLens &&
            output.targetCoordinate.requestedCurrencyCode === input.coordinate.requestedCurrencyCode &&
            (0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)(output.targetCoordinate.accountingCurrency) ===
                (0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)(input.coordinate.accountingCurrency) &&
            (current === undefined || current.coordinate.periodRole === 'current-spend') &&
            (comparison === undefined || comparison.coordinate.periodRole === 'comparison') &&
            (output.currentSpendCompositionId === undefined || current !== undefined) &&
            (output.comparisonSpendCompositionId === undefined || comparison !== undefined) &&
            current !== undefined &&
            sameCoordinateWithRole(output.targetCoordinate, current.coordinate, 'current-spend') &&
            (output.resultKind !== 'anomaly' || periodContains(input.coordinate, output.targetCoordinate)));
    });
exports.isFinancialAnalyticsJobRequestCompatibleV1 = isFinancialAnalyticsJobRequestCompatibleV1;
const isCurrentPointerIdentity = (value) => (0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) &&
    (0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, [
        'schemaVersion',
        'contractVersion',
        'coordinateId',
        'resultKind',
        'sourceRequestId',
        'sourceRequestedAt',
        'analyticsInputId',
        'pointerRevision',
        'outputGenerationId',
        'analyticsProjectionId',
        'projectionArtifactDigest',
        'promotedAt',
    ]) &&
    value.schemaVersion === 1 &&
    value.contractVersion === financialAnalyticsDelivery_1.FINANCIAL_ANALYTICS_CURRENT_POINTER_CONTRACT_VERSION_V1 &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.coordinateId) &&
    typeof value.resultKind === 'string' &&
    RESULT_KINDS.has(value.resultKind) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.sourceRequestId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIsoInstantV1)(value.sourceRequestedAt) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.analyticsInputId) &&
    Number.isSafeInteger(value.pointerRevision) &&
    Number(value.pointerRevision) > 0 &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.outputGenerationId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.analyticsProjectionId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.projectionArtifactDigest) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIsoInstantV1)(value.promotedAt);
const canonicalizeFinancialAnalyticsCurrentPointerIdentityV1 = (value) => {
    if (!isCurrentPointerIdentity(value))
        throw new TypeError('Invalid FinancialAnalyticsCurrentPointerIdentityPreimageV1.');
    return (0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)(value);
};
exports.canonicalizeFinancialAnalyticsCurrentPointerIdentityV1 = canonicalizeFinancialAnalyticsCurrentPointerIdentityV1;
const createFinancialAnalyticsCurrentPointerDigestV1 = (value) => `sha256:${(0, sha256_1.sha256Utf8)((0, exports.canonicalizeFinancialAnalyticsCurrentPointerIdentityV1)(value))}`;
exports.createFinancialAnalyticsCurrentPointerDigestV1 = createFinancialAnalyticsCurrentPointerDigestV1;
const isFinancialAnalyticsCurrentPointerV1 = (value) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) || !Object.prototype.hasOwnProperty.call(value, 'pointerDigest'))
        return false;
    const { pointerDigest, ...identity } = value;
    return ((0, financialDataflowValidation_1.isFinancialDataflowHashV1)(pointerDigest) &&
        isCurrentPointerIdentity(identity) &&
        pointerDigest === (0, exports.createFinancialAnalyticsCurrentPointerDigestV1)(identity));
};
exports.isFinancialAnalyticsCurrentPointerV1 = isFinancialAnalyticsCurrentPointerV1;
/** Binds a promoted pointer to already-verified immutable projection bytes. */
const isFinancialAnalyticsCurrentPointerCompatibleV1 = (pointer, projection, verifiedProjectionArtifactDigest) => (0, exports.isFinancialAnalyticsCurrentPointerV1)(pointer) &&
    (0, financialAnalyticsValidation_1.isFinancialAnalyticsProjectionV1)(projection) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(verifiedProjectionArtifactDigest) &&
    pointer.coordinateId === (0, financialDataflowValidation_1.createFinancialDataflowCoordinateIdV1)(projection.coordinate) &&
    pointer.resultKind === (projection.status === 'unavailable' ? projection.resultKind : projection.result.kind) &&
    pointer.analyticsInputId === projection.analyticsInputId &&
    pointer.outputGenerationId === projection.outputGenerationId &&
    pointer.analyticsProjectionId === projection.analyticsProjectionId &&
    pointer.projectionArtifactDigest === verifiedProjectionArtifactDigest;
exports.isFinancialAnalyticsCurrentPointerCompatibleV1 = isFinancialAnalyticsCurrentPointerCompatibleV1;
const isOutputManifestIdentity = (value) => (0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) &&
    (0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, [
        'schemaVersion',
        'contractVersion',
        'coordinateId',
        'resultKind',
        'outputGenerationId',
        'analyticsProjectionId',
        'sourceRequestId',
        'analyticsInputId',
        'inputArtifactDigest',
        'projection',
        'publishedAt',
    ]) &&
    value.schemaVersion === 1 &&
    value.contractVersion === financialAnalyticsDelivery_1.FINANCIAL_ANALYTICS_OUTPUT_MANIFEST_CONTRACT_VERSION_V1 &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.coordinateId) &&
    typeof value.resultKind === 'string' &&
    RESULT_KINDS.has(value.resultKind) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.outputGenerationId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.analyticsProjectionId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.sourceRequestId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.analyticsInputId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.inputArtifactDigest) &&
    (0, financialDataflowValidation_1.isFinancialDataflowJsonGzipArtifactDescriptorV1)(value.projection) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIsoInstantV1)(value.publishedAt);
const createFinancialAnalyticsOutputManifestDigestV1 = (value) => {
    if (!isOutputManifestIdentity(value))
        throw new TypeError('Invalid FinancialAnalyticsOutputManifestIdentityPreimageV1.');
    return `sha256:${(0, sha256_1.sha256Utf8)((0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)(value))}`;
};
exports.createFinancialAnalyticsOutputManifestDigestV1 = createFinancialAnalyticsOutputManifestDigestV1;
const isFinancialAnalyticsOutputManifestV1 = (value) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) || !Object.prototype.hasOwnProperty.call(value, 'manifestDigest'))
        return false;
    const { manifestDigest, ...identity } = value;
    try {
        return ((0, financialDataflowValidation_1.isFinancialDataflowHashV1)(manifestDigest) &&
            manifestDigest === (0, exports.createFinancialAnalyticsOutputManifestDigestV1)(identity));
    }
    catch {
        return false;
    }
};
exports.isFinancialAnalyticsOutputManifestV1 = isFinancialAnalyticsOutputManifestV1;
const isFinancialAnalyticsOutputManifestCompatibleV1 = (manifest, projection, verifiedProjectionArtifactDigest) => (0, exports.isFinancialAnalyticsOutputManifestV1)(manifest) &&
    (0, financialAnalyticsValidation_1.isFinancialAnalyticsProjectionV1)(projection) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(verifiedProjectionArtifactDigest) &&
    manifest.coordinateId === (0, financialDataflowValidation_1.createFinancialDataflowCoordinateIdV1)(projection.coordinate) &&
    manifest.resultKind === (projection.status === 'unavailable' ? projection.resultKind : projection.result.kind) &&
    manifest.outputGenerationId === projection.outputGenerationId &&
    manifest.analyticsProjectionId === projection.analyticsProjectionId &&
    manifest.analyticsInputId === projection.analyticsInputId &&
    manifest.publishedAt === projection.producedAt &&
    manifest.projection.sha256 === verifiedProjectionArtifactDigest;
exports.isFinancialAnalyticsOutputManifestCompatibleV1 = isFinancialAnalyticsOutputManifestCompatibleV1;
const isBatchQueryItem = (value) => (0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) &&
    (0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, ['coordinateId', 'resultKind']) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.coordinateId) &&
    typeof value.resultKind === 'string' &&
    RESULT_KINDS.has(value.resultKind);
const batchQueryItemKey = (value) => `${value.coordinateId}\u0000${value.resultKind}`;
const isFinancialAnalyticsBatchQueryV1 = (value) => (0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) &&
    (0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, ['schemaVersion', 'contractVersion', 'items']) &&
    value.schemaVersion === 1 &&
    value.contractVersion === financialAnalyticsDelivery_1.FINANCIAL_ANALYTICS_BATCH_QUERY_CONTRACT_VERSION_V1 &&
    Array.isArray(value.items) &&
    value.items.length > 0 &&
    value.items.length <= MAX_BATCH_QUERY_ITEMS &&
    value.items.every(isBatchQueryItem) &&
    new Set(value.items.map(item => batchQueryItemKey(item))).size === value.items.length;
exports.isFinancialAnalyticsBatchQueryV1 = isFinancialAnalyticsBatchQueryV1;
const isFinancialAnalyticsBatchResponseV1 = (value) => (0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) &&
    (0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, ['schemaVersion', 'contractVersion', 'results']) &&
    value.schemaVersion === 1 &&
    value.contractVersion === financialAnalyticsDelivery_1.FINANCIAL_ANALYTICS_BATCH_RESPONSE_CONTRACT_VERSION_V1 &&
    Array.isArray(value.results) &&
    value.results.length > 0 &&
    value.results.length <= MAX_BATCH_QUERY_ITEMS &&
    value.results.every(result => {
        if (!(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(result) || !isBatchQueryItem(result))
            return false;
        if (result.status === 'unavailable') {
            return (0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(result, ['coordinateId', 'resultKind', 'status', 'reasonCode']) &&
                result.reasonCode === 'not-produced';
        }
        return result.status === 'available' &&
            (0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(result, ['coordinateId', 'resultKind', 'status', 'projection']) &&
            (0, financialAnalyticsValidation_1.isFinancialAnalyticsProjectionV1)(result.projection) &&
            (0, financialDataflowValidation_1.createFinancialDataflowCoordinateIdV1)(result.projection.coordinate) === result.coordinateId &&
            (result.projection.status === 'unavailable' ? result.projection.resultKind : result.projection.result.kind) === result.resultKind;
    }) &&
    new Set(value.results.map(result => batchQueryItemKey(result))).size === value.results.length;
exports.isFinancialAnalyticsBatchResponseV1 = isFinancialAnalyticsBatchResponseV1;
const isFinancialAnalyticsBatchResponseCompatibleV1 = (query, response) => (0, exports.isFinancialAnalyticsBatchQueryV1)(query) &&
    (0, exports.isFinancialAnalyticsBatchResponseV1)(response) &&
    query.items.length === response.results.length &&
    query.items.every((item, index) => {
        const result = response.results[index];
        return result !== undefined && batchQueryItemKey(item) === batchQueryItemKey(result);
    });
exports.isFinancialAnalyticsBatchResponseCompatibleV1 = isFinancialAnalyticsBatchResponseCompatibleV1;
//# sourceMappingURL=financialAnalyticsDeliveryValidation.js.map