"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnvironmentSafeLabelV1 = exports.isEnvironmentArtifactKindV1 = exports.isEnvironmentCompiledGenerationPointerV1 = exports.isEnvironmentDocumentDescriptorSetV1 = exports.isEnvironmentDocumentDescriptorV1 = exports.isEnvironmentSubscriptionCostProjectionV1 = exports.isEnvironmentCoverageStateV1 = exports.isEnvironmentMoneyValueV1 = exports.isEnvironmentRunIdV1 = exports.isEnvironmentSourceBindingV1 = exports.isEnvironmentSourceGenerationV1 = exports.isEnvironmentScopeV1 = exports.isEnvironmentPortalRouteV1 = void 0;
const contracts_js_1 = require("./contracts.js");
const internal_js_1 = require("./internal.js");
const references_js_1 = require("./references.js");
const DOCUMENT_NAMES = new Set(contracts_js_1.ENVIRONMENT_DOCUMENT_NAMES_V1);
const ARTIFACT_KINDS = new Set(contracts_js_1.ENVIRONMENT_ARTIFACT_KINDS_V1);
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
const isRecommendation = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['recommendationId', 'safeLabel', 'portalRoute', 'sourceReferences'], ['description', 'potentialSavings']) &&
    (0, internal_js_1.isScopeIdentifier)(value.recommendationId) &&
    (0, internal_js_1.isSafeLabel)(value.safeLabel) &&
    (0, exports.isEnvironmentPortalRouteV1)(value.portalRoute) &&
    (value.description === undefined || (0, internal_js_1.isCustomerString)(value.description)) &&
    (value.potentialSavings === undefined || isSavingsMoney(value.potentialSavings)) &&
    isReferenceArray(value.sourceReferences);
const isCostChange = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['key', 'safeLabel', 'description', 'direction', 'sourceReferences'], ['amount']) &&
    isGeneralKey(value.key) &&
    (0, internal_js_1.isSafeLabel)(value.safeLabel) &&
    (0, internal_js_1.isCustomerString)(value.description) &&
    typeof value.direction === 'string' &&
    CHANGE_DIRECTIONS.has(value.direction) &&
    (value.amount === undefined || isObservedMoney(value.amount)) &&
    isReferenceArray(value.sourceReferences);
const isWarning = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['code', 'safeLabel', 'sourceReferences'], ['detail']) &&
    isGeneralKey(value.code) &&
    (0, internal_js_1.isSafeLabel)(value.safeLabel) &&
    (value.detail === undefined || (0, internal_js_1.isCustomerString)(value.detail)) &&
    isReferenceArray(value.sourceReferences);
const isSourceCoverage = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['subscriptionSummary', 'resources', 'recommendations', 'costs', 'savings']) &&
    (0, exports.isEnvironmentCoverageStateV1)(value.subscriptionSummary) &&
    (0, exports.isEnvironmentCoverageStateV1)(value.resources) &&
    (0, exports.isEnvironmentCoverageStateV1)(value.recommendations) &&
    (0, exports.isEnvironmentCoverageStateV1)(value.costs) &&
    (0, exports.isEnvironmentCoverageStateV1)(value.savings);
const isCostSummary = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, [], ['observedCost', 'potentialSavings', 'resourceCount', 'recommendationCount']) &&
    (value.observedCost === undefined || isObservedMoney(value.observedCost)) &&
    (value.potentialSavings === undefined || isSavingsMoney(value.potentialSavings)) &&
    (value.resourceCount === undefined || (0, internal_js_1.isNonNegativeInteger)(value.resourceCount)) &&
    (value.recommendationCount === undefined || (0, internal_js_1.isNonNegativeInteger)(value.recommendationCount));
/** Validates the strict, bounded phase-one subscription-cost projection. */
const isEnvironmentSubscriptionCostProjectionV1 = (value) => {
    if (!(0, internal_js_1.hasSafeContainerShape)(value) || !(0, internal_js_1.isRecord)(value))
        return false;
    if (!(0, internal_js_1.hasExactKeys)(value, [
        'schemaVersion',
        'scope',
        'sourceBinding',
        'generatedAt',
        'subscription',
        'sourceCoverage',
        'costSummary',
        'serviceFamilyRollups',
        'estateCostRollups',
        'costDrivers',
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
        !isCostSummary(value.costSummary) ||
        !isBoundedList(value.serviceFamilyRollups, isCostRollup) ||
        !isBoundedList(value.estateCostRollups, isCostRollup) ||
        !isBoundedList(value.costDrivers, isCostDriver) ||
        !isBoundedList(value.recommendations, isRecommendation) ||
        !isBoundedList(value.changes, isCostChange) ||
        !isBoundedList(value.warnings, isWarning) ||
        !isReferenceArray(value.sourceReferences)) {
        return false;
    }
    return (0, internal_js_1.utf8ByteLength)(JSON.stringify(value)) <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.projectionBytes;
};
exports.isEnvironmentSubscriptionCostProjectionV1 = isEnvironmentSubscriptionCostProjectionV1;
const descriptorByteLimit = (name) => {
    if (name === 'projection.json')
        return contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.projectionBytes;
    if (name === 'environment-index.md')
        return contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.environmentIndexBytes;
    return contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.costPillarBytes;
};
/** Validates one descriptor from the exact V1 three-document allowlist. */
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
/** Validates that descriptors contain each allowlisted V1 document exactly once. */
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
        value.fileCount !== 3 ||
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
/** Validates the artifact kind without widening the closed V1 union. */
const isEnvironmentArtifactKindV1 = (value) => typeof value === 'string' && ARTIFACT_KINDS.has(value);
exports.isEnvironmentArtifactKindV1 = isEnvironmentArtifactKindV1;
/** Validates the V1 safe-label bound used by customer-visible evidence metadata. */
const isEnvironmentSafeLabelV1 = (value) => (0, internal_js_1.isSafeLabel)(value);
exports.isEnvironmentSafeLabelV1 = isEnvironmentSafeLabelV1;
//# sourceMappingURL=validation.js.map