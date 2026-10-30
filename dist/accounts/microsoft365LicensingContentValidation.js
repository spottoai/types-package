"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMicrosoft365ContentAvailability = isMicrosoft365ContentAvailability;
exports.isMicrosoft365SharePointStorage = isMicrosoft365SharePointStorage;
exports.isMicrosoft365OneDriveStorage = isMicrosoft365OneDriveStorage;
exports.isMicrosoft365AccountDisableEvidence = isMicrosoft365AccountDisableEvidence;
exports.isMicrosoft365AccountLifecycle = isMicrosoft365AccountLifecycle;
exports.isMicrosoft365RelatedSpendAmount = isMicrosoft365RelatedSpendAmount;
exports.isMicrosoft365RelatedSpendMeter = isMicrosoft365RelatedSpendMeter;
exports.isMicrosoft365RelatedSpendProduct = isMicrosoft365RelatedSpendProduct;
exports.isMicrosoft365RelatedSpendCoverage = isMicrosoft365RelatedSpendCoverage;
exports.isMicrosoft365RelatedSpendView = isMicrosoft365RelatedSpendView;
exports.isMicrosoft365LicensingContent = isMicrosoft365LicensingContent;
const microsoft365Usage_1 = require("./microsoft365Usage");
const microsoft365LicensingContent_1 = require("./microsoft365LicensingContent");
const microsoft365StorageCostsValidation_1 = require("./microsoft365StorageCostsValidation");
const record = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
const exact = (value, keys) => record(value) && Object.keys(value).every(key => keys.includes(key));
const text = (value) => typeof value === 'string' && value.trim().length > 0 && value.length <= 512;
const count = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const finite = (value) => typeof value === 'number' && Number.isFinite(value);
const nullable = (value, check) => value === null || check(value);
const optional = (value, check) => value === undefined || check(value);
const list = (value, limit, check) => Array.isArray(value) && value.length <= limit && value.every(check);
const strings = (value) => list(value, 128, text);
const unique = (values) => new Set(values).size === values.length;
const fields = (value, keys, check) => keys.every(key => check(value[key]));
const nullableCount = (value) => nullable(value, count);
const nullableText = (value) => nullable(value, text);
const timestamp = (value) => text(value) && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
const nullableTimestamp = (value) => nullable(value, timestamp);
const nullableDay = (value) => nullable(value, microsoft365Usage_1.isMicrosoft365UsageDate);
const boolean = (value) => typeof value === 'boolean';
const https = (value) => typeof value === 'string' && value.length <= 2048 && /^https:\/\/[^\s]+$/i.test(value);
const orderedWindow = (from, to) => Date.parse(from) <= Date.parse(to);
const oneOf = (value, values) => typeof value === 'string' && values.includes(value);
const billingText = (value) => typeof value === 'string' && value.trim().length > 0 && value.length <= 2048;
/** Source availability is not a claim that every account or every date has evidence. */
function isMicrosoft365ContentAvailability(value) {
    return (exact(value, ['state', 'reasonCodes', 'requiredPermissions', 'observedAt']) &&
        oneOf(value.state, ['available', 'partial', 'unavailable']) &&
        strings(value.reasonCodes) &&
        strings(value.requiredPermissions) &&
        nullableTimestamp(value.observedAt));
}
function storageContribution(value) {
    return (exact(value, ['skuPartNumber', 'purchasedUnits', 'assignedUnits', 'bytesPerUnit', 'contributionBytes', 'unassignedContributionBytes', 'unit']) &&
        text(value.skuPartNumber) &&
        fields(value, ['purchasedUnits', 'bytesPerUnit', 'contributionBytes'], count) &&
        fields(value, ['assignedUnits', 'unassignedContributionBytes'], nullableCount) &&
        (value.unit === 'seat' || value.unit === 'gb'));
}
function storageSite(value) {
    return (exact(value, ['siteId', 'siteUrl', 'usedBytes', 'allocatedBytes', 'isDeleted', 'lastActivityDate']) &&
        nullableText(value.siteId) &&
        nullable(value.siteUrl, https) &&
        count(value.usedBytes) &&
        nullableCount(value.allocatedBytes) &&
        nullable(value.isDeleted, boolean) &&
        nullableDay(value.lastActivityDate));
}
function isMicrosoft365SharePointStorage(value) {
    if (!exact(value, ['usage', 'sites', 'entitlement']))
        return false;
    const { usage, sites, entitlement } = value;
    if (!exact(usage, ['availability', 'reportRefreshDate', 'latestReportDate', 'totalUsedBytes', 'trend', 'omittedTrendCount']) ||
        !isMicrosoft365ContentAvailability(usage.availability) ||
        !fields(usage, ['reportRefreshDate', 'latestReportDate'], nullableDay) ||
        !nullableCount(usage.totalUsedBytes) ||
        !count(usage.omittedTrendCount) ||
        !list(usage.trend, 180, point => exact(point, ['date', 'usedBytes']) && (0, microsoft365Usage_1.isMicrosoft365UsageDate)(point.date) && count(point.usedBytes)))
        return false;
    const dates = usage.trend.map(point => point.date);
    if (usage.totalUsedBytes !== null &&
        (usage.availability.state === 'unavailable' || usage.availability.reasonCodes.some(reason => reason !== 'trend_detail_limit')))
        return false;
    if (!unique(dates) || dates.some((day, index) => index > 0 && String(day) <= String(dates[index - 1])))
        return false;
    if (!exact(sites, [
        'availability',
        'rows',
        'observedSiteCount',
        'activeSiteCount',
        'deletedSiteCount',
        'unknownDeletedSiteCount',
        'activeUsedBytes',
        'omittedSiteCount',
        'identitiesVisible',
    ]) ||
        !isMicrosoft365ContentAvailability(sites.availability) ||
        !list(sites.rows, 100, storageSite) ||
        !fields(sites, ['observedSiteCount', 'activeSiteCount', 'deletedSiteCount', 'unknownDeletedSiteCount', 'activeUsedBytes'], nullableCount) ||
        !count(sites.omittedSiteCount) ||
        !boolean(sites.identitiesVisible))
        return false;
    if (!sites.identitiesVisible && sites.rows.some(site => site.siteId !== null || site.siteUrl !== null))
        return false;
    const validEntitlement = exact(entitlement, [
        'availability',
        'ruleVersion',
        'ruleSource',
        'baseBytes',
        'seatContributionBytes',
        'additionalStorageBytes',
        'knownEntitlementBytes',
        'calculatedEntitlementBytes',
        'authoritativeQuotaBytes',
        'unknownSkuPartNumbers',
        'omittedUnknownSkuCount',
        'contributions',
        'omittedContributionCount',
    ]) &&
        isMicrosoft365ContentAvailability(entitlement.availability) &&
        text(entitlement.ruleVersion) &&
        https(entitlement.ruleSource) &&
        fields(entitlement, ['baseBytes', 'seatContributionBytes', 'additionalStorageBytes', 'knownEntitlementBytes', 'calculatedEntitlementBytes'], nullableCount) &&
        entitlement.authoritativeQuotaBytes === null &&
        list(entitlement.unknownSkuPartNumbers, 200, text) &&
        count(entitlement.omittedUnknownSkuCount) &&
        list(entitlement.contributions, 200, storageContribution) &&
        count(entitlement.omittedContributionCount);
    if (!validEntitlement)
        return false;
    const result = entitlement;
    if (result.knownEntitlementBytes !== null &&
        (result.seatContributionBytes === null ||
            result.additionalStorageBytes === null ||
            result.knownEntitlementBytes !== (result.baseBytes ?? 0) + result.seatContributionBytes + result.additionalStorageBytes))
        return false;
    return (result.calculatedEntitlementBytes === null ||
        (result.calculatedEntitlementBytes === result.knownEntitlementBytes &&
            result.availability.state !== 'unavailable' &&
            result.availability.reasonCodes.every(reason => reason === 'sku_detail_limit') &&
            result.unknownSkuPartNumbers.length === 0 &&
            result.omittedUnknownSkuCount === 0));
}
function isMicrosoft365OneDriveStorage(value) {
    if (!exact(value, ['aggregate', 'detail', 'reconciliation']))
        return false;
    const { aggregate, detail, reconciliation } = value;
    if (!exact(aggregate, ['availability', 'reportRefreshDate', 'latestReportDate', 'series', 'totalUsedBytes', 'observedLatestUsedBytes']) ||
        !isMicrosoft365ContentAvailability(aggregate.availability) ||
        !fields(aggregate, ['reportRefreshDate', 'latestReportDate'], nullableDay) ||
        !(aggregate.series === null || aggregate.series === 'All' || aggregate.series === 'OneDrive') ||
        !fields(aggregate, ['totalUsedBytes', 'observedLatestUsedBytes'], nullableCount))
        return false;
    if (!exact(detail, [
        'availability',
        'reportRefreshDate',
        'observedAccountCount',
        'activeAccountCount',
        'deletedAccountCount',
        'unknownDeletedAccountCount',
        'duplicateSiteIdCount',
        'invalidRowCount',
        'activeUsedBytes',
        'observedActiveUsedBytes',
    ]) ||
        !isMicrosoft365ContentAvailability(detail.availability) ||
        !nullableDay(detail.reportRefreshDate) ||
        !fields(detail, [
            'observedAccountCount',
            'activeAccountCount',
            'deletedAccountCount',
            'unknownDeletedAccountCount',
            'duplicateSiteIdCount',
            'invalidRowCount',
            'activeUsedBytes',
            'observedActiveUsedBytes',
        ], nullableCount))
        return false;
    if (!exact(reconciliation, ['availability', 'state', 'reasonCodes', 'deltaBytes']) ||
        !isMicrosoft365ContentAvailability(reconciliation.availability) ||
        !strings(reconciliation.reasonCodes))
        return false;
    if (reconciliation.state === 'not_comparable')
        return reconciliation.deltaBytes === null && reconciliation.availability.state === 'unavailable';
    if (!oneOf(reconciliation.state, ['matched', 'mismatch']) ||
        !finite(reconciliation.deltaBytes) ||
        !Number.isSafeInteger(reconciliation.deltaBytes) ||
        !count(aggregate.totalUsedBytes) ||
        !count(detail.activeUsedBytes) ||
        aggregate.availability.state !== 'available' ||
        detail.availability.state !== 'available' ||
        aggregate.reportRefreshDate === null ||
        aggregate.reportRefreshDate !== detail.reportRefreshDate ||
        aggregate.latestReportDate !== detail.reportRefreshDate ||
        reconciliation.deltaBytes !== detail.activeUsedBytes - aggregate.totalUsedBytes)
        return false;
    return reconciliation.state === 'matched'
        ? reconciliation.deltaBytes === 0 && reconciliation.availability.state === 'available'
        : reconciliation.deltaBytes !== 0 && reconciliation.availability.state === 'partial';
}
/** Known dates prove an observed Entra disable transition, not departure or license-removal safety. */
function isMicrosoft365AccountDisableEvidence(value) {
    if (!exact(value, ['accountId', 'accountEnabled', 'disabledAt', 'disabledAtStatus', 'reasonCodes', 'evidence']) ||
        !text(value.accountId) ||
        !nullable(value.accountEnabled, boolean) ||
        !strings(value.reasonCodes))
        return false;
    if (value.disabledAtStatus === 'known')
        return (value.accountEnabled === false &&
            timestamp(value.disabledAt) &&
            exact(value.evidence, ['source', 'auditEventId', 'observedAt']) &&
            value.evidence.source === 'entra_directory_audit' &&
            text(value.evidence.auditEventId) &&
            nullableTimestamp(value.evidence.observedAt));
    return (value.disabledAt === null &&
        value.evidence === null &&
        (value.disabledAtStatus === 'not_disabled'
            ? value.accountEnabled === true
            : value.disabledAtStatus === 'unknown' && value.accountEnabled !== true));
}
function isMicrosoft365AccountLifecycle(value) {
    if (!exact(value, ['scope', 'availability', 'auditHistory', 'accounts']) ||
        value.scope !== 'observed_directory_users' ||
        !isMicrosoft365ContentAvailability(value.availability) ||
        !exact(value.auditHistory, ['availability', 'requestedFrom', 'requestedTo', 'retentionLimited']) ||
        !isMicrosoft365ContentAvailability(value.auditHistory.availability) ||
        !timestamp(value.auditHistory.requestedFrom) ||
        !timestamp(value.auditHistory.requestedTo) ||
        !orderedWindow(value.auditHistory.requestedFrom, value.auditHistory.requestedTo) ||
        value.auditHistory.retentionLimited !== true ||
        !Array.isArray(value.accounts) ||
        !value.accounts.every(isMicrosoft365AccountDisableEvidence))
        return false;
    const accounts = value.accounts;
    const auditAvailability = value.auditHistory.availability;
    const requestedFrom = value.auditHistory.requestedFrom;
    const requestedTo = value.auditHistory.requestedTo;
    return (unique(accounts.map(account => account.accountId.trim().toLowerCase())) &&
        accounts.every(account => account.disabledAtStatus !== 'known' ||
            (account.disabledAt !== null &&
                auditAvailability.state === 'available' &&
                orderedWindow(requestedFrom, account.disabledAt) &&
                orderedWindow(account.disabledAt, requestedTo))));
}
/** Billing corrections may be negative. Unknown amounts stay null, independently for each basis. */
function isMicrosoft365RelatedSpendAmount(value) {
    if (!exact(value, ['amount', 'state', 'reasonCodes']) || !strings(value.reasonCodes))
        return false;
    if (value.state === 'unavailable')
        return value.amount === null;
    return (value.state === 'complete' || value.state === 'partial') && finite(value.amount);
}
function isMicrosoft365RelatedSpendMeter(value) {
    return (exact(value, ['meterId', 'meterName', 'unit', 'quantity', 'quantityState', 'firstDate', 'lastDate', 'rowCount']) &&
        nullable(value.meterId, billingText) &&
        typeof value.meterName === 'string' &&
        value.meterName.length <= 2048 &&
        nullable(value.unit, billingText) &&
        (0, microsoft365Usage_1.isMicrosoft365UsageDate)(value.firstDate) &&
        (0, microsoft365Usage_1.isMicrosoft365UsageDate)(value.lastDate) &&
        value.firstDate <= value.lastDate &&
        count(value.rowCount) &&
        (value.quantityState === 'unavailable'
            ? value.quantity === null
            : (value.quantityState === 'complete' || value.quantityState === 'partial') && value.unit !== null && finite(value.quantity)));
}
function isMicrosoft365RelatedSpendProduct(value) {
    return (exact(value, ['category', 'billed', 'amortized', 'matchedRowCount', 'meters']) &&
        oneOf(value.category, microsoft365LicensingContent_1.MICROSOFT_365_RELATED_SPEND_CATEGORIES) &&
        isMicrosoft365RelatedSpendAmount(value.billed) &&
        isMicrosoft365RelatedSpendAmount(value.amortized) &&
        count(value.matchedRowCount) &&
        list(value.meters, 100000, isMicrosoft365RelatedSpendMeter));
}
function isMicrosoft365RelatedSpendCoverage(value) {
    const valid = exact(value, [
        'subscriptionId',
        'state',
        'recordsState',
        'observedAt',
        'sourceEtag',
        'sourceFile',
        'billingGenerationId',
        'sourceRunId',
        'reasonCodes',
        'sourceRowCount',
        'retainedRowCount',
        'matchedRowCount',
        'inWindowRowCount',
        'invalidRowCount',
        'outsideWindowRowCount',
        'excludedEstimatedRowCount',
    ]) &&
        text(value.subscriptionId) &&
        oneOf(value.state, ['complete', 'partial', 'unavailable', 'failed']) &&
        oneOf(value.recordsState, ['loaded', 'missing']) &&
        nullableTimestamp(value.observedAt) &&
        fields(value, ['sourceEtag', 'sourceFile', 'billingGenerationId', 'sourceRunId'], item => optional(item, text)) &&
        strings(value.reasonCodes) &&
        fields(value, ['sourceRowCount', 'retainedRowCount'], nullableCount) &&
        fields(value, ['matchedRowCount', 'inWindowRowCount', 'invalidRowCount', 'outsideWindowRowCount', 'excludedEstimatedRowCount'], count);
    if (!valid)
        return false;
    const source = value;
    return ((source.sourceRowCount === null || source.retainedRowCount === null || source.retainedRowCount <= source.sourceRowCount) &&
        (source.retainedRowCount === null || source.matchedRowCount <= source.retainedRowCount) &&
        source.inWindowRowCount <= source.matchedRowCount &&
        source.outsideWindowRowCount <= source.matchedRowCount &&
        source.excludedEstimatedRowCount <= source.matchedRowCount);
}
function isMicrosoft365RelatedSpendView(value) {
    if (!exact(value, ['generatedAt', 'window', 'availability', 'currencies', 'subscriptions']) ||
        !timestamp(value.generatedAt) ||
        !exact(value.window, ['startDate', 'endDate']) ||
        !(0, microsoft365Usage_1.isMicrosoft365UsageDate)(value.window.startDate) ||
        !(0, microsoft365Usage_1.isMicrosoft365UsageDate)(value.window.endDate) ||
        value.window.startDate > value.window.endDate ||
        !isMicrosoft365ContentAvailability(value.availability) ||
        !list(value.subscriptions, 100, isMicrosoft365RelatedSpendCoverage) ||
        !unique(value.subscriptions.map(source => String(source.subscriptionId)
            .trim()
            .toLowerCase())) ||
        !Array.isArray(value.currencies) ||
        value.currencies.length > 17576)
        return false;
    let meters = 0;
    const startDate = value.window.startDate;
    const endDate = value.window.endDate;
    const subscriptions = value.subscriptions;
    const loaded = subscriptions.filter(source => source.recordsState === 'loaded' && (source.state === 'complete' || source.state === 'partial'));
    if (!loaded.length && (value.availability.state !== 'unavailable' || value.currencies.length > 0))
        return false;
    if (loaded.length && value.availability.state === 'unavailable')
        return false;
    const incompleteScopes = subscriptions.some(source => source.state !== 'complete' ||
        source.recordsState !== 'loaded' ||
        source.reasonCodes.some(reason => !['missing_billed_amount', 'missing_amortized_amount'].includes(reason)));
    if (value.availability.state === 'available' && (incompleteScopes || value.availability.reasonCodes.length > 0))
        return false;
    const currencies = new Set();
    for (const group of value.currencies) {
        if (!exact(group, ['currency', 'products']) ||
            typeof group.currency !== 'string' ||
            !/^[A-Z]{3}$/.test(group.currency) ||
            currencies.has(group.currency) ||
            !list(group.products, microsoft365LicensingContent_1.MICROSOFT_365_RELATED_SPEND_CATEGORIES.length, isMicrosoft365RelatedSpendProduct) ||
            !unique(group.products.map(product => product.category)))
            return false;
        currencies.add(group.currency);
        for (const product of group.products) {
            meters += product.meters.length;
            if (incompleteScopes &&
                (product.billed.state === 'complete' ||
                    product.amortized.state === 'complete' ||
                    product.meters.some(meter => meter.quantityState === 'complete')))
                return false;
            if (meters > 100000 || product.meters.some(meter => meter.firstDate < startDate || meter.lastDate > endDate))
                return false;
        }
    }
    return true;
}
/** This artifact includes person-level rows and subscription spend: consumers must authorize both scopes. */
function isMicrosoft365LicensingContent(value) {
    if (!exact(value, [
        'schemaVersion',
        'tenantId',
        'tenantSyncRunId',
        'generatedAt',
        'graphCollection',
        'licenseEvidence',
        'measures',
        'sharePoint',
        'oneDrive',
        'accountLifecycle',
        'relatedSpend',
        'storageCosts',
        'expectedSubscriptionCount',
        'omittedSubscriptionCount',
        'billingScope',
    ]) ||
        value.schemaVersion !== 'microsoft-365-licensing-content/v1' ||
        !text(value.tenantId) ||
        !text(value.tenantSyncRunId) ||
        !timestamp(value.generatedAt) ||
        !oneOf(value.graphCollection, ['attempted', 'disabled']) ||
        !exact(value.licenseEvidence, ['generatedAt', 'tenantSyncRunId']) ||
        !nullableTimestamp(value.licenseEvidence.generatedAt) ||
        !nullableText(value.licenseEvidence.tenantSyncRunId) ||
        (value.licenseEvidence.tenantSyncRunId !== null && value.licenseEvidence.tenantSyncRunId !== value.tenantSyncRunId) ||
        !record(value.measures) ||
        Object.keys(value.measures).length > 64 ||
        !Object.entries(value.measures).every(([name, availability]) => /^[a-z][a-zA-Z0-9]{0,95}$/.test(name) && isMicrosoft365ContentAvailability(availability)) ||
        !isMicrosoft365SharePointStorage(value.sharePoint) ||
        !isMicrosoft365OneDriveStorage(value.oneDrive) ||
        !isMicrosoft365AccountLifecycle(value.accountLifecycle) ||
        !isMicrosoft365RelatedSpendView(value.relatedSpend) ||
        value.relatedSpend.generatedAt !== value.generatedAt ||
        (value.storageCosts !== undefined &&
            (!(0, microsoft365StorageCostsValidation_1.isMicrosoft365StorageCostView)(value.storageCosts) || value.storageCosts.generatedAt !== value.generatedAt)) ||
        !count(value.expectedSubscriptionCount) ||
        !count(value.omittedSubscriptionCount) ||
        value.expectedSubscriptionCount !== value.relatedSpend.subscriptions.length + value.omittedSubscriptionCount ||
        value.billingScope !== 'scan_subscription_set')
        return false;
    if (value.omittedSubscriptionCount > 0 &&
        (value.relatedSpend.availability.state === 'available' ||
            !value.relatedSpend.availability.reasonCodes.includes('subscription_limit') ||
            value.relatedSpend.currencies.some(group => group.products.some(product => product.billed.state === 'complete' ||
                product.amortized.state === 'complete' ||
                product.meters.some(meter => meter.quantityState === 'complete')))))
        return false;
    return orderedWindow(value.accountLifecycle.auditHistory.requestedTo, value.generatedAt);
}
//# sourceMappingURL=microsoft365LicensingContentValidation.js.map