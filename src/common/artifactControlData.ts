const FORBIDDEN_SENSITIVE_FIELDS = new Set([
  'accountkey',
  'accesskey',
  'accesstoken',
  'apikey',
  'authorization',
  'clientsecret',
  'connectionstring',
  'credential',
  'credentials',
  'password',
  'refreshtoken',
  'sastoken',
  'secret',
  'sharedaccesssignature',
  'token',
]);
const FORBIDDEN_PROTOTYPE_FIELDS = new Set(['proto', 'prototype', 'constructor']);

const PHYSICAL_REFERENCE_FIELDS = new Set([
  'artifactpath',
  'blobpath',
  'bloburi',
  'bloburl',
  'containerpath',
  'containeruri',
  'containerurl',
  'filepath',
  'filesystempath',
  'inputmanifestpath',
  'manifestpath',
  'outputmanifestpath',
  'path',
  'physicalpath',
  'physicaluri',
  'physicalurl',
  'sourcepath',
  'sourceuri',
  'sourceurl',
  'storagepath',
  'storageuri',
  'storageurl',
  'uri',
  'url',
]);
const PERCENT_ENCODED_BYTE_PATTERN = /%[0-9A-Fa-f]{2}/;
const URI_SCHEME_PATTERN = /^[A-Za-z][A-Za-z0-9+.-]*:/;
const SHA256_PATTERN = /^[0-9A-Fa-f]{64}$/;
export const ARTIFACT_CONTROL_DATA_MAX_VISITED_NODES = 100_000;

export interface AllowedArtifactReferenceField {
  object: Record<string, unknown>;
  key: string;
  allowUriScheme?: boolean;
  allowUriSchemeInStringArray?: boolean;
  allowDigestLike?: boolean;
  allowControlField?: boolean;
}

interface IArtifactControlDataScanOptions {
  rejectDigestLikeValues?: boolean;
  requireSafeAzureResourceIds?: boolean;
  forbiddenControlFields?: ReadonlySet<string>;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const hasControlCharacters = (value: string): boolean =>
  Array.from(value).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);

const normalizeFieldName = (key: string): string => key.replace(/[-_\s]/g, '').toLowerCase();

const hasDotTraversal = (value: string): boolean => value.split(/[\\/]/).some(segment => segment === '.' || segment === '..');

const isForbiddenReferenceValue = (value: string, allowUriScheme = false, allowDigestLike = false, rejectDigestLikeValues = false): boolean =>
  hasControlCharacters(value) ||
  PERCENT_ENCODED_BYTE_PATTERN.test(value) ||
  (!allowUriScheme && URI_SCHEME_PATTERN.test(value)) ||
  (rejectDigestLikeValues && !allowDigestLike && SHA256_PATTERN.test(value)) ||
  value.startsWith('/') ||
  value.startsWith('\\\\') ||
  /^[A-Za-z]:[\\/]/.test(value) ||
  hasDotTraversal(value);

