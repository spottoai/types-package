export interface FinancialSavingsAllocationPercentageV1 {
    denominatorIds: string[];
    denominatorAmount: string;
    denominatorCurrencyCode: string;
    percentage: number;
}
/**
 * Composes one exact percentage from allocation-bound denominator evidence.
 * Repeated denominator identities are counted once; conflicting or missing
 * evidence fails closed so no consumer substitutes display-resource spend.
 */
export declare const composeFinancialSavingsAllocationPercentageV1: (allocations: readonly {
    savingsMinorUnits: number;
    denominator?: {
        denominatorId: string;
        amount: string;
        currencyCode: string;
    };
}[], minorUnitScale: number) => FinancialSavingsAllocationPercentageV1 | undefined;
//# sourceMappingURL=financialSavingsPercentageKernel.d.ts.map