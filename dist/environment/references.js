"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnvironmentLogicalEvidenceReferenceV1 = exports.isEnvironmentLogicalResourceReferenceV1 = exports.isEnvironmentLogicalArtifactReferenceV1 = exports.parseEnvironmentLogicalEvidenceReferenceV1 = exports.deriveEnvironmentAzureResourceTypeV1 = exports.parseEnvironmentLogicalResourceReferenceV1 = exports.buildEnvironmentLogicalResourceReferenceV1 = exports.parseEnvironmentLogicalArtifactReferenceV1 = exports.buildEnvironmentLogicalArtifactReferenceV1 = void 0;
const capabilityIdentifiers_js_1 = require("./capabilityIdentifiers.js");
const contracts_js_1 = require("./contracts.js");
const internal_js_1 = require("./internal.js");
const referenceEncoding_js_1 = require("./referenceEncoding.js");
const ARTIFACT_PREFIX = 'spotto://artifact/v1/';
const RESOURCE_PREFIX = 'spotto://resource/v1/';
const ARTIFACT_KINDS = new Set(contracts_js_1.ENVIRONMENT_ARTIFACT_KINDS_V1);
const isCanonicalScopeQualifiedSubject = (value) => {
    try {
        const parsed = JSON.parse(value);
        return (Array.isArray(parsed) &&
            ((parsed.length === 4 && parsed[0] === 'azure-subscription') || (parsed.length === 2 && parsed[0] === 'azure-tenant')) &&
            parsed
                .slice(1)
                .every(item => (0, internal_js_1.isBoundedString)(item, contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.scopeIdentifierScalars, { trimmed: true, controls: true })) &&
            JSON.stringify(parsed) === value);
    }
    catch {
        return false;
    }
};
const isCanonicalAzureResourceId = (value) => {
    if (!/^\/subscriptions\/[^/]+\/(?:resourceGroups\/[^/]+\/)?providers\/[^/]+\/[^/]+\/[^/]+(?:\/[^/]+\/[^/]+)*$/iu.test(value) ||
        value.includes('\\') ||
        value.includes('?') ||
        value.includes('#') ||
        value.includes('%') ||
        (0, internal_js_1.hasControlCharacter)(value)) {
        return false;
    }
    return value.split('/').every(segment => segment !== '.' && segment !== '..');
};
/** Builds an opaque logical artifact reference. The decoded subject is never a storage path. */
const buildEnvironmentLogicalArtifactReferenceV1 = (artifactKind, canonicalScopeQualifiedSubject) => {
    if (!ARTIFACT_KINDS.has(artifactKind))
        throw new TypeError('Unsupported V1 environment artifact kind.');
    // Bound untrusted input before JSON parsing. Encoding also validates Unicode and bytes.
    const encodedSubject = (0, referenceEncoding_js_1.encodeEnvironmentReferencePayload)(canonicalScopeQualifiedSubject);
    if (!(artifactKind === 'environment-capability-evidence'
        ? (0, capabilityIdentifiers_js_1.parseEnvironmentCapabilityEvidenceSubjectV1)(canonicalScopeQualifiedSubject)
        : isCanonicalScopeQualifiedSubject(canonicalScopeQualifiedSubject))) {
        throw new TypeError('Artifact subject is not a canonical V1 scope-qualified subject.');
    }
    return `${ARTIFACT_PREFIX}${artifactKind}/${encodedSubject}`;
};
exports.buildEnvironmentLogicalArtifactReferenceV1 = buildEnvironmentLogicalArtifactReferenceV1;
/** Parses a V1 logical artifact reference into its allowlisted kind and opaque subject. */
const parseEnvironmentLogicalArtifactReferenceV1 = (value) => {
    if (typeof value !== 'string' || !value.startsWith(ARTIFACT_PREFIX))
        return null;
    const remainder = value.slice(ARTIFACT_PREFIX.length);
    const separator = remainder.indexOf('/');
    if (separator <= 0 || remainder.indexOf('/', separator + 1) >= 0)
        return null;
    const artifactKind = remainder.slice(0, separator);
    if (!ARTIFACT_KINDS.has(artifactKind))
        return null;
    const subject = (0, referenceEncoding_js_1.decodeEnvironmentReferencePayload)(remainder.slice(separator + 1));
    if (subject === null ||
        !(artifactKind === 'environment-capability-evidence'
            ? (0, capabilityIdentifiers_js_1.parseEnvironmentCapabilityEvidenceSubjectV1)(subject)
            : isCanonicalScopeQualifiedSubject(subject))) {
        return null;
    }
    return { kind: 'artifact', artifactKind: artifactKind, subject };
};
exports.parseEnvironmentLogicalArtifactReferenceV1 = parseEnvironmentLogicalArtifactReferenceV1;
/** Builds an opaque logical Azure resource reference from a canonical resource ID. */
const buildEnvironmentLogicalResourceReferenceV1 = (canonicalAzureResourceId) => {
    if (!(0, internal_js_1.isBoundedString)(canonicalAzureResourceId, contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.scopeIdentifierScalars, { trimmed: true, controls: true })) {
        throw new TypeError('Azure resource ID must be bounded and safe.');
    }
    if (!isCanonicalAzureResourceId(canonicalAzureResourceId))
        throw new TypeError('Azure resource ID is not canonical or safe.');
    return `${RESOURCE_PREFIX}${(0, referenceEncoding_js_1.encodeEnvironmentReferencePayload)(canonicalAzureResourceId)}`;
};
exports.buildEnvironmentLogicalResourceReferenceV1 = buildEnvironmentLogicalResourceReferenceV1;
/** Parses a V1 logical resource reference into a canonical Azure resource ID. */
const parseEnvironmentLogicalResourceReferenceV1 = (value) => {
    if (typeof value !== 'string' || !value.startsWith(RESOURCE_PREFIX))
        return null;
    const resourceId = (0, referenceEncoding_js_1.decodeEnvironmentReferencePayload)(value.slice(RESOURCE_PREFIX.length));
    if (resourceId === null || !isCanonicalAzureResourceId(resourceId))
        return null;
    return { kind: 'resource', resourceId };
};
exports.parseEnvironmentLogicalResourceReferenceV1 = parseEnvironmentLogicalResourceReferenceV1;
/**
 * Derives the canonical Azure resource type from a canonical ARM resource ID.
 * Resource names are consumed structurally, so a resource named `providers`
 * cannot be mistaken for an extension-resource provider boundary.
 */
