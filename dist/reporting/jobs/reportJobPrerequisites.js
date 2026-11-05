"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCurrentStateReportPrerequisitesV1 = exports.CURRENT_STATE_REPORT_MAX_HOURLY_RATE = exports.CURRENT_STATE_REPORT_SUPPORTED_CURRENCIES = void 0;
/** Background Current State admission prerequisites. Interactive covers may omit prepared-by; background v1 requires it. */
exports.CURRENT_STATE_REPORT_SUPPORTED_CURRENCIES = [
    'USD',
    'NZD',
    'AUD',
    'CAD',
    'EUR',
    'GBP',
    'JPY',
    'CNY',
    'KRW',
    'INR',
    'BRL',
    'SEK',
    'NOK',
    'DKK',
    'CHF',
    'SGD',
    'HKD',
];
exports.CURRENT_STATE_REPORT_MAX_HOURLY_RATE = 10000;
const validateCurrentStateReportPrerequisitesV1 = (input) => {
    if (typeof input.hourlyRateAmount !== 'number' ||
        !Number.isFinite(input.hourlyRateAmount) ||
        input.hourlyRateAmount <= 0 ||
        input.hourlyRateAmount > exports.CURRENT_STATE_REPORT_MAX_HOURLY_RATE ||
        typeof input.hourlyRateCurrency !== 'string' ||
        !input.hourlyRateCurrency.trim()) {
        return { ok: false, failureCode: 'invalid-rate' };
    }
    if (!exports.CURRENT_STATE_REPORT_SUPPORTED_CURRENCIES.includes(input.scopeCurrencyCode))
        return { ok: false, failureCode: 'invalid-currency' };
    const usableProvider = (name) => {
        const normalized = name?.trim();
        return normalized && normalized.toLowerCase() !== 'service provider' ? normalized : undefined;
    };
    const defaultProvider = usableProvider(input.providerName) ?? usableProvider(input.parentCompanyName);
    const preparedBy = input.preparedBy === undefined ? (defaultProvider ? `${defaultProvider} pre-sales team` : '') : input.preparedBy.trim();
    if (!preparedBy ||
        preparedBy.length > 120 ||
        /[<>]/u.test(preparedBy) ||
        Array.from(preparedBy).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127))
        return { ok: false, failureCode: 'no-prepared-by' };
    // A different hourly-rate currency remains valid: reports expose an unconverted rate and never invent FX.
    return { ok: true };
};
exports.validateCurrentStateReportPrerequisitesV1 = validateCurrentStateReportPrerequisitesV1;
//# sourceMappingURL=reportJobPrerequisites.js.map