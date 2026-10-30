/** Ordered primary reason: Keep, disabled, never signed in, inactive, no Office activity, duplicate, downgrade. */
export const MICROSOFT_365_ACCOUNT_REVIEW_REASONS = [
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
export function isMicrosoft365AccountReviewReason(value) {
    return typeof value === 'string' && MICROSOFT_365_ACCOUNT_REVIEW_REASONS.includes(value);
}
export function isMicrosoft365AccountReview(value) {
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
    return (exact(counts, MICROSOFT_365_ACCOUNT_REVIEW_REASONS) &&
        MICROSOFT_365_ACCOUNT_REVIEW_REASONS.every(reason => count(counts[reason])) &&
        Object.values(counts).reduce((sum, amount) => sum + Number(amount), 0) === coverage.returnedRowCount &&
        (coverage.state !== 'complete' || counts.unknown === 0));
}
