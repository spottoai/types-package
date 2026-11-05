import { ENVIRONMENT_CONTRACT_LIMITS_V1, ENVIRONMENT_DOCUMENT_NAMES_V1 } from './contracts.js';
import type { EnvironmentLogicalResourceReferenceV1 } from './contracts.js';
import { ENVIRONMENT_AWS_PUBLICATION_ARTIFACT_NAMES_V1 } from './awsContracts.js';
import type {
  EnvironmentAwsAccountCompiledGenerationPointerV1,
  EnvironmentAwsAccountProjectionV1,
  EnvironmentAwsAccountScopeV1,
  EnvironmentAwsAccountSourceBindingV1,
  EnvironmentAwsMoneyProvenanceV1,
  EnvironmentAwsMoneyValueV1,
  EnvironmentAwsAccountSourceCoverageV1,
  EnvironmentAwsArtifactKindV1,
  EnvironmentAwsPublicationArtifactV1,
} from './awsContracts.js';
import {
  environmentAwsScopesEqual,
  isEnvironmentAwsAccountScopeV1,
  isEnvironmentAwsResourceIdV1,
  isEnvironmentAwsResourceTypeV1,
} from './awsIdentity.js';
import { parseEnvironmentAwsLogicalArtifactReferenceV1, parseEnvironmentAwsLogicalResourceReferenceV1 } from './awsReferences.js';
import {
  SHA256_PATTERN,
  hasControlCharacter,
  hasExactKeys,
  hasSafeContainerShape,
  isCanonicalUtcTimestamp,
  isBoundedString,
  isRecord,
  isSafeLabel,
  isSourceIdentity,
  utf8ByteLength,
} from './internal.js';
import {
  ENVIRONMENT_PROJECTION_CONTENT_REQUIRED_KEYS_V1,
  ENVIRONMENT_PROJECTION_CONTENT_OPTIONAL_KEYS_V1,
  createEnvironmentProjectionContentValidatorV1,
} from './projectionValidation.js';
import { isEnvironmentCoverageStateV1, isEnvironmentRunIdV1 } from './validation.js';
import { isEnvironmentMoneyValueWithProvenanceV1 } from './moneyValidation.js';
import { isEnvironmentCapabilityDocumentSetV1 } from './optionalDocuments.js';

const MONEY_PROVENANCE = new Set<EnvironmentAwsMoneyProvenanceV1>([
  'account-summary',
  'account-resources',
  'cost-savings-summary',
  'savings-aggregate',
  'recommendation',
]);
type SourceName = EnvironmentAwsPublicationArtifactV1['name'];
const COVERAGE_ARTIFACTS = {
  completedPortalPublication: ['summary.json', 'resources.json', 'recommendations.json'],
  accountSummary: ['summary.json'],
  resources: ['resources.json'],
  recommendations: ['recommendations.json'],
  commitments: ['commitments-planning.json'],
  reliability: ['recommendations.json'],
  securityPosture: ['security-posture.json'],
  health: ['health-events.json', 'health-availability-statuses.json'],
  governance: ['governance.json.gz', 'governance-access.json.gz'],
  serviceRetirement: ['serviceretirement.json', 'serviceretirement-coverage.json'],
  dataProtection: ['data-protection.json.gz'],
  savingsLedger: ['savings-ledgers.json'],
  publicIpExposure: ['public-ip-addresses.json'],
} satisfies Record<keyof EnvironmentAwsAccountSourceCoverageV1, SourceName[]>;
const ARTIFACT_SOURCES = {
  'aws-account-summary': COVERAGE_ARTIFACTS.accountSummary,
  'aws-account-resources': COVERAGE_ARTIFACTS.resources,
  'aws-account-recommendations': COVERAGE_ARTIFACTS.recommendations,
  'aws-account-commitments': COVERAGE_ARTIFACTS.commitments,
  'aws-account-reliability': COVERAGE_ARTIFACTS.reliability,
  'aws-account-security-posture': COVERAGE_ARTIFACTS.securityPosture,
  'aws-account-health': COVERAGE_ARTIFACTS.health,
  'aws-account-governance': COVERAGE_ARTIFACTS.governance,
  'aws-account-service-retirements': COVERAGE_ARTIFACTS.serviceRetirement,
  'aws-account-data-protection': COVERAGE_ARTIFACTS.dataProtection,
  'aws-account-savings-ledger': COVERAGE_ARTIFACTS.savingsLedger,
  'aws-account-public-ip-exposure': COVERAGE_ARTIFACTS.publicIpExposure,
  'aws-account-projection': [],
} satisfies Record<EnvironmentAwsArtifactKindV1, SourceName[]>;
const SOURCE_NAMES = new Set<string>(ENVIRONMENT_AWS_PUBLICATION_ARTIFACT_NAMES_V1);
const SOURCE_COVERAGE_KEYS = Object.keys(COVERAGE_ARTIFACTS);
const OPTIONAL_CONTENT_KEYS = ENVIRONMENT_PROJECTION_CONTENT_OPTIONAL_KEYS_V1.filter(key => key !== 'secretStoreCoverage');
const PORTAL_PAGES = new Set([
  'dashboard',
  'resources',
  'recommendations',
  'cost-analysis',
  'commitments-planning',
  'security',
  'tags',
  'backups',
  'health',
  'perimeter-insights',
  'change-monitoring',
  'governance',
]);

