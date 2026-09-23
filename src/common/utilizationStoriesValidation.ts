/**
 * Dependency-free structural guards for the utilization stories contract family.
 *
 * Rules enforced (see `Specs/reporting/utilization-stories-types-package.md`):
 * - enum fields (`role`, `visual`, `verdict`, `scheduleFit`, `telemetry`, `storyKey`, `cell`, ...) are in their unions;
 * - sparkline arrays (`avg`/`p95`/`max`, signal sparklines) have equal length, equal to the window days where known;
 * - `weekly.running` / `weekly.usage` are 7 x 24 when present;
 * - bounded sections satisfy `rows.length <= limit` and `omittedCount === totalCount - rows.length`; the only exception is an
 *   artifact marked `view: 'summary'` (a reader's projection), whose sections carry `rows: []` with the produced counts;
 * - `columns[].priority` is an integer 1–5, and every row carries a cell per column whose `kind` matches `column.cell`;
 * - a schedule fit of good|fair|low, or a `mostly-off` verdict, requires a corroborated running basis (an independent source,
 *   never the basis itself) and collected telemetry — on profiles and on the compact signal alike;
 * - every row of an artifact belongs to the artifact's scope (company, tenant, subscription);
 * - `MetricStats` carries every required field of the shared shape;
 * - row validation depends on the story key: an oversized row must carry a valid `profile`, a resilience row a valid
 *   `protection`, a right-SKU row valid `current`/`options`, and so on;
 * - a row with `actionable: false` publishes no saving; a `blocked-by-commitment` Right SKU verdict carries a valid
 *   `commitmentBlock` (and only that verdict does), publishes no saving and is never `actionable: true`;
 * - `summary.actionable`, when present, is a count no greater than `counts.resources`.
 *
 * Guards accept additive (unknown) fields and never throw.
 */
import type { MetricStats } from './metricStats';
import type { ReportBoundedRows } from './boundedRows';
import { isBoundedRows, isCount, isDateTime, isFiniteNumber, isRecord, isString, isStringArray, type JsonRecord } from './validationHelpers';
import {
  STORY_KEYS,
  STORY_LIMITS,
  type CapacityDescriptor,
  type CapacityScalingDescriptor,
  type CommitmentBenefit,
  type CommitmentBlock,
  type CommitmentCoverage,
  type CommitmentRow,
  type EvidenceWindow,
  type HybridBenefitRow,
  type MetricSparkline,
  type OversizedResourceRow,
  type ProtectionCapability,
  type ProtectionProfile,
  type ReportingStories,
  type ResilienceProfileConfig,
  type ResilienceRow,
  type RightSizeRejection,
  type RightSkuRow,
  type RunningProfile,
  type ScheduleCandidateRow,
  type SkuOption,
  type SkuOptionSummary,
  type SkuProjectedUsage,
  type StoryArtifact,
  type StoryCell,
  type StoryColumn,
  type StoryFingerprint,
  type StoryKey,
  type StoryRowBase,
  type StorySample,
  type StorySection,
  type StorySummary,
  type UtilizationMetricEntry,
  type UtilizationProfile,
  type UtilizationProfileConfig,
  type UtilizationProfileEntry,
  type UtilizationSignal,
} from './utilizationStories';

const PROVIDERS = new Set(['azure', 'aws']);
const METRIC_ROLES = new Set(['primary', 'secondary', 'context']);
const DIMENSION_POLICIES = new Set(['average', 'sum', 'max', 'split']);
const METRIC_VISUALS = new Set(['sparkline', 'trend', 'capacity-bar', 'mix-bar', 'event-strip']);
const BILLED_ON = new Set(['allocated', 'used', 'included']);
const AXIS_MAX_SOURCES = new Set(['config', 'capacity', 'observed']);
const SCALE_MODES = new Set(['fixed', 'autoscale', 'serverless']);
const RUN_MODES = new Set(['stop-start', 'auto-pause', 'scale-to-zero', 'always-on']);
const RUNNING_BASES = new Set(['power-state', 'billing-hours', 'metric-presence']);
const SIZING_VERDICTS = new Set(['oversized', 'undersized', 'busy', 'rebalance', 'mostly-off', 'idle', 'no-telemetry', 'fits', 'unknown']);
const SCHEDULE_FITS = new Set(['good', 'fair', 'low', 'done', 'insufficient-data', 'not-applicable']);
const SCHEDULE_FITS_REQUIRING_CORROBORATION = new Set(['good', 'fair', 'low']);
const SCHEDULE_ACTIONS = new Set(['stop', 'pause', 'scale']);
const TELEMETRY_STATUSES = new Set(['collected', 'partial', 'no-series', 'unavailable']);
const CONFIDENCES = new Set(['high', 'medium', 'low']);
const BENEFIT_TYPES = new Set(['reservation', 'savings-plan']);
const SKU_OPTION_KINDS = new Set(['same-shape', 'fits-usage', 'trade-off', 'cross-platform']);
const SKU_CAPABILITY_SEVERITIES = new Set(['info', 'warning', 'unknown']);
const SKU_CAPABILITY_BASES = new Set(['sku-capability', 'current-setting', 'active-vcpu-capability', 'unknown']);
const SKU_CAPABILITY_MATERIALITIES = new Set(['used', 'not-used', 'unknown']);
const RIGHT_SIZE_ASSESSMENT_STATUSES = new Set(['recommended', 'no-change', 'insufficient-data', 'not-supported']);
const CAPABILITY_STATES = new Set(['enabled', 'disabled', 'partial', 'unknown', 'not-applicable']);
const RIGHT_SKU_VERDICTS = new Set(['modernise', 'downsize', 'consider', 'keep', 'blocked-by-commitment']);
const SKU_SAVINGS_BASES = new Set(['list', 'billed']);
const COMMITMENT_BLOCK_REASONS = new Set(['reservation', 'cost-not-lower']);
const RIGHT_SIZE_REJECTION_REASONS = new Set(['observed-fit', 'no-saving']);
const BACKUP_RUN_STATES = new Set(['ok', 'failed', null]);
const STORY_KEY_SET = new Set<string>(STORY_KEYS);
const STORY_CELL_KINDS = new Set([
  'text',
  'number',
  'money',
  'percent',
  'mark',
  'dot',
  'sparkline',
  'dual',
  'capacity-bar',
  'mix-bar',
  'event-strip',
  'weekly-grid',
]);
const SERIES_ROLES = new Set(['primary', 'secondary']);
const STATUS_TONES = new Set(['good', 'warn', 'bad', 'neutral', 'muted']);
const COLUMN_ROLE_CLASSES = new Set(['res', 'prim', 'sec', 'nums', 'cap', 'read', 'cost', 'save', 'dual']);
const PRODUCERS = new Set(['parser', 'strategy']);

