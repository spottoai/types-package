import assert from 'node:assert/strict';

import {
  REPORT_EVIDENCE_LIMITS,
  REPORT_PRINCIPAL_TYPES,
  isSubscriptionReportEvidencePack,
  isSubscriptionReportHistory,
  isTenantReportEvidencePack,
} from '../dist/index.js';

const rows = values => ({ totalCount: values.length, rows: values, omittedCount: 0 });
const emptyRows = () => rows([]);

const reporting = {
  dashboard: {},
  costChangePeriods: rows([
    {
      period: '2026-08',
      previousPeriod: '2026-07',
      currency: 'NZD',
      currentCost: 125,
      previousCost: 100,
      change: 25,
      drivers: rows([
        {
          key: 'service:virtual-machines',
          level: 'service',
          label: 'Virtual Machines',
          currentCost: 75,
          previousCost: 50,
          change: 25,
          changeType: 'increase',
          summary: 'Compute usage increased.',
          reasons: rows([
            {
              type: 'quantity_increase',
              impact: 25,
              impactPercent: 100,
              description: 'Usage increased by 50 hours.',
              oldValue: 100,
              newValue: 150,
            },
          ]),
        },
      ]),
    },
  ]),
  recommendationPortfolio: {
    sourceRecommendationCount: 0,
    activeRecommendationCount: 0,
    resolvedRecommendationCount: 0,
    highImpactCount: 0,
    quickWinCount: 0,
    byCategory: {},
    byImpact: { High: 0, Medium: 0, Low: 0, Unknown: 0 },
    byEffort: { Low: 0, Medium: 0, High: 0, Unknown: 0 },
    impactEffortMatrix: ['High', 'Medium', 'Low', 'Unknown'].flatMap(impact =>
      ['Low', 'Medium', 'High', 'Unknown'].map(effort => ({ impact, effort, count: 0 }))
    ),
    affectedResources: { count: 0, identifiedCount: 0, largestReportedRecommendationCount: 0, basis: 'exact' },
  },
  recommendations: emptyRows(),
  serviceRetirements: emptyRows(),
  inventory: {
    totalResources: 0,
    untaggedResourceCount: 0,
    untaggedExamples: emptyRows(),
    snapshots: emptyRows(),
    appliedTagCosts: emptyRows(),
    topSpendResources: emptyRows(),
  },
  governance: {
    policySummary: {},
    rbacSummary: {},
    globalAdministratorSummary: {},
    complianceRows: emptyRows(),
    privilegedAccessRows: emptyRows(),
    findings: emptyRows(),
    limitations: emptyRows(),
  },
  patchManagement: { machines: emptyRows() },
  dataProtection: {
    costSummary: {
      currencyCode: 'NZD',
      totals: { actualCostLast30Days: 25, estimatedMonthlyCostForUnprotected: 10 },
    },
    items: emptyRows(),
    issues: emptyRows(),
  },
  resourceHealth: {
    events: {
      events: rows([
        {
          id: 'incident-1',
          status: 'Resolved',
          impactStartTime: '2026-08-01T00:00:00.000Z',
          impactMitigationTime: '2026-08-01T01:00:00.000Z',
          durationSeconds: 3600,
        },
      ]),
    },
    availabilityStatuses: { statuses: emptyRows() },
  },
  serverUptime: { workspaces: emptyRows(), gaps: emptyRows(), servers: emptyRows() },
  publicIpAddresses: { items: emptyRows() },
  activity: { changes: emptyRows(), security: emptyRows(), health: emptyRows(), suppressed: emptyRows() },
  commitmentsPlanning: {
    inventorySummary: { totalCount: 0, statusCounts: {}, benefitTypeCounts: {} },
    inventory: emptyRows(),
    coverage: emptyRows(),
    obsoleteCandidates: emptyRows(),
    reallocationOpportunities: emptyRows(),
    purchaseRecommendations: emptyRows(),
    renewals: emptyRows(),
  },
};

export const subscriptionPack = {
  generatedAt: '2026-09-11T00:00:00.000Z',
  generation: {},
  scope: { subscriptionId: 'subscription-1', currency: 'NZD' },
  coverage: { sourceFiles: {}, gaps: [] },
  estate: {
    total: 0,
    byType: [],
    byLocation: [],
    tagCoverage: { withTags: 0, withoutTags: 0, coveragePercentage: 0, topTagKeys: [] },
    topSpendResources: [],
  },
  cost: {
    sourceMetadata: {
      spend30DaysSource: 'summary',
      spend30DaysAmortizedSource: 'summary',
      totalRetailCostSource: 'summary',
      rollingCostFile: 'history/billing/cost-last-30-days.json',
    },
    topSpendResources: [],
  },
  recommendations: {
    total: 0,
    byPillar: {},
    byImpact: {},
    byEffort: {},
    topRecommendationIds: [],
    topRecommendationIdsByPillar: {},
  },
  security: {},
  reliability: {
    serviceRetirements: {
      total: 0,
      sourceRecordCount: 0,
      excludedUnlinked: 0,
      excludedCommitmentExpiries: 0,
      within180Days: 0,
      expiredOrPastDue: 0,
      upcoming: [],
    },
    recommendationCount: 0,
  },
  commitments: { expiries: { total: 0, sourceRecordCount: 0, within180Days: 0, expiredOrPastDue: 0, upcoming: [] } },
  performance: { recommendationCount: 0, topRecommendationIds: [] },
  operationalExcellence: {
    recommendationCount: 0,
    tagCoverage: { withTags: 0, withoutTags: 0, coveragePercentage: 0, topTagKeys: [] },
  },
  reporting,
  evidence: [],
};

