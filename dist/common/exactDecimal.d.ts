export interface ExactDecimalValue {
    coefficient: bigint;
    scale: number;
}
export declare const parseCanonicalDecimal: (value: string) => ExactDecimalValue;
export declare const addExactDecimalValues: (left: ExactDecimalValue, right: ExactDecimalValue) => ExactDecimalValue;
export declare const subtractExactDecimalValues: (left: ExactDecimalValue, right: ExactDecimalValue) => ExactDecimalValue;
export declare const multiplyExactDecimalValues: (left: ExactDecimalValue, right: ExactDecimalValue) => ExactDecimalValue;
export declare const sumCanonicalDecimals: (values: readonly string[]) => ExactDecimalValue;
export declare const formatExactDecimalValue: (value: ExactDecimalValue) => string;
//# sourceMappingURL=exactDecimal.d.ts.map