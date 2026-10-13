import type { ArtifactAccountBinding, ArtifactGeneration } from './artifactGeneration.js';
import type { ResourceAttributes } from './resourceIdentity.js';
import { isKebabIdentifier, isResourceAttributes } from './resourceIdentity.js';
import { encodeArtifactRunReferenceV1, isRawArtifactRunIdV1 } from '../azure/artifactRunReference.js';
import {
  asArray,
  asRecord,
  assertExactKeys,
  assertPlainJson,
  assertUnique,
  assertValue,
  isoTimestamp,
  nonNegativeInteger,
  requiredEnum,
  requiredString,
  type JsonRecord,
} from './validationHelpers.js';

export const RESOURCE_ARTIFACT_USAGE_SCHEMA_VERSION = 1 as const;
export const RESOURCE_ARTIFACT_USAGE_MAX_ROWS = 200 as const;
export const RESOURCE_ARTIFACT_USAGE_MAX_DECODED_BYTES = 2097152 as const;
export const RESOURCE_ARTIFACT_ID_PATTERN = /^artifact:[a-f0-9]{64}$/;
export const RESOURCE_ARTIFACT_USAGE_RESOLUTION_STATES = [
  'configured-tag-resolved',
  'configured-digest',
  'unresolved',
  'changed-during-collection',
  'unsupported',
  'unavailable',
] as const;
export type ResourceArtifactUsageResolutionState = (typeof RESOURCE_ARTIFACT_USAGE_RESOLUTION_STATES)[number];
export type ResourceArtifactCompleteness = 'complete' | 'partial' | 'unavailable' | 'unsupported' | 'stale';
export type ResourceArtifactDetailSection = 'summary' | 'findings' | 'usages';
export type ResourceArtifactSourceStatus = 'available' | 'partial' | 'unavailable' | 'unsupported' | 'stale' | 'restricted';

/** Every persisted document binds the authorized company and immutable generation. */
export interface ResourceArtifactUsageBinding extends ArtifactAccountBinding {
  schemaVersion: typeof RESOURCE_ARTIFACT_USAGE_SCHEMA_VERSION;
  companyId: string;
  artifactGeneration: ArtifactGeneration;
}

/** Independent collection sources; one successful source does not complete another. */
export interface ResourceArtifactSourceCoverage {
  sourceId: string;
  scope: { resourceIds?: string[]; workloadClasses?: string[] };
  status: ResourceArtifactSourceStatus;
  reason?: string;
  observedAt: string;
  lastSuccessfulAt?: string;
  supportedWorkloadClasses: string[];
  collectedWorkloadClasses: string[];
  limits?: { maxItems?: number; maxRequests?: number; maxBytes?: number; truncated?: boolean };
}

/** SHA-256 and byteLength describe UTF-8 JSON.stringify(parsedBody), before gzip. */
export interface ResourceArtifactFileDescriptor {
  path: string;
  byteLength: number;
  sha256: string;
}
export interface ResourceArtifactUsageFile extends ResourceArtifactFileDescriptor {
  role: 'graph' | 'index' | ResourceArtifactDetailSection;
  artifactId?: string;
  page?: number;
}
export interface ResourceArtifactUsageManifest extends ResourceArtifactUsageBinding {
  baseRelationshipSnapshotId: string;
  sourceCoverage: ResourceArtifactSourceCoverage[];
  expiresAt: string;
  paging: { maxRows: typeof RESOURCE_ARTIFACT_USAGE_MAX_ROWS; maxDecodedBytes: typeof RESOURCE_ARTIFACT_USAGE_MAX_DECODED_BYTES };
  files: ResourceArtifactUsageFile[];
}
export interface ResourceArtifactUsagePointer extends ResourceArtifactUsageBinding {
  manifest: ResourceArtifactFileDescriptor;
  completedAt: string;
}
export interface ResourceArtifactAlias {
  name: string;
  observedAt: string;
}
export type ResourceArtifactSecuritySummary =
  | {
      status: 'available' | 'partial' | 'stale';
      packageFindingCount?: number;
      cveCount?: number;
      severityCounts?: Record<string, number>;
      observedAt?: string;
    }
  | { status: 'unavailable' | 'restricted'; packageFindingCount?: never; cveCount?: never; severityCounts?: never; observedAt?: never };
