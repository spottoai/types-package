import { isMicrosoft365PricingFacts } from './microsoft365PricingFacts.js';
import { isMicrosoft365PricingRevision } from './microsoft365PricingOverrides.js';
import { isMicrosoft365LicensePricing, MICROSOFT_365_LATER_LICENSE_SOURCES, MICROSOFT_365_LICENSE_SOURCES, } from './microsoft365Licenses.js';
import { isMicrosoft365LicenseHistoryUsage, isMicrosoft365LicenseProductUsage, } from './microsoft365Usage.js';
const isRecord = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value) => typeof value === 'string' && value.length <= 512;
const count = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const nullableCount = (value) => value === null || count(value);
const date = (value) => text(value) && Number.isFinite(Date.parse(value));
const optional = (value, predicate) => value === undefined || predicate(value);
const MONTH_KEY = /^\d{4}-(0[1-9]|1[0-2])$/;
/** True for a `YYYY-MM` month key. */
export const isMicrosoft365LicenseHistoryMonthKey = (value) => typeof value === 'string' && MONTH_KEY.test(value);
/** UTC month of an ISO timestamp, for example `2026-10`; null for an unparseable timestamp. */
export const microsoft365LicenseHistoryMonthOf = (timestamp) => {
    const time = Date.parse(timestamp);
    return Number.isFinite(time) ? new Date(time).toISOString().slice(0, 7) : null;
};
const COVERAGE_STATES = ['complete', 'partial', 'denied', 'unavailable', 'failed'];
const isHistoryCoverage = (value) => isRecord(value) &&
    MICROSOFT_365_LICENSE_SOURCES.every(name => value[name] === undefined
        ? MICROSOFT_365_LATER_LICENSE_SOURCES.includes(name)
        : COVERAGE_STATES.includes(value[name])) &&
    Object.keys(value).every(key => MICROSOFT_365_LICENSE_SOURCES.includes(key));
const isViewSummary = (value) => isRecord(value) &&
    nullableCount(value.productCount) &&
    nullableCount(value.licensedAccountCount) &&
    nullableCount(value.disabledLicensedAccountCount) &&
    nullableCount(value.accountsWithUnknownAssignments) &&
    optional(value.observedLicensedAccountCount, count) &&
    optional(value.observedDisabledLicensedAccountCount, count);
const isHistoryInsights = (value) => isRecord(value) &&
    text(value.rulesVersion) &&
    !!value.rulesVersion &&
    nullableCount(value.overlapAssignmentCount) &&
    nullableCount(value.overlapAccountCount) &&
    nullableCount(value.downgradeCandidateCount) &&
    ['available', 'report_unavailable', 'identities_concealed'].includes(String(value.downgradeEvidence)) &&
    Object.keys(value).every(key => ['rulesVersion', 'overlapAssignmentCount', 'overlapAccountCount', 'downgradeCandidateCount', 'downgradeEvidence'].includes(key));
/** Stored estimates carry no per-account values or account ids. */
const isStoredHistoryPricing = (currency, value) => isMicrosoft365LicensePricing(value) &&
    value.currency === currency &&
    Object.keys(value.accountMonthlyCosts).length === 0 &&
    value.paidAccountIds === undefined &&
    value.partialAccountPriceIds === undefined &&
    value.breakdowns === undefined;
const onlyKeys = (value, keys) => Object.keys(value).every(key => keys.includes(key));
const isProductUsage = (value) => {
    if (!isRecord(value))
        return false;
    const products = Object.entries(value);
    return (products.length <= 2000 &&
        products.every(([skuId, usage]) => text(skuId) && !!skuId && skuId === skuId.toLowerCase() && isMicrosoft365LicenseProductUsage(usage)));
};
const hasValidUsage = (value) => optional(value.usage, isMicrosoft365LicenseHistoryUsage) &&
    optional(value.productUsage, isProductUsage) &&
    optional(value.pricingFacts, facts => isMicrosoft365PricingFacts(facts) && facts.groups === undefined);
const isProductQuantities = (value) => isRecord(value) &&
    Object.keys(value).length <= 2000 &&
    Object.entries(value).every(([skuId, quantities]) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(skuId) &&
        isRecord(quantities) &&
        onlyKeys(quantities, ['purchasedUnits']) &&
        nullableCount(quantities.purchasedUnits));
/** Validates one stored tenant month at storage and API boundaries. */
export function isMicrosoft365LicenseHistorySnapshot(value) {
    if (!isRecord(value) ||
        !onlyKeys(value, [
            'schemaVersion',
            'tenantId',
            'month',
            'generatedAt',
            'tenantSyncRunId',
            'coverage',
            'summary',
            'insights',
            'pricingByCurrency',
            'usage',
            'productUsage',
            'pricingFacts',
        ]) ||
        value.schemaVersion !== 'microsoft-365-license-history/v1' ||
        !text(value.tenantId) ||
        !value.tenantId ||
        !isMicrosoft365LicenseHistoryMonthKey(value.month) ||
        !date(value.generatedAt) ||
        microsoft365LicenseHistoryMonthOf(value.generatedAt) !== value.month ||
        (value.tenantSyncRunId !== undefined && !text(value.tenantSyncRunId)) ||
        !isHistoryCoverage(value.coverage) ||
        !isViewSummary(value.summary) ||
        !optional(value.insights, isHistoryInsights) ||
        !hasValidUsage(value) ||
        !isRecord(value.pricingByCurrency))
        return false;
    const estimates = Object.entries(value.pricingByCurrency);
    return estimates.length <= 32 && estimates.every(([currency, pricing]) => /^[A-Z]{3}$/.test(currency) && isStoredHistoryPricing(currency, pricing));
}
/** Validates the API series served to the portal. */
export function isMicrosoft365LicenseHistory(value) {
    if (!isRecord(value) ||
        value.schemaVersion !== 'microsoft-365-license-history-series/v1' ||
        !text(value.tenantId) ||
        !value.tenantId ||
        !(value.currency === null || (typeof value.currency === 'string' && /^[A-Z]{3}$/.test(value.currency))) ||
        !Array.isArray(value.months) ||
        value.months.length > 60 ||
        !optional(value.pricingRevision, isMicrosoft365PricingRevision))
        return false;
    const currency = value.currency;
    let previous = '';
    return value.months.every(month => {
        const valid = isRecord(month) &&
            onlyKeys(month, [
                'month',
                'generatedAt',
                'coverage',
                'summary',
                'insights',
                'pricing',
                'usage',
                'productUsage',
                'pricingFacts',
                'productQuantities',
            ]) &&
            isMicrosoft365LicenseHistoryMonthKey(month.month) &&
            month.month > previous &&
            date(month.generatedAt) &&
            isHistoryCoverage(month.coverage) &&
            isViewSummary(month.summary) &&
            optional(month.insights, isHistoryInsights) &&
            hasValidUsage(month) &&
            optional(month.productQuantities, isProductQuantities) &&
            (month.pricing === null || (typeof currency === 'string' && isStoredHistoryPricing(currency, month.pricing)));
        if (valid)
            previous = month.month;
        return valid;
    });
}
