"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnvironmentLogicalEvidenceReferenceV1 = exports.isEnvironmentLogicalResourceReferenceV1 = exports.isEnvironmentLogicalArtifactReferenceV1 = exports.parseEnvironmentLogicalEvidenceReferenceV1 = exports.parseEnvironmentLogicalResourceReferenceV1 = exports.buildEnvironmentLogicalResourceReferenceV1 = exports.parseEnvironmentLogicalArtifactReferenceV1 = exports.buildEnvironmentLogicalArtifactReferenceV1 = void 0;
const contracts_js_1 = require("./contracts.js");
const internal_js_1 = require("./internal.js");
const BASE64URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const ARTIFACT_PREFIX = 'spotto://artifact/v1/';
const RESOURCE_PREFIX = 'spotto://resource/v1/';
const ARTIFACT_KINDS = new Set(contracts_js_1.ENVIRONMENT_ARTIFACT_KINDS_V1);
const isCanonicalScopeQualifiedSubject = (value) => {
    try {
        const parsed = JSON.parse(value);
        return (Array.isArray(parsed) &&
            parsed.length === 4 &&
            parsed[0] === 'azure-subscription' &&
            parsed
                .slice(1)
                .every(item => (0, internal_js_1.isBoundedString)(item, contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.scopeIdentifierScalars, { trimmed: true, controls: true })) &&
            JSON.stringify(parsed) === value);
    }
    catch {
        return false;
    }
};
const encodeUtf8 = (value) => {
    const bytes = [];
    for (const character of value) {
        const codePoint = character.codePointAt(0);
        if (codePoint <= 0x7f)
            bytes.push(codePoint);
        else if (codePoint <= 0x7ff)
            bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
        else if (codePoint <= 0xffff)
            bytes.push(0xe0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
        else
            bytes.push(0xf0 | (codePoint >> 18), 0x80 | ((codePoint >> 12) & 0x3f), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
    }
    return bytes;
};
const encodeBase64Url = (bytes) => {
    let output = '';
    for (let index = 0; index < bytes.length; index += 3) {
        const first = bytes[index];
        const second = bytes[index + 1];
        const third = bytes[index + 2];
        output += BASE64URL_ALPHABET[first >> 2];
        output += BASE64URL_ALPHABET[((first & 0x03) << 4) | ((second ?? 0) >> 4)];
        if (second !== undefined)
            output += BASE64URL_ALPHABET[((second & 0x0f) << 2) | ((third ?? 0) >> 6)];
        if (third !== undefined)
            output += BASE64URL_ALPHABET[third & 0x3f];
    }
    return output;
};
const decodeBase64Url = (value) => {
    if (!/^[A-Za-z0-9_-]+$/u.test(value) || value.length % 4 === 1)
        return null;
    const bytes = [];
    for (let index = 0; index < value.length; index += 4) {
        const first = BASE64URL_ALPHABET.indexOf(value[index]);
        const second = BASE64URL_ALPHABET.indexOf(value[index + 1]);
        const thirdCharacter = value[index + 2];
        const fourthCharacter = value[index + 3];
        const third = thirdCharacter === undefined ? 0 : BASE64URL_ALPHABET.indexOf(thirdCharacter);
        const fourth = fourthCharacter === undefined ? 0 : BASE64URL_ALPHABET.indexOf(fourthCharacter);
        if (first < 0 || second < 0 || third < 0 || fourth < 0)
            return null;
        bytes.push((first << 2) | (second >> 4));
        if (thirdCharacter !== undefined)
            bytes.push(((second & 0x0f) << 4) | (third >> 2));
        if (fourthCharacter !== undefined)
            bytes.push(((third & 0x03) << 6) | fourth);
    }
    return encodeBase64Url(bytes) === value ? bytes : null;
};
const decodeUtf8 = (bytes) => {
    let output = '';
    for (let index = 0; index < bytes.length;) {
        const first = bytes[index];
        let codePoint;
        let continuationCount;
        if (first <= 0x7f) {
            codePoint = first;
            continuationCount = 0;
        }
        else if (first >= 0xc2 && first <= 0xdf) {
            codePoint = first & 0x1f;
            continuationCount = 1;
        }
        else if (first >= 0xe0 && first <= 0xef) {
            codePoint = first & 0x0f;
            continuationCount = 2;
        }
        else if (first >= 0xf0 && first <= 0xf4) {
            codePoint = first & 0x07;
            continuationCount = 3;
        }
        else
            return null;
        if (index + continuationCount >= bytes.length)
            return null;
        for (let offset = 1; offset <= continuationCount; offset += 1) {
            const next = bytes[index + offset];
            if ((next & 0xc0) !== 0x80)
                return null;
            codePoint = (codePoint << 6) | (next & 0x3f);
        }
        if ((continuationCount === 2 && codePoint < 0x800) ||
            (continuationCount === 3 && codePoint < 0x10000) ||
            (codePoint >= 0xd800 && codePoint <= 0xdfff) ||
            codePoint > 0x10ffff) {
            return null;
        }
        output += String.fromCodePoint(codePoint);
        index += continuationCount + 1;
    }
    return output;
};
const decodePayload = (value) => {
    const bytes = decodeBase64Url(value);
    if (bytes === null || bytes.length > contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.logicalReferencePayloadBytes)
        return null;
    const decoded = decodeUtf8(bytes);
    if (decoded === null || encodeBase64Url(encodeUtf8(decoded)) !== value)
        return null;
    return decoded;
};
const assertReferencePayload = (value, label, maximumScalars) => {
    if (!(0, internal_js_1.isBoundedString)(value, maximumScalars, { trimmed: true, controls: true })) {
        throw new TypeError(`${label} must be a non-empty, trimmed, bounded Unicode string without control characters.`);
    }
    if ((0, internal_js_1.utf8ByteLength)(value) > contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.logicalReferencePayloadBytes) {
        throw new RangeError(`${label} exceeds the V1 logical-reference payload limit.`);
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
    assertReferencePayload(canonicalScopeQualifiedSubject, 'Artifact subject', contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.customerStringScalars);
    if (!isCanonicalScopeQualifiedSubject(canonicalScopeQualifiedSubject)) {
        throw new TypeError('Artifact subject is not a canonical V1 scope-qualified subject.');
    }
    return `${ARTIFACT_PREFIX}${artifactKind}/${encodeBase64Url(encodeUtf8(canonicalScopeQualifiedSubject))}`;
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
    const subject = decodePayload(remainder.slice(separator + 1));
    if (subject === null || !isCanonicalScopeQualifiedSubject(subject)) {
        return null;
    }
    return { kind: 'artifact', artifactKind: artifactKind, subject };
};
exports.parseEnvironmentLogicalArtifactReferenceV1 = parseEnvironmentLogicalArtifactReferenceV1;
/** Builds an opaque logical Azure resource reference from a canonical resource ID. */
const buildEnvironmentLogicalResourceReferenceV1 = (canonicalAzureResourceId) => {
    assertReferencePayload(canonicalAzureResourceId, 'Azure resource ID', contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.scopeIdentifierScalars);
    if (!isCanonicalAzureResourceId(canonicalAzureResourceId))
        throw new TypeError('Azure resource ID is not canonical or safe.');
    return `${RESOURCE_PREFIX}${encodeBase64Url(encodeUtf8(canonicalAzureResourceId))}`;
};
exports.buildEnvironmentLogicalResourceReferenceV1 = buildEnvironmentLogicalResourceReferenceV1;
/** Parses a V1 logical resource reference into a canonical Azure resource ID. */
const parseEnvironmentLogicalResourceReferenceV1 = (value) => {
    if (typeof value !== 'string' || !value.startsWith(RESOURCE_PREFIX))
        return null;
    const resourceId = decodePayload(value.slice(RESOURCE_PREFIX.length));
    if (resourceId === null || !isCanonicalAzureResourceId(resourceId))
        return null;
    return { kind: 'resource', resourceId };
};
exports.parseEnvironmentLogicalResourceReferenceV1 = parseEnvironmentLogicalResourceReferenceV1;
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