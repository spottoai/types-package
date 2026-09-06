import type { AICustomerDecisionBriefOutput, AIChatRetrievalSourceType } from './index.js';

export type AIChatWorkspaceArtifactKind = 'metricGroup' | 'chart' | 'table' | 'document' | 'resourceList' | 'decisionBrief' | 'kpi';

export type AIChatWorkspaceArtifactDataMode = 'snapshot' | 'liveView' | 'snapshotWithLiveRefresh';

export type AIChatWorkspacePresentation = 'metricGroup' | 'bar' | 'line' | 'area' | 'table' | 'resourceList' | 'decisionBrief' | 'kpi';

export type AIChatWorkspaceTimeRangePreset = 'P7D' | 'P30D' | 'P90D' | 'P180D' | 'P1Y' | 'currentBillingPeriod' | 'previousBillingPeriod';

export const AI_CHAT_WORKSPACE_CAPABILITIES = [
  {
    viewId: 'azure.security.secureScoreTrend',
    version: 1,
    artifactKind: 'chart',
    presentations: ['line'],
    dataModes: ['snapshot', 'snapshotWithLiveRefresh'],
  },
  {
    viewId: 'azure.cost.subscriptionSpendTrend',
    version: 1,
    artifactKind: 'chart',
    presentations: ['area', 'line'],
    dataModes: ['snapshot', 'snapshotWithLiveRefresh'],
  },
  {
    viewId: 'azure.serviceRetirement.upcoming',
    version: 1,
    artifactKind: 'table',
    presentations: ['table'],
    dataModes: ['snapshot', 'snapshotWithLiveRefresh'],
  },
  {
    viewId: 'azure.governance.complianceSummary',
    version: 1,
    artifactKind: 'metricGroup',
    presentations: ['metricGroup'],
    dataModes: ['snapshot', 'snapshotWithLiveRefresh'],
  },
  {
    viewId: 'azure.resource.metrics',
    version: 1,
    artifactKind: 'chart',
    presentations: ['line', 'area', 'bar'],
    dataModes: ['liveView', 'snapshotWithLiveRefresh'],
  },
  /**
   * Generic views are server-produced snapshots over an authorized tool result already held by the
   * turn. They have no live recipe and no endpoint binding: the API builds the payload from the same
   * shaped tool output that grounded the answer, so the model never selects data, endpoint or shape.
   */
  {
    viewId: 'genericTable',
    version: 1,
    artifactKind: 'table',
    presentations: ['table'],
    dataModes: ['snapshot'],
  },
  {
    viewId: 'genericBarChart',
    version: 1,
    artifactKind: 'chart',
    presentations: ['bar'],
    dataModes: ['snapshot'],
  },
  {
    viewId: 'genericLineChart',
    version: 1,
    artifactKind: 'chart',
    presentations: ['line'],
    dataModes: ['snapshot'],
  },
  {
    viewId: 'genericKpi',
    version: 1,
    artifactKind: 'kpi',
    presentations: ['kpi'],
    dataModes: ['snapshot'],
  },
] as const;

export const AI_CHAT_WORKSPACE_GENERIC_VIEW_IDS = ['genericTable', 'genericBarChart', 'genericLineChart', 'genericKpi'] as const;

export type AIChatWorkspaceCapability = (typeof AI_CHAT_WORKSPACE_CAPABILITIES)[number];
export type AIChatWorkspaceViewId = AIChatWorkspaceCapability['viewId'];
export type AIChatWorkspaceGenericViewId = (typeof AI_CHAT_WORKSPACE_GENERIC_VIEW_IDS)[number];
/** View ids that resolve to a registered live-data recipe. Generic snapshot views never do. */
export type AIChatWorkspaceLiveViewId = Exclude<AIChatWorkspaceViewId, AIChatWorkspaceGenericViewId>;
export type AIChatWorkspaceCapabilityVersion = AIChatWorkspaceCapability['version'];

/** Immutable identity of the registry view that produced an artifact, pinned by both registries. */
export interface AIChatWorkspaceArtifactViewIdentity {
  viewId: AIChatWorkspaceViewId;
  version: 1;
}

