import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const formats = { commonjs: require('../dist/index.js'), esm: await import('../dist/esm/entries/root.js') };
const fixture = JSON.parse(readFileSync(new URL('../tests/fixtures/microsoft365-applications.json', import.meta.url), 'utf8'));
const changed = mutation => {
  const directory = structuredClone(fixture);
  mutation(directory, directory.applications[0]);
  return directory;
};

for (const [format, api] of Object.entries(formats)) {
  test(`${format}: application directory public exports and fictional Contoso fixture`, () => {
    assert.equal(api.MICROSOFT365_APPLICATIONS_SCHEMA_VERSION, 'microsoft-365-applications/v1');
    assert.equal(typeof api.isMicrosoft365ApplicationDirectory, 'function');
    assert.equal(api.isMicrosoft365ApplicationDirectory(fixture), true);
    assert.equal(api.isMicrosoft365ApplicationDirectory({ ...fixture, applications: [] }), true);
  });

  test(`${format}: every required field is checked at every object level`, () => {
    for (const select of [value => value, value => value.coverage, value => value.applications[0], value => value.applications[0].last30Days]) {
      for (const field of Object.keys(select(fixture))) {
        assert.equal(api.isMicrosoft365ApplicationDirectory(changed(value => delete select(value)[field])), false, field);
      }
    }
    for (const value of [undefined, null, false, 0, 'directory', [], {}]) assert.equal(api.isMicrosoft365ApplicationDirectory(value), false);
  });

  test(`${format}: rejects additional fields and personal data at every object level`, () => {
    for (const select of [
      value => value,
      value => value.coverage,
      value => value.applications[0],
      value => value.applications[0].last30Days,
      value => value.applications[0].last90Days,
    ]) {
      assert.equal(api.isMicrosoft365ApplicationDirectory(changed(value => (select(value).accountId = 'private'))), false);
      assert.equal(api.isMicrosoft365ApplicationDirectory(changed(value => (select(value).future = true))), false);
    }
  });

  test(`${format}: bounded nonblank strings and open SSO modes`, () => {
    for (const [select, fields] of [
      [value => value, ['tenantId', 'tenantSyncRunId']],
      [value => value.applications[0], ['appId', 'name', 'publisher', 'ssoMode']],
    ]) {
      for (const field of fields) {
        assert.equal(api.isMicrosoft365ApplicationDirectory(changed(value => (select(value)[field] = 'x'.repeat(512)))), true, field);
        for (const invalid of ['', ' \t\n', 'x'.repeat(513), false, [], {}])
          assert.equal(api.isMicrosoft365ApplicationDirectory(changed(value => (select(value)[field] = invalid))), false, field);
      }
    }
    assert.equal(api.isMicrosoft365ApplicationDirectory(changed((_, app) => (app.ssoMode = 'future-provider-mode'))), true);
  });

  test(`${format}: nullable names require matching, closed source evidence`, () => {
    for (const nameSource of ['servicePrincipal', 'signIn'])
      assert.equal(api.isMicrosoft365ApplicationDirectory(changed((_, app) => (app.nameSource = nameSource))), true);
    for (const mutation of [
      (_, app) => (app.name = null),
      (_, app) => (app.nameSource = null),
      (_, app) => (app.nameSource = 'invented'),
      (_, app) => (app.nameSource = ['signIn']),
      (_, app) => (app.firstParty = 1),
      (_, app) => (app.firstParty = 'false'),
      (_, app) => (app.firstParty = null),
    ])
      assert.equal(api.isMicrosoft365ApplicationDirectory(changed(mutation)), false);
  });

  test(`${format}: strict UTC dates, timestamps and inclusive ordering`, () => {
    for (const selectField of [
      value => [value.coverage, 'from'],
      value => [value.coverage, 'through'],
      value => [value.applications[0], 'firstSeen'],
      value => [value.applications[0], 'lastSeen'],
    ]) {
      for (const invalid of ['2026-02-30', '2026-02-29', '2026-04-31', '2026-13-01', '2026-11-03T00:00:00Z', '', null]) {
        assert.equal(
          api.isMicrosoft365ApplicationDirectory(
            changed(value => {
              const [object, key] = selectField(value);
              object[key] = invalid;
            })
          ),
          false
        );
      }
    }
    for (const generatedAt of ['2026-02-30T00:00:00Z', '2026-11-04T24:00:00Z', '2026-11-04T01:60:00Z', '2026-11-04', '2026-11-04T00:00:00+00:00'])
      assert.equal(api.isMicrosoft365ApplicationDirectory({ ...fixture, generatedAt }), false, generatedAt);
    for (const generatedAt of ['2026-11-04T00:00:00Z', '2026-11-04T00:00:00.1Z', '2026-11-04T00:00:00.123Z'])
      assert.equal(api.isMicrosoft365ApplicationDirectory({ ...fixture, generatedAt }), true, generatedAt);
    for (const mutation of [
      value => (value.coverage.from = '2026-11-04'),
      (_, app) => (app.firstSeen = '2026-08-03'),
      (_, app) => (app.lastSeen = '2026-11-04'),
      (_, app) => Object.assign(app, { firstSeen: '2026-11-03', lastSeen: '2026-11-02' }),
    ])
      assert.equal(api.isMicrosoft365ApplicationDirectory(changed(mutation)), false);
  });

  test(`${format}: every count is a nonnegative safe integer`, () => {
    for (const [select, fields] of [
      [value => value, ['omittedCount']],
      [value => value.coverage, ['observedDays']],
      [value => value.applications[0].last30Days, ['activeAccounts', 'observedDays']],
      [value => value.applications[0].last90Days, ['activeAccounts', 'observedDays']],
    ]) {
      for (const field of fields) {
        for (const invalid of [-1, 0.1, Number.MAX_SAFE_INTEGER + 1, NaN, Infinity, '1', null, false])
          assert.equal(api.isMicrosoft365ApplicationDirectory(changed(value => (select(value)[field] = invalid))), false, field);
      }
    }
    for (const omittedCount of [0, 1, Number.MAX_SAFE_INTEGER])
      assert.equal(api.isMicrosoft365ApplicationDirectory({ ...fixture, omittedCount }), true);
  });

  test(`${format}: duplicate IDs include case and whitespace collisions`, () => {
    for (const appId of ['contoso-zoom', 'CONTOSO-ZOOM', ' contoso-zoom '])
      assert.equal(api.isMicrosoft365ApplicationDirectory(changed(value => value.applications.push({ ...value.applications[0], appId }))), false);
  });

  test(`${format}: gaps are unique, valid and inside coherent inclusive coverage`, () => {
    for (const mutation of [
      value => value.coverage.unobservedDates.push('2026-09-12'),
      value => (value.coverage.unobservedDates[0] = '2026-02-30'),
      value => (value.coverage.unobservedDates[0] = '2026-08-03'),
      value => (value.coverage.unobservedDates[0] = '2026-11-04'),
      value => (value.coverage.unobservedDates[0] = null),
      value => (value.coverage.unobservedDates = '2026-09-12'),
      value => (value.coverage.observedDays = 92),
      value => (value.coverage.observedDays = 90),
    ])
      assert.equal(api.isMicrosoft365ApplicationDirectory(changed(mutation)), false);
  });

  test(`${format}: windows use anchored observed dates, including exact boundaries`, () => {
    const directory = changed(value => {
      // Last 30 starts Oct 5; last 90 starts Aug 6. Gap order is immaterial.
      value.coverage.unobservedDates = ['2026-10-05', '2026-08-05', '2026-09-12', '2026-08-06', '2026-10-04', '2026-11-03'];
      value.coverage.observedDays = 86;
      for (const app of value.applications) {
        app.last30Days.observedDays = 28;
        app.last90Days.observedDays = 85;
      }
    });
    assert.equal(api.isMicrosoft365ApplicationDirectory(directory), true);
    for (const [window, observedDays] of [
      ['last30Days', 27],
      ['last30Days', 29],
      ['last90Days', 84],
      ['last90Days', 86],
    ]) {
      const invalid = structuredClone(directory);
      invalid.applications[0][window].observedDays = observedDays;
      assert.equal(api.isMicrosoft365ApplicationDirectory(invalid), false);
    }
    assert.equal(api.isMicrosoft365ApplicationDirectory(changed((_, app) => (app.last90Days.activeAccounts = 119))), false);
  });

  test(`${format}: short leap-day coverage clamps both windows and preserves zero versus missing`, () => {
    const directory = changed(value => {
      value.coverage = { from: '2028-02-28', through: '2028-03-01', observedDays: 2, unobservedDates: ['2028-02-29'] };
      value.applications = [
        {
          ...value.applications[0],
          firstSeen: '2028-02-28',
          lastSeen: '2028-03-01',
          last30Days: { activeAccounts: 1, observedDays: 2 },
          last90Days: { activeAccounts: 1, observedDays: 2 },
        },
      ];
    });
    assert.equal(api.isMicrosoft365ApplicationDirectory(directory), true);
    directory.coverage.observedDays = 0;
    directory.coverage.unobservedDates = ['2028-02-28', '2028-02-29', '2028-03-01'];
    for (const window of ['last30Days', 'last90Days']) directory.applications[0][window] = { activeAccounts: 0, observedDays: 0 };
    assert.equal(api.isMicrosoft365ApplicationDirectory(directory), true);
    for (const window of ['last30Days', 'last90Days']) {
      const invalid = structuredClone(directory);
      invalid.applications[0][window].activeAccounts = 1;
      assert.equal(api.isMicrosoft365ApplicationDirectory(invalid), false);
    }
  });

  test(`${format}: retained monthly history is not limited to 93 days`, () => {
    const directory = changed(value => {
      value.coverage = { from: '2025-10-01', through: '2026-11-03', observedDays: 399, unobservedDates: [] };
      for (const app of value.applications) app.last90Days.observedDays = 90;
    });
    assert.equal(api.isMicrosoft365ApplicationDirectory(directory), true);
  });

  test(`${format}: apps last seen before a window cannot have active accounts in it`, () => {
    assert.equal(api.isMicrosoft365ApplicationDirectory(fixture), true);
    for (const [index, window] of [
      [2, 'last30Days'],
      [3, 'last90Days'],
    ]) {
      assert.equal(api.isMicrosoft365ApplicationDirectory(changed(value => (value.applications[index][window].activeAccounts = 1))), false);
    }
  });

  test(`${format}: caps applications at 5000 and rejects sparse or malformed containers`, () => {
    const directory = changed(value => {
      value.applications = Array.from({ length: 5000 }, (_, index) => ({ ...value.applications[0], appId: `app-${index}` }));
      value.omittedCount = 3;
    });
    assert.equal(api.isMicrosoft365ApplicationDirectory(directory), true);
    directory.applications.push({ ...directory.applications[0], appId: 'overflow' });
    assert.equal(api.isMicrosoft365ApplicationDirectory(directory), false);
    for (const mutation of [
      value => (value.applications = Array(1)),
      value => (value.coverage.unobservedDates = Array(1)),
      value => (value.applications = {}),
      value => (value.coverage = []),
      value => (value.applications[0] = null),
      (_, app) => (app.last30Days = []),
      (_, app) => (app.last90Days = null),
    ])
      assert.equal(api.isMicrosoft365ApplicationDirectory(changed(mutation)), false);
  });
}
