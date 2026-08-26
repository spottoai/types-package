import {
  FINANCIAL_ANALYTICS_CURRENT_POINTER_CONTRACT_VERSION_V1,
  FINANCIAL_ANALYTICS_INPUT_LOGICAL_NAME_V1,
  FINANCIAL_ANALYTICS_JOB_REQUEST_CONTRACT_VERSION_V1,
  FINANCIAL_ANALYTICS_PROJECTION_LOGICAL_NAME_V1,
  createFinancialAnalyticsCurrentPointerDigestV1,
  createFinancialAnalyticsJobRequestIdV1,
  isFinancialAnalyticsCurrentPointerV1,
  isFinancialAnalyticsCurrentPointerCompatibleV1,
  isFinancialAnalyticsJobRequestV1,
  isFinancialAnalyticsJobRequestCompatibleV1,
  type FinancialAnalyticsCurrentPointerV1,
  type FinancialAnalyticsCurrentPointerIdentityPreimageV1,
  type FinancialAnalyticsJobRequestIdentityPreimageV1,
  type FinancialAnalyticsJobRequestV1,
} from '../index.js';

const requestWithoutId: FinancialAnalyticsJobRequestIdentityPreimageV1 = {
  schemaVersion: 1,
  contractVersion: FINANCIAL_ANALYTICS_JOB_REQUEST_CONTRACT_VERSION_V1,
  companyId: 'company-1',
  coordinateId: `sha256:${'1'.repeat(64)}`,
  analyticsInputId: `sha256:${'2'.repeat(64)}`,
  inputGenerationId: 'generation-1',
  inputArtifactDigest: `sha256:${'3'.repeat(64)}`,
  requestedResultKinds: ['forecast'],
};

const request: FinancialAnalyticsJobRequestV1 = {
  ...requestWithoutId,
  requestId: createFinancialAnalyticsJobRequestIdV1(requestWithoutId),
  requestedAt: '2026-08-10T00:00:00.000Z',
};

const pointerWithoutDigest: FinancialAnalyticsCurrentPointerIdentityPreimageV1 = {
  schemaVersion: 1,
  contractVersion: FINANCIAL_ANALYTICS_CURRENT_POINTER_CONTRACT_VERSION_V1,
  coordinateId: request.coordinateId,
  pointerRevision: 2,
  outputGenerationId: 'generation-2',
  analyticsProjectionId: `sha256:${'4'.repeat(64)}`,
  projectionArtifactDigest: `sha256:${'5'.repeat(64)}`,
  promotedAt: '2026-08-10T00:05:00.000Z',
};

const pointer: FinancialAnalyticsCurrentPointerV1 = {
  ...pointerWithoutDigest,
  pointerDigest: createFinancialAnalyticsCurrentPointerDigestV1(pointerWithoutDigest),
};

void FINANCIAL_ANALYTICS_INPUT_LOGICAL_NAME_V1;
void FINANCIAL_ANALYTICS_PROJECTION_LOGICAL_NAME_V1;
void isFinancialAnalyticsJobRequestV1(request);
void isFinancialAnalyticsCurrentPointerV1(pointer);
void isFinancialAnalyticsJobRequestCompatibleV1;
void isFinancialAnalyticsCurrentPointerCompatibleV1;
