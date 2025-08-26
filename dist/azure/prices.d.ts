import { ActiveDates, SpecItem } from './common.js';
import { DailyMetrics, DisplayMetric } from './metrics.js';
export interface CostDetails {
    dailySpend?: ResourceSpend[];
    spendSummary?: ResourceSpend[];
    totalSpend30Days?: number;
    totalSpend30DaysAmortized?: number;
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
    type: string;
    isPrimaryMeterRegion: boolean;
    armSkuName: string;
    savingsPlan: SavingsPlan[];
    monthlyPrice?: number;
    targetAzurePrices?: AzurePrice[];
    reservedInstances?: SavingsCostSummary[];
    targetMonthlySavings?: number;
    targetSavingsPercent?: number;
    targetSavingsPercentDisplay?: string;
    targetSavings?: number;
    targetSavingsDisplay?: string;
    targetLabel?: string;
    subLabel?: string;
    quantity?: number;
    displayLabel?: string;
    displayUnitPrice?: string;
    displayTotalPrice?: number;
    displayQuantity?: number;
}
export interface SavingsPlan {
    unitPrice: number;
    retailPrice: number;
    term: string;
}
export interface CostSummaryDetails {
    total?: number;
    amortizedTotal?: number;
    items?: ResourceCostSummary[];
}
export interface ResourceCostSummary {
    label1: string;
    label2: string;
    specs: SpecItem[];
    reservation?: string;
    active: boolean;
    addon: boolean;
    spend: number;
    spendAmortized: number;
    quantity: number;
    dates?: ActiveDates[];
    unitPrice: string;
    monthlyPrice?: number;
    retailDiscount: string;
    retailCost?: RetailCostSummary;
    dailyMetrics?: DailyMetrics[];
    summaryMetrics?: DisplayMetric[];
}
export interface RetailCostSummary {
    unitPrice: string;
    monthlyPrice: number;
    cost: number;
    savingsPlans?: SavingsCostSummary[];
    reservedInstances?: SavingsCostSummary[];
    targetCost?: TargetCostSummary[];
}
export interface SavingsCostSummary {
    unitPrice: string;
    term: string;
    monthlyPrice: number;
    savingsPercent: string;
    monthlySavings: number;
}
export interface TargetCostSummary {
    targetLabel?: string;
    label1: string;
    label2: string;
    specs: SpecItem[];
    cost: number;
    savings: number;
    unitPrice: string;
    monthlyPrice: number;
    monthlySavings: number;
    monthlySavingsPercent: string;
    targetCost?: TargetCostSummary[];
    reservedInstances?: SavingsCostSummary[];
}
export interface ResourceSpend {
    cost: number;
    costAmortized?: number;
    quantity: number;
    date?: number;
    activeDates?: ActiveDates[];
    active?: boolean;
    addon?: boolean;
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
//# sourceMappingURL=prices.d.ts.map