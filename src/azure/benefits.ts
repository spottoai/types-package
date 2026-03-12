import type { SubscriptionSummaryLite } from './subscriptions.js';

export type BenefitType = 'reservation' | 'savings-plan';
export type BenefitScope = 'Shared' | 'Single';
export type BenefitBucket = 'expired' | 'expiring-30d' | 'expiring-60d' | 'expiring-180d' | 'active-gt-180d' | 'underutilized-30d';
export type BenefitCostBasis = 'actual' | 'amortized';
export type OdeSource = 'pricing_model' | 'retail_rate' | 'discount_delta' | 'unknown';
export type EsrStatus = 'computed' | 'estimated' | 'unavailable';

export interface IBenefitUtilization {
  trend?: string;
  oneDay?: number;
  sevenDay?: number;
  thirtyDay?: number;
  source?: 'aggregate' | 'usage';
}

export interface IBenefit {
  id: string;
  benefitType: BenefitType;
  scope: BenefitScope;
  type: string;
  displayName?: string;
  expiryDate?: string | null;
  status: 'active' | 'expired';
  subscriptionId?: string;
  purchaseDate?: string | null;
  reservedQuantity?: number;
  commitmentAmount?: number;
  utilization?: IBenefitUtilization;
}

export interface IBenefitBucketSummary {
  bucket: BenefitBucket;
  total: number;
  byType: Array<{ type: string; count: number }>;
  byScope: Array<{ scope: BenefitScope; count: number }>;
  byBenefitType: Array<{ benefitType: BenefitType; count: number }>;
}

export interface IBenefitUtilizationSummary {
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

export interface IBenefitInventorySummary {
  generatedAt: string;
  summary: {
    total: number;
    active: number;
    expired: number;
  };
  buckets: IBenefitBucketSummary[];
  utilization: IBenefitUtilizationSummary;
}

export interface IBenefitCoverageServiceEntry {
  serviceName: string;
  eligibleQuantity?: number;
  coveredQuantity?: number;
  eligibleCost?: number;
  coveredCost?: number;
  uncoveredCost?: number;
  coveragePercent?: number;
}

export interface IBenefitCoverageServiceSummary {
  basis: BenefitCostBasis;
  windowStart?: string;
  windowEnd?: string;
  eligibleQuantity?: number;
  coveredQuantity?: number;
  eligibleCost?: number;
  coveredCost?: number;
  uncoveredCost?: number;
  coveragePercent?: number;
  services: IBenefitCoverageServiceEntry[];
}

export interface IBenefitCoverageBreakdownEntry {
  benefitId?: string;
  benefitName?: string;
  coveredQuantity?: number;
  coveredCost?: number;
}

export interface IEffectiveSavingsRateSummary {
  basis: BenefitCostBasis;
  windowStart?: string;
  windowEnd?: string;
  odeCost?: number;
  actualCost?: number;
  amortizedCost?: number;
  esrPercent?: number;
  odeSource?: OdeSource;
  esrStatus?: EsrStatus;
}

export interface ISubscriptionBenefitsSummary {
  version: string;
  generatedAt: string;
  subscription?: SubscriptionSummaryLite;
  inventorySummary: IBenefitInventorySummary;
  inventory: IBenefit[];
  sharedInventorySummary?: IBenefitInventorySummary;
  sharedInventory?: IBenefit[];
  utilization: IBenefitUtilizationSummary;
  coverage: IBenefitCoverageServiceSummary[];
  esr: IEffectiveSavingsRateSummary[];
  warnings?: string[];
}
