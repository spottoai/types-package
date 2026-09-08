"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPortalActivityAnalysisResponse = exports.isPortalActivityLogClassification = exports.isPortalActivityEvidenceId = exports.isPortalActivityAnalysisGroupId = void 0;
exports.assertPortalActivityAnalysisResponse = assertPortalActivityAnalysisResponse;
const activityLogAnalysis_1 = require("./activityLogAnalysis");
const activityLogAnalysisPublicValidationHelpers_1 = require("./activityLogAnalysisPublicValidationHelpers");
Object.defineProperty(exports, "isPortalActivityAnalysisGroupId", { enumerable: true, get: function () { return activityLogAnalysisPublicValidationHelpers_1.isPortalActivityAnalysisGroupId; } });
Object.defineProperty(exports, "isPortalActivityEvidenceId", { enumerable: true, get: function () { return activityLogAnalysisPublicValidationHelpers_1.isPortalActivityEvidenceId; } });
Object.defineProperty(exports, "isPortalActivityLogClassification", { enumerable: true, get: function () { return activityLogAnalysisPublicValidationHelpers_1.isPortalActivityLogClassification; } });
const isSeries = (value, subscriptionId, resourceId, requestedMonths) => {
    if (!(0, activityLogAnalysisPublicValidationHelpers_1.hasExactKeys)(value, [
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
        !(0, activityLogAnalysisPublicValidationHelpers_1.isPortalActivityAnalysisGroupId)(value.seriesId) ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isScope)(value.scope, subscriptionId, resourceId) ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isText)(value.operation, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.operationCodeUnits) ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isText)(value.result, 256) ||
        typeof value.executionOrigin !== 'string' ||
        !activityLogAnalysisPublicValidationHelpers_1.ORIGINS.has(value.executionOrigin) ||
        typeof value.operationEffect !== 'string' ||
        !activityLogAnalysisPublicValidationHelpers_1.EFFECTS.has(value.operationEffect) ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isTags)(value.tagIds) ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isPositiveCount)(value.eventCount) ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.hasValidTimes)(value) ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isChronologicalCountRows)(value.monthCounts, month => activityLogAnalysisPublicValidationHelpers_1.MONTH.test(month) && requestedMonths.has(month)) ||
        !Array.isArray(value.dailyCounts) ||
        !Array.isArray(value.utcWeekdayHourDistribution) ||
        typeof value.confidence !== 'string' ||
        !activityLogAnalysisPublicValidationHelpers_1.CONFIDENCES.has(value.confidence) ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isEvidenceIds)(value.evidenceIds) ||
        typeof value.evidenceTruncated !== 'boolean')
        return false;
    let dailyTotal = 0;
    for (let index = 0; index < value.dailyCounts.length; index += 1) {
        const row = value.dailyCounts[index];
        if (!(0, activityLogAnalysisPublicValidationHelpers_1.hasExactKeys)(row, ['date', 'count']) ||
            !(0, activityLogAnalysisPublicValidationHelpers_1.isDate)(row.date) ||
            !(0, activityLogAnalysisPublicValidationHelpers_1.isPositiveCount)(row.count) ||
            (index > 0 && value.dailyCounts[index - 1].date >= row.date))
            return false;
        if (!requestedMonths.has(row.date.slice(0, 7)))
            return false;
        dailyTotal += row.count;
    }
    let timeTotal = 0;
    let previousBucket = -1;
    for (const row of value.utcWeekdayHourDistribution) {
        if (!(0, activityLogAnalysisPublicValidationHelpers_1.hasExactKeys)(row, ['weekday', 'hour', 'count']) ||
            !(0, activityLogAnalysisPublicValidationHelpers_1.isCount)(row.weekday) ||
            row.weekday > 6 ||
            !(0, activityLogAnalysisPublicValidationHelpers_1.isCount)(row.hour) ||
            row.hour > 23 ||
            !(0, activityLogAnalysisPublicValidationHelpers_1.isPositiveCount)(row.count))
            return false;
        const bucket = row.weekday * 24 + row.hour;
        if (bucket <= previousBucket)
            return false;
        previousBucket = bucket;
        timeTotal += row.count;
    }
    return (0, activityLogAnalysisPublicValidationHelpers_1.countRowsTotal)(value.monthCounts) === value.eventCount && dailyTotal === value.eventCount && timeTotal === value.eventCount;
};
const isResource = (value, subscriptionId, resourceId) => {
    if (!(0, activityLogAnalysisPublicValidationHelpers_1.hasExactKeys)(value, [
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
        !(0, activityLogAnalysisPublicValidationHelpers_1.isScope)(value.scope, subscriptionId, resourceId) ||
        value.scope.level !== 'resource' ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isPositiveCount)(value.eventCount) ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.hasValidTimes)(value) ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isCountRows)(value.operationCounts, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.operationCountsPerItem, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.operationCodeUnits) ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isCountRows)(value.resultCounts, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resultCountsPerItem, 256) ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isCountRows)(value.tagCounts, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.tagCountsPerItem, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.reasonCodeUnits, activityLogAnalysisPublicValidationHelpers_1.TAG_IDS) ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isCountRows)(value.executionOriginCounts, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.executionOriginCountsPerItem, 32, activityLogAnalysisPublicValidationHelpers_1.ORIGINS) ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isGroupIds)(value.relatedGroupIds) ||
        typeof value.confidence !== 'string' ||
        !activityLogAnalysisPublicValidationHelpers_1.CONFIDENCES.has(value.confidence))
        return false;
    return ((0, activityLogAnalysisPublicValidationHelpers_1.countRowsTotal)(value.operationCounts) === value.eventCount &&
        (0, activityLogAnalysisPublicValidationHelpers_1.countRowsTotal)(value.resultCounts) === value.eventCount &&
        (0, activityLogAnalysisPublicValidationHelpers_1.countRowsTotal)(value.executionOriginCounts) === value.eventCount);
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
];
const isDerivedBase = (value, subscriptionId, resourceId) => (0, activityLogAnalysisPublicValidationHelpers_1.isScope)(value.scope, subscriptionId, resourceId) &&
    (0, activityLogAnalysisPublicValidationHelpers_1.isPositiveCount)(value.eventCount) &&
    (0, activityLogAnalysisPublicValidationHelpers_1.hasValidTimes)(value) &&
    typeof value.confidence === 'string' &&
    activityLogAnalysisPublicValidationHelpers_1.CONFIDENCES.has(value.confidence) &&
    (0, activityLogAnalysisPublicValidationHelpers_1.isTags)(value.tagIds) &&
    (0, activityLogAnalysisPublicValidationHelpers_1.isReasons)(value.reasons) &&
    (0, activityLogAnalysisPublicValidationHelpers_1.isEvidenceIds)(value.evidenceIds) &&
    typeof value.evidenceTruncated === 'boolean';
