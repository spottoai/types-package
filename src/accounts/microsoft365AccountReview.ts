import type { Microsoft365LicenseAccountDetails } from './microsoft365LicensePortal';

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
] as const;
export type Microsoft365AccountReviewReason = (typeof MICROSOFT_365_ACCOUNT_REVIEW_REASONS)[number];

/** Counts partition only returned detail rows. They never replace full-population pricing/review aggregates. */
export type Microsoft365AccountReview = {
  scope: 'returned_license_accounts';
  coverage: Microsoft365LicenseAccountDetails & { state: 'complete' | 'partial' };
} & (
  | { state: 'ready'; counts: Record<Microsoft365AccountReviewReason, number> }
  | { state: 'unavailable'; counts: null; reason: 'accounts_unavailable' | 'scan_mismatch' }
);

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const exact = (value: Record<string, unknown>, keys: readonly string[]): boolean => Object.keys(value).every(key => keys.includes(key));
const count = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

export function isMicrosoft365AccountReviewReason(value: unknown): value is Microsoft365AccountReviewReason {
  return typeof value === 'string' && (MICROSOFT_365_ACCOUNT_REVIEW_REASONS as readonly string[]).includes(value);
}

export function isMicrosoft365AccountReview(value: unknown): value is Microsoft365AccountReview {
  if (!record(value) || !record(value.coverage) || value.scope !== 'returned_license_accounts') return false;
  const coverage = value.coverage;
  if (
    !exact(coverage, ['state', 'observedRowCount', 'returnedRowCount', 'omittedRowCount']) ||
    !count(coverage.observedRowCount) ||
    !count(coverage.returnedRowCount) ||
    !count(coverage.omittedRowCount) ||
    coverage.returnedRowCount > 5000 ||
    coverage.observedRowCount !== coverage.returnedRowCount + coverage.omittedRowCount ||
    (coverage.state !== 'complete' && coverage.state !== 'partial') ||
    (coverage.state === 'complete' && coverage.omittedRowCount !== 0)
  )
    return false;
  if (value.state === 'unavailable')
    return (
      exact(value, ['scope', 'coverage', 'state', 'counts', 'reason']) &&
      value.counts === null &&
      coverage.state === 'partial' &&
      (value.reason === 'accounts_unavailable' || value.reason === 'scan_mismatch')
    );
  if (value.state !== 'ready' || !exact(value, ['scope', 'coverage', 'state', 'counts']) || !record(value.counts)) return false;
  const counts = value.counts;
  return (
    exact(counts, MICROSOFT_365_ACCOUNT_REVIEW_REASONS) &&
    MICROSOFT_365_ACCOUNT_REVIEW_REASONS.every(reason => count(counts[reason])) &&
    Object.values(counts).reduce<number>((sum, amount) => sum + Number(amount), 0) === coverage.returnedRowCount &&
    (coverage.state !== 'complete' || counts.unknown === 0)
  );
}
