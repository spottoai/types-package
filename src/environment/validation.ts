import {
  ENVIRONMENT_ARTIFACT_KINDS_V1,
  ENVIRONMENT_CONTRACT_LIMITS_V1,
  ENVIRONMENT_DOCUMENT_NAMES_V1,
  ENVIRONMENT_EFFORTS_V1,
  ENVIRONMENT_FINDING_KINDS_V1,
  ENVIRONMENT_IMPACTS_V1,
  ENVIRONMENT_PILLARS_V1,
  ENVIRONMENT_SEVERITIES_V1,
  type EnvironmentArtifactKindV1,
  type EnvironmentBoundedListV1,
  type EnvironmentCardinalityV1,
  type EnvironmentChangeV1,
  type EnvironmentCompiledGenerationPointerV1,
  type EnvironmentCostDriverV1,
  type EnvironmentCostRollupV1,
  type EnvironmentCoverageStateV1,
  type EnvironmentDocumentDescriptorV1,
  type EnvironmentFindingV1,
  type EnvironmentMoneyValueV1,
  type EnvironmentPillarSummaryV1,
  type EnvironmentPillarV1,
  type EnvironmentProjectionWarningV1,
  type EnvironmentRecommendationV1,
  type EnvironmentScopeV1,
  type EnvironmentSourceBindingV1,
  type EnvironmentSourceGenerationV1,
  type EnvironmentSubscriptionProjectionV1,
} from './contracts.js';
import {
  CURRENCY_PATTERN,
  DECIMAL_PATTERN,
  ENVIRONMENT_RUN_ID_PATTERN,
  SHA256_PATTERN,
  hasExactKeys,
  hasSafeContainerShape,
  isBoundedString,
  isCanonicalUtcTimestamp,
  isCustomerString,
  isNonNegativeInteger,
  isRecord,
  isSafeLabel,
  isScopeIdentifier,
  isSourceIdentity,
  utf8ByteLength,
} from './internal.js';
import { isEnvironmentLogicalEvidenceReferenceV1, isEnvironmentLogicalResourceReferenceV1 } from './references.js';

const DOCUMENT_NAMES = new Set<string>(ENVIRONMENT_DOCUMENT_NAMES_V1);
const ARTIFACT_KINDS = new Set<string>(ENVIRONMENT_ARTIFACT_KINDS_V1);
const PILLARS = new Set<string>(ENVIRONMENT_PILLARS_V1);
const FINDING_KINDS = new Set<string>(ENVIRONMENT_FINDING_KINDS_V1);
const SEVERITIES = new Set<string>(ENVIRONMENT_SEVERITIES_V1);
const IMPACTS = new Set<string>(ENVIRONMENT_IMPACTS_V1);
const EFFORTS = new Set<string>(ENVIRONMENT_EFFORTS_V1);
const MONEY_BASES = new Set<string>(['billed', 'amortized', 'unknown']);
const MONEY_PROVENANCE = new Set<string>([
  'subscription-summary',
  'subscription-resources',
  'cost-savings-summary',
  'savings-aggregate',
  'recommendation',
]);
const SAVINGS_ADDITIVITY = new Set<string>(['additive', 'scenario-non-additive']);
const CHANGE_DIRECTIONS = new Set<string>(['increase', 'decrease', 'unchanged', 'unknown']);

const scopesEqual = (left: EnvironmentScopeV1, right: EnvironmentScopeV1): boolean =>
  left.kind === right.kind && left.tenantId === right.tenantId && left.companyId === right.companyId && left.subscriptionId === right.subscriptionId;

/** Validates a bounded, local Portal route suitable for client-visible evidence. */
export const isEnvironmentPortalRouteV1 = (value: unknown): value is string =>
  isBoundedString(value, ENVIRONMENT_CONTRACT_LIMITS_V1.customerStringScalars, { trimmed: true, controls: true }) &&
  value.startsWith('/') &&
  !value.startsWith('//') &&
  !value.includes('\\') &&
  !value.includes('://') &&
  !value.includes('?') &&
  !value.includes('#') &&
  !value.includes('%') &&
  value.split('/').every(segment => segment !== '.' && segment !== '..');

