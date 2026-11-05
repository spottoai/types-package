import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const modules = [
  ['CJS', require('../dist/index.js')],
  ['ESM', await import('../dist/esm/entries/root.js')],
];
import {
  skuA,
  skuB,
  skuC,
  accountId,
  snapshot,
  complete,
  coverageByKind,
  listReceipt,
  unknownReceipt,
  timing,
  months,
  candidate,
  commercial,
  evidence,
  option,
  combine,
  protection,
  term,
  summary,
  detail,
  clone,
  cohortEvidence,
  privateAccountId,
  privateCohortId,
} from '../tests/fixtures/microsoft365-optimization-fixtures.mjs';

for (const [format, api] of modules) {
  test(`${format}: exports optimization boundary guards`, () => {
    for (const name of [
      'isMicrosoft365OptimizationEvidence',
      'isMicrosoft365OptimizationSummary',
      'isMicrosoft365OptimizationAccountDetail',
      'isMicrosoft365CommercialSubscription',
      'isMicrosoft365OptimizationCohortEvidence',
    ]) {
      assert.equal(typeof api[name], 'function', name);
    }
  });
  test(`${format}: validates separate evidence, aggregate and account contracts`, () => {
    assert.equal(api.isMicrosoft365OptimizationEvidence(evidence), true);
    assert.equal(api.isMicrosoft365OptimizationSummary(summary), true);
    assert.equal(api.isMicrosoft365OptimizationAccountDetail(detail), true);
    assert.equal(api.isMicrosoft365CommercialSubscription(commercial), true);
    assert.equal(api.isMicrosoft365OptimizationCohortEvidence(cohortEvidence), true);
    assert.equal(api.isMicrosoft365OptimizationSummary(evidence), false);
    assert.equal(api.isMicrosoft365OptimizationSummary(detail), false);
  });
  test(`${format}: rejects identity injection, extra keys and unbounded summary groups`, () => {
    for (const key of ['accountId', 'accountIds', 'userPrincipalName', 'displayName', 'reports', 'optimizationEvidence']) {
      assert.equal(api.isMicrosoft365OptimizationSummary({ ...summary, [key]: 'private' }), false, key);
      assert.equal(api.isMicrosoft365OptimizationSummary({ ...summary, groups: [{ ...combine, [key]: 'private' }] }), false, key);
    }
    const injected = clone(summary);
    injected.groups[0].options[0].accountIds = [accountId];
    assert.equal(api.isMicrosoft365OptimizationSummary(injected), false);
    assert.equal(api.isMicrosoft365OptimizationSummary({ ...summary, groups: Array(257).fill(combine) }), false);
    assert.equal(api.isMicrosoft365OptimizationSummary({ ...summary, groups: [combine, combine] }), false);
  });
  test(`${format}: rejects malformed identifiers, dates, counts and enum values`, () => {
    for (const patch of [
      { tenantId: '../tenant' },
      { generatedAt: '2026-02-30T00:00:00Z' },
      { generatedAt: '2026-11-05' },
      { currency: 'nzd' },
      { currency: '__proto__' },
      { portfolioMonthlySaving: Infinity },
      { omittedGroupCount: -1 },
      { coverage: { state: 'complete', reasonCodes: ['missing'] } },
    ]) {
      assert.equal(api.isMicrosoft365OptimizationSummary({ ...summary, ...patch }), false);
    }
    for (const patch of [
      { term: 'yearly' },
      { quantity: -1 },
      { observedAt: 'yesterday' },
      { skuId: 'friendly-name' },
      { billingFrequency: 'weekly' },
      { term: 'unknown' },
      { reductionTiming: { date: '2026-02-30', source: 'billing', confirmed: true } },
    ]) {
      assert.equal(api.isMicrosoft365CommercialSubscription({ ...commercial, ...patch }), false);
    }
    assert.equal(api.isMicrosoft365CommercialSubscription({ ...commercial, termSource: 'recorded' }), true);
    assert.equal(api.isMicrosoft365OptimizationEvidence({ ...evidence, subscriptions: [{ ...commercial, termSource: 'recorded' }] }), false);
    assert.equal(
      api.isMicrosoft365CommercialSubscription({ ...commercial, term: 'unknown', termSource: 'unknown', billingFrequency: 'unknown' }),
      true
    );
  });
  test(`${format}: preserves zero, unknown money and partial population without fabricated totals`, () => {
    const unknown = clone(summary);
    unknown.currency = null;
    unknown.coverage = { state: 'partial', reasonCodes: ['prices_unknown'] };
    unknown.coverageByKind = { ...coverageByKind, combineLicenses: { state: 'partial', reasonCodes: ['prices_unknown'] } };
    unknown.portfolioMonthlySaving = null;
    unknown.protectionMonthlyInvestment = null;
    unknown.groups = [
      {
        ...combine,
        selectedOptionId: null,
        scenarioMonthlySaving: null,
        portfolioMonthlySaving: null,
        options: [
          {
            ...option,
            monthlyCostChange: null,
            priceBasis: 'unavailable',
            unitPrices: option.unitPrices.map(p => ({ ...p, unitPriceMonthly: null, source: 'unavailable', receipt: unknownReceipt })),
          },
        ],
      },
    ];
    assert.equal(api.isMicrosoft365OptimizationSummary(unknown), true);
    assert.equal(api.isMicrosoft365OptimizationSummary({ ...unknown, portfolioMonthlySaving: 0 }), false);
    const minimum = {
      ...unknown,
      currency: 'NZD',
      groups: [{ ...unknown.groups[0], population: { unit: 'accounts', exactCount: null, observedCount: 1 } }],
    };
    assert.equal(api.isMicrosoft365OptimizationSummary(minimum), true);
    assert.equal(api.isMicrosoft365OptimizationSummary({ ...minimum, groups: [{ ...minimum.groups[0], portfolioMonthlySaving: 20 }] }), false);
    assert.equal(api.isMicrosoft365OptimizationSummary({ ...summary, groups: [], portfolioMonthlySaving: 0 }), true);
  });
  test(`${format}: eligible replacements cannot lose material rights or invent held sources`, () => {
    for (const patch of [
      { lostServicePlanIds: [skuB] },
      { unverifiedServicePlanIds: [skuB] },
      { blockedBy: ['purpose_unknown'] },
      { fromSkuIds: [skuA] },
      { toSkuIds: [skuA] },
    ]) {
      const invalid = clone(evidence);
      invalid.accounts[0].candidates = [{ ...candidate, ...patch }];
      assert.equal(api.isMicrosoft365OptimizationEvidence(invalid), false);
    }
    const conditional = clone(evidence);
    conditional.accounts[0].candidates[0] = {
      ...candidate,
      qualification: 'conditional',
      blockedBy: ['material_rights_unknown'],
      unverifiedServicePlanIds: [skuB],
    };
    assert.equal(api.isMicrosoft365OptimizationEvidence(conditional), true);
    const foreign = clone(evidence);
    foreign.accounts[0].heldSkuIds = [skuA];
    assert.equal(api.isMicrosoft365OptimizationEvidence(foreign), false);
    const kept = clone(evidence);
    kept.accounts[0].reviewDisposition = 'review_first';
    assert.equal(api.isMicrosoft365OptimizationEvidence(kept), false);
  });
  test(`${format}: refuses incomplete stable history and unsafe term qualification`, () => {
    const gap = clone(evidence);
    gap.demandBySku[0].observations.splice(1, 1);
    assert.equal(api.isMicrosoft365OptimizationEvidence(gap), false);
    gap.demandBySku[0].coverage = { state: 'partial', reasonCodes: ['missing_month'] };
    assert.equal(api.isMicrosoft365OptimizationEvidence(gap), true);
    for (const patch of [
      { historyMonths: months.slice(1) },
      { subscriptions: [{ ...term.subscriptions[0], termSource: 'unknown' }] },
      { convertibleSeats: 101 },
      { stableSeats: null },
      { committedSeats: 96 },
      { priceMethod: 'assumed_20_percent', sourcePrice: term.sourcePrice },
    ]) {
      assert.equal(api.isMicrosoft365OptimizationSummary({ ...summary, groups: [{ ...term, ...patch }] }), false);
    }
  });
  test(`${format}: protection investment cannot become savings or select blocked/unknown options`, () => {
    for (const patch of [
      { monthlyInvestment: -1 },
      { portfolioMonthlySaving: 10 },
      { selectedOptionId: 'missing' },
      { privilegedAccountCount: 2 },
      { missingCapabilityIds: ['entra-p1'] },
    ]) {
      assert.equal(api.isMicrosoft365OptimizationSummary({ ...summary, groups: [{ ...protection, ...patch }] }), false);
    }
    assert.equal(api.isMicrosoft365OptimizationSummary({ ...summary, groups: [{ ...combine, selectedOptionId: 'missing' }] }), false);
    const blocked = clone(summary);
    blocked.groups[0].options[0].qualification = 'blocked';
    blocked.groups[0].options[0].blockedBy = ['eligibility_unknown'];
    assert.equal(api.isMicrosoft365OptimizationSummary(blocked), false);
    const unknownOption = clone(summary);
    unknownOption.groups[0].options[0].unitPrices[0].unitPriceMonthly = null;
    assert.equal(api.isMicrosoft365OptimizationSummary(unknownOption), false);
  });
  test(`${format}: account details bind identities and selection references without altering legacy contracts`, () => {
    assert.equal(api.isMicrosoft365OptimizationAccountDetail({ ...detail, accountId: 'not-an-account' }), false);
    assert.equal(api.isMicrosoft365OptimizationAccountDetail({ ...detail, findings: [{ ...combine, selectedOptionId: 'missing' }] }), false);
    assert.equal(api.isMicrosoft365OptimizationAccountDetail({ ...detail, findings: [combine, combine] }), false);
    assert.equal(api.isMicrosoft365OptimizationAccountDetail({ ...detail, pricingRevision: '' }), false);
    assert.equal(api.isMicrosoft365OptimizationAccountDetail({ ...detail, companyId: undefined }), false);
    assert.equal(api.isMicrosoft365OptimizationSummary({ ...summary, companyId: undefined }), false);
    assert.equal(
      api.isMicrosoft365OptimizationSummary({ ...summary, groups: [{ ...combine, population: { ...combine.population, unit: 'seats' } }] }),
      false
    );
    assert.equal(api.isMicrosoft365OptimizationEvidence({ ...evidence, accounts: [evidence.accounts[0], evidence.accounts[0]] }), false);
    assert.equal(api.isMicrosoft365OptimizationEvidence({ ...evidence, accounts: Array(5001).fill(evidence.accounts[0]) }), false);
    assert.equal(api.isMicrosoft365OptimizationEvidence({ ...evidence, omittedAccountCount: 1 }), false);
    assert.equal(typeof api.isMicrosoft365LicenseSummaryView, 'function');
  });
  test(`${format}: rejects sparse and prototype-bearing wire objects`, () => {
    assert.equal(api.isMicrosoft365OptimizationSummary({ ...summary, groups: Array(1) }), false);
    assert.equal(api.isMicrosoft365OptimizationSummary(Object.create(summary)), false);
    assert.equal(api.isMicrosoft365OptimizationSummary(Object.assign(Object.create({ accountIds: ['private'] }), summary)), false);
    assert.equal(api.isMicrosoft365OptimizationEvidence({ ...evidence, accounts: Array(1) }), false);
  });
  test(`${format}: full-population cohort facts support repricing without loading all account pages`, () => {
    assert.equal(api.isMicrosoft365OptimizationCohortEvidence(cohortEvidence), true);
    assert.equal(api.isMicrosoft365OptimizationSummary(cohortEvidence), false);
    assert.equal(
      api.isMicrosoft365OptimizationCohortEvidence({ ...cohortEvidence, cohorts: [{ ...cohortEvidence.cohorts[0], accountId: privateAccountId }] }),
      false
    );
    assert.equal(api.isMicrosoft365OptimizationCohortEvidence({ ...cohortEvidence, observedAccountCount: 2 }), false);
    assert.equal(api.isMicrosoft365OptimizationCohortEvidence({ ...cohortEvidence, cohorts: Array(1) }), false);
    assert.equal(
      api.isMicrosoft365OptimizationCohortEvidence({
        ...cohortEvidence,
        coverage: { state: 'partial', reasonCodes: ['cohort_limit'] },
        observedAccountCount: 2,
        omittedAccountCount: 1,
      }),
      true
    );
    assert.equal(privateCohortId, cohortEvidence.cohorts[0].id);
  });
  test(`${format}: exact aggregates require known contributions and reconcile to their groups`, () => {
    const empty = { ...summary, groups: [], portfolioMonthlySaving: 0, protectionMonthlyInvestment: 0 };
    assert.equal(api.isMicrosoft365OptimizationSummary(empty), true);
    assert.equal(api.isMicrosoft365OptimizationSummary({ ...empty, portfolioMonthlySaving: 100 }), false);
    assert.equal(api.isMicrosoft365OptimizationSummary({ ...empty, protectionMonthlyInvestment: 100 }), false);
    assert.equal(api.isMicrosoft365OptimizationSummary({ ...summary, portfolioMonthlySaving: 211 }), false);
    const unknownTerm = {
      ...term,
      priceMethod: 'unavailable',
      sourcePrice: { ...term.sourcePrice, unitPriceMonthly: null, source: 'unavailable', receipt: unknownReceipt },
      targetPrice: { ...term.targetPrice, unitPriceMonthly: null, source: 'unavailable', receipt: unknownReceipt },
      scenarioMonthlySaving: null,
      portfolioMonthlySaving: null,
    };
    const missing = { ...empty, groups: [unknownTerm] };
    assert.equal(api.isMicrosoft365OptimizationSummary(missing), false);
    assert.equal(api.isMicrosoft365OptimizationSummary({ ...missing, portfolioMonthlySaving: null }), true);
  });
  test(`${format}: selection chooses the cheapest eligible option and preserves uniform source cohorts`, () => {
    const cheaper = {
      ...option,
      id: 'cheaper',
      monthlyCostChange: -25,
      unitPrices: option.unitPrices.map(p => (p.skuId === skuC ? { ...p, unitPriceMonthly: 5 } : p)),
    };
    const group = { ...combine, options: [option, cheaper] };
    assert.equal(api.isMicrosoft365OptimizationSummary({ ...summary, groups: [group], portfolioMonthlySaving: 20 }), false);
    assert.equal(
      api.isMicrosoft365OptimizationSummary({
        ...summary,
        groups: [{ ...group, selectedOptionId: 'cheaper', scenarioMonthlySaving: 25, portfolioMonthlySaving: 25 }],
        portfolioMonthlySaving: 25,
      }),
      true
    );
    const mismatched = {
      ...cheaper,
      fromSkuIds: [skuA, accountId],
      unitPrices: cheaper.unitPrices.map(p => (p.skuId === skuB ? { ...p, skuId: accountId } : p)),
    };
    assert.equal(
      api.isMicrosoft365OptimizationSummary({ ...summary, groups: [{ ...group, options: [option, mismatched] }], portfolioMonthlySaving: 20 }),
      false
    );
    assert.equal(api.isMicrosoft365OptimizationSummary({ ...summary, groups: [{ ...combine, omittedOptionCount: 1 }] }), false);
  });
  test(`${format}: nested account findings preserve kind, local option IDs and compatible selection`, () => {
    const extra = '66666666-6666-4666-8666-666666666666';
    const addOn = {
      ...option,
      id: 'option-a',
      mode: 'add_on',
      fromSkuIds: [],
      toSkuIds: [extra],
      monthlyCostChange: 15,
      gainedCapabilityIds: ['endpoint-p1'],
      priceBasis: 'list',
      unitPrices: [{ skuId: extra, unitPriceMonthly: 15, source: 'list', receipt: listReceipt }],
    };
    const purchase = {
      ...protection,
      qualification: 'eligible',
      blockedBy: [],
      missingCapabilityIds: ['endpoint-p1'],
      configurationReviewCapabilityIds: [],
      options: [addOn],
      selectedOptionId: 'option-a',
      monthlyInvestment: 15,
    };
    assert.equal(api.isMicrosoft365OptimizationAccountDetail({ ...detail, findings: [combine, purchase] }), true);
    const overlap = {
      ...addOn,
      mode: 'replace',
      fromSkuIds: [skuA],
      unitPrices: [
        { skuId: skuA, unitPriceMonthly: 10, source: 'list', receipt: listReceipt },
        { skuId: extra, unitPriceMonthly: 25, source: 'list', receipt: listReceipt },
      ],
    };
    assert.equal(api.isMicrosoft365OptimizationAccountDetail({ ...detail, findings: [combine, { ...purchase, options: [overlap] }] }), false);
    const unknown = {
      ...option,
      id: 'unknown',
      monthlyCostChange: null,
      priceBasis: 'unavailable',
      unitPrices: option.unitPrices.map(p => ({ ...p, unitPriceMonthly: null, source: 'unavailable', receipt: unknownReceipt })),
    };
    assert.equal(api.isMicrosoft365OptimizationAccountDetail({ ...detail, findings: [{ ...combine, options: [option, unknown] }] }), false);
    assert.equal(api.isMicrosoft365OptimizationAccountDetail({ ...detail, reviewDisposition: 'kept' }), false);
    assert.equal(
      api.isMicrosoft365OptimizationSummary({
        ...summary,
        groups: [{ ...purchase, monthlyInvestment: 0 }],
        portfolioMonthlySaving: 0,
        protectionMonthlyInvestment: 0,
      }),
      false
    );
    assert.equal(
      api.isMicrosoft365OptimizationSummary({ ...summary, groups: [purchase], portfolioMonthlySaving: 0, protectionMonthlyInvestment: 15 }),
      true
    );
  });
  test(`${format}: term history is fresh and excludes current or future months`, () => {
    for (const monthsBad of [
      ['2027-01', '2027-02', '2027-03', '2027-04', '2027-05', '2027-06'],
      ['2019-01', '2019-02', '2019-03', '2019-04', '2019-05', '2019-06'],
      ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'],
    ]) {
      const bad = clone(evidence);
      bad.demandBySku[0].observations = monthsBad.map(month => ({ month, assignedSeats: 100, complete: true }));
      assert.equal(api.isMicrosoft365OptimizationEvidence(bad), false);
      assert.equal(
        api.isMicrosoft365OptimizationSummary({ ...summary, groups: [{ ...term, historyMonths: monthsBad }], portfolioMonthlySaving: 190 }),
        false
      );
    }
    assert.equal(
      api.isMicrosoft365OptimizationSummary({
        ...summary,
        groups: [{ ...term, subscriptions: [{ ...term.subscriptions[0], termSource: 'inferred' }] }],
        portfolioMonthlySaving: 190,
      }),
      false
    );
    assert.equal(
      api.isMicrosoft365OptimizationSummary({
        ...summary,
        groups: [{ ...term, subscriptions: [{ ...term.subscriptions[0], hasConflict: true }] }],
        portfolioMonthlySaving: 190,
      }),
      false
    );
  });
  test(`${format}: commercial inference and reduction dates retain independent provenance`, () => {
    assert.equal(api.isMicrosoft365CommercialSubscription({ ...commercial, termSource: 'inferred' }), false);
    const inferred = {
      ...commercial,
      termSource: 'inferred',
      inference: { method: 'renewal_history', confidence: 'inferred', observationMonths: months.slice(-2) },
      reductionTiming: { date: '2026-12-01', source: 'billing', confirmed: true },
    };
    assert.equal(api.isMicrosoft365CommercialSubscription(inferred), true);
    assert.equal(api.isMicrosoft365CommercialSubscription({ ...commercial, billingFrequency: 'annual' }), false);
    assert.equal(api.isMicrosoft365CommercialSubscription({ ...commercial, billingFrequency: 'upfront' }), true);
    assert.equal(
      api.isMicrosoft365CommercialSubscription({ ...commercial, reductionTiming: { date: '2026-12-01', source: 'lifecycle', confirmed: true } }),
      false
    );
  });
  test(`${format}: tenant-shared evidence rejects every nested customer-recorded input`, () => {
    const dateFromCompany = { ...commercial, reductionTiming: { date: '2026-12-01', source: 'recorded', confirmed: true } };
    const conflictFromCompany = { ...commercial, conflicts: [{ source: 'recorded', term: 'annual', billingFrequency: 'annual' }] };
    assert.equal(api.isMicrosoft365CommercialSubscription(dateFromCompany), true);
    assert.equal(api.isMicrosoft365CommercialSubscription(conflictFromCompany), true);
    for (const subscription of [dateFromCompany, conflictFromCompany])
      assert.equal(api.isMicrosoft365OptimizationEvidence({ ...evidence, subscriptions: [subscription] }), false);
  });
  test(`${format}: term savings require a positive source-to-target price difference`, () => {
    for (const unitPriceMonthly of [12, 13])
      assert.equal(
        api.isMicrosoft365OptimizationSummary({
          ...summary,
          groups: [{ ...term, targetPrice: { ...term.targetPrice, unitPriceMonthly } }],
          portfolioMonthlySaving: 190,
        }),
        false
      );
    assert.equal(
      api.isMicrosoft365OptimizationSummary({
        ...summary,
        groups: [{ ...term, scenarioMonthlySaving: 0, portfolioMonthlySaving: 0 }],
        portfolioMonthlySaving: 0,
      }),
      false
    );
  });
  test(`${format}: coverage cannot claim a complete or unavailable channel set inconsistently`, () => {
    for (const coveragePatch of [
      { state: 'unavailable', reasonCodes: ['not_collected'] },
      { state: 'partial', reasonCodes: ['missing'] },
    ])
      assert.equal(api.isMicrosoft365OptimizationSummary({ ...summary, coverage: coveragePatch }), false);
    assert.equal(
      api.isMicrosoft365OptimizationSummary({
        ...summary,
        coverageByKind: { ...coverageByKind, changeTerm: { state: 'unavailable', reasonCodes: ['not_collected'] } },
      }),
      false
    );
    assert.equal(api.isMicrosoft365OptimizationEvidence({ ...evidence, coverage: { state: 'unavailable', reasonCodes: ['not_collected'] } }), false);
    assert.equal(
      api.isMicrosoft365OptimizationAccountDetail({ ...detail, coverage: { state: 'unavailable', reasonCodes: ['not_collected'] } }),
      false
    );
  });
  test(`${format}: rate reversal becomes blocked rather than an unknown portfolio saving`, () => {
    const expensive = {
      ...option,
      monthlyCostChange: 1,
      unitPrices: option.unitPrices.map(p => (p.skuId === skuC ? { ...p, unitPriceMonthly: 31 } : p)),
    };
    const noSaving = { ...combine, options: [expensive], selectedOptionId: null, scenarioMonthlySaving: null, portfolioMonthlySaving: null };
    assert.equal(api.isMicrosoft365OptimizationSummary({ ...summary, groups: [noSaving], portfolioMonthlySaving: null }), false);
    assert.equal(
      api.isMicrosoft365OptimizationSummary({
        ...summary,
        groups: [{ ...noSaving, qualification: 'blocked', blockedBy: ['not_cost_effective'] }],
        portfolioMonthlySaving: 0,
      }),
      true
    );
  });
  test(`${format}: a selected protection purchase supplies each declared missing capability`, () => {
    const extra = '66666666-6666-4666-8666-666666666666';
    const addon = {
      ...option,
      mode: 'add_on',
      fromSkuIds: [],
      toSkuIds: [extra],
      priceBasis: 'list',
      monthlyCostChange: 15,
      unitPrices: [{ skuId: extra, unitPriceMonthly: 15, source: 'list', receipt: listReceipt }],
    };
    const purchase = {
      ...protection,
      qualification: 'eligible',
      blockedBy: [],
      configurationReviewCapabilityIds: [],
      missingCapabilityIds: ['endpoint-p1'],
      options: [addon],
      selectedOptionId: addon.id,
      monthlyInvestment: 15,
    };
    assert.equal(
      api.isMicrosoft365OptimizationSummary({ ...summary, groups: [purchase], portfolioMonthlySaving: 0, protectionMonthlyInvestment: 15 }),
      false
    );
    assert.equal(
      api.isMicrosoft365OptimizationSummary({
        ...summary,
        groups: [{ ...purchase, options: [{ ...addon, gainedCapabilityIds: ['endpoint-p1'] }] }],
        portfolioMonthlySaving: 0,
        protectionMonthlyInvestment: 15,
      }),
      true
    );
  });
  test(`${format}: private pages name the full observed population without calling other pages omitted`, () => {
    assert.equal(
      api.isMicrosoft365OptimizationEvidence({ ...evidence, pageIndex: 1, pageCount: 2, pageAccountCounts: [5000, 1], observedAccountCount: 5001 }),
      true
    );
    assert.equal(
      api.isMicrosoft365OptimizationEvidence({ ...evidence, pageIndex: 0, pageCount: 2, pageAccountCounts: [5000, 1], observedAccountCount: 5001 }),
      false
    );
    assert.equal(
      api.isMicrosoft365OptimizationEvidence({ ...evidence, pageIndex: 0, pageCount: 2, pageAccountCounts: [1, 1], observedAccountCount: 2 }),
      true
    );
    assert.equal(api.isMicrosoft365OptimizationEvidence({ ...evidence, pageIndex: 2, pageCount: 2 }), false);
  });
  test(`${format}: existing annual and three-year stock both reduce the convertible population`, () => {
    const existing = {
      ...term,
      subscriptions: [
        ...term.subscriptions,
        { subscriptionId: 'annual-1', termSource: 'recorded', term: 'annual', quantity: 10, hasConflict: false },
        { subscriptionId: 'three-year-1', termSource: 'billing', term: 'three_year', quantity: 5, hasConflict: false },
      ],
      committedSeats: 15,
      convertibleSeats: 80,
      population: { unit: 'seats', exactCount: 80, observedCount: 80 },
      scenarioMonthlySaving: 160,
      portfolioMonthlySaving: 160,
    };
    const view = { ...summary, groups: [existing], portfolioMonthlySaving: 160 };
    assert.equal(api.isMicrosoft365OptimizationSummary(view), true);
    assert.equal(api.isMicrosoft365OptimizationSummary({ ...view, groups: [{ ...existing, committedSeats: 10 }] }), false);
    assert.equal(
      api.isMicrosoft365OptimizationSummary({
        ...view,
        groups: [{ ...existing, population: { ...existing.population, exactCount: 81, observedCount: 81 } }],
      }),
      false
    );
    assert.equal(
      api.isMicrosoft365OptimizationSummary({ ...view, groups: [{ ...existing, targetPrice: { ...existing.targetPrice, source: 'unavailable' } }] }),
      false
    );
  });
  test(`${format}: independent coverage preserves protection totals when term evidence is unavailable`, () => {
    const partial = {
      ...summary,
      coverage: { state: 'partial', reasonCodes: ['term_not_collected'] },
      coverageByKind: { ...coverageByKind, changeTerm: { state: 'unavailable', reasonCodes: ['not_collected'] } },
      groups: [combine, protection],
      portfolioMonthlySaving: null,
    };
    assert.equal(api.isMicrosoft365OptimizationSummary(partial), true);
    assert.equal(api.isMicrosoft365OptimizationSummary({ ...partial, portfolioMonthlySaving: 20 }), false);
  });
  test(`${format}: anonymous provider coverage uses opaque identities, dated scope and consistent counts`, () => {
    const covered = {
      capabilityId: 'endpoint-p1',
      providerId: 'crowdstrike',
      scopeReference: 'scope-1',
      unit: 'accounts',
      coveredCount: 1,
      observedAt: snapshot.generatedAt,
      validUntil: '2026-12-01T00:00:00.000Z',
    };
    const view = { ...summary, groups: [{ ...protection, thirdPartyCoverage: [covered] }], portfolioMonthlySaving: 0 };
    assert.equal(api.isMicrosoft365OptimizationSummary(view), true);
    assert.equal(
      api.isMicrosoft365OptimizationSummary({
        ...view,
        groups: [{ ...view.groups[0], thirdPartyCoverage: [{ ...covered, observedAt: '2026-11-05T00:00:00Z' }] }],
      }),
      true
    );
    for (const patch of [{ providerId: 'alice@contoso.com' }, { coveredCount: 2 }, { validUntil: '2026-11-04T00:00:00.000Z' }]) {
      assert.equal(
        api.isMicrosoft365OptimizationSummary({ ...view, groups: [{ ...view.groups[0], thirdPartyCoverage: [{ ...covered, ...patch }] }] }),
        false
      );
    }
    assert.equal(api.isMicrosoft365OptimizationSummary({ ...summary, groups: [{ ...combine, id: 'alice@contoso.com' }] }), false);
    assert.equal(api.isMicrosoft365OptimizationSummary({ ...summary, companyId: 'company\u202e1' }), false);
    assert.equal(
      api.isMicrosoft365OptimizationSummary({
        ...summary,
        groups: [{ ...protection, configurationReviewCapabilityIds: [] }],
        portfolioMonthlySaving: 0,
      }),
      false
    );
  });
}
