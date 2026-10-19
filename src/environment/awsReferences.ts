import { ENVIRONMENT_AWS_ARTIFACT_KINDS_V1 } from './awsContracts.js';
import type {
  EnvironmentAwsAccountScopeV1,
  EnvironmentAwsArtifactKindV1,
  EnvironmentAwsLogicalArtifactReferenceV1,
  EnvironmentAwsLogicalEvidenceReferenceV1,
  EnvironmentAwsLogicalResourceReferenceV1,
  ParsedEnvironmentAwsLogicalArtifactReferenceV1,
  ParsedEnvironmentAwsLogicalResourceReferenceV1,
} from './awsContracts.js';
import { isEnvironmentAwsAccountScopeV1, isEnvironmentAwsResourceIdV1, isEnvironmentAwsResourceTypeV1 } from './awsIdentity.js';
import { decodeEnvironmentReferencePayload, encodeEnvironmentReferencePayload } from './referenceEncoding.js';

const ARTIFACT_PREFIX = 'spotto://artifact/v1/';
const RESOURCE_PREFIX = 'spotto://resource/v1/aws/';
const ARTIFACT_KINDS = new Set<string>(ENVIRONMENT_AWS_ARTIFACT_KINDS_V1);

/** Canonical scope-qualified identifier, never a path or authorization grant. */
export const buildEnvironmentAwsAccountScopeQualifiedSubjectV1 = (scope: EnvironmentAwsAccountScopeV1): string => {
  if (!isEnvironmentAwsAccountScopeV1(scope)) throw new TypeError('Invalid AWS account environment scope.');
  return JSON.stringify([scope.kind, scope.companyId, scope.accountId]);
};

export const buildEnvironmentAwsLogicalArtifactReferenceV1 = (
  artifactKind: EnvironmentAwsArtifactKindV1,
  scope: EnvironmentAwsAccountScopeV1
): EnvironmentAwsLogicalArtifactReferenceV1 => {
  if (!isEnvironmentAwsArtifactKindV1(artifactKind)) throw new TypeError('Unsupported AWS environment artifact kind.');
  return `${ARTIFACT_PREFIX}${artifactKind}/${encodeEnvironmentReferencePayload(buildEnvironmentAwsAccountScopeQualifiedSubjectV1(scope))}`;
};

export const buildEnvironmentAwsLogicalResourceReferenceV1 = (
  scope: EnvironmentAwsAccountScopeV1,
  resourceType: string,
  resourceId: string
): EnvironmentAwsLogicalResourceReferenceV1 => {
  if (!isEnvironmentAwsAccountScopeV1(scope) || !isEnvironmentAwsResourceTypeV1(resourceType) || !isEnvironmentAwsResourceIdV1(scope, resourceId))
    throw new TypeError('Invalid or foreign AWS environment resource identity.');
  return `${RESOURCE_PREFIX}${encodeEnvironmentReferencePayload(JSON.stringify([scope.kind, scope.companyId, scope.accountId, resourceType, resourceId]))}`;
};

const decodeTuple = (encoded: string, length: number): unknown[] | null => {
  const decoded = decodeEnvironmentReferencePayload(encoded);
  if (decoded === null) return null;
  try {
    const tuple: unknown = JSON.parse(decoded);
    return Array.isArray(tuple) && tuple.length === length && JSON.stringify(tuple) === decoded ? tuple : null;
  } catch {
    return null;
  }
};

const tupleScope = (tuple: unknown[]): EnvironmentAwsAccountScopeV1 | null => {
  const scope = { kind: tuple[0], companyId: tuple[1], accountId: tuple[2] };
  return isEnvironmentAwsAccountScopeV1(scope) ? scope : null;
};

export const parseEnvironmentAwsLogicalArtifactReferenceV1 = (value: unknown): ParsedEnvironmentAwsLogicalArtifactReferenceV1 | null => {
  if (typeof value !== 'string' || !value.startsWith(ARTIFACT_PREFIX)) return null;
  const remainder = value.slice(ARTIFACT_PREFIX.length);
  const separator = remainder.indexOf('/');
  const artifactKind = remainder.slice(0, separator);
  if (separator < 1 || !ARTIFACT_KINDS.has(artifactKind)) return null;
  const tuple = decodeTuple(remainder.slice(separator + 1), 3);
  const scope = tuple && tupleScope(tuple);
  return scope ? { kind: 'artifact', artifactKind: artifactKind as EnvironmentAwsArtifactKindV1, scope } : null;
};

export const parseEnvironmentAwsLogicalResourceReferenceV1 = (value: unknown): ParsedEnvironmentAwsLogicalResourceReferenceV1 | null => {
  if (typeof value !== 'string' || !value.startsWith(RESOURCE_PREFIX)) return null;
  const tuple = decodeTuple(value.slice(RESOURCE_PREFIX.length), 5);
  const scope = tuple && tupleScope(tuple);
  if (!tuple || !scope || !isEnvironmentAwsResourceTypeV1(tuple[3]) || !isEnvironmentAwsResourceIdV1(scope, tuple[4])) return null;
  return { kind: 'resource', scope, resourceType: tuple[3], resourceId: tuple[4] };
};

export const isEnvironmentAwsLogicalArtifactReferenceV1 = (value: unknown): value is EnvironmentAwsLogicalArtifactReferenceV1 =>
  parseEnvironmentAwsLogicalArtifactReferenceV1(value) !== null;

export const isEnvironmentAwsLogicalResourceReferenceV1 = (value: unknown): value is EnvironmentAwsLogicalResourceReferenceV1 =>
  parseEnvironmentAwsLogicalResourceReferenceV1(value) !== null;

export const isEnvironmentAwsLogicalEvidenceReferenceV1 = (value: unknown): value is EnvironmentAwsLogicalEvidenceReferenceV1 =>
  isEnvironmentAwsLogicalArtifactReferenceV1(value) || isEnvironmentAwsLogicalResourceReferenceV1(value);

/** Non-throwing kind admission for compiler and provider-neutral consumers. */
export const isEnvironmentAwsArtifactKindV1 = (value: unknown): value is EnvironmentAwsArtifactKindV1 =>
  typeof value === 'string' && ARTIFACT_KINDS.has(value);
