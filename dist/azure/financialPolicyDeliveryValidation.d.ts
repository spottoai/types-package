import { type FinancialPolicyActionAttemptIdentityPreimageV1, type FinancialPolicyActionAttemptV1, type FinancialPolicyEvaluationReadProjectionV1 } from './financialPolicyDelivery';
export declare const isFinancialPolicyEvaluationReadProjectionV1: (value: unknown) => value is FinancialPolicyEvaluationReadProjectionV1;
export declare const isFinancialPolicyEvaluationReadProjectionCompatibleV1: (projection: unknown, evaluation: unknown) => boolean;
export declare const canonicalizeFinancialPolicyActionAttemptIdentityV1: (value: FinancialPolicyActionAttemptIdentityPreimageV1) => string;
export declare const createFinancialPolicyActionAttemptIdV1: (value: FinancialPolicyActionAttemptIdentityPreimageV1) => string;
export declare const isFinancialPolicyActionAttemptV1: (value: unknown) => value is FinancialPolicyActionAttemptV1;
export declare const isFinancialPolicyActionAttemptCompatibleV1: (attempt: unknown, evaluation: unknown, definition: unknown) => boolean;
//# sourceMappingURL=financialPolicyDeliveryValidation.d.ts.map