export interface ResourceArtifactSummary {
  id: string;
  /** Open provider-neutral kebab-case identifier. */
  artifactKind: string;
  name: string;
  displayName?: string;
  ownerResourceId: string;
  region: string;
  attributes: ResourceAttributes;
  aliases: ResourceArtifactAlias[];
  /** Explicit index-to-child membership; it never implies a known workload platform. */
  childArtifactIds?: string[];
  usageCount?: number;
  usageCompleteness: ResourceArtifactCompleteness;
  sourceCoverage: ResourceArtifactSourceCoverage[];
  security: ResourceArtifactSecuritySummary;
}
export interface ResourceArtifactFinding {
  id: string;
  providerFindingId: string;
  sourceId: string;
  /** Provider status remains an open value; consumers must preserve unknown states. */
  status: string;
  softwareName: string;
  detectedVersions: string[];
  fixedVersion?: string;
  cves: Array<{ id: string; severity: string; fixStatus?: string; fixedVersion?: string }>;
  observedAt: string;
  evaluatedAt?: string;
}
/** Configured references do not constitute runtime digest observations. */
export interface ResourceArtifactUsageEvidence {
  id: string;
  sourceId: string;
  resourceId: string;
  resourceName: string;
  parentResourceId?: string;
  reference: string;
  tag?: string;
  digest?: string;
  observedAt: string;
  resolvedAt?: string;
  resolutionState: ResourceArtifactUsageResolutionState;
  runtimeDigestObserved: false;
  /** Diagnostic observations only, never an exact image association. */
  previousDigest?: string;
  currentDigest?: string;
}
export interface ResourceArtifactUsageIndex extends ResourceArtifactUsageBinding {
  baseRelationshipSnapshotId: string;
  artifacts: ResourceArtifactSummary[];
  /** Authoritative resource-to-artifact joins, scoped to this generation. */
  resourceArtifacts: Record<string, string[]>;
}
interface ResourceArtifactDetailPageBase extends ResourceArtifactUsageBinding {
  artifactId: string;
  page: number;
  /** Observed count in this section, labeled by completeness. */
  count?: number;
  completeness: ResourceArtifactCompleteness | 'restricted';
  /** Numeric declared page, never a storage path or external URL. */
  nextPage?: number;
}
export type ResourceArtifactDetailPage = ResourceArtifactDetailPageBase &
  (
    | { section: 'summary'; rows: ResourceArtifactSummary[] }
    | { section: 'findings'; rows: ResourceArtifactFinding[] }
    | { section: 'usages'; rows: ResourceArtifactUsageEvidence[] }
  );
export type ResourceArtifactUsageExpectedBinding = Partial<ResourceArtifactUsageBinding> & { baseRelationshipSnapshotId?: string };
export type ResourceArtifactDetailExpectedBinding = ResourceArtifactUsageExpectedBinding & {
  artifactId?: string;
  section?: ResourceArtifactDetailSection;
  page?: number;
};

/** Reuses the existing injective safe run encoder; producer owns the remainder. */
export const resourceArtifactUsageRunPrefix = (runId: string): string => `runs/${encodeArtifactRunReferenceV1(runId)}/artifact-usage`;
export const isResourceArtifactId = (value: unknown): value is string => typeof value === 'string' && RESOURCE_ARTIFACT_ID_PATTERN.test(value);

