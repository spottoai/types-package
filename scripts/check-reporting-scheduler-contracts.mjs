import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const variants = [
  ['CJS', require('../dist/reporting/jobs/index.js'), require('../dist/scheduler/index.js')],
  ['ESM', await import('../dist/esm/reporting/jobs/index.js'), await import('../dist/esm/scheduler/index.js')],
];
const companyId = 'comp-report-contract';
const nowUtc = '2026-10-04T01:00:00.000Z';
const spec = {
  schemaVersion: 1,
  reportType: 'sdm',
  scope: { cloudAccountIds: ['ca-1'], subscriptionIds: ['6b1c1f0e-3f2a-4e5b-9c8d-0a1b2c3d4e5f'] },
  period: { kind: 'previous-calendar-month' },
  configuration: { layout: 'spotto-layout', cloudIqServiceProfile: { selectedServiceIds: ['compute'], detailRowLimit: 10 } },
};
let assertions = 0;
for (const [label, jobs, scheduler] of variants) {
  const eq = (actual, expected, description) => {
    assert.equal(actual, expected, `${label}: ${description}`);
    assertions++;
  };
  const request = { schemaVersion: 1, report: spec, notificationPolicyId: 'ag-1' };
  eq(jobs.isReportJobScopeV1(spec.scope), true, 'public scope validator');
  eq(jobs.isReportJobScopeV1({ ...spec.scope, subscriptionIds: ['bad'] }), false, 'invalid public scope');
  eq(
    jobs.isReportJobScopeV1({ ...spec.scope, subscriptionIds: Array(201).fill(spec.scope.subscriptionIds[0]) }),
    false,
    'public projection scope cap'
  );
  eq(jobs.isReportJobPeriodV1({ kind: 'explicit', startDate: '2026-01-01', endDate: '2026-01-31' }), true, 'API explicit period');
  eq(jobs.isReportJobPeriodV1({ kind: 'explicit', startDate: '2026-02-29', endDate: '2026-03-01' }), false, 'calendar period boundary');
  eq(jobs.isReportJobCreateRequestV1(request), true, 'create request');
  for (const bad of [
    null,
    { ...request, schemaVersion: 2 },
    { ...request, recipients: ['a@b.c'] },
    { ...request, notificationPolicyId: '../group' },
    { ...request, report: { ...spec, scope: { ...spec.scope, cloudAccountIds: [] } } },
    { ...request, report: { ...spec, scope: { ...spec.scope, cloudAccountIds: [' ca-1 '] } } },
  ])
    eq(jobs.isReportJobCreateRequestV1(bad), false, 'invalid create request');
  const fingerprint = await jobs.buildReportJobAdmissionFingerprintV1(request);
  eq(
    await jobs.buildReportJobAdmissionFingerprintV1({
      ...request,
      report: { ...spec, scope: { ...spec.scope, cloudAccountIds: ['ca-1', 'ca-1'] } },
    }),
    fingerprint,
    'deduplicated cloud account fingerprint'
  );
  eq(
    fingerprint,
    createHash('sha256')
      .update(JSON.stringify([jobs.serializeReportJobSpecV1(spec), 'ag-1']))
      .digest('hex'),
    'independent admission hash'
  );
  const mixedCase = {
    ...spec,
    scope: { ...spec.scope, subscriptionIds: [spec.scope.subscriptionIds[0].toUpperCase(), spec.scope.subscriptionIds[0]] },
  };
  eq(await jobs.buildReportJobAdmissionFingerprintV1({ ...request, report: mixedCase }), fingerprint, 'normalized fingerprint');
  for (const changed of [
    { ...request, notificationPolicyId: undefined },
    { ...request, notificationPolicyId: 'ag-2' },
    { ...request, report: { ...spec, configuration: { ...spec.configuration, layout: 'monthly-insights' } } },
  ])
    eq((await jobs.buildReportJobAdmissionFingerprintV1(changed)) === fingerprint, false, 'complete duplicate identity');
  eq(jobs.isReportJobIdempotencyKey('retry-1:abc'), true, 'opaque idempotency key');
  for (const key of ['', 'x'.repeat(201), 'a\nb', 'a@b.c']) eq(jobs.isReportJobIdempotencyKey(key), false, 'invalid key');
  const accepted = await jobs.buildReportJobRowV1({
    trigger: 'api',
    companyId,
    spec,
    fileName: 'report.docx',
    requestedAtUtc: '2026-10-04T00:00:00.000Z',
    notificationPolicyId: 'ag-1',
  });
  const response = await jobs.buildReportJobCreateResponseV1(accepted);
  await assert.rejects(
    () =>
      jobs.buildReportJobRowV1({
        trigger: 'schedule',
        companyId,
        scheduleId: 'sched-1',
        definitionRevision: 1,
        scheduledForUtc: nowUtc,
        requestedAtUtc: nowUtc,
        fileName: 'report.docx',
        spec: { ...spec, period: { kind: 'explicit', startDate: '2026-01-01', endDate: '2026-01-31' } },
      }),
    /schedule jobs require a period rule/
  );
  assertions++;
  eq(jobs.isReportJobCreateResponseV1(response), true, 'create response');
  eq(jobs.isReportJobCreateResponseV1({ ...response, statusUrl: 'https://evil.invalid' }), false, 'external status URL');
  const running = {
    ...accepted,
    status: 'running',
    attemptCount: 1,
    leaseOwner: 'worker-1',
    leaseExpiresAtUtc: '2026-10-04T01:10:00.000Z',
    startedAtUtc: nowUtc,
    lastAttemptAtUtc: nowUtc,
  };
  const sourceReady = {
    ...running,
    status: 'source-ready',
    sourceObservedAtUtc: nowUtc,
    sourceSnapshotSha256: 'a'.repeat(64),
    sourceCoverageSummary: '{"ready":1}',
  };
  const generated = { ...sourceReady, status: 'generated', generatedAtUtc: nowUtc, artifactContentSha256: 'b'.repeat(64), artifactBytes: 1024 };
  const pending = { ...generated, notificationStatus: 'pending' };
  const completed = {
    ...pending,
    status: 'completed',
    completedAtUtc: nowUtc,
    notificationStatus: 'delivered',
    notificationAttemptCount: 1,
    notificationCompletedAtUtc: nowUtc,
    notificationDestinationCounts: '{"email":{"total":2,"delivered":2,"failed":0}}',
  };
  for (const row of [accepted, running, sourceReady, generated, pending]) {
    const projection = await jobs.buildReportJobProjectionV1(row);
    eq(jobs.isReportJobProjectionV1(projection), true, 'safe public projection');
    eq(
      'requestJson' in projection || 'leaseOwner' in projection || 'configuration' in projection || 'downloadUrl' in projection,
      false,
      'private fields/download hidden until complete'
    );
  }
  const projection = await jobs.buildReportJobProjectionV1(completed);
  eq(projection.downloadUrl, `/companies/${companyId}/reporting/reports/${completed.jobId}`, 'authenticated download');
  for (const bad of [
    { ...projection, requestJson: accepted.requestJson },
    { ...projection, blobPath: 'internal' },
    { ...projection, downloadUrl: 'https://evil.invalid' },
    { ...projection, failureCode: 'model-error' },
    { ...projection, notificationDestinationCounts: { email: { total: 1, delivered: 1, failed: 0, address: 'a@b.c' } } },
  ])
    eq(jobs.isReportJobProjectionV1(bad), false, 'unsafe projection rejected');
  eq(jobs.isReportJobListResponseV1({ results: [projection], continuation: { cursor: 'opaque-token' } }), true, 'list response');
  for (const bad of [
    { results: Array(101).fill(projection) },
    { results: [projection], continuation: { cursor: '' } },
    { results: [projection], internal: true },
  ])
    eq(jobs.isReportJobListResponseV1(bad), false, 'bounded list');
  eq(jobs.isReportJobListQueryV1({ status: 'generated', pageSize: 100, trigger: 'api', reportType: 'sdm' }), true, 'list query');
  for (const bad of [
    { pageSize: 101 },
    { pageSize: '20' },
    { cursor: 'x'.repeat(2001) },
    { status: 'unknown' },
    { companyId },
    { scheduleId: '../x' },
  ])
    eq(jobs.isReportJobListQueryV1(bad), false, 'bad list query');
  for (const row of [accepted, running, sourceReady, { ...generated, notificationPolicyId: undefined }])
    eq(jobs.consumesReportJobApiGenerationSlot(row), true, 'generation admission slot');
  for (const row of [generated, pending, completed, { ...accepted, trigger: 'schedule' }, { ...accepted, status: 'failed' }])
    eq(jobs.consumesReportJobApiGenerationSlot(row), false, 'released/non-API slot');

  const common = { expectedEtag: 'W/"v1"', actualEtag: 'W/"v1"', nowUtc };
  const worker = { ...common, writer: 'worker', workerId: 'worker-1' };
  const notifier = { ...common, writer: 'notifier', verifiedArtifactContentSha256: generated.artifactContentSha256 };
  const update = async (before, after, context, expected, description) =>
    eq((await jobs.validateReportJobUpdateV1(before, after, context)).ok, expected, description);
  for (const [before, after] of [
    [accepted, running],
    [running, sourceReady],
    [sourceReady, generated],
    [generated, pending],
  ])
    await update(before, after, worker, true, 'worker milestone');
  const renewed = { ...running, leaseExpiresAtUtc: '2026-10-04T01:20:00.000Z' };
  await update(running, renewed, worker, true, 'lease renewal');
  await update(
    sourceReady,
    {
      ...sourceReady,
      attemptCount: 2,
      leaseOwner: 'worker-2',
      leaseExpiresAtUtc: '2026-10-04T01:30:00.000Z',
      lastAttemptAtUtc: '2026-10-04T01:11:00.000Z',
    },
    { ...worker, workerId: 'worker-2', nowUtc: '2026-10-04T01:11:00.000Z' },
    true,
    'expired retry retains source milestone'
  );
  for (const [before, after, context] of [
    [accepted, { ...running, sourceSnapshotSha256: 'a'.repeat(64), sourceObservedAtUtc: nowUtc }, worker],
    [pending, { ...pending, status: 'failed', failureCode: 'artifact-integrity', failureStage: 'artifact-persist' }, worker],
    [running, { ...sourceReady, lastAttemptAtUtc: '2026-10-04T01:01:00.000Z' }, worker],
    [
      pending,
      {
        ...completed,
        status: 'completed-with-notification-errors',
        notificationStatus: 'attachment-too-large',
        notificationDestinationCounts: '{"email":{"total":2,"delivered":0,"failed":2}}',
      },
      notifier,
    ],
    [accepted, running, { ...worker, expectedEtag: 'stale' }],
    [accepted, running, { ...worker, expectedEtag: '*', actualEtag: '*' }],
    [running, sourceReady, { ...worker, workerId: 'worker-2' }],
    [running, sourceReady, { ...worker, nowUtc: '2026-10-04T01:11:00.000Z' }],
    [sourceReady, running, worker],
    [accepted, generated, worker],
    [running, { ...sourceReady, fileName: 'other.docx' }, worker],
    [generated, { ...generated, sourceSnapshotSha256: 'c'.repeat(64) }, worker],
    [generated, { ...generated, artifactContentSha256: 'c'.repeat(64) }, worker],
    [generated, completed, worker],
    [pending, completed, { ...notifier, verifiedArtifactContentSha256: 'c'.repeat(64) }],
    [pending, { ...completed, attemptCount: 2 }, notifier],
    [completed, pending, notifier],
    [pending, { ...completed, notificationDestinationCounts: '{"email":{"total":2,"delivered":1,"failed":0}}' }, notifier],
  ])
    await update(before, after, context, false, 'invalid writer/milestone/fence');
  await update(pending, completed, notifier, true, 'notifier completion');
  const partial = {
    ...completed,
    status: 'completed-with-notification-errors',
    notificationStatus: 'partially-delivered',
    notificationDestinationCounts: '{"email":{"total":2,"delivered":1,"failed":1}}',
  };
  await update(pending, partial, notifier, true, 'partial delivery preserves artifact');
  await update(
    pending,
    { ...completed, status: 'completed-with-notification-errors', notificationStatus: 'attachment-too-large' },
    notifier,
    true,
    'link-only attachment fallback'
  );
  await update(
    pending,
    { ...completed, status: 'completed-with-notification-errors', notificationStatus: 'failed', notificationDestinationCounts: undefined },
    notifier,
    true,
    'policy/config resolution failure'
  );
  const generationFailed = { ...running, status: 'failed', failureCode: 'source-invalid', failureStage: 'source-load' };
  await update(running, generationFailed, worker, true, 'worker failure');
  await update(generationFailed, completed, notifier, false, 'failed generation cannot complete');
  const rejected = { ...accepted, status: 'failed', failureCode: 'publication-rejected', failureStage: 'request' };
  const producer = { ...common, writer: 'producer' };
  await update(accepted, rejected, producer, false, 'ambiguous publication is not rejection');
  await update(accepted, rejected, { ...producer, publicationOutcome: 'definitively-rejected' }, true, 'proven publication rejection');
  await update(
    running,
    { ...running, status: 'failed', failureCode: 'publication-rejected', failureStage: 'request' },
    { ...producer, publicationOutcome: 'definitively-rejected' },
    false,
    'producer cannot fail dispatched job'
  );
  const maintenance = { ...common, writer: 'maintenance', minimumAgeMs: 60000, recoveryAttempts: 3, maximumRecoveryAttempts: 3 };
  const stranded = { ...sourceReady, leaseOwner: undefined, leaseExpiresAtUtc: undefined };
  const failed = { ...stranded, status: 'failed', failureCode: 'recovery-exhausted', failureStage: 'source-load' };
  await update(stranded, failed, maintenance, true, 'bounded stranded failure');
  for (const [before, after, context] of [
    [sourceReady, failed, maintenance],
    [stranded, failed, { ...maintenance, recoveryAttempts: 2 }],
    [stranded, failed, { ...maintenance, minimumAgeMs: 7200000 }],
    [
      pending,
      {
        ...pending,
        status: 'failed',
        failureCode: 'recovery-exhausted',
        failureStage: 'notification',
        leaseOwner: undefined,
        leaseExpiresAtUtc: undefined,
      },
      { ...maintenance, nowUtc: '2026-10-04T02:00:00.000Z' },
    ],
  ])
    await update(before, after, context, false, 'maintenance fence');
  eq((await jobs.parseReportJobRowV1({ ...sourceReady, sourceCoverageSummary: '[]' })).ok, false, 'coverage must be object');
  for (const counts of [
    { email: { total: 33, delivered: 0, failed: 0 } },
    { jira: { total: 1, delivered: 0, failed: 0 } },
    { email: { total: 1, delivered: 1, failed: 1 } },
    { email: { total: 20, delivered: 0, failed: 0 }, slack: { total: 20, delivered: 0, failed: 0 } },
    {},
    { email: { total: 1, delivered: 0, failed: 0, address: 'a@b.c' } },
  ])
    eq(jobs.isReportJobNotificationDestinationCountsV1(counts), false, 'safe bounded aggregates');
  const message = jobs.createReportJobNotificationRequestedV1({
    companyId,
    jobId: generated.jobId,
    artifactContentSha256: generated.artifactContentSha256,
  });
  eq(jobs.isReportJobNotificationRequestedV1(message), true, 'notification pointer');
  for (const bad of [
    { ...message, recipients: ['a@b.c'] },
    { ...message, artifactContentSha256: 'bad' },
    { ...message, schemaVersion: 2 },
    { ...message, companyId: '' },
  ])
    eq(jobs.isReportJobNotificationRequestedV1(bad), false, 'invalid notification pointer');
  const longestId = jobs.buildReportJobId({ instant: nowUtc, reportType: 'architecture-assessment', scopeHash: 'a'.repeat(16) });
  const broker = await jobs.buildReportJobNotificationBrokerProperties({ ...message, companyId: 'a'.repeat(56), jobId: longestId });
  eq(broker.messageId.length, 78, 'longest notification ID bounded');
  eq(
    broker.messageId,
    `report-notify:${createHash('sha256')
      .update(JSON.stringify(['a'.repeat(56), longestId]))
      .digest('hex')}`,
    'independent notification identity'
  );
  eq((await jobs.buildReportJobNotificationMessageId(companyId, longestId)) === broker.messageId, false, 'company isolation in broker ID');

  const definition = {
    definitionType: 'report-generation',
    name: 'Monthly SDM',
    timezone: 'Pacific/Auckland',
    timing: { triggerType: 'recurring', cadence: 'monthly', localTime: '09:00', dayOfMonth: 'last' },
    report: spec,
    notificationPolicyId: 'ag-1',
    initialMode: 'active',
  };
  for (const timing of [
    definition.timing,
    { triggerType: 'once', localDateTime: '2028-02-29T09:00' },
    { triggerType: 'recurring', cadence: 'daily', localTime: '00:00' },
    { triggerType: 'recurring', cadence: 'weekly', dayOfWeek: 0, localTime: '23:59' },
    { triggerType: 'recurring', cadence: 'quarterly', dayOfMonth: 31, localTime: '09:00' },
  ])
    eq(scheduler.isScheduleWriteRequest({ ...definition, timing }), true, 'generic report timing');
  for (const bad of [
    { ...definition, timezone: 'Invalid/Zone' },
    { ...definition, providerScopeId: 'fake' },
    { ...definition, report: { ...spec, period: { kind: 'explicit', startDate: '2026-01-01', endDate: '2026-01-31' } } },
    ...[
      { triggerType: 'once', localDateTime: '2026-02-29T09:00' },
      { triggerType: 'recurring', cadence: 'daily', localTime: '24:00' },
      { triggerType: 'recurring', cadence: 'weekly', localTime: '09:00', dayOfWeek: 7 },
      { triggerType: 'recurring', cadence: 'monthly', localTime: '09:00', dayOfMonth: 0 },
      { triggerType: 'recurring', cadence: 'quarterly', localTime: '09:00', dayOfMonth: 32 },
      { triggerType: 'recurring', cadence: 'daily', localTime: '09:00', dayOfMonth: 1 },
    ].map(timing => ({ ...definition, timing })),
  ])
    eq(scheduler.isScheduleWriteRequest(bad), false, 'invalid report schedule');
  eq(scheduler.isScheduleMutationRequest({ definition }), true, 'report mutation');
  for (const command of ['pause', 'resume'])
    eq(scheduler.isReportGenerationScheduleCommand({ command, idempotencyKey: 'retry-1' }), true, 'report lifecycle command');
  for (const bad of [
    { command: 'override', idempotencyKey: 'retry-1' },
    { command: 'pause', idempotencyKey: '' },
    { command: 'pause', idempotencyKey: 'x'.repeat(201) },
    { command: 'pause', idempotencyKey: 'retry-1', resourceId: 'fake' },
  ])
    eq(scheduler.isReportGenerationScheduleCommand(bad), false, 'invalid report lifecycle command');
  const validConsent = { version: 'v1', contentHash: 'digest', orderedGrantGroupHashes: ['grant-1'] };
  eq(scheduler.isResourceSchedulePermissionManifestConsent(validConsent), true, 'otherwise valid resource consent');
  eq(scheduler.isScheduleMutationRequest({ definition, permissionConsent: validConsent }), false, 'report rejects valid resource consent');
  eq(scheduler.isScheduleMutationRequest({ definition, permissionConsent: {} }), false, 'report forbids permission manifest');
  const occurrence = {
    schemaVersion: 1,
    definitionType: 'report-generation',
    companyId,
    scheduleId: 'sched-1',
    definitionRevision: 1,
    controlGeneration: 1,
    occurrenceKey: 'occ-1',
    scheduleRunId: 'run-1',
    dueAtUtc: nowUtc,
    report: spec,
    correlationId: 'corr-1',
    coalescedOccurrenceCount: 3,
  };
  eq(scheduler.isScheduledOccurrenceV1(occurrence), true, 'non-resource generic occurrence');
  for (const bad of [
    { ...occurrence, cloudAccountId: 'fake' },
    { ...occurrence, controlGeneration: 0 },
    { ...occurrence, dueAtUtc: '2026-10-04T01:00:00+00:00' },
    { ...occurrence, coalescedOccurrenceCount: 0 },
  ])
    eq(scheduler.isScheduledOccurrenceV1(bad), false, 'invalid occurrence');
  const scheduleProjection = {
    scheduleId: 'sched-1',
    definitionRevision: 1,
    controlGeneration: 1,
    etag: 'v1',
    status: 'active',
    definition,
    createdAtUtc: nowUtc,
    updatedAtUtc: nowUtc,
    createdBy: 'user-1',
    updatedBy: 'user-1',
    lastOccurrenceAtUtc: nowUtc,
    lastOccurrenceOutcome: 'accepted',
    lastJobId: generated.jobId,
  };
  eq(scheduler.isScheduleProjection(scheduleProjection), true, 'accepted dispatch projection');
  eq(scheduler.isScheduleListResponse({ results: [scheduleProjection] }), true, 'generic report list');
  for (const bad of [
    { ...scheduleProjection, lastJobId: undefined },
    { ...scheduleProjection, lastOccurrenceOutcome: 'succeeded' },
    { ...scheduleProjection, lastOccurrenceAtUtc: undefined },
    { ...scheduleProjection, lastOccurrenceOutcome: 'skipped' },
  ])
    eq(scheduler.isScheduleProjection(bad), false, 'dispatch outcome consistency');
  const control = {
    schemaVersion: 1,
    entity: 'scheduler',
    action: 'control',
    companyId,
    cloudAccountId: '',
    tenantId: '',
    clientId: '',
    operationId: 'op-1',
    requestedAtUtc: nowUtc,
    actorId: 'user-1',
    correlationId: 'corr-1',
    command: { commandType: 'create-schedule', definition, idempotencyKey: 'retry-1' },
  };
  eq(scheduler.isSchedulerControlRequestMessageV1(control), true, 'generic non-resource control');
  eq(
    scheduler.isSchedulerControlRequestMessageV1({ ...control, command: { ...control.command, permissionConsent: validConsent } }),
    false,
    'report control rejects valid resource consent'
  );
  eq(
    scheduler.isSchedulerControlRequestMessageV1({ ...control, command: { ...control.command, permissionConsent: {} } }),
    false,
    'control forbids report consent'
  );
  eq(
    scheduler.isSchedulerOperationProjection({
      schemaVersion: 1,
      companyId,
      operationId: 'op-1',
      operationType: 'create-schedule',
      submittedAtUtc: nowUtc,
      updatedAtUtc: nowUtc,
      completedAtUtc: nowUtc,
      status: 'succeeded',
      result: { resultType: 'schedule', schedule: scheduleProjection },
    }),
    true,
    'generic report operation result'
  );
}
process.stdout.write(`Reporting Part B contracts verified: ${assertions} assertions across CJS and ESM.\n`);