const isGeneralKey = (value: unknown): value is string =>
  isBoundedString(value, ENVIRONMENT_CONTRACT_LIMITS_V1.safeLabelScalars, { trimmed: true, controls: true });

const isReferenceArray = (value: unknown): boolean =>
  Array.isArray(value) &&
  value.length <= ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems &&
  value.every(isEnvironmentLogicalEvidenceReferenceV1) &&
  new Set(value).size === value.length;

const isResourceReferenceArray = (value: unknown): boolean =>
  Array.isArray(value) &&
  value.length <= ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems &&
  value.every(isEnvironmentLogicalResourceReferenceV1) &&
  new Set(value).size === value.length;

const isPercentage = (value: unknown): value is string => typeof value === 'string' && DECIMAL_PATTERN.test(value) && Number(value) <= 100;

/** Validates one admitted environment pillar. */
export const isEnvironmentPillarV1 = (value: unknown): value is EnvironmentPillarV1 => typeof value === 'string' && PILLARS.has(value);

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

/** Validates canonical decimal money with explicit currency, basis, period, and provenance. */
export const isEnvironmentMoneyValueV1 = (value: unknown): value is EnvironmentMoneyValueV1 =>
  isRecord(value) &&
  hasExactKeys(value, ['amount', 'currencyCode', 'basis', 'period', 'provenance'], ['savingsAdditivity']) &&
  typeof value.amount === 'string' &&
  DECIMAL_PATTERN.test(value.amount) &&
  typeof value.currencyCode === 'string' &&
  (value.currencyCode === 'unknown' || CURRENCY_PATTERN.test(value.currencyCode)) &&
  typeof value.basis === 'string' &&
  MONEY_BASES.has(value.basis) &&
  isBoundedString(value.period, ENVIRONMENT_CONTRACT_LIMITS_V1.safeLabelScalars, { trimmed: true, controls: true }) &&
  typeof value.provenance === 'string' &&
  MONEY_PROVENANCE.has(value.provenance) &&
  (value.savingsAdditivity === undefined || (typeof value.savingsAdditivity === 'string' && SAVINGS_ADDITIVITY.has(value.savingsAdditivity)));

const isObservedMoney = (value: unknown): value is EnvironmentMoneyValueV1 =>
  isEnvironmentMoneyValueV1(value) && value.savingsAdditivity === undefined;

const isSavingsMoney = (value: unknown): value is EnvironmentMoneyValueV1 =>
  isEnvironmentMoneyValueV1(value) && value.savingsAdditivity !== undefined;

/** Validates the closed coverage-state union and state-specific freshness rules. */
export const isEnvironmentCoverageStateV1 = (value: unknown): value is EnvironmentCoverageStateV1 => {
  if (!isRecord(value) || typeof value.status !== 'string') return false;
  const hasValidFreshness =
    (value.observedAt === undefined || isCanonicalUtcTimestamp(value.observedAt)) &&
    (value.completeThrough === undefined || isCanonicalUtcTimestamp(value.completeThrough)) &&
    (value.observedAt === undefined ||
      value.completeThrough === undefined ||
      Date.parse(value.completeThrough as string) <= Date.parse(value.observedAt as string));
  if (value.status === 'complete') {
    return hasExactKeys(value, ['status'], ['observedAt', 'completeThrough']) && hasValidFreshness;
  }
  if (value.status === 'partial') {
    return (
      hasExactKeys(value, ['status', 'reason'], ['observedAt', 'completeThrough']) &&
      isCustomerString(value.reason) &&
      value.reason.length > 0 &&
      hasValidFreshness
    );
  }
  if (value.status === 'stale') {
    return (
      hasExactKeys(value, ['status', 'reason', 'observedAt'], ['completeThrough']) &&
      isCustomerString(value.reason) &&
      value.reason.length > 0 &&
      hasValidFreshness
    );
  }
  if (value.status === 'unavailable' || value.status === 'not-collected') {
    return hasExactKeys(value, ['status', 'reason']) && isCustomerString(value.reason) && value.reason.length > 0;
  }
  return false;
};

