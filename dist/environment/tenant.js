"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnvironmentTenantLogicalReferenceV1 = exports.isEnvironmentTenantCompiledGenerationPointerV1 = exports.buildEnvironmentTenantTreeDigestPreimageV1 = exports.isEnvironmentTenantDocumentDescriptorSetV1 = exports.isEnvironmentTenantDocumentDescriptorV1 = exports.isEnvironmentTenantProjectionV1 = exports.isEnvironmentTenantSourceBindingV1 = exports.isEnvironmentTenantScopeV1 = exports.buildEnvironmentTenantScopeQualifiedSubjectV1 = exports.ENVIRONMENT_TENANT_DOCUMENT_NAMES_V1 = void 0;
const contracts_js_1 = require("./contracts.js");
const internal_js_1 = require("./internal.js");
const references_js_1 = require("./references.js");
const validation_js_1 = require("./validation.js");
exports.ENVIRONMENT_TENANT_DOCUMENT_NAMES_V1 = [
    'projection.json',
    'environment-index.md',
    'identity.md',
    'governance.md',
    'commitments.md',
];
const REFERENCE_PATTERN = /^spotto:\/\/(?:artifact|resource)\/v1\//u;
const SEVERITIES = new Set(['critical', 'high', 'medium', 'low', 'informational', 'unknown']);
const PRINCIPAL_TYPES = new Set(['user', 'group', 'servicePrincipal', 'unknown']);
const ASSIGNMENT_MODES = new Set(['permanent', 'eligible', 'active', 'unknown']);
/** Builds the canonical logical subject for a tenant environment artifact. */
const buildEnvironmentTenantScopeQualifiedSubjectV1 = (scope) => {
    if (!(0, exports.isEnvironmentTenantScopeV1)(scope))
        throw new TypeError('Invalid tenant environment scope.');
    return JSON.stringify([scope.kind, scope.tenantId]);
};
exports.buildEnvironmentTenantScopeQualifiedSubjectV1 = buildEnvironmentTenantScopeQualifiedSubjectV1;
/** Validates a tenant environment scope. */
const isEnvironmentTenantScopeV1 = (value) => (0, internal_js_1.isRecord)(value) && (0, internal_js_1.hasExactKeys)(value, ['kind', 'tenantId']) && value.kind === 'azure-tenant' && (0, internal_js_1.isScopeIdentifier)(value.tenantId);
exports.isEnvironmentTenantScopeV1 = isEnvironmentTenantScopeV1;
/** Validates the completed tenant-sync generation bound to a tenant environment generation. */
const isEnvironmentTenantSourceBindingV1 = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['kind', 'scope', 'tenantSyncRunId', 'completedAt']) &&
    value.kind === 'azure-tenant-sync' &&
    (0, exports.isEnvironmentTenantScopeV1)(value.scope) &&
    (0, internal_js_1.isSourceIdentity)(value.tenantSyncRunId) &&
    (0, internal_js_1.isCanonicalUtcTimestamp)(value.completedAt);
exports.isEnvironmentTenantSourceBindingV1 = isEnvironmentTenantSourceBindingV1;
const scopesEqual = (left, right) => left.tenantId === right.tenantId;
const isReferenceArray = (value) => Array.isArray(value) && value.length <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems && value.every(references_js_1.isEnvironmentLogicalEvidenceReferenceV1);
const isBoundedList = (value, itemGuard) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['items', 'totalCount', 'includedCount', 'truncated'], ['continuationReference']) &&
    Array.isArray(value.items) &&
    value.items.length <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems &&
    value.items.every(itemGuard) &&
    (0, internal_js_1.isNonNegativeInteger)(value.totalCount) &&
    value.includedCount === value.items.length &&
    value.totalCount >= value.includedCount &&
    value.truncated === value.totalCount > value.includedCount &&
    (value.continuationReference === undefined || (0, references_js_1.isEnvironmentLogicalEvidenceReferenceV1)(value.continuationReference)) &&
    (!value.truncated || value.continuationReference !== undefined);
const isCountRecord = (value, keys) => (0, internal_js_1.isRecord)(value) && (0, internal_js_1.hasExactKeys)(value, keys) && keys.every(key => (0, internal_js_1.isNonNegativeInteger)(value[key]));
const isGlobalAdministrator = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['principalId', 'safeLabel', 'principalType', 'assignmentModes', 'mfaStatus', 'sourceReferences']) &&
    (0, internal_js_1.isScopeIdentifier)(value.principalId) &&
    (0, internal_js_1.isSafeLabel)(value.safeLabel) &&
    typeof value.principalType === 'string' &&
    PRINCIPAL_TYPES.has(value.principalType) &&
    Array.isArray(value.assignmentModes) &&
    value.assignmentModes.length <= 4 &&
    value.assignmentModes.every(mode => typeof mode === 'string' && ASSIGNMENT_MODES.has(mode)) &&
    new Set(value.assignmentModes).size === value.assignmentModes.length &&
    (value.mfaStatus === 'mfa' || value.mfaStatus === 'unknown') &&
    isReferenceArray(value.sourceReferences);
