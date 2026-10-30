/** Evidence for an account's complete list-price monthly run rate, independent of billed spend. */
export type RetailCostAvailability = {
    status: 'available';
    currency: string;
    provenance: 'provider-list-price';
    period: {
        kind: 'monthly-run-rate';
        hours: 730;
    };
    sourceRefs: string[];
} | {
    status: 'unavailable';
    reasonCode: 'not-produced' | 'currency-unresolved' | 'coverage-unproven';
};
export declare function isRetailCostAvailability(value: unknown): value is RetailCostAvailability;
//# sourceMappingURL=retailCost.d.ts.map