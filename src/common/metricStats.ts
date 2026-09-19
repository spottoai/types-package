/** Provider-neutral descriptive statistics for one metric series (shared by azure metrics and utilization stories). */
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
  /** for availability metrics */
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
