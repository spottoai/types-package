import { ENVIRONMENT_ARTIFACT_KINDS_V1, ENVIRONMENT_CONTRACT_LIMITS_V1, ENVIRONMENT_DOCUMENT_NAMES_V1, ENVIRONMENT_EFFORTS_V1, ENVIRONMENT_FINDING_KINDS_V1, ENVIRONMENT_IMPACTS_V1, ENVIRONMENT_PILLARS_V1, ENVIRONMENT_SEVERITIES_V1, } from './contracts.js';
import { CURRENCY_PATTERN, DECIMAL_PATTERN, ENVIRONMENT_RUN_ID_PATTERN, SHA256_PATTERN, hasExactKeys, hasSafeContainerShape, isBoundedString, isCanonicalUtcTimestamp, isCustomerString, isNonNegativeInteger, isRecord, isSafeLabel, isScopeIdentifier, isSourceIdentity, utf8ByteLength, } from './internal.js';
import { deriveEnvironmentAzureResourceTypeV1, isEnvironmentLogicalEvidenceReferenceV1, isEnvironmentLogicalResourceReferenceV1, parseEnvironmentLogicalResourceReferenceV1, } from './references.js';
const DOCUMENT_NAMES = new Set(ENVIRONMENT_DOCUMENT_NAMES_V1);
const SIGNED_DECIMAL_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/u;
const ARTIFACT_KINDS = new Set(ENVIRONMENT_ARTIFACT_KINDS_V1);
const PILLARS = new Set(ENVIRONMENT_PILLARS_V1);
const FINDING_KINDS = new Set(ENVIRONMENT_FINDING_KINDS_V1);
const SEVERITIES = new Set(ENVIRONMENT_SEVERITIES_V1);
const IMPACTS = new Set(ENVIRONMENT_IMPACTS_V1);
const EFFORTS = new Set(ENVIRONMENT_EFFORTS_V1);
const MONEY_BASES = new Set(['billed', 'amortized', 'unknown']);
const MONEY_PROVENANCE = new Set([
    'subscription-summary',
    'subscription-resources',
    'cost-savings-summary',
    'savings-aggregate',
    'recommendation',
]);
const SAVINGS_ADDITIVITY = new Set(['additive', 'scenario-non-additive']);
const SPEND_SOURCES = new Set(['billing', 'estimated', 'blended']);
const SPEND_SOURCE_CONFIDENCES = new Set(['high', 'medium', 'low', 'unknown']);
const SAVINGS_PROJECTIONS = new Set(['projected-monthly', 'observed-period', 'unknown']);
const DATE_WINDOW_PATTERN = /^\d{4}-\d{2}-\d{2}\/\d{4}-\d{2}-\d{2}$/u;
const CHANGE_DIRECTIONS = new Set(['increase', 'decrease', 'unchanged', 'unknown']);
const scopesEqual = (left, right) => left.kind === right.kind && left.tenantId === right.tenantId && left.companyId === right.companyId && left.subscriptionId === right.subscriptionId;
/** Validates a bounded, local Portal route suitable for client-visible evidence. */
export const isEnvironmentPortalRouteV1 = (value) => isBoundedString(value, ENVIRONMENT_CONTRACT_LIMITS_V1.customerStringScalars, { trimmed: true, controls: true }) &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\') &&
    !value.includes('://') &&
    !value.includes('?') &&
    !value.includes('#') &&
    !value.includes('%') &&
    value.split('/').every(segment => segment !== '.' && segment !== '..');
const isGeneralKey = (value) => isBoundedString(value, ENVIRONMENT_CONTRACT_LIMITS_V1.safeLabelScalars, { trimmed: true, controls: true });
const isReferenceArray = (value) => Array.isArray(value) &&
    value.length <= ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems &&
    value.every(isEnvironmentLogicalEvidenceReferenceV1) &&
    new Set(value).size === value.length;
const isResourceReferenceArray = (value) => Array.isArray(value) &&
    value.length <= ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems &&
    value.every(isEnvironmentLogicalResourceReferenceV1) &&
    new Set(value).size === value.length;
