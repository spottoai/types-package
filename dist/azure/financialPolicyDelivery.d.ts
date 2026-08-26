import type { FinancialPolicyEvaluationResultV1, FinancialPolicyMatchedThresholdV1, FinancialPolicySignalKindV1 } from './financialPolicy';
export declare const FINANCIAL_POLICY_READ_PROJECTION_CONTRACT_VERSION_V1: "financial-policy-read-projection/v1";
export declare const FINANCIAL_POLICY_ACTION_ATTEMPT_CONTRACT_VERSION_V1: "financial-policy-action-attempt/v1";
/** Portal-safe evaluation view. It deliberately excludes action authority and destination references. */
export interface FinancialPolicyEvaluationReadProjectionV1 {
    schemaVersion: 1;
    contractVersion: typeof FINANCIAL_POLICY_READ_PROJECTION_CONTRACT_VERSION_V1;
    readProjectionId: string;
    evaluationId: string;
    companyId: string;
    definitionId: string;
    definitionRevision: string;
    coordinateId: string;
    currentSpendCompositionId: string;
    analyticsProjectionId?: string;
    signalKind: FinancialPolicySignalKindV1;
    evaluatedAt: string;
    result: FinancialPolicyEvaluationResultV1;
    reasonCode: string;
    matchedThresholds: FinancialPolicyMatchedThresholdV1[];
}
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
    attemptedAt: string;
    status: 'succeeded' | 'retryable-failure' | 'terminal-failure';
    reasonCode: string;
    executorVersion: string;
}
export type FinancialPolicyActionAttemptIdentityPreimageV1 = Omit<FinancialPolicyActionAttemptV1, 'actionAttemptId'>;
//# sourceMappingURL=financialPolicyDelivery.d.ts.map