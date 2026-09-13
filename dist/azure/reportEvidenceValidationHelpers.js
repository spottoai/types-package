"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEvidenceReference = exports.isCommitmentExpirySummary = exports.isRetirementSummary = exports.isRecommendationSummary = exports.isCostSummary = exports.isResourceSummary = exports.isTagCoverage = exports.isSourceFileStatus = exports.hasRequiredRecords = exports.isProjectionRows = exports.isBoundedRows = exports.hasOptionalNumbers = exports.hasOptionalStrings = exports.countTotal = exports.isCountRecord = exports.isStringArray = exports.isDateTime = exports.isCount = exports.isOptionalBoolean = exports.isOptionalFiniteNumber = exports.isFiniteNumber = exports.isOptionalString = exports.isString = exports.isRecord = void 0;
const reportEvidence_1 = require("./reportEvidence");
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
exports.isRecord = isRecord;
const isString = (value) => typeof value === 'string' && value.trim().length > 0;
exports.isString = isString;
const isOptionalString = (value) => value === undefined || (0, exports.isString)(value);
exports.isOptionalString = isOptionalString;
const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
exports.isFiniteNumber = isFiniteNumber;
const isOptionalFiniteNumber = (value) => value === undefined || (0, exports.isFiniteNumber)(value);
exports.isOptionalFiniteNumber = isOptionalFiniteNumber;
const isOptionalBoolean = (value) => value === undefined || typeof value === 'boolean';
exports.isOptionalBoolean = isOptionalBoolean;
const isCount = (value) => (0, exports.isFiniteNumber)(value) && Number.isInteger(value) && value >= 0;
exports.isCount = isCount;
const isDateTime = (value) => (0, exports.isString)(value) && Number.isFinite(Date.parse(value));
exports.isDateTime = isDateTime;
const isStringArray = (value) => Array.isArray(value) && value.every(exports.isString);
exports.isStringArray = isStringArray;
const isCountRecord = (value) => (0, exports.isRecord)(value) && Object.values(value).every(exports.isCount);
exports.isCountRecord = isCountRecord;
const countTotal = (value) => Object.values(value).reduce((total, count) => total + count, 0);
exports.countTotal = countTotal;
const hasOptionalStrings = (value, keys) => keys.every(key => (0, exports.isOptionalString)(value[key]));
exports.hasOptionalStrings = hasOptionalStrings;
const hasOptionalNumbers = (value, keys) => keys.every(key => (0, exports.isOptionalFiniteNumber)(value[key]));
exports.hasOptionalNumbers = hasOptionalNumbers;
const isBoundedRows = (value, limit, isRow) => {
    if (!(0, exports.isRecord)(value) || !(0, exports.isCount)(value.totalCount) || !(0, exports.isCount)(value.omittedCount) || !Array.isArray(value.rows))
        return false;
    return value.rows.length <= limit && value.rows.every(isRow) && value.totalCount === value.rows.length + value.omittedCount;
};
exports.isBoundedRows = isBoundedRows;
const isProjectionRows = (value, limit = reportEvidence_1.REPORT_EVIDENCE_LIMITS.detailRows) => (0, exports.isBoundedRows)(value, limit, exports.isRecord);
exports.isProjectionRows = isProjectionRows;
const hasRequiredRecords = (value, keys) => keys.every(key => (0, exports.isRecord)(value[key]));
exports.hasRequiredRecords = hasRequiredRecords;
const isSourceFileStatus = (value) => (0, exports.isRecord)(value) &&
    (0, exports.isString)(value.path) &&
    typeof value.available === 'boolean' &&
    (value.recordCount === undefined || (0, exports.isCount)(value.recordCount)) &&
    (0, exports.isOptionalString)(value.note);
exports.isSourceFileStatus = isSourceFileStatus;
const isTagCoverage = (value) => (0, exports.isRecord)(value) &&
    (0, exports.isCount)(value.withTags) &&
    (0, exports.isCount)(value.withoutTags) &&
    (0, exports.isFiniteNumber)(value.coveragePercentage) &&
    Array.isArray(value.topTagKeys) &&
    value.topTagKeys.every(row => (0, exports.isRecord)(row) && (0, exports.isString)(row.key) && (0, exports.isCount)(row.count));
exports.isTagCoverage = isTagCoverage;
const isTopSpendResource = (value) => (0, exports.isRecord)(value) &&
    (0, exports.isString)(value.id) &&
    (0, exports.isString)(value.name) &&
    (0, exports.isString)(value.type) &&
    (0, exports.isOptionalString)(value.location) &&
    (0, exports.isFiniteNumber)(value.spend30Days) &&
    (0, exports.isOptionalFiniteNumber)(value.spend30DaysAmortized);
