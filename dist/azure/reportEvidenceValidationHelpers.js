"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEvidenceReference = exports.isCommitmentExpirySummary = exports.isRetirementSummary = exports.isRecommendationSummary = exports.isCostSummary = exports.isResourceSummary = exports.isTagCoverage = exports.isSourceFileStatus = exports.hasRequiredRecords = exports.isProjectionRows = exports.isBoundedRows = exports.hasOptionalNumbers = exports.hasOptionalStrings = exports.countTotal = exports.isCountRecord = exports.isStringArray = exports.isDateTime = exports.isCount = exports.isOptionalBoolean = exports.isOptionalFiniteNumber = exports.isFiniteNumber = exports.isOptionalString = exports.isString = exports.isRecord = void 0;
const reportEvidence_1 = require("./reportEvidence");
const validationHelpers_1 = require("../common/validationHelpers");
var validationHelpers_2 = require("../common/validationHelpers");
Object.defineProperty(exports, "isRecord", { enumerable: true, get: function () { return validationHelpers_2.isRecord; } });
Object.defineProperty(exports, "isString", { enumerable: true, get: function () { return validationHelpers_2.isString; } });
Object.defineProperty(exports, "isOptionalString", { enumerable: true, get: function () { return validationHelpers_2.isOptionalString; } });
Object.defineProperty(exports, "isFiniteNumber", { enumerable: true, get: function () { return validationHelpers_2.isFiniteNumber; } });
Object.defineProperty(exports, "isOptionalFiniteNumber", { enumerable: true, get: function () { return validationHelpers_2.isOptionalFiniteNumber; } });
Object.defineProperty(exports, "isOptionalBoolean", { enumerable: true, get: function () { return validationHelpers_2.isOptionalBoolean; } });
Object.defineProperty(exports, "isCount", { enumerable: true, get: function () { return validationHelpers_2.isCount; } });
Object.defineProperty(exports, "isDateTime", { enumerable: true, get: function () { return validationHelpers_2.isDateTime; } });
Object.defineProperty(exports, "isStringArray", { enumerable: true, get: function () { return validationHelpers_2.isStringArray; } });
Object.defineProperty(exports, "isCountRecord", { enumerable: true, get: function () { return validationHelpers_2.isCountRecord; } });
Object.defineProperty(exports, "countTotal", { enumerable: true, get: function () { return validationHelpers_2.countTotal; } });
Object.defineProperty(exports, "hasOptionalStrings", { enumerable: true, get: function () { return validationHelpers_2.hasOptionalStrings; } });
Object.defineProperty(exports, "hasOptionalNumbers", { enumerable: true, get: function () { return validationHelpers_2.hasOptionalNumbers; } });
Object.defineProperty(exports, "isBoundedRows", { enumerable: true, get: function () { return validationHelpers_2.isBoundedRows; } });
const isProjectionRows = (value, limit = reportEvidence_1.REPORT_EVIDENCE_LIMITS.detailRows) => (0, validationHelpers_1.isBoundedRows)(value, limit, validationHelpers_1.isRecord);
exports.isProjectionRows = isProjectionRows;
const hasRequiredRecords = (value, keys) => keys.every(key => (0, validationHelpers_1.isRecord)(value[key]));
exports.hasRequiredRecords = hasRequiredRecords;
const isSourceFileStatus = (value) => (0, validationHelpers_1.isRecord)(value) &&
    (0, validationHelpers_1.isString)(value.path) &&
    typeof value.available === 'boolean' &&
    (value.recordCount === undefined || (0, validationHelpers_1.isCount)(value.recordCount)) &&
    (0, validationHelpers_1.isOptionalString)(value.note);
exports.isSourceFileStatus = isSourceFileStatus;
const isTagCoverage = (value) => (0, validationHelpers_1.isRecord)(value) &&
    (0, validationHelpers_1.isCount)(value.withTags) &&
    (0, validationHelpers_1.isCount)(value.withoutTags) &&
    (0, validationHelpers_1.isFiniteNumber)(value.coveragePercentage) &&
    Array.isArray(value.topTagKeys) &&
    value.topTagKeys.every(row => (0, validationHelpers_1.isRecord)(row) && (0, validationHelpers_1.isString)(row.key) && (0, validationHelpers_1.isCount)(row.count));
