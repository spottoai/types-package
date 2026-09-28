import {
  REPORT_EVIDENCE_LIMITS,
  REPORT_PRINCIPAL_TYPES,
  type ReportActivityMonthCoverage,
  type ReportActivityProjection,
  type ReportBoundedRows,
  type ReportCommitmentsFreshness,
  type ReportPrincipalType,
  type ReportPrivilegedAccessRow,
  type ReportBudgetProjection,
  type ReportCostChangePeriod,
  type ReportCommitmentInventoryRow,
  type ReportProjectionRecord,
  type SubscriptionReportEvidencePack,
  type SubscriptionReportHistory,
  type SubscriptionReportingProjection,
  type TenantReportEvidencePack,
} from './reportEvidence';
import { isReportDailySpend, type ReportDailySpend } from '../index';

const dailySpend: ReportDailySpend = {
  startDate: '2026-08-01',
  endDate: '2026-08-31',
  dateBasis: 'billing-calendar',
  currency: 'NZD',
  generatedAt: '2026-09-12T00:00:00.000Z',
  freshness: 'unavailable',
  coverage: { billed: { status: 'unavailable', coveredDayCount: 0 }, amortized: { status: 'unavailable', coveredDayCount: 0 } },
  entries: [],
};
const dailyProjection: Pick<SubscriptionReportingProjection, 'dailySpend'> = { dailySpend };
const legacyDailyProjection: Pick<SubscriptionReportingProjection, 'dailySpend'> = {};
const dailyValidation: boolean = isReportDailySpend(dailyProjection.dailySpend);
void [dailyValidation, legacyDailyProjection];

const rows = <T>(values: T[] = []): ReportBoundedRows<T> => ({ totalCount: values.length, rows: values, omittedCount: 0 });
const projectedRows = rows<ReportProjectionRecord>();
const monthlyBudget: ReportBudgetProjection = {
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
const legacyBudget: ReportBudgetProjection = { name: 'older budget', amount: 9000 };
void legacyBudget;
const reservationWithUtilization: ReportCommitmentInventoryRow = {
  id: 'reservation-1',
  benefitType: 'reservation',
  utilization: { sevenDay: 84.5, thirtyDay: 88.2, source: 'reservation-summary' },
};
const savingsPlanWithUtilization: ReportCommitmentInventoryRow = {
  id: 'savings-plan-1',
  benefitType: 'savings-plan',
  utilization: { thirtyDay: 108, source: 'usage' },
};
const legacyCommitmentRow: ReportCommitmentInventoryRow = { id: 'reservation-legacy', benefitType: 'reservation' };
void [reservationWithUtilization, savingsPlanWithUtilization, legacyCommitmentRow];

const principalTypes: readonly ReportPrincipalType[] = REPORT_PRINCIPAL_TYPES;
const servicePrincipalRow: ReportPrivilegedAccessRow = {
  principalId: 'principal-2',
  principalType: 'serviceprincipal',
  displayName: 'Service principal 00000000…',
  roleName: 'Owner',
};
const legacyPrivilegedRow: ReportPrivilegedAccessRow = { principalId: 'principal-3', displayName: 'Legacy', roleName: 'Contributor' };
const invalidPrincipalTypeRow: ReportPrivilegedAccessRow = {
  ...legacyPrivilegedRow,
  // @ts-expect-error principal types are lowercase Azure RBAC values
  principalType: 'ServicePrincipal',
};
void [principalTypes, servicePrincipalRow, invalidPrincipalTypeRow];

const commitmentsFreshness: ReportCommitmentsFreshness = {
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
    { section: 'savings-plan-inventory', status: 'unavailable', reasonCode: 'permission-denied' },
  ],
  warnings: ['Reservation inventory is older than 48 hours.'],
};
const emptyCommitmentsFreshness: ReportCommitmentsFreshness = { entries: [], warnings: [] };
const preEntriesCommitmentsFreshness: ReportCommitmentsFreshness = { status: 'partial', generatedAt: '2026-09-11T00:00:00.000Z', warnings: [] };
const invalidFreshnessStatus: ReportCommitmentsFreshness = {
  // @ts-expect-error freshness status is current, stale, partial or unavailable
  status: 'fresh',
  generatedAt: '2026-09-11T00:00:00.000Z',
};
const invalidFreshnessReason: ReportCommitmentsFreshness = {
  entries: [
    {
      section: 'inventory',
      status: 'unavailable',
      // @ts-expect-error reason codes are a closed union
      reasonCode: 'throttled',
    },
  ],
};
void [commitmentsFreshness, emptyCommitmentsFreshness, preEntriesCommitmentsFreshness, invalidFreshnessStatus, invalidFreshnessReason];

