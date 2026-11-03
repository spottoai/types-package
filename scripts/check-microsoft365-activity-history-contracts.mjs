import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const formats = { commonjs: require('../dist/index.js'), esm: await import('../dist/esm/entries/root.js') };
const coverage = {
  state: 'complete',
  requestedFrom: '2026-10-31T00:00:00.000Z',
  requestedThrough: '2026-11-01T00:00:00.000Z',
  observedFrom: '2026-10-31T00:00:00.000Z',
  observedThrough: '2026-11-01T00:00:00.000Z',
  sourceTime: '2026-11-01T01:00:00.000Z',
  reason: null,
};
const day = {
  schemaVersion: 'microsoft-365-activity-history/v1',
  tenantId: 'tenant-one',
  date: '2026-10-31',
  generatedAt: '2026-11-01T01:00:00.000Z',
  tenantSyncRunId: 'run-one',
  stream: 'sign-ins',
  coverage,
  rows: [{ accountId: 'account-one', appId: 'app-one', count: 2, firstAt: '2026-10-31T12:00:00.000Z', lastAt: '2026-10-31T13:00:00.000Z' }],
};

for (const [format, api] of Object.entries(formats)) {
  test(`${format}: activity history contract exports`, () => {
    assert.equal(typeof api.isMicrosoft365ActivityHistoryDay, 'function');
    assert.equal(api.isMicrosoft365ActivityHistoryDay(day), true);
    assert.equal(api.isMicrosoft365ActivityHistoryDay({ ...day, rows: [] }), true);
  });
  test(`${format}: history rejects invalid UTC dates and raw security/person fields`, () => {
    for (const mutation of [
      value => (value.date = '2026-02-30'),
      value => (value.rows[0].count = -1),
      value => (value.rows[0].count = 1.5),
      value => (value.rows[0].lastAt = '2026-11-01T00:00:00.000Z'),
      value => (value.rows[0].firstAt = 'not-a-time'),
      value => (value.rows[0].ipAddress = '1.2.3.4'),
      value => (value.rows[0].displayName = 'Private Person'),
      value => (value.coverage.state = 'complete_empty'),
      value => (value.coverage.observedThrough = '2026-10-30T00:00:00.000Z'),
      value => (value.rawEvents = []),
    ]) {
      const value = structuredClone(day);
      mutation(value);
      assert.equal(api.isMicrosoft365ActivityHistoryDay(value), false);
    }
  });
  test(`${format}: financial observations cannot claim realised savings`, () => {
    const value = {
      ...structuredClone(day),
      stream: 'licenses',
      classificationVersion: 'rules-v1',
      snapshotId: 'snapshot-one',
      rows: [{ skuId: 'sku-one', enabledUnits: 10, consumedUnits: 8, subscriptionUnits: null }],
      changes: [
        {
          id: 'change-one',
          skuId: 'sku-one',
          kind: 'assignment',
          from: 9,
          to: 8,
          delta: -1,
          sourceSnapshotId: 'source-one',
          targetSnapshotId: 'snapshot-one',
          confirmedSaving: null,
        },
      ],
    };
    assert.equal(api.isMicrosoft365ActivityHistoryDay(value), true);
    value.changes[0].confirmedSaving = 12;
    assert.equal(api.isMicrosoft365ActivityHistoryDay(value), false);
  });
}
