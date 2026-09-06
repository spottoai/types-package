import {
  AI_CHAT_WORKSPACE_CAPABILITIES,
  type AIChatCanonicalStreamEvent,
  type AIChatTerminalSnapshot,
  type AIChatWorkspaceArtifact,
  type AIChatWorkspaceArtifactCompletedEvent,
  type AIChatWorkspaceArtifactFailedEvent,
  type AIChatWorkspaceArtifactIntent,
  type AIChatWorkspaceArtifactStartedEvent,
  type AIChatWorkspaceLiveViewRecipe,
  type AIChatWorkspaceViewId,
} from '../index';

const capabilityCount: 9 = AI_CHAT_WORKSPACE_CAPABILITIES.length;
const viewId: AIChatWorkspaceViewId = 'azure.cost.subscriptionSpendTrend';

const costRecipe: AIChatWorkspaceLiveViewRecipe = {
  viewId,
  version: 1,
  presentation: 'area',
  binding: {
    bindingKind: 'subscriptionSpendTrend',
    companyId: 'company-1',
    subscriptionIds: ['subscription-1'],
    timeRange: 'P90D',
    costBasis: 'amortized',
  },
  refresh: 'manual',
};

const costArtifact: AIChatWorkspaceArtifact = {
  schemaVersion: 1,
  artifactId: 'artifact-1',
  turnId: 'turn-1',
  kind: 'chart',
  dataMode: 'snapshotWithLiveRefresh',
  title: 'Subscription spend trend',
  createdAt: '2026-09-05T00:00:00.000Z',
  accessibleSummary: 'Spend increased over the selected period.',
  placement: { region: 'afterAnswer', order: 0 },
  provenance: {
    citationIds: ['citation-1'],
    sourceTypes: ['operational'],
    sourceAsOf: '2026-09-04T00:00:00.000Z',
    coverage: 'complete',
  },
  snapshot: {
    payload: {
      chartType: 'area',
      series: [
        {
          key: 'actualCost',
          label: 'Actual cost',
          points: [{ x: '2026-09-01', y: 125.5, citationIds: ['citation-1'] }],
        },
      ],
      xAxis: { type: 'time' },
      yAxis: { type: 'number', unit: 'currency', currencyCode: 'NZD' },
    },
  },
  liveView: costRecipe,
};

const startedEvent: AIChatWorkspaceArtifactStartedEvent = {
  event: 'artifactStarted',
  sequence: 4,
  conversationId: 'conversation-1',
  runId: 'run-1',
  turnId: 'turn-1',
  timestamp: '2026-09-05T00:00:00.000Z',
  artifactId: costArtifact.artifactId,
  kind: costArtifact.kind,
  dataMode: costArtifact.dataMode,
  title: costArtifact.title,
  placement: costArtifact.placement,
};

const completedEvent: AIChatWorkspaceArtifactCompletedEvent = {
  ...startedEvent,
  event: 'artifactCompleted',
  sequence: 5,
  artifact: costArtifact,
};

const failedEvent: AIChatWorkspaceArtifactFailedEvent = {
  ...startedEvent,
  event: 'artifactFailed',
  sequence: 5,
  reasonCode: 'budgetExceeded',
};

const canonicalEvents: AIChatCanonicalStreamEvent[] = [startedEvent, completedEvent, failedEvent];

const run = {
  runId: 'run-1',
  status: 'completed' as const,
  updatedAt: '2026-09-05T00:00:00.000Z',
};

const terminalSnapshot: AIChatTerminalSnapshot = {
  conversationId: 'conversation-1',
  runId: run.runId,
  run,
  turnSnapshot: {
    run,
    turn: {
      turnId: 'turn-1',
      runId: run.runId,
      phase: 'completed',
      status: 'completed',
      updatedAt: run.updatedAt,
    },
  },
  answer: 'Completed answer',
  workspaceArtifacts: [costArtifact],
};