const isNullableNumber = (value: unknown): value is number | null => value === null || isFiniteNumber(value);
const isOptionalNullableNumber = (value: unknown): boolean => value === undefined || isNullableNumber(value);
const isNullableString = (value: unknown): value is string | null => value === null || isString(value);
const isNullableInteger = (value: unknown): value is number | null => value === null || (isFiniteNumber(value) && Number.isInteger(value));
const isText = (value: unknown): value is string => typeof value === 'string';
const isOptionalText = (value: unknown): boolean => value === undefined || isText(value);
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isNullableSeries = (value: unknown): value is (number | null)[] => Array.isArray(value) && value.every(isNullableNumber);
const isPercentage = (value: unknown): value is number => isFiniteNumber(value) && value >= 0 && value <= 100;
const isNullablePercentage = (value: unknown): value is number | null => value === null || isPercentage(value);
const isPriority = (value: unknown): value is 1 | 2 | 3 | 4 | 5 => isCount(value) && value >= 1 && value <= 5;
const isStringRecord = (value: unknown): value is Record<string, string> => isRecord(value) && Object.values(value).every(isText);
const isNumberRecord = (value: unknown): value is Record<string, number> => isRecord(value) && Object.values(value).every(isFiniteNumber);
const inSet = (set: Set<unknown>, value: unknown): boolean => set.has(value);

const isWeeklyGrid = (value: unknown): value is (number | null)[][] =>
  Array.isArray(value) &&
  value.length === STORY_LIMITS.weeklyGridDays &&
  value.every(day => isNullableSeries(day) && day.length === STORY_LIMITS.weeklyGridHours);

const METRIC_STATS_FIELDS = [
  'average',
  'median',
  'p50',
  'p75',
  'p90',
  'p95',
  'p99',
  'min',
  'max',
  'frequency',
  'trend',
  'variance',
  'count',
  'totalDataPoints',
  'runningDataPoints',
  'nonRunningDataPoints',
  'runningTimePercentage',
  'longestRunningStreak',
  'longestDowntimeStreak',
  'averageUptimeStreak',
  'averageDowntimeStreak',
] as const;
const METRIC_STATS_OPTIONAL_FIELDS = ['uptime', 'peakHours', 'offPeakHours'] as const;

const isMetricStats = (value: unknown): value is MetricStats =>
  isRecord(value) &&
  METRIC_STATS_FIELDS.every(key => isFiniteNumber(value[key])) &&
  METRIC_STATS_OPTIONAL_FIELDS.every(key => value[key] === undefined || isFiniteNumber(value[key]));

export const isMetricSparkline = (value: unknown, days?: number): value is MetricSparkline => {
  if (!isRecord(value) || !isString(value.key) || !isString(value.metricName)) return false;
  if (!inSet(METRIC_ROLES, value.role) || !inSet(METRIC_VISUALS, value.visual) || !isText(value.unit)) return false;
  if (!isNullableNumber(value.axisMax) || (value.axisMaxSource !== undefined && !inSet(AXIS_MAX_SOURCES, value.axisMaxSource))) return false;
  if (value.billedOn !== undefined && !inSet(BILLED_ON, value.billedOn)) return false;
  if (
    value.dimensions !== undefined &&
    (!isRecord(value.dimensions) ||
      !inSet(DIMENSION_POLICIES, value.dimensions.policy) ||
      !isOptionalText(value.dimensions.name) ||
      !isOptionalText(value.dimensions.value) ||
      !isCount(value.dimensions.seriesCount))
  )
    return false;
  if (!isDateTime(value.start) || value.bucket !== 'P1D') return false;
  if (!isNullableSeries(value.avg) || !isNullableSeries(value.p95) || !isNullableSeries(value.max)) return false;
  if (value.avg.length !== value.p95.length || value.avg.length !== value.max.length) return false;
  if (days !== undefined && value.avg.length !== days) return false;
  return isMetricStats(value.stats) && isCount(value.sourcePoints);
};

