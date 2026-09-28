"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isResilienceProfileConfig = exports.isUtilizationProfileConfig = exports.isUtilizationProfileEntry = exports.isUtilizationMetricEntry = exports.isReportingStories = exports.isStoryFingerprintRows = exports.isStoryFingerprint = exports.isStorySample = exports.isStoryArtifact = exports.isRowInScope = exports.isStorySummarySection = exports.isStorySection = exports.isStorySummary = exports.storyRowGuard = exports.isCommitmentRow = exports.isHybridBenefitRow = exports.isResilienceRow = exports.isScheduleCandidateRow = exports.isRightSkuRow = exports.isOversizedResourceRow = exports.hasCellsForColumns = exports.isStoryColumn = exports.isStoryCell = exports.isProtectionProfile = exports.isProtectionCapability = exports.isUtilizationSignal = exports.isUtilizationProfile = exports.isSkuOption = exports.isRightSizeRejection = exports.isCommitmentBlock = exports.isSkuProjectedUsage = exports.isSkuOptionSummary = exports.isEvidenceWindow = exports.isCommitmentCoverage = exports.isCommitmentBenefit = exports.isCorroboratedRunningProfile = exports.isRunningProfile = exports.isCapacityDescriptor = exports.isCapacityScalingDescriptor = exports.isMetricSparkline = void 0;
const validationHelpers_1 = require("./validationHelpers");
const utilizationStories_1 = require("./utilizationStories");
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
const SIGNAL_ACTION_REASONS = new Set(['observed-fit', 'no-saving', 'blocked-by-commitment']);
const BACKUP_RUN_STATES = new Set(['ok', 'failed', null]);
const STORY_KEY_SET = new Set(utilizationStories_1.STORY_KEYS);
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
const isNullableNumber = (value) => value === null || (0, validationHelpers_1.isFiniteNumber)(value);
const isOptionalNullableNumber = (value) => value === undefined || isNullableNumber(value);
const isNullableString = (value) => value === null || (0, validationHelpers_1.isString)(value);
const isNullableInteger = (value) => value === null || ((0, validationHelpers_1.isFiniteNumber)(value) && Number.isInteger(value));
const isText = (value) => typeof value === 'string';
const isOptionalText = (value) => value === undefined || isText(value);
const isBoolean = (value) => typeof value === 'boolean';
const isNullableSeries = (value) => Array.isArray(value) && value.every(isNullableNumber);
const isPercentage = (value) => (0, validationHelpers_1.isFiniteNumber)(value) && value >= 0 && value <= 100;
const isNullablePercentage = (value) => value === null || isPercentage(value);
const isPriority = (value) => (0, validationHelpers_1.isCount)(value) && value >= 1 && value <= 5;
const isStringRecord = (value) => (0, validationHelpers_1.isRecord)(value) && Object.values(value).every(isText);
const isNumberRecord = (value) => (0, validationHelpers_1.isRecord)(value) && Object.values(value).every(validationHelpers_1.isFiniteNumber);
const inSet = (set, value) => set.has(value);
const isWeeklyGrid = (value) => Array.isArray(value) &&
    value.length === utilizationStories_1.STORY_LIMITS.weeklyGridDays &&
    value.every(day => isNullableSeries(day) && day.length === utilizationStories_1.STORY_LIMITS.weeklyGridHours);
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
];
const METRIC_STATS_OPTIONAL_FIELDS = ['uptime', 'peakHours', 'offPeakHours'];
const isMetricStats = (value) => (0, validationHelpers_1.isRecord)(value) &&
    METRIC_STATS_FIELDS.every(key => (0, validationHelpers_1.isFiniteNumber)(value[key])) &&
    METRIC_STATS_OPTIONAL_FIELDS.every(key => value[key] === undefined || (0, validationHelpers_1.isFiniteNumber)(value[key]));