export interface AIChatWorkspaceArtifactIntent {
  schemaVersion: 1;
  /** Generic snapshot views are never requestable: the API produces them from its own tool results. */
  viewId: AIChatWorkspaceLiveViewId;
  presentationHint?: AIChatWorkspacePresentation;
  subjectRefs: string[];
  requestedMeasureKeys?: string[];
  requestedTimeRange?: AIChatWorkspaceTimeRangePreset;
}

export interface AIChatWorkspaceSecureScoreTrendBinding {
  bindingKind: 'secureScoreTrend';
  companyId: string;
  subscriptionIds: string[];
  timeRange: Extract<AIChatWorkspaceTimeRangePreset, 'P30D' | 'P90D' | 'P180D' | 'P1Y'>;
}

export interface AIChatWorkspaceSubscriptionSpendTrendBinding {
  bindingKind: 'subscriptionSpendTrend';
  companyId: string;
  subscriptionIds: string[];
  timeRange: Extract<AIChatWorkspaceTimeRangePreset, 'P30D' | 'P90D' | 'P180D' | 'P1Y' | 'currentBillingPeriod' | 'previousBillingPeriod'>;
  costBasis: 'actual' | 'amortized';
}

export interface AIChatWorkspaceUpcomingRetirementsBinding {
  bindingKind: 'upcomingRetirements';
  companyId: string;
  subscriptionIds: string[];
  horizonDays: 30 | 90 | 180 | 365;
}

export interface AIChatWorkspaceComplianceSummaryBinding {
  bindingKind: 'complianceSummary';
  companyId: string;
  subscriptionIds: string[];
}

export interface AIChatWorkspaceResourceMetricsBinding {
  bindingKind: 'resourceMetrics';
  companyId: string;
  subscriptionId: string;
  resourceId: string;
  metricKeys: string[];
  timeRange: Extract<AIChatWorkspaceTimeRangePreset, 'P7D' | 'P30D' | 'P90D'>;
}

export interface AIChatWorkspaceViewBindingMap {
  'azure.security.secureScoreTrend': AIChatWorkspaceSecureScoreTrendBinding;
  'azure.cost.subscriptionSpendTrend': AIChatWorkspaceSubscriptionSpendTrendBinding;
  'azure.serviceRetirement.upcoming': AIChatWorkspaceUpcomingRetirementsBinding;
  'azure.governance.complianceSummary': AIChatWorkspaceComplianceSummaryBinding;
  'azure.resource.metrics': AIChatWorkspaceResourceMetricsBinding;
}

export interface AIChatWorkspaceViewPresentationMap {
  'azure.security.secureScoreTrend': 'line';
  'azure.cost.subscriptionSpendTrend': 'area' | 'line';
  'azure.serviceRetirement.upcoming': 'table';
  'azure.governance.complianceSummary': 'metricGroup';
  'azure.resource.metrics': 'line' | 'area' | 'bar';
}

export type AIChatWorkspaceResolvedBinding = AIChatWorkspaceViewBindingMap[AIChatWorkspaceLiveViewId];

export type AIChatWorkspaceRefreshMode = 'manual' | 'onOpen';

interface AIChatWorkspaceLiveViewRecipeBase<ViewId extends AIChatWorkspaceLiveViewId> {
  viewId: ViewId;
  version: 1;
  presentation: AIChatWorkspaceViewPresentationMap[ViewId];
  binding: AIChatWorkspaceViewBindingMap[ViewId];
  refresh: AIChatWorkspaceRefreshMode;
}

export type AIChatWorkspaceLiveViewRecipe = {
  [ViewId in AIChatWorkspaceLiveViewId]: AIChatWorkspaceLiveViewRecipeBase<ViewId>;
}[AIChatWorkspaceLiveViewId];

export type AIChatWorkspaceCoverage = 'complete' | 'partial' | 'unavailable' | 'stale' | 'not-collected';

export type AIChatWorkspaceProvenanceReasonCode = 'partialSubscriptionCoverage' | 'sourceStale' | 'sourceUnavailable' | 'notCollected' | 'truncated';