const isBoundedList = <T>(value: unknown, itemValidator: (item: unknown) => item is T): value is EnvironmentBoundedListV1<T> => {
  if (!isRecord(value) || !hasExactKeys(value, ['items', 'totalCount', 'includedCount', 'truncated'], ['continuationReference'])) return false;
  if (!Array.isArray(value.items) || value.items.length > ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems || !value.items.every(itemValidator))
    return false;
  if (!isNonNegativeInteger(value.totalCount) || !isNonNegativeInteger(value.includedCount)) return false;
  if (value.includedCount !== value.items.length || value.totalCount < value.includedCount || typeof value.truncated !== 'boolean') return false;
  if (value.truncated !== value.totalCount > value.includedCount) return false;
  if (value.continuationReference !== undefined && !isEnvironmentLogicalEvidenceReferenceV1(value.continuationReference)) return false;
  return !value.truncated || value.continuationReference !== undefined;
};

const isCostRollup = (value: unknown): value is EnvironmentCostRollupV1 =>
  isRecord(value) &&
  hasExactKeys(value, ['key', 'safeLabel', 'resourceCount', 'sourceReferences'], ['observedCost', 'potentialSavings']) &&
  isGeneralKey(value.key) &&
  isSafeLabel(value.safeLabel) &&
  isNonNegativeInteger(value.resourceCount) &&
  (value.observedCost === undefined || isObservedMoney(value.observedCost)) &&
  (value.potentialSavings === undefined || isSavingsMoney(value.potentialSavings)) &&
  isReferenceArray(value.sourceReferences);

const isCostDriver = (value: unknown): value is EnvironmentCostDriverV1 =>
  isRecord(value) &&
  hasExactKeys(value, ['key', 'safeLabel', 'sourceReferences'], ['description', 'observedCost', 'portalRoute', 'resourceReference']) &&
  isGeneralKey(value.key) &&
  isSafeLabel(value.safeLabel) &&
  (value.description === undefined || isCustomerString(value.description)) &&
  (value.observedCost === undefined || isObservedMoney(value.observedCost)) &&
  (value.portalRoute === undefined || isEnvironmentPortalRouteV1(value.portalRoute)) &&
  (value.resourceReference === undefined || isEnvironmentLogicalResourceReferenceV1(value.resourceReference)) &&
  isReferenceArray(value.sourceReferences);

const isPillarScore = (value: unknown): boolean =>
  isRecord(value) &&
  hasExactKeys(value, ['value', 'maximum', 'safeLabel']) &&
  isPercentage(value.value) &&
  value.maximum === '100' &&
  isSafeLabel(value.safeLabel);

/** Validates exact, lower-bound, and unavailable count evidence without ambiguous totals. */
export const isEnvironmentCardinalityV1 = (value: unknown): value is EnvironmentCardinalityV1 => {
  if (!isRecord(value) || typeof value.basis !== 'string') return false;
  if (value.basis === 'exact') {
    return hasExactKeys(value, ['basis', 'value']) && isNonNegativeInteger(value.value);
  }
  if (value.basis === 'lower-bound') {
    return hasExactKeys(value, ['basis', 'value', 'reason']) && isNonNegativeInteger(value.value) && isSafeLabel(value.reason);
  }
  if (value.basis === 'unavailable') {
    return hasExactKeys(value, ['basis', 'reason']) && isSafeLabel(value.reason);
  }
  return false;
};

