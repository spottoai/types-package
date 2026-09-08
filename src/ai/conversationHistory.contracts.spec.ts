import {
  AI_CHAT_HISTORY_ARTIFACT_LIMITS_V1,
  type AIChatConversationHistoryArtifactProjection,
  type AIChatHistoryResponseArtifact,
  type AIChatHistoryWorkspaceArtifactReadResponse,
} from '../index';

const responseArtifactsPerConversation: 100 = AI_CHAT_HISTORY_ARTIFACT_LIMITS_V1.responseArtifactsPerConversation;
const citationsPerResponse: 50 = AI_CHAT_HISTORY_ARTIFACT_LIMITS_V1.citationsPerResponse;
const workspaceArtifactSummariesPerResponse: 5 = AI_CHAT_HISTORY_ARTIFACT_LIMITS_V1.workspaceArtifactSummariesPerResponse;

const responseArtifact: AIChatHistoryResponseArtifact = {
  turnId: 'turn-1',
  responseId: 'response-1',
  citations: [],
  evidenceCoverage: {
    sourceTypes: [],
    evidenceGroups: [],
    citationCoverage: { required: false, satisfied: true, citationCount: 0 },
  },
  workspaceArtifacts: [
    {
      artifactId: 'artifact-1',
      turnId: 'turn-1',
      kind: 'document',
      dataMode: 'liveView',
      view: { viewId: 'security.landscape', version: 1 },
      title: 'Security posture',
      accessibleSummary: 'Security posture report for the selected scope.',
      coverage: 'complete',
      supportedActions: ['expand', 'refresh'],
    },
  ],
};

const historyProjection: AIChatConversationHistoryArtifactProjection = {
  latestResponseArtifact: {
    responseId: 'response-1',
    citations: responseArtifact.citations,
    evidenceCoverage: responseArtifact.evidenceCoverage,
  },
  responseArtifacts: [responseArtifact],
};

const artifactReadResponse: AIChatHistoryWorkspaceArtifactReadResponse = {
  conversationId: 'conversation-1',
  turnId: 'turn-1',
  responseId: 'response-1',
  artifact: {
    schemaVersion: 1,
    artifactId: 'artifact-1',
    turnId: 'turn-1',
    kind: 'document',
    dataMode: 'liveView',
    view: { viewId: 'security.landscape', version: 1 },
    title: 'Security posture',
    createdAt: '2026-09-08T00:00:00.000Z',
    accessibleSummary: 'Security posture report for the selected scope.',
    placement: { region: 'afterAnswer', order: 0 },
    provenance: { citationIds: [], sourceTypes: [], coverage: 'complete' },
    liveView: {
      viewId: 'security.landscape',
      version: 1,
      presentation: 'report',
      binding: {
        bindingKind: 'reportStrategy',
        strategyId: 'security.landscape@1',
        companyId: 'company-1',
        subscriptionIds: ['subscription-1'],
      },
      refresh: 'onOpen',
    },
  },
};

// @ts-expect-error Historical response artifacts require their durable turn identity.
const missingTurnId: AIChatHistoryResponseArtifact = {
  responseId: 'response-2',
  citations: [],
  evidenceCoverage: responseArtifact.evidenceCoverage,
};

const missingViewIdentity: AIChatHistoryResponseArtifact = {
  ...responseArtifact,
  workspaceArtifacts: [
    // @ts-expect-error Historical summaries require capability identity for replay authorization.
    {
      artifactId: 'artifact-2',
      turnId: 'turn-1',
      kind: 'document',
      dataMode: 'liveView',
      title: 'Security posture',
      accessibleSummary: 'Security posture report for the selected scope.',
      coverage: 'complete',
      supportedActions: ['expand'],
    },
  ],
};

void responseArtifactsPerConversation;
void citationsPerResponse;
void workspaceArtifactSummariesPerResponse;
void historyProjection;
void artifactReadResponse;
void missingTurnId;
void missingViewIdentity;
