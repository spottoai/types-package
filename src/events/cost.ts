import {
  AlertSeverity,
  AlertStatus,
  AlertLifecycleEvent,
  TagMatchMode,
  BaseAlertScope,
  BaseAlertDestinationSlackOrTeams,
  BaseAlertDestinationWebhook,
  BaseAlertDestinationJira,
  BaseAlertDestinationEmail,
  BaseAlertDestinations,
  BaseAlertComment,
  BaseAlertDefinition,
  BaseAlertInstance,
  ListAlertsParams,
  ListAlertDefinitionsParams,
} from './baseAlert.js';

export type CostAlertSeverity = AlertSeverity;

export type CostAlertCategory = 'cost';
// v1 supports costAnomaly and budget; extend in future versions as needed.
export type CostAlertType = 'costAnomaly' | 'budget';
export type CostAlertStatus = AlertStatus;
export type { TagMatchMode };

export interface CostAlertTag {
  key: string;
  value: string;
}

export interface CostAlertScope extends BaseAlertScope {
  tags?: CostAlertTag[];
}

export type CostAlertTriggerType = 'threshold' | 'baseline' | 'pricing_missing' | 'missing_metrics' | 'default';

export interface CostAlertContext {
  triggerType?: CostAlertTriggerType;
  trigger?: {
    label?: string;
    value?: number;
    source?: string;
    overPct?: number;
    severity?: CostAlertSeverity;
  };
  estimate?: {
    amount?: number;
    currency?: string;
    source?: string;
  };
  baseline?: {
    lastDay?: number;
    prevDay?: number;
    avg7?: number;
    avg14?: number;
    tokenLastDay?: number;
    tokenPrevDay?: number;
    tokenAvg7?: number;
    tokenAvg14?: number;
    dodPct?: number;
    tokenDodPct?: number;
  };
  reason?: string;
}

export interface CostAlert {
  id: string;
  severity: CostAlertSeverity;
  title: string;
  description: string;
  eventId: string;
  eventTimestamp: string;
  resourceId: string;
  resourceType: string;
  serviceCategory?: string;
  subscriptionId?: string;
  resourceGroup?: string;
  estimatedCost?: number;
  createdAt: string;
  context?: CostAlertContext;
}

export interface CostAlertFile {
  generatedAt: string;
  items: CostAlert[];
}

/**
 * New Alert Definition (Table Storage row / API DTO).
 */
export interface CostAlertDefinition extends BaseAlertDefinition<CostAlertCriteria, CostAlertDestinations, CostAlertScope, CostAlertType> {
  type: CostAlertType;
  scope: CostAlertScope; // requires subscriptionIds or tags (or both)
  criteria?: CostAlertCriteria;
  destinations?: CostAlertDestinations;
  /** Whether the current user has permission to edit this alert definition. Added by API. */
  canEdit?: boolean;
  /** Whether the current user has permission to delete this alert definition. Added by API. */
  canDelete?: boolean;
}

export type ListCostAlertDefinitionsParams = ListAlertDefinitionsParams;
export type ListCostAlertsParams = ListAlertsParams<CostAlertType>;

export interface CostAlertCriteria {
  confidence?: Array<'High' | 'Medium' | 'Low'>;
  minDelta?: number;
  minPercentChange?: number;
  minCost?: number;
  tagRelevance?: { minScopeSharePercent?: number };
  /**
   * Data source selection:
   * - auto: use actual billing if available, else estimated
   * - actual: billing artifacts only
   * - estimated: metrics/pricing estimation only
   */
  dataSource?: 'auto' | 'actual' | 'estimated';
  // Budget period
  period?: 'monthly' | 'last_30_days';
  budgetAmount?: number;
  budgetCurrency?: string;
  budgetThresholdPercents?: number[];
  budgetThresholdAmounts?: number[];
  forecastThresholdPercents?: number[];
  forecastThresholdAmounts?: number[];
  /**
   * Optional day-over-day / month-over-month thresholds (cost anomaly extensions).
   * These are additive to minDelta/minPercentChange when compare window is DoD/MoM.
   */
  dodThresholdPercents?: number[];
  dodThresholdAmounts?: number[];
  momThresholdPercents?: number[];
  momThresholdAmounts?: number[];
}

export type CostAlertDestinationSlackOrTeams = BaseAlertDestinationSlackOrTeams;

