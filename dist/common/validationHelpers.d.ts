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
//# sourceMappingURL=validationHelpers.d.ts.map