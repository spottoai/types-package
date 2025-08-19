export interface MetricSummary {
    name: string;
    average: number;
    peak: number;
    percentile95: number;
}
export interface DisplayMetric {
    name: string;
    value: string;
    status?: 'good' | 'warning' | 'error';
    children?: DisplayMetric[];
}
export interface DailyMetrics {
    date: number;
    spend: number;
    costAmortized: number;
    summary: MetricSummary[];
    hourlyData?: HourlyMetrics[];
}
export interface MetricSummary {
    name: string;
    average: number;
    peak: number;
    percentile95: number;
    unit?: string;
    context?: MetricContext;
}
export interface MetricContext {
    capacity?: number;
    unit?: string;
    threshold?: number;
}
export interface HourlyMetrics {
    hours: number[];
    metrics: HourlyMetricData[];
}
export interface HourlyMetricData {
    name: string;
    values: number[];
    unit?: string;
}
export interface MetricUsageSummary {
    runningHours: number;
    longestInactiveStretch: number;
    totalFullDayInactivities: number;
    totalInactiveIntervals: number;
    totalActiveIntervals: number;
    totalActiveHours: number;
}
export interface TimeSeriesData {
    timeStamp: string;
    value?: number;
}
export interface TimeSeries {
    metadatavalues: MetadataValue[];
    data: TimeSeriesData[];
}
export interface MetricItem {
    name: string;
    value: MetricResponse;
}
export interface MetricResponse {
    timespan: string;
    interval: string;
    value: MetricValue[];
    namespace: string;
    resourceregion: string;
}
export interface MetricValue {
    id: string;
    type: string;
    name: MetricName;
    displayDescription: string;
    unit: string;
    timeseries: TimeSeries[];
    errorCode: string;
}
export interface MetricName {
    value: string;
    localizedValue: string;
}
export interface MetricsCollection {
    id: string;
    metrics: MetricsCollectionItem[];
    childMetrics?: MetricsCollection[];
}
export interface MetricsCollectionItem {
    timespan: string;
    interval: string;
    name: string;
    description: string;
    unit: string;
    timeseries: MetricsCollectionTimeSeries[];
}
export interface MetricsCollectionTimeSeries {
    timeStamp: string;
    value?: number;
}
export interface ResourceMetrics {
    id: string;
    metrics: MetricItem[];
    childMetrics?: ResourceMetrics[];
}
export interface MetadataValue {
    name: MetadataName;
    value: string;
}
export interface MetadataName {
    value: string;
    localizedValue: string;
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
export interface DataPoint {
    timeStamp: string;
    average?: number;
    total?: number;
    maximum?: number;
    minimum?: number;
    count?: number;
}
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
    uptime?: number;
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
    expression: string;
    description: string;
}
export interface MetricsDefinition {
    name: string;
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
//# sourceMappingURL=metrics.d.ts.map