export interface CostAlertDestinationWebhook extends BaseAlertDestinationWebhook {
  events?: AlertLifecycleEvent[]; // default to ['open'] in v1
}

export type CostAlertDestinationEmail = BaseAlertDestinationEmail;

export type CostAlertDestinationJira = BaseAlertDestinationJira;

export interface CostAlertDestinations extends BaseAlertDestinations {
  slack?: CostAlertDestinationSlackOrTeams[];
  teams?: CostAlertDestinationSlackOrTeams[];
  webhooks?: CostAlertDestinationWebhook[];
  jira?: CostAlertDestinationJira;
  emails?: CostAlertDestinationEmail[];
}

export interface CostAlertDiscriminator {
  kind: 'anomalyDate' | 'periodStart' | string;
  value: string;
}

export type CostAlertComment = BaseAlertComment;

export interface CostAlertSummary {
  currencyCode?: string;
  confidence?: 'High' | 'Medium' | 'Low';
  delta?: number;
  percentChange?: number;
  amount?: number;
  budgetAmount?: number;
  forecastAmount?: number;
  /**
   * Time window for the computed amount (ISO date).
   * This represents the period for current cost (from periodStart to today).
   */
  periodStart?: string;
  periodEnd?: string;
  /**
   * Optional window size for estimated spend (days).
   * This represents the number of days in the forecast window.
   */
  windowDays?: number;
  /**
   * Forecast period start date (ISO date).
   * Forecast is projected from this date to forecastPeriodEnd.
   */
  forecastPeriodStart?: string;
  /**
   * Forecast period end date (ISO date).
   * Forecast is projected until this date.
   */
  forecastPeriodEnd?: string;
  /**
   * Full period start date (ISO date).
   * This represents the start of the entire period (e.g., month start for monthly budgets).
   */
  fullPeriodStart?: string;
  /**
   * Full period end date (ISO date).
   * This represents the end of the entire period (e.g., month end for monthly budgets).
   */
  fullPeriodEnd?: string;
  /**
   * actual | estimated (resolved at evaluation time)
   */
  dataSource?: 'actual' | 'estimated' | 'blended' | 'unknown' | 'metrics_pricing';
  /**
   * Estimated coverage (0-100) when using estimated spend.
   */
  coveragePercent?: number;
  reconciliationStatus?: 'pending' | 'matched' | 'mismatch';
  actualShare?: number;
  estimatedShare?: number;
  estimationMethod?: string;
  estimatedDays?: string[];
  estimatedDaysSource?: 'metrics' | 'ma7' | 'ma14' | 'ma';
  periodType?: 'calendar_month' | 'billing_period' | 'rolling_30_days';

  tagFilterApplied?: boolean;
  /**
   * Human-readable summary text for display in alerts list and notifications.
   * Generated from structured summary data for easy consumption.
   */
  summaryText?: string;
  /**
   * Forecast confidence level (High, Medium, Low) based on data availability and elapsed days.
   * Used to indicate the reliability of forecast calculations.
   */
  forecastConfidence?: 'high' | 'medium' | 'low';
  /**
   * Forecast method used to calculate the forecast amount.
   * Values: 'conservative-blended', 'conservative-linear', 'trend-based', 'linear', 'rolling-current', 'fallback'
   */
  forecastMethod?: string;
  /**
   * Detailed information about the forecast calculation, including:
   * - elapsedDays: Number of days elapsed in the period
   * - totalDays: Total days in the period
   * - remainingDays: Number of days remaining in the forecast period
   * - dailyRate: Daily spending rate
   * - For conservative-blended: historicalAverage, historicalDailyRate, blendedDailyRate, blendRatio
   * - For conservative-linear: multiplier
   * - For trend-based: trendAdjustment, growthRate, growthRateApplied
   * - For recent-average-decreasing: recentAverageDailyRate, isDecreasingTrend
   * - For weighted-average: recentAverageDailyRate
   * - For rolling-current: method, note
   */
  forecastDetails?: Record<string, unknown>;
  /**
   * Daily forecast costs for the remaining days in the period.
   * Each entry contains the date (YYYYMMDD format), predicted cost, and method used.
   * This allows frontend to visualize how the forecast is distributed across days.
   */
  forecastDailyCosts?: Array<{
    date: number;
    cost: number;
    dataSource: 'forecast';
    method: string;
  }>;
  /**
   * Trigger reason indicating why the alert was triggered.
   * For budget alerts: 'budget-threshold-percent' | 'budget-threshold-amount' | 'forecast-threshold-percent' | 'forecast-threshold-amount' | 'budget-threshold' | 'forecast-threshold' | 'both'
   * For cost anomaly alerts: 'confidence' | 'minDelta' | 'minPercentChange' | 'minCost' | 'dodThreshold' | 'momThreshold' | string
   */
  triggerReason?: string | string[];
}

