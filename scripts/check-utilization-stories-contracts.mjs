// Contract check for the utilization stories family (Specs/reporting/utilization-stories-types-package.md).
// Positive fixtures carry synthetic identifiers and names (metric shapes come from an anonymised engine sample);
// negatives apply one patch per rejection rule.
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORY_KEYS,
  STORY_LIMITS,
  isProtectionProfile,
  isReportingStories,
  isResilienceProfileConfig,
  isStoryArtifact,
  isStoryFingerprintRows,
  isResilienceFactsItem,
  isResilienceFactsProjection,
  isStorySample,
  isUtilizationProfile,
  isUtilizationProfileConfig,
  isUtilizationSignal,
} from '../dist/index.js';

const fixtureDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'utilization-stories');
const readFixture = async name => JSON.parse(await readFile(join(fixtureDir, `${name}.json`), 'utf8'));
const clone = value => structuredClone(value);

const guards = {
  isStoryArtifact,
  isStorySample,
  isReportingStories,
  isUtilizationProfile,
  isUtilizationSignal,
  isProtectionProfile,
  isUtilizationProfileConfig,
  isResilienceProfileConfig,
};

assert.deepEqual(
  [...STORY_KEYS],
  ['oversized-resources', 'right-sku', 'schedule-candidates', 'resilience-recovery', 'hybrid-benefit', 'commitments']
);
assert.deepEqual(STORY_LIMITS, {
  sectionRows: 1000,
  sampleRows: 50,
  windowDays: 30,
  weeklyGridDays: 7,
  weeklyGridHours: 24,
  historyFingerprints: 2000,
});

// ---- Positive: one artifact per story key, validated with and without the expected key.
const artifacts = {};
for (const storyKey of STORY_KEYS) {
  const artifact = await readFixture(storyKey);
  artifacts[storyKey] = artifact;
  assert.equal(artifact.storyKey, storyKey, `${storyKey}: fixture carries its own key`);
  assert.equal(isStoryArtifact(artifact), true, `${storyKey}: artifact accepted`);
  assert.equal(isStoryArtifact(artifact, storyKey), true, `${storyKey}: artifact accepted for its key`);
  const otherKey = STORY_KEYS.find(key => key !== storyKey);
  assert.equal(isStoryArtifact(artifact, otherKey), false, `${storyKey}: artifact rejected for ${otherKey}`);
  assert.equal(artifact.window.days, STORY_LIMITS.windowDays, `${storyKey}: fixture window is the default window`);
  assert.ok(artifact.sections.length > 0 && artifact.sections.every(section => section.rows.length > 0), `${storyKey}: every section has rows`);
  for (const section of artifact.sections) {
    assert.ok(section.rows.length <= STORY_LIMITS.sectionRows);
    assert.equal(section.totalCount, section.rows.length + section.omittedCount);
    for (const row of section.rows) {
      for (const column of section.columns) {
        assert.equal(
          row.cells[column.key]?.kind,
          column.cell,
          `${storyKey}/${section.resourceType}/${row.name}: cell ${column.key} is a ${column.cell}`
        );
      }
      if (row.profile) assert.equal(isUtilizationProfile(row.profile, artifact.window.days), true, `${storyKey}: ${row.name} profile accepted`);
      if (row.protection) assert.equal(isProtectionProfile(row.protection), true, `${storyKey}: ${row.name} protection accepted`);
    }
  }
  // A bounded sample of the artifact is a valid evidence-pack sample.
  const sample = {
    summary: artifact.summary,
    sections: artifact.sections.map(section => {
      const rows = section.rows.slice(0, STORY_LIMITS.sampleRows);
      return { ...section, rows, omittedCount: section.totalCount - rows.length };
    }),
  };
  assert.equal(isStorySample(sample, storyKey), true, `${storyKey}: derived sample accepted`);
  assert.equal(isReportingStories({ [storyKey]: sample }), true, `${storyKey}: reporting.stories entry accepted`);
}

