import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootCjs = require('../dist/index.js');
assert.equal(typeof rootCjs.isAzureBillingOverviewV1, 'function', 'root exports overview guard');
const implementations = [
  rootCjs,
  require('@spottoai/types-package/azure/billing-facts'),
  await import('@spottoai/types-package'),
  await import('@spottoai/types-package/azure/billing-facts'),
];

const subscriptionId = '11111111-2222-3333-4444-555555555555';
const period = { startDate: '2026-10-02', endDateExclusive: '2026-11-01' };
const previousPeriod = { startDate: '2026-09-02', endDateExclusive: '2026-10-02' };
const basis = (billingBackedMinorUnits, estimatedMinorUnits = 0) => ({
  status: 'available',
  totalMinorUnits: billingBackedMinorUnits + estimatedMinorUnits,
  billingBackedMinorUnits,
  estimatedMinorUnits,
});
const missing = reasonCode => ({ status: 'unavailable', reasonCode });
const totals = (billed, amortized = missing('not-produced')) => ({ billed, amortized });
const zeroMaterial = () => ({ nonZeroRowCount: 0, billedAbsoluteMinorUnits: 0, amortizedAbsoluteMinorUnits: 0 });
const spend = () => ({
  status: 'complete',
  billingBackedRowCount: 2,
  estimatedRowCount: 1,
  allCharge: totals(basis(70, 10)),
  azureNative: totals(basis(100, 10)),
  azureNativeDiscountEligible: totals(basis(125, 10)), // excluded commitment credit makes subset exceed signed native net
  discountEligibility: { status: 'available', value: 'mixed' },
  marketplace: totals(basis(-30)),
  unknown: totals(basis(0)),
  unknownMaterial: zeroMaterial(),
});
const receipt = (kind, receiptPeriod) => ({
  kind,
  period: receiptPeriod,
  fingerprint: `${kind}-fingerprint`,
  status: 'available',
  sourcePath: kind === 'current30Days' ? 'history/billing/cost-last-30-days.json' : 'history/billing/cost-last-30-days-previous.json',
  etag: `"${kind}-etag"`,
});
const source = () => ({
  companyId: 'company-1',
  subscriptionId,
  portalGenerationId: 'portal-run-1',
  billingInputGenerationId: 'selected-input-1',
  current: receipt('current30Days', period),
  previous: receipt('previous30Days', previousPeriod),
});
const currency = () => ({ status: 'verified', currencyCode: 'NZD', minorUnitScale: 2, resolutionRef: 'billing-input-currency-evidence' });
const coverage = windowPeriod => ({
  status: 'partial',
  rowCount: 3,
  rowsWithoutDate: 0,
  provenDates: [],
  observedDateRange: { startDate: windowPeriod.startDate, endDateInclusive: windowPeriod.startDate },
});
const daily = date => ({
  date,
  status: 'observed',
  allCharge: spend().allCharge,
  billingBackedRowCount: 2,
  estimatedRowCount: 1,
  azureNativeDiscountEligible: spend().azureNativeDiscountEligible,
  unknownMaterial: zeroMaterial(),
});
const windowFacts = windowPeriod => ({
  period: windowPeriod,
  coverage: coverage(windowPeriod),
  spend: spend(),
  daily: [daily(windowPeriod.startDate)],
});
const overview = () => ({
  schemaVersion: 1,
  artifactKind: 'billing-overview',
  generatedAt: '2026-11-01T01:02:03.000Z',
  source: source(),
  currency: currency(),
  current: windowFacts(period),
  previous: windowFacts(previousPeriod),
  drivers: { status: 'available', relativePath: 'billing-drivers.json' },
});
const drivers = () => ({
  schemaVersion: 1,
  artifactKind: 'billing-drivers',
  generatedAt: '2026-11-01T01:02:03.000Z',
  source: source(),
  currency: currency(),
  current: { period, spend: spend() },
  previous: { period: previousPeriod, spend: spend() },
  service: { status: 'complete', rows: [{ id: 'virtual-machines', label: 'Virtual machines', current: spend(), previous: spend() }] },
  resourceType: {
    status: 'complete',
    rows: [{ id: 'microsoft.compute/virtualmachines', label: 'Virtual machine', current: spend(), previous: spend() }],
  },
});
const zeroSpend = () => {
  const value = spend();
  value.billingBackedRowCount = 0;
  value.estimatedRowCount = 0;
  value.discountEligibility.value = 'all-eligible';
  for (const key of ['allCharge', 'azureNative', 'azureNativeDiscountEligible', 'marketplace', 'unknown']) value[key] = totals(basis(0));
  return value;
};
const zeroDrivers = () => {
  const value = drivers();
  value.current.spend = zeroSpend();
  value.previous.spend = zeroSpend();
  for (const key of ['service', 'resourceType']) value[key].rows = [{ id: 'zero', label: 'Zero', current: zeroSpend(), previous: zeroSpend() }];
  return value;
};
const dates = p => Array.from({ length: 30 }, (_, i) => new Date(Date.parse(`${p.startDate}T00:00:00Z`) + i * 86400000).toISOString().slice(0, 10));