const AZURE_RESOURCE_TYPE_PATTERN = /^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*(?:\/[a-z0-9][a-z0-9._-]*)*$/u;
const isAzureResourceTypeArray = (value) => Array.isArray(value) &&
    value.length <= ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems &&
    value.every(item => isBoundedString(item, ENVIRONMENT_CONTRACT_LIMITS_V1.safeLabelScalars, { trimmed: true, controls: true }) &&
        AZURE_RESOURCE_TYPE_PATTERN.test(item)) &&
    new Set(value).size === value.length &&
    value.every((item, index) => index === 0 || value[index - 1] < item);
const resourceTypesMatchReferences = (resourceTypes, resourceReferences) => {
    const derivedTypes = Array.from(new Set(resourceReferences.flatMap(reference => {
        const parsed = parseEnvironmentLogicalResourceReferenceV1(reference);
        if (parsed === null)
            return [];
        const resourceType = deriveEnvironmentAzureResourceTypeV1(parsed.resourceId);
        return resourceType === null ? [] : [resourceType];
    }))).sort();
    return derivedTypes.length === resourceTypes.length && derivedTypes.every((resourceType, index) => resourceTypes[index] === resourceType);
};
const isPercentage = (value) => typeof value === 'string' && DECIMAL_PATTERN.test(value) && Number(value) <= 100;
/** Validates one admitted environment pillar. */
export const isEnvironmentPillarV1 = (value) => typeof value === 'string' && PILLARS.has(value);
/** Validates the closed phase-one Azure subscription scope. */
export const isEnvironmentScopeV1 = (value) => isRecord(value) &&
    hasExactKeys(value, ['kind', 'tenantId', 'companyId', 'subscriptionId']) &&
    value.kind === 'azure-subscription' &&
    isScopeIdentifier(value.tenantId) &&
    isScopeIdentifier(value.companyId) &&
    isScopeIdentifier(value.subscriptionId);
/** Validates the client-safe identity of one authoritative source generation. */
export const isEnvironmentSourceGenerationV1 = (value) => isRecord(value) &&
    hasExactKeys(value, [
        'viewSetSchemaVersion',
        'publicationId',
        'portalRunId',
        'pluginRunId',
        'economicsGenerationId',
        'economicsFingerprint',
        'completedAt',
    ]) &&
    value.viewSetSchemaVersion === 1 &&
    isSourceIdentity(value.publicationId) &&
    isSourceIdentity(value.portalRunId) &&
    isSourceIdentity(value.pluginRunId) &&
    isSourceIdentity(value.economicsGenerationId) &&
    isSourceIdentity(value.economicsFingerprint) &&
    isCanonicalUtcTimestamp(value.completedAt);
/** Validates a byte-preserving binding to an authoritative CompletedAzureViewSetV1. */
export const isEnvironmentSourceBindingV1 = (value) => isRecord(value) &&
    hasExactKeys(value, [
        'kind',
        'viewSetSchemaVersion',
        'scope',
        'publicationId',
        'portalRunId',
        'pluginRunId',
        'economicsGenerationId',
        'economicsFingerprint',
        'completedAt',
    ]) &&
    value.kind === 'azure-subscription-view-set' &&
    value.viewSetSchemaVersion === 1 &&
    isEnvironmentScopeV1(value.scope) &&
    isEnvironmentSourceGenerationV1({
        viewSetSchemaVersion: value.viewSetSchemaVersion,
        publicationId: value.publicationId,
        portalRunId: value.portalRunId,
        pluginRunId: value.pluginRunId,
        economicsGenerationId: value.economicsGenerationId,
        economicsFingerprint: value.economicsFingerprint,
        completedAt: value.completedAt,
    });
/** Validates a storage-safe environment run identity independently from source identities. */
export const isEnvironmentRunIdV1 = (value) => typeof value === 'string' &&
    value.length > 0 &&
    value.length <= ENVIRONMENT_CONTRACT_LIMITS_V1.environmentRunIdAsciiCharacters &&
    value !== '.' &&
    value !== '..' &&
    ENVIRONMENT_RUN_ID_PATTERN.test(value);
const isMoneyComposition = (value, currencyCode) => isRecord(value) &&
    hasExactKeys(value, ['billingBacked', 'estimated', 'minorUnitScale', 'currencyCode']) &&
    isNonNegativeInteger(value.billingBacked) &&
    isNonNegativeInteger(value.estimated) &&
    isNonNegativeInteger(value.minorUnitScale) &&
    value.minorUnitScale <= 6 &&
    typeof value.currencyCode === 'string' &&
    (value.currencyCode === 'unknown' || CURRENCY_PATTERN.test(value.currencyCode)) &&
    value.currencyCode === currencyCode;
