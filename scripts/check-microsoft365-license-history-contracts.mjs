import assert from 'node:assert/strict';
import {
  isMicrosoft365LicenseHistory,
  isMicrosoft365LicenseHistorySnapshot,
  microsoft365LicenseHistoryMonthOf,
} from '../dist/esm/entries/root.js';

const pricing = {
  basis: 'list_price_estimate',
  priceListVersion: 'microsoft-2026-07',
  currency: 'NZD',
  currencyFallback: false,
  term: 'annual_commitment',
  products: [],
  accountMonthlyCosts: {},
  summary: {
    paidProductCount: 0,
    unpricedProductCount: 0,
    purchasedPaidUnits: 0,
    assignedPaidUnits: 0,
    unassignedPaidUnits: 0,
    monthlyCost: 0,
    unassignedMonthlyCost: 0,
    disabledAccountCount: 0,
    disabledMonthlyCost: 0,
    inactiveAccountCount: 0,
    inactiveMonthlyCost: 0,
    accountsComplete: true,
    disabledAccountsComplete: true,
  },
};
const coverage = {
  subscribedSkus: 'complete',
  users: 'complete',
  signInActivity: 'denied',
  reportSettings: 'denied',
  officeActiveUsers: 'denied',
  officeAppUsage: 'denied',
  copilotUsage: 'denied',
};
const snapshot = {
  schemaVersion: 'microsoft-365-license-history/v1',
  tenantId: 'tenant-1',
  month: '2026-10',
  generatedAt: '2026-10-12T01:00:00.000Z',
  coverage,
  summary: { productCount: 1, licensedAccountCount: 2, disabledLicensedAccountCount: 0, accountsWithUnknownAssignments: 0 },
  pricingByCurrency: { NZD: pricing },
};
assert.equal(microsoft365LicenseHistoryMonthOf('2026-10-31T23:59:59.999Z'), '2026-10');
assert.equal(microsoft365LicenseHistoryMonthOf('not a date'), null);
assert(isMicrosoft365LicenseHistorySnapshot(snapshot), 'A month without later sources or insights is valid.');
assert(!isMicrosoft365LicenseHistorySnapshot({ ...snapshot, month: '2026-11' }), 'The month must match generatedAt.');
assert(!isMicrosoft365LicenseHistorySnapshot({ ...snapshot, month: '2026-13' }), 'Month keys are validated.');
assert(
  !isMicrosoft365LicenseHistorySnapshot({ ...snapshot, pricingByCurrency: { NZD: { ...pricing, accountMonthlyCosts: { a: 1 } } } }),
  'Stored months never hold per-account values.'
);
assert(
  !isMicrosoft365LicenseHistorySnapshot({ ...snapshot, pricingByCurrency: { NZD: { ...pricing, paidAccountIds: ['a'] } } }),
  'Stored months never hold account ids.'
);
assert(!isMicrosoft365LicenseHistorySnapshot({ ...snapshot, pricingByCurrency: { AUD: pricing } }), 'Currency keys match estimates.');
assert(!isMicrosoft365LicenseHistorySnapshot({ ...snapshot, coverage: { ...coverage, users: 'zero' } }), 'Coverage states are closed.');
assert(!isMicrosoft365LicenseHistorySnapshot({ ...snapshot, coverage: { ...coverage, extra: 'complete' } }), 'Unknown sources are rejected.');
assert(
  !isMicrosoft365LicenseHistorySnapshot({ ...snapshot, insights: { rulesVersion: 'v1', overlapAssignmentCount: 1, overlapAccountCount: 1, downgradeCandidateCount: 0, downgradeEvidence: 'available', findings: [] } }),
  'Stored insights keep counts only.'
);

const month = { month: '2026-09', generatedAt: '2026-09-30T01:00:00.000Z', coverage, summary: snapshot.summary, pricing };
const series = {
  schemaVersion: 'microsoft-365-license-history-series/v1',
  tenantId: 'tenant-1',
  currency: 'NZD',
  months: [month, { ...month, month: '2026-10', generatedAt: snapshot.generatedAt, pricing: null }],
};
assert(isMicrosoft365LicenseHistory(series), 'A served series with a missing-currency month is valid.');
assert(!isMicrosoft365LicenseHistory({ ...series, months: [...series.months].reverse() }), 'Months are ordered oldest first.');
assert(!isMicrosoft365LicenseHistory({ ...series, currency: null }), 'Pricing requires a requested currency.');
assert(isMicrosoft365LicenseHistory({ ...series, currency: null, months: [{ ...month, pricing: null }] }), 'Quantities-only series.');
assert(!isMicrosoft365LicenseHistory({ ...series, currency: 'AUD' }), 'Served pricing matches the requested currency.');
console.log('Microsoft 365 license history contracts: month keys, stored privacy bounds and served series ordering pass.');
