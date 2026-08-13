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

export interface AllowedArtifactReferenceField {
  object: Record<string, unknown>;
  key: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const hasControlCharacters = (value: string): boolean =>
  Array.from(value).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);

const normalizeFieldName = (key: string): string => key.replace(/[-_\s]/g, '').toLowerCase();

const hasDotTraversal = (value: string): boolean => value.split(/[\\/]/).some(segment => segment === '.' || segment === '..');

const isForbiddenReferenceValue = (value: string): boolean =>
  hasControlCharacters(value) ||
  value.includes('%') ||
  value.includes('://') ||
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

/** Rejects exact normalized sensitive fields and physical-reference control data recursively. */
export const containsForbiddenArtifactControlData = (value: unknown, allowedReferenceFields: AllowedArtifactReferenceField[] = []): boolean => {
  if (typeof value === 'string') return isForbiddenReferenceValue(value);
  if (Array.isArray(value)) return value.some(child => containsForbiddenArtifactControlData(child, allowedReferenceFields));
  if (!isRecord(value)) return false;

  return Object.entries(value).some(([key, child]) => {
    if (hasControlCharacters(key)) return true;
    const normalizedKey = normalizeFieldName(key);
    if (FORBIDDEN_SENSITIVE_FIELDS.has(normalizedKey)) return true;
    const referenceAllowed = allowedReferenceFields.some(field => field.object === value && field.key === key);
    if (PHYSICAL_REFERENCE_FIELDS.has(normalizedKey) && !referenceAllowed) return true;
    if (isSafeAzureResourceId(key, child)) return false;
    return containsForbiddenArtifactControlData(child, allowedReferenceFields);
  });
};
