import { isBoundedRows, isCount, isDateTime, isFiniteNumber, isRecord, isString, isStringArray } from './validationHelpers.js';
import { STORY_KEYS, STORY_LIMITS, } from './utilizationStories.js';
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
const CAPABILITY_STATES = new Set(['enabled', 'disabled', 'partial', 'unknown', 'not-applicable']);
const RIGHT_SKU_VERDICTS = new Set(['modernise', 'downsize', 'consider', 'keep']);
const BACKUP_RUN_STATES = new Set(['ok', 'failed', null]);
const STORY_KEY_SET = new Set(STORY_KEYS);
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
const isNullableNumber = (value) => value === null || isFiniteNumber(value);
const isOptionalNullableNumber = (value) => value === undefined || isNullableNumber(value);
const isNullableString = (value) => value === null || isString(value);
const isText = (value) => typeof value === 'string';
const isOptionalText = (value) => value === undefined || isText(value);
const isBoolean = (value) => typeof value === 'boolean';
const isNullableSeries = (value) => Array.isArray(value) && value.every(isNullableNumber);
const isPriority = (value) => isCount(value) && value >= 1 && value <= 5;
const isStringRecord = (value) => isRecord(value) && Object.values(value).every(isText);
const isNumberRecord = (value) => isRecord(value) && Object.values(value).every(isFiniteNumber);
const inSet = (set, value) => set.has(value);
const isWeeklyGrid = (value) => Array.isArray(value) &&
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
];
const METRIC_STATS_OPTIONAL_FIELDS = ['uptime', 'peakHours', 'offPeakHours'];
const isMetricStats = (value) => isRecord(value) &&
    METRIC_STATS_FIELDS.every(key => isFiniteNumber(value[key])) &&
    METRIC_STATS_OPTIONAL_FIELDS.every(key => value[key] === undefined || isFiniteNumber(value[key]));
export const isMetricSparkline = (value, days) => {
    if (!isRecord(value) || !isString(value.key) || !isString(value.metricName))
        return false;
    if (!inSet(METRIC_ROLES, value.role) || !inSet(METRIC_VISUALS, value.visual) || !isText(value.unit))
        return false;
    if (!isNullableNumber(value.axisMax) || (value.axisMaxSource !== undefined && !inSet(AXIS_MAX_SOURCES, value.axisMaxSource)))
        return false;
    if (value.billedOn !== undefined && !inSet(BILLED_ON, value.billedOn))
        return false;
    if (value.dimensions !== undefined &&
        (!isRecord(value.dimensions) ||
            !inSet(DIMENSION_POLICIES, value.dimensions.policy) ||
            !isOptionalText(value.dimensions.name) ||
            !isOptionalText(value.dimensions.value) ||
            !isCount(value.dimensions.seriesCount)))
        return false;
    if (!isDateTime(value.start) || value.bucket !== 'P1D')
        return false;
    if (!isNullableSeries(value.avg) || !isNullableSeries(value.p95) || !isNullableSeries(value.max))
        return false;
    if (value.avg.length !== value.p95.length || value.avg.length !== value.max.length)
        return false;
    if (days !== undefined && value.avg.length !== days)
        return false;
    return isMetricStats(value.stats) && isCount(value.sourcePoints);
};
export const isCapacityDescriptor = (value) => isRecord(value) &&
    isNullableString(value.sku) &&
    isNullableString(value.tier) &&
    isNullableNumber(value.units) &&
    isText(value.unitName) &&
    isOptionalNullableNumber(value.memoryGB) &&
    inSet(SCALE_MODES, value.scaleMode) &&
    isText(value.label);
