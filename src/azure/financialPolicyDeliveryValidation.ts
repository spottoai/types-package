import { sha256Utf8 } from '../common/sha256';
import { parseCanonicalDecimal } from '../common/exactDecimal';
import { isCanonicalExactMoney } from './financialValidationPrimitives';
import { isFinancialAnalyticsProjectionV1 } from './financialAnalyticsValidation';
import type { FinancialAnalyticsProjectionV1 } from './financialAnalytics';
import type { FinancialPolicyDefinitionRevisionV1, FinancialPolicyEvaluationV1 } from './financialPolicy';
import {
  FINANCIAL_POLICY_ACTION_ATTEMPT_CONTRACT_VERSION_V1,
  FINANCIAL_POLICY_ACTION_COMPLETION_CONTRACT_VERSION_V1,
  FINANCIAL_POLICY_DEFINITION_COMMAND_CONTRACT_VERSION_V1,
  FINANCIAL_POLICY_READ_CURRENT_POINTER_CONTRACT_VERSION_V1,
  FINANCIAL_POLICY_READ_MANIFEST_CONTRACT_VERSION_V1,
  FINANCIAL_POLICY_READ_PROJECTION_CONTRACT_VERSION_V1,
  type FinancialPolicyActionAttemptIdentityPreimageV1,
  type FinancialPolicyActionAttemptV1,
  type FinancialPolicyActionCompletionIdentityPreimageV1,
  type FinancialPolicyActionCompletionV1,
  type FinancialPolicyDefinitionCommandV1,
  type FinancialPolicyEvaluationReadCurrentPointerIdentityPreimageV1,
  type FinancialPolicyEvaluationReadCurrentPointerV1,
  type FinancialPolicyEvaluationReadManifestIdentityPreimageV1,
  type FinancialPolicyEvaluationReadManifestV1,
  type FinancialPolicyEvaluationReadProjectionV1,
} from './financialPolicyDelivery';
import {
  canonicalizeFinancialDataflowJsonV1,
  hasFinancialDataflowExactFieldsV1,
  isFinancialDataflowHashV1,
  isFinancialDataflowIdentityV1,
  isFinancialDataflowIsoInstantV1,
  isFinancialDataflowJsonGzipArtifactDescriptorV1,
  isFinancialDataflowRecordV1,
} from './financialDataflowValidation';
import {
  createFinancialPolicyDefinitionRevisionIdV1,
  createFinancialPolicyEvaluationActionAuditIdV1,
  createFinancialPolicyEvaluationReadProjectionIdV1,
  isFinancialPolicyDefinitionRevisionIdentityPreimageV1,
  isFinancialPolicyDefinitionRevisionV1,
  isFinancialPolicyEvaluationV1,
} from './financialPolicyValidation';

const SIGNAL_KINDS = new Set(['budget-current-spend', 'budget-forecast', 'cost-anomaly']);
const RESULTS = new Set(['matched', 'not-matched', 'partial', 'unavailable']);
const ACTION_STATUSES = new Set(['succeeded', 'retryable-failure', 'terminal-failure']);

const isCanonicalPolicyRevision = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return false;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && String(parsed) === value;
};

export const createFinancialPolicyDestinationsDigestV1 = (destinationRefIds: readonly string[]): string =>
  `sha256:${sha256Utf8(canonicalizeFinancialDataflowJsonV1([...destinationRefIds].sort()))}`;