export const isCapacityScalingDescriptor = (value: unknown): value is CapacityScalingDescriptor => {
  if (!isRecord(value) || !(value.autoscaleEnabled === null || isBoolean(value.autoscaleEnabled))) return false;
  if (
    !isNullableNumber(value.minimumUnits) ||
    !isNullableNumber(value.defaultUnits) ||
    !isNullableNumber(value.maximumUnits) ||
    !isNullableString(value.source)
  )
    return false;

  const minimum = value.minimumUnits;
  const defaultUnits = value.defaultUnits;
  const maximum = value.maximumUnits;
  if ([minimum, defaultUnits, maximum].some(units => units !== null && units < 0)) return false;
  if (minimum !== null && maximum !== null && minimum > maximum) return false;
  if (defaultUnits !== null && minimum !== null && defaultUnits < minimum) return false;
  if (defaultUnits !== null && maximum !== null && defaultUnits > maximum) return false;
  return true;
};

export const isCapacityDescriptor = (value: unknown): value is CapacityDescriptor => {
  if (
    !isRecord(value) ||
    !isNullableString(value.sku) ||
    !isNullableString(value.tier) ||
    !isNullableNumber(value.units) ||
    !isText(value.unitName) ||
    !isOptionalNullableNumber(value.memoryGB) ||
    !inSet(SCALE_MODES, value.scaleMode) ||
    !isText(value.label)
  )
    return false;
  if (value.scaling === undefined) return true;
  if (!isCapacityScalingDescriptor(value.scaling)) return false;
  if (value.scaling.autoscaleEnabled === true && value.scaleMode !== 'autoscale') return false;
  if (value.scaling.autoscaleEnabled === false && value.scaleMode !== 'fixed') return false;
  return true;
};

const isHourShare = (value: unknown): boolean => isRecord(value) && isNullableNumber(value.runningShare) && isNullableNumber(value.usageMean);

export const isRunningProfile = (value: unknown, days?: number): value is RunningProfile => {
  if (!isRecord(value) || !isString(value.signalMetric) || !inSet(RUNNING_BASES, value.basis)) return false;
  if (!Array.isArray(value.corroboration) || !value.corroboration.every(basis => inSet(RUNNING_BASES, basis))) return false;
  if (value.corroboration.includes(value.basis)) return false;
  if (!isNullableSeries(value.daily) || (days !== undefined && value.daily.length !== days) || !isNullableNumber(value.share)) return false;
  if (value.weekly === undefined) return true;
  const weekly = value.weekly;
  return (
    isRecord(weekly) &&
    isString(weekly.timezone) &&
    isWeeklyGrid(weekly.running) &&
    isWeeklyGrid(weekly.usage) &&
    isHourShare(weekly.businessHours) &&
    isHourShare(weekly.offHours)
  );
};

/** A running signal derived from metric presence alone is not evidence of stopped time; it needs an independent source. */
export const isCorroboratedRunningProfile = (value: RunningProfile): boolean =>
  value.basis !== 'metric-presence' || value.corroboration.some(basis => basis !== 'metric-presence');

export const isCommitmentBenefit = (value: unknown): value is CommitmentBenefit =>
  isRecord(value) &&
  isNullableString(value.benefitId) &&
  isNullableString(value.benefitName) &&
  (value.benefitId !== null || value.benefitName !== null) &&
  inSet(BENEFIT_TYPES, value.benefitType) &&
  isNullableString(value.status) &&
  isNullableString(value.expiryDate) &&
  (value.expiryDate === null || isDateTime(value.expiryDate)) &&
  isNullableInteger(value.daysToExpiry) &&
  (value.expiryDate !== null || value.daysToExpiry === null);

export const isCommitmentCoverage = (value: unknown): value is CommitmentCoverage =>
  isRecord(value) &&
  isNullableNumber(value.coveragePercent) &&
  Array.isArray(value.benefitTypes) &&
  value.benefitTypes.every(type => inSet(BENEFIT_TYPES, type)) &&
  Array.isArray(value.benefitNames) &&
  value.benefitNames.every(isText) &&
  (value.benefits === undefined || (Array.isArray(value.benefits) && value.benefits.every(isCommitmentBenefit))) &&
  isNullableNumber(value.coveredCost) &&
  isNullableNumber(value.uncoveredCost) &&
  isDateTime(value.windowStart) &&
  isDateTime(value.windowEnd);

export const isEvidenceWindow = (value: unknown): value is EvidenceWindow =>
  isRecord(value) &&
  isDateTime(value.windowStart) &&
  isDateTime(value.windowEnd) &&
  isCount(value.days) &&
  isCount(value.sampleCount) &&
  inSet(TELEMETRY_STATUSES, value.telemetry) &&
  inSet(CONFIDENCES, value.confidence);

const isVerdictReason = (value: unknown): boolean =>
  isRecord(value) && isString(value.rule) && isRecord(value.values) && Object.values(value.values).every(isNullableNumber);

/** Optional basis and billed figure: a billed-basis summary's `billedSavingsPercent` must equal its `savingsPercent`. */
export const isSkuOptionSummary = (value: unknown): value is SkuOptionSummary =>
  isRecord(value) &&
  inSet(SKU_OPTION_KINDS, value.kind) &&
  isString(value.label) &&
  isNullableNumber(value.savingsPercent) &&
  (value.savingsBasis === undefined || inSet(SKU_SAVINGS_BASES, value.savingsBasis)) &&
  (value.billedSavingsPercent === undefined || isNullablePercentage(value.billedSavingsPercent)) &&
  (value.savingsBasis !== 'billed' || value.billedSavingsPercent === undefined || Object.is(value.billedSavingsPercent, value.savingsPercent));

/** An estimate marker plus at least one non-negative projected p95 percentage (may exceed 100). */
export const isSkuProjectedUsage = (value: unknown): value is SkuProjectedUsage =>
  isRecord(value) &&
  value.estimate === true &&
  (value.cpuP95 !== undefined || value.memoryP95 !== undefined) &&
  [value.cpuP95, value.memoryP95].every(p95 => p95 === undefined || (isFiniteNumber(p95) && p95 >= 0));