const isDerived = (value, subscriptionId, resourceId) => {
    if (!(0, activityLogAnalysisPublicValidationHelpers_1.isRecord)(value) || typeof value.derivedType !== 'string')
        return false;
    if (value.derivedType === 'operationSummary') {
        return ((0, activityLogAnalysisPublicValidationHelpers_1.hasExactKeys)(value, ['groupId', 'derivedType', ...DERIVED_BASE_KEYS, 'operation', 'operationEffect', 'executionOrigin', 'distinctResourceCount', 'resultCounts'], ['provider', 'resourceType']) &&
            (0, activityLogAnalysisPublicValidationHelpers_1.isPortalActivityAnalysisGroupId)(value.groupId) &&
            isDerivedBase(value, subscriptionId, resourceId) &&
            (0, activityLogAnalysisPublicValidationHelpers_1.isText)(value.operation, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.operationCodeUnits) &&
            (value.provider === undefined || (0, activityLogAnalysisPublicValidationHelpers_1.isText)(value.provider, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.providerCodeUnits)) &&
            (value.resourceType === undefined || (0, activityLogAnalysisPublicValidationHelpers_1.isText)(value.resourceType, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resourceTypeCodeUnits)) &&
            typeof value.operationEffect === 'string' &&
            activityLogAnalysisPublicValidationHelpers_1.EFFECTS.has(value.operationEffect) &&
            typeof value.executionOrigin === 'string' &&
            activityLogAnalysisPublicValidationHelpers_1.ORIGINS.has(value.executionOrigin) &&
            (0, activityLogAnalysisPublicValidationHelpers_1.isCount)(value.distinctResourceCount) &&
            value.distinctResourceCount <= value.eventCount &&
            (0, activityLogAnalysisPublicValidationHelpers_1.isCountRows)(value.resultCounts, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resultCountsPerItem, 256) &&
            (0, activityLogAnalysisPublicValidationHelpers_1.countRowsTotal)(value.resultCounts) === value.eventCount);
    }
    if (value.derivedType === 'securitySensitiveActivity') {
        return ((0, activityLogAnalysisPublicValidationHelpers_1.hasExactKeys)(value, ['groupId', 'derivedType', ...DERIVED_BASE_KEYS, 'capabilityTag', 'operation', 'executionOrigin', 'resultCounts']) &&
            (0, activityLogAnalysisPublicValidationHelpers_1.isPortalActivityAnalysisGroupId)(value.groupId) &&
            isDerivedBase(value, subscriptionId, resourceId) &&
            typeof value.capabilityTag === 'string' &&
            value.capabilityTag.startsWith('security.') &&
            value.capabilityTag !== 'security.sensitive-operation' &&
            activityLogAnalysisPublicValidationHelpers_1.TAG_IDS.has(value.capabilityTag) &&
            value.tagIds.includes(value.capabilityTag) &&
            (0, activityLogAnalysisPublicValidationHelpers_1.isText)(value.operation, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.operationCodeUnits) &&
            typeof value.executionOrigin === 'string' &&
            activityLogAnalysisPublicValidationHelpers_1.ORIGINS.has(value.executionOrigin) &&
            (0, activityLogAnalysisPublicValidationHelpers_1.isCountRows)(value.resultCounts, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resultCountsPerItem, 256) &&
            (0, activityLogAnalysisPublicValidationHelpers_1.countRowsTotal)(value.resultCounts) === value.eventCount);
    }
    return isPowerPattern(value, subscriptionId, resourceId);
};
const isPowerPattern = (value, subscriptionId, resourceId) => {
    if (!(0, activityLogAnalysisPublicValidationHelpers_1.hasExactKeys)(value, [
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
        !(0, activityLogAnalysisPublicValidationHelpers_1.isPortalActivityAnalysisGroupId)(value.patternId) ||
        !isDerivedBase(value, subscriptionId, resourceId) ||
        value.scope.level !== 'resource' ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isCount)(value.startCount) ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isCount)(value.stopCount) ||
        value.startCount + value.stopCount !== value.eventCount ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isCount)(value.opposingPairCount) ||
        value.opposingPairCount !== Math.min(value.startCount, value.stopCount) ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isPositiveCount)(value.utcActiveDayCount) ||
        value.utcActiveDayCount > value.eventCount ||
        !Array.isArray(value.utcHourDistribution) ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isCountRows)(value.executionOriginCounts, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.executionOriginCountsPerItem, 32, activityLogAnalysisPublicValidationHelpers_1.ORIGINS) ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isCountRows)(value.resultCounts, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resultCountsPerItem, 256) ||
        typeof value.dataSufficiency !== 'string' ||
        !activityLogAnalysisPublicValidationHelpers_1.POWER_SUFFICIENCY.has(value.dataSufficiency))
        return false;
    let total = 0;
    let previousHour = -1;
    for (const row of value.utcHourDistribution) {
        if (!(0, activityLogAnalysisPublicValidationHelpers_1.hasExactKeys)(row, ['hour', 'count']) || !(0, activityLogAnalysisPublicValidationHelpers_1.isCount)(row.hour) || row.hour > 23 || row.hour <= previousHour || !(0, activityLogAnalysisPublicValidationHelpers_1.isPositiveCount)(row.count))
            return false;
        previousHour = row.hour;
        total += row.count;
    }
    return (total === value.eventCount &&
        (0, activityLogAnalysisPublicValidationHelpers_1.countRowsTotal)(value.executionOriginCounts) === value.eventCount &&
        (0, activityLogAnalysisPublicValidationHelpers_1.countRowsTotal)(value.resultCounts) === value.eventCount);
};
const isCollection = (value, maximum, validator) => (0, activityLogAnalysisPublicValidationHelpers_1.hasExactKeys)(value, ['totalCount', 'returnedCount', 'truncated', 'items']) &&
    (0, activityLogAnalysisPublicValidationHelpers_1.isCount)(value.totalCount) &&
    (0, activityLogAnalysisPublicValidationHelpers_1.isCount)(value.returnedCount) &&
    typeof value.truncated === 'boolean' &&
    Array.isArray(value.items) &&
    value.items.length <= maximum &&
    value.returnedCount === value.items.length &&
    value.totalCount >= value.returnedCount &&
    value.truncated === value.totalCount > value.returnedCount &&
    value.items.every(validator);
