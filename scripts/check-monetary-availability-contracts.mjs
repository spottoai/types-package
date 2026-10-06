import assert from 'node:assert/strict';

for (const path of ['../dist/index.js', '../dist/esm/entries/root.js']) {
  const { isRetailCostAvailability, isBillingForecastUnavailable, isBillingCostAnalysisBusinessPayloadV1 } = await import(path);
  const retail = { status: 'available', currency: 'USD', provenance: 'provider-list-price', period: { kind: 'monthly-run-rate', hours: 730 }, sourceRefs: ['price-list:generation-1'] };
  assert.equal(isRetailCostAvailability(retail), true);
  assert.equal(isRetailCostAvailability({ status: 'unavailable', reasonCode: 'not-produced' }), true);
  assert.equal(isRetailCostAvailability({ ...retail, provenance: 'billed' }), false);
  assert.equal(isRetailCostAvailability({ ...retail, currency: '' }), false);
  assert.equal(isRetailCostAvailability({ ...retail, period: { kind: 'rolling-30-days', hours: 720 } }), false);
  assert.equal(isRetailCostAvailability({ ...retail, sourceRefs: [] }), false);
  assert.equal(isRetailCostAvailability({ status: 'unavailable', reasonCode: 0 }), false);
  const forecastAvailability = { status: 'unavailable', reasonCode: 'billing-usage-coverage-unavailable', basis: 'billed', currency: 'USD', asOfDate: '2026-10-06' };
  assert.equal(isBillingForecastUnavailable(forecastAvailability), true);
  assert.equal(isBillingForecastUnavailable({ ...forecastAvailability, asOfDate: '2026-02-30' }), false);
  assert.equal(isBillingForecastUnavailable({ ...forecastAvailability, basis: 'amortized' }), false);
  assert.equal(isBillingForecastUnavailable({ ...forecastAvailability, currency: ' ' }), false);
  const body = {
    subscriptionId: '123456789012', billingGenerationId: 'generation-1', currencyCode: 'USD', currencySymbol: '$', anomalies: [],
    chartData: { schemaVersion: 1, source: 'aggregated', dataWindow: { startDate: 0, endDate: 0, pointCount: 0 }, views: {}, detectors: { threshold: 0, methods: [] }, forecastAvailability },
  };
  assert.equal(isBillingCostAnalysisBusinessPayloadV1(body), true);
  assert.equal(isBillingCostAnalysisBusinessPayloadV1({ ...body, forecastMonthTotal: 0 }), false, 'unavailable is not a measured zero forecast');
  assert.equal(isBillingCostAnalysisBusinessPayloadV1({ ...body, forecastMethod: 'ets' }), false);
}
console.log('Monetary availability contracts pass in CJS and ESM.');
