import {
  ENVIRONMENT_ARTIFACT_KINDS_V1,
  ENVIRONMENT_CONTRACT_LIMITS_V1,
  type EnvironmentArtifactKindV1,
  type EnvironmentLogicalArtifactReferenceV1,
  type EnvironmentLogicalEvidenceReferenceV1,
  type EnvironmentLogicalResourceReferenceV1,
  type ParsedEnvironmentLogicalArtifactReferenceV1,
  type ParsedEnvironmentLogicalEvidenceReferenceV1,
  type ParsedEnvironmentLogicalResourceReferenceV1,
} from './contracts.js';
import { hasControlCharacter, isBoundedString, utf8ByteLength } from './internal.js';

const BASE64URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const ARTIFACT_PREFIX = 'spotto://artifact/v1/';
const RESOURCE_PREFIX = 'spotto://resource/v1/';
const ARTIFACT_KINDS = new Set<string>(ENVIRONMENT_ARTIFACT_KINDS_V1);

const isCanonicalScopeQualifiedSubject = (value: string): boolean => {
  try {
    const parsed: unknown = JSON.parse(value);
    return (
      Array.isArray(parsed) &&
      ((parsed.length === 4 && parsed[0] === 'azure-subscription') || (parsed.length === 2 && parsed[0] === 'azure-tenant')) &&
      parsed
        .slice(1)
        .every(item => isBoundedString(item, ENVIRONMENT_CONTRACT_LIMITS_V1.scopeIdentifierScalars, { trimmed: true, controls: true })) &&
      JSON.stringify(parsed) === value
    );
  } catch {
    return false;
  }
};

const encodeUtf8 = (value: string): number[] => {
  const bytes: number[] = [];
  for (const character of value) {
    const codePoint = character.codePointAt(0) as number;
    if (codePoint <= 0x7f) bytes.push(codePoint);
    else if (codePoint <= 0x7ff) bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
    else if (codePoint <= 0xffff) bytes.push(0xe0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
    else bytes.push(0xf0 | (codePoint >> 18), 0x80 | ((codePoint >> 12) & 0x3f), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
  }
  return bytes;
};

const encodeBase64Url = (bytes: readonly number[]): string => {
  let output = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index] as number;
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    output += BASE64URL_ALPHABET[first >> 2];
    output += BASE64URL_ALPHABET[((first & 0x03) << 4) | ((second ?? 0) >> 4)];
    if (second !== undefined) output += BASE64URL_ALPHABET[((second & 0x0f) << 2) | ((third ?? 0) >> 6)];
    if (third !== undefined) output += BASE64URL_ALPHABET[third & 0x3f];
  }
  return output;
};

const decodeBase64Url = (value: string): number[] | null => {
  if (!/^[A-Za-z0-9_-]+$/u.test(value) || value.length % 4 === 1) return null;
  const bytes: number[] = [];
  for (let index = 0; index < value.length; index += 4) {
    const first = BASE64URL_ALPHABET.indexOf(value[index] as string);
    const second = BASE64URL_ALPHABET.indexOf(value[index + 1] as string);
    const thirdCharacter = value[index + 2];
    const fourthCharacter = value[index + 3];
    const third = thirdCharacter === undefined ? 0 : BASE64URL_ALPHABET.indexOf(thirdCharacter);
    const fourth = fourthCharacter === undefined ? 0 : BASE64URL_ALPHABET.indexOf(fourthCharacter);
    if (first < 0 || second < 0 || third < 0 || fourth < 0) return null;
    bytes.push((first << 2) | (second >> 4));
    if (thirdCharacter !== undefined) bytes.push(((second & 0x0f) << 4) | (third >> 2));
    if (fourthCharacter !== undefined) bytes.push(((third & 0x03) << 6) | fourth);
  }
  return encodeBase64Url(bytes) === value ? bytes : null;
};

