"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnvironmentImmutableCapabilityFactsV1 = exports.isEnvironmentCapabilityFactsV1 = exports.isEnvironmentCapabilityFactV1 = exports.isEnvironmentCapabilityDocumentSetV1 = exports.isEnvironmentCapabilityDocumentV1 = exports.isEnvironmentCapabilityEvidenceDescriptorV1 = exports.isEnvironmentCapabilitySourceBindingV1 = exports.isEnvironmentCapabilityScopeV1 = exports.isEnvironmentCapabilityFileNameV1 = exports.isEnvironmentCapabilityIdentifierV1 = void 0;
exports.environmentCapabilityScopesEqualV1 = environmentCapabilityScopesEqualV1;
exports.getEnvironmentOptionalDocumentDescriptorsV1 = getEnvironmentOptionalDocumentDescriptorsV1;
const capabilityIdentifiers_js_1 = require("./capabilityIdentifiers.js");
var capabilityIdentifiers_js_2 = require("./capabilityIdentifiers.js");
Object.defineProperty(exports, "isEnvironmentCapabilityIdentifierV1", { enumerable: true, get: function () { return capabilityIdentifiers_js_2.isEnvironmentCapabilityIdentifierV1; } });
const awsIdentity_js_1 = require("./awsIdentity.js");
const awsValidation_js_1 = require("./awsValidation.js");
const awsReferences_js_1 = require("./awsReferences.js");
const capabilityIdentifiers_js_3 = require("./capabilityIdentifiers.js");
const contracts_js_1 = require("./contracts.js");
const tenant_js_1 = require("./tenant.js");
const internal_js_1 = require("./internal.js");
const validation_js_1 = require("./validation.js");
const moneyValidation_js_1 = require("./moneyValidation.js");
const references_js_1 = require("./references.js");
const RESERVED_IDS = new Set([
    'catalogue',
    'evidence',
    'environment-index',
    'projection',
    'cost',
    'security',
    'governance',
    'reliability',
    'performance',
    'operations',
    'tenant-identity',
    'tenant-governance',
    'tenant-commitments',
]);
const isEnvironmentCapabilityFileNameV1 = (value, mediaType) => typeof value === 'string' &&
    (mediaType === 'application/json' || mediaType === 'text/markdown; charset=utf-8') &&
    value.length <= 100 &&
    ![...contracts_js_1.ENVIRONMENT_DOCUMENT_NAMES_V1, ...tenant_js_1.ENVIRONMENT_TENANT_DOCUMENT_NAMES_V1].some(name => name === value) &&
    (mediaType === 'application/json' ? /^[a-z][a-z0-9]*(?:[-_.][a-z0-9]+)*\.json$/u : /^[a-z][a-z0-9]*(?:[-_.][a-z0-9]+)*\.md$/u).test(value);
exports.isEnvironmentCapabilityFileNameV1 = isEnvironmentCapabilityFileNameV1;
const isEnvironmentCapabilityScopeV1 = (value) => (0, validation_js_1.isEnvironmentScopeV1)(value) || (0, tenant_js_1.isEnvironmentTenantScopeV1)(value) || (0, awsIdentity_js_1.isEnvironmentAwsAccountScopeV1)(value);
exports.isEnvironmentCapabilityScopeV1 = isEnvironmentCapabilityScopeV1;
function environmentCapabilityScopesEqualV1(left, right) {
    if (left.kind === 'aws-account' || right.kind === 'aws-account')
        return (0, awsIdentity_js_1.environmentAwsScopesEqual)(left, right);
    return (left.kind === right.kind &&
        left.tenantId === right.tenantId &&
        (left.kind !== 'azure-subscription' ||
            (right.kind === 'azure-subscription' && left.companyId === right.companyId && left.subscriptionId === right.subscriptionId)));
}
const isEnvironmentCapabilitySourceBindingV1 = (value) => (0, validation_js_1.isEnvironmentSourceBindingV1)(value) || (0, tenant_js_1.isEnvironmentTenantSourceBindingV1)(value) || (0, awsValidation_js_1.isEnvironmentAwsAccountSourceBindingV1)(value);
exports.isEnvironmentCapabilitySourceBindingV1 = isEnvironmentCapabilitySourceBindingV1;
const features = (value, allowEmpty) => Array.isArray(value) &&
    (0, internal_js_1.hasSafeContainerShape)(value, 0, new Set(), true) &&
    value.length <= 16 &&
    (allowEmpty || value.length > 0) &&
    Array.from(value).every(capabilityIdentifiers_js_1.isEnvironmentCapabilityIdentifierV1) &&
    new Set(value).size === value.length;
