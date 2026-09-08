"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnvironmentSafeLabelV1 = exports.isEnvironmentArtifactKindV1 = exports.isEnvironmentCompiledGenerationPointerV1 = exports.isEnvironmentDocumentDescriptorSetV1 = exports.isEnvironmentDocumentDescriptorV1 = exports.isEnvironmentSubscriptionCostProjectionV1 = exports.isEnvironmentSubscriptionProjectionV1 = exports.isEnvironmentCoverageStateV1 = exports.isEnvironmentMoneyValueV1 = exports.isEnvironmentRunIdV1 = exports.isEnvironmentSourceBindingV1 = exports.isEnvironmentSourceGenerationV1 = exports.isEnvironmentScopeV1 = exports.isEnvironmentPillarV1 = exports.isEnvironmentPortalRouteV1 = void 0;
const contracts_js_1 = require("./contracts.js");
const internal_js_1 = require("./internal.js");
const references_js_1 = require("./references.js");
const DOCUMENT_NAMES = new Set(contracts_js_1.ENVIRONMENT_DOCUMENT_NAMES_V1);
const ARTIFACT_KINDS = new Set(contracts_js_1.ENVIRONMENT_ARTIFACT_KINDS_V1);
const PILLARS = new Set(contracts_js_1.ENVIRONMENT_PILLARS_V1);
const FINDING_KINDS = new Set(contracts_js_1.ENVIRONMENT_FINDING_KINDS_V1);
const SEVERITIES = new Set(contracts_js_1.ENVIRONMENT_SEVERITIES_V1);
const IMPACTS = new Set(contracts_js_1.ENVIRONMENT_IMPACTS_V1);
const EFFORTS = new Set(contracts_js_1.ENVIRONMENT_EFFORTS_V1);
const MONEY_BASES = new Set(['billed', 'amortized']);
const MONEY_PROVENANCE = new Set([
    'subscription-summary',
    'subscription-resources',
    'cost-savings-summary',
    'savings-aggregate',
    'recommendation',
]);
const SAVINGS_ADDITIVITY = new Set(['additive', 'scenario-non-additive']);
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
    (0, internal_js_1.isSourceIdentity)(value.publicationId) &&
    (0, internal_js_1.isSourceIdentity)(value.portalRunId) &&
    (0, internal_js_1.isSourceIdentity)(value.pluginRunId) &&
    (0, internal_js_1.isCanonicalUtcTimestamp)(value.completedAt) &&
    (value.viewSetSchemaVersion === 1
        ? (0, internal_js_1.hasExactKeys)(value, [
            'viewSetSchemaVersion',
            'publicationId',
            'portalRunId',
            'pluginRunId',
            'economicsGenerationId',
            'economicsFingerprint',
            'completedAt',
        ]) && (0, internal_js_1.isSourceIdentity)(value.economicsGenerationId) && (0, internal_js_1.isSourceIdentity)(value.economicsFingerprint)
        : value.viewSetSchemaVersion === 3 &&
            (0, internal_js_1.hasExactKeys)(value, [
                'viewSetSchemaVersion',
                'publicationId',
                'portalRunId',
                'pluginRunId',
                'compositeDependencyDigest',
                'sourceRevision',
                'policyRevision',
                'completedAt',
            ]) &&
            typeof value.compositeDependencyDigest === 'string' &&
            internal_js_1.SHA256_PATTERN.test(value.compositeDependencyDigest) &&
            Number.isSafeInteger(value.sourceRevision) &&
            Number(value.sourceRevision) >= 1 &&
            Number.isSafeInteger(value.policyRevision) &&
            Number(value.policyRevision) >= 1);
