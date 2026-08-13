import {
  isArtifactOwnershipBinding,
  isArtifactPublicationDecision,
  isEnforceableArtifactOwnershipBinding,
  type ArtifactCoverageVerdict,
  type ArtifactOwnershipBinding,
  type ArtifactPublicationDecision,
  type ArtifactRevisionVector,
} from '../common/artifactEvidence.js';
import type { ArtifactDescriptor } from '../common/artifactGeneration.js';
import type { BillingAnalyzerMetadata } from './billingGeneration.js';

type BillingArtifactBasis = 'actual' | 'amortized';

interface BillingAnalyzerRequestedPeriod {
  fromInclusive: string;
  throughExclusive: string;
  dateBasis: 'utc' | 'billing-calendar' | 'company-local';
  timeZone?: string;
  basis: BillingArtifactBasis;
}

interface BillingAnalyzerInputObjectDescriptor {
  path: string;
  versionId?: string;
  etag: string;
  sha256: string;
  byteCount: number;
  rowCount: number;
  basis: BillingArtifactBasis;
  currencyCode?: string;
  coverage: ArtifactCoverageVerdict;
}

interface BillingAnalyzerOutputArtifactDescriptor extends ArtifactDescriptor {
  path: string;
}

interface BillingGenerationDocumentV2 {
  schemaVersion: 2;
  status: 'completed';
  subscriptionId: string;
  generationId: string;
  ownership: ArtifactOwnershipBinding<'azure'>;
  revision: ArtifactRevisionVector;
}

export interface BillingAnalyzerInputManifestV2 extends BillingGenerationDocumentV2 {
  publicationKey: string;
  coveragePlanDigest: string;
  asOfUtc: string;
  stableCutoffUtc: string;
  requestedPeriods: [BillingAnalyzerRequestedPeriod, ...BillingAnalyzerRequestedPeriod[]];
  inputs: [BillingAnalyzerInputObjectDescriptor, ...BillingAnalyzerInputObjectDescriptor[]];
  manifestDigest: string;
  completedAt: string;
}

export interface BillingAnalyzerInputCurrentPointerV1 {
  schemaVersion: 1;
  status: 'completed';
  subscriptionId: string;
  generationId: string;
  ownership: ArtifactOwnershipBinding<'azure'> & { ownershipEpochRevision: number };
  revision: ArtifactRevisionVector & { ownershipEpochRevision: number };
  manifestPath: string;
  manifestDigest: string;
  completedAt: string;
}

export interface BillingAnalyzerRequestV2 {
  schemaVersion: 2;
  eventId: string;
  messageId: string;
  correlationId: string;
  occurredAt: string;
  idempotencyKey: string;
  publicationMode: 'observe' | 'enforce';
  subscriptionId: string;
  generationId: string;
  ownership: ArtifactOwnershipBinding<'azure'>;
  revision: ArtifactRevisionVector;
  inputManifestPath: string;
  inputManifestDigest: string;
  displayMetadata?: BillingAnalyzerMetadata;
}

export interface BillingAnalyzerOutputManifestV2 extends BillingGenerationDocumentV2 {
  inputManifestPath: string;
  inputManifestDigest: string;
  artifacts: [BillingAnalyzerOutputArtifactDescriptor, ...BillingAnalyzerOutputArtifactDescriptor[]];
  publicationDecision: ArtifactPublicationDecision;
  manifestDigest: string;
  completedAt: string;
}

type CompletedArtifactPublicationDecision = Extract<ArtifactPublicationDecision, { publication: 'completed' }>;

export interface BillingAnalysisCurrentPointerV1 {
  schemaVersion: 1;
  status: 'completed';
  subscriptionId: string;
  generationId: string;
  ownership: ArtifactOwnershipBinding<'azure'> & { ownershipEpochRevision: number };
  revision: ArtifactRevisionVector & { ownershipEpochRevision: number };
  inputManifestPath: string;
  inputManifestDigest: string;
  outputManifestPath: string;
  outputManifestDigest: string;
  publicationDecision: CompletedArtifactPublicationDecision;
  completedAt: string;
}

const BILLING_BASES = new Set<string>(['actual', 'amortized']);
const COVERAGE_VERDICTS = new Set<string>(['complete', 'partial', 'none', 'unknown']);
const DATE_BASES = new Set<string>(['utc', 'billing-calendar', 'company-local']);
const CONTENT_ENCODINGS = new Set<string>(['identity', 'gzip']);
const FORBIDDEN_CREDENTIAL_FIELD =
  /credential|password|secret|token|connectionstring|accountkey|accesskey|apikey|authorization|sharedaccesssignature|clientsecret/i;
