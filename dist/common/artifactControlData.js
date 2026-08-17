"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.containsForbiddenArtifactControlData = exports.allowedArtifactIdentityField = exports.allowedArtifactReferenceField = exports.ARTIFACT_CONTROL_DATA_MAX_VISITED_NODES = void 0;
const FORBIDDEN_SENSITIVE_FIELDS = new Set([
    'accountkey',
    'accesskey',
    'accesstoken',
    'apikey',
    'authorization',
    'clientsecret',
    'connectionstring',
    'credential',
    'credentials',
    'password',
    'refreshtoken',
    'sastoken',
    'secret',
    'sharedaccesssignature',
    'token',
]);
const FORBIDDEN_PROTOTYPE_FIELDS = new Set(['proto', 'prototype', 'constructor']);
const PHYSICAL_REFERENCE_FIELDS = new Set([
    'artifactpath',
    'blobpath',
    'bloburi',
    'bloburl',
    'containerpath',
    'containeruri',
    'containerurl',
    'filepath',
    'filesystempath',
    'inputmanifestpath',
    'manifestpath',
    'outputmanifestpath',
    'path',
    'physicalpath',
    'physicaluri',
    'physicalurl',
    'sourcepath',
    'sourceuri',
    'sourceurl',
    'storagepath',
    'storageuri',
    'storageurl',
    'uri',
    'url',
]);
const PERCENT_ENCODED_BYTE_PATTERN = /%[0-9A-Fa-f]{2}/;
const URI_SCHEME_PATTERN = /^[A-Za-z][A-Za-z0-9+.-]*:/;
const SHA256_PATTERN = /^[0-9A-Fa-f]{64}$/;
exports.ARTIFACT_CONTROL_DATA_MAX_VISITED_NODES = 100000;
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const hasControlCharacters = (value) => Array.from(value).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);
const normalizeFieldName = (key) => key.replace(/[-_\s]/g, '').toLowerCase();
const hasDotTraversal = (value) => value.split(/[\\/]/).some(segment => segment === '.' || segment === '..');
const isForbiddenReferenceValue = (value, allowUriScheme = false, allowDigestLike = false, rejectDigestLikeValues = false) => hasControlCharacters(value) ||
    PERCENT_ENCODED_BYTE_PATTERN.test(value) ||
    (!allowUriScheme && URI_SCHEME_PATTERN.test(value)) ||
    (rejectDigestLikeValues && !allowDigestLike && SHA256_PATTERN.test(value)) ||
    value.startsWith('/') ||
    value.startsWith('\\\\') ||
    /^[A-Za-z]:[\\/]/.test(value) ||
    hasDotTraversal(value);
