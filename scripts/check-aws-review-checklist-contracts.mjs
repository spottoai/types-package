import assert from 'node:assert/strict';
import {
  buildAwsReviewChecklistManualDocument,
  buildAwsReviewChecklistResultPath,
  buildAwsReviewChecklistStatePath,
  normalizeAwsReviewChecklistScanCommand,
  normalizeAwsReviewChecklistScope,
} from '../dist/common/awsReviewChecklist.js';

const scope = { providerName: 'aws', companyId: 'company-1', cloudAccountId: 'cloud-account-1', providerScopeId: '123456789012' };
const command = {
  ...scope,
  schemaVersion: 1,
  action: 'aws-checklist-review',
  checklistId: 'aws-s3',
  requestId: 'request-1',
  requestedAt: '2026-10-05T01:00:00.000Z',
  sourceVersion: 'a'.repeat(64),
};
assert.deepEqual(normalizeAwsReviewChecklistScope(scope), scope);
assert.deepEqual(normalizeAwsReviewChecklistScanCommand(command), command);
assert.notEqual(normalizeAwsReviewChecklistScanCommand(command), command);
assert.throws(() => normalizeAwsReviewChecklistScope(command), /unsupported field/);
for (const invalid of [
  null,
  [],
  3,
  {},
  { ...scope, providerName: 'azure' },
  { ...scope, companyId: '' },
  { ...scope, cloudAccountId: '../cloud' },
  { ...scope, cloudAccountId: 'cloud/account' },
  { ...scope, companyId: 'company%2Fother' },
  { ...scope, companyId: 'company.other' },
  { ...scope, companyId: 'a'.repeat(129) },
  { ...scope, providerScopeId: '123' },
  { ...scope, providerScopeId: 123456789012 },
  { ...scope, providerScopeId: ' 123456789012' },
  { ...scope, externalId: 'credential' },
]) {
  assert.throws(() => normalizeAwsReviewChecklistScope(invalid));
}
for (const [key, value] of [
  ['schemaVersion', 2],
  ['action', 'azure-checklist-review'],
  ['checklistId', 'waf'],
  ['checklistId', 'AWS-S3'],
  ['checklistId', 'aws-s3/other'],
  ['checklistId', 'aws--s3'],
  ['checklistId', `aws-${'a'.repeat(129)}`],
  ['requestId', 'request with spaces'],
  ['requestId', 'a'.repeat(129)],
  ['requestedAt', '2026-10-05'],
  ['requestedAt', '2026-02-30T01:00:00.000Z'],
  ['requestedAt', '2026-10-05T01:00:00.000+00:00'],
  ['sourceVersion', 'A'.repeat(64)],
  ['sourceVersion', 'a'.repeat(63)],
  ['sourceVersion', null],
]) {
  assert.throws(() => normalizeAwsReviewChecklistScanCommand({ ...command, [key]: value }), key);
}
for (const key of Object.keys(command)) {
  const missing = { ...command };
  delete missing[key];
  assert.throws(() => normalizeAwsReviewChecklistScanCommand(missing), `missing ${key}`);
}
for (const key of ['roleArn', 'externalId', 'accessKeyId', 'secretAccessKey', 'sessionToken', 'credentials', 'futureField']) {
  assert.throws(() => normalizeAwsReviewChecklistScanCommand({ ...command, [key]: { value: 'secret' } }), /unsupported field/);
}

assert.equal(
  buildAwsReviewChecklistResultPath(scope, 'aws-s3'),
  'aws-portal/subscriptions/123456789012/review-checklist/company-1/cloud-account-1/aws-s3.json'
);
assert.equal(
  buildAwsReviewChecklistStatePath(scope, 'aws-s3'),
  'aws-raw/subscriptions/123456789012/review-checklist-state/company-1/cloud-account-1/aws-s3.json'
);
for (const other of [
  { ...scope, companyId: 'company-2' },
  { ...scope, cloudAccountId: 'cloud-account-2' },
]) {
  assert.notEqual(buildAwsReviewChecklistResultPath(other, 'aws-s3'), buildAwsReviewChecklistResultPath(scope, 'aws-s3'));
  assert.notEqual(buildAwsReviewChecklistStatePath(other, 'aws-s3'), buildAwsReviewChecklistStatePath(scope, 'aws-s3'));
}
for (const build of [buildAwsReviewChecklistResultPath, buildAwsReviewChecklistStatePath]) {
  assert.throws(() => build({ ...scope, companyId: '../company' }, 'aws-s3'));
  assert.throws(() => build(scope, 'aws-s3/../../other'));
}

