export interface DecompositionTreeNode {
    name: string;
    cost: number;
    costAmortized?: number;
    costPrevious?: number;
    costAmortizedPrevious?: number;
    percentageOfTotal: number;
    costChange?: number;
    costChangePercent?: number;
    children?: DecompositionTreeNode[];
    totalSpend: number;
    changeAnalysis?: CostChangeAnalysis;
    meterDetails?: MeterDetail[];
    tags?: Record<string, string>;
    resourceId?: string;
}
export interface MeterDetail {
    meter: string;
    meterCategory: string;
    meterSubCategory: string;
    quantity: number;
    cost: number;
    costAmortized: number;
    unitCost?: number;
}
export interface DecompositionTree {
    root: DecompositionTreeNode;
    period: {
        startDate: string;
        endDate: string;
        type: 'billing_period' | 'calendar_month' | 'rolling_30_days';
    };
    lastUpdated: string;
    totalSpend: number;
    totalSpendAmortized?: number;
    totalSpendPrevious?: number;
    totalSpendAmortizedPrevious?: number;
    currency: string;
    currencySymbol: string;
    version?: string;
}
export interface DecompositionTreeEntry {
    period: string;
    startDate: string;
    endDate: string;
    tree: DecompositionTree;
}
export interface DecompositionTreeSummary {
    entries: DecompositionTreeEntry[];
    lastUpdated: string;
}
export type ChangeType = 'increase' | 'decrease' | 'no_change' | 'new_resource' | 'removed_resource';
export declare enum ChangeReasonType {
    NEW_RESOURCE = "new_resource",
    REMOVED_RESOURCE = "removed_resource",
    QUANTITY_INCREASE = "quantity_increase",
    QUANTITY_DECREASE = "quantity_decrease",
    RATE_CHANGE = "rate_change",
    SKU_CHANGE = "sku_change",
    NEW_METER = "new_meter",
    REMOVED_METER = "removed_meter"
}
export type BillingModifierType = 'reservation' | 'savings_plan' | 'spot' | 'promotion' | 'other';
export interface BillingModifierDetail {
    type: BillingModifierType;
    name?: string;
    coverageHours?: number;
    coveragePercent?: number;
    previousCoveragePercent?: number;
    coveragePercentDelta?: number;
    notes?: string;
}
export interface RateChangeContext {
    previousEffectiveRate?: number;
    currentEffectiveRate?: number;
    previousPaidRate?: number;
    currentPaidRate?: number;
    totalHours?: number;
    paidHours?: number;
    coveredHours?: number;
    previousCoveredHours?: number;
    previousCoveredPercent?: number;
    currentCoveredPercent?: number;
    coverageDeltaPercent?: number;
    modifier?: BillingModifierDetail;
}
export interface ChangeReasonDetails {
    meter?: string;
    meterCategory?: string;
    meterSubCategory?: string;
    oldValue?: string | number;
    newValue?: string | number;
    description: string;
    rateContext?: RateChangeContext;
    storyFragments?: string[];
}
export interface ChangeReason {
    type: ChangeReasonType;
    impact: number;
    impactPercent: number;
    details: ChangeReasonDetails;
    storyFragments?: string[];
}
export interface CostChangeAnalysis {
    changeType: ChangeType;
    changeReasons: ChangeReason[];
    summary: string;
    storyFragments?: string[];
}
//# sourceMappingURL=reports.d.ts.map