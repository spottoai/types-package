import { isCompactRecommendation, isInventoryCatalogueResource } from './reportEvidenceCatalogueValidation';
import { isReportDailySpend } from './reportDailySpendValidation';
import { isReportSavingsBasis, isReportSpendProjection } from './reportSpendValidation';
import { isCommitmentsFreshnessEntry, isCommitmentsFreshnessStatus } from './commitmentsPlanningValidation';
import {
  REPORT_EVIDENCE_LIMITS,
  REPORT_PRINCIPAL_TYPES,
  type ReportActivityMonthCoverage,
  type ReportBoundedRows,
  type ReportCompactRecommendation,
  type ReportRecommendationFingerprint,
  type SubscriptionReportEvidencePack,
  type SubscriptionReportHistoryMetrics,
  type SubscriptionReportHistory,
  type TenantReportEvidencePack,
  type TenantReportGlobalAdministrator,
} from './reportEvidence';
import {
  countTotal,
  hasOptionalNumbers,
  hasOptionalStrings,
  hasRequiredRecords,
  isBoundedRows,
  isCommitmentExpirySummary,
  isCostSummary,
  isCount,
  isCountRecord,
  isDateTime,
  isEvidenceReference,
  isFiniteNumber,
  isOptionalBoolean,
  isOptionalFiniteNumber,
  isOptionalString,
  isProjectionRows,
  isRecommendationSummary,
  isRecord,
  isResourceSummary,
  isRetirementSummary,
  isSourceFileStatus,
  isString,
  isStringArray,
  isTagCoverage,
  type JsonRecord,
} from './reportEvidenceValidationHelpers';
import type { SecureScoreEvidence } from './secureScore';
import { isReportingStories, isStoryFingerprintRows } from '../common/utilizationStoriesValidation';

export const isReportSecureScoreEvidence = (value: unknown): value is SecureScoreEvidence => {
  if (!isRecord(value) || !['available', 'unavailable', 'stale'].includes(value.status as string)) return false;
  if (
    !hasOptionalNumbers(value, ['percentage', 'currentScore', 'maxScore', 'weight']) ||
    (value.percentage !== undefined && ((value.percentage as number) < 0 || (value.percentage as number) > 100)) ||
    ['currentScore', 'maxScore', 'weight'].some(key => value[key] !== undefined && (value[key] as number) < 0) ||
    (isFiniteNumber(value.currentScore) && isFiniteNumber(value.maxScore) && value.currentScore > value.maxScore) ||
    (value.assessedResourceCount !== undefined && !isCount(value.assessedResourceCount)) ||
    (value.observedAt !== undefined && !isDateTime(value.observedAt))
  )
    return false;
  return true;
};

const isCostSavingsCategory = (value: unknown): value is JsonRecord =>
  isRecord(value) &&
  (value.savingsBasis === undefined || isReportSavingsBasis(value.savingsBasis)) &&
  isString(value.key) &&
  isString(value.label) &&
  isCount(value.recommendationCount) &&
  isCount(value.resourceCount) &&
  ['currentMonthlyCost', 'potentialMonthlyCost', 'minimumMonthlySavings', 'maximumMonthlySavings'].every(key => isFiniteNumber(value[key]));

const REPORT_COST_CHANGE_LEVELS = new Set(['service', 'resource-group', 'resource', 'meter']);
const REPORT_COST_CHANGE_TYPES = new Set(['increase', 'decrease', 'no_change', 'new_resource', 'removed_resource']);
const REPORT_COST_CHANGE_REASON_TYPES = new Set([
  'new_resource',
  'removed_resource',
  'quantity_increase',
  'quantity_decrease',
  'rate_change',
  'sku_change',
  'new_meter',
  'removed_meter',
]);

const isStringOrFiniteNumber = (value: unknown): value is string | number => isString(value) || isFiniteNumber(value);

const isCostChangeReason = (value: unknown): value is JsonRecord =>
  isRecord(value) &&
  isString(value.type) &&
  REPORT_COST_CHANGE_REASON_TYPES.has(value.type) &&
  isFiniteNumber(value.impact) &&
  isOptionalFiniteNumber(value.impactPercent) &&
  isString(value.description) &&
  (value.oldValue === undefined || isStringOrFiniteNumber(value.oldValue)) &&
  (value.newValue === undefined || isStringOrFiniteNumber(value.newValue));

const isCostChangeDriver = (value: unknown): value is JsonRecord =>
  isRecord(value) &&
  isString(value.key) &&
  isString(value.level) &&
  REPORT_COST_CHANGE_LEVELS.has(value.level) &&
  isString(value.label) &&
  isOptionalString(value.resourceId) &&
  isFiniteNumber(value.currentCost) &&
  isFiniteNumber(value.previousCost) &&
  isFiniteNumber(value.change) &&
  isOptionalFiniteNumber(value.changePercent) &&
  isString(value.changeType) &&
  REPORT_COST_CHANGE_TYPES.has(value.changeType) &&
  isOptionalString(value.summary) &&
  isBoundedRows(value.reasons, REPORT_EVIDENCE_LIMITS.costChangeReasons, isCostChangeReason);

