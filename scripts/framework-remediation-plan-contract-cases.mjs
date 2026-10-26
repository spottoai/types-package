import assert from 'node:assert/strict';

const breakdown = { setupMinutes: 60, perResourceMinutes: 15, validationMinutes: 60, resourceCount: 2, totalMinutes: 150 };
const knownEffort = {
  profiles: { clickops: breakdown, devops: { ...breakdown, perResourceMinutes: 5, totalMinutes: 130 }, enterprise: breakdown },
  selectedProfile: 'clickops',
  provenance: 'curated-estimate',
  targetCountBasis: 'distinct-native-resources',
  assumptions: ['Excludes approval waiting time.'],
};
const resources = [
  '/subscriptions/sub-1/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/a',
  '/subscriptions/sub-1/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/b',
];
export const remediationPlanFixture = {
  schemaVersion: 1,
  companyId: 'comp-example',
  scope: { providerName: 'azure', scopeType: 'subscription', scopeId: 'sub-1' },
  frameworkId: 'cis-6',
  sourceVersion: '5.45.0',
  catalogueBundleSha256: 'a'.repeat(64),
  generationSha256: 'b'.repeat(64),
  computedAt: '2026-10-26T00:00:00.000Z',
  inputs: { plannerVersion: '1', profilesVersion: '1', effortProfile: 'clickops', profileSource: 'account-setting', overridesSha256: null },
  actions: [
    {
      id: 'azure:sub-1:storage-hardening',
      actionKey: 'azure:storage-hardening',
      checkIds: ['check-1'],
      controlIds: ['control-1', 'control-2'],
      resourceIds: resources,
      jobKey: 'storage',
      targetKind: 'resources',
      targetIdentity: 'batch-1',
      risk: { level: 4, source: 'severity' },
      verification: 'verified',
      effort: knownEffort,
      changeRisk: 'disruptive',
      changeNote: 'Key clients require migration.',
      downtime: 'unknown',
      costState: 'no-added-cost',
      tier: 'next',
      reasons: ['Disruptive change.'],
    },
    {
      id: 'azure:sub-1:unknown',
      actionKey: 'azure:unknown',
      checkIds: ['check-2'],
      controlIds: ['control-1'],
      resourceIds: [],
      jobKey: 'unknown',
      targetKind: 'unknown',
      targetIdentity: 'unknown',
      risk: { level: null, source: 'unknown' },
      verification: 'unverified',
      effort: null,
      effortUnavailableReason: 'Required targets are unavailable.',
      changeRisk: 'unknown',
      downtime: 'unknown',
      costState: 'unknown',
      tier: 'later',
      reasons: ['Needs assessment.'],
    },
  ],
  controls: [
    { controlId: 'control-1', actionIds: ['azure:sub-1:storage-hardening', 'azure:sub-1:unknown'], tier: 'next', reasons: [] },
    { controlId: 'control-2', actionIds: ['azure:sub-1:storage-hardening'], tier: 'next', reasons: [] },
  ],
  jobs: [
    {
      jobKey: 'storage',
      actionIds: ['azure:sub-1:storage-hardening'],
      controlIds: ['control-1', 'control-2'],
      resourceIds: resources,
      tier: 'next',
      effort: { totalMinutes: 150, knownMinutes: 150, unknownActions: 0 },
    },
    {
      jobKey: 'unknown',
      actionIds: ['azure:sub-1:unknown'],
      controlIds: ['control-1'],
      resourceIds: [],
      tier: 'later',
      effort: { totalMinutes: null, knownMinutes: 0, unknownActions: 1 },
    },
  ],
  totals: { totalMinutes: null, knownMinutes: 150, unknownActions: 1 },
};

