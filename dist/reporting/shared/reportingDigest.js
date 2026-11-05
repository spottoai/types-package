"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHA256_HEX_PATTERN = exports.sha256Hex = exports.encodeUtf8 = void 0;
/**
 * SHA-256 through Web Crypto, which the API (Cloudflare Workers), cloud-engine and reportworker (Node 24) all
 * provide as `globalThis.crypto.subtle`. The package has no Node or DOM typings, so the shapes are declared here.
 */
const reportingIds_1 = require("./reportingIds");
const getSubtle = () => {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle || typeof subtle.digest !== 'function') {
        throw new Error('Web Crypto (globalThis.crypto.subtle) is required for report job hashing.');
    }
    return subtle;
};
/** UTF-8 encodes a string without relying on `TextEncoder` typings. */
const encodeUtf8 = (value) => {
    const bytes = new Uint8Array((0, reportingIds_1.utf8ByteLength)(value));
    let offset = 0;
    for (let index = 0; index < value.length; index += 1) {
        let code = value.charCodeAt(index);
        if (code >= 0xd800 && code <= 0xdbff && index + 1 < value.length) {
            const next = value.charCodeAt(index + 1);
            if (next >= 0xdc00 && next <= 0xdfff) {
                code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
                index += 1;
            }
        }
        if (code >= 0xd800 && code <= 0xdfff)
            code = 0xfffd; // lone surrogate, as TextEncoder does
        if (code < 0x80)
            bytes[offset++] = code;
        else if (code < 0x800) {
            bytes[offset++] = 0xc0 | (code >> 6);
            bytes[offset++] = 0x80 | (code & 0x3f);
        }
        else if (code < 0x10000) {
            bytes[offset++] = 0xe0 | (code >> 12);
            bytes[offset++] = 0x80 | ((code >> 6) & 0x3f);
            bytes[offset++] = 0x80 | (code & 0x3f);
        }
        else {
            bytes[offset++] = 0xf0 | (code >> 18);
            bytes[offset++] = 0x80 | ((code >> 12) & 0x3f);
            bytes[offset++] = 0x80 | ((code >> 6) & 0x3f);
            bytes[offset++] = 0x80 | (code & 0x3f);
        }
    }
    return bytes;
};
exports.encodeUtf8 = encodeUtf8;
/** Lower-case hex SHA-256 of a UTF-8 string or of raw bytes. */
const sha256Hex = async (input) => {
    const data = typeof input === 'string' ? (0, exports.encodeUtf8)(input) : input;
    const digest = new Uint8Array(await getSubtle().digest('SHA-256', data));
    let hex = '';
    for (const byte of digest)
        hex += byte.toString(16).padStart(2, '0');
    return hex;
};
exports.sha256Hex = sha256Hex;
exports.SHA256_HEX_PATTERN = /^[0-9a-f]{64}$/;
//# sourceMappingURL=reportingDigest.js.map