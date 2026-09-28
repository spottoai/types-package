// Contract checks for `@spottoai/types-package/reporting-jobs`
// (types-package/specs/reporting/reporting-scheduler-types.md). Runs against the built CommonJS and ESM outputs.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const vectors = JSON.parse(await readFile(join(packageRoot, 'fixtures', 'reporting-job-identity-vectors.json'), 'utf8')).vectors;

const builds = {
  cjs: require(join(packageRoot, 'dist', 'reporting', 'jobs', 'index.js')),
  esm: await import(pathToFileURL(join(packageRoot, 'dist', 'esm', 'reporting', 'jobs', 'index.js')).href),
};

const sha256 = value => createHash('sha256').update(value, 'utf8').digest('hex');
const SUB_A = '6b1c1f0e-3f2a-4e5b-9c8d-0a1b2c3d4e5f';
const SUB_B = '0f0e0d0c-0b0a-4908-8706-050403020100';
// Real ID formats: companies `comp-` + 15 characters, cloud accounts `gdap-`/`guest-` + UUID or a UUID,
// schedules `schedule-` + 32 hex, action groups `ag-…`, reports `rpt-…`, drafts `rptdraft-…`.
const COMPANY = 'comp-a1b2c3d4e5f6g7h';
const GDAP_ACCOUNT = 'gdap-9f8e7d6c-5b4a-4938-8271-605f4e3d2c1b';
const SCHEDULE = `schedule-${'0123456789abcdef'.repeat(2)}`;
const ACTION_GROUP = 'ag-k3j4h5g6f7d8s9a';

const sdmSpec = () => ({
  schemaVersion: 1,
  reportType: 'sdm',
  scope: { cloudAccountIds: ['ca-2', 'ca-1', GDAP_ACCOUNT], subscriptionIds: [SUB_A.toUpperCase(), SUB_B, SUB_A] },
  period: { kind: 'previous-calendar-month' },
  configuration: {
    layout: 'monthly-insights',
    cloudIqServiceProfile: { selectedServiceIds: ['cost_control', 'unified_foundation'], detailRowLimit: 25 },
  },
});

const currentStateSpec = () => ({
  schemaVersion: 1,
  reportType: 'architecture-assessment',
  scope: { cloudAccountIds: ['ca-1'], subscriptionIds: [SUB_B] },
  configuration: {
    audience: 'customer',
    sections: { costOpportunities: true, securityPosture: true, reliabilityAvailability: false, quickWins: true, roadmap: true },
    scopeCurrencyCode: ' aud ',
    preparedBy: 'Contoso Cloud team',
  },
});

const hostile = () => {
  const value = sdmSpec();
  Object.defineProperty(value, 'scope', {
    enumerable: true,
    get() {
      throw new Error('adversarial accessor');
    },
  });
  return value;
};

