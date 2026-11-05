"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMicrosoft365PricingRevision = exports.isMicrosoft365PricingDate = void 0;
exports.isMicrosoft365PricingOverride = isMicrosoft365PricingOverride;
exports.isMicrosoft365PricingOverridesConfiguration = isMicrosoft365PricingOverridesConfiguration;
exports.isMicrosoft365PricingProjection = isMicrosoft365PricingProjection;
const record = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
const only = (value, keys) => Object.keys(value).every(key => keys.includes(key));
const text = (value, max = 256) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const isMicrosoft365PricingDate = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        return false;
    const parsed = Date.parse(`${value}T00:00:00.000Z`);
    return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === value;
};
exports.isMicrosoft365PricingDate = isMicrosoft365PricingDate;
const isMicrosoft365PricingRevision = (value) => text(value);
exports.isMicrosoft365PricingRevision = isMicrosoft365PricingRevision;
function isMicrosoft365PricingOverride(value) {
    return (record(value) &&
        only(value, ['skuId', 'currency', 'unitPriceMonthly', 'effectiveFrom', 'effectiveTo', 'source']) &&
        text(value.skuId, 128) &&
        typeof value.currency === 'string' &&
        /^[A-Z]{3}$/.test(value.currency) &&
        typeof value.unitPriceMonthly === 'number' &&
        Number.isFinite(value.unitPriceMonthly) &&
        value.unitPriceMonthly >= 0 &&
        value.unitPriceMonthly <= 1000000 &&
        Math.abs(value.unitPriceMonthly * 10000 - Math.round(value.unitPriceMonthly * 10000)) < 0.000001 &&
        (value.effectiveFrom === null || (0, exports.isMicrosoft365PricingDate)(value.effectiveFrom)) &&
        (value.effectiveTo === null ||
            ((0, exports.isMicrosoft365PricingDate)(value.effectiveTo) && (value.effectiveFrom === null || value.effectiveTo > value.effectiveFrom))) &&
        typeof value.source === 'string' &&
        value.source.length <= 256);
}
/** Shape and interval validation only. Company authorization and inventory matching remain API policy. */
function isMicrosoft365PricingOverridesConfiguration(value) {
    if (!record(value) ||
        !only(value, ['schemaVersion', 'tenantId', 'revision', 'overrides', 'updatedAt', 'updatedBy']) ||
        value.schemaVersion !== 'microsoft-365-pricing-overrides/v1' ||
        !text(value.tenantId, 128) ||
        !(0, exports.isMicrosoft365PricingRevision)(value.revision) ||
        !Array.isArray(value.overrides) ||
        value.overrides.length > 1000 ||
        !value.overrides.every(isMicrosoft365PricingOverride) ||
        !(value.updatedAt === null || (text(value.updatedAt) && Number.isFinite(Date.parse(value.updatedAt)))) ||
        !(value.updatedBy === undefined || value.updatedBy === null || text(value.updatedBy, 512)))
        return false;
    const intervals = new Map();
    for (const entry of value.overrides) {
        const key = `${entry.skuId.toLowerCase()}|${entry.currency}`;
        const group = intervals.get(key) ?? [];
        group.push(entry);
        intervals.set(key, group);
    }
    for (const entries of intervals.values()) {
        const ordered = [...entries].sort((a, b) => (a.effectiveFrom ?? '').localeCompare(b.effectiveFrom ?? ''));
        for (let index = 1; index < ordered.length; index++) {
            const previous = ordered[index - 1];
            if (previous.effectiveTo === null || ordered[index].effectiveFrom === null || previous.effectiveTo > ordered[index].effectiveFrom)
                return false;
        }
    }
    return true;
}
function isMicrosoft365PricingProjection(value) {
    return (record(value) &&
        only(value, ['status', 'revision', 'asOf', 'reason']) &&
        typeof value.status === 'string' &&
        ['applied', 'partial', 'unavailable'].includes(value.status) &&
        (0, exports.isMicrosoft365PricingRevision)(value.revision) &&
        (0, exports.isMicrosoft365PricingDate)(value.asOf) &&
        (value.reason === undefined || text(value.reason)));
}
//# sourceMappingURL=microsoft365PricingOverrides.js.map