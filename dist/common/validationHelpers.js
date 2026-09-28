"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBoundedRows = exports.hasOptionalNumbers = exports.hasOptionalStrings = exports.countTotal = exports.isCountRecord = exports.isStringArray = exports.isDateTime = exports.isCount = exports.isOptionalBoolean = exports.isOptionalFiniteNumber = exports.isFiniteNumber = exports.isOptionalString = exports.isString = exports.isRecord = void 0;
exports.asRecord = asRecord;
exports.asArray = asArray;
exports.requiredString = requiredString;
exports.requiredEnum = requiredEnum;
exports.requiredBoolean = requiredBoolean;
exports.nonNegativeInteger = nonNegativeInteger;
exports.finiteNumber = finiteNumber;
exports.isoTimestamp = isoTimestamp;
exports.assertExactKeys = assertExactKeys;
exports.assertValue = assertValue;
exports.assertUnique = assertUnique;
exports.requiredPublicIdentifier = requiredPublicIdentifier;
exports.validateGeneration = validateGeneration;
exports.assertPlainJson = assertPlainJson;
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
exports.isRecord = isRecord;
const isString = (value) => typeof value === 'string' && value.trim().length > 0;
exports.isString = isString;
const isOptionalString = (value) => value === undefined || (0, exports.isString)(value);
exports.isOptionalString = isOptionalString;
const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
exports.isFiniteNumber = isFiniteNumber;
const isOptionalFiniteNumber = (value) => value === undefined || (0, exports.isFiniteNumber)(value);
exports.isOptionalFiniteNumber = isOptionalFiniteNumber;
const isOptionalBoolean = (value) => value === undefined || typeof value === 'boolean';
exports.isOptionalBoolean = isOptionalBoolean;
const isCount = (value) => (0, exports.isFiniteNumber)(value) && Number.isInteger(value) && value >= 0;
exports.isCount = isCount;
const isDateTime = (value) => (0, exports.isString)(value) && Number.isFinite(Date.parse(value));
exports.isDateTime = isDateTime;
const isStringArray = (value) => Array.isArray(value) && value.every(exports.isString);
exports.isStringArray = isStringArray;
const isCountRecord = (value) => (0, exports.isRecord)(value) && Object.values(value).every(exports.isCount);
exports.isCountRecord = isCountRecord;
const countTotal = (value) => Object.values(value).reduce((total, count) => total + count, 0);
exports.countTotal = countTotal;
const hasOptionalStrings = (value, keys) => keys.every(key => (0, exports.isOptionalString)(value[key]));
exports.hasOptionalStrings = hasOptionalStrings;
const hasOptionalNumbers = (value, keys) => keys.every(key => (0, exports.isOptionalFiniteNumber)(value[key]));
exports.hasOptionalNumbers = hasOptionalNumbers;
const isBoundedRows = (value, limit, isRow) => {
    if (!(0, exports.isRecord)(value) || !(0, exports.isCount)(value.totalCount) || !(0, exports.isCount)(value.omittedCount) || !Array.isArray(value.rows))
        return false;
    return value.rows.length <= limit && value.rows.every(isRow) && value.totalCount === value.rows.length + value.omittedCount;
};
exports.isBoundedRows = isBoundedRows;
/*
 * Throwing assertion primitives for exact-shape boundary validators. Each
 * failure names the offending field path so rejections are diagnosable.
 */
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
function asRecord(value, field) {
    if (!(0, exports.isRecord)(value))
        throw new Error(`${field} must be a JSON object.`);
    return value;
}
function asArray(value, field, nonEmpty = false) {
    if (!Array.isArray(value) || (nonEmpty && value.length === 0))
        throw new Error(`${field} must be ${nonEmpty ? 'a non-empty' : 'an'} array.`);
    return value;
}
function requiredString(value, field) {
    if (typeof value !== 'string' || value.trim() !== value || value.length === 0)
        throw new Error(`${field} must be a non-empty trimmed string.`);
    return value;
}
function requiredEnum(value, values, field) {
    if (typeof value !== 'string' || !values.includes(value))
        throw new Error(`${field} is not declared.`);
    return value;
}
function requiredBoolean(value, field) {
    if (typeof value !== 'boolean')
        throw new Error(`${field} must be a boolean.`);
    return value;
}
function nonNegativeInteger(value, field) {
    if (!Number.isSafeInteger(value) || Number(value) < 0)
        throw new Error(`${field} must be a non-negative safe integer.`);
    return Number(value);
}
function finiteNumber(value, field) {
    if (!(0, exports.isFiniteNumber)(value))
        throw new Error(`${field} must be a finite number.`);
    return value;
}
function isoTimestamp(value, field) {
    const timestamp = requiredString(value, field);
    if (!ISO_TIMESTAMP_PATTERN.test(timestamp) || Number.isNaN(Date.parse(timestamp)))
        throw new Error(`${field} must be an ISO UTC timestamp.`);
    return timestamp;
}
function assertExactKeys(value, allowed, field) {
    const allowedKeys = new Set(allowed);
    const unknown = Object.keys(value).filter(key => !allowedKeys.has(key));
    if (unknown.length > 0)
        throw new Error(`${field} contains undeclared fields: ${unknown.sort().join(', ')}.`);
}
function assertValue(actual, expected, field) {
    if (actual !== expected)
        throw new Error(`${field} must match its exact binding.`);
}
function assertUnique(values, field) {
    if (new Set(values).size !== values.length)
        throw new Error(`${field} must not contain duplicates.`);
}
function requiredPublicIdentifier(value, field) {
    const identifier = requiredString(value, field);
    if (identifier.includes('/') || identifier.includes('\\') || identifier.includes('://') || identifier.includes('..'))
        throw new Error(`${field} must not contain a physical path or URI.`);
    return identifier;
}
/** Validates an exact `ArtifactGeneration` identity. */
function validateGeneration(value, field) {
    const generation = asRecord(value, field);
    assertExactKeys(generation, ['runId', 'generatedAt'], field);
    return {
        runId: requiredPublicIdentifier(generation.runId, `${field}.runId`),
        generatedAt: isoTimestamp(generation.generatedAt, `${field}.generatedAt`),
    };
}
/** Rejects non-JSON values and non-plain objects; `isForbiddenKey` rejects keys at every depth. */
function assertPlainJson(value, field, isForbiddenKey = () => false) {
    if (value === null || typeof value === 'string' || typeof value === 'boolean')
        return;
    if (typeof value === 'number') {
        if (!Number.isFinite(value))
            throw new Error(`${field} must contain only finite JSON numbers.`);
        return;
    }
    if (Array.isArray(value)) {
        value.forEach((item, index) => assertPlainJson(item, `${field}[${index}]`, isForbiddenKey));
        return;
    }
    if (!value || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) {
        throw new Error(`${field} must contain only plain JSON values.`);
    }
    for (const [key, child] of Object.entries(value)) {
        if (isForbiddenKey(key))
            throw new Error(`${field}.${key} is not allowed in a public artifact.`);
        assertPlainJson(child, `${field}.${key}`, isForbiddenKey);
    }
}
//# sourceMappingURL=validationHelpers.js.map