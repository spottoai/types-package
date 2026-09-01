export declare const SHA256_PATTERN: RegExp;
export declare const ENVIRONMENT_RUN_ID_PATTERN: RegExp;
export declare const DECIMAL_PATTERN: RegExp;
export declare const CURRENCY_PATTERN: RegExp;
export declare const PROTOTYPE_KEYS: Set<string>;
export declare const hasControlCharacter: (value: string) => boolean;
export declare const isRecord: (value: unknown) => value is Record<string, unknown>;
export declare const hasExactKeys: (value: Record<string, unknown>, required: readonly string[], optional?: readonly string[]) => boolean;
export declare const isBoundedString: (value: unknown, maximumScalars: number, options?: {
    trimmed?: boolean;
    controls?: boolean;
}) => value is string;
export declare const isCustomerString: (value: unknown) => value is string;
export declare const isSafeLabel: (value: unknown) => value is string;
export declare const isScopeIdentifier: (value: unknown) => value is string;
export declare const isSourceIdentity: (value: unknown) => value is string;
export declare const isNonNegativeInteger: (value: unknown) => value is number;
export declare const isCanonicalUtcTimestamp: (value: unknown) => value is string;
export declare const utf8ByteLength: (value: string) => number;
export declare const hasSafeContainerShape: (value: unknown, depth?: number, seen?: Set<object>) => boolean;
//# sourceMappingURL=internal.d.ts.map