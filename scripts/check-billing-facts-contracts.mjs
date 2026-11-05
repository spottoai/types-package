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

// These fixtures contain already-produced integers. They do not replace the producer's rounding rules.
const roundingSpend = (parts, billingBackedRowCount = 3, estimatedRowCount = 3, eligible = parts.slice(0, 2)) => {
  const value = zeroSpend();
  value.billingBackedRowCount = billingBackedRowCount;
  value.estimatedRowCount = estimatedRowCount;
  value.discountEligibility.value = 'mixed';
  for (const [index, key] of ['azureNative', 'marketplace', 'unknown'].entries()) value[key] = totals(basis(parts[index * 2], parts[index * 2 + 1]));
  value.allCharge = totals(basis(parts[0] + parts[2] + parts[4], parts[1] + parts[3] + parts[5]));
  value.azureNativeDiscountEligible = totals(basis(...eligible));
  if (value.unknown.billed.totalMinorUnits !== 0) {
    value.status = 'partial';
    value.unknownMaterial = {
      nonZeroRowCount: 2,
      billedAbsoluteMinorUnits: Math.abs(value.unknown.billed.totalMinorUnits),
      amortizedAbsoluteMinorUnits: 0,
    };
  }
  return value;
};
const roundingDrivers = (total, children) => {
  const value = zeroDrivers();
  for (const key of ['current', 'previous']) value[key].spend = structuredClone(total);
  for (const key of ['service', 'resourceType'])
    value[key].rows = children.map((child, i) => ({
      id: `group-${i}`,
      label: `Group ${i}`,
      current: structuredClone(child),
      previous: structuredClone(child),
    }));
  return value;
};
const markGroupings = value => {
  value.service.roundingMode = 'independent-minor-units';
  value.resourceType.roundingMode = 'independent-minor-units';
  return value;
};

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
  const previousOnly = structuredClone(allDays);
  previousOnly.previous.roundingMode = 'independent-minor-units';
  previousOnly.previous.daily[0].azureNativeDiscountEligible.billed = basis(126, 10);
  assert.equal(isOverview(previousOnly), true, 'previous-only daily marker does not require current marker');
  reject(
    v => (v.current.daily[0].azureNativeDiscountEligible.billed = basis(126, 10)),
    'previous marker cannot relax unmarked current series',
    () => previousOnly
  );
  const undefinedWindowMarker = overview();
  undefinedWindowMarker.current.roundingMode = undefined;
  assert.equal(isOverview(undefinedWindowMarker), false, 'own-property undefined window marker is not valid wire data');
  assert.equal(isOverview(JSON.parse(JSON.stringify(undefinedWindowMarker))), true, 'JSON serialization omits undefined window marker');
  for (const delta of [-3, -2, -1, 1, 2, 3]) {
    const roundedDays = structuredClone(allDays);
    for (const key of ['allCharge', 'azureNativeDiscountEligible']) {
      const amount = roundedDays.current.daily[0][key].billed;
      roundedDays.current.daily[0][key].billed = basis(amount.billingBackedMinorUnits + delta, amount.estimatedMinorUnits);
    }
    assert.equal(isOverview(roundedDays), false, `unmarked daily ${delta}cent difference remains strict`);
    roundedDays.current.roundingMode = 'independent-minor-units';
    assert.equal(isOverview(roundedDays), true, `marked daily ${delta}cent independent rounding`);
    reject(
      v => (v.current.roundingMode = 'arbitrary-tolerance'),
      'rounding mode is closed',
      () => roundedDays
    );
    reject(
      v => v.current.daily[0].allCharge.billed.totalMinorUnits++,
      'marker cannot weaken daily provenance partitions',
      () => roundedDays
    );
    reject(
      v => v.current.daily[0].billingBackedRowCount--,
      'marker cannot relax exact full daily population',
      () => roundedDays
    );
    reject(
      v => (v.current.daily[0].allCharge.billed = missing('not-produced')),
      'marker cannot relax available parent/unavailable child',
      () => roundedDays
    );
    reject(
      v => (v.current.daily[0].unknownMaterial = { nonZeroRowCount: 1, billedAbsoluteMinorUnits: 1, amortizedAbsoluteMinorUnits: 0 }),
      'marked child material count cannot exceed parent',
      () => roundedDays
    );
  }
  const dailyBound = structuredClone(allDays);
  dailyBound.current.roundingMode = 'independent-minor-units';
  const eligibleDay = dailyBound.current.daily[0].azureNativeDiscountEligible.billed;
  dailyBound.current.daily[0].azureNativeDiscountEligible.billed = basis(eligibleDay.billingBackedMinorUnits + 15, eligibleDay.estimatedMinorUnits);
  assert.equal(isOverview(dailyBound), true, 'daily single eligible provenance bound floor31/2=15');
  dailyBound.current.daily[0].azureNativeDiscountEligible.billed = basis(eligibleDay.billingBackedMinorUnits + 16, eligibleDay.estimatedMinorUnits);
  assert.equal(isOverview(dailyBound), false, 'daily single eligible provenance outside bound');
  const dailySixParts = structuredClone(allDays);
  dailySixParts.current.roundingMode = 'independent-minor-units';
  dailySixParts.current.daily[0].allCharge.billed = basis(70 + 46, 10 + 46);
  assert.equal(isOverview(dailySixParts), true, 'daily all-charge width3 provenance and width6 total');
  dailySixParts.current.daily[0].allCharge.billed = basis(70 + 47, 10 + 46);
  assert.equal(isOverview(dailySixParts), false, 'daily all-charge provenance rejects width3 overflow');
  const dailyMaterial = structuredClone(allDays);
  dailyMaterial.current.roundingMode = 'independent-minor-units';
  dailyMaterial.current.spend.status = 'partial';
  dailyMaterial.current.spend.unknownMaterial = { nonZeroRowCount: 30, billedAbsoluteMinorUnits: 30, amortizedAbsoluteMinorUnits: 0 };
  for (const point of dailyMaterial.current.daily)
    point.unknownMaterial = { nonZeroRowCount: 1, billedAbsoluteMinorUnits: 1, amortizedAbsoluteMinorUnits: 0 };
  dailyMaterial.current.daily[0].unknownMaterial.billedAbsoluteMinorUnits = 16;
  assert.equal(isOverview(dailyMaterial), true, 'complete marked daily gross absolute child sum may exceed parent within width1 bound15');
  dailyMaterial.current.daily[0].unknownMaterial.billedAbsoluteMinorUnits = 17;
  assert.equal(isOverview(dailyMaterial), false, 'complete marked daily gross absolute outside width1 bound15');
  dailyMaterial.current.daily[0].unknownMaterial.billedAbsoluteMinorUnits = 1;
  dailyMaterial.current.spend.unknownMaterial.nonZeroRowCount = 31;
  assert.equal(isOverview(dailyMaterial), true, 'full daily scope-thresholded material count permits child undercount');
  delete dailyMaterial.current.roundingMode;
  assert.equal(isOverview(dailyMaterial), false, 'unmarked full daily material count remains exact');
  const partialRounded = overview();
  partialRounded.current.roundingMode = 'independent-minor-units';
  assert.equal(isOverview(partialRounded), true, 'marker leaves partial daily series available without manufacturing completeness');
  // Round-to-nearest fixture: each known gross0.005 rounds to1cent. The parent
  // includes an additional0.0001 charge on the unknown day or an undated row.
  // Use exact micro-unit arithmetic here so ties are not a floating-point artefact.
  for (const undated of [false, true]) {
    const knownDays = undated ? 30 : 29;
    const parentRows = knownDays + 1;
    const parentMinor = Math.floor((knownDays * 5000 + 100 + 5000) / 10000);
    const partialMaterial = overview();
    const w = partialMaterial.current;
    w.roundingMode = 'independent-minor-units';
    w.spend = roundingSpend([0, 0, 0, 0, parentMinor, 0], parentRows, 0, [0, 0]);
    w.spend.unknownMaterial.nonZeroRowCount = parentRows;
    w.spend.discountEligibility.value = 'all-eligible';
    w.spend.unknownMaterial.amortizedAbsoluteMinorUnits = parentMinor;
    for (const partition of ['allCharge', 'azureNative', 'marketplace', 'unknown', 'azureNativeDiscountEligible'])
      w.spend[partition].amortized = structuredClone(w.spend[partition].billed);
    w.coverage = {
      status: 'partial',
      rowCount: parentRows,
      rowsWithoutDate: undated ? 1 : 0,
      provenDates: [],
      observedDateRange: { startDate: w.period.startDate, endDateInclusive: dates(w.period)[29] },
    };
    w.daily = dates(w.period).map((date, i) =>
      i >= knownDays
        ? { date, status: 'unknown', reasonCode: 'not-produced' }
        : {
            date,
            status: 'observed',
            billingBackedRowCount: 1,
            estimatedRowCount: 0,
            allCharge: totals(basis(1), basis(1)),
            azureNativeDiscountEligible: totals(basis(0), basis(0)),
            unknownMaterial: { nonZeroRowCount: 1, billedAbsoluteMinorUnits: 1, amortizedAbsoluteMinorUnits: 1 },
          }
    );
    const caseLabel = undated ? '30known+undated' : '29known+unknown';
    const unmarked = structuredClone(partialMaterial);
    delete unmarked.current.roundingMode;
    assert.equal(isOverview(unmarked), false, `${caseLabel}: strict unmarked gross subset unchanged`);
    assert.equal(isOverview(partialMaterial), true, `${caseLabel}: marked legitimate independently rounded gross subset`);
    for (const key of ['billedAbsoluteMinorUnits', 'amortizedAbsoluteMinorUnits'])
      reject(
        v => (v.current.daily[0].unknownMaterial[key] += undated ? 1 : 2),
        `${caseLabel}: ${key} subset overshoot outside one-sided bound`,
        () => partialMaterial
      );
    reject(
      v => (v.current.spend.unknownMaterial.nonZeroRowCount = knownDays - 1),
      `${caseLabel}: material child counts still cannot exceed parent`,
      () => partialMaterial
    );
    reject(
      v => (v.current.daily[0].billingBackedRowCount += 2),
      `${caseLabel}: daily weighted populations cannot exceed dated rows`,
      () => partialMaterial
    );
    reject(
      v => (v.current.daily[0].unknownMaterial.nonZeroRowCount = 2),
      `${caseLabel}: material count cannot exceed own weighted population`,
      () => partialMaterial
    );
  }
  reject(
    v => (v.current.daily[0].unknownMaterial = { nonZeroRowCount: 1, billedAbsoluteMinorUnits: 1, amortizedAbsoluteMinorUnits: 0 }),
    'partial daily material subset checks unchanged',
    () => partialRounded
  );
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
  const child = roundingSpend([100, 0, 0, 0, 0, 0], 1, 0);
  const oneGroupingOnly = roundingDrivers(
    roundingSpend([603, 0, 0, 0, 0, 0], 6, 0),
    Array.from({ length: 6 }, () => child)
  );
  oneGroupingOnly.service.roundingMode = 'independent-minor-units';
  oneGroupingOnly.resourceType.rows = [
    {
      id: 'one',
      label: 'One complete group',
      current: structuredClone(oneGroupingOnly.current.spend),
      previous: structuredClone(oneGroupingOnly.previous.spend),
    },
  ];
  assert.equal(isDrivers(oneGroupingOnly), true, 'one grouping marker leaves exact sibling grouping unmarked');
  reject(
    v => (v.resourceType.rows[0].current = roundingSpend([604, 0, 0, 0, 0, 0], 6, 0)),
    'marked service cannot relax unmarked resource-type grouping',
    () => oneGroupingOnly,
    isDrivers
  );
  const undefinedGroupMarker = drivers();
  undefinedGroupMarker.service.roundingMode = undefined;
  assert.equal(isDrivers(undefinedGroupMarker), false, 'own-property undefined grouping marker is not valid wire data');
  assert.equal(isDrivers(JSON.parse(JSON.stringify(undefinedGroupMarker))), true, 'JSON serialization omits undefined grouping marker');
  const largeGrouping = roundingDrivers(
    roundingSpend([8040, 0, 0, 0, 0, 0], 80, 0),
    Array.from({ length: 80 }, () => child)
  );
  largeGrouping.service.roundingMode = 'independent-minor-units';
  largeGrouping.resourceType.rows = [
    {
      id: 'one',
      label: 'One complete group',
      current: structuredClone(largeGrouping.current.spend),
      previous: structuredClone(largeGrouping.previous.spend),
    },
  ];
  assert.ok(Buffer.byteLength(JSON.stringify(largeGrouping)) <= limits.driversMaxDecodedBytes, 'large-n control stays inside byte budget');
  assert.equal(isDrivers(largeGrouping), true, '80-child single-provenance boundary floor81/2=40');
  largeGrouping.service.rows[0].current = roundingSpend([99, 0, 0, 0, 0, 0], 1, 0);
  assert.equal(isDrivers(largeGrouping), false, '80-child single-provenance overshoot41 rejected');
  const eligibleBoundary = markGroupings(
    roundingDrivers(
      roundingSpend([300, 300, 0, 0, 0, 0], 3, 3, [302, 302]),
      Array.from({ length: 3 }, () => roundingSpend([100, 100, 0, 0, 0, 0], 1, 1))
    )
  );
  assert.equal(isDrivers(eligibleBoundary), true, 'eligible combined width2 boundary floor4*2/2=4');
  eligibleBoundary.current.spend.azureNativeDiscountEligible.billed = basis(303, 302);
  assert.equal(isDrivers(eligibleBoundary), false, 'eligible difference rejects joint width1/width2 bounds (leaf3>2, combined5>4)');
  for (const delta of [-3, -2, -1, 1, 2, 3]) {
    const roundedGroups = roundingDrivers(
      roundingSpend([600 + delta, 0, 0, 0, 0, 0], 6, 0),
      Array.from({ length: 6 }, () => child)
    );
    assert.equal(isDrivers(roundedGroups), false, `unmarked groups ${delta}cent difference remains strict`);
    markGroupings(roundedGroups);
    assert.equal(isDrivers(roundedGroups), true, `marked six-group ${delta}cent difference within single-part bound3`);
  }
  const roundedGroups = markGroupings(
    roundingDrivers(
      roundingSpend([402, 402, 402, 402, 402, 398], 12, 12),
      Array.from({ length: 4 }, () => roundingSpend([100, 100, 100, 100, 100, 100]))
    )
  );
  roundedGroups.current.spend.unknownMaterial.nonZeroRowCount = 8;
  roundedGroups.previous.spend.unknownMaterial.nonZeroRowCount = 8;
  assert.equal(isDrivers(roundedGroups), true, 'source width1/2 and all-charge width3/6 bounds use distinct coordinates');
  reject(
    v => v.current.spend.azureNative.billed.totalMinorUnits++,
    'marker cannot weaken within-spend source/provenance partitions',
    () => roundedGroups,
    isDrivers
  );
  reject(
    v => v.service.rows[0].current.billingBackedRowCount++,
    'marker cannot weaken exact weighted provenance populations',
    () => roundedGroups,
    isDrivers
  );
  reject(
    v => v.service.rows.pop(),
    'marker cannot admit missing children',
    () => roundedGroups,
    isDrivers
  );
  reject(
    v => (v.service.rows[0].current.azureNative.billed = missing('not-produced')),
    'marker cannot weaken partition availability',
    () => roundedGroups,
    isDrivers
  );
  reject(
    v => (v.service.roundingMode = 'arbitrary-tolerance'),
    'unknown grouping rounding mode',
    () => roundedGroups,
    isDrivers
  );
  reject(
    v => (v.current.roundingMode = 'independent-minor-units'),
    'marker cannot attach to plain window totals',
    () => roundedGroups,
    isDrivers
  );
  const outsideGroupBound = markGroupings(
    roundingDrivers(
      roundingSpend([603, 0, 0, 0, 0, 0], 6, 0),
      Array.from({ length: 6 }, () => child)
    )
  );
  outsideGroupBound.current.spend = roundingSpend([604, 0, 0, 0, 0, 0], 6, 0);
  assert.equal(isDrivers(outsideGroupBound), false, 'single-source provenance outside exact six-child bound3');
  const materialParent = roundingSpend([0, 0, 0, 0, 1, 0], 77, 0, [0, 0]);
  materialParent.unknownMaterial.nonZeroRowCount = 77;
  const materialChild = roundingSpend([0, 0, 0, 0, 1, 0], 76, 0, [0, 0]);
  materialChild.unknownMaterial.nonZeroRowCount = 76;
  const thresholded = roundingDrivers(materialParent, [materialChild, roundingSpend([0, 0, 0, 0, 0, 0], 1, 0)]);
  assert.equal(isDrivers(thresholded), false, 'unmarked scope-thresholded77vs76 material count stays strict');
  markGroupings(thresholded);
  assert.equal(isDrivers(thresholded), true, 'marked scope-thresholded77vs76 material count with exact weighted population');
  reject(
    v => (v.service.rows[0].current.unknownMaterial.nonZeroRowCount = 77),
    'material count cannot exceed child weighted population',
    () => thresholded,
    isDrivers
  );
  reject(
    v => {
      v.service.rows[0].current.unknownMaterial.nonZeroRowCount = 76;
      v.service.rows[1].current = roundingSpend([0, 0, 0, 0, 1, 0], 1, 0, [0, 0]);
      v.service.rows[1].current.unknownMaterial.nonZeroRowCount = 1;
      v.current.spend.unknownMaterial.nonZeroRowCount = 76;
    },
    'marked unknown material child sum cannot exceed parent',
    () => thresholded,
    isDrivers
  );
  const absoluteBound = markGroupings(roundingDrivers(materialParent, [materialChild, roundingSpend([0, 0, 0, 0, 0, 0], 1, 0)]));
  absoluteBound.current.spend.unknownMaterial.billedAbsoluteMinorUnits = 2;
  assert.equal(isDrivers(absoluteBound), true, 'unknown absolute uses single-part two-child bound1');
  absoluteBound.current.spend.unknownMaterial.billedAbsoluteMinorUnits = 3;
  assert.equal(isDrivers(absoluteBound), false, 'unknown absolute outside single-part bound1');
  const unavailableMarked = zeroDrivers();
  unavailableMarked.service = { ...missing('source-unavailable'), roundingMode: 'independent-minor-units' };
  assert.equal(isDrivers(unavailableMarked), false, 'unavailable group cannot carry independent-rounding marker');
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
