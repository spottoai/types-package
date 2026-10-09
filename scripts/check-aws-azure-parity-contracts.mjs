import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import cjs from '../dist/index.js';
import * as esm from '../dist/esm/entries/root.js';

const rightSku = JSON.parse(await readFile(new URL('../fixtures/utilization-stories/right-sku.json', import.meta.url), 'utf8'));
const contribution = {
  semantics: 'portfolio-contribution',
  allocationIds: ['allocation-1'],
  range: { currency: 'NZD', minorUnitScale: 2, currentMonthlyMinorUnits: 100, minSavingsMinorUnits: 0, maxSavingsMinorUnits: 10 },
};

for (const [format, api] of [['CJS', cjs], ['ESM', esm]]) {
  assert.equal(api.isReportPortfolioSavingsContribution(contribution), true, `${format}: legacy contribution`);
  for (const authority of ['billed-resource-spend', 'provider-estimate', 'mixed']) {
    assert.equal(api.isReportPortfolioSavingsContribution({ ...contribution, estimateAuthority: authority }), true);
    for (const status of ['complete', 'partial']) {
      const coverage = { status, estimateAuthority: authority };
      const story = structuredClone(rightSku);
      story.summary.savingsCoverage = coverage;
      story.sections[0].financials = { spend30d: 100, savingsMax: 0, currency: 'NZD', savingsCoverage: coverage };
      assert.equal(api.isStoryArtifact(story), true, `${format}: ${status} ${authority}`);
    }
  }
  for (const malformed of [null, 1, '', 'estimated', [], {}]) {
    assert.equal(api.isReportPortfolioSavingsContribution({ ...contribution, estimateAuthority: malformed }), false);
    assert.equal(api.isStorySummary({ ...rightSku.summary, savingsCoverage: { status: 'partial', estimateAuthority: malformed } }), false);
  }
  assert.equal(api.isStoryArtifact(rightSku), true, `${format}: unchanged Azure story`);
  for (const malformed of [null, [], 'partial', { status: 'unknown' }, { status: 1 }]) {
    const story = structuredClone(rightSku);
    story.summary.savingsCoverage = malformed;
    assert.equal(api.isStoryArtifact(story), false);
    delete story.summary.savingsCoverage;
    story.sections[0].financials = { spend30d: 100, savingsMax: 0, currency: 'NZD', savingsCoverage: malformed };
    assert.equal(api.isStoryArtifact(story), false);
  }
  assert.equal(api.isSkuOptionSummary({ kind: 'fits-usage', label: 'Smaller', savingsPercent: 10, savingsBasis: 'provider-estimate' }), true);
  const estimatedSku = structuredClone(rightSku);
  const row = estimatedSku.sections[0].rows[0];
  for (const option of row.options ?? []) option.savingsBasis = 'provider-estimate';
  assert.equal(api.isStoryArtifact(estimatedSku), true, `${format}: provider-estimated Right SKU`);
  row.options[0].savingsBasis = 'unsupported';
  assert.equal(api.isStoryArtifact(estimatedSku), false);
}
console.log('AWS/Azure parity contract guard checks passed (CJS and ESM)');
