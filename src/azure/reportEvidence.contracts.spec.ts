import {
  REPORT_EVIDENCE_LIMITS,
  type ReportBoundedRows,
  type ReportProjectionRecord,
  type SubscriptionReportEvidencePack,
  type SubscriptionReportHistory,
  type SubscriptionReportingProjection,
  type TenantReportEvidencePack,
} from './reportEvidence';

const rows = <T>(values: T[] = []): ReportBoundedRows<T> => ({ totalCount: values.length, rows: values, omittedCount: 0 });
const projectedRows = rows<ReportProjectionRecord>();

const reporting: SubscriptionReportingProjection = {
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
    impactEffortMatrix: [],
    affectedResources: { count: 0, identifiedCount: 0, largestReportedRecommendationCount: 0, basis: 'exact' },
  },
  recommendations: rows(),
  serviceRetirements: projectedRows,
  inventory: {
    totalResources: 0,
    untaggedResourceCount: 0,
    untaggedExamples: rows(),
    snapshots: rows(),
    appliedTagCosts: rows(),
    topSpendResources: rows(),
  },
  governance: {
    policySummary: {},
    rbacSummary: {},
    globalAdministratorSummary: {},
    complianceRows: projectedRows,
    privilegedAccessRows: rows(),
    findings: projectedRows,
    limitations: projectedRows,
  },
  patchManagement: { machines: projectedRows },
  dataProtection: { items: projectedRows, issues: projectedRows },
  resourceHealth: { events: { events: projectedRows }, availabilityStatuses: { statuses: projectedRows } },
  serverUptime: { workspaces: projectedRows, gaps: projectedRows, servers: projectedRows },
  publicIpAddresses: { items: projectedRows },
  activity: { changes: projectedRows, security: projectedRows, health: projectedRows, suppressed: projectedRows },
  commitmentsPlanning: {
    inventorySummary: { totalCount: 0, statusCounts: {} },
    inventory: rows(),
    coverage: projectedRows,
    obsoleteCandidates: projectedRows,
    reallocationOpportunities: projectedRows,
    purchaseRecommendations: projectedRows,
    renewals: projectedRows,
  },
};

const subscriptionPack: SubscriptionReportEvidencePack = {
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

const history: SubscriptionReportHistory = {
  subscriptionId: 'subscription-1',
  generatedAt: '2026-09-11T00:00:00.000Z',
  retention: { maxPeriods: REPORT_EVIDENCE_LIMITS.historyPeriods },
  periods: [],
};

const tenantPack: TenantReportEvidencePack = {
  generatedAt: '2026-09-11T00:00:00.000Z',
  scope: { tenantId: 'tenant-1' },
  mfa: {
    summary: {
      enumeratedUsers: 10,
      activeUsers: 8,
      disabledUsers: 2,
      assessedActiveUsers: 8,
      enforcementKnownUsers: 7,
      enforcementUnknownUsers: 1,
      countsAreLowerBounds: false,
      enforcement: { enforced: 4, conditionallyEnforced: 2, notEnforced: 1, unknown: 1 },
    },
  },
  globalAdmins: { summary: {}, coverage: {}, warnings: rows(), principals: rows() },
};

const invalidHistoryRetention: SubscriptionReportHistory = {
  ...history,
  // @ts-expect-error history retention is fixed at thirteen periods
  retention: { maxPeriods: 12 },
};
const invalidTenantEnforcement: TenantReportEvidencePack = {
  ...tenantPack,
  mfa: {
    summary: {
      ...tenantPack.mfa.summary!,
      // @ts-expect-error all four enforcement states are required
      enforcement: { enforced: 4, conditionallyEnforced: 2, notEnforced: 1 },
    },
  },
};

void subscriptionPack;
void history;
void tenantPack;
void invalidHistoryRetention;
void invalidTenantEnforcement;
