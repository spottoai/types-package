"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRecord = isRecord;
exports.hasOnlyKeys = hasOnlyKeys;
exports.isBoundedString = isBoundedString;
exports.isOptionalBoundedString = isOptionalBoundedString;
exports.isPositiveInteger = isPositiveInteger;
exports.isNonNegativeInteger = isNonNegativeInteger;
exports.isIsoTimestamp = isIsoTimestamp;
exports.isDate = isDate;
exports.isTime = isTime;
exports.isCurrency = isCurrency;
exports.isNonNegativeDecimal = isNonNegativeDecimal;
exports.isIanaTimezone = isIanaTimezone;
exports.isWithinJsonByteLimit = isWithinJsonByteLimit;
exports.isBoundedStringArray = isBoundedStringArray;
exports.containsForbiddenKey = containsForbiddenKey;
exports.isBoundedParameters = isBoundedParameters;
exports.isCapabilityRef = isCapabilityRef;
const resourceStrategyContracts_1 = require("./resourceStrategyContracts");
const FORBIDDEN_AUTHORING_KEYS = new Set([
    '__proto__',
    'prototype',
    'constructor',
    'actionId',
    'actionRef',
    'actionDefinitionId',
    'actionDefinitionRef',
    'workflowRef',
    'operation',
    'providerOperation',
    'compiledOperation',
    'httpMethod',
    'endpoint',
    'apiVersion',
    'requestTemplate',
    'permissions',
    'permissionActions',
    'permissionSetRef',
    'permissionSetRefs',
    'baseline',
    'baselineRef',
    'selectorRef',
    'restoreBaseline',
    'compiledDueRow',
]);
const INHERITED_FORBIDDEN_AUTHORING_KEYS = [...FORBIDDEN_AUTHORING_KEYS].filter(key => key !== '__proto__' && key !== 'prototype' && key !== 'constructor');
function isRecord(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value))
        return false;
    try {
        const prototype = Object.getPrototypeOf(value);
        if (prototype !== Object.prototype && prototype !== null)
            return false;
        return Reflect.ownKeys(value).every(key => {
            if (typeof key !== 'string')
                return false;
            const descriptor = Object.getOwnPropertyDescriptor(value, key);
            return descriptor !== undefined && descriptor.enumerable && 'value' in descriptor;
        });
    }
    catch {
        return false;
    }
}
function hasOnlyKeys(value, allowed) {
    try {
        const allowedSet = new Set(allowed);
        return (Object.keys(value).every(key => allowedSet.has(key)) &&
            allowed.every(key => !Reflect.has(value, key) || Object.prototype.hasOwnProperty.call(value, key)));
    }
    catch {
        return false;
    }
}
function isBoundedString(value, maximum = resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.textLength) {
    return typeof value === 'string' && value.length > 0 && value.length <= maximum;
}
function isOptionalBoundedString(value, maximum = resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.textLength) {
    return value === undefined || isBoundedString(value, maximum);
}
function isPositiveInteger(value) {
    return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}
function isNonNegativeInteger(value) {
    return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
function isIsoTimestamp(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value))
        return false;
    const instant = new Date(value);
    if (!Number.isFinite(instant.getTime()))
        return false;
    const canonical = instant.toISOString();
    return value.includes('.') ? canonical === value : canonical.replace('.000Z', 'Z') === value;
}
function isDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function isTime(value) {
    return typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}