const isPillarSummary = (value: unknown): value is EnvironmentPillarSummaryV1 =>
  isRecord(value) &&
  hasExactKeys(
    value,
    ['pillar', 'coverage', 'findingCount', 'recommendationCount', 'affectedResources', 'portalRoute', 'sourceReferences'],
    ['score']
  ) &&
  isEnvironmentPillarV1(value.pillar) &&
  isEnvironmentCoverageStateV1(value.coverage) &&
  isNonNegativeInteger(value.findingCount) &&
  isNonNegativeInteger(value.recommendationCount) &&
  isEnvironmentCardinalityV1(value.affectedResources) &&
  isEnvironmentPortalRouteV1(value.portalRoute) &&
  (value.score === undefined || isPillarScore(value.score)) &&
  isReferenceArray(value.sourceReferences);

const isPillarSummaries = (value: unknown): boolean =>
  isRecord(value) &&
  hasExactKeys(value, ENVIRONMENT_PILLARS_V1) &&
  ENVIRONMENT_PILLARS_V1.every(pillar => isPillarSummary(value[pillar]) && value[pillar]?.pillar === pillar);

const isFinding = (value: unknown): value is EnvironmentFindingV1 =>
  isRecord(value) &&
  hasExactKeys(
    value,
    ['findingId', 'pillar', 'kind', 'safeLabel', 'severity', 'resourceReferences', 'sourceReferences'],
    ['description', 'impact', 'effort', 'affectedResources', 'portalRoute']
  ) &&
  isScopeIdentifier(value.findingId) &&
  isEnvironmentPillarV1(value.pillar) &&
  typeof value.kind === 'string' &&
  FINDING_KINDS.has(value.kind) &&
  isSafeLabel(value.safeLabel) &&
  typeof value.severity === 'string' &&
  SEVERITIES.has(value.severity) &&
  (value.description === undefined || isCustomerString(value.description)) &&
  (value.impact === undefined || (typeof value.impact === 'string' && IMPACTS.has(value.impact))) &&
  (value.effort === undefined || (typeof value.effort === 'string' && EFFORTS.has(value.effort))) &&
  (value.affectedResources === undefined || isEnvironmentCardinalityV1(value.affectedResources)) &&
  (value.portalRoute === undefined || isEnvironmentPortalRouteV1(value.portalRoute)) &&
  isResourceReferenceArray(value.resourceReferences) &&
  isReferenceArray(value.sourceReferences);

const isRecommendation = (value: unknown): value is EnvironmentRecommendationV1 =>
  isRecord(value) &&
  hasExactKeys(
    value,
    ['recommendationId', 'pillar', 'safeLabel', 'portalRoute', 'resourceReferences', 'sourceReferences'],
    ['description', 'impact', 'effort', 'affectedResources', 'potentialSavings']
  ) &&
  isScopeIdentifier(value.recommendationId) &&
  isEnvironmentPillarV1(value.pillar) &&
  isSafeLabel(value.safeLabel) &&
  isEnvironmentPortalRouteV1(value.portalRoute) &&
  (value.description === undefined || isCustomerString(value.description)) &&
  (value.impact === undefined || (typeof value.impact === 'string' && IMPACTS.has(value.impact))) &&
  (value.effort === undefined || (typeof value.effort === 'string' && EFFORTS.has(value.effort))) &&
  (value.affectedResources === undefined || isEnvironmentCardinalityV1(value.affectedResources)) &&
  (value.potentialSavings === undefined || isSavingsMoney(value.potentialSavings)) &&
  isResourceReferenceArray(value.resourceReferences) &&
  isReferenceArray(value.sourceReferences);

const isChange = (value: unknown): value is EnvironmentChangeV1 =>
  isRecord(value) &&
  hasExactKeys(value, ['key', 'pillars', 'safeLabel', 'description', 'direction', 'sourceReferences'], ['amount']) &&
  isGeneralKey(value.key) &&
  Array.isArray(value.pillars) &&
  value.pillars.length > 0 &&
  value.pillars.length <= ENVIRONMENT_PILLARS_V1.length &&
  value.pillars.every(isEnvironmentPillarV1) &&
  new Set(value.pillars).size === value.pillars.length &&
  isSafeLabel(value.safeLabel) &&
  isCustomerString(value.description) &&
  typeof value.direction === 'string' &&
  CHANGE_DIRECTIONS.has(value.direction) &&
  (value.amount === undefined || isObservedMoney(value.amount)) &&
  isReferenceArray(value.sourceReferences);

