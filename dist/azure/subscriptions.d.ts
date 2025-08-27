import { Budget } from './budgets.js';
import { CostDetails, MiscCost } from './prices.js';
import { Recommendation, RecommendationStats, RecommendationSummary } from './recommendations.js';
import { ResourceByLocation, ResourcesByType } from './resources.js';
export interface SubscriptionSummaryLite {
    tenantId: string;
    subscriptionId: string;
    displayName: string;
    properties?: SubscriptionProperties;
}
export interface CompanySubscription {
    companyId: string;
    id: string;
    name: string;
    cloudAccountId: string;
    cloudAccountName: string;
    status?: string;
    error?: string;
    lastUpdated?: string;
    duration?: string;
    currency?: string;
    currencySymbol?: string;
    foundCurrency?: boolean;
    ready?: boolean;
}
export interface SubscriptionSummary {
    tenantId: string;
    subscriptionId: string;
    displayName: string;
    properties?: SubscriptionProperties;
    recommendationSummary: RecommendationSummary[];
    totalCostSavings: number;
    totalRetailCost: number;
    spendingLimit: boolean;
    budgets: Budget[];
    recommendations: Recommendation[];
    stats: SubscriptionStats;
    miscCost?: MiscCost;
}
export interface Subscription {
    tenantId: string;
    tenantSubscriptionIds: string[];
    subscriptionId: string;
    displayName: string;
    properties?: SubscriptionProperties;
    recommendations?: Recommendation[];
    spendingLimit: boolean;
    quotaId: string;
    budgets?: Budget[];
    stats?: SubscriptionStats;
    recommendationSummary?: RecommendationSummary[];
    miscCost?: CostDetails;
}
export interface SubscriptionStats {
    resourcesTotal: number;
    recommendations: RecommendationStats;
    recommendationsUnique: RecommendationStats;
    recommendationsCustom: RecommendationStats;
    resourcesByLocation: ResourceByLocation[];
    resourcesByType: ResourcesByType[];
    spend30Days?: number;
    spend30DaysAmortized?: number;
    spendPrevious30Days?: number;
    spendPrevious30DaysAmortized?: number;
    spend7Days?: number;
    spend7DaysAmortized?: number;
    spendPrevious7Days?: number;
    spendPrevious7DaysAmortized?: number;
}
export interface SubscriptionPolicies {
    locationPlacementId: string;
    quotaId: string;
    spendingLimit: string;
}
export interface SubscriptionProperties {
    secureScore: number;
    currency: string;
    currencySymbol: string;
    foundCurrency: boolean;
    showAmortizedCosts: boolean;
}
//# sourceMappingURL=subscriptions.d.ts.map