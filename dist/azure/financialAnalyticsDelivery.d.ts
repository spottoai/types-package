import type { FinancialAnalyticsResultV1 } from './financialAnalytics';
export declare const FINANCIAL_ANALYTICS_JOB_REQUEST_CONTRACT_VERSION_V1: "financial-analytics-job-request/v1";
export declare const FINANCIAL_ANALYTICS_CURRENT_POINTER_CONTRACT_VERSION_V1: "financial-analytics-current-pointer/v1";
export declare const FINANCIAL_ANALYTICS_INPUT_LOGICAL_NAME_V1: "financial-analytics-input.json.gz";
export declare const FINANCIAL_ANALYTICS_PROJECTION_LOGICAL_NAME_V1: "financial-analytics-projection.json.gz";
export interface FinancialAnalyticsJobRequestV1 {
    schemaVersion: 1;
    contractVersion: typeof FINANCIAL_ANALYTICS_JOB_REQUEST_CONTRACT_VERSION_V1;
    requestId: string;
    companyId: string;
    coordinateId: string;
    analyticsInputId: string;
    inputGenerationId: string;
    inputArtifactDigest: string;
    /** Identity-only queue request. Customer money and billing rows must never be embedded here. */
    requestedResultKinds: FinancialAnalyticsResultV1['kind'][];
    requestedAt: string;
}
/** Stable across delivery retries; enqueue time is audit metadata, not request identity. */
export type FinancialAnalyticsJobRequestIdentityPreimageV1 = Omit<FinancialAnalyticsJobRequestV1, 'requestId' | 'requestedAt'>;
/** CAS-friendly current pointer; immutable output generations remain the source of truth. */
export interface FinancialAnalyticsCurrentPointerV1 {
    schemaVersion: 1;
    contractVersion: typeof FINANCIAL_ANALYTICS_CURRENT_POINTER_CONTRACT_VERSION_V1;
    pointerDigest: string;
    coordinateId: string;
    pointerRevision: number;
    outputGenerationId: string;
    analyticsProjectionId: string;
    projectionArtifactDigest: string;
    promotedAt: string;
}
export type FinancialAnalyticsCurrentPointerIdentityPreimageV1 = Omit<FinancialAnalyticsCurrentPointerV1, 'pointerDigest'>;
//# sourceMappingURL=financialAnalyticsDelivery.d.ts.map