// Schedule candidates carry a corroborated weekly running profile and a schedule action.
for (const section of artifacts['schedule-candidates'].sections) {
  for (const row of section.rows) {
    assert.ok(row.profile.running?.weekly, `schedule candidate ${row.name} has a weekly profile`);
    assert.ok(
      row.profile.running.basis !== 'metric-presence' || row.profile.running.corroboration.length > 0,
      `schedule candidate ${row.name} is corroborated`
    );
    assert.ok(['good', 'fair', 'low'].includes(row.profile.scheduleFit));
  }
}

// ---- Positive: evidence-pack sample, signal, engine config files.
const reportingStories = await readFixture('reporting-stories');
assert.equal(isReportingStories(reportingStories), true, 'reporting.stories fixture accepted');
assert.equal(isReportingStories({}), true, 'empty reporting.stories accepted');
for (const [storyKey, sample] of Object.entries(reportingStories)) {
  assert.ok(
    sample.sections.every(section => section.rows.length <= STORY_LIMITS.sampleRows),
    `${storyKey}: sample bounded`
  );
}
assert.equal(isUtilizationSignal(await readFixture('utilization-signal')), true, 'utilization signal accepted');
assert.equal(isUtilizationProfileConfig(await readFixture('utilization-profiles.config')), true, 'utilization profile config accepted');
assert.equal(isResilienceProfileConfig(await readFixture('resilience-profiles.config')), true, 'resilience profile config accepted');

// ---- History fingerprints: derived from the artifacts, bounded and unique per (storyKey, fingerprint).
const fingerprintRows = STORY_KEYS.flatMap(storyKey =>
  artifacts[storyKey].sections.flatMap(section =>
    section.rows.map(row => ({ storyKey, resourceId: row.resourceId, fingerprint: row.fingerprint, savingsMax: row.savingsMax }))
  )
);
const fingerprints = { totalCount: fingerprintRows.length, rows: fingerprintRows, omittedCount: 0 };
assert.equal(isStoryFingerprintRows(fingerprints), true, 'story fingerprints accepted');
assert.equal(isStoryFingerprintRows({ totalCount: 0, rows: [], omittedCount: 0 }), true, 'empty story fingerprints accepted');
assert.equal(
  isStoryFingerprintRows({ ...fingerprints, rows: [...fingerprintRows, fingerprintRows[0]], totalCount: fingerprintRows.length + 1 }),
  false,
  'duplicate fingerprint rejected'
);
assert.equal(
  isStoryFingerprintRows({ ...fingerprints, rows: [{ ...fingerprintRows[0], storyKey: 'oversized-vms' }], totalCount: 1 }),
  false,
  'unknown story key rejected'
);
assert.equal(
  isStoryFingerprintRows({ ...fingerprints, rows: [{ ...fingerprintRows[0], savingsMax: 'lots' }], totalCount: 1 }),
  false,
  'non-numeric saving rejected'
);
assert.equal(isStoryFingerprintRows({ ...fingerprints, totalCount: fingerprintRows.length + 1 }), false, 'inconsistent bounded counts rejected');