const isCostChangePeriod = (value: unknown): value is JsonRecord =>
  isRecord(value) &&
  isString(value.period) &&
  /^\d{4}-(0[1-9]|1[0-2])$/u.test(value.period) &&
  isString(value.previousPeriod) &&
  /^\d{4}-(0[1-9]|1[0-2])$/u.test(value.previousPeriod) &&
  value.previousPeriod < value.period &&
  isString(value.currency) &&
  /^[A-Z]{3}$/u.test(value.currency) &&
  isFiniteNumber(value.currentCost) &&
  isFiniteNumber(value.previousCost) &&
  isFiniteNumber(value.change) &&
  isOptionalFiniteNumber(value.changePercent) &&
  isBoundedRows(value.drivers, REPORT_EVIDENCE_LIMITS.costChangeDrivers, isCostChangeDriver);

const hasRequiredCountKeys = (value: unknown, keys: readonly string[]): value is Record<string, number> =>
  isCountRecord(value) && keys.every(key => Object.prototype.hasOwnProperty.call(value, key));

const isRecommendationPortfolio = (value: unknown): boolean => {
  if (!isRecord(value)) return false;
  const impactBands = new Set(['High', 'Medium', 'Low', 'Unknown']);
  const effortBands = new Set(['Low', 'Medium', 'High', 'Unknown']);
  if (
    !isCount(value.sourceRecommendationCount) ||
    !isCount(value.activeRecommendationCount) ||
    !isCount(value.resolvedRecommendationCount) ||
    !isCount(value.highImpactCount) ||
    !isCount(value.quickWinCount) ||
    value.sourceRecommendationCount !== value.activeRecommendationCount + value.resolvedRecommendationCount ||
    value.highImpactCount > value.activeRecommendationCount ||
    value.quickWinCount > value.activeRecommendationCount ||
    !isCountRecord(value.byCategory) ||
    !hasRequiredCountKeys(value.byImpact, ['High', 'Medium', 'Low', 'Unknown']) ||
    !hasRequiredCountKeys(value.byEffort, ['Low', 'Medium', 'High', 'Unknown']) ||
    countTotal(value.byCategory) !== value.activeRecommendationCount ||
    countTotal(value.byImpact) !== value.activeRecommendationCount ||
    countTotal(value.byEffort) !== value.activeRecommendationCount ||
    !Array.isArray(value.impactEffortMatrix) ||
    value.impactEffortMatrix.length !== 16 ||
    !value.impactEffortMatrix.every(
      row =>
        isRecord(row) &&
        isString(row.impact) &&
        impactBands.has(row.impact) &&
        isString(row.effort) &&
        effortBands.has(row.effort) &&
        isCount(row.count)
    ) ||
    new Set(value.impactEffortMatrix.map(row => `${(row as JsonRecord).impact}|${(row as JsonRecord).effort}`)).size !== 16 ||
    value.impactEffortMatrix.reduce((total, row) => total + (row as { count: number }).count, 0) !== value.activeRecommendationCount ||
    !isRecord(value.affectedResources) ||
    !isCount(value.affectedResources.count) ||
    !isCount(value.affectedResources.identifiedCount) ||
    !isCount(value.affectedResources.largestReportedRecommendationCount) ||
    (value.affectedResources.basis !== 'exact' && value.affectedResources.basis !== 'lower-bound')
  ) {
    return false;
  }
  if (
    value.affectedResources.count < value.affectedResources.identifiedCount ||
    value.affectedResources.count < value.affectedResources.largestReportedRecommendationCount ||
    (value.affectedResources.basis === 'exact' && value.affectedResources.count !== value.affectedResources.identifiedCount)
  ) {
    return false;
  }
  if (value.costSavings === undefined) return true;
  if (
    !isRecord(value.costSavings) ||
    !isString(value.costSavings.currency) ||
    !isCount(value.costSavings.contributingRecommendationCount) ||
    (value.costSavings.savingsBasis !== undefined && !isReportSavingsBasis(value.costSavings.savingsBasis))
  ) {
    return false;
  }
  const monthly = value.costSavings.monthly;
  const annual = value.costSavings.annual;
  return (
    isRecord(monthly) &&
    ['currentCost', 'potentialCost', 'minimumSavings', 'maximumSavings'].every(key => isFiniteNumber(monthly[key])) &&
    isRecord(annual) &&
    isFiniteNumber(annual.minimumSavings) &&
    isFiniteNumber(annual.maximumSavings) &&
    isBoundedRows(value.costSavings.categories, REPORT_EVIDENCE_LIMITS.detailRows, isCostSavingsCategory) &&
    isOptionalString(value.costSavings.currencySymbol) &&
    isOptionalFiniteNumber(monthly.minimumSavingsPercent) &&
    isOptionalFiniteNumber(monthly.maximumSavingsPercent) &&
    (value.costSavings.basis === undefined ||
      (isRecord(value.costSavings.basis) &&
        isString(value.costSavings.basis.categoryScope) &&
        isString(value.costSavings.basis.projection) &&
        isString(value.costSavings.basis.observedPeriod) &&
        typeof value.costSavings.basis.excludesEstimatedRows === 'boolean' &&
        isString(value.costSavings.basis.appliesTo) &&
        typeof value.costSavings.basis.containsLegacySavings === 'boolean'))
  );
};

