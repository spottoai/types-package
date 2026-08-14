import { allowedArtifactReferenceField, containsForbiddenArtifactControlData, } from '../common/artifactControlData.js';
import { isArtifactOwnershipBinding, isArtifactPublicationDecision, isEnforceableArtifactOwnershipBinding, } from '../common/artifactEvidence.js';
import { isArtifactRevisionVector, isStrictLogicalArtifactReference } from '../common/artifactEvidenceValidation.js';
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
export const isCompletedAzureViewSetV1 = (value) => {
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
const VIEW_CONTENT_ENCODINGS = new Set(['identity', 'gzip']);
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const hasControlCharacters = (value) => Array.from(value).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);
const isStrictNonEmptyString = (value) => typeof value === 'string' && value.trim() === value && value.length > 0 && !hasControlCharacters(value);
const isPositiveSafeInteger = (value) => Number.isSafeInteger(value) && Number(value) > 0;
const isNonNegativeSafeInteger = (value) => Number.isSafeInteger(value) && Number(value) >= 0;
const isSha256 = (value) => typeof value === 'string' && SHA256_PATTERN.test(value);
const allowedViewArtifactPaths = (artifacts) => Array.isArray(artifacts) ? artifacts.flatMap(artifact => allowedArtifactReferenceField(artifact, 'path')) : [];
const isSafePathSegment = (value) => isStrictNonEmptyString(value) && !/[\\/?#%]/.test(value) && value !== '.' && value !== '..';
const isStrictCanonicalIsoTimestamp = (value) => {
    if (!isStrictNonEmptyString(value))
        return false;
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
};
const isEnforceableAzureOwnershipBinding = (value) => isEnforceableArtifactOwnershipBinding(value) && value.provider === 'azure';
const hasMatchingViewOwnership = (subscriptionId, ownership, revision, enforceable) => {
    if (!isSafePathSegment(subscriptionId) || !isArtifactRevisionVector(revision))
        return false;
    if (!isArtifactOwnershipBinding(ownership))
        return false;
    if (enforceable && !isEnforceableArtifactOwnershipBinding(ownership))
        return false;
    if (ownership.provider !== 'azure' || ownership.accountId !== subscriptionId)
        return false;
    return ownership.ownershipEpochRevision === revision.ownershipEpochRevision;
};
const isViewArtifactDescriptor = (value, runId) => isRecord(value) &&
    isStrictLogicalArtifactReference(value.path) &&
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
export const isCompletedViewManifestV3 = (value) => {
    if (!isRecord(value) || containsForbiddenArtifactControlData(value, allowedViewArtifactPaths(value.artifacts)))
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
    return isArtifactPublicationDecision(value.publicationDecision) && hasRequiredViewDependencies(value.publicationDecision);
};
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
    if (value.manifestPath !== `runs/${value.runId}/${expectedManifestName}` || !isStrictLogicalArtifactReference(value.manifestPath))
        return false;
    if (!isEnforceableAzureOwnershipBinding(value.ownership) || !isArtifactRevisionVector(value.revision))
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
export const isCompletedAzureViewSetV2 = (value) => {
    const allowedReferences = isRecord(value)
        ? [...allowedArtifactReferenceField(value.portal, 'manifestPath'), ...allowedArtifactReferenceField(value.plugin, 'manifestPath')]
        : [];
    if (!isRecord(value) || containsForbiddenArtifactControlData(value, allowedReferences))
        return false;
    if (value.schemaVersion !== 2 || value.status !== 'completed')
        return false;
    if (!isSafePathSegment(value.subscriptionId) ||
        !isStrictNonEmptyString(value.publicationId) ||
        !isEnforceableAzureOwnershipBinding(value.ownership) ||
        !isArtifactRevisionVector(value.revision) ||
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
    return (isArtifactPublicationDecision(value.publicationDecision) &&
        value.publicationDecision.publication === 'completed' &&
        hasMatchingSurfaceDependency(value.publicationDecision, 'portal', value.portal) &&
        hasMatchingSurfaceDependency(value.publicationDecision, 'plugin', value.plugin));
};