// ---- Resilience facts (Task 9 collection): storage blob-service / SQL retention facts consumed by the resilience story.
const facts = {
  schemaVersion: 1,
  source: 'AzureResilienceFacts',
  subscriptionId: artifacts['oversized-resources'].scope.subscriptionId,
  generatedAt: '2026-09-12T01:00:00.000Z',
  summary: { storageAccounts: 1, sqlDatabases: 1, sqlServers: 1, collected: 2, partial: 0, failed: 0, requestCount: 5 },
  items: [
    {
      resourceId: '/subscriptions/x/resourcegroups/rg-fixture-dev/providers/microsoft.storage/storageaccounts/stdev01',
      resourceType: 'microsoft.storage/storageaccounts',
      status: 'collected',
      observedAt: '2026-09-12T01:00:00.000Z',
      requestCount: 2,
      storage: {
        blobSoftDelete: { enabled: true, days: 14 },
        containerSoftDelete: null,
        versioning: false,
        changeFeed: { enabled: false },
        pointInTimeRestore: null,
        managementPolicy: { present: false },
      },
    },
    {
      resourceId: '/subscriptions/x/resourcegroups/rg-fixture-dev/providers/microsoft.sql/servers/sql-dev-01/databases/sqldb-dev-01',
      resourceType: 'microsoft.sql/servers/databases',
      status: 'partial',
      observedAt: '2026-09-12T01:00:00.000Z',
      requestCount: 3,
      errors: ['long-term retention read failed'],
      sql: { shortTermRetentionDays: 7, diffBackupIntervalHours: 12, longTermRetention: null, failoverGroup: null },
    },
  ],
  issues: [{ severity: 'warning', code: 'sql_ltr_failed', message: 'long-term retention read failed' }],
};
assert.equal(isResilienceFactsProjection(facts), true, 'resilience facts accepted');
assert.equal(facts.items.every(isResilienceFactsItem), true, 'resilience facts items accepted');
assert.equal(isResilienceFactsProjection({ ...facts, source: 'Other' }), false, 'resilience facts: source rejected');
assert.equal(isResilienceFactsItem({ ...facts.items[0], status: 'done' }), false, 'resilience facts: unknown status rejected');
assert.equal(
  isResilienceFactsItem({ ...facts.items[0], storage: { ...facts.items[0].storage, versioning: 'yes' } }),
  false,
  'resilience facts: non-boolean versioning rejected'
);
assert.equal(
  isResilienceFactsItem({ ...facts.items[1], sql: { ...facts.items[1].sql, shortTermRetentionDays: '7' } }),
  false,
  'resilience facts: non-numeric retention rejected'
);

// ---- Additive fields are tolerated.
const additive = clone(artifacts['oversized-resources']);
additive.futureField = { anything: true };
additive.sections[0].rows[0].profile.futureField = 1;
additive.sections[0].rows[0].cells.verdict.futureField = 'x';
additive.sections[0].columns[0].futureField = 'x';
assert.equal(isStoryArtifact(additive, 'oversized-resources'), true, 'additive fields accepted');

// ---- Iteration 3: optional dense-story evidence is validated when present while legacy fixtures remain valid.
{
  const oversized = clone(artifacts['oversized-resources']);
  const rightSku = clone(artifacts['right-sku']);
  const oversizedRow = oversized.sections.flatMap(section => section.rows)[0];
  const rightSkuRow = rightSku.sections.flatMap(section => section.rows)[0];
  const option = rightSkuRow.options[0];
  option.capabilityImpacts = [
    {
      key: 'maxDataDiskCount',
      label: 'Data disks',
      severity: 'info',
      basis: 'current-setting',
      materiality: 'not-used',
      currentValue: 4,
      alternativeValue: 8,
      message: 'The proposed size still covers the current VM configuration.',
    },
  ];
  oversizedRow.betterSku = { kind: option.kind, label: option.label, savingsPercent: option.savingsPercent };
  oversizedRow.recommendedOption = option;
  oversizedRow.rightSizeStatus = 'recommended';
  oversized.sections[0].financials = { spend30d: 4000, savingsMax: 600, currency: oversized.scope.currency };
  rightSkuRow.profile = clone(oversizedRow.profile);
  assert.equal(isStoryArtifact(oversized, 'oversized-resources'), true, 'oversized full recommendation evidence accepted');
  assert.equal(isStoryArtifact(rightSku, 'right-sku'), true, 'right-SKU utilization profile accepted');

  const badStatus = clone(oversized);
  badStatus.sections[0].rows[0].rightSizeStatus = 'maybe';
  assert.equal(isStoryArtifact(badStatus, 'oversized-resources'), false, 'unknown right-size assessment status rejected');
  const badImpact = clone(oversized);
  badImpact.sections[0].rows[0].recommendedOption.capabilityImpacts[0].severity = 'critical';
  assert.equal(isStoryArtifact(badImpact, 'oversized-resources'), false, 'unknown capability impact severity rejected');
  const badImpactValue = clone(oversized);
  badImpactValue.sections[0].rows[0].recommendedOption.capabilityImpacts[0].currentValue = { count: 4 };
  assert.equal(isStoryArtifact(badImpactValue, 'oversized-resources'), false, 'object capability impact value rejected');
  const mismatchedSummary = clone(oversized);
  mismatchedSummary.sections[0].rows[0].recommendedOption.label = 'Different target';
  assert.equal(isStoryArtifact(mismatchedSummary, 'oversized-resources'), false, 'inconsistent recommendation summary rejected');
  const badFinancials = clone(oversized);
  badFinancials.sections[0].financials.spend30d = '4000';
  assert.equal(isStoryArtifact(badFinancials, 'oversized-resources'), false, 'malformed section financials rejected');
  const wrongFinancialCurrency = clone(oversized);
  wrongFinancialCurrency.sections[0].financials.currency = 'USD';
  assert.equal(isStoryArtifact(wrongFinancialCurrency, 'oversized-resources'), false, 'section financial currency mismatch rejected');
  const badProfile = clone(rightSku);
  badProfile.sections[0].rows[0].profile.verdict = 'maybe';
  assert.equal(isStoryArtifact(badProfile, 'right-sku'), false, 'invalid optional right-SKU profile rejected');
}