const history = {
  subscriptionId: 'subscription-1',
  generatedAt: '2026-09-11T00:00:00.000Z',
  retention: { maxPeriods: REPORT_EVIDENCE_LIMITS.historyPeriods },
  periods: [
    {
      period: '2026-09',
      sourceRunId: 'run-1',
      sourceGeneratedAt: '2026-09-11T00:00:00.000Z',
      metrics: {
        resourceCount: 1,
        recommendationCount: 1,
        impactedResourceCount: 1,
        securityRecommendationCount: 0,
        securityImpactedResourceCount: 0,
        maximumMonthlySavings: 274.08,
      },
      recommendations: rows([{ id: 'cost-1', title: 'Reduce cost', category: 'Cost', affectedResourceCount: 1, maximumMonthlySavings: 274.08 }]),
      comparisonIdentities: {
        costRecommendationIds: rows(['cost-1']),
        undersizedResourceIds: rows(['/subscriptions/subscription-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-1']),
        regulatoryAssessmentKeys: rows(['a'.repeat(64)]),
      },
    },
  ],
};

const tenantPack = {
  generatedAt: '2026-09-11T00:00:00.000Z',
  scope: { tenantId: 'tenant-1' },
  mfa: {
    summary: {
      enumeratedUsers: 10_000,
      activeUsers: 10_000,
      disabledUsers: 0,
      assessedActiveUsers: 10_000,
      enforcementKnownUsers: 9_950,
      enforcementUnknownUsers: 50,
      countsAreLowerBounds: false,
      enforcement: { enforced: 9_000, conditionallyEnforced: 900, notEnforced: 50, unknown: 50 },
    },
  },
  globalAdmins: {
    summary: {},
    coverage: {
      userSignInActivity: {
        state: 'complete',
        source: 'microsoft-graph',
        requiredPermissions: ['AuditLog.Read.All'],
      },
    },
    warnings: emptyRows(),
    principals: rows([
      {
        principalId: 'principal-1',
        principalType: 'user',
        assignmentSource: 'direct',
        assignmentModes: ['permanent'],
        isPimBacked: false,
        lastActivatedEvidence: 'none',
        lastSignInAt: '2026-09-10T00:00:00.000Z',
        lastSignInEvidence: 'last-successful-sign-in',
      },
    ]),
  },
};

assert.equal(isSubscriptionReportEvidencePack(subscriptionPack), true);
const monthlyBudgetPack = structuredClone(subscriptionPack);
monthlyBudgetPack.cost.budget = {
  name: 'd365-sub-budget',
  amount: 9000,
  currentSpend: 7627.35,
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2034-12-31T00:00:00Z',
  timeGrain: 'Monthly',
  category: 'Cost',
  currencyCode: 'NZD',
  filter: {},
};
assert.equal(isSubscriptionReportEvidencePack(monthlyBudgetPack), true, 'typed monthly budget evidence');
for (const [field, invalidValue] of [['timeGrain', 30], ['amount', '9000'], ['filter', []], ['currencyCode', 123]]) {
  const invalidBudget = structuredClone(monthlyBudgetPack);
  invalidBudget.cost.budget[field] = invalidValue;
  assert.equal(isSubscriptionReportEvidencePack(invalidBudget), false, `reject malformed budget ${field}`);
}
const credentialActivityPack = structuredClone(subscriptionPack);
credentialActivityPack.reporting.credentialDeadlines = {
  asOf: '2026-09-17T00:00:00.000Z',
  overdueCount: 162,
  upcomingSixMonthsCount: 85,
};
credentialActivityPack.reporting.activity.dailySummary = rows([{
  date: '2026-08-17',
  visibleEvents: 100,
  materialChanges: 90,
  securitySensitive: 5,
  healthEvents: 5,
  failedEvents: 0,
  highFindingCount: 0,
  automatedSnapshotEvents: 80,
}]);
assert.equal(isSubscriptionReportEvidencePack(credentialActivityPack), true, 'complete credential and activity counts');
const invalidCredentialCount = structuredClone(credentialActivityPack);
invalidCredentialCount.reporting.credentialDeadlines.overdueCount = -1;
assert.equal(isSubscriptionReportEvidencePack(invalidCredentialCount), false, 'reject negative credential counts');
const invalidSnapshotCount = structuredClone(credentialActivityPack);
invalidSnapshotCount.reporting.activity.dailySummary.rows[0].automatedSnapshotEvents = 91;
assert.equal(isSubscriptionReportEvidencePack(invalidSnapshotCount), false, 'snapshot events cannot exceed material changes');
assert.equal(isSubscriptionReportHistory(history), true);
const commitmentUtilizationPack = structuredClone(subscriptionPack);
commitmentUtilizationPack.reporting.commitmentsPlanning.inventorySummary = {
  totalCount: 2,
  statusCounts: { active: 2 },
  benefitTypeCounts: { reservation: 1, 'savings-plan': 1 },
};
commitmentUtilizationPack.reporting.commitmentsPlanning.inventory = rows([
  {
    id: 'reservation-1',
    benefitType: 'reservation',
    status: 'active',
    utilization: { sevenDay: 84.5, thirtyDay: 88.2, source: 'reservation-summary' },
  },
  {
    id: 'savings-plan-1',
    benefitType: 'savings-plan',
    status: 'active',
    utilization: { thirtyDay: 108, source: 'usage' },
  },
]);
assert.equal(isSubscriptionReportEvidencePack(commitmentUtilizationPack), true);
for (const utilization of [null, {}, { thirtyDay: '88' }, { sevenDay: -1 }, { thirtyDay: Infinity }, { thirtyDay: 88, source: 'unknown' }]) {
  const invalid = structuredClone(commitmentUtilizationPack);
  invalid.reporting.commitmentsPlanning.inventory.rows[0].utilization = utilization;
  assert.equal(isSubscriptionReportEvidencePack(invalid), false, 'Malformed commitment utilization rejected');
}
for (const evidence of [
  {
    status: 'available',
    percentage: 11.7,
    currentScore: 5.03,
    maxScore: 43,
    weight: 529,
    assessedResourceCount: 100,
    observedAt: '2026-08-31T00:00:00.000Z',
  },
  { status: 'available', percentage: 0 },
  { status: 'unavailable' },
  { status: 'stale', percentage: 13 },
]) {
  const scoreHistory = structuredClone(history);
  scoreHistory.periods[0].metrics.secureScoreEvidence = evidence;
  assert.equal(isSubscriptionReportHistory(scoreHistory), true);
  const scorePack = structuredClone(subscriptionPack);
  scorePack.reporting.dashboard = { subscription: { properties: { secureScoreEvidence: evidence } } };
  assert.equal(isSubscriptionReportEvidencePack(scorePack), true);
}
for (const evidence of [
  { status: 'unknown' },
  { status: 'available', percentage: 101 },
  { status: 'available', percentage: -1 },
  { status: 'available', weight: -1 },
  { status: 'available', currentScore: 44, maxScore: 43 },
  { status: 'available', assessedResourceCount: 1.5 },
  { status: 'available', observedAt: 'not-a-date' },
]) {
  const scoreHistory = structuredClone(history);
  scoreHistory.periods[0].metrics.secureScoreEvidence = evidence;
  assert.equal(isSubscriptionReportHistory(scoreHistory), false);
  const scorePack = structuredClone(subscriptionPack);
  scorePack.reporting.dashboard = { subscription: { properties: { secureScoreEvidence: evidence } } };
  assert.equal(isSubscriptionReportEvidencePack(scorePack), false);
}
assert.equal(isTenantReportEvidencePack(tenantPack), true);

