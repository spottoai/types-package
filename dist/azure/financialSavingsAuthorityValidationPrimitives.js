"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canonicalizeFinancialSavingsJsonValue = exports.sumFinancialSavingsMinorUnits = exports.haveSameFinancialSavingsSet = exports.isFinancialSavingsIsoInstant = exports.isFinancialSavingsMinorUnits = exports.isFinancialSavingsHash = exports.isFinancialSavingsIdentity = exports.hasExactFinancialSavingsFields = exports.isFinancialSavingsRecord = void 0;
const SHA256_ID = /^sha256:[0-9a-f]{64}$/;
const isFinancialSavingsRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
exports.isFinancialSavingsRecord = isFinancialSavingsRecord;
const hasExactFinancialSavingsFields = (value, required, optional = []) => {
    const allowed = new Set([...required, ...optional]);
    const keys = Object.keys(value);
    return required.every(field => Object.prototype.hasOwnProperty.call(value, field)) && keys.every(field => allowed.has(field));
};
exports.hasExactFinancialSavingsFields = hasExactFinancialSavingsFields;
const isFinancialSavingsIdentity = (value) => typeof value === 'string' && value.length > 0 && value.length <= 2048 && value.trim() === value;
exports.isFinancialSavingsIdentity = isFinancialSavingsIdentity;
const isFinancialSavingsHash = (value) => typeof value === 'string' && SHA256_ID.test(value);
exports.isFinancialSavingsHash = isFinancialSavingsHash;
const isFinancialSavingsMinorUnits = (value) => Number.isSafeInteger(value) && Number(value) >= 0;
exports.isFinancialSavingsMinorUnits = isFinancialSavingsMinorUnits;
const isFinancialSavingsIsoInstant = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && Number.isFinite(Date.parse(value));
exports.isFinancialSavingsIsoInstant = isFinancialSavingsIsoInstant;
const haveSameFinancialSavingsSet = (left, right) => {
    if (left.length !== right.length)
        return false;
    const sortedLeft = [...left].sort();
    const sortedRight = [...right].sort();
    return sortedLeft.every((value, index) => value === sortedRight[index]);
};
exports.haveSameFinancialSavingsSet = haveSameFinancialSavingsSet;
const sumFinancialSavingsMinorUnits = (values) => {
    const total = values.reduce((sum, value) => sum + BigInt(value), 0n);
    return total <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(total) : undefined;
};
exports.sumFinancialSavingsMinorUnits = sumFinancialSavingsMinorUnits;
const canonicalizeFinancialSavingsJsonValue = (value) => {
    if (Array.isArray(value))
        return value.map(exports.canonicalizeFinancialSavingsJsonValue);
    if (!(0, exports.isFinancialSavingsRecord)(value))
        return value;
    return Object.fromEntries(Object.keys(value)
        .sort()
        .map(key => [key, (0, exports.canonicalizeFinancialSavingsJsonValue)(value[key])]));
};
exports.canonicalizeFinancialSavingsJsonValue = canonicalizeFinancialSavingsJsonValue;
//# sourceMappingURL=financialSavingsAuthorityValidationPrimitives.js.map