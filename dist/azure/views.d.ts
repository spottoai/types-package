import { MonthSummary } from "./common.js";
import { AzureRecommendationLite } from "./recommendations.js";
import { SubscriptionSummary, SubscriptionSummaryLite } from "./subscriptions.js";
export interface AzureDashboardView {
    subscription: SubscriptionSummary;
    timestamp: string;
    costStartDate?: number;
    costEndDate?: number;
    calendarSummary?: MonthSummary;
    billingPeriodSummary?: MonthSummary;
}
export interface AzureResourcesView {
    subscription: SubscriptionSummaryLite;
    timestamp: string;
    resources: AzureResourcePortalItem[];
}
export interface AzureResourcePortalItem {
    id: string;
    name: string;
    label1?: string;
    label2?: string;
    label3?: string;
    sku?: string;
    serviceName?: string;
    icon?: string;
    description?: string;
    product?: string;
    type: string;
    location: string;
    spend: number;
    spendAmortized: number;
    recommendations: AzureRecommendationLite[];
}
//# sourceMappingURL=views.d.ts.map