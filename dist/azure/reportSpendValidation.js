"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReportSpendProjection = exports.hasReportSpendValue = exports.isReportSavingsBasis = void 0;
exports.isReportSpendAmounts = isReportSpendAmounts;
const costComposition_1 = require("./costComposition");
const reportEvidenceValidationHelpers_1 = require("./reportEvidenceValidationHelpers");
const reportSpend_1 = require("./reportSpend");
const reportSpendValidationHelpers_1 = require("./reportSpendValidationHelpers");
const bases = ['billed', 'amortized'];
const coverageStates = new Set(['complete', 'partial', 'unavailable']);
const exactFields = (value, required, optional = []) => required.every(key => Object.prototype.hasOwnProperty.call(value, key)) &&
    Object.keys(value).every(key => [...required, ...optional].includes(key));
const isReportSavingsBasis = (value) => typeof value === 'string' && ['billed', 'amortized', 'retail', 'mixed', 'unknown'].includes(value);
exports.isReportSavingsBasis = isReportSavingsBasis;
const amountOf = (value) => value.status === 'available' ? (0, reportSpendValidationHelpers_1.reportMoneyUnits)(value.component.amount) : undefined;
function isBasisConsistent(basis, coverage, lens) {
    if (!(0, reportEvidenceValidationHelpers_1.isRecord)(coverage) || !exactFields(coverage, ['actual', 'estimated', 'combined']))
        return false;
    const components = { actual: basis.actual.availability, estimated: basis.estimated.availability, combined: basis.combined };
    for (const key of ['actual', 'estimated', 'combined']) {
        if (!coverageStates.has(coverage[key]))
            return false;
        const available = components[key].status === 'available';
        if (available !== (coverage[key] !== 'unavailable'))
            return false;
        if (available && amountOf(components[key]) === undefined)
            return false;
        if (key !== 'combined' && available && basis[key].support !== 'supported')
            return false;
    }
    const actual = amountOf(components.actual);
    const estimated = amountOf(components.estimated);
    const expectedStatus = actual !== undefined
        ? estimated !== undefined
            ? 'actual-plus-estimated'
            : 'actual-only'
        : estimated !== undefined
            ? 'estimated-only'
            : 'unavailable';
    if (basis.status !== expectedStatus)
        return false;
    const combined = amountOf(basis.combined);
    // Reconciliation may withhold the combined amount even when individual components are available.
    if (combined === undefined)
        return true;
    if (lens === 'actual-only')
        return actual === combined && coverage.combined === coverage.actual;
    if (lens === 'estimates-only')
        return estimated === combined && coverage.combined === coverage.estimated;
    if (actual === undefined && estimated === undefined)
        return false;
    if (combined !== (actual ?? 0n) + (estimated ?? 0n))
        return false;
    // A single partial component cannot become a complete combined total. Two components require producer coverage proof.
    if (actual === undefined)
        return coverage.combined === coverage.estimated;
    if (estimated === undefined)
        return coverage.combined === coverage.actual;
    return true;
}
function isReportSpendAmounts(value, currency, generatedAt) {
    if (!(0, reportEvidenceValidationHelpers_1.isRecord)(value) || !exactFields(value, ['composition', 'coverage', 'retail'], ['estimates']) || !(0, costComposition_1.isPublicCostComposition)(value.composition))
        return false;
    if (!(0, reportEvidenceValidationHelpers_1.isRecord)(value.coverage) || !exactFields(value.coverage, [...bases]))
        return false;
    if (currency !== undefined && !(0, reportSpendValidationHelpers_1.isReportCurrency)(currency))
        return false;
    if (generatedAt !== undefined && !(0, reportSpendValidationHelpers_1.isReportUtcTimestamp)(generatedAt))
        return false;
    if (value.estimates !== undefined && (!(0, reportEvidenceValidationHelpers_1.isRecord)(value.estimates) || !exactFields(value.estimates, [], [...bases])))
        return false;
    const currencies = new Set();
    if (currency)
        currencies.add(currency);
    for (const key of bases) {
        const basis = value.composition[key];
        if (!isBasisConsistent(basis, value.coverage[key], value.composition.selectedLens))
            return false;
        for (const item of [basis.actual.availability, basis.estimated.availability, basis.combined]) {
            if (item.status === 'available') {
                if (!(0, reportSpendValidationHelpers_1.isReportCurrency)(item.component.currencyCode))
                    return false;
                currencies.add(item.component.currencyCode);
            }
        }
        const estimate = (0, reportEvidenceValidationHelpers_1.isRecord)(value.estimates) ? value.estimates[key] : undefined;
        if (basis.estimated.availability.status === 'available') {
            if (!(0, reportEvidenceValidationHelpers_1.isRecord)(estimate) ||
                !exactFields(estimate, ['reason', 'method', 'observedAt']) ||
                !['billing-lag', 'billing-unavailable-sponsorship', 'other'].includes(estimate.reason) ||
                !(0, reportSpendValidationHelpers_1.isReportText)(estimate.method) ||
                !(0, reportSpendValidationHelpers_1.isReportUtcTimestamp)(estimate.observedAt) ||
                (generatedAt !== undefined && Date.parse(estimate.observedAt) > Date.parse(generatedAt)))
                return false;
        }
        else if (estimate !== undefined)
            return false;
    }
    const retail = value.retail;
    if (!(0, reportEvidenceValidationHelpers_1.isRecord)(retail))
        return false;
    if (retail.status === 'unavailable') {
        if (!exactFields(retail, ['status']))
            return false;
    }
    else {
        if (retail.status !== 'available' ||
            !exactFields(retail, ['status', 'component', 'coverage', 'scopeDescription', 'pricingSource', 'pricedAt', 'assumptions']) ||
            !(0, reportEvidenceValidationHelpers_1.isRecord)(retail.component) ||
            !exactFields(retail.component, ['amount', 'currencyCode']) ||
            !(0, reportSpendValidationHelpers_1.isReportCurrency)(retail.component.currencyCode) ||
            !['complete', 'partial'].includes(retail.coverage) ||
            !(0, reportSpendValidationHelpers_1.isReportText)(retail.scopeDescription) ||
            !(0, reportSpendValidationHelpers_1.isReportText)(retail.pricingSource) ||
            !(0, reportSpendValidationHelpers_1.isReportUtcTimestamp)(retail.pricedAt) ||
            (generatedAt !== undefined && Date.parse(retail.pricedAt) > Date.parse(generatedAt)) ||
            !Array.isArray(retail.assumptions) ||
            retail.assumptions.length > reportSpend_1.REPORT_SPEND_LIMITS.assumptions ||
            !retail.assumptions.every(reportSpendValidationHelpers_1.isReportText))
            return false;
        const amount = (0, reportSpendValidationHelpers_1.reportMoneyUnits)(retail.component.amount);
        if (amount === undefined || amount < 0n)
            return false;
        currencies.add(retail.component.currencyCode);
    }
    return currencies.size <= 1;
}
const hasReportSpendValue = (value) => value.retail.status === 'available' ||
    bases.some(key => value.composition[key].actual.availability.status === 'available' || value.composition[key].estimated.availability.status === 'available');
