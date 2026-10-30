import { type Microsoft365PricingProjection } from './microsoft365PricingOverrides';
import { type Microsoft365AccountReviewReason } from './microsoft365AccountReview';
import { type Microsoft365PricingFacts } from './microsoft365PricingFacts';
import { type Microsoft365AccountCapabilities, type Microsoft365CapabilityProjection, type Microsoft365ProductCapabilities } from './microsoft365Capabilities';
import { type Microsoft365AccountProfile, type Microsoft365AccountUsage, type Microsoft365LicenseBreakdownRow, type Microsoft365LicenseProductUsage, type Microsoft365SignInStatus, type Microsoft365UsageSummary } from './microsoft365Usage';
export declare const MICROSOFT_365_LICENSE_SOURCES: readonly ["subscribedSkus", "users", "signInActivity", "reportSettings", "officeActiveUsers", "officeAppUsage", "copilotUsage", "subscriptions", "organization", "mailboxUsage", "oneDriveUsage", "officeActiveUserCounts"];
export type Microsoft365SourceName = (typeof MICROSOFT_365_LICENSE_SOURCES)[number];
/** Sources added after the first release. Artifacts and views collected earlier do not have them. */
export declare const MICROSOFT_365_LATER_LICENSE_SOURCES: readonly ["subscriptions", "organization", "mailboxUsage", "oneDriveUsage", "officeActiveUserCounts"];
export type Microsoft365LaterSourceName = (typeof MICROSOFT_365_LATER_LICENSE_SOURCES)[number];
/** Per-source record in which later sources are optional. */
export type Microsoft365SourceRecord<T> = Record<Exclude<Microsoft365SourceName, Microsoft365LaterSourceName>, T> & Partial<Record<Microsoft365LaterSourceName, T>>;
export type Microsoft365CoverageState = 'complete' | 'partial' | 'denied' | 'unavailable' | 'failed';
export type Microsoft365RecoveryAction = 'review_access' | 'retry_collection' | 'none';
export interface Microsoft365LicenseSource {
    endpoint: string;
    requiredPermissions: string[];
    state: Microsoft365CoverageState;
    reason?: string;
    httpStatus?: number;
    attemptedAt: string;
    observedAt: string | null;
    data: Record<string, unknown>[] | null;
    period?: 'D30' | 'D28' | 'D180';
    recovery?: {
        action: Microsoft365RecoveryAction;
        optional: boolean;
    };
}
export interface Microsoft365LicenseArtifact {
    schemaVersion: 'microsoft-365-licenses/v1';
    tenantId: string;
    generatedAt: string;
    tenantSyncRunId?: string;
    sources: Microsoft365SourceRecord<Microsoft365LicenseSource>;
    reportIdentity: {
        concealment: 'concealed' | 'identifiable' | 'unknown';
        correlation: 'not_performed' | 'performed' | 'identities_concealed';
    };
}
export interface Microsoft365LicenseCoverage extends Omit<Microsoft365LicenseSource, 'data' | 'endpoint' | 'recovery'> {
    recovery: {
        action: Microsoft365RecoveryAction;
        optional: boolean;
    };
    observedRowCount: number | null;
    omittedRowCount: number;
    /** Users coverage records account workload dates omitted by the view's byte guard. */
    notes?: 'workload_dates_omitted_for_size'[];
}
export interface Microsoft365LicenseRow {
    /** Full-population counts for enabled accounts holding this SKU; null when usage evidence is unavailable. */
    usage?: Microsoft365LicenseProductUsage | null;
    /** Live tenant service-plan evidence; absent on older snapshots. */
    capabilities?: Microsoft365ProductCapabilities;
    skuId: string;
    skuPartNumber: string;
    /** Engine-resolved display name; absent on older views or when product identity is unknown. */
    productName?: string;
    appliesTo: string | null;
    capabilityStatus: string | null;
    enabledUnits: number | null;
    consumedUnits: number | null;
    unallocatedUnits: number | null;
    warningUnits: number | null;
    suspendedUnits: number | null;
    /**
     * Commercial subscriptions for this product, earliest lifecycle date first; absent when subscription evidence was
     * not collected. `nextLifecycleDateTime` is when the subscription moves to its next state if it is not renewed.
     */
    renewals?: Microsoft365LicenseRenewal[];
}
export interface Microsoft365LicenseRenewal {
    /** Enabled, Warning (expired, in grace), Suspended, LockedOut or Deleted. */
    status: string | null;
    isTrial: boolean | null;
    totalLicenses: number | null;
    nextLifecycleDateTime: string | null;
}
export interface Microsoft365LicensedAccountRow {
    /** API's single primary review reason, after current license decisions; absent on stored/older rows. */
    mainReviewReason?: Microsoft365AccountReviewReason;
    /** Assignment enablement; neither provisioning success nor measured deployment/usage. */
    capabilities?: Microsoft365AccountCapabilities;
    id: string;
    displayName: string | null;
    userPrincipalName: string | null;
    accountEnabled: boolean | null;
    skuIds: string[] | null;
    lastSuccessfulSignInAt: string | null;
    signInOlderThan90Days: boolean | null;
    userType?: 'Member' | 'Guest' | null;
    createdAt?: string | null;
    /** Derived from the same evidence and 90-day thresholds as signInOlderThan90Days. */
    signInStatus?: Microsoft365SignInStatus;
    profile?: Microsoft365AccountProfile;
    usage?: Microsoft365AccountUsage;
}
export interface Microsoft365UsageRow {
    key: string;
    userPrincipalName: string | null;
    displayName: string | null;
    reportRefreshDate: string | null;
    lastActivityDate: string | null;
    fields: Record<string, string>;
}
export type Microsoft365UsageSource = 'officeActiveUsers' | 'officeAppUsage' | 'copilotUsage';
export interface Microsoft365LicenseView {
    /** Default estimate market derived from the tenant organization's country; not invoice currency evidence. */
    marketCurrency?: string;
    pricingFacts?: Microsoft365PricingFacts;
    pricingRevision?: string;
    /** Full-population usage counts computed before account/report detail trimming. */
    usage?: Microsoft365UsageSummary;
    /** Independent capability facts/notices; never silently added to monetary totals. */
    capabilities?: Microsoft365CapabilityProjection;
    schemaVersion: 'microsoft-365-license-view/v1';
    tenantId: string;
    generatedAt: string;
    tenantSyncRunId?: string;
    coverage: Microsoft365SourceRecord<Microsoft365LicenseCoverage>;
    reportIdentity: Microsoft365LicenseArtifact['reportIdentity'];
    summary: {
        productCount: number | null;
        licensedAccountCount: number | null;
        disabledLicensedAccountCount: number | null;
        /** Confirmed full-population minimum when an exact total is unavailable; independent of detail truncation. */
        observedLicensedAccountCount?: number;
        observedDisabledLicensedAccountCount?: number;
        accountsWithUnknownAssignments: number | null;
    };
    licenses: Microsoft365LicenseRow[];
    accounts: Microsoft365LicensedAccountRow[];
    reports: Record<Microsoft365UsageSource, Microsoft365UsageRow[]>;
    /**
     * Stored by the engine: one list-price estimate per supported market currency (for example USD, NZD, AUD).
     * The tenant view is shared across companies, so the API returns the viewer's market as `pricing` instead.
     */
    pricingByCurrency?: Record<string, Microsoft365LicensePricing>;
    /** Served by the API for the explicit or inferred estimate currency. Unavailable currencies have no estimate. */
    pricing?: Microsoft365LicensePricing;
    /** Duplicate and downgrade findings from curated rules; absent on older snapshots. */
    insights?: Microsoft365LicenseInsights;
    /** The tenant's Microsoft 365 organization; absent on older snapshots or without organization evidence. */
    organization?: Microsoft365Organization;
}
export interface Microsoft365Organization {
    displayName: string | null;
    /** The organization's default verified domain, for example `contoso.com`. */
    defaultDomain: string | null;
}
/**
 * overlap: the product's capabilities are already included in another product on the same enabled, recently active account.
 * downgrade: the account used no Windows or Mac desktop app in the 30-day Microsoft 365 Apps report.
 */
