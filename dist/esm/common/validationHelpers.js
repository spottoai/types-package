export const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
export const isString = (value) => typeof value === 'string' && value.trim().length > 0;
export const isOptionalString = (value) => value === undefined || isString(value);
export const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
export const isOptionalFiniteNumber = (value) => value === undefined || isFiniteNumber(value);
export const isOptionalBoolean = (value) => value === undefined || typeof value === 'boolean';
export const isCount = (value) => isFiniteNumber(value) && Number.isInteger(value) && value >= 0;
export const isDateTime = (value) => isString(value) && Number.isFinite(Date.parse(value));
export const isStringArray = (value) => Array.isArray(value) && value.every(isString);
export const isCountRecord = (value) => isRecord(value) && Object.values(value).every(isCount);
export const countTotal = (value) => Object.values(value).reduce((total, count) => total + count, 0);
export const hasOptionalStrings = (value, keys) => keys.every(key => isOptionalString(value[key]));
export const hasOptionalNumbers = (value, keys) => keys.every(key => isOptionalFiniteNumber(value[key]));
export const isBoundedRows = (value, limit, isRow) => {
    if (!isRecord(value) || !isCount(value.totalCount) || !isCount(value.omittedCount) || !Array.isArray(value.rows))
        return false;
    return value.rows.length <= limit && value.rows.every(isRow) && value.totalCount === value.rows.length + value.omittedCount;
};
/*
 * Throwing assertion primitives for exact-shape boundary validators. Each
 * failure names the offending field path so rejections are diagnosable.
 */
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
export function asRecord(value, field) {
    if (!isRecord(value))
        throw new Error(`${field} must be a JSON object.`);
    return value;
}
export function asArray(value, field, nonEmpty = false) {
    if (!Array.isArray(value) || (nonEmpty && value.length === 0))
        throw new Error(`${field} must be ${nonEmpty ? 'a non-empty' : 'an'} array.`);
    return value;
}
export function requiredString(value, field) {
    if (typeof value !== 'string' || value.trim() !== value || value.length === 0)
        throw new Error(`${field} must be a non-empty trimmed string.`);
    return value;
}
export function requiredEnum(value, values, field) {
    if (typeof value !== 'string' || !values.includes(value))
        throw new Error(`${field} is not declared.`);
    return value;
}
export function requiredBoolean(value, field) {
    if (typeof value !== 'boolean')
        throw new Error(`${field} must be a boolean.`);
    return value;
}
export function nonNegativeInteger(value, field) {
    if (!Number.isSafeInteger(value) || Number(value) < 0)
        throw new Error(`${field} must be a non-negative safe integer.`);
    return Number(value);
}
export function finiteNumber(value, field) {
    if (!isFiniteNumber(value))
        throw new Error(`${field} must be a finite number.`);
    return value;
}
export function isoTimestamp(value, field) {
    const timestamp = requiredString(value, field);
    if (!ISO_TIMESTAMP_PATTERN.test(timestamp) || Number.isNaN(Date.parse(timestamp)))
        throw new Error(`${field} must be an ISO UTC timestamp.`);
    return timestamp;
}
export function assertExactKeys(value, allowed, field) {
    const allowedKeys = new Set(allowed);
    const unknown = Object.keys(value).filter(key => !allowedKeys.has(key));
    if (unknown.length > 0)
        throw new Error(`${field} contains undeclared fields: ${unknown.sort().join(', ')}.`);
}
export function assertValue(actual, expected, field) {
    if (actual !== expected)
        throw new Error(`${field} must match its exact binding.`);
}
export function assertUnique(values, field) {
    if (new Set(values).size !== values.length)
        throw new Error(`${field} must not contain duplicates.`);
}
export function requiredPublicIdentifier(value, field) {
    const identifier = requiredString(value, field);
    if (identifier.includes('/') || identifier.includes('\\') || identifier.includes('://') || identifier.includes('..'))
        throw new Error(`${field} must not contain a physical path or URI.`);
    return identifier;
}
/** Validates an exact `ArtifactGeneration` identity. */
export function validateGeneration(value, field) {
    const generation = asRecord(value, field);
    assertExactKeys(generation, ['runId', 'generatedAt'], field);
    return {
        runId: requiredPublicIdentifier(generation.runId, `${field}.runId`),
        generatedAt: isoTimestamp(generation.generatedAt, `${field}.generatedAt`),
    };
}
/** Rejects non-JSON values and non-plain objects; `isForbiddenKey` rejects keys at every depth. */
export function assertPlainJson(value, field, isForbiddenKey = () => false) {
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
