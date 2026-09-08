"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnvironmentSafeLabelV1 = exports.isEnvironmentArtifactKindV1 = exports.isEnvironmentCompiledGenerationPointerV1 = exports.isEnvironmentDocumentDescriptorSetV1 = exports.isEnvironmentDocumentDescriptorV1 = exports.isEnvironmentSubscriptionProjectionV1 = exports.isEnvironmentCardinalityV1 = exports.isEnvironmentCoverageStateV1 = exports.isEnvironmentMoneyValueV1 = exports.isEnvironmentSavingsBasisV1 = exports.isEnvironmentRunIdV1 = exports.isEnvironmentSourceBindingV1 = exports.isEnvironmentSourceGenerationV1 = exports.isEnvironmentScopeV1 = exports.isEnvironmentPillarV1 = exports.isEnvironmentPortalRouteV1 = void 0;
const contracts_js_1 = require("./contracts.js");
const internal_js_1 = require("./internal.js");
const references_js_1 = require("./references.js");
const DOCUMENT_NAMES = new Set(contracts_js_1.ENVIRONMENT_DOCUMENT_NAMES_V1);
const SIGNED_DECIMAL_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/u;
const ARTIFACT_KINDS = new Set(contracts_js_1.ENVIRONMENT_ARTIFACT_KINDS_V1);
const PILLARS = new Set(contracts_js_1.ENVIRONMENT_PILLARS_V1);
const FINDING_KINDS = new Set(contracts_js_1.ENVIRONMENT_FINDING_KINDS_V1);
const SEVERITIES = new Set(contracts_js_1.ENVIRONMENT_SEVERITIES_V1);
const IMPACTS = new Set(contracts_js_1.ENVIRONMENT_IMPACTS_V1);
const EFFORTS = new Set(contracts_js_1.ENVIRONMENT_EFFORTS_V1);
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
const isEnvironmentPortalRouteV1 = (value) => (0, internal_js_1.isBoundedString)(value, contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.customerStringScalars, { trimmed: true, controls: true }) &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\') &&
    !value.includes('://') &&
    !value.includes('?') &&
    !value.includes('#') &&
    !value.includes('%') &&
    value.split('/').every(segment => segment !== '.' && segment !== '..');
exports.isEnvironmentPortalRouteV1 = isEnvironmentPortalRouteV1;
const isGeneralKey = (value) => (0, internal_js_1.isBoundedString)(value, contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.safeLabelScalars, { trimmed: true, controls: true });
const isReferenceArray = (value) => Array.isArray(value) &&
    value.length <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems &&
    value.every(references_js_1.isEnvironmentLogicalEvidenceReferenceV1) &&
    new Set(value).size === value.length;
const isResourceReferenceArray = (value) => Array.isArray(value) &&
    value.length <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems &&
    value.every(references_js_1.isEnvironmentLogicalResourceReferenceV1) &&
    new Set(value).size === value.length;
const AZURE_RESOURCE_TYPE_PATTERN = /^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*(?:\/[a-z0-9][a-z0-9._-]*)*$/u;
const isAzureResourceTypeArray = (value) => Array.isArray(value) &&
    value.length <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems &&
    value.every(item => (0, internal_js_1.isBoundedString)(item, contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.safeLabelScalars, { trimmed: true, controls: true }) &&
        AZURE_RESOURCE_TYPE_PATTERN.test(item)) &&
    new Set(value).size === value.length &&
    value.every((item, index) => index === 0 || value[index - 1] < item);
const resourceTypesMatchReferences = (resourceTypes, resourceReferences) => {
    const derivedTypes = Array.from(new Set(resourceReferences.flatMap(reference => {
        const parsed = (0, references_js_1.parseEnvironmentLogicalResourceReferenceV1)(reference);
        if (parsed === null)
            return [];
        const resourceType = (0, references_js_1.deriveEnvironmentAzureResourceTypeV1)(parsed.resourceId);
        return resourceType === null ? [] : [resourceType];
    }))).sort();
    return derivedTypes.length === resourceTypes.length && derivedTypes.every((resourceType, index) => resourceTypes[index] === resourceType);
};
const isPercentage = (value) => typeof value === 'string' && internal_js_1.DECIMAL_PATTERN.test(value) && Number(value) <= 100;
/** Validates one admitted environment pillar. */
const isEnvironmentPillarV1 = (value) => typeof value === 'string' && PILLARS.has(value);
exports.isEnvironmentPillarV1 = isEnvironmentPillarV1;
/** Validates the closed phase-one Azure subscription scope. */
const isEnvironmentScopeV1 = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['kind', 'tenantId', 'companyId', 'subscriptionId']) &&
    value.kind === 'azure-subscription' &&
    (0, internal_js_1.isScopeIdentifier)(value.tenantId) &&
    (0, internal_js_1.isScopeIdentifier)(value.companyId) &&
    (0, internal_js_1.isScopeIdentifier)(value.subscriptionId);