// ---- Capacity scaling and commitment inventory detail are optional, additive evidence.
{
  const scalable = clone(artifacts['oversized-resources']);
  const capacity = scalable.sections.flatMap(section => section.rows)[0].profile.capacity;
  Object.assign(capacity, {
    units: 3,
    unitName: 'instances',
    scaleMode: 'autoscale',
    scaling: {
      autoscaleEnabled: true,
      minimumUnits: 3,
      defaultUnits: 3,
      maximumUnits: 10,
      source: 'Azure Monitor Autoscale',
    },
    label: '3 instances · autoscale 3–10',
  });
  assert.equal(isStoryArtifact(scalable, 'oversized-resources'), true, 'capacity scaling evidence accepted');

  const contradictoryMode = clone(scalable);
  contradictoryMode.sections.flatMap(section => section.rows)[0].profile.capacity.scaleMode = 'fixed';
  assert.equal(isStoryArtifact(contradictoryMode, 'oversized-resources'), false, 'enabled autoscale with fixed mode rejected');
  const invalidBounds = clone(scalable);
  invalidBounds.sections.flatMap(section => section.rows)[0].profile.capacity.scaling.minimumUnits = 11;
  assert.equal(isStoryArtifact(invalidBounds, 'oversized-resources'), false, 'scaling minimum above maximum rejected');
  const invalidScalingFlag = clone(scalable);
  invalidScalingFlag.sections.flatMap(section => section.rows)[0].profile.capacity.scaling.autoscaleEnabled = 'yes';
  assert.equal(isStoryArtifact(invalidScalingFlag, 'oversized-resources'), false, 'non-boolean autoscale flag rejected');

  const commitments = clone(artifacts.commitments);
  const coveredRow = commitments.sections.flatMap(section => section.rows).find(row => row.coverage.benefitTypes.length > 0);
  assert.ok(coveredRow, 'covered commitment fixture row present');
  coveredRow.coverage.benefits = [
    {
      benefitId: '/providers/microsoft.capacity/reservationorders/order-fixture/reservations/ri-fixture',
      benefitName: coveredRow.coverage.benefitNames[0] ?? null,
      benefitType: coveredRow.coverage.benefitTypes[0],
      status: 'active',
      expiryDate: '2027-04-30T00:00:00.000Z',
      daysToExpiry: 230,
    },
  ];
  assert.equal(isStoryArtifact(commitments, 'commitments'), true, 'per-benefit expiry evidence accepted');

  const invalidExpiry = clone(commitments);
  const invalidExpiryBenefit = invalidExpiry.sections.flatMap(section => section.rows).find(row => row.coverage.benefits).coverage.benefits[0];
  invalidExpiryBenefit.expiryDate = 'not-a-date';
  assert.equal(isStoryArtifact(invalidExpiry, 'commitments'), false, 'malformed benefit expiry rejected');
  const missingIdentity = clone(commitments);
  const unidentifiedBenefit = missingIdentity.sections.flatMap(section => section.rows).find(row => row.coverage.benefits).coverage.benefits[0];
  unidentifiedBenefit.benefitId = null;
  unidentifiedBenefit.benefitName = null;
  assert.equal(isStoryArtifact(missingIdentity, 'commitments'), false, 'benefit without an identifier or name rejected');
  const fractionalDays = clone(commitments);
  fractionalDays.sections.flatMap(section => section.rows).find(row => row.coverage.benefits).coverage.benefits[0].daysToExpiry = 2.5;
  assert.equal(isStoryArtifact(fractionalDays, 'commitments'), false, 'fractional days to expiry rejected');
}

