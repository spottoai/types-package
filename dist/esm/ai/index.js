/** Common AI interfaces shared between frontend and backend */
export * from './grounding.js';
export * from './conversationHistory.js';
export * from './workspaceArtifacts.js';
/** Maximum length of the optional free-text comment attached to per-turn feedback. */
export const AI_CHAT_TURN_FEEDBACK_COMMENT_MAX_LENGTH = 1000;
/**
 * Number of per-turn feedback records retained on a conversation. The conversation blob stays the
 * authoritative record, so the newest records win once the bound is reached.
 */
export const AI_CHAT_TURN_FEEDBACK_MAX_RECORDS = 200;
