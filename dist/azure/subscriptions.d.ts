import type { SubscriptionInfoBase, SubscriptionType } from '../accounts/accounts.js';
import { Budget } from './budgets.js';
import { CostDetails, MiscCost } from './prices.js';
import { Recommendation, RecommendationStats, RecommendationSummary } from './recommendations.js';
import { ResourceByLocation, ResourcesByType } from './resources.js';
import { SavingsPotential } from './views.js';
import type { AdvisorScorePillarScores } from './advisorScore.js';
export type SpendDataSource = 'billing' | 'estimated_metrics_pricing' | 'estimated_sku_pricing' | 'blended' | 'none';
export type SecureScoreEvidenceStatus = 'available' | 'unavailable' | 'stale';
/**
 * Provider evidence for one Defender for Cloud Secure Score observation.
 *
 * The legacy scalar score remains on SubscriptionProperties for compatibility.
 * Consumers should use this evidence to distinguish a genuine zero from missing
 * provider data and must not aggregate percentages when weight is unavailable.
 */
export interface SecureScoreEvidence {
    status: SecureScoreEvidenceStatus;
    /** Provider-reported 0-100 percentage when available. */
    percentage?: number;
    /** Provider score points earned. */
    currentScore?: number;
    /** Provider score points available. */
    maxScore?: number;
    /** Provider aggregation weight for this subscription/scope, when supplied. */
    weight?: number;
    /** Healthy + unhealthy assessed resources, excluding not-applicable resources. */
    assessedResourceCount?: number;
    observedAt?: string;
}
export interface SubscriptionSummaryLite {
    companyId: string;
    tenantId: string;
    subscriptionId: string;
    displayName: string;
    properties?: SubscriptionProperties;
}
export interface CompanySubscription extends SubscriptionInfoBase {
    /** Partition Key */
    companyId: string;
    /** Azure Subscription ID */
    id: string;
}
export interface SubscriptionSummary {
    companyId: string;
    tenantId: string;
    subscriptionId: string;
    displayName: string;
    properties?: SubscriptionProperties;
    recommendationSummary: RecommendationSummary[];
    savings: SavingsPotential;
    totalRetailCost: number;
    spendingLimit: boolean;
    budgets: Budget[];
    recommendations: Recommendation[];
    stats: SubscriptionStats;
    miscCost?: MiscCost;
}
export interface Subscription {
    companyId: string;
    tenantId: string;
    tenantSubscriptionIds: string[];
    subscriptionId: string;
    displayName: string;
    /** Optional subscription type (Production, Non-Production, Mixed) */
    subscriptionType?: SubscriptionType;
    properties?: SubscriptionProperties;
    recommendations?: Recommendation[];
    spendingLimit: boolean;
    quotaId: string;
    budgets?: Budget[];
    stats?: SubscriptionStats;
    recommendationSummary?: RecommendationSummary[];
    /** This is for any cost that doesn't belong to a resource, such as Defender for Cloud */
    miscCost?: CostDetails;
}
export interface SubscriptionStats {
    /** total number of resources in the subscription */
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
    /** Source of spend30Days after billing-first + estimation fallback reconciliation */
    spend30DaysSource?: SpendDataSource;
    /** Source of spend30DaysAmortized after billing-first + estimation fallback reconciliation */
    spend30DaysAmortizedSource?: SpendDataSource;
    /** Confidence level for the spend30Days source attribution */
    spend30DaysSourceConfidence?: 'high' | 'unknown';
    /** Billing-backed (actual) portion of spend30Days */
    spend30DaysActual?: number;
    /** Billing-backed (actual) portion of spend30DaysAmortized */
    spend30DaysAmortizedActual?: number;
    /** Estimated-only portion of spend30Days */
    spend30DaysEstimated?: number;
    /** Estimated-only portion of spend30DaysAmortized */
    spend30DaysAmortizedEstimated?: number;
    /** Billing-only portion of spend30Days */
    spend30DaysBilling?: number;
    /** Billing-only portion of spend30DaysAmortized */
    spend30DaysAmortizedBilling?: number;
    /** Breakdown of estimated fallback by estimator source */
    spend30DaysEstimatedSourceBreakdown?: {
        billing: number;
        estimated_metrics_pricing: number;
        estimated_sku_pricing: number;
    };
}
export interface SubscriptionHistory {
    id?: string;
    subscriptionId: string;
    displayName: string;
    history: SubscriptionHistoryItem[];
}
export interface SubscriptionHistoryItem {
    /** 20250520 */
    date: number;
    /** Omitted when Defender for Cloud did not return an observed score. */
    secureScore?: number;
    secureScoreEvidence?: SecureScoreEvidence;
    advisorScore?: number;
    advisorScores?: AdvisorScorePillarScores;
    resourcesTotal: number;
    recommendations: RecommendationStats;
    recommendationsUnique: RecommendationStats;
    recommendationsCustom: RecommendationStats;
    recommendationSummary: RecommendationSummary[];
}
export interface SubscriptionPolicies {
    locationPlacementId: string;
    quotaId: string;
    spendingLimit: string;
}
export interface SubscriptionProperties {
    /** Omitted when no current or last-known Defender for Cloud score exists. */
    secureScore?: number;
    secureScoreEvidence?: SecureScoreEvidence;
    advisorScore?: number;
    advisorScoreCost?: number;
    advisorScoreSecurity?: number;
    advisorScorePerformance?: number;
    advisorScoreReliability?: number;
    advisorScoreOperationalExcellence?: number;
    currency: string;
    currencySymbol: string;
    foundCurrency: boolean;
    showAmortizedCosts: boolean;
}
//# sourceMappingURL=subscriptions.d.ts.map