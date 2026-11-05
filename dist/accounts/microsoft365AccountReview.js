"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MICROSOFT_365_ACCOUNT_REVIEW_REASONS = void 0;
exports.isMicrosoft365AccountReviewReason = isMicrosoft365AccountReviewReason;
exports.isMicrosoft365AccountReview = isMicrosoft365AccountReview;
/** Ordered primary reason: Keep, disabled, never signed in, inactive, no Office activity, duplicate, downgrade. */
exports.MICROSOFT_365_ACCOUNT_REVIEW_REASONS = [
    'kept',
    'disabled',
    'never_signed_in',
    'inactive_90_days',
    'no_office_activity',
    'duplicate',
    'downgrade',
    'none',
    'unknown',
];
const record = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
const exact = (value, keys) => Object.keys(value).every(key => keys.includes(key));
const count = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
function isMicrosoft365AccountReviewReason(value) {
    return typeof value === 'string' && exports.MICROSOFT_365_ACCOUNT_REVIEW_REASONS.includes(value);
}
function isMicrosoft365AccountReview(value) {
    if (!record(value) || !record(value.coverage) || value.scope !== 'returned_license_accounts')
        return false;
    const coverage = value.coverage;
    if (!exact(coverage, ['state', 'observedRowCount', 'returnedRowCount', 'omittedRowCount']) ||
        !count(coverage.observedRowCount) ||
        !count(coverage.returnedRowCount) ||
        !count(coverage.omittedRowCount) ||
        coverage.returnedRowCount > 5000 ||
        coverage.observedRowCount !== coverage.returnedRowCount + coverage.omittedRowCount ||
        (coverage.state !== 'complete' && coverage.state !== 'partial') ||
        (coverage.state === 'complete' && coverage.omittedRowCount !== 0))
        return false;
    if (value.state === 'unavailable')
        return (exact(value, ['scope', 'coverage', 'state', 'counts', 'reason']) &&
            value.counts === null &&
            coverage.state === 'partial' &&
            (value.reason === 'accounts_unavailable' || value.reason === 'scan_mismatch'));
    if (value.state !== 'ready' || !exact(value, ['scope', 'coverage', 'state', 'counts']) || !record(value.counts))
        return false;
    const counts = value.counts;
    return (exact(counts, exports.MICROSOFT_365_ACCOUNT_REVIEW_REASONS) &&
        exports.MICROSOFT_365_ACCOUNT_REVIEW_REASONS.every(reason => count(counts[reason])) &&
        Object.values(counts).reduce((sum, amount) => sum + Number(amount), 0) === coverage.returnedRowCount &&
        (coverage.state !== 'complete' || counts.unknown === 0));
}
//# sourceMappingURL=microsoft365AccountReview.js.map