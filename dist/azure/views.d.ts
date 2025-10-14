import { ActivityLog, MonthSummary } from './common.js';
import { DisplayMetric, MetricPlot } from './metrics.js';
import { CostSummaryDetails } from './prices.js';
import { AzureRecommendationLite, Recommendation } from './recommendations.js';
import { SubscriptionSummary, SubscriptionSummaryLite } from './subscriptions.js';
export interface AzureDashboardView {
    subscription: SubscriptionSummary;
    timestamp: string;
    costStartDate?: number;
    costEndDate?: number;
    calendarSummary?: MonthSummary;
    billingPeriodSummary?: MonthSummary;
    summary?: ExecutiveSummary;
}
export interface ExecutiveSummary {
    summary: string;
    details: string;
}
export interface AzureResourcesView {
    subscription: SubscriptionSummaryLite;
    timestamp: string;
    resources: AzureResourcePortalItem[];
    tags?: Record<string, string[]>;
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
    savings?: SavingsPotential;
    recommendations: AzureRecommendationLite[];
    customRecommendations: AzureRecommendationLite[];
    tags?: Record<string, string>;
    createdTime?: number;
}
export interface SavingsPotential {
    minAmount: number;
    minPercentage: number;
    maxAmount: number;
    maxPercentage: number;
}
export interface AzureResourcePluginView {
    currency: string;
    currencySymbol: string;
    timestamp: string;
    resources: AzureResourcePluginItem[];
    costStartDate?: number;
    costEndDate?: number;
}
export interface AzureResourcePluginItem {
    id: string;
    name: string;
    type: string;
    location: string;
    recommendations?: Recommendation[];
    cost?: CostSummaryDetails;
    metrics?: DisplayMetric[];
    activityLogs?: ActivityLog[];
}
export interface AzureResourcePluginItemDetailed {
    currency: string;
    currencySymbol: string;
    location: string;
    costStartDate?: number;
    costEndDate?: number;
    timestamp: string;
    id: string;
    companyId?: string;
    type: string;
    name: string;
    recommendations?: Recommendation[];
    cost?: CostSummaryDetails;
    metrics?: DisplayMetric[];
    activityLogs?: ActivityLog[];
    properties?: Record<string, string>;
    plots?: MetricPlot[];
    subscription: string;
    resourceGroup: string;
    tags?: Record<string, string>;
}
export interface AzurePluginResourcesLite {
    currency: string;
    currencySymbol: string;
    resources: AzurePluginResourceLite[];
}
export interface AzurePluginResourceLite {
    resourceId: string;
    spend: number;
    amortizedSpend: number;
    recommendations: AzureRecommendationLite[];
    customRecommendations: AzureRecommendationLite[];
}
//# sourceMappingURL=views.d.ts.map