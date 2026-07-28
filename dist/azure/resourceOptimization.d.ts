export interface ResourceOptimizationSegmentMeter {
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
export interface ResourceOptimizationSegment {
    name: string;
    description: string | null;
    usage: Record<string, number>;
    usageMetadata?: Record<string, {
        label: string;
        unit?: string;
        description?: string;
    }>;
    meters: Record<string, ResourceOptimizationSegmentMeter>;
    subtotal: number;
}
export interface ResourceOptimizationScenario {
    tierKey: string;
    label: string;
    recommendationIds: string[];
    parameters: Record<string, number>;
    segments: ResourceOptimizationSegment[];
    summaryTotals: Record<string, number>;
    projectedMonthlyCost: number;
    savingsAmount: number;
    savingsPercent: number;
}
export type ResourceOptimizationSourceType = 'rolling-30-days' | 'calendar-month';
export interface ResourceOptimizationSourceMeta {
    type: ResourceOptimizationSourceType;
    startDate: string;
    endDate: string;
    excludedRecentDays?: number;
    sourcePath?: string;
}
export interface ResourceOptimizationProfile {
    sourceProfile?: string;
    currency: string;
    currentMonthlyCost?: number;
    currentObservedDiscounts?: Record<string, DiscountObservation>;
    scenarios: ResourceOptimizationScenario[];
    currentCost?: number;
    sourceMeta?: ResourceOptimizationSourceMeta;
}
export interface ResourceSimpleOptimizationScenario {
    tierKey: string;
    label: string;
    recommendationIds: string[];
    projectedMonthlyCost: number;
    savingsAmount: number;
}
export interface ResourceSimpleOptimizationProfile {
    currency: string;
    currentMonthlyCost?: number;
    currentCost?: number;
    scenarios: ResourceSimpleOptimizationScenario[];
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
//# sourceMappingURL=resourceOptimization.d.ts.map