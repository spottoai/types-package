const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const utcDay = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/u.test(value))
        return undefined;
    const time = Date.parse(`${value}T00:00:00.000Z`);
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : undefined;
};
const amount = (value, available) => {
    if (!record(value))
        return false;
    return value.status === 'available'
        ? available && typeof value.amount === 'number' && Number.isFinite(value.amount)
        : value.status === 'unavailable' &&
            typeof value.reason === 'string' &&
            value.reason.trim().length > 0 &&
            value.reason.length <= 256 &&
            value.amount === undefined;
};
/** Validates declared evidence, not the provider/source calculation behind it. */
export function isRecordedSpendAnalysis(value) {
    if (!record(value) || value.schemaVersion !== 1 || typeof value.generatedAt !== 'string')
        return false;
    const generatedAt = Date.parse(value.generatedAt);
    if (!Number.isFinite(generatedAt))
        return false;
    const periods = [
        [value.current30Days, 30],
        [value.previous30Days, 30],
        [value.current7Days, 7],
        [value.previous7Days, 7],
    ];
    for (const [period, days] of periods) {
        if (!record(period) || !record(period.window) || !record(period.closure))
            return false;
        const start = utcDay(period.window.startDateInclusive), end = utcDay(period.window.endDateExclusive);
        if (start === undefined ||
            end === undefined ||
            end - start !== days * 86400000 ||
            end > generatedAt ||
            period.window.dayCount !== days ||
            period.window.dateBasis !== 'utc')
            return false;
        if (period.source !== 'billing' ||
            period.finality !== 'unknown' ||
            !['closed', 'unproved'].includes(String(period.closure.status)) ||
            period.closure.method !== 'accepted-source-usage-bounds')
            return false;
        const currency = typeof period.currency === 'string' && /^[A-Z]{3}$/u.test(period.currency);
        if (period.currency !== null && !currency)
            return false;
        const available = currency && period.closure.status === 'closed';
        if (!amount(period.billed, available) || !amount(period.amortized, available))
            return false;
    }
    const frame = value;
    return (frame.previous30Days.window.endDateExclusive === frame.current30Days.window.startDateInclusive &&
        frame.previous7Days.window.endDateExclusive === frame.current7Days.window.startDateInclusive &&
        frame.current7Days.window.endDateExclusive === frame.current30Days.window.endDateExclusive);
}