const isResourceExample = (value: unknown): value is JsonRecord =>
  isRecord(value) && isString(value.name) && hasOptionalStrings(value, ['type', 'resourceGroup', 'location']);

const isSnapshot = (value: unknown): value is JsonRecord =>
  isRecord(value) && isString(value.name) && isOptionalString(value.resourceGroup) && isOptionalFiniteNumber(value.createdTime);

const isAppliedTagCost = (value: unknown): value is JsonRecord =>
  isRecord(value) && isString(value.tagKey) && isString(value.tagValue) && isCount(value.resourceCount) && isFiniteNumber(value.spend30Days);

const isInventoryResource = (value: unknown): value is JsonRecord =>
  isRecord(value) &&
  isString(value.id) &&
  hasOptionalStrings(value, ['name', 'type', 'resourceGroup', 'location']) &&
  hasOptionalNumbers(value, ['spend30Days', 'spend30DaysAmortized', 'createdTime']);

const isInventory = (value: unknown): boolean =>
  isRecord(value) &&
  isCount(value.totalResources) &&
  isCount(value.untaggedResourceCount) &&
  value.untaggedResourceCount <= value.totalResources &&
  (value.resourceCatalogue === undefined ||
    (isBoundedRows(value.resourceCatalogue, REPORT_EVIDENCE_LIMITS.inventoryCatalogue, isInventoryCatalogueResource) &&
      value.resourceCatalogue.totalCount === value.totalResources)) &&
  isBoundedRows(value.untaggedExamples, REPORT_EVIDENCE_LIMITS.detailRows, isResourceExample) &&
  isBoundedRows(value.snapshots, REPORT_EVIDENCE_LIMITS.detailRows, isSnapshot) &&
  isBoundedRows(value.appliedTagCosts, REPORT_EVIDENCE_LIMITS.detailRows, isAppliedTagCost) &&
  isBoundedRows(value.topSpendResources, REPORT_EVIDENCE_LIMITS.detailRows, isInventoryResource);

const isPrivilegedAccess = (value: unknown): value is JsonRecord =>
  isRecord(value) &&
  isString(value.principalId) &&
  isString(value.displayName) &&
  isString(value.roleName) &&
  (value.principalType === undefined ||
    (typeof value.principalType === 'string' && (REPORT_PRINCIPAL_TYPES as readonly string[]).includes(value.principalType))) &&
  hasOptionalStrings(value, ['userPrincipalName', 'scope', 'scopeType', 'lastLogonDate', 'mfaStatus']);

const isGovernance = (value: unknown): boolean =>
  isRecord(value) &&
  isOptionalString(value.generatedAt) &&
  (value.coverage === undefined || isRecord(value.coverage)) &&
  hasRequiredRecords(value, ['policySummary', 'rbacSummary', 'globalAdministratorSummary']) &&
  isProjectionRows(value.complianceRows) &&
  (value.complianceAssessments === undefined ||
    isBoundedRows(
      value.complianceAssessments,
      REPORT_EVIDENCE_LIMITS.complianceAssessments,
      (row): row is JsonRecord =>
        isRecord(row) &&
        isCount(row.nonCompliantResourceCount) &&
        (row.assessmentKey === undefined || (typeof row.assessmentKey === 'string' && /^[a-f0-9]{64}$/.test(row.assessmentKey))) &&
        hasOptionalStrings(row, [
          'policySetDisplayName',
          'policyAssignmentDisplayName',
          'policyDefinitionReferenceId',
          'policyDefinitionDisplayName',
          'resourceType',
          'effect',
        ])
    )) &&
  isBoundedRows(value.privilegedAccessRows, REPORT_EVIDENCE_LIMITS.detailRows, isPrivilegedAccess) &&
  isProjectionRows(value.findings) &&
  isProjectionRows(value.limitations);

const isCommitments = (value: unknown): boolean => {
  if (!isRecord(value) || !isRecord(value.inventorySummary) || !isCountRecord(value.inventorySummary.statusCounts)) return false;
  if (!isCount(value.inventorySummary.totalCount) || !isBoundedRows(value.inventory, REPORT_EVIDENCE_LIMITS.detailRows, isCommitmentInventoryRow)) {
    return false;
  }
  if (
    value.inventorySummary.totalCount !== value.inventory.totalCount ||
    countTotal(value.inventorySummary.statusCounts) !== value.inventorySummary.totalCount ||
    (value.inventorySummary.benefitTypeCounts !== undefined &&
      (!isCountRecord(value.inventorySummary.benefitTypeCounts) ||
        countTotal(value.inventorySummary.benefitTypeCounts) !== value.inventorySummary.totalCount))
  ) {
    return false;
  }
  if (value.resourceCoverage !== undefined && !isProjectionRows(value.resourceCoverage)) return false;
  if (value.freshness !== undefined && !isReportCommitmentsFreshness(value.freshness)) return false;
  return ['coverage', 'obsoleteCandidates', 'reallocationOpportunities', 'purchaseRecommendations', 'renewals'].every(key =>
    isProjectionRows(value[key])
  );
};

