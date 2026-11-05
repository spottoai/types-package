import type { MoneyUnavailableReason } from './costComposition.js';
import type {
  AzureFinancialChargeSpendBreakdownV1,
  AzureFinancialChargeSpendSourceTotalsV1,
  AzureFinancialChargeUnknownMaterialV1,
  AzureNativeDiscountEligibilityV1,
} from './financialChargePolicy.js';

/** Decoded UTF-8 JSON limits; readers enforce these before parsing as well. */
export const AZURE_BILLING_FACTS_LIMITS_V1 = Object.freeze({
  overviewMaxDecodedBytes: 64 * 1024,
  driversMaxDecodedBytes: 256 * 1024,
  maxDaysPerWindow: 30,
  maxDriverRowsPerGrouping: 1024,
  maxLabelLength: 200,
} as const);

/** Exactly 30 UTC calendar days, inclusive start and exclusive end. */
export interface AzureBillingFactsPeriodV1 {
  startDate: string;
  endDateExclusive: string;
}

export type AzureBillingFactsSourcePathV1 = 'history/billing/cost-last-30-days.json' | 'history/billing/cost-last-30-days-previous.json';

/** Receipt of the effective rows selected before immutable billing-input publication. */
export type AzureBillingFactsWindowSourceV1 = {
  period: AzureBillingFactsPeriodV1;
  /** Producer fingerprint of the selected contents or explicit absence, independently for each window. */
  fingerprint: string;
} & (
  | { status: 'available'; kind: 'current30Days'; sourcePath: 'history/billing/cost-last-30-days.json'; etag: string }
  | { status: 'available'; kind: 'previous30Days'; sourcePath: 'history/billing/cost-last-30-days-previous.json'; etag: string }
  | { status: 'unavailable'; kind: 'current30Days' | 'previous30Days'; reasonCode: MoneyUnavailableReason }
);

/** Both artifact and selected-input generations are mandatory; neither receipt stands in for the other. */
export interface AzureBillingFactsSourceV1 {
  companyId: string;
  /** Native Azure subscription GUID, never an internal account alias. */
  subscriptionId: string;
  portalGenerationId: string;
  billingInputGenerationId: string;
  current: AzureBillingFactsWindowSourceV1 & { kind: 'current30Days' };
  previous: AzureBillingFactsWindowSourceV1 & { kind: 'previous30Days' };
}

export type AzureBillingFactsCurrencyV1 =
  | { status: 'verified'; currencyCode: string; minorUnitScale: number; resolutionRef: string }
  | { status: 'unavailable'; reasonCode: 'currency-unresolved' };

export type AzureBillingFactsDiscountEligibilityV1 =
  | { status: 'available'; value: AzureNativeDiscountEligibilityV1 }
  | { status: 'unavailable'; reasonCode: MoneyUnavailableReason };

/**
 * Canonical provider amounts on matching source/period/currency/basis. Independently
 * rounded child collections must not be summed to derive authoritative parent spend.
 * Header scopes the existing spend partition; eligibility is a subset, never an
 * additional source. Fixed commitment purchases/refunds remain excluded under
 * the native eligibility contract. Signed eligible amounts may exceed native net.
 * Company pricing is applied only on read. Missing bases never borrow billed money.
 *
 * Exact all-charge/provenance totals must match the canonical tool accumulator.
 * Do not substitute rounded DecompositionTree source sums: those can differ by a
 * cent. Producers must reconcile using canonical rounding or publish unavailable;
 * guards validate evidence, they do not calculate/repair financial amounts.
 */
export type AzureBillingFactsSpendV1 = Pick<
  AzureFinancialChargeSpendBreakdownV1,
  'status' | 'allCharge' | 'azureNative' | 'marketplace' | 'unknown' | 'unknownMaterial'
> & {
  /**
   * Weighted contributing-row presence, using each selected record's positive
   * sourceRowCount, otherwise1. A zero component with zero rows is absent for a
   * provenance-only lens; a produced zero with nonzero rows remains present.
   */
  billingBackedRowCount: number;
  estimatedRowCount: number;
  azureNativeDiscountEligible: AzureFinancialChargeSpendSourceTotalsV1;
  discountEligibility: AzureBillingFactsDiscountEligibilityV1;
};

export type AzureBillingFactsSpendAvailabilityV1 =
  | AzureBillingFactsSpendV1
  | { status: 'unavailable'; reasonCode: MoneyUnavailableReason | 'reconciliation-failed' };