const isGovernanceFinding = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['findingId', 'safeLabel', 'severity', 'sourceReferences'], ['category', 'scopeType']) &&
    (0, internal_js_1.isScopeIdentifier)(value.findingId) &&
    (0, internal_js_1.isSafeLabel)(value.safeLabel) &&
    typeof value.severity === 'string' &&
    SEVERITIES.has(value.severity) &&
    (value.category === undefined || (0, internal_js_1.isSafeLabel)(value.category)) &&
    (value.scopeType === undefined || (0, internal_js_1.isSafeLabel)(value.scopeType)) &&
    isReferenceArray(value.sourceReferences);
const isCommitment = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['commitmentId', 'kind', 'safeLabel', 'sourceReferences'], ['status', 'expiry', 'quantity']) &&
    (0, internal_js_1.isScopeIdentifier)(value.commitmentId) &&
    (value.kind === 'reservation' || value.kind === 'savings-plan') &&
    (0, internal_js_1.isSafeLabel)(value.safeLabel) &&
    (value.status === undefined || (0, internal_js_1.isSafeLabel)(value.status)) &&
    (value.expiry === undefined || (0, internal_js_1.isCanonicalUtcTimestamp)(value.expiry)) &&
    (value.quantity === undefined || (0, internal_js_1.isNonNegativeInteger)(value.quantity)) &&
    isReferenceArray(value.sourceReferences);
const isWarning = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['code', 'safeLabel', 'sourceReferences'], ['pillar', 'detail']) &&
    (0, internal_js_1.isScopeIdentifier)(value.code) &&
    (0, internal_js_1.isSafeLabel)(value.safeLabel) &&
    value.pillar === undefined &&
    (value.detail === undefined || (0, internal_js_1.isBoundedString)(value.detail, contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.customerStringScalars, { controls: true })) &&
    isReferenceArray(value.sourceReferences);
/** Validates the strict tenant environment projection. */
const isEnvironmentTenantProjectionV1 = (value) => {
    if (!(0, internal_js_1.hasSafeContainerShape)(value) || !(0, internal_js_1.isRecord)(value))
        return false;
    if (!(0, internal_js_1.hasExactKeys)(value, [
        'schemaVersion',
        'scope',
        'sourceBinding',
        'generatedAt',
        'tenant',
        'sourceCoverage',
        'identitySummary',
        'governanceSummary',
        'commitmentSummary',
        'globalAdministrators',
        'governanceFindings',
        'commitments',
        'warnings',
        'sourceReferences',
    ]) ||
        value.schemaVersion !== 1 ||
        !(0, exports.isEnvironmentTenantScopeV1)(value.scope) ||
        !(0, exports.isEnvironmentTenantSourceBindingV1)(value.sourceBinding) ||
        !scopesEqual(value.scope, value.sourceBinding.scope) ||
        !(0, internal_js_1.isCanonicalUtcTimestamp)(value.generatedAt) ||
        Date.parse(value.generatedAt) < Date.parse(value.sourceBinding.completedAt) ||
        !(0, internal_js_1.isRecord)(value.tenant) ||
        !(0, internal_js_1.hasExactKeys)(value.tenant, ['safeLabel']) ||
        !(0, internal_js_1.isSafeLabel)(value.tenant.safeLabel) ||
        !(0, internal_js_1.isRecord)(value.sourceCoverage) ||
        !(0, internal_js_1.hasExactKeys)(value.sourceCoverage, ['tenantSync', 'governance', 'identity', 'commitments']) ||
        !Object.values(value.sourceCoverage).every(validation_js_1.isEnvironmentCoverageStateV1) ||
        !isCountRecord(value.identitySummary, [
            'applicationCount',
            'servicePrincipalCount',
            'globalAdministratorCount',
            'permanentGlobalAdministratorCount',
            'eligibleGlobalAdministratorCount',
            'mfaKnownGlobalAdministratorCount',
        ]) ||
        !isCountRecord(value.governanceSummary, [
            'managementGroupCount',
            'subscriptionCount',
            'policyAssignmentCount',
            'policyExemptionCount',
            'roleAssignmentCount',
            'privilegedAssignmentCount',
            'customRoleCount',
            'findingCount',
        ]) ||
        !isCountRecord(value.commitmentSummary, ['reservationCount', 'savingsPlanCount', 'expiringWithin90DaysCount']) ||
        !isBoundedList(value.globalAdministrators, isGlobalAdministrator) ||
        !isBoundedList(value.governanceFindings, isGovernanceFinding) ||
        !isBoundedList(value.commitments, isCommitment) ||
        !isBoundedList(value.warnings, isWarning) ||
        !isReferenceArray(value.sourceReferences)) {
        return false;
    }
    return (0, internal_js_1.utf8ByteLength)(JSON.stringify(value)) <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.projectionBytes;
};
exports.isEnvironmentTenantProjectionV1 = isEnvironmentTenantProjectionV1;
const descriptorLimit = (name) => name === 'projection.json' ? contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.projectionBytes : contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.environmentIndexBytes;
/** Validates one tenant environment document descriptor. */
const isEnvironmentTenantDocumentDescriptorV1 = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['name', 'mediaType', 'byteCount', 'contentSha256', 'approximateTokenCount']) &&
    typeof value.name === 'string' &&
    exports.ENVIRONMENT_TENANT_DOCUMENT_NAMES_V1.includes(value.name) &&
    value.mediaType === (value.name === 'projection.json' ? 'application/json' : 'text/markdown; charset=utf-8') &&
    (0, internal_js_1.isNonNegativeInteger)(value.byteCount) &&
    value.byteCount > 0 &&
    value.byteCount <= descriptorLimit(value.name) &&
    typeof value.contentSha256 === 'string' &&
    internal_js_1.SHA256_PATTERN.test(value.contentSha256) &&
    (0, internal_js_1.isNonNegativeInteger)(value.approximateTokenCount);
