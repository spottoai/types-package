import {
  PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1,
  PORTAL_ACTIVITY_ANALYSIS_RESPONSE_SCHEMA_VERSION,
  type ActivityLogAnalysisCount,
  type PortalActivityAnalysisCollection,
  type PortalActivityAnalysisFacets,
  type PortalActivityAnalysisResponse,
  type PortalActivityDerivedEvidence,
  type PortalActivityLogAnalysisScope,
  type PortalActivityOperationSummary,
  type PortalActivityPowerPatternEvidence,
  type PortalActivityResourceSummary,
  type PortalActivitySecuritySensitiveEvidence,
  type PortalActivitySeries,
} from './activityLogAnalysis';
import {
  CONFIDENCES,
  EFFECTS,
  LIMITATIONS,
  MONTH,
  ORIGINS,
  POWER_SUFFICIENCY,
  TAG_IDS,
  countRowsTotal,
  hasExactKeys,
  hasValidTimes,
  isChronologicalCountRows,
  isCount,
  isCountRows,
  isDate,
  isEvidenceIds,
  isGroupIds,
  isPortalActivityAnalysisGroupId,
  isPortalActivityEvidenceId,
  isPortalActivityLogClassification,
  isPositiveCount,
  isReasons,
  isRecord,
  isScope,
  isSortedUniqueStrings,
  isText,
  isTimestamp,
  isTags,
  utf8ByteLength,
} from './activityLogAnalysisPublicValidationHelpers';

export { isPortalActivityAnalysisGroupId, isPortalActivityEvidenceId, isPortalActivityLogClassification };

const isSeries = (
  value: unknown,
  subscriptionId: string,
  resourceId: string | undefined,
  requestedMonths: Set<string>
): value is PortalActivitySeries => {
  if (
    !hasExactKeys(value, [
      'seriesId',
      'scope',
      'operation',
      'result',
      'executionOrigin',
      'operationEffect',
      'tagIds',
      'eventCount',
      'firstTimestamp',
      'lastTimestamp',
      'monthCounts',
      'dailyCounts',
      'utcWeekdayHourDistribution',
      'confidence',
      'evidenceIds',
      'evidenceTruncated',
    ]) ||
    !isPortalActivityAnalysisGroupId(value.seriesId) ||
    !isScope(value.scope, subscriptionId, resourceId) ||
    !isText(value.operation, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.operationCodeUnits) ||
    !isText(value.result, 256) ||
    typeof value.executionOrigin !== 'string' ||
    !ORIGINS.has(value.executionOrigin) ||
    typeof value.operationEffect !== 'string' ||
    !EFFECTS.has(value.operationEffect) ||
    !isTags(value.tagIds) ||
    !isPositiveCount(value.eventCount) ||
    !hasValidTimes(value) ||
    !isChronologicalCountRows(value.monthCounts, month => MONTH.test(month) && requestedMonths.has(month)) ||
    !Array.isArray(value.dailyCounts) ||
    !Array.isArray(value.utcWeekdayHourDistribution) ||
    typeof value.confidence !== 'string' ||
    !CONFIDENCES.has(value.confidence) ||
    !isEvidenceIds(value.evidenceIds) ||
    typeof value.evidenceTruncated !== 'boolean'
  )
    return false;
  let dailyTotal = 0;
  for (let index = 0; index < value.dailyCounts.length; index += 1) {
    const row = value.dailyCounts[index];
    if (
      !hasExactKeys(row, ['date', 'count']) ||
      !isDate(row.date) ||
      !isPositiveCount(row.count) ||
      (index > 0 && value.dailyCounts[index - 1].date >= row.date)
    )
      return false;
    if (!requestedMonths.has(row.date.slice(0, 7))) return false;
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
      !isPositiveCount(row.count)
    )
      return false;
    const bucket = row.weekday * 24 + row.hour;
    if (bucket <= previousBucket) return false;
    previousBucket = bucket;
    timeTotal += row.count;
  }
  return countRowsTotal(value.monthCounts) === value.eventCount && dailyTotal === value.eventCount && timeTotal === value.eventCount;
};

