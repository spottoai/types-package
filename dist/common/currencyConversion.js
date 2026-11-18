"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CURRENCY_CONVERSION_RATE_SOURCE = exports.CURRENCY_CONVERSION_HEADER = exports.CURRENCY_CONVERSION_CONTRACT_VERSION = void 0;
exports.isCurrencyConversionUnavailableV1 = isCurrencyConversionUnavailableV1;
exports.isCurrencyConversionContextV1 = isCurrencyConversionContextV1;
exports.isCurrencyConversionRateV1 = isCurrencyConversionRateV1;
exports.isCurrencyConversionV1 = isCurrencyConversionV1;
exports.isCurrencyConversionDiscoveryV1 = isCurrencyConversionDiscoveryV1;
/** Public display-conversion evidence; provider billing facts remain in their source currency. */
exports.CURRENCY_CONVERSION_CONTRACT_VERSION = 1;
exports.CURRENCY_CONVERSION_HEADER = 'X-Spotto-Currency-Conversion';
exports.CURRENCY_CONVERSION_RATE_SOURCE = 'European Central Bank euro foreign exchange reference rates';
const CONTEXT_KEYS = ['contractVersion', 'targetCurrency', 'rateDate', 'rateSnapshotId', 'rateSource'];
const DOCUMENT_KEYS = [...CONTEXT_KEYS, 'status', 'rates'];
const DISCOVERY_KEYS = ['contractVersion', 'rateDate', 'rateSnapshotId', 'rateSource', 'currencies'];
const RATE_KEYS = ['sourceCurrency', 'sourceRate', 'targetRate', 'rate'];
const hasExactKeys = (value, keys) => value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value).length === keys.length &&
    keys.every(key => Object.prototype.hasOwnProperty.call(value, key));
const isCurrencyCode = (value) => typeof value === 'string' && value.length === 3 && /^[A-Z]{3}$/u.test(value);
function isCurrencyConversionUnavailableV1(value) {
    return (hasExactKeys(value, ['targetCurrency', 'code']) &&
        isCurrencyCode(value.targetCurrency) &&
        (value.code === 'currency-source-unknown' || value.code === 'currency-conversion-unavailable' || value.code === 'currency-access-denied'));
}
const isDate = (value) => {
    if (typeof value !== 'string' || value.length !== 10 || !/^\d{4}-\d{2}-\d{2}$/u.test(value))
        return false;
    const time = Date.parse(`${value}T00:00:00.000Z`);
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
};
/** Canonical ordinary decimal text: no exponent, sign, whitespace, leading zeros or trailing fractional zeros. */
const isDecimal = (value) => typeof value === 'string' && value.trim() === value && /^(?:0|[1-9]\d*)(?:\.\d*[1-9])?$/u.test(value);
const hasSnapshotFields = (value) => value.contractVersion === exports.CURRENCY_CONVERSION_CONTRACT_VERSION &&
    isDate(value.rateDate) &&
    typeof value.rateSnapshotId === 'string' &&
    value.rateSnapshotId.length === 64 &&
    /^[a-f0-9]{64}$/u.test(value.rateSnapshotId) &&
    value.rateSource === exports.CURRENCY_CONVERSION_RATE_SOURCE;
/** Validates declared wire evidence, not freshness, hash authenticity, supported-code membership or FX arithmetic. */
function isCurrencyConversionContextV1(value) {
    return hasExactKeys(value, CONTEXT_KEYS) && hasSnapshotFields(value) && isCurrencyCode(value.targetCurrency);
}
function isCurrencyConversionRateV1(value) {
    if (!hasExactKeys(value, RATE_KEYS) ||
        !isCurrencyCode(value.sourceCurrency) ||
        !isDecimal(value.sourceRate) ||
        value.sourceRate === '0' ||
        !isDecimal(value.targetRate) ||
        value.targetRate === '0' ||
        !isDecimal(value.rate))
        return false;
    const point = value.rate.indexOf('.');
    return ((point < 0 || value.rate.length - point - 1 <= 18) &&
        (value.sourceCurrency !== 'EUR' || value.sourceRate === '1') &&
        (value.sourceRate !== value.targetRate || value.rate === '1'));
}
/** Checks status and cross-entry consistency in addition to the context/rate wire contracts. */
function isCurrencyConversionV1(value) {
    if (!hasExactKeys(value, DOCUMENT_KEYS) ||
        !hasSnapshotFields(value) ||
        !isCurrencyCode(value.targetCurrency) ||
        (value.status !== 'converted' && value.status !== 'unchanged') ||
        !Array.isArray(value.rates))
        return false;
    let previousSource = '';
    let targetRate;
    let converted = false;
    for (const entry of value.rates) {
        if (!isCurrencyConversionRateV1(entry) || entry.sourceCurrency <= previousSource)
            return false;
        if (targetRate !== undefined && entry.targetRate !== targetRate)
            return false;
        if (value.targetCurrency === 'EUR' && entry.targetRate !== '1')
            return false;
        if (entry.sourceCurrency === value.targetCurrency) {
            if (entry.sourceRate !== entry.targetRate || entry.rate !== '1')
                return false;
        }
        else
            converted = true;
        previousSource = entry.sourceCurrency;
        targetRate = entry.targetRate;
    }
    return value.status === (converted ? 'converted' : 'unchanged');
}
function isCurrencyConversionDiscoveryV1(value) {
    if (!hasExactKeys(value, DISCOVERY_KEYS) || !hasSnapshotFields(value) || !Array.isArray(value.currencies))
        return false;
    let previousCode = '';
    let includesEuro = false;
    for (const currency of value.currencies) {
        if (!hasExactKeys(currency, ['code', 'minorUnitScale']) ||
            !isCurrencyCode(currency.code) ||
            currency.code <= previousCode ||
            typeof currency.minorUnitScale !== 'number' ||
            !Number.isInteger(currency.minorUnitScale) ||
            currency.minorUnitScale < 0 ||
            currency.minorUnitScale > 4)
            return false;
        previousCode = currency.code;
        includesEuro || (includesEuro = currency.code === 'EUR');
    }
    return includesEuro;
}
//# sourceMappingURL=currencyConversion.js.map