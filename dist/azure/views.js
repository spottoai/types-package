"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCompletedAzureViewSetV2 = exports.isCompletedViewManifestV3 = exports.isCompletedAzureViewSetV1 = void 0;
const artifactControlData_js_1 = require("../common/artifactControlData.js");
const artifactEvidence_js_1 = require("../common/artifactEvidence.js");
const artifactEvidenceValidation_js_1 = require("../common/artifactEvidenceValidation.js");
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
const VIEW_CONTENT_ENCODINGS = new Set(['identity', 'gzip']);
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const hasControlCharacters = (value) => Array.from(value).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);
const isStrictNonEmptyString = (value) => typeof value === 'string' && value.trim() === value && value.length > 0 && !hasControlCharacters(value);
const isPositiveSafeInteger = (value) => Number.isSafeInteger(value) && Number(value) > 0;
const isNonNegativeSafeInteger = (value) => Number.isSafeInteger(value) && Number(value) >= 0;
const isSha256 = (value) => typeof value === 'string' && SHA256_PATTERN.test(value);
const allowedViewArtifactPaths = (artifacts) => Array.isArray(artifacts) ? artifacts.flatMap(artifact => (0, artifactControlData_js_1.allowedArtifactReferenceField)(artifact, 'path')) : [];
const isSafePathSegment = (value) => isStrictNonEmptyString(value) && !/[\\/?#%]/.test(value) && value !== '.' && value !== '..';
const isStrictCanonicalIsoTimestamp = (value) => {
    if (!isStrictNonEmptyString(value))
        return false;
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
};
const isEnforceableAzureOwnershipBinding = (value) => (0, artifactEvidence_js_1.isEnforceableArtifactOwnershipBinding)(value) && value.provider === 'azure';
const hasMatchingViewOwnership = (subscriptionId, ownership, revision, enforceable) => {
    if (!isSafePathSegment(subscriptionId) || !(0, artifactEvidenceValidation_js_1.isArtifactRevisionVector)(revision))
        return false;
    if (!(0, artifactEvidence_js_1.isArtifactOwnershipBinding)(ownership))
        return false;
    if (enforceable && !(0, artifactEvidence_js_1.isEnforceableArtifactOwnershipBinding)(ownership))
        return false;
    if (ownership.provider !== 'azure' || ownership.accountId !== subscriptionId)
        return false;
    return ownership.ownershipEpochRevision === revision.ownershipEpochRevision;
};
const isViewArtifactDescriptor = (value, runId) => isRecord(value) &&
    (0, artifactEvidenceValidation_js_1.isStrictLogicalArtifactReference)(value.path) &&
    value.path.startsWith(`runs/${runId}/`) &&
    value.path.length > `runs/${runId}/`.length &&
    isStrictNonEmptyString(value.name) &&
    value.mediaType === 'application/json' &&
    typeof value.contentEncoding === 'string' &&
    VIEW_CONTENT_ENCODINGS.has(value.contentEncoding) &&
    isNonNegativeSafeInteger(value.byteLength) &&
    isSha256(value.sha256);
const hasRequiredViewDependencies = (decision) => {
    const dependencies = new Map(decision.dependencies.map(dependency => [dependency.name, dependency]));
    const billing = dependencies.get('billing');
    const economics = dependencies.get('economics');
    if (!billing || !economics)
        return false;
    for (const dependency of [billing, economics]) {
        if (dependency.publication === 'completed' && (!isStrictNonEmptyString(dependency.generationId) || !isSha256(dependency.digest))) {
            return false;
        }
    }
    const completedDependencies = new Set(decision.dependencies.filter(dependency => dependency.publication === 'completed').map(dependency => dependency.name));
    return decision.claims.every(claim => claim.publication !== 'completed' || claim.requiredDependencies.every(dependency => completedDependencies.has(dependency)));
};
/** Validates an evidence-aware completed portal or plugin generation manifest. */
const isCompletedViewManifestV3 = (value) => {
    if (!isRecord(value) || (0, artifactControlData_js_1.containsForbiddenArtifactControlData)(value, allowedViewArtifactPaths(value.artifacts)))
        return false;
    if (value.schemaVersion !== 3 || value.status !== 'completed')
        return false;
    if (!isSafePathSegment(value.runId) || !hasMatchingViewOwnership(value.subscriptionId, value.ownership, value.revision, false))
        return false;
    if (!isRecord(value.artifactGeneration) ||
        value.artifactGeneration.runId !== value.runId ||
        !isStrictCanonicalIsoTimestamp(value.artifactGeneration.generatedAt)) {
        return false;
    }
    if (!Array.isArray(value.artifacts) || value.artifacts.length === 0)
        return false;
    if (!value.artifacts.every(artifact => isViewArtifactDescriptor(artifact, value.runId)))
        return false;
    if (new Set(value.artifacts.map(artifact => artifact.path)).size !== value.artifacts.length ||
        new Set(value.artifacts.map(artifact => artifact.name)).size !== value.artifacts.length) {
        return false;
    }
    if (!isPositiveSafeInteger(value.requestedArtifactCount) ||
        value.requestedArtifactCount !== value.artifacts.length ||
        !isNonNegativeSafeInteger(value.requestedResourceCount) ||
        value.failedArtifactCount !== 0 ||
        value.failedResourceCount !== 0 ||
        !isSha256(value.compositeDependencyDigest) ||
        !isStrictCanonicalIsoTimestamp(value.completedAt)) {
        return false;
    }
    return (0, artifactEvidence_js_1.isArtifactPublicationDecision)(value.publicationDecision) && hasRequiredViewDependencies(value.publicationDecision);
};
exports.isCompletedViewManifestV3 = isCompletedViewManifestV3;
const hasSameOwnership = (left, right) => left.provider === right.provider &&
    left.tenantId === right.tenantId &&
    left.companyId === right.companyId &&
    left.cloudAccountId === right.cloudAccountId &&
    left.accountId === right.accountId &&
    left.ownershipEpochRevision === right.ownershipEpochRevision;
const hasSameRevision = (left, right) => left.ownershipEpochRevision === right.ownershipEpochRevision &&
    left.sourceRevision === right.sourceRevision &&
    left.policyRevision === right.policyRevision;
const isViewSetV2SurfaceReference = (value, surface, subscriptionId, ownership, revision, compositeDependencyDigest) => {
    if (!isRecord(value) || !isSafePathSegment(value.runId))
        return false;
    const expectedManifestName = surface === 'portal' ? 'completed-view-manifest.json' : 'completed-plugin-generation.json';
    if (value.manifestPath !== `runs/${value.runId}/${expectedManifestName}` || !(0, artifactEvidenceValidation_js_1.isStrictLogicalArtifactReference)(value.manifestPath))
        return false;
    if (!isEnforceableAzureOwnershipBinding(value.ownership) || !(0, artifactEvidenceValidation_js_1.isArtifactRevisionVector)(value.revision))
        return false;
    if (!hasMatchingViewOwnership(subscriptionId, value.ownership, value.revision, true))
        return false;
    if (!hasSameOwnership(ownership, value.ownership) || !hasSameRevision(revision, value.revision))
        return false;
    return (isSha256(value.manifestDigest) &&
        value.compositeDependencyDigest === compositeDependencyDigest &&
        isStrictCanonicalIsoTimestamp(value.completedAt));
};
const hasMatchingSurfaceDependency = (decision, name, surface) => {
    const dependency = decision.dependencies.find(candidate => candidate.name === name);
    return (dependency !== undefined &&
        dependency.required &&
        dependency.publication === 'completed' &&
        dependency.generationId === surface.runId &&
        dependency.digest === surface.manifestDigest);
};
/** Validates the promoted pointer for an evidence-enforced portal/plugin view pair. */
const isCompletedAzureViewSetV2 = (value) => {
    const allowedReferences = isRecord(value)
        ? [...(0, artifactControlData_js_1.allowedArtifactReferenceField)(value.portal, 'manifestPath'), ...(0, artifactControlData_js_1.allowedArtifactReferenceField)(value.plugin, 'manifestPath')]
        : [];
    if (!isRecord(value) || (0, artifactControlData_js_1.containsForbiddenArtifactControlData)(value, allowedReferences))
        return false;
    if (value.schemaVersion !== 2 || value.status !== 'completed')
        return false;
    if (!isSafePathSegment(value.subscriptionId) ||
        !isStrictNonEmptyString(value.publicationId) ||
        !isEnforceableAzureOwnershipBinding(value.ownership) ||
        !(0, artifactEvidenceValidation_js_1.isArtifactRevisionVector)(value.revision) ||
        !hasMatchingViewOwnership(value.subscriptionId, value.ownership, value.revision, true)) {
        return false;
    }
    if (!isSha256(value.compositeDependencyDigest) || !isStrictCanonicalIsoTimestamp(value.completedAt))
        return false;
    if (!isViewSetV2SurfaceReference(value.portal, 'portal', value.subscriptionId, value.ownership, value.revision, value.compositeDependencyDigest) ||
        !isViewSetV2SurfaceReference(value.plugin, 'plugin', value.subscriptionId, value.ownership, value.revision, value.compositeDependencyDigest)) {
        return false;
    }
    const laterSurfaceCompletedAt = Date.parse(value.portal.completedAt) >= Date.parse(value.plugin.completedAt) ? value.portal.completedAt : value.plugin.completedAt;
    if (value.completedAt !== laterSurfaceCompletedAt)
        return false;
    return ((0, artifactEvidence_js_1.isArtifactPublicationDecision)(value.publicationDecision) &&
        value.publicationDecision.publication === 'completed' &&
        hasMatchingSurfaceDependency(value.publicationDecision, 'portal', value.portal) &&
        hasMatchingSurfaceDependency(value.publicationDecision, 'plugin', value.plugin));
};
exports.isCompletedAzureViewSetV2 = isCompletedAzureViewSetV2;
//# sourceMappingURL=views.js.map