const intent: AIChatWorkspaceArtifactIntent = {
  schemaVersion: 1,
  viewId: 'azure.security.secureScoreTrend',
  presentationHint: 'line',
  subjectRefs: ['subject-1'],
  requestedTimeRange: 'P90D',
};

const genericTableArtifact: AIChatWorkspaceArtifact = {
  schemaVersion: 1,
  artifactId: 'artifact-generic-1',
  turnId: 'turn-1',
  kind: 'table',
  dataMode: 'snapshot',
  view: { viewId: 'genericTable', version: 1 },
  title: 'Cost by service',
  createdAt: '2026-09-05T00:00:00.000Z',
  accessibleSummary: 'Two services account for most of the spend.',
  placement: { region: 'afterAnswer', order: 0 },
  provenance: { citationIds: ['citation-1'], sourceTypes: ['operational'], coverage: 'complete' },
  links: {
    'row-0': { kind: 'internal', label: 'Open in Spotto', portalRoute: '/company/company-1/resources/resource-1' },
    'row-0:azure': {
      kind: 'external',
      label: 'Open in Azure Portal',
      externalUrl: 'https://portal.azure.com/#@/resource/subscriptions/subscription-1/resource-1',
      externalHost: 'portal.azure.com',
    },
  },
  snapshot: {
    payload: {
      columns: [
        { key: 'name', label: 'Service', type: 'string' },
        { key: 'cost', label: 'Cost', type: 'currency', currencyCode: 'NZD', align: 'end' },
      ],
      rows: [{ name: 'Virtual Machines', cost: 1200.5 }],
      rowLinks: [['row-0', 'row-0:azure']],
    },
  },
};

const genericChartArtifact: AIChatWorkspaceArtifact = {
  schemaVersion: 1,
  artifactId: 'artifact-generic-2',
  turnId: 'turn-1',
  kind: 'chart',
  dataMode: 'snapshot',
  view: { viewId: 'genericBarChart', version: 1 },
  title: 'Cost by service',
  createdAt: '2026-09-05T00:00:00.000Z',
  accessibleSummary: 'Virtual Machines is the largest driver.',
  placement: { region: 'afterAnswer', order: 1 },
  provenance: { citationIds: ['citation-1'], sourceTypes: ['operational'], coverage: 'complete' },
  snapshot: {
    payload: {
      chartType: 'bar',
      series: [{ key: 'cost', label: 'Cost', points: [{ x: 'Virtual Machines', y: 1200.5 }] }],
      xAxis: { type: 'category' },
      yAxis: { type: 'number', unit: 'currency', currencyCode: 'NZD' },
    },
  },
};

// WP-G: KPI row, multi-series/stacked chart with value presentation, typed table columns.
const kpiArtifact: AIChatWorkspaceArtifact = {
  schemaVersion: 1,
  artifactId: 'artifact-generic-3',
  turnId: 'turn-1',
  kind: 'kpi',
  dataMode: 'snapshot',
  view: { viewId: 'genericKpi', version: 1 },
  title: 'Subscription at a glance',
  createdAt: '2026-09-05T00:00:00.000Z',
  accessibleSummary: 'Billed spend 19,194.83 NZD, up 4.2% vs previous 30 days.',
  placement: { region: 'afterAnswer', order: 0 },
  provenance: { citationIds: ['citation-1'], sourceTypes: ['operational'], coverage: 'complete' },
  snapshot: {
    payload: {
      tiles: [
        {
          id: 'billed-spend',
          label: 'Billed spend, last 30 days',
          value: { kind: 'money', amount: '19194.83', currencyCode: 'NZD', basis: 'billed' },
          delta: { value: 4.2, kind: 'percent', direction: 'up', sentiment: 'bad', period: 'vs previous 30 days' },
          caption: 'vs previous 30 days',
        },
        { id: 'secure-score', label: 'Secure Score', value: { kind: 'percent', value: 72 } },
        { id: 'resources', label: 'Resources', value: { kind: 'number', value: 128, unit: 'resources' } },
        { id: 'health', label: 'Service health', value: { kind: 'text', text: 'Healthy' } },
      ],
    },
  },
};

