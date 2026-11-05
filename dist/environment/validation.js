"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnvironmentSafeLabelV1 = exports.isEnvironmentArtifactKindV1 = exports.isEnvironmentCompiledGenerationPointerV1 = exports.isEnvironmentDocumentDescriptorSetV1 = exports.isEnvironmentDocumentDescriptorV1 = exports.isEnvironmentSubscriptionProjectionV1 = exports.isEnvironmentMoneyValueV1 = exports.isEnvironmentRunIdV1 = exports.isEnvironmentSourceBindingV1 = exports.isEnvironmentSourceGenerationV1 = exports.isEnvironmentScopeV1 = exports.isEnvironmentPortalRouteV1 = exports.isEnvironmentPillarV1 = exports.isEnvironmentCoverageStateV1 = exports.isEnvironmentCardinalityV1 = exports.isEnvironmentSavingsBasisV1 = void 0;
const optionalDocuments_js_1 = require("./optionalDocuments.js");
const contracts_js_1 = require("./contracts.js");
const internal_js_1 = require("./internal.js");
const references_js_1 = require("./references.js");
const projectionValidation_js_1 = require("./projectionValidation.js");
const moneyValidation_js_1 = require("./moneyValidation.js");
const valueValidation_js_1 = require("./valueValidation.js");
var moneyValidation_js_2 = require("./moneyValidation.js");
Object.defineProperty(exports, "isEnvironmentSavingsBasisV1", { enumerable: true, get: function () { return moneyValidation_js_2.isEnvironmentSavingsBasisV1; } });
var valueValidation_js_2 = require("./valueValidation.js");
Object.defineProperty(exports, "isEnvironmentCardinalityV1", { enumerable: true, get: function () { return valueValidation_js_2.isEnvironmentCardinalityV1; } });
Object.defineProperty(exports, "isEnvironmentCoverageStateV1", { enumerable: true, get: function () { return valueValidation_js_2.isEnvironmentCoverageStateV1; } });
Object.defineProperty(exports, "isEnvironmentPillarV1", { enumerable: true, get: function () { return valueValidation_js_2.isEnvironmentPillarV1; } });
const DOCUMENT_NAMES = new Set(contracts_js_1.ENVIRONMENT_DOCUMENT_NAMES_V1);
const ARTIFACT_KINDS = new Set(contracts_js_1.ENVIRONMENT_ARTIFACT_KINDS_V1);
const MONEY_PROVENANCE = new Set([
    'subscription-summary',
    'subscription-resources',
    'cost-savings-summary',
    'savings-aggregate',
    'recommendation',
]);
const scopesEqual = (left, right) => left.kind === right.kind && left.tenantId === right.tenantId && left.companyId === right.companyId && left.subscriptionId === right.subscriptionId;
const isScopedEnvironmentDetailRoute = (value) => {
    const match = /^\/company\/([A-Za-z0-9_-]+)\/(dashboard|resources|recommendations|cost-analysis|commitments-planning|security|tags|backups|health|perimeter-insights|change-monitoring)(?:\/([^/?#]+))?(?:\?subscriptions=([A-Za-z0-9_-]+))?$/u.exec(value);
    if (!match)
        return false;
    const [, , page, subject, subscriptionId] = match;
    if (!subject)
        return Boolean(subscriptionId);
    try {
        const decoded = decodeURIComponent(subject);
        // Decode once only. Encoded separators are permitted solely inside an ARM ID,
        // never in the company, page, subscription selection or recommendation ID.
        if (encodeURIComponent(decoded) !== subject || /[%\\?#]/u.test(decoded) || (0, internal_js_1.hasControlCharacter)(decoded))
            return false;
        if (decoded.split('/').some(segment => segment === '.' || segment === '..'))
            return false;
        if (page === 'recommendations')
            return Boolean(subscriptionId) && /^[A-Za-z0-9_~.-]+$/u.test(decoded);
        if (page !== 'resources')
            return false;
        const resource = /^\/subscriptions\/([A-Za-z0-9_-]+)\/resourcegroups\/[^/]+\/providers\/[^/]+\/.+/iu.exec(decoded);
        return Boolean(resource && (!subscriptionId || resource[1].toLowerCase() === subscriptionId.toLowerCase()));
    }
    catch {
        return false;
    }
};
/** Validates a bounded, local Portal route suitable for client-visible evidence. */
const isEnvironmentPortalRouteV1 = (value) => (0, internal_js_1.isBoundedString)(value, contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.customerStringScalars, { trimmed: true, controls: true }) &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\') &&
    !value.includes('://') &&
    !value.includes('#') &&
    ((!value.includes('?') && !value.includes('%') && value.split('/').every(segment => segment !== '.' && segment !== '..')) ||
        isScopedEnvironmentDetailRoute(value));
exports.isEnvironmentPortalRouteV1 = isEnvironmentPortalRouteV1;
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
const isEnvironmentMoneyValueV1 = (value) => (0, moneyValidation_js_1.isEnvironmentMoneyValueWithProvenanceV1)(value, MONEY_PROVENANCE);
exports.isEnvironmentMoneyValueV1 = isEnvironmentMoneyValueV1;
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
    Object.values(value).every(valueValidation_js_1.isEnvironmentCoverageStateV1);
const validateAzureProjectionContent = (0, projectionValidation_js_1.createEnvironmentProjectionContentValidatorV1)({
    isEvidenceReference: references_js_1.isEnvironmentLogicalEvidenceReferenceV1,
    isResourceReference: references_js_1.isEnvironmentLogicalResourceReferenceV1,
    isResourceTypeArray: isAzureResourceTypeArray,
    resourceTypesMatchReferences,
    isPortalRoute: exports.isEnvironmentPortalRouteV1,
    isMoneyValue: exports.isEnvironmentMoneyValueV1,
});
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
        ...projectionValidation_js_1.ENVIRONMENT_PROJECTION_CONTENT_REQUIRED_KEYS_V1,
    ], projectionValidation_js_1.ENVIRONMENT_PROJECTION_CONTENT_OPTIONAL_KEYS_V1) ||
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
        !validateAzureProjectionContent(value)) {
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
    if (!(0, internal_js_1.hasExactKeys)(value, ['schemaVersion', 'status', 'environmentRunId', 'scope', 'sourceBinding', 'treeDigestSha256', 'fileCount', 'generatedAt'], ['optionalDocuments']) ||
        value.schemaVersion !== 1 ||
        value.status !== 'completed' ||
        !(0, exports.isEnvironmentRunIdV1)(value.environmentRunId) ||
        !(0, exports.isEnvironmentScopeV1)(value.scope) ||
        !(0, exports.isEnvironmentSourceBindingV1)(value.sourceBinding) ||
        !scopesEqual(value.scope, value.sourceBinding.scope) ||
        typeof value.treeDigestSha256 !== 'string' ||
        !internal_js_1.SHA256_PATTERN.test(value.treeDigestSha256) ||
        value.fileCount !== contracts_js_1.ENVIRONMENT_DOCUMENT_NAMES_V1.length ||
        (value.optionalDocuments !== undefined && !(0, optionalDocuments_js_1.isEnvironmentCapabilityDocumentSetV1)(value.optionalDocuments, value.scope)) ||
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