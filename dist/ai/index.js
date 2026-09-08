"use strict";
/** Common AI interfaces shared between frontend and backend */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_CHAT_TURN_FEEDBACK_MAX_RECORDS = exports.AI_CHAT_TURN_FEEDBACK_COMMENT_MAX_LENGTH = void 0;
__exportStar(require("./grounding.js"), exports);
__exportStar(require("./conversationHistory.js"), exports);
__exportStar(require("./workspaceArtifacts.js"), exports);
/** Maximum length of the optional free-text comment attached to per-turn feedback. */
exports.AI_CHAT_TURN_FEEDBACK_COMMENT_MAX_LENGTH = 1000;
/**
 * Number of per-turn feedback records retained on a conversation. The conversation blob stays the
 * authoritative record, so the newest records win once the bound is reached.
 */
exports.AI_CHAT_TURN_FEEDBACK_MAX_RECORDS = 200;
//# sourceMappingURL=index.js.map