exports.isEnvironmentScopeV1 = isEnvironmentScopeV1;
/** Validates the client-safe identity of one authoritative source generation. */
const isEnvironmentSourceGenerationV1 = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, [
        'viewSetSchemaVersion',
        'publicationId',
        'portalRunId',
        'pluginRunId',
        'economicsGenerationId',
        'economicsFingerprint',
        'completedAt',
    ]) &&
    value.viewSetSchemaVersion === 1 &&
    (0, internal_js_1.isSourceIdentity)(value.publicationId) &&
    (0, internal_js_1.isSourceIdentity)(value.portalRunId) &&
    (0, internal_js_1.isSourceIdentity)(value.pluginRunId) &&
    (0, internal_js_1.isSourceIdentity)(value.economicsGenerationId) &&
    (0, internal_js_1.isSourceIdentity)(value.economicsFingerprint) &&
    (0, internal_js_1.isCanonicalUtcTimestamp)(value.completedAt);
exports.isEnvironmentSourceGenerationV1 = isEnvironmentSourceGenerationV1;
/** Validates a byte-preserving binding to an authoritative CompletedAzureViewSetV1. */
const isEnvironmentSourceBindingV1 = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, [
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
    (0, exports.isEnvironmentScopeV1)(value.scope) &&
    (0, exports.isEnvironmentSourceGenerationV1)({
        viewSetSchemaVersion: value.viewSetSchemaVersion,
        publicationId: value.publicationId,
        portalRunId: value.portalRunId,
        pluginRunId: value.pluginRunId,
        economicsGenerationId: value.economicsGenerationId,
        economicsFingerprint: value.economicsFingerprint,
        completedAt: value.completedAt,
    });
exports.isEnvironmentSourceBindingV1 = isEnvironmentSourceBindingV1;
/** Validates a storage-safe environment run identity independently from source identities. */
const isEnvironmentRunIdV1 = (value) => typeof value === 'string' &&
    value.length > 0 &&
    value.length <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.environmentRunIdAsciiCharacters &&
    value !== '.' &&
    value !== '..' &&
    internal_js_1.ENVIRONMENT_RUN_ID_PATTERN.test(value);
exports.isEnvironmentRunIdV1 = isEnvironmentRunIdV1;
const isMoneyComposition = (value, currencyCode) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['billingBacked', 'estimated', 'minorUnitScale', 'currencyCode']) &&
    (0, internal_js_1.isNonNegativeInteger)(value.billingBacked) &&
    (0, internal_js_1.isNonNegativeInteger)(value.estimated) &&
    (0, internal_js_1.isNonNegativeInteger)(value.minorUnitScale) &&
    value.minorUnitScale <= 6 &&
    typeof value.currencyCode === 'string' &&
    (value.currencyCode === 'unknown' || internal_js_1.CURRENCY_PATTERN.test(value.currencyCode)) &&
    value.currencyCode === currencyCode;
/** Validates the producer projection rule and window behind a savings amount. */
const isEnvironmentSavingsBasisV1 = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['projection'], ['observedPeriod', 'stableWindow', 'containsLegacySavings']) &&
    typeof value.projection === 'string' &&
    SAVINGS_PROJECTIONS.has(value.projection) &&
    (value.observedPeriod === undefined || (0, internal_js_1.isSafeLabel)(value.observedPeriod)) &&
    (value.stableWindow === undefined || (typeof value.stableWindow === 'string' && DATE_WINDOW_PATTERN.test(value.stableWindow))) &&
    (value.containsLegacySavings === undefined || typeof value.containsLegacySavings === 'boolean');