exports.isTagCoverage = isTagCoverage;
const isTopSpendResource = (value) => (0, validationHelpers_1.isRecord)(value) &&
    (0, validationHelpers_1.isString)(value.id) &&
    (0, validationHelpers_1.isString)(value.name) &&
    (0, validationHelpers_1.isString)(value.type) &&
    (0, validationHelpers_1.isOptionalString)(value.location) &&
    (0, validationHelpers_1.isFiniteNumber)(value.spend30Days) &&
    (0, validationHelpers_1.isOptionalFiniteNumber)(value.spend30DaysAmortized);
const isResourceSummary = (value) => (0, validationHelpers_1.isRecord)(value) &&
    (0, validationHelpers_1.isCount)(value.total) &&
    Array.isArray(value.byType) &&
    value.byType.length <= reportEvidence_1.REPORT_EVIDENCE_LIMITS.summaryDimensions &&
    value.byType.every(row => (0, validationHelpers_1.isRecord)(row) && (0, validationHelpers_1.isString)(row.type) && (0, validationHelpers_1.isCount)(row.count) && (0, validationHelpers_1.isOptionalFiniteNumber)(row.spend30Days)) &&
    Array.isArray(value.byLocation) &&
    value.byLocation.length <= reportEvidence_1.REPORT_EVIDENCE_LIMITS.summaryDimensions &&
    value.byLocation.every(row => (0, validationHelpers_1.isRecord)(row) && (0, validationHelpers_1.isString)(row.location) && (0, validationHelpers_1.isCount)(row.count) && (0, validationHelpers_1.isOptionalFiniteNumber)(row.spend30Days)) &&
    (0, validationHelpers_1.isRecord)(value.tagCoverage) &&
    (0, exports.isTagCoverage)(value.tagCoverage) &&
    Array.isArray(value.tagCoverage.topTagKeys) &&
    value.tagCoverage.topTagKeys.length <= reportEvidence_1.REPORT_EVIDENCE_LIMITS.summaryRows &&
    Array.isArray(value.topSpendResources) &&
    value.topSpendResources.length <= reportEvidence_1.REPORT_EVIDENCE_LIMITS.summaryRows &&
    value.topSpendResources.every(isTopSpendResource);
exports.isResourceSummary = isResourceSummary;
const isReportBudgetProjection = (value) => (0, validationHelpers_1.isRecord)(value) &&
    (0, validationHelpers_1.hasOptionalStrings)(value, ['name', 'startDate', 'endDate', 'timeGrain', 'category', 'currencyCode']) &&
    (0, validationHelpers_1.hasOptionalNumbers)(value, ['amount', 'currentSpend', 'forecastedSpend']) &&
    (value.filter === undefined || (0, validationHelpers_1.isRecord)(value.filter));