const PHYSICAL_REFERENCE_FIELD =
  /^(?:path|url|uri|artifactpath|manifestpath|inputmanifestpath|outputmanifestpath|storagepath|blobpath|containerpath|physicalpath|sourcepath|storageurl|bloburl|containerurl|physicalurl|sourceurl|storageuri|bloburi|containeruri|physicaluri|sourceuri)$/i;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim() === value && value.length > 0;
const isPositiveInteger = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) > 0;
const isNonNegativeInteger = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0;
const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isStringIn = (value: unknown, values: Set<string>): value is string => typeof value === 'string' && values.has(value);
const hasUniqueValues = (values: string[]): boolean => new Set(values).size === values.length;

const isCanonicalIsoTimestamp = (value: unknown): value is string => {
  if (!isNonEmptyString(value)) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
};

const hasControlCharacters = (value: string): boolean =>
  Array.from(value).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);

interface AllowedReferenceField {
  object: Record<string, unknown>;
  key: string;
}

const isPhysicalReferenceValue = (value: string): boolean =>
  value.includes('://') || value.startsWith('//') || value.startsWith('\\\\') || /^[A-Za-z]:[\\/]/.test(value);

const containsForbiddenControlData = (value: unknown, allowedReferenceFields: AllowedReferenceField[] = []): boolean => {
  if (typeof value === 'string') return isPhysicalReferenceValue(value);
  if (Array.isArray(value)) return value.some(child => containsForbiddenControlData(child, allowedReferenceFields));
  if (!isRecord(value)) return false;
  return Object.entries(value).some(([key, child]) => {
    if (FORBIDDEN_CREDENTIAL_FIELD.test(key)) return true;
    const referenceAllowed = allowedReferenceFields.some(field => field.object === value && field.key === key);
    if (PHYSICAL_REFERENCE_FIELD.test(key) && !referenceAllowed) return true;
    return containsForbiddenControlData(child, allowedReferenceFields);
  });
};

const allowedReferenceField = (object: unknown, key: string): AllowedReferenceField[] => (isRecord(object) ? [{ object, key }] : []);

const allowedDescriptorPaths = (descriptors: unknown): AllowedReferenceField[] =>
  Array.isArray(descriptors) ? descriptors.flatMap(descriptor => allowedReferenceField(descriptor, 'path')) : [];

const isLogicalPath = (value: unknown): value is string => {
  if (!isNonEmptyString(value) || value.startsWith('/') || value.includes('://') || value.includes('?') || value.includes('#')) return false;
  if (value.includes('\\') || value.includes('%') || hasControlCharacters(value)) return false;
  const segments = value.split('/');
  return segments.length >= 2 && segments.every(segment => segment.length > 0 && segment !== '.' && segment !== '..');
};