const isHourShare = (value) => isRecord(value) && isNullableNumber(value.runningShare) && isNullableNumber(value.usageMean);
export const isRunningProfile = (value, days) => {
    if (!isRecord(value) || !isString(value.signalMetric) || !inSet(RUNNING_BASES, value.basis))
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
    return (isRecord(weekly) &&
        isString(weekly.timezone) &&
        isWeeklyGrid(weekly.running) &&
        isWeeklyGrid(weekly.usage) &&
        isHourShare(weekly.businessHours) &&
        isHourShare(weekly.offHours));
};
/** A running signal derived from metric presence alone is not evidence of stopped time; it needs an independent source. */
export const isCorroboratedRunningProfile = (value) => value.basis !== 'metric-presence' || value.corroboration.some(basis => basis !== 'metric-presence');
export const isCommitmentCoverage = (value) => isRecord(value) &&
    isNullableNumber(value.coveragePercent) &&
    Array.isArray(value.benefitTypes) &&
    value.benefitTypes.every(type => inSet(BENEFIT_TYPES, type)) &&
    Array.isArray(value.benefitNames) &&
    value.benefitNames.every(isText) &&
    isNullableNumber(value.coveredCost) &&
    isNullableNumber(value.uncoveredCost) &&
    isDateTime(value.windowStart) &&
    isDateTime(value.windowEnd);
export const isEvidenceWindow = (value) => isRecord(value) &&
    isDateTime(value.windowStart) &&
    isDateTime(value.windowEnd) &&
    isCount(value.days) &&
    isCount(value.sampleCount) &&
    inSet(TELEMETRY_STATUSES, value.telemetry) &&
    inSet(CONFIDENCES, value.confidence);
const isVerdictReason = (value) => isRecord(value) && isString(value.rule) && isRecord(value.values) && Object.values(value.values).every(isNullableNumber);
export const isSkuOptionSummary = (value) => isRecord(value) && inSet(SKU_OPTION_KINDS, value.kind) && isString(value.label) && isNullableNumber(value.savingsPercent);
export const isSkuOption = (value) => isRecord(value) &&
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
    (value.confidence === undefined || inSet(CONFIDENCES, value.confidence));
export const isUtilizationProfile = (value, days) => {
    if (!isRecord(value) || !inSet(PROVIDERS, value.provider) || !isString(value.family) || !isCapacityDescriptor(value.capacity))
        return false;
    if (!inSet(RUN_MODES, value.runMode) || !inSet(SIZING_VERDICTS, value.verdict) || !inSet(SCHEDULE_FITS, value.scheduleFit))
        return false;
    if (!isEvidenceWindow(value.evidenceWindow) || !isString(value.fingerprint))
        return false;
    const evidenceWindow = value.evidenceWindow;
    const windowDays = days ?? evidenceWindow.days;
    if (!Array.isArray(value.metrics) || !value.metrics.every(metric => isMetricSparkline(metric, windowDays)))
        return false;
    if (value.running !== undefined && !isRunningProfile(value.running, windowDays))
        return false;
    if (!Array.isArray(value.verdictReasons) || !value.verdictReasons.every(isVerdictReason) || !isStringArray(value.evidence))
        return false;
    if (value.scheduleAction !== undefined && !inSet(SCHEDULE_ACTIONS, value.scheduleAction))
        return false;
    if (value.coverage !== undefined && !isCommitmentCoverage(value.coverage))
        return false;
    if (value.ownerResourceId !== undefined && !isString(value.ownerResourceId))
        return false;
    const needsCorroboration = inSet(SCHEDULE_FITS_REQUIRING_CORROBORATION, value.scheduleFit) || value.verdict === 'mostly-off';
    if (needsCorroboration) {
        if (evidenceWindow.telemetry !== 'collected')
            return false;
        if (value.running === undefined || !isCorroboratedRunningProfile(value.running))
            return false;
    }
    return true;
};
const isSignalSeries = (value) => isRecord(value) && isString(value.key) && isNullableNumber(value.p95) && isNullableSeries(value.sparkline);
export const isUtilizationSignal = (value) => {
    if (!isRecord(value) || !inSet(SIZING_VERDICTS, value.verdict) || !inSet(SCHEDULE_FITS, value.scheduleFit))
        return false;
    if (!isSignalSeries(value.primary) || !inSet(TELEMETRY_STATUSES, value.telemetry))
        return false;
    const actionable = inSet(SCHEDULE_FITS_REQUIRING_CORROBORATION, value.scheduleFit) || value.verdict === 'mostly-off';
    if (actionable && value.telemetry !== 'collected')
        return false;
    if (value.secondary !== undefined) {
        if (!isSignalSeries(value.secondary))
            return false;
        const primaryLength = value.primary.sparkline.length;
        if (value.secondary.sparkline.length !== primaryLength)
            return false;
    }
    if (value.coverage !== undefined &&
        (!isRecord(value.coverage) ||
            !isNullableNumber(value.coverage.coveragePercent) ||
            !Array.isArray(value.coverage.benefitTypes) ||
            !value.coverage.benefitTypes.every(type => inSet(BENEFIT_TYPES, type))))
        return false;
    return value.betterSku === undefined || isSkuOptionSummary(value.betterSku);
};
const isCapabilityDetails = (value) => isRecord(value) && Object.values(value).every(detail => detail === null || isText(detail) || isFiniteNumber(detail) || isBoolean(detail));
export const isProtectionCapability = (value) => isRecord(value) &&
    isString(value.key) &&
    inSet(CAPABILITY_STATES, value.state) &&
    isBoolean(value.required) &&
    isText(value.label) &&
    (value.details === undefined || isCapabilityDetails(value.details)) &&
    isOptionalNullableNumber(value.costIfEnabled) &&
    isRecord(value.evidence) &&
    isString(value.evidence.source) &&
    (value.evidence.observedAt === undefined || value.evidence.observedAt === null || isDateTime(value.evidence.observedAt));
