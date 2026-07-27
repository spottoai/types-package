"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWS_PLUGIN_RESOURCE_SECTIONS = exports.AWS_PLUGIN_SUBSCRIPTION_SECTIONS = exports.AWS_PLUGIN_SOURCE_ARTIFACT_TYPES = exports.AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION = void 0;
exports.buildAwsPluginSubscriptionLogicalName = buildAwsPluginSubscriptionLogicalName;
exports.buildAwsPluginResourceLogicalName = buildAwsPluginResourceLogicalName;
exports.sha256AwsPluginIdentity = sha256AwsPluginIdentity;
exports.AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION = 1;
exports.AWS_PLUGIN_SOURCE_ARTIFACT_TYPES = [
    'account-summary',
    'resource-collection',
    'ai-cost-summary',
    'relationships',
    'lifecycle',
    'recommendations',
    'recommendation-actionability',
    'commitment-analysis',
    'reliability',
    'account-governance',
];
exports.AWS_PLUGIN_SUBSCRIPTION_SECTIONS = [
    'account-summary',
    'resources',
    'ai-cost-summary',
    'service-retirement',
    'recommendations',
    'commitment-analysis',
    'reliability',
    'account-governance',
];
exports.AWS_PLUGIN_RESOURCE_SECTIONS = ['resource', 'relationships', 'service-retirement', 'recommendations'];
/** Builds the path-free subscription logical name from a target-key SHA-256. */
function buildAwsPluginSubscriptionLogicalName(targetKeySha256) {
    return `plugin-subscription--${normalizeSha256(targetKeySha256, 'targetKeySha256')}.json.gz`;
}
/** Builds the path-free resource logical name from stable and target SHA-256 values. */
function buildAwsPluginResourceLogicalName(stableKeySha256, targetKeySha256) {
    return `plugin-resource--${normalizeSha256(stableKeySha256, 'stableKeySha256')}--${normalizeSha256(targetKeySha256, 'targetKeySha256')}.json.gz`;
}
/** Browser-safe SHA-256 used to bind stable and target identity to logical names. */
function sha256AwsPluginIdentity(value) {
    const words = [];
    const bytes = [];
    for (const character of value) {
        const codePoint = character.codePointAt(0) ?? 0;
        if (codePoint < 0x80)
            bytes.push(codePoint);
        else if (codePoint < 0x800)
            bytes.push(0xc0 | (codePoint >>> 6), 0x80 | (codePoint & 0x3f));
        else if (codePoint < 0x10000)
            bytes.push(0xe0 | (codePoint >>> 12), 0x80 | ((codePoint >>> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
        else {
            bytes.push(0xf0 | (codePoint >>> 18), 0x80 | ((codePoint >>> 12) & 0x3f), 0x80 | ((codePoint >>> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
        }
    }
    const bitLength = bytes.length * 8;
    for (const byte of bytes)
        words.push(byte);
    words.push(0x80);
    while (words.length % 64 !== 56)
        words.push(0);
    for (let index = 7; index >= 0; index--)
        words.push(Math.floor(bitLength / 2 ** (index * 8)) & 0xff);
    const state = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const constants = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
        0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
        0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
        0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ];
    const rotate = (word, bits) => (word >>> bits) | (word << (32 - bits));
    for (let offset = 0; offset < words.length; offset += 64) {
        const schedule = new Array(64);
        for (let index = 0; index < 16; index++) {
            const at = offset + index * 4;
            schedule[index] = (words[at] << 24) | (words[at + 1] << 16) | (words[at + 2] << 8) | words[at + 3];
        }
        for (let index = 16; index < 64; index++) {
            const previous = schedule[index - 15];
            const recent = schedule[index - 2];
            const small0 = rotate(previous, 7) ^ rotate(previous, 18) ^ (previous >>> 3);
            const small1 = rotate(recent, 17) ^ rotate(recent, 19) ^ (recent >>> 10);
            schedule[index] = (schedule[index - 16] + small0 + schedule[index - 7] + small1) | 0;
        }
        let [a, b, c, d, e, f, g, h] = state;
        for (let index = 0; index < 64; index++) {
            const large1 = rotate(e, 6) ^ rotate(e, 11) ^ rotate(e, 25);
            const choose = (e & f) ^ (~e & g);
            const temporary1 = (h + large1 + choose + constants[index] + schedule[index]) | 0;
            const large0 = rotate(a, 2) ^ rotate(a, 13) ^ rotate(a, 22);
            const majority = (a & b) ^ (a & c) ^ (b & c);
            const temporary2 = (large0 + majority) | 0;
            h = g;
            g = f;
            f = e;
            e = (d + temporary1) | 0;
            d = c;
            c = b;
            b = a;
            a = (temporary1 + temporary2) | 0;
        }
        [a, b, c, d, e, f, g, h].forEach((word, index) => {
            state[index] = (state[index] + word) | 0;
        });
    }
    return state.map(word => (word >>> 0).toString(16).padStart(8, '0')).join('');
}
function normalizeSha256(value, field) {
    const normalized = value.trim().toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(normalized)) {
        throw new Error(`${field} must be a lowercase hexadecimal SHA-256.`);
    }
    return normalized;
}
//# sourceMappingURL=pluginPublicArtifacts.js.map