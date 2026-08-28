import type {
  FinancialPolicyCoordinateRequestV1,
  FinancialPolicyCriteriaV1,
  FinancialPolicyEvaluationResultV1,
  FinancialPolicyMatchedThresholdV1,
  FinancialPolicySignalKindV1,
} from './financialPolicy';
import type { FinancialAnalyticsProjectionV1 } from './financialAnalytics';
import type { FinancialDataflowJsonGzipArtifactDescriptorV1 } from './financialDataflow';

export const FINANCIAL_POLICY_READ_PROJECTION_CONTRACT_VERSION_V1 = 'financial-policy-read-projection/v1' as const;
export const FINANCIAL_POLICY_ACTION_ATTEMPT_CONTRACT_VERSION_V1 = 'financial-policy-action-attempt/v1' as const;
export const FINANCIAL_POLICY_DEFINITION_COMMAND_CONTRACT_VERSION_V1 = 'financial-policy-definition-command/v1' as const;
export const FINANCIAL_POLICY_READ_CURRENT_POINTER_CONTRACT_VERSION_V1 = 'financial-policy-read-current-pointer/v1' as const;
export const FINANCIAL_POLICY_ACTION_COMPLETION_CONTRACT_VERSION_V1 = 'financial-policy-action-completion/v1' as const;
export const FINANCIAL_POLICY_READ_MANIFEST_CONTRACT_VERSION_V1 = 'financial-policy-read-manifest/v1' as const;

export interface FinancialPolicyDefinitionCommandV1 {
  schemaVersion: 1;
  contractVersion: typeof FINANCIAL_POLICY_DEFINITION_COMMAND_CONTRACT_VERSION_V1;
  /** Required for update; absent only for create. */
  expectedRevision?: string;
  displayName: string;
  effectiveState: 'enabled' | 'disabled';
  coordinateRequest: FinancialPolicyCoordinateRequestV1;
  criteria: FinancialPolicyCriteriaV1;
  schedule: { cadenceMinutes: number };
  destinationRefIds: string[];
}

/** Portal-safe evaluation view. It deliberately excludes action authority and destination references. */
export interface FinancialPolicyEvaluationReadProjectionV1 {
  schemaVersion: 1;
  contractVersion: typeof FINANCIAL_POLICY_READ_PROJECTION_CONTRACT_VERSION_V1;
  readProjectionId: string;
  evaluationId: string;
  companyId: string;
  definitionId: string;
  definitionRevision: string;
  policyDefinitionRevisionId: string;
  coordinateId: string;
  currentSpendCompositionId: string;
  analyticsProjectionId?: string;
  /** Exact immutable analytics evidence bound by this evaluation; never a mutable current lookup. */
  analyticsProjection?: FinancialAnalyticsProjectionV1;
  signalKind: FinancialPolicySignalKindV1;
  evaluatedAt: string;
  result: FinancialPolicyEvaluationResultV1;
  reasonCode: string;
  matchedThresholds: FinancialPolicyMatchedThresholdV1[];
}

export interface FinancialPolicyEvaluationReadCurrentPointerV1 {
  schemaVersion: 1;
  contractVersion: typeof FINANCIAL_POLICY_READ_CURRENT_POINTER_CONTRACT_VERSION_V1;
  pointerDigest: string;
  companyId: string;
  definitionId: string;
  signalKind: FinancialPolicySignalKindV1;
  pointerRevision: number;
  definitionRevision: string;
  policyDefinitionRevisionId: string;
  evaluationId: string;
  readProjectionId: string;
  projectionArtifactDigest: string;
  evaluatedAt: string;
  promotedAt: string;
}

export type FinancialPolicyEvaluationReadCurrentPointerIdentityPreimageV1 = Omit<
  FinancialPolicyEvaluationReadCurrentPointerV1,
  'pointerDigest'
>;

export interface FinancialPolicyEvaluationReadManifestV1 {
  schemaVersion: 1;
  contractVersion: typeof FINANCIAL_POLICY_READ_MANIFEST_CONTRACT_VERSION_V1;
  companyId: string;
  definitionId: string;
  policyDefinitionRevisionId: string;
  definitionRevision: string;
  evaluationId: string;
  readProjectionId: string;
  signalKind: FinancialPolicySignalKindV1;
  projection: FinancialDataflowJsonGzipArtifactDescriptorV1;
  publishedAt: string;
  manifestDigest: string;
}

export type FinancialPolicyEvaluationReadManifestIdentityPreimageV1 = Omit<
  FinancialPolicyEvaluationReadManifestV1,
  'manifestDigest'
>;

export interface FinancialPolicyActionAttemptV1 {
  schemaVersion: 1;
  contractVersion: typeof FINANCIAL_POLICY_ACTION_ATTEMPT_CONTRACT_VERSION_V1;
  actionAttemptId: string;
  actionAuditId: string;
  evaluationId: string;
  companyId: string;
  /** Opaque reference only; destination secrets remain outside this artifact. */
  destinationRefId: string;
  attemptNumber: number;
  /** Stable per evaluation, destination, and attempt number so queue redelivery reuses one audit identity. */
  attemptedAt: string;
  status: 'succeeded' | 'retryable-failure' | 'terminal-failure';
  reasonCode: string;
  executorVersion: string;
}

export type FinancialPolicyActionAttemptIdentityPreimageV1 = Omit<FinancialPolicyActionAttemptV1, 'actionAttemptId'>;

/**
 * Durable completion marker written only after one destination has succeeded.
 * It suppresses later retries once persisted; external delivery remains
 * at-least-once because a worker can stop after the side effect and before this write.
 */
export interface FinancialPolicyActionCompletionV1 {
  schemaVersion: 1;
  contractVersion: typeof FINANCIAL_POLICY_ACTION_COMPLETION_CONTRACT_VERSION_V1;
  completionId: string;
  actionAuditId: string;
  evaluationId: string;
  companyId: string;
  destinationRefId: string;
  /** Stable evaluation instant, not the wall-clock time of a retry. */
  completedAt: string;
  executorVersion: string;
}

export type FinancialPolicyActionCompletionIdentityPreimageV1 = Omit<FinancialPolicyActionCompletionV1, 'completionId'>;