const isResourceSummary = (value) => (0, exports.isRecord)(value) &&
    (0, exports.isCount)(value.total) &&
    Array.isArray(value.byType) &&
    value.byType.length <= reportEvidence_1.REPORT_EVIDENCE_LIMITS.summaryDimensions &&
    value.byType.every(row => (0, exports.isRecord)(row) && (0, exports.isString)(row.type) && (0, exports.isCount)(row.count) && (0, exports.isOptionalFiniteNumber)(row.spend30Days)) &&
    Array.isArray(value.byLocation) &&
    value.byLocation.length <= reportEvidence_1.REPORT_EVIDENCE_LIMITS.summaryDimensions &&
    value.byLocation.every(row => (0, exports.isRecord)(row) && (0, exports.isString)(row.location) && (0, exports.isCount)(row.count) && (0, exports.isOptionalFiniteNumber)(row.spend30Days)) &&
    (0, exports.isRecord)(value.tagCoverage) &&
    (0, exports.isTagCoverage)(value.tagCoverage) &&
    Array.isArray(value.tagCoverage.topTagKeys) &&
    value.tagCoverage.topTagKeys.length <= reportEvidence_1.REPORT_EVIDENCE_LIMITS.summaryRows &&
    Array.isArray(value.topSpendResources) &&
    value.topSpendResources.length <= reportEvidence_1.REPORT_EVIDENCE_LIMITS.summaryRows &&
    value.topSpendResources.every(isTopSpendResource);
exports.isResourceSummary = isResourceSummary;
const isCostSummary = (value) => {
    if (!(0, exports.isRecord)(value) || !(0, exports.isRecord)(value.sourceMetadata) || !Array.isArray(value.topSpendResources))
        return false;
    if (!(0, exports.hasOptionalStrings)(value, ['currency', 'currencySymbol']) ||
        !(0, exports.hasOptionalNumbers)(value, ['spend30Days', 'spend30DaysAmortized', 'totalRetailCost', 'miscCost', 'rollingCostRecordCount']) ||
        (value.budget !== undefined && !(0, exports.isRecord)(value.budget)) ||
        !(0, exports.isString)(value.sourceMetadata.spend30DaysSource) ||
        !(0, exports.isString)(value.sourceMetadata.spend30DaysAmortizedSource) ||
        !(0, exports.isString)(value.sourceMetadata.totalRetailCostSource) ||
        !(0, exports.isString)(value.sourceMetadata.rollingCostFile) ||
        !(0, exports.isOptionalFiniteNumber)(value.sourceMetadata.rollingCostRecordCount) ||
        !value.topSpendResources.every(isTopSpendResource)) {
        return false;
    }
    return (value.period === undefined ||
        ((0, exports.isRecord)(value.period) &&
            value.period.type === 'rolling_30_days' &&
            (0, exports.isString)(value.period.source) &&
            (0, exports.hasOptionalStrings)(value.period, ['startDate', 'endDate'])));
};
exports.isCostSummary = isCostSummary;
const isRecommendationSummary = (value) => (0, exports.isRecord)(value) &&
    (0, exports.isCount)(value.total) &&
    (0, exports.isCountRecord)(value.byPillar) &&
    (0, exports.isCountRecord)(value.byImpact) &&
    (0, exports.isCountRecord)(value.byEffort) &&
    (0, exports.isStringArray)(value.topRecommendationIds) &&
    value.topRecommendationIds.length <= reportEvidence_1.REPORT_EVIDENCE_LIMITS.topRecommendationIds &&
    (0, exports.isRecord)(value.topRecommendationIdsByPillar) &&
    Object.values(value.topRecommendationIdsByPillar).every(ids => (0, exports.isStringArray)(ids) && ids.length <= reportEvidence_1.REPORT_EVIDENCE_LIMITS.topRecommendationIdsPerPillar);
exports.isRecommendationSummary = isRecommendationSummary;
const isRetirementSummary = (value) => (0, exports.isRecord)(value) &&
    (0, exports.isCount)(value.total) &&
    (0, exports.isCount)(value.sourceRecordCount) &&
    (0, exports.isCount)(value.excludedUnlinked) &&
    (0, exports.isCount)(value.excludedCommitmentExpiries) &&
    (0, exports.isCount)(value.within180Days) &&
    (0, exports.isCount)(value.expiredOrPastDue) &&
    Array.isArray(value.upcoming) &&
    value.upcoming.length <= reportEvidence_1.REPORT_EVIDENCE_LIMITS.upcomingEvents &&
    value.upcoming.every(row => (0, exports.isRecord)(row) && (0, exports.isOptionalString)(row.id) && (0, exports.isOptionalString)(row.title) && (0, exports.isOptionalString)(row.retirementDate) && (0, exports.isCount)(row.resourceCount));
exports.isRetirementSummary = isRetirementSummary;
const isCommitmentExpirySummary = (value) => (0, exports.isRecord)(value) &&
    (0, exports.isCount)(value.total) &&
    (0, exports.isCount)(value.sourceRecordCount) &&
    (0, exports.isCount)(value.within180Days) &&
    (0, exports.isCount)(value.expiredOrPastDue) &&
    Array.isArray(value.upcoming) &&
    value.upcoming.length <= reportEvidence_1.REPORT_EVIDENCE_LIMITS.upcomingEvents &&
    value.upcoming.every(row => (0, exports.isRecord)(row) && (0, exports.isOptionalString)(row.id) && (0, exports.isOptionalString)(row.title) && (0, exports.isOptionalString)(row.expiryDate) && (0, exports.isCount)(row.resourceCount));
exports.isCommitmentExpirySummary = isCommitmentExpirySummary;
const isEvidenceReference = (value) => (0, exports.isRecord)(value) &&
    (0, exports.isString)(value.source) &&
    (0, exports.isString)(value.summary) &&
    (value.value === undefined || ['string', 'number', 'boolean'].includes(typeof value.value)) &&
    (typeof value.value !== 'number' || Number.isFinite(value.value));
exports.isEvidenceReference = isEvidenceReference;
//# sourceMappingURL=reportEvidenceValidationHelpers.js.map