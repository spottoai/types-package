import { isMicrosoft365PricingFacts, type Microsoft365PricingFacts } from './microsoft365PricingFacts';
import { isMicrosoft365PricingRevision } from './microsoft365PricingOverrides';
import {
  isMicrosoft365LicensePricing,
  MICROSOFT_365_LATER_LICENSE_SOURCES,
  MICROSOFT_365_LICENSE_SOURCES,
  type Microsoft365CoverageState,
  type Microsoft365LicenseInsights,
  type Microsoft365LicensePricing,
  type Microsoft365LicenseView,
  type Microsoft365SourceRecord,
} from './microsoft365Licenses';
import {
  isMicrosoft365LicenseHistoryUsage,
  isMicrosoft365LicenseProductUsage,
  type Microsoft365LicenseHistoryUsage,
  type Microsoft365LicenseProductUsage,
} from './microsoft365Usage';

const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.length <= 512;
const count = (value: unknown): boolean => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const nullableCount = (value: unknown): boolean => value === null || count(value);
const date = (value: unknown): boolean => text(value) && Number.isFinite(Date.parse(value));
const optional = (value: unknown, predicate: (value: unknown) => boolean): boolean => value === undefined || predicate(value);

/** Tenant month folder name, `YYYY-MM` in UTC. */
export type Microsoft365LicenseHistoryMonthKey = string;
const MONTH_KEY = /^\d{4}-(0[1-9]|1[0-2])$/;
/** True for a `YYYY-MM` month key. */
export const isMicrosoft365LicenseHistoryMonthKey = (value: unknown): value is Microsoft365LicenseHistoryMonthKey =>
  typeof value === 'string' && MONTH_KEY.test(value);
/** UTC month of an ISO timestamp, for example `2026-10`; null for an unparseable timestamp. */
export const microsoft365LicenseHistoryMonthOf = (timestamp: string): Microsoft365LicenseHistoryMonthKey | null => {
  const time = Date.parse(timestamp);
  return Number.isFinite(time) ? new Date(time).toISOString().slice(0, 7) : null;
};
/** Duplicate and downgrade counts for a month; the findings themselves are account rows and are not kept. */
export type Microsoft365LicenseHistoryInsights = Pick<
  Microsoft365LicenseInsights,
  'rulesVersion' | 'overlapAssignmentCount' | 'overlapAccountCount' | 'downgradeCandidateCount' | 'downgradeEvidence'
>;
/**
 * One tenant month, stored by the engine at `azure-portal/tenants/{tenantId}/microsoft-365/history/{YYYY-MM}/licenses.json.gz`.
 * The last scan of the month with complete license inventory replaces it. It keeps product quantities and the
 * list-price estimates computed that month, never account, user or usage-report rows.
 */
export interface Microsoft365LicenseHistorySnapshot {
  pricingFacts?: Microsoft365PricingFacts;
  usage?: Microsoft365LicenseHistoryUsage;
  /** Full-population counts keyed by lower-case skuId, with no account identities. */
  productUsage?: Record<string, Microsoft365LicenseProductUsage>;
  schemaVersion: 'microsoft-365-license-history/v1';
  tenantId: string;
  month: Microsoft365LicenseHistoryMonthKey;
  /** `generatedAt` of the license view this month was taken from. */
  generatedAt: string;
  tenantSyncRunId?: string;
  /** Source coverage state at the time; later sources are absent on views that did not collect them. */
  coverage: Microsoft365SourceRecord<Microsoft365CoverageState>;
  summary: Microsoft365LicenseView['summary'];
  insights?: Microsoft365LicenseHistoryInsights;
  /** The view's stored estimates: per-account values are empty and account id lists are omitted. */
  pricingByCurrency: Record<string, Microsoft365LicensePricing>;
}
/** API-derived quantities from stored pricing blocks; no price/currency or account data. */
export interface Microsoft365LicenseProductQuantities {
  purchasedUnits: number | null;
}

/** One month served by the API in the requested estimate currency, oldest month first. */
export interface Microsoft365LicenseHistoryMonth {
  /** Currency-independent SKU quantities. Omission is unknown coverage, not zero or absent stock. */
  productQuantities?: Record<string, Microsoft365LicenseProductQuantities>;
  pricingFacts?: Microsoft365PricingFacts;
  usage?: Microsoft365LicenseHistoryUsage;
  productUsage?: Record<string, Microsoft365LicenseProductUsage>;
  month: Microsoft365LicenseHistoryMonthKey;
  generatedAt: string;
  coverage: Microsoft365SourceRecord<Microsoft365CoverageState>;
  summary: Microsoft365LicenseView['summary'];
  insights?: Microsoft365LicenseHistoryInsights;
  /** Null when no estimate in the requested currency was stored for this month, or no currency was requested. */
  pricing: Microsoft365LicensePricing | null;
}
export interface Microsoft365LicenseHistory {
  pricingRevision?: string;
  schemaVersion: 'microsoft-365-license-history-series/v1';
  tenantId: string;
  /** Requested estimate currency; null serves quantities only. */
  currency: string | null;
  /** Months with a stored snapshot, oldest first. Months without a scan are absent, never zero. */
  months: Microsoft365LicenseHistoryMonth[];
}

const COVERAGE_STATES: readonly Microsoft365CoverageState[] = ['complete', 'partial', 'denied', 'unavailable', 'failed'];
const isHistoryCoverage = (value: unknown): boolean =>
  isRecord(value) &&
  MICROSOFT_365_LICENSE_SOURCES.every(name =>
    value[name] === undefined
      ? (MICROSOFT_365_LATER_LICENSE_SOURCES as readonly string[]).includes(name)
      : COVERAGE_STATES.includes(value[name] as Microsoft365CoverageState)
  ) &&
  Object.keys(value).every(key => (MICROSOFT_365_LICENSE_SOURCES as readonly string[]).includes(key));
