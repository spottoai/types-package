import { type Microsoft365AccountReview } from './microsoft365AccountReview';
import { type Microsoft365PricingProjection } from './microsoft365PricingOverrides';
import { type Microsoft365LicenseInsight, type Microsoft365LicenseInsights, type Microsoft365LicensePricing, type Microsoft365LicenseView, type Microsoft365LicensedAccountRow } from './microsoft365Licenses';
import { type Microsoft365CapabilityNotice, type Microsoft365CapabilityProjection } from './microsoft365Capabilities';
import { type Microsoft365UsageSummary } from './microsoft365Usage';
export declare const MICROSOFT_365_LICENSE_ACCOUNT_ROW_LIMIT = 5000;
/** Detail counts describe observed licensed accounts, not proof of a complete tenant population. */
export interface Microsoft365LicenseAccountDetails {
    observedRowCount: number;
    returnedRowCount: number;
    omittedRowCount: number;
}
/** Full-population list-price estimates: annual commitment per month, excluding tax, in the declared currency. */
export type Microsoft365LicenseSummaryPricing = Omit<Microsoft365LicensePricing, 'accountMonthlyCosts' | 'paidAccountIds' | 'partialAccountPriceIds'>;
/** Aggregate rule evidence for reporting. Contains no account identity or person-level evidence. */
export interface Microsoft365LicenseInsightPattern {
    kind: Microsoft365LicenseInsight['kind'];
    ruleId: string;
    skuId: string;
    targetSkuId: string | null;
    /** Publisher product reference remains available when a concrete SKU ID cannot be resolved. */
    targetSkuPartNumber: string | null;
    targetProductName?: string | null;
    coveredBySkuIds: string[];
    count: number;
}
export interface Microsoft365LicenseSummaryInsights extends Omit<Microsoft365LicenseInsights, 'findings'> {
    /** All observed findings, including blocked downgrade facts excluded from candidate patterns. */
    observedFindingCount?: number;
    patterns: Microsoft365LicenseInsightPattern[];
}
export type Microsoft365LicenseSummaryCapabilities = Omit<Microsoft365CapabilityProjection, 'notices' | 'omittedNoticeCount'>;
/** Anonymous report-row counts are independent of enabled/licensed account denominators. */
export interface Microsoft365AnonymousWorkloadUsage {
    basis: 'report_rows';
    reportRefreshDate: string | null;
    windowDays: 30;
    observedRowCount: number;
    workloads: Record<'exchange' | 'oneDrive' | 'sharePoint' | 'teams' | 'vivaEngage', {
        active: number;
        inactive: number;
        noRecordedActivity: number;
        unknown: number;
    }>;
}
export interface Microsoft365LicenseSummaryUsage extends Microsoft365UsageSummary {
    anonymousWorkloads?: Microsoft365AnonymousWorkloadUsage;
}
/** Stored summary and API selected-currency summary. No people or raw Graph report rows. */
export interface Microsoft365LicenseSummaryView extends Omit<Microsoft365LicenseView, 'schemaVersion' | 'tenantSyncRunId' | 'accounts' | 'reports' | 'pricingByCurrency' | 'pricing' | 'insights' | 'capabilities' | 'usage'> {
    schemaVersion: 'microsoft-365-license-summary/v1';
    /** Both summary and accounts must carry exactly the same scan ID and generatedAt. */
    tenantSyncRunId: string;
    accountDetails: Microsoft365LicenseAccountDetails;
    /** API projection after Keep decisions and non-saving downgrade suppression; absent on older responses. */
    accountReview?: Microsoft365AccountReview;
    pricingByCurrency?: Record<string, Microsoft365LicenseSummaryPricing>;
    pricing?: Microsoft365LicenseSummaryPricing;
    insights?: Microsoft365LicenseSummaryInsights;
    capabilities?: Microsoft365LicenseSummaryCapabilities;
    usage?: Microsoft365LicenseSummaryUsage;
}
/** API enrichment in one selected currency; monthly list-price estimates, annual commitment, excluding tax. */
export interface Microsoft365LicenseAccountPricing {
    basis?: Microsoft365LicensePricing['basis'];
    projection?: Microsoft365PricingProjection;
    currency: string;
    accountMonthlyCosts: Record<string, number>;
    paidAccountIds?: string[];
    partialAccountPriceIds?: string[];
}
/** Independently loaded people detail. Readers compare both scan stamps before combining siblings. */
export interface Microsoft365LicenseAccountsView {
    pricingRevision?: string;
    schemaVersion: 'microsoft-365-license-accounts/v1';
    tenantId: string;
    generatedAt: string;
    tenantSyncRunId: string;
    accountDetails: Microsoft365LicenseAccountDetails;
    accounts: Microsoft365LicensedAccountRow[];
    insights?: {
        rulesVersion: string;
        findings: Microsoft365LicenseInsight[];
    };
    capabilities?: {
        catalogueVersion: string;
        notices: Microsoft365CapabilityNotice[];
        observedNoticeCount: number;
        omittedNoticeCount: number;
    };
    pricing?: Microsoft365LicenseAccountPricing;
}
/** Strict aggregate pricing boundary; omitted person-price properties must be absent even when empty. */
export declare function isMicrosoft365LicenseSummaryPricing(value: unknown): value is Microsoft365LicenseSummaryPricing;
/** Validates the summary privacy boundary independently of the legacy view's 2,000-row limit. */
export declare function isMicrosoft365LicenseSummaryView(value: unknown): value is Microsoft365LicenseSummaryView;
/** Validates up to 5,000 people and keeps findings/notices/prices within the returned account set. */
export declare function isMicrosoft365LicenseAccountsView(value: unknown): value is Microsoft365LicenseAccountsView;
//# sourceMappingURL=microsoft365LicensePortal.d.ts.map