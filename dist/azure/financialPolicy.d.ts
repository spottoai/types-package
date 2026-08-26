import type { CostBasis, FinancialEstimateLensV1 } from './costComposition';
import type { FinancialDataflowScopeV1 } from './financialDataflow';
import type { CanonicalExactMoney } from './financialValidationPrimitives';
export declare const FINANCIAL_POLICY_DEFINITION_CONTRACT_VERSION_V1: "financial-policy-definition/v1";
export declare const FINANCIAL_POLICY_EVALUATION_CONTRACT_VERSION_V1: "financial-policy-evaluation/v1";
export interface FinancialPolicyCoordinateRequestV1 {
    provider: 'azure';
    providerAccountRefs: [string, ...string[]];
    scope: FinancialDataflowScopeV1;
    period: {
        kind: 'calendar-month' | 'rolling-30-days';
        timeZone: string;
    };
    costBasis: CostBasis;
    estimateLens: FinancialEstimateLensV1;
    /** Required match condition; this field never authorizes FX conversion or a caller currency default. */
    requiredAccountingCurrencyCode: string;
}
export interface FinancialPolicyThresholdSetV1 {
    amounts: string[];
    percents: string[];
}
export interface FinancialBudgetPolicyCriteriaV1 {
    kind: 'budget';
    budget: CanonicalExactMoney;
    currentSpendThresholds?: FinancialPolicyThresholdSetV1;
    forecastThresholds?: FinancialPolicyThresholdSetV1;
}
export interface FinancialCostAnomalyPolicyCriteriaV1 {
    kind: 'cost-anomaly';
    minimumAmount?: string;
    minimumDelta?: string;
    minimumPercentChange?: string;
}
export type FinancialPolicyCriteriaV1 = FinancialBudgetPolicyCriteriaV1 | FinancialCostAnomalyPolicyCriteriaV1;
export interface FinancialPolicyDefinitionRevisionV1 {
    schemaVersion: 1;
    contractVersion: typeof FINANCIAL_POLICY_DEFINITION_CONTRACT_VERSION_V1;
    policyDefinitionRevisionId: string;
    companyId: string;
    definitionId: string;
    revision: string;
    effectiveState: 'enabled' | 'disabled' | 'deleted';
    coordinateRequest: FinancialPolicyCoordinateRequestV1;
    criteria: FinancialPolicyCriteriaV1;
    schedule: {
        cadenceMinutes: number;
    };
    /** Opaque references only; secret-bearing destination configuration is stored elsewhere. */
    destinationRefIds: string[];
    destinationsDigest: string;
    authoredAt: string;
    authoredByUserId: string;
}
export type FinancialPolicyDefinitionRevisionIdentityPreimageV1 = Omit<FinancialPolicyDefinitionRevisionV1, 'policyDefinitionRevisionId'>;
export type FinancialPolicySignalKindV1 = 'budget-current-spend' | 'budget-forecast' | 'cost-anomaly';
export type FinancialPolicyEvaluationResultV1 = 'matched' | 'not-matched' | 'partial' | 'unavailable';
export interface FinancialPolicyMatchedThresholdV1 {
    thresholdKind: 'amount' | 'percent' | 'minimum-amount' | 'minimum-delta' | 'minimum-percent-change';
    configuredValue: string;
}
interface FinancialPolicyEvaluationCommonV1 {
    schemaVersion: 1;
    contractVersion: typeof FINANCIAL_POLICY_EVALUATION_CONTRACT_VERSION_V1;
    evaluationId: string;
    companyId: string;
    policyDefinitionRevisionId: string;
    definitionId: string;
    definitionRevision: string;
    coordinateId: string;
    currentSpendCompositionId: string;
    evaluatedAt: string;
    policyAlgorithmVersion: string;
    result: FinancialPolicyEvaluationResultV1;
    reasonCode: string;
    matchedThresholds: FinancialPolicyMatchedThresholdV1[];
    readProjectionId: string;
    actionAuditId: string;
}
export interface CurrentSpendFinancialPolicyEvaluationV1 extends FinancialPolicyEvaluationCommonV1 {
    signalKind: 'budget-current-spend';
    analyticsProjectionId?: never;
}
export interface AnalyticsFinancialPolicyEvaluationV1 extends FinancialPolicyEvaluationCommonV1 {
    signalKind: 'budget-forecast' | 'cost-anomaly';
    analyticsProjectionId: string;
}
export type FinancialPolicyEvaluationV1 = CurrentSpendFinancialPolicyEvaluationV1 | AnalyticsFinancialPolicyEvaluationV1;
export type FinancialPolicyEvaluationIdentityPreimageV1 = FinancialPolicyEvaluationV1 extends infer Evaluation ? Evaluation extends FinancialPolicyEvaluationV1 ? Omit<Evaluation, 'evaluationId' | 'readProjectionId' | 'actionAuditId'> : never : never;
export {};
//# sourceMappingURL=financialPolicy.d.ts.map