const populationPack = structuredClone(subscriptionPack);
populationPack.reporting.recommendations = rows([
  { recommendation: { id: 'security-1', title: 'Improve security' }, resources: [], resourcesCount: 0, omittedResourceCount: 0 },
]);
const populationPortfolio = populationPack.reporting.recommendationPortfolio;
populationPortfolio.sourceRecommendationCount = populationPortfolio.activeRecommendationCount = 1;
populationPortfolio.byCategory = { uncategorized: 1 };
populationPortfolio.byImpact.Unknown = populationPortfolio.byEffort.Unknown = 1;
populationPortfolio.impactEffortMatrix.find(row => row.impact === 'Unknown' && row.effort === 'Unknown').count = 1;
populationPack.reporting.recommendationCatalogue = structuredClone(populationPack.reporting.recommendations);
populationPack.reporting.governance.complianceAssessments = {
  totalCount: 1,
  omittedCount: 0,
  rows: [{ assessmentKey: 'a'.repeat(64), policyDefinitionDisplayName: 'Storage control', nonCompliantResourceCount: 40 }],
};
const activityDay = {
  date: '2026-08-31',
  visibleEvents: 100,
  materialChanges: 25,
  securitySensitive: 12,
  healthEvents: 75,
  failedEvents: 2,
  highFindingCount: 5,
};
populationPack.reporting.activity.dailySummary = { totalCount: 1, omittedCount: 0, rows: [activityDay] };
assert.equal(isSubscriptionReportEvidencePack(populationPack), true);
const cataloguePack = structuredClone(populationPack);
cataloguePack.reporting.recommendationCatalogue.rows[0].resourceCatalogue = emptyRows();
cataloguePack.reporting.inventory.resourceCatalogue = emptyRows();
cataloguePack.reporting.resourceHealth.eventCatalogue = structuredClone(cataloguePack.reporting.resourceHealth.events.events);
cataloguePack.reporting.resourceHealth.availabilityCatalogue = emptyRows();
assert.equal(isSubscriptionReportEvidencePack(cataloguePack), true);
for (const mutate of [
  pack => {
    pack.reporting.resourceHealth.eventCatalogue = rows([{ id: 'incident-1' }, { id: 'unmatched-event' }]);
  },
  pack => {
    pack.reporting.resourceHealth.availabilityCatalogue = rows([{ id: 'unmatched-status' }]);
  },
  pack => {
    pack.reporting.recommendationCatalogue.rows[0].resourceCatalogue = rows([{ id: 'vm' }]);
  },
  pack => {
    pack.reporting.inventory.resourceCatalogue = rows([{ id: 'vm', tags: { Owner: 42 } }]);
  },
  pack => {
    pack.reporting.resourceHealth.eventCatalogue = rows(Array.from({ length: 2001 }, () => ({})));
  },
  pack => {
    pack.reporting.resourceHealth.availabilityCatalogue.omittedCount = -1;
  },
]) {
  const invalid = structuredClone(cataloguePack);
  mutate(invalid);
  assert.equal(isSubscriptionReportEvidencePack(invalid), false, 'Malformed report catalogue rejected');
}
populationPack.reporting.recommendationCatalogue.rows[0].recommendation.securityAssessmentSummary = { unhealthyCount: 2, totalCount: 3 };
populationPack.reporting.recommendationCatalogue.rows[0].recommendation.reportingTextTruncated = true;
assert.equal(isSubscriptionReportEvidencePack(populationPack), true);
for (const mutate of [
  value => {
    value.reporting.recommendationCatalogue.rows[0].recommendation.reportingTextTruncated = 'true';
  },
  value => {
    value.reporting.recommendationCatalogue.rows[0].recommendation.securityAssessmentSummary.unhealthyCount = 4;
  },
  value => {
    value.reporting.recommendationCatalogue.rows[0].recommendation.securityImpactDetails = { controlName: 42 };
  },
  value => {
    value.reporting.recommendationCatalogue.totalCount += 1;
    value.reporting.recommendationCatalogue.omittedCount += 1;
  },
  value => {
    value.reporting.governance.complianceAssessments.rows[0].nonCompliantResourceCount = -1;
  },
  value => {
    value.reporting.governance.complianceAssessments.rows[0].assessmentKey = 'truncated-display-label';
  },
  value => {
    value.reporting.activity.dailySummary.rows[0].date = '2026-02-30';
  },
  value => {
    value.reporting.activity.dailySummary.rows[0].failedEvents = 101;
  },
  value => {
    value.reporting.activity.dailySummary.rows.push(activityDay);
    value.reporting.activity.dailySummary.totalCount = 2;
  },
  value => {
    value.reporting.activity.dailySummary = { totalCount: 401, omittedCount: 0, rows: Array.from({ length: 401 }, () => activityDay) };
  },
]) {
  const invalidPopulation = structuredClone(populationPack);
  mutate(invalidPopulation);
  assert.equal(isSubscriptionReportEvidencePack(invalidPopulation), false);
}

