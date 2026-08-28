import { sha256Utf8 } from '../common/sha256.js';
import { isFinancialAnalyticsInputSeriesV1, isFinancialAnalyticsProjectionV1 } from './financialAnalyticsValidation.js';
import { FINANCIAL_ANALYTICS_CURRENT_POINTER_CONTRACT_VERSION_V1, FINANCIAL_ANALYTICS_BATCH_QUERY_CONTRACT_VERSION_V1, FINANCIAL_ANALYTICS_BATCH_RESPONSE_CONTRACT_VERSION_V1, FINANCIAL_ANALYTICS_JOB_REQUEST_CONTRACT_VERSION_V1, FINANCIAL_ANALYTICS_OUTPUT_MANIFEST_CONTRACT_VERSION_V1, } from './financialAnalyticsDelivery.js';
import { canonicalizeFinancialDataflowJsonV1, createFinancialDataflowCoordinateIdV1, hasFinancialDataflowExactFieldsV1, isFinancialDataflowHashV1, isFinancialDataflowIdentityV1, isFinancialDataflowIsoInstantV1, isFinancialDataflowJsonGzipArtifactDescriptorV1, isFinancialDataflowRecordV1, isFinancialDataflowCoordinateV1, } from './financialDataflowValidation.js';
const RESULT_KINDS = new Set(['forecast', 'trend', 'anomaly']);
const MAX_REQUESTED_OUTPUTS = 16;
const MAX_BATCH_QUERY_ITEMS = 200;
const isRequestedOutput = (value) => {
    if (!isFinancialDataflowRecordV1(value) ||
        !hasFinancialDataflowExactFieldsV1(value, ['resultKind', 'targetCoordinate'], ['currentSpendCompositionId', 'comparisonSpendCompositionId']) ||
        !RESULT_KINDS.has(String(value.resultKind)) ||
        !isFinancialDataflowCoordinateV1(value.targetCoordinate) ||
        value.targetCoordinate.periodRole !== 'projection-target' ||
        (value.currentSpendCompositionId !== undefined && !isFinancialDataflowHashV1(value.currentSpendCompositionId)) ||
        (value.comparisonSpendCompositionId !== undefined && !isFinancialDataflowHashV1(value.comparisonSpendCompositionId))) {
        return false;
    }
    if (value.resultKind === 'forecast')
        return value.currentSpendCompositionId !== undefined && value.comparisonSpendCompositionId === undefined;
    if (value.resultKind === 'trend')
        return value.currentSpendCompositionId !== undefined && value.comparisonSpendCompositionId !== undefined;
    return value.currentSpendCompositionId !== undefined && value.comparisonSpendCompositionId === undefined;
};
const requestedOutputKey = (value) => `${value.resultKind}\u0000${createFinancialDataflowCoordinateIdV1(value.targetCoordinate)}`;
const sameCoordinateWithRole = (target, source, sourceRole) => canonicalizeFinancialDataflowJsonV1({ ...target, periodRole: sourceRole }) === canonicalizeFinancialDataflowJsonV1(source);
const periodContains = (container, target) => container.period.requested.dateBasis === target.period.requested.dateBasis &&
    container.period.requested.timeZone === target.period.requested.timeZone &&
    container.period.requested.startDate <= target.period.requested.startDate &&
    container.period.requested.endDateExclusive >= target.period.requested.endDateExclusive;