const isMetricSparkline = (value, days) => {
    if (!(0, validationHelpers_1.isRecord)(value) || !(0, validationHelpers_1.isString)(value.key) || !(0, validationHelpers_1.isString)(value.metricName))
        return false;
    if (!inSet(METRIC_ROLES, value.role) || !inSet(METRIC_VISUALS, value.visual) || !isText(value.unit))
        return false;
    if (!isNullableNumber(value.axisMax) || (value.axisMaxSource !== undefined && !inSet(AXIS_MAX_SOURCES, value.axisMaxSource)))
        return false;
    if (value.billedOn !== undefined && !inSet(BILLED_ON, value.billedOn))
        return false;
    if (value.dimensions !== undefined &&
        (!(0, validationHelpers_1.isRecord)(value.dimensions) ||
            !inSet(DIMENSION_POLICIES, value.dimensions.policy) ||
            !isOptionalText(value.dimensions.name) ||
            !isOptionalText(value.dimensions.value) ||
            !(0, validationHelpers_1.isCount)(value.dimensions.seriesCount)))
        return false;
    if (!(0, validationHelpers_1.isDateTime)(value.start) || value.bucket !== 'P1D')
        return false;
    if (!isNullableSeries(value.avg) || !isNullableSeries(value.p95) || !isNullableSeries(value.max))
        return false;
    if (value.avg.length !== value.p95.length || value.avg.length !== value.max.length)
        return false;
    if (days !== undefined && value.avg.length !== days)
        return false;
    return isMetricStats(value.stats) && (0, validationHelpers_1.isCount)(value.sourcePoints);
};
exports.isMetricSparkline = isMetricSparkline;
const isCapacityScalingDescriptor = (value) => {
    if (!(0, validationHelpers_1.isRecord)(value) || !(value.autoscaleEnabled === null || isBoolean(value.autoscaleEnabled)))
        return false;
    if (!isNullableNumber(value.minimumUnits) ||
        !isNullableNumber(value.defaultUnits) ||
        !isNullableNumber(value.maximumUnits) ||
        !isNullableString(value.source))
        return false;
    const minimum = value.minimumUnits;
    const defaultUnits = value.defaultUnits;
    const maximum = value.maximumUnits;
    if ([minimum, defaultUnits, maximum].some(units => units !== null && units < 0))
        return false;
    if (minimum !== null && maximum !== null && minimum > maximum)
        return false;
    if (defaultUnits !== null && minimum !== null && defaultUnits < minimum)
        return false;
    if (defaultUnits !== null && maximum !== null && defaultUnits > maximum)
        return false;
    return true;
};
exports.isCapacityScalingDescriptor = isCapacityScalingDescriptor;
const isCapacityDescriptor = (value) => {
    if (!(0, validationHelpers_1.isRecord)(value) ||
        !isNullableString(value.sku) ||
        !isNullableString(value.tier) ||
        !isNullableNumber(value.units) ||
        !isText(value.unitName) ||
        !isOptionalNullableNumber(value.memoryGB) ||
        !inSet(SCALE_MODES, value.scaleMode) ||
        !isText(value.label))
        return false;
    if (value.scaling === undefined)
        return true;
    if (!(0, exports.isCapacityScalingDescriptor)(value.scaling))
        return false;
    if (value.scaling.autoscaleEnabled === true && value.scaleMode !== 'autoscale')
        return false;
    if (value.scaling.autoscaleEnabled === false && value.scaleMode !== 'fixed')
        return false;
    return true;
};
exports.isCapacityDescriptor = isCapacityDescriptor;
const isHourShare = (value) => (0, validationHelpers_1.isRecord)(value) && isNullableNumber(value.runningShare) && isNullableNumber(value.usageMean);
const isRunningProfile = (value, days) => {
    if (!(0, validationHelpers_1.isRecord)(value) || !(0, validationHelpers_1.isString)(value.signalMetric) || !inSet(RUNNING_BASES, value.basis))
        return false;
    if (!Array.isArray(value.corroboration) || !value.corroboration.every(basis => inSet(RUNNING_BASES, basis)))
        return false;
    if (value.corroboration.includes(value.basis))
        return false;
    if (!isNullableSeries(value.daily) || (days !== undefined && value.daily.length !== days) || !isNullableNumber(value.share))
        return false;
    if (value.weekly === undefined)
        return true;
    const weekly = value.weekly;
    return ((0, validationHelpers_1.isRecord)(weekly) &&
        (0, validationHelpers_1.isString)(weekly.timezone) &&
        isWeeklyGrid(weekly.running) &&
        isWeeklyGrid(weekly.usage) &&
        isHourShare(weekly.businessHours) &&
        isHourShare(weekly.offHours));
};
exports.isRunningProfile = isRunningProfile;
/** A running signal derived from metric presence alone is not evidence of stopped time; it needs an independent source. */
const isCorroboratedRunningProfile = (value) => value.basis !== 'metric-presence' || value.corroboration.some(basis => basis !== 'metric-presence');
exports.isCorroboratedRunningProfile = isCorroboratedRunningProfile;
const isCommitmentBenefit = (value) => (0, validationHelpers_1.isRecord)(value) &&
    isNullableString(value.benefitId) &&
    isNullableString(value.benefitName) &&
    (value.benefitId !== null || value.benefitName !== null) &&
    inSet(BENEFIT_TYPES, value.benefitType) &&
    isNullableString(value.status) &&
    isNullableString(value.expiryDate) &&
    (value.expiryDate === null || (0, validationHelpers_1.isDateTime)(value.expiryDate)) &&
    isNullableInteger(value.daysToExpiry) &&
    (value.expiryDate !== null || value.daysToExpiry === null);
exports.isCommitmentBenefit = isCommitmentBenefit;
const isCommitmentCoverage = (value) => (0, validationHelpers_1.isRecord)(value) &&
    isNullableNumber(value.coveragePercent) &&
    Array.isArray(value.benefitTypes) &&
    value.benefitTypes.every(type => inSet(BENEFIT_TYPES, type)) &&
    Array.isArray(value.benefitNames) &&
    value.benefitNames.every(isText) &&
    (value.benefits === undefined || (Array.isArray(value.benefits) && value.benefits.every(exports.isCommitmentBenefit))) &&
    isNullableNumber(value.coveredCost) &&
    isNullableNumber(value.uncoveredCost) &&
    (0, validationHelpers_1.isDateTime)(value.windowStart) &&
    (0, validationHelpers_1.isDateTime)(value.windowEnd);
exports.isCommitmentCoverage = isCommitmentCoverage;
const isEvidenceWindow = (value) => (0, validationHelpers_1.isRecord)(value) &&
    (0, validationHelpers_1.isDateTime)(value.windowStart) &&
    (0, validationHelpers_1.isDateTime)(value.windowEnd) &&
    (0, validationHelpers_1.isCount)(value.days) &&
    (0, validationHelpers_1.isCount)(value.sampleCount) &&
    inSet(TELEMETRY_STATUSES, value.telemetry) &&
    inSet(CONFIDENCES, value.confidence);
exports.isEvidenceWindow = isEvidenceWindow;
const isVerdictReason = (value) => (0, validationHelpers_1.isRecord)(value) && (0, validationHelpers_1.isString)(value.rule) && (0, validationHelpers_1.isRecord)(value.values) && Object.values(value.values).every(isNullableNumber);
/** Optional basis and billed figure: a billed-basis summary's `billedSavingsPercent` must equal its `savingsPercent`. */
const isSkuOptionSummary = (value) => (0, validationHelpers_1.isRecord)(value) &&
    inSet(SKU_OPTION_KINDS, value.kind) &&
    (0, validationHelpers_1.isString)(value.label) &&
    isNullableNumber(value.savingsPercent) &&
    (value.savingsBasis === undefined || inSet(SKU_SAVINGS_BASES, value.savingsBasis)) &&
    (value.billedSavingsPercent === undefined || isNullablePercentage(value.billedSavingsPercent)) &&
    (value.savingsBasis !== 'billed' || value.billedSavingsPercent === undefined || Object.is(value.billedSavingsPercent, value.savingsPercent));
