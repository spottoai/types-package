import { isFiniteNumber, isRecord, isString, isStringArray } from '../common/validationHelpers.js';
const isCalendarDate = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        return false;
    const time = Date.parse(`${value}T00:00:00Z`);
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
};
/** Source ISO timestamps may retain offsets and provider fractional-second precision. */
const isSourceTimestamp = (value) => {
    if (typeof value !== 'string')
        return false;
    const parts = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|([+-])(\d{2}):(\d{2}))$/.exec(value);
    return (parts !== null &&
        isCalendarDate(parts[1]) &&
        Number(parts[2]) < 24 &&
        Number(parts[3]) < 60 &&
        Number(parts[4]) < 60 &&
        (parts[5] === undefined || (Number(parts[6]) < 24 && Number(parts[7]) < 60)) &&
        Number.isFinite(Date.parse(value)));
};
const isWindowDate = (value) => isCalendarDate(value) || isSourceTimestamp(value);
const isNonNegativeNumber = (value) => isFiniteNumber(value) && value >= 0;
const isUtilizationWindow = (value) => isRecord(value) &&
    isWindowDate(value.start) &&
    isWindowDate(value.end) &&
    Date.parse(value.start) <= Date.parse(value.end) &&
    isNonNegativeNumber(value.percentage) &&
    value.percentage <= 100 &&
    Number.isSafeInteger(value.observedDays) &&
    value.observedDays >= 0 &&
    (value.reportedHoursPerUnit === undefined || isNonNegativeNumber(value.reportedHoursPerUnit)) &&
    value.finality === 'provider-reported-hours-unverified';
/** Checks wire consistency only; producers/readers still prove billing authenticity and current authorization. */
export function isCommitmentUnusedValueEvidence(value) {
    if (!isRecord(value) ||
        !isString(value.benefitId) ||
        value.additive !== false ||
        (value.coverage !== 'complete' && value.coverage !== 'partial') ||
        !isStringArray(value.assumptions) ||
        !isStringArray(value.limitations) ||
        !Array.isArray(value.sources) ||
        !value.sources.every(source => isRecord(source) &&
            ['billing', 'inventory', 'utilization'].includes(source.kind) &&
            isString(source.source) &&
            ['generatedAt', 'observedAt'].every(key => source[key] === undefined || isSourceTimestamp(source[key])) &&
            ['generationId', 'fingerprint'].every(key => source[key] === undefined || isString(source[key]))) ||
        (value.utilizationWindow !== undefined && !isUtilizationWindow(value.utilizationWindow)))
        return false;
    if (value.status === 'unavailable') {
        return isString(value.reason) && ['amount', 'currency', 'method', 'basis', 'provenance', 'sourceCharge'].every(key => !(key in value));
    }
    if (value.status !== 'available' ||
        'reason' in value ||
        !isNonNegativeNumber(value.amount) ||
        typeof value.currency !== 'string' ||
        !/^[A-Z]{3}$/.test(value.currency) ||
        !isRecord(value.sourceCharge) ||
        !isNonNegativeNumber(value.sourceCharge.amount) ||
        !Array.isArray(value.sourceCharge.dates) ||
        value.sourceCharge.dates.length === 0 ||
        !value.sourceCharge.dates.every(isCalendarDate) ||
        (value.sourceCharge.cadence !== undefined && value.sourceCharge.cadence !== 'monthly') ||
        (value.sourceCharge.periodStart !== undefined && !isCalendarDate(value.sourceCharge.periodStart)) ||
        (value.sourceCharge.periodEnd !== undefined && !isCalendarDate(value.sourceCharge.periodEnd)) ||
        (typeof value.sourceCharge.periodStart === 'string' &&
            typeof value.sourceCharge.periodEnd === 'string' &&
            Date.parse(value.sourceCharge.periodStart) > Date.parse(value.sourceCharge.periodEnd)))
        return false;
    return ((value.method === 'native-unused-amortized' && value.basis === 'amortized' && value.provenance === 'billing-backed-native') ||
        (value.method === 'recurring-charge-utilization-approximation' &&
            value.basis === 'billed' &&
            value.provenance === 'billing-backed-approximation' &&
            isUtilizationWindow(value.utilizationWindow)));
}
