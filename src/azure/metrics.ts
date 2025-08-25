export interface DisplayMetric {
  name: string;
  value: string;
  status?: 'good' | 'warning' | 'error';
  children?: DisplayMetric[];
}

export interface DailyMetrics {
  date: number; // YYYYMMDD
  spend: number; // number spend on the resource that day
  costAmortized: number; // number amortized spend on the resource that day
  summary: MetricSummary[];
  hourlyData?: HourlyMetrics[]; // optional for drill-down scenarios
}

export interface MetricSummary {
  name: string;
  average: number;
  peak: number;
  percentile95: number;
  unit?: string; // e.g. percent, GB, request/sec etc
  context?: MetricContext; // Additional context for the metric
}

export interface MetricContext {
  capacity?: number; // e.g., total RAM available for memory metrics
  unit?: string; // e.g., "GB" for capacity
  threshold?: number; // e.g., warning threshold
}

export interface HourlyMetrics {
  hours: number[]; // [0, 1, 2, 3, ..., 23] - define once
  metrics: HourlyMetricData[];
}

export interface HourlyMetricData {
  name: string; // e.g. "CPU"
  values: number[]; // 24 values corresponding to hours array
  unit?: string; // e.g. percent, GB, request/sec etc
}

export interface MetricUsageSummary {
  runningHours: number;
  longestInactiveStretch: number;
  totalFullDayInactivities: number;
  totalInactiveIntervals: number;
  totalActiveIntervals: number;
  totalActiveHours: number;
}

export interface ScaleProfile {
  name: string;
  capacity: {
    minimum: string;
    maximum: string;
    default: string;
  };
  rules: ScaleRule[];
}

export interface ScaleRule {
  metricTrigger: MetricTrigger;
  scaleAction: ScaleAction;
}

export interface MetricTrigger {
  metricName: string;
  metricNamespace: string;
  metricResourceUri: string;
  metricResourceLocation: string;
  timeGrain: string;
  statistic: string;
  timeWindow: string;
  timeAggregation: string;
  operator: string;
  threshold: number;
  dimensions: any[];
  dividePerInstance: boolean;
}

export interface ScaleAction {
  direction: string;
  type: string;
  value: string;
  cooldown: string;
}

export type WorkloadType = 'WebApp' | 'API' | 'BatchProcessing' | 'DatabaseWorkload' | 'General';

export interface MetricStats {
  average: number;
  median: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  frequency: number;
  trend: number;
  variance: number;
  count: number;
  uptime?: number; // for availability metrics
  peakHours?: number;
  offPeakHours?: number;
  totalDataPoints: number;
  runningDataPoints: number;
  nonRunningDataPoints: number;
  runningTimePercentage: number;
  longestRunningStreak: number;
  longestDowntimeStreak: number;
  averageUptimeStreak: number;
  averageDowntimeStreak: number;
}

export interface AlertCondition {
  severity: 'info' | 'warning' | 'critical' | 'underutilized';
  expression: string; // JSONata expression
  description: string;
}

export interface MetricsDefinition {
  name: string;
  metricName: string;
  description: string;
  details: string;
  stats: MetricStats;
  display?: MetricsDisplay;
  alerts?: MetricAlert[];
}

export interface MetricAlert {
  severity: 'info' | 'warning' | 'critical' | 'underutilized';
  description: string;
}

export interface MetricDescription {
  metricName: string;
  name: string;
  description: string;
  details: string;
  thresholdValue: number;
  thresholdUnit: string;
  thresholdReasoning: string;
  confidence?: number;
  confidenceFactors?: {
    metricExistence: number;
    intervalCompatibility: number;
    optimizationValue: number;
  };
  alertConditions: AlertCondition[];
}

export interface MetricsDisplay {
  metrics: string[];
  title: string;
  yAxisTitle: string;
  yAxisSuffix: string;
  priority: number;
  maxAxis?: number;
  chartType: 'line' | 'area' | 'bar' | 'scatter';
  optimizationFocus: 'cost' | 'performance' | 'reliability' | 'efficiency';
  reasoning: string;
}

export interface MonthlyMetricsFile {
  metadata: {
    resourceType: string;
    month: string;
    lastUpdated: string;
    totalResources: number;
    metricsCollected: string[];
  };
  metrics: AzureResourceMetrics[];
}

export interface AzureResourceMetrics {
  id: string;
  metrics: AzureMetricValue[];
  childMetrics?: AzureResourceMetrics[];
}

export interface AzureMetricValue {
  name: string;
  label: string;
  collection: string;
  unit: string;
  timeseries: AzureTimeSeries[];
}

export interface AzureTimeSeries {
  metadata: AzureTimeSeriesMetadata[];
  data: AzureTimeSeriesData[];
}

export interface AzureTimeSeriesMetadata {
  name: string; // name such "Instance" or "Model" or "API Name" or "Tier"
  value: string; // value such as "WN0SDWK00030D" or "gpt-5" or "GetBlobServiceProperties" or "Hot"
}

export interface AzureTimeSeriesData {
  v?: number; // Value
  t: number; // Timestamp
}

export interface AzureResourceMetric {
  metricName: string;
  displayName: string;
  timeSpan: string;
  suffix: string;
  isTimeSeries: boolean;
  isSummaryOnly: boolean;
  isSummarized: boolean;
  interval?: string;
  aggregationType: string;
  expression?: string;
  filter?: string;
  metricNamespace?: string;
}

export interface UtilizationSummary {
  bucket: UtilizationBucket;
  scores: Record<string, number>;
  trends: TrendAnalysis;
}

export interface TrendAnalysis {
  direction: TrendDirection;
  averageChange: number;
  volatility: number;
  seasonality?: {
    daily?: boolean;
    weekly?: boolean;
  };
}

export type UtilizationBucket = 'Highly Overutilized' | 'Overutilized' | 'Underutilized' | 'Optimally Utilized';
export type TrendDirection = 'Increasing' | 'Decreasing' | 'Stable' | 'Fluctuating';
