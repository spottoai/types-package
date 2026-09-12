import assert from 'node:assert/strict';

import { REPORT_EVIDENCE_LIMITS, isSubscriptionReportEvidencePack, isSubscriptionReportHistory, isTenantReportEvidencePack } from '../dist/index.js';

const rows = values => ({ totalCount: values.length, rows: values, omittedCount: 0 });
const emptyRows = () => rows([]);

const reporting = {
  dashboard: {},
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
  dataProtection: { items: emptyRows(), issues: emptyRows() },
  resourceHealth: { events: { events: emptyRows() }, availabilityStatuses: { statuses: emptyRows() } },
  serverUptime: { workspaces: emptyRows(), gaps: emptyRows(), servers: emptyRows() },
  publicIpAddresses: { items: emptyRows() },
  activity: { changes: emptyRows(), security: emptyRows(), health: emptyRows(), suppressed: emptyRows() },
  commitmentsPlanning: {
    inventorySummary: { totalCount: 0, statusCounts: {} },
    inventory: emptyRows(),
    coverage: emptyRows(),
    obsoleteCandidates: emptyRows(),
    reallocationOpportunities: emptyRows(),
    purchaseRecommendations: emptyRows(),
    renewals: emptyRows(),
  },
};

const subscriptionPack = {
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
  globalAdmins: { summary: {}, coverage: {}, warnings: emptyRows(), principals: emptyRows() },
};

assert.equal(isSubscriptionReportEvidencePack(subscriptionPack), true);
assert.equal(isSubscriptionReportHistory(history), true);
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

const oversizedHistory = structuredClone(history);
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

console.log('Report evidence contract checks passed.');