const rejectSubscription = mutate => {
  const value = structuredClone(subscriptionPack);
  mutate(value);
  assert.equal(isSubscriptionReportEvidencePack(value), false);
};
rejectSubscription(value => {
  value.reporting.inventory.snapshots = {
    totalCount: 51,
    rows: Array.from({ length: 51 }, (_, index) => ({ name: `snapshot-${index}` })),
    omittedCount: 0,
  };
});
rejectSubscription(value => {
  value.reporting.commitmentsPlanning.inventorySummary = { totalCount: 1, statusCounts: { active: 0 } };
});
rejectSubscription(value => {
  value.reporting.recommendationPortfolio.activeRecommendationCount = 1;
});
rejectSubscription(value => {
  value.reporting.recommendationPortfolio.impactEffortMatrix[0].impact = 'Critical';
});
rejectSubscription(value => {
  value.cost.budget = 'invalid';
});
rejectSubscription(value => {
  value.recommendations.topRecommendationIds = Array.from({ length: 21 }, (_, index) => `recommendation-${index}`);
});
rejectSubscription(value => {
  value.reporting.governance.generatedAt = 42;
});
rejectSubscription(value => {
  value.reporting.governance.coverage = null;
});
rejectSubscription(value => {
  value.reporting.governance.coverage = 42;
});
rejectSubscription(value => {
  value.reporting.costChangePeriods.rows[0].drivers.rows[0].reasons.rows[0].type = 'guess';
});
rejectSubscription(value => {
  value.reporting.costChangePeriods.rows[0].previousPeriod = '2026-09';
});
rejectSubscription(value => {
  value.reporting.dataProtection.costSummary.totals.actualCostLast30Days = '25';
});
rejectSubscription(value => {
  value.reporting.resourceHealth.events.events.rows[0].durationSeconds = -1;
});
rejectSubscription(value => {
  value.reporting.commitmentsPlanning.inventorySummary.benefitTypeCounts = { reservation: 1 };
});

const oversizedHistory = structuredClone(history);
const completeHistory = structuredClone(history);
completeHistory.periods[0].recommendations = rows(
  Array.from({ length: 283 }, (_, index) => ({
    ...history.periods[0].recommendations.rows[0],
    id: `history-${index}`,
    resolved: false,
  }))
);
completeHistory.periods[0].metrics.recommendationCount = 283;
assert.equal(isSubscriptionReportHistory(completeHistory), true, 'Complete EROAD-scale history exceeds the former sample bound');
const tooManyFingerprints = structuredClone(completeHistory);
tooManyFingerprints.periods[0].recommendations = rows(
  Array.from({ length: 2001 }, (_, index) => ({
    ...history.periods[0].recommendations.rows[0],
    id: `history-${index}`,
    resolved: false,
  }))
);
tooManyFingerprints.periods[0].metrics.recommendationCount = 2001;
assert.equal(isSubscriptionReportHistory(tooManyFingerprints), false, 'History remains bounded');
const monthlyActivityPack = structuredClone(subscriptionPack);
monthlyActivityPack.reporting.activity.monthlyFindings = rows([
  {
    month: '2026-08',
    findings: rows([{ kind: 'security', eventTimestamp: '2026-08-31T23:00:00Z', isSecuritySensitive: true }]),
  },
]);
assert.equal(isSubscriptionReportEvidencePack(monthlyActivityPack), true);
for (const mutate of [
  value => {
    value.reporting.activity.monthlyFindings.rows[0].month = '2026-09';
  },
  value => {
    value.reporting.activity.monthlyFindings.rows[0].findings.rows[0].importance = { toString: null, valueOf: null };
  },
  value => {
    value.reporting.activity.monthlyFindings.rows[0].findings.rows[0].status = { toString: null, valueOf: null };
  },
  value => {
    value.reporting.activity.monthlyFindings.rows[0].findings = rows(
      Array.from({ length: 51 }, () => monthlyActivityPack.reporting.activity.monthlyFindings.rows[0].findings.rows[0])
    );
  },
  value => {
    value.reporting.activity.monthlyFindings = rows(Array.from({ length: 14 }, () => monthlyActivityPack.reporting.activity.monthlyFindings.rows[0]));
  },
  value => {
    value.reporting.activity.monthlyFindings.rows[0].findings.rows[0].eventTimestamp = 'invalid';
  },
  value => {
    value.reporting.activity.monthlyFindings.rows[0].findings.rows[0].isSecuritySensitive = false;
  },
  value => {
    value.reporting.activity.monthlyFindings.rows.push(value.reporting.activity.monthlyFindings.rows[0]);
    value.reporting.activity.monthlyFindings.totalCount = 2;
  },
]) {
  const invalid = structuredClone(monthlyActivityPack);
  mutate(invalid);
  assert.equal(isSubscriptionReportEvidencePack(invalid), false, 'Reject misplaced, undated, non-high or duplicate monthly activity');
}
oversizedHistory.periods = Array.from({ length: 14 }, (_, index) => ({
  ...history.periods[0],
  period: `2025-${String(index + 1).padStart(2, '0')}`,
}));
assert.equal(isSubscriptionReportHistory(oversizedHistory), false);
const invalidSavingsHistory = structuredClone(history);
invalidSavingsHistory.periods[0].recommendations.rows[0].maximumMonthlySavings = '274.08';
assert.equal(isSubscriptionReportHistory(invalidSavingsHistory), false);
const resolvedCountHistory = structuredClone(history);
resolvedCountHistory.periods[0].recommendations.rows[0].resolved = true;
assert.equal(isSubscriptionReportHistory(resolvedCountHistory), false);
const duplicateComparisonIdentityHistory = structuredClone(history);
duplicateComparisonIdentityHistory.periods[0].comparisonIdentities.costRecommendationIds = rows(['cost-1', 'cost-1']);
assert.equal(isSubscriptionReportHistory(duplicateComparisonIdentityHistory), false);
const invalidAssessmentIdentityHistory = structuredClone(history);
invalidAssessmentIdentityHistory.periods[0].comparisonIdentities.regulatoryAssessmentKeys = rows(['display-label']);
assert.equal(isSubscriptionReportHistory(invalidAssessmentIdentityHistory), false);

