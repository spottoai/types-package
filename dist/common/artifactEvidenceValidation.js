"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasValidOptionalArtifactRevisionComponents = exports.isArtifactRevisionVector = exports.isStrictLogicalArtifactReference = void 0;
const hasControlCharacters = (value) => Array.from(value).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);
/** Validates a generation-relative logical artifact reference without accepting physical-path encodings. */
const isStrictLogicalArtifactReference = (value) => {
    if (typeof value !== 'string' || value.trim() !== value || value.length === 0 || hasControlCharacters(value))
        return false;
    if (value.startsWith('/') || value.includes('\\') || value.includes('%') || value.includes('?') || value.includes('#'))
        return false;
    if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(value) || /^[A-Za-z]:[\\/]/.test(value))
        return false;
    const segments = value.split('/');
    return segments.length >= 2 && segments.every(segment => segment.length > 0 && segment !== '.' && segment !== '..');
};
exports.isStrictLogicalArtifactReference = isStrictLogicalArtifactReference;
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const isPositiveSafeInteger = (value) => Number.isSafeInteger(value) && Number(value) > 0;
/** Validates the positive source/policy revision vector shared by evidence producers and consumers. */
const isArtifactRevisionVector = (value) => isRecord(value) &&
    isPositiveSafeInteger(value.sourceRevision) &&
    isPositiveSafeInteger(value.policyRevision) &&
    (value.ownershipEpochRevision === undefined || isPositiveSafeInteger(value.ownershipEpochRevision));
exports.isArtifactRevisionVector = isArtifactRevisionVector;
/** Validates optional dependency revision components using the shared revision-vector rules. */
const hasValidOptionalArtifactRevisionComponents = (value) => (0, exports.isArtifactRevisionVector)({
    sourceRevision: value.sourceRevision === undefined ? 1 : value.sourceRevision,
    policyRevision: value.policyRevision === undefined ? 1 : value.policyRevision,
});
exports.hasValidOptionalArtifactRevisionComponents = hasValidOptionalArtifactRevisionComponents;
//# sourceMappingURL=artifactEvidenceValidation.js.map