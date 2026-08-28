import type { CostBasis, EstimateLens } from './costComposition';
import type { FinancialEvidenceAssessmentSummaryV1, FinancialEvidenceIntervalV1, FinancialScopeKindV2 } from './financialScopeEvidence';
export declare const FINANCIAL_SCOPE_BASELINE_SCHEMA_VERSION_V2: 2;
export declare const FINANCIAL_SCOPE_BASELINE_CONTRACT_VERSION_V2: "financial-scope-baseline/v2";
export type FinancialWindowKindV2 = 'rolling-30-days' | 'calendar-month' | 'provider-billing-period' | 'stable-billing-window' | 'analytics-history' | 'daily';
export interface FinancialBaselineCoverageV2 {
    coverageId: string;
    interval: FinancialEvidenceIntervalV1;
    settlementState: 'settled' | 'unsettled' | 'mixed' | 'unknown';
    evidenceRefIds: [string, ...string[]];
}
export interface FinancialBaselinePeriodV2 {
    windowKind: FinancialWindowKindV2;
    requested: FinancialEvidenceIntervalV1;
    /** Absent when the requested window could not produce any matched evidence. */
    observed?: FinancialEvidenceIntervalV1;
    providerBillingPeriodId?: string;
    /** Evidence-artifact spans, not additive day partitions; distinct evidence roles may overlap. */
    coverage: FinancialBaselineCoverageV2[];
    /** Unavailable subintervals may sit within a produced artifact span; daily consumers reconcile their own points and gaps. */
    gaps: FinancialEvidenceIntervalV1[];
}
/** A period with produced evidence; required by every available monetary authority. */
export interface AvailableFinancialBaselinePeriodV2 extends FinancialBaselinePeriodV2 {
    observed: FinancialEvidenceIntervalV1;
    coverage: [FinancialBaselineCoverageV2, ...FinancialBaselineCoverageV2[]];
}
/**
 * True only when the produced evidence covers the entire requested interval.
 * Partial periods remain valid monetary evidence for display and forecasting,
 * but must not be used as the current side of an optimization projection.
 */