const unreconciledTenant = structuredClone(tenantPack);
unreconciledTenant.mfa.summary.enforcement.notEnforced = 51;
assert.equal(isTenantReportEvidencePack(unreconciledTenant), false);
const oversizedTenant = structuredClone(tenantPack);
oversizedTenant.globalAdmins.principals = {
  totalCount: 51,
  rows: Array.from({ length: 51 }, (_, index) => ({
    principalId: `principal-${index}`,
    principalType: 'user',
    assignmentSource: 'direct',
    assignmentModes: ['permanent'],
    isPimBacked: false,
    lastActivatedEvidence: 'none',
  })),
  omittedCount: 0,
};
assert.equal(isTenantReportEvidencePack(oversizedTenant), false);
const ambiguousTenantSignIn = structuredClone(tenantPack);
ambiguousTenantSignIn.globalAdmins.principals.rows[0].lastSignInEvidence = 'unavailable';
assert.equal(isTenantReportEvidencePack(ambiguousTenantSignIn), false);
const unavailableTenantSignIn = structuredClone(tenantPack);
unavailableTenantSignIn.globalAdmins.coverage.userSignInActivity.state = 'unavailable';
unavailableTenantSignIn.globalAdmins.principals.rows[0].lastSignInAt = undefined;
unavailableTenantSignIn.globalAdmins.principals.rows[0].lastSignInEvidence = 'unavailable';
assert.equal(isTenantReportEvidencePack(unavailableTenantSignIn), true);
const staleTenantSignIn = structuredClone(unavailableTenantSignIn);
staleTenantSignIn.globalAdmins.principals.rows[0].lastSignInAt = '2026-09-10T00:00:00.000Z';
staleTenantSignIn.globalAdmins.principals.rows[0].lastSignInEvidence = 'last-successful-sign-in';
assert.equal(isTenantReportEvidencePack(staleTenantSignIn), false);
const invalidTenantSignInCoverage = structuredClone(tenantPack);
invalidTenantSignInCoverage.globalAdmins.coverage.userSignInActivity.state = 'unknown';
assert.equal(isTenantReportEvidencePack(invalidTenantSignInCoverage), false);

const dailySpend = {
  startDate: '2026-08-01',
  endDate: '2026-08-02',
  dateBasis: 'billing-calendar',
  currency: 'NZD',
  generatedAt: '2026-09-12T00:00:00.000Z',
  sourceObservedAt: '2026-09-11T00:00:00.000Z',
  freshness: 'current',
  coverage: {
    billed: { status: 'complete', coveredDayCount: 2 },
    amortized: { status: 'partial', coveredDayCount: 1 },
  },
  entries: [
    { date: '2026-08-01', cost: 0, costAmortized: -2.5 },
    { date: '2026-08-02', cost: 10.25 },
  ],
};
const packWithDailySpend = value => ({ ...subscriptionPack, reporting: { ...subscriptionPack.reporting, dailySpend: value } });
assert.equal(isSubscriptionReportEvidencePack(packWithDailySpend(dailySpend)), true);
for (const [label, mutate] of [
  [
    'false completeness',
    v => {
      v.coverage.amortized.status = 'complete';
    },
  ],
  [
    'duplicate date',
    v => {
      v.entries[1].date = v.entries[0].date;
    },
  ],
  [
    'invalid calendar date',
    v => {
      v.entries[0].date = '2026-02-30';
    },
  ],
  [
    'non-finite cost',
    v => {
      v.entries[0].cost = Infinity;
    },
  ],
  [
    'null amount',
    v => {
      v.entries[0].cost = null;
    },
  ],
  [
    'string amount',
    v => {
      v.entries[0].cost = '0';
    },
  ],
  [
    'empty amount row',
    v => {
      v.entries[0] = { date: '2026-08-01' };
    },
  ],
  [
    'out of order',
    v => {
      v.entries.reverse();
    },
  ],
  [
    'out of window',
    v => {
      v.entries[1].date = '2026-08-03';
    },
  ],
  [
    'invalid window',
    v => {
      v.endDate = '2026-07-31';
    },
  ],
  [
    'unbounded window',
    v => {
      v.endDate = '2027-08-01';
    },
  ],
  [
    'currency mismatch',
    v => {
      v.currency = 'USD';
    },
  ],
  [
    'invalid currency',
    v => {
      v.currency = 'nzd';
    },
  ],
  [
    'wrong date basis',
    v => {
      v.dateBasis = 'utc';
    },
  ],
  [
    'missing observation',
    v => {
      delete v.sourceObservedAt;
    },
  ],
  [
    'future observation',
    v => {
      v.sourceObservedAt = '2026-10-01T00:00:00Z';
    },
  ],
  [
    'missing freshness',
    v => {
      delete v.freshness;
    },
  ],
  [
    'false unavailability',
    v => {
      v.freshness = 'unavailable';
    },
  ],
  [
    'invalid coverage count',
    v => {
      v.coverage.billed.coveredDayCount = 1;
    },
  ],
]) {
  const invalid = structuredClone(dailySpend);
  mutate(invalid);
  assert.equal(isSubscriptionReportEvidencePack(packWithDailySpend(invalid)), false, label);
}
assert.equal(isSubscriptionReportEvidencePack(packWithDailySpend(null)), false);
const unavailableDaily = {
  ...dailySpend,
  sourceObservedAt: undefined,
  freshness: 'unavailable',
  entries: [],
  coverage: { billed: { status: 'unavailable', coveredDayCount: 0 }, amortized: { status: 'unavailable', coveredDayCount: 0 } },
};
assert.equal(isSubscriptionReportEvidencePack(packWithDailySpend(unavailableDaily)), true);
assert.equal(isSubscriptionReportEvidencePack(packWithDailySpend({ ...dailySpend, freshness: 'stale' })), true);
const { isReportDailySpend } = await import('../dist/index.js');
const esmDaily = await import('../dist/esm/entries/root.js');
assert.equal(esmDaily.isReportDailySpend(dailySpend), true, 'ESM runtime export');
assert.equal(isReportDailySpend(dailySpend), true, 'CJS runtime export');
const fullWindow = {
  ...dailySpend,
  startDate: '2026-07-01',
  endDate: '2026-09-30',
  coverage: { billed: { status: 'complete', coveredDayCount: 92 }, amortized: { status: 'unavailable', coveredDayCount: 0 } },
  entries: Array.from({ length: 92 }, (_, index) => ({ date: new Date(Date.UTC(2026, 6, 1 + index)).toISOString().slice(0, 10), cost: 0 })),
};
assert.equal(isReportDailySpend(fullWindow), true, '92-day boundary and absent amortized evidence');
assert.equal(isReportDailySpend({ ...fullWindow, endDate: '2026-10-01' }), false, '93-day window');
assert.equal(isReportDailySpend({ ...fullWindow, entries: [...fullWindow.entries, fullWindow.entries[0]] }), false, '93 rows');
const leapDay = {
  ...dailySpend,
  startDate: '2024-02-29',
  endDate: '2024-02-29',
  coverage: { billed: { status: 'complete', coveredDayCount: 1 }, amortized: { status: 'unavailable', coveredDayCount: 0 } },
  entries: [{ date: '2024-02-29', cost: -10 }],
};
assert.equal(isReportDailySpend(leapDay), true, 'leap day and credit');
assert.equal(isReportDailySpend({ ...leapDay, generatedAt: '2026-02-30T00:00:00Z' }), false);
assert.equal(isReportDailySpend({ ...leapDay, generatedAt: '2026-09-12T24:00:00Z' }), false);
const augustGap = {
  ...dailySpend,
  startDate: '2026-08-01',
  endDate: '2026-08-31',
  entries: Array.from({ length: 18 }, (_, index) => ({ date: `2026-08-${14 + index}`, cost: 1 })),
  coverage: { billed: { status: 'partial', coveredDayCount: 18 }, amortized: { status: 'unavailable', coveredDayCount: 0 } },
};
assert.equal(isReportDailySpend(augustGap), true, 'EROAD-shaped missing first 13 August days');
assert.equal(isReportDailySpend({ ...augustGap, coverage: { ...augustGap.coverage, billed: { status: 'complete', coveredDayCount: 31 } } }), false);
console.log('Report evidence contract checks passed.');

