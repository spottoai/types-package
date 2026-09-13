import { REPORT_EVIDENCE_LIMITS, type ReportCompactRecommendation } from './reportEvidence';
import {
  isRecord,
  isString,
  isOptionalString,
  isOptionalFiniteNumber,
  isOptionalBoolean,
  isFiniteNumber,
  isCount,
  isBoundedRows,
  hasOptionalStrings,
  hasOptionalNumbers,
  type JsonRecord,
} from './reportEvidenceValidationHelpers';

const isCompactRecommendationResource = (value: unknown): value is JsonRecord =>
  isRecord(value) &&
  isString(value.id) &&
  ['name', 'type', 'resourceGroup', 'location', 'currency', 'currencySymbol'].every(key => isOptionalString(value[key])) &&
  ['spend', 'spendAmortized'].every(key => isOptionalFiniteNumber(value[key])) &&
  (value.savings === undefined ||
    (isRecord(value.savings) && isOptionalFiniteNumber(value.savings.minAmount) && isOptionalFiniteNumber(value.savings.maxAmount)));

export const isCompactRecommendation = (value: unknown): value is ReportCompactRecommendation => {
  if (!isRecord(value) || !isRecord(value.recommendation) || !Array.isArray(value.resources)) return false;
  const recommendation = value.recommendation;
  const assessment = recommendation.securityAssessmentSummary;
  if (
    assessment !== undefined &&
    (!isRecord(assessment) ||
      !isCount(assessment.unhealthyCount) ||
      !isCount(assessment.totalCount) ||
      assessment.unhealthyCount > assessment.totalCount)
  )
    return false;
  if (
    recommendation.securityImpactDetails !== undefined &&
    (!isRecord(recommendation.securityImpactDetails) ||
      !hasOptionalStrings(recommendation.securityImpactDetails, ['controlName', 'controlDisplayName']))
  )
    return false;
  if (
    !isString(recommendation.id) ||
    !isString(recommendation.title) ||
    recommendation.resolved === true ||
    !isCount(value.resourcesCount) ||
    !isCount(value.omittedResourceCount) ||
    value.resources.length > REPORT_EVIDENCE_LIMITS.recommendationResources ||
    !value.resources.every(isCompactRecommendationResource) ||
    value.resourcesCount !== value.resources.length + value.omittedResourceCount
  ) {
    return false;
  }
  if (
    value.resourceCatalogue !== undefined &&
    (!isBoundedRows(value.resourceCatalogue, REPORT_EVIDENCE_LIMITS.resourceCatalogue, isCompactRecommendationResource) ||
      value.resourceCatalogue.totalCount !== value.resourcesCount)
  )
    return false;
  if (
    !hasOptionalStrings(recommendation, [
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
    !hasOptionalNumbers(recommendation, [
      'effortHours',
      'costImpact',
      'potentialMonthlySavings',
      'confidencePercentage',
      'adjustedScore',
      'finalScore',
      'normalizedScore',
    ]) ||
    !isOptionalBoolean(recommendation.resolved) ||
    !isOptionalBoolean(recommendation.reportingTextTruncated) ||
    !hasOptionalStrings(value, ['currency', 'currencySymbol'])
  ) {
    return false;
  }
  return (
    value.savings === undefined ||
    (isRecord(value.savings) && isOptionalFiniteNumber(value.savings.minAmount) && isOptionalFiniteNumber(value.savings.maxAmount))
  );
};

export const isInventoryCatalogueResource = (value: unknown): value is JsonRecord =>
  isRecord(value) &&
  isCompactRecommendationResource(value) &&
  isOptionalFiniteNumber(value.createdTime) &&
  (value.tags === undefined ||
    (isRecord(value.tags) &&
      Object.keys(value.tags).length <= 100 &&
      Object.entries(value.tags).every(([key, entry]) => key.length <= 512 && typeof entry === 'string' && entry.length <= 2048))) &&
  (value.spottoTags === undefined ||
    (isRecord(value.spottoTags) &&
      Object.keys(value.spottoTags).length <= 100 &&
      Object.entries(value.spottoTags).every(
        ([key, entry]) => key.length <= 512 && isRecord(entry) && typeof entry.v === 'string' && entry.v.length <= 2048 && isFiniteNumber(entry.a)
      ))) &&
  (value.vmPricePerformance === undefined ||
    (isRecord(value.vmPricePerformance) &&
      isRecord(value.vmPricePerformance.current) &&
      Array.isArray(value.vmPricePerformance.alternatives) &&
      value.vmPricePerformance.alternatives.length <= 1 &&
      value.vmPricePerformance.alternatives.every(isRecord)));
