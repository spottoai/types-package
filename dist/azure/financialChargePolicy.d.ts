import type { CostBasis } from './costComposition.js';
import type { MoneyUnavailableReason } from './costComposition.js';
import type { SavingsAggregateV2 } from './savings.js';
export declare const AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_REF_V1: "azure-cloud-services-excluding-marketplace/v1";
export type AzureFinancialChargePolicyRefV1 = typeof AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_REF_V1;
export type AzureFinancialChargeSourceV1 = 'azure-native' | 'marketplace' | 'unknown';
export type AzureNativeDiscountEligibilityV1 = 'all-eligible' | 'none-eligible' | 'mixed';
/** Gross membership proof; signed totals cannot prove a uniform discount. */
export declare const isAzureNativeDiscountEligibilityV1: (value: unknown) => value is AzureNativeDiscountEligibilityV1;
export type AzureFinancialChargeSourceUnknownReasonV1 = 'publisher-type-missing' | 'publisher-type-unsupported' | 'publisher-type-unrecognized';
/** One rolling-spend basis split by billing-backed and estimated provenance. */
export type AzureFinancialChargeSpendBasisTotalsV1 = {
    status: 'available';
    totalMinorUnits: number;
    billingBackedMinorUnits: number;
    estimatedMinorUnits: number;
} | {
    status: 'unavailable';
    reasonCode: MoneyUnavailableReason;
};
/** Billed and amortized projections for one financial charge source. */
export interface AzureFinancialChargeSpendSourceTotalsV1 {
    billed: AzureFinancialChargeSpendBasisTotalsV1;
    amortized: AzureFinancialChargeSpendBasisTotalsV1;
}
/** Subject whose rolling spend is represented by the breakdown. */
export type AzureFinancialChargeSpendSubjectV1 = {
    kind: 'provider-scope';
    providerScopeId: string;
} | {
    kind: 'resource';
    providerScopeId: string;
    resourceId: string;
};
/** Evidence that keeps material unknown rows distinct from their signed net. */
export interface AzureFinancialChargeUnknownMaterialV1 {
    nonZeroRowCount: number;
    billedAbsoluteMinorUnits: number;
    amortizedAbsoluteMinorUnits: number;
}
/**
 * Rolling resource-page spend partition. This deliberately remains separate from
 * the fixed formal-report coordinate because its period follows the page's
 * rolling cost window.
 */
export interface AzureFinancialChargeSpendBreakdownV1<TSubject extends AzureFinancialChargeSpendSubjectV1 = AzureFinancialChargeSpendSubjectV1> {
    contractVersion: 'financial-charge-spend/v1';
    policyRef: AzureFinancialChargePolicyRefV1;
    generationId: string;
    subject: TSubject;
    period: {
        startDate: string;
        endDateExclusive: string;
    };
    currencyCode: string;
    minorUnitScale: number;
    status: 'complete' | 'partial';
    allCharge: AzureFinancialChargeSpendSourceTotalsV1;
    azureNative: AzureFinancialChargeSpendSourceTotalsV1;
    /**
     * Unadjusted subset of azureNative eligible for the configured native discount,
     * on this exact subject/generation/period/currency and with matching provenance.
     * Excludes authoritative PricingModel Reservation/SavingsPlan charges, including
     * their purchases/refunds. Marketplace and unknown-source amounts are ineligible.
     * Native rows lacking pricing-model evidence keep legacy eligibility; they are
     * not classified as OnDemand. Estimates require the existing native-source proof.
     * Absence/unavailable means eligibility was not produced; zero is a produced zero.
     * Never add this subset to allCharge or substitute billed for amortized.
     */
    azureNativeDiscountEligible?: AzureFinancialChargeSpendSourceTotalsV1;
    /** Membership of native input rows, even when amounts cancel or are zero. */
    azureNativeDiscountEligibility?: AzureNativeDiscountEligibilityV1;
    marketplace: AzureFinancialChargeSpendSourceTotalsV1;
    unknown: AzureFinancialChargeSpendSourceTotalsV1;
    unknownMaterial: AzureFinancialChargeUnknownMaterialV1;
}
export type AzureProviderScopeFinancialChargeSpendBreakdownV1 = AzureFinancialChargeSpendBreakdownV1<Extract<AzureFinancialChargeSpendSubjectV1, {
    kind: 'provider-scope';
}>>;
export type AzureResourceFinancialChargeSpendBreakdownV1 = AzureFinancialChargeSpendBreakdownV1<Extract<AzureFinancialChargeSpendSubjectV1, {
    kind: 'resource';
}>>;
export declare const DECOMPOSITION_TREE_FINANCIAL_CHARGE_SOURCE_COSTS_CONTRACT_V1: "financial-charge-source-costs/v1";
/**
 * Signed source split for one cost basis of one Cost Tree subject and period, in
 * minor units of the tree's currency. Parts are rounded to minor units first and
 * `allChargeMinorUnits` is their exact sum, so it can differ from the rounded
 * all-charge `cost` field by display rounding. Marketplace and unknown amounts are
 * never discounted; `status: 'partial'` means material unknown-source rows exist.
 */
