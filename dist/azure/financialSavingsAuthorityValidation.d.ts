import type { FinancialAuthorityViewV1 } from './financialAuthorityView';
import { type FinancialSavingsAuthorityIdentityPreimageV1, type FinancialSavingsAuthorityV1 } from './financialSavingsAuthority';
export { canonicalizeFinancialEligibilityAssessmentIdentityV1, createFinancialEligibilityAssessmentIdV1, } from './financialEligibilityAssessmentValidation';
export { canonicalizeFinancialSavingsActivationIdentityV1, canonicalizeFinancialSavingsAllocationIdentityV1, canonicalizeFinancialSavingsDenominatorIdentityV1, createFinancialSavingsActivationIdV1, createFinancialSavingsAllocationIdV1, createFinancialSavingsDenominatorIdV1, } from './financialSavingsCoordinateValidation';
export declare const canonicalizeFinancialSavingsAuthorityIdentityV1: (value: FinancialSavingsAuthorityIdentityPreimageV1) => string;
export declare const createFinancialSavingsAuthorityIdV1: (value: FinancialSavingsAuthorityIdentityPreimageV1) => string;
export declare const isFinancialSavingsAuthorityBoundToFinancialAuthorityV1: (value: unknown, authority: FinancialAuthorityViewV1) => value is FinancialSavingsAuthorityV1;
//# sourceMappingURL=financialSavingsAuthorityValidation.d.ts.map