import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import {
  skuA,
  skuB,
  skuC,
  accountId,
  snapshot,
  complete,
  commercial,
  summary,
  detail,
  term,
  listReceipt,
  unknownReceipt,
  clone,
} from '../tests/fixtures/microsoft365-optimization-fixtures.mjs';
const require = createRequire(import.meta.url);
const modules = [
  ['CJS', require('../dist/index.js')],
  ['ESM', await import('../dist/esm/entries/root.js')],
];
const coverageId = '77777777-7777-4777-8777-777777777777';
const legacy = {
  schemaVersion: 'microsoft-365-pricing-overrides/v1',
  tenantId: snapshot.tenantId,
  revision: 'prices-1',
  overrides: [],
  updatedAt: snapshot.generatedAt,
};
const price = {
  skuId: skuA,
  currency: 'NZD',
  unitPriceMonthly: 12,
  effectiveFrom: null,
  effectiveTo: null,
  source: 'Customer rate card',
  subscriptionId: null,
  term: 'monthly',
  billingFrequency: 'monthly',
};
const protectionCoverage = {
  id: coverageId,
  providerId: 'crowdstrike',
  capabilityIds: ['endpoint-p1'],
  scope: { kind: 'accounts', accountIds: [accountId] },
  basis: 'customer_confirmed',
  observedAt: snapshot.generatedAt,
  validUntil: '2026-12-01T00:00:00.000Z',
  sourceReference: 'note-1',
};
const optimization = {
  subscriptionTerms: [
    { subscriptionId: 'commerce-1', skuId: skuA, term: 'monthly', billingFrequency: 'monthly', reductionOn: null, autoRenew: true },
  ],
  termPrices: [price, { ...price, unitPriceMonthly: 10, term: 'annual', billingFrequency: 'annual' }],
  protectionCoverage: [protectionCoverage],
};
const document = { ...legacy, schemaVersion: 'microsoft-365-pricing-overrides/v2', companyId: 'company-1', optimization };
const write = { schemaVersion: 'microsoft-365-pricing-write/v2', overrides: [], optimization };
const offer = {
  id: 'monthly-a',
  skuId: skuA,
  countryCode: 'NZ',
  currency: 'NZD',
  term: 'monthly',
  billingFrequency: 'monthly',
  channel: 'mca',
  effectiveFrom: null,
  effectiveTo: null,
  monthlyPremiumAssumptionAllowed: false,
  unitPriceMonthly: 12,
  confidence: 'reference',
  sourceUrl: 'https://www.microsoft.com/en-nz/microsoft-365/',
  checkedAt: snapshot.generatedAt,
};
const catalogue = {
  schemaVersion: 'microsoft-365-optimization-catalogue/v1',
  catalogueVersion: 'catalogue-1',
  coverage: complete,
  products: [skuA, skuB, skuC].map((skuId, index) => ({ skuId, skuPartNumber: `SKU_${index}`, productName: `Product ${index}` })),
  capabilities: [
    { id: 'entra-p1', name: 'Identity protection', group: 'security' },
    { id: 'endpoint-p1', name: 'Endpoint protection', group: 'security' },
  ],
  servicePlans: [],
  providers: [{ id: 'crowdstrike', name: 'CrowdStrike', capabilityIds: ['endpoint-p1'] }],
  referenceOffers: [offer],
  omittedProductCount: 0,
  omittedOfferCount: 0,
};
const management = {
  schemaVersion: 'microsoft-365-optimization-management/v1',
  companyId: 'company-1',
  tenantId: snapshot.tenantId,
  configuration: document,
  catalogue,
  subscriptions: [commercial],
  coverage: complete,
  omittedSubscriptionCount: 0,
};
const preview = {
  schemaVersion: 'microsoft-365-optimization-preview/v1',
  companyId: 'company-1',
  tenantId: snapshot.tenantId,
  revision: 'prices-1',
  canSave: true,
  normalized: write,
  errors: [],
  warnings: [],
  summary,
};
const binding = {
  ...snapshot,
  companyId: 'company-1',
  currency: 'NZD',
  pricingRevision: 'prices-1',
  contextRevision: 'context-1',
  catalogueVersion: 'catalogue-1',
};
const listPage = {
  ...binding,
  schemaVersion: 'microsoft-365-optimization-account-list/v1',
  coverage: complete,
  pageIndex: 0,
  pageCount: 1,
  pageAccountCounts: [1],
  observedAccountCount: 1,
  exactAccountCount: 1,
  findingId: 'group-a',
  accounts: [{ accountId, findings: [{ findingId: 'group-a', kind: 'combine_licenses', qualification: 'eligible' }] }],
};
const history = {
  ...snapshot,
  schemaVersion: 'microsoft-365-optimization-history/v1',
  month: '2026-11',
  catalogueVersion: 'catalogue-1',
  ruleVersion: 'qualification-1',
  coverage: complete,
  subscriptions: [commercial],
  omittedSubscriptionCount: 0,
  quantities: [{ skuId: skuA, assignedSeats: 100, coverage: complete }],
  omittedProductCount: 0,
};

