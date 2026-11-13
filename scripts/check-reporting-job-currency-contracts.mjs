// Display-currency contract for background reports: the request names a currency, the producer captures rates.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const builds = {
  cjs: require(join(packageRoot, 'dist', 'reporting', 'jobs', 'index.js')),
  esm: await import(pathToFileURL(join(packageRoot, 'dist', 'esm', 'reporting', 'jobs', 'index.js')).href),
};
const SUB = '6b1c1f0e-3f2a-4e5b-9c8d-0a1b2c3d4e5f';
const spec = extra => ({
  schemaVersion: 1,
  reportType: 'report-pack',
  scope: { cloudAccountIds: ['ca-1'], subscriptionIds: [SUB] },
  configuration: { reportIds: ['resources'], scopeCurrencyCode: 'NZD' },
  ...extra,
});
const snapshot = {
  rateDate: '2026-11-12',
  rateSnapshotId: 'a'.repeat(64),
  rateSource: 'European Central Bank euro foreign exchange reference rates',
  rates: { EUR: '1', NZD: '1.9942', USD: '1.1081' },
};

for (const [label, jobs] of Object.entries(builds)) {
  const parsed = jobs.parseReportJobSpecV1(spec({ displayCurrency: 'USD' }));
  assert.equal(parsed.ok, true, `${label} accepts displayCurrency`);
  assert.equal(parsed.value.displayCurrency, 'USD');
  assert.match(jobs.serializeReportJobSpecV1(parsed.value), /"displayCurrency":"USD"/u);
  assert.equal(jobs.serializeReportJobSpecV1(jobs.parseReportJobSpecV1(spec()).value).includes('displayCurrency'), false, `${label} billing stays unchanged`);
  for (const bad of ['usd', 'US', 7, ''])
    assert.equal(jobs.parseReportJobSpecV1(spec({ displayCurrency: bad })).ok, false, `${label} rejects ${bad}`);

  const base = { trigger: 'api', companyId: 'comp-a1b2c3d4e5f6g7h', fileName: 'Report-Pack-2026-11-13.zip', requestedAtUtc: '2026-11-13T03:15:42.123Z' };
  const row = await jobs.buildReportJobRowV1({ ...base, spec: spec({ displayCurrency: 'USD' }), currencyRateSnapshot: snapshot });
  assert.deepEqual(jobs.parseReportJobCurrencyRateSnapshotV1(row.currencyRateSnapshotJson), snapshot);
  const read = await jobs.parseReportJobRowV1(row);
  assert.equal(read.ok, true, `${label} row with snapshot parses`);
  assert.equal(read.spec.displayCurrency, 'USD');

  const billing = await jobs.buildReportJobRowV1({ ...base, spec: spec() });
  assert.equal(billing.currencyRateSnapshotJson, undefined);
  // A snapshot without a requested currency, or without the requested quote, is rejected.
  assert.equal((await jobs.parseReportJobRowV1({ ...billing, currencyRateSnapshotJson: row.currencyRateSnapshotJson })).ok, false);
  const missingQuote = JSON.stringify({ ...snapshot, rates: { EUR: '1', NZD: '1.9942' } });
  assert.equal((await jobs.parseReportJobRowV1({ ...row, currencyRateSnapshotJson: missingQuote })).ok, false);
  for (const bad of ['{}', 'x', JSON.stringify({ ...snapshot, extra: 1 }), JSON.stringify({ ...snapshot, rates: { usd: '1' } })])
    assert.equal(jobs.parseReportJobCurrencyRateSnapshotV1(bad), null, `${label} rejects snapshot ${bad.slice(0, 20)}`);
}
process.stdout.write('Reporting job display-currency contracts verified (CommonJS and ESM).\n');
