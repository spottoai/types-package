import { type FinancialAnalyticsCurrentPointerIdentityPreimageV1, type FinancialAnalyticsCurrentPointerV1, type FinancialAnalyticsJobRequestIdentityPreimageV1, type FinancialAnalyticsJobRequestV1 } from './financialAnalyticsDelivery';
export declare const canonicalizeFinancialAnalyticsJobRequestIdentityV1: (value: FinancialAnalyticsJobRequestIdentityPreimageV1) => string;
export declare const createFinancialAnalyticsJobRequestIdV1: (value: FinancialAnalyticsJobRequestIdentityPreimageV1) => string;
export declare const isFinancialAnalyticsJobRequestV1: (value: unknown) => value is FinancialAnalyticsJobRequestV1;
/** Binds an identity-only queue request to already-verified immutable input bytes. */
export declare const isFinancialAnalyticsJobRequestCompatibleV1: (request: unknown, input: unknown, verifiedInputArtifactDigest: unknown) => boolean;
export declare const canonicalizeFinancialAnalyticsCurrentPointerIdentityV1: (value: FinancialAnalyticsCurrentPointerIdentityPreimageV1) => string;
export declare const createFinancialAnalyticsCurrentPointerDigestV1: (value: FinancialAnalyticsCurrentPointerIdentityPreimageV1) => string;
export declare const isFinancialAnalyticsCurrentPointerV1: (value: unknown) => value is FinancialAnalyticsCurrentPointerV1;
/** Binds a promoted pointer to already-verified immutable projection bytes. */
export declare const isFinancialAnalyticsCurrentPointerCompatibleV1: (pointer: unknown, projection: unknown, verifiedProjectionArtifactDigest: unknown) => boolean;
//# sourceMappingURL=financialAnalyticsDeliveryValidation.d.ts.map