exports.isSkuOptionSummary = isSkuOptionSummary;
/** An estimate marker plus at least one non-negative projected p95 percentage (may exceed 100). */
const isSkuProjectedUsage = (value) => (0, validationHelpers_1.isRecord)(value) &&
    value.estimate === true &&
    (value.cpuP95 !== undefined || value.memoryP95 !== undefined) &&
    [value.cpuP95, value.memoryP95].every(p95 => p95 === undefined || ((0, validationHelpers_1.isFiniteNumber)(p95) && p95 >= 0));
exports.isSkuProjectedUsage = isSkuProjectedUsage;
const isCommitmentBlock = (value) => (0, validationHelpers_1.isRecord)(value) &&
    inSet(COMMITMENT_BLOCK_REASONS, value.reason) &&
    isNullablePercentage(value.coveragePercent) &&
    isNullableString(value.benefitName) &&
    (value.expiryDate === null || (0, validationHelpers_1.isDateTime)(value.expiryDate)) &&
    isOptionalNullableNumber(value.expectedOptionCost) &&
    isOptionalNullableNumber(value.billedSpend);
exports.isCommitmentBlock = isCommitmentBlock;
const isRightSizeRejection = (value) => (0, validationHelpers_1.isRecord)(value) && inSet(RIGHT_SIZE_REJECTION_REASONS, value.reason) && (0, validationHelpers_1.isString)(value.sku);
exports.isRightSizeRejection = isRightSizeRejection;
const isSkuCapabilityScalar = (value) => value === null || isText(value) || (0, validationHelpers_1.isFiniteNumber)(value) || isBoolean(value);
const isSkuCapabilityValue = (value) => isSkuCapabilityScalar(value) || (Array.isArray(value) && value.every(isSkuCapabilityScalar));
const isSkuCapabilityImpact = (value) => (0, validationHelpers_1.isRecord)(value) &&
    (0, validationHelpers_1.isString)(value.key) &&
    isOptionalText(value.label) &&
    inSet(SKU_CAPABILITY_SEVERITIES, value.severity) &&
    inSet(SKU_CAPABILITY_BASES, value.basis) &&
    inSet(SKU_CAPABILITY_MATERIALITIES, value.materiality) &&
    (value.currentValue === undefined || isSkuCapabilityValue(value.currentValue)) &&
    (value.alternativeValue === undefined || isSkuCapabilityValue(value.alternativeValue)) &&
    isOptionalText(value.message);
const isSkuOption = (value) => (0, validationHelpers_1.isRecord)(value) &&
    inSet(SKU_OPTION_KINDS, value.kind) &&
    (0, validationHelpers_1.isString)(value.sku) &&
    (0, validationHelpers_1.isString)(value.label) &&
    (value.capacity === undefined ||
        ((0, validationHelpers_1.isRecord)(value.capacity) && isNullableNumber(value.capacity.units) && isOptionalNullableNumber(value.capacity.memoryGB))) &&
    isNullableNumber(value.monthlyCost) &&
    (0, validationHelpers_1.isString)(value.currency) &&
    isNullableNumber(value.savingsPercent) &&
    isNullableNumber(value.savingsMonthly) &&
    (0, validationHelpers_1.isStringArray)(value.lostCapabilities) &&
    (value.capabilityImpacts === undefined ||
        (Array.isArray(value.capabilityImpacts) &&
            value.capabilityImpacts.every(isSkuCapabilityImpact) &&
            new Set(value.capabilityImpacts.map(impact => impact.key)).size === value.capabilityImpacts.length)) &&
    (value.confidence === undefined || inSet(CONFIDENCES, value.confidence)) &&
    (value.savingsBasis === undefined || inSet(SKU_SAVINGS_BASES, value.savingsBasis)) &&
    (value.projected === undefined || (0, exports.isSkuProjectedUsage)(value.projected));
