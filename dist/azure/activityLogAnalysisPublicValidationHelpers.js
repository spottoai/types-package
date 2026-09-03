"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utf8ByteLength = exports.hasValidTimes = exports.isReasons = exports.isTags = exports.isGroupIds = exports.isEvidenceIds = exports.isPortalActivityAnalysisGroupId = exports.isPortalActivityEvidenceId = exports.isPortalActivityLogClassification = exports.isScope = exports.isChronologicalCountRows = exports.isCountRows = exports.countRowsTotal = exports.isSortedUniqueStrings = exports.isDate = exports.isTimestamp = exports.isPositiveCount = exports.isCount = exports.isText = exports.hasExactKeys = exports.isRecord = exports.LIMITATIONS = exports.POWER_SUFFICIENCY = exports.CONFIDENCES = exports.EFFECTS = exports.ORIGINS = exports.TAG_IDS = exports.MONTH = void 0;
const activityLogAnalysis_1 = require("./activityLogAnalysis");
exports.MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const EVIDENCE_ID = /^aev1_[a-f0-9]{64}$/;
const GROUP_ID = /^aag1_[a-f0-9]{64}$/;
exports.TAG_IDS = new Set(activityLogAnalysis_1.ACTIVITY_LOG_TAG_IDS);
exports.ORIGINS = new Set(['manual', 'workloadAutomation', 'azurePlatform', 'unknown']);
exports.EFFECTS = new Set(['write', 'delete', 'action', 'read', 'other']);
exports.CONFIDENCES = new Set(['high', 'medium', 'low']);
exports.POWER_SUFFICIENCY = new Set(['oneSided', 'oneOff', 'sameDayRepeat', 'repeated']);
exports.LIMITATIONS = new Set([
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
const isRecord = (value) => {
    if (value === null || typeof value !== 'object' || Array.isArray(value))
        return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
};
exports.isRecord = isRecord;
const hasExactKeys = (value, required, optional = []) => {
    if (!(0, exports.isRecord)(value))
        return false;
    const allowed = new Set([...required, ...optional]);
    const keys = Object.keys(value);
    return required.every(key => Object.prototype.hasOwnProperty.call(value, key)) && keys.every(key => allowed.has(key) && !RESERVED_KEYS.has(key));
};
exports.hasExactKeys = hasExactKeys;
const isText = (value, maximum) => typeof value === 'string' && value.length > 0 && value.length <= maximum && value.trim() === value;
exports.isText = isText;
const isCount = (value) => Number.isSafeInteger(value) && value >= 0;
exports.isCount = isCount;
const isPositiveCount = (value) => (0, exports.isCount)(value) && value > 0;
exports.isPositiveCount = isPositiveCount;
const isTimestamp = (value) => {
    if (typeof value !== 'string' || !TIMESTAMP.test(value))
        return false;
    const milliseconds = Date.parse(value);
    return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString() === value;
};
exports.isTimestamp = isTimestamp;
const isDate = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value))
        return false;
    return new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
};
exports.isDate = isDate;
const isSortedUniqueStrings = (value, maximum, predicate) => Array.isArray(value) &&
    value.length <= maximum &&
    value.every((item, index) => typeof item === 'string' && predicate(item) && (index === 0 || value[index - 1] < item));
exports.isSortedUniqueStrings = isSortedUniqueStrings;
const countRowsTotal = (rows) => {
    let total = 0;
    for (const row of rows) {
        total += row.count;
        if (!Number.isSafeInteger(total))
            return undefined;
    }
    return total;
};
exports.countRowsTotal = countRowsTotal;
const isCountRows = (value, maximum, valueMaximum, allowed) => {
    if (!Array.isArray(value) || value.length > maximum)
        return false;
    for (let index = 0; index < value.length; index += 1) {
        const row = value[index];
        if (!(0, exports.hasExactKeys)(row, ['value', 'count']) || !(0, exports.isText)(row.value, valueMaximum) || !(0, exports.isPositiveCount)(row.count))
            return false;
        if (allowed && !allowed.has(row.value))
            return false;
        const previous = value[index - 1];
        if (previous && (previous.count < row.count || (previous.count === row.count && previous.value >= row.value)))
            return false;
    }
    return true;
};
exports.isCountRows = isCountRows;
const isChronologicalCountRows = (value, predicate) => Array.isArray(value) &&
    value.every((row, index) => (0, exports.hasExactKeys)(row, ['value', 'count']) &&
        typeof row.value === 'string' &&
        predicate(row.value) &&
        (0, exports.isPositiveCount)(row.count) &&
        (index === 0 || value[index - 1].value < row.value));
