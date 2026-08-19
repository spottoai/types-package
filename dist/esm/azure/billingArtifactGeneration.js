import { isArtifactOwnershipBinding, isEnforceableArtifactOwnershipBinding, } from '../common/artifactEvidence.js';
import { isArtifactRevisionVector, isStrictLogicalArtifactReference } from '../common/artifactEvidenceValidation.js';
import { ARTIFACT_CONTROL_DATA_MAX_VISITED_NODES, allowedArtifactIdentityField, allowedArtifactReferenceField, allowedArtifactTraversalField, containsForbiddenArtifactControlData, } from '../common/artifactControlData.js';
import { isBillingCompletedArtifactPublicationDecision } from './billingArtifactEvidence.js';
import { BILLING_ARTIFACT_OBJECT_LIMITS_V1 } from './billingArtifactLimits.js';
/** Stable diagnostic-only suffix for the latest successfully enqueued observe input. */
export const BILLING_ANALYZER_INPUT_OBSERVATION_POINTER_RELATIVE_PATH = 'history/billing/analyzer-inputs/latest-enqueued.json';
const BILLING_BASES = new Set(['actual', 'amortized']);
const COVERAGE_VERDICTS = new Set(['complete', 'partial', 'none', 'unknown']);
const DATE_BASES = new Set(['utc', 'billing-calendar', 'company-local']);
const CONTENT_ENCODINGS = new Set(['identity', 'gzip']);
const OBSERVATION_COMPARISONS = new Set([
    'authority-absent',
    'newer',
    'equal',
    'older',
    'incomparable',
    'newer-ownership',
    'older-ownership',
    'unenforceable',
]);
const OBSERVATION_PROJECTED_OUTCOMES = new Map([
    ['authority-absent', 'would-promote'],
    ['newer', 'would-promote'],
    ['newer-ownership', 'would-promote'],
    ['equal', 'would-be-idempotent'],
    ['older', 'would-be-superseded'],
    ['older-ownership', 'would-be-superseded'],
    ['incomparable', 'would-quarantine'],
    ['unenforceable', 'not-enforceable'],
]);
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonEmptyString = (value) => typeof value === 'string' && value.trim() === value && value.length > 0;
const isPositiveInteger = (value) => Number.isSafeInteger(value) && Number(value) > 0;
const isNonNegativeInteger = (value) => Number.isSafeInteger(value) && Number(value) >= 0;
const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const isStringIn = (value, values) => typeof value === 'string' && values.has(value);
const hasUniqueValues = (values) => new Set(values).size === values.length;
const publicationDecisionReferencesDigest = (value, digests) => isRecord(value) &&
    Array.isArray(value.dependencies) &&
    value.dependencies.some(dependency => isRecord(dependency) && typeof dependency.digest === 'string' && digests.has(dependency.digest));