// ---- Iteration 5 (at-a-glance UX): commitment-blocked Right SKU verdict, actionable rows, savings basis, projected usage.
{
  const block = {
    reason: 'reservation',
    coveragePercent: 100,
    benefitName: 'ri-fixture-f16',
    expiryDate: '2027-03-31',
  };
  const rightSku = clone(artifacts['right-sku']);
  const [blockedRow, billedRow] = rightSku.sections[0].rows;
  Object.assign(blockedRow, { verdict: 'blocked-by-commitment', commitmentBlock: block, savingsMax: null, actionable: false });
  blockedRow.cells.verdict = { kind: 'mark', state: 'blocked-by-commitment', label: 'Resize at reservation renewal', tone: 'neutral' };
  Object.assign(blockedRow.options[0], { savingsPercent: null, savingsMonthly: null, savingsBasis: 'billed' });
  Object.assign(billedRow.options[0], { savingsBasis: 'billed', projected: { estimate: true, cpuP95: 64, memoryP95: 101.5 } });
  billedRow.actionable = true;
  rightSku.summary.counts['blocked-by-commitment'] = 1;
  rightSku.summary.actionable = 2;
  assert.equal(isStoryArtifact(rightSku, 'right-sku'), true, 'blocked-by-commitment row, savings basis and projection accepted');
  const costBlocked = clone(rightSku);
  costBlocked.sections[0].rows[0].commitmentBlock = {
    reason: 'cost-not-lower',
    coveragePercent: null,
    benefitName: null,
    expiryDate: null,
    expectedOptionCost: 420.5,
    billedSpend: 380.1,
  };
  assert.equal(isStoryArtifact(costBlocked, 'right-sku'), true, 'cost-not-lower commitment block accepted');
  const actionableBlocked = clone(rightSku);
  actionableBlocked.sections[0].rows[0].actionable = true;
  assert.equal(isStoryArtifact(actionableBlocked, 'right-sku'), false, 'actionable blocked-by-commitment row rejected');
  const fractionalActionable = clone(rightSku);
  fractionalActionable.summary.actionable = 1.5;
  assert.equal(isStoryArtifact(fractionalActionable, 'right-sku'), false, 'non-integer summary actionable count rejected');
  const badExpiry = clone(rightSku);
  badExpiry.sections[0].rows[0].commitmentBlock.expiryDate = 'at renewal';
  assert.equal(isStoryArtifact(badExpiry, 'right-sku'), false, 'unparseable commitment block expiry rejected');

  const oversized = clone(artifacts['oversized-resources']);
  const rows = oversized.sections.flatMap(section => section.rows);
  const informational = rows.find(row => row.profile.verdict === 'oversized' && row.savingsMax === null && !row.betterSku);
  assert.ok(informational, 'oversized fixture has a no-action row');
  Object.assign(informational, { actionable: false, rightSizeRejection: { reason: 'observed-fit', sku: 'Standard_D2as_v5' } });
  const blocked = rows.find(row => row.recommendedOption && row.betterSku);
  Object.assign(blocked, { savingsMax: null, actionable: false, commitmentBlock: block });
  blocked.betterSku = { ...blocked.betterSku, savingsPercent: null, savingsBasis: 'billed', billedSavingsPercent: null };
  blocked.recommendedOption = { ...blocked.recommendedOption, savingsPercent: null, savingsMonthly: null, savingsBasis: 'billed' };
  oversized.summary.actionable = oversized.summary.counts.resources - 2;
  assert.equal(isStoryArtifact(oversized, 'oversized-resources'), true, 'informational and commitment-blocked oversized rows accepted');
  const mismatchedBasis = clone(oversized);
  mismatchedBasis.sections.flatMap(section => section.rows).find(row => row.commitmentBlock).recommendedOption.savingsBasis = 'list';
  assert.equal(isStoryArtifact(mismatchedBasis, 'oversized-resources'), false, 'summary / option savings basis mismatch rejected');
  const badRejection = clone(oversized);
  badRejection.sections.flatMap(section => section.rows).find(row => row.rightSizeRejection).rightSizeRejection.reason = 'too-big';
  assert.equal(isStoryArtifact(badRejection, 'oversized-resources'), false, 'unknown right-size rejection reason rejected');

  // Hybrid Benefit gross vs net rides on the existing MoneyCell secondary fields (no contract change needed).
  const hybrid = clone(artifacts['hybrid-benefit']);
  const hybridRow = hybrid.sections[0].rows[0];
  const savingsKey = hybrid.sections[0].columns.find(column => column.cell === 'money')?.key;
  assert.ok(savingsKey, 'hybrid-benefit fixture has a money column');
  Object.assign(hybridRow.cells[savingsKey], { secondaryValue: 120.4, secondaryLabel: 'With licences you own' });
  assert.equal(isStoryArtifact(hybrid, 'hybrid-benefit'), true, 'money cell secondary value accepted');

  // Portal signal: list-based percent plus the billed figure; a billed-basis summary repeats it.
  const signal = await readFixture('utilization-signal');
  assert.equal(
    isUtilizationSignal({ ...signal, betterSku: { ...signal.betterSku, savingsBasis: 'list', billedSavingsPercent: 18.2 } }),
    true,
    'signal list-based percent with billed figure accepted'
  );
  assert.equal(
    isUtilizationSignal({
      ...signal,
      betterSku: { ...signal.betterSku, savingsBasis: 'billed', billedSavingsPercent: signal.betterSku.savingsPercent },
    }),
    true,
    'signal billed-basis summary accepted'
  );
  assert.equal(
    isUtilizationSignal({ ...signal, betterSku: { ...signal.betterSku, billedSavingsPercent: null } }),
    true,
    'signal with no billed saving accepted'
  );
}

