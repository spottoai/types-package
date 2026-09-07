import type { CostBasis } from './costComposition.js';
import type { SavingsAggregateV2 } from './savings.js';
export declare const AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_REF_V1: "azure-cloud-services-excluding-marketplace/v1";
export type AzureFinancialChargePolicyRefV1 = typeof AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_REF_V1;
export type AzureFinancialChargeSourceV1 = 'azure-native' | 'marketplace' | 'unknown';
export type AzureFinancialChargeSourceUnknownReasonV1 = 'publisher-type-missing' | 'publisher-type-unsupported' | 'publisher-type-unrecognized';
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