exports.isSkuOption = isSkuOption;
const isUtilizationProfile = (value, days) => {
    if (!(0, validationHelpers_1.isRecord)(value) || !inSet(PROVIDERS, value.provider) || !(0, validationHelpers_1.isString)(value.family) || !(0, exports.isCapacityDescriptor)(value.capacity))
        return false;
    if (!inSet(RUN_MODES, value.runMode) || !inSet(SIZING_VERDICTS, value.verdict) || !inSet(SCHEDULE_FITS, value.scheduleFit))
        return false;
    if (!(0, exports.isEvidenceWindow)(value.evidenceWindow) || !(0, validationHelpers_1.isString)(value.fingerprint))
        return false;
    const evidenceWindow = value.evidenceWindow;
    const windowDays = days ?? evidenceWindow.days;
    if (!Array.isArray(value.metrics) || !value.metrics.every(metric => (0, exports.isMetricSparkline)(metric, windowDays)))
        return false;
    if (value.running !== undefined && !(0, exports.isRunningProfile)(value.running, windowDays))
        return false;
    if (!Array.isArray(value.verdictReasons) || !value.verdictReasons.every(isVerdictReason) || !(0, validationHelpers_1.isStringArray)(value.evidence))
        return false;
    if (value.scheduleAction !== undefined && !inSet(SCHEDULE_ACTIONS, value.scheduleAction))
        return false;
    if (value.coverage !== undefined && !(0, exports.isCommitmentCoverage)(value.coverage))
        return false;
    if (value.ownerResourceId !== undefined && !(0, validationHelpers_1.isString)(value.ownerResourceId))
        return false;
    const needsCorroboration = inSet(SCHEDULE_FITS_REQUIRING_CORROBORATION, value.scheduleFit) || value.verdict === 'mostly-off';
    if (needsCorroboration) {
        if (evidenceWindow.telemetry !== 'collected')
            return false;
        if (value.running === undefined || !(0, exports.isCorroboratedRunningProfile)(value.running))
            return false;
    }
    return true;
};
exports.isUtilizationProfile = isUtilizationProfile;
const isSignalSeries = (value) => (0, validationHelpers_1.isRecord)(value) && (0, validationHelpers_1.isString)(value.key) && isNullableNumber(value.p95) && isNullableSeries(value.sparkline);
const isUtilizationSignal = (value) => {
    if (!(0, validationHelpers_1.isRecord)(value) || !inSet(SIZING_VERDICTS, value.verdict) || !inSet(SCHEDULE_FITS, value.scheduleFit))
        return false;
    if (!isSignalSeries(value.primary) || !inSet(TELEMETRY_STATUSES, value.telemetry))
        return false;
    const needsCorroboration = inSet(SCHEDULE_FITS_REQUIRING_CORROBORATION, value.scheduleFit) || value.verdict === 'mostly-off';
    if (needsCorroboration && value.telemetry !== 'collected')
        return false;
    if (value.actionable !== undefined && !isBoolean(value.actionable))
        return false;
    if (value.actionReason !== undefined && (value.actionable !== false || !inSet(SIGNAL_ACTION_REASONS, value.actionReason)))
        return false;
    if (value.secondary !== undefined) {
        if (!isSignalSeries(value.secondary))
            return false;
        const primaryLength = value.primary.sparkline.length;
        if (value.secondary.sparkline.length !== primaryLength)
            return false;
    }
    if (value.coverage !== undefined &&
        (!(0, validationHelpers_1.isRecord)(value.coverage) ||
            !isNullableNumber(value.coverage.coveragePercent) ||
            !Array.isArray(value.coverage.benefitTypes) ||
            !value.coverage.benefitTypes.every(type => inSet(BENEFIT_TYPES, type))))
        return false;
    return value.betterSku === undefined || (0, exports.isSkuOptionSummary)(value.betterSku);
};
exports.isUtilizationSignal = isUtilizationSignal;
const isCapabilityDetails = (value) => (0, validationHelpers_1.isRecord)(value) && Object.values(value).every(detail => detail === null || isText(detail) || (0, validationHelpers_1.isFiniteNumber)(detail) || isBoolean(detail));
const isProtectionCapability = (value) => (0, validationHelpers_1.isRecord)(value) &&
    (0, validationHelpers_1.isString)(value.key) &&
    inSet(CAPABILITY_STATES, value.state) &&
    isBoolean(value.required) &&
    isText(value.label) &&
    (value.details === undefined || isCapabilityDetails(value.details)) &&
    isOptionalNullableNumber(value.costIfEnabled) &&
    (0, validationHelpers_1.isRecord)(value.evidence) &&
    (0, validationHelpers_1.isString)(value.evidence.source) &&
    (value.evidence.observedAt === undefined || value.evidence.observedAt === null || (0, validationHelpers_1.isDateTime)(value.evidence.observedAt));
exports.isProtectionCapability = isProtectionCapability;
const isProtectionProfile = (value) => (0, validationHelpers_1.isRecord)(value) &&
    inSet(PROVIDERS, value.provider) &&
    Array.isArray(value.capabilities) &&
    value.capabilities.every(exports.isProtectionCapability) &&
    (0, validationHelpers_1.isStringArray)(value.missingRequired) &&
    isOptionalNullableNumber(value.slaPercent);
exports.isProtectionProfile = isProtectionProfile;
// ---- Cells
const isSparklineCell = (value) => inSet(SERIES_ROLES, value.role) &&
    isNullableSeries(value.values) &&
    isNullableNumber(value.axisMax) &&
    isText(value.unit) &&
    isNullableNumber(value.p95) &&
    isText(value.label);
const isStoryCell = (value) => {
    if (!(0, validationHelpers_1.isRecord)(value) || !inSet(STORY_CELL_KINDS, value.kind))
        return false;
    switch (value.kind) {
        case 'text':
            return (value.value === null || isText(value.value)) && (value.detail === undefined || value.detail === null || isText(value.detail));
        case 'number':
            return isNullableNumber(value.value) && isOptionalText(value.unit) && (value.decimals === undefined || (0, validationHelpers_1.isCount)(value.decimals));
        case 'money':
            return (isNullableNumber(value.value) &&
                (0, validationHelpers_1.isString)(value.currency) &&
                (value.secondaryValue === undefined || isNullableNumber(value.secondaryValue)) &&
                isOptionalText(value.secondaryLabel));
        case 'percent':
            return isNullableNumber(value.value);
        case 'mark':
            return ((0, validationHelpers_1.isString)(value.state) && isText(value.label) && inSet(STATUS_TONES, value.tone) && isOptionalText(value.icon) && isOptionalText(value.hint));
        case 'dot':
            return isBoolean(value.present) && inSet(STATUS_TONES, value.tone) && isOptionalText(value.label) && isOptionalText(value.hint);
        case 'sparkline':
            return isSparklineCell(value);
        case 'dual':
            return ((0, validationHelpers_1.isRecord)(value.primary) &&
                value.primary.kind === 'sparkline' &&
                isSparklineCell(value.primary) &&
                (value.secondary === null ||
                    ((0, validationHelpers_1.isRecord)(value.secondary) &&
                        value.secondary.kind === 'sparkline' &&
                        isSparklineCell(value.secondary) &&
                        value.secondary.values.length === value.primary.values.length)));
        case 'capacity-bar':
            return isNullableNumber(value.used) && isNullableNumber(value.total) && isText(value.unit) && isText(value.label);
        case 'mix-bar':
            return (Array.isArray(value.parts) &&
                value.parts.every(part => (0, validationHelpers_1.isRecord)(part) && (0, validationHelpers_1.isString)(part.key) && isText(part.label) && (0, validationHelpers_1.isFiniteNumber)(part.value)) &&
                isText(value.unit) &&
                (0, validationHelpers_1.isFiniteNumber)(value.total));
        case 'event-strip':
            return (Array.isArray(value.events) &&
                value.events.every(event => inSet(BACKUP_RUN_STATES, event)) &&
                (0, validationHelpers_1.isDateTime)(value.start) &&
                isOptionalText(value.label));
        case 'weekly-grid':
            return ((0, validationHelpers_1.isString)(value.timezone) && isWeeklyGrid(value.running) && isNullableNumber(value.businessHoursShare) && isNullableNumber(value.offHoursShare));
        default:
            return false;
    }
};
exports.isStoryCell = isStoryCell;
const isStoryColumn = (value) => (0, validationHelpers_1.isRecord)(value) &&
    (0, validationHelpers_1.isString)(value.key) &&
    isText(value.label) &&
    inSet(STORY_CELL_KINDS, value.cell) &&
    isPriority(value.priority) &&
    (value.roleClass === undefined || inSet(COLUMN_ROLE_CLASSES, value.roleClass)) &&
    isOptionalText(value.hint);