export const isProtectionProfile = (value) => isRecord(value) &&
    inSet(PROVIDERS, value.provider) &&
    Array.isArray(value.capabilities) &&
    value.capabilities.every(isProtectionCapability) &&
    isStringArray(value.missingRequired) &&
    isOptionalNullableNumber(value.slaPercent);
// ---- Cells
const isSparklineCell = (value) => inSet(SERIES_ROLES, value.role) &&
    isNullableSeries(value.values) &&
    isNullableNumber(value.axisMax) &&
    isText(value.unit) &&
    isNullableNumber(value.p95) &&
    isText(value.label);
export const isStoryCell = (value) => {
    if (!isRecord(value) || !inSet(STORY_CELL_KINDS, value.kind))
        return false;
    switch (value.kind) {
        case 'text':
            return (value.value === null || isText(value.value)) && (value.detail === undefined || value.detail === null || isText(value.detail));
        case 'number':
            return isNullableNumber(value.value) && isOptionalText(value.unit) && (value.decimals === undefined || isCount(value.decimals));
        case 'money':
            return (isNullableNumber(value.value) &&
                isString(value.currency) &&
                (value.secondaryValue === undefined || isNullableNumber(value.secondaryValue)) &&
                isOptionalText(value.secondaryLabel));
        case 'percent':
            return isNullableNumber(value.value);
        case 'mark':
            return (isString(value.state) && isText(value.label) && inSet(STATUS_TONES, value.tone) && isOptionalText(value.icon) && isOptionalText(value.hint));
        case 'dot':
            return isBoolean(value.present) && inSet(STATUS_TONES, value.tone) && isOptionalText(value.label) && isOptionalText(value.hint);
        case 'sparkline':
            return isSparklineCell(value);
        case 'dual':
            return (isRecord(value.primary) &&
                value.primary.kind === 'sparkline' &&
                isSparklineCell(value.primary) &&
                (value.secondary === null ||
                    (isRecord(value.secondary) &&
                        value.secondary.kind === 'sparkline' &&
                        isSparklineCell(value.secondary) &&
                        value.secondary.values.length === value.primary.values.length)));
        case 'capacity-bar':
            return isNullableNumber(value.used) && isNullableNumber(value.total) && isText(value.unit) && isText(value.label);
        case 'mix-bar':
            return (Array.isArray(value.parts) &&
                value.parts.every(part => isRecord(part) && isString(part.key) && isText(part.label) && isFiniteNumber(part.value)) &&
                isText(value.unit) &&
                isFiniteNumber(value.total));
        case 'event-strip':
            return (Array.isArray(value.events) &&
                value.events.every(event => inSet(BACKUP_RUN_STATES, event)) &&
                isDateTime(value.start) &&
                isOptionalText(value.label));
        case 'weekly-grid':
            return (isString(value.timezone) && isWeeklyGrid(value.running) && isNullableNumber(value.businessHoursShare) && isNullableNumber(value.offHoursShare));
        default:
            return false;
    }
};
export const isStoryColumn = (value) => isRecord(value) &&
    isString(value.key) &&
    isText(value.label) &&
    inSet(STORY_CELL_KINDS, value.cell) &&
    isPriority(value.priority) &&
    (value.roleClass === undefined || inSet(COLUMN_ROLE_CLASSES, value.roleClass)) &&
    isOptionalText(value.hint);