/** Validates the producer projection rule and window behind a savings amount. */
export const isEnvironmentSavingsBasisV1 = (value) => isRecord(value) &&
    hasExactKeys(value, ['projection'], ['observedPeriod', 'stableWindow', 'containsLegacySavings']) &&
    typeof value.projection === 'string' &&
    SAVINGS_PROJECTIONS.has(value.projection) &&
    (value.observedPeriod === undefined || isSafeLabel(value.observedPeriod)) &&
    (value.stableWindow === undefined || (typeof value.stableWindow === 'string' && DATE_WINDOW_PATTERN.test(value.stableWindow))) &&
    (value.containsLegacySavings === undefined || typeof value.containsLegacySavings === 'boolean');
/** Validates canonical decimal money with explicit currency, basis, period, and provenance. */
export const isEnvironmentMoneyValueV1 = (value) => isRecord(value) &&
    hasExactKeys(value, ['amount', 'currencyCode', 'basis', 'period', 'provenance'], ['savingsAdditivity', 'spendSource', 'spendSourceConfidence', 'composition', 'savingsBasis']) &&
    (value.spendSource === undefined || (typeof value.spendSource === 'string' && SPEND_SOURCES.has(value.spendSource))) &&
    (value.spendSourceConfidence === undefined ||
        (typeof value.spendSourceConfidence === 'string' && SPEND_SOURCE_CONFIDENCES.has(value.spendSourceConfidence))) &&
    (value.composition === undefined || isMoneyComposition(value.composition, value.currencyCode)) &&
    (value.savingsBasis === undefined || isEnvironmentSavingsBasisV1(value.savingsBasis)) &&
    typeof value.amount === 'string' &&
    DECIMAL_PATTERN.test(value.amount) &&
    typeof value.currencyCode === 'string' &&
    (value.currencyCode === 'unknown' || CURRENCY_PATTERN.test(value.currencyCode)) &&
    typeof value.basis === 'string' &&
    MONEY_BASES.has(value.basis) &&
    isBoundedString(value.period, ENVIRONMENT_CONTRACT_LIMITS_V1.safeLabelScalars, { trimmed: true, controls: true }) &&
    typeof value.provenance === 'string' &&
    MONEY_PROVENANCE.has(value.provenance) &&
    (value.savingsAdditivity === undefined || (typeof value.savingsAdditivity === 'string' && SAVINGS_ADDITIVITY.has(value.savingsAdditivity)));
