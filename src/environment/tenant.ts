import type {
  EnvironmentBoundedListV1,
  EnvironmentCoverageStateV1,
  EnvironmentLogicalEvidenceReferenceV1,
  EnvironmentProjectionWarningV1,
  EnvironmentSeverityV1,
} from './contracts.js';
import { ENVIRONMENT_CONTRACT_LIMITS_V1 } from './contracts.js';
import {
  ENVIRONMENT_RUN_ID_PATTERN,
  SHA256_PATTERN,
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
import { isEnvironmentLogicalEvidenceReferenceV1 } from './references.js';
import { isEnvironmentCoverageStateV1 } from './validation.js';

export const ENVIRONMENT_TENANT_DOCUMENT_NAMES_V1 = [
  'projection.json',
  'environment-index.md',
  'identity.md',
  'governance.md',
  'commitments.md',
] as const;

export type EnvironmentTenantDocumentNameV1 = (typeof ENVIRONMENT_TENANT_DOCUMENT_NAMES_V1)[number];
export type EnvironmentTenantMarkdownDocumentNameV1 = Exclude<EnvironmentTenantDocumentNameV1, 'projection.json'>;

export interface EnvironmentTenantScopeV1 {
  kind: 'azure-tenant';
  tenantId: string;
}

export interface EnvironmentTenantSourceBindingV1 {
  kind: 'azure-tenant-sync';
  scope: EnvironmentTenantScopeV1;
  tenantSyncRunId: string;
  completedAt: string;
}

export interface EnvironmentTenantSourceCoverageV1 {
  tenantSync: EnvironmentCoverageStateV1;
  governance: EnvironmentCoverageStateV1;
  identity: EnvironmentCoverageStateV1;
  commitments: EnvironmentCoverageStateV1;
}

export interface EnvironmentTenantIdentitySummaryV1 {
  applicationCount: number;
  servicePrincipalCount: number;
  globalAdministratorCount: number;
  permanentGlobalAdministratorCount: number;
  eligibleGlobalAdministratorCount: number;
  mfaKnownGlobalAdministratorCount: number;
}

export interface EnvironmentTenantGovernanceSummaryV1 {
  managementGroupCount: number;
  subscriptionCount: number;
  policyAssignmentCount: number;
  policyExemptionCount: number;
  roleAssignmentCount: number;
  privilegedAssignmentCount: number;
  customRoleCount: number;
  findingCount: number;
}

export interface EnvironmentTenantCommitmentSummaryV1 {
  reservationCount: number;
  savingsPlanCount: number;
  expiringWithin90DaysCount: number;
}

export interface EnvironmentTenantGlobalAdministratorV1 {
  principalId: string;
  safeLabel: string;
  principalType: 'user' | 'group' | 'servicePrincipal' | 'unknown';
  assignmentModes: Array<'permanent' | 'eligible' | 'active' | 'unknown'>;
  mfaStatus: 'mfa' | 'unknown';
  sourceReferences: EnvironmentLogicalEvidenceReferenceV1[];
}

export interface EnvironmentTenantGovernanceFindingV1 {
  findingId: string;
  safeLabel: string;
  severity: EnvironmentSeverityV1;
  category?: string;
  scopeType?: string;
  sourceReferences: EnvironmentLogicalEvidenceReferenceV1[];
}

export interface EnvironmentTenantCommitmentV1 {
  commitmentId: string;
  kind: 'reservation' | 'savings-plan';
  safeLabel: string;
  status?: string;
  expiry?: string;
  quantity?: number;
  sourceReferences: EnvironmentLogicalEvidenceReferenceV1[];
}

export interface EnvironmentTenantProjectionV1 {
  schemaVersion: 1;
  scope: EnvironmentTenantScopeV1;
  sourceBinding: EnvironmentTenantSourceBindingV1;
  generatedAt: string;
  tenant: { safeLabel: string };
  sourceCoverage: EnvironmentTenantSourceCoverageV1;
  identitySummary: EnvironmentTenantIdentitySummaryV1;
  governanceSummary: EnvironmentTenantGovernanceSummaryV1;
  commitmentSummary: EnvironmentTenantCommitmentSummaryV1;
  globalAdministrators: EnvironmentBoundedListV1<EnvironmentTenantGlobalAdministratorV1>;
  governanceFindings: EnvironmentBoundedListV1<EnvironmentTenantGovernanceFindingV1>;
  commitments: EnvironmentBoundedListV1<EnvironmentTenantCommitmentV1>;
  warnings: EnvironmentBoundedListV1<EnvironmentProjectionWarningV1>;
  sourceReferences: EnvironmentLogicalEvidenceReferenceV1[];
}

export type EnvironmentTenantDocumentDescriptorV1 =
  | {
      name: 'projection.json';
      mediaType: 'application/json';
      byteCount: number;
      contentSha256: string;
      approximateTokenCount: number;
    }
  | {
      name: EnvironmentTenantMarkdownDocumentNameV1;
      mediaType: 'text/markdown; charset=utf-8';
      byteCount: number;
      contentSha256: string;
      approximateTokenCount: number;
    };

export interface EnvironmentTenantCompiledGenerationPointerV1 {
  schemaVersion: 1;
  status: 'completed';
  environmentRunId: string;
  scope: EnvironmentTenantScopeV1;
  sourceBinding: EnvironmentTenantSourceBindingV1;
  treeDigestSha256: string;
  fileCount: (typeof ENVIRONMENT_TENANT_DOCUMENT_NAMES_V1)['length'];
  generatedAt: string;
}

const REFERENCE_PATTERN = /^spotto:\/\/(?:artifact|resource)\/v1\//u;
const SEVERITIES = new Set(['critical', 'high', 'medium', 'low', 'informational', 'unknown']);
const PRINCIPAL_TYPES = new Set(['user', 'group', 'servicePrincipal', 'unknown']);
const ASSIGNMENT_MODES = new Set(['permanent', 'eligible', 'active', 'unknown']);

/** Builds the canonical logical subject for a tenant environment artifact. */
export const buildEnvironmentTenantScopeQualifiedSubjectV1 = (scope: EnvironmentTenantScopeV1): string => {
  if (!isEnvironmentTenantScopeV1(scope)) throw new TypeError('Invalid tenant environment scope.');
  return JSON.stringify([scope.kind, scope.tenantId]);
};

/** Validates a tenant environment scope. */
export const isEnvironmentTenantScopeV1 = (value: unknown): value is EnvironmentTenantScopeV1 =>
  isRecord(value) && hasExactKeys(value, ['kind', 'tenantId']) && value.kind === 'azure-tenant' && isScopeIdentifier(value.tenantId);

/** Validates the completed tenant-sync generation bound to a tenant environment generation. */
export const isEnvironmentTenantSourceBindingV1 = (value: unknown): value is EnvironmentTenantSourceBindingV1 =>
  isRecord(value) &&
  hasExactKeys(value, ['kind', 'scope', 'tenantSyncRunId', 'completedAt']) &&
  value.kind === 'azure-tenant-sync' &&
  isEnvironmentTenantScopeV1(value.scope) &&
  isSourceIdentity(value.tenantSyncRunId) &&
  isCanonicalUtcTimestamp(value.completedAt);

const scopesEqual = (left: EnvironmentTenantScopeV1, right: EnvironmentTenantScopeV1): boolean => left.tenantId === right.tenantId;

const isReferenceArray = (value: unknown): value is EnvironmentLogicalEvidenceReferenceV1[] =>
  Array.isArray(value) && value.length <= ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems && value.every(isEnvironmentLogicalEvidenceReferenceV1);

const isBoundedList = <T>(value: unknown, itemGuard: (item: unknown) => item is T): value is EnvironmentBoundedListV1<T> =>
  isRecord(value) &&
  hasExactKeys(value, ['items', 'totalCount', 'includedCount', 'truncated'], ['continuationReference']) &&
  Array.isArray(value.items) &&
  value.items.length <= ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems &&
  value.items.every(itemGuard) &&
  isNonNegativeInteger(value.totalCount) &&
  value.includedCount === value.items.length &&
  value.totalCount >= value.includedCount &&
  value.truncated === value.totalCount > value.includedCount &&
  (value.continuationReference === undefined || isEnvironmentLogicalEvidenceReferenceV1(value.continuationReference)) &&
  (!value.truncated || value.continuationReference !== undefined);

const isCountRecord = (value: unknown, keys: readonly string[]): boolean =>
  isRecord(value) && hasExactKeys(value, keys) && keys.every(key => isNonNegativeInteger(value[key]));

const isGlobalAdministrator = (value: unknown): value is EnvironmentTenantGlobalAdministratorV1 =>
  isRecord(value) &&
  hasExactKeys(value, ['principalId', 'safeLabel', 'principalType', 'assignmentModes', 'mfaStatus', 'sourceReferences']) &&
  isScopeIdentifier(value.principalId) &&
  isSafeLabel(value.safeLabel) &&
  typeof value.principalType === 'string' &&
  PRINCIPAL_TYPES.has(value.principalType) &&
  Array.isArray(value.assignmentModes) &&
  value.assignmentModes.length <= 4 &&
  value.assignmentModes.every(mode => typeof mode === 'string' && ASSIGNMENT_MODES.has(mode)) &&
  new Set(value.assignmentModes).size === value.assignmentModes.length &&
  (value.mfaStatus === 'mfa' || value.mfaStatus === 'unknown') &&
  isReferenceArray(value.sourceReferences);

const isGovernanceFinding = (value: unknown): value is EnvironmentTenantGovernanceFindingV1 =>
  isRecord(value) &&
  hasExactKeys(value, ['findingId', 'safeLabel', 'severity', 'sourceReferences'], ['category', 'scopeType']) &&
  isScopeIdentifier(value.findingId) &&
  isSafeLabel(value.safeLabel) &&
  typeof value.severity === 'string' &&
  SEVERITIES.has(value.severity) &&
  (value.category === undefined || isSafeLabel(value.category)) &&
  (value.scopeType === undefined || isSafeLabel(value.scopeType)) &&
  isReferenceArray(value.sourceReferences);

const isCommitment = (value: unknown): value is EnvironmentTenantCommitmentV1 =>
  isRecord(value) &&
  hasExactKeys(value, ['commitmentId', 'kind', 'safeLabel', 'sourceReferences'], ['status', 'expiry', 'quantity']) &&
  isScopeIdentifier(value.commitmentId) &&
  (value.kind === 'reservation' || value.kind === 'savings-plan') &&
  isSafeLabel(value.safeLabel) &&
  (value.status === undefined || isSafeLabel(value.status)) &&
  (value.expiry === undefined || isCanonicalUtcTimestamp(value.expiry)) &&
  (value.quantity === undefined || isNonNegativeInteger(value.quantity)) &&
  isReferenceArray(value.sourceReferences);

const isWarning = (value: unknown): value is EnvironmentProjectionWarningV1 =>
  isRecord(value) &&
  hasExactKeys(value, ['code', 'safeLabel', 'sourceReferences'], ['pillar', 'detail']) &&
  isScopeIdentifier(value.code) &&
  isSafeLabel(value.safeLabel) &&
  value.pillar === undefined &&
  (value.detail === undefined || isBoundedString(value.detail, ENVIRONMENT_CONTRACT_LIMITS_V1.customerStringScalars, { controls: true })) &&
  isReferenceArray(value.sourceReferences);

/** Validates the strict tenant environment projection. */
export const isEnvironmentTenantProjectionV1 = (value: unknown): value is EnvironmentTenantProjectionV1 => {
  if (!hasSafeContainerShape(value) || !isRecord(value)) return false;
  if (
    !hasExactKeys(value, [
      'schemaVersion',
      'scope',
      'sourceBinding',
      'generatedAt',
      'tenant',
      'sourceCoverage',
      'identitySummary',
      'governanceSummary',
      'commitmentSummary',
      'globalAdministrators',
      'governanceFindings',
      'commitments',
      'warnings',
      'sourceReferences',
    ]) ||
    value.schemaVersion !== 1 ||
    !isEnvironmentTenantScopeV1(value.scope) ||
    !isEnvironmentTenantSourceBindingV1(value.sourceBinding) ||
    !scopesEqual(value.scope, value.sourceBinding.scope) ||
    !isCanonicalUtcTimestamp(value.generatedAt) ||
    Date.parse(value.generatedAt) < Date.parse(value.sourceBinding.completedAt) ||
    !isRecord(value.tenant) ||
    !hasExactKeys(value.tenant, ['safeLabel']) ||
    !isSafeLabel(value.tenant.safeLabel) ||
    !isRecord(value.sourceCoverage) ||
    !hasExactKeys(value.sourceCoverage, ['tenantSync', 'governance', 'identity', 'commitments']) ||
    !Object.values(value.sourceCoverage).every(isEnvironmentCoverageStateV1) ||
    !isCountRecord(value.identitySummary, [
      'applicationCount',
      'servicePrincipalCount',
      'globalAdministratorCount',
      'permanentGlobalAdministratorCount',
      'eligibleGlobalAdministratorCount',
      'mfaKnownGlobalAdministratorCount',
    ]) ||
    !isCountRecord(value.governanceSummary, [
      'managementGroupCount',
      'subscriptionCount',
      'policyAssignmentCount',
      'policyExemptionCount',
      'roleAssignmentCount',
      'privilegedAssignmentCount',
      'customRoleCount',
      'findingCount',
    ]) ||
    !isCountRecord(value.commitmentSummary, ['reservationCount', 'savingsPlanCount', 'expiringWithin90DaysCount']) ||
    !isBoundedList(value.globalAdministrators, isGlobalAdministrator) ||
    !isBoundedList(value.governanceFindings, isGovernanceFinding) ||
    !isBoundedList(value.commitments, isCommitment) ||
    !isBoundedList(value.warnings, isWarning) ||
    !isReferenceArray(value.sourceReferences)
  ) {
    return false;
  }
  return utf8ByteLength(JSON.stringify(value)) <= ENVIRONMENT_CONTRACT_LIMITS_V1.projectionBytes;
};

const descriptorLimit = (name: EnvironmentTenantDocumentNameV1): number =>
  name === 'projection.json' ? ENVIRONMENT_CONTRACT_LIMITS_V1.projectionBytes : ENVIRONMENT_CONTRACT_LIMITS_V1.environmentIndexBytes;

/** Validates one tenant environment document descriptor. */
export const isEnvironmentTenantDocumentDescriptorV1 = (value: unknown): value is EnvironmentTenantDocumentDescriptorV1 =>
  isRecord(value) &&
  hasExactKeys(value, ['name', 'mediaType', 'byteCount', 'contentSha256', 'approximateTokenCount']) &&
  typeof value.name === 'string' &&
  ENVIRONMENT_TENANT_DOCUMENT_NAMES_V1.includes(value.name as EnvironmentTenantDocumentNameV1) &&
  value.mediaType === (value.name === 'projection.json' ? 'application/json' : 'text/markdown; charset=utf-8') &&
  isNonNegativeInteger(value.byteCount) &&
  value.byteCount > 0 &&
  value.byteCount <= descriptorLimit(value.name as EnvironmentTenantDocumentNameV1) &&
  typeof value.contentSha256 === 'string' &&
  SHA256_PATTERN.test(value.contentSha256) &&
  isNonNegativeInteger(value.approximateTokenCount);

/** Validates the exact five-file tenant environment descriptor set. */
export const isEnvironmentTenantDocumentDescriptorSetV1 = (value: unknown): value is EnvironmentTenantDocumentDescriptorV1[] =>
  Array.isArray(value) &&
  value.length === ENVIRONMENT_TENANT_DOCUMENT_NAMES_V1.length &&
  value.every(isEnvironmentTenantDocumentDescriptorV1) &&
  new Set(value.map(item => item.name)).size === ENVIRONMENT_TENANT_DOCUMENT_NAMES_V1.length;

/** Builds the canonical tenant tree-digest preimage. */
export const buildEnvironmentTenantTreeDigestPreimageV1 = (descriptors: readonly EnvironmentTenantDocumentDescriptorV1[]): string => {
  if (!isEnvironmentTenantDocumentDescriptorSetV1(descriptors)) throw new TypeError('Invalid tenant environment descriptor set.');
  return JSON.stringify(
    descriptors
      .map(descriptor => [descriptor.name, descriptor.contentSha256] as const)
      .sort((left, right) => (left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : 0))
  );
};

/** Validates the atomically visible tenant environment completion pointer. */
export const isEnvironmentTenantCompiledGenerationPointerV1 = (value: unknown): value is EnvironmentTenantCompiledGenerationPointerV1 =>
  hasSafeContainerShape(value) &&
  isRecord(value) &&
  hasExactKeys(value, ['schemaVersion', 'status', 'environmentRunId', 'scope', 'sourceBinding', 'treeDigestSha256', 'fileCount', 'generatedAt']) &&
  value.schemaVersion === 1 &&
  value.status === 'completed' &&
  typeof value.environmentRunId === 'string' &&
  value.environmentRunId.length <= ENVIRONMENT_CONTRACT_LIMITS_V1.environmentRunIdAsciiCharacters &&
  ENVIRONMENT_RUN_ID_PATTERN.test(value.environmentRunId) &&
  value.environmentRunId !== '.' &&
  value.environmentRunId !== '..' &&
  isEnvironmentTenantScopeV1(value.scope) &&
  isEnvironmentTenantSourceBindingV1(value.sourceBinding) &&
  scopesEqual(value.scope, value.sourceBinding.scope) &&
  value.environmentRunId !== value.sourceBinding.tenantSyncRunId &&
  typeof value.treeDigestSha256 === 'string' &&
  SHA256_PATTERN.test(value.treeDigestSha256) &&
  value.fileCount === ENVIRONMENT_TENANT_DOCUMENT_NAMES_V1.length &&
  isCanonicalUtcTimestamp(value.generatedAt) &&
  Date.parse(value.generatedAt) >= Date.parse(value.sourceBinding.completedAt) &&
  utf8ByteLength(JSON.stringify(value)) <= ENVIRONMENT_CONTRACT_LIMITS_V1.completedPointerBytes;

/** Narrow syntax guard used before tenant references are passed to the common parser. */
export const isEnvironmentTenantLogicalReferenceV1 = (value: unknown): value is EnvironmentLogicalEvidenceReferenceV1 =>
  typeof value === 'string' && REFERENCE_PATTERN.test(value) && isEnvironmentLogicalEvidenceReferenceV1(value);
