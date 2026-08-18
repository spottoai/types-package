import { allowedArtifactReferenceField, allowedArtifactTraversalField, containsForbiddenArtifactControlData, } from '../common/artifactControlData.js';
import { isArtifactOwnershipBinding, isArtifactPublicationDecision, isEnforceableArtifactOwnershipBinding, } from '../common/artifactEvidence.js';
import { isArtifactRevisionVector, isStrictLogicalArtifactReference } from '../common/artifactEvidenceValidation.js';
export const PUBLISHED_VIEW_OBJECT_LIMITS_V1 = {
    maxArtifacts: 512,
    maxClaims: 128,
    maxDependencies: 256,
    maxIssues: 512,
    maxClaimBindings: 512,
    maxSectionPaths: 512,
};
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
const containsForbiddenViewArtifactControlData = (value, allowedReferenceFields = []) => containsForbiddenArtifactControlData(value, allowedReferenceFields, {
    requireAllowedFieldTraversalContext: true,
});
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
const isPublishedViewCoverage = (value) => value === 'complete' || value === 'partial';
const isProjectedSectionPathForArtifact = (value, artifactPath) => {
    if (!isStrictNonEmptyString(value))
        return false;
    if (value === artifactPath)
        return true;
    if (!value.startsWith(`${artifactPath}#/`))
        return false;
    const pointer = value.slice(artifactPath.length + 1);
    return !pointer.includes('\\') && !pointer.includes('?') && !/%(?:2f|2F|5c|5C)/.test(pointer);
};
const parseProjectedSectionPath = (value) => {
    const fragmentIndex = value.indexOf('#');
    const artifactPath = fragmentIndex < 0 ? value : value.slice(0, fragmentIndex);
    if (!isStrictLogicalArtifactReference(artifactPath) || !isProjectedSectionPathForArtifact(value, artifactPath))
        return undefined;
    return {
        artifactPath,
        pointerSegments: fragmentIndex < 0 ? [] : value.slice(fragmentIndex + 2).split('/'),
    };
};
const doProjectedSectionsOverlap = (left, right) => {
    const parsedLeft = parseProjectedSectionPath(left);
    const parsedRight = parseProjectedSectionPath(right);
    if (!parsedLeft || !parsedRight || parsedLeft.artifactPath !== parsedRight.artifactPath)
        return false;
    if (parsedLeft.pointerSegments.length === 0 || parsedRight.pointerSegments.length === 0)
        return true;
    const sharedLength = Math.min(parsedLeft.pointerSegments.length, parsedRight.pointerSegments.length);
    for (let index = 0; index < sharedLength; index += 1) {
        const leftSegment = parsedLeft.pointerSegments[index];
        const rightSegment = parsedRight.pointerSegments[index];
        if (leftSegment === rightSegment)
            continue;
        if (leftSegment === '*' || leftSegment === '**' || rightSegment === '*' || rightSegment === '**')
            return true;
        return false;
    }
    return true;
};
const hasUnambiguousPublishedClaimSections = (decision) => {
    const declaredSections = [];
    for (const claim of decision.claims) {
        if (new Set(claim.sectionPaths).size !== claim.sectionPaths.length)
            return false;
        for (const sectionPath of claim.sectionPaths) {
            if (!parseProjectedSectionPath(sectionPath))
                return false;
            if (declaredSections.some(declaredSection => doProjectedSectionsOverlap(declaredSection, sectionPath)))
                return false;
            declaredSections.push(sectionPath);
        }
    }
    return true;
};
const isPublishedViewArtifactDescriptor = (value, runId) => {
    if (!isViewArtifactDescriptor(value, runId) || !isRecord(value))
        return false;
    const runPrefix = `runs/${runId}/`;
    if (value.name !== value.path.slice(runPrefix.length))
        return false;
    if (!Array.isArray(value.claimBindings) ||
        value.claimBindings.length === 0 ||
        value.claimBindings.length > PUBLISHED_VIEW_OBJECT_LIMITS_V1.maxClaimBindings) {
        return false;
    }
    const claimIds = new Set();
    for (const binding of value.claimBindings) {
        if (!isRecord(binding) || !isStrictNonEmptyString(binding.claimId) || claimIds.has(binding.claimId))
            return false;
        claimIds.add(binding.claimId);
        if (!Array.isArray(binding.sectionPaths) ||
            binding.sectionPaths.length === 0 ||
            binding.sectionPaths.length > PUBLISHED_VIEW_OBJECT_LIMITS_V1.maxSectionPaths) {
            return false;
        }
        if (new Set(binding.sectionPaths).size !== binding.sectionPaths.length)
            return false;
        if (!binding.sectionPaths.every(sectionPath => isProjectedSectionPathForArtifact(sectionPath, value.path)))
            return false;
    }
    return true;
};
const hasPublishedViewDecisionBounds = (decision) => {
    if (decision.claims.length === 0 ||
        decision.claims.length > PUBLISHED_VIEW_OBJECT_LIMITS_V1.maxClaims ||
        decision.dependencies.length > PUBLISHED_VIEW_OBJECT_LIMITS_V1.maxDependencies ||
        decision.issues.length > PUBLISHED_VIEW_OBJECT_LIMITS_V1.maxIssues) {
        return false;
    }
    let sectionPathCount = 0;
    let issueCount = decision.issues.length;
    for (const claim of decision.claims) {
        sectionPathCount += claim.sectionPaths.length;
        issueCount += claim.issues.length;
        if (sectionPathCount > PUBLISHED_VIEW_OBJECT_LIMITS_V1.maxSectionPaths || issueCount > PUBLISHED_VIEW_OBJECT_LIMITS_V1.maxIssues) {
            return false;
        }
    }
    return true;
};
const hasPublishedViewArtifactBounds = (artifacts) => {
    let claimBindingCount = 0;
    let sectionPathCount = 0;
    for (const artifact of artifacts) {
        claimBindingCount += artifact.claimBindings.length;
        for (const binding of artifact.claimBindings)
            sectionPathCount += binding.sectionPaths.length;
        if (claimBindingCount > PUBLISHED_VIEW_OBJECT_LIMITS_V1.maxClaimBindings || sectionPathCount > PUBLISHED_VIEW_OBJECT_LIMITS_V1.maxSectionPaths) {
            return false;
        }
    }
    return true;
};
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
    if (!isRecord(value) ||
        containsForbiddenViewArtifactControlData(value, [
            ...allowedArtifactTraversalField(value, 'artifacts'),
            ...allowedViewArtifactPaths(value.artifacts),
        ]))
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
const hasExactPublishedClaimProjection = (artifacts, decision) => {
    if (!hasUnambiguousPublishedClaimSections(decision))
        return false;
    const claimById = new Map(decision.claims.map(claim => [claim.claimId, claim]));
    const completedClaims = decision.claims.filter(claim => claim.publication === 'completed');
    if (completedClaims.length === 0)
        return false;
    const expectedBindings = new Set();
    for (const claim of completedClaims) {
        if (claim.sectionPaths.length === 0 || new Set(claim.sectionPaths).size !== claim.sectionPaths.length)
            return false;
        for (const sectionPath of claim.sectionPaths)
            expectedBindings.add(`${claim.claimId}\0${sectionPath}`);
    }
    const actualBindings = new Set();
    for (const artifact of artifacts) {
        for (const binding of artifact.claimBindings) {
            const claim = claimById.get(binding.claimId);
            if (!claim || claim.publication !== 'completed')
                return false;
            for (const sectionPath of binding.sectionPaths) {
                if (!claim.sectionPaths.includes(sectionPath))
                    return false;
                const key = `${binding.claimId}\0${sectionPath}`;
                if (actualBindings.has(key))
                    return false;
                actualBindings.add(key);
            }
        }
    }
    return expectedBindings.size === actualBindings.size && Array.from(expectedBindings).every(binding => actualBindings.has(binding));
};
const isPublishedDecisionForCoverage = (decision, coverage) => {
    if (!hasRequiredViewDependencies(decision) || decision.processing !== 'succeeded')
        return false;
    const completedClaimCount = decision.claims.filter(claim => claim.publication === 'completed').length;
    if (coverage === 'complete') {
        return decision.publication === 'completed' && decision.evidence === 'complete' && completedClaimCount === decision.claims.length;
    }
    return (decision.publication === 'partial' && decision.evidence === 'partial' && completedClaimCount > 0 && completedClaimCount < decision.claims.length);
};
/** Validates a claim-projected portal or plugin generation, including observe-mode epoch-free manifests. */
export const isPublishedViewManifestV4 = (value) => {
    if (!isRecord(value) ||
        containsForbiddenViewArtifactControlData(value, [
            ...allowedArtifactTraversalField(value, 'artifacts'),
            ...allowedViewArtifactPaths(value.artifacts),
        ])) {
        return false;
    }
    if (value.schemaVersion !== 4 || value.status !== 'published' || !isPublishedViewCoverage(value.coverage))
        return false;
    if (!isSafePathSegment(value.runId) || !hasMatchingViewOwnership(value.subscriptionId, value.ownership, value.revision, false))
        return false;
    if (!isRecord(value.artifactGeneration) ||
        value.artifactGeneration.runId !== value.runId ||
        !isStrictCanonicalIsoTimestamp(value.artifactGeneration.generatedAt)) {
        return false;
    }
    if (!Array.isArray(value.artifacts) || value.artifacts.length === 0 || value.artifacts.length > PUBLISHED_VIEW_OBJECT_LIMITS_V1.maxArtifacts) {
        return false;
    }
    if (!value.artifacts.every(artifact => isPublishedViewArtifactDescriptor(artifact, value.runId)))
        return false;
    if (!hasPublishedViewArtifactBounds(value.artifacts))
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
        !isStrictCanonicalIsoTimestamp(value.completedAt) ||
        !isArtifactPublicationDecision(value.publicationDecision) ||
        !hasPublishedViewDecisionBounds(value.publicationDecision)) {
        return false;
    }
    return (isPublishedDecisionForCoverage(value.publicationDecision, value.coverage) &&
        hasExactPublishedClaimProjection(value.artifacts, value.publicationDecision));
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
const isPublishedViewSetV3SurfaceReference = (value, surface, subscriptionId, ownership, revision, compositeDependencyDigest) => {
    if (!isRecord(value) || !isSafePathSegment(value.runId) || !isPublishedViewCoverage(value.coverage))
        return false;
    const expectedManifestName = surface === 'portal' ? 'published-view-manifest.json' : 'published-plugin-generation.json';
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
        ? [
            ...allowedArtifactTraversalField(value, 'portal'),
            ...allowedArtifactTraversalField(value, 'plugin'),
            ...allowedArtifactReferenceField(value.portal, 'manifestPath'),
            ...allowedArtifactReferenceField(value.plugin, 'manifestPath'),
        ]
        : [];
    if (!isRecord(value) || containsForbiddenViewArtifactControlData(value, allowedReferences))
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
/** Validates the promoted pointer for one claim-projected portal/plugin generation pair. */
export const isPublishedAzureViewSetV3 = (value) => {
    const allowedReferences = isRecord(value)
        ? [
            ...allowedArtifactTraversalField(value, 'portal'),
            ...allowedArtifactTraversalField(value, 'plugin'),
            ...allowedArtifactReferenceField(value.portal, 'manifestPath'),
            ...allowedArtifactReferenceField(value.plugin, 'manifestPath'),
        ]
        : [];
    if (!isRecord(value) || containsForbiddenViewArtifactControlData(value, allowedReferences))
        return false;
    if (value.schemaVersion !== 3 || value.status !== 'published' || !isPublishedViewCoverage(value.coverage))
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
    if (!isPublishedViewSetV3SurfaceReference(value.portal, 'portal', value.subscriptionId, value.ownership, value.revision, value.compositeDependencyDigest) ||
        !isPublishedViewSetV3SurfaceReference(value.plugin, 'plugin', value.subscriptionId, value.ownership, value.revision, value.compositeDependencyDigest)) {
        return false;
    }
    const expectedCoverage = value.portal.coverage === 'complete' && value.plugin.coverage === 'complete' ? 'complete' : 'partial';
    if (value.coverage !== expectedCoverage)
        return false;
    const laterSurfaceCompletedAt = Date.parse(value.portal.completedAt) >= Date.parse(value.plugin.completedAt) ? value.portal.completedAt : value.plugin.completedAt;
    if (value.completedAt !== laterSurfaceCompletedAt)
        return false;
    return (isArtifactPublicationDecision(value.publicationDecision) &&
        hasPublishedViewDecisionBounds(value.publicationDecision) &&
        value.publicationDecision.publication === 'completed' &&
        value.publicationDecision.evidence === value.coverage &&
        hasMatchingSurfaceDependency(value.publicationDecision, 'portal', value.portal) &&
        hasMatchingSurfaceDependency(value.publicationDecision, 'plugin', value.plugin));
};
