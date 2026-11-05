import { parseEnvironmentCapabilityEvidenceSubjectV1 } from './capabilityIdentifiers.js';
import { ENVIRONMENT_ARTIFACT_KINDS_V1, ENVIRONMENT_CONTRACT_LIMITS_V1, } from './contracts.js';
import { hasControlCharacter, isBoundedString } from './internal.js';
import { encodeEnvironmentReferencePayload, decodeEnvironmentReferencePayload as decodePayload } from './referenceEncoding.js';
const ARTIFACT_PREFIX = 'spotto://artifact/v1/';
const RESOURCE_PREFIX = 'spotto://resource/v1/';
const ARTIFACT_KINDS = new Set(ENVIRONMENT_ARTIFACT_KINDS_V1);
const isCanonicalScopeQualifiedSubject = (value) => {
    try {
        const parsed = JSON.parse(value);
        return (Array.isArray(parsed) &&
            ((parsed.length === 4 && parsed[0] === 'azure-subscription') || (parsed.length === 2 && parsed[0] === 'azure-tenant')) &&
            parsed
                .slice(1)
                .every(item => isBoundedString(item, ENVIRONMENT_CONTRACT_LIMITS_V1.scopeIdentifierScalars, { trimmed: true, controls: true })) &&
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
        hasControlCharacter(value)) {
        return false;
    }
    return value.split('/').every(segment => segment !== '.' && segment !== '..');
};
/** Builds an opaque logical artifact reference. The decoded subject is never a storage path. */
export const buildEnvironmentLogicalArtifactReferenceV1 = (artifactKind, canonicalScopeQualifiedSubject) => {
    if (!ARTIFACT_KINDS.has(artifactKind))
        throw new TypeError('Unsupported V1 environment artifact kind.');
    // Bound untrusted input before JSON parsing. Encoding also validates Unicode and bytes.
    const encodedSubject = encodeEnvironmentReferencePayload(canonicalScopeQualifiedSubject);
    if (!(artifactKind === 'environment-capability-evidence'
        ? parseEnvironmentCapabilityEvidenceSubjectV1(canonicalScopeQualifiedSubject)
        : isCanonicalScopeQualifiedSubject(canonicalScopeQualifiedSubject))) {
        throw new TypeError('Artifact subject is not a canonical V1 scope-qualified subject.');
    }
    return `${ARTIFACT_PREFIX}${artifactKind}/${encodedSubject}`;
};
/** Parses a V1 logical artifact reference into its allowlisted kind and opaque subject. */
export const parseEnvironmentLogicalArtifactReferenceV1 = (value) => {
    if (typeof value !== 'string' || !value.startsWith(ARTIFACT_PREFIX))
        return null;
    const remainder = value.slice(ARTIFACT_PREFIX.length);
    const separator = remainder.indexOf('/');
    if (separator <= 0 || remainder.indexOf('/', separator + 1) >= 0)
        return null;
    const artifactKind = remainder.slice(0, separator);
    if (!ARTIFACT_KINDS.has(artifactKind))
        return null;
    const subject = decodePayload(remainder.slice(separator + 1));
    if (subject === null ||
        !(artifactKind === 'environment-capability-evidence'
            ? parseEnvironmentCapabilityEvidenceSubjectV1(subject)
            : isCanonicalScopeQualifiedSubject(subject))) {
        return null;
    }
    return { kind: 'artifact', artifactKind: artifactKind, subject };
};
/** Builds an opaque logical Azure resource reference from a canonical resource ID. */
export const buildEnvironmentLogicalResourceReferenceV1 = (canonicalAzureResourceId) => {
    if (!isBoundedString(canonicalAzureResourceId, ENVIRONMENT_CONTRACT_LIMITS_V1.scopeIdentifierScalars, { trimmed: true, controls: true })) {
        throw new TypeError('Azure resource ID must be bounded and safe.');
    }
    if (!isCanonicalAzureResourceId(canonicalAzureResourceId))
        throw new TypeError('Azure resource ID is not canonical or safe.');
    return `${RESOURCE_PREFIX}${encodeEnvironmentReferencePayload(canonicalAzureResourceId)}`;
};
/** Parses a V1 logical resource reference into a canonical Azure resource ID. */
export const parseEnvironmentLogicalResourceReferenceV1 = (value) => {
    if (typeof value !== 'string' || !value.startsWith(RESOURCE_PREFIX))
        return null;
    const resourceId = decodePayload(value.slice(RESOURCE_PREFIX.length));
    if (resourceId === null || !isCanonicalAzureResourceId(resourceId))
        return null;
    return { kind: 'resource', resourceId };
};
/**
 * Derives the canonical Azure resource type from a canonical ARM resource ID.
 * Resource names are consumed structurally, so a resource named `providers`
 * cannot be mistaken for an extension-resource provider boundary.
 */
export const deriveEnvironmentAzureResourceTypeV1 = (canonicalAzureResourceId) => {
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
    return [...resourceType].length <= ENVIRONMENT_CONTRACT_LIMITS_V1.safeLabelScalars ? resourceType : null;
};
/** Parses either closed V1 logical evidence-reference kind. */
export const parseEnvironmentLogicalEvidenceReferenceV1 = (value) => parseEnvironmentLogicalArtifactReferenceV1(value) ?? parseEnvironmentLogicalResourceReferenceV1(value);
/** Returns true when a value is a canonical V1 logical artifact reference. */
export const isEnvironmentLogicalArtifactReferenceV1 = (value) => parseEnvironmentLogicalArtifactReferenceV1(value) !== null;
/** Returns true when a value is a canonical V1 logical resource reference. */
export const isEnvironmentLogicalResourceReferenceV1 = (value) => parseEnvironmentLogicalResourceReferenceV1(value) !== null;
/** Returns true when a value is one of the closed V1 logical evidence-reference kinds. */
export const isEnvironmentLogicalEvidenceReferenceV1 = (value) => parseEnvironmentLogicalEvidenceReferenceV1(value) !== null;