/** Status and generatedAt appear together; without them the projection carries no entries. Older packs omit entries. */
const isReportCommitmentsFreshness = (value: unknown): boolean =>
  isRecord(value) &&
  (value.status === undefined) === (value.generatedAt === undefined) &&
  (value.status === undefined || (isCommitmentsFreshnessStatus(value.status) && isDateTime(value.generatedAt))) &&
  (value.entries === undefined ||
    (Array.isArray(value.entries) &&
      value.entries.length <= REPORT_EVIDENCE_LIMITS.commitmentsFreshnessEntries &&
      (value.status !== undefined || value.entries.length === 0) &&
      value.entries.every(isCommitmentsFreshnessEntry))) &&
  (value.warnings === undefined || (isStringArray(value.warnings) && value.warnings.length <= REPORT_EVIDENCE_LIMITS.commitmentsFreshnessWarnings));

const isDataProtectionCostSummary = (value: unknown): boolean =>
  isRecord(value) &&
  hasOptionalStrings(value, ['currencyCode', 'currencySymbol']) &&
  (value.billingWindow === undefined || isRecord(value.billingWindow)) &&
  (value.totals === undefined ||
    (isRecord(value.totals) &&
      hasOptionalNumbers(value.totals, [
        'actualCostLast30Days',
        'actualAmortizedCostLast30Days',
        'allocatedCostLast30Days',
        'estimatedMonthlyCostForUnprotected',
      ])));

const isResourceHealthEvent = (value: unknown): value is JsonRecord =>
  isRecord(value) &&
  hasOptionalStrings(value, [
    'id',
    'trackingId',
    'eventType',
    'status',
    'level',
    'title',
    'summary',
    'impactStartTime',
    'impactMitigationTime',
    'lastUpdateTime',
  ]) &&
  isOptionalFiniteNumber(value.priority) &&
  (value.durationSeconds === undefined || (isFiniteNumber(value.durationSeconds) && value.durationSeconds >= 0)) &&
  (value.impactedResourceCount === undefined || isCount(value.impactedResourceCount)) &&
  (value.impactedServices === undefined || isStringArray(value.impactedServices)) &&
  (value.impactedRegions === undefined || isStringArray(value.impactedRegions));

const isCommitmentUtilization = (value: unknown): boolean =>
  isRecord(value) &&
  (value.sevenDay !== undefined || value.thirtyDay !== undefined) &&
  ['sevenDay', 'thirtyDay'].every(key => value[key] === undefined || (isFiniteNumber(value[key]) && value[key] >= 0)) &&
  (value.source === undefined || ['aggregate', 'usage', 'reservation-summary'].includes(value.source as string));

function isCommitmentInventoryRow(value: unknown): value is JsonRecord {
  return (
    isRecord(value) &&
    hasOptionalStrings(value, [
      'id',
      'benefitType',
      'type',
      'displayName',
      'status',
      'expiryDate',
      'skuName',
      'skuDescription',
      'location',
      'term',
    ]) &&
    hasOptionalNumbers(value, ['daysToExpiry', 'reservedQuantity']) &&
    isOptionalBoolean(value.renew) &&
    (value.utilization === undefined || isCommitmentUtilization(value.utilization)) &&
    (value.annualCommittedCost === undefined || isRecord(value.annualCommittedCost)) &&
    (value.doNotRenewAnnualImpact === undefined || isRecord(value.doNotRenewAnnualImpact))
  );
}