const isObservedMoney = (value) => isEnvironmentMoneyValueV1(value) && value.savingsAdditivity === undefined && value.savingsBasis === undefined;
const isSavingsMoney = (value) => isEnvironmentMoneyValueV1(value) && value.savingsAdditivity !== undefined && value.spendSource === undefined && value.composition === undefined;
/** Validates the closed coverage-state union and state-specific freshness rules. */
export const isEnvironmentCoverageStateV1 = (value) => {
    if (!isRecord(value) || typeof value.status !== 'string')
        return false;
    const hasValidFreshness = (value.observedAt === undefined || isCanonicalUtcTimestamp(value.observedAt)) &&
        (value.completeThrough === undefined || isCanonicalUtcTimestamp(value.completeThrough)) &&
        (value.observedAt === undefined ||
            value.completeThrough === undefined ||
            Date.parse(value.completeThrough) <= Date.parse(value.observedAt));
    if (value.status === 'complete') {
        return hasExactKeys(value, ['status'], ['observedAt', 'completeThrough']) && hasValidFreshness;
    }
    if (value.status === 'partial') {
        return (hasExactKeys(value, ['status', 'reason'], ['observedAt', 'completeThrough']) &&
            isCustomerString(value.reason) &&
            value.reason.length > 0 &&
            hasValidFreshness);
    }
    if (value.status === 'stale') {
        return (hasExactKeys(value, ['status', 'reason', 'observedAt'], ['completeThrough']) &&
            isCustomerString(value.reason) &&
            value.reason.length > 0 &&
            hasValidFreshness);
    }
    if (value.status === 'unavailable' || value.status === 'not-collected') {
        return hasExactKeys(value, ['status', 'reason']) && isCustomerString(value.reason) && value.reason.length > 0;
    }
    return false;
};
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
/** Validates exact, lower-bound, and unavailable count evidence without ambiguous totals. */
export const isEnvironmentCardinalityV1 = (value) => {
    if (!isRecord(value) || typeof value.basis !== 'string')
        return false;
    if (value.basis === 'exact') {
        return hasExactKeys(value, ['basis', 'value']) && isNonNegativeInteger(value.value);
    }
    if (value.basis === 'lower-bound') {
        return hasExactKeys(value, ['basis', 'value', 'reason']) && isNonNegativeInteger(value.value) && isSafeLabel(value.reason);
    }
    if (value.basis === 'unavailable') {
        return hasExactKeys(value, ['basis', 'reason']) && isSafeLabel(value.reason);
    }
    return false;
};
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
    isAzureResourceTypeArray(value.affectedResourceTypes) &&
    isEnvironmentPortalRouteV1(value.portalRoute) &&
    (value.description === undefined || isCustomerString(value.description)) &&
    (value.impact === undefined || (typeof value.impact === 'string' && IMPACTS.has(value.impact))) &&
    (value.effort === undefined || (typeof value.effort === 'string' && EFFORTS.has(value.effort))) &&
    (value.affectedResources === undefined || isEnvironmentCardinalityV1(value.affectedResources)) &&
    (value.potentialSavings === undefined || isSavingsMoney(value.potentialSavings)) &&
    isResourceReferenceArray(value.resourceReferences) &&
    resourceTypesMatchReferences(value.affectedResourceTypes, value.resourceReferences) &&
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
const isSourceCoverage = (value) => isRecord(value) &&
    hasExactKeys(value, [
        'completedViewSet',
        'subscriptionSummary',
        'resources',
        'recommendations',
        'serviceRetirements',
        'monitorAlerts',
        'pluginMetrics',
    ]) &&
    Object.values(value).every(isEnvironmentCoverageStateV1);
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
/** Validates the strict, bounded multi-pillar subscription environment projection. */
export const isEnvironmentSubscriptionProjectionV1 = (value) => {
    if (!hasSafeContainerShape(value) || !isRecord(value))
        return false;
    if (!hasExactKeys(value, [
        'schemaVersion',
        'scope',
        'sourceBinding',
        'generatedAt',
        'subscription',
        'sourceCoverage',
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
    ], [
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
    ]) ||
        value.schemaVersion !== 1 ||
        !isEnvironmentScopeV1(value.scope) ||
        !isEnvironmentSourceBindingV1(value.sourceBinding) ||
        !scopesEqual(value.scope, value.sourceBinding.scope) ||
        !isCanonicalUtcTimestamp(value.generatedAt) ||
        Date.parse(value.generatedAt) < Date.parse(value.sourceBinding.completedAt) ||
        !isRecord(value.subscription) ||
        !hasExactKeys(value.subscription, ['safeLabel', 'portalRoute']) ||
        !isSafeLabel(value.subscription.safeLabel) ||
        !isEnvironmentPortalRouteV1(value.subscription.portalRoute) ||
        !isSourceCoverage(value.sourceCoverage) ||
        !isEstateSummary(value.estateSummary) ||
        !isCostSummary(value.costSummary) ||
        !isBoundedList(value.serviceFamilyRollups, isCostRollup) ||
        !isBoundedList(value.estateCostRollups, isCostRollup) ||
        !isBoundedList(value.costDrivers, isCostDriver) ||
        !isPillarSummaries(value.pillars) ||
        !isBoundedList(value.findings, isFinding) ||
        !isBoundedList(value.recommendations, isRecommendation) ||
        !isBoundedList(value.changes, isChange) ||
        !isBoundedList(value.warnings, isWarning) ||
        (value.commitments !== undefined && !isCommitmentsSection(value.commitments)) ||
        (value.budgets !== undefined && !isBudgetSection(value.budgets)) ||
        (value.idleResources !== undefined && !isIdleResourceSection(value.idleResources)) ||
        (value.publicIpExposure !== undefined && !isPublicIpExposureSection(value.publicIpExposure)) ||
        (value.secretStoreCoverage !== undefined && !isSecretStoreCoverageSection(value.secretStoreCoverage)) ||
        (value.tagCoverage !== undefined && !isTagCoverageSection(value.tagCoverage)) ||
        (value.changeSignals !== undefined && !isChangeSignalSection(value.changeSignals)) ||
        (value.healthEvents !== undefined && !isHealthEventSection(value.healthEvents)) ||
        (value.dataProtection !== undefined && !isDataProtectionSection(value.dataProtection)) ||
        (value.secureScore !== undefined && !isSecureScoreSection(value.secureScore)) ||
        !isReferenceArray(value.sourceReferences)) {
        return false;
    }
    return utf8ByteLength(JSON.stringify(value)) <= ENVIRONMENT_CONTRACT_LIMITS_V1.projectionBytes;
};
const descriptorByteLimit = (name) => {
    if (name === 'projection.json')
        return ENVIRONMENT_CONTRACT_LIMITS_V1.projectionBytes;
    if (name === 'environment-index.md')
        return ENVIRONMENT_CONTRACT_LIMITS_V1.environmentIndexBytes;
    return ENVIRONMENT_CONTRACT_LIMITS_V1.pillarDocumentBytes;
};
/** Validates one descriptor from the exact V1 multi-pillar document allowlist. */
export const isEnvironmentDocumentDescriptorV1 = (value) => {
    if (!isRecord(value) || !hasExactKeys(value, ['name', 'mediaType', 'byteCount', 'contentSha256', 'approximateTokenCount']))
        return false;
    if (typeof value.name !== 'string' || !DOCUMENT_NAMES.has(value.name))
        return false;
    const expectedMediaType = value.name === 'projection.json' ? 'application/json' : 'text/markdown; charset=utf-8';
    return (value.mediaType === expectedMediaType &&
        isNonNegativeInteger(value.byteCount) &&
        value.byteCount > 0 &&
        value.byteCount <= descriptorByteLimit(value.name) &&
        typeof value.contentSha256 === 'string' &&
        SHA256_PATTERN.test(value.contentSha256) &&
        isNonNegativeInteger(value.approximateTokenCount));
};
/** Validates that descriptors contain every allowlisted V1 document exactly once. */
export const isEnvironmentDocumentDescriptorSetV1 = (value) => Array.isArray(value) &&
    value.length === ENVIRONMENT_DOCUMENT_NAMES_V1.length &&
    value.every(isEnvironmentDocumentDescriptorV1) &&
    new Set(value.map(descriptor => descriptor.name)).size === ENVIRONMENT_DOCUMENT_NAMES_V1.length &&
    ENVIRONMENT_DOCUMENT_NAMES_V1.every(name => value.some(descriptor => descriptor.name === name));