const contribution = {
  semantics: 'portfolio-contribution',
  allocationIds: ['allocation-1'],
  range: { currency: 'NZD', minorUnitScale: 2, currentMonthlyMinorUnits: 10000, minSavingsMinorUnits: 2000, maxSavingsMinorUnits: 4000 },
};
const contributionPack = structuredClone(cataloguePack);
Object.assign(contributionPack.reporting.recommendationCatalogue.rows[0], {
  portfolioContribution: contribution,
  savingsOwnerResourceId: '/resources/' + 'a'.repeat(500),
  billableComponentKey: 'compute',
  savingsAggregationPolicy: 'owner-component',
});
assert.equal(isSubscriptionReportEvidencePack(contributionPack), true, 'canonical contribution and untruncated owner identity');
for (const mutate of [
  row => {
    row.portfolioContribution.allocationIds.push('allocation-1');
  },
  row => {
    row.portfolioContribution.range.minorUnitScale = 7;
  },
  row => {
    row.portfolioContribution.range.maxSavingsMinorUnits = 10001;
  },
  row => {
    row.portfolioContribution.range.minSavingsMinorUnits = -1;
  },
  row => {
    row.savingsAggregationPolicy = 'add-everything';
  },
  row => {
    row.savingsOwnerResourceId = 123;
  },
]) {
  const invalid = structuredClone(contributionPack);
  mutate(invalid.reporting.recommendationCatalogue.rows[0]);
  assert.equal(isSubscriptionReportEvidencePack(invalid), false, 'reject invalid savings metadata');
}

const { isReportScenarioSavings } = await import('../dist/index.js');
assert.equal(
  isReportScenarioSavings({ semantics: 'standalone-scenario', range: contribution.range, combinationPolicy: { toString: null } }),
  false,
  'malformed policy never invokes input coercion'
);