const isReportingProjection = (value: unknown): boolean => {
  if (!isRecord(value) || !isRecord(value.dashboard) || !isRecommendationPortfolio(value.recommendationPortfolio)) return false;
  if (value.dailySpend !== undefined && !isReportDailySpend(value.dailySpend)) return false;
  if (value.spend !== undefined && !isReportSpendProjection(value.spend)) return false;
  if (value.stories !== undefined && !isReportingStories(value.stories)) return false;
  if (
    value.costChangePeriods !== undefined &&
    (!isBoundedRows(value.costChangePeriods, REPORT_EVIDENCE_LIMITS.costChangePeriods, isCostChangePeriod) ||
      new Set(value.costChangePeriods.rows.map(period => period.period)).size !== value.costChangePeriods.rows.length)
  ) {
    return false;
  }
  const subscription = isRecord(value.dashboard.subscription) ? value.dashboard.subscription : undefined;
  const properties = subscription && isRecord(subscription.properties) ? subscription.properties : undefined;
  if (properties?.secureScoreEvidence !== undefined && !isReportSecureScoreEvidence(properties.secureScoreEvidence)) return false;
  if (
    !isBoundedRows(value.recommendations, REPORT_EVIDENCE_LIMITS.currentRecommendations, isCompactRecommendation) ||
    (value.recommendations as ReportBoundedRows<ReportCompactRecommendation>).totalCount !==
      (value.recommendationPortfolio as JsonRecord).activeRecommendationCount ||
    (value.recommendationCatalogue !== undefined &&
      (!isBoundedRows(value.recommendationCatalogue, REPORT_EVIDENCE_LIMITS.recommendationCatalogue, isCompactRecommendation) ||
        value.recommendationCatalogue.totalCount !== (value.recommendationPortfolio as JsonRecord).activeRecommendationCount)) ||
    !isProjectionRows(value.serviceRetirements) ||
    (value.credentialDeadlines !== undefined &&
      (!isRecord(value.credentialDeadlines) ||
        !isDateTime(value.credentialDeadlines.asOf) ||
        !isCount(value.credentialDeadlines.overdueCount) ||
        !isCount(value.credentialDeadlines.upcomingSixMonthsCount))) ||
    !isInventory(value.inventory) ||
    !isGovernance(value.governance) ||
    !isCommitments(value.commitmentsPlanning)
  ) {
    return false;
  }
  const patch = value.patchManagement;
  const resourceRows = [value.recommendations, value.recommendationCatalogue]
    .flatMap(collection => (collection as ReportBoundedRows<ReportCompactRecommendation> | undefined)?.rows ?? [])
    .reduce((total, row) => total + (row.resourceCatalogue?.rows.length ?? 0), 0);
  if (resourceRows > REPORT_EVIDENCE_LIMITS.totalRecommendationResourceRows) return false;
  const protection = value.dataProtection;
  const health = value.resourceHealth;
  const uptime = value.serverUptime;
  const publicIps = value.publicIpAddresses;
  const activity = value.activity;
  return (
    isRecord(patch) &&
    isProjectionRows(patch.machines) &&
    isRecord(protection) &&
    (protection.costSummary === undefined || isDataProtectionCostSummary(protection.costSummary)) &&
    isProjectionRows(protection.items) &&
    isProjectionRows(protection.issues) &&
    isRecord(health) &&
    (health.eventCatalogue === undefined || isBoundedRows(health.eventCatalogue, REPORT_EVIDENCE_LIMITS.healthCatalogue, isResourceHealthEvent)) &&
    (health.availabilityCatalogue === undefined || isBoundedRows(health.availabilityCatalogue, REPORT_EVIDENCE_LIMITS.healthCatalogue, isRecord)) &&
    isRecord(health.events) &&
    isBoundedRows(health.events.events, REPORT_EVIDENCE_LIMITS.detailRows, isResourceHealthEvent) &&
    (health.eventCatalogue === undefined || health.eventCatalogue.totalCount === (health.events.events as ReportBoundedRows<unknown>).totalCount) &&
    isRecord(health.availabilityStatuses) &&
    isProjectionRows(health.availabilityStatuses.statuses) &&
    (health.availabilityCatalogue === undefined ||
      health.availabilityCatalogue.totalCount === (health.availabilityStatuses.statuses as ReportBoundedRows<unknown>).totalCount) &&
    isRecord(uptime) &&
    ['workspaces', 'gaps', 'servers'].every(key => isProjectionRows(uptime[key])) &&
    isRecord(publicIps) &&
    isProjectionRows(publicIps.items) &&
    isRecord(activity) &&
    (activity.monthlyFindings === undefined ||
      (isBoundedRows(activity.monthlyFindings, REPORT_EVIDENCE_LIMITS.activityMonths, isActivityMonthlyFindings) &&
        new Set(activity.monthlyFindings.rows.map(row => row.month)).size === activity.monthlyFindings.rows.length)) &&
    (activity.dailySummary === undefined ||
      (isBoundedRows(activity.dailySummary, REPORT_EVIDENCE_LIMITS.activityDays, isActivityDailySummary) &&
        new Set(activity.dailySummary.rows.map(row => row.date)).size === activity.dailySummary.rows.length)) &&
    (activity.undatedSummary === undefined || isActivityCounts(activity.undatedSummary)) &&
    isActivityMonthEvidence(activity.verifiedMonths, activity.monthCoverage) &&
    ['changes', 'security', 'health', 'suppressed'].every(key => isProjectionRows(activity[key]))
  );
};

const isActivityCounts = (value: unknown): value is import('./reportEvidence').ReportActivityCounts =>
  isRecord(value) &&
  ['visibleEvents', 'materialChanges', 'securitySensitive', 'healthEvents', 'failedEvents', 'highFindingCount'].every(key => isCount(value[key])) &&
  (value.automatedSnapshotEvents === undefined ||
    (isCount(value.automatedSnapshotEvents) && value.automatedSnapshotEvents <= (value.materialChanges as number))) &&
  ['materialChanges', 'securitySensitive', 'healthEvents', 'failedEvents'].every(key => (value[key] as number) <= (value.visibleEvents as number));

const isActivityMonthlyFindings = (value: unknown): value is import('./reportEvidence').ReportActivityMonthlyFindings =>
  isRecord(value) &&
  isString(value.month) &&
  /^\d{4}-(0[1-9]|1[0-2])$/.test(value.month) &&
  isBoundedRows(
    value.findings,
    REPORT_EVIDENCE_LIMITS.detailRows,
    (row): row is JsonRecord =>
      isRecord(row) &&
      isDateTime(row.eventTimestamp) &&
      new Date(row.eventTimestamp as string).toISOString().slice(0, 7) === value.month &&
      (row.importance === undefined || isString(row.importance)) &&
      (row.status === undefined || isString(row.status)) &&
      ((typeof row.importance === 'string' && row.importance.toLowerCase() === 'high') ||
        row.isSecuritySensitive === true ||
        (typeof row.status === 'string' && row.status.toLowerCase() === 'failed'))
  );

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

