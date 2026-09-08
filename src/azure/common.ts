import type { CostComposition } from './costComposition.js';
import {
  isAzureProviderScopeFinancialChargeSpendBreakdownV1,
  type AzureProviderScopeFinancialChargeSpendBreakdownV1,
} from './financialChargePolicy.js';

/**
 * Non-authoritative daily/month display projection. It inherits period and
 * currency from the containing summary entry. Formal reports and billing must
 * use `financialChargeSpend` when present, never these major-unit fields.
 */
export interface AzureNativeFinancialSummaryV1 {
  contractVersion: 'azure-native-financial-summary/v1';
  policyRef: 'azure-cloud-services-excluding-marketplace/v1';
  status: 'complete' | 'partial';
  cost?: number;
  costAmortized?: number;
  financialChargeSpend?: AzureProviderScopeFinancialChargeSpendBreakdownV1;
  resourceTypes: ResourceCostType[];
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const hasExactFields = (value: Record<string, unknown>, required: readonly string[], optional: readonly string[] = []): boolean => {
  const allowed = new Set([...required, ...optional]);
  return required.every(field => Object.prototype.hasOwnProperty.call(value, field)) && Object.keys(value).every(field => allowed.has(field));
};
const isOptionalFiniteNumber = (value: unknown): value is number | undefined =>
  value === undefined || (typeof value === 'number' && Number.isFinite(value));
const isResourceCostType = (value: unknown): value is ResourceCostType =>
  isRecord(value) &&
  hasExactFields(value, ['name'], ['cost', 'costAmortized', 'costKind', 'commitmentPurchaseCost', 'commitmentPurchaseCostAmortized']) &&
  typeof value.name === 'string' &&
  value.name.length > 0 &&
  value.name === value.name.trim() &&
  isOptionalFiniteNumber(value.cost) &&
  isOptionalFiniteNumber(value.costAmortized) &&
  isOptionalFiniteNumber(value.commitmentPurchaseCost) &&
  isOptionalFiniteNumber(value.commitmentPurchaseCostAmortized) &&
  (value.costKind === undefined || value.costKind === 'usage' || value.costKind === 'commitment-purchase' || value.costKind === 'mixed');

/** Exact validator for one Azure-native daily/month display projection. */
export const isAzureNativeFinancialSummaryV1 = (value: unknown): value is AzureNativeFinancialSummaryV1 =>
  isRecord(value) &&
  hasExactFields(value, ['contractVersion', 'policyRef', 'status', 'resourceTypes'], ['cost', 'costAmortized', 'financialChargeSpend']) &&
  value.contractVersion === 'azure-native-financial-summary/v1' &&
  value.policyRef === 'azure-cloud-services-excluding-marketplace/v1' &&
  (value.status === 'complete' || value.status === 'partial') &&
  isOptionalFiniteNumber(value.cost) &&
  isOptionalFiniteNumber(value.costAmortized) &&
  (value.financialChargeSpend === undefined || isAzureProviderScopeFinancialChargeSpendBreakdownV1(value.financialChargeSpend)) &&
  Array.isArray(value.resourceTypes) &&
  value.resourceTypes.every(isResourceCostType);

export interface AzureLocation {
  /** e.g. "eastus" */
  name: string;
  /** e.g. "East US" */
  displayName: string;
}

export interface MonthSummaryEntry {
  /** YYYY-MM format */
  month: string;
  /** sum of actual cost for the month */
  cost?: number;
  /** sum of costAmortized for the month */
  costAmortized?: number | null;
  /** YYYY-MM format - start date of billing period */
  startDate?: string;
  /** YYYY-MM format - end date of billing period */
  endDate?: string;
  /** Top resources by cost */
  resourceTypes: ResourceCostType[];
  /** Azure-native-only projection for ordinary customer financial views. */
  azureNativeFinancialSummary?: AzureNativeFinancialSummaryV1;
  composition?: CostComposition;
}

export interface ResourceCostType {
  /** e.g. "Virtual Machines" */
  name: string;
  /** Actual cost, when available (e.g. 100). */
  cost?: number;
  /** Amortized cost, when available (e.g. 100). */
  costAmortized?: number | null;
  /** Optional classification for non-usage cost shown in dashboards. */
  costKind?: 'usage' | 'commitment-purchase' | 'mixed';
  /** Portion of cost attributable to commitment purchases such as RI or savings plan orders. */
  commitmentPurchaseCost?: number;
  /** Portion of amortized cost attributable to commitment purchases such as RI or savings plan orders. */
  commitmentPurchaseCostAmortized?: number | null;
}

export interface MonthSummary {
  entries: MonthSummaryEntry[];
  /** ISO date string */
  lastUpdated: string;
}

export interface DailySummaryEntry {
  /** YYYY-MM-DD format */
  date: string;
  /** sum of actual cost for the day */
  cost?: number;
  /** sum of costAmortized for the day */
  costAmortized?: number | null;
  /** Portion of the day's cost attributable to commitment purchases such as RI or savings plan orders. */
  commitmentPurchaseCost?: number;
  /** Portion of the day's amortized cost attributable to commitment purchases such as RI or savings plan orders. */
  commitmentPurchaseCostAmortized?: number | null;
  /** Top resources by cost */
  resourceTypes: ResourceCostType[];
  /** Azure-native-only projection for ordinary customer financial views. */
  azureNativeFinancialSummary?: AzureNativeFinancialSummaryV1;
  composition?: CostComposition;
}

export interface DailySummary {
  /** rolling last 30 days */
  entries: DailySummaryEntry[];
  /** ISO date string */
  lastUpdated: string;
}

export interface ActiveDates {
  startDate: number;
  endDate: number;
}

export interface SpecItem {
  /** e.g. RAM */
  name: string;
  /** e.g. 3.5 */
  value: string;
  /** e.g. GB */
  unit: string;
}

export interface Link {
  name: string;
  url: string;
}

export interface LogAnalyticsResponse {
  tables: Array<LogAnalyticsTable>;
}

export interface LogAnalyticsTable {
  name: string;
  columns: Array<{
    name: string;
    type: string;
  }>;
  rows: unknown[][];
}

export interface ActivityLog {
  /** e.g. "user@contoso.com" */
  caller: string;
  /** e.g. Update hosting plan */
  change: string;
  /** e.g. Use the submissionTimestamp */
  timestamp: string;
}