export type Microsoft365LicenseInsightKind = 'overlap' | 'downgrade';
/** available: report rows matched by exact user principal name. Otherwise downgrade counts are unknown. */
export type Microsoft365DowngradeEvidence = 'available' | 'report_unavailable' | 'identities_concealed';
export interface Microsoft365LicenseInsight {
    accountId: string;
    /** The redundant (overlap) or downgradable product assignment. */
    skuId: string;
    kind: Microsoft365LicenseInsightKind;
    ruleId: string;
    /** Overlap: products on the same account that already include this one. */
    coveredBySkuIds?: string[];
    /** Downgrade: suggested replacement; null means the product could be removed. */
    targetSkuPartNumber?: string | null;
    targetProductName?: string | null;
    /** True when the assignment comes only from group-based licensing, so the change belongs on the group. */
    assignedByGroup?: boolean;
    /** Facts supporting the downgrade review, independent of whether a target storage limit blocked it. */
    evidence?: {
        windows: boolean | null;
        mac: boolean | null;
        web: boolean | null;
        mobile: boolean | null;
        mailboxUsedBytes: number | null;
        mailboxHasArchive: boolean | null;
        oneDriveUsedBytes: number | null;
        /** True only when every applicable target storage limit was checked. */
        storageChecked: boolean;
    };
    /** Informational downgrade finding, excluded from candidate counts and savings. */
    blockedBy?: ('mailbox_over_target_limit' | 'onedrive_over_target_limit')[];
}
export interface Microsoft365LicenseInsights {
    rulesVersion: string;
    /** Totals across every observed account; null when the evidence they need is unavailable. */
    overlapAssignmentCount: number | null;
    overlapAccountCount: number | null;
    /** Accounts with at least one downgrade suggestion. */
    downgradeCandidateCount: number | null;
    /** Accounts blocked by a target storage limit; excluded from downgradeCandidateCount. */
    downgradeBlockedCount?: number | null;
    downgradeEvidence: Microsoft365DowngradeEvidence;
    /** Findings for the listed account and product rows only. */
    findings: Microsoft365LicenseInsight[];
}
/**
 * paid: known commercially paid per-user product, even when this market has no price. free: no-cost/trial/viral entitlement.
 * capacity: tenant-level capacity, not a human seat. unpriced: product without a reliable commercial classification/reference price.
 */
