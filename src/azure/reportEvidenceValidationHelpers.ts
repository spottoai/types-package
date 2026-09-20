import { REPORT_EVIDENCE_LIMITS } from './reportEvidence';
import {
  isBoundedRows,
  isCount,
  isCountRecord,
  isFiniteNumber,
  isOptionalFiniteNumber,
  isOptionalString,
  isRecord,
  isString,
  isStringArray,
  hasOptionalNumbers,
  hasOptionalStrings,
  type JsonRecord,
} from '../common/validationHelpers';
export type { JsonRecord } from '../common/validationHelpers';
export {
  isRecord,
  isString,
  isOptionalString,
  isFiniteNumber,
  isOptionalFiniteNumber,
  isOptionalBoolean,
  isCount,
  isDateTime,
  isStringArray,
  isCountRecord,
  countTotal,
  hasOptionalStrings,
  hasOptionalNumbers,
  isBoundedRows,
} from '../common/validationHelpers';

export const isProjectionRows = (value: unknown, limit = REPORT_EVIDENCE_LIMITS.detailRows): boolean => isBoundedRows(value, limit, isRecord);
export const hasRequiredRecords = (value: JsonRecord, keys: readonly string[]): boolean => keys.every(key => isRecord(value[key]));

export const isSourceFileStatus = (value: unknown): boolean =>
  isRecord(value) &&
  isString(value.path) &&
  typeof value.available === 'boolean' &&
  (value.recordCount === undefined || isCount(value.recordCount)) &&
  isOptionalString(value.note);

export const isTagCoverage = (value: unknown): boolean =>
  isRecord(value) &&
  isCount(value.withTags) &&
  isCount(value.withoutTags) &&
  isFiniteNumber(value.coveragePercentage) &&
  Array.isArray(value.topTagKeys) &&
  value.topTagKeys.every(row => isRecord(row) && isString(row.key) && isCount(row.count));

const isTopSpendResource = (value: unknown): boolean =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.name) &&
  isString(value.type) &&
  isOptionalString(value.location) &&
  isFiniteNumber(value.spend30Days) &&
  isOptionalFiniteNumber(value.spend30DaysAmortized);

export const isResourceSummary = (value: unknown): boolean =>
  isRecord(value) &&
  isCount(value.total) &&
  Array.isArray(value.byType) &&
  value.byType.length <= REPORT_EVIDENCE_LIMITS.summaryDimensions &&
  value.byType.every(row => isRecord(row) && isString(row.type) && isCount(row.count) && isOptionalFiniteNumber(row.spend30Days)) &&
  Array.isArray(value.byLocation) &&
  value.byLocation.length <= REPORT_EVIDENCE_LIMITS.summaryDimensions &&
  value.byLocation.every(row => isRecord(row) && isString(row.location) && isCount(row.count) && isOptionalFiniteNumber(row.spend30Days)) &&
  isRecord(value.tagCoverage) &&
  isTagCoverage(value.tagCoverage) &&
  Array.isArray(value.tagCoverage.topTagKeys) &&
  value.tagCoverage.topTagKeys.length <= REPORT_EVIDENCE_LIMITS.summaryRows &&
  Array.isArray(value.topSpendResources) &&
  value.topSpendResources.length <= REPORT_EVIDENCE_LIMITS.summaryRows &&
  value.topSpendResources.every(isTopSpendResource);

const isReportBudgetProjection = (value: unknown): boolean =>
  isRecord(value) &&
  hasOptionalStrings(value, ['name', 'startDate', 'endDate', 'timeGrain', 'category', 'currencyCode']) &&
  hasOptionalNumbers(value, ['amount', 'currentSpend', 'forecastedSpend']) &&
  (value.filter === undefined || isRecord(value.filter));

export const isCostSummary = (value: unknown): boolean => {
  if (!isRecord(value) || !isRecord(value.sourceMetadata) || !Array.isArray(value.topSpendResources)) return false;
  if (
    !hasOptionalStrings(value, ['currency', 'currencySymbol']) ||
    !hasOptionalNumbers(value, ['spend30Days', 'spend30DaysAmortized', 'totalRetailCost', 'miscCost', 'rollingCostRecordCount']) ||
    (value.budget !== undefined && !isReportBudgetProjection(value.budget)) ||
    !isString(value.sourceMetadata.spend30DaysSource) ||
    !isString(value.sourceMetadata.spend30DaysAmortizedSource) ||
    !isString(value.sourceMetadata.totalRetailCostSource) ||
    !isString(value.sourceMetadata.rollingCostFile) ||
    !isOptionalFiniteNumber(value.sourceMetadata.rollingCostRecordCount) ||
    !value.topSpendResources.every(isTopSpendResource)
  ) {
    return false;
  }
  return (
    value.period === undefined ||
    (isRecord(value.period) &&
      value.period.type === 'rolling_30_days' &&
      isString(value.period.source) &&
      hasOptionalStrings(value.period, ['startDate', 'endDate']))
  );
};

export const isRecommendationSummary = (value: unknown): boolean =>
  isRecord(value) &&
  isCount(value.total) &&
  isCountRecord(value.byPillar) &&
  isCountRecord(value.byImpact) &&
  isCountRecord(value.byEffort) &&
  isStringArray(value.topRecommendationIds) &&
  value.topRecommendationIds.length <= REPORT_EVIDENCE_LIMITS.topRecommendationIds &&
  isRecord(value.topRecommendationIdsByPillar) &&
  Object.values(value.topRecommendationIdsByPillar).every(
    ids => isStringArray(ids) && ids.length <= REPORT_EVIDENCE_LIMITS.topRecommendationIdsPerPillar
  );

export const isRetirementSummary = (value: unknown): boolean =>
  isRecord(value) &&
  isCount(value.total) &&
  isCount(value.sourceRecordCount) &&
  isCount(value.excludedUnlinked) &&
  isCount(value.excludedCommitmentExpiries) &&
  isCount(value.within180Days) &&
  isCount(value.expiredOrPastDue) &&
  Array.isArray(value.upcoming) &&
  value.upcoming.length <= REPORT_EVIDENCE_LIMITS.upcomingEvents &&
  value.upcoming.every(
    row =>
      isRecord(row) && isOptionalString(row.id) && isOptionalString(row.title) && isOptionalString(row.retirementDate) && isCount(row.resourceCount)
  );

export const isCommitmentExpirySummary = (value: unknown): boolean =>
  isRecord(value) &&
  isCount(value.total) &&
  isCount(value.sourceRecordCount) &&
  isCount(value.within180Days) &&
  isCount(value.expiredOrPastDue) &&
  Array.isArray(value.upcoming) &&
  value.upcoming.length <= REPORT_EVIDENCE_LIMITS.upcomingEvents &&
  value.upcoming.every(
    row => isRecord(row) && isOptionalString(row.id) && isOptionalString(row.title) && isOptionalString(row.expiryDate) && isCount(row.resourceCount)
  );

export const isEvidenceReference = (value: unknown): boolean =>
  isRecord(value) &&
  isString(value.source) &&
  isString(value.summary) &&
  (value.value === undefined || ['string', 'number', 'boolean'].includes(typeof value.value)) &&
  (typeof value.value !== 'number' || Number.isFinite(value.value));
