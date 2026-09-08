import type { AIChatGroundingSummary } from './grounding.js';
import type { AIChatWorkspaceArtifact, AIChatWorkspaceArtifactSummary, AIChatWorkspaceArtifactViewIdentity } from './workspaceArtifacts.js';
import type { AIChatCitation, AIChatEvidenceCoverage } from './index.js';

/** Shared payload bounds for conversation-history artifact projection and replay. */
export const AI_CHAT_HISTORY_ARTIFACT_LIMITS_V1 = Object.freeze({
  responseArtifactsPerConversation: 100,
  citationsPerResponse: 50,
  workspaceArtifactSummariesPerResponse: 5,
} as const);

/** Capability-bound summary returned with a historical assistant response. */
export type AIChatHistoryWorkspaceArtifactSummary = AIChatWorkspaceArtifactSummary & {
  view: AIChatWorkspaceArtifactViewIdentity;
};

/** Safe, bounded metadata for one persisted assistant response. */
export interface AIChatHistoryResponseArtifact {
  turnId: string;
  responseId: string;
  citations: AIChatCitation[];
  evidenceCoverage: AIChatEvidenceCoverage;
  grounding?: AIChatGroundingSummary;
  workspaceArtifacts?: AIChatHistoryWorkspaceArtifactSummary[];
}

/**
 * Compatibility projection for the newest response while API and Portal consumers migrate to
 * `responseArtifacts`. Unlike historical entries, it may contain complete inline artifacts.
 */
export interface AIChatHistoryLatestResponseArtifact {
  turnId?: string;
  responseId: string;
  citations: AIChatCitation[];
  evidenceCoverage: AIChatEvidenceCoverage;
  grounding?: AIChatGroundingSummary;
  workspaceArtifacts?: AIChatWorkspaceArtifact[];
}

/** Additive artifact fields carried by the conversation-history response. */
export interface AIChatConversationHistoryArtifactProjection {
  /** @deprecated Use `responseArtifacts`; retained during the API/Portal migration. */
  latestResponseArtifact?: AIChatHistoryLatestResponseArtifact;
  /**
   * Oldest-to-newest entries for the retained response window. Entries must have unique turn and
   * response identifiers and are capped by `responseArtifactsPerConversation`.
   */
  responseArtifacts?: AIChatHistoryResponseArtifact[];
}

/** Authorized lazy-read response for one complete historical workspace artifact. */
export interface AIChatHistoryWorkspaceArtifactReadResponse {
  conversationId: string;
  turnId: string;
  responseId: string;
  artifact: AIChatWorkspaceArtifact;
}
