import {
  ACTIVITY_LOG_ANALYSIS_VERSION,
  ACTIVITY_LOG_TAG_IDS,
  ACTIVITY_LOG_TAXONOMY_VERSION,
  CONFORMED_ACTIVITY_ANALYSIS_LIMITS_V1,
  CONFORMED_ACTIVITY_ANALYSIS_SCHEMA_VERSION,
  type ActivityLogAnalysisCount,
  type ConformedActivityAnalysisArtifact,
  type ConformedActivityAnalysisGroup,
  type ConformedActivityAnalysisGroupBase,
  type ConformedActivityAnalysisFacets,
  type ConformedActivityResourceSummary,
  type ConformedActivitySeries,
  type PortalActivityLogAnalysisScope,
} from './activityLogAnalysis';

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const TAG_IDS = new Set<string>(ACTIVITY_LOG_TAG_IDS);
const ORIGINS = new Set(['manual', 'workloadAutomation', 'azurePlatform', 'unknown']);
const EFFECTS = new Set(['write', 'delete', 'action', 'read', 'other']);
const CONFIDENCES = new Set(['high', 'medium', 'low']);
const SCOPE_LEVELS = new Set(['subscription', 'resourceGroup', 'resource', 'unknown']);
const RESERVED_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

function isRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactKeys(value: unknown, required: readonly string[], optional: readonly string[] = []): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  const keys = Object.keys(value);
  const allowed = new Set([...required, ...optional]);
  return required.every(key => Object.prototype.hasOwnProperty.call(value, key)) && keys.every(key => allowed.has(key));
}

function isText(value: unknown, maximum = 2048): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maximum;
}

