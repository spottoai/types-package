import assert from 'node:assert/strict';
import { isMicrosoft365LicensePricing, isMicrosoft365LicenseView, MICROSOFT_365_LICENSE_SOURCES } from '../dist/esm/entries/root.js';
import { createRequire } from 'node:module';

const legacy = {
  basis: 'list_price_estimate',
  priceListVersion: 'legacy',
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
assert(isMicrosoft365LicensePricing(legacy), 'Legacy pricing remains valid without coverage additions.');
const current = {
  ...legacy,
  paidAccountIds: [],
  partialAccountPriceIds: [],
  summary: { ...legacy.summary, pricedPaidProductCount: 0, pricedPaidUnits: 0, pricesComplete: true },
};
assert(isMicrosoft365LicensePricing(current), 'Genuine zero coverage remains valid.');
for (const field of ['pricedPaidUnits', 'pricedPaidProductCount']) {
  for (const invalid of [-1, 0.5, '0', 1]) {
    assert(
      !isMicrosoft365LicensePricing({ ...current, summary: { ...current.summary, [field]: invalid } }),
      `${field} cannot be invalid or exceed the paid total.`
    );
  }
}
assert(!isMicrosoft365LicensePricing({ ...current, paidAccountIds: Array(2001).fill('account') }), 'Membership is bounded.');
assert(!isMicrosoft365LicensePricing({ ...current, partialAccountPriceIds: [null] }), 'Partial account identifiers must be strings.');
assert(!isMicrosoft365LicensePricing({ ...current, summary: { ...current.summary, pricesComplete: 'true' } }));
console.log('Microsoft 365 pricing contracts: legacy compatibility, coverage counts and bounded account metadata pass.');

const license = {
  skuId: '05e9a617-0261-4cee-bb44-138d3ef5d965',
  skuPartNumber: 'SPE_E3',
  appliesTo: null,
  capabilityStatus: null,
  enabledUnits: null,
  consumedUnits: null,
  unallocatedUnits: null,
  warningUnits: null,
  suspendedUnits: null,
};
const legacyView = {
  schemaVersion: 'microsoft-365-license-view/v1',
  tenantId: 'contract-test',
  generatedAt: '2026-10-07T00:00:00Z',
  coverage: Object.fromEntries(
    MICROSOFT_365_LICENSE_SOURCES.map(name => [
      name,
      {
        state: 'complete',
        requiredPermissions: [],
        attemptedAt: '2026-10-07T00:00:00Z',
        observedAt: '2026-10-07T00:00:00Z',
        recovery: { action: 'none', optional: false },
        observedRowCount: 0,
        omittedRowCount: 0,
      },
    ])
  ),
  reportIdentity: { concealment: 'unknown', correlation: 'not_performed' },
  summary: { productCount: 0, licensedAccountCount: 0, disabledLicensedAccountCount: 0, accountsWithUnknownAssignments: 0 },
  licenses: [license],
  accounts: [],
  reports: { officeActiveUsers: [], officeAppUsage: [], copilotUsage: [] },
};
const cjs = createRequire(import.meta.url)('../dist/index.js');
for (const validate of [isMicrosoft365LicenseView, cjs.isMicrosoft365LicenseView]) {
  assert(validate(legacyView), 'Older snapshots without productName remain valid.');
  assert(
    validate({ ...legacyView, licenses: [{ ...license, productName: 'Microsoft 365 E3' }] }),
    'Name-only metadata with unknown quantities remains valid.'
  );
  for (const productName of [null, 123, {}, 'x'.repeat(513)]) {
    assert(!validate({ ...legacyView, licenses: [{ ...license, productName }] }), 'Supplied names must be bounded strings.');
  }
}
console.log('Microsoft 365 product-name contracts: legacy snapshots, unknown quantities and CJS/ESM validators pass.');