export interface DecompositionTreeFinancialChargeSourceBasisCostsV1 {
    allChargeMinorUnits: number;
    azureNativeMinorUnits: number;
    /**
     * Unadjusted discount-eligible subset of azureNativeMinorUnits for this basis.
     * Uses the same known-commitment exclusion/legacy fallback as
     * AzureFinancialChargeSpendBreakdownV1.azureNativeDiscountEligible, and inherits
     * the tree's currency, scale, generation and node/period identity.
     * Missing is unavailable evidence, not zero. Signed credits/refunds are retained;
     * this subset can exceed the signed native net when excluded refunds are present.
     */
    azureNativeDiscountEligibleMinorUnits?: number;
    azureNativeDiscountEligibility?: AzureNativeDiscountEligibilityV1;
    marketplaceMinorUnits: number;
    unknownMinorUnits: number;
    /** Sum of absolute unknown-source amounts, so offsetting unknown rows stay visible. */
    unknownAbsoluteMinorUnits: number;
    unknownNonZeroRowCount: number;
    status: 'complete' | 'partial';
}
/** Billed and amortized source splits for one Cost Tree period. */
export interface DecompositionTreeFinancialChargeSourcePeriodCostsV1 {
    billed: DecompositionTreeFinancialChargeSourceBasisCostsV1;
    /** Absent when any contributing billing row lacks amortized evidence. Never substitute billed. */
    amortized?: DecompositionTreeFinancialChargeSourceBasisCostsV1;
}
/**
 * Per-node source amounts for the node's own billing rows. Contract identity,
 * policy and minor-unit scale are declared once on the tree-level
 * `financialChargeSourceCosts` header and apply to every node.
 */
export interface DecompositionTreeNodeFinancialChargeSourceCostsV1 {
    /** Source split for `cost`/`costAmortized`. */
    current?: DecompositionTreeFinancialChargeSourcePeriodCostsV1;
    /** Source split for `costPrevious`/`costAmortizedPrevious`. */
    previous?: DecompositionTreeFinancialChargeSourcePeriodCostsV1;
}
/**
 * Tree-level header plus source amounts for the tree's `totalSpend*` fields.
 * Produced by cloud-engine during normal tree generation (tree version 2.1+).
 * Stored amounts are unadjusted provider evidence; configured discounts are
 * applied by the API on read and are never written back.
 */
