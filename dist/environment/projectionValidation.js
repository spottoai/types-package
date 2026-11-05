"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEnvironmentProjectionContentValidatorV1 = exports.ENVIRONMENT_PROJECTION_CONTENT_OPTIONAL_KEYS_V1 = exports.ENVIRONMENT_PROJECTION_CONTENT_REQUIRED_KEYS_V1 = void 0;
const contracts_js_1 = require("./contracts.js");
const internal_js_1 = require("./internal.js");
const valueValidation_js_1 = require("./valueValidation.js");
const SIGNED_DECIMAL_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/u;
const FINDING_KINDS = new Set(contracts_js_1.ENVIRONMENT_FINDING_KINDS_V1);
const SEVERITIES = new Set(contracts_js_1.ENVIRONMENT_SEVERITIES_V1);
const IMPACTS = new Set(contracts_js_1.ENVIRONMENT_IMPACTS_V1);
const EFFORTS = new Set(contracts_js_1.ENVIRONMENT_EFFORTS_V1);
const CHANGE_DIRECTIONS = new Set(['increase', 'decrease', 'unchanged', 'unknown']);
const isGeneralKey = (value) => (0, internal_js_1.isBoundedString)(value, contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.safeLabelScalars, { trimmed: true, controls: true });
const isPercentage = (value) => typeof value === 'string' && internal_js_1.DECIMAL_PATTERN.test(value) && Number(value) <= 100;
/** @internal Exact content keys shared by the provider-specific envelope guards. */
exports.ENVIRONMENT_PROJECTION_CONTENT_REQUIRED_KEYS_V1 = [
    'estateSummary',
    'costSummary',
    'serviceFamilyRollups',
    'estateCostRollups',
    'costDrivers',
    'pillars',
    'findings',
    'recommendations',
    'changes',
    'warnings',
    'sourceReferences',
];
exports.ENVIRONMENT_PROJECTION_CONTENT_OPTIONAL_KEYS_V1 = [
    'commitments',
    'budgets',
    'idleResources',
    'publicIpExposure',
    'secretStoreCoverage',
    'tagCoverage',
    'changeSignals',
    'healthEvents',
    'dataProtection',
    'secureScore',
];
/** @internal Builds the common bounded-content guard for one provider/scope policy. */
const createEnvironmentProjectionContentValidatorV1 = (policy) => {
    const isEnvironmentLogicalEvidenceReferenceV1 = policy.isEvidenceReference;
    const isEnvironmentLogicalResourceReferenceV1 = policy.isResourceReference;
    const isEnvironmentPortalRouteV1 = policy.isPortalRoute;
    const isObservedMoney = (value) => policy.isMoneyValue(value) && value.savingsAdditivity === undefined && value.savingsBasis === undefined;
    const isSavingsMoney = (value) => policy.isMoneyValue(value) && value.savingsAdditivity !== undefined && value.spendSource === undefined && value.composition === undefined;
    const isReferenceArray = (value) => Array.isArray(value) &&
        value.length <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems &&
        value.every(isEnvironmentLogicalEvidenceReferenceV1) &&
        new Set(value).size === value.length;
    const isResourceReferenceArray = (value) => Array.isArray(value) &&
        value.length <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems &&
        value.every(isEnvironmentLogicalResourceReferenceV1) &&
        new Set(value).size === value.length;
    const isBoundedList = (value, itemValidator) => {
        if (!(0, internal_js_1.isRecord)(value) || !(0, internal_js_1.hasExactKeys)(value, ['items', 'totalCount', 'includedCount', 'truncated'], ['continuationReference']))
            return false;
        if (!Array.isArray(value.items) || value.items.length > contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems || !value.items.every(itemValidator))
            return false;
        if (!(0, internal_js_1.isNonNegativeInteger)(value.totalCount) || !(0, internal_js_1.isNonNegativeInteger)(value.includedCount))
            return false;
        if (value.includedCount !== value.items.length || value.totalCount < value.includedCount || typeof value.truncated !== 'boolean')
            return false;
        if (value.truncated !== value.totalCount > value.includedCount)
            return false;
        if (value.continuationReference !== undefined && !isEnvironmentLogicalEvidenceReferenceV1(value.continuationReference))
            return false;
        return !value.truncated || value.continuationReference !== undefined;
    };
    const isCostRollup = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['key', 'safeLabel', 'resourceCount', 'sourceReferences'], ['observedCost', 'potentialSavings']) &&
        isGeneralKey(value.key) &&
        (0, internal_js_1.isSafeLabel)(value.safeLabel) &&
        (0, internal_js_1.isNonNegativeInteger)(value.resourceCount) &&
        (value.observedCost === undefined || isObservedMoney(value.observedCost)) &&
        (value.potentialSavings === undefined || isSavingsMoney(value.potentialSavings)) &&
        isReferenceArray(value.sourceReferences);
    const isCostDriver = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['key', 'safeLabel', 'sourceReferences'], ['description', 'observedCost', 'portalRoute', 'resourceReference']) &&
        isGeneralKey(value.key) &&
        (0, internal_js_1.isSafeLabel)(value.safeLabel) &&
        (value.description === undefined || (0, internal_js_1.isCustomerString)(value.description)) &&
        (value.observedCost === undefined || isObservedMoney(value.observedCost)) &&
        (value.portalRoute === undefined || isEnvironmentPortalRouteV1(value.portalRoute)) &&
        (value.resourceReference === undefined || isEnvironmentLogicalResourceReferenceV1(value.resourceReference)) &&
        isReferenceArray(value.sourceReferences);
    const isPillarScore = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['value', 'maximum', 'safeLabel']) &&
        isPercentage(value.value) &&
        value.maximum === '100' &&
        (0, internal_js_1.isSafeLabel)(value.safeLabel);
    const isPillarSummary = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['pillar', 'coverage', 'findingCount', 'recommendationCount', 'affectedResources', 'portalRoute', 'sourceReferences'], ['score']) &&
        (0, valueValidation_js_1.isEnvironmentPillarV1)(value.pillar) &&
        (0, valueValidation_js_1.isEnvironmentCoverageStateV1)(value.coverage) &&
        (0, internal_js_1.isNonNegativeInteger)(value.findingCount) &&
        (0, internal_js_1.isNonNegativeInteger)(value.recommendationCount) &&
        (0, valueValidation_js_1.isEnvironmentCardinalityV1)(value.affectedResources) &&
        isEnvironmentPortalRouteV1(value.portalRoute) &&
        (value.score === undefined || isPillarScore(value.score)) &&
        isReferenceArray(value.sourceReferences);
    const isPillarSummaries = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, contracts_js_1.ENVIRONMENT_PILLARS_V1) &&
        contracts_js_1.ENVIRONMENT_PILLARS_V1.every(pillar => isPillarSummary(value[pillar]) && value[pillar]?.pillar === pillar);
    const isFinding = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['findingId', 'pillar', 'kind', 'safeLabel', 'severity', 'resourceReferences', 'sourceReferences'], ['description', 'impact', 'effort', 'affectedResources', 'portalRoute']) &&
        (0, internal_js_1.isScopeIdentifier)(value.findingId) &&
        (0, valueValidation_js_1.isEnvironmentPillarV1)(value.pillar) &&
        typeof value.kind === 'string' &&
        FINDING_KINDS.has(value.kind) &&
        (0, internal_js_1.isSafeLabel)(value.safeLabel) &&
        typeof value.severity === 'string' &&
        SEVERITIES.has(value.severity) &&
        (value.description === undefined || (0, internal_js_1.isCustomerString)(value.description)) &&
        (value.impact === undefined || (typeof value.impact === 'string' && IMPACTS.has(value.impact))) &&
        (value.effort === undefined || (typeof value.effort === 'string' && EFFORTS.has(value.effort))) &&
        (value.affectedResources === undefined || (0, valueValidation_js_1.isEnvironmentCardinalityV1)(value.affectedResources)) &&
        (value.portalRoute === undefined || isEnvironmentPortalRouteV1(value.portalRoute)) &&
        isResourceReferenceArray(value.resourceReferences) &&
        isReferenceArray(value.sourceReferences);
    const isRecommendation = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['recommendationId', 'pillar', 'safeLabel', 'technicalName', 'affectedResourceTypes', 'portalRoute', 'resourceReferences', 'sourceReferences'], ['description', 'impact', 'effort', 'affectedResources', 'potentialSavings']) &&
        (0, internal_js_1.isScopeIdentifier)(value.recommendationId) &&
        (0, valueValidation_js_1.isEnvironmentPillarV1)(value.pillar) &&
        (0, internal_js_1.isSafeLabel)(value.safeLabel) &&
        (0, internal_js_1.isSafeLabel)(value.technicalName) &&
        policy.isResourceTypeArray(value.affectedResourceTypes) &&
        isEnvironmentPortalRouteV1(value.portalRoute) &&
        (value.description === undefined || (0, internal_js_1.isCustomerString)(value.description)) &&
        (value.impact === undefined || (typeof value.impact === 'string' && IMPACTS.has(value.impact))) &&
        (value.effort === undefined || (typeof value.effort === 'string' && EFFORTS.has(value.effort))) &&
        (value.affectedResources === undefined || (0, valueValidation_js_1.isEnvironmentCardinalityV1)(value.affectedResources)) &&
        (value.potentialSavings === undefined || isSavingsMoney(value.potentialSavings)) &&
        isResourceReferenceArray(value.resourceReferences) &&
        policy.resourceTypesMatchReferences(value.affectedResourceTypes, value.resourceReferences) &&
        isReferenceArray(value.sourceReferences);
    const isChange = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['key', 'pillars', 'safeLabel', 'description', 'direction', 'sourceReferences'], ['amount']) &&
        isGeneralKey(value.key) &&
        Array.isArray(value.pillars) &&
        value.pillars.length > 0 &&
        value.pillars.length <= contracts_js_1.ENVIRONMENT_PILLARS_V1.length &&
        value.pillars.every(valueValidation_js_1.isEnvironmentPillarV1) &&
        new Set(value.pillars).size === value.pillars.length &&
        (0, internal_js_1.isSafeLabel)(value.safeLabel) &&
        (0, internal_js_1.isCustomerString)(value.description) &&
        typeof value.direction === 'string' &&
        CHANGE_DIRECTIONS.has(value.direction) &&
        (value.amount === undefined || isObservedMoney(value.amount)) &&
        isReferenceArray(value.sourceReferences);
    const isWarning = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['code', 'safeLabel', 'sourceReferences'], ['pillar', 'detail']) &&
        isGeneralKey(value.code) &&
        (0, internal_js_1.isSafeLabel)(value.safeLabel) &&
        (value.pillar === undefined || (0, valueValidation_js_1.isEnvironmentPillarV1)(value.pillar)) &&
        (value.detail === undefined || (0, internal_js_1.isCustomerString)(value.detail)) &&
        isReferenceArray(value.sourceReferences);
    const isEstateSummary = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['resourceCount', 'serviceFamilyCount', 'locationCount']) &&
        (0, internal_js_1.isNonNegativeInteger)(value.resourceCount) &&
        (0, internal_js_1.isNonNegativeInteger)(value.serviceFamilyCount) &&
        (0, internal_js_1.isNonNegativeInteger)(value.locationCount);
    const isCostSummary = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, [], ['observedCost', 'potentialSavings', 'costRecommendationCount']) &&
        (value.observedCost === undefined || isObservedMoney(value.observedCost)) &&
        (value.potentialSavings === undefined || isSavingsMoney(value.potentialSavings)) &&
        (value.costRecommendationCount === undefined || (0, internal_js_1.isNonNegativeInteger)(value.costRecommendationCount));
    const SECTION_ITEMS = contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.sectionListItems;
    const isSectionList = (value, itemValidator) => isBoundedList(value, itemValidator) && value.items.length <= SECTION_ITEMS;
    const isSectionCount = (value) => value === undefined || (0, internal_js_1.isNonNegativeInteger)(value);
    const isLabeledCount = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['key', 'safeLabel', 'count']) &&
        isGeneralKey(value.key) &&
        (0, internal_js_1.isSafeLabel)(value.safeLabel) &&
        (0, internal_js_1.isNonNegativeInteger)(value.count);
    const isSubjectReference = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['key', 'safeLabel'], ['detail', 'resourceReference']) &&
        isGeneralKey(value.key) &&
        (0, internal_js_1.isSafeLabel)(value.safeLabel) &&
        (value.detail === undefined || (0, internal_js_1.isCustomerString)(value.detail)) &&
        (value.resourceReference === undefined || isEnvironmentLogicalResourceReferenceV1(value.resourceReference));
    const isCommitmentPurchaseOption = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['key', 'safeLabel'], ['termMonths', 'estimatedMonthlySavings']) &&
        isGeneralKey(value.key) &&
        (0, internal_js_1.isSafeLabel)(value.safeLabel) &&
        isSectionCount(value.termMonths) &&
        (value.estimatedMonthlySavings === undefined || isSavingsMoney(value.estimatedMonthlySavings));
    const isCommitmentCoverageRow = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['key', 'safeLabel', 'benefitLabels'], ['detail', 'resourceReference']) &&
        isGeneralKey(value.key) &&
        (0, internal_js_1.isSafeLabel)(value.safeLabel) &&
        Array.isArray(value.benefitLabels) &&
        value.benefitLabels.length <= SECTION_ITEMS &&
        value.benefitLabels.every(internal_js_1.isSafeLabel) &&
        (value.detail === undefined || (0, internal_js_1.isCustomerString)(value.detail)) &&
        (value.resourceReference === undefined || isEnvironmentLogicalResourceReferenceV1(value.resourceReference));
    const isCommitmentsSection = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['coverage', 'purchaseOptions', 'benefitCoverage', 'sourceReferences'], ['benefitCount', 'utilizationPercent30Day', 'utilizationPercent7Day', 'expiredCount', 'expiring90DayCount', 'expiring180DayCount']) &&
        (0, valueValidation_js_1.isEnvironmentCoverageStateV1)(value.coverage) &&
        isSectionCount(value.benefitCount) &&
        (value.utilizationPercent30Day === undefined || isPercentage(value.utilizationPercent30Day)) &&
        (value.utilizationPercent7Day === undefined || isPercentage(value.utilizationPercent7Day)) &&
        isSectionCount(value.expiredCount) &&
        isSectionCount(value.expiring90DayCount) &&
        isSectionCount(value.expiring180DayCount) &&
        isSectionList(value.purchaseOptions, isCommitmentPurchaseOption) &&
        isSectionList(value.benefitCoverage, isCommitmentCoverageRow) &&
        isReferenceArray(value.sourceReferences);
    const isBudget = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['key', 'safeLabel'], ['period', 'amount', 'currentSpend', 'forecastSpend', 'consumedPercent']) &&
        isGeneralKey(value.key) &&
        (0, internal_js_1.isSafeLabel)(value.safeLabel) &&
        (value.period === undefined || (0, internal_js_1.isSafeLabel)(value.period)) &&
        (value.amount === undefined || isObservedMoney(value.amount)) &&
        (value.currentSpend === undefined || isObservedMoney(value.currentSpend)) &&
        (value.forecastSpend === undefined || isObservedMoney(value.forecastSpend)) &&
        (value.consumedPercent === undefined || (typeof value.consumedPercent === 'string' && internal_js_1.DECIMAL_PATTERN.test(value.consumedPercent)));
    const isBudgetSection = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['coverage', 'budgets', 'sourceReferences']) &&
        (0, valueValidation_js_1.isEnvironmentCoverageStateV1)(value.coverage) &&
        isSectionList(value.budgets, isBudget) &&
        isReferenceArray(value.sourceReferences);
    const isIdleResourceSection = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['coverage', 'recommendationCount', 'resourceCount', 'subjects', 'sourceReferences'], ['monthlyWaste']) &&
        (0, valueValidation_js_1.isEnvironmentCoverageStateV1)(value.coverage) &&
        (0, internal_js_1.isNonNegativeInteger)(value.recommendationCount) &&
        (0, internal_js_1.isNonNegativeInteger)(value.resourceCount) &&
        (value.monthlyWaste === undefined || isSavingsMoney(value.monthlyWaste)) &&
        isSectionList(value.subjects, isSubjectReference) &&
        isReferenceArray(value.sourceReferences);
    const isPublicIpExposureSection = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['coverage', 'totalCount', 'exposedSubjects', 'remediationOptions', 'sourceReferences'], ['assignedCount', 'unassignedCount', 'basicSkuCount', 'httpsExposedCount', 'rdpExposedCount', 'sshExposedCount']) &&
        (0, valueValidation_js_1.isEnvironmentCoverageStateV1)(value.coverage) &&
        (0, internal_js_1.isNonNegativeInteger)(value.totalCount) &&
        [value.assignedCount, value.unassignedCount, value.basicSkuCount, value.httpsExposedCount, value.rdpExposedCount, value.sshExposedCount].every(isSectionCount) &&
        isSectionList(value.exposedSubjects, isSubjectReference) &&
        isSectionList(value.remediationOptions, isLabeledCount) &&
        isReferenceArray(value.sourceReferences);
    const isSecretStoreCoverageSection = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['coverage', 'vaultCount', 'inspectedVaultCount', 'reasons', 'sourceReferences']) &&
        (0, valueValidation_js_1.isEnvironmentCoverageStateV1)(value.coverage) &&
        (0, internal_js_1.isNonNegativeInteger)(value.vaultCount) &&
        (0, internal_js_1.isNonNegativeInteger)(value.inspectedVaultCount) &&
        isSectionList(value.reasons, isLabeledCount) &&
        isReferenceArray(value.sourceReferences);
    const isTagCoverageSection = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, [
            'coverage',
            'resourceCount',
            'taggedResourceCount',
            'untaggedResourceCount',
            'distinctTagKeyCount',
            'topTagKeys',
            'sourceReferences',
        ]) &&
        (0, valueValidation_js_1.isEnvironmentCoverageStateV1)(value.coverage) &&
        (0, internal_js_1.isNonNegativeInteger)(value.resourceCount) &&
        (0, internal_js_1.isNonNegativeInteger)(value.taggedResourceCount) &&
        (0, internal_js_1.isNonNegativeInteger)(value.untaggedResourceCount) &&
        (0, internal_js_1.isNonNegativeInteger)(value.distinctTagKeyCount) &&
        value.taggedResourceCount + value.untaggedResourceCount === value.resourceCount &&
        isSectionList(value.topTagKeys, isLabeledCount) &&
        isReferenceArray(value.sourceReferences);
    const isChangeSignalSection = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['coverage', 'windowDays', 'changeCount', 'topOperations', 'sourceReferences'], ['materialChangeCount', 'securityRelevantCount']) &&
        (0, valueValidation_js_1.isEnvironmentCoverageStateV1)(value.coverage) &&
        (0, internal_js_1.isNonNegativeInteger)(value.windowDays) &&
        (0, internal_js_1.isNonNegativeInteger)(value.changeCount) &&
        isSectionCount(value.materialChangeCount) &&
        isSectionCount(value.securityRelevantCount) &&
        isSectionList(value.topOperations, isLabeledCount) &&
        isReferenceArray(value.sourceReferences);
    const isHealthEvent = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['key', 'safeLabel', 'severity'], ['eventType', 'startedAt']) &&
        isGeneralKey(value.key) &&
        (0, internal_js_1.isSafeLabel)(value.safeLabel) &&
        typeof value.severity === 'string' &&
        SEVERITIES.has(value.severity) &&
        (value.eventType === undefined || (0, internal_js_1.isSafeLabel)(value.eventType)) &&
        (value.startedAt === undefined || (0, internal_js_1.isCanonicalUtcTimestamp)(value.startedAt));
    const isHealthEventSection = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['coverage', 'totalCount', 'activeCount', 'resolvedCount', 'activeEvents', 'sourceReferences']) &&
        (0, valueValidation_js_1.isEnvironmentCoverageStateV1)(value.coverage) &&
        (0, internal_js_1.isNonNegativeInteger)(value.totalCount) &&
        (0, internal_js_1.isNonNegativeInteger)(value.activeCount) &&
        (0, internal_js_1.isNonNegativeInteger)(value.resolvedCount) &&
        isSectionList(value.activeEvents, isHealthEvent) &&
        isReferenceArray(value.sourceReferences);
    const isDataProtectionSection = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, [
            'coverage',
            'totalResourcesEvaluated',
            'protectedCount',
            'notProtectedCount',
            'unknownCount',
            'failedCount',
            'staleCount',
            'workloadCoverage',
            'findingCounts',
            'atRiskSubjects',
            'sourceReferences',
        ]) &&
        (0, valueValidation_js_1.isEnvironmentCoverageStateV1)(value.coverage) &&
        [value.totalResourcesEvaluated, value.protectedCount, value.notProtectedCount, value.unknownCount, value.failedCount, value.staleCount].every(internal_js_1.isNonNegativeInteger) &&
        isSectionList(value.workloadCoverage, isLabeledCount) &&
        isSectionList(value.findingCounts, isLabeledCount) &&
        isSectionList(value.atRiskSubjects, isSubjectReference) &&
        isReferenceArray(value.sourceReferences);
    const isSecureScoreSection = (value) => (0, internal_js_1.isRecord)(value) &&
        (0, internal_js_1.hasExactKeys)(value, ['coverage', 'value', 'maximum', 'sourceReferences'], ['previousValue', 'delta', 'currentScore', 'maxScore', 'assessedResourceCount']) &&
        (0, valueValidation_js_1.isEnvironmentCoverageStateV1)(value.coverage) &&
        typeof value.value === 'string' &&
        isPercentage(value.value) &&
        value.maximum === '100' &&
        (value.previousValue === undefined || (typeof value.previousValue === 'string' && isPercentage(value.previousValue))) &&
        (value.delta === undefined || (typeof value.delta === 'string' && SIGNED_DECIMAL_PATTERN.test(value.delta))) &&
        (value.currentScore === undefined || (typeof value.currentScore === 'string' && internal_js_1.DECIMAL_PATTERN.test(value.currentScore))) &&
        (value.maxScore === undefined || (typeof value.maxScore === 'string' && internal_js_1.DECIMAL_PATTERN.test(value.maxScore))) &&
        isSectionCount(value.assessedResourceCount) &&
        isReferenceArray(value.sourceReferences);
    return (value) => isEstateSummary(value.estateSummary) &&
        isCostSummary(value.costSummary) &&
        isBoundedList(value.serviceFamilyRollups, isCostRollup) &&
        isBoundedList(value.estateCostRollups, isCostRollup) &&
        isBoundedList(value.costDrivers, isCostDriver) &&
        isPillarSummaries(value.pillars) &&
        isBoundedList(value.findings, isFinding) &&
        isBoundedList(value.recommendations, isRecommendation) &&
        isBoundedList(value.changes, isChange) &&
        isBoundedList(value.warnings, isWarning) &&
        (value.commitments === undefined || isCommitmentsSection(value.commitments)) &&
        (value.budgets === undefined || isBudgetSection(value.budgets)) &&
        (value.idleResources === undefined || isIdleResourceSection(value.idleResources)) &&
        (value.publicIpExposure === undefined || isPublicIpExposureSection(value.publicIpExposure)) &&
        (value.secretStoreCoverage === undefined || isSecretStoreCoverageSection(value.secretStoreCoverage)) &&
        (value.tagCoverage === undefined || isTagCoverageSection(value.tagCoverage)) &&
        (value.changeSignals === undefined || isChangeSignalSection(value.changeSignals)) &&
        (value.healthEvents === undefined || isHealthEventSection(value.healthEvents)) &&
        (value.dataProtection === undefined || isDataProtectionSection(value.dataProtection)) &&
        (value.secureScore === undefined || isSecureScoreSection(value.secureScore)) &&
        isReferenceArray(value.sourceReferences);
};
exports.createEnvironmentProjectionContentValidatorV1 = createEnvironmentProjectionContentValidatorV1;
//# sourceMappingURL=projectionValidation.js.map