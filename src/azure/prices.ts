import { ActiveDates, SpecItem } from './common.js';
import { DailyMetrics, DisplayMetric } from './metrics.js';

export interface CostDetails {
  dailySpend?: ResourceSpend[]; // the amount spend on the resource over the last 30 days
  spendSummary?: ResourceSpend[]; // the spend items aggregated for the last 30 days
  spendSummaryPrevious?: ResourceSpend[]; // the spend items aggregated for the previous 30 days
  totalSpend30Days?: number; // the total amount spend on the resource over the last 30 days
  totalSpend30DaysPrevious?: number; // the total amount spend on the resource over the previous 30 days
  totalSpend30DaysAmortized?: number; // the total amount spend on the resource over the last 30 days, taking into account reserved instances and savings plans
  totalSpend30DaysAmortizedPrevious?: number; // the total amount spend on the resource over the previous 30 days, taking into account reserved instances and savings plans
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
  effectiveStartDate: string; // ISO 8601 date string
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
  type: string; // Consumption, Reservation
  isPrimaryMeterRegion: boolean;
  armSkuName: string;
  savingsPlan: SavingsPlan[];
  monthlyPrice?: number;
  targetAzurePrices?: AzurePrice[]; // Use this property to set alternative Azure pricing SKU
  reservedInstances?: SavingsCostSummary[]; // Reserved instances for this price level
  targetMonthlySavings?: number; // Amount of money saved compared to the parent
  targetSavingsPercent?: number; // Percentage of money saved compared to the parent
  targetSavingsPercentDisplay?: string; // Show the display percent such as -10%
  targetSavings?: number;
  targetSavingsDisplay?: string;
  targetLabel?: string;
  subLabel?: string;
  quantity?: number;
  displayLabel?: string;
  displayUnitPrice?: string;
  displayTotalPrice?: number;
  displayQuantity?: number;
  recommendationId?: string; // Reference to the recommendation that this target cost is associated with
}

export interface SavingsPlan {
  unitPrice: number;
  retailPrice: number;
  term: string; // e.g., "1 Year", "3 Years"
}

export interface CostSummaryDetails {
  total?: number; // Last 30 days
  totalPrevious?: number; // Total cost in the previous 30 days
  amortizedTotal?: number; // Last 30 days, taking into account reserved instances and savings plans
  amortizedTotalPrevious?: number; // Total cost in the previous 30 days, taking into account reserved instances and savings plans
  items?: ResourceCostSummary[];
}

export interface ResourceCostSummary {
  label1: string; // e.g. "Basic Plan (B2 App)"
  label2: string; // e.g. "Azure App Service"
  label3?: string;
  label4?: string;
  category?: string; // e.g. "Bandwidth", "Defender for Cloud"
  specs: SpecItem[]; // e.g. Cores: 2 | RAM: 3.5GB | Storage: 10GB
  reservation?: string; // name of the reservation if it's a reserved instance
  active: boolean; // e.g. true means the resource is active, false means the resource was active (old SKU)
  addon: boolean; // e.g. true means the resource is an addon such as Defender for Cloud, Backups, Disks, IP address, ASR
  spend: number; // e.g. 66.09 (rounded to 2 decimal places) - the amount of money spent on the resource based on the date range
  spendAmortized: number; // e.g. 66.09 (rounded to 2 decimal places) - the amount of money spent on the resource based on the date range, taking into account reserved instances and savings plans
  quantity: number; // e.g. 217.21 (rounded to 2 decimal places)
  dates?: ActiveDates[]; // e.g. [ { startDate: 20250601, endDate: 20250610 } ]
  unitPrice: string; // e.g. 0.304140 1/Hour
  unitPriceAmortized: string; // e.g. 0.304140 1/Hour
  monthlyPrice?: number; // e.g. 730.00 (rounded to 2 decimal places)
  retailDiscount: string; // e.g. -4%
  retailCost?: RetailCostSummary;
  dailyMetrics?: DailyMetrics[];
  summaryMetrics?: DisplayMetric[];
  resourceId?: string; // Reference to the actual Azure resource
  resourceName?: string; // Human-readable resource name
  resourceType?: string; // Azure resource type
}

export interface RetailCostSummary {
  unitPrice: string; // e.g. 0.304140 1/Hour
  monthlyPrice: number; // e.g. 730.00 (rounded to 2 decimal places)
  cost: number; // e.g. 66.09 (rounded to 2 decimal places)
  savingsPlans?: SavingsCostSummary[];
  reservedInstances?: SavingsCostSummary[];
  targetCost?: TargetCostSummary[]; // This is for a multi-level target (e.g. From Windows To Linux from P2 SKU to P1 SKU)
}

export interface SavingsCostSummary {
  unitPrice: string; // e.g. 0.304140 1/Hour
  term: string; // e.g. "1 Year", "3 Years"
  monthlyPrice: number; // e.g. 730.00 (rounded to 2 decimal places)
  savingsPercent: string; // e.g. 10%
  monthlySavings: number; // e.g. 100.00 (rounded to 2 decimal places)
}

export interface TargetCostSummary {
  targetLabel?: string; // e.g. Windows to Linux migration
  label1: string; // e.g. "Basic Plan (B2 App)"
  label2: string; // e.g. "Azure App Service"
  label3?: string;
  label4?: string;
  specs: SpecItem[]; // e.g. Cores: 2 | RAM: 3.5GB | Storage: 10GB
  cost: number; // e.g. 66.09 (rounded to 2 decimal places)
  savings: number; // e.g. 100.00 (rounded to 2 decimal places)
  unitPrice: string; // e.g. 0.304140 1/Hour
  monthlyPrice: number; // e.g. 730.00 (rounded to 2 decimal places)
  monthlySavings: number; // e.g. 100.00 (rounded to 2 decimal places)
  monthlySavingsPercent: string; // e.g. 10%
  targetCost?: TargetCostSummary[]; // This is for a multi-level target (e.g. From Windows To Linux from P2 SKU to P1 SKU)
  reservedInstances?: SavingsCostSummary[]; // This is for reserved intances if it's available
  recommendationId?: string; // Reference to the recommendation that this target cost is associated with
}

export interface ResourceSpend {
  cost: number; // the actual cost spent on the resource.  We can't rename this to spend because it comes from the cost API
  costAmortized?: number; // the amount spent on the resource based on the amortized cost (this takes reserved instances and savings plans into account)
  quantity: number;
  date?: number;
  activeDates?: ActiveDates[];
  active?: boolean; // e.g. true means the resource is active, false means the resource was active (old SKU)
  addon?: boolean; // e.g. true means the resource is an addon such as Defender for Cloud, Backups, Disks, IP address, ASR
  referenceName?: string; // e.g. Backup, Data Storage, Log Storage, Advanced Threat Protection, Vulnerability Assessment, Long-term Retention Backups
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
  specs?: SpecItem[]; // e.g. Cores: 2 | RAM: 3.5GB | Storage: 10GB | IOPS: 1000 | Throughput: 100MB/s
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
