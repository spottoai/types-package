import { BillingPeriodStats, Budget } from "./budgets.js"
import { CostDetails, MiscCost } from "./prices.js"
import { Recommendation, RecommendationStats, RecommendationSummary } from "./recommendations.js"
import { ResourceByLocation, ResourcesByType } from "./resources.js"

export interface SubscriptionSummaryLite {
    tenantId: string
    subscriptionId: string
    displayName: string
    properties?: SubscriptionProperties
}

export interface SubscriptionSummary {
    tenantId: string
    subscriptionId: string
    displayName: string
    properties?: SubscriptionProperties
    recommendationSummary: RecommendationSummary[]
    totalCostSavings: number
    totalRetailCost: number
    spendingLimit: boolean
    budgets: Budget[]
    recommendations: Recommendation[]
    stats: SubscriptionStats
    miscCost?: MiscCost
}

export interface Subscription { 
    tenantId: string
    tenantSubscriptionIds: string[]
    subscriptionId: string
    displayName: string
    properties?: SubscriptionProperties
    recommendations?: Recommendation[]
    spendingLimit: boolean
    quotaId: string
    budgets?: Budget[]
    stats?: SubscriptionStats
    recommendationSummary?: RecommendationSummary[]
    miscCost?: CostDetails // This is for any cost that doesn't belong to a resource, such as Defender for Cloud
}

export interface SubscriptionStats {
    resourcesTotal: number // total number of resources in the subscription
    recommendations: RecommendationStats
    recommendationsUnique: RecommendationStats
    recommendationsCustom: RecommendationStats
    resourcesByLocation: ResourceByLocation[]
    resourcesByType: ResourcesByType[]
    billingPeriodSummary?: BillingPeriodStats[]
    spend30Days?: number
    spend30DaysAmortized?: number
    spendPrevious30Days?: number
    spendPrevious30DaysAmortized?: number
    spend7Days?: number
    spend7DaysAmortized?: number
    spendPrevious7Days?: number
    spendPrevious7DaysAmortized?: number
}

export interface SubscriptionPolicies {
    locationPlacementId: string
    quotaId: string
    spendingLimit: string
}

export interface SubscriptionProperties {
    secureScore: number
    currency: string
    currencySymbol: string
    foundCurrency: boolean
    showAmortizedCosts: boolean
}
