/** Canonical v2 content preimage: sorted object keys, preserved array order, UTF-8 JSON. */
export declare function canonicalAssessmentJson(value: unknown): string;
/** Digest of canonical content; application I/O may use an equivalent native SHA-256 implementation. */
export declare const assessmentContentSha256: (value: unknown) => string;
//# sourceMappingURL=digest.d.ts.map