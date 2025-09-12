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
//# sourceMappingURL=reports.d.ts.map