export const isFinancialPolicyDefinitionCommandV1 = (value: unknown): value is FinancialPolicyDefinitionCommandV1 => {
  if (
    !isFinancialDataflowRecordV1(value) ||
    !hasFinancialDataflowExactFieldsV1(
      value,
      ['schemaVersion', 'contractVersion', 'displayName', 'effectiveState', 'coordinateRequest', 'criteria', 'schedule', 'destinationRefIds'],
      ['expectedRevision']
    ) ||
    value.schemaVersion !== 1 ||
    value.contractVersion !== FINANCIAL_POLICY_DEFINITION_COMMAND_CONTRACT_VERSION_V1 ||
    (value.expectedRevision !== undefined && !isCanonicalPolicyRevision(value.expectedRevision)) ||
    !isFinancialDataflowIdentityV1(value.displayName) ||
    (value.effectiveState !== 'enabled' && value.effectiveState !== 'disabled') ||
    !Array.isArray(value.destinationRefIds)
  ) {
    return false;
  }
  const identity = {
    schemaVersion: 1 as const,
    contractVersion: 'financial-policy-definition/v1' as const,
    companyId: 'contract-company',
    definitionId: 'contract-definition',
    displayName: value.displayName,
    revision: '1',
    effectiveState: value.effectiveState,
    coordinateRequest: value.coordinateRequest,
    criteria: value.criteria,
    schedule: value.schedule,
    destinationRefIds: value.destinationRefIds,
    destinationsDigest: createFinancialPolicyDestinationsDigestV1(value.destinationRefIds),
    authoredAt: '2026-01-01T00:00:00.000Z',
    authoredByUserId: 'contract-author',
  };
  if (!isFinancialPolicyDefinitionRevisionIdentityPreimageV1(identity)) return false;
  const definition = { ...identity, policyDefinitionRevisionId: createFinancialPolicyDefinitionRevisionIdV1(identity) };
  return isFinancialPolicyDefinitionRevisionV1(definition);
};

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
      'policyDefinitionRevisionId',
      'coordinateId',
      'currentSpendCompositionId',
      'signalKind',
      'evaluatedAt',
      'result',
      'reasonCode',
      'matchedThresholds',
    ],
    ['analyticsProjectionId', 'analyticsProjection']
  ) &&
  value.schemaVersion === 1 &&
  value.contractVersion === FINANCIAL_POLICY_READ_PROJECTION_CONTRACT_VERSION_V1 &&
  isFinancialDataflowHashV1(value.evaluationId) &&
  value.readProjectionId === createFinancialPolicyEvaluationReadProjectionIdV1(value.evaluationId) &&
  isFinancialDataflowIdentityV1(value.companyId) &&
  isFinancialDataflowIdentityV1(value.definitionId) &&
  isFinancialDataflowIdentityV1(value.definitionRevision) &&
  isFinancialDataflowHashV1(value.policyDefinitionRevisionId) &&
  isFinancialDataflowHashV1(value.coordinateId) &&
  isFinancialDataflowHashV1(value.currentSpendCompositionId) &&
  (value.analyticsProjectionId === undefined || isFinancialDataflowHashV1(value.analyticsProjectionId)) &&
  (value.analyticsProjection === undefined || isFinancialAnalyticsProjectionV1(value.analyticsProjection)) &&
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
      ? value.analyticsProjectionId === undefined || isFinancialDataflowHashV1(value.analyticsProjectionId)
      : value.analyticsProjectionId !== undefined) &&
  isFinancialDataflowIsoInstantV1(value.evaluatedAt) &&
  typeof value.result === 'string' &&
  RESULTS.has(value.result) &&
  isFinancialDataflowIdentityV1(value.reasonCode) &&
  isMatchedThresholds(value.matchedThresholds) &&
  Array.isArray(value.matchedThresholds) &&
  (value.result === 'matched' ? value.matchedThresholds.length > 0 : value.matchedThresholds.length === 0);

