import {
  isReportSpendAmounts,
  isReportSpendProjection,
  isReportSavingsBasis,
  type PublicCostComposition,
  type ReportSpendAmounts,
  type ReportSpendProjection,
  type ReportSpendResourceType,
  type ReportSavingsBasis,
  type ReportDailySpendEntry,
  type SubscriptionReportingProjection,
  type ReportCompactRecommendation,
} from '../index';

const composition: PublicCostComposition = {
  schemaVersion: 1,
  selectedLens: 'actual-only',
  billed: {
    basis: 'billed',
    actual: { support: 'supported', availability: { status: 'available', component: { amount: '1000', currencyCode: 'NZD' } } },
    estimated: { support: 'supported', availability: { status: 'unavailable' } },
    combined: { status: 'available', component: { amount: '1000', currencyCode: 'NZD' } },
    status: 'actual-only',
  },
  amortized: {
    basis: 'amortized',
    actual: { support: 'supported', availability: { status: 'available', component: { amount: '3000', currencyCode: 'NZD' } } },
    estimated: { support: 'supported', availability: { status: 'unavailable' } },
    combined: { status: 'available', component: { amount: '3000', currencyCode: 'NZD' } },
    status: 'actual-only',
  },
};
const amounts: ReportSpendAmounts = {
  composition,
  coverage: {
    billed: { actual: 'complete', estimated: 'unavailable', combined: 'complete' },
    amortized: { actual: 'complete', estimated: 'unavailable', combined: 'complete' },
  },
  retail: { status: 'unavailable' },
};
const spend: ReportSpendProjection = {
  currency: 'NZD',
  dateBasis: 'billing-calendar',
  generatedAt: '2026-09-14T00:00:00Z',
  sourceObservedAt: '2026-09-13T00:00:00Z',
  freshness: 'current',
  periods: [{ kind: 'calendar-month', startDate: '2026-08-01', endDate: '2026-08-31', amounts }],
};
const oldConsumer: Pick<SubscriptionReportingProjection, 'spend'> = {};
const newConsumer: Pick<SubscriptionReportingProjection, 'spend'> = { spend };
const snapshotSpend: ReportSpendResourceType = { resourceType: 'microsoft.compute/snapshots', amounts };
const withResourceTypes: ReportSpendProjection = {
  ...spend,
  periods: [{ ...spend.periods[0], resourceTypes: { rows: [snapshotSpend], totalCount: 1, omittedCount: 0 } }],
};
// @ts-expect-error type subtotals require the existing explicit financial composition
const missingTypeAmounts: ReportSpendResourceType = { resourceType: 'microsoft.compute/snapshots' };
// @ts-expect-error provider resource-type identifiers remain strings, not numbers or a fixed enum
const invalidResourceType: ReportSpendResourceType = { resourceType: 28, amounts };
const daily: ReportDailySpendEntry = { date: '2026-08-01', cost: 1000, costAmortized: 3000, financials: amounts };
const retailSavings: Pick<ReportCompactRecommendation, 'savingsBasis'> = { savingsBasis: 'retail' };
const validBasis: ReportSavingsBasis = 'mixed';
// @ts-expect-error estimated is source provenance, not a savings cost basis
const invalidBasis: ReportSavingsBasis = 'estimated';
// @ts-expect-error monetary components preserve exact decimal strings
const invalidMoney: typeof composition.billed.combined = { status: 'available', component: { amount: 1000, currencyCode: 'NZD' } };
void [
  oldConsumer,
  newConsumer,
  withResourceTypes,
  missingTypeAmounts,
  invalidResourceType,
  daily,
  retailSavings,
  validBasis,
  invalidBasis,
  invalidMoney,
  isReportSpendAmounts(amounts),
  isReportSpendProjection(spend),
  isReportSavingsBasis('retail'),
];