const isJobRequestIdentity = (value) => isFinancialDataflowRecordV1(value) &&
    hasFinancialDataflowExactFieldsV1(value, [
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
    value.contractVersion === FINANCIAL_ANALYTICS_JOB_REQUEST_CONTRACT_VERSION_V1 &&
    isFinancialDataflowIdentityV1(value.companyId) &&
    isFinancialDataflowHashV1(value.coordinateId) &&
    isFinancialDataflowHashV1(value.analyticsInputId) &&
    isFinancialDataflowIdentityV1(value.inputGenerationId) &&
    isFinancialDataflowHashV1(value.inputArtifactDigest) &&
    isFinancialDataflowIsoInstantV1(value.requestedAt) &&
    Array.isArray(value.requestedOutputs) &&
    value.requestedOutputs.length > 0 &&
    value.requestedOutputs.length <= MAX_REQUESTED_OUTPUTS &&
    value.requestedOutputs.every(isRequestedOutput) &&
    new Set(value.requestedOutputs.map(requestedOutputKey)).size === value.requestedOutputs.length;
export const canonicalizeFinancialAnalyticsJobRequestIdentityV1 = (value) => {
    if (!isJobRequestIdentity(value))
        throw new TypeError('Invalid FinancialAnalyticsJobRequestIdentityPreimageV1.');
    return canonicalizeFinancialDataflowJsonV1({
        ...value,
        requestedOutputs: [...value.requestedOutputs].sort((left, right) => requestedOutputKey(left).localeCompare(requestedOutputKey(right))),
    });
};
export const createFinancialAnalyticsJobRequestIdV1 = (value) => `sha256:${sha256Utf8(canonicalizeFinancialAnalyticsJobRequestIdentityV1(value))}`;
/** Stable immutable output generation selected by one exact job output. */
export const createFinancialAnalyticsOutputGenerationIdV1 = (requestId, output) => {
    if (!isFinancialDataflowHashV1(requestId) || !isRequestedOutput(output)) {
        throw new TypeError('Invalid financial analytics output generation identity.');
    }
    return `financial-analytics-${sha256Utf8(canonicalizeFinancialDataflowJsonV1({
        requestId,
        resultKind: output.resultKind,
        targetCoordinate: output.targetCoordinate,
    }))}`;
};
export const isFinancialAnalyticsJobRequestV1 = (value) => {
    if (!isFinancialDataflowRecordV1(value) ||
        !hasFinancialDataflowExactFieldsV1(value, [
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
    return (isFinancialDataflowHashV1(requestId) &&
        isJobRequestIdentity(identity) &&
        requestId === createFinancialAnalyticsJobRequestIdV1(identity));
};
/** Binds an identity-only queue request to already-verified immutable input bytes. */
export const isFinancialAnalyticsJobRequestCompatibleV1 = (request, input, verifiedInputArtifactDigest) => isFinancialAnalyticsJobRequestV1(request) &&
    isFinancialAnalyticsInputSeriesV1(input) &&
    isFinancialDataflowHashV1(verifiedInputArtifactDigest) &&
    request.companyId === input.coordinate.companyId &&
    request.coordinateId === createFinancialDataflowCoordinateIdV1(input.coordinate) &&
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
            canonicalizeFinancialDataflowJsonV1(output.targetCoordinate.providerAccountRefs) ===
                canonicalizeFinancialDataflowJsonV1(input.coordinate.providerAccountRefs) &&
            canonicalizeFinancialDataflowJsonV1(output.targetCoordinate.scope) === canonicalizeFinancialDataflowJsonV1(input.coordinate.scope) &&
            output.targetCoordinate.costBasis === input.coordinate.costBasis &&
            output.targetCoordinate.estimateLens === input.coordinate.estimateLens &&
            output.targetCoordinate.requestedCurrencyCode === input.coordinate.requestedCurrencyCode &&
            canonicalizeFinancialDataflowJsonV1(output.targetCoordinate.accountingCurrency) ===
                canonicalizeFinancialDataflowJsonV1(input.coordinate.accountingCurrency) &&
            (current === undefined || current.coordinate.periodRole === 'current-spend') &&
            (comparison === undefined || comparison.coordinate.periodRole === 'comparison') &&
            (output.currentSpendCompositionId === undefined || current !== undefined) &&
            (output.comparisonSpendCompositionId === undefined || comparison !== undefined) &&
            current !== undefined &&
            sameCoordinateWithRole(output.targetCoordinate, current.coordinate, 'current-spend') &&
            (output.resultKind !== 'anomaly' || periodContains(input.coordinate, output.targetCoordinate)));
    });
const isCurrentPointerIdentity = (value) => isFinancialDataflowRecordV1(value) &&
    hasFinancialDataflowExactFieldsV1(value, [
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
    value.contractVersion === FINANCIAL_ANALYTICS_CURRENT_POINTER_CONTRACT_VERSION_V1 &&
    isFinancialDataflowHashV1(value.coordinateId) &&
    typeof value.resultKind === 'string' &&
    RESULT_KINDS.has(value.resultKind) &&
    isFinancialDataflowHashV1(value.sourceRequestId) &&
    isFinancialDataflowIsoInstantV1(value.sourceRequestedAt) &&
    isFinancialDataflowHashV1(value.analyticsInputId) &&
    Number.isSafeInteger(value.pointerRevision) &&
    Number(value.pointerRevision) > 0 &&
    isFinancialDataflowIdentityV1(value.outputGenerationId) &&
    isFinancialDataflowHashV1(value.analyticsProjectionId) &&
    isFinancialDataflowHashV1(value.projectionArtifactDigest) &&
    isFinancialDataflowIsoInstantV1(value.promotedAt);
export const canonicalizeFinancialAnalyticsCurrentPointerIdentityV1 = (value) => {
    if (!isCurrentPointerIdentity(value))
        throw new TypeError('Invalid FinancialAnalyticsCurrentPointerIdentityPreimageV1.');
    return canonicalizeFinancialDataflowJsonV1(value);
};
export const createFinancialAnalyticsCurrentPointerDigestV1 = (value) => `sha256:${sha256Utf8(canonicalizeFinancialAnalyticsCurrentPointerIdentityV1(value))}`;
export const isFinancialAnalyticsCurrentPointerV1 = (value) => {
    if (!isFinancialDataflowRecordV1(value) || !Object.prototype.hasOwnProperty.call(value, 'pointerDigest'))
        return false;
    const { pointerDigest, ...identity } = value;
    return (isFinancialDataflowHashV1(pointerDigest) &&
        isCurrentPointerIdentity(identity) &&
        pointerDigest === createFinancialAnalyticsCurrentPointerDigestV1(identity));
};
/** Binds a promoted pointer to already-verified immutable projection bytes. */
export const isFinancialAnalyticsCurrentPointerCompatibleV1 = (pointer, projection, verifiedProjectionArtifactDigest) => isFinancialAnalyticsCurrentPointerV1(pointer) &&
    isFinancialAnalyticsProjectionV1(projection) &&
    isFinancialDataflowHashV1(verifiedProjectionArtifactDigest) &&
    pointer.coordinateId === createFinancialDataflowCoordinateIdV1(projection.coordinate) &&
    pointer.resultKind === (projection.status === 'unavailable' ? projection.resultKind : projection.result.kind) &&
    pointer.analyticsInputId === projection.analyticsInputId &&
    pointer.outputGenerationId === projection.outputGenerationId &&
    pointer.analyticsProjectionId === projection.analyticsProjectionId &&
    pointer.projectionArtifactDigest === verifiedProjectionArtifactDigest;
const isOutputManifestIdentity = (value) => isFinancialDataflowRecordV1(value) &&
    hasFinancialDataflowExactFieldsV1(value, [
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
    value.contractVersion === FINANCIAL_ANALYTICS_OUTPUT_MANIFEST_CONTRACT_VERSION_V1 &&
    isFinancialDataflowHashV1(value.coordinateId) &&
    typeof value.resultKind === 'string' &&
    RESULT_KINDS.has(value.resultKind) &&
    isFinancialDataflowIdentityV1(value.outputGenerationId) &&
    isFinancialDataflowHashV1(value.analyticsProjectionId) &&
    isFinancialDataflowHashV1(value.sourceRequestId) &&
    isFinancialDataflowHashV1(value.analyticsInputId) &&
    isFinancialDataflowHashV1(value.inputArtifactDigest) &&
    isFinancialDataflowJsonGzipArtifactDescriptorV1(value.projection) &&
    isFinancialDataflowIsoInstantV1(value.publishedAt);
export const createFinancialAnalyticsOutputManifestDigestV1 = (value) => {
    if (!isOutputManifestIdentity(value))
        throw new TypeError('Invalid FinancialAnalyticsOutputManifestIdentityPreimageV1.');
    return `sha256:${sha256Utf8(canonicalizeFinancialDataflowJsonV1(value))}`;
};
export const isFinancialAnalyticsOutputManifestV1 = (value) => {
    if (!isFinancialDataflowRecordV1(value) || !Object.prototype.hasOwnProperty.call(value, 'manifestDigest'))
        return false;
    const { manifestDigest, ...identity } = value;
    try {
        return (isFinancialDataflowHashV1(manifestDigest) &&
            manifestDigest === createFinancialAnalyticsOutputManifestDigestV1(identity));
    }
    catch {
        return false;
    }
};
export const isFinancialAnalyticsOutputManifestCompatibleV1 = (manifest, projection, verifiedProjectionArtifactDigest) => isFinancialAnalyticsOutputManifestV1(manifest) &&
    isFinancialAnalyticsProjectionV1(projection) &&
    isFinancialDataflowHashV1(verifiedProjectionArtifactDigest) &&
    manifest.coordinateId === createFinancialDataflowCoordinateIdV1(projection.coordinate) &&
    manifest.resultKind === (projection.status === 'unavailable' ? projection.resultKind : projection.result.kind) &&
    manifest.outputGenerationId === projection.outputGenerationId &&
    manifest.analyticsProjectionId === projection.analyticsProjectionId &&
    manifest.analyticsInputId === projection.analyticsInputId &&
    manifest.publishedAt === projection.producedAt &&
    manifest.projection.sha256 === verifiedProjectionArtifactDigest;
const isBatchQueryItem = (value) => isFinancialDataflowRecordV1(value) &&
    hasFinancialDataflowExactFieldsV1(value, ['coordinateId', 'resultKind']) &&
    isFinancialDataflowHashV1(value.coordinateId) &&
    typeof value.resultKind === 'string' &&
    RESULT_KINDS.has(value.resultKind);
const batchQueryItemKey = (value) => `${value.coordinateId}\u0000${value.resultKind}`;
export const isFinancialAnalyticsBatchQueryV1 = (value) => isFinancialDataflowRecordV1(value) &&
    hasFinancialDataflowExactFieldsV1(value, ['schemaVersion', 'contractVersion', 'items']) &&
    value.schemaVersion === 1 &&
    value.contractVersion === FINANCIAL_ANALYTICS_BATCH_QUERY_CONTRACT_VERSION_V1 &&
    Array.isArray(value.items) &&
    value.items.length > 0 &&
    value.items.length <= MAX_BATCH_QUERY_ITEMS &&
    value.items.every(isBatchQueryItem) &&
    new Set(value.items.map(item => batchQueryItemKey(item))).size === value.items.length;
export const isFinancialAnalyticsBatchResponseV1 = (value) => isFinancialDataflowRecordV1(value) &&
    hasFinancialDataflowExactFieldsV1(value, ['schemaVersion', 'contractVersion', 'results']) &&
    value.schemaVersion === 1 &&
    value.contractVersion === FINANCIAL_ANALYTICS_BATCH_RESPONSE_CONTRACT_VERSION_V1 &&
    Array.isArray(value.results) &&
    value.results.length > 0 &&
    value.results.length <= MAX_BATCH_QUERY_ITEMS &&
    value.results.every(result => {
        if (!isFinancialDataflowRecordV1(result) || !isBatchQueryItem(result))
            return false;
        if (result.status === 'unavailable') {
            return hasFinancialDataflowExactFieldsV1(result, ['coordinateId', 'resultKind', 'status', 'reasonCode']) &&
                result.reasonCode === 'not-produced';
        }
        return result.status === 'available' &&
            hasFinancialDataflowExactFieldsV1(result, ['coordinateId', 'resultKind', 'status', 'projection']) &&
            isFinancialAnalyticsProjectionV1(result.projection) &&
            createFinancialDataflowCoordinateIdV1(result.projection.coordinate) === result.coordinateId &&
            (result.projection.status === 'unavailable' ? result.projection.resultKind : result.projection.result.kind) === result.resultKind;
    }) &&
    new Set(value.results.map(result => batchQueryItemKey(result))).size === value.results.length;
export const isFinancialAnalyticsBatchResponseCompatibleV1 = (query, response) => isFinancialAnalyticsBatchQueryV1(query) &&
    isFinancialAnalyticsBatchResponseV1(response) &&
    query.items.length === response.results.length &&
    query.items.every((item, index) => {
        const result = response.results[index];
        return result !== undefined && batchQueryItemKey(item) === batchQueryItemKey(result);
    });
