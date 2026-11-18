"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMicrosoft365ActivityHistoryDate = isMicrosoft365ActivityHistoryDate;
exports.isMicrosoft365ActivityHistoryCoverage = isMicrosoft365ActivityHistoryCoverage;
exports.isMicrosoft365ActivityHistoryDay = isMicrosoft365ActivityHistoryDay;
const microsoft365Usage_1 = require("./microsoft365Usage");
/** Strict UTC date validation rejects normalized impossible dates. */
function isMicrosoft365ActivityHistoryDate(value) {
    return (typeof value === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        Number.isFinite(Date.parse(value)) &&
        new Date(value).toISOString().slice(0, 10) === value);
}
const record = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value) => typeof value === 'string' && value.length > 0 && value.length <= 512;
const keys = (value, allowed) => Object.keys(value).every(key => allowed.includes(key));
const timestamp = (value) => typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value.slice(0, 10);
const nullableTime = (value) => value === null || timestamp(value);
const count = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const nullableCount = (value) => value === null || count(value);
const state = (value) => ['complete', 'partial', 'denied', 'unavailable', 'failed'].includes(value);
function isMicrosoft365ActivityHistoryCoverage(value) {
    if (!record(value) ||
        !keys(value, [
            'state',
            'requestedFrom',
            'requestedThrough',
            'observedFrom',
            'observedThrough',
            'sourceTime',
            'reason',
            'provisional',
            'rejectedEventCount',
        ]))
        return false;
    if (!state(value.state) || !timestamp(value.requestedFrom) || !timestamp(value.requestedThrough) || value.requestedFrom >= value.requestedThrough)
        return false;
    if (!nullableTime(value.observedFrom) ||
        !nullableTime(value.observedThrough) ||
        !nullableTime(value.sourceTime) ||
        !(value.reason === null || text(value.reason)))
        return false;
    if ((value.observedFrom === null) !== (value.observedThrough === null))
        return false;
    if (typeof value.observedFrom === 'string' &&
        typeof value.observedThrough === 'string' &&
        (value.observedFrom > value.observedThrough || value.observedFrom < value.requestedFrom || value.observedThrough > value.requestedThrough))
        return false;
    return ((value.provisional === undefined || typeof value.provisional === 'boolean') &&
        (value.rejectedEventCount === undefined || count(value.rejectedEventCount)));
}
function isMicrosoft365ActivityHistoryDay(value) {
    if (!record(value) ||
        !text(value.tenantId) ||
        !isMicrosoft365ActivityHistoryDate(value.date) ||
        !timestamp(value.generatedAt) ||
        (value.tenantSyncRunId !== undefined && !text(value.tenantSyncRunId)) ||
        !isMicrosoft365ActivityHistoryCoverage(value.coverage) ||
        !Array.isArray(value.rows))
        return false;
    if (value.schemaVersion !== 'microsoft-365-activity-history/v1')
        return false;
    const common = ['schemaVersion', 'tenantId', 'date', 'generatedAt', 'tenantSyncRunId', 'coverage', 'stream', 'rows'];
    if (value.stream === 'licenses') {
        if (!keys(value, [...common, 'classificationVersion', 'snapshotId', 'changes']) ||
            !text(value.classificationVersion) ||
            !text(value.snapshotId) ||
            !Array.isArray(value.changes))
            return false;
        return (value.rows.every(row => record(row) &&
            keys(row, ['skuId', 'enabledUnits', 'consumedUnits', 'subscriptionUnits', 'referencePrices']) &&
            text(row.skuId) &&
            nullableCount(row.enabledUnits) &&
            nullableCount(row.consumedUnits) &&
            nullableCount(row.subscriptionUnits) &&
            (row.referencePrices === undefined ||
                (Array.isArray(row.referencePrices) &&
                    row.referencePrices.every(price => record(price) &&
                        keys(price, ['currency', 'unitPriceMonthly', 'priceListVersion', 'basis', 'term', 'tax']) &&
                        typeof price.currency === 'string' &&
                        /^[A-Z]{3}$/.test(price.currency) &&
                        (price.unitPriceMonthly === null ||
                            (typeof price.unitPriceMonthly === 'number' && Number.isFinite(price.unitPriceMonthly) && price.unitPriceMonthly >= 0)) &&
                        text(price.priceListVersion) &&
                        price.basis === 'list_price_estimate' &&
                        price.term === 'annual_commitment' &&
                        price.tax === 'excluded')))) &&
            value.changes.every(change => record(change) &&
                keys(change, ['id', 'skuId', 'kind', 'from', 'to', 'delta', 'sourceSnapshotId', 'targetSnapshotId', 'confirmedSaving']) &&
                text(change.id) &&
                text(change.skuId) &&
                ['assignment', 'enabled_capacity', 'purchased_quantity'].includes(change.kind) &&
                count(change.from) &&
                count(change.to) &&
                change.delta === change.to - change.from &&
                text(change.sourceSnapshotId) &&
                change.targetSnapshotId === value.snapshotId &&
                change.confirmedSaving === null));
    }
    if (!keys(value, common))
        return false;
    if (value.stream === 'sign-ins') {
        return value.rows.every(row => record(row) &&
            keys(row, ['accountId', 'appId', 'count', 'firstAt', 'lastAt']) &&
            text(row.accountId) &&
            text(row.appId) &&
            count(row.count) &&
            row.count > 0 &&
            timestamp(row.firstAt) &&
            timestamp(row.lastAt) &&
            row.firstAt <= row.lastAt &&
            row.firstAt.slice(0, 10) === value.date &&
            row.lastAt.slice(0, 10) === value.date);
    }
    if (value.stream === 'workloads') {
        return value.rows.every(row => record(row) &&
            keys(row, ['source', 'kind', 'date', 'reportRefreshDate', 'periodDays', 'state', 'counts']) &&
            ['officeActiveUsers', 'officeActiveUserCounts', 'officeAppUsage', 'copilotUsage'].includes(row.source) &&
            ['rolling_snapshot', 'native_daily'].includes(row.kind) &&
            isMicrosoft365ActivityHistoryDate(row.date) &&
            (row.reportRefreshDate === null || isMicrosoft365ActivityHistoryDate(row.reportRefreshDate)) &&
            [1, 28, 30, 180].includes(row.periodDays) &&
            (row.kind !== 'native_daily' || (row.source === 'officeActiveUserCounts' && row.periodDays === 1)) &&
            state(row.state) &&
            record(row.counts) &&
            keys(row.counts, ['office365', 'exchange', 'oneDrive', 'sharePoint', 'teams', 'copilot']) &&
            ['office365', 'exchange', 'oneDrive', 'sharePoint', 'teams', 'copilot'].every(key => nullableCount(row.counts[key])));
    }
    if (value.stream === 'people') {
        return value.rows.every(row => record(row) &&
            keys(row, ['accountId', 'usage', 'officeLastActivityDate', 'reportRefreshDates']) &&
            text(row.accountId) &&
            record(row.usage) &&
            keys(row.usage, [
                'status',
                'lastActivityDate',
                'workloads',
                'workloadLicenses',
                'platforms',
                'mailbox',
                'oneDrive',
                'copilotLastActivityDate',
                'officeDesktopAppsUsed',
                'copilotAdoption',
            ]) &&
            (0, microsoft365Usage_1.isMicrosoft365AccountUsage)(row.usage) &&
            (row.officeLastActivityDate === undefined ||
                row.officeLastActivityDate === null ||
                isMicrosoft365ActivityHistoryDate(row.officeLastActivityDate)) &&
            (row.reportRefreshDates === undefined ||
                (record(row.reportRefreshDates) &&
                    keys(row.reportRefreshDates, ['officeActiveUsers', 'officeAppUsage', 'copilotUsage']) &&
                    ['officeActiveUsers', 'officeAppUsage', 'copilotUsage'].every(key => row.reportRefreshDates !== undefined &&
                        record(row.reportRefreshDates) &&
                        (row.reportRefreshDates[key] === null || isMicrosoft365ActivityHistoryDate(row.reportRefreshDates[key]))))));
    }
    return false;
}
//# sourceMappingURL=microsoft365ActivityHistory.js.map