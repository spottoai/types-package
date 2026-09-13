import type { CostBasis, PublicCostComposition, PublicMoneyComponent } from './costComposition';
import type { ReportBoundedRows } from './reportEvidence';

export const REPORT_SPEND_LIMITS = { periods: 14, servicesPerPeriod: 100, periodDays: 92, assumptions: 10, textLength: 500 } as const;

/** Completeness for the exact period and scope, not merely the presence of a numeric amount. */
export type ReportSpendCoverage = 'complete' | 'partial' | 'unavailable';

/** Basis of a savings baseline. Retail/mixed/unknown must not be presented as proved bill reduction. */
export type ReportSavingsBasis = CostBasis | 'retail' | 'mixed' | 'unknown';

export interface ReportSpendBasisCoverage {
  actual: ReportSpendCoverage;
  estimated: ReportSpendCoverage;
  combined: ReportSpendCoverage;
}

export interface ReportEstimateEvidence {
  reason: 'billing-lag' | 'billing-unavailable-sponsorship' | 'other';
  method: string;
  /** UTC observation time for the estimate inputs, not the report generation time. */
  observedAt: string;
}

/** Retail equivalent for the same period/scope. Never add this benchmark to either cost basis. */
export type ReportRetailValuation =
  | { status: 'unavailable' }
  | {
      status: 'available';
      component: PublicMoneyComponent;
      coverage: 'complete' | 'partial';
      /** Identifies which services/meters are included or excluded, particularly for partial coverage. */
      scopeDescription: string;
      pricingSource: string;
      /** UTC observation time for the price data. */
      pricedAt: string;
      assumptions: string[];
    };

/**
 * Alternative billed/amortized totals, each partitioned into actual and estimated source amounts.
 * Combined follows composition.selectedLens after superseded/overlapping estimates are removed.
 * Decimal strings follow PublicMoneyComponent (up to 15 integer and 8 fractional digits here).
 * Coverage is independent for each component. An absent estimate is not a confirmed zero.
 */
export interface ReportSpendAmounts {
  composition: PublicCostComposition;
  coverage: { billed: ReportSpendBasisCoverage; amortized: ReportSpendBasisCoverage };
  /** Required for each available estimated component; absent when that component is unavailable. */
  estimates?: { billed?: ReportEstimateEvidence; amortized?: ReportEstimateEvidence };
  retail: ReportRetailValuation;
}

export interface ReportSpendService {
  /** Stable service grouping key; names are display-only. */
  serviceKey: string;
  name: string;
  amounts: ReportSpendAmounts;
}

export interface ReportSpendPeriod {
  kind: 'calendar-month' | 'billing-period' | 'rolling-30-days';
  /** Inclusive YYYY-MM-DD boundaries. Calendar months are complete calendar intervals. */
  startDate: string;
  endDate: string;
  amounts: ReportSpendAmounts;
  /** Display catalogue only; totals above always cover the whole declared scope, including omitted services. */
  services?: ReportBoundedRows<ReportSpendService>;
}

/**
 * Optional typed financial section inheriting the containing subscription's scope.
 * At most 13 historical calendar/billing periods plus one rolling 30-day interval.
 * Different period kinds may overlap and must not be summed together.
 * Missing coverage is disclosed; no currency conversion or unused-commitment allocation is inferred.
 */
export interface ReportSpendProjection {
  currency: string;
  dateBasis: 'billing-calendar';
  generatedAt: string;
  sourceObservedAt?: string;
  freshness: 'current' | 'stale' | 'unavailable';
  periods: ReportSpendPeriod[];
}
