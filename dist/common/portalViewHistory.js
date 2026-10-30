"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORTAL_VIEW_HISTORY_MAX_MANIFEST_JSON_BYTES = exports.PORTAL_VIEW_HISTORY_MAX_ARTIFACT_JSON_BYTES = exports.PORTAL_VIEW_HISTORY_ARTIFACTS = exports.PORTAL_VIEW_HISTORY_CADENCES = void 0;
/** Cadences shared by the snapshot producers, API readers, and Trend Tracker. */
exports.PORTAL_VIEW_HISTORY_CADENCES = ['daily', 'weekly', 'monthly'];
/** The existing Portal view documents retained together for each snapshot. */
exports.PORTAL_VIEW_HISTORY_ARTIFACTS = ['summary', 'resources', 'recommendations'];
/** Decoded JSON limits shared by producers and readers; compressed size is separate. */
exports.PORTAL_VIEW_HISTORY_MAX_ARTIFACT_JSON_BYTES = 32 * 1024 * 1024;
exports.PORTAL_VIEW_HISTORY_MAX_MANIFEST_JSON_BYTES = 256 * 1024;
//# sourceMappingURL=portalViewHistory.js.map