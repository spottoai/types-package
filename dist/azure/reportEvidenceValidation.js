"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTenantReportEvidencePack = exports.isSubscriptionReportHistory = exports.isSubscriptionReportEvidencePack = exports.isReportSecureScoreEvidence = void 0;
const reportEvidenceCatalogueValidation_1 = require("./reportEvidenceCatalogueValidation");
const reportDailySpendValidation_1 = require("./reportDailySpendValidation");
const reportSpendValidation_1 = require("./reportSpendValidation");
const reportEvidence_1 = require("./reportEvidence");
const reportEvidenceValidationHelpers_1 = require("./reportEvidenceValidationHelpers");
const utilizationStoriesValidation_1 = require("../common/utilizationStoriesValidation");
const isReportSecureScoreEvidence = (value) => {
    if (!(0, reportEvidenceValidationHelpers_1.isRecord)(value) || !['available', 'unavailable', 'stale'].includes(value.status))
        return false;
    if (!(0, reportEvidenceValidationHelpers_1.hasOptionalNumbers)(value, ['percentage', 'currentScore', 'maxScore', 'weight']) ||
        (value.percentage !== undefined && (value.percentage < 0 || value.percentage > 100)) ||
        ['currentScore', 'maxScore', 'weight'].some(key => value[key] !== undefined && value[key] < 0) ||
        ((0, reportEvidenceValidationHelpers_1.isFiniteNumber)(value.currentScore) && (0, reportEvidenceValidationHelpers_1.isFiniteNumber)(value.maxScore) && value.currentScore > value.maxScore) ||
        (value.assessedResourceCount !== undefined && !(0, reportEvidenceValidationHelpers_1.isCount)(value.assessedResourceCount)) ||
        (value.observedAt !== undefined && !(0, reportEvidenceValidationHelpers_1.isDateTime)(value.observedAt)))
        return false;
    return true;
};
exports.isReportSecureScoreEvidence = isReportSecureScoreEvidence;
const isCostSavingsCategory = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    (value.savingsBasis === undefined || (0, reportSpendValidation_1.isReportSavingsBasis)(value.savingsBasis)) &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.key) &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.label) &&
    (0, reportEvidenceValidationHelpers_1.isCount)(value.recommendationCount) &&
    (0, reportEvidenceValidationHelpers_1.isCount)(value.resourceCount) &&
    ['currentMonthlyCost', 'potentialMonthlyCost', 'minimumMonthlySavings', 'maximumMonthlySavings'].every(key => (0, reportEvidenceValidationHelpers_1.isFiniteNumber)(value[key]));
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
const isStringOrFiniteNumber = (value) => (0, reportEvidenceValidationHelpers_1.isString)(value) || (0, reportEvidenceValidationHelpers_1.isFiniteNumber)(value);
const isCostChangeReason = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.type) &&
    REPORT_COST_CHANGE_REASON_TYPES.has(value.type) &&
    (0, reportEvidenceValidationHelpers_1.isFiniteNumber)(value.impact) &&
    (0, reportEvidenceValidationHelpers_1.isOptionalFiniteNumber)(value.impactPercent) &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.description) &&
    (value.oldValue === undefined || isStringOrFiniteNumber(value.oldValue)) &&
    (value.newValue === undefined || isStringOrFiniteNumber(value.newValue));
const isCostChangeDriver = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.key) &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.level) &&
    REPORT_COST_CHANGE_LEVELS.has(value.level) &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.label) &&
    (0, reportEvidenceValidationHelpers_1.isOptionalString)(value.resourceId) &&
    (0, reportEvidenceValidationHelpers_1.isFiniteNumber)(value.currentCost) &&
    (0, reportEvidenceValidationHelpers_1.isFiniteNumber)(value.previousCost) &&
    (0, reportEvidenceValidationHelpers_1.isFiniteNumber)(value.change) &&
    (0, reportEvidenceValidationHelpers_1.isOptionalFiniteNumber)(value.changePercent) &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.changeType) &&
    REPORT_COST_CHANGE_TYPES.has(value.changeType) &&
    (0, reportEvidenceValidationHelpers_1.isOptionalString)(value.summary) &&
    (0, reportEvidenceValidationHelpers_1.isBoundedRows)(value.reasons, reportEvidence_1.REPORT_EVIDENCE_LIMITS.costChangeReasons, isCostChangeReason);
const isCostChangePeriod = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.period) &&
    /^\d{4}-(0[1-9]|1[0-2])$/u.test(value.period) &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.previousPeriod) &&
    /^\d{4}-(0[1-9]|1[0-2])$/u.test(value.previousPeriod) &&
    value.previousPeriod < value.period &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.currency) &&
    /^[A-Z]{3}$/u.test(value.currency) &&
    (0, reportEvidenceValidationHelpers_1.isFiniteNumber)(value.currentCost) &&
    (0, reportEvidenceValidationHelpers_1.isFiniteNumber)(value.previousCost) &&
    (0, reportEvidenceValidationHelpers_1.isFiniteNumber)(value.change) &&
    (0, reportEvidenceValidationHelpers_1.isOptionalFiniteNumber)(value.changePercent) &&
    (0, reportEvidenceValidationHelpers_1.isBoundedRows)(value.drivers, reportEvidence_1.REPORT_EVIDENCE_LIMITS.costChangeDrivers, isCostChangeDriver);