const isViewSummary = (value: unknown): boolean =>
  isRecord(value) &&
  nullableCount(value.productCount) &&
  nullableCount(value.licensedAccountCount) &&
  nullableCount(value.disabledLicensedAccountCount) &&
  nullableCount(value.accountsWithUnknownAssignments) &&
  optional(value.observedLicensedAccountCount, count) &&
  optional(value.observedDisabledLicensedAccountCount, count);
const isHistoryInsights = (value: unknown): boolean =>
  isRecord(value) &&
  text(value.rulesVersion) &&
  !!value.rulesVersion &&
  nullableCount(value.overlapAssignmentCount) &&
  nullableCount(value.overlapAccountCount) &&
  nullableCount(value.downgradeCandidateCount) &&
  ['available', 'report_unavailable', 'identities_concealed'].includes(String(value.downgradeEvidence)) &&
  Object.keys(value).every(key =>
    ['rulesVersion', 'overlapAssignmentCount', 'overlapAccountCount', 'downgradeCandidateCount', 'downgradeEvidence'].includes(key)
  );
/** Stored estimates carry no per-account values or account ids. */
const isStoredHistoryPricing = (currency: string, value: unknown): boolean =>
  isMicrosoft365LicensePricing(value) &&
  value.currency === currency &&
  Object.keys(value.accountMonthlyCosts).length === 0 &&
  value.paidAccountIds === undefined &&
  value.partialAccountPriceIds === undefined &&
  value.breakdowns === undefined;

const onlyKeys = (value: Record<string, unknown>, keys: readonly string[]): boolean => Object.keys(value).every(key => keys.includes(key));
const isProductUsage = (value: unknown): boolean => {
  if (!isRecord(value)) return false;
  const products = Object.entries(value);
  return (
    products.length <= 2000 &&
    products.every(([skuId, usage]) => text(skuId) && !!skuId && skuId === skuId.toLowerCase() && isMicrosoft365LicenseProductUsage(usage))
  );
};
const hasValidUsage = (value: Record<string, unknown>): boolean =>
  optional(value.usage, isMicrosoft365LicenseHistoryUsage) &&
  optional(value.productUsage, isProductUsage) &&
  optional(value.pricingFacts, facts => isMicrosoft365PricingFacts(facts) && facts.groups === undefined);

const isProductQuantities = (value: unknown): boolean =>
  isRecord(value) &&
  Object.keys(value).length <= 2000 &&
  Object.entries(value).every(
    ([skuId, quantities]) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(skuId) &&
      isRecord(quantities) &&
      onlyKeys(quantities, ['purchasedUnits']) &&
      nullableCount(quantities.purchasedUnits)
  );

/** Validates one stored tenant month at storage and API boundaries. */
export function isMicrosoft365LicenseHistorySnapshot(value: unknown): value is Microsoft365LicenseHistorySnapshot {
  if (
    !isRecord(value) ||
    !onlyKeys(value, [
      'schemaVersion',
      'tenantId',
      'month',
      'generatedAt',
      'tenantSyncRunId',
      'coverage',
      'summary',
      'insights',
      'pricingByCurrency',
      'usage',
      'productUsage',
      'pricingFacts',
    ]) ||
    value.schemaVersion !== 'microsoft-365-license-history/v1' ||
    !text(value.tenantId) ||
    !value.tenantId ||
    !isMicrosoft365LicenseHistoryMonthKey(value.month) ||
    !date(value.generatedAt) ||
    microsoft365LicenseHistoryMonthOf(value.generatedAt as string) !== value.month ||
    (value.tenantSyncRunId !== undefined && !text(value.tenantSyncRunId)) ||
    !isHistoryCoverage(value.coverage) ||
    !isViewSummary(value.summary) ||
    !optional(value.insights, isHistoryInsights) ||
    !hasValidUsage(value) ||
    !isRecord(value.pricingByCurrency)
  )
    return false;
  const estimates = Object.entries(value.pricingByCurrency);
  return estimates.length <= 32 && estimates.every(([currency, pricing]) => /^[A-Z]{3}$/.test(currency) && isStoredHistoryPricing(currency, pricing));
}

/** Validates the API series served to the portal. */
export function isMicrosoft365LicenseHistory(value: unknown): value is Microsoft365LicenseHistory {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 'microsoft-365-license-history-series/v1' ||
    !text(value.tenantId) ||
    !value.tenantId ||
    !(value.currency === null || (typeof value.currency === 'string' && /^[A-Z]{3}$/.test(value.currency))) ||
    !Array.isArray(value.months) ||
    value.months.length > 60 ||
    !optional(value.pricingRevision, isMicrosoft365PricingRevision)
  )
    return false;
  const currency = value.currency;
  let previous = '';
  return value.months.every(month => {
    const valid =
      isRecord(month) &&
      onlyKeys(month, [
        'month',
        'generatedAt',
        'coverage',
        'summary',
        'insights',
        'pricing',
        'usage',
        'productUsage',
        'pricingFacts',
        'productQuantities',
      ]) &&
      isMicrosoft365LicenseHistoryMonthKey(month.month) &&
      month.month > previous &&
      date(month.generatedAt) &&
      isHistoryCoverage(month.coverage) &&
      isViewSummary(month.summary) &&
      optional(month.insights, isHistoryInsights) &&
      hasValidUsage(month) &&
      optional(month.productQuantities, isProductQuantities) &&
      (month.pricing === null || (typeof currency === 'string' && isStoredHistoryPricing(currency, month.pricing)));
    if (valid) previous = month.month as string;
    return valid;
  });
}