export const isCommitmentBlock = (value: unknown): value is CommitmentBlock =>
  isRecord(value) &&
  inSet(COMMITMENT_BLOCK_REASONS, value.reason) &&
  isNullablePercentage(value.coveragePercent) &&
  isNullableString(value.benefitName) &&
  (value.expiryDate === null || isDateTime(value.expiryDate)) &&
  isOptionalNullableNumber(value.expectedOptionCost) &&
  isOptionalNullableNumber(value.billedSpend);

export const isRightSizeRejection = (value: unknown): value is RightSizeRejection =>
  isRecord(value) && inSet(RIGHT_SIZE_REJECTION_REASONS, value.reason) && isString(value.sku);

const isSkuCapabilityScalar = (value: unknown): boolean => value === null || isText(value) || isFiniteNumber(value) || isBoolean(value);

const isSkuCapabilityValue = (value: unknown): boolean =>
  isSkuCapabilityScalar(value) || (Array.isArray(value) && value.every(isSkuCapabilityScalar));

const isSkuCapabilityImpact = (value: unknown): boolean =>
  isRecord(value) &&
  isString(value.key) &&
  isOptionalText(value.label) &&
  inSet(SKU_CAPABILITY_SEVERITIES, value.severity) &&
  inSet(SKU_CAPABILITY_BASES, value.basis) &&
  inSet(SKU_CAPABILITY_MATERIALITIES, value.materiality) &&
  (value.currentValue === undefined || isSkuCapabilityValue(value.currentValue)) &&
  (value.alternativeValue === undefined || isSkuCapabilityValue(value.alternativeValue)) &&
  isOptionalText(value.message);

export const isSkuOption = (value: unknown): value is SkuOption =>
  isRecord(value) &&
  inSet(SKU_OPTION_KINDS, value.kind) &&
  isString(value.sku) &&
  isString(value.label) &&
  (value.capacity === undefined ||
    (isRecord(value.capacity) && isNullableNumber(value.capacity.units) && isOptionalNullableNumber(value.capacity.memoryGB))) &&
  isNullableNumber(value.monthlyCost) &&
  isString(value.currency) &&
  isNullableNumber(value.savingsPercent) &&
  isNullableNumber(value.savingsMonthly) &&
  isStringArray(value.lostCapabilities) &&
  (value.capabilityImpacts === undefined ||
    (Array.isArray(value.capabilityImpacts) &&
      value.capabilityImpacts.every(isSkuCapabilityImpact) &&
      new Set(value.capabilityImpacts.map(impact => (impact as JsonRecord).key)).size === value.capabilityImpacts.length)) &&
  (value.confidence === undefined || inSet(CONFIDENCES, value.confidence)) &&
  (value.savingsBasis === undefined || inSet(SKU_SAVINGS_BASES, value.savingsBasis)) &&
  (value.projected === undefined || isSkuProjectedUsage(value.projected));

export const isUtilizationProfile = (value: unknown, days?: number): value is UtilizationProfile => {
  if (!isRecord(value) || !inSet(PROVIDERS, value.provider) || !isString(value.family) || !isCapacityDescriptor(value.capacity)) return false;
  if (!inSet(RUN_MODES, value.runMode) || !inSet(SIZING_VERDICTS, value.verdict) || !inSet(SCHEDULE_FITS, value.scheduleFit)) return false;
  if (!isEvidenceWindow(value.evidenceWindow) || !isString(value.fingerprint)) return false;
  const evidenceWindow = value.evidenceWindow as EvidenceWindow;
  const windowDays = days ?? evidenceWindow.days;
  if (!Array.isArray(value.metrics) || !value.metrics.every(metric => isMetricSparkline(metric, windowDays))) return false;
  if (value.running !== undefined && !isRunningProfile(value.running, windowDays)) return false;
  if (!Array.isArray(value.verdictReasons) || !value.verdictReasons.every(isVerdictReason) || !isStringArray(value.evidence)) return false;
  if (value.scheduleAction !== undefined && !inSet(SCHEDULE_ACTIONS, value.scheduleAction)) return false;
  if (value.coverage !== undefined && !isCommitmentCoverage(value.coverage)) return false;
  if (value.ownerResourceId !== undefined && !isString(value.ownerResourceId)) return false;
  const needsCorroboration = inSet(SCHEDULE_FITS_REQUIRING_CORROBORATION, value.scheduleFit) || value.verdict === 'mostly-off';
  if (needsCorroboration) {
    if (evidenceWindow.telemetry !== 'collected') return false;
    if (value.running === undefined || !isCorroboratedRunningProfile(value.running)) return false;
  }
  return true;
};

const isSignalSeries = (value: unknown): boolean =>
  isRecord(value) && isString(value.key) && isNullableNumber(value.p95) && isNullableSeries(value.sparkline);

export const isUtilizationSignal = (value: unknown): value is UtilizationSignal => {
  if (!isRecord(value) || !inSet(SIZING_VERDICTS, value.verdict) || !inSet(SCHEDULE_FITS, value.scheduleFit)) return false;
  if (!isSignalSeries(value.primary) || !inSet(TELEMETRY_STATUSES, value.telemetry)) return false;
  const actionable = inSet(SCHEDULE_FITS_REQUIRING_CORROBORATION, value.scheduleFit) || value.verdict === 'mostly-off';
  if (actionable && value.telemetry !== 'collected') return false;
  if (value.secondary !== undefined) {
    if (!isSignalSeries(value.secondary)) return false;
    const primaryLength = ((value.primary as JsonRecord).sparkline as unknown[]).length;
    if (((value.secondary as JsonRecord).sparkline as unknown[]).length !== primaryLength) return false;
  }
  if (
    value.coverage !== undefined &&
    (!isRecord(value.coverage) ||
      !isNullableNumber(value.coverage.coveragePercent) ||
      !Array.isArray(value.coverage.benefitTypes) ||
      !value.coverage.benefitTypes.every(type => inSet(BENEFIT_TYPES, type)))
  )
    return false;
  return value.betterSku === undefined || isSkuOptionSummary(value.betterSku);
};

