import { isRecord } from '../common/validationHelpers.js';
import { isMicrosoft365PricingDate } from './microsoft365PricingOverrides.js';
import { MICROSOFT365_ACCOUNT_CONTEXT_SCHEMA_VERSION, MICROSOFT365_LICENSE_CONTEXT_LIMITS as limits, MICROSOFT365_PRODUCT_CONTEXT_SCHEMA_VERSION, } from './microsoft365LicenseContext.js';
const productInputKeys = ['strategy', 'notes', 'reviewOn'];
const attributionKeys = ['updatedAt', 'updatedBy'];
const productKeys = ['skuId', ...productInputKeys, ...attributionKeys];
const accountKeys = ['accountId', 'notes', ...attributionKeys];
const summaryKeys = ['skuId', 'strategy', 'reviewOn', 'updatedAt', 'updatedBy', 'hasNotes'];
const exact = (value, keys) => isRecord(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null) &&
    Reflect.ownKeys(value).length === keys.length &&
    keys.every(key => Object.prototype.hasOwnProperty.call(value, key));
const text = (value, maximum) => typeof value === 'string' && value.length <= maximum;
const normalizedText = (value, maximum) => text(value, maximum) && value.trim() === value;
const identifier = (value) => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value);
const guid = (value) => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value);
const dateOrNull = (value) => value === null || isMicrosoft365PricingDate(value);
const timestamp = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value))
        return false;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) && new Date(parsed).toISOString() === (value.includes('.') ? value : value.replace('Z', '.000Z'));
};
/** Called on validated shapes. API additionally bounds actual request/storage bytes. */
const withinBytes = (value, maximum) => {
    let bytes = 0;
    for (const character of JSON.stringify(value)) {
        const code = character.codePointAt(0);
        bytes += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
        if (bytes > maximum)
            return false;
    }
    return true;
};
export const isMicrosoft365LicenseStrategy = (value) => value === 'encourage' || value === 'contain' || value === 'exit';
const productPlan = (value) => (value.strategy === null || isMicrosoft365LicenseStrategy(value.strategy)) && dateOrNull(value.reviewOn);
const attribution = (value) => timestamp(value.updatedAt) && normalizedText(value.updatedBy, limits.actorCharacters) && value.updatedBy.length > 0;
export function isMicrosoft365ProductContextInput(value) {
    return exact(value, productInputKeys) && text(value.notes, limits.noteCharacters) && productPlan(value) && withinBytes(value, limits.requestBytes);
}
export function isMicrosoft365AccountContextInput(value) {
    return exact(value, ['notes']) && text(value.notes, limits.noteCharacters) && withinBytes(value, limits.requestBytes);
}
export function isMicrosoft365ProductContext(value) {
    return (exact(value, productKeys) && guid(value.skuId) && normalizedText(value.notes, limits.noteCharacters) && productPlan(value) && attribution(value));
}
export function isMicrosoft365AccountContext(value) {
    return exact(value, accountKeys) && guid(value.accountId) && normalizedText(value.notes, limits.noteCharacters) && attribution(value);
}
const products = (value, guard) => {
    if (!Array.isArray(value) || value.length > limits.products)
        return false;
    const ids = new Set();
    for (const row of value) {
        if (!guard(row) || ids.has(row.skuId))
            return false;
        ids.add(row.skuId);
    }
    return true;
};
/** Expected binding checks supplement authorization and current subject-membership checks in API policy. */
export function isMicrosoft365ProductContextDocument(value, expected) {
    return (exact(value, ['schemaVersion', 'companyId', 'tenantId', 'products']) &&
        value.schemaVersion === MICROSOFT365_PRODUCT_CONTEXT_SCHEMA_VERSION &&
        identifier(value.companyId) &&
        identifier(value.tenantId) &&
        (!expected || (value.companyId === expected.companyId && value.tenantId === expected.tenantId)) &&
        products(value.products, isMicrosoft365ProductContext) &&
        withinBytes(value, limits.productDocumentBytes));
}
export function isMicrosoft365AccountContextDocument(value, expected) {
    return (exact(value, ['schemaVersion', 'companyId', 'tenantId', 'accountId', 'context']) &&
        value.schemaVersion === MICROSOFT365_ACCOUNT_CONTEXT_SCHEMA_VERSION &&
        identifier(value.companyId) &&
        identifier(value.tenantId) &&
        guid(value.accountId) &&
        (!expected || (value.companyId === expected.companyId && value.tenantId === expected.tenantId && value.accountId === expected.accountId)) &&
        (value.context === null || (isMicrosoft365AccountContext(value.context) && value.context.accountId === value.accountId)) &&
        withinBytes(value, limits.accountDocumentBytes));
}
const response = (value, guard) => exact(value, ['tenantId', 'context']) &&
    identifier(value.tenantId) &&
    (value.context === null || guard(value.context)) &&
    withinBytes(value, limits.accountDocumentBytes);
export const isMicrosoft365ProductContextResponse = (value) => response(value, isMicrosoft365ProductContext);
export const isMicrosoft365AccountContextResponse = (value) => response(value, isMicrosoft365AccountContext);
export function isMicrosoft365ProductContextSummary(value) {
    return exact(value, summaryKeys) && guid(value.skuId) && productPlan(value) && attribution(value) && typeof value.hasNotes === 'boolean';
}
export function isMicrosoft365ProductContextCollectionResponse(value) {
    return (exact(value, ['tenantId', 'products']) &&
        identifier(value.tenantId) &&
        products(value.products, isMicrosoft365ProductContextSummary) &&
        // Replacing empty notes with hasNotes:false adds at most six JSON bytes per entry.
        withinBytes(value, limits.productDocumentBytes + limits.products * 6));
}