exports.isStoryColumn = isStoryColumn;
/** Every column has a cell on the row, and the cell's kind matches the column's renderer. */
const hasCellsForColumns = (row, columns) => columns.every(column => {
    const cell = row.cells[column.key];
    return cell !== undefined && cell.kind === column.cell;
});
exports.hasCellsForColumns = hasCellsForColumns;
// ---- Rows
/** Re-widen a narrowed row so story-specific fields can be inspected without index-signature casts. */
const fields = (value) => value;
/** An AWS account has no tenant, so an AWS story row may carry an empty `tenantId`; every other provider requires one. */
const isTenantId = (value, provider) => (provider === 'aws' ? isText(value) : (0, validationHelpers_1.isString)(value));
const isStoryRowBase = (value, provider) => (0, validationHelpers_1.isRecord)(value) &&
    ['resourceId', 'name', 'type', 'subscriptionId', 'companyId', 'currency', 'fingerprint'].every(key => (0, validationHelpers_1.isString)(value[key])) &&
    isTenantId(value.tenantId, provider) &&
    isText(value.location) &&
    isNullableNumber(value.spend30d) &&
    isNullableNumber(value.savingsMax) &&
    (value.ownerResourceId === undefined || (0, validationHelpers_1.isString)(value.ownerResourceId)) &&
    (value.actionable === undefined || isBoolean(value.actionable)) &&
    // An informational row asks for nothing, so it publishes no saving.
    (value.actionable !== false || value.savingsMax === null) &&
    (0, validationHelpers_1.isRecord)(value.cells) &&
    Object.values(value.cells).every(exports.isStoryCell);