const isRanked = (items, key) => items.every((item, index) => {
    if (index === 0)
        return true;
    const previous = items[index - 1];
    return (previous.eventCount > item.eventCount ||
        (previous.eventCount === item.eventCount &&
            (previous.lastTimestamp > item.lastTimestamp || (previous.lastTimestamp === item.lastTimestamp && key(previous) < key(item)))));
});
const isFacets = (value) => {
    if (!(0, activityLogAnalysisPublicValidationHelpers_1.hasExactKeys)(value, ['tags', 'operations', 'providers', 'resourceTypes', 'results', 'operationEffects', 'executionOrigins']))
        return false;
    const facet = (candidate, maximum, textMaximum, allowed) => isCollection(candidate, maximum, (row) => (0, activityLogAnalysisPublicValidationHelpers_1.isCountRows)([row], 1, textMaximum, allowed));
    return (facet(value.tags, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.facetTagRows, 128, activityLogAnalysisPublicValidationHelpers_1.TAG_IDS) &&
        facet(value.operations, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.facetOperationRows, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.operationCodeUnits) &&
        facet(value.providers, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.facetProviderRows, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.providerCodeUnits) &&
        facet(value.resourceTypes, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.facetResourceTypeRows, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resourceTypeCodeUnits) &&
        facet(value.results, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.facetResultRows, 256) &&
        facet(value.operationEffects, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.facetOperationEffectRows, 32, activityLogAnalysisPublicValidationHelpers_1.EFFECTS) &&
        facet(value.executionOrigins, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.facetExecutionOriginRows, 32, activityLogAnalysisPublicValidationHelpers_1.ORIGINS) &&
        Object.values(value).every(collection => {
            const items = collection.items;
            return (new Set(items.map(row => row.value)).size === items.length &&
                items.every((row, index) => index === 0 || items[index - 1].count > row.count || (items[index - 1].count === row.count && items[index - 1].value < row.value)));
        }));
};
const isMonthList = (value) => (0, activityLogAnalysisPublicValidationHelpers_1.isSortedUniqueStrings)(value, 1200, month => activityLogAnalysisPublicValidationHelpers_1.MONTH.test(month));
const containsOnly = (values, parent) => values.every(value => parent.has(value));
const areDisjoint = (left, right) => left.every(value => !right.includes(value));
const isContiguousRange = (months, from, to) => {
    if (months.length === 0 || months[0] !== from || months[months.length - 1] !== to)
        return false;
    for (let index = 1; index < months.length; index += 1) {
        const [year, month] = months[index - 1].split('-').map(Number);
        const next = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 7);
        if (months[index] !== next)
            return false;
    }
    return true;
};
/** Validates the exact, bounded, consumer-safe V1 Activity Analysis response. */
const isPortalActivityAnalysisResponse = (value) => {
    if (!(0, activityLogAnalysisPublicValidationHelpers_1.hasExactKeys)(value, [
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
    ], ['resourceId']) ||
        value.schemaVersion !== activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_RESPONSE_SCHEMA_VERSION ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isTimestamp)(value.generatedAt) ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isText)(value.subscriptionId, 2048) ||
        typeof value.fromMonth !== 'string' ||
        !activityLogAnalysisPublicValidationHelpers_1.MONTH.test(value.fromMonth) ||
        typeof value.toMonth !== 'string' ||
        !activityLogAnalysisPublicValidationHelpers_1.MONTH.test(value.toMonth) ||
        !isMonthList(value.requestedMonths) ||
        !isContiguousRange(value.requestedMonths, value.fromMonth, value.toMonth) ||
        !isMonthList(value.availableMonths) ||
        !isMonthList(value.missingMonths) ||
        !isMonthList(value.partialMonths) ||
        !isMonthList(value.staleMonths) ||
        !isMonthList(value.freshnessUnknownMonths) ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isSortedUniqueStrings)(value.analysisVersions, 32, item => (0, activityLogAnalysisPublicValidationHelpers_1.isText)(item, 64)) ||
        !(0, activityLogAnalysisPublicValidationHelpers_1.isSortedUniqueStrings)(value.taxonomyVersions, 32, item => (0, activityLogAnalysisPublicValidationHelpers_1.isText)(item, 64)) ||
        (value.resourceId !== undefined && !(0, activityLogAnalysisPublicValidationHelpers_1.isText)(value.resourceId, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resourceIdCodeUnits)) ||
        !isFacets(value.facets))
        return false;
    const requested = new Set(value.requestedMonths);
    const available = new Set(value.availableMonths);
    if (!containsOnly(value.availableMonths, requested) ||
        !containsOnly(value.missingMonths, requested) ||
        !areDisjoint(value.availableMonths, value.missingMonths) ||
        value.availableMonths.length + value.missingMonths.length !== value.requestedMonths.length ||
        !containsOnly(value.partialMonths, available) ||
        !containsOnly(value.staleMonths, available) ||
        !containsOnly(value.freshnessUnknownMonths, available) ||
        !areDisjoint(value.staleMonths, value.freshnessUnknownMonths))
        return false;
    const subscriptionId = value.subscriptionId;
    const resourceId = value.resourceId;
    if (!isCollection(value.activitySeries, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.activitySeries, (item) => isSeries(item, subscriptionId, resourceId, available)) ||
        !isCollection(value.resources, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resourceSummaries, (item) => isResource(item, subscriptionId, resourceId)) ||
        !isCollection(value.operationSummaries, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.operationSummaries, (item) => isDerived(item, subscriptionId, resourceId) && item.derivedType === 'operationSummary') ||
        !isCollection(value.securitySensitive, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.securitySensitive, (item) => isDerived(item, subscriptionId, resourceId) && item.derivedType === 'securitySensitiveActivity') ||
        !isCollection(value.powerPatterns, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.powerPatterns, (item) => isDerived(item, subscriptionId, resourceId) && item.derivedType === 'powerPatternEvidence'))
        return false;
    if (!isRanked(value.activitySeries.items, item => item.seriesId) ||
        !isRanked(value.resources.items, item => item.scope.resourceId) ||
        !isRanked(value.operationSummaries.items, item => item.groupId) ||
        !isRanked(value.securitySensitive.items, item => item.groupId) ||
        !isRanked(value.powerPatterns.items, item => item.patternId))
        return false;
    const publicIds = [
        ...value.activitySeries.items.map(item => item.seriesId),
        ...value.operationSummaries.items.map(item => item.groupId),
        ...value.securitySensitive.items.map(item => item.groupId),
        ...value.powerPatterns.items.map(item => item.patternId),
    ];
    if (new Set(publicIds).size !== publicIds.length)
        return false;
    if (!(0, activityLogAnalysisPublicValidationHelpers_1.isSortedUniqueStrings)(value.limitations, activityLogAnalysisPublicValidationHelpers_1.LIMITATIONS.size, item => activityLogAnalysisPublicValidationHelpers_1.LIMITATIONS.has(item)))
        return false;
    const limitations = new Set(value.limitations);
    const facetTruncated = Object.values(value.facets).some(collection => collection.truncated);
    const responseTruncated = facetTruncated ||
        value.activitySeries.truncated ||
        value.resources.truncated ||
        value.operationSummaries.truncated ||
        value.securitySensitive.truncated ||
        value.powerPatterns.truncated ||
        limitations.has('nested-values-truncated');
    if (limitations.has('response-truncated') !== responseTruncated ||
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
        limitations.has('mixed-taxonomy-versions') !== value.taxonomyVersions.length > 1)
        return false;
    try {
        return (0, activityLogAnalysisPublicValidationHelpers_1.utf8ByteLength)(JSON.stringify(value)) <= activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.responseUtf8Bytes;
    }
    catch {
        return false;
    }
};
exports.isPortalActivityAnalysisResponse = isPortalActivityAnalysisResponse;
/** Throws when a value is not the exact public V1 Activity Analysis response. */
function assertPortalActivityAnalysisResponse(value) {
    if (!(0, exports.isPortalActivityAnalysisResponse)(value))
        throw new Error('Invalid Portal Activity Analysis response.');
}
//# sourceMappingURL=activityLogAnalysisPublicValidation.js.map