exports.isEnvironmentSavingsBasisV1 = isEnvironmentSavingsBasisV1;
/** Validates canonical decimal money with explicit currency, basis, period, and provenance. */
const isEnvironmentMoneyValueV1 = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['amount', 'currencyCode', 'basis', 'period', 'provenance'], ['savingsAdditivity', 'spendSource', 'spendSourceConfidence', 'composition', 'savingsBasis']) &&
    (value.spendSource === undefined || (typeof value.spendSource === 'string' && SPEND_SOURCES.has(value.spendSource))) &&
    (value.spendSourceConfidence === undefined ||
        (typeof value.spendSourceConfidence === 'string' && SPEND_SOURCE_CONFIDENCES.has(value.spendSourceConfidence))) &&
    (value.composition === undefined || isMoneyComposition(value.composition, value.currencyCode)) &&
    (value.savingsBasis === undefined || (0, exports.isEnvironmentSavingsBasisV1)(value.savingsBasis)) &&
    typeof value.amount === 'string' &&
    internal_js_1.DECIMAL_PATTERN.test(value.amount) &&
    typeof value.currencyCode === 'string' &&
    (value.currencyCode === 'unknown' || internal_js_1.CURRENCY_PATTERN.test(value.currencyCode)) &&
    typeof value.basis === 'string' &&
    MONEY_BASES.has(value.basis) &&
    (0, internal_js_1.isBoundedString)(value.period, contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.safeLabelScalars, { trimmed: true, controls: true }) &&
    typeof value.provenance === 'string' &&
    MONEY_PROVENANCE.has(value.provenance) &&
    (value.savingsAdditivity === undefined || (typeof value.savingsAdditivity === 'string' && SAVINGS_ADDITIVITY.has(value.savingsAdditivity)));
exports.isEnvironmentMoneyValueV1 = isEnvironmentMoneyValueV1;
const isObservedMoney = (value) => (0, exports.isEnvironmentMoneyValueV1)(value) && value.savingsAdditivity === undefined && value.savingsBasis === undefined;
const isSavingsMoney = (value) => (0, exports.isEnvironmentMoneyValueV1)(value) && value.savingsAdditivity !== undefined && value.spendSource === undefined && value.composition === undefined;
/** Validates the closed coverage-state union and state-specific freshness rules. */
const isEnvironmentCoverageStateV1 = (value) => {
    if (!(0, internal_js_1.isRecord)(value) || typeof value.status !== 'string')
        return false;
    const hasValidFreshness = (value.observedAt === undefined || (0, internal_js_1.isCanonicalUtcTimestamp)(value.observedAt)) &&
        (value.completeThrough === undefined || (0, internal_js_1.isCanonicalUtcTimestamp)(value.completeThrough)) &&
        (value.observedAt === undefined ||
            value.completeThrough === undefined ||
            Date.parse(value.completeThrough) <= Date.parse(value.observedAt));
    if (value.status === 'complete') {
        return (0, internal_js_1.hasExactKeys)(value, ['status'], ['observedAt', 'completeThrough']) && hasValidFreshness;
    }
    if (value.status === 'partial') {
        return ((0, internal_js_1.hasExactKeys)(value, ['status', 'reason'], ['observedAt', 'completeThrough']) &&
            (0, internal_js_1.isCustomerString)(value.reason) &&
            value.reason.length > 0 &&
            hasValidFreshness);
    }
    if (value.status === 'stale') {
        return ((0, internal_js_1.hasExactKeys)(value, ['status', 'reason', 'observedAt'], ['completeThrough']) &&
            (0, internal_js_1.isCustomerString)(value.reason) &&
            value.reason.length > 0 &&
            hasValidFreshness);
    }
    if (value.status === 'unavailable' || value.status === 'not-collected') {
        return (0, internal_js_1.hasExactKeys)(value, ['status', 'reason']) && (0, internal_js_1.isCustomerString)(value.reason) && value.reason.length > 0;
    }
    return false;
};
exports.isEnvironmentCoverageStateV1 = isEnvironmentCoverageStateV1;
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
    if (value.continuationReference !== undefined && !(0, references_js_1.isEnvironmentLogicalEvidenceReferenceV1)(value.continuationReference))
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
    (value.portalRoute === undefined || (0, exports.isEnvironmentPortalRouteV1)(value.portalRoute)) &&
    (value.resourceReference === undefined || (0, references_js_1.isEnvironmentLogicalResourceReferenceV1)(value.resourceReference)) &&
    isReferenceArray(value.sourceReferences);
