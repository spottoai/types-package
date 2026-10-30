"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestChronologyValid = exports.input = exports.decodedBytes = exports.safeJson = exports.httpUrl = exports.timestamp = exports.choice = exports.number = exports.unique = exports.list = exports.identifier = exports.text = exports.shape = exports.record = exports.invalid = void 0;
const failures_1 = require("./failures");
const contracts_1 = require("./contracts");
const invalid = (field) => {
    throw new failures_1.TerminalAssessmentError(`invalid-assessment-field:${field}`);
};
exports.invalid = invalid;
const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
const hasControls = (value, allowFormatting = false) => {
    for (const character of value) {
        const code = character.charCodeAt(0);
        if (allowFormatting && (code === 9 || code === 10 || code === 13))
            continue;
        if (code <= 31 || (code >= 127 && code <= 159))
            return true;
    }
    return false;
};
const record = (value, field) => {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return (0, exports.invalid)(field);
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null)
        return (0, exports.invalid)(field);
    return value;
};
exports.record = record;
const shape = (value, required, optional = []) => {
    const row = (0, exports.record)(value, required.join('/'));
    const allowed = new Set([...required, ...optional]);
    if (required.some(key => !Object.prototype.hasOwnProperty.call(row, key)) || Object.keys(row).some(key => !allowed.has(key)))
        return (0, exports.invalid)('object keys');
    return row;
};
exports.shape = shape;
const text = (value, maximum = contracts_1.FRAMEWORK_ASSESSMENT_LIMITS.textLength, allowEmpty = true) => {
    if (typeof value !== 'string' || value.length > maximum || (!allowEmpty && (!value.trim() || value.trim() !== value)))
        return (0, exports.invalid)('text');
    // Human descriptions and code may contain line breaks and tabs; other controls are forbidden.
    if (hasControls(value, true))
        return (0, exports.invalid)('text controls');
    for (let index = 0; index < value.length; index++) {
        const unit = value.charCodeAt(index);
        if (unit >= 0xd800 && unit <= 0xdbff) {
            const trailing = value.charCodeAt(++index);
            if (!(trailing >= 0xdc00 && trailing <= 0xdfff))
                return (0, exports.invalid)('unicode');
        }
        else if (unit >= 0xdc00 && unit <= 0xdfff)
            return (0, exports.invalid)('unicode');
    }
    return value;
};
exports.text = text;
const identifier = (value, maximum = 256) => {
    const result = (0, exports.text)(value, maximum, false);
    return hasControls(result) ? (0, exports.invalid)('identifier') : result;
};
exports.identifier = identifier;
const list = (value, maximum = contracts_1.FRAMEWORK_ASSESSMENT_LIMITS.catalogueItems) => Array.isArray(value) && value.length <= maximum ? value : (0, exports.invalid)('list');
exports.list = list;
const unique = (values) => (new Set(values).size === values.length ? values : (0, exports.invalid)('duplicates'));
exports.unique = unique;
const number = (value, maximum = Number.MAX_SAFE_INTEGER) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= maximum ? value : (0, exports.invalid)('count');
exports.number = number;
const choice = (value, choices) => typeof value === 'string' && choices.includes(value) ? value : (0, exports.invalid)('enum');
exports.choice = choice;
const timestamp = (value) => {
    const result = (0, exports.text)(value, 24, false);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(result))
        return (0, exports.invalid)('timestamp');
    const milliseconds = Date.parse(result);
    return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString() === result ? result : (0, exports.invalid)('timestamp');
};
exports.timestamp = timestamp;
const httpUrl = (value, allowEmpty = false) => {
    const result = (0, exports.text)(value, 8192);
    if (allowEmpty && result === '')
        return result;
    if (/[\s\\]/u.test(result) || hasControls(result) || /%(?![\da-f]{2})/iu.test(result))
        return (0, exports.invalid)('URL');
    const match = /^https?:\/\/([^/?#]+)(?:[/?#].*)?$/iu.exec(result);
    if (!match || match[1].includes('@'))
        return (0, exports.invalid)('URL');
    // All supported Node/browser/Worker runtimes provide the pure WHATWG URL parser.
    // A structural type keeps this subpath independent of DOM and Node declarations.
    const Url = globalThis.URL;
    try {
        const parsed = new Url(result);
        if (parsed.username || parsed.password || !['http:', 'https:'].includes(parsed.protocol))
            return (0, exports.invalid)('URL');
    }
    catch {
        return (0, exports.invalid)('URL');
    }
    const authority = match[1];
    const hostPort = /^(\[[0-9a-f:]+\]|[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?)(?::([0-9]{1,5}))?$/iu.exec(authority);
    if (!hostPort || (hostPort[2] !== undefined && Number(hostPort[2]) > 65535))
        return (0, exports.invalid)('URL host');
    if (!hostPort[1].startsWith('[') && hostPort[1].split('.').some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/iu.test(label)))
        return (0, exports.invalid)('URL host');
    return result;
};
exports.httpUrl = httpUrl;
/** Inspects descriptors before reading values, rejects cycles, accessors, prototypes and non-JSON values. */
const safeJson = (value) => {
    let nodes = 0;
    const active = new Set();
    const visit = (child, depth) => {
        if (++nodes > contracts_1.FRAMEWORK_ASSESSMENT_LIMITS.jsonNodes || depth > contracts_1.FRAMEWORK_ASSESSMENT_LIMITS.jsonDepth)
            return (0, exports.invalid)('JSON budget');
        if (child === null || typeof child === 'boolean')
            return child;
        if (typeof child === 'string')
            return (0, exports.text)(child);
        if (typeof child === 'number')
            return Number.isFinite(child) ? child : (0, exports.invalid)('JSON number');
        if (!child || typeof child !== 'object' || active.has(child) || Object.getOwnPropertySymbols(child).length)
            return (0, exports.invalid)('JSON value');
        active.add(child);
        const descriptors = Object.getOwnPropertyDescriptors(child);
        let result;
        if (Array.isArray(child)) {
            if (child.length > contracts_1.FRAMEWORK_ASSESSMENT_LIMITS.jsonNodes || Object.keys(descriptors).some(key => key !== 'length' && !/^(0|[1-9]\d*)$/u.test(key)))
                return (0, exports.invalid)('JSON array');
            result = [];
            for (let index = 0; index < child.length; index++) {
                const descriptor = descriptors[String(index)];
                if (!descriptor || !('value' in descriptor) || !descriptor.enumerable)
                    return (0, exports.invalid)('JSON array item');
                result.push(visit(descriptor.value, depth + 1));
            }
        }
        else {
            (0, exports.record)(child, 'JSON object');
            const object = {};
            for (const [key, descriptor] of Object.entries(descriptors)) {
                if (forbidden.has(key) || key.length > 256 || !('value' in descriptor) || !descriptor.enumerable || hasControls(key))
                    return (0, exports.invalid)('JSON key');
                object[key] = visit(descriptor.value, depth + 1);
            }
            result = object;
        }
        active.delete(child);
        return result;
    };
    return visit(value, 0);
};
exports.safeJson = safeJson;
const decodedBytes = (value) => {
    let bytes = 0;
    for (const character of JSON.stringify(value)) {
        const point = character.codePointAt(0);
        bytes += point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4;
    }
    return bytes;
};
exports.decodedBytes = decodedBytes;
const input = (value) => {
    const safe = (0, exports.safeJson)(value);
    if ((0, exports.decodedBytes)(safe) > contracts_1.FRAMEWORK_ASSESSMENT_LIMITS.documentDecodedBytes)
        return (0, exports.invalid)('document size');
    return safe;
};
exports.input = input;
/** Request timestamps come from a separately clocked coordinator; observed timestamps retain host time. */
const requestChronologyValid = (observedAt, requestedAt) => Date.parse(observedAt) + contracts_1.ASSESSMENT_REQUEST_CLOCK_SKEW_MS >= Date.parse(requestedAt);
exports.requestChronologyValid = requestChronologyValid;
//# sourceMappingURL=internal.js.map