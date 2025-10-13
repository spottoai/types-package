/**
 * Billing plot types for Azure cost visualization
 */

/** Supported billing plot categories */
export type BillingPlotType = 'daily' | 'forecast' | 'monthly' | 'yearly';

export interface BillingPlot {
  /** File path to the plot image */
  file: string;
  /** Type of plot (e.g., 'daily', 'forecast') */
  type: BillingPlotType;
  /** Start date of the plot data (Unix timestamp) */
  startDate: number;
  /** End date of the plot data (Unix timestamp) */
  endDate: number;
}

/** Impact metrics associated with a billing anomaly */
export interface BillingAnomalyImpact {
  /** Total cost for the anomaly window */
  cost: number;
  /** Difference from baseline for the anomaly window */
  delta: number;
  /** 7-day baseline cost when available */
  baseline7Day: number | null;
  /** 30-day baseline cost when available */
  baseline30Day: number | null;
  /** Percent change against the baseline cost */
  percentChange: number | null;
  /** Cost recorded for the previous day */
  previousDayCost: number | null;
  /** Delta recorded for the previous day */
  previousDayDelta: number | null;
  /** Month-to-date cost at the anomaly occurrence */
  monthToDateCost: number;
  /** Month-to-date baseline cost */
  monthToDateBaseline: number | null;
  /** Month-to-date delta compared to baseline */
  monthToDateDelta: number | null;
  /** Month-to-date percent change compared to baseline */
  monthToDatePercentChange: number | null;
}

/** Resource contributing to a billing anomaly driver */
export interface BillingAnomalyDriverResource {
  /** Resource identifier */
  name: string;
  /** Total cost attributed to the resource */
  cost: number;
  /** Baseline cost for the resource */
  baseline: number | null;
  /** Delta between current cost and baseline */
  delta: number;
  /** Percent change from baseline */
  percentChange: number | null;
  /** Whether the resource is new or previously idle */
  isNew: boolean;
  /** Human-readable summary for the resource impact */
  summary: string;
}

/** Driver contributing to a billing anomaly */
export interface BillingAnomalyDriver {
  /** Classification for the driver (e.g., service) */
  type: 'service' | (string & {});
  /** Name of the driver */
  name: string;
  /** Summary of the driver's impact */
  summary: string;
  /** Total cost attributed to the driver */
  cost: number;
  /** Delta between current cost and baseline */
  delta: number;
  /** Baseline cost for the driver */
  baseline: number | null;
  /** Percent change from baseline */
  percentChange: number | null;
  /** Percentage contribution of the driver to the anomaly */
  shareOfImpactPercent: number;
  /** Whether the driver represents new or returning spend */
  isNew: boolean;
  /** Resources that contributed to the driver's anomaly */
  resources: BillingAnomalyDriverResource[];
}

/** Confidence level classifications for anomalies */
export type BillingAnomalyConfidence = 'Low' | 'Medium' | 'High' | (string & {});

/** Representation of a detected billing anomaly */
export interface BillingAnomaly {
  /** Unix timestamp for the anomaly date */
  date: number;
  /** Summary describing the anomaly */
  summary: string;
  /** Impact metrics captured for the anomaly */
  impact: BillingAnomalyImpact;
  /** Drivers that explain the anomaly */
  drivers: BillingAnomalyDriver[];
  /** Heuristic confidence of the anomaly classification */
  confidence: BillingAnomalyConfidence;
  /** Additional contextual notes for the anomaly */
  notes: string[];
}

export interface BillingPlotsMetadata {
  /** Azure subscription ID */
  subscriptionId: string;
  /** Array of billing plots */
  plots: BillingPlot[];
  /** Detected anomalies for the subscription */
  anomalies: BillingAnomaly[];
}
