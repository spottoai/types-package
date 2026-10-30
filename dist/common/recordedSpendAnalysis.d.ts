/** Billing-backed recorded charges; calendar closure never establishes invoice finality. */
export type RecordedSpendAnalysisAmount = {
    status: 'available';
    amount: number;
} | {
    status: 'unavailable';
    reason: string;
};
export interface RecordedSpendAnalysisPeriod {
    window: {
        startDateInclusive: string;
        endDateExclusive: string;
        dayCount: 7 | 30;
        dateBasis: 'utc';
    };
    /** Null records unknown/conflicting currency; neither basis can then be available. */
    currency: string | null;
    source: 'billing';
    finality: 'unknown';
    closure: {
        status: 'closed' | 'unproved';
        method: 'accepted-source-usage-bounds';
    };
    billed: RecordedSpendAnalysisAmount;
    amortized: RecordedSpendAnalysisAmount;
}
/** Independently dated comparison windows. Never subtract these from display-window spend. */
export interface RecordedSpendAnalysis {
    schemaVersion: 1;
    generatedAt: string;
    current30Days: RecordedSpendAnalysisPeriod;
    previous30Days: RecordedSpendAnalysisPeriod;
    current7Days: RecordedSpendAnalysisPeriod;
    previous7Days: RecordedSpendAnalysisPeriod;
}
/** Validates declared evidence, not the provider/source calculation behind it. */
export declare function isRecordedSpendAnalysis(value: unknown): value is RecordedSpendAnalysis;
//# sourceMappingURL=recordedSpendAnalysis.d.ts.map