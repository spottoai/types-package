import { type AssessmentJsonValue } from './contracts';
export declare const invalid: (field: string) => never;
export declare const record: (value: unknown, field: string) => Record<string, unknown>;
export declare const shape: (value: unknown, required: readonly string[], optional?: readonly string[]) => Record<string, unknown>;
export declare const text: (value: unknown, maximum?: number, allowEmpty?: boolean) => string;
export declare const identifier: (value: unknown, maximum?: number) => string;
export declare const list: (value: unknown, maximum?: number) => unknown[];
export declare const unique: <T>(values: T[]) => T[];
export declare const number: (value: unknown, maximum?: number) => number;
export declare const choice: <T extends string>(value: unknown, choices: readonly T[]) => T;
export declare const timestamp: (value: unknown) => string;
export declare const httpUrl: (value: unknown, allowEmpty?: boolean) => string;
/** Inspects descriptors before reading values, rejects cycles, accessors, prototypes and non-JSON values. */
export declare const safeJson: (value: unknown) => AssessmentJsonValue;
export declare const decodedBytes: (value: unknown) => number;
export declare const input: (value: unknown) => AssessmentJsonValue;
/** Request timestamps come from a separately clocked coordinator; observed timestamps retain host time. */
export declare const requestChronologyValid: (observedAt: string, requestedAt: string) => boolean;
//# sourceMappingURL=internal.d.ts.map