export function checkRemediationPlanContracts(api, label) {
  const parse = api.parseFrameworkRemediationPlanDocument;
  assert.equal(typeof parse, 'function', `${label}: remediation parser is exported`);
  const fixture = remediationPlanFixture;
  assert.deepEqual(parse(fixture), fixture, label);
  const reject = (name, mutate) => {
    const value = structuredClone(fixture);
    mutate(value);
    assert.throws(() => parse(value), api.TerminalAssessmentError, `${label}: ${name}`);
  };
  for (const companyId of ['invalid-prefix', 'comp-a.b', 'comp-a/b', 'comp-a\\b', 'comp-a\n', `comp-${'a'.repeat(101)}`])
    reject('invalid company identity', v => {
      v.companyId = companyId;
    });
  for (const field of ['changeRisk', 'downtime', 'costState', 'verification', 'effort']) {
    reject(`unsafe Do Now ${field}`, v => {
      Object.assign(v.actions[0], {
        tier: 'now',
        changeRisk: 'none',
        downtime: 'not-required',
        costState: 'no-added-cost',
        verification: 'verified',
      });
      v.actions[0][field] = field === 'effort' ? null : field === 'verification' ? 'unverified' : 'unknown';
      if (field === 'effort') v.actions[0].effortUnavailableReason = 'Estimate unavailable';
    });
  }
  reject('company override without captured input digest', v => {
    v.actions[0].effort.provenance = 'company-override';
  });
  for (const [name, mutate] of [
    [
      'unknown document key',
      v => {
        v.pricing = {};
      },
    ],
    [
      'unknown nested key',
      v => {
        v.actions[0].effort.profiles.clickops.money = 0;
      },
    ],
    [
      'unsafe company',
      v => {
        v.companyId = '../another';
      },
    ],
    [
      'empty company',
      v => {
        v.companyId = '';
      },
    ],
    [
      'wrong schema',
      v => {
        v.schemaVersion = 2;
      },
    ],
    [
      'invalid generation',
      v => {
        v.generationSha256 = 'not-a-hash';
      },
    ],
    [
      'invalid source',
      v => {
        v.sourceVersion = 'latest';
      },
    ],
    [
      'invalid timestamp',
      v => {
        v.computedAt = '2026-02-30T00:00:00.000Z';
      },
    ],
    [
      'wrong provider scope',
      v => {
        v.scope.providerName = 'aws';
      },
    ],
    [
      'negative effort',
      v => {
        v.actions[0].effort.profiles.clickops.setupMinutes = -1;
      },
    ],
    [
      'fractional minutes',
      v => {
        v.actions[0].effort.profiles.clickops.setupMinutes = 0.5;
      },
    ],
    [
      'nonfinite effort',
      v => {
        v.actions[0].effort.profiles.clickops.setupMinutes = Infinity;
      },
    ],
    [
      'overflow effort',
      v => {
        v.actions[0].effort.profiles.clickops.perResourceMinutes = Number.MAX_SAFE_INTEGER;
      },
    ],
    [
      'inconsistent formula',
      v => {
        v.actions[0].effort.profiles.devops.totalMinutes = 131;
      },
    ],
    [
      'inconsistent resource count',
      v => {
        v.actions[0].effort.profiles.clickops.resourceCount = 1;
        v.actions[0].effort.profiles.clickops.totalMinutes = 135;
      },
    ],
    [
      'resource count missing targets',
      v => {
        v.actions[0].resourceIds = [];
      },
    ],
    [
      'wrong selected profile',
      v => {
        v.actions[0].effort.selectedProfile = 'enterprise';
      },
    ],
    [
      'known effort with unknown target',
      v => {
        v.actions[0].targetKind = 'unknown';
      },
    ],
    [
      'wrong target basis',
      v => {
        v.actions[0].effort.targetCountBasis = 'scope-setting';
      },
    ],
    [
      'unknown effort without reason',
      v => {
        delete v.actions[1].effortUnavailableReason;
      },
    ],
    [
      'known effort with unavailable reason',
      v => {
        v.actions[0].effortUnavailableReason = 'unknown';
      },
    ],
    [
      'risk provenance mismatch',
      v => {
        v.actions[1].risk.source = 'severity';
      },
    ],
    [
      'risk level outside range',
      v => {
        v.actions[0].risk.level = 6;
      },
    ],
    [
      'duplicate action',
      v => {
        v.actions.push(v.actions[0]);
      },
    ],
    [
      'duplicate work with different action ID',
      v => {
        const duplicate = { ...structuredClone(v.actions[0]), id: 'different-id' };
        v.actions.push(duplicate);
        v.controls[0].actionIds.push(duplicate.id);
        v.controls[1].actionIds.push(duplicate.id);
        v.jobs[0].actionIds.push(duplicate.id);
        v.jobs[0].effort = { totalMinutes: 300, knownMinutes: 300, unknownActions: 0 };
        v.totals.knownMinutes = 300;
      },
    ],
    [
      'known work without scanner check mapping',
      v => {
        v.actions[0].checkIds = [];
      },
    ],
    [
      'duplicate resource',
      v => {
        v.actions[0].resourceIds.push(v.actions[0].resourceIds[0]);
      },
    ],
    [
      'duplicate check',
      v => {
        v.actions[0].checkIds.push('check-1');
      },
    ],
    [
      'dangling action reference',
      v => {
        v.controls[0].actionIds.push('missing');
      },
    ],
    [
      'missing reciprocal control',
      v => {
        v.controls[1].actionIds = [];
        v.controls[1].reasons = ['Unknown'];
      },
    ],
    [
      'dangling control reference',
      v => {
        v.actions[0].controlIds.push('missing');
      },
    ],
    [
      'duplicate control',
      v => {
        v.controls.push(v.controls[0]);
      },
    ],
    [
      'empty control despite explanation',
      v => {
        v.controls.push({ controlId: 'control-3', actionIds: [], tier: 'later', reasons: ['Unmapped control'] });
      },
    ],
    [
      'dangling job',
      v => {
        v.actions[0].jobKey = 'missing';
      },
    ],
    [
      'missing job action',
      v => {
        v.jobs[0].actionIds = [];
      },
    ],
    [
      'job includes action from another job',
      v => {
        v.jobs[0].actionIds.push(v.actions[1].id);
      },
    ],
    [
      'job resources incomplete',
      v => {
        v.jobs[0].resourceIds.pop();
      },
    ],
    [
      'job controls incomplete',
      v => {
        v.jobs[0].controlIds.pop();
      },
    ],
    [
      'duplicated jobs',
      v => {
        v.jobs.push(v.jobs[0]);
      },
    ],
    [
      'job total multiplied by controls',
      v => {
        v.jobs[0].effort.totalMinutes = 300;
        v.jobs[0].effort.knownMinutes = 300;
      },
    ],
    [
      'unknown effort represented as zero',
      v => {
        v.jobs[1].effort.totalMinutes = 0;
      },
    ],
    [
      'unknown actions lost',
      v => {
        v.totals.unknownActions = 0;
      },
    ],
    [
      'plan total excludes unknowns',
      v => {
        v.totals.totalMinutes = 150;
      },
    ],
    [
      'known subtotal inflated',
      v => {
        v.totals.knownMinutes = 300;
      },
    ],
    [
      'unbounded reason list',
      v => {
        v.actions[0].reasons = Array.from({ length: 65 }, (_, i) => `Reason ${i}`);
      },
    ],
    [
      'unsafe accessor',
      v => {
        Object.defineProperty(v.inputs, 'plannerVersion', {
          enumerable: true,
          get() {
            throw new Error('must not execute');
          },
        });
      },
    ],
  ])
    reject(name, mutate);
  const parsed = parse(fixture);
  parsed.actions[0].resourceIds.push('changed');
  assert.equal(fixture.actions[0].resourceIds.length, 2, 'parser detaches caller-owned nested arrays');
  const empty = { ...fixture, actions: [], controls: [], jobs: [], totals: { totalMinutes: 0, knownMinutes: 0, unknownActions: 0 } };
  assert.deepEqual(parse(empty), empty, 'no outstanding work has a known zero total');
  const setting = structuredClone(fixture);
  setting.actions[0].targetKind = 'setting';
  setting.actions[0].resourceIds = [];
  setting.actions[0].effort.targetCountBasis = 'scope-setting';
  for (const profile of Object.values(setting.actions[0].effort.profiles)) {
    profile.resourceCount = 1;
    profile.totalMinutes = profile.setupMinutes + profile.perResourceMinutes + profile.validationMinutes;
  }
  setting.jobs[0].resourceIds = [];
  setting.jobs[0].effort = { totalMinutes: 135, knownMinutes: 135, unknownActions: 0 };
  setting.totals.knownMinutes = 135;
  assert.deepEqual(parse(setting), setting, 'scope settings count one target without inventing a resource');
  const unmapped = structuredClone(fixture);
  unmapped.actions[1].checkIds = [];
  assert.deepEqual(parse(unmapped), unmapped, 'explicit unknown action preserves an unmapped control without inventing a check');
  const selected = structuredClone(fixture);
  selected.inputs.effortProfile = 'devops';
  selected.actions[0].effort.selectedProfile = 'devops';
  selected.jobs[0].effort = { totalMinutes: 130, knownMinutes: 130, unknownActions: 0 };
  selected.totals.knownMinutes = 130;
  assert.deepEqual(parse(selected), selected, 'deduplicated totals follow the selected account profile');
  const legacyCompany = { ...fixture, companyId: 'cus_example' };
  assert.deepEqual(parse(legacyCompany), legacyCompany, 'legacy company identity remains supported');
  const override = structuredClone(fixture);
  override.actions[0].effort.provenance = 'company-override';
  override.inputs.overridesSha256 = 'c'.repeat(64);
  assert.deepEqual(parse(override), override, 'company overrides preserve their captured snapshot identity');
  const safeNow = structuredClone(fixture);
  Object.assign(safeNow.actions[0], { tier: 'now', changeRisk: 'low', downtime: 'not-required' });
  safeNow.controls[0].tier = 'now';
  safeNow.controls[1].tier = 'now';
  safeNow.jobs[0].tier = 'now';
  assert.deepEqual(parse(safeNow), safeNow, 'structurally safe Do Now accepts engine-owned ranking without duplicating thresholds');
}