export declare const isCompleteFinancialBaselinePeriodV2: (period: FinancialBaselinePeriodV2) => boolean;
interface FinancialScopeBaselineRequestV2 {
    schemaVersion: typeof FINANCIAL_SCOPE_BASELINE_SCHEMA_VERSION_V2;
    contractVersion: typeof FINANCIAL_SCOPE_BASELINE_CONTRACT_VERSION_V2;
    provider: 'azure';
    providerAccountRefs: [string, ...string[]];
    scopeKind: FinancialScopeKindV2;
    scopeId: string;
    period: FinancialBaselinePeriodV2;
    costBasis: CostBasis;
    estimateLens: EstimateLens;
    requestedCurrencyCode?: string;
    assessmentId: string;
}
export interface FinancialAccountingCurrencyV2 {
    currencyCode: string;
    sourceCurrencyCode: string;
    evidenceRefIds: [string, ...string[]];
    fxEvidenceRefId?: string;
}
export interface FinancialChargeInclusionPolicyRefV2 {
    policyId: string;
    policyDigest: string;
}
export type FinancialChargeClassificationV2 = 'usage' | 'purchase' | 'adjustment' | 'tax' | 'credit' | 'refund' | 'residual';
export interface FinancialOwnerBaselineComponentV2 {
    componentId: string;
    billableIdentity: string;
    ownerScopeId: string;
    chargeClassification: FinancialChargeClassificationV2;
    amount: string;
    evidenceRefIds: [string, ...string[]];
    coverageIds: [string, ...string[]];
    quantity?: {
        amount: string;
        unit: string;
    };
    effectiveRate?: {
        amount: string;
        unit: string;
        currencyCode: string;
    };
}
export interface FinancialOwnerBaselineReconciliationV2 {
    status: 'reconciled';
    componentTotal: string;
    sourceTotal: string;
    withheldTotal: string;
    residualTotal: string;
    difference: '0';
}
export interface AvailableOwnerFinancialScopeBaselineV2 extends FinancialScopeBaselineRequestV2 {
    status: 'available';
    baselineKind: 'owner';
    scopeKind: Extract<FinancialScopeKindV2, 'canonical-resource-owner' | 'composite-resource' | 'commitment-instrument' | 'subscription-residual'>;
    period: AvailableFinancialBaselinePeriodV2;
    baselineId: string;
    evidenceBundleId: string;
    accountingCurrency: FinancialAccountingCurrencyV2;
    chargeInclusionPolicyRef: FinancialChargeInclusionPolicyRefV2;
    components: [FinancialOwnerBaselineComponentV2, ...FinancialOwnerBaselineComponentV2[]];
    total: {
        amount: string;
        currencyCode: string;
    };
    reconciliation: FinancialOwnerBaselineReconciliationV2;
}
export interface FinancialAggregateCompatibilityV2 {
    period: 'compatible';
    costBasis: 'compatible';
    estimateLens: 'compatible';
    accountingCurrency: 'compatible';
    membership: 'non-overlapping';
}
export interface FinancialAggregateBaselineReconciliationV2 {
    status: 'reconciled';
    memberTotal: string;
    residualTotal: string;
    difference: '0';
}
export interface AvailableAggregateFinancialScopeBaselineV2 extends FinancialScopeBaselineRequestV2 {
    status: 'available';
    baselineKind: 'aggregate';
    scopeKind: Extract<FinancialScopeKindV2, 'subscription-aggregate' | 'portfolio-currency-group'>;
    period: AvailableFinancialBaselinePeriodV2;
    baselineId: string;
    accountingCurrencyCode: string;
    memberBaselineIds: [string, ...string[]];
    compatibility: FinancialAggregateCompatibilityV2;
    total: {
        amount: string;
        currencyCode: string;
    };
    reconciliation: FinancialAggregateBaselineReconciliationV2;
    components?: never;
    evidenceBundleId?: never;
}
export declare const FINANCIAL_SCOPE_BASELINE_UNAVAILABLE_REASONS_V2: readonly ["evidence-not-produced", "evidence-not-matched", "period-unresolved", "coverage-incomplete", "basis-unavailable", "estimate-lens-unavailable", "currency-unresolved", "currency-conflicting", "component-identity-unavailable", "ownership-unresolved", "ownership-conflict", "mixed-generation", "member-incompatible", "reconciliation-failure", "scope-membership-empty", "unsupported-scope"];
export type FinancialScopeBaselineUnavailableReasonV2 = (typeof FINANCIAL_SCOPE_BASELINE_UNAVAILABLE_REASONS_V2)[number];
export interface UnavailableFinancialScopeBaselineV2 extends FinancialScopeBaselineRequestV2 {
    status: 'unavailable';
    unavailableReason: FinancialScopeBaselineUnavailableReasonV2;
    summary: FinancialEvidenceAssessmentSummaryV1;
    baselineKind?: never;
    baselineId?: never;
    evidenceBundleId?: never;
    accountingCurrency?: never;
    accountingCurrencyCode?: never;
    chargeInclusionPolicyRef?: never;
    components?: never;
    memberBaselineIds?: never;
    compatibility?: never;
    total?: never;
    reconciliation?: never;
}
export type FinancialScopeBaselineEnvelopeV2 = AvailableOwnerFinancialScopeBaselineV2 | AvailableAggregateFinancialScopeBaselineV2 | UnavailableFinancialScopeBaselineV2;
export type FinancialOwnerBaselineIdentityPreimageV2 = Omit<AvailableOwnerFinancialScopeBaselineV2, 'status' | 'baselineId' | 'total' | 'reconciliation'>;
export type FinancialAggregateBaselineIdentityPreimageV2 = Omit<AvailableAggregateFinancialScopeBaselineV2, 'status' | 'baselineId' | 'total' | 'reconciliation'>;
export type FinancialScopeBaselineIdentityPreimageV2 = FinancialOwnerBaselineIdentityPreimageV2 | FinancialAggregateBaselineIdentityPreimageV2;
export {};
//# sourceMappingURL=financialScopeBaseline.d.ts.map