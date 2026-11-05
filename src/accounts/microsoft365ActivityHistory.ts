import type { Microsoft365CoverageState } from './microsoft365Licenses';
import { isMicrosoft365AccountUsage, type Microsoft365AccountUsage } from './microsoft365Usage';

export type Microsoft365ActivityHistoryStream = 'sign-ins' | 'workloads' | 'people' | 'licenses';
export interface Microsoft365ActivityHistoryCoverage {
  state: Microsoft365CoverageState;
  /** Inclusive start and exclusive end of the requested source window. */
  requestedFrom: string;
  requestedThrough: string;
  observedFrom: string | null;
  observedThrough: string | null;
  sourceTime: string | null;
  reason: string | null;
  /** A current UTC date cannot establish a complete fixed day. */
  provisional?: boolean;
  rejectedEventCount?: number;
}
export interface Microsoft365SignInHistoryRow {
  accountId: string;
  appId: string;
  count: number;
  firstAt: string;
  lastAt: string;
}
export interface Microsoft365WorkloadHistoryRow {
  source: 'officeActiveUsers' | 'officeActiveUserCounts' | 'officeAppUsage' | 'copilotUsage';
  /** Rolling snapshots are not additive daily activity. */
  kind: 'rolling_snapshot' | 'native_daily';
  date: string;
  reportRefreshDate: string | null;
  periodDays: 1 | 28 | 30 | 180;
  state: Microsoft365CoverageState;
  counts: {
    office365: number | null;
    exchange: number | null;
    oneDrive: number | null;
    sharePoint: number | null;
    teams: number | null;
    copilot: number | null;
  };
}
/** Observed dates only; these records never fill intervening activity days. */
export interface Microsoft365PersonActivityHistoryRow {
  accountId: string;
  usage: Microsoft365AccountUsage;
  officeLastActivityDate?: string | null;
  reportRefreshDates?: { officeActiveUsers: string | null; officeAppUsage: string | null; copilotUsage: string | null };
}
export interface Microsoft365LicenseQuantityHistoryRow {
  skuId: string;
  enabledUnits: number | null;
  consumedUnits: number | null;
  /** Commercial subscription allocation may be unavailable even with complete SKU inventory. */
  subscriptionUnits: number | null;
  /** Retail reference context, independent of quantity changes and company agreed pricing. */
  referencePrices?: {
    currency: string;
    unitPriceMonthly: number | null;
    priceListVersion: string;
    basis: 'list_price_estimate';
    term: 'annual_commitment';
    tax: 'excluded';
  }[];
}
export interface Microsoft365LicenseQuantityChange {
  id: string;
  skuId: string;
  kind: 'assignment' | 'enabled_capacity' | 'purchased_quantity';
  from: number;
  to: number;
  delta: number;
  sourceSnapshotId: string;
  targetSnapshotId: string;
  /** Observed quantity changes do not establish realised savings. */
  confirmedSaving: null;
}
interface Microsoft365ActivityHistoryBase {
  schemaVersion: 'microsoft-365-activity-history/v1';
  tenantId: string;
  date: string;
  generatedAt: string;
  tenantSyncRunId?: string;
  coverage: Microsoft365ActivityHistoryCoverage;
}
export type Microsoft365SignInHistoryDay = Microsoft365ActivityHistoryBase & { stream: 'sign-ins'; rows: Microsoft365SignInHistoryRow[] };
export type Microsoft365WorkloadHistoryDay = Microsoft365ActivityHistoryBase & { stream: 'workloads'; rows: Microsoft365WorkloadHistoryRow[] };
export type Microsoft365PersonActivityHistoryDay = Microsoft365ActivityHistoryBase & {
  stream: 'people';
  rows: Microsoft365PersonActivityHistoryRow[];
};
export type Microsoft365LicenseQuantityHistoryDay = Microsoft365ActivityHistoryBase & {
  stream: 'licenses';
  classificationVersion: string;
  snapshotId: string;
  rows: Microsoft365LicenseQuantityHistoryRow[];
  changes: Microsoft365LicenseQuantityChange[];
};
export type Microsoft365ActivityHistoryDay =
  | Microsoft365SignInHistoryDay
  | Microsoft365WorkloadHistoryDay
  | Microsoft365PersonActivityHistoryDay
  | Microsoft365LicenseQuantityHistoryDay;