const hasRequiredCountKeys = (value, keys) => (0, reportEvidenceValidationHelpers_1.isCountRecord)(value) && keys.every(key => Object.prototype.hasOwnProperty.call(value, key));
const isRecommendationPortfolio = (value) => {
    if (!(0, reportEvidenceValidationHelpers_1.isRecord)(value))
        return false;
    const impactBands = new Set(['High', 'Medium', 'Low', 'Unknown']);
    const effortBands = new Set(['Low', 'Medium', 'High', 'Unknown']);
    if (!(0, reportEvidenceValidationHelpers_1.isCount)(value.sourceRecommendationCount) ||
        !(0, reportEvidenceValidationHelpers_1.isCount)(value.activeRecommendationCount) ||
        !(0, reportEvidenceValidationHelpers_1.isCount)(value.resolvedRecommendationCount) ||
        !(0, reportEvidenceValidationHelpers_1.isCount)(value.highImpactCount) ||
        !(0, reportEvidenceValidationHelpers_1.isCount)(value.quickWinCount) ||
        value.sourceRecommendationCount !== value.activeRecommendationCount + value.resolvedRecommendationCount ||
        value.highImpactCount > value.activeRecommendationCount ||
        value.quickWinCount > value.activeRecommendationCount ||
        !(0, reportEvidenceValidationHelpers_1.isCountRecord)(value.byCategory) ||
        !hasRequiredCountKeys(value.byImpact, ['High', 'Medium', 'Low', 'Unknown']) ||
        !hasRequiredCountKeys(value.byEffort, ['Low', 'Medium', 'High', 'Unknown']) ||
        (0, reportEvidenceValidationHelpers_1.countTotal)(value.byCategory) !== value.activeRecommendationCount ||
        (0, reportEvidenceValidationHelpers_1.countTotal)(value.byImpact) !== value.activeRecommendationCount ||
        (0, reportEvidenceValidationHelpers_1.countTotal)(value.byEffort) !== value.activeRecommendationCount ||
        !Array.isArray(value.impactEffortMatrix) ||
        value.impactEffortMatrix.length !== 16 ||
        !value.impactEffortMatrix.every(row => (0, reportEvidenceValidationHelpers_1.isRecord)(row) &&
            (0, reportEvidenceValidationHelpers_1.isString)(row.impact) &&
            impactBands.has(row.impact) &&
            (0, reportEvidenceValidationHelpers_1.isString)(row.effort) &&
            effortBands.has(row.effort) &&
            (0, reportEvidenceValidationHelpers_1.isCount)(row.count)) ||
        new Set(value.impactEffortMatrix.map(row => `${row.impact}|${row.effort}`)).size !== 16 ||
        value.impactEffortMatrix.reduce((total, row) => total + row.count, 0) !== value.activeRecommendationCount ||
        !(0, reportEvidenceValidationHelpers_1.isRecord)(value.affectedResources) ||
        !(0, reportEvidenceValidationHelpers_1.isCount)(value.affectedResources.count) ||
        !(0, reportEvidenceValidationHelpers_1.isCount)(value.affectedResources.identifiedCount) ||
        !(0, reportEvidenceValidationHelpers_1.isCount)(value.affectedResources.largestReportedRecommendationCount) ||
        (value.affectedResources.basis !== 'exact' && value.affectedResources.basis !== 'lower-bound')) {
        return false;
    }
    if (value.affectedResources.count < value.affectedResources.identifiedCount ||
        value.affectedResources.count < value.affectedResources.largestReportedRecommendationCount ||
        (value.affectedResources.basis === 'exact' && value.affectedResources.count !== value.affectedResources.identifiedCount)) {
        return false;
    }
    if (value.costSavings === undefined)
        return true;
    if (!(0, reportEvidenceValidationHelpers_1.isRecord)(value.costSavings) ||
        !(0, reportEvidenceValidationHelpers_1.isString)(value.costSavings.currency) ||
        !(0, reportEvidenceValidationHelpers_1.isCount)(value.costSavings.contributingRecommendationCount) ||
        (value.costSavings.savingsBasis !== undefined && !(0, reportSpendValidation_1.isReportSavingsBasis)(value.costSavings.savingsBasis))) {
        return false;
    }
    const monthly = value.costSavings.monthly;
    const annual = value.costSavings.annual;
    return ((0, reportEvidenceValidationHelpers_1.isRecord)(monthly) &&
        ['currentCost', 'potentialCost', 'minimumSavings', 'maximumSavings'].every(key => (0, reportEvidenceValidationHelpers_1.isFiniteNumber)(monthly[key])) &&
        (0, reportEvidenceValidationHelpers_1.isRecord)(annual) &&
        (0, reportEvidenceValidationHelpers_1.isFiniteNumber)(annual.minimumSavings) &&
        (0, reportEvidenceValidationHelpers_1.isFiniteNumber)(annual.maximumSavings) &&
        (0, reportEvidenceValidationHelpers_1.isBoundedRows)(value.costSavings.categories, reportEvidence_1.REPORT_EVIDENCE_LIMITS.detailRows, isCostSavingsCategory) &&
        (0, reportEvidenceValidationHelpers_1.isOptionalString)(value.costSavings.currencySymbol) &&
        (0, reportEvidenceValidationHelpers_1.isOptionalFiniteNumber)(monthly.minimumSavingsPercent) &&
        (0, reportEvidenceValidationHelpers_1.isOptionalFiniteNumber)(monthly.maximumSavingsPercent) &&
        (value.costSavings.basis === undefined ||
            ((0, reportEvidenceValidationHelpers_1.isRecord)(value.costSavings.basis) &&
                (0, reportEvidenceValidationHelpers_1.isString)(value.costSavings.basis.categoryScope) &&
                (0, reportEvidenceValidationHelpers_1.isString)(value.costSavings.basis.projection) &&
                (0, reportEvidenceValidationHelpers_1.isString)(value.costSavings.basis.observedPeriod) &&
                typeof value.costSavings.basis.excludesEstimatedRows === 'boolean' &&
                (0, reportEvidenceValidationHelpers_1.isString)(value.costSavings.basis.appliesTo) &&
                typeof value.costSavings.basis.containsLegacySavings === 'boolean')));
};
const isResourceExample = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) && (0, reportEvidenceValidationHelpers_1.isString)(value.name) && (0, reportEvidenceValidationHelpers_1.hasOptionalStrings)(value, ['type', 'resourceGroup', 'location']);
const isSnapshot = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) && (0, reportEvidenceValidationHelpers_1.isString)(value.name) && (0, reportEvidenceValidationHelpers_1.isOptionalString)(value.resourceGroup) && (0, reportEvidenceValidationHelpers_1.isOptionalFiniteNumber)(value.createdTime);
const isAppliedTagCost = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) && (0, reportEvidenceValidationHelpers_1.isString)(value.tagKey) && (0, reportEvidenceValidationHelpers_1.isString)(value.tagValue) && (0, reportEvidenceValidationHelpers_1.isCount)(value.resourceCount) && (0, reportEvidenceValidationHelpers_1.isFiniteNumber)(value.spend30Days);
const isInventoryResource = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.id) &&
    (0, reportEvidenceValidationHelpers_1.hasOptionalStrings)(value, ['name', 'type', 'resourceGroup', 'location']) &&
    (0, reportEvidenceValidationHelpers_1.hasOptionalNumbers)(value, ['spend30Days', 'spend30DaysAmortized', 'createdTime']);