// Commitments freshness: typed report projection, including packs projected from artifacts without freshness.
const freshnessPack = structuredClone(subscriptionPack);
freshnessPack.reporting.commitmentsPlanning.freshness = {
  status: 'stale',
  generatedAt: '2026-09-11T00:00:00.000Z',
  entries: [
    {
      section: 'inventory',
      status: 'stale',
      generatedAt: '2026-09-11T00:00:00.000Z',
      lastSuccessfulSyncAt: '2026-09-08T12:00:00.000Z',
      ageHours: 60,
      reasonCode: 'collection-stale',
      reason: 'Reservation inventory is older than 48 hours.',
      sourceKind: 'azure-native',
    },
    { section: 'savings-plan-inventory', status: 'unavailable', reasonCode: 'permission-denied', sourceKind: 'azure-native' },
    { section: 'storageCapacity', status: 'current', generatedAt: '2026-09-11T00:00:00.000Z', sourceKind: 'spotto-derived' },
  ],
  warnings: ['Reservation inventory is older than 48 hours.'],
};
assert.equal(isSubscriptionReportEvidencePack(freshnessPack), true, 'accepts typed commitments freshness');
const emptyFreshnessPack = structuredClone(subscriptionPack);
emptyFreshnessPack.reporting.commitmentsPlanning.freshness = { entries: [], warnings: [] };
assert.equal(isSubscriptionReportEvidencePack(emptyFreshnessPack), true, 'accepts the shape projected from an artifact without freshness');
const preEntriesFreshnessPack = structuredClone(subscriptionPack);
preEntriesFreshnessPack.reporting.commitmentsPlanning.freshness = {
  status: 'partial',
  generatedAt: '2026-09-11T00:00:00.000Z',
  warnings: ['Inventory is partial.'],
};
assert.equal(isSubscriptionReportEvidencePack(preEntriesFreshnessPack), true, 'accepts packs produced before freshness entries were projected');
const preEntriesEmptyFreshnessPack = structuredClone(subscriptionPack);
preEntriesEmptyFreshnessPack.reporting.commitmentsPlanning.freshness = { warnings: [] };
assert.equal(
  isSubscriptionReportEvidencePack(preEntriesEmptyFreshnessPack),
  true,
  'accepts older packs projected from an artifact without freshness'
);
const maximalFreshnessPack = structuredClone(freshnessPack);
maximalFreshnessPack.reporting.commitmentsPlanning.freshness.entries = Array.from(
  { length: REPORT_EVIDENCE_LIMITS.commitmentsFreshnessEntries },
  (_, index) => ({ section: `section-${index}`, status: 'current' })
);
maximalFreshnessPack.reporting.commitmentsPlanning.freshness.warnings = Array.from(
  { length: REPORT_EVIDENCE_LIMITS.commitmentsFreshnessWarnings },
  (_, index) => `warning-${index}`
);
assert.equal(isSubscriptionReportEvidencePack(maximalFreshnessPack), true, 'accepts freshness at its bounds');
for (const [label, mutate] of [
  ['non-array entries', freshness => (freshness.entries = 'none')],
  ['null entries', freshness => (freshness.entries = null)],
  ['status without generatedAt', freshness => delete freshness.generatedAt],
  ['generatedAt without status', freshness => delete freshness.status],
  ['unknown summary status', freshness => (freshness.status = 'fresh')],
  ['invalid generatedAt', freshness => (freshness.generatedAt = 'today')],
  [
    'entries without summary status',
    freshness => {
      delete freshness.status;
      delete freshness.generatedAt;
    },
  ],
  [
    'too many entries',
    freshness => {
      freshness.entries = Array.from({ length: REPORT_EVIDENCE_LIMITS.commitmentsFreshnessEntries + 1 }, () => ({ section: 'x', status: 'current' }));
    },
  ],
  [
    'too many warnings',
    freshness => {
      freshness.warnings = Array.from({ length: REPORT_EVIDENCE_LIMITS.commitmentsFreshnessWarnings + 1 }, (_, index) => `w-${index}`);
    },
  ],
  ['blank warning', freshness => (freshness.warnings = [' '])],
  ['entry without section', freshness => delete freshness.entries[0].section],
  ['unknown entry status', freshness => (freshness.entries[0].status = 'expired')],
  ['unknown reason code', freshness => (freshness.entries[1].reasonCode = 'throttled')],
  ['collection-stale without stale status', freshness => (freshness.entries[0].status = 'partial')],
  ['negative ageHours', freshness => (freshness.entries[0].ageHours = -0.1)],
  ['ageHours beyond one decimal', freshness => (freshness.entries[0].ageHours = 60.25)],
  ['non-finite ageHours', freshness => (freshness.entries[0].ageHours = Number.NaN)],
  ['ageHours without lastSuccessfulSyncAt', freshness => delete freshness.entries[0].lastSuccessfulSyncAt],
  ['invalid lastSuccessfulSyncAt', freshness => (freshness.entries[0].lastSuccessfulSyncAt = 'recently')],
  ['unknown sourceKind', freshness => (freshness.entries[0].sourceKind = 'scraped')],
]) {
  const invalid = structuredClone(freshnessPack);
  mutate(invalid.reporting.commitmentsPlanning.freshness);
  assert.equal(isSubscriptionReportEvidencePack(invalid), false, `rejects commitments freshness: ${label}`);
}
const nullFreshnessPack = structuredClone(subscriptionPack);
nullFreshnessPack.reporting.commitmentsPlanning.freshness = null;
assert.equal(isSubscriptionReportEvidencePack(nullFreshnessPack), false, 'rejects null commitments freshness');

// Privileged access principal types.
assert.deepEqual([...REPORT_PRINCIPAL_TYPES], ['user', 'group', 'serviceprincipal', 'foreigngroup', 'device']);
const privilegedRow = { principalId: 'principal-1', displayName: 'Ada Admin', roleName: 'Owner', scope: '/subscriptions/subscription-1' };
const principalPack = structuredClone(subscriptionPack);
principalPack.reporting.governance.privilegedAccessRows = rows([
  privilegedRow,
  ...REPORT_PRINCIPAL_TYPES.map((principalType, index) => ({ ...privilegedRow, principalId: `principal-${index + 2}`, principalType })),
]);
assert.equal(isSubscriptionReportEvidencePack(principalPack), true, 'accepts every principal type and legacy rows without one');
for (const principalType of ['ServicePrincipal', 'User', 'unknown', '', 42, null]) {
  const invalid = structuredClone(principalPack);
  invalid.reporting.governance.privilegedAccessRows.rows[0].principalType = principalType;
  assert.equal(isSubscriptionReportEvidencePack(invalid), false, `rejects principal type ${String(principalType)}`);
}

