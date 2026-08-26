import { sha256Utf8 } from '../common/sha256';
import { parseCanonicalDecimal } from '../common/exactDecimal';
import { isCanonicalExactMoney } from './financialValidationPrimitives';
import type { FinancialPolicyDefinitionRevisionV1, FinancialPolicyEvaluationV1 } from './financialPolicy';
import {
  FINANCIAL_POLICY_ACTION_ATTEMPT_CONTRACT_VERSION_V1,
  FINANCIAL_POLICY_READ_PROJECTION_CONTRACT_VERSION_V1,
  type FinancialPolicyActionAttemptIdentityPreimageV1,
  type FinancialPolicyActionAttemptV1,
  type FinancialPolicyEvaluationReadProjectionV1,
} from './financialPolicyDelivery';
import {
  canonicalizeFinancialDataflowJsonV1,
  hasFinancialDataflowExactFieldsV1,
  isFinancialDataflowHashV1,
  isFinancialDataflowIdentityV1,
  isFinancialDataflowIsoInstantV1,
  isFinancialDataflowRecordV1,
} from './financialDataflowValidation';
import {
  createFinancialPolicyEvaluationActionAuditIdV1,
  createFinancialPolicyEvaluationReadProjectionIdV1,
  isFinancialPolicyDefinitionRevisionV1,
  isFinancialPolicyEvaluationV1,
} from './financialPolicyValidation';

const SIGNAL_KINDS = new Set(['budget-current-spend', 'budget-forecast', 'cost-anomaly']);
const RESULTS = new Set(['matched', 'not-matched', 'partial', 'unavailable']);
const ACTION_STATUSES = new Set(['succeeded', 'retryable-failure', 'terminal-failure']);

const isNonNegativeDecimal = (value: unknown): value is string => {
  if (typeof value !== 'string' || !isCanonicalExactMoney({ amount: value, currencyCode: 'AUD' })) return false;
  try {
    return parseCanonicalDecimal(value).coefficient >= 0n;
  } catch {
    return false;
  }
};

const isMatchedThresholds = (value: unknown): boolean =>
  Array.isArray(value) &&
  value.length <= 64 &&
  value.every(
    threshold =>
      isFinancialDataflowRecordV1(threshold) &&
      hasFinancialDataflowExactFieldsV1(threshold, ['thresholdKind', 'configuredValue']) &&
      ['amount', 'percent', 'minimum-amount', 'minimum-delta', 'minimum-percent-change'].includes(String(threshold.thresholdKind)) &&
      isNonNegativeDecimal(threshold.configuredValue)
  ) &&
  new Set(value.map(threshold => `${String(threshold.thresholdKind)}\u0000${String(threshold.configuredValue)}`)).size === value.length;

export const isFinancialPolicyEvaluationReadProjectionV1 = (value: unknown): value is FinancialPolicyEvaluationReadProjectionV1 =>
  isFinancialDataflowRecordV1(value) &&
  hasFinancialDataflowExactFieldsV1(
    value,
    [
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
    ],
    ['analyticsProjectionId']
  ) &&
  value.schemaVersion === 1 &&
  value.contractVersion === FINANCIAL_POLICY_READ_PROJECTION_CONTRACT_VERSION_V1 &&
  isFinancialDataflowHashV1(value.evaluationId) &&
  value.readProjectionId === createFinancialPolicyEvaluationReadProjectionIdV1(value.evaluationId) &&
  isFinancialDataflowIdentityV1(value.companyId) &&
  isFinancialDataflowIdentityV1(value.definitionId) &&
  isFinancialDataflowIdentityV1(value.definitionRevision) &&
  isFinancialDataflowHashV1(value.coordinateId) &&
  isFinancialDataflowHashV1(value.currentSpendCompositionId) &&
  (value.analyticsProjectionId === undefined || isFinancialDataflowHashV1(value.analyticsProjectionId)) &&
  typeof value.signalKind === 'string' &&
  SIGNAL_KINDS.has(value.signalKind) &&
  (value.signalKind === 'budget-current-spend' ? value.analyticsProjectionId === undefined : value.analyticsProjectionId !== undefined) &&
  isFinancialDataflowIsoInstantV1(value.evaluatedAt) &&
  typeof value.result === 'string' &&
  RESULTS.has(value.result) &&
  isFinancialDataflowIdentityV1(value.reasonCode) &&
  isMatchedThresholds(value.matchedThresholds) &&
  Array.isArray(value.matchedThresholds) &&
  (value.result === 'matched' ? value.matchedThresholds.length > 0 : value.matchedThresholds.length === 0);

