import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const formats = {
  commonjs: require('../dist/index.js'),
  esm: await import('../dist/esm/entries/root.js'),
};
const clone = value => structuredClone(value);
const coverage = () => ({
  state: 'complete',
  requiredPermissions: [],
  attemptedAt: '2026-10-13T00:00:00Z',
  observedAt: '2026-10-13T00:00:00Z',
  recovery: { action: 'none', optional: false },
  observedRowCount: 1,
  omittedRowCount: 0,
});
const productUsage = () => ({ active: 1, inactive: 0, noRecordedActivity: 0, unknown: 0, signedInButNoOfficeActivity: 0 });
const summaryUsage = () => ({
  evidence: 'available',
  reportRefreshDate: '2026-10-12',
  windowDays: 30,
  enabledLicensedAccountCount: 1,
  matchedAccountCount: 1,
  status: { active: 1, inactive: 0, noRecordedActivity: 0, unknown: 0 },
  signedInButNoOfficeActivityCount: 0,
  workloadActive: { exchange: 1, oneDrive: 0, sharePoint: 0, teams: 0, vivaEngage: 0 },
  platforms: { windows: 0, mac: 0, web: 1, mobile: 0, webOrMobileOnly: 1, noApps: 0 },
  mailbox: { measuredCount: 1, totalUsedBytes: 0, overF3LimitCount: 0 },
  oneDrive: { measuredCount: 1, totalUsedBytes: 0, overF3LimitCount: 0 },
  copilot: { licensedAccountCount: 1, activeAccountCount: 0, idleAccountCount: 1 },
  signIn: { neverSignedInCount: 0, newAccountCount: 0, guestWithPaidLicenseCount: 0 },
  dailyActive: [{ date: '2026-10-12', office365: 1, exchange: 1, oneDrive: null, sharePoint: 0, teams: 0 }],
});
const profile = () => ({
  department: 'Finance',
  jobTitle: null,
  officeLocation: null,
  city: null,
  country: null,
  usageLocation: 'AU',
  companyName: null,
  domain: 'contoso.com',
});
const accountUsage = () => ({
  status: 'active',
  lastActivityDate: '2026-10-12',
  workloads: { exchange: '2026-10-12', oneDrive: null, sharePoint: null, teams: null, vivaEngage: null },
  platforms: { windows: false, mac: false, web: true, mobile: null },
  mailbox: { usedBytes: 0, quotaBytes: 2147483648, hasArchive: false },
  oneDrive: { usedBytes: 0, allocatedBytes: 2147483648 },
  copilotLastActivityDate: null,
});
const license = () => ({
  skuId: 'sku-one',
  skuPartNumber: 'SPE_E3',
  appliesTo: 'User',
  capabilityStatus: 'Enabled',
  enabledUnits: 1,
  consumedUnits: 1,
  unallocatedUnits: 0,
  warningUnits: 0,
  suspendedUnits: 0,
});
const account = () => ({
  id: 'account-one',
  displayName: 'Fictional Account',
  userPrincipalName: 'fictional@contoso.com',
  accountEnabled: true,
  skuIds: ['sku-one'],
  lastSuccessfulSignInAt: '2026-10-12T00:00:00Z',
  signInOlderThan90Days: false,
});
const view = () => ({
  schemaVersion: 'microsoft-365-license-view/v1',
  tenantId: 'tenant-one',
  generatedAt: '2026-10-13T00:00:00Z',
  coverage: Object.fromEntries(
    ['subscribedSkus', 'users', 'signInActivity', 'reportSettings', 'officeActiveUsers', 'officeAppUsage', 'copilotUsage'].map(source => [
      source,
      coverage(),
    ])
  ),
  reportIdentity: { concealment: 'identifiable', correlation: 'not_performed' },
  summary: { productCount: 1, licensedAccountCount: 1, disabledLicensedAccountCount: 0, accountsWithUnknownAssignments: 0 },
  accounts: [account()],
  licenses: [license()],
  reports: { officeActiveUsers: [], officeAppUsage: [], copilotUsage: [] },
});
const pricing = () => ({
  basis: 'list_price_estimate',
  priceListVersion: 'fictional',
  currency: 'AUD',
  currencyFallback: false,
  term: 'annual_commitment',
  products: [
    {
      skuId: 'sku-one',
      skuPartNumber: 'SPE_E3',
      productName: 'Fictional Product',
      family: 'microsoft365',
      category: 'paid',
      priceConfidence: null,
      unitPriceMonthly: 10,
      purchasedUnits: 1,
      assignedUnits: 1,
      unassignedUnits: 0,
      disabledAccountUnits: 0,
      inactiveAccountUnits: 0,
      monthlyCost: 10,
      unassignedMonthlyCost: 0,
      disabledMonthlyCost: 0,
      inactiveMonthlyCost: 0,
    },
  ],
  accountMonthlyCosts: {},
  summary: {
    paidProductCount: 1,
    unpricedProductCount: 0,
    purchasedPaidUnits: 1,
    assignedPaidUnits: 1,
    unassignedPaidUnits: 0,
    monthlyCost: 10,
    unassignedMonthlyCost: 0,
    disabledAccountCount: 0,
    disabledMonthlyCost: 0,
    inactiveAccountCount: 0,
    inactiveMonthlyCost: 0,
    accountsComplete: true,
    disabledAccountsComplete: true,
  },
});
const insights = () => ({
  rulesVersion: 'microsoft-license-rules-v2',
  overlapAssignmentCount: 0,
  overlapAccountCount: 0,
  downgradeCandidateCount: 0,
  downgradeBlockedCount: 1,
  downgradeEvidence: 'available',
  findings: [
    {
      accountId: 'account-one',
      skuId: 'sku-one',
      kind: 'downgrade',
      ruleId: 'e3-no-desktop-to-f3',
      evidence: {
        windows: false,
        mac: false,
        web: true,
        mobile: null,
        mailboxUsedBytes: 6442450944,
        mailboxHasArchive: false,
        oneDriveUsedBytes: 0,
        storageChecked: true,
      },
      blockedBy: ['mailbox_over_target_limit'],
    },
  ],
});
const breakdown = () => ({
  key: '',
  label: 'Not Set',
  licensedAccountCount: 1,
  paidSeatCount: 1,
  monthlyCost: null,
  reviewAccountCount: 1,
  reviewMonthlyCost: null,
});
const historyUsage = () => {
  const { evidence, reportRefreshDate, enabledLicensedAccountCount, status, signedInButNoOfficeActivityCount, platforms, copilot } = summaryUsage();
  return { evidence, reportRefreshDate, enabledLicensedAccountCount, status, signedInButNoOfficeActivityCount, platforms, copilot };
};
const snapshot = () => ({
  schemaVersion: 'microsoft-365-license-history/v1',
  tenantId: 'tenant-one',
  month: '2026-10',
  generatedAt: '2026-10-13T00:00:00Z',
  coverage: Object.fromEntries(Object.keys(view().coverage).map(source => [source, 'complete'])),
  summary: view().summary,
  pricingByCurrency: { AUD: pricing() },
});
const series = month => ({ schemaVersion: 'microsoft-365-license-history-series/v1', tenantId: 'tenant-one', currency: 'AUD', months: [month] });
const monthOf = document => {
  const { schemaVersion, tenantId, pricingByCurrency, ...month } = document;
  return { ...month, pricing: pricingByCurrency.AUD };
};

