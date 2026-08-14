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
const PERCENT_ENCODED_BYTE_PATTERN = /%[0-9A-Fa-f]{2}/;
const URI_SCHEME_PATTERN = /^[A-Za-z][A-Za-z0-9+.-]*:/;
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const hasControlCharacters = (value) => Array.from(value).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);
const normalizeFieldName = (key) => key.replace(/[-_\s]/g, '').toLowerCase();
const hasDotTraversal = (value) => value.split(/[\\/]/).some(segment => segment === '.' || segment === '..');
const isForbiddenReferenceValue = (value, allowUriScheme = false) => hasControlCharacters(value) ||
    PERCENT_ENCODED_BYTE_PATTERN.test(value) ||
    (!allowUriScheme && URI_SCHEME_PATTERN.test(value)) ||
    value.startsWith('/') ||
    value.startsWith('\\\\') ||
    /^[A-Za-z]:[\\/]/.test(value) ||
    hasDotTraversal(value);
const isSafeAzureResourceId = (key, value) => {
    if (key !== 'resourceId' || typeof value !== 'string' || hasControlCharacters(value) || value.includes('\\'))
        return false;
    const segments = value.split('/');
    return (segments.length >= 3 &&
        segments[0] === '' &&
        segments[1].toLowerCase() === 'subscriptions' &&
        segments
            .slice(2)
            .every(segment => segment.trim() === segment && segment.length > 0 && !/[?#%]/.test(segment) && segment !== '.' && segment !== '..'));
};
/** Marks a structurally validated schema field whose logical reference name is allowed. */
export const allowedArtifactReferenceField = (object, key) => isRecord(object) ? [{ object, key }] : [];
/** Marks a structurally validated identity field whose value is allowed by its owning schema. */
export const allowedArtifactIdentityField = (object, key) => isRecord(object) ? [{ object, key, allowUriScheme: true }] : [];
/** Rejects exact normalized sensitive fields and physical-reference control data recursively. */
export const containsForbiddenArtifactControlData = (value, allowedReferenceFields = []) => {
    if (typeof value === 'string')
        return isForbiddenReferenceValue(value);
    if (Array.isArray(value))
        return value.some(child => containsForbiddenArtifactControlData(child, allowedReferenceFields));
    if (!isRecord(value))
        return false;
    return Object.entries(value).some(([key, child]) => {
        if (hasControlCharacters(key))
            return true;
        const normalizedKey = normalizeFieldName(key);
        if (FORBIDDEN_SENSITIVE_FIELDS.has(normalizedKey))
            return true;
        const allowedField = allowedReferenceFields.find(field => field.object === value && field.key === key);
        if (allowedField?.allowUriScheme && typeof child === 'string')
            return isForbiddenReferenceValue(child, true);
        if (PHYSICAL_REFERENCE_FIELDS.has(normalizedKey) && !allowedField)
            return true;
        if (isSafeAzureResourceId(key, child))
            return false;
        return containsForbiddenArtifactControlData(child, allowedReferenceFields);
    });
};
