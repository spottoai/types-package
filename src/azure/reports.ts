import { Tags } from '../tags';

export interface DecompositionTreeNode {
  /** e.g., "Resource Group A", "Storage", "Standard Page Blob v2", "Storage Account", "mystorageaccount" */
  name: string;
  cost: number;
  costAmortized?: number;
  costPrevious?: number;
  costAmortizedPrevious?: number;
  /** e.g., 80.5 (for 80.5%) */
  percentageOfTotal: number;
  /** Absolute change from previous period */
  costChange?: number;
  /** Percentage change from previous period */
  costChangePercent?: number;
  children?: DecompositionTreeNode[];
  /** Total spend at this level (for percentage calculation) */
  totalSpend: number;
  /** Analysis of why costs changed (only present on leaf nodes) */
  changeAnalysis?: CostChangeAnalysis;
  /** Only present on leaf nodes (individual resources) */
  meterDetails?: MeterDetail[];
  tags?: Record<string, string>;
  spottoTags?: Tags;
  resourceId?: string;
}

export interface MeterDetail {
  /** "P1 v3 App" */
  meter: string;
  /** "Azure App Service" */
  meterCategory: string;
  /** "Premium Plan" */
  meterSubCategory: string;
  /** 24 (hours, GB, etc.) */
  quantity: number;
  /** 12.721536 */
  cost: number;
  /** 12.721536 */
  costAmortized: number;
  /** cost / quantity = rate per unit */
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
  /** e.g., "2025-01" for calendar month, "2025-01-01_2025-01-31" for billing period */
  period: string;
  startDate: string;
  endDate: string;
  tree: DecompositionTree;
}

export interface DecompositionTreeSummary {
  entries: DecompositionTreeEntry[];
  lastUpdated: string;
}

/** Type of change detected in cost analysis */
export type ChangeType = 'increase' | 'decrease' | 'no_change' | 'new_resource' | 'removed_resource';

/** Specific reason types for cost changes */
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

/** Details about a specific change reason */
export interface ChangeReasonDetails {
  /** The meter name (e.g., "P1 v3 App") */
  meter?: string;

  /** The meter category (e.g., "Azure App Service") */
  meterCategory?: string;

  /** The meter sub-category */
  meterSubCategory?: string;

  /** Previous value (could be cost, quantity, rate, or SKU name) */
  oldValue?: string | number;

  /** New value (could be cost, quantity, rate, or SKU name) */
  newValue?: string | number;

  /** Human-readable description of the change */
  description: string;

  /** Additional rate-change context (coverage shifts, modifier attribution, etc.) */
  rateContext?: RateChangeContext;

  /** Optional narrative fragments to help surface a story in the UI */
  storyFragments?: string[];
}

/** A single reason explaining a cost change */
export interface ChangeReason {
  /** Type of change */
  type: ChangeReasonType;

  /** Dollar impact of this change (can be positive or negative) */
  impact: number;

  /** Percentage of total change this reason represents */
  impactPercent: number;

  /** Detailed information about the change */
  details: ChangeReasonDetails;

  /** Optional narrative fragments tied to this reason */
  storyFragments?: string[];
}

/** Complete analysis of cost changes for a resource */
export interface CostChangeAnalysis {
  /** Overall type of change */
  changeType: ChangeType;

  /** List of specific reasons for the change, ordered by impact */
  changeReasons: ChangeReason[];

  /** Human-readable summary of the changes */
  summary: string;

  /** Optional narrative fragments surfaced for display */
  storyFragments?: string[];
}