exports.isEnvironmentSourceGenerationV1 = isEnvironmentSourceGenerationV1;
/** Validates a byte-preserving binding to a supported authoritative Azure view set. */
const isEnvironmentSourceBindingV1 = (value) => (0, internal_js_1.isRecord)(value) &&
    value.kind === 'azure-subscription-view-set' &&
    (0, exports.isEnvironmentScopeV1)(value.scope) &&
    (0, exports.isEnvironmentSourceGenerationV1)(value.viewSetSchemaVersion === 1
        ? {
            viewSetSchemaVersion: value.viewSetSchemaVersion,
            publicationId: value.publicationId,
            portalRunId: value.portalRunId,
            pluginRunId: value.pluginRunId,
            economicsGenerationId: value.economicsGenerationId,
            economicsFingerprint: value.economicsFingerprint,
            completedAt: value.completedAt,
        }
        : {
            viewSetSchemaVersion: value.viewSetSchemaVersion,
            publicationId: value.publicationId,
            portalRunId: value.portalRunId,
            pluginRunId: value.pluginRunId,
            compositeDependencyDigest: value.compositeDependencyDigest,
            sourceRevision: value.sourceRevision,
            policyRevision: value.policyRevision,
            completedAt: value.completedAt,
        }) &&
    (0, internal_js_1.hasExactKeys)(value, value.viewSetSchemaVersion === 1
        ? [
            'kind',
            'viewSetSchemaVersion',
            'scope',
            'publicationId',
            'portalRunId',
            'pluginRunId',
            'economicsGenerationId',
            'economicsFingerprint',
            'completedAt',
        ]
        : [
            'kind',
            'viewSetSchemaVersion',
            'scope',
            'publicationId',
            'portalRunId',
            'pluginRunId',
            'compositeDependencyDigest',
            'sourceRevision',
            'policyRevision',
            'completedAt',
        ]);
exports.isEnvironmentSourceBindingV1 = isEnvironmentSourceBindingV1;
/** Validates a storage-safe environment run identity independently from source identities. */
const isEnvironmentRunIdV1 = (value) => typeof value === 'string' &&
    value.length > 0 &&
    value.length <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.environmentRunIdAsciiCharacters &&
    value !== '.' &&
    value !== '..' &&
    internal_js_1.ENVIRONMENT_RUN_ID_PATTERN.test(value);
exports.isEnvironmentRunIdV1 = isEnvironmentRunIdV1;
/** Validates canonical decimal money with explicit currency, basis, period, and provenance. */
const isEnvironmentMoneyValueV1 = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['amount', 'currencyCode', 'basis', 'period', 'provenance'], ['savingsAdditivity']) &&
    typeof value.amount === 'string' &&
    internal_js_1.DECIMAL_PATTERN.test(value.amount) &&
    typeof value.currencyCode === 'string' &&
    internal_js_1.CURRENCY_PATTERN.test(value.currencyCode) &&
    typeof value.basis === 'string' &&
    MONEY_BASES.has(value.basis) &&
    (0, internal_js_1.isBoundedString)(value.period, contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.safeLabelScalars, { trimmed: true, controls: true }) &&
    typeof value.provenance === 'string' &&
    MONEY_PROVENANCE.has(value.provenance) &&
    (value.savingsAdditivity === undefined || (typeof value.savingsAdditivity === 'string' && SAVINGS_ADDITIVITY.has(value.savingsAdditivity)));
exports.isEnvironmentMoneyValueV1 = isEnvironmentMoneyValueV1;
const isObservedMoney = (value) => (0, exports.isEnvironmentMoneyValueV1)(value) && value.savingsAdditivity === undefined;
const isSavingsMoney = (value) => (0, exports.isEnvironmentMoneyValueV1)(value) && value.savingsAdditivity !== undefined;
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
const isPillarSummary = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['pillar', 'coverage', 'findingCount', 'recommendationCount', 'affectedResourceCount', 'portalRoute', 'sourceReferences'], ['score']) &&
    (0, exports.isEnvironmentPillarV1)(value.pillar) &&
    (0, exports.isEnvironmentCoverageStateV1)(value.coverage) &&
    (0, internal_js_1.isNonNegativeInteger)(value.findingCount) &&
    (0, internal_js_1.isNonNegativeInteger)(value.recommendationCount) &&
    (0, internal_js_1.isNonNegativeInteger)(value.affectedResourceCount) &&
    (0, exports.isEnvironmentPortalRouteV1)(value.portalRoute) &&
    (value.score === undefined || isPillarScore(value.score)) &&
    isReferenceArray(value.sourceReferences);
