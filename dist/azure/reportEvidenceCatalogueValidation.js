"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInventoryCatalogueResource = exports.isCompactRecommendation = void 0;
const reportEvidence_1 = require("./reportEvidence");
const reportEvidenceValidationHelpers_1 = require("./reportEvidenceValidationHelpers");
const isCompactRecommendationResource = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    (0, reportEvidenceValidationHelpers_1.isString)(value.id) &&
    ['name', 'type', 'resourceGroup', 'location', 'currency', 'currencySymbol'].every(key => (0, reportEvidenceValidationHelpers_1.isOptionalString)(value[key])) &&
    ['spend', 'spendAmortized'].every(key => (0, reportEvidenceValidationHelpers_1.isOptionalFiniteNumber)(value[key])) &&
    (value.savings === undefined ||
        ((0, reportEvidenceValidationHelpers_1.isRecord)(value.savings) && (0, reportEvidenceValidationHelpers_1.isOptionalFiniteNumber)(value.savings.minAmount) && (0, reportEvidenceValidationHelpers_1.isOptionalFiniteNumber)(value.savings.maxAmount)));
const isCompactRecommendation = (value) => {
    if (!(0, reportEvidenceValidationHelpers_1.isRecord)(value) || !(0, reportEvidenceValidationHelpers_1.isRecord)(value.recommendation) || !Array.isArray(value.resources))
        return false;
    const recommendation = value.recommendation;
    const assessment = recommendation.securityAssessmentSummary;
    if (assessment !== undefined &&
        (!(0, reportEvidenceValidationHelpers_1.isRecord)(assessment) ||
            !(0, reportEvidenceValidationHelpers_1.isCount)(assessment.unhealthyCount) ||
            !(0, reportEvidenceValidationHelpers_1.isCount)(assessment.totalCount) ||
            assessment.unhealthyCount > assessment.totalCount))
        return false;
    if (recommendation.securityImpactDetails !== undefined &&
        (!(0, reportEvidenceValidationHelpers_1.isRecord)(recommendation.securityImpactDetails) ||
            !(0, reportEvidenceValidationHelpers_1.hasOptionalStrings)(recommendation.securityImpactDetails, ['controlName', 'controlDisplayName'])))
        return false;
    if (!(0, reportEvidenceValidationHelpers_1.isString)(recommendation.id) ||
        !(0, reportEvidenceValidationHelpers_1.isString)(recommendation.title) ||
        recommendation.resolved === true ||
        !(0, reportEvidenceValidationHelpers_1.isCount)(value.resourcesCount) ||
        !(0, reportEvidenceValidationHelpers_1.isCount)(value.omittedResourceCount) ||
        value.resources.length > reportEvidence_1.REPORT_EVIDENCE_LIMITS.recommendationResources ||
        !value.resources.every(isCompactRecommendationResource) ||
        value.resourcesCount !== value.resources.length + value.omittedResourceCount) {
        return false;
    }
    if (value.resourceCatalogue !== undefined &&
        (!(0, reportEvidenceValidationHelpers_1.isBoundedRows)(value.resourceCatalogue, reportEvidence_1.REPORT_EVIDENCE_LIMITS.resourceCatalogue, isCompactRecommendationResource) ||
            value.resourceCatalogue.totalCount !== value.resourcesCount))
        return false;
    if (!(0, reportEvidenceValidationHelpers_1.hasOptionalStrings)(recommendation, [
        'name',
        'headline',
        'plainSummary',
        'bottomLine',
        'description',
        'remediation',
        'impactReason',
        'effortReason',
        'potentialBenefits',
        'considerations',
        'technicalPlaybook',
        'category',
        'subCategory',
        'impact',
        'effort',
        'severity',
        'risk',
        'priority',
        'priorityLabel',
        'priorityTier',
        'manualPriority',
        'costImpactUnit',
    ]) ||
        !(0, reportEvidenceValidationHelpers_1.hasOptionalNumbers)(recommendation, [
            'effortHours',
            'costImpact',
            'potentialMonthlySavings',
            'confidencePercentage',
            'adjustedScore',
            'finalScore',
            'normalizedScore',
        ]) ||
        !(0, reportEvidenceValidationHelpers_1.isOptionalBoolean)(recommendation.resolved) ||
        !(0, reportEvidenceValidationHelpers_1.isOptionalBoolean)(recommendation.reportingTextTruncated) ||
        !(0, reportEvidenceValidationHelpers_1.hasOptionalStrings)(value, ['currency', 'currencySymbol'])) {
        return false;
    }
    return (value.savings === undefined ||
        ((0, reportEvidenceValidationHelpers_1.isRecord)(value.savings) && (0, reportEvidenceValidationHelpers_1.isOptionalFiniteNumber)(value.savings.minAmount) && (0, reportEvidenceValidationHelpers_1.isOptionalFiniteNumber)(value.savings.maxAmount)));
};
exports.isCompactRecommendation = isCompactRecommendation;
const isInventoryCatalogueResource = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    isCompactRecommendationResource(value) &&
    (0, reportEvidenceValidationHelpers_1.isOptionalFiniteNumber)(value.createdTime) &&
    (value.tags === undefined ||
        ((0, reportEvidenceValidationHelpers_1.isRecord)(value.tags) &&
            Object.keys(value.tags).length <= 100 &&
            Object.entries(value.tags).every(([key, entry]) => key.length <= 512 && typeof entry === 'string' && entry.length <= 2048))) &&
    (value.spottoTags === undefined ||
        ((0, reportEvidenceValidationHelpers_1.isRecord)(value.spottoTags) &&
            Object.keys(value.spottoTags).length <= 100 &&
            Object.entries(value.spottoTags).every(([key, entry]) => key.length <= 512 && (0, reportEvidenceValidationHelpers_1.isRecord)(entry) && typeof entry.v === 'string' && entry.v.length <= 2048 && (0, reportEvidenceValidationHelpers_1.isFiniteNumber)(entry.a)))) &&
    (value.vmPricePerformance === undefined ||
        ((0, reportEvidenceValidationHelpers_1.isRecord)(value.vmPricePerformance) &&
            (0, reportEvidenceValidationHelpers_1.isRecord)(value.vmPricePerformance.current) &&
            Array.isArray(value.vmPricePerformance.alternatives) &&
            value.vmPricePerformance.alternatives.length <= 1 &&
            value.vmPricePerformance.alternatives.every(reportEvidenceValidationHelpers_1.isRecord)));
exports.isInventoryCatalogueResource = isInventoryCatalogueResource;
//# sourceMappingURL=reportEvidenceCatalogueValidation.js.map