export interface AIChatWorkspaceArtifactProvenance {
  citationIds: string[];
  sourceTypes: AIChatRetrievalSourceType[];
  sourceAsOf?: string;
  coverage: AIChatWorkspaceCoverage;
  reasonCode?: AIChatWorkspaceProvenanceReasonCode;
}

export interface AIChatWorkspaceArtifactPlacement {
  region: 'afterAnswer';
  order: number;
}

export interface AIChatWorkspaceArtifactTruncation {
  rowsOmitted: number;
  reason: string;
}

export interface AIChatWorkspaceInternalLink {
  kind: 'internal';
  label: string;
  portalRoute: string;
}

export interface AIChatWorkspaceExternalLink {
  kind: 'external';
  label: string;
  externalUrl: string;
  externalHost: 'portal.azure.com' | 'learn.microsoft.com';
}

export type AIChatWorkspaceLink = AIChatWorkspaceInternalLink | AIChatWorkspaceExternalLink;
export type AIChatWorkspaceLinkTable = Record<string, AIChatWorkspaceLink>;

export type AIChatWorkspaceMetricUnit = 'count' | 'percentage' | 'score' | 'currency' | 'duration' | 'bytes' | 'ratio' | 'other';

export interface AIChatWorkspaceMetricDelta {
  value: number;
  direction: 'increase' | 'decrease' | 'unchanged';
  comparisonLabel: string;
}

export interface AIChatWorkspaceMetric {
  key: string;
  label: string;
  semantic: string;
  value: number;
  unit: AIChatWorkspaceMetricUnit;
  currencyCode?: string;
  delta?: AIChatWorkspaceMetricDelta;
  citationIds: string[];
}

export interface AIChatWorkspaceMetricGroupPayload {
  metrics: AIChatWorkspaceMetric[];
}

export interface AIChatWorkspaceChartPoint {
  x: string | number;
  /** `null` is a gap (no observation for that x); renderers break the line rather than drawing zero. */
  y: number | null;
  citationIds?: string[];
}

/** Money basis vocabulary shared by KPI tiles, chart value axes and table money columns (WP-G). */
export type AIChatWorkspaceMoneyBasis = 'billed' | 'amortized' | 'projected' | 'estimated' | 'stable-savings';

export interface AIChatWorkspaceChartSeries {
  key: string;
  label: string;
  points: AIChatWorkspaceChartPoint[];
}

export interface AIChatWorkspaceChartAxis {
  type: 'category' | 'time' | 'number';
  label?: string;
  unit?: AIChatWorkspaceMetricUnit;
  currencyCode?: string;
}

export type AIChatWorkspaceChartAnnotation =
  | { kind: 'point'; x: string | number; label: string }
  | { kind: 'threshold'; y: number; label: string }
  | { kind: 'range'; fromX: string | number; toX: string | number; label: string };

