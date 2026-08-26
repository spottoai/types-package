"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFinancialAnalyticsCurrentPointerCompatibleV1 = exports.isFinancialAnalyticsCurrentPointerV1 = exports.createFinancialAnalyticsCurrentPointerDigestV1 = exports.canonicalizeFinancialAnalyticsCurrentPointerIdentityV1 = exports.isFinancialAnalyticsJobRequestCompatibleV1 = exports.isFinancialAnalyticsJobRequestV1 = exports.createFinancialAnalyticsJobRequestIdV1 = exports.canonicalizeFinancialAnalyticsJobRequestIdentityV1 = void 0;
const sha256_1 = require("../common/sha256");
const financialAnalyticsValidation_1 = require("./financialAnalyticsValidation");
const financialAnalyticsDelivery_1 = require("./financialAnalyticsDelivery");
const financialDataflowValidation_1 = require("./financialDataflowValidation");
const RESULT_KINDS = new Set(['forecast', 'trend', 'anomaly']);
const isJobRequestIdentity = (value) => (0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) &&
    (0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, [
        'schemaVersion',
        'contractVersion',
        'companyId',
        'coordinateId',
        'analyticsInputId',
        'inputGenerationId',
        'inputArtifactDigest',
        'requestedResultKinds',
    ]) &&
    value.schemaVersion === 1 &&
    value.contractVersion === financialAnalyticsDelivery_1.FINANCIAL_ANALYTICS_JOB_REQUEST_CONTRACT_VERSION_V1 &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.companyId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.coordinateId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.analyticsInputId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.inputGenerationId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.inputArtifactDigest) &&
    (0, financialDataflowValidation_1.isFinancialDataflowSortedUniqueStringsV1)(value.requestedResultKinds, RESULT_KINDS.size) &&
    value.requestedResultKinds.length > 0 &&
    value.requestedResultKinds.every(kind => RESULT_KINDS.has(kind));
const canonicalizeFinancialAnalyticsJobRequestIdentityV1 = (value) => {
    if (!isJobRequestIdentity(value))
        throw new TypeError('Invalid FinancialAnalyticsJobRequestIdentityPreimageV1.');
    return (0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)({ ...value, requestedResultKinds: [...value.requestedResultKinds].sort() });
};
exports.canonicalizeFinancialAnalyticsJobRequestIdentityV1 = canonicalizeFinancialAnalyticsJobRequestIdentityV1;
const createFinancialAnalyticsJobRequestIdV1 = (value) => `sha256:${(0, sha256_1.sha256Utf8)((0, exports.canonicalizeFinancialAnalyticsJobRequestIdentityV1)(value))}`;
exports.createFinancialAnalyticsJobRequestIdV1 = createFinancialAnalyticsJobRequestIdV1;
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
            'requestedResultKinds',
            'requestedAt',
        ]))
        return false;
    const { requestId, requestedAt, ...identity } = value;
    return ((0, financialDataflowValidation_1.isFinancialDataflowHashV1)(requestId) &&
        (0, financialDataflowValidation_1.isFinancialDataflowIsoInstantV1)(requestedAt) &&
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
    request.inputArtifactDigest === verifiedInputArtifactDigest;
exports.isFinancialAnalyticsJobRequestCompatibleV1 = isFinancialAnalyticsJobRequestCompatibleV1;
const isCurrentPointerIdentity = (value) => (0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) &&
    (0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, [
        'schemaVersion',
        'contractVersion',
        'coordinateId',
        'pointerRevision',
        'outputGenerationId',
        'analyticsProjectionId',
        'projectionArtifactDigest',
        'promotedAt',
    ]) &&
    value.schemaVersion === 1 &&
    value.contractVersion === financialAnalyticsDelivery_1.FINANCIAL_ANALYTICS_CURRENT_POINTER_CONTRACT_VERSION_V1 &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.coordinateId) &&
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
    pointer.outputGenerationId === projection.outputGenerationId &&
    pointer.analyticsProjectionId === projection.analyticsProjectionId &&
    pointer.projectionArtifactDigest === verifiedProjectionArtifactDigest;
exports.isFinancialAnalyticsCurrentPointerCompatibleV1 = isFinancialAnalyticsCurrentPointerCompatibleV1;
//# sourceMappingURL=financialAnalyticsDeliveryValidation.js.map