/**
 * Billing cost analysis types for Azure cost visualization.
 */

/** Named cost chart windows emitted by the Azure billing analyzer. */
export type BillingChartViewKey = '7_days' | '30_days' | '90_days' | '12_months' | 'forecast_90_days' | (string & {});

/** Supported billing chart aggregation categories. */
export type BillingChartAggregation = 'daily' | 'monthly' | (string & {});

/** Linear trend metadata used to render trend overlays. */
export interface BillingChartTrend {
  method: 'linear' | (string & {});
  slope: number;
  intercept: number;
}

/** Full date range covered by the chart data payload. */
export interface BillingChartDataWindow {
  /** Start date of the available chart data (Unix timestamp). */
  startDate: number;
  /** End date of the available chart data (Unix timestamp). */
  endDate: number;
  /** Number of source daily points included in the data window. */
  pointCount: number;
}

/** Detector method metadata used to explain anomaly markers. */
export interface BillingChartDetectorMethod {
  name: string;
  status?: string;
  error?: string | null;
  /** Dates triggered by this detector (Unix timestamps). */
  triggeredDates: number[];
}

/** Metadata for the anomaly detector ensemble behind the chart payload. */
export interface BillingChartDetectorMetadata {
  threshold: number;
  methods: BillingChartDetectorMethod[];
}

/** Daily cost point used by historical cost chart views. */
export interface BillingDailyChartPoint {
  /** ISO date string for the point. */
  date: string;
  /** UTC date for the point (Unix timestamp). */
  timestamp: number;
  /** Cost for the point. */
  cost: number;
  /** Whether this point is considered an anomaly by quorum detection. */
  isAnomaly: boolean;
  /** Number of detector votes for this point. */
  anomalyVotes: number;
  /** Optional rendered trend value for this point. */
  trendCost?: number;
  /** Detector methods that triggered for anomalous points. */
  anomalyMethods?: string[];
}

/** Monthly cost point used by the 12-month cost chart view. */
export interface BillingMonthlyChartPoint {
  /** Month key in YYYY-MM format. */
  month: string;
  /** Start date of the monthly point window (Unix timestamp). */
  startDate: number;
  /** End date of the monthly point window (Unix timestamp). */
  endDate: number;
  /** Total cost for the month. */
  cost: number;
  /** Average daily cost inside the month window. */
  averageDailyCost: number;
  /** Count of anomaly dates inside the month window. */
  anomalyCount: number;
  /** Optional rendered trend value for this point. */
  trendCost?: number;
  /** Anomaly dates inside the month window (Unix timestamps). */
  anomalyDates?: number[];
}

/** Forecast or fitted cost point used by forecast chart overlays. */
export interface BillingForecastChartPoint {
  /** ISO date string for the point. */
  date: string;
  /** UTC date for the point (Unix timestamp). */
  timestamp: number;
  /** Cost for the point. */
  cost: number;
  /** Optional rendered trend value for this point. */
  trendCost?: number;
}

/** Historical daily chart view. */
export interface BillingDailyChartView {
  aggregation: 'daily';
  /** Start date of the view window (Unix timestamp). */
  startDate: number;
  /** End date of the view window (Unix timestamp). */
  endDate: number;
  averageDailyCost: number;
  totalCost: number;
  points: BillingDailyChartPoint[];
  trend?: BillingChartTrend;
}

/** Monthly chart view. */
export interface BillingMonthlyChartView {
  aggregation: 'monthly';
  /** Start date of the view window (Unix timestamp). */
  startDate: number;
  /** End date of the view window (Unix timestamp). */
  endDate: number;
  averageDailyCost: number;
  totalCost: number;
  points: BillingMonthlyChartPoint[];
  trend?: BillingChartTrend;
}

/** Forecast chart view containing actual, fitted, and future forecast series. */
export interface BillingForecastChartView {
  aggregation: 'daily';
  forecastMethod: string;
  /** Start date of the forecast view window (Unix timestamp). */
  startDate: number;
  /** End date of the forecast view window (Unix timestamp). */
  endDate: number;
  actualTotalCost: number;
  forecastRemaining: number;
  forecastMonthTotal: number;
  actualPoints: BillingDailyChartPoint[];
  forecastPoints: BillingForecastChartPoint[];
  fittedPoints: BillingForecastChartPoint[];
  trend?: BillingChartTrend;
}

export type BillingChartView = BillingDailyChartView | BillingMonthlyChartView | BillingForecastChartView;

/** Named chart views emitted by the billing analyzer. */
export interface BillingChartViews {
  '7_days'?: BillingDailyChartView;
  '30_days'?: BillingDailyChartView;
  '90_days'?: BillingDailyChartView;
  '12_months'?: BillingMonthlyChartView;
  forecast_90_days?: BillingForecastChartView;
  [key: string]: BillingChartView | undefined;
}

/** Interactive chart data for cost analysis. */
export interface BillingChartData {
  schemaVersion: number;
  source: 'aggregated' | (string & {});
  dataWindow: BillingChartDataWindow;
  views: BillingChartViews;
  detectors: BillingChartDetectorMetadata;
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
  /** Scope/category used by the analyzer for the resource row */
  resourceScope?: string;
  /** Full cloud resource ID when the anomaly can be tied to a resource */
  resourceId?: string;
  /** Whether the driver row represents subscription-level spend */
  isSubscriptionLevel?: boolean;
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

export interface BillingCostAnalysisMetadata {
  /** Azure subscription ID */
  subscriptionId: string;
  /** Interactive chart data for cost analysis. */
  chartData: BillingChartData;
  /** Detected anomalies for the subscription */
  anomalies: BillingAnomaly[];
  currencyCode: string;
  currencySymbol: string;
  /** Forecast method used for top-level forecast summaries. */
  forecastMethod?: string;
  /** Forecast month total used for top-level forecast summaries. */
  forecastMonthTotal?: number;
  /** Forecast amount remaining in the current period. */
  forecastRemaining?: number;
  /** Forecast amount at the end of the current period. */
  forecastPeriodEnd?: number;
}

/** @deprecated Use BillingCostAnalysisMetadata. */
export type BillingPlotsMetadata = BillingCostAnalysisMetadata;