const isPathSegment = (value: unknown): value is string =>
  isNonEmptyString(value) && !/[\\/?#%]/.test(value) && !hasControlCharacters(value) && value !== '.' && value !== '..';

const inputGenerationPrefix = (subscriptionId: string, generationId: string): string =>
  `subscriptions/${subscriptionId}/history/billing/analyzer-inputs/generations/${generationId}/`;

const inputManifestPath = (subscriptionId: string, generationId: string): string =>
  `${inputGenerationPrefix(subscriptionId, generationId)}manifest.json`;

const outputGenerationPrefix = (subscriptionId: string, generationId: string): string =>
  `subscriptions/${subscriptionId}/billing/generations/${generationId}/`;

const outputManifestPath = (subscriptionId: string, generationId: string): string =>
  `${outputGenerationPrefix(subscriptionId, generationId)}manifest.json`;

const isGenerationPath = (value: unknown, prefix: string, forbiddenExactPath?: string): value is string =>
  isLogicalPath(value) && value.startsWith(prefix) && value.length > prefix.length && value !== forbiddenExactPath;

const isRevisionVector = (value: unknown): value is ArtifactRevisionVector =>
  isRecord(value) &&
  isPositiveInteger(value.sourceRevision) &&
  isPositiveInteger(value.policyRevision) &&
  (value.ownershipEpochRevision === undefined || isPositiveInteger(value.ownershipEpochRevision));

const hasMatchingIdentity = (
  subscriptionId: unknown,
  generationId: unknown,
  ownership: unknown,
  revision: unknown,
  enforceable: boolean
): boolean => {
  if (!isPathSegment(subscriptionId) || !isPathSegment(generationId) || !isArtifactOwnershipBinding(ownership) || !isRevisionVector(revision)) {
    return false;
  }
  if (ownership.provider !== 'azure' || ownership.accountId !== subscriptionId) return false;
  if (ownership.ownershipEpochRevision !== revision.ownershipEpochRevision) return false;
  return !enforceable || isEnforceableArtifactOwnershipBinding(ownership);
};

const isSha256 = (value: unknown): value is string => typeof value === 'string' && SHA256_PATTERN.test(value);

const isRequestedPeriod = (value: unknown): value is BillingAnalyzerRequestedPeriod => {
  if (
    !isRecord(value) ||
    !isCanonicalIsoTimestamp(value.fromInclusive) ||
    !isCanonicalIsoTimestamp(value.throughExclusive) ||
    Date.parse(value.throughExclusive) <= Date.parse(value.fromInclusive) ||
    !isStringIn(value.dateBasis, DATE_BASES) ||
    !isStringIn(value.basis, BILLING_BASES)
  ) {
    return false;
  }
  return value.timeZone === undefined || isNonEmptyString(value.timeZone);
};

const isInputObjectDescriptor = (value: unknown, subscriptionId: string, generationId: string): value is BillingAnalyzerInputObjectDescriptor => {
  if (!isRecord(value)) return false;
  const prefix = inputGenerationPrefix(subscriptionId, generationId);
  return (
    isGenerationPath(value.path, prefix, inputManifestPath(subscriptionId, generationId)) &&
    (value.versionId === undefined || isNonEmptyString(value.versionId)) &&
    isNonEmptyString(value.etag) &&
    isSha256(value.sha256) &&
    isPositiveInteger(value.byteCount) &&
    isNonNegativeInteger(value.rowCount) &&
    isStringIn(value.basis, BILLING_BASES) &&
    (value.currencyCode === undefined || isNonEmptyString(value.currencyCode)) &&
    isStringIn(value.coverage, COVERAGE_VERDICTS)
  );
};

const isOutputArtifactDescriptor = (
  value: unknown,
  subscriptionId: string,
  generationId: string
): value is BillingAnalyzerOutputArtifactDescriptor => {
  if (!isRecord(value)) return false;
  const prefix = outputGenerationPrefix(subscriptionId, generationId);
  return (
    isGenerationPath(value.path, prefix, outputManifestPath(subscriptionId, generationId)) &&
    isNonEmptyString(value.name) &&
    value.mediaType === 'application/json' &&
    isStringIn(value.contentEncoding, CONTENT_ENCODINGS) &&
    isNonNegativeInteger(value.byteLength) &&
    isSha256(value.sha256)
  );
};

const isJsonMetadata = (value: unknown): value is BillingAnalyzerMetadata => {
  if (!isRecord(value)) return false;
  const visit = (candidate: unknown): boolean => {
    if (candidate === null || typeof candidate === 'string' || typeof candidate === 'boolean') return true;
    if (isFiniteNumber(candidate)) return true;
    if (Array.isArray(candidate)) return candidate.every(visit);
    return isRecord(candidate) && Object.getPrototypeOf(candidate) === Object.prototype && Object.values(candidate).every(visit);
  };
  return visit(value);
};

/** Validates one immutable billing analyzer input manifest without performing I/O. */
export const isBillingAnalyzerInputManifestV2 = (value: unknown): value is BillingAnalyzerInputManifestV2 => {
  if (!isRecord(value) || containsForbiddenControlData(value, allowedDescriptorPaths(value.inputs))) return false;
  if (value.schemaVersion !== 2 || value.status !== 'completed') return false;
  if (!hasMatchingIdentity(value.subscriptionId, value.generationId, value.ownership, value.revision, false)) return false;
  if (!isNonEmptyString(value.publicationKey) || !isSha256(value.coveragePlanDigest) || !isSha256(value.manifestDigest)) return false;
  if (!isCanonicalIsoTimestamp(value.asOfUtc) || !isCanonicalIsoTimestamp(value.stableCutoffUtc) || !isCanonicalIsoTimestamp(value.completedAt)) {
    return false;
  }
  if (Date.parse(value.stableCutoffUtc) > Date.parse(value.asOfUtc) || Date.parse(value.completedAt) < Date.parse(value.asOfUtc)) return false;
  if (!Array.isArray(value.requestedPeriods) || value.requestedPeriods.length === 0 || !value.requestedPeriods.every(isRequestedPeriod)) return false;
  const periodKeys = value.requestedPeriods.map(
    period => `${period.fromInclusive}\n${period.throughExclusive}\n${period.dateBasis}\n${period.timeZone ?? ''}\n${period.basis}`
  );
  if (!hasUniqueValues(periodKeys)) return false;
  if (!Array.isArray(value.inputs) || value.inputs.length === 0) return false;
  if (!value.inputs.every(input => isInputObjectDescriptor(input, value.subscriptionId as string, value.generationId as string))) return false;
  return hasUniqueValues(value.inputs.map(input => input.path));
};

/** Validates the enforceable current pointer for one published analyzer input generation. */
export const isBillingAnalyzerInputCurrentPointerV1 = (value: unknown): value is BillingAnalyzerInputCurrentPointerV1 => {
  if (!isRecord(value) || containsForbiddenControlData(value, allowedReferenceField(value, 'manifestPath'))) return false;
  if (value.schemaVersion !== 1 || value.status !== 'completed') return false;
  if (!hasMatchingIdentity(value.subscriptionId, value.generationId, value.ownership, value.revision, true)) return false;
  return (
    isLogicalPath(value.manifestPath) &&
    value.manifestPath === inputManifestPath(value.subscriptionId as string, value.generationId as string) &&
    isSha256(value.manifestDigest) &&
    isCanonicalIsoTimestamp(value.completedAt)
  );
};

/** Validates the V2 queue envelope and its immutable input-manifest binding. */
export const isBillingAnalyzerRequestV2 = (value: unknown): value is BillingAnalyzerRequestV2 => {
  if (!isRecord(value) || containsForbiddenControlData(value, allowedReferenceField(value, 'inputManifestPath'))) return false;
  if (value.schemaVersion !== 2 || (value.publicationMode !== 'observe' && value.publicationMode !== 'enforce')) return false;
  const enforceable = value.publicationMode === 'enforce';
  if (!hasMatchingIdentity(value.subscriptionId, value.generationId, value.ownership, value.revision, enforceable)) return false;
  if (![value.eventId, value.correlationId].every(isNonEmptyString) || !isSha256(value.messageId) || !isSha256(value.idempotencyKey)) return false;
  if (value.idempotencyKey !== value.messageId || !isCanonicalIsoTimestamp(value.occurredAt)) return false;
  if (
    !isLogicalPath(value.inputManifestPath) ||
    value.inputManifestPath !== inputManifestPath(value.subscriptionId as string, value.generationId as string)
  ) {
    return false;
  }
  if (!isSha256(value.inputManifestDigest)) return false;
  return value.displayMetadata === undefined || isJsonMetadata(value.displayMetadata);
};

/** Validates an immutable analyzer output manifest and its exact input binding. */
export const isBillingAnalyzerOutputManifestV2 = (value: unknown): value is BillingAnalyzerOutputManifestV2 => {
  if (
    !isRecord(value) ||
    containsForbiddenControlData(value, [...allowedReferenceField(value, 'inputManifestPath'), ...allowedDescriptorPaths(value.artifacts)])
  ) {
    return false;
  }
  if (value.schemaVersion !== 2 || value.status !== 'completed') return false;
  if (!hasMatchingIdentity(value.subscriptionId, value.generationId, value.ownership, value.revision, false)) return false;
  if (
    !isLogicalPath(value.inputManifestPath) ||
    value.inputManifestPath !== inputManifestPath(value.subscriptionId as string, value.generationId as string)
  ) {
    return false;
  }
  if (!isSha256(value.inputManifestDigest) || !isSha256(value.manifestDigest)) return false;
  if (!Array.isArray(value.artifacts) || value.artifacts.length === 0) return false;
  if (!value.artifacts.every(artifact => isOutputArtifactDescriptor(artifact, value.subscriptionId as string, value.generationId as string))) {
    return false;
  }
  if (!hasUniqueValues(value.artifacts.map(artifact => artifact.path)) || !hasUniqueValues(value.artifacts.map(artifact => artifact.name)))
    return false;
  if (
    !value.artifacts.some(
      artifact => artifact.path === `${outputGenerationPrefix(value.subscriptionId as string, value.generationId as string)}metadata.json`
    )
  ) {
    return false;
  }
  return isArtifactPublicationDecision(value.publicationDecision) && isCanonicalIsoTimestamp(value.completedAt);
};

/** Validates the sole promoted authority pointer for completed billing analysis. */
export const isBillingAnalysisCurrentPointerV1 = (value: unknown): value is BillingAnalysisCurrentPointerV1 => {
  if (
    !isRecord(value) ||
    containsForbiddenControlData(value, [...allowedReferenceField(value, 'inputManifestPath'), ...allowedReferenceField(value, 'outputManifestPath')])
  ) {
    return false;
  }
  if (value.schemaVersion !== 1 || value.status !== 'completed') return false;
  if (!hasMatchingIdentity(value.subscriptionId, value.generationId, value.ownership, value.revision, true)) return false;
  if (
    !isLogicalPath(value.inputManifestPath) ||
    value.inputManifestPath !== inputManifestPath(value.subscriptionId as string, value.generationId as string)
  ) {
    return false;
  }
  if (
    !isLogicalPath(value.outputManifestPath) ||
    value.outputManifestPath !== outputManifestPath(value.subscriptionId as string, value.generationId as string)
  ) {
    return false;
  }
  if (!isSha256(value.inputManifestDigest) || !isSha256(value.outputManifestDigest)) return false;
  return (
    isArtifactPublicationDecision(value.publicationDecision) &&
    value.publicationDecision.publication === 'completed' &&
    isCanonicalIsoTimestamp(value.completedAt)
  );
};
