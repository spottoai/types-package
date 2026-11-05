/** A known subtotal, never a complete group total or proof of billing-day completeness. */
export interface KnownResourceGroupSpend {
    currency: string;
    totalResourceCount: number;
    billedResourceCount: number;
    amortizedResourceCount: number;
    cost?: number;
    costAmortized?: number;
}
export declare function isKnownResourceGroupSpend(value: unknown): value is KnownResourceGroupSpend;
//# sourceMappingURL=knownResourceGroupSpend.d.ts.map