export interface DecompositionTreeNode {
  name: string; // e.g., "Resource Group A", "Storage", "Standard Page Blob v2", "Storage Account", "mystorageaccount"
  cost: number;
  costAmortized?: number;
  costPrevious?: number;
  costAmortizedPrevious?: number;
  percentageOfTotal: number; // e.g., 80.5 (for 80.5%)
  costChange?: number; // Absolute change from previous period
  costChangePercent?: number; // Percentage change from previous period
  children?: DecompositionTreeNode[];
  totalSpend: number; // Total spend at this level (for percentage calculation)
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
}

export interface DecompositionTreeEntry {
  period: string; // e.g., "2025-01" for calendar month, "2025-01-01_2025-01-31" for billing period
  startDate: string;
  endDate: string;
  tree: DecompositionTree;
}

export interface DecompositionTreeSummary {
  entries: DecompositionTreeEntry[];
  lastUpdated: string;
}
