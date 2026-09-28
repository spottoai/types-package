/** Dependency-free structural guard primitives shared by every validation module. */
import type { ReportBoundedRows } from './boundedRows';
export type JsonRecord = Record<string, unknown>;
export declare const isRecord: (value: unknown) => value is JsonRecord;
export declare const isString: (value: unknown) => value is string;
export declare const isOptionalString: (value: unknown) => boolean;
export declare const isFiniteNumber: (value: unknown) => value is number;
export declare const isOptionalFiniteNumber: (value: unknown) => boolean;
export declare const isOptionalBoolean: (value: unknown) => boolean;
export declare const isCount: (value: unknown) => value is number;
export declare const isDateTime: (value: unknown) => value is string;
export declare const isStringArray: (value: unknown) => value is string[];
export declare const isCountRecord: (value: unknown) => value is Record<string, number>;
export declare const countTotal: (value: Record<string, number>) => number;
export declare const hasOptionalStrings: (value: JsonRecord, keys: readonly string[]) => boolean;
export declare const hasOptionalNumbers: (value: JsonRecord, keys: readonly string[]) => boolean;
export declare const isBoundedRows: <T>(value: unknown, limit: number, isRow: (row: unknown) => row is T) => value is ReportBoundedRows<T>;
export declare function asRecord(value: unknown, field: string): JsonRecord;
export declare function asArray(value: unknown, field: string, nonEmpty?: boolean): unknown[];
export declare function requiredString(value: unknown, field: string): string;
export declare function requiredEnum<const Value extends string>(value: unknown, values: readonly Value[], field: string): Value;
export declare function requiredBoolean(value: unknown, field: string): boolean;
export declare function nonNegativeInteger(value: unknown, field: string): number;
export declare function finiteNumber(value: unknown, field: string): number;
export declare function isoTimestamp(value: unknown, field: string): string;
export declare function assertExactKeys(value: JsonRecord, allowed: readonly string[], field: string): void;
export declare function assertValue(actual: unknown, expected: unknown, field: string): void;
export declare function assertUnique(values: readonly string[], field: string): void;
export declare function requiredPublicIdentifier(value: unknown, field: string): string;
/** Validates an exact `ArtifactGeneration` identity. */
export declare function validateGeneration(value: unknown, field: string): {
    runId: string;
    generatedAt: string;
};
/** Rejects non-JSON values and non-plain objects; `isForbiddenKey` rejects keys at every depth. */
export declare function assertPlainJson(value: unknown, field: string, isForbiddenKey?: (key: string) => boolean): void;
//# sourceMappingURL=validationHelpers.d.ts.map