function isCount(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

function isIsoTimestamp(value: unknown): value is string {
  if (!isText(value, 64)) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString() === value;
}

function isUniqueTextArray(value: unknown, maximum = 100_000, predicate: (item: string) => boolean = () => true): value is string[] {
  return (
    Array.isArray(value) && value.length <= maximum && value.every(item => isText(item) && predicate(item)) && new Set(value).size === value.length
  );
}

function isSortedUniqueTextArray(value: unknown, maximum?: number, predicate?: (item: string) => boolean): value is string[] {
  return isUniqueTextArray(value, maximum, predicate) && value.every((item, index) => index === 0 || value[index - 1].localeCompare(item) < 0);
}

function isScope(value: unknown): value is PortalActivityLogAnalysisScope {
  if (
    !hasExactKeys(value, ['subscriptionId', 'level'], ['resourceId', 'resourceGroup', 'provider', 'resourceType', 'resourceName']) ||
    !isText(value.subscriptionId) ||
    typeof value.level !== 'string' ||
    !SCOPE_LEVELS.has(value.level)
  ) {
    return false;
  }
  for (const key of ['resourceId', 'resourceGroup', 'provider', 'resourceType', 'resourceName'] as const) {
    if (value[key] !== undefined && !isText(value[key])) return false;
  }
  if (value.level === 'resource' && !isText(value.resourceId)) return false;
  if (value.level === 'resource') {
    const scopedSubscriptionId = /^\/subscriptions\/([^/]+)\//i.exec(value.resourceId as string)?.[1];
    if (!scopedSubscriptionId || scopedSubscriptionId.toLowerCase() !== value.subscriptionId.toLowerCase()) return false;
  }
  if (value.level === 'subscription' && value.resourceId !== undefined) return false;
  return true;
}

function isCountRows(value: unknown, allowed?: Set<string>): value is ActivityLogAnalysisCount[] {
  if (!Array.isArray(value) || value.length > 100_000) return false;
  let previous: string | undefined;
  for (const row of value) {
    if (!hasExactKeys(row, ['value', 'count']) || !isText(row.value) || !isCount(row.count) || row.count === 0) return false;
    if (allowed && !allowed.has(row.value)) return false;
    if (previous !== undefined && previous.localeCompare(row.value) >= 0) return false;
    previous = row.value;
  }
  return true;
}

function countRowsTotal(value: ActivityLogAnalysisCount[]): number {
  return value.reduce((total, row) => total + row.count, 0);
}

function isFacets(value: unknown, retainedEventCount: number): value is ConformedActivityAnalysisFacets {
  if (
    !hasExactKeys(value, ['tags', 'operations', 'providers', 'resourceTypes', 'results', 'operationEffects', 'executionOrigins']) ||
    !isCountRows(value.tags, TAG_IDS) ||
    !isCountRows(value.operations) ||
    !isCountRows(value.providers) ||
    !isCountRows(value.resourceTypes) ||
    !isCountRows(value.results) ||
    !isCountRows(value.operationEffects, EFFECTS) ||
    !isCountRows(value.executionOrigins, ORIGINS)
  ) {
    return false;
  }
  return [value.operations, value.results, value.operationEffects, value.executionOrigins].every(rows => countRowsTotal(rows) === retainedEventCount);
}

function isSeries(value: unknown, subscriptionId: string, month: string): value is ConformedActivitySeries {
  if (
    !hasExactKeys(value, [
      'id',
      'analysisVersion',
      'taxonomyVersion',
      'subscriptionId',
      'month',
      'scope',
      'operation',
      'result',
      'executionOrigin',
      'operationEffect',
      'tagIds',
      'eventCount',
      'firstTimestamp',
      'lastTimestamp',
      'dailyCounts',
      'utcWeekdayHourDistribution',
      'distinctActorCount',
      'confidence',
      'evidenceEventKeys',
      'evidenceTruncated',
    ]) ||
    !isText(value.id) ||
    value.analysisVersion !== ACTIVITY_LOG_ANALYSIS_VERSION ||
    value.taxonomyVersion !== ACTIVITY_LOG_TAXONOMY_VERSION ||
    value.subscriptionId !== subscriptionId ||
    value.month !== month ||
    !isScope(value.scope) ||
    value.scope.subscriptionId !== subscriptionId ||
    !isText(value.operation, 512) ||
    !isText(value.result, 256) ||
    typeof value.executionOrigin !== 'string' ||
    !ORIGINS.has(value.executionOrigin) ||
    typeof value.operationEffect !== 'string' ||
    !EFFECTS.has(value.operationEffect) ||
    !isSortedUniqueTextArray(value.tagIds, 32, tag => TAG_IDS.has(tag)) ||
    !isCount(value.eventCount) ||
    value.eventCount === 0 ||
    !isIsoTimestamp(value.firstTimestamp) ||
    !isIsoTimestamp(value.lastTimestamp) ||
    value.firstTimestamp > value.lastTimestamp ||
    !isCount(value.distinctActorCount) ||
    value.distinctActorCount > value.eventCount ||
    typeof value.confidence !== 'string' ||
    !CONFIDENCES.has(value.confidence) ||
    !isUniqueTextArray(value.evidenceEventKeys, 20) ||
    typeof value.evidenceTruncated !== 'boolean'
  )
    return false;

  if (!Array.isArray(value.dailyCounts) || !Array.isArray(value.utcWeekdayHourDistribution)) return false;
  let dailyTotal = 0;
  let previousDate: string | undefined;
  for (const row of value.dailyCounts) {
    if (!hasExactKeys(row, ['date', 'count']) || typeof row.date !== 'string' || !DATE.test(row.date) || !isCount(row.count) || row.count === 0)
      return false;
    if (previousDate !== undefined && previousDate.localeCompare(row.date) >= 0) return false;
    previousDate = row.date;
    dailyTotal += row.count;
  }
  let timeTotal = 0;
  let previousBucket = -1;
  for (const row of value.utcWeekdayHourDistribution) {
    if (
      !hasExactKeys(row, ['weekday', 'hour', 'count']) ||
      !isCount(row.weekday) ||
      row.weekday > 6 ||
      !isCount(row.hour) ||
      row.hour > 23 ||
      !isCount(row.count) ||
      row.count === 0
    )
      return false;
    const bucket = row.weekday * 24 + row.hour;
    if (bucket <= previousBucket) return false;
    previousBucket = bucket;
    timeTotal += row.count;
  }
  return dailyTotal === value.eventCount && timeTotal === value.eventCount;
}

function isResource(value: unknown, subscriptionId: string): value is ConformedActivityResourceSummary {
  return (
    hasExactKeys(value, ['scope', 'eventCount', 'operationCounts', 'resultCounts', 'tagCounts', 'executionOriginCounts', 'relatedEvidenceIds']) &&
    isScope(value.scope) &&
    value.scope.level === 'resource' &&
    value.scope.subscriptionId === subscriptionId &&
    isCount(value.eventCount) &&
    value.eventCount > 0 &&
    isCountRows(value.operationCounts) &&
    countRowsTotal(value.operationCounts) === value.eventCount &&
    isCountRows(value.resultCounts) &&
    countRowsTotal(value.resultCounts) === value.eventCount &&
    isCountRows(value.tagCounts, TAG_IDS) &&
    isCountRows(value.executionOriginCounts, ORIGINS) &&
    countRowsTotal(value.executionOriginCounts) === value.eventCount &&
    isSortedUniqueTextArray(value.relatedEvidenceIds)
  );
}

function isCountRecord(value: unknown): value is Record<string, number> {
  return isRecord(value) && Object.keys(value).every(key => !RESERVED_KEYS.has(key) && isText(key, 512) && isCount(value[key]));
}

function countRecordTotal(value: Record<string, number>): number | undefined {
  let total = 0;
  for (const count of Object.values(value)) {
    total += count;
    if (!Number.isSafeInteger(total)) return undefined;
  }
  return total;
}

function isPowerHourCountRecord(value: unknown): value is Record<string, number> {
  return (
    isCountRecord(value) &&
    Object.keys(value).length <= 24 &&
    Object.entries(value).every(([hour, count]) => /^(?:0|[1-9]|1\d|2[0-3])$/.test(hour) && count > 0)
  );
}

function hasValidGroupBase(
  value: Record<string, unknown>,
  subscriptionId: string,
  month: string
): value is Record<string, unknown> & ConformedActivityAnalysisGroupBase {
  return (
    isText(value.id) &&
    value.analysisVersion === ACTIVITY_LOG_ANALYSIS_VERSION &&
    value.taxonomyVersion === ACTIVITY_LOG_TAXONOMY_VERSION &&
    value.subscriptionId === subscriptionId &&
    value.month === month &&
    isScope(value.scope) &&
    value.scope.subscriptionId === subscriptionId &&
    isCount(value.eventCount) &&
    value.eventCount > 0 &&
    isIsoTimestamp(value.firstTimestamp) &&
    isIsoTimestamp(value.lastTimestamp) &&
    value.firstTimestamp <= value.lastTimestamp &&
    typeof value.confidence === 'string' &&
    CONFIDENCES.has(value.confidence) &&
    isSortedUniqueTextArray(value.reasons, 32) &&
    isSortedUniqueTextArray(value.tagIds, 32, tag => TAG_IDS.has(tag)) &&
    isUniqueTextArray(value.evidenceEventKeys, 20) &&
    typeof value.evidenceTruncated === 'boolean'
  );
}

function isGroup(value: unknown, subscriptionId: string, month: string): value is ConformedActivityAnalysisGroup {
  if (!isRecord(value) || typeof value.type !== 'string') return false;
  const common = [
    'id',
    'type',
    'analysisVersion',
    'taxonomyVersion',
    'subscriptionId',
    'month',
    'scope',
    'eventCount',
    'firstTimestamp',
    'lastTimestamp',
    'confidence',
    'reasons',
    'tagIds',
    'evidenceEventKeys',
    'evidenceTruncated',
  ];
  if (value.type === 'operation-summary') {
    return (
      hasExactKeys(
        value,
        [...common, 'operation', 'operationEffect', 'executionOrigin', 'distinctResourceCount', 'resultCounts'],
        ['provider', 'resourceType']
      ) &&
      hasValidGroupBase(value, subscriptionId, month) &&
      isText(value.operation, 512) &&
      typeof value.operationEffect === 'string' &&
      EFFECTS.has(value.operationEffect) &&
      typeof value.executionOrigin === 'string' &&
      ORIGINS.has(value.executionOrigin) &&
      isCount(value.distinctResourceCount) &&
      value.distinctResourceCount <= value.eventCount &&
      isCountRecord(value.resultCounts)
    );
  }
  if (value.type === 'security-sensitive-activity') {
    return (
      hasExactKeys(value, [...common, 'capabilityTag', 'operation', 'executionOrigin', 'resultCounts']) &&
      hasValidGroupBase(value, subscriptionId, month) &&
      typeof value.capabilityTag === 'string' &&
      value.capabilityTag.startsWith('security.') &&
      value.capabilityTag !== 'security.sensitive-operation' &&
      TAG_IDS.has(value.capabilityTag) &&
      isText(value.operation, 512) &&
      typeof value.executionOrigin === 'string' &&
      ORIGINS.has(value.executionOrigin) &&
      isCountRecord(value.resultCounts)
    );
  }
  if (value.type !== 'power-pattern-evidence') return false;
  if (
    !hasExactKeys(value, [
      ...common,
      'patternId',
      'resourceId',
      'startCount',
      'stopCount',
      'opposingPairCount',
      'utcActiveDayCount',
      'utcHourDistribution',
      'executionOriginCounts',
      'resultCounts',
      'dataSufficiency',
    ]) ||
    !hasValidGroupBase(value, subscriptionId, month) ||
    value.scope.level !== 'resource' ||
    !isText(value.patternId) ||
    !isText(value.resourceId) ||
    value.resourceId !== value.scope.resourceId ||
    !isCount(value.startCount) ||
    !isCount(value.stopCount) ||
    value.startCount + value.stopCount !== value.eventCount ||
    !isCount(value.opposingPairCount) ||
    value.opposingPairCount !== Math.min(value.startCount, value.stopCount) ||
    !isCount(value.utcActiveDayCount) ||
    !isPowerHourCountRecord(value.utcHourDistribution) ||
    !isCountRecord(value.executionOriginCounts) ||
    !Object.keys(value.executionOriginCounts).every(origin => ORIGINS.has(origin)) ||
    !isCountRecord(value.resultCounts) ||
    !['oneSided', 'oneOff', 'sameDayRepeat', 'repeated'].includes(value.dataSufficiency as string)
  )
    return false;
  return (
    countRecordTotal(value.utcHourDistribution) === value.eventCount &&
    countRecordTotal(value.executionOriginCounts) === value.eventCount &&
    countRecordTotal(value.resultCounts) === value.eventCount
  );
}

export function isConformedActivityAnalysisArtifact(value: unknown): value is ConformedActivityAnalysisArtifact {
  if (
    !hasExactKeys(value, [
      'schemaVersion',
      'analysisVersion',
      'taxonomyVersion',
      'projection',
      'subscriptionId',
      'month',
      'generatedAt',
      'source',
      'facets',
      'activitySeries',
      'resources',
      'groups',
    ])
  )
    return false;
  if (
    value.schemaVersion !== CONFORMED_ACTIVITY_ANALYSIS_SCHEMA_VERSION ||
    value.analysisVersion !== ACTIVITY_LOG_ANALYSIS_VERSION ||
    value.taxonomyVersion !== ACTIVITY_LOG_TAXONOMY_VERSION ||
    value.projection !== 'activity-analysis' ||
    !isText(value.subscriptionId) ||
    typeof value.month !== 'string' ||
    !MONTH.test(value.month) ||
    !isIsoTimestamp(value.generatedAt)
  )
    return false;
  const subscriptionId = value.subscriptionId as string;
  const month = value.month as string;
  if (
    !hasExactKeys(
      value.source,
      [
        'portalProjectionSchemaVersion',
        'retainedEventCount',
        'classifiedRetainedEventCount',
        'unclassifiedRetainedEventCount',
        'classificationState',
      ],
      ['sourceHighWatermark', 'sourceShardFingerprint']
    ) ||
    !isCount(value.source.portalProjectionSchemaVersion) ||
    !isCount(value.source.retainedEventCount) ||
    !isCount(value.source.classifiedRetainedEventCount) ||
    !isCount(value.source.unclassifiedRetainedEventCount) ||
    value.source.retainedEventCount !== value.source.classifiedRetainedEventCount + value.source.unclassifiedRetainedEventCount ||
    !['complete', 'partial', 'unavailable'].includes(value.source.classificationState as string) ||
    (value.source.sourceHighWatermark !== undefined && !isIsoTimestamp(value.source.sourceHighWatermark)) ||
    (value.source.sourceShardFingerprint !== undefined &&
      !isText(value.source.sourceShardFingerprint, CONFORMED_ACTIVITY_ANALYSIS_LIMITS_V1.sourceShardFingerprintCodeUnits))
  )
    return false;
  if (
    !isFacets(value.facets, value.source.retainedEventCount) ||
    !Array.isArray(value.activitySeries) ||
    !Array.isArray(value.resources) ||
    !Array.isArray(value.groups)
  )
    return false;
  if (
    !value.activitySeries.every(item => isSeries(item, subscriptionId, month)) ||
    value.activitySeries.reduce((sum, item) => sum + item.eventCount, 0) !== value.source.classifiedRetainedEventCount
  )
    return false;
  return value.resources.every(item => isResource(item, subscriptionId)) && value.groups.every(item => isGroup(item, subscriptionId, month));
}

export function assertConformedActivityAnalysisArtifact(value: unknown): asserts value is ConformedActivityAnalysisArtifact {
  if (!isConformedActivityAnalysisArtifact(value)) throw new Error('Invalid conformed Activity Analysis artifact.');
}

export {
  assertPortalActivityAnalysisResponse,
  isPortalActivityAnalysisGroupId,
  isPortalActivityAnalysisResponse,
  isPortalActivityEvidenceId,
  isPortalActivityLogClassification,
} from './activityLogAnalysisPublicValidation';
