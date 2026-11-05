import { isEnvironmentCapabilityDocumentSetV1 } from './optionalDocuments.js';
import {
  ENVIRONMENT_ARTIFACT_KINDS_V1,
  ENVIRONMENT_CONTRACT_LIMITS_V1,
  ENVIRONMENT_DOCUMENT_NAMES_V1,
  type EnvironmentArtifactKindV1,
  type EnvironmentCompiledGenerationPointerV1,
  type EnvironmentDocumentDescriptorV1,
  type EnvironmentMoneyValueV1,
  type EnvironmentScopeV1,
  type EnvironmentSourceBindingV1,
  type EnvironmentSourceGenerationV1,
  type EnvironmentSubscriptionProjectionV1,
} from './contracts.js';
import {
  ENVIRONMENT_RUN_ID_PATTERN,
  SHA256_PATTERN,
  hasControlCharacter,
  hasExactKeys,
  hasSafeContainerShape,
  isBoundedString,
  isCanonicalUtcTimestamp,
  isNonNegativeInteger,
  isRecord,
  isSafeLabel,
  isScopeIdentifier,
  isSourceIdentity,
  utf8ByteLength,
} from './internal.js';
import {
  deriveEnvironmentAzureResourceTypeV1,
  isEnvironmentLogicalEvidenceReferenceV1,
  isEnvironmentLogicalResourceReferenceV1,
  parseEnvironmentLogicalResourceReferenceV1,
} from './references.js';
import {
  ENVIRONMENT_PROJECTION_CONTENT_REQUIRED_KEYS_V1,
  ENVIRONMENT_PROJECTION_CONTENT_OPTIONAL_KEYS_V1,
  createEnvironmentProjectionContentValidatorV1,
} from './projectionValidation.js';
import { isEnvironmentMoneyValueWithProvenanceV1 } from './moneyValidation.js';
import { isEnvironmentCoverageStateV1 } from './valueValidation.js';

export { isEnvironmentSavingsBasisV1 } from './moneyValidation.js';
export { isEnvironmentCardinalityV1, isEnvironmentCoverageStateV1, isEnvironmentPillarV1 } from './valueValidation.js';

const DOCUMENT_NAMES = new Set<string>(ENVIRONMENT_DOCUMENT_NAMES_V1);
const ARTIFACT_KINDS = new Set<string>(ENVIRONMENT_ARTIFACT_KINDS_V1);
const MONEY_PROVENANCE = new Set<string>([
  'subscription-summary',
  'subscription-resources',
  'cost-savings-summary',
  'savings-aggregate',
  'recommendation',
]);

const scopesEqual = (left: EnvironmentScopeV1, right: EnvironmentScopeV1): boolean =>
  left.kind === right.kind && left.tenantId === right.tenantId && left.companyId === right.companyId && left.subscriptionId === right.subscriptionId;