/** Validates an atomically visible completed environment-generation pointer. */
export const isEnvironmentCompiledGenerationPointerV1 = (value) => {
    if (!hasSafeContainerShape(value) || !isRecord(value))
        return false;
    if (!hasExactKeys(value, ['schemaVersion', 'status', 'environmentRunId', 'scope', 'sourceBinding', 'treeDigestSha256', 'fileCount', 'generatedAt']) ||
        value.schemaVersion !== 1 ||
        value.status !== 'completed' ||
        !isEnvironmentRunIdV1(value.environmentRunId) ||
        !isEnvironmentScopeV1(value.scope) ||
        !isEnvironmentSourceBindingV1(value.sourceBinding) ||
        !scopesEqual(value.scope, value.sourceBinding.scope) ||
        typeof value.treeDigestSha256 !== 'string' ||
        !SHA256_PATTERN.test(value.treeDigestSha256) ||
        value.fileCount !== ENVIRONMENT_DOCUMENT_NAMES_V1.length ||
        !isCanonicalUtcTimestamp(value.generatedAt) ||
        Date.parse(value.generatedAt) < Date.parse(value.sourceBinding.completedAt)) {
        return false;
    }
    const sourceIdentities = [
        value.sourceBinding.publicationId,
        value.sourceBinding.portalRunId,
        value.sourceBinding.pluginRunId,
        value.sourceBinding.economicsGenerationId,
        value.sourceBinding.economicsFingerprint,
    ];
    return (!sourceIdentities.includes(value.environmentRunId) &&
        utf8ByteLength(JSON.stringify(value)) <= ENVIRONMENT_CONTRACT_LIMITS_V1.completedPointerBytes);
};
/** Validates an artifact kind without widening the closed V1 union. */
export const isEnvironmentArtifactKindV1 = (value) => typeof value === 'string' && ARTIFACT_KINDS.has(value);
/** Validates the V1 safe-label bound used by customer-visible evidence metadata. */
export const isEnvironmentSafeLabelV1 = (value) => isSafeLabel(value);
