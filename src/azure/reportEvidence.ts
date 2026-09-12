import type { CostSavingsSummaryBasis } from './views';
import type { TenantMfaEnforcementStatus } from './governance';
import type { SecureScoreEvidence } from './secureScore';

export const REPORT_EVIDENCE_LIMITS = {
  detailRows: 50,
  currentRecommendations: 90,
  recommendationCatalogue: 2000,
  complianceAssessments: 2000,
  activityDays: 400,
  recommendationResources: 2,
  resourceCatalogue: 2000,
  totalRecommendationResourceRows: 10000,
  inventoryCatalogue: 2000,
  healthCatalogue: 2000,
  summaryDimensions: 25,
  summaryRows: 20,
  topRecommendationIds: 20,
  topRecommendationIdsPerPillar: 5,
  upcomingEvents: 20,
  historyPeriods: 13,
  historyRecommendations: 90,
  tenantGlobalAdministrators: 50,
} as const;

/** An additive report section whose stable field-level contract has not yet been promoted. */
export type ReportProjectionRecord = Record<string, unknown>;

export interface ReportBoundedRows<T> {
  totalCount: number;
  rows: T[];
  omittedCount: number;
}

export interface ReportSourceFileStatus {
  path: string;
  available: boolean;
  recordCount?: number;
  note?: string;
}

export interface ReportEvidenceReference {
  source: string;
  summary: string;
  value?: string | number | boolean;
}

export interface ReportCompactRecommendationResource {
  id: string;
  name?: string;
  type?: string;
  resourceGroup?: string;
  location?: string;
  spend?: number;
  spendAmortized?: number;
  currency?: string;
  currencySymbol?: string;
  savings?: { minAmount?: number; maxAmount?: number };
}

export interface ReportCompactRecommendation {
  recommendation: {
    id: string;
    name?: string;
    title: string;
    headline?: string;
    plainSummary?: string;
    bottomLine?: string;
    description?: string;
    remediation?: string;
    impactReason?: string;
    effortReason?: string;
    potentialBenefits?: string;
    considerations?: string;
    technicalPlaybook?: string;
    category?: string;
    subCategory?: string;
    impact?: string;
    effort?: string;
    effortHours?: number;
    severity?: string;
    risk?: string;
    priority?: string;
    priorityLabel?: string;
    priorityTier?: string;
    manualPriority?: string;
    resolved?: boolean;
    /** Editorial source text was clipped; consumers must not infer a theme from incomplete context. */
    reportingTextTruncated?: boolean;
    costImpact?: number;
    costImpactUnit?: string;
    potentialMonthlySavings?: number;
    confidencePercentage?: number;
    adjustedScore?: number;
    finalScore?: number;
    normalizedScore?: number;
    securityAssessmentSummary?: { unhealthyCount: number; totalCount: number };
    securityImpactDetails?: { controlName?: string; controlDisplayName?: string };
  };
  resources: ReportCompactRecommendationResource[];
  /** Complete compact detail when omittedCount is zero; resources remains the overview sample. */
  resourceCatalogue?: ReportBoundedRows<ReportCompactRecommendationResource>;
  resourcesCount: number;
  omittedResourceCount: number;
  savings?: { minAmount?: number; maxAmount?: number };
  currency?: string;
  currencySymbol?: string;
}

export type ReportImpactBand = 'High' | 'Medium' | 'Low' | 'Unknown';
export type ReportEffortBand = 'Low' | 'Medium' | 'High' | 'Unknown';

export interface ReportCostSavingsCategory {
  key: string;
  label: string;
  recommendationCount: number;
  resourceCount: number;
  currentMonthlyCost: number;
  potentialMonthlyCost: number;
  minimumMonthlySavings: number;
  maximumMonthlySavings: number;
}

export interface ReportCostSavingsProjection {
  currency: string;
  currencySymbol?: string;
  contributingRecommendationCount: number;
  monthly: {
    currentCost: number;
    potentialCost: number;
    minimumSavings: number;
    maximumSavings: number;
    minimumSavingsPercent?: number;
    maximumSavingsPercent?: number;
  };
  annual: { minimumSavings: number; maximumSavings: number };
  categories: ReportBoundedRows<ReportCostSavingsCategory>;
  basis?: CostSavingsSummaryBasis;
}

export interface ReportRecommendationPortfolio {
  sourceRecommendationCount: number;
  activeRecommendationCount: number;
  resolvedRecommendationCount: number;
  highImpactCount: number;
  quickWinCount: number;
  byCategory: Record<string, number>;
  byImpact: Record<ReportImpactBand, number>;
  byEffort: Record<ReportEffortBand, number>;
  impactEffortMatrix: Array<{ impact: ReportImpactBand; effort: ReportEffortBand; count: number }>;
  affectedResources: {
    count: number;
    identifiedCount: number;
    largestReportedRecommendationCount: number;
    basis: 'exact' | 'lower-bound';
  };
  costSavings?: ReportCostSavingsProjection;
}

