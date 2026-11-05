import { isEnvironmentCapabilityIdentifierV1 } from './capabilityIdentifiers.js';
export { isEnvironmentCapabilityIdentifierV1 } from './capabilityIdentifiers.js';
import { environmentAwsScopesEqual, isEnvironmentAwsAccountScopeV1 } from './awsIdentity.js';
import { isEnvironmentAwsAccountSourceBindingV1 } from './awsValidation.js';
import { parseEnvironmentAwsLogicalArtifactReferenceV1, parseEnvironmentAwsLogicalResourceReferenceV1 } from './awsReferences.js';
import { parseEnvironmentCapabilityEvidenceSubjectV1 } from './capabilityIdentifiers.js';
import { ENVIRONMENT_DOCUMENT_NAMES_V1 } from './contracts.js';
import { ENVIRONMENT_TENANT_DOCUMENT_NAMES_V1, isEnvironmentTenantScopeV1, isEnvironmentTenantSourceBindingV1 } from './tenant.js';
import { SHA256_PATTERN, hasExactKeys, hasSafeContainerShape, isNonNegativeInteger, isRecord, isSafeLabel, isBoundedString, isCanonicalUtcTimestamp, utf8ByteLength, } from './internal.js';
import { isEnvironmentScopeV1, isEnvironmentSourceBindingV1, isEnvironmentCoverageStateV1 } from './validation.js';
import { isEnvironmentMoneyValueWithProvenanceV1 } from './moneyValidation.js';
import { isEnvironmentLogicalEvidenceReferenceV1, parseEnvironmentLogicalArtifactReferenceV1 } from './references.js';
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
export const isEnvironmentCapabilityFileNameV1 = (value, mediaType) => typeof value === 'string' &&
    (mediaType === 'application/json' || mediaType === 'text/markdown; charset=utf-8') &&
    value.length <= 100 &&
    ![...ENVIRONMENT_DOCUMENT_NAMES_V1, ...ENVIRONMENT_TENANT_DOCUMENT_NAMES_V1].some(name => name === value) &&
    (mediaType === 'application/json' ? /^[a-z][a-z0-9]*(?:[-_.][a-z0-9]+)*\.json$/u : /^[a-z][a-z0-9]*(?:[-_.][a-z0-9]+)*\.md$/u).test(value);
export const isEnvironmentCapabilityScopeV1 = (value) => isEnvironmentScopeV1(value) || isEnvironmentTenantScopeV1(value) || isEnvironmentAwsAccountScopeV1(value);
export function environmentCapabilityScopesEqualV1(left, right) {
    if (left.kind === 'aws-account' || right.kind === 'aws-account')
        return environmentAwsScopesEqual(left, right);
    return (left.kind === right.kind &&
        left.tenantId === right.tenantId &&
        (left.kind !== 'azure-subscription' ||
            (right.kind === 'azure-subscription' && left.companyId === right.companyId && left.subscriptionId === right.subscriptionId)));
}
export const isEnvironmentCapabilitySourceBindingV1 = (value) => isEnvironmentSourceBindingV1(value) || isEnvironmentTenantSourceBindingV1(value) || isEnvironmentAwsAccountSourceBindingV1(value);
const features = (value, allowEmpty) => Array.isArray(value) &&
    hasSafeContainerShape(value, 0, new Set(), true) &&
    value.length <= 16 &&
    (allowEmpty || value.length > 0) &&
    Array.from(value).every(isEnvironmentCapabilityIdentifierV1) &&
    new Set(value).size === value.length;
const integrity = (value, mediaType, maxBytes) => isRecord(value) &&
    hasExactKeys(value, ['mediaType', 'byteCount', 'contentSha256', 'approximateTokenCount']) &&
    value.mediaType === mediaType &&
    isNonNegativeInteger(value.byteCount) &&
    value.byteCount > 0 &&
    value.byteCount <= maxBytes &&
    typeof value.contentSha256 === 'string' &&
    SHA256_PATTERN.test(value.contentSha256) &&
    isNonNegativeInteger(value.approximateTokenCount) &&
    value.approximateTokenCount === Math.ceil(value.byteCount / 4);