const isCostSummary = (value) => {
    if (!(0, validationHelpers_1.isRecord)(value) || !(0, validationHelpers_1.isRecord)(value.sourceMetadata) || !Array.isArray(value.topSpendResources))
        return false;
    if (!(0, validationHelpers_1.hasOptionalStrings)(value, ['currency', 'currencySymbol']) ||
        !(0, validationHelpers_1.hasOptionalNumbers)(value, ['spend30Days', 'spend30DaysAmortized', 'totalRetailCost', 'miscCost', 'rollingCostRecordCount']) ||
        (value.budget !== undefined && !isReportBudgetProjection(value.budget)) ||
        !(0, validationHelpers_1.isString)(value.sourceMetadata.spend30DaysSource) ||
        !(0, validationHelpers_1.isString)(value.sourceMetadata.spend30DaysAmortizedSource) ||
        !(0, validationHelpers_1.isString)(value.sourceMetadata.totalRetailCostSource) ||
        !(0, validationHelpers_1.isString)(value.sourceMetadata.rollingCostFile) ||
        !(0, validationHelpers_1.isOptionalFiniteNumber)(value.sourceMetadata.rollingCostRecordCount) ||
        !value.topSpendResources.every(isTopSpendResource)) {
        return false;
    }
    return (value.period === undefined ||
        ((0, validationHelpers_1.isRecord)(value.period) &&
            value.period.type === 'rolling_30_days' &&
            (0, validationHelpers_1.isString)(value.period.source) &&
            (0, validationHelpers_1.hasOptionalStrings)(value.period, ['startDate', 'endDate'])));
};
exports.isCostSummary = isCostSummary;
const isRecommendationSummary = (value) => (0, validationHelpers_1.isRecord)(value) &&
    (0, validationHelpers_1.isCount)(value.total) &&
    (0, validationHelpers_1.isCountRecord)(value.byPillar) &&
    (0, validationHelpers_1.isCountRecord)(value.byImpact) &&
    (0, validationHelpers_1.isCountRecord)(value.byEffort) &&
    (0, validationHelpers_1.isStringArray)(value.topRecommendationIds) &&
    value.topRecommendationIds.length <= reportEvidence_1.REPORT_EVIDENCE_LIMITS.topRecommendationIds &&
    (0, validationHelpers_1.isRecord)(value.topRecommendationIdsByPillar) &&
    Object.values(value.topRecommendationIdsByPillar).every(ids => (0, validationHelpers_1.isStringArray)(ids) && ids.length <= reportEvidence_1.REPORT_EVIDENCE_LIMITS.topRecommendationIdsPerPillar);
exports.isRecommendationSummary = isRecommendationSummary;
const isRetirementSummary = (value) => (0, validationHelpers_1.isRecord)(value) &&
    (0, validationHelpers_1.isCount)(value.total) &&
    (0, validationHelpers_1.isCount)(value.sourceRecordCount) &&
    (0, validationHelpers_1.isCount)(value.excludedUnlinked) &&
    (0, validationHelpers_1.isCount)(value.excludedCommitmentExpiries) &&
    (0, validationHelpers_1.isCount)(value.within180Days) &&
    (0, validationHelpers_1.isCount)(value.expiredOrPastDue) &&
    Array.isArray(value.upcoming) &&
    value.upcoming.length <= reportEvidence_1.REPORT_EVIDENCE_LIMITS.upcomingEvents &&
    value.upcoming.every(row => (0, validationHelpers_1.isRecord)(row) && (0, validationHelpers_1.isOptionalString)(row.id) && (0, validationHelpers_1.isOptionalString)(row.title) && (0, validationHelpers_1.isOptionalString)(row.retirementDate) && (0, validationHelpers_1.isCount)(row.resourceCount));
exports.isRetirementSummary = isRetirementSummary;
const isCommitmentExpirySummary = (value) => (0, validationHelpers_1.isRecord)(value) &&
    (0, validationHelpers_1.isCount)(value.total) &&
    (0, validationHelpers_1.isCount)(value.sourceRecordCount) &&
    (0, validationHelpers_1.isCount)(value.within180Days) &&
    (0, validationHelpers_1.isCount)(value.expiredOrPastDue) &&
    Array.isArray(value.upcoming) &&
    value.upcoming.length <= reportEvidence_1.REPORT_EVIDENCE_LIMITS.upcomingEvents &&
    value.upcoming.every(row => (0, validationHelpers_1.isRecord)(row) && (0, validationHelpers_1.isOptionalString)(row.id) && (0, validationHelpers_1.isOptionalString)(row.title) && (0, validationHelpers_1.isOptionalString)(row.expiryDate) && (0, validationHelpers_1.isCount)(row.resourceCount));
exports.isCommitmentExpirySummary = isCommitmentExpirySummary;
const isEvidenceReference = (value) => (0, validationHelpers_1.isRecord)(value) &&
    (0, validationHelpers_1.isString)(value.source) &&
    (0, validationHelpers_1.isString)(value.summary) &&
    (value.value === undefined || ['string', 'number', 'boolean'].includes(typeof value.value)) &&
    (typeof value.value !== 'number' || Number.isFinite(value.value));
exports.isEvidenceReference = isEvidenceReference;
//# sourceMappingURL=reportEvidenceValidationHelpers.js.map