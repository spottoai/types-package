import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const jobs = require('../dist/reporting/jobs/index.js');
const scheduler = require('../dist/scheduler/index.js');
const spec = {
  schemaVersion: 1,
  reportType: 'report-pack',
  scope: { cloudAccountIds: ['account-1'], subscriptionIds: ['11111111-1111-4111-8111-111111111111'] },
  configuration: { reportIds: ['security', 'resources'], scopeCurrencyCode: 'NZD' },
};
assert.equal(jobs.parseReportJobSpecV1(spec).ok, true);
assert.deepEqual(jobs.parseReportJobSpecV1(spec).value.configuration.reportIds, ['resources', 'security']);
assert.equal(
  jobs.serializeReportJobSpecV1(spec),
  jobs.serializeReportJobSpecV1({ ...spec, configuration: { ...spec.configuration, reportIds: ['resources', 'security'] } })
);
for (const reportIds of [[], ['unknown'], ['resources', 'resources'], ['../resources']])
  assert.equal(jobs.parseReportJobSpecV1({ ...spec, configuration: { ...spec.configuration, reportIds } }).ok, false);
assert.equal(jobs.parseReportJobSpecV1({ ...spec, configuration: { ...spec.configuration, storageUrl: 'https://example.com' } }).ok, false);
const definition = {
  definitionType: 'report-generation',
  name: 'Monthly report pack',
  timezone: 'Pacific/Auckland',
  timing: { triggerType: 'recurring', cadence: 'monthly', localTime: '08:00', dayOfMonth: 5 },
  report: spec,
  initialMode: 'active',
};
assert.equal(scheduler.isScheduleMutationRequest({ definition }), true);
const id = jobs.buildReportJobId({ instant: '2026-10-22T00:00:00.000Z', reportType: 'report-pack', scopeHash: '123456789abcdef0' });
assert.equal(jobs.parseReportJobId(id).reportType, 'report-pack');
assert.equal(jobs.isReportFileName('Report-Pack-2026-10-22.zip'), true);
assert.equal(jobs.isReportFileName('a.zip'), true);
assert.equal(jobs.isReportFileName('.zip'), false);
assert.equal(jobs.isReportFileName('a.docx'), true);
assert.equal(jobs.isReportFileName('.docx'), false);
console.log('Report Pack contract checks passed.');