export const isEnvironmentCapabilityEvidenceDescriptorV1 = (value) => {
    if (!isRecord(value) ||
        !isEnvironmentCapabilityIdentifierV1(value.evidenceId) ||
        !isSafeLabel(value.title) ||
        !features(value.requiredFeatures, true))
        return false;
    return value.mode === 'immutable'
        ? hasExactKeys(value, ['evidenceId', 'title', 'requiredFeatures', 'mode', 'fileName', 'content']) &&
            isEnvironmentCapabilityFileNameV1(value.fileName, 'application/json') &&
            integrity(value.content, 'application/json', 32 * 1024)
        : value.mode === 'runtime' &&
            hasExactKeys(value, ['evidenceId', 'title', 'requiredFeatures', 'mode', 'projectorId']) &&
            isEnvironmentCapabilityIdentifierV1(value.projectorId);
};
export const isEnvironmentCapabilityDocumentV1 = (value) => {
    if (!hasSafeContainerShape(value, 0, new Set(), true) ||
        !isRecord(value) ||
        !hasExactKeys(value, ['documentId', 'fileName', 'capabilityId', 'title', 'scope', 'requiredFeatures', 'content', 'evidence']))
        return false;
    if (!isEnvironmentCapabilityIdentifierV1(value.documentId) ||
        RESERVED_IDS.has(value.documentId) ||
        !isEnvironmentCapabilityIdentifierV1(value.capabilityId) ||
        !isSafeLabel(value.title) ||
        !isEnvironmentCapabilityScopeV1(value.scope) ||
        !features(value.requiredFeatures, false) ||
        !value.requiredFeatures.includes(value.capabilityId) ||
        !isEnvironmentCapabilityFileNameV1(value.fileName, 'text/markdown; charset=utf-8') ||
        !integrity(value.content, 'text/markdown; charset=utf-8', 8192) ||
        !Array.isArray(value.evidence) ||
        value.evidence.length > 4 ||
        !Array.from(value.evidence).every(isEnvironmentCapabilityEvidenceDescriptorV1))
        return false;
    const evidence = value.evidence;
    return (new Set(evidence.map(item => item.evidenceId)).size === evidence.length &&
        new Set([value.fileName, ...evidence.flatMap(item => (item.mode === 'immutable' ? [item.fileName] : []))]).size ===
            1 + evidence.filter(item => item.mode === 'immutable').length);
};
export const isEnvironmentCapabilityDocumentSetV1 = (value, scope) => {
    if (!isEnvironmentCapabilityScopeV1(scope) ||
        !hasSafeContainerShape(value, 0, new Set(), true) ||
        !Array.isArray(value) ||
        value.length > 16 ||
        !Array.from(value).every(isEnvironmentCapabilityDocumentV1))
        return false;
    const documents = value;
    const files = documents.flatMap(doc => [doc.fileName, ...doc.evidence.flatMap(item => (item.mode === 'immutable' ? [item.fileName] : []))]);
    return (documents.every(doc => environmentCapabilityScopesEqualV1(doc.scope, scope)) &&
        new Set(documents.map(doc => doc.documentId)).size === documents.length &&
        new Set(files).size === files.length);
};
export function getEnvironmentOptionalDocumentDescriptorsV1(pointer) {
    if (pointer.optionalDocuments === undefined)
        return [];
    if (!isEnvironmentCapabilityDocumentSetV1(pointer.optionalDocuments, pointer.scope))
        throw new TypeError('Invalid capability document set.');
    return pointer.optionalDocuments;
}
const decimal = (value) => typeof value === 'string' &&
    value.length <= 128 &&
    /^-?(?:0|[1-9]\d*)(?:\.\d*[1-9])?$/u.test(value) &&
    value !== '-0' &&
    Number.isFinite(Number(value));