export interface ReportResourceExample {
  name: string;
  type?: string;
  resourceGroup?: string;
  location?: string;
}

export interface ReportSnapshotRow {
  name: string;
  resourceGroup?: string;
  createdTime?: number;
}

export interface ReportAppliedTagCostRow {
  tagKey: string;
  tagValue: string;
  resourceCount: number;
  spend30Days: number;
}

export interface ReportInventoryResourceRow {
  id: string;
  name?: string;
  type?: string;
  resourceGroup?: string;
  location?: string;
  spend30Days?: number;
  spend30DaysAmortized?: number;
  createdTime?: number;
}

export interface ReportInventoryProjection {
  /** Classification inputs preserve native and Spotto tags separately. */
  resourceCatalogue?: ReportBoundedRows<ReportInventoryCatalogueResource>;
  totalResources: number;
  untaggedResourceCount: number;
  untaggedExamples: ReportBoundedRows<ReportResourceExample>;
  snapshots: ReportBoundedRows<ReportSnapshotRow>;
  appliedTagCosts: ReportBoundedRows<ReportAppliedTagCostRow>;
  topSpendResources: ReportBoundedRows<ReportInventoryResourceRow>;
}

export interface ReportInventoryCatalogueResource extends ReportCompactRecommendationResource {
  createdTime?: number;
  tags?: Record<string, string>;
  spottoTags?: Record<string, { v: string; a: number }>;
  /** Only the current SKU and selected performance-uplift alternative are retained. */
  vmPricePerformance?: {
    current: ReportProjectionRecord;
    alternatives: ReportProjectionRecord[];
  };
}

export interface ReportPrivilegedAccessRow {
  principalId: string;
  displayName: string;
  userPrincipalName?: string;
  roleName: string;
  scope?: string;
  scopeType?: string;
  lastLogonDate?: string;
  mfaStatus?: string;
}

export interface ReportGovernanceProjection extends ReportProjectionRecord {
  generatedAt?: string;
  coverage?: ReportProjectionRecord;
  policySummary: ReportProjectionRecord;
  rbacSummary: ReportProjectionRecord;
  globalAdministratorSummary: ReportProjectionRecord;
  complianceRows: ReportBoundedRows<ReportProjectionRecord>;
  /** Complete control aggregates, computed before any resource-detail sampling. */
  complianceAssessments?: ReportBoundedRows<ReportComplianceAssessment>;
  privilegedAccessRows: ReportBoundedRows<ReportPrivilegedAccessRow>;
  findings: ReportBoundedRows<ReportProjectionRecord>;
  limitations: ReportBoundedRows<ReportProjectionRecord>;
}

export interface ReportComplianceAssessment {
  /** SHA-256 of full semantic control identity, before display-label truncation. */
  assessmentKey?: string;
  policySetDisplayName?: string;
  policyAssignmentDisplayName?: string;
  policyDefinitionReferenceId?: string;
  policyDefinitionDisplayName?: string;
  resourceType?: string;
  effect?: string;
  nonCompliantResourceCount: number;
}

export interface ReportCommitmentInventorySummary {
  totalCount: number;
  statusCounts: Record<string, number>;
}

export interface ReportCommitmentInventoryRow {
  id?: string;
  benefitType?: string;
  type?: string;
  displayName?: string;
  status?: string;
  expiryDate?: string;
  daysToExpiry?: number;
  reservedQuantity?: number;
  skuName?: string;
  skuDescription?: string;
  location?: string;
  term?: string;
  renew?: boolean;
  annualCommittedCost?: ReportProjectionRecord;
  doNotRenewAnnualImpact?: ReportProjectionRecord;
}

export interface ReportCommitmentsProjection extends ReportProjectionRecord {
  inventorySummary: ReportCommitmentInventorySummary;
  inventory: ReportBoundedRows<ReportCommitmentInventoryRow>;
  coverage: ReportBoundedRows<ReportProjectionRecord>;
  obsoleteCandidates: ReportBoundedRows<ReportProjectionRecord>;
  reallocationOpportunities: ReportBoundedRows<ReportProjectionRecord>;
  purchaseRecommendations: ReportBoundedRows<ReportProjectionRecord>;
  renewals: ReportBoundedRows<ReportProjectionRecord>;
}

export interface ReportPatchManagementProjection extends ReportProjectionRecord {
  machines: ReportBoundedRows<ReportProjectionRecord>;
}