const isInventory = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    (0, reportEvidenceValidationHelpers_1.isCount)(value.totalResources) &&
    (0, reportEvidenceValidationHelpers_1.isCount)(value.untaggedResourceCount) &&
    value.untaggedResourceCount <= value.totalResources &&
    (value.resourceCatalogue === undefined ||
        ((0, reportEvidenceValidationHelpers_1.isBoundedRows)(value.resourceCatalogue, reportEvidence_1.REPORT_EVIDENCE_LIMITS.inventoryCatalogue, reportEvidenceCatalogueValidation_1.isInventoryCatalogueResource) &&
            value.resourceCatalogue.totalCount === value.totalResources)) &&
    (0, reportEvidenceValidationHelpers_1.isBoundedRows)(value.untaggedExamples, reportEvidence_1.REPORT_EVIDENCE_LIMITS.detailRows, isResourceExample) &&
    (0, reportEvidenceValidationHelpers_1.isBoundedRows)(value.snapshots, reportEvidence_1.REPORT_EVIDENCE_LIMITS.detailRows, isSnapshot) &&
    (0, reportEvidenceValidationHelpers_1.isBoundedRows)(value.appliedTagCosts, reportEvidence_1.REPORT_EVIDENCE_LIMITS.detailRows, isAppliedTagCost) &&
    (0, reportEvidenceValidationHelpers_1.isBoundedRows)(value.topSpendResources, reportEvidence_1.REPORT_EVIDENCE_LIMITS.detailRows, isInventoryResource);
const isPrivilegedAccess = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.principalId) &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.displayName) &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.roleName) &&
    (0, reportEvidenceValidationHelpers_1.hasOptionalStrings)(value, ['userPrincipalName', 'scope', 'scopeType', 'lastLogonDate', 'mfaStatus']);
const isGovernance = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    (0, reportEvidenceValidationHelpers_1.isOptionalString)(value.generatedAt) &&
    (value.coverage === undefined || (0, reportEvidenceValidationHelpers_1.isRecord)(value.coverage)) &&
    (0, reportEvidenceValidationHelpers_1.hasRequiredRecords)(value, ['policySummary', 'rbacSummary', 'globalAdministratorSummary']) &&
    (0, reportEvidenceValidationHelpers_1.isProjectionRows)(value.complianceRows) &&
    (value.complianceAssessments === undefined ||
        (0, reportEvidenceValidationHelpers_1.isBoundedRows)(value.complianceAssessments, reportEvidence_1.REPORT_EVIDENCE_LIMITS.complianceAssessments, (row) => (0, reportEvidenceValidationHelpers_1.isRecord)(row) &&
            (0, reportEvidenceValidationHelpers_1.isCount)(row.nonCompliantResourceCount) &&
            (row.assessmentKey === undefined || (typeof row.assessmentKey === 'string' && /^[a-f0-9]{64}$/.test(row.assessmentKey))) &&
            (0, reportEvidenceValidationHelpers_1.hasOptionalStrings)(row, [
                'policySetDisplayName',
                'policyAssignmentDisplayName',
                'policyDefinitionReferenceId',
                'policyDefinitionDisplayName',
                'resourceType',
                'effect',
            ]))) &&
    (0, reportEvidenceValidationHelpers_1.isBoundedRows)(value.privilegedAccessRows, reportEvidence_1.REPORT_EVIDENCE_LIMITS.detailRows, isPrivilegedAccess) &&
    (0, reportEvidenceValidationHelpers_1.isProjectionRows)(value.findings) &&
    (0, reportEvidenceValidationHelpers_1.isProjectionRows)(value.limitations);
