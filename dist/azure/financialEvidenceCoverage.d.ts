import type { ArtifactGeneration } from '../common/artifactGeneration';
export declare const FINANCIAL_EVIDENCE_COVERAGE_CONTRACT_VERSION_V1: "financial-evidence-coverage/v1";
export type FinancialEvidenceCoverageStateV1 = 'complete' | 'partial' | 'stale' | 'missing' | 'unavailable' | 'unknown';
export declare const FINANCIAL_EVIDENCE_COVERAGE_REASONS_V1: readonly ["coverage-complete", "capability-passport-missing", "capability-passport-invalid", "capability-passport-ownership-mismatch", "capability-passport-read-failed", "billing-capability-partial", "billing-capability-stale", "billing-capability-missing", "billing-capability-unavailable", "billing-capability-unknown", "billing-dependency-partial", "billing-dependency-stale", "billing-dependency-missing", "billing-dependency-unavailable", "billing-dependency-unverified", "billing-dependency-wrong-generation", "subscription-coverage-missing", "subscription-coverage-invalid", "filtered-scope-coverage-unproven"];
export type FinancialEvidenceCoverageReasonV1 = (typeof FINANCIAL_EVIDENCE_COVERAGE_REASONS_V1)[number];
export interface FinancialEvidenceCoverageSourceV1 {
    state: FinancialEvidenceCoverageStateV1;
    reasons: [FinancialEvidenceCoverageReasonV1, ...FinancialEvidenceCoverageReasonV1[]];
    generationId?: string;
    completeThrough?: string;
}
/**
 * Generation-bound, non-monetary qualification of one subscription's financial
 * evidence. It can explain or restrict confidence, but never supplies or
 * overrides a Financial Authority amount.
 */
export interface FinancialEvidenceCoverageProjectionV1 {
    contractVersion: typeof FINANCIAL_EVIDENCE_COVERAGE_CONTRACT_VERSION_V1;
    provider: 'azure';
    subscriptionId: string;
    publicationId: string;
    artifactGeneration: ArtifactGeneration;
    scope: {
        kind: 'subscription';
        subscriptionId: string;
    };
    state: FinancialEvidenceCoverageStateV1;
    reasons: [FinancialEvidenceCoverageReasonV1, ...FinancialEvidenceCoverageReasonV1[]];
    sources: {
        capabilityPassport: FinancialEvidenceCoverageSourceV1;
        billingDependency: FinancialEvidenceCoverageSourceV1;
    };
}
/** Exact dependency-free validator for the API/UI coverage boundary. */
export declare const isFinancialEvidenceCoverageProjectionV1: (value: unknown) => value is FinancialEvidenceCoverageProjectionV1;
//# sourceMappingURL=financialEvidenceCoverage.d.ts.map