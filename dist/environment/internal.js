"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasSafeContainerShape = exports.utf8ByteLength = exports.isCanonicalUtcTimestamp = exports.isNonNegativeInteger = exports.isSourceIdentity = exports.isScopeIdentifier = exports.isSafeLabel = exports.isCustomerString = exports.isBoundedString = exports.hasExactKeys = exports.isRecord = exports.hasControlCharacter = exports.PROTOTYPE_KEYS = exports.CURRENCY_PATTERN = exports.DECIMAL_PATTERN = exports.ENVIRONMENT_RUN_ID_PATTERN = exports.SHA256_PATTERN = void 0;
const contracts_js_1 = require("./contracts.js");
exports.SHA256_PATTERN = /^[a-f0-9]{64}$/u;
exports.ENVIRONMENT_RUN_ID_PATTERN = /^[A-Za-z0-9._-]+$/u;
exports.DECIMAL_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d+)?$/u;
exports.CURRENCY_PATTERN = /^[A-Z]{3}$/u;
exports.PROTOTYPE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const hasControlCharacter = (value) => {
    for (const character of value) {
        const codePoint = character.codePointAt(0);
        if (codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f))
            return true;
    }
    return false;
};
exports.hasControlCharacter = hasControlCharacter;
const isRecord = (value) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
};
exports.isRecord = isRecord;
const hasExactKeys = (value, required, optional = []) => {
    const allowed = new Set([...required, ...optional]);
    const keys = Object.keys(value);
    return required.every(key => Object.prototype.hasOwnProperty.call(value, key)) && keys.every(key => allowed.has(key) && !exports.PROTOTYPE_KEYS.has(key));
};
exports.hasExactKeys = hasExactKeys;
const scalarLength = (value) => {
    let count = 0;
    for (let index = 0; index < value.length; index += 1) {
        const codeUnit = value.charCodeAt(index);
        if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
            const trailing = value.charCodeAt(index + 1);
            if (!(trailing >= 0xdc00 && trailing <= 0xdfff))
                return null;
            index += 1;
        }
        else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
            return null;
        }
        count += 1;
    }
    return count;
};
const isBoundedString = (value, maximumScalars, options = {}) => {
    if (typeof value !== 'string')
        return false;
    if (options.trimmed && (value.length === 0 || value.trim() !== value))
        return false;
    if (options.controls && (0, exports.hasControlCharacter)(value))
        return false;
    const length = scalarLength(value);
    return length !== null && length <= maximumScalars;
};
exports.isBoundedString = isBoundedString;
const isCustomerString = (value) => (0, exports.isBoundedString)(value, contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.customerStringScalars, { controls: true });
exports.isCustomerString = isCustomerString;
const isSafeLabel = (value) => (0, exports.isBoundedString)(value, contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.safeLabelScalars, { trimmed: true, controls: true });
exports.isSafeLabel = isSafeLabel;
const isScopeIdentifier = (value) => (0, exports.isBoundedString)(value, contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.scopeIdentifierScalars, { trimmed: true, controls: true });
exports.isScopeIdentifier = isScopeIdentifier;
const isSourceIdentity = (value) => (0, exports.isBoundedString)(value, contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.sourceIdentityScalars, { trimmed: true, controls: true });
exports.isSourceIdentity = isSourceIdentity;
const isNonNegativeInteger = (value) => Number.isSafeInteger(value) && value >= 0;
exports.isNonNegativeInteger = isNonNegativeInteger;
const isCanonicalUtcTimestamp = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value))
        return false;
    const milliseconds = Date.parse(value);
    return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString() === value;
};
exports.isCanonicalUtcTimestamp = isCanonicalUtcTimestamp;
const utf8ByteLength = (value) => {
    let bytes = 0;
    for (const character of value) {
        const codePoint = character.codePointAt(0);
        if (codePoint <= 0x7f)
            bytes += 1;
        else if (codePoint <= 0x7ff)
            bytes += 2;
        else if (codePoint <= 0xffff)
            bytes += 3;
        else
            bytes += 4;
    }
    return bytes;
};
exports.utf8ByteLength = utf8ByteLength;
const hasSafeContainerShape = (value, depth = 0, seen = new Set()) => {
    if (depth > contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.validatedContainerDepth)
        return false;
    if (typeof value !== 'object' || value === null)
        return true;
    if (seen.has(value))
        return false;
    seen.add(value);
    if (Array.isArray(value)) {
        const valid = value.length <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems && value.every(item => (0, exports.hasSafeContainerShape)(item, depth + 1, seen));
        seen.delete(value);
        return valid;
    }
    if (!(0, exports.isRecord)(value))
        return false;
    const valid = Object.keys(value).every(key => !exports.PROTOTYPE_KEYS.has(key) && (0, exports.hasSafeContainerShape)(value[key], depth + 1, seen));
    seen.delete(value);
    return valid;
};
exports.hasSafeContainerShape = hasSafeContainerShape;
//# sourceMappingURL=internal.js.map