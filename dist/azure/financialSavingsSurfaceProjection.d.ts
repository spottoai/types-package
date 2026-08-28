import type { ArtifactGeneration } from '../common/artifactGeneration';
import type { CostBasis, EstimateLens } from './costComposition';
import type { FinancialBaselinePeriodV2, FinancialChargeInclusionPolicyRefV2 } from './financialScopeBaseline';
import type { FinancialSavingsUnavailableReasonV1 } from './financialSavingsAuthority';
export declare const FINANCIAL_SAVINGS_SURFACE_PROJECTION_SCHEMA_VERSION_V1: 1;
export declare const FINANCIAL_SAVINGS_SURFACE_PROJECTION_CONTRACT_VERSION_V1: "financial-savings-surface-projection/v1";
export type FinancialSavingsSurfaceV1 = 'recommendations' | 'dashboard';
export type FinancialSavingsSurfaceScopeV1 = {
    kind: 'subscription-full';
} | {
    kind: 'recommendation-query';
    filterFingerprint: string;
    /** Complete matched recommendation set before sorting and pagination. */
    recommendationIds: string[];
};
export interface FinancialSavingsRecommendationContributionV1 {
    recommendationId: string;
    allocationIds: [string, ...string[]];
    savingsMinorUnits: number;
}
interface FinancialSavingsSurfaceCoordinateCommonV1 {
    /** Identity of the exact source Financial Authority coordinate. */
    coordinateId: string;
    periodRole: 'current' | 'previous';
    period: FinancialBaselinePeriodV2;
    costBasis: CostBasis;
    estimateLens: EstimateLens;
    /** Exact charge scope inherited from the current Financial Authority baseline. */
    chargeInclusionPolicyRef: FinancialChargeInclusionPolicyRefV2;
    requestedCurrencyCode?: string;
    currentAggregateBaselineId?: string;
}
export interface AvailableFinancialSavingsSurfaceCoordinateV1 extends FinancialSavingsSurfaceCoordinateCommonV1 {
    status: 'available';
    currentAggregateBaselineId: string;
    currentAggregate: {
        amount: string;
        currencyCode: string;
    };
    accountingCurrencyCode: string;
    minorUnitScale: number;
    roundingMode: 'half-away-from-zero';
    recommendationContributions: FinancialSavingsRecommendationContributionV1[];
    aggregate: {
        allocationIds: string[];
        savingsMinorUnits: number;
    };
}
/** Proven contributions retained while one or more in-scope scenarios lack target evidence. */
export interface PartialFinancialSavingsSurfaceCoordinateV1 extends Omit<AvailableFinancialSavingsSurfaceCoordinateV1, 'status'> {
    status: 'partial';
    unavailableRecommendationIds: [string, ...string[]];
}
export interface UnavailableFinancialSavingsSurfaceCoordinateV1 extends FinancialSavingsSurfaceCoordinateCommonV1 {
    status: 'unavailable';
    unavailableReason: FinancialSavingsUnavailableReasonV1;
}
export type FinancialSavingsSurfaceCoordinateEnvelopeV1 = AvailableFinancialSavingsSurfaceCoordinateV1 | PartialFinancialSavingsSurfaceCoordinateV1 | UnavailableFinancialSavingsSurfaceCoordinateV1;
export interface FinancialSavingsSurfaceProjectionV1 {
    schemaVersion: typeof FINANCIAL_SAVINGS_SURFACE_PROJECTION_SCHEMA_VERSION_V1;
    contractVersion: typeof FINANCIAL_SAVINGS_SURFACE_PROJECTION_CONTRACT_VERSION_V1;
    projectionId: string;
    surface: FinancialSavingsSurfaceV1;
    scope: FinancialSavingsSurfaceScopeV1;
    provider: 'azure';
    providerAccountRefs: [string, ...string[]];
    artifactGeneration: ArtifactGeneration;
    financialAuthorityId: string;
    savingsAuthorityId: string;
    coordinates: [FinancialSavingsSurfaceCoordinateEnvelopeV1, ...FinancialSavingsSurfaceCoordinateEnvelopeV1[]];
}
export type FinancialSavingsSurfaceProjectionIdentityPreimageV1 = Omit<FinancialSavingsSurfaceProjectionV1, 'projectionId'>;
export {};
//# sourceMappingURL=financialSavingsSurfaceProjection.d.ts.map