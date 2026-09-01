import { ENVIRONMENT_ARTIFACT_KINDS_V1, ENVIRONMENT_CONTRACT_LIMITS_V1, ENVIRONMENT_DOCUMENT_NAMES_V1, } from './contracts.js';
import { CURRENCY_PATTERN, DECIMAL_PATTERN, ENVIRONMENT_RUN_ID_PATTERN, SHA256_PATTERN, hasExactKeys, hasSafeContainerShape, isBoundedString, isCanonicalUtcTimestamp, isCustomerString, isNonNegativeInteger, isRecord, isSafeLabel, isScopeIdentifier, isSourceIdentity, utf8ByteLength, } from './internal.js';
import { isEnvironmentLogicalEvidenceReferenceV1, isEnvironmentLogicalResourceReferenceV1 } from './references.js';
const DOCUMENT_NAMES = new Set(ENVIRONMENT_DOCUMENT_NAMES_V1);
const ARTIFACT_KINDS = new Set(ENVIRONMENT_ARTIFACT_KINDS_V1);
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
/** Validates canonical decimal money with explicit currency, basis, period, and provenance. */
export const isEnvironmentMoneyValueV1 = (value) => isRecord(value) &&
    hasExactKeys(value, ['amount', 'currencyCode', 'basis', 'period', 'provenance'], ['savingsAdditivity']) &&
    typeof value.amount === 'string' &&
    DECIMAL_PATTERN.test(value.amount) &&
    typeof value.currencyCode === 'string' &&
    CURRENCY_PATTERN.test(value.currencyCode) &&
    typeof value.basis === 'string' &&
    MONEY_BASES.has(value.basis) &&
    isBoundedString(value.period, ENVIRONMENT_CONTRACT_LIMITS_V1.safeLabelScalars, { trimmed: true, controls: true }) &&
    typeof value.provenance === 'string' &&
    MONEY_PROVENANCE.has(value.provenance) &&
    (value.savingsAdditivity === undefined || (typeof value.savingsAdditivity === 'string' && SAVINGS_ADDITIVITY.has(value.savingsAdditivity)));
const isObservedMoney = (value) => isEnvironmentMoneyValueV1(value) && value.savingsAdditivity === undefined;
const isSavingsMoney = (value) => isEnvironmentMoneyValueV1(value) && value.savingsAdditivity !== undefined;
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
const isRecommendation = (value) => isRecord(value) &&
    hasExactKeys(value, ['recommendationId', 'safeLabel', 'portalRoute', 'sourceReferences'], ['description', 'potentialSavings']) &&
    isScopeIdentifier(value.recommendationId) &&
    isSafeLabel(value.safeLabel) &&
    isEnvironmentPortalRouteV1(value.portalRoute) &&
    (value.description === undefined || isCustomerString(value.description)) &&
    (value.potentialSavings === undefined || isSavingsMoney(value.potentialSavings)) &&
    isReferenceArray(value.sourceReferences);
const isCostChange = (value) => isRecord(value) &&
    hasExactKeys(value, ['key', 'safeLabel', 'description', 'direction', 'sourceReferences'], ['amount']) &&
    isGeneralKey(value.key) &&
    isSafeLabel(value.safeLabel) &&
    isCustomerString(value.description) &&
    typeof value.direction === 'string' &&
    CHANGE_DIRECTIONS.has(value.direction) &&
    (value.amount === undefined || isObservedMoney(value.amount)) &&
    isReferenceArray(value.sourceReferences);
const isWarning = (value) => isRecord(value) &&
    hasExactKeys(value, ['code', 'safeLabel', 'sourceReferences'], ['detail']) &&
    isGeneralKey(value.code) &&
    isSafeLabel(value.safeLabel) &&
    (value.detail === undefined || isCustomerString(value.detail)) &&
    isReferenceArray(value.sourceReferences);
const isSourceCoverage = (value) => isRecord(value) &&
    hasExactKeys(value, ['subscriptionSummary', 'resources', 'recommendations', 'costs', 'savings']) &&
    isEnvironmentCoverageStateV1(value.subscriptionSummary) &&
    isEnvironmentCoverageStateV1(value.resources) &&
    isEnvironmentCoverageStateV1(value.recommendations) &&
    isEnvironmentCoverageStateV1(value.costs) &&
    isEnvironmentCoverageStateV1(value.savings);
const isCostSummary = (value) => isRecord(value) &&
    hasExactKeys(value, [], ['observedCost', 'potentialSavings', 'resourceCount', 'recommendationCount']) &&
    (value.observedCost === undefined || isObservedMoney(value.observedCost)) &&
    (value.potentialSavings === undefined || isSavingsMoney(value.potentialSavings)) &&
    (value.resourceCount === undefined || isNonNegativeInteger(value.resourceCount)) &&
    (value.recommendationCount === undefined || isNonNegativeInteger(value.recommendationCount));
/** Validates the strict, bounded phase-one subscription-cost projection. */
export const isEnvironmentSubscriptionCostProjectionV1 = (value) => {
    if (!hasSafeContainerShape(value) || !isRecord(value))
        return false;
    if (!hasExactKeys(value, [
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
    return utf8ByteLength(JSON.stringify(value)) <= ENVIRONMENT_CONTRACT_LIMITS_V1.projectionBytes;
};
const descriptorByteLimit = (name) => {
    if (name === 'projection.json')
        return ENVIRONMENT_CONTRACT_LIMITS_V1.projectionBytes;
    if (name === 'environment-index.md')
        return ENVIRONMENT_CONTRACT_LIMITS_V1.environmentIndexBytes;
    return ENVIRONMENT_CONTRACT_LIMITS_V1.costPillarBytes;
};
/** Validates one descriptor from the exact V1 three-document allowlist. */
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
/** Validates that descriptors contain each allowlisted V1 document exactly once. */
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
        value.fileCount !== 3 ||
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
/** Validates the artifact kind without widening the closed V1 union. */
export const isEnvironmentArtifactKindV1 = (value) => typeof value === 'string' && ARTIFACT_KINDS.has(value);
/** Validates the V1 safe-label bound used by customer-visible evidence metadata. */
export const isEnvironmentSafeLabelV1 = (value) => isSafeLabel(value);
