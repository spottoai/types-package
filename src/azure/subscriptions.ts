import type { SubscriptionInfoBase, SubscriptionType } from '../accounts/accounts.js';
import { Budget } from './budgets.js';
import { CostDetails, MiscCost } from './prices.js';
import { Recommendation, RecommendationStats, RecommendationSummary } from './recommendations.js';
import { ResourceByLocation, ResourcesByType } from './resources.js';
import { SavingsPotential } from './views.js';
import type { AdvisorScorePillarScores } from './advisorScore.js';
import type { SecureScoreEvidence } from './secureScore.js';
import type { CostComposition } from './costComposition.js';

export type { SecureScoreEvidence, SecureScoreEvidenceStatus } from './secureScore.js';

export type SpendDataSource = 'billing' | 'estimated_metrics_pricing' | 'estimated_sku_pricing' | 'blended' | 'none';

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

export interface SubscriptionScope {
  companyId: string;
  id: string;
  name: string;
  friendlyName?: string;
  cloudAccountId: string;
  cloudAccountName: string;
  groupName?: string;
  icon?: string;
  subscriptionType?: SubscriptionType;
  status?: string;
  statusLabel?: string;
  currency?: string;
  currencySymbol?: string;
  foundCurrency?: boolean;
  ready?: boolean;
  secureScore?: number;
  totalCost?: number;
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

export type ResourceTotalBasis = 'legacy-analyzed-v1' | 'canonical-visible-v1';

export interface ResourceInventoryStats {
  /** Counting contract used for resourcesTotal and canonicalResourceCount. */
  basis: ResourceTotalBasis;
  /** Unique resource IDs present in the discovered subscription inventory. */
  discoveredResourceCount: number;
  /** Unique customer-visible resource IDs after configured exclusions. */
  canonicalResourceCount: number;
  /** Unique resource IDs processed through primary provider files. */
  analyzedResourceCount: number;
  /** Discovered resource IDs intentionally excluded from customer-visible inventory. */
  excludedResourceCount: number;
}

export interface SubscriptionStats {
  /** Total unique customer-visible resources for resourcesTotalBasis. */
  resourcesTotal: number;
  /** Versioned counting contract for resourcesTotal. Missing on legacy payloads. */
  resourcesTotalBasis?: ResourceTotalBasis;
  /** Legacy diagnostic count of unique resources processed through primary provider files. */
  resourcesAnalyzedTotal?: number;
  /** Resource inventory reconciliation diagnostics. */
  resourceInventory?: ResourceInventoryStats;
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
  spend30DaysComposition?: CostComposition;
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
  /** Versioned counting contract for resourcesTotal. Missing means legacy-analyzed-v1. */
  resourcesTotalBasis?: ResourceTotalBasis;
  /** Legacy diagnostic count retained across the canonical-visible migration. */
  resourcesAnalyzedTotal?: number;
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
  /** Omitted until supported Azure billing evidence resolves a subscription currency. */
  currency?: string;
  /** Omitted while currency is unresolved or when no display symbol is known. */
  currencySymbol?: string;
  foundCurrency: boolean;
  showAmortizedCosts: boolean;
}
