"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBoundedRows = exports.hasOptionalNumbers = exports.hasOptionalStrings = exports.countTotal = exports.isCountRecord = exports.isStringArray = exports.isDateTime = exports.isCount = exports.isOptionalBoolean = exports.isOptionalFiniteNumber = exports.isFiniteNumber = exports.isOptionalString = exports.isString = exports.isRecord = void 0;
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
//# sourceMappingURL=validationHelpers.js.map