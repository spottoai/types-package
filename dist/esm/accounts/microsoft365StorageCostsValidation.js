import { isMicrosoft365ContentAvailability } from './microsoft365LicensingContentValidation.js';
import { MICROSOFT_365_STORAGE_PRODUCTS } from './microsoft365StorageCosts.js';
import { isMicrosoft365UsageDate } from './microsoft365Usage.js';
const exact = (value, keys) => !!value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).every(key => keys.includes(key));
const text = (value) => typeof value === 'string' && value.trim() === value && value.length > 0 && value.length <= 200;
const nonnegative = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const nullableNumber = (value) => value === null || nonnegative(value);
const choice = (value, values) => typeof value === 'string' && values.includes(value);
const product = (value) => choice(value, MICROSOFT_365_STORAGE_PRODUCTS);
const availability = (value) => isMicrosoft365ContentAvailability(value) &&
    [...value.reasonCodes, ...value.requiredPermissions].every(item => typeof item === 'string') &&
    (value.state === 'available' ? value.reasonCodes.length === 0 : value.reasonCodes.length > 0);
const moneyAvailable = (amount, state) => state === 'available' ? amount !== null : state !== 'unavailable' || amount === null;
const unique = (values) => new Set(values).size === values.length;
const list = (value, limit, guard) => {
    if (!Array.isArray(value) || value.length > limit)
        return false;
    for (const item of value)
        if (!guard(item))
            return false;
    return true;
};
function rateSource(value) {
    return (exact(value, ['kind', 'url', 'checkedAt']) &&
        choice(value.kind, ['microsoft_public', 'reseller', 'azure_retail', 'customer_agreement']) &&
        isMicrosoft365UsageDate(value.checkedAt) &&
        ((value.kind === 'customer_agreement' && value.url === null) ||
            (typeof value.url === 'string' && value.url.length <= 2048 && /^https:\/\/[^/?#\s@]+(?:[/?#][^\s]*)?$/iu.test(value.url))));
}
/** No guessed currency, seat rate, negative reference price or implicit day/month conversion. */
export function isMicrosoft365StorageRate(value) {
    if (!exact(value, ['id', 'product', 'unit', 'bytesPerGb', 'amount', 'term', 'taxTreatment', 'source', 'quote', 'availability']) ||
        !text(value.id) ||
        !product(value.product) ||
        !choice(value.unit, ['gb_month', 'gb_day']) ||
        !(value.bytesPerGb === null || (Number.isSafeInteger(value.bytesPerGb) && Number(value.bytesPerGb) > 0)) ||
        !nullableNumber(value.amount) ||
        !choice(value.term, ['annual_commitment', 'monthly', 'pay_as_you_go', 'unspecified']) ||
        !choice(value.taxTreatment, ['inclusive', 'exclusive', 'unspecified']) ||
        !(value.source === null || rateSource(value.source)) ||
        !availability(value.availability))
        return false;
    const rate = value;
    if (!moneyAvailable(rate.amount, rate.availability.state) || (rate.amount !== null && rate.source === null))
        return false;
    if ((rate.unit === 'gb_day') !== (rate.term === 'pay_as_you_go'))
        return false;
    if (rate.product === 'sharepoint-extra-file-storage' && (rate.bytesPerGb !== 1073741824 || rate.unit !== 'gb_month'))
        return false;
    if (rate.quote === null)
        return true;
    if (!exact(rate.quote, ['amount', 'period', 'normalizationDivisor']) || !nonnegative(rate.quote.amount))
        return false;
    const divisor = rate.quote.period === 'year' && rate.unit === 'gb_month'
        ? 12
        : (rate.quote.period === 'month' && rate.unit === 'gb_month') || (rate.quote.period === 'day' && rate.unit === 'gb_day')
            ? 1
            : null;
    return (divisor !== null &&
        rate.quote.normalizationDivisor === divisor &&
        rate.amount !== null &&
        Math.abs(rate.amount - rate.quote.amount / divisor) <= Math.max(1e-9, Math.abs(rate.amount) * 1e-12));
}
export function isMicrosoft365StorageCostEstimate(value) {
    if (!exact(value, [
        'id',
        'product',
        'purpose',
        'skuPartNumber',
        'rateId',
        'quantityGb',
        'period',
        'chargeableDays',
        'amount',
        'basis',
        'availability',
    ]) ||
        !text(value.id) ||
        !product(value.product) ||
        !choice(value.purpose, ['purchased_capacity', 'usage_capacity', 'unassigned_license_capacity_replacement']) ||
        !(value.skuPartNumber === null || text(value.skuPartNumber)) ||
        !(value.rateId === null || text(value.rateId)) ||
        !nullableNumber(value.quantityGb) ||
        !nullableNumber(value.amount) ||
        !choice(value.basis, ['reference_price_estimate', 'agreed_price_estimate']) ||
        !availability(value.availability))
        return false;
    const estimate = value;
    if (!moneyAvailable(estimate.amount, estimate.availability.state))
        return false;
    if (estimate.amount !== null && (estimate.quantityGb === null || estimate.rateId === null))
        return false;
    if (estimate.purpose === 'unassigned_license_capacity_replacement' && estimate.skuPartNumber === null)
        return false;
    if (exact(estimate.period, ['kind']) && estimate.period.kind === 'month')
        return estimate.chargeableDays === null;
    if (!exact(estimate.period, ['kind', 'startDate', 'endDate']) ||
        estimate.period.kind !== 'window' ||
        !isMicrosoft365UsageDate(estimate.period.startDate) ||
        !isMicrosoft365UsageDate(estimate.period.endDate) ||
        estimate.period.startDate > estimate.period.endDate)
        return false;
    const windowDays = (Date.parse(estimate.period.endDate) - Date.parse(estimate.period.startDate)) / 86400000 + 1;
    return estimate.chargeableDays === null
        ? estimate.amount === null
        : Number.isSafeInteger(estimate.chargeableDays) && estimate.chargeableDays > 0 && estimate.chargeableDays <= windowDays;
}
function matchingRate(estimate, rates) {
    if (estimate.rateId === null)
        return estimate.amount === null;
    const rate = rates.get(estimate.rateId);
    if (!rate || rate.product !== estimate.product)
        return false;
    if ((rate.unit === 'gb_month') !== (estimate.period.kind === 'month'))
        return false;
    if (rate.source !== null && (rate.source.kind === 'customer_agreement') !== (estimate.basis === 'agreed_price_estimate'))
        return false;
    if (estimate.amount === null)
        return true;
    if (rate.amount === null || rate.source === null || estimate.quantityGb === null)
        return false;
    if (estimate.availability.state === 'available' && rate.availability.state !== 'available')
        return false;
    const expected = estimate.quantityGb * rate.amount * (rate.unit === 'gb_day' ? (estimate.chargeableDays ?? NaN) : 1);
    return Number.isFinite(expected) && Math.abs(estimate.amount - expected) <= Math.max(1e-9, Math.abs(expected) * 1e-12);
}
/** Rates and comparisons are bounded and referenced within their own ISO-currency group. */
export function isMicrosoft365StorageCostView(value) {
    if (!exact(value, ['generatedAt', 'availability', 'currencies']) ||
        typeof value.generatedAt !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}T/u.test(value.generatedAt) ||
        !isMicrosoft365UsageDate(value.generatedAt.slice(0, 10)) ||
        !Number.isFinite(Date.parse(value.generatedAt)) ||
        !availability(value.availability) ||
        !Array.isArray(value.currencies) ||
        value.currencies.length > 32)
        return false;
    const currencies = [];
    for (const group of value.currencies) {
        if (!exact(group, ['currency', 'rates', 'estimates']) ||
            typeof group.currency !== 'string' ||
            !/^[A-Z]{3}$/u.test(group.currency) ||
            !list(group.rates, 128, isMicrosoft365StorageRate) ||
            !list(group.estimates, 512, isMicrosoft365StorageCostEstimate))
            return false;
        currencies.push(group.currency);
        const rates = group.rates;
        const estimates = group.estimates;
        if (!unique(rates.map(rate => rate.id)) || !unique(estimates.map(estimate => estimate.id)))
            return false;
        const indexedRates = new Map(rates.map(rate => [rate.id, rate]));
        if (estimates.some(estimate => !matchingRate(estimate, indexedRates)))
            return false;
        if (value.availability.state === 'available' &&
            (rates.some(rate => rate.availability.state !== 'available') || estimates.some(estimate => estimate.availability.state !== 'available')))
            return false;
    }
    const state = value.availability.state;
    return unique(currencies) && (state === 'available' ? currencies.length > 0 : state !== 'unavailable' || currencies.length === 0);
}
