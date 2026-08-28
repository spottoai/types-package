import { type CurrentSpendCompositionV1, type FinancialDataflowCoordinateV1 } from './financialDataflow';
import type { FinancialChargeCompositionV1 } from './financialChargeComposition';
import { type FinancialScopeBaselineEnvelopeV2 } from './financialScopeBaseline';
export declare const CURRENT_SPEND_COMPOSITION_ALGORITHM_VERSION_V1: "current-spend-composition/shared-v1";
export interface CurrentSpendCompositionKernelRequestV1 {
    coordinate: FinancialDataflowCoordinateV1;
    baselines: FinancialScopeBaselineEnvelopeV2[];
    chargeCompositions: FinancialChargeCompositionV1[];
    algorithmVersion?: string;
}
export type FinancialExactTrendComparisonV1 = {
    status: 'unavailable';
} | {
    status: 'available';
    direction: 'increasing' | 'decreasing' | 'flat';
    changeAmount: string;
    /** Present only when the exact ratio has a canonical representation at six or fewer decimal places. */
    percentChange?: string;
};
/**
 * Shared exact current-versus-comparison semantics for display composition.
 * Canonical analytics projections use the same direction/change/percentage
 * rules; this helper does not create or impersonate an analytics authority.
 */
export declare const compareFinancialExactAmountsV1: (request: {
    currentAmount?: string;
    comparisonAmount?: string;
}) => FinancialExactTrendComparisonV1;
/** Portable exact-decimal composition kernel shared by Cloud and browser runtimes. */
export declare const composeCurrentSpendV1: (request: CurrentSpendCompositionKernelRequestV1) => CurrentSpendCompositionV1;
//# sourceMappingURL=financialDataflowKernel.d.ts.map