/** AWS money retains the shared financial checks and a separate provenance namespace. */
export const isEnvironmentAwsMoneyValueV1 = (value: unknown): value is EnvironmentAwsMoneyValueV1 =>
  isEnvironmentMoneyValueWithProvenanceV1(value, MONEY_PROVENANCE);

const isPublicationArtifacts = (value: unknown): value is EnvironmentAwsPublicationArtifactV1[] =>
  Array.isArray(value) &&
  value.length >= 3 &&
  value.length <= 20 &&
  value.every(
    (artifact, index) =>
      isRecord(artifact) &&
      hasExactKeys(artifact, ['name', 'etag']) &&
      typeof artifact.name === 'string' &&
      SOURCE_NAMES.has(artifact.name) &&
      isBoundedString(artifact.etag, 512, { trimmed: true, controls: true }) &&
      artifact.etag !== '*' &&
      !artifact.etag.startsWith('W/') &&
      (index === 0 || value[index - 1].name < artifact.name)
  ) &&
  COVERAGE_ARTIFACTS.completedPortalPublication.every(name => value.some(artifact => artifact.name === name));

export const isEnvironmentAwsAccountSourceBindingV1 = (value: unknown): value is EnvironmentAwsAccountSourceBindingV1 =>
  hasSafeContainerShape(value, 0, new Set(), true) &&
  isRecord(value) &&
  hasExactKeys(value, ['kind', 'scope', 'portalRunId', 'portalGeneratedAt', 'completedAt', 'artifacts']) &&
  value.kind === 'aws-account-portal-publication' &&
  isEnvironmentAwsAccountScopeV1(value.scope) &&
  isSourceIdentity(value.portalRunId) &&
  isCanonicalUtcTimestamp(value.portalGeneratedAt) &&
  isCanonicalUtcTimestamp(value.completedAt) &&
  Date.parse(value.portalGeneratedAt) <= Date.parse(value.completedAt) &&
  isPublicationArtifacts(value.artifacts) &&
  utf8ByteLength(JSON.stringify(value)) <= ENVIRONMENT_CONTRACT_LIMITS_V1.completedPointerBytes;

