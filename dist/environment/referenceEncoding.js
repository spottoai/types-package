"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeEnvironmentReferencePayload = exports.encodeEnvironmentReferencePayload = void 0;
const contracts_js_1 = require("./contracts.js");
const internal_js_1 = require("./internal.js");
const BASE64URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const encodeUtf8 = (value) => {
    const bytes = [];
    for (const character of value) {
        const codePoint = character.codePointAt(0);
        if (codePoint <= 0x7f)
            bytes.push(codePoint);
        else if (codePoint <= 0x7ff)
            bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
        else if (codePoint <= 0xffff)
            bytes.push(0xe0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
        else
            bytes.push(0xf0 | (codePoint >> 18), 0x80 | ((codePoint >> 12) & 0x3f), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
    }
    return bytes;
};
const encodeBase64Url = (bytes) => {
    let output = '';
    for (let index = 0; index < bytes.length; index += 3) {
        const first = bytes[index];
        const second = bytes[index + 1];
        const third = bytes[index + 2];
        output += BASE64URL_ALPHABET[first >> 2];
        output += BASE64URL_ALPHABET[((first & 0x03) << 4) | ((second ?? 0) >> 4)];
        if (second !== undefined)
            output += BASE64URL_ALPHABET[((second & 0x0f) << 2) | ((third ?? 0) >> 6)];
        if (third !== undefined)
            output += BASE64URL_ALPHABET[third & 0x3f];
    }
    return output;
};
const decodeBase64Url = (value) => {
    if (!/^[A-Za-z0-9_-]+$/u.test(value) || value.length % 4 === 1)
        return null;
    const bytes = [];
    for (let index = 0; index < value.length; index += 4) {
        const first = BASE64URL_ALPHABET.indexOf(value[index]);
        const second = BASE64URL_ALPHABET.indexOf(value[index + 1]);
        const thirdCharacter = value[index + 2];
        const fourthCharacter = value[index + 3];
        const third = thirdCharacter === undefined ? 0 : BASE64URL_ALPHABET.indexOf(thirdCharacter);
        const fourth = fourthCharacter === undefined ? 0 : BASE64URL_ALPHABET.indexOf(fourthCharacter);
        if (first < 0 || second < 0 || third < 0 || fourth < 0)
            return null;
        bytes.push((first << 2) | (second >> 4));
        if (thirdCharacter !== undefined)
            bytes.push(((second & 0x0f) << 4) | (third >> 2));
        if (fourthCharacter !== undefined)
            bytes.push(((third & 0x03) << 6) | fourth);
    }
    return encodeBase64Url(bytes) === value ? bytes : null;
};
const decodeUtf8 = (bytes) => {
    let output = '';
    for (let index = 0; index < bytes.length;) {
        const first = bytes[index];
        let codePoint;
        let continuationCount;
        if (first <= 0x7f) {
            codePoint = first;
            continuationCount = 0;
        }
        else if (first >= 0xc2 && first <= 0xdf) {
            codePoint = first & 0x1f;
            continuationCount = 1;
        }
        else if (first >= 0xe0 && first <= 0xef) {
            codePoint = first & 0x0f;
            continuationCount = 2;
        }
        else if (first >= 0xf0 && first <= 0xf4) {
            codePoint = first & 0x07;
            continuationCount = 3;
        }
        else
            return null;
        if (index + continuationCount >= bytes.length)
            return null;
        for (let offset = 1; offset <= continuationCount; offset += 1) {
            const next = bytes[index + offset];
            if ((next & 0xc0) !== 0x80)
                return null;
            codePoint = (codePoint << 6) | (next & 0x3f);
        }
        if ((continuationCount === 2 && codePoint < 0x800) ||
            (continuationCount === 3 && codePoint < 0x10000) ||
            (codePoint >= 0xd800 && codePoint <= 0xdfff) ||
            codePoint > 0x10ffff) {
            return null;
        }
        output += String.fromCodePoint(codePoint);
        index += continuationCount + 1;
    }
    return output;
};
const decodePayload = (value) => {
    if (value.length > Math.ceil(contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.logicalReferencePayloadBytes / 3) * 4)
        return null;
    const bytes = decodeBase64Url(value);
    if (bytes === null || bytes.length > contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.logicalReferencePayloadBytes)
        return null;
    const decoded = decodeUtf8(bytes);
    if (decoded === null || encodeBase64Url(encodeUtf8(decoded)) !== value)
        return null;
    return decoded;
};
const assertReferencePayload = (value, label, maximumScalars) => {
    if (!(0, internal_js_1.isBoundedString)(value, maximumScalars, { trimmed: true, controls: true })) {
        throw new TypeError(`${label} must be a non-empty, trimmed, bounded Unicode string without control characters.`);
    }
    if ((0, internal_js_1.utf8ByteLength)(value) > contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.logicalReferencePayloadBytes) {
        throw new RangeError(`${label} exceeds the V1 logical-reference payload limit.`);
    }
};
const encodeEnvironmentReferencePayload = (value) => {
    assertReferencePayload(value, 'Reference payload', contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.customerStringScalars);
    return encodeBase64Url(encodeUtf8(value));
};
exports.encodeEnvironmentReferencePayload = encodeEnvironmentReferencePayload;
exports.decodeEnvironmentReferencePayload = decodePayload;
//# sourceMappingURL=referenceEncoding.js.map