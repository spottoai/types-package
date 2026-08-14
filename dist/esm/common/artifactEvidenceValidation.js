const hasControlCharacters = (value) => Array.from(value).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);
/** Validates a generation-relative logical artifact reference without accepting physical-path encodings. */
export const isStrictLogicalArtifactReference = (value) => {
    if (typeof value !== 'string' || value.trim() !== value || value.length === 0 || hasControlCharacters(value))
        return false;
    if (value.startsWith('/') || value.includes('\\') || value.includes('%') || value.includes('?') || value.includes('#'))
        return false;
    if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(value) || /^[A-Za-z]:[\\/]/.test(value))
        return false;
    const segments = value.split('/');
    return segments.length >= 2 && segments.every(segment => segment.length > 0 && segment !== '.' && segment !== '..');
};
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const isPositiveSafeInteger = (value) => Number.isSafeInteger(value) && Number(value) > 0;
/** Validates the positive source/policy revision vector shared by evidence producers and consumers. */
export const isArtifactRevisionVector = (value) => isRecord(value) &&
    isPositiveSafeInteger(value.sourceRevision) &&
    isPositiveSafeInteger(value.policyRevision) &&
    (value.ownershipEpochRevision === undefined || isPositiveSafeInteger(value.ownershipEpochRevision));
/** Validates optional dependency revision components using the shared revision-vector rules. */
export const hasValidOptionalArtifactRevisionComponents = (value) => isArtifactRevisionVector({
    sourceRevision: value.sourceRevision === undefined ? 1 : value.sourceRevision,
    policyRevision: value.policyRevision === undefined ? 1 : value.policyRevision,
});
