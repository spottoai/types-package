import type { CurrentSpendCompositionV1 } from './financialDataflow';
import type { FinancialAnalyticsProjectionV1 } from './financialAnalytics';
import { type FinancialPolicyDefinitionRevisionV1, type FinancialPolicyEvaluationV1 } from './financialPolicy';
export declare const FINANCIAL_POLICY_ALGORITHM_VERSION_V1: "financial-policy/shared-v1";
export type FinancialBudgetPositionStatusV1 = 'on-track' | 'at-risk' | 'over-budget' | 'unbudgeted' | 'unavailable';
export type FinancialBudgetPositionV1 = {
    status: 'unbudgeted' | 'unavailable';
} | {
    status: 'on-track' | 'at-risk' | 'over-budget';
    varianceAmount: string;
    amount: string;
    budgetAmount: string;
    atRiskPercent: string;
};
export interface FinancialPolicyKernelRequestV1 {
    definition: FinancialPolicyDefinitionRevisionV1;
    currentSpend: CurrentSpendCompositionV1;
    analytics?: Partial<Record<'forecast' | 'anomaly', FinancialAnalyticsProjectionV1>>;
    evaluatedAt: string;
}
/**
 * Shared exact-decimal display classification for Budget surfaces. This is a
 * read-model policy only; alert matching continues to use the thresholds in a
 * versioned Financial Policy Definition.
 */
export declare const classifyFinancialBudgetPositionV1: (request: {
    amount?: string;
    budgetAmount?: string;
    atRiskPercent?: string;
}) => FinancialBudgetPositionV1;
/**
 * Returns the exact current amount that Budget semantics may compare. An open
 * calendar month is intentionally partial until the period closes; every
 * other partial/unavailable state remains non-comparable.
 */
export declare const selectFinancialBudgetComparableCurrentAmountV1: (composition: CurrentSpendCompositionV1) => string | undefined;
export declare const evaluateFinancialPolicyV1: (request: FinancialPolicyKernelRequestV1) => FinancialPolicyEvaluationV1[];
//# sourceMappingURL=financialPolicyKernel.d.ts.map