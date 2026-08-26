import { type FinancialPolicyDefinitionRevisionIdentityPreimageV1, type FinancialPolicyDefinitionRevisionV1, type FinancialPolicyEvaluationIdentityPreimageV1, type FinancialPolicyEvaluationV1 } from './financialPolicy';
export declare const canonicalizeFinancialPolicyDefinitionRevisionIdentityV1: (value: FinancialPolicyDefinitionRevisionIdentityPreimageV1) => string;
export declare const createFinancialPolicyDefinitionRevisionIdV1: (value: FinancialPolicyDefinitionRevisionIdentityPreimageV1) => string;
export declare const isFinancialPolicyDefinitionRevisionV1: (value: unknown) => value is FinancialPolicyDefinitionRevisionV1;
export declare const canonicalizeFinancialPolicyEvaluationIdentityV1: (value: FinancialPolicyEvaluationIdentityPreimageV1) => string;
export declare const createFinancialPolicyEvaluationIdV1: (value: FinancialPolicyEvaluationIdentityPreimageV1) => string;
export declare const createFinancialPolicyEvaluationReadProjectionIdV1: (evaluationId: string) => string;
export declare const createFinancialPolicyEvaluationActionAuditIdV1: (evaluationId: string) => string;
export declare const isFinancialPolicyEvaluationV1: (value: unknown) => value is FinancialPolicyEvaluationV1;
/** Validates definition, coordinate, financial input, and signal links after authorization. */
export declare const isFinancialPolicyEvaluationCompatibleV1: (evaluation: unknown, definition: unknown, currentSpendComposition: unknown, analyticsProjection?: unknown) => boolean;
//# sourceMappingURL=financialPolicyValidation.d.ts.map