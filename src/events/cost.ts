import {
  AlertSeverity,
  AlertStatus,
  AlertLifecycleEvent,
  TagMatchMode,
  BaseAlertScope,
  BaseAlertDestinationSlackOrTeams,
  BaseAlertDestinationWebhook,
  BaseAlertDestinationJira,
  BaseAlertDestinations,
  BaseAlertComment,
  BaseAlertDefinition,
  BaseAlertInstance,
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
}

export interface CostAlertCriteria {
  confidence?: Array<'High' | 'Medium' | 'Low'>;
  minDelta?: number;
  minPercentChange?: number;
  minCost?: number;
  tagRelevance?: { minScopeSharePercent?: number };
  // Budget criteria (v1: monthly only)
  period?: 'monthly';
  budgetAmount?: number;
  budgetCurrency?: string;
  budgetThresholdPercents?: number[];
  budgetThresholdAmounts?: number[];
  forecastThresholdPercents?: number[];
  forecastThresholdAmounts?: number[];
}

export type CostAlertDestinationSlackOrTeams = BaseAlertDestinationSlackOrTeams;

export interface CostAlertDestinationWebhook extends BaseAlertDestinationWebhook {
  events?: AlertLifecycleEvent[]; // default to ['open'] in v1
}

export type CostAlertDestinationJira = BaseAlertDestinationJira;

export interface CostAlertDestinations extends BaseAlertDestinations {
  slack?: CostAlertDestinationSlackOrTeams[];
  teams?: CostAlertDestinationSlackOrTeams[];
  webhooks?: CostAlertDestinationWebhook[];
  jira?: CostAlertDestinationJira;
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
}

export interface CostAlertBreakdownResource {
  resourceId: string;
  name?: string;
  delta?: number;
  /**
   * Combined tags (Azure + spottoTags) for client-side filtering (ANY/ALL).
   */
  tags?: Record<string, string>;
}

export interface CostAlertBreakdownService {
  serviceName: string;
  delta?: number;
  resources?: CostAlertBreakdownResource[];
  unmappedResourceNames?: string[];
}

export interface CostAlertBreakdownTop {
  subscriptionId: string;
  subscriptionName?: string;
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
}