const isResource = (value: unknown, subscriptionId: string, resourceId?: string): value is PortalActivityResourceSummary => {
  if (
    !hasExactKeys(value, [
      'scope',
      'eventCount',
      'firstTimestamp',
      'lastTimestamp',
      'operationCounts',
      'resultCounts',
      'tagCounts',
      'executionOriginCounts',
      'relatedGroupIds',
      'confidence',
    ]) ||
    !isScope(value.scope, subscriptionId, resourceId) ||
    value.scope.level !== 'resource' ||
    !isPositiveCount(value.eventCount) ||
    !hasValidTimes(value) ||
    !isCountRows(
      value.operationCounts,
      PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.operationCountsPerItem,
      PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.operationCodeUnits
    ) ||
    !isCountRows(value.resultCounts, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resultCountsPerItem, 256) ||
    !isCountRows(value.tagCounts, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.tagCountsPerItem, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.reasonCodeUnits, TAG_IDS) ||
    !isCountRows(value.executionOriginCounts, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.executionOriginCountsPerItem, 32, ORIGINS) ||
    !isGroupIds(value.relatedGroupIds) ||
    typeof value.confidence !== 'string' ||
    !CONFIDENCES.has(value.confidence)
  )
    return false;
  return (
    countRowsTotal(value.operationCounts) === value.eventCount &&
    countRowsTotal(value.resultCounts) === value.eventCount &&
    countRowsTotal(value.executionOriginCounts) === value.eventCount
  );
};

const DERIVED_BASE_KEYS = [
  'scope',
  'eventCount',
  'firstTimestamp',
  'lastTimestamp',
  'confidence',
  'tagIds',
  'reasons',
  'evidenceIds',
  'evidenceTruncated',
] as const;
const isDerivedBase = (value: Record<string, unknown>, subscriptionId: string, resourceId?: string): boolean =>
  isScope(value.scope, subscriptionId, resourceId) &&
  isPositiveCount(value.eventCount) &&
  hasValidTimes(value) &&
  typeof value.confidence === 'string' &&
  CONFIDENCES.has(value.confidence) &&
  isTags(value.tagIds) &&
  isReasons(value.reasons) &&
  isEvidenceIds(value.evidenceIds) &&
  typeof value.evidenceTruncated === 'boolean';

const isDerived = (value: unknown, subscriptionId: string, resourceId?: string): value is PortalActivityDerivedEvidence => {
  if (!isRecord(value) || typeof value.derivedType !== 'string') return false;
  if (value.derivedType === 'operationSummary') {
    return (
      hasExactKeys(
        value,
        ['groupId', 'derivedType', ...DERIVED_BASE_KEYS, 'operation', 'operationEffect', 'executionOrigin', 'distinctResourceCount', 'resultCounts'],
        ['provider', 'resourceType']
      ) &&
      isPortalActivityAnalysisGroupId(value.groupId) &&
      isDerivedBase(value, subscriptionId, resourceId) &&
      isText(value.operation, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.operationCodeUnits) &&
      (value.provider === undefined || isText(value.provider, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.providerCodeUnits)) &&
      (value.resourceType === undefined || isText(value.resourceType, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resourceTypeCodeUnits)) &&
      typeof value.operationEffect === 'string' &&
      EFFECTS.has(value.operationEffect) &&
      typeof value.executionOrigin === 'string' &&
      ORIGINS.has(value.executionOrigin) &&
      isCount(value.distinctResourceCount) &&
      value.distinctResourceCount <= (value.eventCount as number) &&
      isCountRows(value.resultCounts, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resultCountsPerItem, 256) &&
      countRowsTotal(value.resultCounts) === value.eventCount
    );
  }
  if (value.derivedType === 'securitySensitiveActivity') {
    return (
      hasExactKeys(value, ['groupId', 'derivedType', ...DERIVED_BASE_KEYS, 'capabilityTag', 'operation', 'executionOrigin', 'resultCounts']) &&
      isPortalActivityAnalysisGroupId(value.groupId) &&
      isDerivedBase(value, subscriptionId, resourceId) &&
      typeof value.capabilityTag === 'string' &&
      value.capabilityTag.startsWith('security.') &&
      value.capabilityTag !== 'security.sensitive-operation' &&
      TAG_IDS.has(value.capabilityTag) &&
      (value.tagIds as string[]).includes(value.capabilityTag) &&
      isText(value.operation, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.operationCodeUnits) &&
      typeof value.executionOrigin === 'string' &&
      ORIGINS.has(value.executionOrigin) &&
      isCountRows(value.resultCounts, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resultCountsPerItem, 256) &&
      countRowsTotal(value.resultCounts) === value.eventCount
    );
  }
  return isPowerPattern(value, subscriptionId, resourceId);
};