const isCommitments = (value) => {
    if (!(0, reportEvidenceValidationHelpers_1.isRecord)(value) || !(0, reportEvidenceValidationHelpers_1.isRecord)(value.inventorySummary) || !(0, reportEvidenceValidationHelpers_1.isCountRecord)(value.inventorySummary.statusCounts))
        return false;
    if (!(0, reportEvidenceValidationHelpers_1.isCount)(value.inventorySummary.totalCount) || !(0, reportEvidenceValidationHelpers_1.isBoundedRows)(value.inventory, reportEvidence_1.REPORT_EVIDENCE_LIMITS.detailRows, isCommitmentInventoryRow)) {
        return false;
    }
    if (value.inventorySummary.totalCount !== value.inventory.totalCount ||
        (0, reportEvidenceValidationHelpers_1.countTotal)(value.inventorySummary.statusCounts) !== value.inventorySummary.totalCount ||
        (value.inventorySummary.benefitTypeCounts !== undefined &&
            (!(0, reportEvidenceValidationHelpers_1.isCountRecord)(value.inventorySummary.benefitTypeCounts) ||
                (0, reportEvidenceValidationHelpers_1.countTotal)(value.inventorySummary.benefitTypeCounts) !== value.inventorySummary.totalCount))) {
        return false;
    }
    if (value.resourceCoverage !== undefined && !(0, reportEvidenceValidationHelpers_1.isProjectionRows)(value.resourceCoverage))
        return false;
    return ['coverage', 'obsoleteCandidates', 'reallocationOpportunities', 'purchaseRecommendations', 'renewals'].every(key => (0, reportEvidenceValidationHelpers_1.isProjectionRows)(value[key]));
};
const isDataProtectionCostSummary = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    (0, reportEvidenceValidationHelpers_1.hasOptionalStrings)(value, ['currencyCode', 'currencySymbol']) &&
    (value.billingWindow === undefined || (0, reportEvidenceValidationHelpers_1.isRecord)(value.billingWindow)) &&
    (value.totals === undefined ||
        ((0, reportEvidenceValidationHelpers_1.isRecord)(value.totals) &&
            (0, reportEvidenceValidationHelpers_1.hasOptionalNumbers)(value.totals, [
                'actualCostLast30Days',
                'actualAmortizedCostLast30Days',
                'allocatedCostLast30Days',
                'estimatedMonthlyCostForUnprotected',
            ])));
