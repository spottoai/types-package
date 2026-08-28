import {
  FINANCIAL_POLICY_ACTION_ATTEMPT_CONTRACT_VERSION_V1,
  FINANCIAL_POLICY_DEFINITION_COMMAND_CONTRACT_VERSION_V1,
  FINANCIAL_POLICY_READ_PROJECTION_CONTRACT_VERSION_V1,
  FINANCIAL_POLICY_READ_CURRENT_POINTER_CONTRACT_VERSION_V1,
  createFinancialPolicyActionAttemptIdV1,
  createFinancialPolicyEvaluationReadCurrentPointerDigestV1,
  isFinancialPolicyActionAttemptV1,
  isFinancialPolicyDefinitionCommandV1,
  isFinancialPolicyEvaluationReadProjectionV1,
  isFinancialPolicyEvaluationReadCurrentPointerV1,
  type FinancialPolicyActionAttemptIdentityPreimageV1,
  type FinancialPolicyActionAttemptV1,
  type FinancialPolicyEvaluationReadProjectionV1,
} from '../index.js';

void isFinancialPolicyDefinitionCommandV1({
  schemaVersion: 1,
  contractVersion: FINANCIAL_POLICY_DEFINITION_COMMAND_CONTRACT_VERSION_V1,
  displayName: 'Monthly budget',
  effectiveState: 'enabled',
  coordinateRequest: {},
  criteria: {},
  schedule: { cadenceMinutes: 60 },
  destinationRefIds: [],
});

const readProjection: FinancialPolicyEvaluationReadProjectionV1 = {
  schemaVersion: 1,
  contractVersion: FINANCIAL_POLICY_READ_PROJECTION_CONTRACT_VERSION_V1,
  readProjectionId: `sha256:${'1'.repeat(64)}:read`,
  evaluationId: `sha256:${'1'.repeat(64)}`,
  companyId: 'company-1',
  definitionId: 'budget-1',
  definitionRevision: '7',
  policyDefinitionRevisionId: `sha256:${'5'.repeat(64)}`,
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

const pointerIdentity = {
  schemaVersion: 1 as const,
  contractVersion: FINANCIAL_POLICY_READ_CURRENT_POINTER_CONTRACT_VERSION_V1,
  companyId: readProjection.companyId,
  definitionId: readProjection.definitionId,
  signalKind: readProjection.signalKind,
  pointerRevision: 1,
  definitionRevision: readProjection.definitionRevision,
  policyDefinitionRevisionId: readProjection.policyDefinitionRevisionId,
  evaluationId: readProjection.evaluationId,
  readProjectionId: readProjection.readProjectionId,
  projectionArtifactDigest: `sha256:${'6'.repeat(64)}`,
  evaluatedAt: readProjection.evaluatedAt,
  promotedAt: '2026-08-10T00:02:00.000Z',
};
const pointer = {
  ...pointerIdentity,
  pointerDigest: createFinancialPolicyEvaluationReadCurrentPointerDigestV1(pointerIdentity),
};

void isFinancialPolicyEvaluationReadProjectionV1(readProjection);
void isFinancialPolicyActionAttemptV1(attempt);
void isFinancialPolicyEvaluationReadCurrentPointerV1(pointer);
