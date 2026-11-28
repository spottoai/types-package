// Contract checks for the health-check report type and the AI Assistant job block
// (core/specs/reporting/generation/background-report-generation/background-report-generation-ai-assistant.md).
// Runs against the built CommonJS and ESM outputs.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const builds = {
  cjs: {
    jobs: require(join(packageRoot, 'dist', 'reporting', 'jobs', 'index.js')),
    scheduler: require(join(packageRoot, 'dist', 'scheduler', 'reportGenerationValidation.js')),
  },
  esm: {
    jobs: await import(pathToFileURL(join(packageRoot, 'dist', 'esm', 'reporting', 'jobs', 'index.js')).href),
    scheduler: await import(pathToFileURL(join(packageRoot, 'dist', 'esm', 'scheduler', 'reportGenerationValidation.js')).href),
  },
};

const SUB = '6b1c1f0e-3f2a-4e5b-9c8d-0a1b2c3d4e5f';
const ACCOUNT = 'gdap-9f8e7d6c-5b4a-4938-8271-605f4e3d2c1b';
const scope = { cloudAccountIds: [ACCOUNT], subscriptionIds: [SUB.toUpperCase()] };
const healthCheck = (extra = {}) => ({ schemaVersion: 1, reportType: 'health-check', scope, configuration: { scopeCurrencyCode: 'nzd' }, ...extra });
const sdm = (extra = {}) => ({
  schemaVersion: 1,
  reportType: 'sdm',
  scope,
  period: { kind: 'previous-calendar-month' },
  configuration: { layout: 'spotto-layout', cloudIqServiceProfile: { selectedServiceIds: [] } },
  ...extra,
});

