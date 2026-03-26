import type { BenefitCostBasis, BenefitScope, BenefitType, IBenefitCoverageBreakdownEntry, IBenefitUtilization } from './benefits.js';
import type { SubscriptionSummaryLite } from './subscriptions.js';

export type CommitmentsPlanningVersion = '1.0';

export interface CommitmentsPlanningView {
  version: CommitmentsPlanningVersion;
  generatedAt: string;
  month?: string;
  subscription?: SubscriptionSummaryLite;
  utilizationSummary: CommitmentsUtilizationSummary;
  expirySummary: CommitmentsExpirySummary;
  inventory: CommitmentsInventoryItem[];
  resourceCoverage: CommitmentsResourceCoverageItem[];
  obsoleteCandidates: CommitmentsObsoleteCandidate[];
  reallocationOpportunities?: CommitmentsReallocationOpportunity[];
  pricingContext: CommitmentsPricingContext;
  termStrategy: CommitmentsTermStrategyScenario[];
}

export interface CommitmentsUtilizationSummary {
  total: number;
  withData: number;
  sevenDayAverage?: number;
  thirtyDayAverage?: number;
  byBenefitType: Array<{
    benefitType: BenefitType;
    total: number;
    withData: number;
    sevenDayAverage?: number;
    thirtyDayAverage?: number;
  }>;
}

export interface CommitmentsExpirySummary {
  expired: number;
  expiring30d: number;
  expiring60d: number;
  expiring90d: number;
  expiring180d: number;
}

export interface CommitmentsInventoryItem {
  id: string;
  benefitType: BenefitType;
  scope: BenefitScope;
  type: string;
  displayName?: string;
  status: 'active' | 'expired';
  subscriptionId?: string;
  purchaseDate?: string;
  expiryDate?: string;
  daysToExpiry?: number;
  reservedQuantity?: number;
  commitmentAmount?: number;
  commitmentCurrencyCode?: string;
  commitmentGrain?: string;
  commitmentUnit?: string;
  skuName?: string;
  skuDescription?: string;
  location?: string;
  term?: string;
  billingPlan?: string;
  billingScopeId?: string;
  appliedScopeDisplayName?: string;
  provisioningState?: string;
  renew?: boolean;
  purchasedQuantity?: number;
  usedQuantity?: number;
  remainingQuantity?: number;
  totalReservedQuantity?: number;
  reservedHours?: number;
  usedHours?: number;
  utilization?: IBenefitUtilization;
}

export interface CommitmentsResourceCoverageItem {
  resourceId: string;
  resourceName?: string;
  resourceType?: string;
  month?: string;
  benefitIds: string[];
  benefitNames: string[];
  basis?: BenefitCostBasis;
  coveredQuantity?: number;
  eligibleQuantity?: number;
  coveredCost?: number;
  eligibleCost?: number;
  uncoveredCost?: number;
  coveragePercent?: number;
  recommendationIds?: string[];
  recommendationType?: CommitmentsRecommendationType;
  recommendedAction?: CommitmentsRecommendationAction;
  recommendationImpact?: {
    amount?: number;
    currency?: string;
    source?: 'payg-cost' | 'amortized' | 'retail' | 'unknown';
  };
  benefitBreakdown?: IBenefitCoverageBreakdownEntry[];
}

export type CommitmentsRecommendationType = 'reserved-instance' | 'savings-plan' | 'hybrid';

export type CommitmentsRecommendationAction = 'buy' | 'exchange' | 'resize' | 'review';

export type CommitmentsObsoleteCandidateType = 'underutilized' | 'coverage-drift' | 'sku-mismatch' | 'near-expiry';
export type CommitmentsSuggestedAction = 'renew' | 'let-expire' | 'exchange' | 'resize' | 'review';

export interface CommitmentsObsoleteCandidate {
  id: string;
  candidateType: CommitmentsObsoleteCandidateType;
  reasonCodes: string[];
  suggestedAction: CommitmentsSuggestedAction;
  confidence?: number;
  impactEstimate?: {
    amount?: number;
    currency?: string;
    source?: 'payg-cost' | 'amortized' | 'retail' | 'unknown';
    notes?: string;
  };
  relatedBenefitIds?: string[];
}

export interface CommitmentsReallocationResourceReference {
  resourceId: string;
  resourceName?: string;
  resourceType?: string;
  subscriptionId?: string;
  subscriptionName?: string;
}

export interface CommitmentsReallocationOpportunity {
  id: string;
  fromResource: CommitmentsReallocationResourceReference;
  toResource: CommitmentsReallocationResourceReference;
  estimatedNetSavings?: number;
  currency?: string;
  source?: 'payg-cost' | 'amortized' | 'retail' | 'unknown';
  confidence?: number;
  assumptions?: string[];
  benefitIds?: string[];
  benefitNames?: string[];
  recommendationIds?: string[];
  obsoleteCandidateIds?: string[];
}

export interface CommitmentsPricingContext {
  source: 'retail' | 'negotiated' | 'unknown' | 'recommendation-apis';
  currency?: string;
  assumptions?: string[];
  confidenceNotes?: string;
  calculatorDeepLink?: string;
}

export interface CommitmentsPolicyInputs {
  earlyTerminationFeePercent?: number;
  rollingCancellationCap?: number;
  exchangeAllowed: boolean;
  policyVersion: string;
}

export interface CommitmentsTermStrategyScenario {
  scenarioId: string;
  termMonths: number;
  breakMonth?: number;
  policyInputs: CommitmentsPolicyInputs;
  projectedGrossSavings?: number;
  projectedBreakCost?: number;
  projectedNetSavings?: number;
  breakEvenMonth?: number;
  recommended?: boolean;
  notes?: string;
}
