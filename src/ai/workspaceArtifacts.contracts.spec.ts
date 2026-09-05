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

const capabilityCount: 5 = AI_CHAT_WORKSPACE_CAPABILITIES.length;
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

void capabilityCount;
void canonicalEvents;
void terminalSnapshot;
void intent;

// @ts-expect-error unsupported view IDs cannot enter the Release 1 protocol.
const unsupportedViewId: AIChatWorkspaceViewId = 'azure.governance.graph';

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
void unsafeIntent;
void mismatchedRecipe;
void missingSnapshot;
