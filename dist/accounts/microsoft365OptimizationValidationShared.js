"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consistentCoverage = exports.byKind = exports.coverage = exports.currentHistory = exports.consecutiveMonths = exports.monthNumber = exports.month = exports.timestamp = exports.date = exports.codes = exports.identifiers = exports.unique = exports.list = exports.choice = exports.unitPrice = exports.money = exports.amount = exports.minorUnits = exports.nullableCount = exports.count = exports.guid = exports.code = exports.token = exports.text = exports.keys = exports.row = void 0;
const row = (value) => !!value && typeof value === 'object' && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
exports.row = row;
const keys = (value, allowed) => Object.keys(value).every(key => allowed.includes(key));
exports.keys = keys;
const text = (value) => typeof value === 'string' &&
    value.length > 0 &&
    value.length <= 512 &&
    value.trim() === value &&
    [...value].every(character => {
        const point = character.codePointAt(0);
        return (point >= 32 &&
            !(point >= 127 && point <= 159) &&
            !(point >= 0xd800 && point <= 0xdfff) &&
            ![0x200e, 0x200f, 0x202a, 0x202b, 0x202c, 0x202d, 0x202e, 0x2066, 0x2067, 0x2068, 0x2069].includes(point));
    });
exports.text = text;
const token = (value) => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value);
exports.token = token;
const code = (value) => typeof value === 'string' && /^[a-z][a-z0-9_-]{0,95}$/.test(value);
exports.code = code;
const guid = (value) => typeof value === 'string' && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value);
exports.guid = guid;
const count = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
exports.count = count;
const nullableCount = (value) => value === null || (0, exports.count)(value);
exports.nullableCount = nullableCount;
const minorUnits = (value) => {
    if (typeof value !== 'number' || !Number.isFinite(value))
        return null;
    const scaled = value * 100, rounded = Math.round(scaled);
    return Number.isSafeInteger(rounded) && Math.abs(scaled - rounded) <= 0.0001 ? rounded : null;
};
exports.minorUnits = minorUnits;
const amount = (value) => (0, exports.minorUnits)(value) !== null;
exports.amount = amount;
const money = (value) => value === null || ((0, exports.amount)(value) && value >= 0);
exports.money = money;
const unitPrice = (value) => value === null ||
    (typeof value === 'number' &&
        Number.isFinite(value) &&
        value >= 0 &&
        Number.isSafeInteger(Math.round(value * 10000)) &&
        Math.abs(value * 10000 - Math.round(value * 10000)) <= 0.0001);
exports.unitPrice = unitPrice;
const choice = (value, values) => typeof value === 'string' && values.includes(value);
exports.choice = choice;
const list = (value, limit, check) => Array.isArray(value) &&
    Object.getPrototypeOf(value) === Array.prototype &&
    value.length <= limit &&
    Object.keys(value).length === value.length &&
    Array.from(value).every(check);
exports.list = list;
const unique = (value, identity = item => item) => new Set(value.map(identity)).size === value.length;
exports.unique = unique;
const identifiers = (value, limit = 128, check = exports.guid) => (0, exports.list)(value, limit, check) && (0, exports.unique)(value, item => String(item).toLowerCase());
exports.identifiers = identifiers;
const codes = (value) => (0, exports.identifiers)(value, 128, exports.code);
exports.codes = codes;
const date = (value) => typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(`${value}T00:00:00Z`)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
exports.date = date;
const timestamp = (value) => typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) &&
    (0, exports.date)(value.slice(0, 10)) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 19) === value.slice(0, 19);
exports.timestamp = timestamp;
const month = (value) => typeof value === 'string' && /^\d{4}-\d{2}$/.test(value) && (0, exports.date)(`${value}-01`);
exports.month = month;
const monthNumber = (value) => Number(value.slice(0, 4)) * 12 + Number(value.slice(5, 7)) - 1;
exports.monthNumber = monthNumber;
const consecutiveMonths = (value) => (0, exports.identifiers)(value, 6, exports.month) &&
    value.length === 6 &&
    value.every((item, index) => index === 0 || (0, exports.monthNumber)(item) === (0, exports.monthNumber)(value[index - 1]) + 1);
exports.consecutiveMonths = consecutiveMonths;
const currentHistory = (value, generatedAt) => (0, exports.consecutiveMonths)(value) && (0, exports.monthNumber)(value[5]) === (0, exports.monthNumber)(generatedAt) - 1;
exports.currentHistory = currentHistory;
const coverage = (value) => (0, exports.row)(value) &&
    (0, exports.keys)(value, ['state', 'reasonCodes']) &&
    (0, exports.codes)(value.reasonCodes) &&
    (value.state === 'complete' ? value.reasonCodes.length === 0 : (0, exports.choice)(value.state, ['partial', 'unavailable']) && value.reasonCodes.length > 0);
exports.coverage = coverage;
const byKind = (value) => (0, exports.row)(value) &&
    (0, exports.keys)(value, ['combineLicenses', 'addProtection', 'changeTerm']) &&
    (0, exports.coverage)(value.combineLicenses) &&
    (0, exports.coverage)(value.addProtection) &&
    (0, exports.coverage)(value.changeTerm);
exports.byKind = byKind;
const consistentCoverage = (overall, channels, omitted) => {
    const states = Object.values(channels).map(item => item.state);
    if (overall.state === 'complete')
        return !omitted && states.every(state => state === 'complete');
    if (overall.state === 'unavailable')
        return states.every(state => state === 'unavailable');
    return !states.every(state => state === 'unavailable') && (omitted || states.some(state => state !== 'complete'));
};
exports.consistentCoverage = consistentCoverage;
//# sourceMappingURL=microsoft365OptimizationValidationShared.js.map