/** Every column has a cell on the row, and the cell's kind matches the column's renderer. */
export const hasCellsForColumns = (row, columns) => columns.every(column => {
    const cell = row.cells[column.key];
    return cell !== undefined && cell.kind === column.cell;
});
// ---- Rows
/** Re-widen a narrowed row so story-specific fields can be inspected without index-signature casts. */
const fields = (value) => value;
const isStoryRowBase = (value) => isRecord(value) &&
    ['resourceId', 'name', 'type', 'subscriptionId', 'tenantId', 'companyId', 'currency', 'fingerprint'].every(key => isString(value[key])) &&
    isText(value.location) &&
    isNullableNumber(value.spend30d) &&
    isNullableNumber(value.savingsMax) &&
    (value.ownerResourceId === undefined || isString(value.ownerResourceId)) &&
    isRecord(value.cells) &&
    Object.values(value.cells).every(isStoryCell);
export const isOversizedResourceRow = (value, days) => {
    if (!isStoryRowBase(value))
        return false;
    const row = fields(value);
    return isUtilizationProfile(row.profile, days) && (row.betterSku === undefined || isSkuOptionSummary(row.betterSku));
};
export const isRightSkuRow = (value) => {
    if (!isStoryRowBase(value))
        return false;
    const row = fields(value);
    return (isSkuOption(row.current) &&
        Array.isArray(row.options) &&
        row.options.every(isSkuOption) &&
        inSet(RIGHT_SKU_VERDICTS, row.verdict) &&
        isRecord(row.usage) &&
        isNullableNumber(row.usage.primaryP95) &&
        isNullableNumber(row.usage.secondaryP95) &&
        inSet(TELEMETRY_STATUSES, row.usage.telemetry));
};
/** Schedule candidates always carry a corroborated weekly running profile. */
export const isScheduleCandidateRow = (value, days) => {
    if (!isStoryRowBase(value))
        return false;
    const row = fields(value);
    if (!isUtilizationProfile(row.profile, days) || !inSet(SCHEDULE_ACTIONS, row.action))
        return false;
    const profile = row.profile;
    return profile.running !== undefined && profile.running.weekly !== undefined && isCorroboratedRunningProfile(profile.running);
};
export const isResilienceRow = (value) => {
    if (!isStoryRowBase(value))
        return false;
    const row = fields(value);
    return (isProtectionProfile(row.protection) &&
        (row.backupRuns === undefined || (Array.isArray(row.backupRuns) && row.backupRuns.every(run => inSet(BACKUP_RUN_STATES, run)))) &&
        (row.lastRecoveryPointAt === undefined || row.lastRecoveryPointAt === null || isDateTime(row.lastRecoveryPointAt)) &&
        isOptionalNullableNumber(row.uptimeDays) &&
        (row.activeHealthEvents === undefined || isCount(row.activeHealthEvents)));
};
export const isHybridBenefitRow = (value) => {
    if (!isStoryRowBase(value))
        return false;
    const row = fields(value);
    return (['productFamily', 'serviceModel', 'configurationStatus', 'technicalEligibilityStatus', 'coverageStatus', 'entitlementStatus'].every(key => isString(row[key])) &&
        isNullableString(row.edition) &&
        isNullableNumber(row.vCpuCount) &&
        isRecord(row.decision) &&
        isString(row.decision.status) &&
        isText(row.decision.headline) &&
        isNullableNumber(row.decision.paybackMonths) &&
        isString(row.decision.confidence) &&
        isStringArray(row.reasonCodes) &&
        isNullableNumber(row.licenceObservedStableDays));
};
export const isCommitmentRow = (value) => {
    if (!isStoryRowBase(value))
        return false;
    const row = fields(value);
    return (isCommitmentCoverage(row.coverage) &&
        (row.utilization === undefined || (isRecord(row.utilization) && isString(row.utilization.primaryKey) && isNullableNumber(row.utilization.p95))));
};
/** Row guard for a story key; unknown keys reject every row. */
export const storyRowGuard = (storyKey, days) => {
    switch (storyKey) {
        case 'oversized-resources':
            return (row) => isOversizedResourceRow(row, days);
        case 'right-sku':
            return isRightSkuRow;
        case 'schedule-candidates':
            return (row) => isScheduleCandidateRow(row, days);
        case 'resilience-recovery':
            return isResilienceRow;
        case 'hybrid-benefit':
            return isHybridBenefitRow;
        case 'commitments':
            return isCommitmentRow;
        default:
            return (_row) => false;
    }
};
export const isStorySummary = (value) => isRecord(value) &&
    isRecord(value.counts) &&
    Object.values(value.counts).every(isCount) &&
    isNumberRecord(value.spend) &&
    isString(value.currency) &&
    isOptionalText(value.note);