const stackedChartArtifact: AIChatWorkspaceArtifact = {
  ...genericChartArtifact,
  artifactId: 'artifact-generic-4',
  snapshot: {
    payload: {
      chartType: 'bar',
      stacked: true,
      valueFormat: 'money',
      currencyCode: 'NZD',
      basis: 'billed',
      valueUnit: 'NZD',
      xAxisLabel: 'Azure subscription',
      yAxisLabel: 'Billed spend',
      series: [
        { key: 'compute', label: 'Compute', points: [{ x: 'Production', y: 900 }, { x: 'Dev', y: null }] },
        { key: 'storage', label: 'Storage', points: [{ x: 'Production', y: 200 }, { x: 'Dev', y: 50 }] },
      ],
      xAxis: { type: 'category' },
      yAxis: { type: 'number', unit: 'currency', currencyCode: 'NZD' },
    },
  },
};

const typedTableArtifact: AIChatWorkspaceArtifact = {
  ...genericTableArtifact,
  artifactId: 'artifact-generic-5',
  snapshot: {
    payload: {
      columns: [
        { key: 'name', label: 'Service', type: 'string', kind: 'text', sortable: false },
        { key: 'cost', label: 'Cost (billed)', type: 'currency', kind: 'money', currencyCode: 'NZD', basis: 'billed', align: 'end', sortable: true },
      ],
      rows: [{ name: 'Virtual Machines', cost: 1200.5 }],
      defaultSort: { columnId: 'cost', direction: 'desc' },
      totalRowCount: 12,
    },
  },
};

void capabilityCount;
void canonicalEvents;
void terminalSnapshot;
void intent;
void genericTableArtifact;
void genericChartArtifact;
void kpiArtifact;
void stackedChartArtifact;
void typedTableArtifact;

// @ts-expect-error unsupported view IDs cannot enter the Release 1 protocol.
const unsupportedViewId: AIChatWorkspaceViewId = 'azure.governance.graph';

const genericIntent: AIChatWorkspaceArtifactIntent = {
  schemaVersion: 1,
  // @ts-expect-error generic snapshot views are server-produced and cannot be requested by the model.
  viewId: 'genericTable',
  subjectRefs: ['subject-1'],
};

const unsafeIntent: AIChatWorkspaceArtifactIntent = {
  schemaVersion: 1,
  viewId: 'azure.resource.metrics',
  subjectRefs: ['subject-1'],
  // @ts-expect-error model intent cannot provide an endpoint URL.
  apiUrl: '/resource-metrics/azure?resourceId=attacker-controlled',
};

const mismatchedRecipe: AIChatWorkspaceLiveViewRecipe = {
  viewId: 'azure.cost.subscriptionSpendTrend',
  version: 1,
  presentation: 'area',
  binding: {
    bindingKind: 'resourceMetrics',
    companyId: 'company-1',
    // @ts-expect-error a cost strategy cannot carry a resource-metrics binding.
    subscriptionId: 'subscription-1',
    resourceId: '/subscriptions/subscription-1/resources/resource-1',
    metricKeys: ['cpu'],
    timeRange: 'P30D',
  },
  refresh: 'manual',
};

// @ts-expect-error snapshot-with-live-refresh artifacts require a snapshot.
const missingSnapshot: AIChatWorkspaceArtifact = {
  schemaVersion: 1,
  artifactId: 'artifact-2',
  turnId: 'turn-1',
  kind: 'chart',
  dataMode: 'snapshotWithLiveRefresh',
  title: 'Missing snapshot',
  createdAt: '2026-09-05T00:00:00.000Z',
  accessibleSummary: 'Invalid fixture.',
  placement: { region: 'afterAnswer', order: 1 },
  provenance: { citationIds: [], sourceTypes: ['operational'], coverage: 'not-collected' },
  liveView: costRecipe,
};

void unsupportedViewId;
void genericIntent;
void unsafeIntent;
void mismatchedRecipe;
void missingSnapshot;
