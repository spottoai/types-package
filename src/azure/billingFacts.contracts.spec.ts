import type {
  AzureBillingFactsSourceV1,
  AzureBillingFactsCurrencyV1,
  AzureBillingFactsSpendV1,
  AzureBillingFactsSpendAvailabilityV1,
  AzureBillingDailyFactsV1,
  AzureBillingDriverGroupingV1,
  AzureBillingOverviewV1,
  AzureBillingDriversV1,
} from './billingFacts.js';
import { isAzureBillingOverviewV1, isAzureBillingDriversV1, AZURE_BILLING_FACTS_LIMITS_V1 } from '../index.js';

declare const source: AzureBillingFactsSourceV1;
declare const spend: AzureBillingFactsSpendV1;
declare const overview: AzureBillingOverviewV1;
declare const drivers: AzureBillingDriversV1;

const independentBases: AzureBillingFactsSpendV1 = {
  ...spend,
  allCharge: {
    billed: { status: 'available', totalMinorUnits: 0, billingBackedMinorUnits: 0, estimatedMinorUnits: 0 },
    amortized: { status: 'unavailable', reasonCode: 'not-produced' },
  },
};
const noCurrency: AzureBillingFactsCurrencyV1 = { status: 'unavailable', reasonCode: 'currency-unresolved' };
const unavailable: AzureBillingFactsSpendAvailabilityV1 = { status: 'unavailable', reasonCode: 'reconciliation-failed' };
const unknownDay: AzureBillingDailyFactsV1 = { date: '2026-11-01', status: 'unknown', reasonCode: 'coverage-unproven' };
const overflow: AzureBillingDriverGroupingV1 = { status: 'unavailable', reasonCode: 'byte-budget-exceeded' };
// @ts-expect-error Billed evidence cannot silently stand in for required amortized availability.
const missingBasis: AzureBillingFactsSpendV1['allCharge'] = { billed: spend.allCharge.billed };
// @ts-expect-error Both current and previous input identities are mandatory.
const missingPrevious: AzureBillingFactsSourceV1 = {
  companyId: source.companyId,
  subscriptionId: source.subscriptionId,
  portalGenerationId: source.portalGenerationId,
  billingInputGenerationId: source.billingInputGenerationId,
  current: source.current,
};
// @ts-expect-error Window-specific receipt kind cannot be swapped across periods.
const wrongReceipt: AzureBillingFactsSourceV1['current'] = source.previous;
const wrongSourcePath: AzureBillingFactsSourceV1['current'] = {
  kind: 'current30Days',
  status: 'available',
  period: source.current.period,
  fingerprint: 'fingerprint',
  etag: 'etag',
  // @ts-expect-error Source paths cannot be substituted across receipt kinds.
  sourcePath: 'history/billing/cost-last-30-days-previous.json',
};
// @ts-expect-error Unknown source presence cannot be fabricated as a numeric zero.
const absentPresence: AzureBillingFactsSpendV1['billingBackedRowCount'] = undefined;
// @ts-expect-error An unverified currency cannot carry a guessed currency code.
const guessedCurrency: AzureBillingFactsCurrencyV1 = { status: 'unavailable', reasonCode: 'currency-unresolved', currencyCode: 'USD' };
// @ts-expect-error Missing money is a state, not a number.
const missingAsZero: AzureBillingFactsSpendAvailabilityV1 = 0;
// @ts-expect-error A truncated grouping is not a complete population.
const truncated: AzureBillingDriverGroupingV1 = { status: 'partial', rows: [] };
const fabricatedZero: AzureBillingDailyFactsV1 = {
  date: '2026-11-01',
  status: 'unknown',
  reasonCode: 'coverage-unproven',
  // @ts-expect-error Unknown dates cannot claim a monetary zero.
  allCharge: spend.allCharge,
};

void [
  independentBases,
  noCurrency,
  unavailable,
  unknownDay,
  overflow,
  missingBasis,
  missingPrevious,
  wrongReceipt,
  guessedCurrency,
  missingAsZero,
  truncated,
  fabricatedZero,
];
void [wrongSourcePath, absentPresence];
void [isAzureBillingOverviewV1(overview), isAzureBillingDriversV1(drivers), AZURE_BILLING_FACTS_LIMITS_V1];
