import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const formats = { commonjs: require('../dist/index.js'), esm: await import('../dist/esm/entries/root.js') };
const fixture = JSON.parse(readFileSync(new URL('../tests/fixtures/microsoft365-storage-costs.json', import.meta.url), 'utf8'));
const content = JSON.parse(readFileSync(new URL('../tests/fixtures/microsoft365-licensing-content.json', import.meta.url), 'utf8'));
const changed = mutation => {
  const result = structuredClone(fixture);
  mutation(result, result.currencies[0], result.currencies[0].rates[0], result.currencies[0].estimates[0]);
  return result;
};
const storageCategories = [
  'sharepoint-storage-payg',
  'sharepoint-archive',
  'onedrive-archive',
  'dataverse-database',
  'dataverse-file',
  'dataverse-log',
];

for (const [format, api] of Object.entries(formats)) {
  test(`${format}: storage cost public guards and fixture`, () => {
    for (const name of ['isMicrosoft365StorageCostView', 'isMicrosoft365StorageRate', 'isMicrosoft365StorageCostEstimate'])
      assert.equal(typeof api[name], 'function', name);
    assert.equal(api.isMicrosoft365StorageCostView(fixture), true);
    assert.equal(api.isMicrosoft365StorageRate(fixture.currencies[0].rates[0]), true);
    assert.equal(api.isMicrosoft365StorageCostEstimate(fixture.currencies[0].estimates[0]), true);
  });
  test(`${format}: old artifacts remain valid; new storage costs validate at the root`, () => {
    assert.equal(api.isMicrosoft365LicensingContent(content), true);
    const value = structuredClone(content);
    value.storageCosts = structuredClone(fixture);
    value.storageCosts.generatedAt = value.generatedAt;
    assert.equal(api.isMicrosoft365LicensingContent(value), true);
    value.storageCosts.generatedAt = '2020-01-01T00:00:00.000Z';
    assert.equal(api.isMicrosoft365LicensingContent(value), false);
    value.storageCosts = null;
    assert.equal(api.isMicrosoft365LicensingContent(value), false);
  });
  test(`${format}: expanded billing categories coexist, including Security Copilot`, () => {
    const value = structuredClone(content);
    const categories = [
      'github-copilot-seats',
      'github-copilot-consumption',
      'github-other',
      'copilot-studio',
      'security-copilot',
      'fabric-ai',
      ...storageCategories,
    ];
    assert.deepEqual([...api.MICROSOFT_365_RELATED_SPEND_CATEGORIES], categories);
    const template = value.relatedSpend.currencies[0].products[0];
    value.relatedSpend.currencies[0].products = categories.map(category => ({ ...structuredClone(template), category }));
    assert.equal(api.isMicrosoft365LicensingContent(value), true);
    for (const product of value.relatedSpend.currencies[0].products) {
      product.billed.amount = -1.25;
      product.amortized = { state: 'unavailable', amount: null, reasonCodes: ['missing_amortized_amount'] };
    }
    assert.equal(api.isMicrosoft365LicensingContent(value), true);
  });
  test(`${format}: unavailable pricing and independent zero pricing`, () => {
    const absent = changed((view, group, rate, estimate) => {
      rate.amount = null;
      rate.source = null;
      rate.quote = null;
      rate.availability = { ...rate.availability, state: 'unavailable', reasonCodes: ['price_not_found'] };
      estimate.amount = null;
      estimate.availability = { ...estimate.availability, state: 'unavailable', reasonCodes: ['price_not_found'] };
    });
    assert.equal(api.isMicrosoft365StorageCostView(absent), true);
    const zero = changed((view, group, rate, estimate) => {
      rate.amount = 0;
      rate.quote = null;
      estimate.amount = 0;
    });
    assert.equal(api.isMicrosoft365StorageCostView(zero), true);
    absent.currencies[0].estimates[0].amount = 0;
    assert.equal(api.isMicrosoft365StorageCostView(absent), false);
  });
  test(`${format}: daily storage rate has a dated chargeable window`, () => {
    const value = changed((view, group, rate, estimate) => {
      rate.product = estimate.product = 'sharepoint-storage-payg';
      rate.unit = 'gb_day';
      rate.term = 'pay_as_you_go';
      rate.amount = 0.01;
      rate.quote = null;
      rate.source.kind = 'azure_retail';
      estimate.purpose = 'usage_capacity';
      estimate.skuPartNumber = null;
      estimate.period = { kind: 'window', startDate: '2026-10-01', endDate: '2026-10-30' };
      estimate.chargeableDays = 30;
      estimate.amount = 30;
    });
    assert.equal(api.isMicrosoft365StorageCostView(value), true);
    value.currencies[0].estimates[0].chargeableDays = 31;
    assert.equal(api.isMicrosoft365StorageCostView(value), false);
  });
  test(`${format}: agreed prices are distinct from public reference rates`, () => {
    const value = changed((view, group, rate, estimate) => {
      rate.source = { kind: 'customer_agreement', url: null, checkedAt: '2026-10-20' };
      estimate.basis = 'agreed_price_estimate';
    });
    assert.equal(api.isMicrosoft365StorageCostView(value), true);
    value.currencies[0].estimates[0].basis = 'reference_price_estimate';
    assert.equal(api.isMicrosoft365StorageCostView(value), false);
  });
  const invalid = [
    ['sparse rates', (v, g) => (g.rates = Array(1))],
    ['sparse estimates', (v, g) => (g.estimates = Array(1))],
    ['sparse coverage reasons', v => (v.availability.reasonCodes = Array(1))],
    ['unknown key', v => (v.customerSecret = 'no')],
    ['unknown product', (v, g, r) => (r.product = 'anything')],
    ['unknown currency', (v, g) => (g.currency = 'nzd')],
    ['duplicate currencies', v => v.currencies.push(v.currencies[0])],
    ['duplicate rates', (v, g) => g.rates.push(g.rates[0])],
    ['duplicate estimates', (v, g) => g.estimates.push(g.estimates[0])],
    ['missing reference', (v, g, r, e) => (e.rateId = 'absent')],
    ['cross-product rate', (v, g, r, e) => (e.product = 'dataverse-file')],
    [
      'cross-currency rate',
      (v, g) => {
        v.currencies.push({ currency: 'USD', rates: [], estimates: structuredClone(g.estimates) });
      },
    ],
    ['negative rate', (v, g, r) => (r.amount = -1)],
    ['negative estimate', (v, g, r, e) => (e.amount = -1)],
    ['inconsistent estimate arithmetic', (v, g, r, e) => (e.amount = 99)],
    ['non-finite rate', (v, g, r) => (r.amount = Infinity)],
    ['non-finite quantity', (v, g, r, e) => (e.quantityGb = NaN)],
    ['negative quantity', (v, g, r, e) => (e.quantityGb = -1)],
    ['unknown tax', (v, g, r) => (r.taxTreatment = 'assumed_exclusive')],
    ['unknown basis', (v, g, r, e) => (e.basis = 'billed')],
    ['missing price evidence', (v, g, r) => (r.source = null)],
    ['public price missing URL', (v, g, r) => (r.source.url = null)],
    ['unsafe source URL', (v, g, r) => (r.source.url = 'javascript:alert(1)')],
    ['invalid source day', (v, g, r) => (r.source.checkedAt = '2026-02-30')],
    ['impossible publication day', v => (v.generatedAt = '2026-02-30T00:00:00Z')],
    ['wrong annual normalization', (v, g, r) => (r.quote.normalizationDivisor = 1)],
    ['conflicting quote', (v, g, r) => (r.quote.amount = 120)],
    ['wrong purchased GB', (v, g, r) => (r.bytesPerGb = 1000000000)],
    ['missing replacement SKU', (v, g, r, e) => (e.skuPartNumber = null)],
    ['unknown unit', (v, g, r) => (r.unit = 'seat')],
    ['daily term on monthly rate', (v, g, r) => (r.term = 'pay_as_you_go')],
    [
      'monthly rate with daily window',
      (v, g, r, e) => {
        e.period = { kind: 'window', startDate: '2026-10-01', endDate: '2026-10-02' };
        e.chargeableDays = 2;
      },
    ],
    [
      'daily rate without window',
      (v, g, r) => {
        r.unit = 'gb_day';
        r.term = 'pay_as_you_go';
        r.quote = null;
      },
    ],
    ['unknown numeric amount', (v, g, r, e) => (e.availability.state = 'unavailable')],
    ['available null amount', (v, g, r, e) => (e.amount = null)],
    [
      'available estimate from partial rate',
      (v, g, r) => {
        r.availability.state = 'partial';
        r.availability.reasonCodes = ['reference_uncertain'];
      },
    ],
    [
      'full coverage hiding unavailable price',
      (v, g, r, e) => {
        v.availability.state = 'available';
        v.availability.reasonCodes = [];
        e.amount = null;
        e.availability.state = 'unavailable';
        e.availability.reasonCodes = ['not_collected'];
      },
    ],
    ['numeric amount without quantity', (v, g, r, e) => (e.quantityGb = null)],
    [
      'available rates without groups',
      v => {
        v.availability.state = 'available';
        v.availability.reasonCodes = [];
        v.currencies = [];
      },
    ],
    ['unbounded rates', (v, g) => (g.rates = Array(129).fill(g.rates[0]))],
    ['unbounded estimates', (v, g) => (g.estimates = Array(513).fill(g.estimates[0]))],
    ['privacy fields', (v, g, r, e) => (e.accountId = 'no-person-identities')],
  ];
  for (const [name, mutation] of invalid)
    test(`${format}: rejects ${name}`, () => assert.equal(api.isMicrosoft365StorageCostView(changed(mutation)), false));
}
