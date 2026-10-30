"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assessmentContentSha256 = void 0;
exports.canonicalAssessmentJson = canonicalAssessmentJson;
const sha256_1 = require("../common/sha256");
const internal_1 = require("./internal");
/** Canonical v2 content preimage: sorted object keys, preserved array order, UTF-8 JSON. */
function canonicalAssessmentJson(value) {
    const canonical = (item) => {
        if (Array.isArray(item))
            return `[${item.map(canonical).join(',')}]`;
        if (item !== null && typeof item === 'object') {
            return `{${Object.keys(item)
                .sort()
                .map(key => `${JSON.stringify(key)}:${canonical(item[key])}`)
                .join(',')}}`;
        }
        return JSON.stringify(item);
    };
    return canonical((0, internal_1.safeJson)(value));
}
/** Digest of canonical content; application I/O may use an equivalent native SHA-256 implementation. */
const assessmentContentSha256 = (value) => (0, sha256_1.sha256Hex)(canonicalAssessmentJson(value));
exports.assessmentContentSha256 = assessmentContentSha256;
//# sourceMappingURL=digest.js.map