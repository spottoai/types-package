export interface AwsBillingEstimateDateRange {
  startDateInclusive: string;
  endDateInclusive: string;
  dayCount: number;
}

/** A conditional billing estimate, with all amounts excluding tax. */
export interface AwsEstimatedBillingAuthorityBlock {
  costSource: 'estimated' | 'blended';
  costSourceConfidence: 'high' | 'medium' | 'low';
  estimatedCostMethod: 'billing_window_estimate' | 'pricing_reference' | 'usage_run_rate' | 'metrics_pricing' | 'mixed' | 'unknown';
  authoritySource: 'billing-data-estimated-charges' | 'cost-explorer-estimated-charges' | 'shared-estimator' | 'manual-reference' | 'unknown';
  authorityReason: 'current-period-not-finalized' | 'billing-window-incomplete' | 'billing-window-unavailable' | 'mixed-coverage' | 'unknown';
  windowDateRange: AwsBillingEstimateDateRange;
  billingCoveredDateRange?: AwsBillingEstimateDateRange;
  estimatedCoveredDateRange: AwsBillingEstimateDateRange;
  uncoveredDateRange?: AwsBillingEstimateDateRange;
  billingWindowFinality: 'not-finalized' | 'partially-finalized' | 'unknown';
  coveragePercentage: number;
  totalsByCurrency: Array<{
    currency: string;
    actualCostAmount: number;
    estimatedCostAmount: number;
    blendedCostAmount: number;
  }>;
}
