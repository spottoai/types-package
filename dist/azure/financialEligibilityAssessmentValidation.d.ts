import type { FinancialAuthorityViewV1 } from './financialAuthorityView';
import { type FinancialEligibilityAssessmentIdentityPreimageV1, type FinancialEligibilityAssessmentV1 } from './financialSavingsAuthority';
import type { AvailableOwnerFinancialScopeBaselineV2 } from './financialScopeBaseline';
import type { FinancialEvidenceAssessmentV1, FinancialEvidenceBundleV1, FinancialEvidenceReferenceV1 } from './financialScopeEvidence';
export interface FinancialEligibilityValidationContextV1 {
    authority: FinancialAuthorityViewV1;
    bundleById: Map<string, FinancialEvidenceBundleV1>;
    assessmentById: Map<string, FinancialEvidenceAssessmentV1>;
    evidenceById: Map<string, FinancialEvidenceReferenceV1>;
}
export declare const canonicalizeFinancialEligibilityAssessmentIdentityV1: (value: FinancialEligibilityAssessmentIdentityPreimageV1) => string;
export declare const createFinancialEligibilityAssessmentIdV1: (value: FinancialEligibilityAssessmentIdentityPreimageV1) => string;
export declare const validateFinancialEligibilityBaselineV1: (value: unknown, context: FinancialEligibilityValidationContextV1) => value is AvailableOwnerFinancialScopeBaselineV2;
export declare const validateFinancialEligibilityAssessmentV1: (value: unknown, context: FinancialEligibilityValidationContextV1, baselineById: Map<string, AvailableOwnerFinancialScopeBaselineV2>) => value is FinancialEligibilityAssessmentV1;
//# sourceMappingURL=financialEligibilityAssessmentValidation.d.ts.map