const augustCoverage: ReportActivityMonthCoverage = {
  month: '2026-08',
  status: 'complete',
  source: 'monthly-archive',
  coveredFrom: '2026-08-01',
  coveredTo: '2026-08-31',
  coveredDayCount: 31,
  expectedDayCount: 31,
};
const septemberCoverage: ReportActivityMonthCoverage = {
  month: '2026-09',
  status: 'partial',
  source: 'rolling-feed',
  coveredFrom: '2026-09-01',
  coveredTo: '2026-09-10',
  coveredDayCount: 10,
  expectedDayCount: 30,
};
const invalidCoverageStatus: ReportActivityMonthCoverage = {
  ...augustCoverage,
  // @ts-expect-error coverage status is complete, partial or unavailable
  status: 'verified',
};
const invalidCoverageSource: ReportActivityMonthCoverage = {
  ...augustCoverage,
  // @ts-expect-error coverage source is monthly-archive or rolling-feed
  source: 'activity-log',
};
// @ts-expect-error coverage counts are required
const missingCoverageCounts: ReportActivityMonthCoverage = { month: '2026-08', status: 'unavailable', source: 'rolling-feed' };
const activityMonthEvidence: Pick<ReportActivityProjection, 'verifiedMonths' | 'monthCoverage'> = {
  verifiedMonths: ['2026-08'],
  monthCoverage: rows([augustCoverage, septemberCoverage]),
};
const invalidVerifiedMonths: Pick<ReportActivityProjection, 'verifiedMonths'> = {
  // @ts-expect-error verified months are YYYY-MM strings
  verifiedMonths: [202608],
};
void [invalidCoverageStatus, invalidCoverageSource, missingCoverageCounts, activityMonthEvidence, invalidVerifiedMonths];
const costChangePeriods = rows<ReportCostChangePeriod>([
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
]);

const reporting: SubscriptionReportingProjection = {
  dashboard: {},
  costChangePeriods,
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
  credentialDeadlines: { asOf: '2026-09-17T00:00:00.000Z', overdueCount: 162, upcomingSixMonthsCount: 85 },
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
    privilegedAccessRows: rows([servicePrincipalRow, legacyPrivilegedRow]),
    findings: projectedRows,
    limitations: projectedRows,
  },
  patchManagement: { machines: projectedRows },
  dataProtection: {
    costSummary: {
      currencyCode: 'NZD',
      totals: { actualCostLast30Days: 25, estimatedMonthlyCostForUnprotected: 10 },
    },
    items: projectedRows,
    issues: projectedRows,
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
    availabilityStatuses: { statuses: projectedRows },
  },
  serverUptime: { workspaces: projectedRows, gaps: projectedRows, servers: projectedRows },
  publicIpAddresses: { items: projectedRows },
  activity: {
    changes: projectedRows,
    security: projectedRows,
    health: projectedRows,
    suppressed: projectedRows,
    dailySummary: rows([{
      date: '2026-08-17',
      visibleEvents: 100,
      materialChanges: 90,
      securitySensitive: 5,
      healthEvents: 5,
      failedEvents: 0,
      highFindingCount: 0,
      automatedSnapshotEvents: 80,
    }]),
    ...activityMonthEvidence,
  },
  commitmentsPlanning: {
    freshness: commitmentsFreshness,
    inventorySummary: { totalCount: 0, statusCounts: {}, benefitTypeCounts: {} },
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
    budget: monthlyBudget,
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
  periods: [
    {
      period: '2026-08',
      sourceRunId: 'run-1',
      sourceGeneratedAt: '2026-09-11T00:00:00.000Z',
      metrics: {
        resourceCount: 1,
        recommendationCount: 0,
        impactedResourceCount: 0,
        securityRecommendationCount: 0,
        securityImpactedResourceCount: 0,
      },
      recommendations: rows(),
      comparisonIdentities: {
        costRecommendationIds: rows(),
        undersizedResourceIds: rows(['/subscriptions/subscription-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-1']),
        regulatoryAssessmentKeys: rows(['a'.repeat(64)]),
      },
    },
  ],
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
  globalAdmins: {
    summary: {},
    coverage: {
      userSignInActivity: {
        state: 'complete',
        source: 'microsoft-graph',
        requiredPermissions: ['AuditLog.Read.All and Microsoft Entra ID P1 or P2'],
      },
    },
    warnings: rows(),
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
