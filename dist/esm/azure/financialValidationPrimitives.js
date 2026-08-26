const CANONICAL_DECIMAL_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d*[1-9])?$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const MAX_EXACT_MONEY_LENGTH = 128;
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
/** Validates the provider-neutral exact-money representation used by financial authorities. */
export const isCanonicalExactMoney = (value) => isRecord(value) &&
    Object.keys(value).length === 2 &&
    Object.prototype.hasOwnProperty.call(value, 'amount') &&
    Object.prototype.hasOwnProperty.call(value, 'currencyCode') &&
    typeof value.amount === 'string' &&
    value.amount.length <= MAX_EXACT_MONEY_LENGTH &&
    CANONICAL_DECIMAL_PATTERN.test(value.amount) &&
    value.amount !== '-0' &&
    typeof value.currencyCode === 'string' &&
    CURRENCY_PATTERN.test(value.currencyCode);