export const isFinancialPolicyEvaluationReadProjectionCompatibleV1 = (projection: unknown, evaluation: unknown): boolean => {
  if (!isFinancialPolicyEvaluationReadProjectionV1(projection) || !isFinancialPolicyEvaluationV1(evaluation)) return false;
  const expected: FinancialPolicyEvaluationReadProjectionV1 = {
    schemaVersion: 1,
    contractVersion: FINANCIAL_POLICY_READ_PROJECTION_CONTRACT_VERSION_V1,
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
  return canonicalizeFinancialDataflowJsonV1(projection) === canonicalizeFinancialDataflowJsonV1(expected);
};

const isActionAttemptIdentity = (value: unknown): value is FinancialPolicyActionAttemptIdentityPreimageV1 =>
  isFinancialDataflowRecordV1(value) &&
  hasFinancialDataflowExactFieldsV1(value, [
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
  value.contractVersion === FINANCIAL_POLICY_ACTION_ATTEMPT_CONTRACT_VERSION_V1 &&
  isFinancialDataflowHashV1(value.evaluationId) &&
  value.actionAuditId === createFinancialPolicyEvaluationActionAuditIdV1(value.evaluationId) &&
  isFinancialDataflowIdentityV1(value.companyId) &&
  isFinancialDataflowIdentityV1(value.destinationRefId) &&
  Number.isSafeInteger(value.attemptNumber) &&
  Number(value.attemptNumber) > 0 &&
  isFinancialDataflowIsoInstantV1(value.attemptedAt) &&
  typeof value.status === 'string' &&
  ACTION_STATUSES.has(value.status) &&
  isFinancialDataflowIdentityV1(value.reasonCode) &&
  isFinancialDataflowIdentityV1(value.executorVersion);

export const canonicalizeFinancialPolicyActionAttemptIdentityV1 = (value: FinancialPolicyActionAttemptIdentityPreimageV1): string => {
  if (!isActionAttemptIdentity(value)) throw new TypeError('Invalid FinancialPolicyActionAttemptIdentityPreimageV1.');
  return canonicalizeFinancialDataflowJsonV1(value);
};

export const createFinancialPolicyActionAttemptIdV1 = (value: FinancialPolicyActionAttemptIdentityPreimageV1): string =>
  `sha256:${sha256Utf8(canonicalizeFinancialPolicyActionAttemptIdentityV1(value))}`;

export const isFinancialPolicyActionAttemptV1 = (value: unknown): value is FinancialPolicyActionAttemptV1 => {
  if (!isFinancialDataflowRecordV1(value) || !Object.prototype.hasOwnProperty.call(value, 'actionAttemptId')) return false;
  const { actionAttemptId, ...identity } = value;
  return (
    isFinancialDataflowHashV1(actionAttemptId) &&
    isActionAttemptIdentity(identity) &&
    actionAttemptId === createFinancialPolicyActionAttemptIdV1(identity)
  );
};

export const isFinancialPolicyActionAttemptCompatibleV1 = (attempt: unknown, evaluation: unknown, definition: unknown): boolean =>
  isFinancialPolicyActionAttemptV1(attempt) &&
  isFinancialPolicyEvaluationV1(evaluation) &&
  isFinancialPolicyDefinitionRevisionV1(definition) &&
  definition.effectiveState === 'enabled' &&
  evaluation.result === 'matched' &&
  attempt.evaluationId === evaluation.evaluationId &&
  attempt.actionAuditId === evaluation.actionAuditId &&
  attempt.companyId === evaluation.companyId &&
  Date.parse(attempt.attemptedAt) >= Date.parse(evaluation.evaluatedAt) &&
  evaluation.policyDefinitionRevisionId === definition.policyDefinitionRevisionId &&
  definition.destinationRefIds.includes(attempt.destinationRefId);