const integrity = (value, mediaType, maxBytes) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['mediaType', 'byteCount', 'contentSha256', 'approximateTokenCount']) &&
    value.mediaType === mediaType &&
    (0, internal_js_1.isNonNegativeInteger)(value.byteCount) &&
    value.byteCount > 0 &&
    value.byteCount <= maxBytes &&
    typeof value.contentSha256 === 'string' &&
    internal_js_1.SHA256_PATTERN.test(value.contentSha256) &&
    (0, internal_js_1.isNonNegativeInteger)(value.approximateTokenCount) &&
    value.approximateTokenCount === Math.ceil(value.byteCount / 4);
const isEnvironmentCapabilityEvidenceDescriptorV1 = (value) => {
    if (!(0, internal_js_1.isRecord)(value) ||
        !(0, capabilityIdentifiers_js_1.isEnvironmentCapabilityIdentifierV1)(value.evidenceId) ||
        !(0, internal_js_1.isSafeLabel)(value.title) ||
        !features(value.requiredFeatures, true))
        return false;
    return value.mode === 'immutable'
        ? (0, internal_js_1.hasExactKeys)(value, ['evidenceId', 'title', 'requiredFeatures', 'mode', 'fileName', 'content']) &&
            (0, exports.isEnvironmentCapabilityFileNameV1)(value.fileName, 'application/json') &&
            integrity(value.content, 'application/json', 32 * 1024)
        : value.mode === 'runtime' &&
            (0, internal_js_1.hasExactKeys)(value, ['evidenceId', 'title', 'requiredFeatures', 'mode', 'projectorId']) &&
            (0, capabilityIdentifiers_js_1.isEnvironmentCapabilityIdentifierV1)(value.projectorId);
};
exports.isEnvironmentCapabilityEvidenceDescriptorV1 = isEnvironmentCapabilityEvidenceDescriptorV1;
const isEnvironmentCapabilityDocumentV1 = (value) => {
    if (!(0, internal_js_1.hasSafeContainerShape)(value, 0, new Set(), true) ||
        !(0, internal_js_1.isRecord)(value) ||
        !(0, internal_js_1.hasExactKeys)(value, ['documentId', 'fileName', 'capabilityId', 'title', 'scope', 'requiredFeatures', 'content', 'evidence']))
        return false;
    if (!(0, capabilityIdentifiers_js_1.isEnvironmentCapabilityIdentifierV1)(value.documentId) ||
        RESERVED_IDS.has(value.documentId) ||
        !(0, capabilityIdentifiers_js_1.isEnvironmentCapabilityIdentifierV1)(value.capabilityId) ||
        !(0, internal_js_1.isSafeLabel)(value.title) ||
        !(0, exports.isEnvironmentCapabilityScopeV1)(value.scope) ||
        !features(value.requiredFeatures, false) ||
        !value.requiredFeatures.includes(value.capabilityId) ||
        !(0, exports.isEnvironmentCapabilityFileNameV1)(value.fileName, 'text/markdown; charset=utf-8') ||
        !integrity(value.content, 'text/markdown; charset=utf-8', 8192) ||
        !Array.isArray(value.evidence) ||
        value.evidence.length > 4 ||
        !Array.from(value.evidence).every(exports.isEnvironmentCapabilityEvidenceDescriptorV1))
        return false;
    const evidence = value.evidence;
    return (new Set(evidence.map(item => item.evidenceId)).size === evidence.length &&
        new Set([value.fileName, ...evidence.flatMap(item => (item.mode === 'immutable' ? [item.fileName] : []))]).size ===
            1 + evidence.filter(item => item.mode === 'immutable').length);
};
exports.isEnvironmentCapabilityDocumentV1 = isEnvironmentCapabilityDocumentV1;
const isEnvironmentCapabilityDocumentSetV1 = (value, scope) => {
    if (!(0, exports.isEnvironmentCapabilityScopeV1)(scope) ||
        !(0, internal_js_1.hasSafeContainerShape)(value, 0, new Set(), true) ||
        !Array.isArray(value) ||
        value.length > 16 ||
        !Array.from(value).every(exports.isEnvironmentCapabilityDocumentV1))
        return false;
    const documents = value;
    const files = documents.flatMap(doc => [doc.fileName, ...doc.evidence.flatMap(item => (item.mode === 'immutable' ? [item.fileName] : []))]);
    return (documents.every(doc => environmentCapabilityScopesEqualV1(doc.scope, scope)) &&
        new Set(documents.map(doc => doc.documentId)).size === documents.length &&
        new Set(files).size === files.length);
};
exports.isEnvironmentCapabilityDocumentSetV1 = isEnvironmentCapabilityDocumentSetV1;
function getEnvironmentOptionalDocumentDescriptorsV1(pointer) {
    if (pointer.optionalDocuments === undefined)
        return [];
    if (!(0, exports.isEnvironmentCapabilityDocumentSetV1)(pointer.optionalDocuments, pointer.scope))
        throw new TypeError('Invalid capability document set.');
    return pointer.optionalDocuments;
}
const decimal = (value) => typeof value === 'string' &&
    value.length <= 128 &&
    /^-?(?:0|[1-9]\d*)(?:\.\d*[1-9])?$/u.test(value) &&
    value !== '-0' &&
    Number.isFinite(Number(value));
