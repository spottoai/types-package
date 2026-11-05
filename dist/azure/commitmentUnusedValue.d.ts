/** Unused commitment exposure is nonadditive evidence, never achievable or portfolio savings. */
export interface CommitmentUnusedValueContext {
    benefitId: string;
    additive: false;
    coverage: 'complete' | 'partial';
    assumptions: string[];
    limitations: string[];
    sources: Array<{
        kind: 'billing' | 'inventory' | 'utilization';
        source: string;
        generatedAt?: string;
        observedAt?: string;
        generationId?: string;
        fingerprint?: string;
    }>;
    utilizationWindow?: {
        start: string;
        end: string;
        percentage: number;
        observedDays: number;
        reportedHoursPerUnit?: number;
        finality: 'provider-reported-hours-unverified';
    };
}
/** Period dates are inclusive billing dates. Missing service endpoints must not be inferred from cadence. */
export type CommitmentUnusedValueEvidence = CommitmentUnusedValueContext & (({
    status: 'available';
    amount: number;
    currency: string;
    sourceCharge: {
        amount: number;
        dates: string[];
        cadence?: 'monthly';
        periodStart?: string;
        periodEnd?: string;
    };
    reason?: never;
} & ({
    method: 'native-unused-amortized';
    basis: 'amortized';
    provenance: 'billing-backed-native';
} | {
    method: 'recurring-charge-utilization-approximation';
    basis: 'billed';
    provenance: 'billing-backed-approximation';
    utilizationWindow: NonNullable<CommitmentUnusedValueContext['utilizationWindow']>;
})) | {
    status: 'unavailable';
    reason: string;
    amount?: never;
    currency?: never;
    method?: never;
    basis?: never;
    provenance?: never;
    sourceCharge?: never;
});
/** Checks wire consistency only; producers/readers still prove billing authenticity and current authorization. */
export declare function isCommitmentUnusedValueEvidence(value: unknown): value is CommitmentUnusedValueEvidence;
//# sourceMappingURL=commitmentUnusedValue.d.ts.map