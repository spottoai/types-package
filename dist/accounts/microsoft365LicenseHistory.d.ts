import { type Microsoft365PricingFacts } from './microsoft365PricingFacts';
import { type Microsoft365CoverageState, type Microsoft365LicenseInsights, type Microsoft365LicensePricing, type Microsoft365LicenseView, type Microsoft365SourceRecord } from './microsoft365Licenses';
import { type Microsoft365LicenseHistoryUsage, type Microsoft365LicenseProductUsage } from './microsoft365Usage';
/** Tenant month folder name, `YYYY-MM` in UTC. */
export type Microsoft365LicenseHistoryMonthKey = string;
/** True for a `YYYY-MM` month key. */
export declare const isMicrosoft365LicenseHistoryMonthKey: (value: unknown) => value is Microsoft365LicenseHistoryMonthKey;
/** UTC month of an ISO timestamp, for example `2026-10`; null for an unparseable timestamp. */
export declare const microsoft365LicenseHistoryMonthOf: (timestamp: string) => Microsoft365LicenseHistoryMonthKey | null;
/** Duplicate and downgrade counts for a month; the findings themselves are account rows and are not kept. */
export type Microsoft365LicenseHistoryInsights = Pick<Microsoft365LicenseInsights, 'rulesVersion' | 'overlapAssignmentCount' | 'overlapAccountCount' | 'downgradeCandidateCount' | 'downgradeEvidence'>;
/**
 * One tenant month, stored by the engine at `azure-portal/tenants/{tenantId}/microsoft-365/history/{YYYY-MM}/licenses.json.gz`.
 * The last scan of the month with complete license inventory replaces it. It keeps product quantities and the
 * list-price estimates computed that month, never account, user or usage-report rows.
 */
export interface Microsoft365LicenseHistorySnapshot {
    pricingFacts?: Microsoft365PricingFacts;
    usage?: Microsoft365LicenseHistoryUsage;
    /** Full-population counts keyed by lower-case skuId, with no account identities. */
    productUsage?: Record<string, Microsoft365LicenseProductUsage>;
    schemaVersion: 'microsoft-365-license-history/v1';
    tenantId: string;
    month: Microsoft365LicenseHistoryMonthKey;
    /** `generatedAt` of the license view this month was taken from. */
    generatedAt: string;
    tenantSyncRunId?: string;
    /** Source coverage state at the time; later sources are absent on views that did not collect them. */
    coverage: Microsoft365SourceRecord<Microsoft365CoverageState>;
    summary: Microsoft365LicenseView['summary'];
    insights?: Microsoft365LicenseHistoryInsights;
    /** The view's stored estimates: per-account values are empty and account id lists are omitted. */
    pricingByCurrency: Record<string, Microsoft365LicensePricing>;
}
/** API-derived quantities from stored pricing blocks; no price/currency or account data. */
export interface Microsoft365LicenseProductQuantities {
    purchasedUnits: number | null;
}
/** One month served by the API in the requested estimate currency, oldest month first. */
export interface Microsoft365LicenseHistoryMonth {
    /** Currency-independent SKU quantities. Omission is unknown coverage, not zero or absent stock. */
    productQuantities?: Record<string, Microsoft365LicenseProductQuantities>;
    pricingFacts?: Microsoft365PricingFacts;
    usage?: Microsoft365LicenseHistoryUsage;
    productUsage?: Record<string, Microsoft365LicenseProductUsage>;
    month: Microsoft365LicenseHistoryMonthKey;
    generatedAt: string;
    coverage: Microsoft365SourceRecord<Microsoft365CoverageState>;
    summary: Microsoft365LicenseView['summary'];
    insights?: Microsoft365LicenseHistoryInsights;
    /** Null when no estimate in the requested currency was stored for this month, or no currency was requested. */
    pricing: Microsoft365LicensePricing | null;
}
export interface Microsoft365LicenseHistory {
    pricingRevision?: string;
    schemaVersion: 'microsoft-365-license-history-series/v1';
    tenantId: string;
    /** Requested estimate currency; null serves quantities only. */
    currency: string | null;
    /** Months with a stored snapshot, oldest first. Months without a scan are absent, never zero. */
    months: Microsoft365LicenseHistoryMonth[];
}
/** Validates one stored tenant month at storage and API boundaries. */
export declare function isMicrosoft365LicenseHistorySnapshot(value: unknown): value is Microsoft365LicenseHistorySnapshot;
/** Validates the API series served to the portal. */
export declare function isMicrosoft365LicenseHistory(value: unknown): value is Microsoft365LicenseHistory;
//# sourceMappingURL=microsoft365LicenseHistory.d.ts.map