const isWarning = (value: unknown): value is EnvironmentProjectionWarningV1 =>
  isRecord(value) &&
  hasExactKeys(value, ['code', 'safeLabel', 'sourceReferences'], ['pillar', 'detail']) &&
  isGeneralKey(value.code) &&
  isSafeLabel(value.safeLabel) &&
  (value.pillar === undefined || isEnvironmentPillarV1(value.pillar)) &&
  (value.detail === undefined || isCustomerString(value.detail)) &&
  isReferenceArray(value.sourceReferences);

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

const isEstateSummary = (value: unknown): boolean =>
  isRecord(value) &&
  hasExactKeys(value, ['resourceCount', 'serviceFamilyCount', 'locationCount']) &&
  isNonNegativeInteger(value.resourceCount) &&
  isNonNegativeInteger(value.serviceFamilyCount) &&
  isNonNegativeInteger(value.locationCount);

const isCostSummary = (value: unknown): boolean =>
  isRecord(value) &&
  hasExactKeys(value, [], ['observedCost', 'potentialSavings', 'costRecommendationCount']) &&
  (value.observedCost === undefined || isObservedMoney(value.observedCost)) &&
  (value.potentialSavings === undefined || isSavingsMoney(value.potentialSavings)) &&
  (value.costRecommendationCount === undefined || isNonNegativeInteger(value.costRecommendationCount));

/** Validates the strict, bounded multi-pillar subscription environment projection. */
export const isEnvironmentSubscriptionProjectionV1 = (value: unknown): value is EnvironmentSubscriptionProjectionV1 => {
  if (!hasSafeContainerShape(value) || !isRecord(value)) return false;
  if (
    !hasExactKeys(value, [
      'schemaVersion',
      'scope',
      'sourceBinding',
      'generatedAt',
      'subscription',
      'sourceCoverage',
      'estateSummary',
      'costSummary',
      'serviceFamilyRollups',
      'estateCostRollups',
      'costDrivers',
      'pillars',
      'findings',
      'recommendations',
      'changes',
      'warnings',
      'sourceReferences',
    ]) ||
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
    !isEstateSummary(value.estateSummary) ||
    !isCostSummary(value.costSummary) ||
    !isBoundedList(value.serviceFamilyRollups, isCostRollup) ||
    !isBoundedList(value.estateCostRollups, isCostRollup) ||
    !isBoundedList(value.costDrivers, isCostDriver) ||
    !isPillarSummaries(value.pillars) ||
    !isBoundedList(value.findings, isFinding) ||
    !isBoundedList(value.recommendations, isRecommendation) ||
    !isBoundedList(value.changes, isChange) ||
    !isBoundedList(value.warnings, isWarning) ||
    !isReferenceArray(value.sourceReferences)
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
    !hasExactKeys(value, ['schemaVersion', 'status', 'environmentRunId', 'scope', 'sourceBinding', 'treeDigestSha256', 'fileCount', 'generatedAt']) ||
    value.schemaVersion !== 1 ||
    value.status !== 'completed' ||
    !isEnvironmentRunIdV1(value.environmentRunId) ||
    !isEnvironmentScopeV1(value.scope) ||
    !isEnvironmentSourceBindingV1(value.sourceBinding) ||
    !scopesEqual(value.scope, value.sourceBinding.scope) ||
    typeof value.treeDigestSha256 !== 'string' ||
    !SHA256_PATTERN.test(value.treeDigestSha256) ||
    value.fileCount !== ENVIRONMENT_DOCUMENT_NAMES_V1.length ||
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