const isSafeAzureResourceId = (key, value) => {
    if (key !== 'resourceId' || typeof value !== 'string' || hasControlCharacters(value) || value.includes('\\'))
        return false;
    const segments = value.split('/');
    return (segments.length >= 3 &&
        segments[0] === '' &&
        segments[1].toLowerCase() === 'subscriptions' &&
        segments
            .slice(2)
            .every(segment => segment.trim() === segment && segment.length > 0 && !/[?#%]/.test(segment) && segment !== '.' && segment !== '..'));
};
/** Marks a structurally validated schema field whose logical reference name is allowed. */
const allowedArtifactReferenceField = (object, key) => isRecord(object) ? [{ object, key }] : [];
exports.allowedArtifactReferenceField = allowedArtifactReferenceField;
/** Marks a structurally validated identity field whose value is allowed by its owning schema. */
const allowedArtifactIdentityField = (object, key) => isRecord(object) ? [{ object, key, allowUriScheme: true }] : [];
exports.allowedArtifactIdentityField = allowedArtifactIdentityField;
const indexAllowedArtifactFields = (allowedReferenceFields) => {
    const index = new WeakMap();
    for (const field of allowedReferenceFields) {
        let objectFields = index.get(field.object);
        if (!objectFields) {
            objectFields = new Map();
            index.set(field.object, objectFields);
        }
        const existing = objectFields.get(field.key);
        objectFields.set(field.key, {
            object: field.object,
            key: field.key,
            allowUriScheme: existing?.allowUriScheme || field.allowUriScheme,
            allowUriSchemeInStringArray: existing?.allowUriSchemeInStringArray || field.allowUriSchemeInStringArray,
            allowDigestLike: existing?.allowDigestLike || field.allowDigestLike,
            allowControlField: existing?.allowControlField || field.allowControlField,
            allowChildArtifactFields: existing?.allowChildArtifactFields || field.allowChildArtifactFields,
        });
    }
    return index;
};
const containsForbiddenArtifactControlDataWithIndex = (value, allowedReferenceFields, options) => {
    const pending = [{ kind: 'visit', value, allowIndexedFields: true }];
    const activeContainers = new WeakSet();
    const completedScanPolicies = new WeakMap();
    let visitedNodeCount = 0;
    const hasCompletedStricterScan = (container, scanPolicy) => completedScanPolicies.get(container)?.some(completedPolicy => (completedPolicy & scanPolicy) === completedPolicy) ?? false;
    const completeScan = (container, scanPolicy) => {
        const completedPolicies = completedScanPolicies.get(container) ?? [];
        if (completedPolicies.some(completedPolicy => (completedPolicy & scanPolicy) === completedPolicy))
            return;
        completedScanPolicies.set(container, [...completedPolicies.filter(completedPolicy => (scanPolicy & completedPolicy) !== scanPolicy), scanPolicy]);
    };
    while (pending.length > 0) {
        const candidate = pending.pop();
        if (candidate.kind === 'leave') {
            activeContainers.delete(candidate.container);
            completeScan(candidate.container, candidate.scanPolicy);
            continue;
        }
        if (typeof candidate.value === 'string') {
            if (isForbiddenReferenceValue(candidate.value, false, false, options.rejectDigestLikeValues))
                return true;
            continue;
        }
        if (Array.isArray(candidate.value)) {
            visitedNodeCount += 1;
            if (visitedNodeCount > exports.ARTIFACT_CONTROL_DATA_MAX_VISITED_NODES)
                return true;
            if (activeContainers.has(candidate.value))
                return true;
            const scanPolicy = (candidate.allowIndexedFields ? 1 : 0) |
                (candidate.allowedStringArrayField ? 2 : 0) |
                (candidate.allowedStringArrayField?.allowDigestLike ? 4 : 0);
            if (hasCompletedStricterScan(candidate.value, scanPolicy))
                continue;
            activeContainers.add(candidate.value);
            pending.push({ kind: 'leave', container: candidate.value, scanPolicy });
            for (let index = candidate.value.length - 1; index >= 0; index -= 1) {
                const child = candidate.value[index];
                if (candidate.allowedStringArrayField && typeof child === 'string') {
                    if (isForbiddenReferenceValue(child, true, candidate.allowedStringArrayField.allowDigestLike, options.rejectDigestLikeValues)) {
                        return true;
                    }
                }
                else {
                    pending.push({ kind: 'visit', value: child, allowIndexedFields: candidate.allowIndexedFields });
                }
            }
            continue;
        }
        if (!isRecord(candidate.value))
            continue;
        visitedNodeCount += 1;
        if (visitedNodeCount > exports.ARTIFACT_CONTROL_DATA_MAX_VISITED_NODES)
            return true;
        if (activeContainers.has(candidate.value))
            return true;
        const scanPolicy = candidate.allowIndexedFields ? 1 : 0;
        if (hasCompletedStricterScan(candidate.value, scanPolicy))
            continue;
        activeContainers.add(candidate.value);
        pending.push({ kind: 'leave', container: candidate.value, scanPolicy });
        for (const [key, child] of Object.entries(candidate.value)) {
            if (hasControlCharacters(key))
                return true;
            const normalizedKey = normalizeFieldName(key);
            if (FORBIDDEN_PROTOTYPE_FIELDS.has(normalizedKey))
                return true;
            if (FORBIDDEN_SENSITIVE_FIELDS.has(normalizedKey))
                return true;
            const allowedField = candidate.allowIndexedFields ? allowedReferenceFields.get(candidate.value)?.get(key) : undefined;
            if (options.forbiddenControlFields?.has(normalizedKey) && !allowedField?.allowControlField)
                return true;
            if (options.requireSafeAzureResourceIds && normalizedKey === 'resourceid') {
                if (!isSafeAzureResourceId(key, child))
                    return true;
                continue;
            }
            if (allowedField && typeof child === 'string' && (allowedField.allowUriScheme || allowedField.allowDigestLike)) {
                if (isForbiddenReferenceValue(child, allowedField.allowUriScheme, allowedField.allowDigestLike, options.rejectDigestLikeValues))
                    return true;
                continue;
            }
            if (allowedField?.allowUriSchemeInStringArray && Array.isArray(child)) {
                pending.push({ kind: 'visit', value: child, allowedStringArrayField: allowedField });
                continue;
            }
            if (PHYSICAL_REFERENCE_FIELDS.has(normalizedKey) && !allowedField)
                return true;
            if (isSafeAzureResourceId(key, child))
                continue;
            pending.push({
                kind: 'visit',
                value: child,
                allowIndexedFields: !options.requireAllowedFieldTraversalContext || Boolean(candidate.allowIndexedFields && allowedField?.allowChildArtifactFields),
            });
        }
    }
    return false;
};
/** Rejects normalized sensitive fields and physical-reference control data with bounded traversal. */
const containsForbiddenArtifactControlData = (value, allowedReferenceFields = [], options = {}) => containsForbiddenArtifactControlDataWithIndex(value, indexAllowedArtifactFields(allowedReferenceFields), options);
exports.containsForbiddenArtifactControlData = containsForbiddenArtifactControlData;
//# sourceMappingURL=artifactControlData.js.map