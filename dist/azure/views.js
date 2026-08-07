"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCompletedAzureViewSetV1 = void 0;
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isCanonicalIsoTimestamp = (value) => {
    if (!isNonEmptyString(value))
        return false;
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
};
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const isLogicalManifestPath = (value) => {
    if (!isNonEmptyString(value))
        return false;
    if (value.startsWith('/') || value.includes('://') || value.includes('?') || value.includes('#') || value.includes('\\'))
        return false;
    const segments = value.split('/');
    return segments.length >= 2 && segments.every(segment => segment.length > 0 && segment !== '.' && segment !== '..');
};
const isViewSetSurfaceReference = (value) => isRecord(value) && isNonEmptyString(value.runId) && isLogicalManifestPath(value.manifestPath) && isCanonicalIsoTimestamp(value.completedAt);
/** Dependency-free rejection boundary for customer-readable cross-surface pointers. */
const isCompletedAzureViewSetV1 = (value) => {
    if (!isRecord(value))
        return false;
    if (value.schemaVersion !== 1 || value.status !== 'completed')
        return false;
    if (!isNonEmptyString(value.subscriptionId) || !isNonEmptyString(value.publicationId) || !isCanonicalIsoTimestamp(value.completedAt)) {
        return false;
    }
    if (!isViewSetSurfaceReference(value.portal) || !isViewSetSurfaceReference(value.plugin))
        return false;
    if (!isRecord(value.economics))
        return false;
    return isNonEmptyString(value.economics.generationId) && isNonEmptyString(value.economics.fingerprint);
};
exports.isCompletedAzureViewSetV1 = isCompletedAzureViewSetV1;
//# sourceMappingURL=views.js.map