/** Strict UTC date validation rejects normalized impossible dates. */
export function isMicrosoft365ActivityHistoryDate(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 512;
const keys = (value: Record<string, unknown>, allowed: string[]) => Object.keys(value).every(key => allowed.includes(key));
const timestamp = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value.slice(0, 10);
const nullableTime = (value: unknown) => value === null || timestamp(value);
const count = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const nullableCount = (value: unknown) => value === null || count(value);
const state = (value: unknown): value is Microsoft365CoverageState =>
  ['complete', 'partial', 'denied', 'unavailable', 'failed'].includes(value as string);

export function isMicrosoft365ActivityHistoryCoverage(value: unknown): value is Microsoft365ActivityHistoryCoverage {
  if (
    !record(value) ||
    !keys(value, [
      'state',
      'requestedFrom',
      'requestedThrough',
      'observedFrom',
      'observedThrough',
      'sourceTime',
      'reason',
      'provisional',
      'rejectedEventCount',
    ])
  )
    return false;
  if (!state(value.state) || !timestamp(value.requestedFrom) || !timestamp(value.requestedThrough) || value.requestedFrom >= value.requestedThrough)
    return false;
  if (
    !nullableTime(value.observedFrom) ||
    !nullableTime(value.observedThrough) ||
    !nullableTime(value.sourceTime) ||
    !(value.reason === null || text(value.reason))
  )
    return false;
  if ((value.observedFrom === null) !== (value.observedThrough === null)) return false;
  if (
    typeof value.observedFrom === 'string' &&
    typeof value.observedThrough === 'string' &&
    (value.observedFrom > value.observedThrough || value.observedFrom < value.requestedFrom || value.observedThrough > value.requestedThrough)
  )
    return false;
  return (
    (value.provisional === undefined || typeof value.provisional === 'boolean') &&
    (value.rejectedEventCount === undefined || count(value.rejectedEventCount))
  );
}

export function isMicrosoft365ActivityHistoryDay(value: unknown): value is Microsoft365ActivityHistoryDay {
  if (
    !record(value) ||
    !text(value.tenantId) ||
    !isMicrosoft365ActivityHistoryDate(value.date) ||
    !timestamp(value.generatedAt) ||
    (value.tenantSyncRunId !== undefined && !text(value.tenantSyncRunId)) ||
    !isMicrosoft365ActivityHistoryCoverage(value.coverage) ||
    !Array.isArray(value.rows)
  )
    return false;
  if (value.schemaVersion !== 'microsoft-365-activity-history/v1') return false;
  const common = ['schemaVersion', 'tenantId', 'date', 'generatedAt', 'tenantSyncRunId', 'coverage', 'stream', 'rows'];
  if (value.stream === 'licenses') {
    if (
      !keys(value, [...common, 'classificationVersion', 'snapshotId', 'changes']) ||
      !text(value.classificationVersion) ||
      !text(value.snapshotId) ||
      !Array.isArray(value.changes)
    )
      return false;
    return (
      value.rows.every(
        row =>
          record(row) &&
          keys(row, ['skuId', 'enabledUnits', 'consumedUnits', 'subscriptionUnits', 'referencePrices']) &&
          text(row.skuId) &&
          nullableCount(row.enabledUnits) &&
          nullableCount(row.consumedUnits) &&
          nullableCount(row.subscriptionUnits) &&
          (row.referencePrices === undefined ||
            (Array.isArray(row.referencePrices) &&
              row.referencePrices.every(
                price =>
                  record(price) &&
                  keys(price, ['currency', 'unitPriceMonthly', 'priceListVersion', 'basis', 'term', 'tax']) &&
                  typeof price.currency === 'string' &&
                  /^[A-Z]{3}$/.test(price.currency) &&
                  (price.unitPriceMonthly === null ||
                    (typeof price.unitPriceMonthly === 'number' && Number.isFinite(price.unitPriceMonthly) && price.unitPriceMonthly >= 0)) &&
                  text(price.priceListVersion) &&
                  price.basis === 'list_price_estimate' &&
                  price.term === 'annual_commitment' &&
                  price.tax === 'excluded'
              )))
      ) &&
      value.changes.every(
        change =>
          record(change) &&
          keys(change, ['id', 'skuId', 'kind', 'from', 'to', 'delta', 'sourceSnapshotId', 'targetSnapshotId', 'confirmedSaving']) &&
          text(change.id) &&
          text(change.skuId) &&
          ['assignment', 'enabled_capacity', 'purchased_quantity'].includes(change.kind as string) &&
          count(change.from) &&
          count(change.to) &&
          change.delta === change.to - change.from &&
          text(change.sourceSnapshotId) &&
          change.targetSnapshotId === value.snapshotId &&
          change.confirmedSaving === null
      )
    );
  }
  if (!keys(value, common)) return false;
  if (value.stream === 'sign-ins') {
    return value.rows.every(
      row =>
        record(row) &&
        keys(row, ['accountId', 'appId', 'count', 'firstAt', 'lastAt']) &&
        text(row.accountId) &&
        text(row.appId) &&
        count(row.count) &&
        row.count > 0 &&
        timestamp(row.firstAt) &&
        timestamp(row.lastAt) &&
        row.firstAt <= row.lastAt &&
        row.firstAt.slice(0, 10) === value.date &&
        row.lastAt.slice(0, 10) === value.date
    );
  }
  if (value.stream === 'workloads') {
    return value.rows.every(
      row =>
        record(row) &&
        keys(row, ['source', 'kind', 'date', 'reportRefreshDate', 'periodDays', 'state', 'counts']) &&
        ['officeActiveUsers', 'officeActiveUserCounts', 'officeAppUsage', 'copilotUsage'].includes(row.source as string) &&
        ['rolling_snapshot', 'native_daily'].includes(row.kind as string) &&
        isMicrosoft365ActivityHistoryDate(row.date) &&
        (row.reportRefreshDate === null || isMicrosoft365ActivityHistoryDate(row.reportRefreshDate)) &&
        [1, 28, 30, 180].includes(row.periodDays as number) &&
        (row.kind !== 'native_daily' || (row.source === 'officeActiveUserCounts' && row.periodDays === 1)) &&
        state(row.state) &&
        record(row.counts) &&
        keys(row.counts, ['office365', 'exchange', 'oneDrive', 'sharePoint', 'teams', 'copilot']) &&
        ['office365', 'exchange', 'oneDrive', 'sharePoint', 'teams', 'copilot'].every(key =>
          nullableCount((row.counts as Record<string, unknown>)[key])
        )
    );
  }
  if (value.stream === 'people') {
    return value.rows.every(
      row =>
        record(row) &&
        keys(row, ['accountId', 'usage', 'officeLastActivityDate', 'reportRefreshDates']) &&
        text(row.accountId) &&
        record(row.usage) &&
        keys(row.usage, [
          'status',
          'lastActivityDate',
          'workloads',
          'workloadLicenses',
          'platforms',
          'mailbox',
          'oneDrive',
          'copilotLastActivityDate',
          'officeDesktopAppsUsed',
          'copilotAdoption',
        ]) &&
        isMicrosoft365AccountUsage(row.usage) &&
        (row.officeLastActivityDate === undefined ||
          row.officeLastActivityDate === null ||
          isMicrosoft365ActivityHistoryDate(row.officeLastActivityDate)) &&
        (row.reportRefreshDates === undefined ||
          (record(row.reportRefreshDates) &&
            keys(row.reportRefreshDates, ['officeActiveUsers', 'officeAppUsage', 'copilotUsage']) &&
            ['officeActiveUsers', 'officeAppUsage', 'copilotUsage'].every(
              key =>
                row.reportRefreshDates !== undefined &&
                record(row.reportRefreshDates) &&
                (row.reportRefreshDates[key] === null || isMicrosoft365ActivityHistoryDate(row.reportRefreshDates[key]))
            )))
    );
  }
  return false;
}