const isPillarScore = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['value', 'maximum', 'safeLabel']) &&
    isPercentage(value.value) &&
    value.maximum === '100' &&
    (0, internal_js_1.isSafeLabel)(value.safeLabel);
/** Validates exact, lower-bound, and unavailable count evidence without ambiguous totals. */
const isEnvironmentCardinalityV1 = (value) => {
    if (!(0, internal_js_1.isRecord)(value) || typeof value.basis !== 'string')
        return false;
    if (value.basis === 'exact') {
        return (0, internal_js_1.hasExactKeys)(value, ['basis', 'value']) && (0, internal_js_1.isNonNegativeInteger)(value.value);
    }
    if (value.basis === 'lower-bound') {
        return (0, internal_js_1.hasExactKeys)(value, ['basis', 'value', 'reason']) && (0, internal_js_1.isNonNegativeInteger)(value.value) && (0, internal_js_1.isSafeLabel)(value.reason);
    }
    if (value.basis === 'unavailable') {
        return (0, internal_js_1.hasExactKeys)(value, ['basis', 'reason']) && (0, internal_js_1.isSafeLabel)(value.reason);
    }
    return false;
};
exports.isEnvironmentCardinalityV1 = isEnvironmentCardinalityV1;
const isPillarSummary = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['pillar', 'coverage', 'findingCount', 'recommendationCount', 'affectedResources', 'portalRoute', 'sourceReferences'], ['score']) &&
    (0, exports.isEnvironmentPillarV1)(value.pillar) &&
    (0, exports.isEnvironmentCoverageStateV1)(value.coverage) &&
    (0, internal_js_1.isNonNegativeInteger)(value.findingCount) &&
    (0, internal_js_1.isNonNegativeInteger)(value.recommendationCount) &&
    (0, exports.isEnvironmentCardinalityV1)(value.affectedResources) &&
    (0, exports.isEnvironmentPortalRouteV1)(value.portalRoute) &&
    (value.score === undefined || isPillarScore(value.score)) &&
    isReferenceArray(value.sourceReferences);
const isPillarSummaries = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, contracts_js_1.ENVIRONMENT_PILLARS_V1) &&
    contracts_js_1.ENVIRONMENT_PILLARS_V1.every(pillar => isPillarSummary(value[pillar]) && value[pillar]?.pillar === pillar);
const isFinding = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['findingId', 'pillar', 'kind', 'safeLabel', 'severity', 'resourceReferences', 'sourceReferences'], ['description', 'impact', 'effort', 'affectedResources', 'portalRoute']) &&
    (0, internal_js_1.isScopeIdentifier)(value.findingId) &&
    (0, exports.isEnvironmentPillarV1)(value.pillar) &&
    typeof value.kind === 'string' &&
    FINDING_KINDS.has(value.kind) &&
    (0, internal_js_1.isSafeLabel)(value.safeLabel) &&
    typeof value.severity === 'string' &&
    SEVERITIES.has(value.severity) &&
    (value.description === undefined || (0, internal_js_1.isCustomerString)(value.description)) &&
    (value.impact === undefined || (typeof value.impact === 'string' && IMPACTS.has(value.impact))) &&
    (value.effort === undefined || (typeof value.effort === 'string' && EFFORTS.has(value.effort))) &&
    (value.affectedResources === undefined || (0, exports.isEnvironmentCardinalityV1)(value.affectedResources)) &&
    (value.portalRoute === undefined || (0, exports.isEnvironmentPortalRouteV1)(value.portalRoute)) &&
    isResourceReferenceArray(value.resourceReferences) &&
    isReferenceArray(value.sourceReferences);
