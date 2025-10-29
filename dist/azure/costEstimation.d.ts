export interface ResourceCostEstimationSegmentMeter {
    meterName: string;
    productName: string;
    skuName: string;
    meterId?: string | null;
    quantity: number;
    unitListPrice: number | null;
    discount: number | null;
    unitEffectivePrice: number | null;
    cost: number | null;
    unitOfMeasure?: string;
    notes?: string;
}
export interface ResourceCostEstimationSegment {
    name: string;
    description: string | null;
    usage: Record<string, number>;
    usageMetadata?: Record<string, {
        label: string;
        unit?: string;
        description?: string;
    }>;
    meters: Record<string, ResourceCostEstimationSegmentMeter>;
    subtotal: number;
}
export interface ResourceCostEstimationPlan {
    tierKey: string;
    label: string;
    recommendationIds: string[];
    parameters: Record<string, number>;
    segments: ResourceCostEstimationSegment[];
    summaryTotals: Record<string, number>;
    projectedMonthlyCost: number;
    savingsAmount: number;
    savingsPercent: number;
}
export interface ResourceCostEstimationSummary {
    sourceProfile?: string;
    currency: string;
    currentMonthlyCost: number;
    currentObservedDiscounts?: Record<string, DiscountObservation>;
    plans: ResourceCostEstimationPlan[];
}
export interface ResourceSimpleCostEstimationPlan {
    label: string;
    recommendationIds: string[];
    projectedMonthlyCost: number;
    savingsAmount: number;
}
export interface ResourceSimpleCostEstimationSummary {
    currency: string;
    currentMonthlyCost: number;
    currentObservedDiscounts?: Record<string, DiscountObservation>;
    plans: ResourceSimpleCostEstimationPlan[];
    savingsRange?: {
        min: number;
        max: number;
    };
}
export interface DiscountObservation {
    meter: string;
    retailPrice: number;
    unitActual: number;
    discount: number;
    quantity: number;
    cost: number;
}
//# sourceMappingURL=costEstimation.d.ts.map