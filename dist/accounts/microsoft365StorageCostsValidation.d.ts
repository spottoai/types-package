import type { Microsoft365StorageCostEstimate, Microsoft365StorageCostView, Microsoft365StorageRate } from './microsoft365StorageCosts';
/** No guessed currency, seat rate, negative reference price or implicit day/month conversion. */
export declare function isMicrosoft365StorageRate(value: unknown): value is Microsoft365StorageRate;
export declare function isMicrosoft365StorageCostEstimate(value: unknown): value is Microsoft365StorageCostEstimate;
/** Rates and comparisons are bounded and referenced within their own ISO-currency group. */
export declare function isMicrosoft365StorageCostView(value: unknown): value is Microsoft365StorageCostView;
//# sourceMappingURL=microsoft365StorageCostsValidation.d.ts.map