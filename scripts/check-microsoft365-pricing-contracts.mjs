import assert from 'node:assert/strict';
import { isMicrosoft365LicensePricing } from '../dist/esm/entries/root.js';

const legacy = {
  basis: 'list_price_estimate', priceListVersion: 'legacy', currency: 'NZD', currencyFallback: false,
  term: 'annual_commitment', products: [], accountMonthlyCosts: {},
  summary: {
    paidProductCount: 0, unpricedProductCount: 0, purchasedPaidUnits: 0, assignedPaidUnits: 0, unassignedPaidUnits: 0,
    monthlyCost: 0, unassignedMonthlyCost: 0, disabledAccountCount: 0, disabledMonthlyCost: 0,
    inactiveAccountCount: 0, inactiveMonthlyCost: 0, accountsComplete: true, disabledAccountsComplete: true,
  },
};
assert(isMicrosoft365LicensePricing(legacy), 'Legacy pricing remains valid without coverage additions.');
const current = { ...legacy, paidAccountIds: [], partialAccountPriceIds: [],
  summary: { ...legacy.summary, pricedPaidProductCount: 0, pricedPaidUnits: 0, pricesComplete: true } };
assert(isMicrosoft365LicensePricing(current), 'Genuine zero coverage remains valid.');
for (const field of ['pricedPaidUnits', 'pricedPaidProductCount']) {
  for (const invalid of [-1, 0.5, '0', 1]) {
    assert(!isMicrosoft365LicensePricing({ ...current, summary: { ...current.summary, [field]: invalid } }), `${field} cannot be invalid or exceed the paid total.`);
  }
}
assert(!isMicrosoft365LicensePricing({ ...current, paidAccountIds: Array(2001).fill('account') }), 'Membership is bounded.');
assert(!isMicrosoft365LicensePricing({ ...current, partialAccountPriceIds: [null] }), 'Partial account identifiers must be strings.');
assert(!isMicrosoft365LicensePricing({ ...current, summary: { ...current.summary, pricesComplete: 'true' } }));
console.log('Microsoft 365 pricing contracts: legacy compatibility, coverage counts and bounded account metadata pass.');
