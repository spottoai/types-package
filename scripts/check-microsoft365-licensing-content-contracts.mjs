import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const formats = { commonjs: require('../dist/index.js'), esm: await import('../dist/esm/entries/root.js') };
const fixture = JSON.parse(readFileSync(new URL('../tests/fixtures/microsoft365-licensing-content.json', import.meta.url), 'utf8'));
const changed = mutation => {
  const value = structuredClone(fixture);
  mutation(value);
  return value;
};

for (const [format, api] of Object.entries(formats)) {
  test(`${format}: exports licensing content and component guards`, () => {
    for (const name of [
      'isMicrosoft365LicensingContent',
      'isMicrosoft365ContentAvailability',
      'isMicrosoft365SharePointStorage',
      'isMicrosoft365OneDriveStorage',
      'isMicrosoft365AccountLifecycle',
      'isMicrosoft365AccountDisableEvidence',
      'isMicrosoft365RelatedSpendView',
      'isMicrosoft365RelatedSpendAmount',
      'isMicrosoft365RelatedSpendMeter',
      'isMicrosoft365RelatedSpendProduct',
      'isMicrosoft365RelatedSpendCoverage',
    ])
      assert.equal(typeof api[name], 'function', name);
  });

  test(`${format}: accepts actual synthetic producer output, preserving mismatched usage and partial spend`, () => {
    assert.equal(api.isMicrosoft365LicensingContent(fixture), true);
    assert.equal(fixture.oneDrive.reconciliation.state, 'mismatch');
    assert.equal(fixture.relatedSpend.currencies[0].products[0].billed.state, 'partial');
  });

  test(`${format}: accepts Security Copilot capacity and overage alongside existing categories`, () => {
    const value = changed(value => {
      const product = structuredClone(value.relatedSpend.currencies[0].products[0]);
      product.category = 'security-copilot';
      product.billed = { amount: 125.5, state: 'partial', reasonCodes: ['incomplete_subscription_coverage'] };
      product.amortized = { amount: null, state: 'unavailable', reasonCodes: ['missing_amortized_amount'] };
      product.matchedRowCount = 2;
      product.meters = ['Synthetic provisioned capacity', 'Synthetic overage'].map(meterName => ({
        ...structuredClone(product.meters[0]),
        meterName,
        rowCount: 1,
      }));
      value.relatedSpend.currencies[0].products.push(product);
      Object.assign(value.relatedSpend.subscriptions[0], { sourceRowCount: 3, retainedRowCount: 3, matchedRowCount: 3, inWindowRowCount: 3 });
    });
    const security = value.relatedSpend.currencies[0].products[1];
    assert.equal(api.isMicrosoft365RelatedSpendProduct(security), true);
    assert.equal(api.isMicrosoft365RelatedSpendView(value.relatedSpend), true);
    assert.equal(api.isMicrosoft365LicensingContent(value), true);
    assert.equal(security.billed.amount, 125.5);
    assert.equal(security.amortized.amount, null);
    assert.equal(security.meters.length, 2);
    assert.equal(value.relatedSpend.currencies[0].products[0].category, fixture.relatedSpend.currencies[0].products[0].category);
  });

  test(`${format}: keeps Security Copilot zero charges and signed corrections distinct from unavailable money`, () => {
    const value = changed(value => {
      value.relatedSpend.currencies[0].products[0].category = 'security-copilot';
    });
    const product = value.relatedSpend.currencies[0].products[0];
    product.billed.amount = 0;
    assert.equal(api.isMicrosoft365LicensingContent(value), true);
    product.billed.amount = -2.75;
    assert.equal(api.isMicrosoft365LicensingContent(value), true);
    product.amortized = { amount: null, state: 'unavailable', reasonCodes: ['missing_amortized_amount'] };
    assert.equal(api.isMicrosoft365LicensingContent(value), true);
    product.amortized.amount = 0;
    assert.equal(api.isMicrosoft365LicensingContent(value), false);
  });

  const invalid = [
    ['wrong schema', value => (value.schemaVersion = 'microsoft-365-license-summary/v1')],
    ['missing account lifecycle', value => delete value.accountLifecycle],
    ['missing measures', value => delete value.measures],
    ['invalid scan date', value => (value.generatedAt = 'not-a-date')],
    ['mixed source scan', value => (value.licenseEvidence.tenantSyncRunId = 'another-run')],
    ['mixed spend publication', value => (value.relatedSpend.generatedAt = '2026-01-01T00:00:00Z')],
    ['unbounded site detail', value => (value.sharePoint.sites.rows = Array(101).fill(value.sharePoint.sites.rows[0]))],
    ['duplicate large accounts', value => (value.accountLifecycle.accounts = Array(25001).fill(value.accountLifecycle.accounts[0]))],
    ['duplicate accounts', value => value.accountLifecycle.accounts.push(value.accountLifecycle.accounts[0])],
    ['negative storage', value => (value.oneDrive.detail.activeUsedBytes = -1)],
    ['unsafe byte count', value => (value.sharePoint.usage.totalUsedBytes = Number.MAX_SAFE_INTEGER + 1)],
    ['non-finite money', value => (value.relatedSpend.currencies[0].products[0].billed.amount = Infinity)],
    ['unknown currency', value => (value.relatedSpend.currencies[0].currency = '')],
    ['duplicate currency', value => value.relatedSpend.currencies.push(value.relatedSpend.currencies[0])],
    ['duplicate subscription', value => value.relatedSpend.subscriptions.push(value.relatedSpend.subscriptions[0])],
    ['invalid subscription counts', value => (value.omittedSubscriptionCount = value.expectedSubscriptionCount + 1)],
    [
      'omitted scopes with complete values',
      value => {
        value.omittedSubscriptionCount = 1;
        value.expectedSubscriptionCount++;
        Object.assign(value.relatedSpend.subscriptions[0], { state: 'complete', reasonCodes: [] });
        Object.assign(value.relatedSpend.availability, { state: 'partial', reasonCodes: ['subscription_limit'] });
        value.relatedSpend.currencies[0].products[0].billed.state = 'complete';
      },
    ],
    [
      'whitespace duplicate scopes',
      value => {
        value.relatedSpend.subscriptions.push({
          ...value.relatedSpend.subscriptions[0],
          subscriptionId: ' ' + value.relatedSpend.subscriptions[0].subscriptionId + ' ',
        });
        value.expectedSubscriptionCount++;
      },
    ],
    ['complete unknown money', value => Object.assign(value.relatedSpend.currencies[0].products[0].billed, { state: 'complete', amount: null })],
    ['unavailable numeric money', value => (value.relatedSpend.currencies[0].products[0].billed.state = 'unavailable')],
    ['unknown availability', value => (value.measures.inventory.state = 'success')],
    ['array availability enum', value => (value.measures.inventory.state = ['available'])],
    ['throwing enum coercion', value => (value.measures.inventory.state = { toString: null })],
    ['array category enum', value => (value.relatedSpend.currencies[0].products[0].category = ['github-other'])],
    [
      'unavailable storage total',
      value =>
        Object.assign(value.sharePoint.usage, { availability: { ...value.sharePoint.usage.availability, state: 'unavailable' }, totalUsedBytes: 42 }),
    ],
    [
      'partial entitlement complete total',
      value =>
        Object.assign(value.sharePoint.entitlement, {
          availability: { ...value.sharePoint.entitlement.availability, state: 'partial', reasonCodes: ['unreviewed_storage_skus'] },
          unknownSkuPartNumbers: ['UNKNOWN'],
          calculatedEntitlementBytes: 1,
        }),
    ],
    [
      'unitless known quantity',
      value => Object.assign(value.relatedSpend.currencies[0].products[0].meters[0], { unit: null, quantity: 100, quantityState: 'complete' }),
    ],
    [
      'case duplicate scopes',
      value => {
        value.relatedSpend.subscriptions.push({
          ...value.relatedSpend.subscriptions[0],
          subscriptionId: value.relatedSpend.subscriptions[0].subscriptionId.toUpperCase(),
        });
        value.expectedSubscriptionCount++;
      },
    ],
    ['retained count exceeds source', value => Object.assign(value.relatedSpend.subscriptions[0], { retainedRowCount: 400, sourceRowCount: 0 })],
    [
      'available failed-only billing',
      value => {
        value.relatedSpend.subscriptions[0].state = 'failed';
        value.relatedSpend.subscriptions[0].recordsState = 'missing';
        value.relatedSpend.availability.state = 'available';
        value.relatedSpend.currencies = [];
      },
    ],
    ['wrong permissions shape', value => (value.measures.inventory.requiredPermissions = 'Reports.Read.All')],
    ['raw report leak', value => (value.sources = { users: [] })],
    ['nested person leak', value => (value.oneDrive.detail.userPrincipalName = 'private@example.test')],
    ['audit actor leak', value => (value.accountLifecycle.accounts[0].initiatedBy = { displayName: 'PRIVATE' })],
    ['known date without event', value => (value.accountLifecycle.accounts[0].evidence = null)],
    ['enabled account with disabled date', value => (value.accountLifecycle.accounts[0].accountEnabled = true)],
    ['unknown date retaining evidence', value => (value.accountLifecycle.accounts[0].disabledAtStatus = 'unknown')],
    ['partial audit proving date', value => (value.accountLifecycle.auditHistory.availability.state = 'partial')],
    ['date outside retained request', value => (value.accountLifecycle.accounts[0].disabledAt = '2020-01-01T00:00:00Z')],
    ['invented authoritative quota', value => (value.sharePoint.entitlement.authoritativeQuotaBytes = 100)],
    ['concealed site identity', value => (value.sharePoint.sites.rows[0].siteId = 'private-site')],
    ['mismatch with zero difference', value => (value.oneDrive.reconciliation.deltaBytes = 0)],
    ['matched with nonzero difference', value => (value.oneDrive.reconciliation.state = 'matched')],
    ['nonsensical report day', value => (value.sharePoint.usage.latestReportDate = '2026-02-31')],
    ['unknown spend category', value => (value.relatedSpend.currencies[0].products[0].category = 'generic-openai')],
    ['noncanonical Security Copilot category', value => (value.relatedSpend.currencies[0].products[0].category = 'Security Copilot')],
    [
      'invented Security Copilot capacity category',
      value => (value.relatedSpend.currencies[0].products[0].category = 'security-copilot-provisioned'),
    ],
  ];
  for (const [name, mutation] of invalid)
    test(`${format}: rejects ${name}`, () => assert.equal(api.isMicrosoft365LicensingContent(changed(mutation)), false));

  test(`${format}: permits zero, signed billing corrections and independent missing amortized evidence`, () => {
    const value = changed(value => {
      const product = value.relatedSpend.currencies[0].products[0];
      Object.assign(value.relatedSpend.subscriptions[0], { state: 'complete', reasonCodes: [] });
      value.relatedSpend.availability.reasonCodes = ['missing_amortized_amount'];
      product.billed = { amount: 0, state: 'complete', reasonCodes: [] };
      product.amortized = { amount: null, state: 'unavailable', reasonCodes: ['missing_amortized_amount'] };
    });
    assert.equal(api.isMicrosoft365LicensingContent(value), true);
    value.relatedSpend.currencies[0].products[0].billed.amount = -5.25;
    assert.equal(api.isMicrosoft365LicensingContent(value), true);
  });

  test(`${format}: accepts a fully reconstructed directory above the per-slice collection budget`, () => {
    const value = changed(
      value =>
        (value.accountLifecycle.accounts = Array.from({ length: 25001 }, (_, index) => ({
          accountId: `fictional-${index}`,
          accountEnabled: true,
          disabledAt: null,
          disabledAtStatus: 'not_disabled',
          reasonCodes: [],
          evidence: null,
        })))
    );
    assert.equal(api.isMicrosoft365LicensingContent(value), true);
  });

  test(`${format}: accepts the collector's bounded 2048-character billing metadata`, () => {
    const value = changed(value =>
      Object.assign(value.relatedSpend.currencies[0].products[0].meters[0], {
        meterId: 'i'.repeat(2048),
        meterName: 'm'.repeat(2048),
        unit: 'u'.repeat(2048),
      })
    );
    assert.equal(api.isMicrosoft365LicensingContent(value), true);
  });

  test(`${format}: accepts unknown disable dates without manufacturing a timestamp`, () => {
    const value = changed(value => {
      const account = value.accountLifecycle.accounts[0];
      Object.assign(account, {
        disabledAt: null,
        disabledAtStatus: 'unknown',
        reasonCodes: ['disable_event_not_in_retained_history'],
        evidence: null,
      });
      value.accountLifecycle.auditHistory.availability = {
        state: 'unavailable',
        reasonCodes: ['access_denied'],
        requiredPermissions: ['AuditLog.Read.All'],
        observedAt: null,
      };
    });
    assert.equal(api.isMicrosoft365LicensingContent(value), true);
  });

  test(`${format}: accepts independently denied storage without losing other content`, () => {
    const value = changed(value => {
      Object.assign(value.sharePoint.usage, {
        availability: { state: 'unavailable', reasonCodes: ['access_denied'], requiredPermissions: ['Reports.Read.All'], observedAt: null },
        totalUsedBytes: null,
        reportRefreshDate: null,
        latestReportDate: null,
        trend: [],
        omittedTrendCount: 0,
      });
    });
    assert.equal(api.isMicrosoft365LicensingContent(value), true);
  });
}