const decodeUtf8 = (bytes: readonly number[]): string | null => {
  let output = '';
  for (let index = 0; index < bytes.length; ) {
    const first = bytes[index] as number;
    let codePoint: number;
    let continuationCount: number;
    if (first <= 0x7f) {
      codePoint = first;
      continuationCount = 0;
    } else if (first >= 0xc2 && first <= 0xdf) {
      codePoint = first & 0x1f;
      continuationCount = 1;
    } else if (first >= 0xe0 && first <= 0xef) {
      codePoint = first & 0x0f;
      continuationCount = 2;
    } else if (first >= 0xf0 && first <= 0xf4) {
      codePoint = first & 0x07;
      continuationCount = 3;
    } else return null;
    if (index + continuationCount >= bytes.length) return null;
    for (let offset = 1; offset <= continuationCount; offset += 1) {
      const next = bytes[index + offset] as number;
      if ((next & 0xc0) !== 0x80) return null;
      codePoint = (codePoint << 6) | (next & 0x3f);
    }
    if (
      (continuationCount === 2 && codePoint < 0x800) ||
      (continuationCount === 3 && codePoint < 0x10000) ||
      (codePoint >= 0xd800 && codePoint <= 0xdfff) ||
      codePoint > 0x10ffff
    ) {
      return null;
    }
    output += String.fromCodePoint(codePoint);
    index += continuationCount + 1;
  }
  return output;
};

const decodePayload = (value: string): string | null => {
  const bytes = decodeBase64Url(value);
  if (bytes === null || bytes.length > ENVIRONMENT_CONTRACT_LIMITS_V1.logicalReferencePayloadBytes) return null;
  const decoded = decodeUtf8(bytes);
  if (decoded === null || encodeBase64Url(encodeUtf8(decoded)) !== value) return null;
  return decoded;
};

const assertReferencePayload = (value: string, label: string, maximumScalars: number): void => {
  if (!isBoundedString(value, maximumScalars, { trimmed: true, controls: true })) {
    throw new TypeError(`${label} must be a non-empty, trimmed, bounded Unicode string without control characters.`);
  }
  if (utf8ByteLength(value) > ENVIRONMENT_CONTRACT_LIMITS_V1.logicalReferencePayloadBytes) {
    throw new RangeError(`${label} exceeds the V1 logical-reference payload limit.`);
  }
};

const isCanonicalAzureResourceId = (value: string): boolean => {
  if (
    !/^\/subscriptions\/[^/]+\/(?:resourceGroups\/[^/]+\/)?providers\/[^/]+\/[^/]+\/[^/]+(?:\/[^/]+\/[^/]+)*$/iu.test(value) ||
    value.includes('\\') ||
    value.includes('?') ||
    value.includes('#') ||
    value.includes('%') ||
    hasControlCharacter(value)
  ) {
    return false;
  }
  return value.split('/').every(segment => segment !== '.' && segment !== '..');
};

/** Builds an opaque logical artifact reference. The decoded subject is never a storage path. */
export const buildEnvironmentLogicalArtifactReferenceV1 = (
  artifactKind: EnvironmentArtifactKindV1,
  canonicalScopeQualifiedSubject: string
): EnvironmentLogicalArtifactReferenceV1 => {
  if (!ARTIFACT_KINDS.has(artifactKind)) throw new TypeError('Unsupported V1 environment artifact kind.');
  assertReferencePayload(canonicalScopeQualifiedSubject, 'Artifact subject', ENVIRONMENT_CONTRACT_LIMITS_V1.customerStringScalars);
  if (!isCanonicalScopeQualifiedSubject(canonicalScopeQualifiedSubject)) {
    throw new TypeError('Artifact subject is not a canonical V1 scope-qualified subject.');
  }
  return `${ARTIFACT_PREFIX}${artifactKind}/${encodeBase64Url(encodeUtf8(canonicalScopeQualifiedSubject))}`;
};

/** Parses a V1 logical artifact reference into its allowlisted kind and opaque subject. */
export const parseEnvironmentLogicalArtifactReferenceV1 = (value: unknown): ParsedEnvironmentLogicalArtifactReferenceV1 | null => {
  if (typeof value !== 'string' || !value.startsWith(ARTIFACT_PREFIX)) return null;
  const remainder = value.slice(ARTIFACT_PREFIX.length);
  const separator = remainder.indexOf('/');
  if (separator <= 0 || remainder.indexOf('/', separator + 1) >= 0) return null;
  const artifactKind = remainder.slice(0, separator);
  if (!ARTIFACT_KINDS.has(artifactKind)) return null;
  const subject = decodePayload(remainder.slice(separator + 1));
  if (subject === null || !isCanonicalScopeQualifiedSubject(subject)) {
    return null;
  }
  return { kind: 'artifact', artifactKind: artifactKind as EnvironmentArtifactKindV1, subject };
};

