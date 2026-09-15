import assert from 'node:assert/strict';
import * as types from '../dist/index.js';
import * as esm from '../dist/esm/entries/root.js';
import { subscriptionPack } from './check-report-evidence-contracts.mjs';

assert.equal(typeof types.isReportSpendProjection, 'function', 'report spending validator is exported');
assert.equal(typeof types.isReportSpendAmounts, 'function', 'report monetary composition validator is exported');

const date = '2026-09-14T00:00:00.000Z';
const money = amount => ({ status: 'available', component: { amount, currencyCode: 'NZD' } });
const state = amount => ({ support: 'supported', availability: amount === undefined ? { status: 'unavailable' } : money(amount) });
const basis = (name, actual, estimated) => ({
  basis: name,
  actual: state(actual),
  estimated: state(estimated),
  combined: actual === undefined && estimated === undefined ? { status: 'unavailable' } : money(String(Number(actual ?? 0) + Number(estimated ?? 0))),
  status:
    actual === undefined
      ? estimated === undefined
        ? 'unavailable'
        : 'estimated-only'
      : estimated === undefined
        ? 'actual-only'
        : 'actual-plus-estimated',
});
const coverage = (actual, estimated) => ({
  actual: actual === undefined ? 'unavailable' : 'complete',
  estimated: estimated === undefined ? 'unavailable' : 'complete',
  combined: actual === undefined && estimated === undefined ? 'unavailable' : 'complete',
});
const amounts = (billed = '1000', amortized = '3000', estimatedBilled, estimatedAmortized) => ({
  composition: {
    schemaVersion: 1,
    selectedLens: 'actual-plus-estimated',
    billed: basis('billed', billed, estimatedBilled),
    amortized: basis('amortized', amortized, estimatedAmortized),
  },
  coverage: { billed: coverage(billed, estimatedBilled), amortized: coverage(amortized, estimatedAmortized) },
  estimates: Object.fromEntries(
    [
      ['billed', estimatedBilled],
      ['amortized', estimatedAmortized],
    ]
      .filter(([, value]) => value !== undefined)
      .map(([key]) => [key, { reason: 'billing-lag', method: 'retained-meter-estimate', observedAt: date }])
  ),
  retail: {
    status: 'available',
    component: { amount: '4500', currencyCode: 'NZD' },
    coverage: 'complete',
    scopeDescription: 'Compute, licensing, disks and bandwidth',
    pricingSource: 'Azure retail prices',
    pricedAt: date,
    assumptions: ['Matched region, meters and observed usage'],
  },
});
const projection = value => ({
  currency: 'NZD',
  dateBasis: 'billing-calendar',
  generatedAt: date,
  sourceObservedAt: date,
  freshness: 'current',
  periods: [{ kind: 'calendar-month', startDate: '2026-08-01', endDate: '2026-08-31', amounts: value }],
});
const pack = spend => ({ ...subscriptionPack, generatedAt: date, reporting: { ...subscriptionPack.reporting, spend } });
const workload = amounts();
assert.equal(types.isReportSpendAmounts(workload), true, '$1000 billed and $3000 amortized are independent totals');
assert.equal(esm.isReportSpendProjection(projection(workload)), true, 'ESM projection export');
assert.equal(types.isSubscriptionReportEvidencePack(pack(projection(workload))), true, 'whole pack boundary');
assert.equal(types.isSubscriptionReportEvidencePack(subscriptionPack), true, 'legacy pack remains valid');

// Explicit fixture-level source components: the headline can legitimately differ from actual-only daily spend.
const eroad = amounts('55401.07', '58771.62', '257.60');
assert.equal(eroad.composition.billed.combined.component.amount, '55658.67');
assert.equal(types.isReportSpendAmounts(eroad), true, 'EROAD actual versus estimated billed components');
const retailSavings = {
  recommendation: { id: 'resize', title: 'Resize workload' },
  resources: [{ id: 'vm', savingsBasis: 'retail' }],
  resourcesCount: 1,
  omittedResourceCount: 0,
  savings: { minAmount: 500, maxAmount: 700 },
  savingsBasis: 'retail',
};
const savingsPack = pack(projection(workload));
savingsPack.reporting.recommendations = { rows: [retailSavings], totalCount: 1, omittedCount: 0 };
savingsPack.reporting.recommendationCatalogue = structuredClone(savingsPack.reporting.recommendations);
const savingsPortfolio = structuredClone(savingsPack.reporting.recommendationPortfolio);
savingsPortfolio.sourceRecommendationCount = savingsPortfolio.activeRecommendationCount = 1;
savingsPortfolio.byCategory = { uncategorized: 1 };
savingsPortfolio.byImpact.Unknown = savingsPortfolio.byEffort.Unknown = 1;
savingsPortfolio.impactEffortMatrix.find(row => row.impact === 'Unknown' && row.effort === 'Unknown').count = 1;
savingsPack.reporting.recommendationPortfolio = savingsPortfolio;
assert.equal(types.isSubscriptionReportEvidencePack(savingsPack), true, 'retail recommendation basis survives whole pack');
for (const value of ['billed', 'amortized', 'retail', 'mixed', 'unknown']) assert.equal(types.isReportSavingsBasis(value), true);
assert.equal(types.isReportSavingsBasis('estimated'), false, 'estimated is a source component, not a savings basis');