const isEnvironmentCapabilityFactV1 = (value) => {
    if (!(0, internal_js_1.isRecord)(value) ||
        !(0, internal_js_1.hasExactKeys)(value, ['factId', 'label', 'value']) ||
        !(0, capabilityIdentifiers_js_1.isEnvironmentCapabilityIdentifierV1)(value.factId) ||
        !(0, internal_js_1.isSafeLabel)(value.label) ||
        !(0, internal_js_1.isRecord)(value.value))
        return false;
    const item = value.value;
    switch (item.kind) {
        case 'text':
            return (0, internal_js_1.hasExactKeys)(item, ['kind', 'value']) && (0, internal_js_1.isBoundedString)(item.value, 4096, { controls: true });
        case 'boolean':
            return (0, internal_js_1.hasExactKeys)(item, ['kind', 'value']) && typeof item.value === 'boolean';
        case 'unknown':
            return (0, internal_js_1.hasExactKeys)(item, ['kind', 'reason']) && (0, internal_js_1.isSafeLabel)(item.reason);
        case 'quantity':
            return ((0, internal_js_1.hasExactKeys)(item, ['kind', 'amount', 'unit', 'basis']) &&
                decimal(item.amount) &&
                (0, internal_js_1.isSafeLabel)(item.unit) &&
                ['observed', 'authoritative-total', 'estimated'].includes(item.basis));
        case 'money': {
            if (!(0, internal_js_1.hasExactKeys)(item, ['kind', 'value', 'meaning', 'valuation', 'additivity'], ['additiveGroupId']) ||
                !(0, internal_js_1.isRecord)(item.value) ||
                !(0, internal_js_1.isSafeLabel)(item.value.provenance) ||
                !(0, moneyValidation_js_1.isEnvironmentMoneyValueWithProvenanceV1)(item.value, new Set([item.value.provenance])) ||
                item.value.amount.length > 128 ||
                !Number.isFinite(Number(item.value.amount)) ||
                !['observed-spend', 'price', 'potential-savings', 'review-value'].includes(item.meaning) ||
                !['source-snapshot', 'current-company'].includes(item.valuation))
                return false;
            return item.additivity === 'non-additive'
                ? item.additiveGroupId === undefined && item.value.savingsAdditivity !== 'additive'
                : item.additivity === 'additive-within-group' &&
                    (0, capabilityIdentifiers_js_1.isEnvironmentCapabilityIdentifierV1)(item.additiveGroupId) &&
                    item.value.savingsAdditivity !== 'scenario-non-additive';
        }
        default:
            return false;
    }
};
exports.isEnvironmentCapabilityFactV1 = isEnvironmentCapabilityFactV1;
const isEnvironmentCapabilityFactsV1 = (value) => {
    if (!(0, internal_js_1.hasSafeContainerShape)(value, 0, new Set(), true) ||
        !(0, internal_js_1.isRecord)(value) ||
        !(0, internal_js_1.hasExactKeys)(value, [
            'schemaVersion',
            'capabilityId',
            'documentId',
            'evidenceId',
            'scope',
            'sourceBinding',
            'observedAt',
            'coverage',
            'sections',
        ]) ||
        value.schemaVersion !== 1 ||
        !(0, capabilityIdentifiers_js_1.isEnvironmentCapabilityIdentifierV1)(value.capabilityId) ||
        !(0, capabilityIdentifiers_js_1.isEnvironmentCapabilityIdentifierV1)(value.documentId) ||
        RESERVED_IDS.has(value.documentId) ||
        !(0, capabilityIdentifiers_js_1.isEnvironmentCapabilityIdentifierV1)(value.evidenceId) ||
        !(0, exports.isEnvironmentCapabilityScopeV1)(value.scope) ||
        !(0, exports.isEnvironmentCapabilitySourceBindingV1)(value.sourceBinding) ||
        !environmentCapabilityScopesEqualV1(value.scope, value.sourceBinding.scope) ||
        !(0, internal_js_1.isCanonicalUtcTimestamp)(value.observedAt) ||
        !(0, validation_js_1.isEnvironmentCoverageStateV1)(value.coverage) ||
        !Array.isArray(value.sections) ||
        value.sections.length > 10)
        return false;
    let factCount = 0;
    const sectionIds = new Set();
    for (const section of Array.from(value.sections)) {
        if (!(0, internal_js_1.isRecord)(section) ||
            !(0, internal_js_1.hasExactKeys)(section, ['sectionId', 'title', 'facts']) ||
            !(0, capabilityIdentifiers_js_1.isEnvironmentCapabilityIdentifierV1)(section.sectionId) ||
            sectionIds.has(section.sectionId) ||
            !(0, internal_js_1.isSafeLabel)(section.title) ||
            !(0, internal_js_1.isRecord)(section.facts))
            return false;
        sectionIds.add(section.sectionId);
        const list = section.facts;
        if (!(0, internal_js_1.hasExactKeys)(list, ['items', 'totalCount', 'includedCount', 'truncated'], ['continuationReference']) ||
            !Array.isArray(list.items) ||
            !Array.from(list.items).every(exports.isEnvironmentCapabilityFactV1) ||
            !(0, internal_js_1.isNonNegativeInteger)(list.totalCount) ||
            list.includedCount !== list.items.length ||
            list.totalCount < list.items.length ||
            list.truncated !== list.totalCount > list.items.length ||
            (list.continuationReference !== undefined && !isCapabilityContinuationReference(list.continuationReference, value.scope)) ||
            (list.truncated && list.continuationReference === undefined) ||
            new Set(list.items.map(item => item.factId)).size !== list.items.length)
            return false;
        factCount += list.items.length;
        if (factCount > 50)
            return false;
    }
    return (0, internal_js_1.utf8ByteLength)(JSON.stringify(value)) <= 32 * 1024;
};
exports.isEnvironmentCapabilityFactsV1 = isEnvironmentCapabilityFactsV1;
const isCapabilityContinuationReference = (value, scope) => {
    const artifact = (0, references_js_1.parseEnvironmentLogicalArtifactReferenceV1)(value);
    const capability = artifact?.artifactKind === 'environment-capability-evidence' && (0, capabilityIdentifiers_js_3.parseEnvironmentCapabilityEvidenceSubjectV1)(artifact.subject);
    if (capability)
        return environmentCapabilityScopesEqualV1(scope, capability.scope);
    if (scope.kind !== 'aws-account')
        return (0, references_js_1.isEnvironmentLogicalEvidenceReferenceV1)(value);
    const aws = (0, awsReferences_js_1.parseEnvironmentAwsLogicalArtifactReferenceV1)(value) ?? (0, awsReferences_js_1.parseEnvironmentAwsLogicalResourceReferenceV1)(value);
    return Boolean(aws && (0, awsIdentity_js_1.environmentAwsScopesEqual)(scope, aws.scope));
};
const isEnvironmentImmutableCapabilityFactsV1 = (value) => (0, exports.isEnvironmentCapabilityFactsV1)(value) &&
    value.sections.every(section => section.facts.items.every(fact => fact.value.kind !== 'money' || fact.value.valuation === 'source-snapshot'));
exports.isEnvironmentImmutableCapabilityFactsV1 = isEnvironmentImmutableCapabilityFactsV1;
//# sourceMappingURL=optionalDocuments.js.map