exports.hasReportSpendValue = hasReportSpendValue;
/** Dates, population completeness and actual/estimated selection remain independent checks. */
const isReportSpendProjection = (value) => {
    if (!(0, reportEvidenceValidationHelpers_1.isRecord)(value) ||
        !exactFields(value, ['currency', 'dateBasis', 'generatedAt', 'freshness', 'periods'], ['sourceObservedAt']) ||
        !(0, reportSpendValidationHelpers_1.isReportCurrency)(value.currency) ||
        value.dateBasis !== 'billing-calendar' ||
        !(0, reportSpendValidationHelpers_1.isReportUtcTimestamp)(value.generatedAt) ||
        !['current', 'stale', 'unavailable'].includes(value.freshness) ||
        !Array.isArray(value.periods) ||
        value.periods.length > reportSpend_1.REPORT_SPEND_LIMITS.periods)
        return false;
    if (value.sourceObservedAt !== undefined &&
        (!(0, reportSpendValidationHelpers_1.isReportUtcTimestamp)(value.sourceObservedAt) || Date.parse(value.sourceObservedAt) > Date.parse(value.generatedAt)))
        return false;
    const seen = new Set();
    let rollingCount = 0;
    let historicalCount = 0;
    let available = false;
    for (const period of value.periods) {
        if (!(0, reportEvidenceValidationHelpers_1.isRecord)(period) ||
            !exactFields(period, ['kind', 'startDate', 'endDate', 'amounts'], ['services']) ||
            !['calendar-month', 'billing-period', 'rolling-30-days'].includes(period.kind) ||
            !(0, reportSpendValidationHelpers_1.isReportCalendarDate)(period.startDate) ||
            !(0, reportSpendValidationHelpers_1.isReportCalendarDate)(period.endDate))
            return false;
        const days = (Date.parse(period.endDate) - Date.parse(period.startDate)) / 86400000 + 1;
        if (days < 1 || days > reportSpend_1.REPORT_SPEND_LIMITS.periodDays)
            return false;
        if (period.kind === 'calendar-month') {
            const following = new Date(Date.parse(period.endDate) + 86400000).toISOString().slice(0, 10);
            if (!period.startDate.endsWith('-01') || period.startDate.slice(0, 7) !== period.endDate.slice(0, 7) || !following.endsWith('-01'))
                return false;
        }
        if (period.kind === 'rolling-30-days') {
            if (days !== 30 || ++rollingCount > 1)
                return false;
        }
        else if (++historicalCount > 13)
            return false;
        const key = `${period.kind}:${period.startDate}:${period.endDate}`;
        if (seen.has(key))
            return false;
        seen.add(key);
        if (!isReportSpendAmounts(period.amounts, value.currency, value.generatedAt))
            return false;
        available || (available = (0, exports.hasReportSpendValue)(period.amounts));
        if (period.services !== undefined) {
            const serviceKeys = new Set();
            if (!(0, reportEvidenceValidationHelpers_1.isBoundedRows)(period.services, reportSpend_1.REPORT_SPEND_LIMITS.servicesPerPeriod, (row) => {
                if (!(0, reportEvidenceValidationHelpers_1.isRecord)(row) ||
                    !exactFields(row, ['serviceKey', 'name', 'amounts']) ||
                    !(0, reportSpendValidationHelpers_1.isReportText)(row.serviceKey) ||
                    !(0, reportSpendValidationHelpers_1.isReportText)(row.name) ||
                    serviceKeys.has(row.serviceKey) ||
                    !isReportSpendAmounts(row.amounts, value.currency, value.generatedAt))
                    return false;
                serviceKeys.add(row.serviceKey);
                available || (available = (0, exports.hasReportSpendValue)(row.amounts));
                return true;
            }))
                return false;
        }
    }
    return available ? value.sourceObservedAt !== undefined && value.freshness !== 'unavailable' : value.freshness === 'unavailable';
};
exports.isReportSpendProjection = isReportSpendProjection;
//# sourceMappingURL=reportSpendValidation.js.map