import { type FinancialAnalyticsBatchQueryV1, type FinancialAnalyticsBatchResponseV1, type FinancialAnalyticsCurrentPointerIdentityPreimageV1, type FinancialAnalyticsCurrentPointerV1, type FinancialAnalyticsJobRequestIdentityPreimageV1, type FinancialAnalyticsJobRequestV1, type FinancialAnalyticsOutputManifestIdentityPreimageV1, type FinancialAnalyticsOutputManifestV1, type FinancialAnalyticsRequestedOutputV1 } from './financialAnalyticsDelivery';
export declare const canonicalizeFinancialAnalyticsJobRequestIdentityV1: (value: FinancialAnalyticsJobRequestIdentityPreimageV1) => string;
export declare const createFinancialAnalyticsJobRequestIdV1: (value: FinancialAnalyticsJobRequestIdentityPreimageV1) => string;
/** Stable immutable output generation selected by one exact job output. */
export declare const createFinancialAnalyticsOutputGenerationIdV1: (requestId: string, output: FinancialAnalyticsRequestedOutputV1) => string;
export declare const isFinancialAnalyticsJobRequestV1: (value: unknown) => value is FinancialAnalyticsJobRequestV1;
/** Binds an identity-only queue request to already-verified immutable input bytes. */
export declare const isFinancialAnalyticsJobRequestCompatibleV1: (request: unknown, input: unknown, verifiedInputArtifactDigest: unknown) => boolean;
export declare const canonicalizeFinancialAnalyticsCurrentPointerIdentityV1: (value: FinancialAnalyticsCurrentPointerIdentityPreimageV1) => string;
export declare const createFinancialAnalyticsCurrentPointerDigestV1: (value: FinancialAnalyticsCurrentPointerIdentityPreimageV1) => string;
export declare const isFinancialAnalyticsCurrentPointerV1: (value: unknown) => value is FinancialAnalyticsCurrentPointerV1;
/** Binds a promoted pointer to already-verified immutable projection bytes. */
export declare const isFinancialAnalyticsCurrentPointerCompatibleV1: (pointer: unknown, projection: unknown, verifiedProjectionArtifactDigest: unknown) => boolean;
export declare const createFinancialAnalyticsOutputManifestDigestV1: (value: FinancialAnalyticsOutputManifestIdentityPreimageV1) => string;
export declare const isFinancialAnalyticsOutputManifestV1: (value: unknown) => value is FinancialAnalyticsOutputManifestV1;
export declare const isFinancialAnalyticsOutputManifestCompatibleV1: (manifest: unknown, projection: unknown, verifiedProjectionArtifactDigest: unknown) => boolean;
export declare const isFinancialAnalyticsBatchQueryV1: (value: unknown) => value is FinancialAnalyticsBatchQueryV1;
export declare const isFinancialAnalyticsBatchResponseV1: (value: unknown) => value is FinancialAnalyticsBatchResponseV1;
export declare const isFinancialAnalyticsBatchResponseCompatibleV1: (query: unknown, response: unknown) => boolean;
//# sourceMappingURL=financialAnalyticsDeliveryValidation.d.ts.map