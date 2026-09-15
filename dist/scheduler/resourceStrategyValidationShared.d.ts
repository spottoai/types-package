import { type ResourceSchedulingCapabilityRef } from './resourceStrategyContracts';
export declare function isRecord(value: unknown): value is Record<string, unknown>;
export declare function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean;
export declare function isBoundedString(value: unknown, maximum?: number): value is string;
export declare function isOptionalBoundedString(value: unknown, maximum?: number): boolean;
export declare function isPositiveInteger(value: unknown): value is number;
export declare function isNonNegativeInteger(value: unknown): value is number;
export declare function isIsoTimestamp(value: unknown): value is string;
export declare function isDate(value: unknown): value is string;
export declare function isTime(value: unknown): value is string;
export declare function isCurrency(value: unknown): value is string;
export declare function isNonNegativeDecimal(value: unknown): value is string;
export declare function isIanaTimezone(value: unknown): value is string;
export declare function isWithinJsonByteLimit(value: unknown, maximum: number): boolean;
export declare function isBoundedStringArray(value: unknown, maximum?: number): value is string[];
export declare function containsForbiddenKey(value: unknown, depth?: number): boolean;
export declare function isBoundedParameters(value: unknown): value is Record<string, unknown>;
export declare function isCapabilityRef(value: unknown): value is ResourceSchedulingCapabilityRef;
//# sourceMappingURL=resourceStrategyValidationShared.d.ts.map