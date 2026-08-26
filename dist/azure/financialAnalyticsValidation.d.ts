import { type FinancialAnalyticsInputIdentityPreimageV1, type FinancialAnalyticsInputSeriesV1, type FinancialAnalyticsProjectionIdentityPreimageV1, type FinancialAnalyticsProjectionV1 } from './financialAnalytics';
export declare const canonicalizeFinancialAnalyticsInputIdentityV1: (value: FinancialAnalyticsInputIdentityPreimageV1) => string;
export declare const createFinancialAnalyticsInputIdV1: (value: FinancialAnalyticsInputIdentityPreimageV1) => string;
export declare const isFinancialAnalyticsInputSeriesV1: (value: unknown) => value is FinancialAnalyticsInputSeriesV1;
/** Proves that every analytics point is an exact projection of its referenced daily composition. */
export declare const isFinancialAnalyticsInputSeriesCompatibleV1: (input: unknown, dailyCompositions: unknown) => boolean;
export declare const canonicalizeFinancialAnalyticsProjectionIdentityV1: (value: FinancialAnalyticsProjectionIdentityPreimageV1) => string;
export declare const createFinancialAnalyticsProjectionIdV1: (value: FinancialAnalyticsProjectionIdentityPreimageV1) => string;
export declare const isFinancialAnalyticsProjectionV1: (value: unknown) => value is FinancialAnalyticsProjectionV1;
/** Validates the immutable cross-artifact links that structural validators cannot prove alone. */
export declare const isFinancialAnalyticsProjectionCompatibleV1: (projection: unknown, input?: unknown, currentSpendComposition?: unknown, comparisonSpendComposition?: unknown) => boolean;
//# sourceMappingURL=financialAnalyticsValidation.d.ts.map