export interface DecompositionTreeFinancialChargeSourceCostsV1 extends DecompositionTreeNodeFinancialChargeSourceCostsV1 {
    contractVersion: typeof DECOMPOSITION_TREE_FINANCIAL_CHARGE_SOURCE_COSTS_CONTRACT_V1;
    policyRef: AzureFinancialChargePolicyRefV1;
    minorUnitScale: number;
}
/** Publisher evidence retained from the provider billing source before financial classification. */
export type AzurePublisherTypeEvidenceV1 = {
    status: 'available';
    publisherType: string;
    publisherName?: string;
} | {
    status: 'unavailable';
    reasonCode: Exclude<AzureFinancialChargeSourceUnknownReasonV1, 'publisher-type-unrecognized'>;
};
/** Result of classifying one billing component. Display heuristics are not authoritative inputs. */
export type AzureFinancialChargeClassificationV1 = {
    source: 'azure-native' | 'marketplace';
    publisherType: string;
    publisherName?: string;
} | {
    source: 'unknown';
    reasonCode: AzureFinancialChargeSourceUnknownReasonV1;
    publisherType?: string;
    publisherName?: string;
};
/** One immutable financial coordinate shared by cost coverage and savings authority. */
export interface AzureFinancialCoordinateV1 {
    generationId: string;
    providerName: 'azure';
    providerScopeId: string;
    basis: CostBasis;
    period: {
        startDate: string;
        endDateExclusive: string;
    };
    currencyCode: string;
    minorUnitScale: number;
}
/** Signed partition totals. All-charge must equal Azure-native + Marketplace + unknown. */
export interface AzureFinancialChargeSourceTotalsV1 {
    allChargeMinorUnits: number;
    azureNativeMinorUnits: number;
    /**
     * Unadjusted discount-eligible subset for the enclosing financial coordinate's
     * basis/generation/period/currency. Same semantics as the rolling eligible field;
     * missing is not zero and this amount is not an additional source partition.
     * Commitments remain Azure-native in coverage and savings policy.
     */
    azureNativeDiscountEligibleMinorUnits?: number;
    azureNativeDiscountEligibility?: AzureNativeDiscountEligibilityV1;
    marketplaceMinorUnits: number;
    unknownMinorUnits: number;
    /** Sum of absolute values for material unknown-source rows, even when their signed net is zero. */
    unknownAbsoluteMinorUnits: number;
    rowCount: number;
    azureNativeRowCount: number;
    marketplaceRowCount: number;
    unknownRowCount: number;
    unknownNonZeroRowCount: number;
}
/** Complete reportable identity and selected-basis cost for a material unknown-source object. */
export interface AzureUnknownFinancialChargeObjectV1 {
    objectKey: string;
    name: string;
    resourceType: string;
    resourceId?: string;
    billableComponentKey: string;
    signedCostMinorUnits: number;
    absoluteCostMinorUnits: number;
    rowCount: number;
    nonZeroRowCount: number;
    reasonCodes: AzureFinancialChargeSourceUnknownReasonV1[];
}
/** Coverage for the fixed Marketplace-excluding policy at one financial coordinate. */
export interface AzureFinancialChargeCoverageV1 {
    contractVersion: 'financial-charge-policy/v1';
    policyRef: AzureFinancialChargePolicyRefV1;
    coordinate: AzureFinancialCoordinateV1;
    status: 'complete' | 'partial';
    sourceTotals: AzureFinancialChargeSourceTotalsV1;
    /** Sorted by objectKey and complete for all material unknown-source rows. */
    unknownObjects: AzureUnknownFinancialChargeObjectV1[];
}
/** Canonical savings aggregate computed only from policy-eligible Azure-native billing components. */
export interface AzurePolicyBoundSavingsAggregateV1 {
    contractVersion: 'financial-charge-policy/v1';
    policyRef: AzureFinancialChargePolicyRefV1;
    coordinate: AzureFinancialCoordinateV1;
    coverage: AzureFinancialChargeCoverageV1;
    savingsAggregate: SavingsAggregateV2;
}
export type AzureChargeableSavingsUnavailableReasonV1 = 'partial-source-coverage' | 'policy-mismatch' | 'generation-mismatch' | 'coordinate-mismatch' | 'mixed-currency' | 'source-unavailable' | 'reconciliation-failed';
/** Billing input. A partial result cannot carry a numeric customer-charge value. */
export type AzureChargeableSavingsV1 = {
    contractVersion: 'financial-charge-policy/v1';
    policyRef: AzureFinancialChargePolicyRefV1;
    coordinate: AzureFinancialCoordinateV1;
    status: 'available';
    coverage: AzureFinancialChargeCoverageV1 & {
        status: 'complete';
    };
    savingsAggregate: SavingsAggregateV2;
    chargeableMaxSavingsMinorUnits: number;
} | {
    contractVersion: 'financial-charge-policy/v1';
    policyRef: AzureFinancialChargePolicyRefV1;
    coordinate: AzureFinancialCoordinateV1;
    status: 'unavailable';
    coverage: AzureFinancialChargeCoverageV1;
    reasonCodes: AzureChargeableSavingsUnavailableReasonV1[];
};
export type AzureCompanyChargeableSavingsUnavailableReasonV1 = AzureChargeableSavingsUnavailableReasonV1 | 'no-provider-scopes' | 'scope-unavailable' | 'mixed-minor-unit-scale';
export type AzureCompanyChargeableSavingsScopeResultV1 = {
    providerScopeId: string;
    status: 'available';
    generationId: string;
    basis: CostBasis;
    period: AzureFinancialCoordinateV1['period'];
    currencyCode: string;
    minorUnitScale: number;
    chargeableMaxSavingsMinorUnits: number;
} | {
    providerScopeId: string;
    status: 'unavailable';
    reasonCodes: AzureCompanyChargeableSavingsUnavailableReasonV1[];
};
export type AzureCompanyChargeableSavingsTotalV1 = {
    status: 'available';
    basis: CostBasis;
    period: AzureFinancialCoordinateV1['period'];
    currencyCode: string;
    minorUnitScale: number;
    chargeableMaxSavingsMinorUnits: number;
} | {
    status: 'unavailable';
    reasonCodes: AzureCompanyChargeableSavingsUnavailableReasonV1[];
};
/** Billing-facing company projection; every numeric value comes from producer-owned per-scope authority. */
export interface AzureCompanyChargeableSavingsResponseV1 {
    contractVersion: 'financial-charge-policy/v1';
    policyRef: AzureFinancialChargePolicyRefV1;
    companyId: string;
    scopeResults: AzureCompanyChargeableSavingsScopeResultV1[];
    companyTotal: AzureCompanyChargeableSavingsTotalV1;
}
/** Exact validator for one rolling all-charge/Azure-native/Marketplace/unknown partition. */
export declare const isAzureFinancialChargeSpendBreakdownV1: (value: unknown) => value is AzureFinancialChargeSpendBreakdownV1;
export declare const isAzureProviderScopeFinancialChargeSpendBreakdownV1: (value: unknown) => value is AzureProviderScopeFinancialChargeSpendBreakdownV1;
export declare const isAzureResourceFinancialChargeSpendBreakdownV1: (value: unknown) => value is AzureResourceFinancialChargeSpendBreakdownV1;
/** Validates both the resource-level shape and its binding to the enclosing resource ID. */
export declare const isAzureResourceFinancialChargeSpendBreakdownForResourceV1: (value: unknown, resourceId: string) => value is AzureResourceFinancialChargeSpendBreakdownV1;
/** Exact validator for the per-node Cost Tree source split. */
export declare const isDecompositionTreeNodeFinancialChargeSourceCostsV1: (value: unknown) => value is DecompositionTreeNodeFinancialChargeSourceCostsV1;
/** Exact validator for the tree-level Cost Tree source header and totals. */
export declare const isDecompositionTreeFinancialChargeSourceCostsV1: (value: unknown) => value is DecompositionTreeFinancialChargeSourceCostsV1;
/** Exact validator for publisher evidence retained from an Azure billing source. */
export declare const isAzurePublisherTypeEvidenceV1: (value: unknown) => value is AzurePublisherTypeEvidenceV1;
/** Exact validator for the authoritative classification of one billing component. */
export declare const isAzureFinancialChargeClassificationV1: (value: unknown) => value is AzureFinancialChargeClassificationV1;
export declare const isAzureFinancialCoordinateV1: (value: unknown) => value is AzureFinancialCoordinateV1;
export declare const isAzureFinancialChargeCoverageV1: (value: unknown) => value is AzureFinancialChargeCoverageV1;
export declare const isAzurePolicyBoundSavingsAggregateV1: (value: unknown) => value is AzurePolicyBoundSavingsAggregateV1;
export declare const isAzureChargeableSavingsV1: (value: unknown) => value is AzureChargeableSavingsV1;
/** Exact boundary validator for the company-level billing projection. */
export declare const isAzureCompanyChargeableSavingsResponseV1: (value: unknown) => value is AzureCompanyChargeableSavingsResponseV1;
//# sourceMappingURL=financialChargePolicy.d.ts.map