// ---- Iteration 6 (Option A): the portal signal mirrors the story row's `actionable` flag plus a short reason.
{
  const signal = await readFixture('utilization-signal');
  const legacySignal = clone(signal);
  delete legacySignal.actionable;
  delete legacySignal.actionReason;
  assert.equal(isUtilizationSignal(legacySignal), true, 'legacy signal without actionable accepted');
  assert.equal(isUtilizationSignal({ ...signal, actionable: true }), true, 'actionable signal accepted');
  assert.equal(isUtilizationSignal({ ...signal, actionable: false }), true, 'non-actionable signal without a reason accepted');
  for (const actionReason of ['observed-fit', 'no-saving', 'blocked-by-commitment']) {
    assert.equal(
      isUtilizationSignal({ ...signal, betterSku: undefined, actionable: false, actionReason }),
      true,
      `non-actionable signal with reason ${actionReason} accepted`
    );
  }
  assert.equal(isUtilizationSignal({ ...signal, actionable: 'no' }), false, 'non-boolean actionable rejected');
  assert.equal(isUtilizationSignal({ ...signal, actionable: null }), false, 'null actionable rejected');
  assert.equal(isUtilizationSignal({ ...signal, actionable: false, actionReason: 'too-big' }), false, 'unknown action reason rejected');
  assert.equal(isUtilizationSignal({ ...signal, actionable: true, actionReason: 'observed-fit' }), false, 'reason on an actionable signal rejected');
  assert.equal(isUtilizationSignal({ ...signal, actionReason: 'observed-fit' }), false, 'reason without actionable: false rejected');
}

