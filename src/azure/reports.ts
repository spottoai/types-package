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
  // Analysis of why costs changed (only present on leaf nodes)
  changeAnalysis?: CostChangeAnalysis;
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
  period: string; // e.g., "2025-01" for calendar month, "2025-01-01_2025-01-31" for billing period
  startDate: string;
  endDate: string;
  tree: DecompositionTree;
}

export interface DecompositionTreeSummary {
  entries: DecompositionTreeEntry[];
  lastUpdated: string;
}

// Type of change detected in cost analysis
export type ChangeType = 'increase' | 'decrease' | 'no_change' | 'new_resource' | 'removed_resource';

// Specific reason types for cost changes
export enum ChangeReasonType {
  NEW_RESOURCE = 'new_resource',
  REMOVED_RESOURCE = 'removed_resource',
  QUANTITY_INCREASE = 'quantity_increase',
  QUANTITY_DECREASE = 'quantity_decrease',
  RATE_CHANGE = 'rate_change',
  SKU_CHANGE = 'sku_change',
  NEW_METER = 'new_meter',
  REMOVED_METER = 'removed_meter',
}

// Details about a specific change reason
export interface ChangeReasonDetails {
  // The meter name (e.g., "P1 v3 App")
  meter?: string;

  // The meter category (e.g., "Azure App Service")
  meterCategory?: string;

  // The meter sub-category
  meterSubCategory?: string;

  // Previous value (could be cost, quantity, rate, or SKU name)
  oldValue?: string | number;

  // New value (could be cost, quantity, rate, or SKU name)
  newValue?: string | number;

  // Human-readable description of the change
  description: string;
}

// A single reason explaining a cost change
export interface ChangeReason {
  // Type of change
  type: ChangeReasonType;

  // Dollar impact of this change (can be positive or negative)
  impact: number;

  // Percentage of total change this reason represents
  impactPercent: number;

  // Detailed information about the change
  details: ChangeReasonDetails;
}

// Complete analysis of cost changes for a resource
export interface CostChangeAnalysis {
  // Overall type of change
  changeType: ChangeType;

  // List of specific reasons for the change, ordered by impact
  changeReasons: ChangeReason[];

  // Human-readable summary of the changes
  summary: string;
}