const splitSummary = () => {
  const { accounts, reports, ...aggregate } = view();
  const { accountMonthlyCosts, ...aggregatePricing } = pricing();
  return {
    ...aggregate,
    schemaVersion: 'microsoft-365-license-summary/v1',
    tenantSyncRunId: 'scan-one',
    accountDetails: { observedRowCount: 1, returnedRowCount: 1, omittedRowCount: 0 },
    pricingByCurrency: { AUD: aggregatePricing },
    insights: {
      rulesVersion: 'rules-v1',
      overlapAssignmentCount: 0,
      overlapAccountCount: 0,
      downgradeCandidateCount: 1,
      downgradeBlockedCount: 0,
      downgradeEvidence: 'available',
      observedFindingCount: 1,
      patterns: [
        { kind: 'downgrade', ruleId: 'e3-to-f3', skuId: 'sku-one', targetSkuId: null, targetSkuPartNumber: 'SPE_F1', coveredBySkuIds: [], count: 1 },
      ],
    },
    capabilities: { catalogueVersion: 'capabilities-v1', definitions: [], accountsComplete: true, summary: [], observedNoticeCount: 0 },
  };
};
const splitAccounts = (length = 1) => ({
  schemaVersion: 'microsoft-365-license-accounts/v1',
  tenantId: 'tenant-one',
  generatedAt: '2026-10-13T00:00:00Z',
  tenantSyncRunId: 'scan-one',
  accountDetails: { observedRowCount: length, returnedRowCount: length, omittedRowCount: 0 },
  accounts: Array.from({ length }, (_, i) => ({
    ...account(),
    id: `account-${i}`,
    profile: profile(),
    usage: accountUsage(),
    signInStatus: 'recent',
  })),
});

const stepUp = () => ({
  id: 'sku-one:sku-target',
  fromSkuId: 'sku-one',
  fromProductName: 'Microsoft 365 E3',
  toSkuId: 'sku-target',
  toProductName: 'Microsoft 365 E5',
  targetSource: 'publisher',
  accountCount: 4,
  inactiveAccountCount: 1,
  accountsComplete: true,
  addedCapabilityIds: ['defender-identity'],
  lostCapabilityIds: [],
  unverifiedPlanCount: 2,
  capabilityGains: [{ capabilityId: 'defender-identity', gainingAccountCount: 3, alreadyEnabledAccountCount: 1 }],
  replacedProducts: [
    {
      skuId: 'sku-addon',
      skuPartNumber: 'IDENTITY_THREAT_PROTECTION',
      productName: 'Microsoft Defender Suite',
      accountCount: 1,
      basis: 'rule',
      unitPriceMonthlyByCurrency: { USD: 12, INR: null },
    },
  ],
  priceListVersion: 'retail-v9',
  monthlyByCurrency: {
    USD: {
      fromUnitPriceMonthly: 39,
      toUnitPriceMonthly: 60,
      toPriceConfidence: 'verified',
      perAccountDifference: 21,
      grossDifference: 84,
      replacedMonthly: 12,
      unpricedReplacedProductCount: 0,
      netDifference: 72,
    },
    INR: {
      fromUnitPriceMonthly: 3245,
      toUnitPriceMonthly: null,
      toPriceConfidence: null,
      perAccountDifference: null,
      grossDifference: null,
      replacedMonthly: 0,
      unpricedReplacedProductCount: 1,
      netDifference: null,
    },
  },
  segments: [
    {
      replacedSkuIds: ['sku-addon'],
      accountCount: 1,
      inactiveAccountCount: 0,
      monthlyByCurrency: {
        USD: { currentPerAccount: 51, targetPerAccount: 60, differencePerAccount: 9, differenceTotal: 9 },
        INR: { currentPerAccount: null, targetPerAccount: null, differencePerAccount: null, differenceTotal: null },
      },
    },
    {
      replacedSkuIds: [],
      accountCount: 3,
      inactiveAccountCount: 1,
      monthlyByCurrency: {
        USD: { priceBasis: 'mixed', currentPerAccount: 39, targetPerAccount: 60, differencePerAccount: 21, differenceTotal: 63 },
        INR: { currentPerAccount: 3245, targetPerAccount: null, differencePerAccount: null, differenceTotal: null },
      },
    },
  ],
});
const stepUpSummary = (mutate = () => {}) => {
  const document = splitSummary();
  document.licenses.push({ ...license(), skuId: 'sku-addon', skuPartNumber: 'IDENTITY_THREAT_PROTECTION' });
  document.summary.productCount = 2;
  const value = stepUp();
  mutate(value, document);
  document.capabilities = {
    ...document.capabilities,
    definitions: [{ id: 'defender-identity', name: 'Defender for Identity', group: 'Threat protection' }],
    stepUps: [value],
  };
  return document;
};

