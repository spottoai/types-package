import { isMicrosoft365ActivityHistoryDate } from './microsoft365ActivityHistory';

export const MICROSOFT365_APPLICATIONS_SCHEMA_VERSION = 'microsoft-365-applications/v1' as const;

export interface Microsoft365ApplicationWindow {
  /** Distinct accounts with a successful interactive sign-in on an observed date. */
  activeAccounts: number;
  /** Complete tenant dates in this window, excluding coverage gaps. */
  observedDays: number;
}

export interface Microsoft365ApplicationEntry {
  appId: string;
  /** Service principal name, latest nonempty sign-in name, or unknown. */
  name: string | null;
  nameSource: 'servicePrincipal' | 'signIn' | null;
  publisher: string | null;
  firstParty: boolean;
  /** Provider value; the contract does not close the vocabulary of SSO modes. */
  ssoMode: string | null;
  /** Inclusive UTC dates within the retained coverage range. */
  firstSeen: string;
  lastSeen: string;
  /** Both windows end at coverage.through and start no earlier than coverage.from. */
  last30Days: Microsoft365ApplicationWindow;
  last90Days: Microsoft365ApplicationWindow;
}

/** Anonymous tenant projection; no account identifiers or personal details. */
export interface Microsoft365ApplicationDirectory {
  schemaVersion: typeof MICROSOFT365_APPLICATIONS_SCHEMA_VERSION;
  tenantId: string;
  generatedAt: string;
  tenantSyncRunId: string;
  coverage: {
    /** Inclusive UTC calendar dates, including partially/unobserved dates. */
    from: string;
    through: string;
    observedDays: number;
    /** Unique missing, partial, denied or failed dates within the retained range. */
    unobservedDates: string[];
  };
  /** At most 5000 entries; producers sort by active accounts descending, then name. */
  applications: Microsoft365ApplicationEntry[];
  omittedCount?: number;
}

const DAY_MILLISECONDS = 86_400_000;
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0 && value.length <= 512;
const nullableText = (value: unknown) => value === null || text(value);
const count = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const keys = (value: Record<string, unknown>, allowed: string[]) => Object.keys(value).every(key => allowed.includes(key));
const dateDay = (value: string) => Date.parse(value) / DAY_MILLISECONDS;

/** UTC instants only; reject normalization of invalid dates or 24:00. */
function timestamp(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)) return false;
  const milliseconds = Date.parse(value);
  const normalized = value.replace(/(?:\.(\d{1,3}))?Z$/, (_, fraction: string | undefined) => `.${(fraction ?? '').padEnd(3, '0')}Z`);
  return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString() === normalized;
}

function applicationWindow(value: unknown, observedDays: number): value is Microsoft365ApplicationWindow {
  return (
    record(value) &&
    keys(value, ['activeAccounts', 'observedDays']) &&
    count(value.activeAccounts) &&
    value.observedDays === observedDays &&
    (observedDays > 0 || value.activeAccounts === 0)
  );
}

function applicationEntry(
  value: unknown,
  coverage: { from: string; through: string },
  observed30Days: number,
  observed90Days: number
): value is Microsoft365ApplicationEntry {
  if (
    !record(value) ||
    !keys(value, ['appId', 'name', 'nameSource', 'publisher', 'firstParty', 'ssoMode', 'firstSeen', 'lastSeen', 'last30Days', 'last90Days']) ||
    !text(value.appId) ||
    !nullableText(value.name) ||
    !nullableText(value.publisher) ||
    !nullableText(value.ssoMode) ||
    typeof value.firstParty !== 'boolean'
  )
    return false;
  if (
    !(value.nameSource === null || value.nameSource === 'servicePrincipal' || value.nameSource === 'signIn') ||
    (value.name === null) !== (value.nameSource === null)
  )
    return false;
  return (
    isMicrosoft365ActivityHistoryDate(value.firstSeen) &&
    isMicrosoft365ActivityHistoryDate(value.lastSeen) &&
    value.firstSeen >= coverage.from &&
    value.firstSeen <= value.lastSeen &&
    value.lastSeen <= coverage.through &&
    applicationWindow(value.last30Days, observed30Days) &&
    applicationWindow(value.last90Days, observed90Days) &&
    (value.last30Days.activeAccounts === 0 || dateDay(value.lastSeen) >= dateDay(coverage.through) - 29) &&
    (value.last90Days.activeAccounts === 0 || dateDay(value.lastSeen) >= dateDay(coverage.through) - 89) &&
    value.last90Days.activeAccounts >= value.last30Days.activeAccounts
  );
}

/**
 * Strict dependency-free artifact guard shared by API and UI readers.
 * Validation is linear in retained gaps and applications, without expanding the date range.
 */
export function isMicrosoft365ApplicationDirectory(value: unknown): value is Microsoft365ApplicationDirectory {
  if (
    !record(value) ||
    !keys(value, ['schemaVersion', 'tenantId', 'generatedAt', 'tenantSyncRunId', 'coverage', 'applications', 'omittedCount']) ||
    value.schemaVersion !== MICROSOFT365_APPLICATIONS_SCHEMA_VERSION ||
    !text(value.tenantId) ||
    !timestamp(value.generatedAt) ||
    !text(value.tenantSyncRunId) ||
    (value.omittedCount !== undefined && !count(value.omittedCount)) ||
    !Array.isArray(value.applications) ||
    value.applications.length > 5000
  )
    return false;
  const coverage = value.coverage;
  if (
    !record(coverage) ||
    !keys(coverage, ['from', 'through', 'observedDays', 'unobservedDates']) ||
    !isMicrosoft365ActivityHistoryDate(coverage.from) ||
    !isMicrosoft365ActivityHistoryDate(coverage.through) ||
    coverage.from > coverage.through ||
    !count(coverage.observedDays) ||
    !Array.isArray(coverage.unobservedDates)
  )
    return false;

  const fromDay = dateDay(coverage.from);
  const throughDay = dateDay(coverage.through);
  const inclusiveDays = throughDay - fromDay + 1;
  // Bound the gaps by their actual calendar range, not a daily-only retention policy.
  if (coverage.unobservedDates.length > inclusiveDays || coverage.observedDays !== inclusiveDays - coverage.unobservedDates.length) return false;
  const start30Day = Math.max(fromDay, throughDay - 29);
  const start90Day = Math.max(fromDay, throughDay - 89);
  let observed30Days = throughDay - start30Day + 1;
  let observed90Days = throughDay - start90Day + 1;
  const gaps = new Set<string>();
  for (const gap of coverage.unobservedDates) {
    if (!isMicrosoft365ActivityHistoryDate(gap) || gap < coverage.from || gap > coverage.through || gaps.has(gap)) return false;
    gaps.add(gap);
    const day = dateDay(gap);
    if (day >= start30Day) observed30Days--;
    if (day >= start90Day) observed90Days--;
  }

  const appIds = new Set<string>();
  for (const app of value.applications) {
    if (!applicationEntry(app, { from: coverage.from, through: coverage.through }, observed30Days, observed90Days)) return false;
    const identity = app.appId.trim().toLowerCase();
    if (appIds.has(identity)) return false;
    appIds.add(identity);
  }
  return true;
}