let negativeCases = 0;
const reject = (name, mutate, base = eroad) => {
  const value = structuredClone(base);
  mutate(value);
  assert.equal(types.isReportSpendAmounts(value, 'NZD', date), false, name);
  negativeCases++;
};
reject('combined must match source components', x => {
  x.composition.billed.combined.component.amount = '55659';
});
reject('never add billed to amortized', x => {
  x.composition.amortized.combined.component.amount = '114430.29';
});
reject('wrong currency in one component', x => {
  x.composition.billed.estimated.availability.component.currencyCode = 'USD';
});
reject('retail currency must match', x => {
  x.retail.component.currencyCode = 'USD';
});
reject('unsupported sources cannot claim money', x => {
  x.composition.billed.actual.support = 'unsupported';
});
reject('coverage cannot claim missing amounts', x => {
  x.coverage.amortized.estimated = 'complete';
});
reject('available amount cannot have unavailable coverage', x => {
  x.coverage.billed.actual = 'unavailable';
});
reject('source status must match availability', x => {
  x.composition.billed.status = 'actual-only';
});
reject('estimates require provenance', x => {
  delete x.estimates.billed;
});
reject('unknown estimate method', x => {
  x.estimates.billed.method = '';
});
reject('future estimate timestamp', x => {
  x.estimates.billed.observedAt = '2026-09-14T00:00:00.001Z';
});
reject('future retail timestamp', x => {
  x.retail.pricedAt = '2026-09-14T00:00:00.001Z';
});
reject('retail requires scope coverage', x => {
  delete x.retail.scopeDescription;
});
reject('retail must be nonnegative', x => {
  x.retail.component.amount = '-1';
});
reject('unavailable retail must not carry money', x => {
  x.retail.status = 'unavailable';
});
reject('unbounded assumptions', x => {
  x.retail.assumptions = Array(11).fill('assumption');
});
reject('internal composition fields must not leak', x => {
  x.composition.authority = 'private';
});
for (const bad of ['NaN', 'Infinity', '1e3', '', '01', '1000000000000000', '0.000000001', 25]) {
  reject(`invalid money ${bad}`, x => {
    x.composition.billed.actual.availability.component.amount = bad;
  });
}
const equivalentDates = structuredClone(eroad);
equivalentDates.estimates.billed.observedAt = '2026-09-14T00:00:00Z';
equivalentDates.retail.pricedAt = '2026-09-14T00:00:00Z';
assert.equal(types.isReportSpendAmounts(equivalentDates, 'NZD', date), true, 'equivalent timestamp forms');
const futureFraction = structuredClone(eroad);
futureFraction.retail.pricedAt = '2026-09-14T00:00:00.001Z';
assert.equal(types.isReportSpendAmounts(futureFraction, 'NZD', '2026-09-14T00:00:00Z'), false);

const credit = amounts('-10.25', '0');
assert.equal(types.isReportSpendAmounts(credit), true, 'credits and proved zero remain valid');
const precision = amounts('0.10', '0', '0.20');
precision.composition.billed.combined = money('0.30');
assert.equal(types.isReportSpendAmounts(precision), true, 'exact decimal addition');
const lens = structuredClone(eroad);
lens.composition.selectedLens = 'actual-only';
for (const key of ['billed', 'amortized']) lens.composition[key].combined = structuredClone(lens.composition[key].actual.availability);
assert.equal(types.isReportSpendAmounts(lens), true, 'actual lens retains estimate detail but excludes it from selected total');
const estimateLens = structuredClone(eroad);
estimateLens.composition.selectedLens = 'estimates-only';
for (const key of ['billed', 'amortized']) {
  estimateLens.composition[key].combined = structuredClone(estimateLens.composition[key].estimated.availability);
  estimateLens.coverage[key].combined = estimateLens.coverage[key].estimated;
}
assert.equal(types.isReportSpendAmounts(estimateLens), true, 'estimate lens excludes actuals without losing their evidence');
reject(
  'estimate lens cannot include actuals',
  x => {
    x.composition.billed.combined = structuredClone(eroad.composition.billed.combined);
  },
  estimateLens
);
const partial = structuredClone(workload);
partial.coverage.billed.actual = 'partial';
partial.coverage.billed.combined = 'partial';
assert.equal(types.isReportSpendAmounts(partial), true);
reject(
  'partial actual cannot become complete total',
  x => {
    x.coverage.billed.combined = 'complete';
  },
  partial
);
const unknownAmortized = structuredClone(workload);
unknownAmortized.composition.amortized = basis('amortized');
unknownAmortized.coverage.amortized = coverage();
assert.equal(types.isReportSpendAmounts(unknownAmortized), true, 'missing amortized remains explicitly unavailable');