for (const [format, api] of modules) {
  test(`${format}: a single package supplies configuration, catalogue, history and read-state guards`, () => {
    for (const name of [
      'isMicrosoft365OptimizationConfigurationInput',
      'isMicrosoft365PricingConfigurationDocument',
      'isMicrosoft365OptimizationConfigurationWriteRequest',
      'isMicrosoft365OptimizationCatalogue',
      'isMicrosoft365OptimizationManagementResponse',
      'isMicrosoft365OptimizationConfigurationPreview',
      'isMicrosoft365OptimizationHistorySnapshot',
      'isMicrosoft365OptimizationProjectionBinding',
      'isMicrosoft365OptimizationAccountReadRequest',
      'isMicrosoft365OptimizationAccountListRequest',
      'isMicrosoft365OptimizationSummaryResponse',
      'isMicrosoft365OptimizationAccountResponse',
      'isMicrosoft365OptimizationAccountListResponse',
    ])
      assert.equal(typeof api[name], 'function', name);
  });
  test(`${format}: Manage Pricing saves legacy rates and all new context atomically without widening v1`, () => {
    assert(api.isMicrosoft365OptimizationConfigurationInput(optimization));
    assert(api.isMicrosoft365PricingConfigurationDocument(legacy));
    assert(api.isMicrosoft365PricingConfigurationDocument(document));
    assert(!api.isMicrosoft365PricingOverridesConfiguration(document));
    assert(!api.isMicrosoft365PricingOverridesConfiguration({ ...legacy, optimization }));
    assert(api.isMicrosoft365OptimizationConfigurationWriteRequest(write));
    for (const patch of [{ updatedBy: 'someone' }, { revision: 'client-etag' }, { companyId: 'company-other' }, { tenantId: snapshot.tenantId }])
      assert(!api.isMicrosoft365OptimizationConfigurationWriteRequest({ ...write, ...patch }));
    assert(
      !api.isMicrosoft365PricingConfigurationDocument({
        ...document,
        optimization: { ...optimization, subscriptionTerms: [...optimization.subscriptionTerms, optimization.subscriptionTerms[0]] },
      })
    );
  });
  test(`${format}: prices distinguish term, payment frequency, subscription scope and effective intervals`, () => {
    assert(
      api.isMicrosoft365OptimizationConfigurationInput({
        ...optimization,
        termPrices: [...optimization.termPrices, { ...price, subscriptionId: 'commerce-1' }],
      })
    );
    assert(api.isMicrosoft365OptimizationConfigurationInput({ ...optimization, termPrices: [{ ...price, unitPriceMonthly: 0 }] }));
    for (const patch of [
      { billingFrequency: 'annual' },
      { unitPriceMonthly: -1 },
      { unitPriceMonthly: null },
      { currency: 'nzd' },
      { effectiveFrom: '2026-02-30' },
      { effectiveTo: '2026-01-01', effectiveFrom: '2026-02-01' },
    ])
      assert(!api.isMicrosoft365OptimizationConfigurationInput({ ...optimization, termPrices: [{ ...price, ...patch }] }));
    assert(!api.isMicrosoft365OptimizationConfigurationInput({ ...optimization, termPrices: [price, price] }));
    assert(
      api.isMicrosoft365OptimizationConfigurationInput({
        ...optimization,
        termPrices: [
          { ...price, effectiveTo: '2026-11-01' },
          { ...price, effectiveFrom: '2026-11-01' },
        ],
      })
    );
  });
  test(`${format}: protection confirmations retain scoped source evidence and cannot impersonate measured deployment`, () => {
    for (const scope of [
      { kind: 'tenant', unit: 'accounts' },
      { kind: 'tenant', unit: 'devices' },
      { kind: 'devices', identitySource: 'entra', deviceIds: [accountId] },
      { kind: 'devices', identitySource: 'customer', deviceIds: ['asset-1'] },
    ])
      assert(api.isMicrosoft365OptimizationConfigurationInput({ ...optimization, protectionCoverage: [{ ...protectionCoverage, scope }] }));
    for (const patch of [
      { basis: 'discovery_hint' },
      { basis: 'observed' },
      { updatedBy: 'manager' },
      { validUntil: snapshot.generatedAt },
      { scope: { kind: 'accounts', accountIds: [] } },
      { scope: { kind: 'accounts', accountIds: [accountId, accountId] } },
      { scope: { kind: 'devices', identitySource: 'entra', deviceIds: ['asset-1'] } },
    ])
      assert(!api.isMicrosoft365OptimizationConfigurationInput({ ...optimization, protectionCoverage: [{ ...protectionCoverage, ...patch }] }));
    assert(!api.isMicrosoft365OptimizationConfigurationInput({ ...optimization, protectionCoverage: [protectionCoverage, protectionCoverage] }));
  });
  test(`${format}: manager reads and previews preserve company scope and reject false save results`, () => {
    assert(api.isMicrosoft365OptimizationManagementResponse(management));
    assert(api.isMicrosoft365OptimizationManagementResponse({ ...management, configuration: legacy }));
    assert(
      api.isMicrosoft365OptimizationManagementResponse({
        ...management,
        configuration: { ...legacy, updatedAt: null },
        unavailableReason: 'invalid_configuration',
      })
    );
    assert(!api.isMicrosoft365OptimizationManagementResponse({ ...management, unavailableReason: 'invalid_configuration' }));
    assert(api.isMicrosoft365OptimizationConfigurationPreview(preview));
    assert(!api.isMicrosoft365OptimizationManagementResponse({ ...management, companyId: 'company-other' }));
    assert(!api.isMicrosoft365OptimizationManagementResponse({ ...management, subscriptions: [{ ...commercial, termSource: 'recorded' }] }));
    assert(
      !api.isMicrosoft365OptimizationConfigurationPreview({
        ...preview,
        errors: [{ path: 'optimization.termPrices[0]', code: 'invalid_price', message: 'Invalid price' }],
      })
    );
    assert(
      api.isMicrosoft365OptimizationConfigurationPreview({
        ...preview,
        canSave: false,
        normalized: null,
        summary: null,
        errors: [{ path: 'optimization.termPrices[0]', code: 'invalid_price', message: 'Invalid price' }],
      })
    );
    assert(!api.isMicrosoft365OptimizationConfigurationPreview({ ...preview, summary: { ...summary, companyId: 'company-other' } }));
  });
  test(`${format}: reference metadata resolves unheld targets and multi-term quotes with immutable provenance`, () => {
    assert(api.isMicrosoft365OptimizationCatalogue(catalogue));
    assert(
      api.isMicrosoft365OptimizationCatalogue({
        ...catalogue,
        referenceOffers: [offer, { ...offer, id: 'annual-a', term: 'annual', billingFrequency: 'annual', unitPriceMonthly: 10 }],
      })
    );
    for (const patch of [
      { sourceUrl: 'javascript:alert(1)' },
      { unitPriceMonthly: 12, confidence: 'unknown' },
      { countryCode: 'nzd' },
      { skuId: accountId },
    ])
      assert(!api.isMicrosoft365OptimizationCatalogue({ ...catalogue, referenceOffers: [{ ...offer, ...patch }] }));
    assert(!api.isMicrosoft365OptimizationCatalogue({ ...catalogue, providers: [{ ...catalogue.providers[0], accountIds: [accountId] }] }));
    assert(!api.isMicrosoft365OptimizationCatalogue({ ...catalogue, products: [catalogue.products[0], catalogue.products[0]] }));
  });
  test(`${format}: ready and stale readers cannot mix revisions, metadata or person data`, () => {
    const ready = { schemaVersion: 'microsoft-365-optimization-summary-response/v1', state: 'ready', summary, catalogue };
    assert(api.isMicrosoft365OptimizationSummaryResponse(ready));
    assert(!api.isMicrosoft365OptimizationSummaryResponse({ ...ready, catalogue: { ...catalogue, catalogueVersion: 'different' } }));
    assert(api.isMicrosoft365OptimizationAccountReadRequest({ accountId, expected: binding }));
    assert(!api.isMicrosoft365OptimizationAccountReadRequest({ accountId, expected: { tenantId: snapshot.tenantId } }));
    assert(api.isMicrosoft365OptimizationAccountListRequest({ findingId: 'group-a', pageIndex: 0, expected: binding }));
    assert(
      api.isMicrosoft365OptimizationAccountResponse({
        schemaVersion: 'microsoft-365-optimization-account-response/v1',
        state: 'ready',
        account: detail,
      })
    );
    for (const state of ['not_collected', 'stale', 'unavailable']) {
      const result = {
        schemaVersion: 'microsoft-365-optimization-summary-response/v1',
        state,
        companyId: 'company-1',
        tenantId: snapshot.tenantId,
        reasonCodes: ['scan_unavailable'],
        current: binding,
      };
      assert(api.isMicrosoft365OptimizationSummaryResponse(result));
      assert(!api.isMicrosoft365OptimizationSummaryResponse({ ...result, summary }));
      assert(!api.isMicrosoft365OptimizationSummaryResponse({ ...result, accountIds: [accountId] }));
      assert(!api.isMicrosoft365OptimizationSummaryResponse({ ...result, current: { ...binding, companyId: 'company-other' } }));
    }
  });
  test(`${format}: filtered account pages carry finding references without fabricated averages`, () => {
    const response = { schemaVersion: 'microsoft-365-optimization-account-list-response/v1', state: 'ready', page: listPage };
    assert(api.isMicrosoft365OptimizationAccountListResponse(response));
    for (const patch of [
      { pageIndex: 1 },
      { exactAccountCount: 2 },
      { findingId: 'different' },
      { accounts: [{ ...listPage.accounts[0], monthlySaving: 20 }] },
    ])
      assert(!api.isMicrosoft365OptimizationAccountListResponse({ ...response, page: { ...listPage, ...patch } }));
  });
  test(`${format}: monthly history retains commercial identities and quantities without money, people or customer terms`, () => {
    assert(api.isMicrosoft365OptimizationHistorySnapshot(history));
    for (const patch of [
      { month: '2026-10' },
      { accounts: [{ accountId }] },
      { pricing: { currency: 'NZD' } },
      { subscriptions: [{ ...commercial, termSource: 'recorded' }] },
      { quantities: [{ skuId: skuA, assignedSeats: null, coverage: complete }] },
    ])
      assert(!api.isMicrosoft365OptimizationHistorySnapshot({ ...history, ...patch }));
    assert(
      api.isMicrosoft365OptimizationHistorySnapshot({
        ...history,
        coverage: { state: 'partial', reasonCodes: ['assignments_unknown'] },
        quantities: [{ skuId: skuA, assignedSeats: null, coverage: { state: 'unavailable', reasonCodes: ['not_collected'] } }],
      })
    );
  });
  test(`${format}: storage and management input bounds reject identity injection and oversized arrays`, () => {
    assert(
      !api.isMicrosoft365OptimizationConfigurationInput({ ...optimization, subscriptionTerms: Array(1001).fill(optimization.subscriptionTerms[0]) })
    );
    assert(
      !api.isMicrosoft365OptimizationConfigurationInput({
        ...optimization,
        protectionCoverage: [{ ...protectionCoverage, scope: { kind: 'accounts', accountIds: Array(1001).fill(accountId) } }],
      })
    );
    assert(!api.isMicrosoft365PricingConfigurationDocument({ ...document, sourceAccounts: [accountId] }));
    assert(!api.isMicrosoft365OptimizationConfigurationInput(Object.create(optimization)));
    assert(!api.isMicrosoft365OptimizationConfigurationInput({ ...optimization, termPrices: Array(1) }));
    const confirmations = Array.from({ length: 32 }, (_, index) => ({
      ...protectionCoverage,
      id: `77777777-7777-4777-8777-${index.toString(16).padStart(12, '0')}`,
    }));
    assert(api.isMicrosoft365OptimizationConfigurationInput({ ...optimization, protectionCoverage: confirmations }));
    const identities = Array.from({ length: 1000 }, (_, index) => `88888888-8888-4888-8888-${index.toString(16).padStart(12, '0')}`);
    const oversized = {
      ...optimization,
      protectionCoverage: confirmations.map(item => ({ ...item, scope: { kind: 'accounts', accountIds: identities } })),
    };
    assert(Buffer.byteLength(JSON.stringify(oversized), 'utf8') > api.MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS.configurationBytes);
    assert(!api.isMicrosoft365OptimizationConfigurationInput(oversized));
    const bad = clone(catalogue);
    bad.referenceOffers[0].checkedAt = '2026-02-30T00:00:00Z';
    assert(!api.isMicrosoft365OptimizationCatalogue(bad));
  });
  test(`${format}: reviewed offers have unambiguous effective intervals, channels and dated provenance`, () => {
    for (const patch of [{ checkedAt: null }, { channel: 'unknown' }, { monthlyPremiumAssumptionAllowed: true }])
      assert(!api.isMicrosoft365OptimizationCatalogue({ ...catalogue, referenceOffers: [{ ...offer, ...patch }] }));
    assert(
      !api.isMicrosoft365OptimizationCatalogue({ ...catalogue, referenceOffers: [offer, { ...offer, id: 'duplicate', unitPriceMonthly: 999 }] })
    );
    assert(
      api.isMicrosoft365OptimizationCatalogue({
        ...catalogue,
        referenceOffers: [
          { ...offer, effectiveTo: '2026-11-01' },
          { ...offer, id: 'later', effectiveFrom: '2026-11-01' },
        ],
      })
    );
    assert(api.isMicrosoft365OptimizationCatalogue({ ...catalogue, referenceOffers: [offer, { ...offer, id: 'csp', channel: 'csp' }] }));
    assert(!api.isMicrosoft365OptimizationCatalogue({ ...catalogue, providers: [{ ...catalogue.providers[0], capabilityIds: ['unknown'] }] }));
    assert(!api.isMicrosoft365OptimizationCatalogue({ ...catalogue, omittedOfferCount: 1 }));
  });
  test(`${format}: projected price receipts qualify a monthly premium and preserve report provenance`, () => {
    const finding = {
      ...term,
      priceMethod: 'assumed_20_percent',
      sourcePrice: { ...term.sourcePrice, source: 'unavailable', unitPriceMonthly: null, receipt: unknownReceipt },
    };
    const view = { ...summary, groups: [finding], portfolioMonthlySaving: 190, protectionMonthlyInvestment: 0 };
    assert(api.isMicrosoft365OptimizationSummary(view));
    for (const receipt of [
      { ...finding.targetPrice.receipt, confidence: 'reference' },
      { ...finding.targetPrice.receipt, monthlyPremiumAssumptionAllowed: false },
      { ...finding.targetPrice.receipt, channel: 'enterprise_agreement' },
      { ...finding.targetPrice.receipt, offerId: null },
    ])
      assert(!api.isMicrosoft365OptimizationSummary({ ...view, groups: [{ ...finding, targetPrice: { ...finding.targetPrice, receipt } }] }));
    const noReceipt = clone(summary);
    delete noReceipt.groups[0].options[0].unitPrices[0].receipt;
    assert(!api.isMicrosoft365OptimizationSummary(noReceipt));
    for (const document of [summary, detail]) {
      const missing = clone(document);
      delete missing.catalogueVersion;
      assert(!(missing.accountId ? api.isMicrosoft365OptimizationAccountDetail(missing) : api.isMicrosoft365OptimizationSummary(missing)));
    }
  });
  test(`${format}: large term groups preserve every subscription and disclose omissions without money`, () => {
    const many = {
      ...term,
      subscriptions: Array.from({ length: 100 }, (_, index) => ({ ...term.subscriptions[0], subscriptionId: `subscription-${index}`, quantity: 1 })),
    };
    const view = { ...summary, groups: [many], portfolioMonthlySaving: 190, protectionMonthlyInvestment: 0 };
    assert(api.isMicrosoft365OptimizationSummary(view));
    assert(!api.isMicrosoft365OptimizationSummary({ ...view, groups: [{ ...many, omittedSubscriptionCount: 1 }] }));
    assert(
      api.isMicrosoft365OptimizationSummary({
        ...view,
        portfolioMonthlySaving: null,
        groups: [
          {
            ...many,
            qualification: 'conditional',
            blockedBy: ['subscriptions_omitted'],
            omittedSubscriptionCount: 1,
            scenarioMonthlySaving: null,
            portfolioMonthlySaving: null,
          },
        ],
      })
    );
  });
  test(`${format}: monthly history preserves qualification versions and rejects stale or future commercial observations`, () => {
    for (const patch of [
      { ruleVersion: undefined },
      { catalogueVersion: undefined },
      { subscriptions: [{ ...commercial, observedAt: '2026-10-01T00:00:00Z' }] },
      { subscriptions: [{ ...commercial, observedAt: '2026-11-06T00:00:00Z' }] },
    ])
      assert(!api.isMicrosoft365OptimizationHistorySnapshot({ ...history, ...patch }));
    for (const name of [
      'catalogueBytes',
      'summaryResponseBytes',
      'managementResponseBytes',
      'previewBytes',
      'historyBytes',
      'accountListBytes',
      'accountResponseBytes',
    ])
      assert(Number.isSafeInteger(api.MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS[name]));
  });
  test(`${format}: authored subscription prices cannot bind one commercial identity to several products`, () => {
    const specific = { ...price, subscriptionId: 'commerce-new' };
    assert(
      !api.isMicrosoft365OptimizationConfigurationInput({ ...optimization, termPrices: [specific, { ...specific, skuId: skuB, term: 'annual' }] })
    );
    assert(
      !api.isMicrosoft365OptimizationConfigurationInput({ ...optimization, termPrices: [{ ...price, subscriptionId: 'commerce-1', skuId: skuB }] })
    );
    assert(
      api.isMicrosoft365OptimizationConfigurationInput({
        ...optimization,
        subscriptionTerms: [{ ...optimization.subscriptionTerms[0], subscriptionId: 'null' }],
        termPrices: [{ ...price, skuId: skuB }],
      })
    );
    assert(!api.isMicrosoft365OptimizationConfigurationInput({ ...optimization, termPrices: [{ ...price, source: 'Bad\u202erate' }] }));
    assert(api.isMicrosoft365OptimizationConfigurationWriteRequest({ ...write, agreementTerms: null }));
    assert(!api.isMicrosoft365OptimizationConfigurationWriteRequest({ ...write, agreementTerms: {} }));
    assert(!api.isMicrosoft365OptimizationManagementResponse({ ...management, configuration: { ...document, tenantId: accountId } }));
  });
  test(`${format}: account and account-list not-ready variants reject embedded payloads and scope mixing`, () => {
    for (const [guard, schema, payload] of [
      [api.isMicrosoft365OptimizationAccountResponse, 'account', { account: detail }],
      [api.isMicrosoft365OptimizationAccountListResponse, 'account-list', { page: listPage }],
    ])
      for (const state of ['not_collected', 'stale', 'unavailable']) {
        const response = {
          schemaVersion: `microsoft-365-optimization-${schema}-response/v1`,
          state,
          companyId: 'company-1',
          tenantId: snapshot.tenantId,
          reasonCodes: ['not_ready'],
          current: null,
        };
        assert(guard(response));
        assert(!guard({ ...response, ...payload }));
        assert(!guard({ ...response, current: { ...binding, tenantId: accountId } }));
      }
  });
}
