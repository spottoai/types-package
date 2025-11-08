import { ActiveDates, SpecItem } from './common.js';
import { DailyMetrics, DisplayMetric } from './metrics.js';

export interface CostDetails {
  /** the amount spend on the resource over the last 30 days */
  dailySpend?: ResourceSpend[];
  /** the spend items aggregated for the last 30 days */
  spendSummary?: ResourceSpend[];
  /** the spend items aggregated for the previous 30 days */
  spendSummaryPrevious?: ResourceSpend[];
  /** the total amount spend on the resource over the last 30 days */
  totalSpend30Days?: number;
  /** the total amount spend on the resource over the previous 30 days */
  totalSpend30DaysPrevious?: number;
  /** the total amount spend on the resource over the last 30 days, taking into account reserved instances and savings plans */
  totalSpend30DaysAmortized?: number;
  /** the total amount spend on the resource over the previous 30 days, taking into account reserved instances and savings plans */
  totalSpend30DaysAmortizedPrevious?: number;
  retailPrices?: AzurePrice[];
}

export interface AzurePrice {
  currencyCode: string;
  tierMinimumUnits: number;
  reservationTerm: string;
  retailPrice: number;
  unitPrice: number;
  armRegionName: string;
  location: string;
  /** ISO 8601 date string */
  effectiveStartDate: string;
  meterId: string;
  meterName: string;
  productId: string;
  skuId: string;
  availabilityId: string | null;
  productName: string;
  skuName: string;
  serviceName: string;
  serviceId: string;
  serviceFamily: string;
  unitOfMeasure: string;
  /** Consumption, Reservation */
  type: string;
  isPrimaryMeterRegion: boolean;
  armSkuName: string;
  savingsPlan: SavingsPlan[];
  monthlyPrice?: number;
  /** Use this property to set alternative Azure pricing SKU */
  targetAzurePrices?: AzurePrice[];
  /** Reserved instances for this price level */
  reservedInstances?: SavingsCostSummary[];
  savingsPlanSummary?: SavingsCostSummary[];
  /** Amount of money saved compared to the parent */
  targetMonthlySavings?: number;
  /** Percentage of money saved compared to the parent */
  targetSavingsPercent?: number;
  /** Show the display percent such as -10% */
  targetSavingsPercentDisplay?: string;
  targetSavings?: number;
  targetSavingsDisplay?: string;
  targetLabel?: string;
  targetLabel2?: string;
  subLabel?: string;
  quantity?: number;
  displayLabel?: string;
  displayUnitPrice?: string;
  displayTotalPrice?: number;
  displayQuantity?: number;
  /** Reference to the recommendation that this target cost is associated with */
  recommendationId?: string;
}

export interface SavingsPlan {
  unitPrice: number;
  retailPrice: number;
  /** e.g., "1 Year", "3 Years" */
  term: string;
}

export interface CostSummaryDetails {
  /** Last 30 days */
  total?: number;
  /** Total cost in the previous 30 days */
  totalPrevious?: number;
  /** Last 30 days, taking into account reserved instances and savings plans */
  amortizedTotal?: number;
  /** Total cost in the previous 30 days, taking into account reserved instances and savings plans */
  amortizedTotalPrevious?: number;
  items?: ResourceCostSummary[];
  savingsRange?: SavingsRange;
}

export interface ResourceCostSummary {
  /** e.g. "Basic Plan (B2 App)" */
  label1: string;
  /** e.g. "Azure App Service" */
  label2: string;
  label3?: string;
  label4?: string;
  /** e.g. "Bandwidth", "Defender for Cloud" */
  category?: string;
  /** e.g. Cores: 2 | RAM: 3.5GB | Storage: 10GB */
  specs: SpecItem[];
  /** name of the reservation if it's a reserved instance */
  reservation?: string;
  /** e.g. true means the resource is active, false means the resource was active (old SKU) */
  active: boolean;
  /** e.g. true means the resource is an addon such as Defender for Cloud, Backups, Disks, IP address, ASR */
  addon: boolean;
  /** e.g. 66.09 (rounded to 2 decimal places) - the amount of money spent on the resource based on the date range */
  spend: number;
  /** e.g. 66.09 (rounded to 2 decimal places) - the amount of money spent on the resource based on the date range, taking into account reserved instances and savings plans */
  spendAmortized: number;
  /** e.g. 217.21 (rounded to 2 decimal places) */
  quantity: number;
  /** e.g. [ { startDate: 20250601, endDate: 20250610 } ] */
  dates?: ActiveDates[];
  /** e.g. 0.304140 1/Hour */
  unitPrice: string;
  /** e.g. 0.304140 1/Hour */
  unitPriceAmortized: string;
  /** e.g. 730.00 (rounded to 2 decimal places) */
  monthlyPrice?: number;
  /** e.g. -4% */
  retailDiscount: string;
  retailCost?: RetailCostSummary;
  dailyMetrics?: DailyMetrics[];
  summaryMetrics?: DisplayMetric[];
  /** Reference to the actual Azure resource */
  resourceId?: string;
  /** Human-readable resource name */
  resourceName?: string;
  /** Azure resource type */
  resourceType?: string;
  savingsRange?: SavingsRange;
  /** Reference to the recommendation that this target cost is associated with */
  recommendationId?: string;
}

export interface SavingsRange {
  min: SavingsDetail;
  max: SavingsDetail;
  currentMonthly: number;
  lowestPossibleMonthly: number;
}