const daysInMonth = (month: string): number => new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)).getUTCDate();

const isCalendarDateInMonth = (value: unknown, month: string): value is string =>
  typeof value === 'string' &&
  DATE_PATTERN.test(value) &&
  value.slice(0, 7) === month &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;

const isActivityMonthCoverage = (value: unknown): value is ReportActivityMonthCoverage => {
  if (
    !isRecord(value) ||
    typeof value.month !== 'string' ||
    !MONTH_PATTERN.test(value.month) ||
    !['complete', 'partial', 'unavailable'].includes(value.status as string) ||
    !['monthly-archive', 'rolling-feed'].includes(value.source as string) ||
    !isCount(value.coveredDayCount) ||
    !isCount(value.expectedDayCount) ||
    value.expectedDayCount !== daysInMonth(value.month) ||
    value.coveredDayCount > value.expectedDayCount
  ) {
    return false;
  }
  const covered = value.coveredDayCount;
  const statusMatches =
    value.status === 'complete'
      ? covered === value.expectedDayCount
      : value.status === 'unavailable'
        ? covered === 0
        : covered > 0 && covered < value.expectedDayCount;
  if (!statusMatches) return false;
  if (value.coveredFrom === undefined && value.coveredTo === undefined) return true;
  return (
    covered > 0 &&
    isCalendarDateInMonth(value.coveredFrom, value.month) &&
    isCalendarDateInMonth(value.coveredTo, value.month) &&
    value.coveredFrom <= value.coveredTo &&
    (Date.parse(value.coveredTo) - Date.parse(value.coveredFrom)) / DAY_MS + 1 >= covered
  );
};

/** Verified months are unique YYYY-MM values; any verified month listed in coverage is complete, and untruncated coverage lists every verified month. */
const isActivityMonthEvidence = (verifiedMonths: unknown, monthCoverage: unknown): boolean => {
  if (
    verifiedMonths !== undefined &&
    (!Array.isArray(verifiedMonths) ||
      verifiedMonths.length > REPORT_EVIDENCE_LIMITS.activityMonths ||
      !verifiedMonths.every(month => typeof month === 'string' && MONTH_PATTERN.test(month)) ||
      new Set(verifiedMonths).size !== verifiedMonths.length)
  ) {
    return false;
  }
  if (monthCoverage === undefined) return true;
  if (
    !isBoundedRows(monthCoverage, REPORT_EVIDENCE_LIMITS.activityMonths, isActivityMonthCoverage) ||
    new Set(monthCoverage.rows.map(row => row.month)).size !== monthCoverage.rows.length
  ) {
    return false;
  }
  const coverageByMonth = new Map(monthCoverage.rows.map(row => [row.month, row.status]));
  return ((verifiedMonths as string[] | undefined) ?? []).every(month => {
    const status = coverageByMonth.get(month);
    return status === undefined ? monthCoverage.omittedCount > 0 : status === 'complete';
  });
};

const isActivityDailySummary = (value: unknown): value is import('./reportEvidence').ReportActivityDailySummary =>
  isActivityCounts(value) &&
  isRecord(value) &&
  isString(value.date) &&
  /^\d{4}-\d{2}-\d{2}$/.test(value.date) &&
  Number.isFinite(Date.parse(value.date)) &&
  new Date(value.date).toISOString().slice(0, 10) === value.date;

export const isSubscriptionReportEvidencePack = (value: unknown): value is SubscriptionReportEvidencePack => {
  if (!isRecord(value) || !isDateTime(value.generatedAt)) {
    return false;
  }
  if (
    !isRecord(value.generation) ||
    !isRecord(value.scope) ||
    !isString(value.scope.subscriptionId) ||
    !isRecord(value.coverage) ||
    !isRecord(value.coverage.sourceFiles) ||
    !isStringArray(value.coverage.gaps) ||
    !Object.values(value.coverage.sourceFiles).every(isSourceFileStatus) ||
    !isResourceSummary(value.estate) ||
    !isCostSummary(value.cost) ||
    !isRecommendationSummary(value.recommendations) ||
    !isRecord(value.security) ||
    !isOptionalFiniteNumber(value.security.secureScore) ||
    (value.security.governance !== undefined &&
      (!isRecord(value.security.governance) || !isOptionalFiniteNumber(value.security.governance.findingCount))) ||
    !isRecord(value.reliability) ||
    !isRetirementSummary(value.reliability.serviceRetirements) ||
    !isCount(value.reliability.recommendationCount) ||
    !isRecord(value.commitments) ||
    !isCommitmentExpirySummary(value.commitments.expiries) ||
    !isRecord(value.performance) ||
    !isCount(value.performance.recommendationCount) ||
    !isStringArray(value.performance.topRecommendationIds) ||
    !isRecord(value.operationalExcellence) ||
    !isCount(value.operationalExcellence.recommendationCount) ||
    !isTagCoverage(value.operationalExcellence.tagCoverage) ||
    !isReportingProjection(value.reporting) ||
    !Array.isArray(value.evidence) ||
    !value.evidence.every(isEvidenceReference)
  ) {
    return false;
  }
  if (
    !hasOptionalStrings(value.generation, ['sourceRunId', 'sourceGeneratedAt']) ||
    !hasOptionalStrings(value.scope, ['companyId', 'tenantId', 'displayName', 'currency', 'currencySymbol'])
  ) {
    return false;
  }
  const dailySpend = (value.reporting as SubscriptionReportEvidencePack['reporting']).dailySpend;
  if (dailySpend && value.scope.currency !== undefined && dailySpend.currency !== value.scope.currency) return false;
  const spend = (value.reporting as SubscriptionReportEvidencePack['reporting']).spend;
  if (
    spend &&
    ((value.scope.currency !== undefined && spend.currency !== value.scope.currency) ||
      (dailySpend && spend.currency !== dailySpend.currency) ||
      Date.parse(spend.generatedAt) > Date.parse(value.generatedAt))
  )
    return false;
  return (
    value.reliability.relationshipGraph === undefined ||
    (isRecord(value.reliability.relationshipGraph) &&
      hasOptionalNumbers(value.reliability.relationshipGraph, ['totalNodes', 'totalEdges', 'unresolvedCount', 'buildMs']))
  );
};