const isPowerPattern = (
  value: Record<string, unknown>,
  subscriptionId: string,
  resourceId?: string
): value is Record<string, unknown> & PortalActivityPowerPatternEvidence => {
  if (
    !hasExactKeys(value, [
      'patternId',
      'derivedType',
      ...DERIVED_BASE_KEYS,
      'startCount',
      'stopCount',
      'opposingPairCount',
      'utcActiveDayCount',
      'utcHourDistribution',
      'executionOriginCounts',
      'resultCounts',
      'dataSufficiency',
    ]) ||
    value.derivedType !== 'powerPatternEvidence' ||
    !isPortalActivityAnalysisGroupId(value.patternId) ||
    !isDerivedBase(value, subscriptionId, resourceId) ||
    (value.scope as PortalActivityLogAnalysisScope).level !== 'resource' ||
    !isCount(value.startCount) ||
    !isCount(value.stopCount) ||
    value.startCount + value.stopCount !== value.eventCount ||
    !isCount(value.opposingPairCount) ||
    value.opposingPairCount !== Math.min(value.startCount, value.stopCount) ||
    !isPositiveCount(value.utcActiveDayCount) ||
    value.utcActiveDayCount > value.eventCount ||
    !Array.isArray(value.utcHourDistribution) ||
    !isCountRows(value.executionOriginCounts, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.executionOriginCountsPerItem, 32, ORIGINS) ||
    !isCountRows(value.resultCounts, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resultCountsPerItem, 256) ||
    typeof value.dataSufficiency !== 'string' ||
    !POWER_SUFFICIENCY.has(value.dataSufficiency)
  )
    return false;
  let total = 0;
  let previousHour = -1;
  for (const row of value.utcHourDistribution) {
    if (!hasExactKeys(row, ['hour', 'count']) || !isCount(row.hour) || row.hour > 23 || row.hour <= previousHour || !isPositiveCount(row.count))
      return false;
    previousHour = row.hour;
    total += row.count;
  }
  return (
    total === value.eventCount &&
    countRowsTotal(value.executionOriginCounts) === value.eventCount &&
    countRowsTotal(value.resultCounts) === value.eventCount
  );
};

const isCollection = <T>(value: unknown, maximum: number, validator: (item: unknown) => item is T): value is PortalActivityAnalysisCollection<T> =>
  hasExactKeys(value, ['totalCount', 'returnedCount', 'truncated', 'items']) &&
  isCount(value.totalCount) &&
  isCount(value.returnedCount) &&
  typeof value.truncated === 'boolean' &&
  Array.isArray(value.items) &&
  value.items.length <= maximum &&
  value.returnedCount === value.items.length &&
  value.totalCount >= value.returnedCount &&
  value.truncated === value.totalCount > value.returnedCount &&
  value.items.every(validator);

const isRanked = <T extends { eventCount: number; lastTimestamp: string }>(items: T[], key: (item: T) => string): boolean =>
  items.every((item, index) => {
    if (index === 0) return true;
    const previous = items[index - 1];
    return (
      previous.eventCount > item.eventCount ||
      (previous.eventCount === item.eventCount &&
        (previous.lastTimestamp > item.lastTimestamp || (previous.lastTimestamp === item.lastTimestamp && key(previous) < key(item))))
    );
  });