const isCapabilityDetails = (value: unknown): boolean =>
  isRecord(value) && Object.values(value).every(detail => detail === null || isText(detail) || isFiniteNumber(detail) || isBoolean(detail));

export const isProtectionCapability = (value: unknown): value is ProtectionCapability =>
  isRecord(value) &&
  isString(value.key) &&
  inSet(CAPABILITY_STATES, value.state) &&
  isBoolean(value.required) &&
  isText(value.label) &&
  (value.details === undefined || isCapabilityDetails(value.details)) &&
  isOptionalNullableNumber(value.costIfEnabled) &&
  isRecord(value.evidence) &&
  isString(value.evidence.source) &&
  (value.evidence.observedAt === undefined || value.evidence.observedAt === null || isDateTime(value.evidence.observedAt));

export const isProtectionProfile = (value: unknown): value is ProtectionProfile =>
  isRecord(value) &&
  inSet(PROVIDERS, value.provider) &&
  Array.isArray(value.capabilities) &&
  value.capabilities.every(isProtectionCapability) &&
  isStringArray(value.missingRequired) &&
  isOptionalNullableNumber(value.slaPercent);

// ---- Cells

const isSparklineCell = (value: JsonRecord): boolean =>
  inSet(SERIES_ROLES, value.role) &&
  isNullableSeries(value.values) &&
  isNullableNumber(value.axisMax) &&
  isText(value.unit) &&
  isNullableNumber(value.p95) &&
  isText(value.label);

export const isStoryCell = (value: unknown): value is StoryCell => {
  if (!isRecord(value) || !inSet(STORY_CELL_KINDS, value.kind)) return false;
  switch (value.kind) {
    case 'text':
      return (value.value === null || isText(value.value)) && (value.detail === undefined || value.detail === null || isText(value.detail));
    case 'number':
      return isNullableNumber(value.value) && isOptionalText(value.unit) && (value.decimals === undefined || isCount(value.decimals));
    case 'money':
      return (
        isNullableNumber(value.value) &&
        isString(value.currency) &&
        (value.secondaryValue === undefined || isNullableNumber(value.secondaryValue)) &&
        isOptionalText(value.secondaryLabel)
      );
    case 'percent':
      return isNullableNumber(value.value);
    case 'mark':
      return (
        isString(value.state) && isText(value.label) && inSet(STATUS_TONES, value.tone) && isOptionalText(value.icon) && isOptionalText(value.hint)
      );
    case 'dot':
      return isBoolean(value.present) && inSet(STATUS_TONES, value.tone) && isOptionalText(value.label) && isOptionalText(value.hint);
    case 'sparkline':
      return isSparklineCell(value);
    case 'dual':
      return (
        isRecord(value.primary) &&
        value.primary.kind === 'sparkline' &&
        isSparklineCell(value.primary) &&
        (value.secondary === null ||
          (isRecord(value.secondary) &&
            value.secondary.kind === 'sparkline' &&
            isSparklineCell(value.secondary) &&
            (value.secondary.values as unknown[]).length === (value.primary.values as unknown[]).length))
      );
    case 'capacity-bar':
      return isNullableNumber(value.used) && isNullableNumber(value.total) && isText(value.unit) && isText(value.label);
    case 'mix-bar':
      return (
        Array.isArray(value.parts) &&
        value.parts.every(part => isRecord(part) && isString(part.key) && isText(part.label) && isFiniteNumber(part.value)) &&
        isText(value.unit) &&
        isFiniteNumber(value.total)
      );
    case 'event-strip':
      return (
        Array.isArray(value.events) &&
        value.events.every(event => inSet(BACKUP_RUN_STATES, event)) &&
        isDateTime(value.start) &&
        isOptionalText(value.label)
      );
    case 'weekly-grid':
      return (
        isString(value.timezone) && isWeeklyGrid(value.running) && isNullableNumber(value.businessHoursShare) && isNullableNumber(value.offHoursShare)
      );
    default:
      return false;
  }
};

export const isStoryColumn = (value: unknown): value is StoryColumn =>
  isRecord(value) &&
  isString(value.key) &&
  isText(value.label) &&
  inSet(STORY_CELL_KINDS, value.cell) &&
  isPriority(value.priority) &&
  (value.roleClass === undefined || inSet(COLUMN_ROLE_CLASSES, value.roleClass)) &&
  isOptionalText(value.hint);

/** Every column has a cell on the row, and the cell's kind matches the column's renderer. */
export const hasCellsForColumns = (row: StoryRowBase, columns: StoryColumn[]): boolean =>
  columns.every(column => {
    const cell = row.cells[column.key];
    return cell !== undefined && cell.kind === column.cell;
  });

// ---- Rows

/** Re-widen a narrowed row so story-specific fields can be inspected without index-signature casts. */
const fields = (value: unknown): JsonRecord => value as JsonRecord;