export type Microsoft365LicenseProductCategory = 'paid' | 'free' | 'capacity' | 'unpriced';
/** Product family for grouping and icons. */
export type Microsoft365LicenseProductFamily = 'microsoft365' | 'copilot' | 'exchange' | 'teams' | 'sharepoint' | 'powerBi' | 'powerPlatform' | 'visio' | 'project' | 'dynamics' | 'security' | 'windows' | 'other';
/** verified: taken from the publisher's current price list. reference: long-standing list price that has not been re-verified this cycle. */
export type Microsoft365LicensePriceConfidence = 'verified' | 'reference';
export type Microsoft365LicensePriceDerivation = 'usd_list' | 'observed_local' | 'market_factor' | 'customer_override';
export interface Microsoft365LicenseProductPricing {
    referenceUnitPriceMonthly?: number | null;
    skuId: string;
    skuPartNumber: string;
    productName: string;
    family: Microsoft365LicenseProductFamily;
    category: Microsoft365LicenseProductCategory;
    priceConfidence: Microsoft365LicensePriceConfidence | null;
    /**
     * How the unit price in this currency was obtained: the USD list price itself, a local price observed on the
     * publisher's site, or a legacy USD conversion. `priceConfidence` describes the selected unit price.
     */
    priceDerivation?: Microsoft365LicensePriceDerivation | null;
    /** Review date and publisher source for the selected price; absent on legacy snapshots. */
    priceCheckedAt?: string | null;
    priceSource?: string | null;
    /** Per user per month in `Microsoft365LicensePricing.currency`, annual commitment, excluding tax. */
    unitPriceMonthly: number | null;
    purchasedUnits: number | null;
    assignedUnits: number | null;
    unassignedUnits: number | null;
    /** Assignments on disabled accounts in the listed account rows; null when user evidence is unavailable. */
    disabledAccountUnits: number | null;
    /** Assignments on enabled accounts whose last successful sign-in is older than 90 days; null when sign-in evidence is unavailable. */
    inactiveAccountUnits: number | null;
    monthlyCost: number | null;
    unassignedMonthlyCost: number | null;
    disabledMonthlyCost: number | null;
    inactiveMonthlyCost: number | null;
    /** Recently signed-in enabled seats with no Office activity in 30 days. Review value, never reclaim. */
    noOfficeActivityMonthlyCost?: number | null;
    /** Redundant assignments on enabled, recently active accounts (disjoint from disabled and inactive); absent on older snapshots. */
    overlapAccountUnits?: number | null;
    overlapMonthlyCost?: number | null;
    /** Downgrade candidates holding this product and the monthly saving of the suggested change. */
    downgradeAccountUnits?: number | null;
    downgradeMonthlySaving?: number | null;
}
export interface Microsoft365LicensePricing {
    /** Known non-saving target edges; consumers suppress these findings instead of recommending a zero-value downgrade. */
    nonSavingDowngradeEdges?: import('./microsoft365PricingFacts').Microsoft365PricingEdge[];
    /** Full-population account groups with monthly list-price estimates in this entry's currency. Never stored in history. */
    breakdowns?: {
        domain: Microsoft365LicenseBreakdownRow[];
        department: Microsoft365LicenseBreakdownRow[];
        /** Country, falling back to usageLocation. */
        country: Microsoft365LicenseBreakdownRow[];
    };
    basis: 'list_price_estimate' | 'customer_price_estimate' | 'mixed_price_estimate';
    projection?: Microsoft365PricingProjection;
    breakdownsUnavailableReason?: 'pricing_facts_unavailable' | 'group_limit_exceeded' | 'contribution_limit_exceeded';
    /** Price list identifier, for example `microsoft-2026-07`. */
    priceListVersion: string;
    /** ISO currency of every amount. */
    currency: string;
    /** Legacy USD substitution flag. Current producers return false and never substitute another currency. */
    currencyFallback: boolean;
    term: 'annual_commitment' | 'customer_agreement' | 'mixed';
    /** Product rows sorted by unused monthly value, highest first. */
    products: Microsoft365LicenseProductPricing[];
    /**
     * Estimated list price per month for each listed account id with at least one priced license. The engine stores
     * this empty (and omits the two id lists below) in `pricingByCurrency`, because one copy per currency would crowd
     * accounts out of the bounded snapshot; the API adds all three for the served currency with
     * `withMicrosoft365AccountPricing` from `@spottoai/platform/calc/licensing`.
     */
    accountMonthlyCosts: Record<string, number>;
    /** Accounts holding chargeable paid or unpriced licenses, independent of market prices; excludes confirmed nonpaid trial stock. */
    paidAccountIds?: string[];
    /** Accounts whose assigned products include a missing or unknown price; their monetary values are partial. */
    partialAccountPriceIds?: string[];
    /**
     * Totals are null when the evidence they need is unavailable (denied, failed or partial sources, or unknown
     * quantities), never a zero. Money is a subtotal of priced products; pricesComplete and pricedPaidUnits disclose gaps.
     * Current seat totals include paid and unpriced chargeable products, independent of market prices. Account-based counts are minimums when their completeness flag is false.
     */
    summary: {
        paidProductCount: number | null;
        unpricedProductCount: number | null;
        purchasedPaidUnits: number | null;
        assignedPaidUnits: number | null;
        unassignedPaidUnits: number | null;
        /** Priced subset of all paid products/seats; absent on legacy snapshots. */
        pricedPaidProductCount?: number | null;
        pricedPaidUnits?: number | null;
        /** False for incomplete inventory, unknown classifications or any paid product without a price. */
        pricesComplete?: boolean;
        monthlyCost: number | null;
        unassignedMonthlyCost: number | null;
        disabledAccountCount: number | null;
        disabledMonthlyCost: number | null;
        inactiveAccountCount: number | null;
        inactiveMonthlyCost: number | null;
        /** Recently signed-in enabled accounts with no Office activity; disjoint from disabled and 90-day sign-in groups. */
        noOfficeActivityAccountCount?: number | null;
        /** Priced value of the above seats, excluding tax; a review figure, never added to reclaim. */
        noOfficeActivityMonthlyCost?: number | null;
        /** Value of duplicate assignments; adds to the other reclaim values. Absent on older snapshots. */
        overlapMonthlyCost?: number | null;
        /** Saving if every priced downgrade candidate moved to its suggested product; not part of the reclaim total. */
        downgradeMonthlySaving?: number | null;
        /** True only when user and sign-in sources are complete, every listed account is known and no rows were omitted. */
        accountsComplete: boolean;
        /** True when every disabled licensed account is known and listed, even if other rows were omitted. */
        disabledAccountsComplete: boolean;
    };
}
export interface Microsoft365LicenseTenant {
    cloudAccountId: string;
    name: string;
    tenantId: string;
    supportsAccessUpdate: boolean;
}
/** Validates one bounded list-price estimate (engine `pricingByCurrency` entry or API `pricing`). */
export declare function isMicrosoft365LicensePricing(value: unknown): value is Microsoft365LicensePricing;
/** Validates one person-level finding; collection limits belong to each envelope. */
export declare function isMicrosoft365LicenseInsight(row: unknown): row is Microsoft365LicenseInsight;
/** Validates bounded duplicate and downgrade findings. */
export declare function isMicrosoft365LicenseInsights(value: unknown): value is Microsoft365LicenseInsights;
/** Validates one licensed account; collection limits belong to each envelope. */
export declare function isMicrosoft365LicensedAccountRow(row: unknown): row is Microsoft365LicensedAccountRow;
/** Validates the bounded engine projection at API/storage boundaries. */
export declare function isMicrosoft365LicenseView(value: unknown): value is Microsoft365LicenseView;
/**
 * Adds the per-account list-price fields to one estimate, from the listed accounts and that estimate's product
 * prices. An account's cost is the sum of its priced paid products; any product without a known price (or an
 * unknown assignment list) makes its value partial. Paid account ids need complete inventory evidence.
 */
/** @deprecated Compatibility for older consumers; current valuation lives in @spottoai/platform/calc/licensing. */
export declare function withMicrosoft365AccountPricing(pricing: Microsoft365LicensePricing, view: Pick<Microsoft365LicenseView, 'accounts' | 'coverage'> & Partial<Pick<Microsoft365LicenseView, 'licenses'>>): Microsoft365LicensePricing;
//# sourceMappingURL=microsoft365Licenses.d.ts.map