const isFacets = (value: unknown): value is PortalActivityAnalysisFacets => {
  if (!hasExactKeys(value, ['tags', 'operations', 'providers', 'resourceTypes', 'results', 'operationEffects', 'executionOrigins'])) return false;
  const facet = (candidate: unknown, maximum: number, textMaximum: number, allowed?: ReadonlySet<string>) =>
    isCollection(candidate, maximum, (row): row is ActivityLogAnalysisCount => isCountRows([row], 1, textMaximum, allowed));
  return (
    facet(value.tags, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.facetTagRows, 128, TAG_IDS) &&
    facet(value.operations, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.facetOperationRows, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.operationCodeUnits) &&
    facet(value.providers, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.facetProviderRows, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.providerCodeUnits) &&
    facet(value.resourceTypes, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.facetResourceTypeRows, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resourceTypeCodeUnits) &&
    facet(value.results, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.facetResultRows, 256) &&
    facet(value.operationEffects, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.facetOperationEffectRows, 32, EFFECTS) &&
    facet(value.executionOrigins, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.facetExecutionOriginRows, 32, ORIGINS) &&
    Object.values(value).every(collection => {
      const items = (collection as PortalActivityAnalysisCollection<ActivityLogAnalysisCount>).items;
      return (
        new Set(items.map(row => row.value)).size === items.length &&
        items.every(
          (row, index) =>
            index === 0 || items[index - 1].count > row.count || (items[index - 1].count === row.count && items[index - 1].value < row.value)
        )
      );
    })
  );
};

const isMonthList = (value: unknown): value is string[] => isSortedUniqueStrings(value, 1_200, month => MONTH.test(month));
const containsOnly = (values: string[], parent: Set<string>): boolean => values.every(value => parent.has(value));
const areDisjoint = (left: string[], right: string[]): boolean => left.every(value => !right.includes(value));

const isContiguousRange = (months: string[], from: string, to: string): boolean => {
  if (months.length === 0 || months[0] !== from || months[months.length - 1] !== to) return false;
  for (let index = 1; index < months.length; index += 1) {
    const [year, month] = months[index - 1].split('-').map(Number);
    const next = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 7);
    if (months[index] !== next) return false;
  }
  return true;
};

