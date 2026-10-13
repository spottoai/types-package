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
  platforms: { windows: boolean | null; mac: boolean | null; web: boolean | null; mobile: boolean | null } | null;
  mailbox: { usedBytes: number | null; quotaBytes: number | null; hasArchive: boolean | null } | null;
  oneDrive: { usedBytes: number | null; allocatedBytes: number | null } | null;
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
  status: { active: number; inactive: number; noRecordedActivity: number; unknown: number } | null;
  signedInButNoOfficeActivityCount: number | null;
  workloadActive: { exchange: number; oneDrive: number; sharePoint: number; teams: number; vivaEngage: number } | null;
  platforms: { windows: number; mac: number; web: number; mobile: number; webOrMobileOnly: number; noApps: number } | null;
  mailbox: { measuredCount: number; totalUsedBytes: number; overF3LimitCount: number } | null;
  oneDrive: { measuredCount: number; totalUsedBytes: number; overF3LimitCount: number } | null;
  /** Accounts holding a Copilot-family SKU; activity measured within 28 days of that report's refresh date. */
  copilot: { licensedAccountCount: number; activeAccountCount: number; idleAccountCount: number } | null;
  /** Independent of Reports.Read.All, using account/sign-in evidence. */
  signIn: { neverSignedInCount: number; newAccountCount: number; guestWithPaidLicenseCount: number } | null;
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
export type Microsoft365LicenseHistoryUsage = Pick<
  Microsoft365UsageSummary,
  'evidence' | 'reportRefreshDate' | 'enabledLicensedAccountCount' | 'status' | 'signedInButNoOfficeActivityCount' | 'platforms' | 'copilot'
>;

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

const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.length <= 512;
const nullableText = (value: unknown): boolean => value === null || text(value);
const count = (value: unknown): boolean => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const nullableCount = (value: unknown): boolean => value === null || count(value);
const nullableBoolean = (value: unknown): boolean => value === null || typeof value === 'boolean';
const nullableMoney = (value: unknown): boolean => value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0);
const onlyKeys = (value: Record<string, unknown>, keys: readonly string[]): boolean => Object.keys(value).every(key => keys.includes(key));
const block = (value: unknown, keys: readonly string[], predicate: (field: unknown) => boolean): boolean =>
  isRecord(value) && onlyKeys(value, keys) && keys.every(key => predicate(value[key]));
const nullableBlock = (value: unknown, keys: readonly string[], predicate = count): boolean => value === null || block(value, keys, predicate);
const nullableDate = (value: unknown): boolean => value === null || isMicrosoft365UsageDate(value);

/** Strict calendar date for report fields (timestamps and rolled-over invalid dates are rejected). */
export function isMicrosoft365UsageDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === value;
}

export function isMicrosoft365AccountProfile(value: unknown): value is Microsoft365AccountProfile {
  return (
    block(value, ['department', 'jobTitle', 'officeLocation', 'city', 'country', 'usageLocation', 'companyName', 'domain'], nullableText) &&
    isRecord(value) &&
    (value.usageLocation === null || (typeof value.usageLocation === 'string' && /^[A-Za-z]{2}$/.test(value.usageLocation)))
  );
}

export function isMicrosoft365AccountUsage(value: unknown): value is Microsoft365AccountUsage {
  return (
    isRecord(value) &&
    onlyKeys(value, ['status', 'lastActivityDate', 'workloads', 'platforms', 'mailbox', 'oneDrive', 'copilotLastActivityDate']) &&
    typeof value.status === 'string' &&
    ['active', 'inactive', 'no_recorded_activity', 'unknown'].includes(value.status) &&
    nullableDate(value.lastActivityDate) &&
    (value.workloads === undefined || nullableBlock(value.workloads, ['exchange', 'oneDrive', 'sharePoint', 'teams', 'vivaEngage'], nullableDate)) &&
    nullableBlock(value.platforms, ['windows', 'mac', 'web', 'mobile'], nullableBoolean) &&
    (value.mailbox === null ||
      (isRecord(value.mailbox) &&
        onlyKeys(value.mailbox, ['usedBytes', 'quotaBytes', 'hasArchive']) &&
        nullableCount(value.mailbox.usedBytes) &&
        nullableCount(value.mailbox.quotaBytes) &&
        nullableBoolean(value.mailbox.hasArchive))) &&
    nullableBlock(value.oneDrive, ['usedBytes', 'allocatedBytes'], nullableCount) &&
    nullableDate(value.copilotLastActivityDate)
  );
}

