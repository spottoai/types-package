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