/** Validates the exact, bounded, consumer-safe V1 Activity Analysis response. */
export const isPortalActivityAnalysisResponse = (value: unknown): value is PortalActivityAnalysisResponse => {
  if (
    !hasExactKeys(
      value,
      [
        'schemaVersion',
        'generatedAt',
        'subscriptionId',
        'fromMonth',
        'toMonth',
        'requestedMonths',
        'availableMonths',
        'missingMonths',
        'partialMonths',
        'staleMonths',
        'freshnessUnknownMonths',
        'analysisVersions',
        'taxonomyVersions',
        'facets',
        'activitySeries',
        'resources',
        'operationSummaries',
        'securitySensitive',
        'powerPatterns',
        'limitations',
      ],
      ['resourceId']
    ) ||
    value.schemaVersion !== PORTAL_ACTIVITY_ANALYSIS_RESPONSE_SCHEMA_VERSION ||
    !isTimestamp(value.generatedAt) ||
    !isText(value.subscriptionId, 2_048) ||
    typeof value.fromMonth !== 'string' ||
    !MONTH.test(value.fromMonth) ||
    typeof value.toMonth !== 'string' ||
    !MONTH.test(value.toMonth) ||
    !isMonthList(value.requestedMonths) ||
    !isContiguousRange(value.requestedMonths, value.fromMonth, value.toMonth) ||
    !isMonthList(value.availableMonths) ||
    !isMonthList(value.missingMonths) ||
    !isMonthList(value.partialMonths) ||
    !isMonthList(value.staleMonths) ||
    !isMonthList(value.freshnessUnknownMonths) ||
    !isSortedUniqueStrings(value.analysisVersions, 32, item => isText(item, 64)) ||
    !isSortedUniqueStrings(value.taxonomyVersions, 32, item => isText(item, 64)) ||
    (value.resourceId !== undefined && !isText(value.resourceId, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resourceIdCodeUnits)) ||
    !isFacets(value.facets)
  )
    return false;
  const requested = new Set(value.requestedMonths);
  const available = new Set(value.availableMonths);
  if (
    !containsOnly(value.availableMonths, requested) ||
    !containsOnly(value.missingMonths, requested) ||
    !areDisjoint(value.availableMonths, value.missingMonths) ||
    value.availableMonths.length + value.missingMonths.length !== value.requestedMonths.length ||
    !containsOnly(value.partialMonths, available) ||
    !containsOnly(value.staleMonths, available) ||
    !containsOnly(value.freshnessUnknownMonths, available) ||
    !areDisjoint(value.staleMonths, value.freshnessUnknownMonths)
  )
    return false;
  const subscriptionId = value.subscriptionId;
  const resourceId = value.resourceId as string | undefined;
  if (
    !isCollection(value.activitySeries, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.activitySeries, (item): item is PortalActivitySeries =>
      isSeries(item, subscriptionId, resourceId, available)
    ) ||
    !isCollection(value.resources, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resourceSummaries, (item): item is PortalActivityResourceSummary =>
      isResource(item, subscriptionId, resourceId)
    ) ||
    !isCollection(
      value.operationSummaries,
      PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.operationSummaries,
      (item): item is PortalActivityOperationSummary => isDerived(item, subscriptionId, resourceId) && item.derivedType === 'operationSummary'
    ) ||
    !isCollection(
      value.securitySensitive,
      PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.securitySensitive,
      (item): item is PortalActivitySecuritySensitiveEvidence =>
        isDerived(item, subscriptionId, resourceId) && item.derivedType === 'securitySensitiveActivity'
    ) ||
    !isCollection(
      value.powerPatterns,
      PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.powerPatterns,
      (item): item is PortalActivityPowerPatternEvidence => isDerived(item, subscriptionId, resourceId) && item.derivedType === 'powerPatternEvidence'
    )
  )
    return false;
  if (
    !isRanked(value.activitySeries.items, item => item.seriesId) ||
    !isRanked(value.resources.items, item => item.scope.resourceId) ||
    !isRanked(value.operationSummaries.items, item => item.groupId) ||
    !isRanked(value.securitySensitive.items, item => item.groupId) ||
    !isRanked(value.powerPatterns.items, item => item.patternId)
  )
    return false;
  const publicIds = [
    ...value.activitySeries.items.map(item => item.seriesId),
    ...value.operationSummaries.items.map(item => item.groupId),
    ...value.securitySensitive.items.map(item => item.groupId),
    ...value.powerPatterns.items.map(item => item.patternId),
  ];
  if (new Set(publicIds).size !== publicIds.length) return false;
  if (!isSortedUniqueStrings(value.limitations, LIMITATIONS.size, item => LIMITATIONS.has(item))) return false;
  const limitations = new Set(value.limitations);
  const facetTruncated = Object.values(value.facets).some(collection => collection.truncated);
  const responseTruncated =
    facetTruncated ||
    value.activitySeries.truncated ||
    value.resources.truncated ||
    value.operationSummaries.truncated ||
    value.securitySensitive.truncated ||
    value.powerPatterns.truncated ||
    limitations.has('nested-values-truncated');
  if (
    limitations.has('response-truncated') !== responseTruncated ||
    limitations.has('facet-values-truncated') !== facetTruncated ||
    limitations.has('resource-summaries-truncated') !== value.resources.truncated ||
    limitations.has('operation-summaries-truncated') !== value.operationSummaries.truncated ||
    limitations.has('security-sensitive-truncated') !== value.securitySensitive.truncated ||
    limitations.has('power-patterns-truncated') !== value.powerPatterns.truncated ||
    limitations.has('month-missing') !== value.missingMonths.length > 0 ||
    limitations.has('month-partial') !== value.partialMonths.length > 0 ||
    limitations.has('month-stale') !== value.staleMonths.length > 0 ||
    limitations.has('month-freshness-unknown') !== value.freshnessUnknownMonths.length > 0 ||
    limitations.has('mixed-analysis-versions') !== value.analysisVersions.length > 1 ||
    limitations.has('mixed-taxonomy-versions') !== value.taxonomyVersions.length > 1
  )
    return false;
  try {
    return utf8ByteLength(JSON.stringify(value)) <= PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.responseUtf8Bytes;
  } catch {
    return false;
  }
};

/** Throws when a value is not the exact public V1 Activity Analysis response. */
export function assertPortalActivityAnalysisResponse(value: unknown): asserts value is PortalActivityAnalysisResponse {
  if (!isPortalActivityAnalysisResponse(value)) throw new Error('Invalid Portal Activity Analysis response.');
}