const COMPLETENESS = ['complete', 'partial', 'unavailable', 'unsupported', 'stale'] as const;
const SOURCE_STATUSES = ['available', 'partial', 'unavailable', 'unsupported', 'stale', 'restricted'] as const;
const DETAIL_SECTIONS = ['summary', 'findings', 'usages'] as const;
const BINDING_KEYS = ['schemaVersion', 'companyId', 'provider', 'accountId', 'artifactGeneration'];
const id = (value: unknown, field: string): string => {
  const result = requiredString(value, field);
  if (!isResourceArtifactId(result)) throw new Error(`${field} must be artifact: followed by 64 lowercase hexadecimal characters.`);
  return result;
};
const identifier = (value: unknown, field: string): string => {
  const result = requiredString(value, field);
  if (!isKebabIdentifier(result)) throw new Error(`${field} must be an open kebab-case identifier.`);
  return result;
};
const strings = (value: unknown, field: string): string[] => asArray(value, field).map((item, index) => requiredString(item, `${field}[${index}]`));
const optionalString = (record: JsonRecord, key: string, field: string): void => {
  if (record[key] !== undefined) requiredString(record[key], `${field}.${key}`);
};
const optionalDate = (record: JsonRecord, key: string, field: string): void => {
  if (record[key] !== undefined) isoTimestamp(record[key], `${field}.${key}`);
};
const optionalCount = (record: JsonRecord, key: string, field: string): void => {
  if (record[key] !== undefined) nonNegativeInteger(record[key], `${field}.${key}`);
};
const digest = (value: unknown, field: string): void => {
  if (typeof value !== 'string' || !/^sha256:[a-f0-9]{64}$/.test(value)) throw new Error(`${field} must be a lowercase SHA-256 manifest digest.`);
};
const checkBinding = (record: JsonRecord, expected?: ResourceArtifactUsageExpectedBinding): void => {
  assertValue(record.schemaVersion, RESOURCE_ARTIFACT_USAGE_SCHEMA_VERSION, 'schemaVersion');
  requiredString(record.companyId, 'companyId');
  requiredEnum(record.provider, ['azure', 'aws'], 'provider');
  requiredString(record.accountId, 'accountId');
  const generation = asRecord(record.artifactGeneration, 'artifactGeneration');
  assertExactKeys(generation, ['runId', 'generatedAt'], 'artifactGeneration');
  if (!isRawArtifactRunIdV1(generation.runId)) throw new Error('artifactGeneration.runId must be a bounded valid raw run ID.');
  isoTimestamp(generation.generatedAt, 'artifactGeneration.generatedAt');
  for (const key of ['schemaVersion', 'companyId', 'provider', 'accountId', 'baseRelationshipSnapshotId'] as const) {
    if (expected?.[key] !== undefined) assertValue(record[key], expected[key], key);
  }
  if (expected?.artifactGeneration) {
    assertValue(generation.runId, expected.artifactGeneration.runId, 'artifactGeneration.runId');
    assertValue(generation.generatedAt, expected.artifactGeneration.generatedAt, 'artifactGeneration.generatedAt');
  }
};
const checkCoverage = (value: unknown, field: string): void => {
  const record = asRecord(value, field);
  assertExactKeys(
    record,
    ['sourceId', 'scope', 'status', 'reason', 'observedAt', 'lastSuccessfulAt', 'supportedWorkloadClasses', 'collectedWorkloadClasses', 'limits'],
    field
  );
  identifier(record.sourceId, `${field}.sourceId`);
  const scope = asRecord(record.scope, `${field}.scope`);
  assertExactKeys(scope, ['resourceIds', 'workloadClasses'], `${field}.scope`);
  for (const key of ['resourceIds', 'workloadClasses'])
    if (scope[key] !== undefined) assertUnique(strings(scope[key], `${field}.scope.${key}`), `${field}.scope.${key}`);
  const status = requiredEnum(record.status, SOURCE_STATUSES, `${field}.status`);
  isoTimestamp(record.observedAt, `${field}.observedAt`);
  optionalDate(record, 'lastSuccessfulAt', field);
  if (status === 'available') {
    isoTimestamp(record.lastSuccessfulAt, `${field}.lastSuccessfulAt`);
    if (record.reason !== undefined) throw new Error(`${field}.reason is absent for an available source.`);
  } else requiredString(record.reason, `${field}.reason`);
  const supported = strings(record.supportedWorkloadClasses, `${field}.supportedWorkloadClasses`);
  const collected = strings(record.collectedWorkloadClasses, `${field}.collectedWorkloadClasses`);
  assertUnique(supported, `${field}.supportedWorkloadClasses`);
  assertUnique(collected, `${field}.collectedWorkloadClasses`);
  if (collected.some(item => !supported.includes(item))) throw new Error(`${field}.collectedWorkloadClasses must be supported.`);
  if (record.limits !== undefined) {
    const limits = asRecord(record.limits, `${field}.limits`);
    assertExactKeys(limits, ['maxItems', 'maxRequests', 'maxBytes', 'truncated'], `${field}.limits`);
    for (const key of ['maxItems', 'maxRequests', 'maxBytes']) optionalCount(limits, key, `${field}.limits`);
    if (limits.truncated !== undefined && typeof limits.truncated !== 'boolean') throw new Error(`${field}.limits.truncated must be boolean.`);
    if (limits.truncated === true && status === 'available') throw new Error(`${field} cannot mark a truncated source available.`);
  }
};
const coverages = (value: unknown, field: string): void => {
  const rows = asArray(value, field);
  rows.forEach((row, index) => checkCoverage(row, `${field}[${index}]`));
  assertUnique(
    rows.map(row => String(asRecord(row, field).sourceId)),
    `${field}.sourceIds`
  );
};
const checkSummary = (value: unknown, field: string): void => {
  const record = asRecord(value, field);
  assertExactKeys(
    record,
    [
      'id',
      'artifactKind',
      'name',
      'displayName',
      'ownerResourceId',
      'region',
      'attributes',
      'aliases',
      'childArtifactIds',
      'usageCount',
      'usageCompleteness',
      'sourceCoverage',
      'security',
    ],
    field
  );
  id(record.id, `${field}.id`);
  identifier(record.artifactKind, `${field}.artifactKind`);
  for (const key of ['name', 'ownerResourceId', 'region']) requiredString(record[key], `${field}.${key}`);
  optionalString(record, 'displayName', field);
  if (!isResourceAttributes(record.attributes)) throw new Error(`${field}.attributes must contain flat provider-neutral attributes.`);
  const attributes = asRecord(record.attributes, `${field}.attributes`);
  for (const key of ['registryHost', 'repository']) optionalString(attributes, key, `${field}.attributes`);
  if (attributes.registryHost !== undefined && !/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(String(attributes.registryHost)))
    throw new Error(`${field}.attributes.registryHost must be a host without credentials, scheme or path.`);
  if (attributes.digest !== undefined) digest(attributes.digest, `${field}.attributes.digest`);
  asArray(record.aliases, `${field}.aliases`).forEach((alias, index) => {
    const item = asRecord(alias, `${field}.aliases[${index}]`);
    assertExactKeys(item, ['name', 'observedAt'], `${field}.aliases[${index}]`);
    requiredString(item.name, `${field}.aliases[${index}].name`);
    isoTimestamp(item.observedAt, `${field}.aliases[${index}].observedAt`);
  });
  if (record.childArtifactIds !== undefined) {
    const children = asArray(record.childArtifactIds, `${field}.childArtifactIds`).map(child => id(child, `${field}.childArtifactIds`));
    assertUnique(children, `${field}.childArtifactIds`);
    if (children.includes(String(record.id))) throw new Error(`${field} cannot be its own child artifact.`);
  }
  const completeness = requiredEnum(record.usageCompleteness, COMPLETENESS, `${field}.usageCompleteness`);
  optionalCount(record, 'usageCount', field);
  if (['unavailable', 'unsupported'].includes(completeness) && record.usageCount !== undefined)
    throw new Error(`${field}.usageCount requires observed evidence.`);
  coverages(record.sourceCoverage, `${field}.sourceCoverage`);
  const security = asRecord(record.security, `${field}.security`);
  const status = requiredEnum(security.status, ['available', 'partial', 'unavailable', 'restricted', 'stale'], `${field}.security.status`);
  if (status === 'restricted' || status === 'unavailable') {
    assertExactKeys(security, ['status'], `${field}.security`);
  } else {
    assertExactKeys(security, ['status', 'packageFindingCount', 'cveCount', 'severityCounts', 'observedAt'], `${field}.security`);
    optionalCount(security, 'packageFindingCount', `${field}.security`);
    optionalCount(security, 'cveCount', `${field}.security`);
    optionalDate(security, 'observedAt', `${field}.security`);
    if (security.severityCounts !== undefined) {
      const counts = asRecord(security.severityCounts, `${field}.security.severityCounts`);
      for (const [key, count] of Object.entries(counts)) {
        requiredString(key, `${field}.security.severityCounts.key`);
        nonNegativeInteger(count, `${field}.security.severityCounts.${key}`);
      }
    }
  }
};
const checkFinding = (value: unknown, field: string): void => {
  const record = asRecord(value, field);
  assertExactKeys(
    record,
    ['id', 'providerFindingId', 'sourceId', 'status', 'softwareName', 'detectedVersions', 'fixedVersion', 'cves', 'observedAt', 'evaluatedAt'],
    field
  );
  for (const key of ['id', 'providerFindingId', 'status', 'softwareName']) requiredString(record[key], `${field}.${key}`);
  identifier(record.sourceId, `${field}.sourceId`);
  strings(record.detectedVersions, `${field}.detectedVersions`);
  optionalString(record, 'fixedVersion', field);
  isoTimestamp(record.observedAt, `${field}.observedAt`);
  optionalDate(record, 'evaluatedAt', field);
  const cves = asArray(record.cves, `${field}.cves`);
  cves.forEach((cve, index) => {
    const item = asRecord(cve, `${field}.cves[${index}]`);
    assertExactKeys(item, ['id', 'severity', 'fixStatus', 'fixedVersion'], `${field}.cves[${index}]`);
    requiredString(item.id, `${field}.cves[${index}].id`);
    requiredString(item.severity, `${field}.cves[${index}].severity`);
    optionalString(item, 'fixStatus', `${field}.cves[${index}]`);
    optionalString(item, 'fixedVersion', `${field}.cves[${index}]`);
  });
  assertUnique(
    cves.map(cve => String(asRecord(cve, field).id)),
    `${field}.cves`
  );
};
const checkUsage = (value: unknown, field: string): void => {
  const record = asRecord(value, field);
  assertExactKeys(
    record,
    [
      'id',
      'sourceId',
      'resourceId',
      'resourceName',
      'parentResourceId',
      'reference',
      'tag',
      'digest',
      'observedAt',
      'resolvedAt',
      'resolutionState',
      'runtimeDigestObserved',
      'previousDigest',
      'currentDigest',
    ],
    field
  );
  for (const key of ['id', 'resourceId', 'resourceName', 'reference']) requiredString(record[key], `${field}.${key}`);
  identifier(record.sourceId, `${field}.sourceId`);
  for (const key of ['parentResourceId', 'tag']) optionalString(record, key, field);
  for (const key of ['digest', 'previousDigest', 'currentDigest']) if (record[key] !== undefined) digest(record[key], `${field}.${key}`);
  isoTimestamp(record.observedAt, `${field}.observedAt`);
  optionalDate(record, 'resolvedAt', field);
  assertValue(record.runtimeDigestObserved, false, `${field}.runtimeDigestObserved`);
  const state = requiredEnum(record.resolutionState, RESOURCE_ARTIFACT_USAGE_RESOLUTION_STATES, `${field}.resolutionState`);
  if (state === 'configured-tag-resolved') {
    requiredString(record.tag, `${field}.tag`);
    digest(record.digest, `${field}.digest`);
    isoTimestamp(record.resolvedAt, `${field}.resolvedAt`);
  } else if (state === 'configured-digest') {
    digest(record.digest, `${field}.digest`);
    if (record.tag !== undefined) throw new Error(`${field}.tag is absent for configured-digest evidence.`);
  } else if (record.digest !== undefined || record.resolvedAt !== undefined)
    throw new Error(`${field} cannot attach an exact digest for ${state} evidence.`);
  if (state !== 'changed-during-collection' && (record.previousDigest !== undefined || record.currentDigest !== undefined))
    throw new Error(`${field} diagnostic digests require changed-during-collection.`);
  if (state === 'changed-during-collection' && record.previousDigest !== undefined && record.previousDigest === record.currentDigest)
    throw new Error(`${field} changed digests must differ.`);
};
const checkDescriptor = (value: unknown, field: string, runId: string, keys: string[]): JsonRecord => {
  const record = asRecord(value, field);
  assertExactKeys(record, keys, field);
  const path = requiredString(record.path, `${field}.path`);
  const prefix = `${resourceArtifactUsageRunPrefix(runId)}/`;
  if (
    !path.startsWith(prefix) ||
    /[\\%?#\s\u0000-\u001f]/.test(path) ||
    path.split('/').some(segment => !segment || segment === '.' || segment === '..')
  )
    throw new Error(`${field}.path must remain in its exact immutable run namespace.`);
  const bytes = nonNegativeInteger(record.byteLength, `${field}.byteLength`);
  if (bytes > RESOURCE_ARTIFACT_USAGE_MAX_DECODED_BYTES) throw new Error(`${field}.byteLength exceeds the decoded budget.`);
  if (typeof record.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(record.sha256))
    throw new Error(`${field}.sha256 must be lowercase hexadecimal SHA-256.`);
  return record;
};
const checkManifest = (record: JsonRecord, expected?: ResourceArtifactUsageExpectedBinding): void => {
  assertExactKeys(record, [...BINDING_KEYS, 'baseRelationshipSnapshotId', 'sourceCoverage', 'expiresAt', 'paging', 'files'], 'manifest');
  checkBinding(record, expected);
  requiredString(record.baseRelationshipSnapshotId, 'baseRelationshipSnapshotId');
  coverages(record.sourceCoverage, 'sourceCoverage');
  isoTimestamp(record.expiresAt, 'expiresAt');
  const generatedAt = String(asRecord(record.artifactGeneration, 'artifactGeneration').generatedAt);
  if (Date.parse(String(record.expiresAt)) <= Date.parse(generatedAt)) throw new Error('expiresAt must follow generation time.');
  const paging = asRecord(record.paging, 'paging');
  assertExactKeys(paging, ['maxRows', 'maxDecodedBytes'], 'paging');
  assertValue(paging.maxRows, RESOURCE_ARTIFACT_USAGE_MAX_ROWS, 'paging.maxRows');
  assertValue(paging.maxDecodedBytes, RESOURCE_ARTIFACT_USAGE_MAX_DECODED_BYTES, 'paging.maxDecodedBytes');
  const runId = String(asRecord(record.artifactGeneration, 'artifactGeneration').runId);
  const files = asArray(record.files, 'files', true).map((value, index) => {
    const field = `files[${index}]`;
    const file = checkDescriptor(value, field, runId, ['path', 'byteLength', 'sha256', 'role', 'artifactId', 'page']);
    const role = requiredEnum(file.role, ['graph', 'index', ...DETAIL_SECTIONS], `${field}.role`);
    let suffix: string;
    if (role === 'graph' || role === 'index') {
      if (file.artifactId !== undefined || file.page !== undefined) throw new Error(`${field} graph/index files cannot select an artifact or page.`);
      suffix = `${role}.json.gz`;
    } else {
      const artifactId = id(file.artifactId, `${field}.artifactId`);
      if (role === 'summary') {
        if (file.page !== undefined) throw new Error(`${field} summary is a single unnumbered file.`);
        suffix = `details/${artifactId}/summary.json.gz`;
      } else suffix = `details/${artifactId}/${role}/${nonNegativeInteger(file.page, `${field}.page`)}.json.gz`;
    }
    assertValue(file.path, `${resourceArtifactUsageRunPrefix(runId)}/${suffix}`, `${field}.path`);
    return file;
  });
  assertUnique(
    files.map(file => String(file.path)),
    'files.paths'
  );
  for (const role of ['graph', 'index'])
    if (files.filter(file => file.role === role).length !== 1) throw new Error(`files must declare exactly one ${role}.`);
  const artifactIds = new Set(files.filter(file => file.artifactId !== undefined).map(file => String(file.artifactId)));
  for (const artifactId of artifactIds) {
    if (files.filter(file => file.artifactId === artifactId && file.role === 'summary').length !== 1)
      throw new Error(`files must declare a summary for ${artifactId}.`);
    for (const role of ['findings', 'usages']) {
      const pages = files
        .filter(file => file.artifactId === artifactId && file.role === role)
        .map(file => Number(file.page))
        .sort((a, b) => a - b);
      if (pages.some((page, index) => page !== index)) throw new Error(`files.${artifactId}.${role} pages must be contiguous from zero.`);
    }
  }
};
const checkPointer = (record: JsonRecord, expected?: ResourceArtifactUsageExpectedBinding): void => {
  assertExactKeys(record, [...BINDING_KEYS, 'manifest', 'completedAt'], 'pointer');
  checkBinding(record, expected);
  isoTimestamp(record.completedAt, 'completedAt');
  const generation = asRecord(record.artifactGeneration, 'artifactGeneration');
  if (Date.parse(String(record.completedAt)) < Date.parse(String(generation.generatedAt)))
    throw new Error('completedAt cannot precede generation time.');
  const descriptor = checkDescriptor(record.manifest, 'manifest', String(generation.runId), ['path', 'byteLength', 'sha256']);
  assertValue(descriptor.path, `${resourceArtifactUsageRunPrefix(String(generation.runId))}/manifest.json`, 'manifest.path');
};
const checkIndex = (record: JsonRecord, expected?: ResourceArtifactUsageExpectedBinding): void => {
  assertExactKeys(record, [...BINDING_KEYS, 'baseRelationshipSnapshotId', 'artifacts', 'resourceArtifacts'], 'index');
  checkBinding(record, expected);
  requiredString(record.baseRelationshipSnapshotId, 'baseRelationshipSnapshotId');
  const artifacts = asArray(record.artifacts, 'artifacts');
  artifacts.forEach((summary, index) => checkSummary(summary, `artifacts[${index}]`));
  const ids = artifacts.map(artifact => String(asRecord(artifact, 'artifacts').id));
  assertUnique(ids, 'artifacts.ids');
  const joins = asRecord(record.resourceArtifacts, 'resourceArtifacts');
  for (const [resourceId, artifactIds] of Object.entries(joins)) {
    requiredString(resourceId, 'resourceArtifacts.resourceId');
    const references = asArray(artifactIds, `resourceArtifacts.${resourceId}`).map(value => id(value, `resourceArtifacts.${resourceId}`));
    assertUnique(references, `resourceArtifacts.${resourceId}`);
    if (references.some(reference => !ids.includes(reference))) throw new Error(`resourceArtifacts.${resourceId} contains an undeclared artifact.`);
  }
  for (const artifact of artifacts) {
    const summary = asRecord(artifact, 'artifacts');
    if (Array.isArray(summary.childArtifactIds) && summary.childArtifactIds.some(child => !ids.includes(String(child))))
      throw new Error('childArtifactIds must be declared in the same index.');
  }
};
const checkPage = (record: JsonRecord, expected?: ResourceArtifactDetailExpectedBinding): void => {
  assertExactKeys(record, [...BINDING_KEYS, 'artifactId', 'section', 'page', 'rows', 'count', 'completeness', 'nextPage'], 'page');
  checkBinding(record, expected);
  id(record.artifactId, 'artifactId');
  const section = requiredEnum(record.section, DETAIL_SECTIONS, 'section');
  const page = nonNegativeInteger(record.page, 'page');
  const completeness = requiredEnum(record.completeness, [...COMPLETENESS, 'restricted'], 'completeness');
  const rows = asArray(record.rows, 'rows');
  if (rows.length > RESOURCE_ARTIFACT_USAGE_MAX_ROWS) throw new Error('rows exceeds the page limit.');
  optionalCount(record, 'count', 'page');
  optionalCount(record, 'nextPage', 'page');
  if (record.nextPage !== undefined && record.nextPage !== page + 1) throw new Error('nextPage must be the immediate next declared page.');
  if (section === 'summary' && (page !== 0 || rows.length > 1 || record.nextPage !== undefined))
    throw new Error('summary is a single page with at most one row.');
  if (
    ['unavailable', 'unsupported', 'restricted'].includes(completeness) &&
    (rows.length || record.count !== undefined || record.nextPage !== undefined)
  )
    throw new Error('Unobserved/restricted sections cannot contain rows or counts.');
  if (record.count !== undefined && Number(record.count) < rows.length) throw new Error('count cannot be smaller than its observed page rows.');
  rows.forEach((row, index) => {
    const field = `rows[${index}]`;
    if (section === 'summary') {
      checkSummary(row, field);
      assertValue(asRecord(row, field).id, record.artifactId, `${field}.id`);
    } else if (section === 'findings') checkFinding(row, field);
    else checkUsage(row, field);
  });
  assertUnique(
    rows.map(row => String(asRecord(row, 'rows').id)),
    'rows.ids'
  );
  for (const key of ['artifactId', 'section', 'page'] as const) if (expected?.[key] !== undefined) assertValue(record[key], expected[key], key);
};
/** JSON UTF-8 byte length without Node or browser runtime dependencies. */
const jsonBytes = (value: unknown): number => {
  const serialized = JSON.stringify(value);
  let bytes = 0;
  for (const character of serialized) {
    const codePoint = character.codePointAt(0) as number;
    bytes += codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4;
  }
  return bytes;
};
const validate = (value: unknown, check: (record: JsonRecord) => void): string[] => {
  try {
    assertPlainJson(value, 'artifactUsage', key => ['__proto__', 'prototype', 'constructor'].includes(key));
    if (jsonBytes(value) > RESOURCE_ARTIFACT_USAGE_MAX_DECODED_BYTES) throw new Error('artifactUsage exceeds the 2 MiB decoded JSON budget.');
    check(asRecord(value, 'artifactUsage'));
    return [];
  } catch (error) {
    return [error instanceof Error ? error.message : 'Invalid artifact usage document.'];
  }
};
export const validateResourceArtifactUsageManifest = (value: unknown, expected?: ResourceArtifactUsageExpectedBinding): string[] =>
  validate(value, record => checkManifest(record, expected));
export const validateResourceArtifactUsagePointer = (value: unknown, expected?: ResourceArtifactUsageExpectedBinding): string[] =>
  validate(value, record => checkPointer(record, expected));
export const validateResourceArtifactUsageIndex = (value: unknown, expected?: ResourceArtifactUsageExpectedBinding): string[] =>
  validate(value, record => checkIndex(record, expected));
export const validateResourceArtifactSummary = (value: unknown): string[] => validate(value, record => checkSummary(record, 'summary'));
export const validateResourceArtifactFinding = (value: unknown): string[] => validate(value, record => checkFinding(record, 'finding'));
export const validateResourceArtifactUsageEvidence = (value: unknown): string[] => validate(value, record => checkUsage(record, 'usage'));
export const validateResourceArtifactDetailPage = (value: unknown, expected?: ResourceArtifactDetailExpectedBinding): string[] =>
  validate(value, record => checkPage(record, expected));
export const isResourceArtifactUsageManifest = (
  value: unknown,
  expected?: ResourceArtifactUsageExpectedBinding
): value is ResourceArtifactUsageManifest => validateResourceArtifactUsageManifest(value, expected).length === 0;
export const isResourceArtifactUsagePointer = (
  value: unknown,
  expected?: ResourceArtifactUsageExpectedBinding
): value is ResourceArtifactUsagePointer => validateResourceArtifactUsagePointer(value, expected).length === 0;
export const isResourceArtifactUsageIndex = (value: unknown, expected?: ResourceArtifactUsageExpectedBinding): value is ResourceArtifactUsageIndex =>
  validateResourceArtifactUsageIndex(value, expected).length === 0;
export const isResourceArtifactSummary = (value: unknown): value is ResourceArtifactSummary => validateResourceArtifactSummary(value).length === 0;
export const isResourceArtifactFinding = (value: unknown): value is ResourceArtifactFinding => validateResourceArtifactFinding(value).length === 0;
export const isResourceArtifactUsageEvidence = (value: unknown): value is ResourceArtifactUsageEvidence =>
  validateResourceArtifactUsageEvidence(value).length === 0;
export const isResourceArtifactDetailPage = (value: unknown, expected?: ResourceArtifactDetailExpectedBinding): value is ResourceArtifactDetailPage =>
  validateResourceArtifactDetailPage(value, expected).length === 0;