export const isStorySection = (value, storyKey, limit, days) => {
    if (!isRecord(value) || !isString(value.resourceType) || !isString(value.family))
        return false;
    if (!Array.isArray(value.columns) || !value.columns.every(isStoryColumn))
        return false;
    if (new Set(value.columns.map(column => column.key)).size !== value.columns.length)
        return false;
    if (!isBoundedRows(value, limit, storyRowGuard(storyKey, days)))
        return false;
    const columns = value.columns;
    return value.rows.every(row => hasCellsForColumns(row, columns));
};
/**
 * A section of a summary-view projection (`view: 'summary'`): the produced columns and counts with the rows removed,
 * so `rows` must be empty while `totalCount` / `omittedCount` keep the values the engine wrote.
 */
export const isStorySummarySection = (value) => {
    if (!isRecord(value) || !isString(value.resourceType) || !isString(value.family))
        return false;
    if (!Array.isArray(value.columns) || !value.columns.every(isStoryColumn))
        return false;
    if (new Set(value.columns.map(column => column.key)).size !== value.columns.length)
        return false;
    return (Array.isArray(value.rows) &&
        value.rows.length === 0 &&
        isCount(value.totalCount) &&
        isCount(value.omittedCount) &&
        value.omittedCount <= value.totalCount &&
        value.totalCount - value.omittedCount <= STORY_LIMITS.sectionRows);
};
/** Every row of an artifact belongs to the artifact's scope; a row from another company, tenant or subscription is rejected. */
export const isRowInScope = (row, scope) => row.companyId === scope.companyId && row.tenantId === scope.tenantId && row.subscriptionId === scope.subscriptionId;
const isScope = (value) => isRecord(value) && ['companyId', 'tenantId', 'subscriptionId', 'currency'].every(key => isString(value[key])) && isText(value.displayName);
export const isStoryArtifact = (value, storyKey) => {
    if (!isRecord(value) || !isString(value.storyKey) || !STORY_KEY_SET.has(value.storyKey))
        return false;
    if (storyKey !== undefined && value.storyKey !== storyKey)
        return false;
    if (!isScope(value.scope))
        return false;
    if (!isRecord(value.generation) || !isString(value.generation.sourceRunId) || !isDateTime(value.generation.generatedAt))
        return false;
    if (!isRecord(value.window) ||
        !isDateTime(value.window.start) ||
        !isDateTime(value.window.end) ||
        !isCount(value.window.days) ||
        value.window.days < 1 ||
        !isString(value.window.timezone))
        return false;
    if (!isStorySummary(value.summary))
        return false;
    const days = value.window.days;
    const key = value.storyKey;
    if (value.view !== undefined && value.view !== 'summary')
        return false;
    if (value.view === 'summary')
        return Array.isArray(value.sections) && value.sections.every(isStorySummarySection);
    if (!Array.isArray(value.sections) || !value.sections.every(section => isStorySection(section, key, STORY_LIMITS.sectionRows, days)))
        return false;
    const scope = value.scope;
    return value.sections.every(section => section.rows.every(row => isRowInScope(row, scope)));
};
/** Bounded sample embedded in the evidence pack; rows are validated for `storyKey`, window days are not known here. */
export const isStorySample = (value, storyKey) => isRecord(value) &&
    isStorySummary(value.summary) &&
    Array.isArray(value.sections) &&
    value.sections.every(section => isStorySection(section, storyKey, STORY_LIMITS.sampleRows));