export interface AIChatWorkspaceChartPayload {
  chartType: 'bar' | 'line' | 'area';
  /** 1..8 series; more than one series is a multi-series chart (grouped, or stacked when `stacked`). */
  series: AIChatWorkspaceChartSeries[];
  xAxis: AIChatWorkspaceChartAxis;
  yAxis: AIChatWorkspaceChartAxis;
  /** Bars only. */
  stacked?: boolean;
  annotations?: AIChatWorkspaceChartAnnotation[];
  /** WP-G value presentation, additive to the axis descriptors. */
  valueUnit?: string;
  valueFormat?: 'money' | 'number' | 'percent';
  currencyCode?: string;
  basis?: AIChatWorkspaceMoneyBasis;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

/** WP-G KPI row: 1..6 tiles of server-computed values with optional server-decided deltas. */
export type AIChatWorkspaceKpiValue =
  | { kind: 'money'; amount: string; currencyCode: string; basis: AIChatWorkspaceMoneyBasis }
  | { kind: 'number'; value: number; unit?: string }
  | { kind: 'percent'; value: number }
  | { kind: 'text'; text: string };

export interface AIChatWorkspaceKpiDelta {
  value: number;
  kind: 'absolute' | 'percent';
  direction: 'up' | 'down' | 'flat';
  /** Server decides from the measure's polarity: spend up is bad, secure score up is good. */
  sentiment: 'good' | 'bad' | 'neutral';
  period: string;
}

export interface AIChatWorkspaceKpiTile {
  id: string;
  label: string;
  value: AIChatWorkspaceKpiValue;
  delta?: AIChatWorkspaceKpiDelta;
  caption?: string;
  link?: AIChatWorkspaceLink;
}

export interface AIChatWorkspaceKpiPayload {
  tiles: AIChatWorkspaceKpiTile[];
}

export type AIChatWorkspaceTableColumnType = 'string' | 'number' | 'currency' | 'date' | 'resource';
export type AIChatWorkspaceTableCell = string | number | null;

export type AIChatWorkspaceTableColumnKind = 'text' | 'number' | 'money' | 'percent' | 'date' | 'link';

export interface AIChatWorkspaceTableColumn {
  key: string;
  label: string;
  type: AIChatWorkspaceTableColumnType;
  align?: 'start' | 'center' | 'end';
  currencyCode?: string;
  /** WP-G presentation kind; `type` stays for older renderers. */
  kind?: AIChatWorkspaceTableColumnKind;
  basis?: AIChatWorkspaceMoneyBasis;
  /** Default true for number/money/percent/date columns, false for text unless set. */
  sortable?: boolean;
}

export interface AIChatWorkspaceTablePayload {
  columns: AIChatWorkspaceTableColumn[];
  rows: Array<Record<string, AIChatWorkspaceTableCell>>;
  totals?: Record<string, AIChatWorkspaceTableCell>;
  sort?: { key: string; direction: 'ascending' | 'descending' };
  /** WP-G initial sort applied by the renderer; `columnId` is a column key. */
  defaultSort?: { columnId: string; direction: 'asc' | 'desc' };
  /** Total rows in the source when `rows` was capped, so the renderer can say "showing N of M". */
  totalRowCount?: number;
  /**
   * Parallel to `rows`. Each entry lists the `links` keys that apply to that row, so a table row can
   * offer the same server-constructed internal/external navigation a resource list already does.
   * Keys that are absent from `links` are ignored by the renderer.
   */
  rowLinks?: string[][];
}

export type AIChatWorkspaceDocumentBlock =
  | { kind: 'heading'; level: 2 | 3 | 4; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'keyValue'; pairs: Array<{ key: string; value: string }> }
  | { kind: 'callout'; tone: 'info' | 'warn' | 'risk'; text: string }
  | { kind: 'tableRef'; artifactId: string }
  | { kind: 'chartRef'; artifactId: string }
  | { kind: 'resourceRef'; resourceRefId: string };

export interface AIChatWorkspaceDocumentPayload {
  blocks: AIChatWorkspaceDocumentBlock[];
}

export interface AIChatWorkspaceResourceListItem {
  resourceRefId: string;
  displayName: string;
  resourceType: string;
  subscriptionLabel: string;
  monthlyCost?: { value: number; currencyCode: string; basis: 'actual' | 'amortized' };
  tags?: Record<string, string>;
}

export interface AIChatWorkspaceResourceListPayload {
  resources: AIChatWorkspaceResourceListItem[];
}

export interface AIChatWorkspaceDecisionBriefPayload {
  value: AICustomerDecisionBriefOutput;
  citationIds: string[];
  assumptions: string[];
  sourceLimitations: string[];
}

export interface AIChatWorkspaceArtifactBase {
  schemaVersion: 1;
  artifactId: string;
  turnId: string;
  kind: AIChatWorkspaceArtifactKind;
  dataMode: AIChatWorkspaceArtifactDataMode;
  /**
   * Registry view that produced this artifact. Optional while older producers drain; required in
   * practice for snapshot-only artifacts so replay and the client registry can pin `viewId@version`.
   */
  view?: AIChatWorkspaceArtifactViewIdentity;
  title: string;
  subtitle?: string;
  createdAt: string;
  accessibleSummary: string;
  placement: AIChatWorkspaceArtifactPlacement;
  provenance: AIChatWorkspaceArtifactProvenance;
  truncated?: AIChatWorkspaceArtifactTruncation;
  links?: AIChatWorkspaceLinkTable;
}

type AIChatWorkspaceSnapshotContent =
  | { kind: 'metricGroup'; snapshot: { payload: AIChatWorkspaceMetricGroupPayload } }
  | { kind: 'chart'; snapshot: { payload: AIChatWorkspaceChartPayload } }
  | { kind: 'table'; snapshot: { payload: AIChatWorkspaceTablePayload } }
  | { kind: 'document'; snapshot: { payload: AIChatWorkspaceDocumentPayload } }
  | { kind: 'resourceList'; snapshot: { payload: AIChatWorkspaceResourceListPayload } }
  | { kind: 'decisionBrief'; snapshot: { payload: AIChatWorkspaceDecisionBriefPayload } }
  | { kind: 'kpi'; snapshot: { payload: AIChatWorkspaceKpiPayload } };

type AIChatWorkspaceChartRecipe = Extract<
  AIChatWorkspaceLiveViewRecipe,
  { viewId: 'azure.security.secureScoreTrend' | 'azure.cost.subscriptionSpendTrend' | 'azure.resource.metrics' }
>;
type AIChatWorkspaceTableRecipe = Extract<AIChatWorkspaceLiveViewRecipe, { viewId: 'azure.serviceRetirement.upcoming' }>;
type AIChatWorkspaceMetricGroupRecipe = Extract<AIChatWorkspaceLiveViewRecipe, { viewId: 'azure.governance.complianceSummary' }>;

export type AIChatWorkspaceSnapshotArtifact = AIChatWorkspaceArtifactBase & { dataMode: 'snapshot' } & AIChatWorkspaceSnapshotContent;

export type AIChatWorkspaceLiveViewArtifact = AIChatWorkspaceArtifactBase &
  (
    | { kind: 'chart'; dataMode: 'liveView'; liveView: AIChatWorkspaceChartRecipe }
    | { kind: 'table'; dataMode: 'liveView'; liveView: AIChatWorkspaceTableRecipe }
    | { kind: 'metricGroup'; dataMode: 'liveView'; liveView: AIChatWorkspaceMetricGroupRecipe }
  );

export type AIChatWorkspaceSnapshotWithLiveRefreshArtifact = AIChatWorkspaceArtifactBase &
  (
    | {
        kind: 'chart';
        dataMode: 'snapshotWithLiveRefresh';
        snapshot: { payload: AIChatWorkspaceChartPayload };
        liveView: AIChatWorkspaceChartRecipe;
      }
    | {
        kind: 'table';
        dataMode: 'snapshotWithLiveRefresh';
        snapshot: { payload: AIChatWorkspaceTablePayload };
        liveView: AIChatWorkspaceTableRecipe;
      }
    | {
        kind: 'metricGroup';
        dataMode: 'snapshotWithLiveRefresh';
        snapshot: { payload: AIChatWorkspaceMetricGroupPayload };
        liveView: AIChatWorkspaceMetricGroupRecipe;
      }
  );

export type AIChatWorkspaceArtifact =
  | AIChatWorkspaceSnapshotArtifact
  | AIChatWorkspaceLiveViewArtifact
  | AIChatWorkspaceSnapshotWithLiveRefreshArtifact;

export interface AIChatWorkspaceArtifactSummary {
  artifactId: string;
  turnId: string;
  kind: AIChatWorkspaceArtifactKind;
  dataMode: AIChatWorkspaceArtifactDataMode;
  title: string;
  accessibleSummary: string;
  sourceAsOf?: string;
  coverage: AIChatWorkspaceCoverage;
  truncated?: AIChatWorkspaceArtifactTruncation;
  supportedActions: Array<'expand' | 'refresh' | 'downloadCsv' | 'downloadPng' | 'downloadDocx'>;
}

export type AIChatWorkspaceArtifactFailureReason = 'validationFailed' | 'budgetExceeded' | 'unavailable' | 'unsupported';
