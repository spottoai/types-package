"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MICROSOFT365_APPLICATIONS_SCHEMA_VERSION = void 0;
exports.isMicrosoft365ApplicationDirectory = isMicrosoft365ApplicationDirectory;
const microsoft365ActivityHistory_1 = require("./microsoft365ActivityHistory");
exports.MICROSOFT365_APPLICATIONS_SCHEMA_VERSION = 'microsoft-365-applications/v1';
const DAY_MILLISECONDS = 86400000;
const record = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value) => typeof value === 'string' && value.trim().length > 0 && value.length <= 512;
const nullableText = (value) => value === null || text(value);
const count = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const keys = (value, allowed) => Object.keys(value).every(key => allowed.includes(key));
const dateDay = (value) => Date.parse(value) / DAY_MILLISECONDS;
/** UTC instants only; reject normalization of invalid dates or 24:00. */
function timestamp(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value))
        return false;
    const milliseconds = Date.parse(value);
    const normalized = value.replace(/(?:\.(\d{1,3}))?Z$/, (_, fraction) => `.${(fraction ?? '').padEnd(3, '0')}Z`);
    return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString() === normalized;
}
function applicationWindow(value, observedDays) {
    return (record(value) &&
        keys(value, ['activeAccounts', 'observedDays']) &&
        count(value.activeAccounts) &&
        value.observedDays === observedDays &&
        (observedDays > 0 || value.activeAccounts === 0));
}
function applicationEntry(value, coverage, observed30Days, observed90Days) {
    if (!record(value) ||
        !keys(value, ['appId', 'name', 'nameSource', 'publisher', 'firstParty', 'ssoMode', 'firstSeen', 'lastSeen', 'last30Days', 'last90Days']) ||
        !text(value.appId) ||
        !nullableText(value.name) ||
        !nullableText(value.publisher) ||
        !nullableText(value.ssoMode) ||
        typeof value.firstParty !== 'boolean')
        return false;
    if (!(value.nameSource === null || value.nameSource === 'servicePrincipal' || value.nameSource === 'signIn') ||
        (value.name === null) !== (value.nameSource === null))
        return false;
    return ((0, microsoft365ActivityHistory_1.isMicrosoft365ActivityHistoryDate)(value.firstSeen) &&
        (0, microsoft365ActivityHistory_1.isMicrosoft365ActivityHistoryDate)(value.lastSeen) &&
        value.firstSeen >= coverage.from &&
        value.firstSeen <= value.lastSeen &&
        value.lastSeen <= coverage.through &&
        applicationWindow(value.last30Days, observed30Days) &&
        applicationWindow(value.last90Days, observed90Days) &&
        (value.last30Days.activeAccounts === 0 || dateDay(value.lastSeen) >= dateDay(coverage.through) - 29) &&
        (value.last90Days.activeAccounts === 0 || dateDay(value.lastSeen) >= dateDay(coverage.through) - 89) &&
        value.last90Days.activeAccounts >= value.last30Days.activeAccounts);
}
/**
 * Strict dependency-free artifact guard shared by API and UI readers.
 * Validation is linear in retained gaps and applications, without expanding the date range.
 */
function isMicrosoft365ApplicationDirectory(value) {
    if (!record(value) ||
        !keys(value, ['schemaVersion', 'tenantId', 'generatedAt', 'tenantSyncRunId', 'coverage', 'applications', 'omittedCount']) ||
        value.schemaVersion !== exports.MICROSOFT365_APPLICATIONS_SCHEMA_VERSION ||
        !text(value.tenantId) ||
        !timestamp(value.generatedAt) ||
        !text(value.tenantSyncRunId) ||
        (value.omittedCount !== undefined && !count(value.omittedCount)) ||
        !Array.isArray(value.applications) ||
        value.applications.length > 5000)
        return false;
    const coverage = value.coverage;
    if (!record(coverage) ||
        !keys(coverage, ['from', 'through', 'observedDays', 'unobservedDates']) ||
        !(0, microsoft365ActivityHistory_1.isMicrosoft365ActivityHistoryDate)(coverage.from) ||
        !(0, microsoft365ActivityHistory_1.isMicrosoft365ActivityHistoryDate)(coverage.through) ||
        coverage.from > coverage.through ||
        !count(coverage.observedDays) ||
        !Array.isArray(coverage.unobservedDates))
        return false;
    const fromDay = dateDay(coverage.from);
    const throughDay = dateDay(coverage.through);
    const inclusiveDays = throughDay - fromDay + 1;
    // Bound the gaps by their actual calendar range, not a daily-only retention policy.
    if (coverage.unobservedDates.length > inclusiveDays || coverage.observedDays !== inclusiveDays - coverage.unobservedDates.length)
        return false;
    const start30Day = Math.max(fromDay, throughDay - 29);
    const start90Day = Math.max(fromDay, throughDay - 89);
    let observed30Days = throughDay - start30Day + 1;
    let observed90Days = throughDay - start90Day + 1;
    const gaps = new Set();
    for (const gap of coverage.unobservedDates) {
        if (!(0, microsoft365ActivityHistory_1.isMicrosoft365ActivityHistoryDate)(gap) || gap < coverage.from || gap > coverage.through || gaps.has(gap))
            return false;
        gaps.add(gap);
        const day = dateDay(gap);
        if (day >= start30Day)
            observed30Days--;
        if (day >= start90Day)
            observed90Days--;
    }
    const appIds = new Set();
    for (const app of value.applications) {
        if (!applicationEntry(app, { from: coverage.from, through: coverage.through }, observed30Days, observed90Days))
            return false;
        const identity = app.appId.trim().toLowerCase();
        if (appIds.has(identity))
            return false;
        appIds.add(identity);
    }
    return true;
}
//# sourceMappingURL=microsoft365Applications.js.map