const invalidProjection = (name, mutate) => {
  const value = projection(structuredClone(workload));
  mutate(value);
  assert.equal(types.isReportSpendProjection(value), false, name);
  negativeCases++;
};
invalidProjection('duplicate periods', x => {
  x.periods.push(structuredClone(x.periods[0]));
});
invalidProjection('invalid calendar date', x => {
  x.periods[0].endDate = '2026-02-30';
});
invalidProjection('partial calendar month mislabeled', x => {
  x.periods[0].endDate = '2026-08-30';
});
invalidProjection('reversed period', x => {
  x.periods[0].startDate = '2026-09-01';
});
invalidProjection('rolling period must be 30 days', x => {
  x.periods[0].kind = 'rolling-30-days';
});
invalidProjection('missing observation', x => {
  delete x.sourceObservedAt;
});
invalidProjection('future observation', x => {
  x.sourceObservedAt = '2026-09-15T00:00:00Z';
});
invalidProjection('available amount marked unavailable', x => {
  x.freshness = 'unavailable';
});
invalidProjection('currency missing', x => {
  delete x.currency;
});
invalidProjection('currency differs', x => {
  x.currency = 'USD';
});
invalidProjection('too many periods', x => {
  x.periods = Array(15).fill(x.periods[0]);
});
const service = { serviceKey: 'compute', name: 'Virtual Machines', amounts: workload };
const withService = projection(workload);
withService.periods[0].services = { rows: [service], totalCount: 2, omittedCount: 1 };
assert.equal(types.isReportSpendProjection(withService), true, 'service omission disclosed without changing headline');
invalidProjection('duplicate services', x => {
  x.periods[0].services = { rows: [service, service], totalCount: 2, omittedCount: 0 };
});
invalidProjection('service counts inconsistent', x => {
  x.periods[0].services = { rows: [service], totalCount: 2, omittedCount: 0 };
});
const empty = { currency: 'NZD', dateBasis: 'billing-calendar', generatedAt: date, freshness: 'unavailable', periods: [] };
assert.equal(types.isReportSpendProjection(empty), true, 'truthful empty projection');
assert.equal(types.isReportSpendProjection({ ...empty, freshness: 'current' }), false);
const wrongScope = pack(projection(workload));
wrongScope.scope = { ...wrongScope.scope, currency: 'USD' };
assert.equal(types.isSubscriptionReportEvidencePack(wrongScope), false, 'whole-pack currency binding');
const futurePack = pack(projection(workload));
futurePack.generatedAt = '2026-09-13T00:00:00Z';
assert.equal(types.isSubscriptionReportEvidencePack(futurePack), false, 'projection cannot be newer than enclosing pack');

const daily = {
  startDate: '2026-08-01',
  endDate: '2026-08-01',
  dateBasis: 'billing-calendar',
  currency: 'NZD',
  generatedAt: date,
  sourceObservedAt: date,
  freshness: 'current',
  coverage: { billed: { status: 'complete', coveredDayCount: 1 }, amortized: { status: 'complete', coveredDayCount: 1 } },
  entries: [{ date: '2026-08-01', cost: 1000, costAmortized: 3000, financials: workload }],
};
assert.equal(types.isReportDailySpend(daily), true, 'actual legacy values and new components agree');
const blendedDaily = structuredClone(daily);
blendedDaily.entries[0].financials = eroad;
blendedDaily.entries[0].cost = 55658.67;
assert.equal(types.isReportDailySpend(blendedDaily), false, 'estimated values cannot enter legacy actual cost');
const unknownDaily = structuredClone(daily);
unknownDaily.entries[0].financials = unknownAmortized;
assert.equal(types.isReportDailySpend(unknownDaily), false, 'unknown amortization cannot keep a fabricated actual alias');
const estimatedOnly = structuredClone(daily);
const estimatedAmounts = structuredClone(eroad);
estimatedAmounts.composition.billed = basis('billed', undefined, '25');
estimatedAmounts.coverage.billed = coverage(undefined, '25');
estimatedAmounts.composition.amortized = basis('amortized');
estimatedAmounts.coverage.amortized = coverage();
estimatedOnly.entries = [{ date: '2026-08-01', financials: estimatedAmounts }];
estimatedOnly.coverage = { billed: { status: 'unavailable', coveredDayCount: 0 }, amortized: { status: 'unavailable', coveredDayCount: 0 } };
assert.equal(types.isReportDailySpend(estimatedOnly), true, 'estimate-only dates never count as actual coverage');
const badSavings = structuredClone(savingsPack);
badSavings.reporting.recommendations.rows[0].savingsBasis = 'cash-plus-retail';
assert.equal(types.isSubscriptionReportEvidencePack(badSavings), false);
badSavings.reporting.recommendations.rows[0].savingsBasis = 'retail';
badSavings.reporting.recommendations.rows[0].resources[0].savingsBasis = 'estimated';
assert.equal(types.isSubscriptionReportEvidencePack(badSavings), false);
console.log(`Report spend checks passed, including ${negativeCases} monetary/projection rejection cases and legacy/daily/pack/ESM compatibility.`);