export interface ReportDataProtectionProjection extends ReportProjectionRecord {
  items: ReportBoundedRows<ReportProjectionRecord>;
  issues: ReportBoundedRows<ReportProjectionRecord>;
}

export interface ReportResourceHealthProjection {
  eventCatalogue?: ReportBoundedRows<ReportProjectionRecord>;
  availabilityCatalogue?: ReportBoundedRows<ReportProjectionRecord>;
  events: ReportProjectionRecord & { events: ReportBoundedRows<ReportProjectionRecord> };
  availabilityStatuses: ReportProjectionRecord & { statuses: ReportBoundedRows<ReportProjectionRecord> };
}

export interface ReportServerUptimeProjection extends ReportProjectionRecord {
  workspaces: ReportBoundedRows<ReportProjectionRecord>;
  gaps: ReportBoundedRows<ReportProjectionRecord>;
  servers: ReportBoundedRows<ReportProjectionRecord>;
}

export interface ReportPublicIpProjection extends ReportProjectionRecord {
  items: ReportBoundedRows<ReportProjectionRecord>;
}

export interface ReportActivityProjection extends ReportProjectionRecord {
  dailySummary?: ReportBoundedRows<ReportActivityDailySummary>;
  undatedSummary?: ReportActivityCounts;
  changes: ReportBoundedRows<ReportProjectionRecord>;
  security: ReportBoundedRows<ReportProjectionRecord>;
  health: ReportBoundedRows<ReportProjectionRecord>;
  suppressed: ReportBoundedRows<ReportProjectionRecord>;
}

export interface ReportActivityCounts {
  visibleEvents: number;
  materialChanges: number;
  securitySensitive: number;
  healthEvents: number;
  failedEvents: number;
  highFindingCount: number;
}

export interface ReportActivityDailySummary extends ReportActivityCounts {
  date: string;
}

export interface SubscriptionReportingProjection {
  dashboard: ReportProjectionRecord;
  recommendationPortfolio: ReportRecommendationPortfolio;
  recommendations: ReportBoundedRows<ReportCompactRecommendation>;
  /** Section selection uses this catalogue; the smaller recommendations collection is an overview sample. */
  recommendationCatalogue?: ReportBoundedRows<ReportCompactRecommendation>;
  serviceRetirements: ReportBoundedRows<ReportProjectionRecord>;
  inventory: ReportInventoryProjection;
  governance: ReportGovernanceProjection;
  patchManagement: ReportPatchManagementProjection;
  dataProtection: ReportDataProtectionProjection;
  resourceHealth: ReportResourceHealthProjection;
  serverUptime: ReportServerUptimeProjection;
  publicIpAddresses: ReportPublicIpProjection;
  activity: ReportActivityProjection;
  commitmentsPlanning: ReportCommitmentsProjection;
}

export interface SubscriptionReportResourceSummary {
  total: number;
  byType: Array<{ type: string; count: number; spend30Days?: number }>;
  byLocation: Array<{ location: string; count: number; spend30Days?: number }>;
  tagCoverage: {
    withTags: number;
    withoutTags: number;
    coveragePercentage: number;
    topTagKeys: Array<{ key: string; count: number }>;
  };
  topSpendResources: Array<{
    id: string;
    name: string;
    type: string;
    location?: string;
    spend30Days: number;
    spend30DaysAmortized?: number;
  }>;
}

