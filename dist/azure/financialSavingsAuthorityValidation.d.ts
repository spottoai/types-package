import type { FinancialAuthorityResourceProjectionV1, FinancialAuthorityViewV1 } from './financialAuthorityView';
import { type FinancialSavingsAuthorityIdentityPreimageV1, type FinancialSavingsAuthorityV1, type FinancialSavingsResourceProjectionV1 } from './financialSavingsAuthority';
export { canonicalizeFinancialEligibilityAssessmentIdentityV1, createFinancialEligibilityAssessmentIdV1, } from './financialEligibilityAssessmentValidation';
export { canonicalizeFinancialSavingsActivationIdentityV1, canonicalizeFinancialSavingsAllocationIdentityV1, canonicalizeFinancialSavingsDenominatorIdentityV1, createFinancialSavingsActivationIdV1, createFinancialSavingsAllocationIdV1, createFinancialSavingsDenominatorIdV1, } from './financialSavingsCoordinateValidation';
export declare const canonicalizeFinancialSavingsAuthorityIdentityV1: (value: FinancialSavingsAuthorityIdentityPreimageV1) => string;
export declare const createFinancialSavingsAuthorityIdV1: (value: FinancialSavingsAuthorityIdentityPreimageV1) => string;
export declare const isFinancialSavingsAuthorityBoundToFinancialAuthorityV1: (value: unknown, authority: FinancialAuthorityViewV1) => value is FinancialSavingsAuthorityV1;
/** Strict structural and arithmetic validation for one bounded resource savings projection. */
export declare const isFinancialSavingsResourceProjectionV1: (value: unknown) => value is FinancialSavingsResourceProjectionV1;
/** Verifies that the bounded savings projection is the exact companion of one bounded Financial Authority projection. */
export declare const isFinancialSavingsResourceProjectionBoundToFinancialProjectionV1: (value: unknown, financialProjection: FinancialAuthorityResourceProjectionV1) => value is FinancialSavingsResourceProjectionV1;
//# sourceMappingURL=financialSavingsAuthorityValidation.d.ts.map