// ---- Summary view (a reader's projection): rows removed, produced counts kept, marked `view: 'summary'`.
for (const storyKey of STORY_KEYS) {
  const summaryView = { ...clone(artifacts[storyKey]), view: 'summary' };
  summaryView.sections = summaryView.sections.map(section => ({ ...section, rows: [] }));
  assert.equal(isStoryArtifact(summaryView, storyKey), true, `${storyKey}: summary view accepted`);
  const unmarked = clone(summaryView);
  delete unmarked.view;
  assert.equal(isStoryArtifact(unmarked, storyKey), false, `${storyKey}: emptied rows without the summary marker rejected`);
  const withRows = { ...clone(artifacts[storyKey]), view: 'summary' };
  assert.equal(isStoryArtifact(withRows, storyKey), false, `${storyKey}: summary marker with rows rejected`);
}
{
  const summaryView = { ...clone(artifacts['oversized-resources']), view: 'summary' };
  summaryView.sections = summaryView.sections.map(section => ({ ...section, rows: [] }));
  assert.equal(isStoryArtifact({ ...summaryView, view: 'compact' }, 'oversized-resources'), false, 'unknown view marker rejected');
  const overOmitted = clone(summaryView);
  overOmitted.sections[0].omittedCount = overOmitted.sections[0].totalCount + 1;
  assert.equal(isStoryArtifact(overOmitted, 'oversized-resources'), false, 'summary view: omittedCount above totalCount rejected');
  const badColumns = clone(summaryView);
  badColumns.sections[0].columns[0].cell = 'hologram';
  assert.equal(isStoryArtifact(badColumns, 'oversized-resources'), false, 'summary view: invalid column rejected');
  const badScope = clone(summaryView);
  delete badScope.scope.subscriptionId;
  assert.equal(isStoryArtifact(badScope, 'oversized-resources'), false, 'summary view: envelope still validated');
}

// ---- Negatives: one patch per rejection rule.
const getAt = (root, path) => path.reduce((node, key) => node[key], root);
const applyOp = (root, [op, path, value]) => {
  const parent = getAt(root, path.slice(0, -1));
  const key = path[path.length - 1];
  switch (op) {
    case 'set': {
      const resolved =
        value && typeof value === 'object' && '$repeat' in value
          ? Array.from({ length: value.times }, () => clone(getAt(root, value.$repeat)))
          : value;
      parent[key] = resolved;
      return;
    }
    case 'remove':
      if (Array.isArray(parent)) parent.splice(key, 1);
      else delete parent[key];
      return;
    case 'append':
      parent[key].push(value);
      return;
    case 'pop':
      parent[key].pop();
      return;
    default:
      throw new Error(`unknown op ${op}`);
  }
};
const negatives = await readFixture('negatives');
assert.ok(negatives.length >= 30, 'negative corpus present');
const fixtureCache = {};
for (const negative of negatives) {
  fixtureCache[negative.base] ??= await readFixture(negative.base);
  const value = clone(fixtureCache[negative.base]);
  for (const op of negative.ops) applyOp(value, op);
  const guard = guards[negative.guard];
  assert.ok(guard, `negative ${negative.name}: guard ${negative.guard} exists`);
  // Row-level guards receive the first row's sub-document; artifact-level guards the whole document.
  let subject = value;
  if (negative.guard === 'isUtilizationProfile') subject = value.sections[0].rows[0].profile;
  if (negative.guard === 'isProtectionProfile') subject = value.sections[0].rows[0].protection;
  const args = negative.storyKey ? [subject, negative.storyKey] : [subject];
  assert.equal(guard(...args), false, `negative rejected: ${negative.name}`);
}

// Every positive fixture file is exercised (guards against orphaned fixtures).
const files = (await readdir(fixtureDir)).filter(name => name.endsWith('.json')).map(name => name.replace(/\.json$/, ''));
const expected = new Set([
  ...STORY_KEYS,
  'reporting-stories',
  'utilization-signal',
  'utilization-profiles.config',
  'resilience-profiles.config',
  'negatives',
]);
assert.deepEqual(new Set(files), expected, 'fixture directory contains exactly the known fixtures');

console.log(`utilization stories contracts ok (${STORY_KEYS.length} stories, ${negatives.length} negatives)`);
