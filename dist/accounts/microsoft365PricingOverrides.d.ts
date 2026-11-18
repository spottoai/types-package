/** Customer-supplied monthly rates; these are estimates, never evidence of invoiced charges or grant eligibility. */
export interface Microsoft365PricingOverride {
    skuId: string;
    currency: string;
    unitPriceMonthly: number;
    /** Inclusive calendar-month boundary; null applies to every earlier month. Legacy day dates remain readable. */
    effectiveFrom: string | null;
    /** Exclusive calendar-month boundary; null means no configured end. */
    effectiveTo: string | null;
    source: string;
}
/** How the tenant buys Microsoft 365; wording only, never a price calculation. */
export type Microsoft365AgreementChannel = 'enterprise_agreement' | 'enterprise_agreement_subscription' | 'csp' | 'mca' | 'other';
export declare const MICROSOFT365_AGREEMENT_CHANNELS: readonly Microsoft365AgreementChannel[];
/** Products a customer may mark as bought outside the agreement. */
export declare const MICROSOFT365_AGREEMENT_EXCLUDED_SKU_LIMIT = 200;
/**
 * Customer-stated commercial terms for one tenant. They change when an action can take effect (timing and wording),
 * never an estimated amount. Absent means Microsoft's subscription lifecycle dates are the only timing evidence.
 */
export interface Microsoft365AgreementTerms {
    channel: Microsoft365AgreementChannel | null;
    /** Next date a seat reduction can take effect (yyyy-mm-dd); null uses Microsoft's next lifecycle date. */
    reductionDate: string | null;
    /** Reductions are also allowed on each anniversary of reductionDate, up to agreementEndDate. */
    reductionRepeatsAnnually: boolean;
    /** Agreement end (yyyy-mm-dd) when it differs from the next reduction date; on or after reductionDate. */
    agreementEndDate: string | null;
    /** Added seats are ordered as true-ups rather than billed straight away; null when not stated. */
    additionsAreTrueUps: boolean | null;
    /** Products bought outside this agreement keep Microsoft's own lifecycle dates. Unique, case-insensitive. */
    excludedSkuIds: string[];
}
export interface Microsoft365PricingOverridesConfiguration {
    schemaVersion: 'microsoft-365-pricing-overrides/v1';
    tenantId: string;
    /** Opaque conditional-write revision; none denotes an absent document. */
    revision: string;
    overrides: Microsoft365PricingOverride[];
    updatedAt: string | null;
    updatedBy?: string | null;
    /** Optional agreement terms saved with the agreed prices; absent on documents written before the field existed. */
    agreementTerms?: Microsoft365AgreementTerms;
}
export interface Microsoft365PricingConfigurationResponse {
    /** Saved content is unreadable; managers may reset it using configuration.revision (the raw storage ETag). */
    unavailableReason?: 'invalid_configuration';
    configuration: Microsoft365PricingOverridesConfiguration;
    products: Array<{
        skuId: string;
        skuPartNumber: string;
        productName: string;
        category: 'paid' | 'free' | 'capacity' | 'unpriced';
        held?: boolean;
        purchasedUnits?: number | null;
        /** Only these supported markets allow a new or changed agreed rate for this product. */
        priceableCurrencies?: string[];
        referencePrices: Record<string, number | null>;
    }>;
    currencies: string[];
}
export interface Microsoft365PricingValidationError {
    /** One-based source row; CSV data starts at 2, manual entries at 1. */
    row: number;
    column?: string;
    message: string;
}
export interface Microsoft365PricingPreviewResponse {
    /** Current quantities valued by the portable projector; an estimate correction, never a claimed saving. */
    impact?: {
        currency: string;
        referenceMonthlyCost: number | null;
        agreedMonthlyCost: number | null;
        products: {
            skuId: string;
            referenceMonthlyCost: number | null;
            agreedMonthlyCost: number | null;
        }[];
    };
    revision: string;
    overrides: Microsoft365PricingOverride[];
    rows: Array<Microsoft365PricingOverride & {
        row: number;
    }>;
    errors: Microsoft365PricingValidationError[];
    canSave: boolean;
}
export interface Microsoft365PricingProjection {
    status: 'applied' | 'partial' | 'unavailable';
    revision: string;
    /** UTC date on which the effective rates were selected. */
    asOf: string;
    reason?: string;
}
export declare const isMicrosoft365PricingDate: (value: unknown) => value is string;
export declare const isMicrosoft365PricingRevision: (value: unknown) => value is string;
export declare function isMicrosoft365PricingOverride(value: unknown): value is Microsoft365PricingOverride;
/** Shape and date-order validation only. Whether excluded products belong to the tenant remains API policy. */
export declare function isMicrosoft365AgreementTerms(value: unknown): value is Microsoft365AgreementTerms;
/** Shape and interval validation only. Company authorization and inventory matching remain API policy. */
export declare function isMicrosoft365PricingOverridesConfiguration(value: unknown): value is Microsoft365PricingOverridesConfiguration;
export declare function isMicrosoft365PricingOverrides(value: unknown): value is Microsoft365PricingOverride[];
export declare function isMicrosoft365PricingProjection(value: unknown): value is Microsoft365PricingProjection;
//# sourceMappingURL=microsoft365PricingOverrides.d.ts.map