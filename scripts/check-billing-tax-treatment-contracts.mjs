import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const corpus = JSON.parse(await readFile(new URL('../fixtures/artifact-evidence-contract-corpus.json', import.meta.url), 'utf8'));

for (const path of ['../dist/index.js', '../dist/esm/entries/root.js']) {
  const contracts = await import(path);
  assert.equal(typeof contracts.isBillingTaxTreatment, 'function', `${path}: canonical tax validator exported`);
  for (const value of ['excluding-tax', 'including-recorded-tax']) assert.equal(contracts.isBillingTaxTreatment(value), true);
  for (const value of [undefined, null, '', 'consumption-only', 'pre-tax', 0, {}, ['excluding-tax']]) {
    assert.equal(contracts.isBillingTaxTreatment(value), false);
  }
  const original = structuredClone(corpus.fixtures.legacyBillingCostAnalysisMetadataV1);
  const daily = {
    aggregation: 'daily',
    startDate: 1,
    endDate: 2,
    averageDailyCost: 0,
    totalCost: 0,
    points: [{ date: '2026-10-01', timestamp: 1, cost: 0, isAnomaly: false, anomalyVotes: 0 }],
    taxTreatment: 'excluding-tax',
  };
  const monthly = {
    aggregation: 'monthly',
    startDate: 1,
    endDate: 2,
    averageDailyCost: 10,
    totalCost: 10,
    points: [{ month: '2026-10', startDate: 1, endDate: 2, cost: 10, averageDailyCost: 10, anomalyCount: 0 }],
    taxTreatment: 'including-recorded-tax',
  };
  const value = { ...original, chartData: { ...original.chartData, views: { '7_days': daily, '12_months': monthly } } };
  for (const key of ['forecastMethod', 'forecastMonthTotal', 'forecastRemaining', 'forecastPeriodEnd']) delete value[key];
  assert.equal(contracts.isBillingCostAnalysisBusinessPayloadV1(value), true, 'daily and monthly treatments may differ');
  const malformed = structuredClone(value);
  malformed.chartData.views['7_days'].taxTreatment = 'consumption-only';
  assert.equal(contracts.isBillingCostAnalysisBusinessPayloadV1(malformed), false, 'invalid view treatment rejected');
  const legacy = structuredClone(value);
  delete legacy.chartData.views['7_days'].taxTreatment;
  delete legacy.chartData.views['12_months'].taxTreatment;
  assert.equal(contracts.isBillingCostAnalysisBusinessPayloadV1(legacy), true, 'missing treatment remains valid for existing Azure contracts');

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
    taxTreatment: 'excluding-tax',
  };
  const projected = {
    ...value,
    forecastMonthTotal: 30,
    forecastTaxTreatment: 'excluding-tax',
    chartData: { ...value.chartData, views: { ...value.chartData.views, forecast_90_days: forecast } },
  };
  delete projected.chartData.forecastAvailability;
  assert.equal(contracts.isBillingCostAnalysisBusinessPayloadV1(projected), true);
  const publicValue = { ...projected, schemaVersion: 1, dataState: 'current' };
  delete publicValue.billingGenerationId;
  // This existing public response is Azure-specific; its Marketplace policy does not prove tax treatment.
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
  assert.equal(contracts.isBillingCostAnalysisPublicResponse(publicValue), true, 'public allowlist preserves forecast treatment');
  for (const changed of [
    { ...projected, forecastTaxTreatment: 'including-recorded-tax' },
    { ...projected, forecastTaxTreatment: undefined },
    { ...projected, forecastMonthTotal: undefined },
    { ...projected, chartData: value.chartData },
  ])
    assert.equal(contracts.isBillingCostAnalysisBusinessPayloadV1(changed), false, 'forecast header and view must share proved treatment');
  const publicMismatch = { ...publicValue, forecastTaxTreatment: 'including-recorded-tax' };
  assert.equal(contracts.isBillingCostAnalysisPublicResponse(publicMismatch), false);
  console.log(`${path}: billing tax treatment contract checks passed`);
}