const checkJobs = async (jobs, label) => {
  // Identity vectors (computed independently with node:crypto).
  for (const vector of vectors) {
    const { expected } = vector;
    assert.equal(jobs.buildReverseTime19(vector.instant), expected.reverseTime19, `${label} reverseTime19 ${vector.name}`);
    assert.equal(await jobs.buildReportJobScopeHash(vector), expected.scopeHash, `${label} scopeHash ${vector.name}`);
    assert.deepEqual(
      await jobs.deriveReportJobIdentity(vector),
      { jobId: expected.jobId, scopeHash: expected.scopeHash },
      `${label} identity ${vector.name}`
    );
    const parsed = jobs.parseReportJobId(expected.jobId);
    assert.equal(parsed.instant.toISOString(), vector.instant, `${label} parse instant ${vector.name}`);
    assert.equal(parsed.reportType, vector.reportType);
    assert.equal(parsed.scopeHash, expected.scopeHash);
  }
  assert.equal(jobs.parseReverseTime19('9999999999999999999').toISOString(), '1970-01-01T00:00:00.000Z');
  for (const invalid of ['999999999999999999', '99999999999999999999', 'abcdefghijklmnopqrs', '0000000000000000000', 42]) {
    assert.equal(jobs.parseReverseTime19(invalid), null, `${label} reverse ${invalid}`);
  }
  for (const invalid of [-1, Number.NaN, 253402300800000, 'not-a-date', 1.5])
    assert.throws(() => jobs.buildReverseTime19(invalid), `${label} instant ${invalid}`);
  for (const invalid of [
    '9999998209434657876-sow-7cc9a991cbd7375c',
    '9999998209434657876-sdm-7CC9A991CBD7375C',
    '999999820943465787-sdm-7cc9a991cbd7375c',
    'x',
  ]) {
    assert.equal(jobs.parseReportJobId(invalid), null, `${label} jobId ${invalid}`);
  }
  await assert.rejects(jobs.buildReportJobScopeHash({ subscriptionIds: [] }));
  await assert.rejects(jobs.buildReportJobScopeHash({ subscriptionIds: ['not-a-guid'] }));
  await assert.rejects(jobs.buildReportJobScopeHash({ subscriptionIds: [SUB_A], scheduleId: 'bad:id' }));
  assert.throws(() => jobs.buildReportJobId({ instant: 0, reportType: 'sdm', scopeHash: 'XYZ' }));
  assert.equal(jobs.buildReportJobMessageId(COMPANY, vectors[0].expected.jobId), `report-job:${COMPANY}:${vectors[0].expected.jobId}`);
  assert.throws(() => jobs.buildReportJobMessageId('bad:company', vectors[0].expected.jobId));

  // Spec parsing and canonical form.
  const sdm = jobs.parseReportJobSpecV1(sdmSpec());
  assert.equal(sdm.ok, true, JSON.stringify(sdm));
  assert.deepEqual(sdm.value.scope, { cloudAccountIds: ['ca-1', 'ca-2', GDAP_ACCOUNT], subscriptionIds: [SUB_B, SUB_A] });
  const cs = jobs.parseReportJobSpecV1(currentStateSpec());
  assert.equal(cs.ok, true, JSON.stringify(cs));
  assert.equal(cs.value.configuration.scopeCurrencyCode, 'AUD');
  const explicit = jobs.parseReportJobSpecV1({ ...sdmSpec(), period: { kind: 'explicit', startDate: '2025-10-01', endDate: '2026-09-30' } });
  assert.equal(explicit.ok, true, JSON.stringify(explicit));

  const canonical = jobs.serializeReportJobSpecV1(sdmSpec());
  const reordered = sdmSpec();
  const shuffled = {
    configuration: reordered.configuration,
    period: reordered.period,
    scope: { subscriptionIds: [SUB_B, SUB_A], cloudAccountIds: [GDAP_ACCOUNT, 'ca-1', 'ca-2'] },
    reportType: 'sdm',
    schemaVersion: 1,
  };
  assert.equal(jobs.serializeReportJobSpecV1(shuffled), canonical, `${label} canonical order`);
  assert.equal(
    canonical,
    `{"schemaVersion":1,"reportType":"sdm","scope":{"cloudAccountIds":["ca-1","ca-2","${GDAP_ACCOUNT}"],"subscriptionIds":["${SUB_B}","${SUB_A}"]},"period":{"kind":"previous-calendar-month"},"configuration":{"layout":"monthly-insights","cloudIqServiceProfile":{"selectedServiceIds":["cost_control","unified_foundation"],"detailRowLimit":25}}}`
  );
  assert.equal(jobs.parseReportJobRequestJson(canonical).ok, true);
  assert.equal(jobs.parseReportJobRequestJson(` ${canonical}`).ok, false, `${label} non-canonical whitespace`);
  assert.equal(jobs.parseReportJobRequestJson(JSON.stringify(sdmSpec())).ok, false, `${label} non-canonical content`);
  assert.equal(jobs.parseReportJobRequestJson('{').ok, false);
  assert.equal(jobs.parseReportJobRequestJson('x'.repeat(40000)).ok, false);

  const tooMany = Array.from({ length: 201 }, (_, index) => `00000000-0000-0000-0000-${index.toString(16).padStart(12, '0')}`);
  const exactly200 = tooMany.slice(0, 200);
  assert.equal(
    jobs.parseReportJobSpecV1({ ...sdmSpec(), scope: { cloudAccountIds: ['ca-1'], subscriptionIds: exactly200 } }).ok,
    true,
    `${label} 200 subscriptions`
  );
  const invalidSpecs = {
    'unknown top-level field': { ...sdmSpec(), extra: true },
    'unknown scope field': { ...sdmSpec(), scope: { ...sdmSpec().scope, resourceGroups: [] } },
    'unknown profile field': {
      ...sdmSpec(),
      configuration: { ...sdmSpec().configuration, cloudIqServiceProfile: { selectedServiceIds: [], extra: 1 } },
    },
    '201 subscriptions': { ...sdmSpec(), scope: { cloudAccountIds: ['ca-1'], subscriptionIds: tooMany } },
    'invalid subscription': { ...sdmSpec(), scope: { cloudAccountIds: ['ca-1'], subscriptionIds: ['../etc'] } },
    'no subscriptions': { ...sdmSpec(), scope: { cloudAccountIds: ['ca-1'], subscriptionIds: [] } },
    'no cloud accounts': { ...sdmSpec(), scope: { cloudAccountIds: [], subscriptionIds: [SUB_A] } },
    'path in cloud account': { ...sdmSpec(), scope: { cloudAccountIds: ['a/b'], subscriptionIds: [SUB_A] } },
    'reversed explicit dates': { ...sdmSpec(), period: { kind: 'explicit', startDate: '2026-09-30', endDate: '2026-09-01' } },
    '367-day period': { ...sdmSpec(), period: { kind: 'explicit', startDate: '2025-01-01', endDate: '2026-01-02' } },
    'impossible date': { ...sdmSpec(), period: { kind: 'explicit', startDate: '2026-02-30', endDate: '2026-03-01' } },
    'rule with extra field': { ...sdmSpec(), period: { kind: 'previous-calendar-month', offset: 1 } },
    'unknown period kind': { ...sdmSpec(), period: { kind: 'latest-billing-month' } },
    'SDM without period': (() => {
      const { period, ...rest } = sdmSpec();
      void period;
      return rest;
    })(),
    'company template layout': { ...sdmSpec(), configuration: { ...sdmSpec().configuration, layout: 'company-template' } },
    'duplicate service ids': {
      ...sdmSpec(),
      configuration: { layout: 'spotto-layout', cloudIqServiceProfile: { selectedServiceIds: ['cost_control', 'cost_control'] } },
    },
    'detail row limit 100': {
      ...sdmSpec(),
      configuration: { layout: 'spotto-layout', cloudIqServiceProfile: { selectedServiceIds: [], detailRowLimit: 100 } },
    },
    'Current State with period': { ...currentStateSpec(), period: { kind: 'previous-calendar-month' } },
    'two-letter currency': { ...currentStateSpec(), configuration: { ...currentStateSpec().configuration, scopeCurrencyCode: 'AU' } },
    'missing section': { ...currentStateSpec(), configuration: { ...currentStateSpec().configuration, sections: { costOpportunities: true } } },
    'URL in preparedBy': { ...currentStateSpec(), configuration: { ...currentStateSpec().configuration, preparedBy: 'see https://example.com' } },
    'control character in preparedBy': { ...currentStateSpec(), configuration: { ...currentStateSpec().configuration, preparedBy: 'a\u0007b' } },
    'curation not supported': { ...currentStateSpec(), configuration: { ...currentStateSpec().configuration, curation: {} } },
    'schema version 2': { ...sdmSpec(), schemaVersion: 2 },
    'sow report': { ...sdmSpec(), reportType: 'sow' },
    'array spec': [sdmSpec()],
    'hostile getter': hostile(),
  };
  for (const [name, spec] of Object.entries(invalidSpecs)) {
    const result = jobs.parseReportJobSpecV1(spec);
    assert.equal(result.ok, false, `${label} spec should be rejected: ${name}`);
    assert.ok(result.errors.length > 0);
    assert.throws(() => jobs.serializeReportJobSpecV1(spec), `${label} serialize should reject: ${name}`);
  }

  // Queue message.
  const message = jobs.createReportJobRequestedV1({ companyId: COMPANY, jobId: vectors[0].expected.jobId });
  assert.deepEqual(message, {
    schemaVersion: 1,
    messageType: 'report-job.requested',
    companyId: COMPANY,
    jobId: vectors[0].expected.jobId,
    correlationId: vectors[0].expected.jobId,
  });
  assert.deepEqual(jobs.buildReportJobRequestedBrokerProperties(message), {
    messageId: `report-job:${COMPANY}:${vectors[0].expected.jobId}`,
    correlationId: vectors[0].expected.jobId,
    contentType: 'application/json',
    subject: 'report-job.requested',
  });
  const hostileMessage = { ...message };
  Object.defineProperty(hostileMessage, 'jobId', {
    enumerable: true,
    get: () => {
      throw new Error('x');
    },
  });
  for (const invalid of [
    { ...message, extra: 1 },
    { ...message, homeRegion: 'aue' },
    { ...message, jobId: 'job-1' },
    { ...message, companyId: 'a:b' },
    { ...message, correlationId: 'x'.repeat(129) },
    { ...message, correlationId: '' },
    { ...message, schemaVersion: 2 },
    { ...message, messageType: 'report-job.notification-requested' },
    hostileMessage,
  ]) {
    assert.equal(jobs.isReportJobRequestedV1(invalid), false, `${label} message ${JSON.stringify(Object.keys(invalid))}`);
  }

  // Status vocabulary.
  assert.deepEqual(
    [...jobs.REPORT_JOB_STATUSES],
    ['accepted', 'running', 'source-ready', 'generated', 'completed', 'completed-with-notification-errors', 'failed']
  );
  for (const status of jobs.REPORT_JOB_STATUSES) {
    const terminal = jobs.isTerminalReportJobStatus(status);
    assert.equal(jobs.canTransitionReportJobStatus(status, 'failed'), !terminal, `${label} ${status} -> failed`);
    assert.equal(jobs.canTransitionReportJobStatus(status, status), false, `${label} ${status} self`);
    if (terminal) assert.deepEqual([...jobs.REPORT_JOB_STATUS_TRANSITIONS[status]], []);
  }
  assert.equal(jobs.canTransitionReportJobStatus('source-ready', 'running'), false, `${label} status never moves backwards`);
  assert.equal(jobs.canTransitionReportJobStatus('accepted', 'generated'), false);
  for (const code of jobs.REPORT_JOB_FAILURE_CODES) {
    const stage = jobs.REPORT_JOB_FAILURE_STAGE_BY_CODE[code];
    if (stage === null) {
      assert.throws(() => jobs.resolveReportJobFailureStage(code));
      assert.equal(jobs.resolveReportJobFailureStage(code, 'source-load'), 'source-load');
    } else {
      assert.equal(jobs.isReportJobFailureStage(stage), true, `${label} ${code} stage`);
      assert.equal(jobs.resolveReportJobFailureStage(code, 'request'), stage);
    }
  }

  // Row: build, parse and tamper.
  const apiRow = await jobs.buildReportJobRowV1({
    trigger: 'api',
    companyId: COMPANY,
    spec: sdmSpec(),
    fileName: 'Contoso-Service-Delivery-Report-2026-08.docx',
    requestedAtUtc: '2026-09-28T03:15:42.123Z',
    requestedByUserId: 'operator:jay',
  });
  assert.equal(apiRow.RowKey, apiRow.jobId);
  assert.equal(apiRow.PartitionKey, COMPANY);
  assert.equal(apiRow.jobId.startsWith(`${jobs.buildReverseTime19('2026-09-28T03:15:42.123Z')}-sdm-`), true);
  assert.equal(apiRow.requestSha256, sha256(apiRow.requestJson), `${label} requestSha256`);
  assert.equal(apiRow.status, 'accepted');
  assert.equal(apiRow.attemptCount, 0);
  assert.equal(apiRow.notificationStatus, 'none');
  const scheduleRow = await jobs.buildReportJobRowV1({
    trigger: 'schedule',
    scheduleId: 'sched-01',
    definitionRevision: 3,
    scheduledForUtc: '2026-10-05T08:00:00.000Z',
    companyId: COMPANY,
    spec: { ...sdmSpec(), scope: { cloudAccountIds: ['ca-1'], subscriptionIds: [SUB_A, SUB_B] } },
    fileName: 'report.docx',
    requestedAtUtc: '2026-10-05T08:00:01.500Z',
  });
  assert.equal(scheduleRow.jobId, vectors[2].expected.jobId, `${label} schedule job id equals the vector`);
  const csRow = await jobs.buildReportJobRowV1({
    trigger: 'api',
    companyId: COMPANY,
    spec: currentStateSpec(),
    fileName: 'current-state.docx',
    requestedAtUtc: '2026-09-28T03:15:42.123Z',
  });

  const fieldGroups = [jobs.REPORT_JOB_PRODUCER_FIELDS, jobs.REPORT_JOB_WORKER_FIELDS, jobs.REPORT_JOB_NOTIFICATION_FIELDS].map(group => [...group]);
  const allFields = fieldGroups.flat();
  assert.equal(new Set(allFields).size, allFields.length, `${label} field groups are disjoint`);
  for (const row of [apiRow, scheduleRow, csRow]) {
    for (const key of Object.keys(row)) assert.ok(allFields.includes(key), `${label} row field ${key} is owned by a group`);
    const parsed = await jobs.parseReportJobRowV1(row);
    assert.equal(parsed.ok, true, `${label} ${JSON.stringify(parsed)}`);
    assert.equal(parsed.spec.reportType, row.reportType);
  }
  const withWorkerFields = {
    ...apiRow,
    status: 'source-ready',
    attemptCount: 2,
    leaseOwner: 'vm-1/abc',
    leaseExpiresAtUtc: '2026-09-28T03:25:42.123Z',
    sourceObservedAtUtc: '2026-09-28T03:16:00.000Z',
    sourceSnapshotSha256: 'a'.repeat(64),
    sourceCoverageSummary: '{"ready":2}',
    failureStage: null,
    etag: 'W/"datetime\'2026-09-28T03%3A15%3A42.123Z\'"',
    Timestamp: '2026-09-28T03:15:42.123Z',
  };
  const workerParsed = await jobs.parseReportJobRowV1(withWorkerFields);
  assert.equal(workerParsed.ok, true, `${label} worker fields ${JSON.stringify(workerParsed)}`);
  assert.equal('etag' in workerParsed.row, false, `${label} system fields dropped`);
  assert.equal('failureStage' in workerParsed.row, false, `${label} null fields dropped`);

  const otherSpecJson = jobs.serializeReportJobSpecV1({ ...sdmSpec(), scope: { cloudAccountIds: ['ca-1'], subscriptionIds: [SUB_B] } });
  const tampered = {
    'hash mismatch': [{ ...apiRow, requestSha256: 'b'.repeat(64) }, 'request-hash-mismatch'],
    'scope changed with matching hash': [{ ...apiRow, requestJson: otherSpecJson, requestSha256: sha256(otherSpecJson) }, 'request-invalid'],
    'non-canonical request': [
      { ...apiRow, requestJson: ` ${apiRow.requestJson}`, requestSha256: sha256(` ${apiRow.requestJson}`) },
      'request-invalid',
    ],
    'RowKey differs': [{ ...apiRow, RowKey: scheduleRow.jobId }, 'request-invalid'],
    'PartitionKey differs': [{ ...apiRow, PartitionKey: 'other-company' }, 'request-invalid'],
    'instant differs from job id': [{ ...apiRow, requestedAtUtc: '2026-09-28T03:15:42.124Z' }, 'request-invalid'],
    'report type differs': [{ ...csRow, reportType: 'sdm' }, 'request-invalid'],
    'schedule job without schedule': [{ ...scheduleRow, scheduleId: undefined }, 'request-invalid'],
    'api job with schedule fields': [{ ...apiRow, scheduleId: 'sched-01' }, 'request-invalid'],
    'schedule id changed': [{ ...scheduleRow, scheduleId: 'sched-02' }, 'request-invalid'],
    'unknown field': [{ ...apiRow, emailAddresses: 'a@b.c' }, 'request-invalid'],
    'row with a time zone': [{ ...apiRow, timezone: 'UTC' }, 'request-invalid'],
    'path in file name': [{ ...apiRow, fileName: '../x.docx' }, 'request-invalid'],
    'not a docx': [{ ...apiRow, fileName: 'report.pdf' }, 'request-invalid'],
    'row with a region': [{ ...apiRow, homeRegion: 'aue' }, 'request-invalid'],
    'unknown status': [{ ...apiRow, status: 'queued' }, 'request-invalid'],
    'unknown failure code': [{ ...apiRow, failureCode: 'oops' }, 'request-invalid'],
    'coverage summary too long': [{ ...apiRow, sourceCoverageSummary: 'x'.repeat(8193) }, 'request-invalid'],
    'schema version 2': [{ ...apiRow, schemaVersion: 2 }, 'unsupported-schema-version'],
  };
  for (const [name, [row, code]] of Object.entries(tampered)) {
    const parsed = await jobs.parseReportJobRowV1(row);
    assert.equal(parsed.ok, false, `${label} row should be rejected: ${name}`);
    assert.equal(parsed.code, code, `${label} row code for ${name}: ${JSON.stringify(parsed)}`);
  }
  await assert.rejects(
    jobs.buildReportJobRowV1({
      trigger: 'api',
      companyId: COMPANY,
      spec: sdmSpec(),
      fileName: '../r.docx',
      requestedAtUtc: '2026-09-28T03:15:42.123Z',
    })
  );

  // Instants: UTC ISO strings only, so the job ID never depends on the host time zone.
  for (const invalid of ['2026-09-28T03:15:42', '2026-09-28T03:15:42Z', 'Sep 28 2026', '2026-09-28']) {
    assert.throws(() => jobs.buildReverseTime19(invalid), `${label} instant string ${invalid}`);
  }
  assert.equal(jobs.buildReverseTime19(new Date('2026-09-28T03:15:42.123Z')), vectors[0].expected.reverseTime19);
  assert.equal(jobs.buildReverseTime19(Date.parse('2026-09-28T03:15:42.123Z')), vectors[0].expected.reverseTime19);

  // MessageId stays within Service Bus's 128 characters.
  const longestJobId = vectors[1].expected.jobId;
  const company56 = `c${'x'.repeat(54)}9`;
  assert.equal(jobs.buildReportJobMessageId(company56, longestJobId).length <= 128, true, `${label} message id length`);
  assert.throws(() => jobs.buildReportJobMessageId(`${company56}z`, longestJobId), `${label} 57-character company id`);
  assert.equal(jobs.isReportJobRequestedV1({ ...message, companyId: `${company56}z` }), false);

  // Real ID formats in a schedule job with an action group.
  const realRow = await jobs.buildReportJobRowV1({
    trigger: 'schedule',
    scheduleId: SCHEDULE,
    definitionRevision: 1,
    scheduledForUtc: '2026-11-05T08:00:00.000Z',
    coalescedOccurrenceCount: 2,
    companyId: COMPANY,
    spec: sdmSpec(),
    fileName: 'Contoso-Monthly-Insights-2026-10.docx',
    requestedAtUtc: '2026-11-05T08:00:02.000Z',
    requestedByUserId: 'user-7h6g5f4d3s2a1',
    notificationPolicyId: ACTION_GROUP,
  });
  assert.equal((await jobs.parseReportJobRowV1(realRow)).ok, true, `${label} real-format row`);

  // @azure/data-tables casing (partitionKey/rowKey/etag/timestamp) parses to the REST shape and back.
  const sdkRow = { ...jobs.toReportTableSdkEntity(apiRow), etag: 'W/"x"', timestamp: '2026-09-28T03:15:43.000Z', 'odata.metadata': 'x' };
  assert.equal('PartitionKey' in sdkRow, false);
  const sdkParsed = await jobs.parseReportJobRowV1(sdkRow);
  assert.equal(sdkParsed.ok, true, `${label} SDK casing ${JSON.stringify(sdkParsed)}`);
  assert.deepEqual(sdkParsed.row, apiRow, `${label} SDK row normalised to REST casing`);
  assert.equal((await jobs.parseReportJobRowV1({ ...sdkRow, PartitionKey: 'other' })).ok, false, `${label} conflicting key casing`);

  // Status milestones and the fields that prove them.
  const completedRow = {
    ...apiRow,
    status: 'completed',
    attemptCount: 1,
    sourceObservedAtUtc: '2026-09-28T03:16:00.000Z',
    sourceSnapshotSha256: 'd'.repeat(64),
    sourceCoverageSummary: JSON.stringify({ selected: 2, ready: 2, note: 'é'.repeat(10) }),
    generatedAtUtc: '2026-09-28T03:16:00.000Z',
    artifactContentSha256: 'c'.repeat(64),
    artifactBytes: 48213,
    completedAtUtc: '2026-09-28T03:18:10.000Z',
  };
  assert.equal((await jobs.parseReportJobRowV1(completedRow)).ok, true, `${label} completed row`);
  const failedRow = { ...apiRow, status: 'failed', attemptCount: 10, failureCode: 'retries-exhausted', failureStage: 'source-load' };
  assert.equal((await jobs.parseReportJobRowV1(failedRow)).ok, true, `${label} retries-exhausted with the attempt's stage`);
  const inconsistent = {
    'failed without code': { ...apiRow, status: 'failed', attemptCount: 1 },
    'failed with mismatched stage': { ...apiRow, status: 'failed', attemptCount: 1, failureCode: 'render-error', failureStage: 'request' },
    'accepted with failure code': { ...apiRow, failureCode: 'model-error', failureStage: 'report-model' },
    'accepted after an attempt': { ...apiRow, attemptCount: 1 },
    'source-ready without snapshot': { ...apiRow, status: 'source-ready', attemptCount: 1 },
    'completed without artifact': { ...completedRow, artifactContentSha256: undefined },
    'completed without completion time': { ...completedRow, completedAtUtc: undefined },
    'zero-byte artifact': { ...completedRow, artifactBytes: 0 },
    'e-mail as requester': { ...apiRow, requestedByUserId: 'someone@example.com' },
    'coverage not JSON': { ...completedRow, sourceCoverageSummary: 'not json' },
    'coverage over 8 KiB of UTF-8': { ...completedRow, sourceCoverageSummary: JSON.stringify({ note: 'é'.repeat(4200) }) },
    'definition revision 0': { ...scheduleRow, definitionRevision: 0 },
    'negative attempts': { ...apiRow, status: 'running', attemptCount: -1 },
    'fractional attempts': { ...apiRow, status: 'running', attemptCount: 1.5 },
    'coalesced count on api job': { ...apiRow, coalescedOccurrenceCount: 2 },
    'invalid action group': { ...apiRow, notificationPolicyId: 'ag/1' },
    '57-character company': { ...apiRow, PartitionKey: `${company56}z`, companyId: `${company56}z` },
  };
  for (const [name, row] of Object.entries(inconsistent)) {
    const parsed = await jobs.parseReportJobRowV1(row);
    assert.equal(parsed.ok, false, `${label} inconsistent row accepted: ${name}`);
    assert.equal(parsed.code, 'request-invalid', `${label} ${name}`);
  }

  assert.equal(jobs.isIanaTimeZone('America/Argentina/Buenos_Aires'), true);
  assert.equal(jobs.isIanaTimeZone('Etc/GMT+10'), true);
  return {
    canonical,
    rows: [apiRow, scheduleRow, csRow],
    ids: vectors.map(vector => jobs.buildReverseTime19(vector.instant)),
  };
};

const results = {};
for (const [label, build] of Object.entries(builds)) {
  results[label] = await checkJobs(build, label);
}
assert.deepEqual(JSON.parse(JSON.stringify(results.esm)), JSON.parse(JSON.stringify(results.cjs)), 'CommonJS and ESM outputs differ');
process.stdout.write(`Reporting job contracts verified (${vectors.length} identity vectors, CommonJS and ESM).\n`);
