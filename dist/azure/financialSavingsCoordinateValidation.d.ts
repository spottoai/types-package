import type { FinancialAuthorityCoordinateV1 } from './financialAuthorityView';
import type { FinancialEligibilityAssessmentV1, FinancialSavingsActivationIdentityPreimageV1, FinancialSavingsAllocationIdentityPreimageV1, FinancialSavingsCoordinateEnvelopeV1, FinancialSavingsDenominatorIdentityPreimageV1 } from './financialSavingsAuthority';
import type { FinancialEvidenceReferenceV1 } from './financialScopeEvidence';
export declare const canonicalizeFinancialSavingsDenominatorIdentityV1: (value: FinancialSavingsDenominatorIdentityPreimageV1) => string;
export declare const createFinancialSavingsDenominatorIdV1: (value: FinancialSavingsDenominatorIdentityPreimageV1) => string;
export declare const canonicalizeFinancialSavingsActivationIdentityV1: (value: FinancialSavingsActivationIdentityPreimageV1) => string;
export declare const createFinancialSavingsActivationIdV1: (value: FinancialSavingsActivationIdentityPreimageV1) => string;
export declare const canonicalizeFinancialSavingsAllocationIdentityV1: (value: FinancialSavingsAllocationIdentityPreimageV1) => string;
export declare const createFinancialSavingsAllocationIdV1: (value: FinancialSavingsAllocationIdentityPreimageV1) => string;
export declare const validateFinancialSavingsCoordinateEnvelopeV1: (value: unknown, authorityCoordinate: FinancialAuthorityCoordinateV1, eligibilityById: Map<string, FinancialEligibilityAssessmentV1>, evidenceById: Map<string, FinancialEvidenceReferenceV1>, authorityGeneratedAt: string, authorityRunId: string) => value is FinancialSavingsCoordinateEnvelopeV1;
//# sourceMappingURL=financialSavingsCoordinateValidation.d.ts.map