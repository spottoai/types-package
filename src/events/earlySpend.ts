import type { QuickAlertSummary } from './quickAlerts.js';

/**
 * Early spend alerts flag spend before it appears on the Azure bill.
 * Every early-spend figure is an estimate and is reconciled against billing once billing covers the signal date.
 */
export const EARLY_SPEND_SIGNAL_KINDS = ['costImpact', 'createBurst', 'telemetryRunRate'] as const;

/**
 * - costImpact: an activity-log create or change whose estimated incremental daily cost crosses the threshold.
 * - createBurst: many creates of one costed resource type by one caller within a window.
 * - telemetryRunRate: the daily cost estimated from telemetry for unbilled days rises above the resource's billed baseline.
 */
export type EarlySpendSignalKind = (typeof EARLY_SPEND_SIGNAL_KINDS)[number];

export interface EarlySpendBurstCriteria {
  /** Creates within `windowMinutes` needed to open a burst alert. */
  minCount: number;
  windowMinutes: number;
  /** Optional 24-hour count that also opens a burst alert. */
  minCount24h?: number;
}

export interface EarlySpendAlertCriteria {
  kind: 'earlySpend';
  source: 'costSignals';
  templateId?: 'early-spend-default';
  signals: EarlySpendSignalKind[];
  /** Absolute floor for estimated incremental daily cost, in the subscription currency. */
  minEstimatedDailyCost?: number;
  /** Relative floor: percent of the subscription's 7-day average daily billed cost. The higher of the two floors applies. */
  minPercentOfBaseline?: number;
  /** Percent rise over the resource's billed baseline needed for a telemetryRunRate signal. */
  telemetryMinIncreasePercent?: number;
  burst?: EarlySpendBurstCriteria;
  /** Minimum estimate confidence (0-1). */
  minConfidence?: number;
  /** Optional narrowing to specific Azure resource types (lowercase ARM type). */
  resourceTypes?: string[];
  /** Caller identity is shown in the portal; external channels include it only when true. */
  includeCallerInExternalNotifications?: boolean;
}

/** Default criteria for early spend alerts. Returns a fresh object so callers can't mutate shared defaults. */
export const createEarlySpendDefaultCriteria = (): EarlySpendAlertCriteria => ({
  kind: 'earlySpend',
  source: 'costSignals',
  templateId: 'early-spend-default',
  signals: [...EARLY_SPEND_SIGNAL_KINDS],
  minEstimatedDailyCost: 25,
  minPercentOfBaseline: 5,
  telemetryMinIncreasePercent: 50,
  burst: { minCount: 20, windowMinutes: 60, minCount24h: 100 },
  minConfidence: 0.5,
  includeCallerInExternalNotifications: false,
});

export type EarlySpendEstimateBasis = 'sku_pricing' | 'metrics_pricing' | 'billing_run_rate' | 'billable_ratio' | 'count_only';

/**
 * - pending: billing does not yet cover the signal date.
 * - confirmed: billed daily cost within 30% of the estimate.
 * - overestimated: billed below 70% of the estimate.
 * - underestimated: billed above 130% of the estimate.
 * - not_billed: the resource was deleted and never billed.
 */
export type EarlySpendReconciliationState = 'pending' | 'confirmed' | 'overestimated' | 'underestimated' | 'not_billed';

export interface EarlySpendReconciliation {
  state: EarlySpendReconciliationState;
  billedDailyCost?: number;
  /** Latest complete billed date used for reconciliation (YYYY-MM-DD). */
  billedThroughDate?: string;
  /** (billed - estimated) / estimated x 100. */
  variancePercent?: number;
  reconciledAt?: string;
}

export interface EarlySpendActivityContext {
  operationName: string;
  eventTimestamp: string;
  correlationId?: string;
  /** User principal name or application id. */
  caller?: string;
}

export interface EarlySpendBurstContext {
  count: number;
  windowStart: string;
  windowEnd: string;
  caller?: string;
  sampleResourceIds: string[];
}

/**
 * Summary for an early spend alert instance. Extends the shared quick-alert summary so
 * existing readers of quick-alert summaries keep compiling. `subscriptionId` and
 * `summaryText` come from the base summary.
 */
export interface EarlySpendAlertSummary extends QuickAlertSummary {
  signalKind: EarlySpendSignalKind;
  resourceId?: string;
  resourceType: string;
  resourceName?: string;
  currency: string;
  /** Incremental daily cost for costImpact and createBurst; estimated daily run-rate for telemetryRunRate. */
  estimatedDailyCost: number;
  /** Present when the estimate is a range (e.g. incremental snapshots); alerts use `low`. */
  estimatedDailyCostRange?: { low: number; high: number };
  baselineDailyCost?: number;
  estimateBasis: EarlySpendEstimateBasis;
  /** 0-1 */
  confidence: number;
  /** Activity event timestamp, or first spike hour for telemetry signals (ISO). */
  firstSignalAt: string;
  detectedAt: string;
  activity?: EarlySpendActivityContext;
  burst?: EarlySpendBurstContext;
  reconciliation: EarlySpendReconciliation;
}