export const isFinancialPolicyEvaluationReadProjectionCompatibleV1 = (
  projection: unknown,
  evaluation: unknown,
  analyticsProjection?: FinancialAnalyticsProjectionV1
): boolean => {
  if (!isFinancialPolicyEvaluationReadProjectionV1(projection) || !isFinancialPolicyEvaluationV1(evaluation)) return false;
  const expected: FinancialPolicyEvaluationReadProjectionV1 = {
    schemaVersion: 1,
    contractVersion: FINANCIAL_POLICY_READ_PROJECTION_CONTRACT_VERSION_V1,
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
  return (
    (evaluation.analyticsProjectionId === undefined
      ? analyticsProjection === undefined
      : analyticsProjection?.analyticsProjectionId === evaluation.analyticsProjectionId) &&
    canonicalizeFinancialDataflowJsonV1(projection) === canonicalizeFinancialDataflowJsonV1(expected)
  );
};

export const canonicalizeFinancialPolicyEvaluationReadCurrentPointerIdentityV1 = (
  value: FinancialPolicyEvaluationReadCurrentPointerIdentityPreimageV1
): string => {
  if (
    !isFinancialDataflowRecordV1(value) ||
    !hasFinancialDataflowExactFieldsV1(value, [
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
    value.contractVersion !== FINANCIAL_POLICY_READ_CURRENT_POINTER_CONTRACT_VERSION_V1 ||
    !isFinancialDataflowIdentityV1(value.companyId) ||
    !isFinancialDataflowIdentityV1(value.definitionId) ||
    typeof value.signalKind !== 'string' ||
    !SIGNAL_KINDS.has(value.signalKind) ||
    !Number.isSafeInteger(value.pointerRevision) ||
    value.pointerRevision < 1 ||
    !isFinancialDataflowIdentityV1(value.definitionRevision) ||
    !isFinancialDataflowHashV1(value.policyDefinitionRevisionId) ||
    !isFinancialDataflowHashV1(value.evaluationId) ||
    value.readProjectionId !== createFinancialPolicyEvaluationReadProjectionIdV1(value.evaluationId) ||
    !isFinancialDataflowHashV1(value.projectionArtifactDigest) ||
    !isFinancialDataflowIsoInstantV1(value.evaluatedAt) ||
    !isFinancialDataflowIsoInstantV1(value.promotedAt)
  ) {
    throw new TypeError('Invalid FinancialPolicyEvaluationReadCurrentPointerIdentityPreimageV1.');
  }
  return canonicalizeFinancialDataflowJsonV1(value);
};

export const createFinancialPolicyEvaluationReadCurrentPointerDigestV1 = (
  value: FinancialPolicyEvaluationReadCurrentPointerIdentityPreimageV1
): string => `sha256:${sha256Utf8(canonicalizeFinancialPolicyEvaluationReadCurrentPointerIdentityV1(value))}`;

export const isFinancialPolicyEvaluationReadCurrentPointerV1 = (
  value: unknown
): value is FinancialPolicyEvaluationReadCurrentPointerV1 => {
  if (!isFinancialDataflowRecordV1(value) || !Object.prototype.hasOwnProperty.call(value, 'pointerDigest')) return false;
  const { pointerDigest, ...identity } = value;
  try {
    return (
      isFinancialDataflowHashV1(pointerDigest) &&
      pointerDigest === createFinancialPolicyEvaluationReadCurrentPointerDigestV1(
        identity as FinancialPolicyEvaluationReadCurrentPointerIdentityPreimageV1
      )
    );
  } catch {
    return false;
  }
};

export const isFinancialPolicyEvaluationReadCurrentPointerCompatibleV1 = (
  pointer: unknown,
  projection: unknown,
  projectionArtifactDigest: unknown
): boolean =>
  isFinancialPolicyEvaluationReadCurrentPointerV1(pointer) &&
  isFinancialPolicyEvaluationReadProjectionV1(projection) &&
  isFinancialDataflowHashV1(projectionArtifactDigest) &&
  pointer.companyId === projection.companyId &&
  pointer.definitionId === projection.definitionId &&
  pointer.signalKind === projection.signalKind &&
  pointer.definitionRevision === projection.definitionRevision &&
  pointer.policyDefinitionRevisionId === projection.policyDefinitionRevisionId &&
  pointer.evaluationId === projection.evaluationId &&
  pointer.readProjectionId === projection.readProjectionId &&
  pointer.projectionArtifactDigest === projectionArtifactDigest &&
  pointer.evaluatedAt === projection.evaluatedAt;

const isReadManifestIdentity = (value: unknown): value is FinancialPolicyEvaluationReadManifestIdentityPreimageV1 =>
  isFinancialDataflowRecordV1(value) &&
  hasFinancialDataflowExactFieldsV1(value, [
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
  value.contractVersion === FINANCIAL_POLICY_READ_MANIFEST_CONTRACT_VERSION_V1 &&
  isFinancialDataflowIdentityV1(value.companyId) &&
  isFinancialDataflowIdentityV1(value.definitionId) &&
  isFinancialDataflowHashV1(value.policyDefinitionRevisionId) &&
  isFinancialDataflowIdentityV1(value.definitionRevision) &&
  isFinancialDataflowHashV1(value.evaluationId) &&
  value.readProjectionId === createFinancialPolicyEvaluationReadProjectionIdV1(value.evaluationId) &&
  typeof value.signalKind === 'string' &&
  SIGNAL_KINDS.has(value.signalKind) &&
  isFinancialDataflowJsonGzipArtifactDescriptorV1(value.projection) &&
  isFinancialDataflowIsoInstantV1(value.publishedAt);

export const createFinancialPolicyEvaluationReadManifestDigestV1 = (
  value: FinancialPolicyEvaluationReadManifestIdentityPreimageV1
): string => {
  if (!isReadManifestIdentity(value)) throw new TypeError('Invalid FinancialPolicyEvaluationReadManifestIdentityPreimageV1.');
  return `sha256:${sha256Utf8(canonicalizeFinancialDataflowJsonV1(value))}`;
};

export const isFinancialPolicyEvaluationReadManifestV1 = (
  value: unknown
): value is FinancialPolicyEvaluationReadManifestV1 => {
  if (!isFinancialDataflowRecordV1(value) || !Object.prototype.hasOwnProperty.call(value, 'manifestDigest')) return false;
  const { manifestDigest, ...identity } = value;
  try {
    return (
      isFinancialDataflowHashV1(manifestDigest) &&
      manifestDigest === createFinancialPolicyEvaluationReadManifestDigestV1(
        identity as FinancialPolicyEvaluationReadManifestIdentityPreimageV1
      )
    );
  } catch {
    return false;
  }
};

export const isFinancialPolicyEvaluationReadManifestCompatibleV1 = (
  manifest: unknown,
  projection: unknown,
  verifiedProjectionArtifactDigest: unknown
): boolean =>
  isFinancialPolicyEvaluationReadManifestV1(manifest) &&
  isFinancialPolicyEvaluationReadProjectionV1(projection) &&
  isFinancialDataflowHashV1(verifiedProjectionArtifactDigest) &&
  manifest.companyId === projection.companyId &&
  manifest.definitionId === projection.definitionId &&
  manifest.policyDefinitionRevisionId === projection.policyDefinitionRevisionId &&
  manifest.definitionRevision === projection.definitionRevision &&
  manifest.evaluationId === projection.evaluationId &&
  manifest.readProjectionId === projection.readProjectionId &&
  manifest.signalKind === projection.signalKind &&
  manifest.publishedAt === projection.evaluatedAt &&
  manifest.projection.sha256 === verifiedProjectionArtifactDigest;

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

export const canonicalizeFinancialPolicyActionCompletionIdentityV1 = (
  value: FinancialPolicyActionCompletionIdentityPreimageV1
): string => {
  if (
    !isFinancialDataflowRecordV1(value) ||
    !hasFinancialDataflowExactFieldsV1(value, [
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
    value.contractVersion !== FINANCIAL_POLICY_ACTION_COMPLETION_CONTRACT_VERSION_V1 ||
    !isFinancialDataflowHashV1(value.actionAuditId) ||
    !isFinancialDataflowHashV1(value.evaluationId) ||
    !isFinancialDataflowIdentityV1(value.companyId) ||
    !isFinancialDataflowIdentityV1(value.destinationRefId) ||
    !isFinancialDataflowIsoInstantV1(value.completedAt) ||
    !isFinancialDataflowIdentityV1(value.executorVersion)
  ) {
    throw new TypeError('Invalid FinancialPolicyActionCompletionIdentityPreimageV1.');
  }
  return canonicalizeFinancialDataflowJsonV1(value);
};

export const createFinancialPolicyActionCompletionIdV1 = (
  value: FinancialPolicyActionCompletionIdentityPreimageV1
): string => `sha256:${sha256Utf8(canonicalizeFinancialPolicyActionCompletionIdentityV1(value))}`;

export const isFinancialPolicyActionCompletionV1 = (value: unknown): value is FinancialPolicyActionCompletionV1 => {
  if (!isFinancialDataflowRecordV1(value) || !Object.prototype.hasOwnProperty.call(value, 'completionId')) return false;
  const { completionId, ...identity } = value;
  try {
    return (
      isFinancialDataflowHashV1(completionId) &&
      completionId === createFinancialPolicyActionCompletionIdV1(identity as FinancialPolicyActionCompletionIdentityPreimageV1)
    );
  } catch {
    return false;
  }
};

export const isFinancialPolicyActionCompletionCompatibleV1 = (
  completion: unknown,
  evaluation: unknown,
  definition: unknown
): boolean =>
  isFinancialPolicyActionCompletionV1(completion) &&
  isFinancialPolicyEvaluationV1(evaluation) &&
  isFinancialPolicyDefinitionRevisionV1(definition) &&
  completion.actionAuditId === evaluation.actionAuditId &&
  completion.evaluationId === evaluation.evaluationId &&
  completion.companyId === evaluation.companyId &&
  completion.completedAt === evaluation.evaluatedAt &&
  definition.companyId === completion.companyId &&
  definition.destinationRefIds.includes(completion.destinationRefId);