const isScopedEnvironmentDetailRoute = (value: string): boolean => {
  const match =
    /^\/company\/([A-Za-z0-9_-]+)\/(dashboard|resources|recommendations|cost-analysis|commitments-planning|security|tags|backups|health|perimeter-insights|change-monitoring)(?:\/([^/?#]+))?(?:\?subscriptions=([A-Za-z0-9_-]+))?$/u.exec(
      value
    );
  if (!match) return false;
  const [, , page, subject, subscriptionId] = match;
  if (!subject) return Boolean(subscriptionId);
  try {
    const decoded = decodeURIComponent(subject);
    // Decode once only. Encoded separators are permitted solely inside an ARM ID,
    // never in the company, page, subscription selection or recommendation ID.
    if (encodeURIComponent(decoded) !== subject || /[%\\?#]/u.test(decoded) || hasControlCharacter(decoded)) return false;
    if (decoded.split('/').some(segment => segment === '.' || segment === '..')) return false;
    if (page === 'recommendations') return Boolean(subscriptionId) && /^[A-Za-z0-9_~.-]+$/u.test(decoded);
    if (page !== 'resources') return false;
    const resource = /^\/subscriptions\/([A-Za-z0-9_-]+)\/resourcegroups\/[^/]+\/providers\/[^/]+\/.+/iu.exec(decoded);
    return Boolean(resource && (!subscriptionId || resource[1].toLowerCase() === subscriptionId.toLowerCase()));
  } catch {
    return false;
  }
};

/** Validates a bounded, local Portal route suitable for client-visible evidence. */
export const isEnvironmentPortalRouteV1 = (value: unknown): value is string =>
  isBoundedString(value, ENVIRONMENT_CONTRACT_LIMITS_V1.customerStringScalars, { trimmed: true, controls: true }) &&
  value.startsWith('/') &&
  !value.startsWith('//') &&
  !value.includes('\\') &&
  !value.includes('://') &&
  !value.includes('#') &&
  ((!value.includes('?') && !value.includes('%') && value.split('/').every(segment => segment !== '.' && segment !== '..')) ||
    isScopedEnvironmentDetailRoute(value));

const AZURE_RESOURCE_TYPE_PATTERN = /^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*(?:\/[a-z0-9][a-z0-9._-]*)*$/u;

const isAzureResourceTypeArray = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.length <= ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems &&
  value.every(
    item =>
      isBoundedString(item, ENVIRONMENT_CONTRACT_LIMITS_V1.safeLabelScalars, { trimmed: true, controls: true }) &&
      AZURE_RESOURCE_TYPE_PATTERN.test(item)
  ) &&
  new Set(value).size === value.length &&
  value.every((item, index) => index === 0 || value[index - 1]! < item);

const resourceTypesMatchReferences = (resourceTypes: readonly string[], resourceReferences: readonly unknown[]): boolean => {
  const derivedTypes = Array.from(
    new Set(
      resourceReferences.flatMap(reference => {
        const parsed = parseEnvironmentLogicalResourceReferenceV1(reference);
        if (parsed === null) return [];
        const resourceType = deriveEnvironmentAzureResourceTypeV1(parsed.resourceId);
        return resourceType === null ? [] : [resourceType];
      })
    )
  ).sort();
  return derivedTypes.length === resourceTypes.length && derivedTypes.every((resourceType, index) => resourceTypes[index] === resourceType);
};

/** Validates the closed phase-one Azure subscription scope. */
export const isEnvironmentScopeV1 = (value: unknown): value is EnvironmentScopeV1 =>
  isRecord(value) &&
  hasExactKeys(value, ['kind', 'tenantId', 'companyId', 'subscriptionId']) &&
  value.kind === 'azure-subscription' &&
  isScopeIdentifier(value.tenantId) &&
  isScopeIdentifier(value.companyId) &&
  isScopeIdentifier(value.subscriptionId);

/** Validates the client-safe identity of one authoritative source generation. */
export const isEnvironmentSourceGenerationV1 = (value: unknown): value is EnvironmentSourceGenerationV1 =>
  isRecord(value) &&
  hasExactKeys(value, [
    'viewSetSchemaVersion',
    'publicationId',
    'portalRunId',
    'pluginRunId',
    'economicsGenerationId',
    'economicsFingerprint',
    'completedAt',
  ]) &&
  value.viewSetSchemaVersion === 1 &&
  isSourceIdentity(value.publicationId) &&
  isSourceIdentity(value.portalRunId) &&
  isSourceIdentity(value.pluginRunId) &&
  isSourceIdentity(value.economicsGenerationId) &&
  isSourceIdentity(value.economicsFingerprint) &&
  isCanonicalUtcTimestamp(value.completedAt);

/** Validates a byte-preserving binding to an authoritative CompletedAzureViewSetV1. */
export const isEnvironmentSourceBindingV1 = (value: unknown): value is EnvironmentSourceBindingV1 =>
  isRecord(value) &&
  hasExactKeys(value, [
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
  isEnvironmentScopeV1(value.scope) &&
  isEnvironmentSourceGenerationV1({
    viewSetSchemaVersion: value.viewSetSchemaVersion,
    publicationId: value.publicationId,
    portalRunId: value.portalRunId,
    pluginRunId: value.pluginRunId,
    economicsGenerationId: value.economicsGenerationId,
    economicsFingerprint: value.economicsFingerprint,
    completedAt: value.completedAt,
  });

/** Validates a storage-safe environment run identity independently from source identities. */
export const isEnvironmentRunIdV1 = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= ENVIRONMENT_CONTRACT_LIMITS_V1.environmentRunIdAsciiCharacters &&
  value !== '.' &&
  value !== '..' &&
  ENVIRONMENT_RUN_ID_PATTERN.test(value);

export const isEnvironmentMoneyValueV1 = (value: unknown): value is EnvironmentMoneyValueV1 =>
  isEnvironmentMoneyValueWithProvenanceV1(value, MONEY_PROVENANCE);

const isSourceCoverage = (value: unknown): boolean =>
  isRecord(value) &&
  hasExactKeys(value, [
    'completedViewSet',
    'subscriptionSummary',
    'resources',
    'recommendations',
    'serviceRetirements',
    'monitorAlerts',
    'pluginMetrics',
  ]) &&
  Object.values(value).every(isEnvironmentCoverageStateV1);

const validateAzureProjectionContent = createEnvironmentProjectionContentValidatorV1({
  isEvidenceReference: isEnvironmentLogicalEvidenceReferenceV1,
  isResourceReference: isEnvironmentLogicalResourceReferenceV1,
  isResourceTypeArray: isAzureResourceTypeArray,
  resourceTypesMatchReferences,
  isPortalRoute: isEnvironmentPortalRouteV1,
  isMoneyValue: isEnvironmentMoneyValueV1,
});

/** Validates the strict, bounded multi-pillar subscription environment projection. */
export const isEnvironmentSubscriptionProjectionV1 = (value: unknown): value is EnvironmentSubscriptionProjectionV1 => {
  if (!hasSafeContainerShape(value) || !isRecord(value)) return false;
  if (
    !hasExactKeys(
      value,
      [
        'schemaVersion',
        'scope',
        'sourceBinding',
        'generatedAt',
        'subscription',
        'sourceCoverage',
        ...ENVIRONMENT_PROJECTION_CONTENT_REQUIRED_KEYS_V1,
      ],
      ENVIRONMENT_PROJECTION_CONTENT_OPTIONAL_KEYS_V1
    ) ||
    value.schemaVersion !== 1 ||
    !isEnvironmentScopeV1(value.scope) ||
    !isEnvironmentSourceBindingV1(value.sourceBinding) ||
    !scopesEqual(value.scope, value.sourceBinding.scope) ||
    !isCanonicalUtcTimestamp(value.generatedAt) ||
    Date.parse(value.generatedAt) < Date.parse(value.sourceBinding.completedAt) ||
    !isRecord(value.subscription) ||
    !hasExactKeys(value.subscription, ['safeLabel', 'portalRoute']) ||
    !isSafeLabel(value.subscription.safeLabel) ||
    !isEnvironmentPortalRouteV1(value.subscription.portalRoute) ||
    !isSourceCoverage(value.sourceCoverage) ||
    !validateAzureProjectionContent(value)
  ) {
    return false;
  }
  return utf8ByteLength(JSON.stringify(value)) <= ENVIRONMENT_CONTRACT_LIMITS_V1.projectionBytes;
};

const descriptorByteLimit = (name: string): number => {
  if (name === 'projection.json') return ENVIRONMENT_CONTRACT_LIMITS_V1.projectionBytes;
  if (name === 'environment-index.md') return ENVIRONMENT_CONTRACT_LIMITS_V1.environmentIndexBytes;
  return ENVIRONMENT_CONTRACT_LIMITS_V1.pillarDocumentBytes;
};

/** Validates one descriptor from the exact V1 multi-pillar document allowlist. */
export const isEnvironmentDocumentDescriptorV1 = (value: unknown): value is EnvironmentDocumentDescriptorV1 => {
  if (!isRecord(value) || !hasExactKeys(value, ['name', 'mediaType', 'byteCount', 'contentSha256', 'approximateTokenCount'])) return false;
  if (typeof value.name !== 'string' || !DOCUMENT_NAMES.has(value.name)) return false;
  const expectedMediaType = value.name === 'projection.json' ? 'application/json' : 'text/markdown; charset=utf-8';
  return (
    value.mediaType === expectedMediaType &&
    isNonNegativeInteger(value.byteCount) &&
    value.byteCount > 0 &&
    value.byteCount <= descriptorByteLimit(value.name) &&
    typeof value.contentSha256 === 'string' &&
    SHA256_PATTERN.test(value.contentSha256) &&
    isNonNegativeInteger(value.approximateTokenCount)
  );
};

/** Validates that descriptors contain every allowlisted V1 document exactly once. */
export const isEnvironmentDocumentDescriptorSetV1 = (value: unknown): value is EnvironmentDocumentDescriptorV1[] =>
  Array.isArray(value) &&
  value.length === ENVIRONMENT_DOCUMENT_NAMES_V1.length &&
  value.every(isEnvironmentDocumentDescriptorV1) &&
  new Set(value.map(descriptor => descriptor.name)).size === ENVIRONMENT_DOCUMENT_NAMES_V1.length &&
  ENVIRONMENT_DOCUMENT_NAMES_V1.every(name => value.some(descriptor => descriptor.name === name));

/** Validates an atomically visible completed environment-generation pointer. */
export const isEnvironmentCompiledGenerationPointerV1 = (value: unknown): value is EnvironmentCompiledGenerationPointerV1 => {
  if (!hasSafeContainerShape(value) || !isRecord(value)) return false;
  if (
    !hasExactKeys(
      value,
      ['schemaVersion', 'status', 'environmentRunId', 'scope', 'sourceBinding', 'treeDigestSha256', 'fileCount', 'generatedAt'],
      ['optionalDocuments']
    ) ||
    value.schemaVersion !== 1 ||
    value.status !== 'completed' ||
    !isEnvironmentRunIdV1(value.environmentRunId) ||
    !isEnvironmentScopeV1(value.scope) ||
    !isEnvironmentSourceBindingV1(value.sourceBinding) ||
    !scopesEqual(value.scope, value.sourceBinding.scope) ||
    typeof value.treeDigestSha256 !== 'string' ||
    !SHA256_PATTERN.test(value.treeDigestSha256) ||
    value.fileCount !== ENVIRONMENT_DOCUMENT_NAMES_V1.length ||
    (value.optionalDocuments !== undefined && !isEnvironmentCapabilityDocumentSetV1(value.optionalDocuments, value.scope)) ||
    !isCanonicalUtcTimestamp(value.generatedAt) ||
    Date.parse(value.generatedAt) < Date.parse(value.sourceBinding.completedAt)
  ) {
    return false;
  }
  const sourceIdentities = [
    value.sourceBinding.publicationId,
    value.sourceBinding.portalRunId,
    value.sourceBinding.pluginRunId,
    value.sourceBinding.economicsGenerationId,
    value.sourceBinding.economicsFingerprint,
  ];
  return (
    !sourceIdentities.includes(value.environmentRunId) &&
    utf8ByteLength(JSON.stringify(value)) <= ENVIRONMENT_CONTRACT_LIMITS_V1.completedPointerBytes
  );
};

/** Validates an artifact kind without widening the closed V1 union. */
export const isEnvironmentArtifactKindV1 = (value: unknown): value is EnvironmentArtifactKindV1 =>
  typeof value === 'string' && ARTIFACT_KINDS.has(value);

/** Validates the V1 safe-label bound used by customer-visible evidence metadata. */
export const isEnvironmentSafeLabelV1 = (value: unknown): value is string => isSafeLabel(value);