/** Company-local routes only; the API still authorizes and constructs final navigation. */
const isPortalRoute = (scope: EnvironmentAwsAccountScopeV1, value: unknown): value is string => {
  if (typeof value !== 'string' || value.length > ENVIRONMENT_CONTRACT_LIMITS_V1.customerStringScalars) return false;
  const match = /^\/company\/([^/?#]+)\/([a-z-]+)(?:\/([^/?#]+))?(?:\?subscriptions=(\d{12}))?$/u.exec(value);
  if (!match) return false;
  const [, company, page, subject, accountId] = match;
  if (
    company === '.' ||
    company === '..' ||
    company !== encodeURIComponent(scope.companyId) ||
    !PORTAL_PAGES.has(page) ||
    (accountId !== undefined && accountId !== scope.accountId)
  )
    return false;
  if (subject === undefined) return true;
  try {
    const decoded = decodeURIComponent(subject);
    if (encodeURIComponent(decoded) !== subject || /[%\\?]/u.test(decoded) || hasControlCharacter(decoded)) return false;
    if (page === 'resources') return isEnvironmentAwsResourceIdV1(scope, decoded);
    return page === 'recommendations' && /^[A-Za-z0-9_~.-]+$/u.test(decoded) && decoded !== '.' && decoded !== '..';
  } catch {
    return false;
  }
};

const isResourceTypeArray = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.length <= ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems &&
  value.every(isEnvironmentAwsResourceTypeV1) &&
  value.every((item, index) => index === 0 || value[index - 1] < item);

const resourceTypesMatchReferences = (types: readonly string[], references: readonly unknown[]): boolean => {
  const parsed = references.map(parseEnvironmentAwsLogicalResourceReferenceV1);
  if (parsed.some(reference => reference === null)) return false;
  const derived = [...new Set(parsed.map(reference => reference!.resourceType))].sort();
  return types.length === derived.length && types.every((type, index) => type === derived[index]);
};

/** Validates the complete bounded AWS account projection, including every nested reference. */
export const isEnvironmentAwsAccountProjectionV1 = (value: unknown): value is EnvironmentAwsAccountProjectionV1 => {
  if (!hasSafeContainerShape(value, 0, new Set(), true) || !isRecord(value)) return false;
  if (
    !hasExactKeys(
      value,
      ['schemaVersion', 'scope', 'sourceBinding', 'generatedAt', 'account', 'sourceCoverage', ...ENVIRONMENT_PROJECTION_CONTENT_REQUIRED_KEYS_V1],
      OPTIONAL_CONTENT_KEYS
    ) ||
    value.schemaVersion !== 1 ||
    !isEnvironmentAwsAccountScopeV1(value.scope) ||
    !isEnvironmentAwsAccountSourceBindingV1(value.sourceBinding) ||
    !environmentAwsScopesEqual(value.scope, value.sourceBinding.scope) ||
    !isCanonicalUtcTimestamp(value.generatedAt) ||
    Date.parse(value.generatedAt) < Date.parse(value.sourceBinding.completedAt) ||
    !isRecord(value.account) ||
    !hasExactKeys(value.account, ['safeLabel', 'portalRoute']) ||
    !isSafeLabel(value.account.safeLabel) ||
    !isRecord(value.sourceCoverage) ||
    !hasExactKeys(value.sourceCoverage, SOURCE_COVERAGE_KEYS) ||
    !Object.values(value.sourceCoverage).every(isEnvironmentCoverageStateV1)
  )
    return false;
  const scope = value.scope;
  const sourceNames = new Set(value.sourceBinding.artifacts.map(artifact => artifact.name));
  if ((value.sourceCoverage.completedPortalPublication as { status: string }).status !== 'complete') return false;
  for (const [key, names] of Object.entries(COVERAGE_ARTIFACTS)) {
    const coverage = value.sourceCoverage[key] as { status: string };
    if (['complete', 'partial', 'stale'].includes(coverage.status) && !names.every(name => sourceNames.has(name))) return false;
  }

  const validateContent = createEnvironmentProjectionContentValidatorV1({
    isEvidenceReference: reference => {
      const parsed = parseEnvironmentAwsLogicalArtifactReferenceV1(reference) ?? parseEnvironmentAwsLogicalResourceReferenceV1(reference);
      return (
        parsed !== null &&
        environmentAwsScopesEqual(scope, parsed.scope) &&
        (parsed.kind === 'resource' ||
          (parsed.artifactKind !== 'aws-account-projection' && ARTIFACT_SOURCES[parsed.artifactKind].every(name => sourceNames.has(name))))
      );
    },
    isResourceReference: (reference): reference is EnvironmentLogicalResourceReferenceV1 => {
      const parsed = parseEnvironmentAwsLogicalResourceReferenceV1(reference);
      return parsed !== null && environmentAwsScopesEqual(scope, parsed.scope);
    },
    isResourceTypeArray,
    resourceTypesMatchReferences,
    isPortalRoute: (route): route is string => isPortalRoute(scope, route),
    isMoneyValue: isEnvironmentAwsMoneyValueV1,
  });
  return (
    isPortalRoute(scope, value.account.portalRoute) &&
    validateContent(value) &&
    utf8ByteLength(JSON.stringify(value)) <= ENVIRONMENT_CONTRACT_LIMITS_V1.projectionBytes
  );
};

/** Same fixed document tree and independent run identity as the Azure generation protocol. */
export const isEnvironmentAwsAccountCompiledGenerationPointerV1 = (value: unknown): value is EnvironmentAwsAccountCompiledGenerationPointerV1 => {
  if (!hasSafeContainerShape(value, 0, new Set(), true) || !isRecord(value)) return false;
  return (
    hasExactKeys(
      value,
      ['schemaVersion', 'status', 'environmentRunId', 'scope', 'sourceBinding', 'treeDigestSha256', 'fileCount', 'generatedAt'],
      ['optionalDocuments']
    ) &&
    value.schemaVersion === 1 &&
    value.status === 'completed' &&
    isEnvironmentRunIdV1(value.environmentRunId) &&
    isEnvironmentAwsAccountScopeV1(value.scope) &&
    isEnvironmentAwsAccountSourceBindingV1(value.sourceBinding) &&
    environmentAwsScopesEqual(value.scope, value.sourceBinding.scope) &&
    value.environmentRunId !== value.sourceBinding.portalRunId &&
    !value.sourceBinding.artifacts.some(artifact => artifact.etag === value.environmentRunId) &&
    typeof value.treeDigestSha256 === 'string' &&
    SHA256_PATTERN.test(value.treeDigestSha256) &&
    value.fileCount === ENVIRONMENT_DOCUMENT_NAMES_V1.length &&
    (value.optionalDocuments === undefined || isEnvironmentCapabilityDocumentSetV1(value.optionalDocuments, value.scope)) &&
    isCanonicalUtcTimestamp(value.generatedAt) &&
    Date.parse(value.generatedAt) >= Date.parse(value.sourceBinding.completedAt) &&
    utf8ByteLength(JSON.stringify(value)) <= ENVIRONMENT_CONTRACT_LIMITS_V1.completedPointerBytes
  );
};
