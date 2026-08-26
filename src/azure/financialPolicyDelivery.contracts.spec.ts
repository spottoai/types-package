import {
  FINANCIAL_POLICY_ACTION_ATTEMPT_CONTRACT_VERSION_V1,
  FINANCIAL_POLICY_READ_PROJECTION_CONTRACT_VERSION_V1,
  createFinancialPolicyActionAttemptIdV1,
  isFinancialPolicyActionAttemptV1,
  isFinancialPolicyEvaluationReadProjectionV1,
  type FinancialPolicyActionAttemptIdentityPreimageV1,
  type FinancialPolicyActionAttemptV1,
  type FinancialPolicyEvaluationReadProjectionV1,
} from '../index.js';

const readProjection: FinancialPolicyEvaluationReadProjectionV1 = {
  schemaVersion: 1,
  contractVersion: FINANCIAL_POLICY_READ_PROJECTION_CONTRACT_VERSION_V1,
  readProjectionId: `sha256:${'1'.repeat(64)}:read`,
  evaluationId: `sha256:${'1'.repeat(64)}`,
  companyId: 'company-1',
  definitionId: 'budget-1',
  definitionRevision: '7',
  coordinateId: `sha256:${'2'.repeat(64)}`,
  currentSpendCompositionId: `sha256:${'3'.repeat(64)}`,
  analyticsProjectionId: `sha256:${'4'.repeat(64)}`,
  signalKind: 'budget-forecast',
  evaluatedAt: '2026-08-10T00:01:00.000Z',
  result: 'matched',
  reasonCode: 'forecast-threshold-amount-matched',
  matchedThresholds: [{ thresholdKind: 'amount', configuredValue: '410' }],
};

const attemptWithoutId: FinancialPolicyActionAttemptIdentityPreimageV1 = {
  schemaVersion: 1,
  contractVersion: FINANCIAL_POLICY_ACTION_ATTEMPT_CONTRACT_VERSION_V1,
  actionAuditId: `${readProjection.evaluationId}:action`,
  evaluationId: readProjection.evaluationId,
  companyId: readProjection.companyId,
  destinationRefId: 'destination-ref-1',
  attemptNumber: 2,
  attemptedAt: '2026-08-10T00:02:00.000Z',
  status: 'retryable-failure',
  reasonCode: 'destination-temporarily-unavailable',
  executorVersion: 'financial-policy-action/v1',
};

const attempt: FinancialPolicyActionAttemptV1 = {
  ...attemptWithoutId,
  actionAttemptId: createFinancialPolicyActionAttemptIdV1(attemptWithoutId),
};

void isFinancialPolicyEvaluationReadProjectionV1(readProjection);
void isFinancialPolicyActionAttemptV1(attempt);
