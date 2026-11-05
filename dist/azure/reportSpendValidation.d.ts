import { type ReportSavingsBasis, type ReportSpendAmounts, type ReportSpendProjection } from './reportSpend';
export declare const isReportSavingsBasis: (value: unknown) => value is ReportSavingsBasis;
export declare function isReportSpendAmounts(value: unknown, currency?: string, generatedAt?: string): value is ReportSpendAmounts;
export declare const hasReportSpendValue: (value: ReportSpendAmounts) => boolean;
/** Dates, population completeness and actual/estimated selection remain independent checks. */
export declare const isReportSpendProjection: (value: unknown) => value is ReportSpendProjection;
//# sourceMappingURL=reportSpendValidation.d.ts.map