exports.isChronologicalCountRows = isChronologicalCountRows;
const isScope = (value, subscriptionId, resourceId) => {
    if (!(0, exports.hasExactKeys)(value, ['subscriptionId', 'level'], ['resourceId', 'resourceGroup', 'provider', 'resourceType', 'resourceName']) ||
        value.subscriptionId !== subscriptionId ||
        typeof value.level !== 'string' ||
        !SCOPE_LEVELS.has(value.level))
        return false;
    if (value.resourceId !== undefined && !(0, exports.isText)(value.resourceId, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resourceIdCodeUnits))
        return false;
    if (value.resourceGroup !== undefined && !(0, exports.isText)(value.resourceGroup, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resourceNameCodeUnits))
        return false;
    if (value.provider !== undefined && !(0, exports.isText)(value.provider, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.providerCodeUnits))
        return false;
    if (value.resourceType !== undefined && !(0, exports.isText)(value.resourceType, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resourceTypeCodeUnits))
        return false;
    if (value.resourceName !== undefined && !(0, exports.isText)(value.resourceName, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resourceNameCodeUnits))
        return false;
    if (value.level === 'resource' && typeof value.resourceId !== 'string')
        return false;
    if (value.level === 'resource') {
        const scopedSubscriptionId = /^\/subscriptions\/([^/]+)\//i.exec(value.resourceId)?.[1];
        if (!scopedSubscriptionId || scopedSubscriptionId.toLowerCase() !== subscriptionId.toLowerCase())
            return false;
    }
    if (value.level === 'resourceGroup' && typeof value.resourceGroup !== 'string')
        return false;
    if (value.level === 'subscription' && (value.resourceId !== undefined || value.resourceGroup !== undefined))
        return false;
    return resourceId === undefined || value.resourceId === resourceId;
};
exports.isScope = isScope;
/** Validates the exact additive classification carried by one Portal Activity Log entry. */
const isPortalActivityLogClassification = (value) => {
    if (!(0, exports.hasExactKeys)(value, ['taxonomyVersion', 'executionOrigin', 'operationEffect', 'scope', 'tags']) ||
        value.taxonomyVersion !== activityLogAnalysis_1.ACTIVITY_LOG_TAXONOMY_VERSION ||
        typeof value.executionOrigin !== 'string' ||
        !exports.ORIGINS.has(value.executionOrigin) ||
        typeof value.operationEffect !== 'string' ||
        !exports.EFFECTS.has(value.operationEffect) ||
        !(0, exports.isRecord)(value.scope) ||
        typeof value.scope.subscriptionId !== 'string' ||
        !(0, exports.isScope)(value.scope, value.scope.subscriptionId) ||
        !Array.isArray(value.tags) ||
        value.tags.length > activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.tagAssignmentsPerEvent)
        return false;
    const tags = value.tags;
    return tags.every((tag, index) => {
        if (!(0, exports.hasExactKeys)(tag, ['tagId', 'dimension', 'confidence']) ||
            typeof tag.tagId !== 'string' ||
            !exports.TAG_IDS.has(tag.tagId) ||
            tag.dimension !== tag.tagId.slice(0, tag.tagId.indexOf('.')) ||
            typeof tag.confidence !== 'string' ||
            !exports.CONFIDENCES.has(tag.confidence))
            return false;
        return index === 0 || tags[index - 1].tagId < tag.tagId;
    });
};
exports.isPortalActivityLogClassification = isPortalActivityLogClassification;
/** Validates the opaque V1 public Activity Log evidence ID syntax. */
const isPortalActivityEvidenceId = (value) => typeof value === 'string' && EVIDENCE_ID.test(value);
exports.isPortalActivityEvidenceId = isPortalActivityEvidenceId;
/** Validates the opaque V1 public Activity Analysis group ID syntax. */
const isPortalActivityAnalysisGroupId = (value) => typeof value === 'string' && GROUP_ID.test(value);
exports.isPortalActivityAnalysisGroupId = isPortalActivityAnalysisGroupId;
const isEvidenceIds = (value) => Array.isArray(value) &&
    value.length <= activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.evidenceIdsPerItem &&
    value.every(exports.isPortalActivityEvidenceId) &&
    new Set(value).size === value.length;
exports.isEvidenceIds = isEvidenceIds;
const isGroupIds = (value) => (0, exports.isSortedUniqueStrings)(value, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.evidenceIdsPerItem, exports.isPortalActivityAnalysisGroupId);
exports.isGroupIds = isGroupIds;
const isTags = (value) => (0, exports.isSortedUniqueStrings)(value, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.tagCountsPerItem, tag => exports.TAG_IDS.has(tag));
exports.isTags = isTags;
const isReasons = (value) => (0, exports.isSortedUniqueStrings)(value, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.reasonCodesPerItem, reason => {
    if (!(0, exports.isText)(reason, activityLogAnalysis_1.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.reasonCodeUnits))
        return false;
    return (reason === 'derived.operation-summary' ||
        reason === 'derived.security-sensitive-activity' ||
        reason === 'derived.power-pattern-evidence' ||
        (reason.startsWith('tag.') && exports.TAG_IDS.has(reason.slice(4))));
});
exports.isReasons = isReasons;
const hasValidTimes = (value) => (0, exports.isTimestamp)(value.firstTimestamp) && (0, exports.isTimestamp)(value.lastTimestamp) && value.firstTimestamp <= value.lastTimestamp;
exports.hasValidTimes = hasValidTimes;
const utf8ByteLength = (value) => {
    let bytes = 0;
    for (const character of value) {
        const codePoint = character.codePointAt(0);
        bytes += codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4;
    }
    return bytes;
};
exports.utf8ByteLength = utf8ByteLength;
//# sourceMappingURL=activityLogAnalysisPublicValidationHelpers.js.map