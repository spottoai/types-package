import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const formats = { commonjs: require('../dist/index.js'), esm: await import('../dist/esm/entries/root.js') };
const fixture = JSON.parse(readFileSync(new URL('../tests/fixtures/ci-build-contoso.json', import.meta.url), 'utf8'));
const clone = value => structuredClone(value);

for (const [format, api] of Object.entries(formats)) {
  test(`${format}: CI build exports and fictional Contoso fixture`, () => {
    assert.equal(api.CI_BUILD_SUMMARY_SCHEMA, 'ci-build-summary/v1');
    assert.equal(api.isCiBuildSummaryArtifact(fixture.summary), true);
    assert.equal(api.isCiBuildLatestPointer(fixture.latest), true);
    assert.equal(api.isCiBuildCollectRequestMessage(fixture.request), true);
  });

  test(`${format}: summary rejects actor identifiers and bad values`, () => {
    const actor = clone(fixture.summary);
    actor.insights[0].facts.actorLogin = 1;
    assert.equal(api.isCiBuildSummaryArtifact(actor), false);
    const ratio = clone(fixture.summary);
    ratio.byRepository[0].fullSuiteShare = 1.5;
    assert.equal(api.isCiBuildSummaryArtifact(ratio), false);
    const converted = clone(fixture.summary);
    converted.currency = 'NZD';
    assert.equal(api.isCiBuildSummaryArtifact(converted), true);
  });

  test(`${format}: paths reject unsafe input`, () => {
    assert.equal(api.buildCiBuildSummaryPath('contoso-demo', '2026-11'), 'contoso-demo/ci-build/portal/2026-11/summary.json.gz');
    assert.throws(() => api.buildCiBuildRawPath('contoso-demo', 'c1', '2026-11-07', '../x'));
    assert.equal(api.isCiBuildCollectRequestMessage({ ...fixture.request, mode: 'probe' }), false);
  });
  test(`${format}: build cost modes, reason codes and money facts are exported`, () => {
    assert.deepEqual([...api.CI_BUILD_COLLECTION_MODES], ['backfill', 'daily']);
    assert.deepEqual([...api.CI_BUILD_REASON_CODES], ['ci_build.runs_truncated', 'ci_build.repository_unreadable']);
    assert.deepEqual([...api.CI_BUILD_INSIGHT_MONEY_FACTS], ['previousAmount', 'trailingAverage']);
  });
}