const isResourceHealthEvent = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    (0, reportEvidenceValidationHelpers_1.hasOptionalStrings)(value, [
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
    (0, reportEvidenceValidationHelpers_1.isOptionalFiniteNumber)(value.priority) &&
    (value.durationSeconds === undefined || ((0, reportEvidenceValidationHelpers_1.isFiniteNumber)(value.durationSeconds) && value.durationSeconds >= 0)) &&
    (value.impactedResourceCount === undefined || (0, reportEvidenceValidationHelpers_1.isCount)(value.impactedResourceCount)) &&
    (value.impactedServices === undefined || (0, reportEvidenceValidationHelpers_1.isStringArray)(value.impactedServices)) &&
    (value.impactedRegions === undefined || (0, reportEvidenceValidationHelpers_1.isStringArray)(value.impactedRegions));
const isCommitmentUtilization = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    (value.sevenDay !== undefined || value.thirtyDay !== undefined) &&
    ['sevenDay', 'thirtyDay'].every(key => value[key] === undefined || ((0, reportEvidenceValidationHelpers_1.isFiniteNumber)(value[key]) && value[key] >= 0)) &&
    (value.source === undefined || ['aggregate', 'usage', 'reservation-summary'].includes(value.source));
function isCommitmentInventoryRow(value) {
    return ((0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
        (0, reportEvidenceValidationHelpers_1.hasOptionalStrings)(value, [
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
        (0, reportEvidenceValidationHelpers_1.hasOptionalNumbers)(value, ['daysToExpiry', 'reservedQuantity']) &&
        (0, reportEvidenceValidationHelpers_1.isOptionalBoolean)(value.renew) &&
        (value.utilization === undefined || isCommitmentUtilization(value.utilization)) &&
        (value.annualCommittedCost === undefined || (0, reportEvidenceValidationHelpers_1.isRecord)(value.annualCommittedCost)) &&
        (value.doNotRenewAnnualImpact === undefined || (0, reportEvidenceValidationHelpers_1.isRecord)(value.doNotRenewAnnualImpact)));
}
const isReportingProjection = (value) => {
    if (!(0, reportEvidenceValidationHelpers_1.isRecord)(value) || !(0, reportEvidenceValidationHelpers_1.isRecord)(value.dashboard) || !isRecommendationPortfolio(value.recommendationPortfolio))
        return false;
    if (value.dailySpend !== undefined && !(0, reportDailySpendValidation_1.isReportDailySpend)(value.dailySpend))
        return false;
    if (value.spend !== undefined && !(0, reportSpendValidation_1.isReportSpendProjection)(value.spend))
        return false;
    if (value.stories !== undefined && !(0, utilizationStoriesValidation_1.isReportingStories)(value.stories))
        return false;
    if (value.costChangePeriods !== undefined &&
        (!(0, reportEvidenceValidationHelpers_1.isBoundedRows)(value.costChangePeriods, reportEvidence_1.REPORT_EVIDENCE_LIMITS.costChangePeriods, isCostChangePeriod) ||
            new Set(value.costChangePeriods.rows.map(period => period.period)).size !== value.costChangePeriods.rows.length)) {
        return false;
    }
    const subscription = (0, reportEvidenceValidationHelpers_1.isRecord)(value.dashboard.subscription) ? value.dashboard.subscription : undefined;
    const properties = subscription && (0, reportEvidenceValidationHelpers_1.isRecord)(subscription.properties) ? subscription.properties : undefined;
    if (properties?.secureScoreEvidence !== undefined && !(0, exports.isReportSecureScoreEvidence)(properties.secureScoreEvidence))
        return false;
    if (!(0, reportEvidenceValidationHelpers_1.isBoundedRows)(value.recommendations, reportEvidence_1.REPORT_EVIDENCE_LIMITS.currentRecommendations, reportEvidenceCatalogueValidation_1.isCompactRecommendation) ||
        value.recommendations.totalCount !==
            value.recommendationPortfolio.activeRecommendationCount ||
        (value.recommendationCatalogue !== undefined &&
            (!(0, reportEvidenceValidationHelpers_1.isBoundedRows)(value.recommendationCatalogue, reportEvidence_1.REPORT_EVIDENCE_LIMITS.recommendationCatalogue, reportEvidenceCatalogueValidation_1.isCompactRecommendation) ||
                value.recommendationCatalogue.totalCount !== value.recommendationPortfolio.activeRecommendationCount)) ||
        !(0, reportEvidenceValidationHelpers_1.isProjectionRows)(value.serviceRetirements) ||
        (value.credentialDeadlines !== undefined &&
            (!(0, reportEvidenceValidationHelpers_1.isRecord)(value.credentialDeadlines) ||
                !(0, reportEvidenceValidationHelpers_1.isDateTime)(value.credentialDeadlines.asOf) ||
                !(0, reportEvidenceValidationHelpers_1.isCount)(value.credentialDeadlines.overdueCount) ||
                !(0, reportEvidenceValidationHelpers_1.isCount)(value.credentialDeadlines.upcomingSixMonthsCount))) ||
        !isInventory(value.inventory) ||
        !isGovernance(value.governance) ||
        !isCommitments(value.commitmentsPlanning)) {
        return false;
    }
    const patch = value.patchManagement;
    const resourceRows = [value.recommendations, value.recommendationCatalogue]
        .flatMap(collection => collection?.rows ?? [])
        .reduce((total, row) => total + (row.resourceCatalogue?.rows.length ?? 0), 0);
    if (resourceRows > reportEvidence_1.REPORT_EVIDENCE_LIMITS.totalRecommendationResourceRows)
        return false;
    const protection = value.dataProtection;
    const health = value.resourceHealth;
    const uptime = value.serverUptime;
    const publicIps = value.publicIpAddresses;
    const activity = value.activity;
    return ((0, reportEvidenceValidationHelpers_1.isRecord)(patch) &&
        (0, reportEvidenceValidationHelpers_1.isProjectionRows)(patch.machines) &&
        (0, reportEvidenceValidationHelpers_1.isRecord)(protection) &&
        (protection.costSummary === undefined || isDataProtectionCostSummary(protection.costSummary)) &&
        (0, reportEvidenceValidationHelpers_1.isProjectionRows)(protection.items) &&
        (0, reportEvidenceValidationHelpers_1.isProjectionRows)(protection.issues) &&
        (0, reportEvidenceValidationHelpers_1.isRecord)(health) &&
        (health.eventCatalogue === undefined || (0, reportEvidenceValidationHelpers_1.isBoundedRows)(health.eventCatalogue, reportEvidence_1.REPORT_EVIDENCE_LIMITS.healthCatalogue, isResourceHealthEvent)) &&
        (health.availabilityCatalogue === undefined || (0, reportEvidenceValidationHelpers_1.isBoundedRows)(health.availabilityCatalogue, reportEvidence_1.REPORT_EVIDENCE_LIMITS.healthCatalogue, reportEvidenceValidationHelpers_1.isRecord)) &&
        (0, reportEvidenceValidationHelpers_1.isRecord)(health.events) &&
        (0, reportEvidenceValidationHelpers_1.isBoundedRows)(health.events.events, reportEvidence_1.REPORT_EVIDENCE_LIMITS.detailRows, isResourceHealthEvent) &&
        (health.eventCatalogue === undefined || health.eventCatalogue.totalCount === health.events.events.totalCount) &&
        (0, reportEvidenceValidationHelpers_1.isRecord)(health.availabilityStatuses) &&
        (0, reportEvidenceValidationHelpers_1.isProjectionRows)(health.availabilityStatuses.statuses) &&
        (health.availabilityCatalogue === undefined ||
            health.availabilityCatalogue.totalCount === health.availabilityStatuses.statuses.totalCount) &&
        (0, reportEvidenceValidationHelpers_1.isRecord)(uptime) &&
        ['workspaces', 'gaps', 'servers'].every(key => (0, reportEvidenceValidationHelpers_1.isProjectionRows)(uptime[key])) &&
        (0, reportEvidenceValidationHelpers_1.isRecord)(publicIps) &&
        (0, reportEvidenceValidationHelpers_1.isProjectionRows)(publicIps.items) &&
        (0, reportEvidenceValidationHelpers_1.isRecord)(activity) &&
        (activity.monthlyFindings === undefined ||
            ((0, reportEvidenceValidationHelpers_1.isBoundedRows)(activity.monthlyFindings, reportEvidence_1.REPORT_EVIDENCE_LIMITS.activityMonths, isActivityMonthlyFindings) &&
                new Set(activity.monthlyFindings.rows.map(row => row.month)).size === activity.monthlyFindings.rows.length)) &&
        (activity.dailySummary === undefined ||
            ((0, reportEvidenceValidationHelpers_1.isBoundedRows)(activity.dailySummary, reportEvidence_1.REPORT_EVIDENCE_LIMITS.activityDays, isActivityDailySummary) &&
                new Set(activity.dailySummary.rows.map(row => row.date)).size === activity.dailySummary.rows.length)) &&
        (activity.undatedSummary === undefined || isActivityCounts(activity.undatedSummary)) &&
        ['changes', 'security', 'health', 'suppressed'].every(key => (0, reportEvidenceValidationHelpers_1.isProjectionRows)(activity[key])));
};
const isActivityCounts = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    ['visibleEvents', 'materialChanges', 'securitySensitive', 'healthEvents', 'failedEvents', 'highFindingCount'].every(key => (0, reportEvidenceValidationHelpers_1.isCount)(value[key])) &&
    (value.automatedSnapshotEvents === undefined ||
        ((0, reportEvidenceValidationHelpers_1.isCount)(value.automatedSnapshotEvents) && value.automatedSnapshotEvents <= value.materialChanges)) &&
    ['materialChanges', 'securitySensitive', 'healthEvents', 'failedEvents'].every(key => value[key] <= value.visibleEvents);
const isActivityMonthlyFindings = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.month) &&
    /^\d{4}-(0[1-9]|1[0-2])$/.test(value.month) &&
    (0, reportEvidenceValidationHelpers_1.isBoundedRows)(value.findings, reportEvidence_1.REPORT_EVIDENCE_LIMITS.detailRows, (row) => (0, reportEvidenceValidationHelpers_1.isRecord)(row) &&
        (0, reportEvidenceValidationHelpers_1.isDateTime)(row.eventTimestamp) &&
        new Date(row.eventTimestamp).toISOString().slice(0, 7) === value.month &&
        (row.importance === undefined || (0, reportEvidenceValidationHelpers_1.isString)(row.importance)) &&
        (row.status === undefined || (0, reportEvidenceValidationHelpers_1.isString)(row.status)) &&
        ((typeof row.importance === 'string' && row.importance.toLowerCase() === 'high') ||
            row.isSecuritySensitive === true ||
            (typeof row.status === 'string' && row.status.toLowerCase() === 'failed')));
const isActivityDailySummary = (value) => isActivityCounts(value) &&
    (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.date) &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.date) &&
    Number.isFinite(Date.parse(value.date)) &&
    new Date(value.date).toISOString().slice(0, 10) === value.date;
const isSubscriptionReportEvidencePack = (value) => {
    if (!(0, reportEvidenceValidationHelpers_1.isRecord)(value) || !(0, reportEvidenceValidationHelpers_1.isDateTime)(value.generatedAt)) {
        return false;
    }
    if (!(0, reportEvidenceValidationHelpers_1.isRecord)(value.generation) ||
        !(0, reportEvidenceValidationHelpers_1.isRecord)(value.scope) ||
        !(0, reportEvidenceValidationHelpers_1.isString)(value.scope.subscriptionId) ||
        !(0, reportEvidenceValidationHelpers_1.isRecord)(value.coverage) ||
        !(0, reportEvidenceValidationHelpers_1.isRecord)(value.coverage.sourceFiles) ||
        !(0, reportEvidenceValidationHelpers_1.isStringArray)(value.coverage.gaps) ||
        !Object.values(value.coverage.sourceFiles).every(reportEvidenceValidationHelpers_1.isSourceFileStatus) ||
        !(0, reportEvidenceValidationHelpers_1.isResourceSummary)(value.estate) ||
        !(0, reportEvidenceValidationHelpers_1.isCostSummary)(value.cost) ||
        !(0, reportEvidenceValidationHelpers_1.isRecommendationSummary)(value.recommendations) ||
        !(0, reportEvidenceValidationHelpers_1.isRecord)(value.security) ||
        !(0, reportEvidenceValidationHelpers_1.isOptionalFiniteNumber)(value.security.secureScore) ||
        (value.security.governance !== undefined &&
            (!(0, reportEvidenceValidationHelpers_1.isRecord)(value.security.governance) || !(0, reportEvidenceValidationHelpers_1.isOptionalFiniteNumber)(value.security.governance.findingCount))) ||
        !(0, reportEvidenceValidationHelpers_1.isRecord)(value.reliability) ||
        !(0, reportEvidenceValidationHelpers_1.isRetirementSummary)(value.reliability.serviceRetirements) ||
        !(0, reportEvidenceValidationHelpers_1.isCount)(value.reliability.recommendationCount) ||
        !(0, reportEvidenceValidationHelpers_1.isRecord)(value.commitments) ||
        !(0, reportEvidenceValidationHelpers_1.isCommitmentExpirySummary)(value.commitments.expiries) ||
        !(0, reportEvidenceValidationHelpers_1.isRecord)(value.performance) ||
        !(0, reportEvidenceValidationHelpers_1.isCount)(value.performance.recommendationCount) ||
        !(0, reportEvidenceValidationHelpers_1.isStringArray)(value.performance.topRecommendationIds) ||
        !(0, reportEvidenceValidationHelpers_1.isRecord)(value.operationalExcellence) ||
        !(0, reportEvidenceValidationHelpers_1.isCount)(value.operationalExcellence.recommendationCount) ||
        !(0, reportEvidenceValidationHelpers_1.isTagCoverage)(value.operationalExcellence.tagCoverage) ||
        !isReportingProjection(value.reporting) ||
        !Array.isArray(value.evidence) ||
        !value.evidence.every(reportEvidenceValidationHelpers_1.isEvidenceReference)) {
        return false;
    }
    if (!(0, reportEvidenceValidationHelpers_1.hasOptionalStrings)(value.generation, ['sourceRunId', 'sourceGeneratedAt']) ||
        !(0, reportEvidenceValidationHelpers_1.hasOptionalStrings)(value.scope, ['companyId', 'tenantId', 'displayName', 'currency', 'currencySymbol'])) {
        return false;
    }
    const dailySpend = value.reporting.dailySpend;
    if (dailySpend && value.scope.currency !== undefined && dailySpend.currency !== value.scope.currency)
        return false;
    const spend = value.reporting.spend;
    if (spend &&
        ((value.scope.currency !== undefined && spend.currency !== value.scope.currency) ||
            (dailySpend && spend.currency !== dailySpend.currency) ||
            Date.parse(spend.generatedAt) > Date.parse(value.generatedAt)))
        return false;
    return (value.reliability.relationshipGraph === undefined ||
        ((0, reportEvidenceValidationHelpers_1.isRecord)(value.reliability.relationshipGraph) &&
            (0, reportEvidenceValidationHelpers_1.hasOptionalNumbers)(value.reliability.relationshipGraph, ['totalNodes', 'totalEdges', 'unresolvedCount', 'buildMs'])));
};
exports.isSubscriptionReportEvidencePack = isSubscriptionReportEvidencePack;
const isRecommendationFingerprint = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    (value.savingsBasis === undefined || (0, reportSpendValidation_1.isReportSavingsBasis)(value.savingsBasis)) &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.id) &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.title) &&
    (0, reportEvidenceValidationHelpers_1.hasOptionalStrings)(value, ['category', 'impact', 'severity', 'currency']) &&
    (0, reportEvidenceValidationHelpers_1.isOptionalBoolean)(value.resolved) &&
    (0, reportEvidenceValidationHelpers_1.isCount)(value.affectedResourceCount) &&
    (0, reportEvidenceValidationHelpers_1.isOptionalFiniteNumber)(value.potentialMonthlySavings) &&
    (0, reportEvidenceValidationHelpers_1.isOptionalFiniteNumber)(value.maximumMonthlySavings) &&
    (0, reportEvidenceValidationHelpers_1.isOptionalFiniteNumber)(value.costImpact);
const isHistoryMetrics = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    (0, reportEvidenceValidationHelpers_1.hasOptionalStrings)(value, ['subscriptionName', 'currency', 'currencySymbol']) &&
    (0, reportEvidenceValidationHelpers_1.hasOptionalNumbers)(value, ['secureScore', 'advisorScore', 'spend30Days', 'spend30DaysAmortized']) &&
    (value.secureScoreEvidence === undefined || (0, exports.isReportSecureScoreEvidence)(value.secureScoreEvidence)) &&
    (0, reportEvidenceValidationHelpers_1.isCount)(value.resourceCount) &&
    (0, reportEvidenceValidationHelpers_1.isCount)(value.recommendationCount) &&
    (0, reportEvidenceValidationHelpers_1.isCount)(value.impactedResourceCount) &&
    (0, reportEvidenceValidationHelpers_1.isCount)(value.securityRecommendationCount) &&
    (0, reportEvidenceValidationHelpers_1.isCount)(value.securityImpactedResourceCount) &&
    value.securityRecommendationCount <= value.recommendationCount &&
    value.securityImpactedResourceCount <= value.impactedResourceCount &&
    (0, reportEvidenceValidationHelpers_1.isOptionalFiniteNumber)(value.maximumMonthlySavings);
const isUniqueIdentityRows = (value, itemValidator = reportEvidenceValidationHelpers_1.isString) => (0, reportEvidenceValidationHelpers_1.isBoundedRows)(value, reportEvidence_1.REPORT_EVIDENCE_LIMITS.historyComparisonIdentities, itemValidator) &&
    new Set(value.rows).size === value.rows.length;
const isHistoryComparisonIdentities = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    isUniqueIdentityRows(value.costRecommendationIds) &&
    isUniqueIdentityRows(value.undersizedResourceIds) &&
    isUniqueIdentityRows(value.regulatoryAssessmentKeys, (item) => (0, reportEvidenceValidationHelpers_1.isString)(item) && /^[a-f0-9]{64}$/u.test(item));
const isSubscriptionReportHistory = (value) => {
    if (!(0, reportEvidenceValidationHelpers_1.isRecord)(value) ||
        !(0, reportEvidenceValidationHelpers_1.isString)(value.subscriptionId) ||
        !(0, reportEvidenceValidationHelpers_1.isDateTime)(value.generatedAt) ||
        !(0, reportEvidenceValidationHelpers_1.isRecord)(value.retention) ||
        value.retention.maxPeriods !== reportEvidence_1.REPORT_EVIDENCE_LIMITS.historyPeriods ||
        !Array.isArray(value.periods) ||
        value.periods.length > reportEvidence_1.REPORT_EVIDENCE_LIMITS.historyPeriods) {
        return false;
    }
    const periods = new Set();
    for (const period of value.periods) {
        if (!(0, reportEvidenceValidationHelpers_1.isRecord)(period) ||
            !(0, reportEvidenceValidationHelpers_1.isString)(period.period) ||
            !/^\d{4}-(0[1-9]|1[0-2])$/u.test(period.period) ||
            periods.has(period.period) ||
            !(0, reportEvidenceValidationHelpers_1.isString)(period.sourceRunId) ||
            !(0, reportEvidenceValidationHelpers_1.isDateTime)(period.sourceGeneratedAt) ||
            !isHistoryMetrics(period.metrics) ||
            !(0, reportEvidenceValidationHelpers_1.isBoundedRows)(period.recommendations, reportEvidence_1.REPORT_EVIDENCE_LIMITS.historyRecommendations, isRecommendationFingerprint) ||
            (period.comparisonIdentities !== undefined && !isHistoryComparisonIdentities(period.comparisonIdentities)) ||
            (period.stories !== undefined && !(0, utilizationStoriesValidation_1.isStoryFingerprintRows)(period.stories))) {
            return false;
        }
        if (period.recommendations.omittedCount === 0 &&
            period.metrics.recommendationCount !== period.recommendations.rows.filter(row => row.resolved !== true).length) {
            return false;
        }
        periods.add(period.period);
    }
    return true;
};
exports.isSubscriptionReportHistory = isSubscriptionReportHistory;
const isTenantMfaSummary = (value) => {
    if (!(0, reportEvidenceValidationHelpers_1.isRecord)(value) || typeof value.countsAreLowerBounds !== 'boolean' || !(0, reportEvidenceValidationHelpers_1.isRecord)(value.enforcement))
        return false;
    const enforcement = value.enforcement;
    const enforcementKeys = ['enforced', 'conditionallyEnforced', 'notEnforced', 'unknown'];
    if (!(0, reportEvidenceValidationHelpers_1.isCount)(value.enumeratedUsers) ||
        !(0, reportEvidenceValidationHelpers_1.isCount)(value.activeUsers) ||
        !(0, reportEvidenceValidationHelpers_1.isCount)(value.disabledUsers) ||
        !(0, reportEvidenceValidationHelpers_1.isCount)(value.assessedActiveUsers) ||
        !(0, reportEvidenceValidationHelpers_1.isCount)(value.enforcementKnownUsers) ||
        !(0, reportEvidenceValidationHelpers_1.isCount)(value.enforcementUnknownUsers) ||
        !(0, reportEvidenceValidationHelpers_1.isOptionalString)(value.assessmentState) ||
        !['mfaCapableUsers', 'notMfaCapableUsers', 'unknownRegistrationUsers'].every(key => value[key] === undefined || (0, reportEvidenceValidationHelpers_1.isCount)(value[key])) ||
        Object.keys(enforcement).some(key => !enforcementKeys.includes(key)) ||
        !enforcementKeys.every(key => (0, reportEvidenceValidationHelpers_1.isCount)(enforcement[key]))) {
        return false;
    }
    return (value.enumeratedUsers === value.assessedActiveUsers + value.disabledUsers &&
        value.activeUsers === value.enforcementKnownUsers + value.enforcementUnknownUsers &&
        value.activeUsers === (0, reportEvidenceValidationHelpers_1.countTotal)(enforcement) &&
        value.enforcementUnknownUsers === enforcement.unknown &&
        (value.countsAreLowerBounds || value.assessedActiveUsers === value.activeUsers));
};
const isTenantCoverage = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    Object.values(value).every(section => (0, reportEvidenceValidationHelpers_1.isRecord)(section) &&
        (0, reportEvidenceValidationHelpers_1.hasOptionalStrings)(section, ['state', 'source', 'reason', 'message', 'lastAttemptedAt', 'lastSuccessfulAt']) &&
        (section.requiredPermissions === undefined || (0, reportEvidenceValidationHelpers_1.isStringArray)(section.requiredPermissions)) &&
        (!Array.isArray(section.requiredPermissions) || section.requiredPermissions.length <= 10) &&
        (0, reportEvidenceValidationHelpers_1.isOptionalFiniteNumber)(section.maximumSourceLagHours));
const isTenantSignInCoverage = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) && ['complete', 'partial', 'unavailable', 'skipped'].includes(value.state);
const isTenantPrincipal = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.principalId) &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.principalType) &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.assignmentSource) &&
    (0, reportEvidenceValidationHelpers_1.isStringArray)(value.assignmentModes) &&
    value.assignmentModes.length <= 4 &&
    typeof value.isPimBacked === 'boolean' &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.lastActivatedEvidence) &&
    (0, reportEvidenceValidationHelpers_1.hasOptionalStrings)(value, ['displayName', 'userPrincipalName', 'mfaStatus', 'lastActivatedAt']) &&
    (0, reportEvidenceValidationHelpers_1.isOptionalBoolean)(value.accountEnabled) &&
    ((value.lastSignInAt === undefined && value.lastSignInEvidence === undefined) ||
        (value.lastSignInAt === undefined && value.lastSignInEvidence === 'unavailable') ||
        ((0, reportEvidenceValidationHelpers_1.isDateTime)(value.lastSignInAt) &&
            (value.lastSignInEvidence === 'last-successful-sign-in' || value.lastSignInEvidence === 'last-interactive-sign-in')));