const isRecommendationFingerprint = (value: unknown): value is ReportRecommendationFingerprint =>
  isRecord(value) &&
  (value.savingsBasis === undefined || isReportSavingsBasis(value.savingsBasis)) &&
  isString(value.id) &&
  isString(value.title) &&
  hasOptionalStrings(value, ['category', 'impact', 'severity', 'currency']) &&
  isOptionalBoolean(value.resolved) &&
  isCount(value.affectedResourceCount) &&
  isOptionalFiniteNumber(value.potentialMonthlySavings) &&
  isOptionalFiniteNumber(value.maximumMonthlySavings) &&
  isOptionalFiniteNumber(value.costImpact);

const isHistoryMetrics = (value: unknown): value is SubscriptionReportHistoryMetrics =>
  isRecord(value) &&
  hasOptionalStrings(value, ['subscriptionName', 'currency', 'currencySymbol']) &&
  hasOptionalNumbers(value, ['secureScore', 'advisorScore', 'spend30Days', 'spend30DaysAmortized']) &&
  (value.secureScoreEvidence === undefined || isReportSecureScoreEvidence(value.secureScoreEvidence)) &&
  isCount(value.resourceCount) &&
  isCount(value.recommendationCount) &&
  isCount(value.impactedResourceCount) &&
  isCount(value.securityRecommendationCount) &&
  isCount(value.securityImpactedResourceCount) &&
  value.securityRecommendationCount <= value.recommendationCount &&
  value.securityImpactedResourceCount <= value.impactedResourceCount &&
  isOptionalFiniteNumber(value.maximumMonthlySavings);

const isUniqueIdentityRows = (value: unknown, itemValidator: (item: unknown) => item is string = isString): boolean =>
  isBoundedRows(value, REPORT_EVIDENCE_LIMITS.historyComparisonIdentities, itemValidator) &&
  new Set((value as ReportBoundedRows<string>).rows).size === (value as ReportBoundedRows<string>).rows.length;

const isHistoryComparisonIdentities = (value: unknown): boolean =>
  isRecord(value) &&
  isUniqueIdentityRows(value.costRecommendationIds) &&
  isUniqueIdentityRows(value.undersizedResourceIds) &&
  isUniqueIdentityRows(value.regulatoryAssessmentKeys, (item): item is string => isString(item) && /^[a-f0-9]{64}$/u.test(item));

export const isSubscriptionReportHistory = (value: unknown): value is SubscriptionReportHistory => {
  if (
    !isRecord(value) ||
    !isString(value.subscriptionId) ||
    !isDateTime(value.generatedAt) ||
    !isRecord(value.retention) ||
    value.retention.maxPeriods !== REPORT_EVIDENCE_LIMITS.historyPeriods ||
    !Array.isArray(value.periods) ||
    value.periods.length > REPORT_EVIDENCE_LIMITS.historyPeriods
  ) {
    return false;
  }
  const periods = new Set<string>();
  for (const period of value.periods) {
    if (
      !isRecord(period) ||
      !isString(period.period) ||
      !/^\d{4}-(0[1-9]|1[0-2])$/u.test(period.period) ||
      periods.has(period.period) ||
      !isString(period.sourceRunId) ||
      !isDateTime(period.sourceGeneratedAt) ||
      !isHistoryMetrics(period.metrics) ||
      !isBoundedRows(period.recommendations, REPORT_EVIDENCE_LIMITS.historyRecommendations, isRecommendationFingerprint) ||
      (period.comparisonIdentities !== undefined && !isHistoryComparisonIdentities(period.comparisonIdentities)) ||
      (period.stories !== undefined && !isStoryFingerprintRows(period.stories))
    ) {
      return false;
    }
    if (
      period.recommendations.omittedCount === 0 &&
      period.metrics.recommendationCount !== period.recommendations.rows.filter(row => row.resolved !== true).length
    ) {
      return false;
    }
    periods.add(period.period);
  }
  return true;
};

