"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReportDailySpend = void 0;
const reportDailySpend_1 = require("./reportDailySpend");
const reportEvidenceValidationHelpers_1 = require("./reportEvidenceValidationHelpers");
const reportSpendValidation_1 = require("./reportSpendValidation");
const reportSpendValidationHelpers_1 = require("./reportSpendValidationHelpers");
const DAY_MS = 86400000;
const isCoverage = (value, covered, expected) => {
    const status = covered === expected ? 'complete' : covered === 0 ? 'unavailable' : 'partial';
    return (0, reportEvidenceValidationHelpers_1.isRecord)(value) && (0, reportEvidenceValidationHelpers_1.isCount)(value.coveredDayCount) && value.coveredDayCount === covered && value.status === status;
};
const isReportDailySpend = (value) => {
    if (!(0, reportEvidenceValidationHelpers_1.isRecord)(value) ||
        !(0, reportSpendValidationHelpers_1.isReportCalendarDate)(value.startDate) ||
        !(0, reportSpendValidationHelpers_1.isReportCalendarDate)(value.endDate) ||
        value.dateBasis !== 'billing-calendar' ||
        typeof value.currency !== 'string' ||
        !/^[A-Z]{3}$/.test(value.currency) ||
        !(0, reportSpendValidationHelpers_1.isReportUtcTimestamp)(value.generatedAt) ||
        !['current', 'stale', 'unavailable'].includes(value.freshness) ||
        !(0, reportEvidenceValidationHelpers_1.isRecord)(value.coverage) ||
        !Array.isArray(value.entries) ||
        value.entries.length > reportDailySpend_1.REPORT_DAILY_SPEND_MAX_DAYS)
        return false;
    const expected = (Date.parse(value.endDate) - Date.parse(value.startDate)) / DAY_MS + 1;
    if (expected < 1 || expected > reportDailySpend_1.REPORT_DAILY_SPEND_MAX_DAYS)
        return false;
    if ((value.sourceObservedAt !== undefined &&
        (!(0, reportSpendValidationHelpers_1.isReportUtcTimestamp)(value.sourceObservedAt) || Date.parse(value.sourceObservedAt) > Date.parse(value.generatedAt))) ||
        (value.entries.length > 0 && (value.sourceObservedAt === undefined || value.freshness === 'unavailable')))
        return false;
    let previousDate = '';
    let billedDays = 0;
    let amortizedDays = 0;
    for (const entry of value.entries) {
        if (!(0, reportEvidenceValidationHelpers_1.isRecord)(entry) ||
            !(0, reportSpendValidationHelpers_1.isReportCalendarDate)(entry.date) ||
            entry.date <= previousDate ||
            entry.date < value.startDate ||
            entry.date > value.endDate ||
            (entry.cost === undefined && entry.costAmortized === undefined && entry.financials === undefined) ||
            (entry.cost !== undefined && !(0, reportEvidenceValidationHelpers_1.isFiniteNumber)(entry.cost)) ||
            (entry.costAmortized !== undefined && !(0, reportEvidenceValidationHelpers_1.isFiniteNumber)(entry.costAmortized)))
            return false;
        if (entry.financials !== undefined) {
            if (!(0, reportSpendValidation_1.isReportSpendAmounts)(entry.financials, value.currency, value.generatedAt) || !(0, reportSpendValidation_1.hasReportSpendValue)(entry.financials))
                return false;
            for (const [basis, field] of [
                ['billed', 'cost'],
                ['amortized', 'costAmortized'],
            ]) {
                const actual = entry.financials.composition[basis].actual.availability;
                const complete = entry.financials.coverage[basis].actual === 'complete';
                if (actual.status === 'available' && complete) {
                    if (entry[field] !== Number(actual.component.amount))
                        return false;
                }
                else if (entry[field] !== undefined)
                    return false;
            }
        }
        previousDate = entry.date;
        if (entry.cost !== undefined)
            billedDays++;
        if (entry.costAmortized !== undefined)
            amortizedDays++;
    }
    return isCoverage(value.coverage.billed, billedDays, expected) && isCoverage(value.coverage.amortized, amortizedDays, expected);
};
exports.isReportDailySpend = isReportDailySpend;
//# sourceMappingURL=reportDailySpendValidation.js.map