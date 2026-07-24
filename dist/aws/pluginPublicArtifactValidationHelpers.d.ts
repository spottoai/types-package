export declare function asRecord(value: unknown, field: string): Record<string, unknown>;
export declare function requiredArray(value: unknown, field: string): unknown[];
export declare function stringArray(value: unknown, field: string): string[];
export declare function requiredString(value: unknown, field: string): string;
export declare function isoTimestamp(value: unknown, field: string): string;
export declare function sha256(value: unknown, field: string): string;
export declare function requiredEnum<const Value extends string>(value: unknown, values: readonly Value[], field: string): Value;
export declare function optionalEnum<const Value extends string>(value: unknown, values: readonly Value[], field: string): void;
export declare function optionalRecord(value: unknown, field: string): void;
export declare function assertAccount(value: unknown, accountId: string, field: string): void;
export declare function assertExactKeys(value: Record<string, unknown>, allowed: readonly string[], field: string): void;
export declare function assertNoForbiddenKeys(value: unknown, field: string): void;
/** Rejects non-JSON values, non-plain objects, and forbidden public keys recursively. */
export declare function assertPublicJson(value: unknown, field: string): void;
export declare function assertRequiredKeys(value: Record<string, unknown>, required: readonly string[], field: string): void;
export declare function assertValue(actual: unknown, expected: unknown, field: string): void;
export declare function assertJsonEqual(actual: unknown, expected: unknown, field: string): void;
export declare function validateDescriptor(value: unknown, field: string): void;
export declare function validateBilling(value: unknown, field?: string): void;
export declare function validateSelector(value: unknown, field: string): void;
export declare function validateMetricWindow(value: unknown, field: string): void;
export declare function validateTagRuleScope(value: unknown): void;
//# sourceMappingURL=pluginPublicArtifactValidationHelpers.d.ts.map