/** Internal dependency-free wire checks shared by the optimization contracts. Not exported from the package root. */
export type Row = Record<string, unknown>;
export declare const row: (value: unknown) => value is Row;
export declare const keys: (value: Row, allowed: readonly string[]) => boolean;
export declare const text: (value: unknown) => value is string;
export declare const token: (value: unknown) => value is string;
export declare const code: (value: unknown) => value is string;
export declare const guid: (value: unknown) => value is string;
export declare const count: (value: unknown) => value is number;
export declare const nullableCount: (value: unknown) => boolean;
export declare const minorUnits: (value: unknown) => number | null;
export declare const amount: (value: unknown) => value is number;
export declare const money: (value: unknown) => boolean;
export declare const unitPrice: (value: unknown) => boolean;
export declare const choice: (value: unknown, values: readonly string[]) => boolean;
export declare const list: (value: unknown, limit: number, check: (item: unknown) => boolean) => value is unknown[];
export declare const unique: (value: unknown[], identity?: (item: unknown) => unknown) => boolean;
export declare const identifiers: (value: unknown, limit?: number, check?: (item: unknown) => boolean) => value is string[];
export declare const codes: (value: unknown) => value is string[];
export declare const date: (value: unknown) => value is string;
export declare const timestamp: (value: unknown) => value is string;
export declare const month: (value: unknown) => value is string;
export declare const monthNumber: (value: string) => number;
export declare const consecutiveMonths: (value: unknown) => value is string[];
export declare const currentHistory: (value: unknown, generatedAt: string) => boolean;
export declare const coverage: (value: unknown) => value is Row;
export declare const byKind: (value: unknown) => value is Row;
export declare const consistentCoverage: (overall: Row, channels: Row, omitted: boolean) => boolean;
//# sourceMappingURL=microsoft365OptimizationValidationShared.d.ts.map