function isCurrency(value) {
    return typeof value === 'string' && /^[A-Z]{3}$/.test(value);
}
function isNonNegativeDecimal(value) {
    return typeof value === 'string' && /^\d{1,15}(?:\.\d{1,8})?$/.test(value);
}
function isIanaTimezone(value) {
    if (!isBoundedString(value, 100))
        return false;
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: value }).format(0);
        return true;
    }
    catch {
        return false;
    }
}
function jsonStringByteLengthWithin(value, maximum) {
    let bytes = 2;
    for (let index = 0; index < value.length; index += 1) {
        const codeUnit = value.charCodeAt(index);
        if (codeUnit === 0x22 ||
            codeUnit === 0x5c ||
            codeUnit === 0x08 ||
            codeUnit === 0x09 ||
            codeUnit === 0x0a ||
            codeUnit === 0x0c ||
            codeUnit === 0x0d) {
            bytes += 2;
        }
        else if (codeUnit <= 0x1f ||
            (codeUnit >= 0xd800 &&
                codeUnit <= 0xdfff &&
                !(codeUnit <= 0xdbff && index + 1 < value.length && value.charCodeAt(index + 1) >= 0xdc00 && value.charCodeAt(index + 1) <= 0xdfff))) {
            bytes += 6;
        }
        else if (codeUnit <= 0x7f) {
            bytes += 1;
        }
        else if (codeUnit <= 0x7ff) {
            bytes += 2;
        }
        else if (codeUnit <= 0xdbff) {
            bytes += 4;
            index += 1;
        }
        else {
            bytes += 3;
        }
        if (bytes > maximum)
            return null;
    }
    return bytes;
}
function isWithinJsonByteLimit(value, maximum) {
    if (!Number.isSafeInteger(maximum) || maximum < 0)
        return false;
    const stack = [value];
    let bytes = 0;
    let nodes = 0;
    try {
        while (stack.length > 0) {
            nodes += 1;
            if (nodes > 10000)
                return false;
            const current = stack.pop();
            if (current === null) {
                bytes += 4;
            }
            else if (typeof current === 'string') {
                const stringBytes = jsonStringByteLengthWithin(current, maximum - bytes);
                if (stringBytes === null)
                    return false;
                bytes += stringBytes;
            }
            else if (typeof current === 'number') {
                if (!Number.isFinite(current))
                    return false;
                bytes += String(Object.is(current, -0) ? 0 : current).length;
            }
            else if (typeof current === 'boolean') {
                bytes += current ? 4 : 5;
            }
            else if (Array.isArray(current)) {
                bytes += 2 + Math.max(0, current.length - 1);
                if (bytes > maximum)
                    return false;
                const ownKeys = Reflect.ownKeys(current);
                if (ownKeys.length !== current.length + 1 || !ownKeys.includes('length'))
                    return false;
                for (let index = 0; index < current.length; index += 1) {
                    const descriptor = Object.getOwnPropertyDescriptor(current, String(index));
                    if (descriptor === undefined || !descriptor.enumerable || !('value' in descriptor))
                        return false;
                    stack.push(descriptor.value);
                }
            }
            else if (isRecord(current)) {
                const keys = Object.keys(current);
                bytes += 2 + Math.max(0, keys.length - 1);
                if (bytes > maximum)
                    return false;
                for (const key of keys) {
                    const keyBytes = jsonStringByteLengthWithin(key, maximum - bytes);
                    if (keyBytes === null)
                        return false;
                    bytes += keyBytes + 1;
                    if (bytes > maximum)
                        return false;
                    const descriptor = Object.getOwnPropertyDescriptor(current, key);
                    if (descriptor === undefined || !('value' in descriptor))
                        return false;
                    stack.push(descriptor.value);
                }
            }
            else {
                return false;
            }
            if (bytes > maximum)
                return false;
        }
        return true;
    }
    catch {
        return false;
    }
}
function isBoundedStringArray(value, maximum = resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.metadataItems) {
    return Array.isArray(value) && value.length <= maximum && value.every(item => isBoundedString(item, 2000));
}
function containsForbiddenKey(value, depth = 0) {
    try {
        if (depth > 8)
            return true;
        if (value !== null && typeof value === 'object') {
            if (INHERITED_FORBIDDEN_AUTHORING_KEYS.some(key => Reflect.has(value, key) && !Object.prototype.hasOwnProperty.call(value, key))) {
                return true;
            }
        }
        if (Array.isArray(value))
            return value.some(item => containsForbiddenKey(item, depth + 1));
        if (!isRecord(value))
            return false;
        return Object.keys(value).some(key => FORBIDDEN_AUTHORING_KEYS.has(key) || containsForbiddenKey(value[key], depth + 1));
    }
    catch {
        return true;
    }
}
function isBoundedJsonValue(value, depth = 0) {
    if (depth > 8)
        return false;
    if (value === null || typeof value === 'boolean' || typeof value === 'string')
        return true;
    if (typeof value === 'number')
        return Number.isFinite(value);
    if (Array.isArray(value))
        return value.length <= 128 && value.every(item => isBoundedJsonValue(item, depth + 1));
    if (!isRecord(value) || Object.keys(value).length > 128)
        return false;
    return Object.entries(value).every(([key, item]) => !FORBIDDEN_AUTHORING_KEYS.has(key) && isBoundedJsonValue(item, depth + 1));
}
function isBoundedParameters(value) {
    if (!isWithinJsonByteLimit(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.parameterBytes))
        return false;
    return isRecord(value) && isBoundedJsonValue(value) && !containsForbiddenKey(value);
}
function isCapabilityRef(value) {
    return (isRecord(value) &&
        hasOnlyKeys(value, ['capabilityId', 'capabilityVersion']) &&
        isBoundedString(value.capabilityId, 200) &&
        isPositiveInteger(value.capabilityVersion));
}
//# sourceMappingURL=resourceStrategyValidationShared.js.map