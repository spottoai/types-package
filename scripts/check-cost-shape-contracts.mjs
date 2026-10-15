import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const corpus = JSON.parse(await readFile(new URL('../fixtures/artifact-evidence-contract-corpus.json', import.meta.url), 'utf8'));

for (const path of ['../dist/index.js', '../dist/esm/entries/root.js']) {
  const contracts = await import(path);
  assert.equal('isBillingTaxTreatment' in contracts, false, `${path}: obsolete tax validator is not exported`);
  const original = structuredClone(corpus.fixtures.legacyBillingCostAnalysisMetadataV1);
  const daily = {
    aggregation: 'daily',
    startDate: 1,
    endDate: 2,
    averageDailyCost: 0,
    totalCost: 0,
    points: [{ date: '2026-10-01', timestamp: 1, cost: 0, isAnomaly: false, anomalyVotes: 0 }],
  };
  const monthly = {
    aggregation: 'monthly',
    startDate: 1,
    endDate: 2,
    averageDailyCost: 10,
    totalCost: 10,
    points: [{ month: '2026-10', startDate: 1, endDate: 2, cost: 10, averageDailyCost: 10, anomalyCount: 0 }],
  };
  const value = { ...original, chartData: { ...original.chartData, views: { '7_days': daily, '12_months': monthly } } };
  for (const key of ['forecastMethod', 'forecastMonthTotal', 'forecastRemaining', 'forecastPeriodEnd']) delete value[key];
  assert.equal(contracts.isBillingCostAnalysisBusinessPayloadV1(value), true, 'daily and monthly costs use the Azure shape without tax fields');

  const forecast = {
    aggregation: 'daily',
    startDate: 1,
    endDate: 2,
    forecastMethod: 'usage_run_rate',
    actualTotalCost: 10,
    forecastRemaining: 20,
    forecastMonthTotal: 30,
    actualPoints: [],
    forecastPoints: [],
    fittedPoints: [],
  };
  const projected = {
    ...value,
    forecastMonthTotal: 30,
    chartData: { ...value.chartData, views: { ...value.chartData.views, forecast_90_days: forecast } },
  };
  delete projected.chartData.forecastAvailability;
  assert.equal(contracts.isBillingCostAnalysisBusinessPayloadV1(projected), true);
  const publicValue = { ...projected, schemaVersion: 1, dataState: 'current' };
  delete publicValue.billingGenerationId;
  publicValue.financialChargeCoverage = {
    contractVersion: 'financial-charge-policy/v1',
    policyRef: 'azure-cloud-services-excluding-marketplace/v1',
    coordinate: {
      generationId: original.billingGenerationId,
      providerName: 'azure',
      providerScopeId: original.subscriptionId,
      basis: 'amortized',
      period: { startDate: '2026-10-01', endDateExclusive: '2026-11-01' },
      currencyCode: original.currencyCode,
      minorUnitScale: 2,
    },
    status: 'complete',
    unknownObjects: [],
    sourceTotals: {
      allChargeMinorUnits: 0,
      azureNativeMinorUnits: 0,
      marketplaceMinorUnits: 0,
      unknownMinorUnits: 0,
      unknownAbsoluteMinorUnits: 0,
      rowCount: 0,
      azureNativeRowCount: 0,
      marketplaceRowCount: 0,
      unknownRowCount: 0,
      unknownNonZeroRowCount: 0,
    },
  };
  assert.equal(contracts.isBillingCostAnalysisPublicResponse(publicValue), true, 'forecast has no tax metadata');
  for (const changed of [
    { ...projected, forecastMonthTotal: NaN },
    { ...projected, forecastRemaining: Infinity },
    { ...projected, forecastPeriodEnd: '2026-11-01' },
    { ...projected, chartData: { ...projected.chartData, costBasis: 'retail' } },
    { ...projected, chartData: { ...projected.chartData, views: { forecast_90_days: { ...forecast, forecastMonthTotal: Infinity } } } },
  ])
    assert.equal(contracts.isBillingCostAnalysisBusinessPayloadV1(changed), false, 'financial amount and basis validation remains');
  assert.equal(contracts.isBillingCostAnalysisPublicResponse({ ...publicValue, currencyCode: 'USD' }), false, 'currency evidence must match');
  assert.equal(
    contracts.isBillingCostAnalysisPublicResponse({ ...publicValue, forecastTaxTreatment: 'excluding-tax' }),
    false,
    'obsolete header is not public'
  );
  console.log(`${path}: Azure-compatible cost shape contract checks passed`);
}
