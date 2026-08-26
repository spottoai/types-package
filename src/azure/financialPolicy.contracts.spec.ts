import {
  FINANCIAL_POLICY_DEFINITION_CONTRACT_VERSION_V1,
  FINANCIAL_POLICY_EVALUATION_CONTRACT_VERSION_V1,
  createFinancialPolicyDefinitionRevisionIdV1,
  createFinancialPolicyEvaluationIdV1,
  createFinancialPolicyEvaluationReadProjectionIdV1,
  createFinancialPolicyEvaluationActionAuditIdV1,
  isFinancialPolicyDefinitionRevisionV1,
  isFinancialPolicyEvaluationV1,
  type FinancialPolicyDefinitionRevisionV1,
  type FinancialPolicyDefinitionRevisionIdentityPreimageV1,
  type FinancialPolicyEvaluationV1,
  type FinancialPolicyEvaluationIdentityPreimageV1,
} from '../index.js';

const definitionWithoutId: FinancialPolicyDefinitionRevisionIdentityPreimageV1 = {
  schemaVersion: 1,
  contractVersion: FINANCIAL_POLICY_DEFINITION_CONTRACT_VERSION_V1,
  companyId: 'company-1',
  definitionId: 'budget-definition-1',
  revision: '7',
  effectiveState: 'enabled',
  coordinateRequest: {
    provider: 'azure',
    providerAccountRefs: ['azure-subscription:sub-1'],
    scope: {
      kind: 'subscription',
      scopeId: 'azure-subscription:sub-1',
      scopeFingerprint: `sha256:${'1'.repeat(64)}`,
    },
    period: { kind: 'calendar-month', timeZone: 'Pacific/Auckland' },
    costBasis: 'billed',
    estimateLens: 'include-estimates',
    requiredAccountingCurrencyCode: 'AUD',
  },
  criteria: {
    kind: 'budget',
    budget: { amount: '400', currencyCode: 'AUD' },
    currentSpendThresholds: { amounts: ['350'], percents: ['80', '100'] },
    forecastThresholds: { amounts: ['410'], percents: ['100'] },
  },
  schedule: { cadenceMinutes: 60 },
  destinationRefIds: ['destination-ref-1'],
  destinationsDigest: `sha256:${'2'.repeat(64)}`,
  authoredAt: '2026-08-09T00:00:00.000Z',
  authoredByUserId: 'user-1',
};

const definition: FinancialPolicyDefinitionRevisionV1 = {
  ...definitionWithoutId,
  policyDefinitionRevisionId: createFinancialPolicyDefinitionRevisionIdV1(definitionWithoutId),
};

const evaluationWithoutId: FinancialPolicyEvaluationIdentityPreimageV1 = {
  schemaVersion: 1,
  contractVersion: FINANCIAL_POLICY_EVALUATION_CONTRACT_VERSION_V1,
  companyId: definition.companyId,
  policyDefinitionRevisionId: definition.policyDefinitionRevisionId,
  definitionId: definition.definitionId,
  definitionRevision: definition.revision,
  coordinateId: `sha256:${'3'.repeat(64)}`,
  currentSpendCompositionId: `sha256:${'4'.repeat(64)}`,
  analyticsProjectionId: `sha256:${'5'.repeat(64)}`,
  signalKind: 'budget-forecast',
  evaluatedAt: '2026-08-10T00:01:00.000Z',
  policyAlgorithmVersion: 'financial-policy-evaluator/v1',
  result: 'matched',
  reasonCode: 'forecast-threshold-amount-matched',
  matchedThresholds: [{ thresholdKind: 'amount', configuredValue: '410' }],
};

const evaluationId = createFinancialPolicyEvaluationIdV1(evaluationWithoutId);
const evaluation: FinancialPolicyEvaluationV1 = {
  ...evaluationWithoutId,
  evaluationId,
  readProjectionId: createFinancialPolicyEvaluationReadProjectionIdV1(evaluationId),
  actionAuditId: createFinancialPolicyEvaluationActionAuditIdV1(evaluationId),
};

// @ts-expect-error forecast evaluation requires an analytics projection identity.
const forecastWithoutProjection: FinancialPolicyEvaluationV1 = {
  ...evaluation,
  analyticsProjectionId: undefined,
};

void isFinancialPolicyDefinitionRevisionV1(definition);
void isFinancialPolicyEvaluationV1(evaluation);
void forecastWithoutProjection;