export interface SavingsDetail {
  monthly: number;
  percent: number;
}

export interface RetailCostSummary {
  /** e.g. 0.304140 1/Hour */
  unitPrice: string;
  /** e.g. 730.00 (rounded to 2 decimal places) */
  monthlyPrice: number;
  /** e.g. 66.09 (rounded to 2 decimal places) */
  cost: number;
  savingsPlans?: SavingsCostSummary[];
  reservedInstances?: SavingsCostSummary[];
  /** This is for a multi-level target (e.g. From Windows To Linux from P2 SKU to P1 SKU) */
  targetCost?: TargetCostSummary[];
}

export interface SavingsCostSummary {
  /** e.g. 0.304140 1/Hour */
  unitPrice: string;
  /** e.g. "1 Year", "3 Years" */
  term: string;
  /** e.g. 730.00 (rounded to 2 decimal places) */
  monthlyPrice: number;
  /** e.g. 10% */
  savingsPercent: string;
  /** e.g. 100.00 (rounded to 2 decimal places) */
  monthlySavings: number;
  /**
   * Hours covered per commitment (for example 730 hours per month for hourly commitments).
   * Provided so callers can scale savings for multiple concurrently running instances.
   */
  commitmentHoursPerInstance?: number;
  /**
   * Recommended number of commitments to cover the observed usage (ceil(billedHours / commitmentHoursPerInstance)).
   */
  recommendedCommitmentCount?: number;
  /** Monthly price normalized for the recommended commitment count. */
  normalizedMonthlyPrice?: number;
  /** Monthly savings normalized for the recommended commitment count. */
  normalizedMonthlySavings?: number;
  /** Savings percent normalized for the recommended commitment count. */
  normalizedSavingsPercent?: number;
  /** Baseline commitments derived from observed usage (before new recommendations). */
  baselineCommitmentCount?: number;
  /** Number of hours left on PAYG after commitments are applied. */
  paygRemainderHours?: number;
}

export interface TargetCostSummary {
  /** e.g. Windows to Linux migration */
  targetLabel?: string;
  /** e.g. Windows to Linux migration */
  targetLabel2?: string;
  /** e.g. "Basic Plan (B2 App)" */
  label1: string;
  /** e.g. "Azure App Service" */
  label2: string;
  label3?: string;
  label4?: string;
  /** e.g. Cores: 2 | RAM: 3.5GB | Storage: 10GB */
  specs: SpecItem[];
  /** e.g. 66.09 (rounded to 2 decimal places) */
  cost: number;
  /** e.g. 100.00 (rounded to 2 decimal places) */
  savings: number;
  /** e.g. 0.304140 1/Hour */
  unitPrice: string;
  /** e.g. 730.00 (rounded to 2 decimal places) */
  monthlyPrice: number;
  /** e.g. 100.00 (rounded to 2 decimal places) */
  monthlySavings: number;
  /** e.g. 10% */
  monthlySavingsPercent: string;
  /** Retail unit price before tenant discounts are applied */
  unitPriceRetail?: string;
  /** Retail monthly price before tenant discounts are applied */
  monthlyPriceRetail?: number;
  /** Retail cost before tenant discounts are applied */
  costRetail?: number;
  /** This is for a multi-level target (e.g. From Windows To Linux from P2 SKU to P1 SKU) */
  targetCost?: TargetCostSummary[];
  /** This is for reserved intances if it's available */
  reservedInstances?: SavingsCostSummary[];
  /** This is for savings plans if it's available */
  savingsPlans?: SavingsCostSummary[];
  /** Reference to the recommendation that this target cost is associated with */
  recommendationId?: string;
  /** Resource Type */
  resourceType?: string;
}

export interface ResourceSpend {
  /** the actual cost spent on the resource.  We can't rename this to spend because it comes from the cost API */
  cost: number;
  /** the amount spent on the resource based on the amortized cost (this takes reserved instances and savings plans into account) */
  costAmortized?: number;
  quantity: number;
  date?: number;
  activeDates?: ActiveDates[];
  /** e.g. true means the resource is active, false means the resource was active (old SKU) */
  active?: boolean;
  /** e.g. true means the resource is an addon such as Defender for Cloud, Backups, Disks, IP address, ASR */
  addon?: boolean;
  /** e.g. Backup, Data Storage, Log Storage, Advanced Threat Protection, Vulnerability Assessment, Long-term Retention Backups */
  referenceName?: string;
  resourceId?: string;
  meterCategory: string;
  meterSubCategory: string;
  serviceName: string;
  meter: string;
  partNumber?: string;
  serviceTier: string;
  resourceGuid: string;
  reservationName?: string;
  label?: string;
  label2?: string;
  /** e.g. Cores: 2 | RAM: 3.5GB | Storage: 10GB | IOPS: 1000 | Throughput: 100MB/s */
  specs?: SpecItem[];
  displayCost?: number;
  displayQuantity?: number;
  displayUnitPrice?: string;
  unitOfMeasure?: string;
  unitPrice?: number;
  retailDiscountPercentDisplay?: string;
  dailyMetrics?: DailyMetrics[];
  summaryMetrics?: DisplayMetric[];
}

export interface PricingResponse {
  Items: AzurePrice[];
  NextPageLink?: string;
}

export interface MiscCost {
  spendSummary?: ResourceSpend[];
  totalSpend30Days?: number;
  totalSpend30DaysAmortized?: number;
}
