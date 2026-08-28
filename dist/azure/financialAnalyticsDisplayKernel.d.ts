import type { FinancialAnalyticsDisplayPeriodKeyV1, FinancialAnalyticsDisplayProjectionV1, FinancialAnalyticsInputSeriesV1 } from './financialAnalytics';
/**
 * Exact, non-authoritative display rollup over one producer-owned analytics
 * input. The function never changes charge inclusion, estimates, cost basis,
 * currency, or source evidence; uncovered dates remain explicit.
 */
export declare const projectFinancialAnalyticsDisplayPeriodV1: (request: {
    input: FinancialAnalyticsInputSeriesV1;
    currentSpendCompositionId: string;
    periodKey: FinancialAnalyticsDisplayPeriodKeyV1;
}) => FinancialAnalyticsDisplayProjectionV1;
//# sourceMappingURL=financialAnalyticsDisplayKernel.d.ts.map