const isStoryRowBase = (value: unknown): value is StoryRowBase =>
  isRecord(value) &&
  ['resourceId', 'name', 'type', 'subscriptionId', 'tenantId', 'companyId', 'currency', 'fingerprint'].every(key => isString(value[key])) &&
  isText(value.location) &&
  isNullableNumber(value.spend30d) &&
  isNullableNumber(value.savingsMax) &&
  (value.ownerResourceId === undefined || isString(value.ownerResourceId)) &&
  (value.actionable === undefined || isBoolean(value.actionable)) &&
  // An informational row asks for nothing, so it publishes no saving.
  (value.actionable !== false || value.savingsMax === null) &&
  isRecord(value.cells) &&
  Object.values(value.cells).every(isStoryCell);

export const isOversizedResourceRow = (value: unknown, days?: number): value is OversizedResourceRow => {
  if (!isStoryRowBase(value)) return false;
  const row = fields(value);
  if (!isUtilizationProfile(row.profile, days) || (row.betterSku !== undefined && !isSkuOptionSummary(row.betterSku))) return false;
  if (row.recommendedOption !== undefined && !isSkuOption(row.recommendedOption)) return false;
  if (row.rightSizeStatus !== undefined && !inSet(RIGHT_SIZE_ASSESSMENT_STATUSES, row.rightSizeStatus)) return false;
  const hasRecommendation = row.betterSku !== undefined || row.recommendedOption !== undefined;
  if (row.rightSizeStatus === 'recommended' && !hasRecommendation) return false;
  if (row.rightSizeStatus !== undefined && row.rightSizeStatus !== 'recommended' && hasRecommendation) return false;
  if (row.betterSku !== undefined && row.recommendedOption !== undefined) {
    const summary = row.betterSku as SkuOptionSummary;
    const option = row.recommendedOption as SkuOption;
    if (summary.kind !== option.kind || summary.label !== option.label || !Object.is(summary.savingsPercent, option.savingsPercent)) return false;
    if (summary.savingsBasis !== undefined && option.savingsBasis !== undefined && summary.savingsBasis !== option.savingsBasis) return false;
  }
  if (row.rightSizeRejection !== undefined && (!isRightSizeRejection(row.rightSizeRejection) || hasRecommendation)) return false;
  // A blocked resize is still the recommended size, but it cannot lower the bill now: no saving, never actionable.
  if (row.commitmentBlock !== undefined) {
    if (!isCommitmentBlock(row.commitmentBlock) || !hasRecommendation || row.savingsMax !== null || row.actionable === true) return false;
  }
  return true;
};

/** `blocked-by-commitment` and `commitmentBlock` go together; a blocked row publishes no saving and is not actionable. */
const isCoherentCommitmentBlock = (row: JsonRecord): boolean => {
  const blocked = row.verdict === 'blocked-by-commitment';
  if (!blocked) return row.commitmentBlock === undefined;
  return isCommitmentBlock(row.commitmentBlock) && row.savingsMax === null && row.actionable !== true;
};

export const isRightSkuRow = (value: unknown, days?: number): value is RightSkuRow => {
  if (!isStoryRowBase(value)) return false;
  const row = fields(value);
  return (
    isSkuOption(row.current) &&
    Array.isArray(row.options) &&
    row.options.every(isSkuOption) &&
    inSet(RIGHT_SKU_VERDICTS, row.verdict) &&
    isRecord(row.usage) &&
    isNullableNumber(row.usage.primaryP95) &&
    isNullableNumber(row.usage.secondaryP95) &&
    inSet(TELEMETRY_STATUSES, row.usage.telemetry) &&
    (row.profile === undefined || isUtilizationProfile(row.profile, days)) &&
    isCoherentCommitmentBlock(row)
  );
};

/** Schedule candidates always carry a corroborated weekly running profile. */
export const isScheduleCandidateRow = (value: unknown, days?: number): value is ScheduleCandidateRow => {
  if (!isStoryRowBase(value)) return false;
  const row = fields(value);
  if (!isUtilizationProfile(row.profile, days) || !inSet(SCHEDULE_ACTIONS, row.action)) return false;
  const profile = row.profile as UtilizationProfile;
  return profile.running !== undefined && profile.running.weekly !== undefined && isCorroboratedRunningProfile(profile.running);
};

export const isResilienceRow = (value: unknown): value is ResilienceRow => {
  if (!isStoryRowBase(value)) return false;
  const row = fields(value);
  return (
    isProtectionProfile(row.protection) &&
    (row.backupRuns === undefined || (Array.isArray(row.backupRuns) && row.backupRuns.every(run => inSet(BACKUP_RUN_STATES, run)))) &&
    (row.lastRecoveryPointAt === undefined || row.lastRecoveryPointAt === null || isDateTime(row.lastRecoveryPointAt)) &&
    isOptionalNullableNumber(row.uptimeDays) &&
    (row.activeHealthEvents === undefined || isCount(row.activeHealthEvents))
  );
};

export const isHybridBenefitRow = (value: unknown): value is HybridBenefitRow => {
  if (!isStoryRowBase(value)) return false;
  const row = fields(value);
  return (
    ['productFamily', 'serviceModel', 'configurationStatus', 'technicalEligibilityStatus', 'coverageStatus', 'entitlementStatus'].every(key =>
      isString(row[key])
    ) &&
    isNullableString(row.edition) &&
    isNullableNumber(row.vCpuCount) &&
    isRecord(row.decision) &&
    isString(row.decision.status) &&
    isText(row.decision.headline) &&
    isNullableNumber(row.decision.paybackMonths) &&
    isString(row.decision.confidence) &&
    isStringArray(row.reasonCodes) &&
    isNullableNumber(row.licenceObservedStableDays)
  );
};

