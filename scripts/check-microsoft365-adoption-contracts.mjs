import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const formats = { commonjs: createRequire(import.meta.url)('../dist/index.js'), esm: await import('../dist/esm/entries/root.js') };
for (const [format, api] of Object.entries(formats)) {
  test(`${format}: optional Copilot adoption guards reject malformed observations`, () => {
    const row = {
      windowDays: 28,
      reportRefreshDate: '2026-11-03',
      evidence: 'complete',
      prompts: { all: 10, chatWork: 0, chatWeb: 10, other: 0 },
      activeDays: 2,
      appLastActivityDates: Object.fromEntries(
        ['chatWork', 'chatWeb', 'teams', 'word', 'excel', 'powerPoint', 'outlook', 'oneNote', 'loop', 'microsoft365', 'edge', 'agent'].map(key => [
          key,
          null,
        ])
      ),
      webOnly: true,
    };
    row.appLastActivityDates.chatWeb = '2026-11-03';
    assert.equal(api.isMicrosoft365CopilotAdoption(row), true);
    for (const invalid of [
      { ...row, windowDays: 30 },
      { ...row, activeDays: 29 },
      { ...row, prompts: { ...row.prompts, all: -1 } },
      { ...row, appLastActivityDates: { ...row.appLastActivityDates, agent: '2026-02-30' } },
    ])
      assert.equal(api.isMicrosoft365CopilotAdoption(invalid), false);
  });
  test(`${format}: rule qualification remains additive to legacy findings`, () => {
    const row = { accountId: 'person', skuId: 'sku', kind: 'downgrade', ruleId: 'e5-premium' };
    assert.equal(api.isMicrosoft365LicenseInsight(row), true);
    assert.equal(
      api.isMicrosoft365LicenseInsight({ ...row, qualification: 'conditional', blockedBy: ['premium_requirements_unverified', 'storage_unknown'] }),
      true
    );
    assert.equal(api.isMicrosoft365LicenseInsight({ ...row, qualification: 'invented' }), false);
    assert.equal(api.isMicrosoft365LicenseInsight({ ...row, blockedBy: ['storage_unknown', 'storage_unknown'] }), false);
    assert.equal(api.isMicrosoft365LicenseInsight({ ...row, blockedBy: ['invented'] }), false);
  });
}
