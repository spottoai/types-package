import type { ReportSpendAmounts } from './reportSpend';

/** Maximum span of the current month and two preceding complete calendar months. */
export const REPORT_DAILY_SPEND_MAX_DAYS = 92;

export interface ReportDailySpendEntry {
  /** Billing-calendar date, YYYY-MM-DD. Entries must be unique and ordered oldest first. */
  date: string;
  /** Billed actual total. Omit unless the entire day's actual evidence is covered. Credits may be negative. */
  cost?: number;
  /** Amortized actual total; never substitute cost when amortized evidence is absent. */
  costAmortized?: number;
  /**
   * Optional explicit composition and retail benchmark. Complete actual components must also populate
   * the matching legacy numeric field with the same amount; partial/unknown actuals must omit it.
   */
  financials?: ReportSpendAmounts;
}

export interface ReportDailySpendCoverage {
  status: 'complete' | 'partial' | 'unavailable';
  /** Dates with a confirmed total for this basis, including explicitly confirmed zero-cost days. */
  coveredDayCount: number;
}

/**
 * Compact actual billing history for one subscription, inheriting the containing pack's scope.
 * Estimates and retail are allowed only in financials; they never enter legacy actual fields or coverage.
 * No resource breakdowns or currency conversion. Missing dates/amounts are not zero.
 * Consumers select the same cost basis and currency for daily charts and monthly headlines.
 */
export interface ReportDailySpend {
  /** Inclusive requested coverage window, at most REPORT_DAILY_SPEND_MAX_DAYS calendar dates. */
  startDate: string;
  endDate: string;
  dateBasis: 'billing-calendar';
  /** Resolved uppercase three-letter currency code for every amount. */
  currency: string;
  /** UTC ISO timestamp when this projection was built. */
  generatedAt: string;
  /** Oldest verification timestamp of contributing sources, required when entries exist. */
  sourceObservedAt?: string;
  /** Freshness does not establish completeness. Retained complete periods can still be stale. */
  freshness: 'current' | 'stale' | 'unavailable';
  coverage: {
    billed: ReportDailySpendCoverage;
    amortized: ReportDailySpendCoverage;
  };
  /** At least one legacy amount or available financial component per entry. Zero requires confirmed coverage. */
  entries: ReportDailySpendEntry[];
}