/** Builds an opaque logical Azure resource reference from a canonical resource ID. */
export const buildEnvironmentLogicalResourceReferenceV1 = (canonicalAzureResourceId: string): EnvironmentLogicalResourceReferenceV1 => {
  assertReferencePayload(canonicalAzureResourceId, 'Azure resource ID', ENVIRONMENT_CONTRACT_LIMITS_V1.scopeIdentifierScalars);
  if (!isCanonicalAzureResourceId(canonicalAzureResourceId)) throw new TypeError('Azure resource ID is not canonical or safe.');
  return `${RESOURCE_PREFIX}${encodeBase64Url(encodeUtf8(canonicalAzureResourceId))}`;
};

/** Parses a V1 logical resource reference into a canonical Azure resource ID. */
export const parseEnvironmentLogicalResourceReferenceV1 = (value: unknown): ParsedEnvironmentLogicalResourceReferenceV1 | null => {
  if (typeof value !== 'string' || !value.startsWith(RESOURCE_PREFIX)) return null;
  const resourceId = decodePayload(value.slice(RESOURCE_PREFIX.length));
  if (resourceId === null || !isCanonicalAzureResourceId(resourceId)) return null;
  return { kind: 'resource', resourceId };
};

/**
 * Derives the canonical Azure resource type from a canonical ARM resource ID.
 * Resource names are consumed structurally, so a resource named `providers`
 * cannot be mistaken for an extension-resource provider boundary.
 */
export const deriveEnvironmentAzureResourceTypeV1 = (canonicalAzureResourceId: string): string | null => {
  if (!isCanonicalAzureResourceId(canonicalAzureResourceId)) return null;

  const segments = canonicalAzureResourceId.toLowerCase().split('/').filter(Boolean);
  const firstProviderIndex = segments.indexOf('providers');
  if (firstProviderIndex < 0) return null;

  let providerIndex = firstProviderIndex;
  let namespace = segments[providerIndex + 1];
  let typeSegments: string[] = [];
  let index = providerIndex + 2;

  while (namespace && index < segments.length) {
    const typeOrProviderMarker = segments[index];
    if (!typeOrProviderMarker) return null;

    if (typeOrProviderMarker === 'providers') {
      providerIndex = index;
      namespace = segments[providerIndex + 1];
      typeSegments = [];
      index = providerIndex + 2;
      continue;
    }

    typeSegments.push(typeOrProviderMarker);
    if (segments[index + 1] === undefined) return null;
    index += 2;
  }

  if (!namespace || typeSegments.length === 0) return null;
  const resourceType = `${namespace}/${typeSegments.join('/')}`;
  return [...resourceType].length <= ENVIRONMENT_CONTRACT_LIMITS_V1.safeLabelScalars ? resourceType : null;
};

/** Parses either closed V1 logical evidence-reference kind. */
export const parseEnvironmentLogicalEvidenceReferenceV1 = (value: unknown): ParsedEnvironmentLogicalEvidenceReferenceV1 | null =>
  parseEnvironmentLogicalArtifactReferenceV1(value) ?? parseEnvironmentLogicalResourceReferenceV1(value);

/** Returns true when a value is a canonical V1 logical artifact reference. */
export const isEnvironmentLogicalArtifactReferenceV1 = (value: unknown): value is EnvironmentLogicalArtifactReferenceV1 =>
  parseEnvironmentLogicalArtifactReferenceV1(value) !== null;

/** Returns true when a value is a canonical V1 logical resource reference. */
export const isEnvironmentLogicalResourceReferenceV1 = (value: unknown): value is EnvironmentLogicalResourceReferenceV1 =>
  parseEnvironmentLogicalResourceReferenceV1(value) !== null;

/** Returns true when a value is one of the closed V1 logical evidence-reference kinds. */
export const isEnvironmentLogicalEvidenceReferenceV1 = (value: unknown): value is EnvironmentLogicalEvidenceReferenceV1 =>
  parseEnvironmentLogicalEvidenceReferenceV1(value) !== null;
