import { type FinancialChargeCompositionIdentityPreimageV1, type FinancialChargeCompositionV1, type FinancialChargeSelectionV1 } from './financialChargeComposition';
import type { FinancialChargeInclusionPolicyRefV2 } from './financialScopeBaseline';
export declare const canonicalizeFinancialChargeCompositionIdentityV1: (value: FinancialChargeCompositionIdentityPreimageV1) => string;
export declare const createFinancialChargeCompositionIdV1: (value: FinancialChargeCompositionIdentityPreimageV1) => string;
export declare const isFinancialChargeCompositionV1: (value: unknown) => value is FinancialChargeCompositionV1;
export declare const isFinancialChargeInclusionPolicyRefV1: (value: unknown) => value is FinancialChargeInclusionPolicyRefV2;
export declare const selectFinancialChargesV1: (composition: FinancialChargeCompositionV1, policyRef: FinancialChargeInclusionPolicyRefV2) => FinancialChargeSelectionV1;
//# sourceMappingURL=financialChargeCompositionValidation.d.ts.map