export const isCommitmentRow = (value: unknown): value is CommitmentRow => {
  if (!isStoryRowBase(value)) return false;
  const row = fields(value);
  return (
    isCommitmentCoverage(row.coverage) &&
    (row.utilization === undefined || (isRecord(row.utilization) && isString(row.utilization.primaryKey) && isNullableNumber(row.utilization.p95)))
  );
};

/** Row guard for a story key; unknown keys reject every row. */
export const storyRowGuard = (storyKey: string, days?: number): ((row: unknown) => row is StoryRowBase) => {
  switch (storyKey) {
    case 'oversized-resources':
      return (row: unknown): row is StoryRowBase => isOversizedResourceRow(row, days);
    case 'right-sku':
      return (row: unknown): row is StoryRowBase => isRightSkuRow(row, days);
    case 'schedule-candidates':
      return (row: unknown): row is StoryRowBase => isScheduleCandidateRow(row, days);
    case 'resilience-recovery':
      return isResilienceRow;
    case 'hybrid-benefit':
      return isHybridBenefitRow;
    case 'commitments':
      return isCommitmentRow;
    default:
      return (_row: unknown): _row is StoryRowBase => false;
  }
};

export const isStorySummary = (value: unknown): value is StorySummary =>
  isRecord(value) &&
  isRecord(value.counts) &&
  Object.values(value.counts).every(isCount) &&
  (value.actionable === undefined ||
    (isCount(value.actionable) && (value.counts.resources === undefined || value.actionable <= (value.counts.resources as number)))) &&
  isNumberRecord(value.spend) &&
  isString(value.currency) &&
  isOptionalText(value.note);

const isStorySectionFinancials = (value: unknown): boolean =>
  value === undefined || (isRecord(value) && isFiniteNumber(value.spend30d) && isFiniteNumber(value.savingsMax) && isString(value.currency));

export const isStorySection = (value: unknown, storyKey: string, limit: number, days?: number): value is StorySection<StoryRowBase> => {
  if (!isRecord(value) || !isString(value.resourceType) || !isString(value.family)) return false;
  if (!isStorySectionFinancials(value.financials)) return false;
  if (!Array.isArray(value.columns) || !value.columns.every(isStoryColumn)) return false;
  if (new Set((value.columns as StoryColumn[]).map(column => column.key)).size !== value.columns.length) return false;
  if (!isBoundedRows(value, limit, storyRowGuard(storyKey, days))) return false;
  const columns = value.columns as StoryColumn[];
  return (value.rows as StoryRowBase[]).every(row => hasCellsForColumns(row, columns));
};

/**
 * A section of a summary-view projection (`view: 'summary'`): the produced columns and counts with the rows removed,
 * so `rows` must be empty while `totalCount` / `omittedCount` keep the values the engine wrote.
 */
export const isStorySummarySection = (value: unknown): value is StorySection<StoryRowBase> => {
  if (!isRecord(value) || !isString(value.resourceType) || !isString(value.family)) return false;
  if (!isStorySectionFinancials(value.financials)) return false;
  if (!Array.isArray(value.columns) || !value.columns.every(isStoryColumn)) return false;
  if (new Set((value.columns as StoryColumn[]).map(column => column.key)).size !== value.columns.length) return false;
  return (
    Array.isArray(value.rows) &&
    value.rows.length === 0 &&
    isCount(value.totalCount) &&
    isCount(value.omittedCount) &&
    value.omittedCount <= value.totalCount &&
    value.totalCount - value.omittedCount <= STORY_LIMITS.sectionRows
  );
};

/** Every row of an artifact belongs to the artifact's scope; a row from another company, tenant or subscription is rejected. */
export const isRowInScope = (row: StoryRowBase, scope: { companyId: string; tenantId: string; subscriptionId: string }): boolean =>
  row.companyId === scope.companyId && row.tenantId === scope.tenantId && row.subscriptionId === scope.subscriptionId;

const sectionFinancialsMatchCurrency = (sections: StorySection<StoryRowBase>[], currency: string): boolean =>
  sections.every(section => section.financials === undefined || section.financials.currency === currency);

const isScope = (value: unknown): boolean =>
  isRecord(value) && ['companyId', 'tenantId', 'subscriptionId', 'currency'].every(key => isString(value[key])) && isText(value.displayName);

export const isStoryArtifact = (value: unknown, storyKey?: StoryKey): value is StoryArtifact<StoryRowBase> => {
  if (!isRecord(value) || !isString(value.storyKey) || !STORY_KEY_SET.has(value.storyKey)) return false;
  if (storyKey !== undefined && value.storyKey !== storyKey) return false;
  if (!isScope(value.scope)) return false;
  if (!isRecord(value.generation) || !isString(value.generation.sourceRunId) || !isDateTime(value.generation.generatedAt)) return false;
  if (
    !isRecord(value.window) ||
    !isDateTime(value.window.start) ||
    !isDateTime(value.window.end) ||
    !isCount(value.window.days) ||
    value.window.days < 1 ||
    !isString(value.window.timezone)
  )
    return false;
  if (!isStorySummary(value.summary)) return false;
  const days = value.window.days as number;
  const key = value.storyKey as string;
  if (value.view !== undefined && value.view !== 'summary') return false;
  const summaryCurrency = (value.summary as StorySummary).currency;
  if (value.view === 'summary') {
    return (
      Array.isArray(value.sections) &&
      value.sections.every(isStorySummarySection) &&
      sectionFinancialsMatchCurrency(value.sections as StorySection<StoryRowBase>[], summaryCurrency)
    );
  }
  if (!Array.isArray(value.sections) || !value.sections.every(section => isStorySection(section, key, STORY_LIMITS.sectionRows, days))) return false;
  const scope = value.scope as { companyId: string; tenantId: string; subscriptionId: string };
  const sections = value.sections as StorySection<StoryRowBase>[];
  return sectionFinancialsMatchCurrency(sections, summaryCurrency) && sections.every(section => section.rows.every(row => isRowInScope(row, scope)));
};