export const isEnvironmentCapabilityFactV1 = (value) => {
    if (!isRecord(value) ||
        !hasExactKeys(value, ['factId', 'label', 'value']) ||
        !isEnvironmentCapabilityIdentifierV1(value.factId) ||
        !isSafeLabel(value.label) ||
        !isRecord(value.value))
        return false;
    const item = value.value;
    switch (item.kind) {
        case 'text':
            return hasExactKeys(item, ['kind', 'value']) && isBoundedString(item.value, 4096, { controls: true });
        case 'boolean':
            return hasExactKeys(item, ['kind', 'value']) && typeof item.value === 'boolean';
        case 'unknown':
            return hasExactKeys(item, ['kind', 'reason']) && isSafeLabel(item.reason);
        case 'quantity':
            return (hasExactKeys(item, ['kind', 'amount', 'unit', 'basis']) &&
                decimal(item.amount) &&
                isSafeLabel(item.unit) &&
                ['observed', 'authoritative-total', 'estimated'].includes(item.basis));
        case 'money': {
            if (!hasExactKeys(item, ['kind', 'value', 'meaning', 'valuation', 'additivity'], ['additiveGroupId']) ||
                !isRecord(item.value) ||
                !isSafeLabel(item.value.provenance) ||
                !isEnvironmentMoneyValueWithProvenanceV1(item.value, new Set([item.value.provenance])) ||
                item.value.amount.length > 128 ||
                !Number.isFinite(Number(item.value.amount)) ||
                !['observed-spend', 'price', 'potential-savings', 'review-value'].includes(item.meaning) ||
                !['source-snapshot', 'current-company'].includes(item.valuation))
                return false;
            return item.additivity === 'non-additive'
                ? item.additiveGroupId === undefined && item.value.savingsAdditivity !== 'additive'
                : item.additivity === 'additive-within-group' &&
                    isEnvironmentCapabilityIdentifierV1(item.additiveGroupId) &&
                    item.value.savingsAdditivity !== 'scenario-non-additive';
        }
        default:
            return false;
    }
};
export const isEnvironmentCapabilityFactsV1 = (value) => {
    if (!hasSafeContainerShape(value, 0, new Set(), true) ||
        !isRecord(value) ||
        !hasExactKeys(value, [
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
        !isEnvironmentCapabilityIdentifierV1(value.capabilityId) ||
        !isEnvironmentCapabilityIdentifierV1(value.documentId) ||
        RESERVED_IDS.has(value.documentId) ||
        !isEnvironmentCapabilityIdentifierV1(value.evidenceId) ||
        !isEnvironmentCapabilityScopeV1(value.scope) ||
        !isEnvironmentCapabilitySourceBindingV1(value.sourceBinding) ||
        !environmentCapabilityScopesEqualV1(value.scope, value.sourceBinding.scope) ||
        !isCanonicalUtcTimestamp(value.observedAt) ||
        !isEnvironmentCoverageStateV1(value.coverage) ||
        !Array.isArray(value.sections) ||
        value.sections.length > 10)
        return false;
    let factCount = 0;
    const sectionIds = new Set();
    for (const section of Array.from(value.sections)) {
        if (!isRecord(section) ||
            !hasExactKeys(section, ['sectionId', 'title', 'facts']) ||
            !isEnvironmentCapabilityIdentifierV1(section.sectionId) ||
            sectionIds.has(section.sectionId) ||
            !isSafeLabel(section.title) ||
            !isRecord(section.facts))
            return false;
        sectionIds.add(section.sectionId);
        const list = section.facts;
        if (!hasExactKeys(list, ['items', 'totalCount', 'includedCount', 'truncated'], ['continuationReference']) ||
            !Array.isArray(list.items) ||
            !Array.from(list.items).every(isEnvironmentCapabilityFactV1) ||
            !isNonNegativeInteger(list.totalCount) ||
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
    return utf8ByteLength(JSON.stringify(value)) <= 32 * 1024;
};
const isCapabilityContinuationReference = (value, scope) => {
    const artifact = parseEnvironmentLogicalArtifactReferenceV1(value);
    const capability = artifact?.artifactKind === 'environment-capability-evidence' && parseEnvironmentCapabilityEvidenceSubjectV1(artifact.subject);
    if (capability)
        return environmentCapabilityScopesEqualV1(scope, capability.scope);
    if (scope.kind !== 'aws-account')
        return isEnvironmentLogicalEvidenceReferenceV1(value);
    const aws = parseEnvironmentAwsLogicalArtifactReferenceV1(value) ?? parseEnvironmentAwsLogicalResourceReferenceV1(value);
    return Boolean(aws && environmentAwsScopesEqual(scope, aws.scope));
};
export const isEnvironmentImmutableCapabilityFactsV1 = (value) => isEnvironmentCapabilityFactsV1(value) &&
    value.sections.every(section => section.facts.items.every(fact => fact.value.kind !== 'money' || fact.value.valuation === 'source-snapshot'));