const isTenantReportEvidencePack = (value) => {
    if (!(0, reportEvidenceValidationHelpers_1.isRecord)(value) ||
        !(0, reportEvidenceValidationHelpers_1.isDateTime)(value.generatedAt) ||
        !(0, reportEvidenceValidationHelpers_1.isRecord)(value.scope) ||
        !(0, reportEvidenceValidationHelpers_1.isString)(value.scope.tenantId) ||
        !(0, reportEvidenceValidationHelpers_1.isRecord)(value.mfa) ||
        (value.mfa.summary !== undefined && !isTenantMfaSummary(value.mfa.summary)) ||
        (value.mfa.tenantPolicy !== undefined && !(0, reportEvidenceValidationHelpers_1.isRecord)(value.mfa.tenantPolicy)) ||
        (value.mfa.coverage !== undefined && !isTenantCoverage(value.mfa.coverage)) ||
        !(0, reportEvidenceValidationHelpers_1.isRecord)(value.globalAdmins) ||
        !(0, reportEvidenceValidationHelpers_1.isRecord)(value.globalAdmins.summary) ||
        !isTenantCoverage(value.globalAdmins.coverage) ||
        !(0, reportEvidenceValidationHelpers_1.isBoundedRows)(value.globalAdmins.warnings, reportEvidence_1.REPORT_EVIDENCE_LIMITS.tenantGlobalAdministrators, reportEvidenceValidationHelpers_1.isRecord) ||
        !(0, reportEvidenceValidationHelpers_1.isBoundedRows)(value.globalAdmins.principals, reportEvidence_1.REPORT_EVIDENCE_LIMITS.tenantGlobalAdministrators, isTenantPrincipal)) {
        return false;
    }
    const signInCoverage = value.globalAdmins.coverage.userSignInActivity;
    if (signInCoverage !== undefined && !isTenantSignInCoverage(signInCoverage))
        return false;
    if ((0, reportEvidenceValidationHelpers_1.isRecord)(signInCoverage) &&
        (signInCoverage.state === 'unavailable' || signInCoverage.state === 'skipped') &&
        value.globalAdmins.principals.rows.some(principal => principal.lastSignInAt !== undefined)) {
        return false;
    }
    return true;
};
exports.isTenantReportEvidencePack = isTenantReportEvidencePack;
//# sourceMappingURL=reportEvidenceValidation.js.map