/** Cadences shared by the snapshot producers, API readers, and Trend Tracker. */
export const PORTAL_VIEW_HISTORY_CADENCES = ['daily', 'weekly', 'monthly'];
/** The existing Portal view documents retained together for each snapshot. */
export const PORTAL_VIEW_HISTORY_ARTIFACTS = ['summary', 'resources', 'recommendations'];
/** Decoded JSON limits shared by producers and readers; compressed size is separate. */
export const PORTAL_VIEW_HISTORY_MAX_ARTIFACT_JSON_BYTES = 32 * 1024 * 1024;
export const PORTAL_VIEW_HISTORY_MAX_MANIFEST_JSON_BYTES = 256 * 1024;