const isRecommendation = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['recommendationId', 'pillar', 'safeLabel', 'technicalName', 'affectedResourceTypes', 'portalRoute', 'resourceReferences', 'sourceReferences'], ['description', 'impact', 'effort', 'affectedResources', 'potentialSavings']) &&
    (0, internal_js_1.isScopeIdentifier)(value.recommendationId) &&
    (0, exports.isEnvironmentPillarV1)(value.pillar) &&
    (0, internal_js_1.isSafeLabel)(value.safeLabel) &&
    (0, internal_js_1.isSafeLabel)(value.technicalName) &&
    isAzureResourceTypeArray(value.affectedResourceTypes) &&
    (0, exports.isEnvironmentPortalRouteV1)(value.portalRoute) &&
    (value.description === undefined || (0, internal_js_1.isCustomerString)(value.description)) &&
    (value.impact === undefined || (typeof value.impact === 'string' && IMPACTS.has(value.impact))) &&
    (value.effort === undefined || (typeof value.effort === 'string' && EFFORTS.has(value.effort))) &&
    (value.affectedResources === undefined || (0, exports.isEnvironmentCardinalityV1)(value.affectedResources)) &&
    (value.potentialSavings === undefined || isSavingsMoney(value.potentialSavings)) &&
    isResourceReferenceArray(value.resourceReferences) &&
    resourceTypesMatchReferences(value.affectedResourceTypes, value.resourceReferences) &&
    isReferenceArray(value.sourceReferences);
const isChange = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['key', 'pillars', 'safeLabel', 'description', 'direction', 'sourceReferences'], ['amount']) &&
    isGeneralKey(value.key) &&
    Array.isArray(value.pillars) &&
    value.pillars.length > 0 &&
    value.pillars.length <= contracts_js_1.ENVIRONMENT_PILLARS_V1.length &&
    value.pillars.every(exports.isEnvironmentPillarV1) &&
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
    (value.pillar === undefined || (0, exports.isEnvironmentPillarV1)(value.pillar)) &&
    (value.detail === undefined || (0, internal_js_1.isCustomerString)(value.detail)) &&
    isReferenceArray(value.sourceReferences);
const isSourceCoverage = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, [
        'completedViewSet',
        'subscriptionSummary',
        'resources',
        'recommendations',
        'serviceRetirements',
        'monitorAlerts',
        'pluginMetrics',
    ]) &&
    Object.values(value).every(exports.isEnvironmentCoverageStateV1);
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
    (value.resourceReference === undefined || (0, references_js_1.isEnvironmentLogicalResourceReferenceV1)(value.resourceReference));
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
    (value.resourceReference === undefined || (0, references_js_1.isEnvironmentLogicalResourceReferenceV1)(value.resourceReference));
const isCommitmentsSection = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['coverage', 'purchaseOptions', 'benefitCoverage', 'sourceReferences'], ['benefitCount', 'utilizationPercent30Day', 'utilizationPercent7Day', 'expiredCount', 'expiring90DayCount', 'expiring180DayCount']) &&
    (0, exports.isEnvironmentCoverageStateV1)(value.coverage) &&
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
    (0, exports.isEnvironmentCoverageStateV1)(value.coverage) &&
    isSectionList(value.budgets, isBudget) &&
    isReferenceArray(value.sourceReferences);
const isIdleResourceSection = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['coverage', 'recommendationCount', 'resourceCount', 'subjects', 'sourceReferences'], ['monthlyWaste']) &&
    (0, exports.isEnvironmentCoverageStateV1)(value.coverage) &&
    (0, internal_js_1.isNonNegativeInteger)(value.recommendationCount) &&
    (0, internal_js_1.isNonNegativeInteger)(value.resourceCount) &&
    (value.monthlyWaste === undefined || isSavingsMoney(value.monthlyWaste)) &&
    isSectionList(value.subjects, isSubjectReference) &&
    isReferenceArray(value.sourceReferences);
const isPublicIpExposureSection = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['coverage', 'totalCount', 'exposedSubjects', 'remediationOptions', 'sourceReferences'], ['assignedCount', 'unassignedCount', 'basicSkuCount', 'httpsExposedCount', 'rdpExposedCount', 'sshExposedCount']) &&
    (0, exports.isEnvironmentCoverageStateV1)(value.coverage) &&
    (0, internal_js_1.isNonNegativeInteger)(value.totalCount) &&
    [value.assignedCount, value.unassignedCount, value.basicSkuCount, value.httpsExposedCount, value.rdpExposedCount, value.sshExposedCount].every(isSectionCount) &&
    isSectionList(value.exposedSubjects, isSubjectReference) &&
    isSectionList(value.remediationOptions, isLabeledCount) &&
    isReferenceArray(value.sourceReferences);