export interface SubscriptionReportEvidencePack {
  generatedAt: string;
  generation: { sourceRunId?: string; sourceGeneratedAt?: string };
  scope: {
    companyId?: string;
    tenantId?: string;
    subscriptionId: string;
    displayName?: string;
    currency?: string;
    currencySymbol?: string;
  };
  coverage: { sourceFiles: Record<string, ReportSourceFileStatus>; gaps: string[] };
  estate: SubscriptionReportResourceSummary;
  cost: {
    currency?: string;
    currencySymbol?: string;
    spend30Days?: number;
    spend30DaysAmortized?: number;
    totalRetailCost?: number;
    miscCost?: number;
    budget?: ReportProjectionRecord;
    period?: { type: 'rolling_30_days'; startDate?: string; endDate?: string; source: string };
    sourceMetadata: {
      spend30DaysSource: string;
      spend30DaysAmortizedSource: string;
      totalRetailCostSource: string;
      rollingCostFile: string;
      rollingCostRecordCount?: number;
    };
    rollingCostRecordCount?: number;
    topSpendResources: SubscriptionReportResourceSummary['topSpendResources'];
  };
  recommendations: {
    total: number;
    byPillar: Record<string, number>;
    byImpact: Record<string, number>;
    byEffort: Record<string, number>;
    topRecommendationIds: string[];
    topRecommendationIdsByPillar: Record<string, string[]>;
  };
  security: {
    secureScore?: number;
    subscriptionSecurityStatus?: unknown;
    publicIpExposure?: unknown;
    governance?: {
      policySummary?: unknown;
      rbacSummary?: unknown;
      accessSummary?: unknown;
      findingCount?: number;
      coverage?: unknown;
    };
  };
  reliability: {
    serviceRetirements: {
      total: number;
      sourceRecordCount: number;
      excludedUnlinked: number;
      excludedCommitmentExpiries: number;
      within180Days: number;
      expiredOrPastDue: number;
      upcoming: Array<{ id?: string; title?: string; retirementDate?: string; resourceCount: number }>;
    };
    relationshipGraph?: { totalNodes?: number; totalEdges?: number; unresolvedCount?: number; buildMs?: number };
    recommendationCount: number;
  };
  commitments: {
    expiries: {
      total: number;
      sourceRecordCount: number;
      within180Days: number;
      expiredOrPastDue: number;
      upcoming: Array<{ id?: string; title?: string; expiryDate?: string; resourceCount: number }>;
    };
  };
  performance: { recommendationCount: number; topRecommendationIds: string[] };
  operationalExcellence: {
    recommendationCount: number;
    tagCoverage: SubscriptionReportResourceSummary['tagCoverage'];
    activityLogSummary?: unknown;
  };
  reporting: SubscriptionReportingProjection;
  evidence: ReportEvidenceReference[];
}

export interface ReportRecommendationFingerprint {
  id: string;
  title: string;
  category?: string;
  impact?: string;
  severity?: string;
  resolved?: boolean;
  affectedResourceCount: number;
  potentialMonthlySavings?: number;
  maximumMonthlySavings?: number;
  costImpact?: number;
  currency?: string;
}

export interface SubscriptionReportHistoryMetrics {
  subscriptionName?: string;
  currency?: string;
  currencySymbol?: string;
  secureScore?: number;
  secureScoreEvidence?: SecureScoreEvidence;
  advisorScore?: number;
  spend30Days?: number;
  spend30DaysAmortized?: number;
  resourceCount: number;
  recommendationCount: number;
  impactedResourceCount: number;
  securityRecommendationCount: number;
  securityImpactedResourceCount: number;
  maximumMonthlySavings?: number;
}

export interface SubscriptionReportHistoryPeriod {
  period: string;
  sourceRunId: string;
  sourceGeneratedAt: string;
  metrics: SubscriptionReportHistoryMetrics;
  recommendations: ReportBoundedRows<ReportRecommendationFingerprint>;
}

export interface SubscriptionReportHistory {
  subscriptionId: string;
  generatedAt: string;
  retention: { maxPeriods: typeof REPORT_EVIDENCE_LIMITS.historyPeriods };
  periods: SubscriptionReportHistoryPeriod[];
}

export interface TenantReportMfaSummary {
  assessmentState?: string;
  enumeratedUsers: number;
  activeUsers: number;
  disabledUsers: number;
  assessedActiveUsers: number;
  mfaCapableUsers?: number;
  notMfaCapableUsers?: number;
  unknownRegistrationUsers?: number;
  enforcementKnownUsers: number;
  enforcementUnknownUsers: number;
  countsAreLowerBounds: boolean;
  enforcement: Record<TenantMfaEnforcementStatus, number>;
}

export interface TenantReportCoverageSection {
  state?: string;
  source?: string;
  reason?: string;
  message?: string;
  requiredPermissions?: string[];
  lastAttemptedAt?: string;
  lastSuccessfulAt?: string;
  maximumSourceLagHours?: number;
}

export interface TenantReportGlobalAdministrator {
  principalId: string;
  principalType: string;
  displayName?: string;
  userPrincipalName?: string;
  accountEnabled?: boolean;
  mfaStatus?: string;
  assignmentSource: string;
  assignmentModes: string[];
  isPimBacked: boolean;
  lastActivatedAt?: string;
  lastActivatedEvidence: string;
}

export interface TenantReportEvidencePack {
  generatedAt: string;
  scope: { tenantId: string };
  mfa: {
    summary?: TenantReportMfaSummary;
    tenantPolicy?: ReportProjectionRecord;
    coverage?: Record<string, TenantReportCoverageSection>;
  };
  globalAdmins: {
    summary: ReportProjectionRecord;
    coverage: Record<string, TenantReportCoverageSection>;
    warnings: ReportBoundedRows<ReportProjectionRecord>;
    principals: ReportBoundedRows<TenantReportGlobalAdministrator>;
  };
}
