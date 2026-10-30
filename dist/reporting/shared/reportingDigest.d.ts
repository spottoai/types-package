/** UTF-8 encodes a string without relying on `TextEncoder` typings. */
export declare const encodeUtf8: (value: string) => Uint8Array;
/** Lower-case hex SHA-256 of a UTF-8 string or of raw bytes. */
export declare const sha256Hex: (input: string | Uint8Array) => Promise<string>;
export declare const SHA256_HEX_PATTERN: RegExp;
//# sourceMappingURL=reportingDigest.d.ts.map