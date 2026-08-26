import { sha256Utf8 } from '../common/sha256';
import { isFinancialAnalyticsInputSeriesV1, isFinancialAnalyticsProjectionV1 } from './financialAnalyticsValidation';
import {
  FINANCIAL_ANALYTICS_CURRENT_POINTER_CONTRACT_VERSION_V1,
  FINANCIAL_ANALYTICS_JOB_REQUEST_CONTRACT_VERSION_V1,
  type FinancialAnalyticsCurrentPointerIdentityPreimageV1,
  type FinancialAnalyticsCurrentPointerV1,
  type FinancialAnalyticsJobRequestIdentityPreimageV1,
  type FinancialAnalyticsJobRequestV1,
} from './financialAnalyticsDelivery';
import {
  canonicalizeFinancialDataflowJsonV1,
  createFinancialDataflowCoordinateIdV1,
  hasFinancialDataflowExactFieldsV1,
  isFinancialDataflowHashV1,
  isFinancialDataflowIdentityV1,
  isFinancialDataflowIsoInstantV1,
  isFinancialDataflowRecordV1,
  isFinancialDataflowSortedUniqueStringsV1,
} from './financialDataflowValidation';

const RESULT_KINDS = new Set(['forecast', 'trend', 'anomaly']);

const isJobRequestIdentity = (value: unknown): value is FinancialAnalyticsJobRequestIdentityPreimageV1 =>
  isFinancialDataflowRecordV1(value) &&
  hasFinancialDataflowExactFieldsV1(value, [
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
  value.contractVersion === FINANCIAL_ANALYTICS_JOB_REQUEST_CONTRACT_VERSION_V1 &&
  isFinancialDataflowIdentityV1(value.companyId) &&
  isFinancialDataflowHashV1(value.coordinateId) &&
  isFinancialDataflowHashV1(value.analyticsInputId) &&
  isFinancialDataflowIdentityV1(value.inputGenerationId) &&
  isFinancialDataflowHashV1(value.inputArtifactDigest) &&
  isFinancialDataflowSortedUniqueStringsV1(value.requestedResultKinds, RESULT_KINDS.size) &&
  value.requestedResultKinds.length > 0 &&
  value.requestedResultKinds.every(kind => RESULT_KINDS.has(kind));

export const canonicalizeFinancialAnalyticsJobRequestIdentityV1 = (value: FinancialAnalyticsJobRequestIdentityPreimageV1): string => {
  if (!isJobRequestIdentity(value)) throw new TypeError('Invalid FinancialAnalyticsJobRequestIdentityPreimageV1.');
  return canonicalizeFinancialDataflowJsonV1({ ...value, requestedResultKinds: [...value.requestedResultKinds].sort() });
};

export const createFinancialAnalyticsJobRequestIdV1 = (value: FinancialAnalyticsJobRequestIdentityPreimageV1): string =>
  `sha256:${sha256Utf8(canonicalizeFinancialAnalyticsJobRequestIdentityV1(value))}`;

export const isFinancialAnalyticsJobRequestV1 = (value: unknown): value is FinancialAnalyticsJobRequestV1 => {
  if (
    !isFinancialDataflowRecordV1(value) ||
    !hasFinancialDataflowExactFieldsV1(value, [
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
    ])
  )
    return false;
  const { requestId, requestedAt, ...identity } = value;
  return (
    isFinancialDataflowHashV1(requestId) &&
    isFinancialDataflowIsoInstantV1(requestedAt) &&
    isJobRequestIdentity(identity) &&
    requestId === createFinancialAnalyticsJobRequestIdV1(identity)
  );
};

/** Binds an identity-only queue request to already-verified immutable input bytes. */
export const isFinancialAnalyticsJobRequestCompatibleV1 = (request: unknown, input: unknown, verifiedInputArtifactDigest: unknown): boolean =>
  isFinancialAnalyticsJobRequestV1(request) &&
  isFinancialAnalyticsInputSeriesV1(input) &&
  isFinancialDataflowHashV1(verifiedInputArtifactDigest) &&
  request.companyId === input.coordinate.companyId &&
  request.coordinateId === createFinancialDataflowCoordinateIdV1(input.coordinate) &&
  request.analyticsInputId === input.analyticsInputId &&
  request.inputGenerationId === input.producerGenerationId &&
  request.inputArtifactDigest === verifiedInputArtifactDigest;

const isCurrentPointerIdentity = (value: unknown): value is FinancialAnalyticsCurrentPointerIdentityPreimageV1 =>
  isFinancialDataflowRecordV1(value) &&
  hasFinancialDataflowExactFieldsV1(value, [
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
  value.contractVersion === FINANCIAL_ANALYTICS_CURRENT_POINTER_CONTRACT_VERSION_V1 &&
  isFinancialDataflowHashV1(value.coordinateId) &&
  Number.isSafeInteger(value.pointerRevision) &&
  Number(value.pointerRevision) > 0 &&
  isFinancialDataflowIdentityV1(value.outputGenerationId) &&
  isFinancialDataflowHashV1(value.analyticsProjectionId) &&
  isFinancialDataflowHashV1(value.projectionArtifactDigest) &&
  isFinancialDataflowIsoInstantV1(value.promotedAt);

export const canonicalizeFinancialAnalyticsCurrentPointerIdentityV1 = (value: FinancialAnalyticsCurrentPointerIdentityPreimageV1): string => {
  if (!isCurrentPointerIdentity(value)) throw new TypeError('Invalid FinancialAnalyticsCurrentPointerIdentityPreimageV1.');
  return canonicalizeFinancialDataflowJsonV1(value);
};

export const createFinancialAnalyticsCurrentPointerDigestV1 = (value: FinancialAnalyticsCurrentPointerIdentityPreimageV1): string =>
  `sha256:${sha256Utf8(canonicalizeFinancialAnalyticsCurrentPointerIdentityV1(value))}`;

export const isFinancialAnalyticsCurrentPointerV1 = (value: unknown): value is FinancialAnalyticsCurrentPointerV1 => {
  if (!isFinancialDataflowRecordV1(value) || !Object.prototype.hasOwnProperty.call(value, 'pointerDigest')) return false;
  const { pointerDigest, ...identity } = value;
  return (
    isFinancialDataflowHashV1(pointerDigest) &&
    isCurrentPointerIdentity(identity) &&
    pointerDigest === createFinancialAnalyticsCurrentPointerDigestV1(identity)
  );
};

/** Binds a promoted pointer to already-verified immutable projection bytes. */
export const isFinancialAnalyticsCurrentPointerCompatibleV1 = (
  pointer: unknown,
  projection: unknown,
  verifiedProjectionArtifactDigest: unknown
): boolean =>
  isFinancialAnalyticsCurrentPointerV1(pointer) &&
  isFinancialAnalyticsProjectionV1(projection) &&
  isFinancialDataflowHashV1(verifiedProjectionArtifactDigest) &&
  pointer.coordinateId === createFinancialDataflowCoordinateIdV1(projection.coordinate) &&
  pointer.outputGenerationId === projection.outputGenerationId &&
  pointer.analyticsProjectionId === projection.analyticsProjectionId &&
  pointer.projectionArtifactDigest === verifiedProjectionArtifactDigest;
