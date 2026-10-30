"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportMoneyUnits = exports.isReportText = exports.isReportCurrency = exports.isReportUtcTimestamp = exports.isReportCalendarDate = void 0;
const reportSpend_1 = require("./reportSpend");
const isReportCalendarDate = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        return false;
    const time = Date.parse(`${value}T00:00:00.000Z`);
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
};
exports.isReportCalendarDate = isReportCalendarDate;
const isReportUtcTimestamp = (value) => typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) &&
    (0, exports.isReportCalendarDate)(value.slice(0, 10)) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString() === (value.length === 20 ? value.replace('Z', '.000Z') : value);
exports.isReportUtcTimestamp = isReportUtcTimestamp;
const isReportCurrency = (value) => typeof value === 'string' && /^[A-Z]{3}$/.test(value);
exports.isReportCurrency = isReportCurrency;
const isReportText = (value) => typeof value === 'string' && value.trim().length > 0 && value.length <= reportSpend_1.REPORT_SPEND_LIMITS.textLength;
exports.isReportText = isReportText;
/** Bounded exact arithmetic avoids binary floating point and pathological decimal-string input. */
const reportMoneyUnits = (value) => {
    if (typeof value !== 'string' || value.length > 25 || !/^-?(?:0|[1-9]\d{0,14})(?:\.\d{1,8})?$/.test(value))
        return undefined;
    const [whole, fraction = ''] = value.replace(/^-/, '').split('.');
    const amount = BigInt(whole) * 100000000n + BigInt(fraction.padEnd(8, '0'));
    return value.startsWith('-') ? -amount : amount;
};
exports.reportMoneyUnits = reportMoneyUnits;
//# sourceMappingURL=reportSpendValidationHelpers.js.map