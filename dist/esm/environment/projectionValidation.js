import { ENVIRONMENT_CONTRACT_LIMITS_V1, ENVIRONMENT_EFFORTS_V1, ENVIRONMENT_FINDING_KINDS_V1, ENVIRONMENT_IMPACTS_V1, ENVIRONMENT_PILLARS_V1, ENVIRONMENT_SEVERITIES_V1, } from './contracts.js';
import { DECIMAL_PATTERN, hasExactKeys, isBoundedString, isCanonicalUtcTimestamp, isCustomerString, isNonNegativeInteger, isRecord, isSafeLabel, isScopeIdentifier, } from './internal.js';
import { isEnvironmentCardinalityV1, isEnvironmentCoverageStateV1, isEnvironmentPillarV1 } from './valueValidation.js';
const SIGNED_DECIMAL_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/u;
const FINDING_KINDS = new Set(ENVIRONMENT_FINDING_KINDS_V1);
const SEVERITIES = new Set(ENVIRONMENT_SEVERITIES_V1);
const IMPACTS = new Set(ENVIRONMENT_IMPACTS_V1);
const EFFORTS = new Set(ENVIRONMENT_EFFORTS_V1);
const CHANGE_DIRECTIONS = new Set(['increase', 'decrease', 'unchanged', 'unknown']);
const isGeneralKey = (value) => isBoundedString(value, ENVIRONMENT_CONTRACT_LIMITS_V1.safeLabelScalars, { trimmed: true, controls: true });
const isPercentage = (value) => typeof value === 'string' && DECIMAL_PATTERN.test(value) && Number(value) <= 100;
/** @internal Exact content keys shared by the provider-specific envelope guards. */
export const ENVIRONMENT_PROJECTION_CONTENT_REQUIRED_KEYS_V1 = [
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
export const ENVIRONMENT_PROJECTION_CONTENT_OPTIONAL_KEYS_V1 = [
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
export const createEnvironmentProjectionContentValidatorV1 = (policy) => {
    const isEnvironmentLogicalEvidenceReferenceV1 = policy.isEvidenceReference;
    const isEnvironmentLogicalResourceReferenceV1 = policy.isResourceReference;
    const isEnvironmentPortalRouteV1 = policy.isPortalRoute;
    const isObservedMoney = (value) => policy.isMoneyValue(value) && value.savingsAdditivity === undefined && value.savingsBasis === undefined;
    const isSavingsMoney = (value) => policy.isMoneyValue(value) && value.savingsAdditivity !== undefined && value.spendSource === undefined && value.composition === undefined;
    const isReferenceArray = (value) => Array.isArray(value) &&
        value.length <= ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems &&
        value.every(isEnvironmentLogicalEvidenceReferenceV1) &&
        new Set(value).size === value.length;
    const isResourceReferenceArray = (value) => Array.isArray(value) &&
        value.length <= ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems &&
        value.every(isEnvironmentLogicalResourceReferenceV1) &&
        new Set(value).size === value.length;
    const isBoundedList = (value, itemValidator) => {
        if (!isRecord(value) || !hasExactKeys(value, ['items', 'totalCount', 'includedCount', 'truncated'], ['continuationReference']))
            return false;
        if (!Array.isArray(value.items) || value.items.length > ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems || !value.items.every(itemValidator))
            return false;
        if (!isNonNegativeInteger(value.totalCount) || !isNonNegativeInteger(value.includedCount))
            return false;
        if (value.includedCount !== value.items.length || value.totalCount < value.includedCount || typeof value.truncated !== 'boolean')
            return false;
        if (value.truncated !== value.totalCount > value.includedCount)
            return false;
        if (value.continuationReference !== undefined && !isEnvironmentLogicalEvidenceReferenceV1(value.continuationReference))
            return false;
        return !value.truncated || value.continuationReference !== undefined;
    };
    const isCostRollup = (value) => isRecord(value) &&
        hasExactKeys(value, ['key', 'safeLabel', 'resourceCount', 'sourceReferences'], ['observedCost', 'potentialSavings']) &&
        isGeneralKey(value.key) &&
        isSafeLabel(value.safeLabel) &&
        isNonNegativeInteger(value.resourceCount) &&
        (value.observedCost === undefined || isObservedMoney(value.observedCost)) &&
        (value.potentialSavings === undefined || isSavingsMoney(value.potentialSavings)) &&
        isReferenceArray(value.sourceReferences);
    const isCostDriver = (value) => isRecord(value) &&
        hasExactKeys(value, ['key', 'safeLabel', 'sourceReferences'], ['description', 'observedCost', 'portalRoute', 'resourceReference']) &&
        isGeneralKey(value.key) &&
        isSafeLabel(value.safeLabel) &&
        (value.description === undefined || isCustomerString(value.description)) &&
        (value.observedCost === undefined || isObservedMoney(value.observedCost)) &&
        (value.portalRoute === undefined || isEnvironmentPortalRouteV1(value.portalRoute)) &&
        (value.resourceReference === undefined || isEnvironmentLogicalResourceReferenceV1(value.resourceReference)) &&
        isReferenceArray(value.sourceReferences);
    const isPillarScore = (value) => isRecord(value) &&
        hasExactKeys(value, ['value', 'maximum', 'safeLabel']) &&
        isPercentage(value.value) &&
        value.maximum === '100' &&
        isSafeLabel(value.safeLabel);
    const isPillarSummary = (value) => isRecord(value) &&
        hasExactKeys(value, ['pillar', 'coverage', 'findingCount', 'recommendationCount', 'affectedResources', 'portalRoute', 'sourceReferences'], ['score']) &&
        isEnvironmentPillarV1(value.pillar) &&
        isEnvironmentCoverageStateV1(value.coverage) &&
        isNonNegativeInteger(value.findingCount) &&
        isNonNegativeInteger(value.recommendationCount) &&
        isEnvironmentCardinalityV1(value.affectedResources) &&
        isEnvironmentPortalRouteV1(value.portalRoute) &&
        (value.score === undefined || isPillarScore(value.score)) &&
        isReferenceArray(value.sourceReferences);
    const isPillarSummaries = (value) => isRecord(value) &&
        hasExactKeys(value, ENVIRONMENT_PILLARS_V1) &&
        ENVIRONMENT_PILLARS_V1.every(pillar => isPillarSummary(value[pillar]) && value[pillar]?.pillar === pillar);
    const isFinding = (value) => isRecord(value) &&
        hasExactKeys(value, ['findingId', 'pillar', 'kind', 'safeLabel', 'severity', 'resourceReferences', 'sourceReferences'], ['description', 'impact', 'effort', 'affectedResources', 'portalRoute']) &&
        isScopeIdentifier(value.findingId) &&
        isEnvironmentPillarV1(value.pillar) &&
        typeof value.kind === 'string' &&
        FINDING_KINDS.has(value.kind) &&
        isSafeLabel(value.safeLabel) &&
        typeof value.severity === 'string' &&
        SEVERITIES.has(value.severity) &&
        (value.description === undefined || isCustomerString(value.description)) &&
        (value.impact === undefined || (typeof value.impact === 'string' && IMPACTS.has(value.impact))) &&
        (value.effort === undefined || (typeof value.effort === 'string' && EFFORTS.has(value.effort))) &&
        (value.affectedResources === undefined || isEnvironmentCardinalityV1(value.affectedResources)) &&
        (value.portalRoute === undefined || isEnvironmentPortalRouteV1(value.portalRoute)) &&
        isResourceReferenceArray(value.resourceReferences) &&
        isReferenceArray(value.sourceReferences);
    const isRecommendation = (value) => isRecord(value) &&
        hasExactKeys(value, ['recommendationId', 'pillar', 'safeLabel', 'technicalName', 'affectedResourceTypes', 'portalRoute', 'resourceReferences', 'sourceReferences'], ['description', 'impact', 'effort', 'affectedResources', 'potentialSavings']) &&
        isScopeIdentifier(value.recommendationId) &&
        isEnvironmentPillarV1(value.pillar) &&
        isSafeLabel(value.safeLabel) &&
        isSafeLabel(value.technicalName) &&
        policy.isResourceTypeArray(value.affectedResourceTypes) &&
        isEnvironmentPortalRouteV1(value.portalRoute) &&
        (value.description === undefined || isCustomerString(value.description)) &&
        (value.impact === undefined || (typeof value.impact === 'string' && IMPACTS.has(value.impact))) &&
        (value.effort === undefined || (typeof value.effort === 'string' && EFFORTS.has(value.effort))) &&
        (value.affectedResources === undefined || isEnvironmentCardinalityV1(value.affectedResources)) &&
        (value.potentialSavings === undefined || isSavingsMoney(value.potentialSavings)) &&
        isResourceReferenceArray(value.resourceReferences) &&
        policy.resourceTypesMatchReferences(value.affectedResourceTypes, value.resourceReferences) &&
        isReferenceArray(value.sourceReferences);
    const isChange = (value) => isRecord(value) &&
        hasExactKeys(value, ['key', 'pillars', 'safeLabel', 'description', 'direction', 'sourceReferences'], ['amount']) &&
        isGeneralKey(value.key) &&
        Array.isArray(value.pillars) &&
        value.pillars.length > 0 &&
        value.pillars.length <= ENVIRONMENT_PILLARS_V1.length &&
        value.pillars.every(isEnvironmentPillarV1) &&
        new Set(value.pillars).size === value.pillars.length &&
        isSafeLabel(value.safeLabel) &&
        isCustomerString(value.description) &&
        typeof value.direction === 'string' &&
        CHANGE_DIRECTIONS.has(value.direction) &&
        (value.amount === undefined || isObservedMoney(value.amount)) &&
        isReferenceArray(value.sourceReferences);
    const isWarning = (value) => isRecord(value) &&
        hasExactKeys(value, ['code', 'safeLabel', 'sourceReferences'], ['pillar', 'detail']) &&
        isGeneralKey(value.code) &&
        isSafeLabel(value.safeLabel) &&
        (value.pillar === undefined || isEnvironmentPillarV1(value.pillar)) &&
        (value.detail === undefined || isCustomerString(value.detail)) &&
        isReferenceArray(value.sourceReferences);
    const isEstateSummary = (value) => isRecord(value) &&
        hasExactKeys(value, ['resourceCount', 'serviceFamilyCount', 'locationCount']) &&
        isNonNegativeInteger(value.resourceCount) &&
        isNonNegativeInteger(value.serviceFamilyCount) &&
        isNonNegativeInteger(value.locationCount);
    const isCostSummary = (value) => isRecord(value) &&
        hasExactKeys(value, [], ['observedCost', 'potentialSavings', 'costRecommendationCount']) &&
        (value.observedCost === undefined || isObservedMoney(value.observedCost)) &&
        (value.potentialSavings === undefined || isSavingsMoney(value.potentialSavings)) &&
        (value.costRecommendationCount === undefined || isNonNegativeInteger(value.costRecommendationCount));
    const SECTION_ITEMS = ENVIRONMENT_CONTRACT_LIMITS_V1.sectionListItems;
    const isSectionList = (value, itemValidator) => isBoundedList(value, itemValidator) && value.items.length <= SECTION_ITEMS;
    const isSectionCount = (value) => value === undefined || isNonNegativeInteger(value);
    const isLabeledCount = (value) => isRecord(value) &&
        hasExactKeys(value, ['key', 'safeLabel', 'count']) &&
        isGeneralKey(value.key) &&
        isSafeLabel(value.safeLabel) &&
        isNonNegativeInteger(value.count);
    const isSubjectReference = (value) => isRecord(value) &&
        hasExactKeys(value, ['key', 'safeLabel'], ['detail', 'resourceReference']) &&
        isGeneralKey(value.key) &&
        isSafeLabel(value.safeLabel) &&
        (value.detail === undefined || isCustomerString(value.detail)) &&
        (value.resourceReference === undefined || isEnvironmentLogicalResourceReferenceV1(value.resourceReference));
    const isCommitmentPurchaseOption = (value) => isRecord(value) &&
        hasExactKeys(value, ['key', 'safeLabel'], ['termMonths', 'estimatedMonthlySavings']) &&
        isGeneralKey(value.key) &&
        isSafeLabel(value.safeLabel) &&
        isSectionCount(value.termMonths) &&
        (value.estimatedMonthlySavings === undefined || isSavingsMoney(value.estimatedMonthlySavings));
    const isCommitmentCoverageRow = (value) => isRecord(value) &&
        hasExactKeys(value, ['key', 'safeLabel', 'benefitLabels'], ['detail', 'resourceReference']) &&
        isGeneralKey(value.key) &&
        isSafeLabel(value.safeLabel) &&
        Array.isArray(value.benefitLabels) &&
        value.benefitLabels.length <= SECTION_ITEMS &&
        value.benefitLabels.every(isSafeLabel) &&
        (value.detail === undefined || isCustomerString(value.detail)) &&
        (value.resourceReference === undefined || isEnvironmentLogicalResourceReferenceV1(value.resourceReference));
    const isCommitmentsSection = (value) => isRecord(value) &&
        hasExactKeys(value, ['coverage', 'purchaseOptions', 'benefitCoverage', 'sourceReferences'], ['benefitCount', 'utilizationPercent30Day', 'utilizationPercent7Day', 'expiredCount', 'expiring90DayCount', 'expiring180DayCount']) &&
        isEnvironmentCoverageStateV1(value.coverage) &&
        isSectionCount(value.benefitCount) &&
        (value.utilizationPercent30Day === undefined || isPercentage(value.utilizationPercent30Day)) &&
        (value.utilizationPercent7Day === undefined || isPercentage(value.utilizationPercent7Day)) &&
        isSectionCount(value.expiredCount) &&
        isSectionCount(value.expiring90DayCount) &&
        isSectionCount(value.expiring180DayCount) &&
        isSectionList(value.purchaseOptions, isCommitmentPurchaseOption) &&
        isSectionList(value.benefitCoverage, isCommitmentCoverageRow) &&
        isReferenceArray(value.sourceReferences);
    const isBudget = (value) => isRecord(value) &&
        hasExactKeys(value, ['key', 'safeLabel'], ['period', 'amount', 'currentSpend', 'forecastSpend', 'consumedPercent']) &&
        isGeneralKey(value.key) &&
        isSafeLabel(value.safeLabel) &&
        (value.period === undefined || isSafeLabel(value.period)) &&
        (value.amount === undefined || isObservedMoney(value.amount)) &&
        (value.currentSpend === undefined || isObservedMoney(value.currentSpend)) &&
        (value.forecastSpend === undefined || isObservedMoney(value.forecastSpend)) &&
        (value.consumedPercent === undefined || (typeof value.consumedPercent === 'string' && DECIMAL_PATTERN.test(value.consumedPercent)));
    const isBudgetSection = (value) => isRecord(value) &&
        hasExactKeys(value, ['coverage', 'budgets', 'sourceReferences']) &&
        isEnvironmentCoverageStateV1(value.coverage) &&
        isSectionList(value.budgets, isBudget) &&
        isReferenceArray(value.sourceReferences);
    const isIdleResourceSection = (value) => isRecord(value) &&
        hasExactKeys(value, ['coverage', 'recommendationCount', 'resourceCount', 'subjects', 'sourceReferences'], ['monthlyWaste']) &&
        isEnvironmentCoverageStateV1(value.coverage) &&
        isNonNegativeInteger(value.recommendationCount) &&
        isNonNegativeInteger(value.resourceCount) &&
        (value.monthlyWaste === undefined || isSavingsMoney(value.monthlyWaste)) &&
        isSectionList(value.subjects, isSubjectReference) &&
        isReferenceArray(value.sourceReferences);
    const isPublicIpExposureSection = (value) => isRecord(value) &&
        hasExactKeys(value, ['coverage', 'totalCount', 'exposedSubjects', 'remediationOptions', 'sourceReferences'], ['assignedCount', 'unassignedCount', 'basicSkuCount', 'httpsExposedCount', 'rdpExposedCount', 'sshExposedCount']) &&
        isEnvironmentCoverageStateV1(value.coverage) &&
        isNonNegativeInteger(value.totalCount) &&
        [value.assignedCount, value.unassignedCount, value.basicSkuCount, value.httpsExposedCount, value.rdpExposedCount, value.sshExposedCount].every(isSectionCount) &&
        isSectionList(value.exposedSubjects, isSubjectReference) &&
        isSectionList(value.remediationOptions, isLabeledCount) &&
        isReferenceArray(value.sourceReferences);
    const isSecretStoreCoverageSection = (value) => isRecord(value) &&
        hasExactKeys(value, ['coverage', 'vaultCount', 'inspectedVaultCount', 'reasons', 'sourceReferences']) &&
        isEnvironmentCoverageStateV1(value.coverage) &&
        isNonNegativeInteger(value.vaultCount) &&
        isNonNegativeInteger(value.inspectedVaultCount) &&
        isSectionList(value.reasons, isLabeledCount) &&
        isReferenceArray(value.sourceReferences);
    const isTagCoverageSection = (value) => isRecord(value) &&
        hasExactKeys(value, [
            'coverage',
            'resourceCount',
            'taggedResourceCount',
            'untaggedResourceCount',
            'distinctTagKeyCount',
            'topTagKeys',
            'sourceReferences',
        ]) &&
        isEnvironmentCoverageStateV1(value.coverage) &&
        isNonNegativeInteger(value.resourceCount) &&
        isNonNegativeInteger(value.taggedResourceCount) &&
        isNonNegativeInteger(value.untaggedResourceCount) &&
        isNonNegativeInteger(value.distinctTagKeyCount) &&
        value.taggedResourceCount + value.untaggedResourceCount === value.resourceCount &&
        isSectionList(value.topTagKeys, isLabeledCount) &&
        isReferenceArray(value.sourceReferences);
    const isChangeSignalSection = (value) => isRecord(value) &&
        hasExactKeys(value, ['coverage', 'windowDays', 'changeCount', 'topOperations', 'sourceReferences'], ['materialChangeCount', 'securityRelevantCount']) &&
        isEnvironmentCoverageStateV1(value.coverage) &&
        isNonNegativeInteger(value.windowDays) &&
        isNonNegativeInteger(value.changeCount) &&
        isSectionCount(value.materialChangeCount) &&
        isSectionCount(value.securityRelevantCount) &&
        isSectionList(value.topOperations, isLabeledCount) &&
        isReferenceArray(value.sourceReferences);
    const isHealthEvent = (value) => isRecord(value) &&
        hasExactKeys(value, ['key', 'safeLabel', 'severity'], ['eventType', 'startedAt']) &&
        isGeneralKey(value.key) &&
        isSafeLabel(value.safeLabel) &&
        typeof value.severity === 'string' &&
        SEVERITIES.has(value.severity) &&
        (value.eventType === undefined || isSafeLabel(value.eventType)) &&
        (value.startedAt === undefined || isCanonicalUtcTimestamp(value.startedAt));
    const isHealthEventSection = (value) => isRecord(value) &&
        hasExactKeys(value, ['coverage', 'totalCount', 'activeCount', 'resolvedCount', 'activeEvents', 'sourceReferences']) &&
        isEnvironmentCoverageStateV1(value.coverage) &&
        isNonNegativeInteger(value.totalCount) &&
        isNonNegativeInteger(value.activeCount) &&
        isNonNegativeInteger(value.resolvedCount) &&
        isSectionList(value.activeEvents, isHealthEvent) &&
        isReferenceArray(value.sourceReferences);
    const isDataProtectionSection = (value) => isRecord(value) &&
        hasExactKeys(value, [
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
        isEnvironmentCoverageStateV1(value.coverage) &&
        [value.totalResourcesEvaluated, value.protectedCount, value.notProtectedCount, value.unknownCount, value.failedCount, value.staleCount].every(isNonNegativeInteger) &&
        isSectionList(value.workloadCoverage, isLabeledCount) &&
        isSectionList(value.findingCounts, isLabeledCount) &&
        isSectionList(value.atRiskSubjects, isSubjectReference) &&
        isReferenceArray(value.sourceReferences);
    const isSecureScoreSection = (value) => isRecord(value) &&
        hasExactKeys(value, ['coverage', 'value', 'maximum', 'sourceReferences'], ['previousValue', 'delta', 'currentScore', 'maxScore', 'assessedResourceCount']) &&
        isEnvironmentCoverageStateV1(value.coverage) &&
        typeof value.value === 'string' &&
        isPercentage(value.value) &&
        value.maximum === '100' &&
        (value.previousValue === undefined || (typeof value.previousValue === 'string' && isPercentage(value.previousValue))) &&
        (value.delta === undefined || (typeof value.delta === 'string' && SIGNED_DECIMAL_PATTERN.test(value.delta))) &&
        (value.currentScore === undefined || (typeof value.currentScore === 'string' && DECIMAL_PATTERN.test(value.currentScore))) &&
        (value.maxScore === undefined || (typeof value.maxScore === 'string' && DECIMAL_PATTERN.test(value.maxScore))) &&
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