const isSecretStoreCoverageSection = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['coverage', 'vaultCount', 'inspectedVaultCount', 'reasons', 'sourceReferences']) &&
    (0, exports.isEnvironmentCoverageStateV1)(value.coverage) &&
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
    (0, exports.isEnvironmentCoverageStateV1)(value.coverage) &&
    (0, internal_js_1.isNonNegativeInteger)(value.resourceCount) &&
    (0, internal_js_1.isNonNegativeInteger)(value.taggedResourceCount) &&
    (0, internal_js_1.isNonNegativeInteger)(value.untaggedResourceCount) &&
    (0, internal_js_1.isNonNegativeInteger)(value.distinctTagKeyCount) &&
    value.taggedResourceCount + value.untaggedResourceCount === value.resourceCount &&
    isSectionList(value.topTagKeys, isLabeledCount) &&
    isReferenceArray(value.sourceReferences);
const isChangeSignalSection = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['coverage', 'windowDays', 'changeCount', 'topOperations', 'sourceReferences'], ['materialChangeCount', 'securityRelevantCount']) &&
    (0, exports.isEnvironmentCoverageStateV1)(value.coverage) &&
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
    (0, exports.isEnvironmentCoverageStateV1)(value.coverage) &&
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
    (0, exports.isEnvironmentCoverageStateV1)(value.coverage) &&
    [value.totalResourcesEvaluated, value.protectedCount, value.notProtectedCount, value.unknownCount, value.failedCount, value.staleCount].every(internal_js_1.isNonNegativeInteger) &&
    isSectionList(value.workloadCoverage, isLabeledCount) &&
    isSectionList(value.findingCounts, isLabeledCount) &&
    isSectionList(value.atRiskSubjects, isSubjectReference) &&
    isReferenceArray(value.sourceReferences);
const isSecureScoreSection = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['coverage', 'value', 'maximum', 'sourceReferences'], ['previousValue', 'delta', 'currentScore', 'maxScore', 'assessedResourceCount']) &&
    (0, exports.isEnvironmentCoverageStateV1)(value.coverage) &&
    typeof value.value === 'string' &&
    isPercentage(value.value) &&
    value.maximum === '100' &&
    (value.previousValue === undefined || (typeof value.previousValue === 'string' && isPercentage(value.previousValue))) &&
    (value.delta === undefined || (typeof value.delta === 'string' && SIGNED_DECIMAL_PATTERN.test(value.delta))) &&
    (value.currentScore === undefined || (typeof value.currentScore === 'string' && internal_js_1.DECIMAL_PATTERN.test(value.currentScore))) &&
    (value.maxScore === undefined || (typeof value.maxScore === 'string' && internal_js_1.DECIMAL_PATTERN.test(value.maxScore))) &&
    isSectionCount(value.assessedResourceCount) &&
    isReferenceArray(value.sourceReferences);
