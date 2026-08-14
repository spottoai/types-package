const hasControlCharacters = (value: string): boolean =>
  Array.from(value).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);

/** Validates a generation-relative logical artifact reference without accepting physical-path encodings. */
export const isStrictLogicalArtifactReference = (value: unknown): value is string => {
  if (typeof value !== 'string' || value.trim() !== value || value.length === 0 || hasControlCharacters(value)) return false;
  if (value.startsWith('/') || value.includes('\\') || value.includes('%') || value.includes('?') || value.includes('#')) return false;
  if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(value) || /^[A-Za-z]:[\\/]/.test(value)) return false;
  const segments = value.split('/');
  return segments.length >= 2 && segments.every(segment => segment.length > 0 && segment !== '.' && segment !== '..');
};

interface RuntimeArtifactRevisionVector {
  ownershipEpochRevision?: number;
  sourceRevision: number;
  policyRevision: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isPositiveSafeInteger = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) > 0;

/** Validates the positive source/policy revision vector shared by evidence producers and consumers. */
export const isArtifactRevisionVector = (value: unknown): value is RuntimeArtifactRevisionVector =>
  isRecord(value) &&
  isPositiveSafeInteger(value.sourceRevision) &&
  isPositiveSafeInteger(value.policyRevision) &&
  (value.ownershipEpochRevision === undefined || isPositiveSafeInteger(value.ownershipEpochRevision));

/** Validates optional dependency revision components using the shared revision-vector rules. */
export const hasValidOptionalArtifactRevisionComponents = (value: { sourceRevision?: unknown; policyRevision?: unknown }): boolean =>
  isArtifactRevisionVector({
    sourceRevision: value.sourceRevision === undefined ? 1 : value.sourceRevision,
    policyRevision: value.policyRevision === undefined ? 1 : value.policyRevision,
  });
