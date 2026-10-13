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

for (const [format, api] of Object.entries(formats)) {
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
