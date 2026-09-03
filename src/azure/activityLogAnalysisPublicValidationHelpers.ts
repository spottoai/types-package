import {
  ACTIVITY_LOG_TAG_IDS,
  ACTIVITY_LOG_TAXONOMY_VERSION,
  PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1,
  type ActivityLogAnalysisCount,
  type PortalActivityEvidenceId,
  type PortalActivityAnalysisGroupId,
  type PortalActivityLogAnalysisScope,
  type PortalActivityLogClassification,
} from './activityLogAnalysis';

export const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const EVIDENCE_ID = /^aev1_[a-f0-9]{64}$/;
const GROUP_ID = /^aag1_[a-f0-9]{64}$/;
export const TAG_IDS = new Set<string>(ACTIVITY_LOG_TAG_IDS);
export const ORIGINS = new Set(['manual', 'workloadAutomation', 'azurePlatform', 'unknown']);
export const EFFECTS = new Set(['write', 'delete', 'action', 'read', 'other']);
export const CONFIDENCES = new Set(['high', 'medium', 'low']);
export const POWER_SUFFICIENCY = new Set(['oneSided', 'oneOff', 'sameDayRepeat', 'repeated']);
export const LIMITATIONS = new Set([
  'source-coverage-partial',
  'unclassified-events',
  'facet-values-truncated',
  'resource-summaries-truncated',
  'operation-summaries-truncated',
  'security-sensitive-truncated',
  'power-patterns-truncated',
  'artifact-size-budget',
  'month-missing',
  'month-partial',
  'month-stale',
  'month-freshness-unknown',
  'nested-values-truncated',
  'mixed-analysis-versions',
  'mixed-taxonomy-versions',
  'response-truncated',
]);
const SCOPE_LEVELS = new Set(['subscription', 'resourceGroup', 'resource', 'unknown']);
const RESERVED_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

export const isRecord = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

export const hasExactKeys = (value: unknown, required: readonly string[], optional: readonly string[] = []): value is Record<string, unknown> => {
  if (!isRecord(value)) return false;
  const allowed = new Set([...required, ...optional]);
  const keys = Object.keys(value);
  return required.every(key => Object.prototype.hasOwnProperty.call(value, key)) && keys.every(key => allowed.has(key) && !RESERVED_KEYS.has(key));
};

export const isText = (value: unknown, maximum: number): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= maximum && value.trim() === value;

export const isCount = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0;
export const isPositiveCount = (value: unknown): value is number => isCount(value) && value > 0;

export const isTimestamp = (value: unknown): value is string => {
  if (typeof value !== 'string' || !TIMESTAMP.test(value)) return false;
  const milliseconds = Date.parse(value);
  return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString() === value;
};

export const isDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value)) return false;
  return new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
};

export const isSortedUniqueStrings = (value: unknown, maximum: number, predicate: (item: string) => boolean): value is string[] =>
  Array.isArray(value) &&
  value.length <= maximum &&
  value.every((item, index) => typeof item === 'string' && predicate(item) && (index === 0 || value[index - 1] < item));

export const countRowsTotal = (rows: ActivityLogAnalysisCount[]): number | undefined => {
  let total = 0;
  for (const row of rows) {
    total += row.count;
    if (!Number.isSafeInteger(total)) return undefined;
  }
  return total;
};

export const isCountRows = (
  value: unknown,
  maximum: number,
  valueMaximum: number,
  allowed?: ReadonlySet<string>
): value is ActivityLogAnalysisCount[] => {
  if (!Array.isArray(value) || value.length > maximum) return false;
  for (let index = 0; index < value.length; index += 1) {
    const row = value[index];
    if (!hasExactKeys(row, ['value', 'count']) || !isText(row.value, valueMaximum) || !isPositiveCount(row.count)) return false;
    if (allowed && !allowed.has(row.value)) return false;
    const previous = value[index - 1];
    if (previous && (previous.count < row.count || (previous.count === row.count && previous.value >= row.value))) return false;
  }
  return true;
};

export const isChronologicalCountRows = (value: unknown, predicate: (key: string) => boolean): value is ActivityLogAnalysisCount[] =>
  Array.isArray(value) &&
  value.every(
    (row, index) =>
      hasExactKeys(row, ['value', 'count']) &&
      typeof row.value === 'string' &&
      predicate(row.value) &&
      isPositiveCount(row.count) &&
      (index === 0 || value[index - 1].value < row.value)
  );

