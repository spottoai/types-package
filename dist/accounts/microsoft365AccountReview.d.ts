import type { Microsoft365LicenseAccountDetails } from './microsoft365LicensePortal';
/** Ordered primary reason: Keep, disabled, never signed in, inactive, no Office activity, duplicate, downgrade. */
export declare const MICROSOFT_365_ACCOUNT_REVIEW_REASONS: readonly ["kept", "disabled", "never_signed_in", "inactive_90_days", "no_office_activity", "duplicate", "downgrade", "none", "unknown"];
export type Microsoft365AccountReviewReason = (typeof MICROSOFT_365_ACCOUNT_REVIEW_REASONS)[number];
/** Counts partition only returned detail rows. They never replace full-population pricing/review aggregates. */
export type Microsoft365AccountReview = {
    scope: 'returned_license_accounts';
    coverage: Microsoft365LicenseAccountDetails & {
        state: 'complete' | 'partial';
    };
} & ({
    state: 'ready';
    counts: Record<Microsoft365AccountReviewReason, number>;
} | {
    state: 'unavailable';
    counts: null;
    reason: 'accounts_unavailable' | 'scan_mismatch';
});
export declare function isMicrosoft365AccountReviewReason(value: unknown): value is Microsoft365AccountReviewReason;
export declare function isMicrosoft365AccountReview(value: unknown): value is Microsoft365AccountReview;
//# sourceMappingURL=microsoft365AccountReview.d.ts.map