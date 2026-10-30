import { sha256Hex } from '../common/sha256.js';
import { safeJson } from './internal.js';
/** Canonical v2 content preimage: sorted object keys, preserved array order, UTF-8 JSON. */
export function canonicalAssessmentJson(value) {
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
    return canonical(safeJson(value));
}
/** Digest of canonical content; application I/O may use an equivalent native SHA-256 implementation. */
export const assessmentContentSha256 = (value) => sha256Hex(canonicalAssessmentJson(value));