export function isMicrosoft365LicenseProductUsage(value: unknown): value is Microsoft365LicenseProductUsage {
  return block(value, ['active', 'inactive', 'noRecordedActivity', 'unknown', 'signedInButNoOfficeActivity'], count);
}

const HISTORY_USAGE_KEYS = [
  'evidence',
  'reportRefreshDate',
  'enabledLicensedAccountCount',
  'status',
  'signedInButNoOfficeActivityCount',
  'platforms',
  'copilot',
] as const;
const isUsageSummaryCore = (value: Record<string, unknown>): boolean =>
  typeof value.evidence === 'string' &&
  ['available', 'report_unavailable', 'identities_concealed'].includes(value.evidence) &&
  nullableDate(value.reportRefreshDate) &&
  nullableCount(value.enabledLicensedAccountCount) &&
  nullableCount(value.signedInButNoOfficeActivityCount) &&
  nullableBlock(value.status, ['active', 'inactive', 'noRecordedActivity', 'unknown']) &&
  nullableBlock(value.platforms, ['windows', 'mac', 'web', 'mobile', 'webOrMobileOnly', 'noApps']) &&
  nullableBlock(value.copilot, ['licensedAccountCount', 'activeAccountCount', 'idleAccountCount']);

export function isMicrosoft365LicenseHistoryUsage(value: unknown): value is Microsoft365LicenseHistoryUsage {
  return isRecord(value) && onlyKeys(value, HISTORY_USAGE_KEYS) && isUsageSummaryCore(value);
}

export function isMicrosoft365UsageSummary(value: unknown): value is Microsoft365UsageSummary {
  if (
    !isRecord(value) ||
    !onlyKeys(value, [
      ...HISTORY_USAGE_KEYS,
      'windowDays',
      'matchedAccountCount',
      'workloadActive',
      'mailbox',
      'oneDrive',
      'signIn',
      'dailyActive',
    ]) ||
    !isUsageSummaryCore(value) ||
    value.windowDays !== 30 ||
    !nullableCount(value.matchedAccountCount) ||
    !nullableBlock(value.workloadActive, ['exchange', 'oneDrive', 'sharePoint', 'teams', 'vivaEngage']) ||
    !nullableBlock(value.mailbox, ['measuredCount', 'totalUsedBytes', 'overF3LimitCount']) ||
    !nullableBlock(value.oneDrive, ['measuredCount', 'totalUsedBytes', 'overF3LimitCount']) ||
    !nullableBlock(value.signIn, ['neverSignedInCount', 'newAccountCount', 'guestWithPaidLicenseCount'])
  )
    return false;
  if (value.dailyActive === undefined) return true;
  if (!Array.isArray(value.dailyActive) || value.dailyActive.length > 180) return false;
  let previous = '';
  return value.dailyActive.every(row => {
    if (
      !isRecord(row) ||
      !onlyKeys(row, ['date', 'office365', 'exchange', 'oneDrive', 'sharePoint', 'teams']) ||
      !isMicrosoft365UsageDate(row.date) ||
      row.date <= previous ||
      !['office365', 'exchange', 'oneDrive', 'sharePoint', 'teams'].every(key => nullableCount(row[key]))
    )
      return false;
    previous = row.date;
    return true;
  });
}

export function isMicrosoft365LicenseBreakdownRow(value: unknown): value is Microsoft365LicenseBreakdownRow {
  return (
    isRecord(value) &&
    onlyKeys(value, ['key', 'label', 'licensedAccountCount', 'paidSeatCount', 'monthlyCost', 'reviewAccountCount', 'reviewMonthlyCost']) &&
    text(value.key) &&
    value.key === value.key.toLowerCase() &&
    text(value.label) &&
    count(value.licensedAccountCount) &&
    count(value.paidSeatCount) &&
    count(value.reviewAccountCount) &&
    nullableMoney(value.monthlyCost) &&
    nullableMoney(value.reviewMonthlyCost)
  );
}