const isCanonicalIsoTimestamp = (value) => {
    if (!isNonEmptyString(value))
        return false;
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
};
const hasControlCharacters = (value) => Array.from(value).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);
const allowedDescriptorPaths = (descriptors) => Array.isArray(descriptors) ? descriptors.flatMap(descriptor => allowedArtifactReferenceField(descriptor, 'path')) : [];
const containsForbiddenBillingArtifactControlData = (value, allowedReferenceFields = []) => containsForbiddenArtifactControlData(value, allowedReferenceFields, {
    requireAllowedFieldTraversalContext: true,
});
const isPathSegment = (value) => isNonEmptyString(value) && !/[\\/?#%]/.test(value) && !hasControlCharacters(value) && value !== '.' && value !== '..';
/** Builds the diagnostic-only latest-enqueued observation path for one safe subscription segment. */
export const buildBillingAnalyzerInputObservationPointerPath = (subscriptionId) => {
    if (!isPathSegment(subscriptionId))
        throw new TypeError('subscriptionId must be a safe path segment');
    return `subscriptions/${subscriptionId}/${BILLING_ANALYZER_INPUT_OBSERVATION_POINTER_RELATIVE_PATH}`;
};
/** Validates the exact diagnostic-only latest-enqueued observation logical path. */
export const isBillingAnalyzerInputObservationPointerPath = (value) => {
    if (!isStrictLogicalArtifactReference(value))
        return false;
    const match = /^subscriptions\/([^/]+)\/history\/billing\/analyzer-inputs\/latest-enqueued\.json$/.exec(value);
    return match !== null && isPathSegment(match[1]);
};
const inputGenerationPrefix = (subscriptionId, generationId) => `subscriptions/${subscriptionId}/history/billing/analyzer-inputs/generations/${generationId}/`;
const inputManifestPath = (subscriptionId, generationId) => `${inputGenerationPrefix(subscriptionId, generationId)}manifest.json`;
const outputGenerationPrefix = (subscriptionId, generationId) => `subscriptions/${subscriptionId}/billing/generations/${generationId}/`;
const outputManifestPath = (subscriptionId, generationId) => `${outputGenerationPrefix(subscriptionId, generationId)}manifest.json`;
const isGenerationPath = (value, prefix, forbiddenExactPath) => isStrictLogicalArtifactReference(value) && value.startsWith(prefix) && value.length > prefix.length && value !== forbiddenExactPath;
const hasMatchingIdentity = (subscriptionId, generationId, ownership, revision, enforceable) => {
    if (!isPathSegment(subscriptionId) ||
        !isPathSegment(generationId) ||
        !isArtifactOwnershipBinding(ownership) ||
        !isArtifactRevisionVector(revision)) {
        return false;
    }
    if (ownership.provider !== 'azure' || ownership.accountId !== subscriptionId)
        return false;
    if (ownership.ownershipEpochRevision !== revision.ownershipEpochRevision)
        return false;
    return !enforceable || isEnforceableArtifactOwnershipBinding(ownership);
};
const hasEpochFreeMatchingIdentity = (subscriptionId, generationId, ownership, revision) => hasMatchingIdentity(subscriptionId, generationId, ownership, revision, false) &&
    isRecord(ownership) &&
    isRecord(revision) &&
    !Object.prototype.hasOwnProperty.call(ownership, 'ownershipEpochRevision') &&
    !Object.prototype.hasOwnProperty.call(revision, 'ownershipEpochRevision');
const isSha256 = (value) => typeof value === 'string' && SHA256_PATTERN.test(value);
const hasDiagnosticObservationDiscriminant = (value) => value.authority === 'diagnostic-only' ||
    (value.publicationMode === 'observe' &&
        (value.documentType === 'billing-analyzer-input-observation-pointer' || value.documentType === 'billing-analysis-promotion-observation'));
const isRequestedPeriod = (value) => {
    if (!isRecord(value) ||
        !isCanonicalIsoTimestamp(value.fromInclusive) ||
        !isCanonicalIsoTimestamp(value.throughExclusive) ||
        Date.parse(value.throughExclusive) <= Date.parse(value.fromInclusive) ||
        !isStringIn(value.dateBasis, DATE_BASES) ||
        !isStringIn(value.basis, BILLING_BASES)) {
        return false;
    }
    return value.timeZone === undefined || isNonEmptyString(value.timeZone);
};
const isInputObjectDescriptor = (value, subscriptionId, generationId) => {
    if (!isRecord(value))
        return false;
    const prefix = inputGenerationPrefix(subscriptionId, generationId);
    return (isGenerationPath(value.path, prefix, inputManifestPath(subscriptionId, generationId)) &&
        (value.versionId === undefined || isNonEmptyString(value.versionId)) &&
        isNonEmptyString(value.etag) &&
        isSha256(value.sha256) &&
        isPositiveInteger(value.byteCount) &&
        value.byteCount <= BILLING_ARTIFACT_OBJECT_LIMITS_V1.inputObjectStoredBytes &&
        isNonNegativeInteger(value.rowCount) &&
        isStringIn(value.basis, BILLING_BASES) &&
        (value.currencyCode === undefined || isNonEmptyString(value.currencyCode)) &&
        isStringIn(value.coverage, COVERAGE_VERDICTS));
};
const isOutputArtifactDescriptor = (value, subscriptionId, generationId) => {
    if (!isRecord(value))
        return false;
    const prefix = outputGenerationPrefix(subscriptionId, generationId);
    if (!isGenerationPath(value.path, prefix, outputManifestPath(subscriptionId, generationId)) ||
        !isPathSegment(value.name) ||
        !((value.name === 'metadata.json' &&
            value.path === `${prefix}metadata.json` &&
            isNonNegativeInteger(value.byteLength) &&
            value.byteLength <= BILLING_ARTIFACT_OBJECT_LIMITS_V1.metadataStoredBytes) ||
            (value.name !== 'metadata.json' &&
                value.path === `${prefix}plots/${value.name}` &&
                isNonNegativeInteger(value.byteLength) &&
                value.byteLength <= BILLING_ARTIFACT_OBJECT_LIMITS_V1.plotStoredBytes))) {
        return false;
    }
    return value.mediaType === 'application/json' && isStringIn(value.contentEncoding, CONTENT_ENCODINGS) && isSha256(value.sha256);
};
const isJsonMetadata = (value) => {
    if (!isRecord(value))
        return false;
    const pending = [{ kind: 'visit', value }];
    const activeContainers = new WeakSet();
    const completedContainers = new WeakSet();
    let visitedNodeCount = 0;
    while (pending.length > 0) {
        const candidate = pending.pop();
        if (candidate.kind === 'leave') {
            activeContainers.delete(candidate.container);
            completedContainers.add(candidate.container);
            continue;
        }
        if (candidate.value === null || typeof candidate.value === 'string' || typeof candidate.value === 'boolean' || isFiniteNumber(candidate.value)) {
            continue;
        }
        if (Array.isArray(candidate.value)) {
            visitedNodeCount += 1;
            if (visitedNodeCount > ARTIFACT_CONTROL_DATA_MAX_VISITED_NODES)
                return false;
            if (activeContainers.has(candidate.value))
                return false;
            if (completedContainers.has(candidate.value))
                continue;
            activeContainers.add(candidate.value);
            pending.push({ kind: 'leave', container: candidate.value });
            for (let index = candidate.value.length - 1; index >= 0; index -= 1) {
                pending.push({ kind: 'visit', value: candidate.value[index] });
            }
            continue;
        }
        if (!isRecord(candidate.value) || Object.getPrototypeOf(candidate.value) !== Object.prototype)
            return false;
        visitedNodeCount += 1;
        if (visitedNodeCount > ARTIFACT_CONTROL_DATA_MAX_VISITED_NODES)
            return false;
        if (activeContainers.has(candidate.value))
            return false;
        if (completedContainers.has(candidate.value))
            continue;
        activeContainers.add(candidate.value);
        pending.push({ kind: 'leave', container: candidate.value });
        for (const child of Object.values(candidate.value))
            pending.push({ kind: 'visit', value: child });
    }
    return true;
};
/** Validates one immutable billing analyzer input manifest without performing I/O. */
export const isBillingAnalyzerInputManifestV2 = (value) => {
    if (!isRecord(value) ||
        containsForbiddenBillingArtifactControlData(value, [
            ...allowedArtifactIdentityField(value, 'publicationKey'),
            ...allowedArtifactTraversalField(value, 'inputs'),
            ...allowedDescriptorPaths(value.inputs),
        ])) {
        return false;
    }
    if (value.schemaVersion !== 2 || value.status !== 'completed')
        return false;
    if (!hasMatchingIdentity(value.subscriptionId, value.generationId, value.ownership, value.revision, false))
        return false;
    if (!isNonEmptyString(value.publicationKey) || !isSha256(value.coveragePlanDigest) || !isSha256(value.manifestDigest))
        return false;
    if (!isCanonicalIsoTimestamp(value.asOfUtc) || !isCanonicalIsoTimestamp(value.stableCutoffUtc) || !isCanonicalIsoTimestamp(value.completedAt)) {
        return false;
    }
    if (Date.parse(value.stableCutoffUtc) > Date.parse(value.asOfUtc) || Date.parse(value.completedAt) < Date.parse(value.asOfUtc))
        return false;
    if (!Array.isArray(value.requestedPeriods) || value.requestedPeriods.length === 0 || !value.requestedPeriods.every(isRequestedPeriod))
        return false;
    const periodKeys = value.requestedPeriods.map(period => `${period.fromInclusive}\n${period.throughExclusive}\n${period.dateBasis}\n${period.timeZone ?? ''}\n${period.basis}`);
    if (!hasUniqueValues(periodKeys))
        return false;
    if (!Array.isArray(value.inputs) || value.inputs.length === 0 || value.inputs.length > BILLING_ARTIFACT_OBJECT_LIMITS_V1.maxInputObjects)
        return false;
    if (!value.inputs.every(input => isInputObjectDescriptor(input, value.subscriptionId, value.generationId)))
        return false;
    return hasUniqueValues(value.inputs.map(input => input.path));
};
/** Validates the enforceable current pointer for one published analyzer input generation. */
export const isBillingAnalyzerInputCurrentPointerV1 = (value) => {
    if (!isRecord(value) ||
        hasDiagnosticObservationDiscriminant(value) ||
        containsForbiddenBillingArtifactControlData(value, allowedArtifactReferenceField(value, 'manifestPath')))
        return false;
    if (value.schemaVersion !== 1 || value.status !== 'completed')
        return false;
    if (!hasMatchingIdentity(value.subscriptionId, value.generationId, value.ownership, value.revision, true))
        return false;
    return (isStrictLogicalArtifactReference(value.manifestPath) &&
        value.manifestPath === inputManifestPath(value.subscriptionId, value.generationId) &&
        isSha256(value.manifestDigest) &&
        isCanonicalIsoTimestamp(value.completedAt));
};
/** Validates the latest epoch-free current pointer for one analyzer input generation. */
export const isBillingAnalyzerInputCurrentPointerV2 = (value) => {
    if (!isRecord(value) ||
        hasDiagnosticObservationDiscriminant(value) ||
        containsForbiddenBillingArtifactControlData(value, allowedArtifactReferenceField(value, 'manifestPath'))) {
        return false;
    }
    if (value.schemaVersion !== 2 || value.status !== 'completed')
        return false;
    if (!hasEpochFreeMatchingIdentity(value.subscriptionId, value.generationId, value.ownership, value.revision))
        return false;
    return (isStrictLogicalArtifactReference(value.manifestPath) &&
        value.manifestPath === inputManifestPath(value.subscriptionId, value.generationId) &&
        isSha256(value.manifestDigest) &&
        isCanonicalIsoTimestamp(value.completedAt));
};
/** Validates the V2 queue envelope and its immutable input-manifest binding. */
export const isBillingAnalyzerRequestV2 = (value) => {
    if (!isRecord(value) || containsForbiddenBillingArtifactControlData(value, allowedArtifactReferenceField(value, 'inputManifestPath')))
        return false;
    if (value.schemaVersion !== 2 || (value.publicationMode !== 'observe' && value.publicationMode !== 'enforce'))
        return false;
    const enforceable = value.publicationMode === 'enforce';
    if (!hasMatchingIdentity(value.subscriptionId, value.generationId, value.ownership, value.revision, enforceable))
        return false;
    if (![value.eventId, value.correlationId].every(isNonEmptyString) || !isSha256(value.messageId) || !isSha256(value.idempotencyKey))
        return false;
    if (value.idempotencyKey !== value.messageId || !isCanonicalIsoTimestamp(value.occurredAt))
        return false;
    if (!isStrictLogicalArtifactReference(value.inputManifestPath) ||
        value.inputManifestPath !== inputManifestPath(value.subscriptionId, value.generationId)) {
        return false;
    }
    if (!isSha256(value.inputManifestDigest))
        return false;
    return value.displayMetadata === undefined || isJsonMetadata(value.displayMetadata);
};
/** Validates the latest-only V3 queue envelope and immutable input-manifest binding. */
export const isBillingAnalyzerRequestV3 = (value) => {
    if (!isRecord(value) ||
        Object.prototype.hasOwnProperty.call(value, 'publicationMode') ||
        containsForbiddenBillingArtifactControlData(value, allowedArtifactReferenceField(value, 'inputManifestPath'))) {
        return false;
    }
    if (value.schemaVersion !== 3)
        return false;
    if (!hasEpochFreeMatchingIdentity(value.subscriptionId, value.generationId, value.ownership, value.revision))
        return false;
    if (![value.eventId, value.correlationId].every(isNonEmptyString) || !isSha256(value.messageId) || !isSha256(value.idempotencyKey))
        return false;
    if (value.idempotencyKey !== value.messageId || !isCanonicalIsoTimestamp(value.occurredAt))
        return false;
    if (!isStrictLogicalArtifactReference(value.inputManifestPath) ||
        value.inputManifestPath !== inputManifestPath(value.subscriptionId, value.generationId)) {
        return false;
    }
    if (!isSha256(value.inputManifestDigest))
        return false;
    return value.displayMetadata === undefined || isJsonMetadata(value.displayMetadata);
};
/** Validates a diagnostic-only latest-enqueued pointer; it is never customer authority. */
export const isBillingAnalyzerInputObservationPointerV1 = (value) => {
    if (!isRecord(value) || containsForbiddenBillingArtifactControlData(value, allowedArtifactReferenceField(value, 'inputManifestPath')))
        return false;
    if (value.schemaVersion !== 1 ||
        value.documentType !== 'billing-analyzer-input-observation-pointer' ||
        value.authority !== 'diagnostic-only' ||
        value.publicationMode !== 'observe' ||
        value.inputState !== 'enqueued') {
        return false;
    }
    if (!hasMatchingIdentity(value.subscriptionId, value.generationId, value.ownership, value.revision, false))
        return false;
    return (isStrictLogicalArtifactReference(value.inputManifestPath) &&
        value.inputManifestPath === inputManifestPath(value.subscriptionId, value.generationId) &&
        isSha256(value.inputManifestDigest) &&
        isSha256(value.messageId) &&
        isNonEmptyString(value.correlationId) &&
        isCanonicalIsoTimestamp(value.enqueuedAt));
};
/** Validates an immutable analyzer output manifest and its exact input binding. */
export const isBillingAnalyzerOutputManifestV2 = (value) => {
    if (!isRecord(value) ||
        containsForbiddenBillingArtifactControlData(value, [
            ...allowedArtifactReferenceField(value, 'inputManifestPath'),
            ...allowedArtifactTraversalField(value, 'artifacts'),
            ...allowedDescriptorPaths(value.artifacts),
        ])) {
        return false;
    }
    if (value.schemaVersion !== 2 || value.status !== 'completed')
        return false;
    if (!hasMatchingIdentity(value.subscriptionId, value.generationId, value.ownership, value.revision, false))
        return false;
    if (!isStrictLogicalArtifactReference(value.inputManifestPath) ||
        value.inputManifestPath !== inputManifestPath(value.subscriptionId, value.generationId)) {
        return false;
    }
    if (!isSha256(value.inputManifestDigest) || !isSha256(value.outputBindingDigest) || !isSha256(value.manifestDigest))
        return false;
    if (!Array.isArray(value.artifacts) || value.artifacts.length === 0)
        return false;
    if (!value.artifacts.every(artifact => isOutputArtifactDescriptor(artifact, value.subscriptionId, value.generationId))) {
        return false;
    }
    if (!hasUniqueValues(value.artifacts.map(artifact => artifact.path)) || !hasUniqueValues(value.artifacts.map(artifact => artifact.name)))
        return false;
    const outputDerivedDigests = new Set([
        value.inputManifestDigest,
        value.outputBindingDigest,
        value.manifestDigest,
        ...value.artifacts.map(artifact => artifact.sha256),
    ]);
    if (value.outputBindingDigest === value.inputManifestDigest ||
        value.outputBindingDigest === value.manifestDigest ||
        value.artifacts.some(artifact => artifact.sha256 === value.outputBindingDigest || artifact.sha256 === value.manifestDigest) ||
        publicationDecisionReferencesDigest(value.publicationDecision, new Set([...outputDerivedDigests].filter(digest => digest !== value.inputManifestDigest)))) {
        return false;
    }
    if (value.artifacts.filter(artifact => artifact.name === 'metadata.json').length !== 1)
        return false;
    return (isBillingCompletedArtifactPublicationDecision(value.publicationDecision, value.generationId, value.inputManifestDigest) &&
        isCanonicalIsoTimestamp(value.completedAt));
};
/** Validates the sole promoted authority pointer for completed billing analysis. */
export const isBillingAnalysisCurrentPointerV1 = (value) => {
    if (!isRecord(value) ||
        hasDiagnosticObservationDiscriminant(value) ||
        containsForbiddenBillingArtifactControlData(value, [
            ...allowedArtifactReferenceField(value, 'inputManifestPath'),
            ...allowedArtifactReferenceField(value, 'outputManifestPath'),
        ])) {
        return false;
    }
    if (value.schemaVersion !== 1 || value.status !== 'completed')
        return false;
    if (!hasMatchingIdentity(value.subscriptionId, value.generationId, value.ownership, value.revision, true))
        return false;
    if (!isStrictLogicalArtifactReference(value.inputManifestPath) ||
        value.inputManifestPath !== inputManifestPath(value.subscriptionId, value.generationId)) {
        return false;
    }
    if (!isStrictLogicalArtifactReference(value.outputManifestPath) ||
        value.outputManifestPath !== outputManifestPath(value.subscriptionId, value.generationId)) {
        return false;
    }
    if (!isSha256(value.inputManifestDigest) || !isSha256(value.outputManifestDigest))
        return false;
    return (isBillingCompletedArtifactPublicationDecision(value.publicationDecision, value.generationId, value.inputManifestDigest) &&
        isCanonicalIsoTimestamp(value.completedAt));
};
/** Validates the latest epoch-free promoted authority pointer for completed billing analysis. */
export const isBillingAnalysisCurrentPointerV2 = (value) => {
    if (!isRecord(value) ||
        hasDiagnosticObservationDiscriminant(value) ||
        containsForbiddenBillingArtifactControlData(value, [
            ...allowedArtifactReferenceField(value, 'inputManifestPath'),
            ...allowedArtifactReferenceField(value, 'outputManifestPath'),
        ])) {
        return false;
    }
    if (value.schemaVersion !== 2 || value.status !== 'completed')
        return false;
    if (!hasEpochFreeMatchingIdentity(value.subscriptionId, value.generationId, value.ownership, value.revision))
        return false;
    if (!isStrictLogicalArtifactReference(value.inputManifestPath) ||
        value.inputManifestPath !== inputManifestPath(value.subscriptionId, value.generationId)) {
        return false;
    }
    if (!isStrictLogicalArtifactReference(value.outputManifestPath) ||
        value.outputManifestPath !== outputManifestPath(value.subscriptionId, value.generationId)) {
        return false;
    }
    if (!isSha256(value.inputManifestDigest) || !isSha256(value.outputManifestDigest))
        return false;
    return (isBillingCompletedArtifactPublicationDecision(value.publicationDecision, value.generationId, value.inputManifestDigest) &&
        isCanonicalIsoTimestamp(value.completedAt));
};
/** Validates an immutable diagnostic-only promotion evaluation. */
export const isBillingAnalysisPromotionObservationV1 = (value) => {
    if (!isRecord(value) ||
        containsForbiddenBillingArtifactControlData(value, [
            ...allowedArtifactReferenceField(value, 'inputManifestPath'),
            ...allowedArtifactReferenceField(value, 'outputManifestPath'),
        ])) {
        return false;
    }
    if (value.schemaVersion !== 1 ||
        value.documentType !== 'billing-analysis-promotion-observation' ||
        value.authority !== 'diagnostic-only' ||
        value.publicationMode !== 'observe' ||
        value.processingState !== 'succeeded') {
        return false;
    }
    if (!hasMatchingIdentity(value.subscriptionId, value.generationId, value.ownership, value.revision, false))
        return false;
    if (!isStrictLogicalArtifactReference(value.inputManifestPath) ||
        value.inputManifestPath !== inputManifestPath(value.subscriptionId, value.generationId) ||
        !isStrictLogicalArtifactReference(value.outputManifestPath) ||
        value.outputManifestPath !== outputManifestPath(value.subscriptionId, value.generationId)) {
        return false;
    }
    if (!isSha256(value.inputManifestDigest) ||
        !isSha256(value.outputManifestDigest) ||
        !isSha256(value.observationDigest) ||
        !isSha256(value.messageId) ||
        !isNonEmptyString(value.correlationId) ||
        !isCanonicalIsoTimestamp(value.observedAt) ||
        !isRecord(value.evaluation) ||
        !isStringIn(value.evaluation.comparison, OBSERVATION_COMPARISONS)) {
        return false;
    }
    const hasOwnershipEpoch = value.ownership.ownershipEpochRevision !== undefined;
    const outputDigestRelation = value.evaluation.outputDigestRelation;
    if (outputDigestRelation !== undefined && outputDigestRelation !== 'same' && outputDigestRelation !== 'different')
        return false;
    if (!hasOwnershipEpoch) {
        return (outputDigestRelation === undefined && value.evaluation.comparison === 'unenforceable' && value.evaluation.projectedOutcome === 'not-enforceable');
    }
    if (value.evaluation.comparison === 'equal') {
        return outputDigestRelation === 'different'
            ? value.evaluation.projectedOutcome === 'would-quarantine'
            : value.evaluation.projectedOutcome === 'would-be-idempotent';
    }
    return (outputDigestRelation === undefined &&
        value.evaluation.comparison !== 'unenforceable' &&
        OBSERVATION_PROJECTED_OUTCOMES.get(value.evaluation.comparison) === value.evaluation.projectedOutcome);
};