const isPillarSummaries = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, contracts_js_1.ENVIRONMENT_PILLARS_V1) &&
    contracts_js_1.ENVIRONMENT_PILLARS_V1.every(pillar => isPillarSummary(value[pillar]) && value[pillar]?.pillar === pillar);
const isFinding = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['findingId', 'pillar', 'kind', 'safeLabel', 'severity', 'resourceReferences', 'sourceReferences'], ['description', 'impact', 'effort', 'confidencePercentage', 'affectedResourceCount', 'portalRoute']) &&
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
    (value.confidencePercentage === undefined || isPercentage(value.confidencePercentage)) &&
    (value.affectedResourceCount === undefined || (0, internal_js_1.isNonNegativeInteger)(value.affectedResourceCount)) &&
    (value.portalRoute === undefined || (0, exports.isEnvironmentPortalRouteV1)(value.portalRoute)) &&
    isResourceReferenceArray(value.resourceReferences) &&
    isReferenceArray(value.sourceReferences);
const isRecommendation = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['recommendationId', 'pillar', 'safeLabel', 'portalRoute', 'resourceReferences', 'sourceReferences'], ['description', 'impact', 'effort', 'confidencePercentage', 'affectedResourceCount', 'potentialSavings']) &&
    (0, internal_js_1.isScopeIdentifier)(value.recommendationId) &&
    (0, exports.isEnvironmentPillarV1)(value.pillar) &&
    (0, internal_js_1.isSafeLabel)(value.safeLabel) &&
    (0, exports.isEnvironmentPortalRouteV1)(value.portalRoute) &&
    (value.description === undefined || (0, internal_js_1.isCustomerString)(value.description)) &&
    (value.impact === undefined || (typeof value.impact === 'string' && IMPACTS.has(value.impact))) &&
    (value.effort === undefined || (typeof value.effort === 'string' && EFFORTS.has(value.effort))) &&
    (value.confidencePercentage === undefined || isPercentage(value.confidencePercentage)) &&
    (value.affectedResourceCount === undefined || (0, internal_js_1.isNonNegativeInteger)(value.affectedResourceCount)) &&
    (value.potentialSavings === undefined || isSavingsMoney(value.potentialSavings)) &&
    isResourceReferenceArray(value.resourceReferences) &&
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
        !isReferenceArray(value.sourceReferences)) {
        return false;
    }
    return (0, internal_js_1.utf8ByteLength)(JSON.stringify(value)) <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.projectionBytes;
};
exports.isEnvironmentSubscriptionProjectionV1 = isEnvironmentSubscriptionProjectionV1;
/** Compatibility validator name retained during the pre-release multi-pillar migration. */
const isEnvironmentSubscriptionCostProjectionV1 = (value) => (0, exports.isEnvironmentSubscriptionProjectionV1)(value);
exports.isEnvironmentSubscriptionCostProjectionV1 = isEnvironmentSubscriptionCostProjectionV1;
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
        ...(value.sourceBinding.viewSetSchemaVersion === 1
            ? [value.sourceBinding.economicsGenerationId, value.sourceBinding.economicsFingerprint]
            : [value.sourceBinding.compositeDependencyDigest]),
    ];
    return (!sourceIdentities.includes(value.environmentRunId) &&
        (0, internal_js_1.utf8ByteLength)(JSON.stringify(value)) <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.completedPointerBytes);
};
exports.isEnvironmentCompiledGenerationPointerV1 = isEnvironmentCompiledGenerationPointerV1;
/** Validates the artifact kind without widening the closed V1 union. */
const isEnvironmentArtifactKindV1 = (value) => typeof value === 'string' && ARTIFACT_KINDS.has(value);
exports.isEnvironmentArtifactKindV1 = isEnvironmentArtifactKindV1;
/** Validates the V1 safe-label bound used by customer-visible evidence metadata. */
const isEnvironmentSafeLabelV1 = (value) => (0, internal_js_1.isSafeLabel)(value);
exports.isEnvironmentSafeLabelV1 = isEnvironmentSafeLabelV1;
//# sourceMappingURL=validation.js.map