for (const [format, api] of Object.entries(formats)) {
  test(`${format}: served quantity history is independent of selected currency and prices`, () => {
    const skuId = '00000000-0000-4000-8000-00000000a001';
    const productQuantities = { [skuId]: { purchasedUnits: 40 } };
    const month = { ...monthOf(snapshot()), pricing: null, productQuantities };
    for (const currency of ['AUD', 'NZD', 'EUR', null]) assert.equal(api.isMicrosoft365LicenseHistory({ ...series(month), currency }), true);
    assert.equal(api.isMicrosoft365LicenseHistory(series(monthOf(snapshot()))), true, 'Legacy served months remain valid');
    for (const purchasedUnits of [0, null])
      assert.equal(api.isMicrosoft365LicenseHistory(series({ ...month, productQuantities: { [skuId]: { purchasedUnits } } })), true);
    assert.equal(api.isMicrosoft365LicenseHistorySnapshot({ ...snapshot(), productQuantities }), false, 'Engine snapshot schema stays unchanged');
  });

  test(`${format}: quantity history rejects malformed identities, counts and extra dimensions`, () => {
    const skuId = '00000000-0000-4000-8000-00000000a001';
    const month = { ...monthOf(snapshot()), pricing: null };
    for (const productQuantities of [
      null,
      [],
      { [skuId.toUpperCase()]: { purchasedUnits: 1 } },
      { other: { purchasedUnits: 1 } },
      ...[-1, 0.5, Number.MAX_SAFE_INTEGER + 1, '40', undefined].map(purchasedUnits => ({ [skuId]: { purchasedUnits } })),
      { [skuId]: { purchasedUnits: 40, currency: 'AUD' } },
      { [skuId]: { purchasedUnits: 40, accountId: 'private' } },
      Object.fromEntries(
        Array.from({ length: 2001 }, (_, index) => [`10000000-0000-4000-8000-${index.toString(16).padStart(12, '0')}`, { purchasedUnits: 1 }])
      ),
    ])
      assert.equal(api.isMicrosoft365LicenseHistory(series({ ...month, productQuantities })), false);
  });

  test(`${format}: step-ups are aggregate, internally consistent and optional`, () => {
    const document = stepUpSummary();
    assert.equal(api.isMicrosoft365LicenseSummaryView(document), true);
    assert.equal(api.isMicrosoft365LicenseSummaryView(splitSummary()), true, 'Summaries without step-ups remain valid');
    assert.equal(api.isMicrosoft365StepUpComparison(stepUp()), true);
    assert.equal(api.isMicrosoft365StepUpComparison({ ...stepUp(), segments: undefined }), true, 'Older step-ups have no segments');
    assert.equal(
      api.isMicrosoft365LicenseSummaryView(stepUpSummary(value => delete value.segments)),
      true,
      'Summaries from engines without segments remain valid'
    );
    assert.equal(
      api.isMicrosoft365CapabilityProjection({ ...document.capabilities, notices: [], omittedNoticeCount: 0 }),
      true,
      'The full capability projection carries the same step-ups'
    );
    assert.equal(
      api.isMicrosoft365LicenseSummaryView(stepUpSummary(value => (value.monthlyByCurrency.USD.priceBasis = 'agreed'))),
      true,
      'The API may re-value step-ups with agreed prices'
    );
    const invalid = [
      ['account identifiers', value => (value.accountIds = ['account-0'])],
      ['replaced account identifiers', value => (value.replacedProducts[0].accountIds = ['account-0'])],
      ['money account identifiers', value => (value.monthlyByCurrency.USD.accountId = 'account-0')],
      ['gains not summing to scope', value => (value.capabilityGains[0].gainingAccountCount = 4)],
      ['gain for a capability not added', value => (value.capabilityGains[0].capabilityId = 'entra-p2')],
      ['undefined capability', value => (value.addedCapabilityIds = ['undefined-capability'])],
      ['inactive above scope', value => (value.inactiveAccountCount = 5)],
      ['identity mismatch', value => (value.id = 'other:sku-target')],
      ['source equal to target', value => Object.assign(value, { toSkuId: 'sku-one', id: 'sku-one:sku-one' })],
      ['source not held', value => Object.assign(value, { fromSkuId: 'sku-missing', id: 'sku-missing:sku-target' })],
      ['replaced product not held', value => (value.replacedProducts[0].skuId = 'sku-missing')],
      ['replaced holders above scope', value => (value.replacedProducts[0].accountCount = 5)],
      ['replaced basis', value => (value.replacedProducts[0].basis = 'guess')],
      ['negative unit price', value => (value.replacedProducts[0].unitPriceMonthlyByCurrency.USD = -1)],
      ['net known without gross', value => (value.monthlyByCurrency.INR.netDifference = 0)],
      ['price basis', value => (value.monthlyByCurrency.USD.priceBasis = 'estimated')],
      ['currency code', value => (value.monthlyByCurrency.usd = value.monthlyByCurrency.USD)],
      ['target source', value => (value.targetSource = ['publisher'])],
      ['segment account identifiers', value => (value.segments[0].accountIds = ['account-0'])],
      ['segment money account identifiers', value => (value.segments[0].monthlyByCurrency.USD.accountId = 'account-0')],
      ['segments above scope', value => (value.segments[1].accountCount = 4)],
      ['segment product not replaced', value => (value.segments[0].replacedSkuIds = ['sku-other'])],
      [
        'unsorted segment products',
        value => {
          value.replacedProducts.push({ ...value.replacedProducts[0], skuId: 'sku-a', productName: 'A' });
          value.segments[0].replacedSkuIds = ['sku-addon', 'sku-a'];
        },
      ],
      ['duplicate segment', value => (value.segments[1].replacedSkuIds = ['sku-addon'])],
      ['empty segment', value => (value.segments[0].accountCount = 0)],
      ['segment inactive above group', value => (value.segments[0].inactiveAccountCount = 2)],
      ['segment difference without a target price', value => (value.segments[1].monthlyByCurrency.INR.differencePerAccount = 1)],
      ['segment total without a difference', value => (value.segments[0].monthlyByCurrency.INR.differenceTotal = 0)],
      ['segment price basis', value => (value.segments[0].monthlyByCurrency.USD.priceBasis = 'estimated')],
    ];
    for (const [name, mutate] of invalid) assert.equal(api.isMicrosoft365LicenseSummaryView(stepUpSummary(mutate)), false, name);
    const duplicated = stepUpSummary();
    duplicated.capabilities.stepUps.push(stepUp());
    assert.equal(api.isMicrosoft365LicenseSummaryView(duplicated), false, 'Step-up identities are unique');
    const many = stepUpSummary();
    many.capabilities.stepUps = Array.from({ length: 17 }, (_, index) => ({ ...stepUp(), toSkuId: `sku-${index}`, id: `sku-one:sku-${index}` }));
    assert.equal(api.isMicrosoft365LicenseSummaryView(many), false, 'At most 16 step-ups');
  });
  test(`${format}: customer pricing retains source evidence, zero and projection revisions`, () => {
    const document = splitSummary();
    document.pricingRevision = 'rates-a:2026-10-16';
    document.pricing = {
      ...document.pricingByCurrency.AUD,
      basis: 'customer_price_estimate',
      term: 'customer_agreement',
      projection: { status: 'applied', revision: document.pricingRevision, asOf: '2026-10-16' },
      products: document.pricingByCurrency.AUD.products.map(row => ({
        ...row,
        referenceUnitPriceMonthly: row.unitPriceMonthly,
        unitPriceMonthly: 0,
        priceOverride: {
          skuId: row.skuId,
          currency: 'AUD',
          unitPriceMonthly: 0,
          effectiveFrom: '2026-10-01',
          effectiveTo: null,
          source: 'Grant confirmation',
        },
      })),
    };
    assert(api.isMicrosoft365LicenseSummaryView(document));
    assert(api.isMicrosoft365LicenseSummaryView({ ...document, marketCurrency: 'NZD' }), 'Tenant market currency is safe aggregate evidence');
    assert(!api.isMicrosoft365LicenseSummaryView({ ...document, marketCurrency: 'nzd' }), 'Market currency is an ISO currency code');
    for (const patch of [
      { basis: ['customer_price_estimate'] },
      { term: ['customer_agreement'] },
      { projection: { ...document.pricing.projection, status: ['applied'] } },
    ]) {
      assert(
        !api.isMicrosoft365LicenseSummaryView({ ...document, pricing: { ...document.pricing, ...patch } }),
        'Pricing enums must be primitive strings'
      );
    }
    const people = splitAccounts();
    people.pricingRevision = document.pricingRevision;
    people.pricing = {
      currency: 'AUD',
      basis: document.pricing.basis,
      projection: document.pricing.projection,
      accountMonthlyCosts: { 'account-0': 0 },
    };
    assert(api.isMicrosoft365LicenseAccountsView(people));
    assert(!api.isMicrosoft365LicenseAccountsView({ ...people, pricingRevision: 123 }));
    assert(!api.isMicrosoft365LicenseAccountsView({ ...people, pricingFacts: { accountId: 'private' } }));
    const invalid = clone(document);
    invalid.pricing.products[0].priceOverride.accountId = 'private';
    assert(!api.isMicrosoft365LicenseSummaryView(invalid));
  });
  test(`${format}: pricing facts enforce aggregate privacy in current and history evidence`, () => {
    const facts = {
      schemaVersion: 'microsoft-365-pricing-facts/v1',
      evidence: {
        inventoryKnown: true,
        usersKnown: true,
        signInsKnown: true,
        overlapKnown: true,
        downgradeKnown: true,
        ambiguousPaidAllocation: false,
      },
      products: [{ skuId: 'sku-one', noOfficeActivityUnits: 0 }],
      noOfficeActivityAccountCount: 0,
      downgradeEdges: [{ skuId: 'sku-one', targetSkuPartNumber: 'SPE_F1', count: 1 }],
      targetUnitPrices: { AUD: { SPE_F1: 10 } },
    };
    const document = { ...splitSummary(), pricingFacts: facts };
    assert(api.isMicrosoft365LicenseSummaryView(document));
    assert(!api.isMicrosoft365LicenseSummaryView({ ...document, pricingFacts: { ...facts, accountId: 'private' } }));
    for (const mutate of [
      f => {
        f.evidence.accountId = 'private';
      },
      f => {
        f.products[0].accountId = 'private';
      },
      f => {
        f.downgradeEdges[0].accountId = 'private';
      },
      f => {
        f.products.push({ ...f.products[0] });
      },
      f => {
        f.downgradeEdges.push({ ...f.downgradeEdges[0] });
      },
      f => {
        f.products[0].noOfficeActivityUnits = -1;
      },
    ]) {
      const invalid = clone(facts);
      mutate(invalid);
      assert(!api.isMicrosoft365PricingFacts(invalid));
    }
    const group = {
      key: '',
      label: 'Not Set',
      licensedAccountCount: 1,
      paidSeatCount: 1,
      reviewAccountCount: 1,
      unitsBySku: { 'sku-one': 1 },
      fullReviewUnitsBySku: {},
      findingReviewEdges: [{ ...facts.downgradeEdges[0], kind: 'downgrade' }],
    };
    const grouped = { ...facts, groups: { domain: [group], department: [], country: [] } };
    assert(api.isMicrosoft365PricingFacts(grouped), 'Not Set empty group key is valid');
    for (const mutate of [
      f => {
        f.groups.domain[0].accountId = 'private';
      },
      f => {
        f.groups.domain.push(clone(group));
      },
      f => {
        f.groups.domain[0].findingReviewEdges[0].accountId = 'private';
      },
      f => {
        f.groups.domain[0].unitsBySku['unknown-sku'] = 1;
      },
      f => {
        f.groups.domain[0].fullReviewUnitsBySku['sku-one'] = 2;
      },
      f => {
        f.groups.domain[0].reviewAccountCount = 2;
      },
    ]) {
      const invalid = clone(grouped);
      mutate(invalid);
      assert(!api.isMicrosoft365PricingFacts(invalid));
    }

    const history = { ...snapshot(), pricingFacts: facts };
    assert(api.isMicrosoft365LicenseHistorySnapshot(history));
    assert(
      !api.isMicrosoft365LicenseHistorySnapshot({ ...history, pricingFacts: { ...facts, groups: { domain: [], department: [], country: [] } } })
    );
    assert(api.isMicrosoft365LicenseHistory({ ...series(monthOf(history)), pricingRevision: 'rates-a:2026-10-16' }));
    assert(!api.isMicrosoft365LicenseHistory({ ...series(monthOf(history)), pricingRevision: 42 }));
  });
  test(`${format}: split summary retains all 16 market estimates without person prices`, () => {
    const document = splitSummary();
    const currencies = ['USD', 'NZD', 'AUD', 'GBP', 'EUR', 'CAD', 'JPY', 'INR', 'BRL', 'MXN', 'ZAR', 'CHF', 'SEK', 'NOK', 'DKK', 'SGD'];
    document.pricingByCurrency = Object.fromEntries(currencies.map(currency => [currency, { ...document.pricingByCurrency.AUD, currency }]));
    assert.equal(api.isMicrosoft365LicenseSummaryView(document), true);
    assert.equal(Object.keys(document.pricingByCurrency).length, 16);
    document.pricingByCurrency.HKD = { ...document.pricingByCurrency.USD, currency: 'HKD' };
    assert.equal(api.isMicrosoft365LicenseSummaryView(document), false);
  });
  test(`${format}: split summary rejects person fields throughout nested aggregate structures`, () => {
    const mutations = [
      doc => {
        doc.accounts = [];
      },
      doc => {
        doc.reports = {};
      },
      doc => {
        doc.insights.findings = [];
      },
      doc => {
        doc.capabilities.notices = [];
      },
      doc => {
        doc.pricingByCurrency.AUD.accountMonthlyCosts = {};
      },
      doc => {
        doc.pricingByCurrency.AUD.paidAccountIds = [];
      },
      doc => {
        doc.pricingByCurrency.AUD.partialAccountPriceIds = [];
      },
      doc => {
        doc.pricingByCurrency.AUD.products[0].accountId = 'private';
      },
      doc => {
        doc.pricingByCurrency.AUD.summary.accountIds = [];
      },
      doc => {
        doc.coverage.users.data = [];
      },
      doc => {
        doc.coverage.users.recovery.accountId = 'private';
      },
      doc => {
        doc.licenses[0].accountId = 'private';
      },
      doc => {
        doc.licenses[0].capabilities = { state: 'complete', plans: [], omittedPlanCount: 0, accountId: 'private' };
      },
      doc => {
        doc.licenses[0].renewals = [{ status: 'Enabled', isTrial: false, totalLicenses: 1, nextLifecycleDateTime: null, accountId: 'private' }];
      },
      doc => {
        doc.insights.patterns[0].accountId = 'private';
      },
      doc => {
        doc.organization = { displayName: 'Org', defaultDomain: null, accounts: [] };
      },
    ];
    for (const [index, mutate] of mutations.entries()) {
      const document = splitSummary();
      mutate(document);
      assert.equal(api.isMicrosoft365LicenseSummaryView(document), false, `summary privacy mutation ${index}`);
    }
  });
  test(`${format}: split accounts supports 5,000 complete profiles, workloads, findings and selected prices`, () => {
    const document = splitAccounts(5000);
    document.insights = {
      rulesVersion: 'rules-v1',
      findings: document.accounts.map(row => ({
        accountId: row.id,
        skuId: 'sku-one',
        kind: 'overlap',
        ruleId: 'overlap',
        coveredBySkuIds: ['sku-two'],
      })),
    };
    document.pricing = {
      currency: 'NZD',
      accountMonthlyCosts: Object.fromEntries(document.accounts.map(row => [row.id, 0])),
      paidAccountIds: document.accounts.map(row => row.id),
      partialAccountPriceIds: [],
    };
    assert.equal(api.isMicrosoft365LicenseAccountsView(document), true);
    assert.equal(api.isMicrosoft365LicenseView({ ...view(), accounts: document.accounts.slice(0, 2001) }), false);
    assert.equal(api.isMicrosoft365LicenseAccountsView(splitAccounts(5001)), false);
    document.insights.findings[0].accountId = 'outside-returned-population';
    assert.equal(api.isMicrosoft365LicenseAccountsView(document), false);
  });
  test(`${format}: split identity, counts, duplicate patterns and price references are guarded`, () => {
    for (const guard of ['isMicrosoft365LicenseSummaryView', 'isMicrosoft365LicenseAccountsView']) {
      const make = guard.endsWith('SummaryView') ? splitSummary : splitAccounts;
      for (const key of ['generatedAt', 'tenantSyncRunId']) {
        const document = make();
        delete document[key];
        assert.equal(api[guard](document), false);
        document[key] = '';
        assert.equal(api[guard](document), false);
      }
      const document = make();
      document.accountDetails.omittedRowCount = 1;
      assert.equal(api[guard](document), false);
    }
    const summary = splitSummary();
    summary.insights.patterns.push({ ...summary.insights.patterns[0] });
    assert.equal(api.isMicrosoft365LicenseSummaryView(summary), false);
    const people = splitAccounts();
    people.accounts.push({ ...people.accounts[0] });
    people.accountDetails = { observedRowCount: 2, returnedRowCount: 2, omittedRowCount: 0 };
    assert.equal(api.isMicrosoft365LicenseAccountsView(people), false);
    const priced = splitAccounts();
    priced.pricing = { currency: 'USD', accountMonthlyCosts: { unknown: 5 } };
    assert.equal(api.isMicrosoft365LicenseAccountsView(priced), false);
  });
  test(`${format}: anonymous workloads retain concealed report-row counts without licensing claims`, () => {
    const document = splitSummary();
    document.usage = { ...summaryUsage(), evidence: 'identities_concealed', matchedAccountCount: null, status: null, workloadActive: null };
    const workload = { active: 1, inactive: 2, noRecordedActivity: 3, unknown: 4 };
    document.usage.anonymousWorkloads = {
      basis: 'report_rows',
      reportRefreshDate: '2026-10-12',
      windowDays: 30,
      observedRowCount: 10,
      workloads: Object.fromEntries(['exchange', 'oneDrive', 'sharePoint', 'teams', 'vivaEngage'].map(key => [key, { ...workload }])),
    };
    document.usage.signIn.basis = 'observed_licensed_accounts';
    document.usage.signIn.observedLicensedAccountCount = 1;
    assert.equal(api.isMicrosoft365LicenseSummaryView(document), true);
    document.usage.anonymousWorkloads.workloads.exchange.unknown = 0;
    assert.equal(api.isMicrosoft365LicenseSummaryView(document), false);
    document.usage.anonymousWorkloads.workloads.exchange.unknown = 4;
    document.usage.anonymousWorkloads.workloads.exchange.accountIds = [];
    assert.equal(api.isMicrosoft365LicenseSummaryView(document), false);
  });
  test(`${format}: capability notices exceed legacy detail cap and retain honest omissions`, () => {
    const document = splitAccounts();
    document.capabilities = {
      catalogueVersion: 'cap-v1',
      observedNoticeCount: 2002,
      omittedNoticeCount: 1,
      notices: Array.from({ length: 2001 }, () => ({
        kind: 'assignment_error',
        accountId: 'account-0',
        skuId: 'sku-one',
        title: 'Failure',
        detail: 'Provider evidence',
      })),
    };
    assert.equal(api.isMicrosoft365LicenseAccountsView(document), true);
    document.capabilities.notices[0].accountId = 'unknown';
    assert.equal(api.isMicrosoft365LicenseAccountsView(document), false);
  });

  test(`${format}: legacy views and history remain valid`, () => {
    assert.equal(api.isMicrosoft365LicenseView(view()), true);
    assert.equal(api.isMicrosoft365LicenseHistorySnapshot(snapshot()), true);
    assert.equal(api.isMicrosoft365LicenseHistory(series(monthOf(snapshot()))), true);
  });
  test(`${format}: new sources, D180, correlation and coverage omission note are accepted`, () => {
    const document = view();
    for (const source of ['mailboxUsage', 'oneDriveUsage', 'officeActiveUserCounts']) document.coverage[source] = coverage();
    document.coverage.officeActiveUserCounts.period = 'D180';
    document.coverage.users.notes = ['workload_dates_omitted_for_size'];
    for (const correlation of ['not_performed', 'performed', 'identities_concealed']) {
      document.reportIdentity.correlation = correlation;
      assert.equal(api.isMicrosoft365LicenseView(document), true, correlation);
    }
    document.coverage.officeActiveUserCounts.period = 'D365';
    assert.equal(api.isMicrosoft365LicenseView(document), false);
  });
  test(`${format}: joined usage accepts known zero, unknowns and omitted workload dates`, () => {
    const document = view();
    document.usage = summaryUsage();
    document.licenses[0].usage = productUsage();
    Object.assign(document.accounts[0], { profile: profile(), usage: accountUsage(), userType: 'Member', createdAt: null, signInStatus: 'recent' });
    assert.equal(api.isMicrosoft365LicenseView(document), true);
    delete document.accounts[0].usage.workloads;
    assert.equal(api.isMicrosoft365LicenseView(document), true);
    document.accounts[0].usage.workloadLicenses = {
      exchange: { licensed: true, assignedOn: '2025-03-01' },
      oneDrive: { licensed: false, assignedOn: null },
      sharePoint: { licensed: null, assignedOn: null },
      teams: { licensed: true, assignedOn: null },
      vivaEngage: { licensed: false, assignedOn: null },
    };
    assert.equal(api.isMicrosoft365LicenseView(document), true);
    document.accounts[0].usage.workloadLicenses = null;
    assert.equal(api.isMicrosoft365LicenseView(document), true);
    document.accounts[0].usage = {
      status: 'unknown',
      lastActivityDate: null,
      workloads: null,
      platforms: null,
      mailbox: null,
      oneDrive: null,
      copilotLastActivityDate: null,
    };
    document.licenses[0].usage = null;
    document.usage = {
      ...summaryUsage(),
      evidence: 'report_unavailable',
      reportRefreshDate: null,
      enabledLicensedAccountCount: null,
      matchedAccountCount: null,
      status: null,
      signedInButNoOfficeActivityCount: null,
      workloadActive: null,
      platforms: null,
      mailbox: null,
      oneDrive: null,
      copilot: null,
      dailyActive: undefined,
    };
    assert.equal(api.isMicrosoft365LicenseView(document), true);
  });
  test(`${format}: malformed nested usage/profile and product fields are rejected`, () => {
    const base = view();
    base.usage = summaryUsage();
    base.licenses[0].usage = productUsage();
    Object.assign(base.accounts[0], { profile: profile(), usage: accountUsage(), signInStatus: 'recent', userType: 'Member', createdAt: null });
    const mutations = [
      doc => {
        doc.accounts[0].profile.department = 'x'.repeat(513);
      },
      doc => {
        doc.accounts[0].profile.city = false;
      },
      doc => {
        doc.accounts[0].userType = 'Admin';
      },
      doc => {
        doc.accounts[0].createdAt = 'invalid';
      },
      doc => {
        doc.accounts[0].signInStatus = 'active';
      },
      doc => {
        doc.accounts[0].usage.status = 'not_active';
      },
      doc => {
        doc.accounts[0].usage.lastActivityDate = '2026-02-30';
      },
      doc => {
        doc.accounts[0].usage.workloadLicenses = { exchange: { licensed: true, assignedOn: null } };
      },
      doc => {
        const licenses = Object.fromEntries(
          ['exchange', 'oneDrive', 'sharePoint', 'teams', 'vivaEngage'].map(key => [key, { licensed: true, assignedOn: null }])
        );
        licenses.teams = { licensed: 'True', assignedOn: null };
        doc.accounts[0].usage.workloadLicenses = licenses;
      },
      doc => {
        const licenses = Object.fromEntries(
          ['exchange', 'oneDrive', 'sharePoint', 'teams', 'vivaEngage'].map(key => [key, { licensed: true, assignedOn: '2025-03-01T00:00:00Z' }])
        );
        doc.accounts[0].usage.workloadLicenses = licenses;
      },
      doc => {
        doc.accounts[0].usage.platforms.windows = 'No';
      },
      doc => {
        doc.accounts[0].usage.mailbox.usedBytes = -1;
      },
      doc => {
        doc.accounts[0].usage.oneDrive.usedBytes = 0.5;
      },
      doc => {
        delete doc.accounts[0].usage.platforms.mobile;
      },
      doc => {
        doc.licenses[0].usage.active = -1;
      },
      doc => {
        delete doc.licenses[0].usage.unknown;
      },
      doc => {
        doc.usage.windowDays = 90;
      },
      doc => {
        doc.usage.mailbox.totalUsedBytes = Number.MAX_SAFE_INTEGER + 1;
      },
      doc => {
        doc.usage.status.unknown = '0';
      },
      doc => {
        doc.usage.evidence = 'missing';
      },
      doc => {
        doc.coverage.users.notes = ['unrecognized'];
      },
      doc => {
        doc.usage.dailyActive = Array(181).fill(summaryUsage().dailyActive[0]);
      },
      doc => {
        doc.usage.dailyActive[0].teams = -1;
      },
    ];
    for (const [index, mutate] of mutations.entries()) {
      const document = clone(base);
      mutate(document);
      assert.equal(api.isMicrosoft365LicenseView(document), false, `mutation ${index}`);
    }
  });
  test(`${format}: full population rollups may exceed the account detail cap`, () => {
    const document = view();
    document.usage = {
      ...summaryUsage(),
      enabledLicensedAccountCount: 3000,
      matchedAccountCount: 3000,
      status: { active: 3000, inactive: 0, noRecordedActivity: 0, unknown: 0 },
    };
    document.licenses[0].usage = { ...productUsage(), active: 3000 };
    assert.equal(api.isMicrosoft365LicenseView(document), true);
  });
  test(`${format}: enum values must be primitive strings`, () => {
    for (const field of ['correlation', 'signInStatus', 'status', 'evidence']) {
      for (const invalid of [[], ['active'], ['recent'], ['available'], ['performed'], { toString: null }, null, 1]) {
        const document = view();
        if (field === 'correlation') document.reportIdentity.correlation = invalid;
        if (field === 'signInStatus') document.accounts[0].signInStatus = invalid;
        if (field === 'status') document.accounts[0].usage = { ...accountUsage(), status: invalid };
        if (field === 'evidence') document.usage = { ...summaryUsage(), evidence: invalid };
        assert.equal(api.isMicrosoft365LicenseView(document), false, field);
      }
    }
  });
  test(`${format}: evidence and storage blocks validate without qualifying savings`, () => {
    assert.equal(api.isMicrosoft365LicenseInsights(insights()), true);
    for (const mutate of [
      value => {
        value.findings[0].blockedBy = ['unknown_limit'];
      },
      value => {
        value.findings[0].blockedBy = [];
      },
      value => {
        value.findings[0].kind = 'overlap';
      },
      value => {
        value.findings[0].evidence.storageChecked = null;
      },
      value => {
        value.findings[0].evidence.mailboxUsedBytes = -1;
      },
      value => {
        value.downgradeBlockedCount = -1;
      },
    ]) {
      const value = insights();
      mutate(value);
      assert.equal(api.isMicrosoft365LicenseInsights(value), false);
    }
  });
  test(`${format}: review pricing and bounded currency breakdowns validate missing money`, () => {
    const value = pricing();
    value.summary.noOfficeActivityAccountCount = 1;
    value.summary.noOfficeActivityMonthlyCost = null;
    value.products[0].noOfficeActivityMonthlyCost = 0;
    value.breakdowns = { domain: [breakdown()], department: [breakdown()], country: [breakdown()] };
    assert.equal(api.isMicrosoft365LicensePricing(value), true);
    for (const mutate of [
      doc => {
        doc.summary.noOfficeActivityAccountCount = -1;
      },
      doc => {
        doc.products[0].noOfficeActivityMonthlyCost = '0';
      },
      doc => {
        doc.breakdowns.domain[0].monthlyCost = -1;
      },
      doc => {
        doc.breakdowns.country[0].paidSeatCount = 1.5;
      },
      doc => {
        doc.breakdowns.department = Array(28).fill(breakdown());
      },
    ]) {
      const document = clone(value);
      mutate(document);
      assert.equal(api.isMicrosoft365LicensePricing(document), false);
    }
    value.breakdowns.department = Array.from({ length: 27 }, (_, index) => ({ ...breakdown(), key: `group-${index}` }));
    assert.equal(api.isMicrosoft365LicensePricing(value), true, '25 groups plus Not Set and Other fit');
  });
  test(`${format}: usage and product usage validate in snapshots and API history months`, () => {
    const document = snapshot();
    document.usage = historyUsage();
    document.productUsage = { 'sku-one': productUsage() };
    document.coverage.officeActiveUserCounts = 'complete';
    assert.equal(api.isMicrosoft365LicenseHistorySnapshot(document), true);
    assert.equal(api.isMicrosoft365LicenseHistory(series(monthOf(document))), true);
    document.productUsage['sku-one'].active = -1;
    assert.equal(api.isMicrosoft365LicenseHistorySnapshot(document), false);
    assert.equal(api.isMicrosoft365LicenseHistory(series(monthOf(document))), false);
  });
  test(`${format}: history rejects person-level data, breakdowns and daily report rows`, () => {
    const mutations = [
      doc => {
        doc.usage = { ...historyUsage(), dailyActive: summaryUsage().dailyActive };
      },
      doc => {
        doc.usage = { ...historyUsage(), profile: profile() };
      },
      doc => {
        doc.accounts = [account()];
      },
      doc => {
        doc.profile = profile();
      },
      doc => {
        doc.pricingByCurrency.AUD.breakdowns = { domain: [breakdown()], department: [], country: [] };
      },
      doc => {
        doc.productUsage = { 'SKU-ONE': productUsage() };
      },
      doc => {
        doc.productUsage = Object.fromEntries(Array.from({ length: 2001 }, (_, index) => [`sku-${index}`, productUsage()]));
      },
      doc => {
        doc.usage = { ...historyUsage(), status: { ...historyUsage().status, accountIds: ['private'] } };
      },
      doc => {
        doc.productUsage = { 'sku-one': { ...productUsage(), profile: profile() } };
      },
    ];
    for (const [index, mutate] of mutations.entries()) {
      const document = snapshot();
      mutate(document);
      assert.equal(api.isMicrosoft365LicenseHistorySnapshot(document), false, `snapshot privacy mutation ${index}`);
      assert.equal(api.isMicrosoft365LicenseHistory(series(monthOf(document))), false, `month privacy mutation ${index}`);
    }
  });
}