/** Validates the strict, bounded multi-pillar subscription environment projection. */
const isEnvironmentSubscriptionProjectionV1 = (value) => {
    if (!(0, internal_js_1.hasSafeContainerShape)(value) || !(0, internal_js_1.isRecord)(value))
        return false;
    if (!(0, internal_js_1.hasExactKeys)(value, [
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
        !(0, exports.isEnvironmentScopeV1)(value.scope) ||
        !(0, exports.isEnvironmentSourceBindingV1)(value.sourceBinding) ||
        !scopesEqual(value.scope, value.sourceBinding.scope) ||
        !(0, internal_js_1.isCanonicalUtcTimestamp)(value.generatedAt) ||
        Date.parse(value.generatedAt) < Date.parse(value.sourceBinding.completedAt) ||
        !(0, internal_js_1.isRecord)(value.subscription) ||
        !(0, internal_js_1.hasExactKeys)(value.subscription, ['safeLabel', 'portalRoute']) ||
        !(0, internal_js_1.isSafeLabel)(value.subscription.safeLabel) ||
        !(0, exports.isEnvironmentPortalRouteV1)(value.subscription.portalRoute) ||
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
    return (0, internal_js_1.utf8ByteLength)(JSON.stringify(value)) <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.projectionBytes;
};
exports.isEnvironmentSubscriptionProjectionV1 = isEnvironmentSubscriptionProjectionV1;
const descriptorByteLimit = (name) => {
    if (name === 'projection.json')
        return contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.projectionBytes;
    if (name === 'environment-index.md')
        return contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.environmentIndexBytes;
    return contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.pillarDocumentBytes;
};
/** Validates one descriptor from the exact V1 multi-pillar document allowlist. */
const isEnvironmentDocumentDescriptorV1 = (value) => {
    if (!(0, internal_js_1.isRecord)(value) || !(0, internal_js_1.hasExactKeys)(value, ['name', 'mediaType', 'byteCount', 'contentSha256', 'approximateTokenCount']))
        return false;
    if (typeof value.name !== 'string' || !DOCUMENT_NAMES.has(value.name))
        return false;
    const expectedMediaType = value.name === 'projection.json' ? 'application/json' : 'text/markdown; charset=utf-8';
    return (value.mediaType === expectedMediaType &&
        (0, internal_js_1.isNonNegativeInteger)(value.byteCount) &&
        value.byteCount > 0 &&
        value.byteCount <= descriptorByteLimit(value.name) &&
        typeof value.contentSha256 === 'string' &&
        internal_js_1.SHA256_PATTERN.test(value.contentSha256) &&
        (0, internal_js_1.isNonNegativeInteger)(value.approximateTokenCount));
};
exports.isEnvironmentDocumentDescriptorV1 = isEnvironmentDocumentDescriptorV1;
/** Validates that descriptors contain every allowlisted V1 document exactly once. */
const isEnvironmentDocumentDescriptorSetV1 = (value) => Array.isArray(value) &&
    value.length === contracts_js_1.ENVIRONMENT_DOCUMENT_NAMES_V1.length &&
    value.every(exports.isEnvironmentDocumentDescriptorV1) &&
    new Set(value.map(descriptor => descriptor.name)).size === contracts_js_1.ENVIRONMENT_DOCUMENT_NAMES_V1.length &&
    contracts_js_1.ENVIRONMENT_DOCUMENT_NAMES_V1.every(name => value.some(descriptor => descriptor.name === name));
exports.isEnvironmentDocumentDescriptorSetV1 = isEnvironmentDocumentDescriptorSetV1;
/** Validates an atomically visible completed environment-generation pointer. */
const isEnvironmentCompiledGenerationPointerV1 = (value) => {
    if (!(0, internal_js_1.hasSafeContainerShape)(value) || !(0, internal_js_1.isRecord)(value))
        return false;
    if (!(0, internal_js_1.hasExactKeys)(value, ['schemaVersion', 'status', 'environmentRunId', 'scope', 'sourceBinding', 'treeDigestSha256', 'fileCount', 'generatedAt']) ||
        value.schemaVersion !== 1 ||
        value.status !== 'completed' ||
        !(0, exports.isEnvironmentRunIdV1)(value.environmentRunId) ||
        !(0, exports.isEnvironmentScopeV1)(value.scope) ||
        !(0, exports.isEnvironmentSourceBindingV1)(value.sourceBinding) ||
        !scopesEqual(value.scope, value.sourceBinding.scope) ||
        typeof value.treeDigestSha256 !== 'string' ||
        !internal_js_1.SHA256_PATTERN.test(value.treeDigestSha256) ||
        value.fileCount !== contracts_js_1.ENVIRONMENT_DOCUMENT_NAMES_V1.length ||
        !(0, internal_js_1.isCanonicalUtcTimestamp)(value.generatedAt) ||
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
        (0, internal_js_1.utf8ByteLength)(JSON.stringify(value)) <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.completedPointerBytes);
};
exports.isEnvironmentCompiledGenerationPointerV1 = isEnvironmentCompiledGenerationPointerV1;
/** Validates an artifact kind without widening the closed V1 union. */
const isEnvironmentArtifactKindV1 = (value) => typeof value === 'string' && ARTIFACT_KINDS.has(value);
exports.isEnvironmentArtifactKindV1 = isEnvironmentArtifactKindV1;
/** Validates the V1 safe-label bound used by customer-visible evidence metadata. */
const isEnvironmentSafeLabelV1 = (value) => (0, internal_js_1.isSafeLabel)(value);
exports.isEnvironmentSafeLabelV1 = isEnvironmentSafeLabelV1;
//# sourceMappingURL=validation.js.map