for (const [label, { jobs, scheduler }] of Object.entries(builds)) {
  // Health check: normalised, canonical and a .pptx artifact.
  const plain = jobs.parseReportJobSpecV1(healthCheck());
  assert.equal(plain.ok, true, `${label}: health check rejected`);
  assert.equal(plain.value.configuration.scopeCurrencyCode, 'NZD');
  assert.deepEqual(plain.value.scope.subscriptionIds, [SUB]);
  const json = jobs.serializeReportJobSpecV1(healthCheck({ configuration: { preparedBy: ' Example MSP ', scopeCurrencyCode: 'NZD' } }));
  assert.equal(json, `{"schemaVersion":1,"reportType":"health-check","scope":{"cloudAccountIds":["${ACCOUNT}"],"subscriptionIds":["${SUB}"]},"configuration":{"scopeCurrencyCode":"NZD","preparedBy":"Example MSP"}}`);
  assert.equal(jobs.parseReportJobRequestJson(json).ok, true);
  assert.equal(jobs.reportJobFileExtension('health-check'), '.pptx');
  assert.equal(jobs.reportJobContentType('health-check'), 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
  assert.equal(jobs.reportJobFileExtension('sdm'), '.docx');
  assert.equal(jobs.isReportJobId(`${jobs.buildReverseTime19('2026-11-28T00:00:00.000Z')}-health-check-3f9a2c1d7e5b8a40`), true);
  assert.equal(jobs.parseReportJobSpecV1(healthCheck({ configuration: { scopeCurrencyCode: 'NZD', audience: 'customer' } })).ok, false, `${label}: unknown config key`);
  assert.equal(jobs.parseReportJobSpecV1(healthCheck({ period: { kind: 'previous-calendar-month' } })).ok, false, `${label}: health check has no period`);

  // AI block: frozen briefing, canonical key order, part of the request identity.
  const ai = { research: true, briefing: 'CFO briefing.\nOpen with verified savings.', briefingSource: 'run' };
  const withAi = jobs.serializeReportJobSpecV1(healthCheck({ ai }));
  assert.match(withAi, /"ai":\{"briefing":"CFO briefing\.\\nOpen with verified savings\.","briefingSource":"run","research":true\}\}$/);
  assert.notEqual(withAi, jobs.serializeReportJobSpecV1(healthCheck({ ai: { ...ai, briefing: 'Another focus' } })), `${label}: briefing must change identity`);
  assert.equal(jobs.parseReportJobRequestJson(withAi).ok, true);
  assert.equal(jobs.parseReportJobSpecV1(sdm({ ai: { briefingSource: 'spotto-default', research: false } })).ok, true, `${label}: sdm AI default`);
  assert.equal(
    jobs.parseReportJobSpecV1(healthCheck({ ai: { briefingSource: 'saved', savedBriefingId: 'brief_01', briefing: 'Saved text', research: false } })).ok,
    true,
    `${label}: saved briefing`,
  );

  const rejected = [
    ['architecture-assessment does not take AI', { ...healthCheck(), reportType: 'report-pack', configuration: { reportIds: ['security'], scopeCurrencyCode: 'NZD' }, ai: { briefingSource: 'spotto-default', research: false } }],
    ['default with text', healthCheck({ ai: { briefingSource: 'spotto-default', briefing: 'x', research: false } })],
    ['run without text', healthCheck({ ai: { briefingSource: 'run', research: false } })],
    ['saved without id', healthCheck({ ai: { briefingSource: 'saved', briefing: 'x', research: false } })],
    ['id on a run briefing', healthCheck({ ai: { briefingSource: 'run', briefing: 'x', savedBriefingId: 'b1', research: false } })],
    ['untrimmed text', healthCheck({ ai: { briefingSource: 'run', briefing: ' x', research: false } })],
    ['control character', healthCheck({ ai: { briefingSource: 'run', briefing: 'a\u0007b', research: false } })],
    ['too long', healthCheck({ ai: { briefingSource: 'run', briefing: 'x'.repeat(jobs.REPORT_JOB_AI_BRIEFING_MAX_CHARS + 1), research: false } })],
    ['research not boolean', healthCheck({ ai: { briefingSource: 'spotto-default', research: 'yes' } })],
    ['unknown key', healthCheck({ ai: { briefingSource: 'spotto-default', research: false, model: 'gpt' } })],
  ];
  for (const [name, spec] of rejected) assert.equal(jobs.parseReportJobSpecV1(spec).ok, false, `${label}: accepted ${name}`);

  // Scheduled AI runs require separate qualification.
  assert.equal(scheduler.isScheduledReportJobSpecV1(healthCheck()), false, `${label}: scheduled health check`);
  assert.equal(scheduler.isScheduledReportJobSpecV1(healthCheck({ ai: { briefingSource: 'spotto-default', research: false } })), false, `${label}: scheduled AI`);
  const rowIdentity = { companyId: 'company-1', requestedAtUtc: '2026-11-28T00:00:00.000Z', requestedByUserId: 'user-1' };
  const scheduleIdentity = { ...rowIdentity, trigger: 'schedule', scheduleId: 'schedule-1', definitionRevision: 1, scheduledForUtc: rowIdentity.requestedAtUtc };
  await assert.rejects(jobs.buildReportJobRowV1({ ...scheduleIdentity, spec: healthCheck(), fileName: 'health-check.pptx' }), /on-demand generation/);
  await assert.rejects(jobs.buildReportJobRowV1({ ...scheduleIdentity, spec: sdm({ ai }), fileName: 'report.docx' }), /on-demand generation/);
  const standardRow = await jobs.buildReportJobRowV1({ ...rowIdentity, trigger: 'api', spec: healthCheck(), fileName: 'health-check.pptx' });
  const enhancedRow = await jobs.buildReportJobRowV1({ ...rowIdentity, trigger: 'api', spec: healthCheck({ ai }), fileName: 'health-check.pptx' });
  assert.equal((await jobs.parseReportJobRowV1({ ...standardRow, aiOutcome: 'enhanced' })).ok, false, `${label}: standard row carries an AI outcome`);
  assert.equal((await jobs.parseReportJobRowV1({ ...enhancedRow, aiOutcome: 'enhanced' })).ok, false, `${label}: ungenerated row carries an AI outcome`);

  // Create requests: clients send `ai`, never a frozen `report.ai`.
  const create = (extra = {}) => ({ schemaVersion: 1, report: healthCheck(), ...extra });
  assert.equal(jobs.parseReportJobCreateRequestV1(create({ ai: { briefing: 'Focus', research: false } })).ok, true, `${label}: create with ai`);
  assert.equal(jobs.parseReportJobCreateRequestV1(create({ ai: {} })).ok, true, `${label}: create with defaults`);
  assert.equal(
    jobs.parseReportJobCreateRequestV1({ schemaVersion: 1, report: healthCheck({ ai: { briefingSource: 'spotto-default', research: false } }) }).ok,
    false,
    `${label}: client-frozen report.ai`,
  );
  assert.equal(jobs.parseReportJobCreateRequestV1(create({ ai: { briefing: 'a', savedBriefingId: 'b1' } })).ok, false, `${label}: text and saved id`);
  assert.equal(
    jobs.parseReportJobCreateRequestV1({ schemaVersion: 1, report: { ...healthCheck(), reportType: 'report-pack', configuration: { reportIds: ['security'], scopeCurrencyCode: 'NZD' } }, ai: {} }).ok,
    false,
    `${label}: ai on report pack`,
  );
  const plainFingerprint = await jobs.buildReportJobAdmissionFingerprintV1(create());
  assert.notEqual(plainFingerprint, await jobs.buildReportJobAdmissionFingerprintV1(create({ ai: {} })), `${label}: ai changes the fingerprint`);

  // Saved briefing writes.
  assert.equal(jobs.isReportAiSavedBriefingWriteV1({ reportType: 'health-check', name: 'CFO', text: 'Open with savings' }), true);
  assert.equal(jobs.isReportAiSavedBriefingWriteV1({ reportType: 'report-pack', name: 'CFO', text: 'x' }), false);
  assert.equal(jobs.isReportAiSavedBriefingWriteV1({ reportType: 'sdm', name: 'x'.repeat(81), text: 'x' }), false);
}
process.stdout.write('Reporting job AI and health-check contracts verified (CommonJS and ESM).\n');
for (const { jobs } of Object.values(builds)) {
  assert.equal(jobs.isReportFileName('Contoso-Health-Check.pptx'), true);
  assert.equal(jobs.isReportFileName('.pptx'), false);
  assert.equal(jobs.isReportFileName('report.docx'), true);
  assert.equal(jobs.isReportFileName('pack.zip'), true);
}