export const isStoryFingerprint = (value) => isRecord(value) &&
    isString(value.storyKey) &&
    STORY_KEY_SET.has(value.storyKey) &&
    isString(value.resourceId) &&
    isString(value.fingerprint) &&
    isNullableNumber(value.savingsMax);
/** Bounded, de-duplicated (storyKey + fingerprint) fingerprint rows for one history period. */
export const isStoryFingerprintRows = (value) => isBoundedRows(value, STORY_LIMITS.historyFingerprints, isStoryFingerprint) &&
    new Set(value.rows.map(row => `${row.storyKey}|${row.fingerprint}`)).size === value.rows.length;
export const isReportingStories = (value) => isRecord(value) && Object.entries(value).every(([key, sample]) => STORY_KEY_SET.has(key) && isStorySample(sample, key));
// ---- Engine config schemas
export const isUtilizationMetricEntry = (value) => isRecord(value) &&
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
const isMetricEntries = (value) => Array.isArray(value) && value.every(isUtilizationMetricEntry);
export const isUtilizationProfileEntry = (value) => isRecord(value) &&
    isString(value.family) &&
    (value.producer === undefined || inSet(PRODUCERS, value.producer)) &&
    isOptionalText(value.capacityLabel) &&
    inSet(RUN_MODES, value.runMode) &&
    (value.runningSignal === undefined || isNullableString(value.runningSignal)) &&
    (value.scheduleFit === undefined || isBoolean(value.scheduleFit) || inSet(SCHEDULE_ACTIONS, value.scheduleFit)) &&
    (value.variants === undefined ||
        (Array.isArray(value.variants) &&
            value.variants.every(variant => isRecord(variant) &&
                isString(variant.when) &&
                isMetricEntries(variant.metrics) &&
                (variant.verdictRules === undefined || isStringRecord(variant.verdictRules))))) &&
    (value.metrics === undefined || isMetricEntries(value.metrics)) &&
    (value.verdictRules === undefined || isStringRecord(value.verdictRules)) &&
    (value.skuAlternatives === undefined ||
        (isRecord(value.skuAlternatives) &&
            isString(value.skuAlternatives.source) &&
            (value.skuAlternatives.capabilityKeys === undefined || isStringArray(value.skuAlternatives.capabilityKeys))));
export const isUtilizationProfileConfig = (value) => isRecord(value) &&
    value.version === 1 &&
    isRecord(value.defaults) &&
    isCount(value.defaults.windowDays) &&
    value.defaults.windowDays >= 1 &&
    value.defaults.bucket === 'P1D' &&
    isBoolean(value.defaults.weeklyProfile) &&
    isStringRecord(value.defaults.verdictRules) &&
    isRecord(value.profiles) &&
    Object.entries(value.profiles).every(([type, entry]) => type === type.toLowerCase() && isUtilizationProfileEntry(entry));
export const isResilienceProfileConfig = (value) => isRecord(value) &&
    value.version === 1 &&
    isRecord(value.profiles) &&
    Object.entries(value.profiles).every(([type, entry]) => type === type.toLowerCase() &&
        isRecord(entry) &&
        Array.isArray(entry.capabilities) &&
        entry.capabilities.every(capability => isRecord(capability) &&
            isString(capability.key) &&
            isBoolean(capability.required) &&
            isString(capability.source) &&
            isOptionalText(capability.sla)));