const isOversizedResourceRow = (value, days, provider) => {
    if (!isStoryRowBase(value, provider))
        return false;
    const row = fields(value);
    if (!(0, exports.isUtilizationProfile)(row.profile, days) || (row.betterSku !== undefined && !(0, exports.isSkuOptionSummary)(row.betterSku)))
        return false;
    if (row.recommendedOption !== undefined && !(0, exports.isSkuOption)(row.recommendedOption))
        return false;
    if (row.vmComputeCostComparison !== undefined) {
        const comparison = row.vmComputeCostComparison;
        if (value.type.toLowerCase() !== 'microsoft.compute/virtualmachines' ||
            !(0, validationHelpers_1.isRecord)(comparison) ||
            comparison.basis !== 'billed-compute' ||
            !(0, validationHelpers_1.isFiniteNumber)(comparison.currentCost) ||
            !(0, validationHelpers_1.isFiniteNumber)(comparison.targetCost) ||
            comparison.currentCost < comparison.targetCost ||
            comparison.targetCost < 0 ||
            comparison.currency !== value.currency ||
            !(0, validationHelpers_1.isFiniteNumber)(comparison.windowDays) ||
            !Number.isInteger(comparison.windowDays) ||
            comparison.windowDays <= 0 ||
            value.savingsMax === null ||
            Math.abs(comparison.currentCost - comparison.targetCost - value.savingsMax) > 0.01 ||
            row.recommendedOption === undefined)
            return false;
    }
    if (row.rightSizeStatus !== undefined && !inSet(RIGHT_SIZE_ASSESSMENT_STATUSES, row.rightSizeStatus))
        return false;
    const hasRecommendation = row.betterSku !== undefined || row.recommendedOption !== undefined;
    if (row.rightSizeStatus === 'recommended' && !hasRecommendation)
        return false;
    if (row.rightSizeStatus !== undefined && row.rightSizeStatus !== 'recommended' && hasRecommendation)
        return false;
    if (row.betterSku !== undefined && row.recommendedOption !== undefined) {
        const summary = row.betterSku;
        const option = row.recommendedOption;
        if (summary.kind !== option.kind || summary.label !== option.label || !Object.is(summary.savingsPercent, option.savingsPercent))
            return false;
        if (summary.savingsBasis !== undefined && option.savingsBasis !== undefined && summary.savingsBasis !== option.savingsBasis)
            return false;
    }
    if (row.rightSizeRejection !== undefined && (!(0, exports.isRightSizeRejection)(row.rightSizeRejection) || hasRecommendation))
        return false;
    // A blocked resize is still the recommended size, but it cannot lower the bill now: no saving, never actionable.
    if (row.commitmentBlock !== undefined) {
        if (!(0, exports.isCommitmentBlock)(row.commitmentBlock) || !hasRecommendation || row.savingsMax !== null || row.actionable === true)
            return false;
    }
    return true;
};
exports.isOversizedResourceRow = isOversizedResourceRow;
/** `blocked-by-commitment` and `commitmentBlock` go together; a blocked row publishes no saving and is not actionable. */
const isCoherentCommitmentBlock = (row) => {
    const blocked = row.verdict === 'blocked-by-commitment';
    if (!blocked)
        return row.commitmentBlock === undefined;
    return (0, exports.isCommitmentBlock)(row.commitmentBlock) && row.savingsMax === null && row.actionable !== true;
};
const isRightSkuRow = (value, days, provider) => {
    if (!isStoryRowBase(value, provider))
        return false;
    const row = fields(value);
    return ((0, exports.isSkuOption)(row.current) &&
        Array.isArray(row.options) &&
        row.options.every(exports.isSkuOption) &&
        inSet(RIGHT_SKU_VERDICTS, row.verdict) &&
        (0, validationHelpers_1.isRecord)(row.usage) &&
        isNullableNumber(row.usage.primaryP95) &&
        isNullableNumber(row.usage.secondaryP95) &&
        inSet(TELEMETRY_STATUSES, row.usage.telemetry) &&
        (row.profile === undefined || (0, exports.isUtilizationProfile)(row.profile, days)) &&
        isCoherentCommitmentBlock(row));
};
exports.isRightSkuRow = isRightSkuRow;
/** Schedule candidates always carry a corroborated weekly running profile. */
const isScheduleCandidateRow = (value, days, provider) => {
    if (!isStoryRowBase(value, provider))
        return false;
    const row = fields(value);
    if (!(0, exports.isUtilizationProfile)(row.profile, days) || !inSet(SCHEDULE_ACTIONS, row.action))
        return false;
    const profile = row.profile;
    return profile.running !== undefined && profile.running.weekly !== undefined && (0, exports.isCorroboratedRunningProfile)(profile.running);
};
exports.isScheduleCandidateRow = isScheduleCandidateRow;
const resilienceRow = (value, provider) => {
    if (!isStoryRowBase(value, provider))
        return false;
    const row = fields(value);
    return ((0, exports.isProtectionProfile)(row.protection) &&
        (row.backupRuns === undefined || (Array.isArray(row.backupRuns) && row.backupRuns.every(run => inSet(BACKUP_RUN_STATES, run)))) &&
        (row.lastRecoveryPointAt === undefined || row.lastRecoveryPointAt === null || (0, validationHelpers_1.isDateTime)(row.lastRecoveryPointAt)) &&
        isOptionalNullableNumber(row.uptimeDays) &&
        (row.activeHealthEvents === undefined || (0, validationHelpers_1.isCount)(row.activeHealthEvents)));
};
const hybridBenefitRow = (value, provider) => {
    if (!isStoryRowBase(value, provider))
        return false;
    const row = fields(value);
    return (['productFamily', 'serviceModel', 'configurationStatus', 'technicalEligibilityStatus', 'coverageStatus', 'entitlementStatus'].every(key => (0, validationHelpers_1.isString)(row[key])) &&
        isNullableString(row.edition) &&
        isNullableNumber(row.vCpuCount) &&
        (0, validationHelpers_1.isRecord)(row.decision) &&
        (0, validationHelpers_1.isString)(row.decision.status) &&
        isText(row.decision.headline) &&
        isNullableNumber(row.decision.paybackMonths) &&
        (0, validationHelpers_1.isString)(row.decision.confidence) &&
        (0, validationHelpers_1.isStringArray)(row.reasonCodes) &&
        isNullableNumber(row.licenceObservedStableDays));
};
const commitmentRow = (value, provider) => {
    if (!isStoryRowBase(value, provider))
        return false;
    const row = fields(value);
    return ((0, exports.isCommitmentCoverage)(row.coverage) &&
        (row.utilization === undefined || ((0, validationHelpers_1.isRecord)(row.utilization) && (0, validationHelpers_1.isString)(row.utilization.primaryKey) && isNullableNumber(row.utilization.p95))));
};
const isResilienceRow = (value) => resilienceRow(value);
exports.isResilienceRow = isResilienceRow;
const isHybridBenefitRow = (value) => hybridBenefitRow(value);
exports.isHybridBenefitRow = isHybridBenefitRow;
const isCommitmentRow = (value) => commitmentRow(value);
exports.isCommitmentRow = isCommitmentRow;
/** Row guard for a story key; unknown keys reject every row. `provider: 'aws'` admits rows with an empty `tenantId`. */
const storyRowGuard = (storyKey, days, provider) => {
    switch (storyKey) {
        case 'oversized-resources':
            return (row) => (0, exports.isOversizedResourceRow)(row, days, provider);
        case 'right-sku':
            return (row) => (0, exports.isRightSkuRow)(row, days, provider);
        case 'schedule-candidates':
            return (row) => (0, exports.isScheduleCandidateRow)(row, days, provider);
        case 'resilience-recovery':
            return (row) => resilienceRow(row, provider);
        case 'hybrid-benefit':
            return (row) => hybridBenefitRow(row, provider);
        case 'commitments':
            return (row) => commitmentRow(row, provider);
        default:
            return (_row) => false;
    }
};
exports.storyRowGuard = storyRowGuard;
const isStorySummary = (value) => (0, validationHelpers_1.isRecord)(value) &&
    (0, validationHelpers_1.isRecord)(value.counts) &&
    Object.values(value.counts).every(validationHelpers_1.isCount) &&
    (value.actionable === undefined ||
        ((0, validationHelpers_1.isCount)(value.actionable) && (value.counts.resources === undefined || value.actionable <= value.counts.resources))) &&
    isNumberRecord(value.spend) &&
    (0, validationHelpers_1.isString)(value.currency) &&
    isOptionalText(value.note);
