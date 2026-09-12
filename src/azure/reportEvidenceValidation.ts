import { isCompactRecommendation, isInventoryCatalogueResource } from './reportEvidenceCatalogueValidation';
import {
  REPORT_EVIDENCE_LIMITS,
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
  isString(value.key) &&
  isString(value.label) &&
  isCount(value.recommendationCount) &&
  isCount(value.resourceCount) &&
  ['currentMonthlyCost', 'potentialMonthlyCost', 'minimumMonthlySavings', 'maximumMonthlySavings'].every(key => isFiniteNumber(value[key]));

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
  if (!isRecord(value.costSavings) || !isString(value.costSavings.currency) || !isCount(value.costSavings.contributingRecommendationCount)) {
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
    countTotal(value.inventorySummary.statusCounts) !== value.inventorySummary.totalCount
  ) {
    return false;
  }
  return ['coverage', 'obsoleteCandidates', 'reallocationOpportunities', 'purchaseRecommendations', 'renewals'].every(key =>
    isProjectionRows(value[key])
  );
};

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
    (value.annualCommittedCost === undefined || isRecord(value.annualCommittedCost)) &&
    (value.doNotRenewAnnualImpact === undefined || isRecord(value.doNotRenewAnnualImpact))
  );
}

const isReportingProjection = (value: unknown): boolean => {
  if (!isRecord(value) || !isRecord(value.dashboard) || !isRecommendationPortfolio(value.recommendationPortfolio)) return false;
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
    isProjectionRows(protection.items) &&
    isProjectionRows(protection.issues) &&
    isRecord(health) &&
    (health.eventCatalogue === undefined || isBoundedRows(health.eventCatalogue, REPORT_EVIDENCE_LIMITS.healthCatalogue, isRecord)) &&
    (health.availabilityCatalogue === undefined || isBoundedRows(health.availabilityCatalogue, REPORT_EVIDENCE_LIMITS.healthCatalogue, isRecord)) &&
    isRecord(health.events) &&
    isProjectionRows(health.events.events) &&
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
    (activity.dailySummary === undefined ||
      (isBoundedRows(activity.dailySummary, REPORT_EVIDENCE_LIMITS.activityDays, isActivityDailySummary) &&
        new Set(activity.dailySummary.rows.map(row => row.date)).size === activity.dailySummary.rows.length)) &&
    (activity.undatedSummary === undefined || isActivityCounts(activity.undatedSummary)) &&
    ['changes', 'security', 'health', 'suppressed'].every(key => isProjectionRows(activity[key]))
  );
};

const isActivityCounts = (value: unknown): value is import('./reportEvidence').ReportActivityCounts =>
  isRecord(value) &&
  ['visibleEvents', 'materialChanges', 'securitySensitive', 'healthEvents', 'failedEvents', 'highFindingCount'].every(key => isCount(value[key])) &&
  ['materialChanges', 'securitySensitive', 'healthEvents', 'failedEvents'].every(key => (value[key] as number) <= (value.visibleEvents as number));

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
  return (
    value.reliability.relationshipGraph === undefined ||
    (isRecord(value.reliability.relationshipGraph) &&
      hasOptionalNumbers(value.reliability.relationshipGraph, ['totalNodes', 'totalEdges', 'unresolvedCount', 'buildMs']))
  );
};

const isRecommendationFingerprint = (value: unknown): value is ReportRecommendationFingerprint =>
  isRecord(value) &&
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
      !isBoundedRows(period.recommendations, REPORT_EVIDENCE_LIMITS.historyRecommendations, isRecommendationFingerprint)
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
  isOptionalBoolean(value.accountEnabled);

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
  return true;
};
