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
  utilization?: IBenefitUtilization;
}

export interface CommitmentsResourceCoverageItem {
  resourceId: string;
  resourceName?: string;
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
  benefitBreakdown?: IBenefitCoverageBreakdownEntry[];
}

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

export interface CommitmentsPricingContext {
  source: 'retail' | 'negotiated' | 'unknown';
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
