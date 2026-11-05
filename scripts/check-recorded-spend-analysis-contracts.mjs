import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const bytes = readFileSync(new URL('../examples/recorded-spend-analysis-v1.json', import.meta.url));
assert.equal(
  createHash('sha256').update(bytes).digest('hex'),
  '89dc5d7a43f8c85ceca85da63206cdae00c2e5908219147745a08ff588d51de8',
  'Canonical and UI conformance fixture pin the same wire'
);
for (const path of ['../dist/index.js', '../dist/esm/entries/root.js']) {
  const { isRecordedSpendAnalysis } = await import(path);
  const fixture = JSON.parse(bytes);
  assert.equal(isRecordedSpendAnalysis(fixture), true);
  for (const mutate of [
    x => {
      x.current30Days.billed.amount = -1;
      x.previous7Days.amortized.amount = 0;
    },
    x => {
      x.previous30Days.currency = null;
      x.previous30Days.billed = { status: 'unavailable', reason: 'mixed-currencies' };
      x.previous30Days.amortized = { status: 'unavailable', reason: 'mixed-currencies' };
    },
    x => {
      x.previous30Days.closure.status = 'unproved';
      x.previous30Days.billed = { status: 'unavailable', reason: 'insufficient-observed-dates' };
      x.previous30Days.amortized = { status: 'unavailable', reason: 'insufficient-observed-dates' };
    },
  ]) {
    const x = structuredClone(fixture);
    mutate(x);
    assert.equal(isRecordedSpendAnalysis(x), true);
  }
  for (const mutate of [
    x => {
      x.current30Days.billed.amount = NaN;
    },
    x => {
      x.current30Days.currency = null;
    },
    x => {
      x.current30Days.currency = 'usd';
    },
    x => {
      x.current30Days.closure.status = 'unproved';
    },
    x => {
      x.current30Days.source = 'retail';
    },
    x => {
      x.current30Days.finality = 'finalized';
    },
    x => {
      x.current30Days.window.dayCount = 29;
    },
    x => {
      x.current7Days.window.dateBasis = 'local';
    },
    x => {
      x.previous30Days.window.endDateExclusive = '2026-09-27';
    },
    x => {
      delete x.previous7Days;
    },
    x => {
      x.generatedAt = 'invalid';
    },
    x => {
      x.current7Days.amortized = { status: 'unavailable', reason: '' };
    },
  ]) {
    const x = structuredClone(fixture);
    mutate(x);
    assert.equal(isRecordedSpendAnalysis(x), false);
  }
  console.log(`${path}: recorded spend analysis contracts passed`);
}