exports.isStorySummary = isStorySummary;
const isStorySectionFinancials = (value) => value === undefined || ((0, validationHelpers_1.isRecord)(value) && (0, validationHelpers_1.isFiniteNumber)(value.spend30d) && (0, validationHelpers_1.isFiniteNumber)(value.savingsMax) && (0, validationHelpers_1.isString)(value.currency));
const isStorySection = (value, storyKey, limit, days, provider) => {
    if (!(0, validationHelpers_1.isRecord)(value) || !(0, validationHelpers_1.isString)(value.resourceType) || !(0, validationHelpers_1.isString)(value.family))
        return false;
    if (!isStorySectionFinancials(value.financials))
        return false;
    if (!Array.isArray(value.columns) || !value.columns.every(exports.isStoryColumn))
        return false;
    if (new Set(value.columns.map(column => column.key)).size !== value.columns.length)
        return false;
    if (!(0, validationHelpers_1.isBoundedRows)(value, limit, (0, exports.storyRowGuard)(storyKey, days, provider)))
        return false;
    const columns = value.columns;
    return value.rows.every(row => (0, exports.hasCellsForColumns)(row, columns));
};
exports.isStorySection = isStorySection;
/**
 * A section of a summary-view projection (`view: 'summary'`): the produced columns and counts with the rows removed,
 * so `rows` must be empty while `totalCount` / `omittedCount` keep the values the engine wrote.
 */
const isStorySummarySection = (value) => {
    if (!(0, validationHelpers_1.isRecord)(value) || !(0, validationHelpers_1.isString)(value.resourceType) || !(0, validationHelpers_1.isString)(value.family))
        return false;
    if (!isStorySectionFinancials(value.financials))
        return false;
    if (!Array.isArray(value.columns) || !value.columns.every(exports.isStoryColumn))
        return false;
    if (new Set(value.columns.map(column => column.key)).size !== value.columns.length)
        return false;
    return (Array.isArray(value.rows) &&
        value.rows.length === 0 &&
        (0, validationHelpers_1.isCount)(value.totalCount) &&
        (0, validationHelpers_1.isCount)(value.omittedCount) &&
        value.omittedCount <= value.totalCount &&
        value.totalCount - value.omittedCount <= utilizationStories_1.STORY_LIMITS.sectionRows);
};
exports.isStorySummarySection = isStorySummarySection;
/** Every row of an artifact belongs to the artifact's scope; a row from another company, tenant or subscription is rejected. */
const isRowInScope = (row, scope) => row.companyId === scope.companyId && row.tenantId === scope.tenantId && row.subscriptionId === scope.subscriptionId;
exports.isRowInScope = isRowInScope;
const sectionFinancialsMatchCurrency = (sections, currency) => sections.every(section => section.financials === undefined || section.financials.currency === currency);
const isScope = (value) => (0, validationHelpers_1.isRecord)(value) &&
    (value.provider === undefined || inSet(PROVIDERS, value.provider)) &&
    ['companyId', 'subscriptionId', 'currency'].every(key => (0, validationHelpers_1.isString)(value[key])) &&
    isTenantId(value.tenantId, value.provider) &&
    isText(value.displayName);
const isStoryArtifact = (value, storyKey) => {
    if (!(0, validationHelpers_1.isRecord)(value) || !(0, validationHelpers_1.isString)(value.storyKey) || !STORY_KEY_SET.has(value.storyKey))
        return false;
    if (storyKey !== undefined && value.storyKey !== storyKey)
        return false;
    if (!isScope(value.scope))
        return false;
    if (!(0, validationHelpers_1.isRecord)(value.generation) || !(0, validationHelpers_1.isString)(value.generation.sourceRunId) || !(0, validationHelpers_1.isDateTime)(value.generation.generatedAt))
        return false;
    if (!(0, validationHelpers_1.isRecord)(value.window) ||
        !(0, validationHelpers_1.isDateTime)(value.window.start) ||
        !(0, validationHelpers_1.isDateTime)(value.window.end) ||
        !(0, validationHelpers_1.isCount)(value.window.days) ||
        value.window.days < 1 ||
        !(0, validationHelpers_1.isString)(value.window.timezone))
        return false;
    if (!(0, exports.isStorySummary)(value.summary))
        return false;
    const days = value.window.days;
    const key = value.storyKey;
    if (value.view !== undefined && value.view !== 'summary')
        return false;
    const summaryCurrency = value.summary.currency;
    if (value.view === 'summary') {
        return (Array.isArray(value.sections) &&
            value.sections.every(exports.isStorySummarySection) &&
            sectionFinancialsMatchCurrency(value.sections, summaryCurrency));
    }
    const scope = value.scope;
    if (!Array.isArray(value.sections) ||
        !value.sections.every(section => (0, exports.isStorySection)(section, key, utilizationStories_1.STORY_LIMITS.sectionRows, days, scope.provider)))
        return false;
    const sections = value.sections;
    return sectionFinancialsMatchCurrency(sections, summaryCurrency) && sections.every(section => section.rows.every(row => (0, exports.isRowInScope)(row, scope)));
};
exports.isStoryArtifact = isStoryArtifact;
/** Bounded sample embedded in the evidence pack; rows are validated for `storyKey`, window days are not known here. */
const isStorySample = (value, storyKey) => {
    if (!(0, validationHelpers_1.isRecord)(value) || !(0, exports.isStorySummary)(value.summary) || !Array.isArray(value.sections))
        return false;
    if (!value.sections.every(section => (0, exports.isStorySection)(section, storyKey, utilizationStories_1.STORY_LIMITS.sampleRows)))
        return false;
    return sectionFinancialsMatchCurrency(value.sections, value.summary.currency);
};
exports.isStorySample = isStorySample;
const isStoryFingerprint = (value) => (0, validationHelpers_1.isRecord)(value) &&
    (0, validationHelpers_1.isString)(value.storyKey) &&
    STORY_KEY_SET.has(value.storyKey) &&
    (0, validationHelpers_1.isString)(value.resourceId) &&
    (0, validationHelpers_1.isString)(value.fingerprint) &&
    isNullableNumber(value.savingsMax);