// Activity verified months and month coverage.
const coverageRow = (month, status, coveredDayCount, expectedDayCount, extra = {}) => ({
  month,
  status,
  source: 'monthly-archive',
  coveredDayCount,
  expectedDayCount,
  ...extra,
});
const activityCoveragePack = structuredClone(subscriptionPack);
activityCoveragePack.reporting.activity.verifiedMonths = ['2026-07', '2026-08'];
activityCoveragePack.reporting.activity.monthCoverage = rows([
  coverageRow('2026-07', 'complete', 31, 31, { coveredFrom: '2026-07-01', coveredTo: '2026-07-31' }),
  coverageRow('2026-08', 'complete', 31, 31),
  coverageRow('2026-09', 'partial', 10, 30, { source: 'rolling-feed', coveredFrom: '2026-09-01', coveredTo: '2026-09-11' }),
  coverageRow('2028-02', 'unavailable', 0, 29, { source: 'rolling-feed' }),
  coverageRow('2027-02', 'partial', 27, 28),
]);
assert.equal(isSubscriptionReportEvidencePack(activityCoveragePack), true, 'accepts consistent activity month coverage');
const verifiedOnlyPack = structuredClone(subscriptionPack);
verifiedOnlyPack.reporting.activity.verifiedMonths = ['2026-08', '2026-09'];
assert.equal(isSubscriptionReportEvidencePack(verifiedOnlyPack), true, 'accepts verified months emitted without coverage');
const emptyVerifiedPack = structuredClone(subscriptionPack);
emptyVerifiedPack.reporting.activity.verifiedMonths = [];
assert.equal(isSubscriptionReportEvidencePack(emptyVerifiedPack), true, 'accepts no verified months');
const truncatedCoveragePack = structuredClone(activityCoveragePack);
truncatedCoveragePack.reporting.activity.verifiedMonths = ['2026-06', '2026-07'];
truncatedCoveragePack.reporting.activity.monthCoverage.totalCount += 1;
truncatedCoveragePack.reporting.activity.monthCoverage.omittedCount = 1;
assert.equal(isSubscriptionReportEvidencePack(truncatedCoveragePack), true, 'a verified month may be omitted from truncated coverage');
const fullCoveragePack = structuredClone(subscriptionPack);
fullCoveragePack.reporting.activity.monthCoverage = rows(
  Array.from({ length: REPORT_EVIDENCE_LIMITS.activityMonths }, (_, index) => {
    const month = new Date(Date.UTC(2025, 8 + index, 1)).toISOString().slice(0, 7);
    const days = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)).getUTCDate();
    return coverageRow(month, 'complete', days, days);
  })
);
fullCoveragePack.reporting.activity.verifiedMonths = fullCoveragePack.reporting.activity.monthCoverage.rows.map(row => row.month);
assert.equal(isSubscriptionReportEvidencePack(fullCoveragePack), true, 'accepts coverage at the activity month bound');
const coverageAt = (activity, month) => activity.monthCoverage.rows.find(row => row.month === month);
for (const [label, mutate] of [
  ['verifiedMonths not an array', activity => (activity.verifiedMonths = '2026-08')],
  ['verified month format', activity => (activity.verifiedMonths = ['2026-8'])],
  ['verified month out of range', activity => (activity.verifiedMonths = ['2026-13'])],
  ['verified month duplicate', activity => (activity.verifiedMonths = ['2026-08', '2026-08'])],
  [
    'too many verified months',
    activity => {
      activity.verifiedMonths = Array.from({ length: REPORT_EVIDENCE_LIMITS.activityMonths + 1 }, (_, index) =>
        new Date(Date.UTC(2024, index, 1)).toISOString().slice(0, 7)
      );
    },
  ],
  ['verified month with partial coverage', activity => activity.verifiedMonths.push('2026-09')],
  ['verified month absent from untruncated coverage', activity => activity.verifiedMonths.push('2026-06')],
  ['coverage not bounded rows', activity => (activity.monthCoverage = activity.monthCoverage.rows)],
  [
    'too many coverage rows',
    activity => {
      activity.monthCoverage = rows(
        Array.from({ length: REPORT_EVIDENCE_LIMITS.activityMonths + 1 }, (_, index) => coverageRow(`20${10 + index}-01`, 'unavailable', 0, 31))
      );
      activity.verifiedMonths = [];
    },
  ],
  [
    'duplicate coverage month',
    activity => {
      activity.monthCoverage.rows.push(coverageRow('2026-09', 'unavailable', 0, 30));
      activity.monthCoverage.totalCount += 1;
    },
  ],
  ['coverage month format', activity => (coverageAt(activity, '2026-09').month = '2026/09')],
  ['unknown coverage status', activity => (coverageAt(activity, '2026-09').status = 'verified')],
  ['unknown coverage source', activity => (coverageAt(activity, '2026-09').source = 'activity-log')],
  ['fractional covered days', activity => (coverageAt(activity, '2026-09').coveredDayCount = 9.5)],
  ['negative covered days', activity => (coverageAt(activity, '2028-02').coveredDayCount = -1)],
  ['expected days not the month length', activity => (coverageAt(activity, '2026-09').expectedDayCount = 31)],
  ['leap-year February declared as 28 days', activity => (coverageAt(activity, '2028-02').expectedDayCount = 28)],
  ['common-year February declared as 29 days', activity => (coverageAt(activity, '2027-02').expectedDayCount = 29)],
  ['covered exceeds expected', activity => (coverageAt(activity, '2026-08').coveredDayCount = 32)],
  ['complete with missing days', activity => (coverageAt(activity, '2026-08').coveredDayCount = 30)],
  ['unavailable with covered days', activity => (coverageAt(activity, '2028-02').coveredDayCount = 1)],
  [
    'partial with no covered days',
    activity => {
      const row = coverageAt(activity, '2026-09');
      row.coveredDayCount = 0;
      delete row.coveredFrom;
      delete row.coveredTo;
    },
  ],
  ['partial with every day covered', activity => (coverageAt(activity, '2027-02').coveredDayCount = 28)],
  [
    'coveredFrom after coveredTo',
    activity => {
      const row = coverageAt(activity, '2026-09');
      row.coveredFrom = '2026-09-11';
      row.coveredTo = '2026-09-01';
    },
  ],
  ['coveredFrom outside the month', activity => (coverageAt(activity, '2026-09').coveredFrom = '2026-08-31')],
  ['coveredTo outside the month', activity => (coverageAt(activity, '2026-07').coveredTo = '2026-08-01')],
  ['impossible coveredTo date', activity => (coverageAt(activity, '2026-09').coveredTo = '2026-09-31')],
  ['coveredFrom without coveredTo', activity => delete coverageAt(activity, '2026-09').coveredTo],
  ['covered span shorter than covered days', activity => (coverageAt(activity, '2026-09').coveredTo = '2026-09-05')],
  [
    'covered range on an unavailable month',
    activity => {
      const row = coverageAt(activity, '2028-02');
      row.coveredFrom = '2028-02-01';
      row.coveredTo = '2028-02-01';
    },
  ],
]) {
  const invalid = structuredClone(activityCoveragePack);
  mutate(invalid.reporting.activity);
  assert.equal(isSubscriptionReportEvidencePack(invalid), false, `rejects activity month evidence: ${label}`);
}

console.log('Report freshness, principal type and activity month coverage checks passed.');
