/** User profile strings are trimmed by the engine; missing/empty values are null. */
export interface Microsoft365AccountProfile {
    department: string | null;
    jobTitle: string | null;
    officeLocation: string | null;
    city: string | null;
    country: string | null;
    /** Two-letter location code. */
    usageLocation: string | null;
    companyName: string | null;
    /** Lower-case domain derived from userPrincipalName. */
    domain: string | null;
}
/** recent: within 90 days. new_account: never signed in, within the 90-day creation grace period. */
export type Microsoft365SignInStatus = 'recent' | 'older_than_90_days' | 'never_signed_in' | 'new_account' | 'unknown';
/**
 * Office workload activity measured from the report refresh date. active includes the 30-day boundary;
 * inactive is older. no_recorded_activity requires a matched row with all workload dates known to be blank.
 * Denied, concealed, ambiguous, missing-column, unmatched and disabled-account evidence stays unknown.
 */
export type Microsoft365UsageStatus = 'active' | 'inactive' | 'no_recorded_activity' | 'unknown';
/** Office workloads reported per person by the Office 365 active users report. */
export type Microsoft365UsageWorkload = 'exchange' | 'oneDrive' | 'sharePoint' | 'teams' | 'vivaEngage';
export declare const MICROSOFT365_USAGE_WORKLOADS: readonly Microsoft365UsageWorkload[];
export interface Microsoft365WorkloadLicense {
    licensed: boolean | null;
    /** Date the workload license was assigned, yyyy-mm-dd; null when unlicensed or not reported. */
    assignedOn: string | null;
}
export interface Microsoft365AccountUsage {
    status: Microsoft365UsageStatus;
    /** Latest workload date, yyyy-mm-dd; null when none or unknown. */
    lastActivityDate: string | null;
    /** Omitted only when workload dates are dropped for size; the users coverage records the omission. */
    workloads?: {
        exchange: string | null;
        oneDrive: string | null;
        sharePoint: string | null;
        teams: string | null;
        vivaEngage: string | null;
    } | null;
    /**
     * Per-workload license from the Office 365 active users report ("Has … License" and "… License Assign Date").
     * licensed is null when the report value is blank or unrecognised; assignedOn is yyyy-mm-dd or null.
     * Omitted by engines that predate the field; null when the account has no matched active-users row.
     */
    workloadLicenses?: Record<Microsoft365UsageWorkload, Microsoft365WorkloadLicense> | null;
    platforms: {
        windows: boolean | null;
        mac: boolean | null;
        web: boolean | null;
        mobile: boolean | null;
    } | null;
    mailbox: {
        usedBytes: number | null;
        quotaBytes: number | null;
        hasArchive: boolean | null;
    } | null;
    oneDrive: {
        usedBytes: number | null;
        allocatedBytes: number | null;
    } | null;
    copilotLastActivityDate: string | null;
}
/** Counts of assigned, enabled accounts holding one SKU, over the full population before detail trimming. */
export interface Microsoft365LicenseProductUsage {
    active: number;
    inactive: number;
    noRecordedActivity: number;
    unknown: number;
    /** Recently signed in, with no Office activity; excludes disabled and 90-day sign-in review groups. */
    signedInButNoOfficeActivity: number;
}
/** Full-population rollups. Each unavailable source block is null, never a fabricated zero. */
export interface Microsoft365UsageSummary {
    evidence: 'available' | 'report_unavailable' | 'identities_concealed';
    reportRefreshDate: string | null;
    windowDays: 30;
    /** Enabled licensed accounts considered; denominator for usage counts. */
    enabledLicensedAccountCount: number | null;
    matchedAccountCount: number | null;
    status: {
        active: number;
        inactive: number;
        noRecordedActivity: number;
        unknown: number;
    } | null;
    signedInButNoOfficeActivityCount: number | null;
    workloadActive: {
        exchange: number;
        oneDrive: number;
        sharePoint: number;
        teams: number;
        vivaEngage: number;
    } | null;
    platforms: {
        windows: number;
        mac: number;
        web: number;
        mobile: number;
        webOrMobileOnly: number;
        noApps: number;
    } | null;
    mailbox: {
        measuredCount: number;
        totalUsedBytes: number;
        overF3LimitCount: number;
    } | null;
    oneDrive: {
        measuredCount: number;
        totalUsedBytes: number;
        overF3LimitCount: number;
    } | null;
    /** Accounts holding a Copilot-family SKU; activity measured within 28 days of that report's refresh date. */
    copilot: {
        licensedAccountCount: number;
        activeAccountCount: number;
        idleAccountCount: number;
    } | null;
    /** Independent of Reports.Read.All, using account/sign-in evidence. */
    signIn: {
        neverSignedInCount: number;
        newAccountCount: number;
        guestWithPaidLicenseCount: number;
        /** Counts are minima when assignment evidence proves only an observed licensed population. */
        basis?: 'licensed_accounts' | 'observed_licensed_accounts';
        observedLicensedAccountCount?: number;
    } | null;
    /** Up to 180 tenant daily active-user counts, oldest first; not stored in monthly history. */
    dailyActive?: {
        date: string;
        office365: number | null;
        exchange: number | null;
        oneDrive: number | null;
        sharePoint: number | null;
        teams: number | null;
    }[];
}
/** Monthly aggregates only: no profile, domain, department, account identity or daily report rows. */
export type Microsoft365LicenseHistoryUsage = Pick<Microsoft365UsageSummary, 'evidence' | 'reportRefreshDate' | 'enabledLicensedAccountCount' | 'status' | 'signedInButNoOfficeActivityCount' | 'platforms' | 'copilot'>;
export interface Microsoft365LicenseBreakdownRow {
    /** Lower-case grouping key; empty string is Not Set. Synthetic remainder key is other. */
    key: string;
    label: string;
    licensedAccountCount: number;
    paidSeatCount: number;
    /** Priced paid assignments at monthly list price, in the containing pricing currency; null if none are priced. */
    monthlyCost: number | null;
    /** Distinct accounts in disabled, 90-day sign-in, no Office activity, duplicate or eligible downgrade review groups. */
    reviewAccountCount: number;
    /** Each reviewed paid assignment counted once; review value, never added to reclaim totals. */
    reviewMonthlyCost: number | null;
}
/** Strict calendar date for report fields (timestamps and rolled-over invalid dates are rejected). */
export declare function isMicrosoft365UsageDate(value: unknown): value is string;
export declare function isMicrosoft365AccountProfile(value: unknown): value is Microsoft365AccountProfile;
export declare function isMicrosoft365WorkloadLicense(value: unknown): value is Microsoft365WorkloadLicense;
export declare function isMicrosoft365AccountUsage(value: unknown): value is Microsoft365AccountUsage;
export declare function isMicrosoft365LicenseProductUsage(value: unknown): value is Microsoft365LicenseProductUsage;
export declare function isMicrosoft365LicenseHistoryUsage(value: unknown): value is Microsoft365LicenseHistoryUsage;
export declare function isMicrosoft365UsageSummary(value: unknown): value is Microsoft365UsageSummary;
export declare function isMicrosoft365LicenseBreakdownRow(value: unknown): value is Microsoft365LicenseBreakdownRow;
//# sourceMappingURL=microsoft365Usage.d.ts.map