/**
 * A complete window requires all30 source-proven dates, not observed min/max.
 * Proven dates assert source date coverage only, never invoice finality or the
 * completeness of provider usage. Partial coverage still permits recorded spend.
 */
export interface AzureBillingFactsCoverageV1 {
  status: 'complete' | 'partial' | 'unavailable';
  /** Weighted contributing rows, identical to canonical unknown-material/source presence counts. */
  rowCount: number;
  /** Same weighting as rowCount, for selected records without a usable UTC date. */
  rowsWithoutDate: number;
  provenDates: string[];
  observedDateRange: { startDate: string; endDateInclusive: string } | null;
}

/** Missing dates are unknown; only explicit source-proven zero points establish zero. */
export type AzureBillingDailyFactsV1 = { date: string } & (
  | { status: 'unknown'; reasonCode: MoneyUnavailableReason }
  | {
      status: 'observed' | 'verified-zero';
      /** Same contributing-row weighting as the window; no inference from net amounts. */
      billingBackedRowCount: number;
      estimatedRowCount: number;
      allCharge: AzureFinancialChargeSpendSourceTotalsV1;
      azureNativeDiscountEligible: AzureFinancialChargeSpendSourceTotalsV1;
      unknownMaterial: AzureFinancialChargeUnknownMaterialV1;
    }
);

export interface AzureBillingWindowTotalsV1 {
  period: AzureBillingFactsPeriodV1;
  spend: AzureBillingFactsSpendAvailabilityV1;
}

export interface AzureBillingWindowFactsV1 extends AzureBillingWindowTotalsV1 {
  /**
   * Daily amounts were independently rounded in minor units. Parent spend remains
   * authoritative; a complete daily series need not add exactly to it. Absent
   * means strict equality. Complete weighted provenance populations reconcile
   * exactly; partial daily populations remain subsets. Within-record partitions
   * stay exact; scope-thresholded material counts may undercount.
   * Omit this key when unused; own-property undefined is not valid wire data.
   */
  roundingMode?: 'independent-minor-units';
  coverage: AzureBillingFactsCoverageV1;
  /** Ordered unique dates, at most30. Omitted dates never imply zero. */
  daily: AzureBillingDailyFactsV1[];
}

interface AzureBillingFactsHeaderV1 {
  schemaVersion: 1;
  generatedAt: string;
  source: AzureBillingFactsSourceV1;
  currency: AzureBillingFactsCurrencyV1;
}

export type AzureBillingDriversUnavailableReasonV1 =
  | 'byte-budget-exceeded'
  | 'group-limit-exceeded'
  | 'source-unavailable'
  | 'currency-unresolved'
  | 'reconciliation-failed';

export interface AzureBillingOverviewV1 extends AzureBillingFactsHeaderV1 {
  artifactKind: 'billing-overview';
  current: AzureBillingWindowFactsV1;
  previous: AzureBillingWindowFactsV1;
  /** Sibling in this exact immutable Portal run; advertised only after successful write. */
  drivers:
    | { status: 'available'; relativePath: 'billing-drivers.json' }
    | { status: 'unavailable'; reasonCode: AzureBillingDriversUnavailableReasonV1 };
}

/** Complete union of current/previous group identities; absent group money needs proven zero. */
export interface AzureBillingDriverRowV1 {
  id: string;
  label: string;
  current: AzureBillingFactsSpendAvailabilityV1;
  previous: AzureBillingFactsSpendAvailabilityV1;
}

/** No truncated top-N. Unavailable groupings cannot answer exact ranking/filter questions. */
export type AzureBillingDriverGroupingV1 =
  | {
      status: 'complete';
      /**
       * Independent child rounding with bounded differences; parent spend is
       * authoritative. Weighted provenance counts remain exact, while material
       * counts may undercount. Omit this key when unused; never emit undefined.
       */
      roundingMode?: 'independent-minor-units';
      rows: AzureBillingDriverRowV1[];
    }
  | { status: 'unavailable'; reasonCode: AzureBillingDriversUnavailableReasonV1 };

/** Service and resource-type marginals are independent; never add or intersect them as a cube. */
export interface AzureBillingDriversV1 extends AzureBillingFactsHeaderV1 {
  artifactKind: 'billing-drivers';
  current: AzureBillingWindowTotalsV1;
  previous: AzureBillingWindowTotalsV1;
  service: AzureBillingDriverGroupingV1;
  resourceType: AzureBillingDriverGroupingV1;
}

export { isAzureBillingOverviewV1, isAzureBillingDriversV1 } from './billingFactsValidation.js';
