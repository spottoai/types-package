"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectFinancialAnalyticsDisplayPeriodV1 = void 0;
const exactDecimal_1 = require("../common/exactDecimal");
const financialAnalyticsValidation_1 = require("./financialAnalyticsValidation");
const DAY_MS = 86400000;
const HISTORY_NOT_PRODUCED = 'history-not-produced';
const CALENDAR_PERIOD_INCOMPLETE = 'calendar-period-incomplete';
const addUtcDays = (date, days) => new Date(Date.parse(`${date}T00:00:00.000Z`) + days * DAY_MS).toISOString().slice(0, 10);
const shiftUtcMonths = (date, months) => {
    const parsed = new Date(`${date}T00:00:00.000Z`);
    return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth() + months, 1)).toISOString().slice(0, 10);
};
const uniqueReasons = (values) => {
    const reasons = [...new Set(values)].sort();
    return (reasons.length > 0 ? reasons : [HISTORY_NOT_PRODUCED]);
};
/** Twelve-decimal half-away-from-zero display average; totals remain exact. */
const averageKnownPerDay = (amount, dayCount) => {
    if (!Number.isSafeInteger(dayCount) || dayCount < 1)
        throw new RangeError('Display average requires a positive day count.');
    const value = (0, exactDecimal_1.parseCanonicalDecimal)(amount);
    const precision = 12;
    const numerator = (value.coefficient < 0n ? -value.coefficient : value.coefficient) * 10n ** BigInt(precision);
    const scaledDivisor = BigInt(dayCount) * 10n ** BigInt(value.scale);
    let quotient = numerator / scaledDivisor;
    const remainder = numerator % scaledDivisor;
    if (remainder * 2n >= scaledDivisor)
        quotient += 1n;
    return (0, exactDecimal_1.formatExactDecimalValue)({ coefficient: value.coefficient < 0n ? -quotient : quotient, scale: precision });
};
const requestedInterval = (input, periodKey) => {
    const endDateExclusive = input.coordinate.period.requested.endDateExclusive;
    const startDate = periodKey === 'last-7-days'
        ? addUtcDays(endDateExclusive, -7)
        : periodKey === 'rolling-30-days'
            ? addUtcDays(endDateExclusive, -30)
            : periodKey === 'rolling-90-days'
                ? addUtcDays(endDateExclusive, -90)
                : shiftUtcMonths(addUtcDays(endDateExclusive, -1), -11);
    return {
        startDate,
        endDateExclusive,
        dateBasis: input.coordinate.period.requested.dateBasis,
        ...(input.coordinate.period.requested.timeZone === undefined
            ? {}
            : { timeZone: input.coordinate.period.requested.timeZone }),
    };
};
const displayDays = (input, startDate, endDateExclusive) => {
    const pointByDate = new Map(input.points.map(point => [point.date, point]));
    const gapReasons = (date) => input.gaps
        .filter(gap => gap.startDate <= date && gap.endDateExclusive > date)
        .flatMap(gap => gap.reasonCodes);
    const days = [];
    for (let date = startDate; date < endDateExclusive; date = addUtcDays(date, 1)) {
        const point = pointByDate.get(date);
        if (point?.status === 'available') {
            days.push({ date, status: 'available', knownAmount: point.amount, reasonCodes: [] });
        }
        else if (point?.status === 'partial') {
            days.push({ date, status: 'partial', knownAmount: point.knownAmount, reasonCodes: point.reasonCodes });
        }
        else {
            const reasons = gapReasons(date);
            days.push({ date, status: 'unavailable', reasonCodes: reasons.length > 0 ? reasons : [HISTORY_NOT_PRODUCED] });
        }
    }
    return days;
};
const toBucket = (bucketKey, startDate, endDateExclusive, days) => {
    const knownAmounts = days.flatMap(day => (day.knownAmount === undefined ? [] : [day.knownAmount]));
    const coversWholeBucket = days[0]?.date === startDate && days.length > 0 && addUtcDays(days[days.length - 1].date, 1) === endDateExclusive;
    const reasonCodes = uniqueReasons([
        ...days.flatMap(day => day.reasonCodes),
        ...(coversWholeBucket ? [] : [CALENDAR_PERIOD_INCOMPLETE]),
    ]);
    if (knownAmounts.length === 0) {
        return { bucketKey, startDate, endDateExclusive, status: 'unavailable', reasonCodes };
    }
    const knownAmount = (0, exactDecimal_1.formatExactDecimalValue)((0, exactDecimal_1.sumCanonicalDecimals)(knownAmounts));
    const average = averageKnownPerDay(knownAmount, knownAmounts.length);
    if (coversWholeBucket && days.every(day => day.status === 'available')) {
        return { bucketKey, startDate, endDateExclusive, status: 'available', amount: knownAmount, averageKnownPerDay: average };
    }
    return { bucketKey, startDate, endDateExclusive, status: 'partial', knownAmount, averageKnownPerDay: average, reasonCodes };
};
const dailyBuckets = (days) => days.map(day => toBucket(day.date, day.date, addUtcDays(day.date, 1), [day]));
const monthlyBuckets = (days) => {
    const byMonth = new Map();
    days.forEach(day => {
        const month = day.date.slice(0, 7);
        byMonth.set(month, [...(byMonth.get(month) ?? []), day]);
    });
    return [...byMonth.entries()].map(([month, monthDays]) => toBucket(month, `${month}-01`, shiftUtcMonths(`${month}-01`, 1), monthDays));
};
/**
 * Exact, non-authoritative display rollup over one producer-owned analytics
 * input. The function never changes charge inclusion, estimates, cost basis,
 * currency, or source evidence; uncovered dates remain explicit.
 */