const deriveEnvironmentAzureResourceTypeV1 = (canonicalAzureResourceId) => {
    if (!isCanonicalAzureResourceId(canonicalAzureResourceId))
        return null;
    const segments = canonicalAzureResourceId.toLowerCase().split('/').filter(Boolean);
    const firstProviderIndex = segments.indexOf('providers');
    if (firstProviderIndex < 0)
        return null;
    let providerIndex = firstProviderIndex;
    let namespace = segments[providerIndex + 1];
    let typeSegments = [];
    let index = providerIndex + 2;
    while (namespace && index < segments.length) {
        const typeOrProviderMarker = segments[index];
        if (!typeOrProviderMarker)
            return null;
        if (typeOrProviderMarker === 'providers') {
            providerIndex = index;
            namespace = segments[providerIndex + 1];
            typeSegments = [];
            index = providerIndex + 2;
            continue;
        }
        typeSegments.push(typeOrProviderMarker);
        if (segments[index + 1] === undefined)
            return null;
        index += 2;
    }
    if (!namespace || typeSegments.length === 0)
        return null;
    const resourceType = `${namespace}/${typeSegments.join('/')}`;
    return [...resourceType].length <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.safeLabelScalars ? resourceType : null;
};
exports.deriveEnvironmentAzureResourceTypeV1 = deriveEnvironmentAzureResourceTypeV1;
/** Parses either closed V1 logical evidence-reference kind. */
const parseEnvironmentLogicalEvidenceReferenceV1 = (value) => (0, exports.parseEnvironmentLogicalArtifactReferenceV1)(value) ?? (0, exports.parseEnvironmentLogicalResourceReferenceV1)(value);
exports.parseEnvironmentLogicalEvidenceReferenceV1 = parseEnvironmentLogicalEvidenceReferenceV1;
/** Returns true when a value is a canonical V1 logical artifact reference. */
const isEnvironmentLogicalArtifactReferenceV1 = (value) => (0, exports.parseEnvironmentLogicalArtifactReferenceV1)(value) !== null;
exports.isEnvironmentLogicalArtifactReferenceV1 = isEnvironmentLogicalArtifactReferenceV1;
/** Returns true when a value is a canonical V1 logical resource reference. */
const isEnvironmentLogicalResourceReferenceV1 = (value) => (0, exports.parseEnvironmentLogicalResourceReferenceV1)(value) !== null;
exports.isEnvironmentLogicalResourceReferenceV1 = isEnvironmentLogicalResourceReferenceV1;
/** Returns true when a value is one of the closed V1 logical evidence-reference kinds. */
const isEnvironmentLogicalEvidenceReferenceV1 = (value) => (0, exports.parseEnvironmentLogicalEvidenceReferenceV1)(value) !== null;
exports.isEnvironmentLogicalEvidenceReferenceV1 = isEnvironmentLogicalEvidenceReferenceV1;
//# sourceMappingURL=references.js.map