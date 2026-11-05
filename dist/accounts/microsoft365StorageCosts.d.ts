import type { Microsoft365ContentAvailability } from './microsoft365LicensingContent';
export declare const MICROSOFT_365_STORAGE_PRODUCTS: readonly ["sharepoint-extra-file-storage", "sharepoint-storage-payg", "sharepoint-archive", "onedrive-archive", "dataverse-database", "dataverse-file", "dataverse-log"];
export type Microsoft365StorageProduct = (typeof MICROSOFT_365_STORAGE_PRODUCTS)[number];
/** A selected-currency rate, never proof of a customer's invoice or Azure charge. */
export interface Microsoft365StorageRate {
    id: string;
    product: Microsoft365StorageProduct;
    unit: 'gb_month' | 'gb_day';
    /** Null when the provider's GB-to-byte convention has not been established. */
    bytesPerGb: number | null;
    amount: number | null;
    term: 'annual_commitment' | 'monthly' | 'pay_as_you_go' | 'unspecified';
    taxTreatment: 'inclusive' | 'exclusive' | 'unspecified';
    source: {
        kind: 'microsoft_public' | 'reseller' | 'azure_retail' | 'customer_agreement';
        /** Public sources require HTTPS; private customer agreements may omit the URL. */
        url: string | null;
        checkedAt: string;
    } | null;
    /** Preserve the source quote; amount = quoted amount / normalizationDivisor. */
    quote: {
        amount: number;
        period: 'year' | 'month' | 'day';
        normalizationDivisor: number;
    } | null;
    availability: Microsoft365ContentAvailability;
}
/** Non-additive capacity comparison. Does not represent billed spend or savings. */
export interface Microsoft365StorageCostEstimate {
    id: string;
    product: Microsoft365StorageProduct;
    purpose: 'purchased_capacity' | 'usage_capacity' | 'unassigned_license_capacity_replacement';
    /** Required for replacement comparisons; identifies the license SKU, never a person. */
    skuPartNumber: string | null;
    rateId: string | null;
    /** Quantity in the referenced rate's GB convention; null if conversion is unknown. */
    quantityGb: number | null;
    /** Monthly rates are recurring values; daily rates require an explicit dated window. */
    period: {
        kind: 'month';
    } | {
        kind: 'window';
        startDate: string;
        endDate: string;
    };
    chargeableDays: number | null;
    /** Unrounded quantity × rate × chargeable days (daily rates only); round for display. */
    amount: number | null;
    basis: 'reference_price_estimate' | 'agreed_price_estimate';
    availability: Microsoft365ContentAvailability;
}
/** Optional sibling of usage/entitlement. No blended spend or additive savings total. */
export interface Microsoft365StorageCostView {
    generatedAt: string;
    availability: Microsoft365ContentAvailability;
    currencies: {
        currency: string;
        rates: Microsoft365StorageRate[];
        estimates: Microsoft365StorageCostEstimate[];
    }[];
}
//# sourceMappingURL=microsoft365StorageCosts.d.ts.map