import type { BillingAnomalyDriver } from '../azure/billingPlots.js';

/**
 * A compact representation of anomaly drivers that are treated as subscription-level spend
 * (i.e. no stable resourceId to deep link to), used in cost anomaly notifications.
 */
export interface CostAnomalySubscriptionPlan {
  name: string;
  summary?: string;
  resourceId?: string;
  serviceName?: string;
  cost?: number;
  delta?: number;
  percentChange?: number | null;
}

export type CostAnomalyStatus = 'new' | 'notified';

/**
 * Persisted cost anomaly record used for notification dedupe and anomaly history.
 */
export interface CostAnomalyRecord {
  subscriptionId: string;
  anomalyId: string;
  /** Unix timestamp for the anomaly date */
  date: number;
  summary: string;
  confidence?: string;
  cost?: number;
  delta?: number;
  percentChange?: number | null;
  currencyCode?: string;
  detectedAt: string;
  notifiedAt?: string;
  status: CostAnomalyStatus;
  drivers?: BillingAnomalyDriver[];
  notes?: string[];
  metadata?: Record<string, unknown>;
  resourceIds?: string[];
  resourceNames?: string[];
  subscriptionPlans?: CostAnomalySubscriptionPlan[];
}

export interface CostAnomalyListResult {
  results: CostAnomalyRecord[];
  continuation?: { NextPartitionKey?: string; NextRowKey?: string };
}
