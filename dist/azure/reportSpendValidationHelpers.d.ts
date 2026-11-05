export declare const isReportCalendarDate: (value: unknown) => value is string;
export declare const isReportUtcTimestamp: (value: unknown) => value is string;
export declare const isReportCurrency: (value: unknown) => value is string;
export declare const isReportText: (value: unknown) => value is string;
/** Bounded exact arithmetic avoids binary floating point and pathological decimal-string input. */
export declare const reportMoneyUnits: (value: unknown) => bigint | undefined;
//# sourceMappingURL=reportSpendValidationHelpers.d.ts.map