const projection = {
  checklistId: 'aws-s3',
  sourceVersion: command.sourceVersion,
  name: 'Amazon S3',
  state: 'Preview',
  timestamp: null,
  items: [
    {
      guid: '3a26244c-7032-52a0-b0eb-1297cf7c88d6',
      id: 'SEC_1/SEC_1_1',
      text: 'Review encryption',
      category: 'Security',
      description: 'Review stored data protection.',
      effortHours: 0,
      graph: 'malicious query',
      hasGraph: true,
      graphSourceAI: true,
      assessmentMode: 'automated',
      status: 'Fulfilled',
      compliantCount: 99,
      compliantIds: ['forged'],
    },
    { guid: '00000000-0000-5000-8000-000000000001' },
  ],
};
const original = structuredClone(projection);
const document = buildAwsReviewChecklistManualDocument(scope, projection, command.requestedAt);
assert.deepEqual(projection, original);
assert.equal(document.scanStatus, 'NotRun');
assert.equal(document.schemaVersion, 1);
assert.equal(document.providerName, 'aws');
assert.equal(document.companyId, scope.companyId);
assert.equal(document.cloudAccountId, scope.cloudAccountId);
assert.equal(document.providerScopeId, scope.providerScopeId);
assert.equal(document.subscriptionId, scope.providerScopeId);
assert.equal(document.tenantId, '');
assert.equal(document.sourceVersion, command.sourceVersion);
assert.equal(document.generatedAt, command.requestedAt);
for (const item of document.items) {
  assert.equal(item.status, 'NotVerified');
  assert.equal(item.assessmentMode, 'manual');
  assert.equal(item.assessmentReason, 'Manual verification required.');
  assert.equal(item.hasGraph, false);
  assert.equal(item.graphSourceAI, false);
  assert.equal(item.compliantCount, 0);
  assert.equal(item.nonCompliantCount, 0);
  assert.deepEqual(item.compliantIds, []);
  assert.deepEqual(item.nonCompliantIds, []);
  assert.equal('assessmentEvidence' in item, false);
  assert.equal('graph' in item, false);
}
assert.equal(document.items[0].effortHours, 0);
assert.equal(document.items[1].description, null);
assert.equal(document.items[1].effortHours, null);
for (const invalid of [
  { ...projection, sourceVersion: 'old-revision' },
  { ...projection, checklistId: 'unknown' },
  { ...projection, name: '' },
  { ...projection, items: {} },
  { ...projection, items: [{ guid: 'not-a-uuid' }] },
  { ...projection, items: [{ guid: projection.items[0].guid, text: 12 }] },
  { ...projection, items: [{ guid: projection.items[0].guid, effortHours: Infinity }] },
  { ...projection, items: [projection.items[0], { ...projection.items[0], guid: projection.items[0].guid.toUpperCase() }] },
])
  assert.throws(() => buildAwsReviewChecklistManualDocument(scope, invalid, command.requestedAt));
assert.throws(() => buildAwsReviewChecklistManualDocument(scope, projection, '2026-10-05'));

const cjsRoot = await import('../dist/index.js');
const esmRoot = await import('../dist/esm/entries/root.js');
for (const exports of [cjsRoot, esmRoot]) {
  assert.deepEqual(exports.normalizeAwsReviewChecklistScanCommand(command), command);
  assert.equal(exports.buildAwsReviewChecklistResultPath(scope, 'aws-s3'), buildAwsReviewChecklistResultPath(scope, 'aws-s3'));
  assert.deepEqual(exports.buildAwsReviewChecklistManualDocument(scope, projection, command.requestedAt), document);
}
process.stdout.write('AWS review checklist contract checks passed.\n');
