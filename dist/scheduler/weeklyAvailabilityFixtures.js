"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WEEKLY_AVAILABILITY_FIXTURES_V1 = void 0;
const rule = (ruleId, daysOfWeek, desiredStateAtLocal, transition) => ({ ruleId, daysOfWeek, desiredStateAtLocal, transition });
const fixtures = [
    {
        caseId: 'business-hours',
        timezone: 'Pacific/Auckland',
        validity: 'valid',
        periods: [1, 2, 3, 4, 5].map(day => ({
            periodKey: `weekday-${day}`,
            start: { dayOfWeek: day, timeLocal: '08:00' },
            end: { dayOfWeek: day, timeLocal: '18:00' },
        })),
        expectedRules: [rule('weekday-restore', [1, 2, 3, 4, 5], '08:00', 'restore'), rule('weekday-reduce', [1, 2, 3, 4, 5], '18:00', 'reduce')],
        stateSamples: [
            { instantUtc: '2026-09-13T19:59:59.999Z', expectedState: 'reduced' },
            { instantUtc: '2026-09-13T20:00:00.000Z', expectedState: 'normal' },
            { instantUtc: '2026-09-14T06:00:00.000Z', expectedState: 'reduced' },
        ],
    },
    {
        caseId: 'daily',
        timezone: 'Pacific/Auckland',
        validity: 'valid',
        periods: [0, 1, 2, 3, 4, 5, 6].map(day => ({
            periodKey: `day-${day}`,
            start: { dayOfWeek: day, timeLocal: '08:00' },
            end: { dayOfWeek: day, timeLocal: '18:00' },
        })),
        expectedRules: [rule('daily-restore', [0, 1, 2, 3, 4, 5, 6], '08:00', 'restore'), rule('daily-reduce', [0, 1, 2, 3, 4, 5, 6], '18:00', 'reduce')],
        stateSamples: [
            { instantUtc: '2026-09-13T19:59:59.999Z', expectedState: 'reduced' },
            { instantUtc: '2026-09-13T20:00:00.000Z', expectedState: 'normal' },
            { instantUtc: '2026-09-14T06:00:00.000Z', expectedState: 'reduced' },
        ],
    },
    {
        caseId: 'cross-midnight',
        timezone: 'Pacific/Auckland',
        validity: 'valid',
        periods: [{ periodKey: 'overnight', start: { dayOfWeek: 5, timeLocal: '22:00' }, end: { dayOfWeek: 6, timeLocal: '02:00' } }],
        expectedRules: [rule('overnight-restore', [5], '22:00', 'restore'), rule('overnight-reduce', [6], '02:00', 'reduce')],
        stateSamples: [
            { instantUtc: '2026-09-18T09:59:59.999Z', expectedState: 'reduced' },
            { instantUtc: '2026-09-18T10:00:00.000Z', expectedState: 'normal' },
            { instantUtc: '2026-09-18T14:00:00.000Z', expectedState: 'reduced' },
        ],
    },
    {
        caseId: 'week-wrap',
        timezone: 'Pacific/Auckland',
        validity: 'valid',
        periods: [{ periodKey: 'week-wrap', start: { dayOfWeek: 0, timeLocal: '22:00' }, end: { dayOfWeek: 1, timeLocal: '02:00' } }],
        expectedRules: [rule('week-wrap-restore', [0], '22:00', 'restore'), rule('week-wrap-reduce', [1], '02:00', 'reduce')],
        stateSamples: [
            { instantUtc: '2026-09-20T09:59:59.999Z', expectedState: 'reduced' },
            { instantUtc: '2026-09-20T10:00:00.000Z', expectedState: 'normal' },
            { instantUtc: '2026-09-20T14:00:00.000Z', expectedState: 'reduced' },
        ],
    },
    {
        caseId: 'touching-periods',
        timezone: 'UTC',
        validity: 'valid',
        periods: [
            { periodKey: 'morning', start: { dayOfWeek: 1, timeLocal: '08:00' }, end: { dayOfWeek: 1, timeLocal: '12:00' } },
            { periodKey: 'afternoon', start: { dayOfWeek: 1, timeLocal: '12:00' }, end: { dayOfWeek: 1, timeLocal: '18:00' } },
        ],
        expectedRules: [rule('touching-restore', [1], '08:00', 'restore'), rule('touching-reduce', [1], '18:00', 'reduce')],
        stateSamples: [
            { instantUtc: '2026-09-14T07:59:59.999Z', expectedState: 'reduced' },
            { instantUtc: '2026-09-14T08:00:00.000Z', expectedState: 'normal' },
            { instantUtc: '2026-09-14T12:00:00.000Z', expectedState: 'normal' },
            { instantUtc: '2026-09-14T18:00:00.000Z', expectedState: 'reduced' },
        ],
    },
    {
        caseId: 'exact-boundaries',
        timezone: 'UTC',
        validity: 'valid',
        periods: [{ periodKey: 'window', start: { dayOfWeek: 1, timeLocal: '08:00' }, end: { dayOfWeek: 1, timeLocal: '18:00' } }],
        expectedRules: [rule('window-restore', [1], '08:00', 'restore'), rule('window-reduce', [1], '18:00', 'reduce')],
        stateSamples: [
            { instantUtc: '2026-09-14T07:59:59.999Z', expectedState: 'reduced' },
            { instantUtc: '2026-09-14T08:00:00.000Z', expectedState: 'normal' },
            { instantUtc: '2026-09-14T18:00:00.000Z', expectedState: 'reduced' },
        ],
    },
    {
        caseId: 'spring-forward-gap',
        timezone: 'Pacific/Auckland',
        validity: 'valid',
        periods: [{ periodKey: 'gap', start: { dayOfWeek: 0, timeLocal: '02:30' }, end: { dayOfWeek: 0, timeLocal: '04:00' } }],
        expectedRules: [rule('gap-restore', [0], '02:30', 'restore'), rule('gap-reduce', [0], '04:00', 'reduce')],
        stateSamples: [{ instantUtc: '2026-09-26T14:00:00.000Z', expectedState: 'normal' }],
        dstPolicy: 'spring-forward-first-valid',
    },
    {
        caseId: 'fall-back-restore-first',
        timezone: 'Pacific/Auckland',
        validity: 'valid',
        periods: [{ periodKey: 'overlap-start', start: { dayOfWeek: 0, timeLocal: '02:30' }, end: { dayOfWeek: 0, timeLocal: '04:00' } }],
        expectedRules: [rule('overlap-start-restore', [0], '02:30', 'restore'), rule('overlap-start-reduce', [0], '04:00', 'reduce')],
        stateSamples: [{ instantUtc: '2026-04-04T13:30:00.000Z', expectedState: 'normal' }],
        dstPolicy: 'fall-back-restore-first',
    },
    {
        caseId: 'fall-back-reduce-second',
        timezone: 'Pacific/Auckland',
        validity: 'valid',
        periods: [{ periodKey: 'overlap-end', start: { dayOfWeek: 0, timeLocal: '00:30' }, end: { dayOfWeek: 0, timeLocal: '02:30' } }],
        expectedRules: [rule('overlap-end-restore', [0], '00:30', 'restore'), rule('overlap-end-reduce', [0], '02:30', 'reduce')],
        stateSamples: [{ instantUtc: '2026-04-04T14:30:00.000Z', expectedState: 'reduced' }],
        dstPolicy: 'fall-back-reduce-second',
    },
    {
        caseId: 'invalid-overlap',
        timezone: 'UTC',
        validity: 'invalid',
        periods: [
            { periodKey: 'first', start: { dayOfWeek: 1, timeLocal: '08:00' }, end: { dayOfWeek: 1, timeLocal: '12:00' } },
            { periodKey: 'second', start: { dayOfWeek: 1, timeLocal: '11:00' }, end: { dayOfWeek: 1, timeLocal: '13:00' } },
        ],
        invalidReason: 'overlap',
    },
    {
        caseId: 'invalid-conflicting-transition',
        timezone: 'UTC',
        validity: 'invalid',
        periods: [{ periodKey: 'zero-duration', start: { dayOfWeek: 1, timeLocal: '08:00' }, end: { dayOfWeek: 1, timeLocal: '08:00' } }],
        invalidReason: 'conflicting-transition',
    },
];
function deepFreeze(value) {
    if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
        for (const nestedValue of Object.values(value))
            deepFreeze(nestedValue);
        Object.freeze(value);
    }
    return value;
}
exports.WEEKLY_AVAILABILITY_FIXTURES_V1 = deepFreeze(fixtures);
//# sourceMappingURL=weeklyAvailabilityFixtures.js.map