export const isScope = (value: unknown, subscriptionId: string, resourceId?: string): value is PortalActivityLogAnalysisScope => {
  if (
    !hasExactKeys(value, ['subscriptionId', 'level'], ['resourceId', 'resourceGroup', 'provider', 'resourceType', 'resourceName']) ||
    value.subscriptionId !== subscriptionId ||
    typeof value.level !== 'string' ||
    !SCOPE_LEVELS.has(value.level)
  )
    return false;
  if (value.resourceId !== undefined && !isText(value.resourceId, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resourceIdCodeUnits)) return false;
  if (value.resourceGroup !== undefined && !isText(value.resourceGroup, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resourceNameCodeUnits)) return false;
  if (value.provider !== undefined && !isText(value.provider, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.providerCodeUnits)) return false;
  if (value.resourceType !== undefined && !isText(value.resourceType, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resourceTypeCodeUnits)) return false;
  if (value.resourceName !== undefined && !isText(value.resourceName, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resourceNameCodeUnits)) return false;
  if (value.level === 'resource' && typeof value.resourceId !== 'string') return false;
  if (value.level === 'resource') {
    const scopedSubscriptionId = /^\/subscriptions\/([^/]+)\//i.exec(value.resourceId as string)?.[1];
    if (!scopedSubscriptionId || scopedSubscriptionId.toLowerCase() !== subscriptionId.toLowerCase()) return false;
  }
  if (value.level === 'resourceGroup' && typeof value.resourceGroup !== 'string') return false;
  if (value.level === 'subscription' && (value.resourceId !== undefined || value.resourceGroup !== undefined)) return false;
  return resourceId === undefined || value.resourceId === resourceId;
};

/** Validates the exact additive classification carried by one Portal Activity Log entry. */
export const isPortalActivityLogClassification = (value: unknown): value is PortalActivityLogClassification => {
  if (
    !hasExactKeys(value, ['taxonomyVersion', 'executionOrigin', 'operationEffect', 'scope', 'tags']) ||
    value.taxonomyVersion !== ACTIVITY_LOG_TAXONOMY_VERSION ||
    typeof value.executionOrigin !== 'string' ||
    !ORIGINS.has(value.executionOrigin) ||
    typeof value.operationEffect !== 'string' ||
    !EFFECTS.has(value.operationEffect) ||
    !isRecord(value.scope) ||
    typeof value.scope.subscriptionId !== 'string' ||
    !isScope(value.scope, value.scope.subscriptionId) ||
    !Array.isArray(value.tags) ||
    value.tags.length > PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.tagAssignmentsPerEvent
  )
    return false;
  const tags = value.tags;
  return tags.every((tag, index) => {
    if (
      !hasExactKeys(tag, ['tagId', 'dimension', 'confidence']) ||
      typeof tag.tagId !== 'string' ||
      !TAG_IDS.has(tag.tagId) ||
      tag.dimension !== tag.tagId.slice(0, tag.tagId.indexOf('.')) ||
      typeof tag.confidence !== 'string' ||
      !CONFIDENCES.has(tag.confidence)
    )
      return false;
    return index === 0 || tags[index - 1].tagId < tag.tagId;
  });
};

/** Validates the opaque V1 public Activity Log evidence ID syntax. */
export const isPortalActivityEvidenceId = (value: unknown): value is PortalActivityEvidenceId => typeof value === 'string' && EVIDENCE_ID.test(value);

/** Validates the opaque V1 public Activity Analysis group ID syntax. */
export const isPortalActivityAnalysisGroupId = (value: unknown): value is PortalActivityAnalysisGroupId =>
  typeof value === 'string' && GROUP_ID.test(value);

export const isEvidenceIds = (value: unknown): value is PortalActivityEvidenceId[] =>
  Array.isArray(value) &&
  value.length <= PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.evidenceIdsPerItem &&
  value.every(isPortalActivityEvidenceId) &&
  new Set(value).size === value.length;

export const isGroupIds = (value: unknown): value is PortalActivityAnalysisGroupId[] =>
  isSortedUniqueStrings(value, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.evidenceIdsPerItem, isPortalActivityAnalysisGroupId);

export const isTags = (value: unknown): value is string[] =>
  isSortedUniqueStrings(value, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.tagCountsPerItem, tag => TAG_IDS.has(tag));

export const isReasons = (value: unknown): boolean =>
  isSortedUniqueStrings(value, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.reasonCodesPerItem, reason => {
    if (!isText(reason, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.reasonCodeUnits)) return false;
    return (
      reason === 'derived.operation-summary' ||
      reason === 'derived.security-sensitive-activity' ||
      reason === 'derived.power-pattern-evidence' ||
      (reason.startsWith('tag.') && TAG_IDS.has(reason.slice(4)))
    );
  });

export const hasValidTimes = (value: Record<string, unknown>): boolean =>
  isTimestamp(value.firstTimestamp) && isTimestamp(value.lastTimestamp) && value.firstTimestamp <= value.lastTimestamp;

export const utf8ByteLength = (value: string): number => {
  let bytes = 0;
  for (const character of value) {
    const codePoint = character.codePointAt(0) as number;
    bytes += codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4;
  }
  return bytes;
};
