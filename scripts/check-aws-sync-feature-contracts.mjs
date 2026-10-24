import assert from 'node:assert/strict';
import * as root from '../dist/index.js';
import * as aws from '../dist/aws/index.js';

assert.deepEqual([...root.AWS_SYNC_FEATURE_IDS], ['activityMonitoring', 'governance', 'perimeterInsights']);
assert.equal(aws.AWS_SYNC_FEATURE_IDS, root.AWS_SYNC_FEATURE_IDS);
const order = root.AZURE_SYNC_FEATURE_ORDER;
const positions = root.AWS_SYNC_FEATURE_IDS.map(id => order.indexOf(id));
assert.ok(positions.every(position => position >= 0), 'AWS IDs must be shared sync feature IDs');
assert.deepEqual(positions, [...positions].sort((left, right) => left - right), 'AWS IDs keep the shared order');
assert.equal(root.isAwsSyncFeatureId('governance'), true);
for (const notOffered of ['billing', 'availabilityZones', 'reportEvidencePack', 'unknown']) {
  assert.equal(root.isAwsSyncFeatureId(notOffered), false, notOffered);
}
assert.ok(root.AWS_SCHEDULED_REFRESH_SCAN_KINDS.includes('billing-reconciliation'));

console.log('AWS sync feature contract checks passed.');