const isSafeAzureResourceId = (key: string, value: unknown): value is string => {
  if (key !== 'resourceId' || typeof value !== 'string' || hasControlCharacters(value) || value.includes('\\')) return false;
  const segments = value.split('/');
  return (
    segments.length >= 3 &&
    segments[0] === '' &&
    segments[1].toLowerCase() === 'subscriptions' &&
    segments
      .slice(2)
      .every(segment => segment.trim() === segment && segment.length > 0 && !/[?#%]/.test(segment) && segment !== '.' && segment !== '..')
  );
};

/** Marks a structurally validated schema field whose logical reference name is allowed. */
export const allowedArtifactReferenceField = (object: unknown, key: string): AllowedArtifactReferenceField[] =>
  isRecord(object) ? [{ object, key }] : [];

/** Marks a structurally validated identity field whose value is allowed by its owning schema. */
export const allowedArtifactIdentityField = (object: unknown, key: string): AllowedArtifactReferenceField[] =>
  isRecord(object) ? [{ object, key, allowUriScheme: true }] : [];

type AllowedArtifactFieldIndex = WeakMap<Record<string, unknown>, Map<string, AllowedArtifactReferenceField>>;

const indexAllowedArtifactFields = (allowedReferenceFields: AllowedArtifactReferenceField[]): AllowedArtifactFieldIndex => {
  const index: AllowedArtifactFieldIndex = new WeakMap();
  for (const field of allowedReferenceFields) {
    let objectFields = index.get(field.object);
    if (!objectFields) {
      objectFields = new Map();
      index.set(field.object, objectFields);
    }
    const existing = objectFields.get(field.key);
    objectFields.set(field.key, {
      object: field.object,
      key: field.key,
      allowUriScheme: existing?.allowUriScheme || field.allowUriScheme,
      allowUriSchemeInStringArray: existing?.allowUriSchemeInStringArray || field.allowUriSchemeInStringArray,
      allowDigestLike: existing?.allowDigestLike || field.allowDigestLike,
      allowControlField: existing?.allowControlField || field.allowControlField,
    });
  }
  return index;
};

const containsForbiddenArtifactControlDataWithIndex = (
  value: unknown,
  allowedReferenceFields: AllowedArtifactFieldIndex,
  options: IArtifactControlDataScanOptions
): boolean => {
  type PendingValue =
    | {
        kind: 'visit';
        value: unknown;
        allowedStringArrayField?: AllowedArtifactReferenceField;
      }
    | {
        kind: 'leave';
        container: object;
        scanPolicyRank: number;
      };
  const pending: PendingValue[] = [{ kind: 'visit', value }];
  const activeContainers = new WeakSet<object>();
  const completedScanPolicyRanks = new WeakMap<object, number>();
  let visitedNodeCount = 0;

  while (pending.length > 0) {
    const candidate = pending.pop() as PendingValue;
    if (candidate.kind === 'leave') {
      activeContainers.delete(candidate.container);
      const completedRank = completedScanPolicyRanks.get(candidate.container);
      if (completedRank === undefined || candidate.scanPolicyRank < completedRank) {
        completedScanPolicyRanks.set(candidate.container, candidate.scanPolicyRank);
      }
      continue;
    }
    if (typeof candidate.value === 'string') {
      if (isForbiddenReferenceValue(candidate.value, false, false, options.rejectDigestLikeValues)) return true;
      continue;
    }
    if (Array.isArray(candidate.value)) {
      visitedNodeCount += 1;
      if (visitedNodeCount > ARTIFACT_CONTROL_DATA_MAX_VISITED_NODES) return true;
      if (activeContainers.has(candidate.value)) return true;
      const scanPolicyRank = candidate.allowedStringArrayField ? (candidate.allowedStringArrayField.allowDigestLike ? 2 : 1) : 0;
      const completedRank = completedScanPolicyRanks.get(candidate.value);
      if (completedRank !== undefined && completedRank <= scanPolicyRank) continue;
      activeContainers.add(candidate.value);
      pending.push({ kind: 'leave', container: candidate.value, scanPolicyRank });
      for (let index = candidate.value.length - 1; index >= 0; index -= 1) {
        const child = candidate.value[index];
        if (candidate.allowedStringArrayField && typeof child === 'string') {
          if (isForbiddenReferenceValue(child, true, candidate.allowedStringArrayField.allowDigestLike, options.rejectDigestLikeValues)) {
            return true;
          }
        } else {
          pending.push({ kind: 'visit', value: child });
        }
      }
      continue;
    }
    if (!isRecord(candidate.value)) continue;
    visitedNodeCount += 1;
    if (visitedNodeCount > ARTIFACT_CONTROL_DATA_MAX_VISITED_NODES) return true;
    if (activeContainers.has(candidate.value)) return true;
    if (completedScanPolicyRanks.has(candidate.value)) continue;
    activeContainers.add(candidate.value);
    pending.push({ kind: 'leave', container: candidate.value, scanPolicyRank: 0 });

    for (const [key, child] of Object.entries(candidate.value)) {
      if (hasControlCharacters(key)) return true;
      const normalizedKey = normalizeFieldName(key);
      if (FORBIDDEN_PROTOTYPE_FIELDS.has(normalizedKey)) return true;
      if (FORBIDDEN_SENSITIVE_FIELDS.has(normalizedKey)) return true;
      const allowedField = allowedReferenceFields.get(candidate.value)?.get(key);
      if (options.forbiddenControlFields?.has(normalizedKey) && !allowedField?.allowControlField) return true;
      if (options.requireSafeAzureResourceIds && normalizedKey === 'resourceid') {
        if (!isSafeAzureResourceId(key, child)) return true;
        continue;
      }
      if (allowedField && typeof child === 'string' && (allowedField.allowUriScheme || allowedField.allowDigestLike)) {
        if (isForbiddenReferenceValue(child, allowedField.allowUriScheme, allowedField.allowDigestLike, options.rejectDigestLikeValues)) return true;
        continue;
      }
      if (allowedField?.allowUriSchemeInStringArray && Array.isArray(child)) {
        pending.push({ kind: 'visit', value: child, allowedStringArrayField: allowedField });
        continue;
      }
      if (PHYSICAL_REFERENCE_FIELDS.has(normalizedKey) && !allowedField) return true;
      if (isSafeAzureResourceId(key, child)) continue;
      pending.push({ kind: 'visit', value: child });
    }
  }
  return false;
};

/** Rejects normalized sensitive fields and physical-reference control data with bounded traversal. */
export const containsForbiddenArtifactControlData = (
  value: unknown,
  allowedReferenceFields: AllowedArtifactReferenceField[] = [],
  options: IArtifactControlDataScanOptions = {}
): boolean => containsForbiddenArtifactControlDataWithIndex(value, indexAllowedArtifactFields(allowedReferenceFields), options);