exports.isEnvironmentTenantDocumentDescriptorV1 = isEnvironmentTenantDocumentDescriptorV1;
/** Validates the exact five-file tenant environment descriptor set. */
const isEnvironmentTenantDocumentDescriptorSetV1 = (value) => Array.isArray(value) &&
    value.length === exports.ENVIRONMENT_TENANT_DOCUMENT_NAMES_V1.length &&
    value.every(exports.isEnvironmentTenantDocumentDescriptorV1) &&
    new Set(value.map(item => item.name)).size === exports.ENVIRONMENT_TENANT_DOCUMENT_NAMES_V1.length;
exports.isEnvironmentTenantDocumentDescriptorSetV1 = isEnvironmentTenantDocumentDescriptorSetV1;
/** Builds the canonical tenant tree-digest preimage. */
const buildEnvironmentTenantTreeDigestPreimageV1 = (descriptors) => {
    if (!(0, exports.isEnvironmentTenantDocumentDescriptorSetV1)(descriptors))
        throw new TypeError('Invalid tenant environment descriptor set.');
    return JSON.stringify(descriptors
        .map(descriptor => [descriptor.name, descriptor.contentSha256])
        .sort((left, right) => (left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : 0)));
};
exports.buildEnvironmentTenantTreeDigestPreimageV1 = buildEnvironmentTenantTreeDigestPreimageV1;
/** Validates the atomically visible tenant environment completion pointer. */
const isEnvironmentTenantCompiledGenerationPointerV1 = (value) => (0, internal_js_1.hasSafeContainerShape)(value) &&
    (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['schemaVersion', 'status', 'environmentRunId', 'scope', 'sourceBinding', 'treeDigestSha256', 'fileCount', 'generatedAt']) &&
    value.schemaVersion === 1 &&
    value.status === 'completed' &&
    typeof value.environmentRunId === 'string' &&
    value.environmentRunId.length <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.environmentRunIdAsciiCharacters &&
    internal_js_1.ENVIRONMENT_RUN_ID_PATTERN.test(value.environmentRunId) &&
    value.environmentRunId !== '.' &&
    value.environmentRunId !== '..' &&
    (0, exports.isEnvironmentTenantScopeV1)(value.scope) &&
    (0, exports.isEnvironmentTenantSourceBindingV1)(value.sourceBinding) &&
    scopesEqual(value.scope, value.sourceBinding.scope) &&
    value.environmentRunId !== value.sourceBinding.tenantSyncRunId &&
    typeof value.treeDigestSha256 === 'string' &&
    internal_js_1.SHA256_PATTERN.test(value.treeDigestSha256) &&
    value.fileCount === exports.ENVIRONMENT_TENANT_DOCUMENT_NAMES_V1.length &&
    (0, internal_js_1.isCanonicalUtcTimestamp)(value.generatedAt) &&
    Date.parse(value.generatedAt) >= Date.parse(value.sourceBinding.completedAt) &&
    (0, internal_js_1.utf8ByteLength)(JSON.stringify(value)) <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.completedPointerBytes;
exports.isEnvironmentTenantCompiledGenerationPointerV1 = isEnvironmentTenantCompiledGenerationPointerV1;
/** Narrow syntax guard used before tenant references are passed to the common parser. */
const isEnvironmentTenantLogicalReferenceV1 = (value) => typeof value === 'string' && REFERENCE_PATTERN.test(value) && (0, references_js_1.isEnvironmentLogicalEvidenceReferenceV1)(value);
exports.isEnvironmentTenantLogicalReferenceV1 = isEnvironmentTenantLogicalReferenceV1;
//# sourceMappingURL=tenant.js.map