/** Bounded sample embedded in the evidence pack; rows are validated for `storyKey`, window days are not known here. */
export const isStorySample = (value: unknown, storyKey: StoryKey): value is StorySample<StoryRowBase> => {
  if (!isRecord(value) || !isStorySummary(value.summary) || !Array.isArray(value.sections)) return false;
  if (!value.sections.every(section => isStorySection(section, storyKey, STORY_LIMITS.sampleRows))) return false;
  return sectionFinancialsMatchCurrency(value.sections as StorySection<StoryRowBase>[], (value.summary as StorySummary).currency);
};

export const isStoryFingerprint = (value: unknown): value is StoryFingerprint =>
  isRecord(value) &&
  isString(value.storyKey) &&
  STORY_KEY_SET.has(value.storyKey) &&
  isString(value.resourceId) &&
  isString(value.fingerprint) &&
  isNullableNumber(value.savingsMax);

/** Bounded, de-duplicated (storyKey + fingerprint) fingerprint rows for one history period. */
export const isStoryFingerprintRows = (value: unknown): value is ReportBoundedRows<StoryFingerprint> =>
  isBoundedRows(value, STORY_LIMITS.historyFingerprints, isStoryFingerprint) &&
  new Set(value.rows.map(row => `${row.storyKey}|${row.fingerprint}`)).size === value.rows.length;

export const isReportingStories = (value: unknown): value is ReportingStories =>
  isRecord(value) && Object.entries(value).every(([key, sample]) => STORY_KEY_SET.has(key) && isStorySample(sample, key as StoryKey));

// ---- Engine config schemas

export const isUtilizationMetricEntry = (value: unknown): value is UtilizationMetricEntry =>
  isRecord(value) &&
  isString(value.key) &&
  isString(value.metricName) &&
  isOptionalText(value.collection) &&
  inSet(METRIC_ROLES, value.role) &&
  (value.visual === undefined || inSet(METRIC_VISUALS, value.visual)) &&
  isOptionalText(value.unit) &&
  (value.axisMax === undefined || isFiniteNumber(value.axisMax)) &&
  isOptionalText(value.axisMaxExpression) &&
  (value.billedOn === undefined || inSet(BILLED_ON, value.billedOn)) &&
  isOptionalText(value.transform) &&
  isOptionalText(value.requires) &&
  isOptionalText(value.when) &&
  (value.dimensions === undefined ||
    (isRecord(value.dimensions) && inSet(DIMENSION_POLICIES, value.dimensions.policy) && isOptionalText(value.dimensions.name))) &&
  (value.priority === undefined || isPriority(value.priority));

const isMetricEntries = (value: unknown): boolean => Array.isArray(value) && value.every(isUtilizationMetricEntry);

export const isUtilizationProfileEntry = (value: unknown): value is UtilizationProfileEntry =>
  isRecord(value) &&
  isString(value.family) &&
  (value.producer === undefined || inSet(PRODUCERS, value.producer)) &&
  isOptionalText(value.capacityLabel) &&
  inSet(RUN_MODES, value.runMode) &&
  (value.runningSignal === undefined || isNullableString(value.runningSignal)) &&
  (value.scheduleFit === undefined || isBoolean(value.scheduleFit) || inSet(SCHEDULE_ACTIONS, value.scheduleFit)) &&
  (value.variants === undefined ||
    (Array.isArray(value.variants) &&
      value.variants.every(
        variant =>
          isRecord(variant) &&
          isString(variant.when) &&
          isMetricEntries(variant.metrics) &&
          (variant.verdictRules === undefined || isStringRecord(variant.verdictRules))
      ))) &&
  (value.metrics === undefined || isMetricEntries(value.metrics)) &&
  (value.verdictRules === undefined || isStringRecord(value.verdictRules)) &&
  (value.skuAlternatives === undefined ||
    (isRecord(value.skuAlternatives) &&
      isString(value.skuAlternatives.source) &&
      (value.skuAlternatives.capabilityKeys === undefined || isStringArray(value.skuAlternatives.capabilityKeys))));

export const isUtilizationProfileConfig = (value: unknown): value is UtilizationProfileConfig =>
  isRecord(value) &&
  value.version === 1 &&
  isRecord(value.defaults) &&
  isCount(value.defaults.windowDays) &&
  value.defaults.windowDays >= 1 &&
  value.defaults.bucket === 'P1D' &&
  isBoolean(value.defaults.weeklyProfile) &&
  isStringRecord(value.defaults.verdictRules) &&
  isRecord(value.profiles) &&
  Object.entries(value.profiles).every(([type, entry]) => type === type.toLowerCase() && isUtilizationProfileEntry(entry));

export const isResilienceProfileConfig = (value: unknown): value is ResilienceProfileConfig =>
  isRecord(value) &&
  value.version === 1 &&
  isRecord(value.profiles) &&
  Object.entries(value.profiles).every(
    ([type, entry]) =>
      type === type.toLowerCase() &&
      isRecord(entry) &&
      Array.isArray(entry.capabilities) &&
      entry.capabilities.every(
        capability =>
          isRecord(capability) &&
          isString(capability.key) &&
          isBoolean(capability.required) &&
          isString(capability.source) &&
          isOptionalText(capability.sla)
      )
  );