for (const api of implementations) {
  const { isAzureBillingOverviewV1: isOverview, isAzureBillingDriversV1: isDrivers, AZURE_BILLING_FACTS_LIMITS_V1: limits } = api;
  assert.equal(limits.overviewMaxDecodedBytes, 64 * 1024);
  assert.equal(limits.driversMaxDecodedBytes, 256 * 1024);
  assert.equal(isOverview(overview()), true, 'signed billed/estimated and unavailable amortized');
  assert.equal(isDrivers(drivers()), true, 'both complete grouping populations');
  const reject = (mutate, message, factory = overview, guard = isOverview) => {
    const value = structuredClone(factory());
    mutate(value);
    assert.equal(guard(value), false, message);
  };
  for (const value of [null, [], {}, 1, 'data']) {
    assert.equal(isOverview(value), false);
    assert.equal(isDrivers(value), false);
  }
  reject(v => delete v.source.previous.fingerprint, 'previous fingerprint is mandatory');
  reject(v => delete v.source.current.etag, 'current ETag is mandatory');
  reject(v => (v.source.previous.kind = 'current30Days'), 'receipt window kind');
  reject(v => (v.source.subscriptionId = 'not-a-subscription'), 'native Azure subscription identity');
  reject(v => (v.source.companyId = 'foreign/company'), 'unsafe company identity');
  reject(v => (v.source.portalGenerationId = '../other-run'), 'unsafe generation');
  reject(v => (v.source.billingInputGenerationId = 'generation\nforged'), 'control string');
  reject(v => (v.source.previous.sourcePath = v.source.current.sourcePath), 'cross-period source path');
  reject(v => (v.source.current.sourcePath = 'https://example.com/file?sig=secret'), 'arbitrary source URI');
  reject(v => (v.source.current.sourcePath = '../cost-last-30-days.json'), 'source traversal');
  reject(v => (v.source.current.etag = '"etag"\r\nheader'), 'ETag control data');
  reject(v => (v.source.current.period.startDate = '2026-10-03'), 'exact 30day receipt window');
  reject(v => (v.source.previous.period = { startDate: '2026-09-01', endDateExclusive: '2026-10-01' }), 'adjacent windows');
  reject(v => (v.current.period = previousPeriod), 'window identity must match source');
  reject(v => (v.current.period.startDate = '2026-02-30'), 'invalid calendar date');
  reject(v => (v.generatedAt = '2026-11-01'), 'UTC publication timestamp');
  reject(v => (v.generatedAt = '2026-11-01T25:00:00.000Z'), 'invalid UTC time');
  reject(v => (v.currency.currencyCode = 'usd'), 'currency evidence format');
  reject(v => delete v.currency.resolutionRef, 'verified currency evidence');
  reject(v => (v.currency.minorUnitScale = 7), 'minor scale bound');
  reject(v => (v.currency = missing('currency-unresolved')), 'unresolved currency cannot label numeric money');
  reject(v => delete v.current.spend.azureNativeDiscountEligible, 'explicit eligibility availability');
  reject(v => (v.current.spend.discountEligibility.value = 'maybe'), 'closed canonical membership');
  reject(v => v.current.spend.allCharge.billed.totalMinorUnits++, 'provenance reconciliation');
  reject(v => (v.current.spend.azureNative.billed = basis(999)), 'source reconciliation');
  reject(v => (v.current.spend.allCharge.amortized = basis(80)), 'amortized independent of billed');
  reject(v => (v.current.spend.allCharge.billed = basis(Number.MAX_SAFE_INTEGER, 1)), 'unsafe money');
  reject(v => (v.current.spend.allCharge.billed.totalMinorUnits = 0.5), 'minor units integral');
  reject(v => (v.current.spend.billingBackedRowCount = 0), 'nonzero billing-backed amount requires source rows');
  reject(v => (v.current.spend.estimatedRowCount = 0), 'nonzero estimated amount requires source rows');
  reject(v => (v.current.spend.billingBackedRowCount = -1), 'nonnegative provenance counts');
  reject(v => (v.current.spend.billingBackedRowCount = 3), 'window provenance counts reconcile selected row count');
  reject(v => (v.current.spend.unknownMaterial.billedAbsoluteMinorUnits = -1), 'material evidence unsigned');
  reject(v => (v.current.coverage.status = 'complete'), 'min/max never proves complete coverage');
  reject(v => (v.current.coverage.provenDates = [period.startDate, period.startDate]), 'unique proven dates');
  reject(v => (v.current.coverage.observedDateRange.endDateInclusive = period.endDateExclusive), 'coverage in window');
  reject(v => (v.current.coverage.rowsWithoutDate = 4), 'undated rows subset');
  reject(v => {
    v.current.coverage.rowCount = 0;
    v.current.coverage.observedDateRange = null;
    v.current.daily = [];
  }, 'zero source rows cannot carry nonzero money');
  reject(v => (v.current.daily[0].date = '2026-10-31'), 'observed money lies inside observed date range');
  reject(v => {
    v.current.spend.status = 'partial';
    v.current.spend.unknownMaterial = { nonZeroRowCount: 4, billedAbsoluteMinorUnits: 200, amortizedAbsoluteMinorUnits: 0 };
  }, 'unknown material rows subset of source rows');
  reject(v => v.current.daily.push(v.current.daily[0]), 'duplicate daily dates');
  reject(v => (v.current.daily = new Array(30)), 'sparse daily arrays are malformed wire data');
  reject(v => (v.current.coverage.provenDates = new Array(30)), 'sparse date proof cannot establish coverage');
  reject(v => (v.current.daily[0].date = previousPeriod.startDate), 'daily date in window');
  reject(v => (v.current.daily = [daily('2026-10-03'), daily('2026-10-02')]), 'ordered daily dates');
  reject(v => (v.current.daily[0].status = 'verified-zero'), 'zero requires explicit zero evidence');
  reject(v => (v.current.daily = Array.from({ length: 31 }, () => daily(period.startDate))), 'daily count bound');
  reject(v => (v.drivers.relativePath = '../other/billing-drivers.json'), 'immutable sibling only');
  reject(v => (v.current.spend.unexpected = 1), 'strict monetary payload shape');
  reject(v => (v.unexpected = 1), 'strict artifact shape');
  const unknown = overview();
  unknown.current.daily = [{ date: period.startDate, status: 'unknown', reasonCode: 'coverage-unproven' }];
  assert.equal(isOverview(unknown), true, 'unknown day is not zero');
  const absent = overview();
  absent.source.previous = {
    kind: 'previous30Days',
    period: previousPeriod,
    fingerprint: 'absence-receipt',
    status: 'unavailable',
    reasonCode: 'billing-unavailable',
  };
  absent.previous = {
    period: previousPeriod,
    coverage: { status: 'unavailable', rowCount: 0, rowsWithoutDate: 0, provenDates: [], observedDateRange: null },
    spend: missing('billing-unavailable'),
    daily: [],
  };
  assert.equal(isOverview(absent), true, 'previous source explicitly absent');
  reject(v => (v.source.previous = absent.source.previous), 'absent source cannot support numeric totals');
  const noCurrency = overview();
  noCurrency.currency = missing('currency-unresolved');
  for (const key of ['current', 'previous']) {
    noCurrency[key].spend = missing('currency-unresolved');
    noCurrency[key].daily = [{ date: noCurrency[key].period.startDate, status: 'unknown', reasonCode: 'currency-unresolved' }];
  }
  assert.equal(isOverview(noCurrency), true, 'unknown currency withholds all numeric money');
  const cancelling = overview();
  cancelling.current.spend.status = 'partial';
  cancelling.current.spend.unknownMaterial = { nonZeroRowCount: 2, billedAbsoluteMinorUnits: 200, amortizedAbsoluteMinorUnits: 0 };
  assert.equal(isOverview(cancelling), true, 'material unknown rows survive signed cancellation');
  const weighted = structuredClone(cancelling);
  weighted.current.spend.billingBackedRowCount = 999;
  weighted.current.coverage.rowCount = 1000;
  weighted.current.spend.unknownMaterial.nonZeroRowCount = 999;
  assert.equal(isOverview(weighted), true, 'sourceRowCount-weighted material and provenance share the same coordinate');
  const allDays = overview();
  for (const key of ['current', 'previous']) {
    const w = allDays[key];
    w.daily = dates(w.period).map(daily);
    w.coverage = {
      status: 'complete',
      rowCount: 90,
      rowsWithoutDate: 0,
      provenDates: dates(w.period),
      observedDateRange: { startDate: w.period.startDate, endDateInclusive: dates(w.period)[29] },
    };
    w.spend.billingBackedRowCount *= 30;
    w.spend.estimatedRowCount *= 30;
    for (const sourceKey of ['allCharge', 'azureNative', 'azureNativeDiscountEligible', 'marketplace', 'unknown']) {
      const b = w.spend[sourceKey].billed;
      w.spend[sourceKey].billed = basis(b.billingBackedMinorUnits * 30, b.estimatedMinorUnits * 30);
    }
  }
  assert.ok(Buffer.byteLength(JSON.stringify(allDays)) <= limits.overviewMaxDecodedBytes, '60 daily points fit64KiB');
  assert.equal(isOverview(allDays), true, 'complete daily totals reconcile');
  reject(
    v => (v.current.daily[0].allCharge.billed = basis(999)),
    'daily reconciliation',
    () => structuredClone(allDays)
  );
  const zeroDay = structuredClone(allDays);
  zeroDay.current.daily[0].status = 'verified-zero';
  zeroDay.current.daily[0].allCharge = totals(basis(0));
  zeroDay.current.daily[0].azureNativeDiscountEligible = totals(basis(0));
  for (const sourceKey of ['allCharge', 'azureNative', 'azureNativeDiscountEligible', 'marketplace', 'unknown']) {
    const b = spend()[sourceKey].billed;
    zeroDay.current.spend[sourceKey].billed = basis(b.billingBackedMinorUnits * 29, b.estimatedMinorUnits * 29);
  }
  assert.equal(isOverview(zeroDay), true, 'proved zero differs from missing');
  const emptyDay = structuredClone(zeroDay);
  emptyDay.current.daily[0].billingBackedRowCount = 0;
  emptyDay.current.daily[0].estimatedRowCount = 0;
  emptyDay.current.coverage.rowCount -= 3;
  emptyDay.current.spend.billingBackedRowCount -= 2;
  emptyDay.current.spend.estimatedRowCount--;
  assert.equal(isOverview(emptyDay), true, 'source-proven empty day differs from unknown');
  const estimatedOnly = overview();
  for (const key of ['current', 'previous']) {
    const w = estimatedOnly[key];
    w.spend = zeroSpend();
    w.spend.estimatedRowCount = 1;
    w.spend.allCharge.billed = basis(0, 100);
    w.spend.azureNative.billed = basis(0, 100);
    w.spend.azureNativeDiscountEligible.billed = basis(0, 100);
    w.coverage.rowCount = 1;
    w.daily = [
      {
        ...daily(w.period.startDate),
        billingBackedRowCount: 0,
        estimatedRowCount: 1,
        allCharge: w.spend.allCharge,
        azureNativeDiscountEligible: w.spend.azureNativeDiscountEligible,
      },
    ];
  }
  assert.equal(isOverview(estimatedOnly), true, 'estimated-only retains absent billing-backed presence');
  const billedZeroAndEstimate = structuredClone(estimatedOnly);
  billedZeroAndEstimate.current.spend.billingBackedRowCount = 1;
  billedZeroAndEstimate.current.coverage.rowCount++;
  billedZeroAndEstimate.current.daily[0].billingBackedRowCount = 1;
  assert.equal(isOverview(billedZeroAndEstimate), true, 'genuine billing-backed zero plus estimate retains present provenance');
  reject(v => v.service.rows.push(v.service.rows[0]), 'duplicate driver identity', drivers, isDrivers);
  reject(v => (v.service.rows[0].label = 'label\nforged'), 'driver label controls', drivers, isDrivers);
  reject(v => (v.service.rows[0].current.allCharge.billed = basis(999)), 'driver source reconciliation', drivers, isDrivers);
  reject(v => (v.service.rows = []), 'complete groups must reconcile all totals', drivers, isDrivers);
  reject(v => (v.service.status = 'partial'), 'truncated grouping cannot claim complete topN', drivers, isDrivers);
  const unavailableGroups = drivers();
  unavailableGroups.service = missing('byte-budget-exceeded');
  assert.equal(isDrivers(unavailableGroups), true, 'group overflow explicitly unavailable');
  const emptyNative = zeroDrivers();
  const marketplace = zeroSpend();
  marketplace.billingBackedRowCount = 1;
  marketplace.allCharge.billed = basis(30);
  marketplace.marketplace.billed = basis(30);
  const commitment = zeroSpend();
  commitment.billingBackedRowCount = 1;
  commitment.allCharge.billed = basis(100);
  commitment.azureNative.billed = basis(100);
  commitment.discountEligibility.value = 'none-eligible';
  const combined = zeroSpend();
  combined.billingBackedRowCount = 2;
  combined.allCharge.billed = basis(130);
  combined.azureNative.billed = basis(100);
  combined.marketplace.billed = basis(30);
  combined.discountEligibility.value = 'none-eligible';
  for (const key of ['current', 'previous']) emptyNative[key].spend = structuredClone(combined);
  for (const key of ['service', 'resourceType'])
    emptyNative[key].rows = [
      { id: 'marketplace', label: 'Marketplace only', current: structuredClone(marketplace), previous: structuredClone(marketplace) },
      { id: 'commitment', label: 'Commitment only', current: structuredClone(commitment), previous: structuredClone(commitment) },
    ];
  assert.equal(isDrivers(emptyNative), true, 'empty native group labels cannot infer gross aggregate membership');
  assert.equal(isDrivers(zeroDrivers()), true, 'zero grouping population positive control');
  const large = zeroDrivers();
  large.service.rows = Array.from({ length: 1025 }, (_, i) => ({ ...large.service.rows[0], id: String(i) }));
  assert.equal(isDrivers(large), false, 'bounded driver rows');
  const overflow = zeroDrivers();
  overflow.service.rows = Array.from({ length: 400 }, (_, i) => ({ ...overflow.service.rows[0], id: String(i), label: 'x'.repeat(200) }));
  assert.ok(Buffer.byteLength(JSON.stringify(overflow)) > limits.driversMaxDecodedBytes, 'otherwise valid zero rows exceed actual byte limit');
  assert.equal(isDrivers(overflow), false, 'decoded byte budget enforced');
  overflow.service.rows = overflow.service.rows.slice(0, 50);
  assert.ok(Buffer.byteLength(JSON.stringify(overflow)) < limits.driversMaxDecodedBytes);
  assert.equal(isDrivers(overflow), true, 'same reconciled zero population below byte limit');
  const cycle = overview();
  cycle.current.daily[0].allCharge = cycle;
  assert.doesNotThrow(() => assert.equal(isOverview(cycle), false), 'cyclic hostile input safely rejected');
}
console.log('Billing facts contracts passed for CJS/ESM root and subpath.');
