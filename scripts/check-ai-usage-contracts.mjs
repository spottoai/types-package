import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const formats = { commonjs: require('../dist/index.js'), esm: await import('../dist/esm/entries/root.js') };
const fixture = JSON.parse(readFileSync(new URL('../tests/fixtures/ai-usage-contoso.json', import.meta.url), 'utf8'));
const clone = value => structuredClone(value);

for (const [format, api] of Object.entries(formats)) {
  test(`${format}: AI usage exports and fictional Contoso fixture`, () => {
    assert.equal(api.AI_USAGE_SUMMARY_SCHEMA, 'ai-usage-summary/v1');
    assert.equal(api.AI_PROVIDER_CONNECTIONS_TABLE, 'aiproviderconnections');
    assert.equal(api.isAiUsageSummaryArtifact(fixture.summary), true);
    assert.equal(api.isAiUsagePeopleArtifact(fixture.people), true);
    assert.equal(api.isAiUsageLatestPointer(fixture.latest), true);
    assert.equal(api.isAiUsageCollectRequestMessage(fixture.request), true);
  });

  test(`${format}: summary never carries people and keeps money nullable`, () => {
    const withPeople = clone(fixture.summary);
    withPeople.people = fixture.people.people;
    assert.equal(api.isAiUsageSummaryArtifact(withPeople), false);
    const unavailable = clone(fixture.summary);
    unavailable.totals.amount = null;
    unavailable.totals.tokens.cacheWrite = null;
    assert.equal(api.isAiUsageSummaryArtifact(unavailable), true);
    const converted = clone(fixture.summary);
    converted.currency = 'NZD';
    assert.equal(api.isAiUsageSummaryArtifact(converted), true);
    const badCurrency = clone(fixture.summary);
    badCurrency.currency = 'nzd';
    assert.equal(api.isAiUsageSummaryArtifact(badCurrency), false);
  });

  test(`${format}: people rows require lower-case email and days within the month`, () => {
    const upper = clone(fixture.people);
    upper.people[0].email = 'Megan.Bowen@contoso.example';
    assert.equal(api.isAiUsagePeopleArtifact(upper), false);
    const otherMonth = clone(fixture.people);
    otherMonth.people[0].daily[0].day = '2026-09-30';
    assert.equal(api.isAiUsagePeopleArtifact(otherMonth), false);
  });

  test(`${format}: request message and path builders reject unsafe input`, () => {
    assert.equal(api.isAiUsageCollectRequestMessage({ ...fixture.request, mode: 'delete' }), false);
    assert.equal(api.isAiUsageCollectRequestMessage({ ...fixture.request, companyId: '../x' }), false);
    assert.equal(api.buildAiUsageSummaryPath('contoso-demo', '2026-10'), 'contoso-demo/ai-usage/portal/2026-10/summary.json.gz');
    assert.equal(
      api.buildAiUsageRawPath('contoso-demo', 'openai', 'conn-1', '2026-10-05'),
      'contoso-demo/ai-usage/raw/openai/conn-1/2026-10-05.json.gz'
    );
    assert.throws(() => api.buildAiUsagePeoplePath('../other', '2026-10'));
    assert.throws(() => api.buildAiUsageFactsPath('contoso-demo', '2026-13'));
  });

  test(`${format}: seat rows are validated`, () => {
    assert.equal(api.AI_USAGE_COLLECTED_PROVIDERS.includes('microsoft-365'), true);
    const bad = clone(fixture.people);
    bad.people[1].seats[0].idle = 'yes';
    assert.equal(api.isAiUsagePeopleArtifact(bad), false);
  });

  test(`${format}: story insights carry no person identifiers`, () => {
    const withEmail = clone(fixture.summary);
    withEmail.insights[0].facts.personEmail = 1;
    assert.equal(api.isAiUsageSummaryArtifact(withEmail), false);
    const badKind = clone(fixture.summary);
    badKind.insights[0].kind = 'top_person';
    assert.equal(api.isAiUsageSummaryArtifact(badKind), false);
    for (const field of ['insights', 'daily', 'previousMonth', 'projectedAmount']) {
      const missing = clone(fixture.summary);
      delete missing[field];
      assert.equal(api.isAiUsageSummaryArtifact(missing), false, `summary without ${field}`);
    }
    const rowWithoutProvider = clone(fixture.summary);
    delete rowWithoutProvider.byDepartment[0].provider;
    assert.equal(api.isAiUsageSummaryArtifact(rowWithoutProvider), false);
    const personWithoutSeats = clone(fixture.people);
    delete personWithoutSeats.people[0].seats;
    assert.equal(api.isAiUsagePeopleArtifact(personWithoutSeats), false);
  });

  test(`${format}: OpenAI offers the API Platform and ChatGPT Enterprise credential kinds`, () => {
    assert.deepEqual(api.AI_PROVIDER_CREDENTIAL_KINDS_BY_PROVIDER.openai, ['openai_admin_key', 'openai_enterprise_key']);
    assert.equal(api.isAiProviderCredentialKindFor('openai', 'openai_enterprise_key'), true);
    assert.equal(api.isAiProviderCredentialKindFor('anthropic', 'openai_enterprise_key'), false);
    assert.equal(api.OPENAI_WORKSPACE_ID_PATTERN.test('f7f33107-5fb9-4ee1-8922-3eae76b5b5a0'), true);
    assert.equal(api.OPENAI_WORKSPACE_ID_PATTERN.test('workspace-1'), false);
    assert.equal(api.buildAiProviderReasonCode('openai', 'permission_missing', 'enterprise_usage'), 'openai.permission_missing.enterprise_usage');
    assert.deepEqual(api.parseAiProviderReasonCode('openai.permission_missing.enterprise_members'), { provider: 'openai', kind: 'permission_missing', check: 'enterprise_members' });
    assert.equal(api.OPENAI_ENTERPRISE_API_ORIGIN, 'https://api.chatgpt.com');
  });

  test(`${format}: spend sources, seats, adoption and tags are part of the summary`, () => {
    assert.deepEqual([...api.AI_USAGE_PROVIDERS], ['openai', 'anthropic', 'github', 'azure', 'microsoft-365']);
    assert.deepEqual([...api.AI_USAGE_CONNECTABLE_PROVIDERS], ['openai', 'anthropic', 'github']);
    assert.deepEqual(api.AI_PROVIDER_CREDENTIAL_KINDS_BY_PROVIDER.azure, []);
    for (const field of ['coverage', 'seats', 'activity', 'byTag']) {
      const missing = clone(fixture.summary);
      delete missing[field];
      assert.equal(api.isAiUsageSummaryArtifact(missing), false, `summary without ${field}`);
    }
    const badSource = clone(fixture.summary);
    badSource.coverage[0].source = 'cursor';
    assert.equal(api.isAiUsageSummaryArtifact(badSource), false);
    const noPrevious = clone(fixture.summary);
    delete noPrevious.byDepartment[0].previousAmount;
    assert.equal(api.isAiUsageSummaryArtifact(noPrevious), false);
  });

  test(`${format}: allocations carry a department and tags, and people rows say where the department came from`, () => {
    assert.equal(api.isAiUsageAllocation(fixture.allocation), true);
    assert.equal(api.isPutAiUsageAllocationRequest({ target: { type: 'connection', id: 'conn-openai-1' }, department: 'Finance', tags: {} }), true);
    assert.equal(api.isPutAiUsageAllocationRequest({ target: { type: 'team', id: 'x' }, department: 'Finance', tags: {} }), false);
    assert.equal(api.isPutAiUsageAllocationRequest({ target: { type: 'person', id: 'p1' }, department: ' Finance', tags: {} }), false);
    assert.equal(api.isPutAiUsageAllocationRequest({ target: { type: 'person', id: 'p1' }, department: 'Fin\u0007ance', tags: {} }), false);
    assert.equal(api.isPutAiUsageAllocationRequest({ target: { type: 'person', id: 'p1' }, department: '<b>Finance</b>', tags: {} }), false);
    const tooMany = Object.fromEntries(Array.from({ length: 11 }, (_, i) => [`k${i}`, 'v']));
    assert.equal(api.isAiUsageTags(tooMany), false);
    assert.equal(api.isAiUsageTags({ 'cost-centre': 'R&D' }), true);
    assert.equal(api.isAiUsageTags({ 'bad<key>': 'v' }), false);
    const mismatch = clone(fixture.people);
    mismatch.people[0].departmentSource = null;
    assert.equal(api.isAiUsagePeopleArtifact(mismatch), false);
    const badKind = clone(fixture.people);
    badKind.applications[0].kind = 'robot';
    assert.equal(api.isAiUsagePeopleArtifact(badKind), false);
    assert.equal(api.parseAiProviderReasonCode('openai.already_connected')?.kind, 'already_connected');
  });

  test(`${format}: guards hold the summary to one shape with no personal identifiers`, () => {
    const outOfOrder = clone(fixture.summary);
    outOfOrder.coverage.reverse();
    assert.equal(api.isAiUsageSummaryArtifact(outOfOrder), false, 'coverage out of order');
    const wrongProvider = clone(fixture.summary);
    wrongProvider.coverage[0].provider = 'anthropic';
    assert.equal(api.isAiUsageSummaryArtifact(wrongProvider), false, 'coverage provider must match its source');
    const tooManyIdle = clone(fixture.summary);
    tooManyIdle.seats[0].idle = tooManyIdle.seats[0].paid + 1;
    assert.equal(api.isAiUsageSummaryArtifact(tooManyIdle), false, 'idle seats cannot exceed paid seats');
    const emailLabel = clone(fixture.summary);
    emailLabel.byDepartment[0].label = 'jane.doe@contoso.example';
    assert.equal(api.isAiUsageSummaryArtifact(emailLabel), false, 'no emails in aggregate labels');
    if (fixture.summary.insights.length > 1) {
      const duplicateRank = clone(fixture.summary);
      duplicateRank.insights[1].rank = duplicateRank.insights[0].rank;
      assert.equal(api.isAiUsageSummaryArtifact(duplicateRank), false, 'insight ranks are unique');
    }
    const zeroRank = clone(fixture.summary);
    zeroRank.insights[0].rank = 0;
    assert.equal(api.isAiUsageSummaryArtifact(zeroRank), false, 'ranks start at 1');
    assert.equal(api.isAiUsageTags({ ' padded': 'v' }), false);
    assert.equal(api.isAiUsageTags({ owner: 'jane.doe@contoso.example' }), false);
    assert.equal(api.isAiUsageTags({ owner: 'del\u007f' }), false);
    assert.deepEqual([...api.AI_USAGE_SEAT_PRODUCTS], ['copilot', 'chatgpt', 'microsoft-365-copilot']);
    assert.equal(api.AI_USAGE_SEAT_ACTIVITY_WINDOW_DAYS['microsoft-365-copilot'], 28);
    assert.deepEqual([...api.AI_USAGE_INSIGHT_MONEY_FACTS], ['previousAmount', 'projectedAmount']);
  });

  test(`${format}: people rows check identity kinds, mappings and request counts`, () => {
    const badMapping = clone(fixture.people);
    badMapping.people[0].identities[0].mapping = 'guessed';
    assert.equal(api.isAiUsagePeopleArtifact(badMapping), false);
    const noMapping = clone(fixture.people);
    delete noMapping.people[0].identities[0].mapping;
    assert.equal(api.isAiUsagePeopleArtifact(noMapping), false);
    const badIdentityKind = clone(fixture.people);
    badIdentityKind.people[0].identities[0].kind = 'robot';
    assert.equal(api.isAiUsagePeopleArtifact(badIdentityKind), false);
    if (fixture.people.people[0].daily.length > 0) {
      const noRequests = clone(fixture.people);
      delete noRequests.people[0].daily[0].requests;
      assert.equal(api.isAiUsagePeopleArtifact(noRequests), false);
    }
  });

  test(`${format}: reason codes round-trip and reject unknown vocabulary`, () => {
    assert.equal(api.buildAiProviderReasonCode('openai', 'permission_missing', 'costs'), 'openai.permission_missing.costs');
    assert.deepEqual(api.parseAiProviderReasonCode('anthropic.analytics_unavailable'), { provider: 'anthropic', kind: 'analytics_unavailable', check: null });
    assert.equal(api.parseAiProviderReasonCode('openai.http_500'), null);
    assert.deepEqual(api.parseAiProviderReasonCode('github.not_configured'), { provider: 'github', kind: 'not_configured', check: null });
    assert.equal(api.parseAiProviderReasonCode('openai.permission_missing.costs_user'), null);
  });

  test(`${format}: credential kinds are tied to their provider`, () => {
    assert.equal(api.isAiProviderCredentialKindFor('openai', 'openai_admin_key'), true);
    assert.equal(api.isAiProviderCredentialKindFor('openai', 'anthropic_admin_key'), false);
    assert.equal(api.isAiProviderCredentialKindFor('anthropic', 'anthropic_analytics_key'), true);
  });
}