exports.isStoryFingerprint = isStoryFingerprint;
/** Bounded, de-duplicated (storyKey + fingerprint) fingerprint rows for one history period. */
const isStoryFingerprintRows = (value) => (0, validationHelpers_1.isBoundedRows)(value, utilizationStories_1.STORY_LIMITS.historyFingerprints, exports.isStoryFingerprint) &&
    new Set(value.rows.map(row => `${row.storyKey}|${row.fingerprint}`)).size === value.rows.length;
exports.isStoryFingerprintRows = isStoryFingerprintRows;
const isReportingStories = (value) => (0, validationHelpers_1.isRecord)(value) && Object.entries(value).every(([key, sample]) => STORY_KEY_SET.has(key) && (0, exports.isStorySample)(sample, key));
exports.isReportingStories = isReportingStories;
// ---- Engine config schemas
const isUtilizationMetricEntry = (value) => (0, validationHelpers_1.isRecord)(value) &&
    (0, validationHelpers_1.isString)(value.key) &&
    (0, validationHelpers_1.isString)(value.metricName) &&
    isOptionalText(value.collection) &&
    inSet(METRIC_ROLES, value.role) &&
    (value.visual === undefined || inSet(METRIC_VISUALS, value.visual)) &&
    isOptionalText(value.unit) &&
    (value.axisMax === undefined || (0, validationHelpers_1.isFiniteNumber)(value.axisMax)) &&
    isOptionalText(value.axisMaxExpression) &&
    (value.billedOn === undefined || inSet(BILLED_ON, value.billedOn)) &&
    isOptionalText(value.transform) &&
    isOptionalText(value.requires) &&
    isOptionalText(value.when) &&
    (value.dimensions === undefined ||
        ((0, validationHelpers_1.isRecord)(value.dimensions) && inSet(DIMENSION_POLICIES, value.dimensions.policy) && isOptionalText(value.dimensions.name))) &&
    (value.priority === undefined || isPriority(value.priority));
exports.isUtilizationMetricEntry = isUtilizationMetricEntry;
const isMetricEntries = (value) => Array.isArray(value) && value.every(exports.isUtilizationMetricEntry);
const isUtilizationProfileEntry = (value) => (0, validationHelpers_1.isRecord)(value) &&
    (0, validationHelpers_1.isString)(value.family) &&
    (value.producer === undefined || inSet(PRODUCERS, value.producer)) &&
    isOptionalText(value.capacityLabel) &&
    inSet(RUN_MODES, value.runMode) &&
    (value.runningSignal === undefined || isNullableString(value.runningSignal)) &&
    (value.scheduleFit === undefined || isBoolean(value.scheduleFit) || inSet(SCHEDULE_ACTIONS, value.scheduleFit)) &&
    (value.variants === undefined ||
        (Array.isArray(value.variants) &&
            value.variants.every(variant => (0, validationHelpers_1.isRecord)(variant) &&
                (0, validationHelpers_1.isString)(variant.when) &&
                isMetricEntries(variant.metrics) &&
                (variant.verdictRules === undefined || isStringRecord(variant.verdictRules))))) &&
    (value.metrics === undefined || isMetricEntries(value.metrics)) &&
    (value.verdictRules === undefined || isStringRecord(value.verdictRules)) &&
    (value.skuAlternatives === undefined ||
        ((0, validationHelpers_1.isRecord)(value.skuAlternatives) &&
            (0, validationHelpers_1.isString)(value.skuAlternatives.source) &&
            (value.skuAlternatives.capabilityKeys === undefined || (0, validationHelpers_1.isStringArray)(value.skuAlternatives.capabilityKeys))));
exports.isUtilizationProfileEntry = isUtilizationProfileEntry;
const isUtilizationProfileConfig = (value) => (0, validationHelpers_1.isRecord)(value) &&
    value.version === 1 &&
    (0, validationHelpers_1.isRecord)(value.defaults) &&
    (0, validationHelpers_1.isCount)(value.defaults.windowDays) &&
    value.defaults.windowDays >= 1 &&
    value.defaults.bucket === 'P1D' &&
    isBoolean(value.defaults.weeklyProfile) &&
    isStringRecord(value.defaults.verdictRules) &&
    (0, validationHelpers_1.isRecord)(value.profiles) &&
    Object.entries(value.profiles).every(([type, entry]) => type === type.toLowerCase() && (0, exports.isUtilizationProfileEntry)(entry));
exports.isUtilizationProfileConfig = isUtilizationProfileConfig;
const isResilienceProfileConfig = (value) => (0, validationHelpers_1.isRecord)(value) &&
    value.version === 1 &&
    (0, validationHelpers_1.isRecord)(value.profiles) &&
    Object.entries(value.profiles).every(([type, entry]) => type === type.toLowerCase() &&
        (0, validationHelpers_1.isRecord)(entry) &&
        Array.isArray(entry.capabilities) &&
        entry.capabilities.every(capability => (0, validationHelpers_1.isRecord)(capability) &&
            (0, validationHelpers_1.isString)(capability.key) &&
            isBoolean(capability.required) &&
            (0, validationHelpers_1.isString)(capability.source) &&
            isOptionalText(capability.sla)));
exports.isResilienceProfileConfig = isResilienceProfileConfig;
//# sourceMappingURL=utilizationStoriesValidation.js.map