/**
 * Daily cost data point for breakdown visualization
 */
export interface DailyCostDataPoint {
  /** Date in YYYYMMDD format (number) */
  date: number;
  /** Cost for this day */
  cost: number;
  /** Data source: actual (from billing/metrics), estimated (MA-based), or forecast (projected) */
  dataSource: 'actual' | 'estimated' | 'forecast';
  /** For estimated/forecast: method used (e.g., 'ma7', 'ma14', 'metrics_pricing', 'linear', 'trend') */
  method?: string;
  /** For actual: whether this came from metrics (true) or billing (false) */
  fromMetrics?: boolean;
}

export interface CostAlertBreakdownResource {
  resourceId: string;
  name?: string;
  delta?: number;
  cost?: number;
  percentage?: number;
  /**
   * Combined tags (Azure + spottoTags) for client-side filtering (ANY/ALL).
   */
  tags?: Record<string, string>;
  /** Optional: metrics inputs for this resource (e.g., tokensIn/out). */
  metricsInput?: Record<string, unknown>;
  /** Optional: unit rates applied to compute cost. */
  unitRates?: Record<string, number>;
  /** Optional: estimated vs actual composition for UI. */
  dataSource?: 'estimated' | 'actual' | 'blended' | 'metrics_pricing';
  actualShare?: number;
  estimatedShare?: number;
  estimationMethod?: string;
  /**
   * Resource type (e.g., "microsoft.cognitiveservices/accounts")
   * Helps frontend determine how to display this resource and its children
   */
  resourceType?: string;
  /**
   * Daily cost breakdown for this resource
   * Includes actual, estimated, and forecast days
   */
  dailyCosts?: DailyCostDataPoint[];
  /**
   * Deployment-level breakdown (only for resources that have sub-components)
   * For cognitive services: contains deployment/model information
   * Limited to top N deployments to keep breakdown size manageable
   */
  deployments?: Array<{
    deployment?: string;
    model?: string;
    cost: number;
    percentage?: number;
    metricsInput?: Record<string, unknown>;
    unitRates?: Record<string, number>;
    /** Daily cost breakdown for this deployment */
    dailyCosts?: DailyCostDataPoint[];
  }>;
}

export interface CostAlertBreakdownService {
  serviceName: string;
  delta?: number;
  cost?: number;
  percentage?: number;
  dataSource?: 'estimated' | 'actual' | 'blended' | 'metrics_pricing';
  /** Daily cost breakdown aggregated at service level */
  dailyCosts?: DailyCostDataPoint[];
  resources?: CostAlertBreakdownResource[];
  unmappedResourceNames?: string[];
}

export interface CostAlertBreakdownTop {
  subscriptionId: string;
  subscriptionName?: string;
  cost?: number;
  percentage?: number;
  /** Daily cost breakdown aggregated at subscription level */
  dailyCosts?: DailyCostDataPoint[];
  services?: CostAlertBreakdownService[];
}

export interface CostAlertBreakdownSummary {
  top?: CostAlertBreakdownTop[];
}

/**
 * New Alert Instance (Table Storage row / API DTO).
 * Legacy CostAlert can map into this with status=open and category=cost.
 */
export interface CostAlertInstance extends BaseAlertInstance<CostAlertSummary, CostAlertScope, CostAlertType, CostAlertBreakdownSummary> {
  category: CostAlertCategory;
  discriminator: CostAlertDiscriminator;
  /**
   * Derived signature of scope (subs + tags) for idempotency/dedupe.
   */
  scopeSignature?: string;
  jiraIssueKey?: string;
  comments?: CostAlertComment[];
  summary?: CostAlertSummary;
  breakdown?: CostAlertBreakdownSummary;
  definitionSnapshot?: string;
}