const isTenantMfaSummary = (value: unknown): boolean => {
  if (!isRecord(value) || typeof value.countsAreLowerBounds !== 'boolean' || !isRecord(value.enforcement)) return false;
  const enforcement = value.enforcement;
  const enforcementKeys = ['enforced', 'conditionallyEnforced', 'notEnforced', 'unknown'];
  if (
    !isCount(value.enumeratedUsers) ||
    !isCount(value.activeUsers) ||
    !isCount(value.disabledUsers) ||
    !isCount(value.assessedActiveUsers) ||
    !isCount(value.enforcementKnownUsers) ||
    !isCount(value.enforcementUnknownUsers) ||
    !isOptionalString(value.assessmentState) ||
    !['mfaCapableUsers', 'notMfaCapableUsers', 'unknownRegistrationUsers'].every(key => value[key] === undefined || isCount(value[key])) ||
    Object.keys(enforcement).some(key => !enforcementKeys.includes(key)) ||
    !enforcementKeys.every(key => isCount(enforcement[key]))
  ) {
    return false;
  }
  return (
    value.enumeratedUsers === value.assessedActiveUsers + value.disabledUsers &&
    value.activeUsers === value.enforcementKnownUsers + value.enforcementUnknownUsers &&
    value.activeUsers === countTotal(enforcement as Record<string, number>) &&
    value.enforcementUnknownUsers === enforcement.unknown &&
    (value.countsAreLowerBounds || value.assessedActiveUsers === value.activeUsers)
  );
};

const isTenantCoverage = (value: unknown): boolean =>
  isRecord(value) &&
  Object.values(value).every(
    section =>
      isRecord(section) &&
      hasOptionalStrings(section, ['state', 'source', 'reason', 'message', 'lastAttemptedAt', 'lastSuccessfulAt']) &&
      (section.requiredPermissions === undefined || isStringArray(section.requiredPermissions)) &&
      (!Array.isArray(section.requiredPermissions) || section.requiredPermissions.length <= 10) &&
      isOptionalFiniteNumber(section.maximumSourceLagHours)
  );

const isTenantSignInCoverage = (value: unknown): boolean =>
  isRecord(value) && ['complete', 'partial', 'unavailable', 'skipped'].includes(value.state as string);

const isTenantPrincipal = (value: unknown): value is TenantReportGlobalAdministrator =>
  isRecord(value) &&
  isString(value.principalId) &&
  isString(value.principalType) &&
  isString(value.assignmentSource) &&
  isStringArray(value.assignmentModes) &&
  value.assignmentModes.length <= 4 &&
  typeof value.isPimBacked === 'boolean' &&
  isString(value.lastActivatedEvidence) &&
  hasOptionalStrings(value, ['displayName', 'userPrincipalName', 'mfaStatus', 'lastActivatedAt']) &&
  isOptionalBoolean(value.accountEnabled) &&
  ((value.lastSignInAt === undefined && value.lastSignInEvidence === undefined) ||
    (value.lastSignInAt === undefined && value.lastSignInEvidence === 'unavailable') ||
    (isDateTime(value.lastSignInAt) &&
      (value.lastSignInEvidence === 'last-successful-sign-in' || value.lastSignInEvidence === 'last-interactive-sign-in')));

export const isTenantReportEvidencePack = (value: unknown): value is TenantReportEvidencePack => {
  if (
    !isRecord(value) ||
    !isDateTime(value.generatedAt) ||
    !isRecord(value.scope) ||
    !isString(value.scope.tenantId) ||
    !isRecord(value.mfa) ||
    (value.mfa.summary !== undefined && !isTenantMfaSummary(value.mfa.summary)) ||
    (value.mfa.tenantPolicy !== undefined && !isRecord(value.mfa.tenantPolicy)) ||
    (value.mfa.coverage !== undefined && !isTenantCoverage(value.mfa.coverage)) ||
    !isRecord(value.globalAdmins) ||
    !isRecord(value.globalAdmins.summary) ||
    !isTenantCoverage(value.globalAdmins.coverage) ||
    !isBoundedRows(value.globalAdmins.warnings, REPORT_EVIDENCE_LIMITS.tenantGlobalAdministrators, isRecord) ||
    !isBoundedRows(value.globalAdmins.principals, REPORT_EVIDENCE_LIMITS.tenantGlobalAdministrators, isTenantPrincipal)
  ) {
    return false;
  }
  const signInCoverage = (value.globalAdmins.coverage as Record<string, unknown>).userSignInActivity;
  if (signInCoverage !== undefined && !isTenantSignInCoverage(signInCoverage)) return false;
  if (
    isRecord(signInCoverage) &&
    (signInCoverage.state === 'unavailable' || signInCoverage.state === 'skipped') &&
    value.globalAdmins.principals.rows.some(principal => principal.lastSignInAt !== undefined)
  ) {
    return false;
  }
  return true;
};
