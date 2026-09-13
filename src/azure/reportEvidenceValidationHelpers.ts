import { REPORT_EVIDENCE_LIMITS, type ReportBoundedRows } from './reportEvidence';

export type JsonRecord = Record<string, unknown>;

export const isRecord = (value: unknown): value is JsonRecord => typeof value === 'object' && value !== null && !Array.isArray(value);
export const isString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
export const isOptionalString = (value: unknown): boolean => value === undefined || isString(value);
export const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
export const isOptionalFiniteNumber = (value: unknown): boolean => value === undefined || isFiniteNumber(value);
export const isOptionalBoolean = (value: unknown): boolean => value === undefined || typeof value === 'boolean';
export const isCount = (value: unknown): value is number => isFiniteNumber(value) && Number.isInteger(value) && value >= 0;
export const isDateTime = (value: unknown): value is string => isString(value) && Number.isFinite(Date.parse(value));
export const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString);
export const isCountRecord = (value: unknown): value is Record<string, number> => isRecord(value) && Object.values(value).every(isCount);
export const countTotal = (value: Record<string, number>): number => Object.values(value).reduce((total, count) => total + count, 0);
export const hasOptionalStrings = (value: JsonRecord, keys: readonly string[]): boolean => keys.every(key => isOptionalString(value[key]));
export const hasOptionalNumbers = (value: JsonRecord, keys: readonly string[]): boolean => keys.every(key => isOptionalFiniteNumber(value[key]));

export const isBoundedRows = <T>(value: unknown, limit: number, isRow: (row: unknown) => row is T): value is ReportBoundedRows<T> => {
  if (!isRecord(value) || !isCount(value.totalCount) || !isCount(value.omittedCount) || !Array.isArray(value.rows)) return false;
  return value.rows.length <= limit && value.rows.every(isRow) && value.totalCount === value.rows.length + value.omittedCount;
};

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

export const isCostSummary = (value: unknown): boolean => {
  if (!isRecord(value) || !isRecord(value.sourceMetadata) || !Array.isArray(value.topSpendResources)) return false;
  if (
    !hasOptionalStrings(value, ['currency', 'currencySymbol']) ||
    !hasOptionalNumbers(value, ['spend30Days', 'spend30DaysAmortized', 'totalRetailCost', 'miscCost', 'rollingCostRecordCount']) ||
    (value.budget !== undefined && !isRecord(value.budget)) ||
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
