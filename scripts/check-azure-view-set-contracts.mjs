import assert from 'node:assert/strict';

import { isCompletedAzureViewSetV1 } from '../dist/index.js';

const valid = {
  schemaVersion: 1,
  status: 'completed',
  subscriptionId: 'sub-1',
  publicationId: 'refresh-1',
  portal: {
    runId: 'portal-run-1',
    manifestPath: 'runs/portal-run-1/completed-view-manifest.json',
    completedAt: '2026-08-07T00:00:00.000Z',
  },
  plugin: {
    runId: 'plugin-run-1',
    manifestPath: 'runs/plugin-run-1/completed-plugin-generation.json',
    completedAt: '2026-08-07T00:01:00.000Z',
  },
  economics: { generationId: 'economics-1', fingerprint: 'sha256:abc123' },
  completedAt: '2026-08-07T00:01:00.000Z',
};

assert.equal(isCompletedAzureViewSetV1(valid), true);
assert.equal(isCompletedAzureViewSetV1({ ...valid, status: 'in_progress' }), false);
assert.equal(isCompletedAzureViewSetV1({ ...valid, schemaVersion: 2 }), false);
assert.equal(isCompletedAzureViewSetV1({ ...valid, subscriptionId: '' }), false);
assert.equal(isCompletedAzureViewSetV1({ ...valid, portal: { ...valid.portal, runId: '' } }), false);
assert.equal(isCompletedAzureViewSetV1({ ...valid, portal: { ...valid.portal, manifestPath: 'https://storage/run.json' } }), false);
assert.equal(isCompletedAzureViewSetV1({ ...valid, plugin: { ...valid.plugin, manifestPath: '../run.json' } }), false);
assert.equal(isCompletedAzureViewSetV1({ ...valid, economics: { generationId: '', fingerprint: 'sha256:abc123' } }), false);

console.log('Azure completed view-set contract checks passed.');