const projectFinancialAnalyticsDisplayPeriodV1 = (request) => {
    if (!(0, financialAnalyticsValidation_1.isFinancialAnalyticsInputSeriesV1)(request.input)) {
        throw new TypeError('Financial analytics display projection requires a valid input series.');
    }
    const current = request.input.referenceCompositions.find(composition => composition.coordinate.periodRole === 'current-spend' && composition.compositionId === request.currentSpendCompositionId);
    if (!current) {
        throw new TypeError('Financial analytics input does not bind the requested current-spend composition.');
    }
    const accountingCurrency = request.input.coordinate.accountingCurrency;
    if (accountingCurrency.status !== 'resolved') {
        throw new TypeError('Financial analytics display projection requires a resolved accounting currency.');
    }
    const requested = requestedInterval(request.input, request.periodKey);
    const days = displayDays(request.input, requested.startDate, requested.endDateExclusive);
    const buckets = request.periodKey === 'trailing-12-calendar-months' ? monthlyBuckets(days) : dailyBuckets(days);
    const common = {
        analyticsInputId: request.input.analyticsInputId,
        currentSpendCompositionId: current.compositionId,
        chargeInclusionPolicyRef: current.coordinate.chargeInclusionPolicyRef,
        periodKey: request.periodKey,
        requested,
        bucketGranularity: request.periodKey === 'trailing-12-calendar-months' ? 'calendar-month' : 'daily',
        currencyCode: accountingCurrency.currencyCode,
        buckets,
    };
    const knownAmounts = days.flatMap(day => (day.knownAmount === undefined ? [] : [day.knownAmount]));
    const calendarPeriodIncomplete = request.periodKey === 'trailing-12-calendar-months' &&
        requested.endDateExclusive !== shiftUtcMonths(addUtcDays(requested.endDateExclusive, -1), 1);
    const reasonCodes = uniqueReasons([
        ...days.flatMap(day => day.reasonCodes),
        ...(calendarPeriodIncomplete ? [CALENDAR_PERIOD_INCOMPLETE] : []),
    ]);
    if (knownAmounts.length === 0)
        return { ...common, status: 'unavailable', reasonCodes };
    const knownAmount = (0, exactDecimal_1.formatExactDecimalValue)((0, exactDecimal_1.sumCanonicalDecimals)(knownAmounts));
    const average = averageKnownPerDay(knownAmount, knownAmounts.length);
    if (!calendarPeriodIncomplete && days.every(day => day.status === 'available')) {
        return { ...common, status: 'available', amount: knownAmount, averageKnownPerDay: average };
    }
    return { ...common, status: 'partial', knownAmount, averageKnownPerDay: average, reasonCodes };
};
exports.projectFinancialAnalyticsDisplayPeriodV1 = projectFinancialAnalyticsDisplayPeriodV1;
//# sourceMappingURL=financialAnalyticsDisplayKernel.js.map