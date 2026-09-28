import { hasExactKeys, isBoundedString, isCanonicalUtcTimestamp, isNonNegativeInteger, isRecord } from '../environment/internal.js';
import { isEnvironmentArtifactKindV1, isEnvironmentPortalRouteV1, isEnvironmentSafeLabelV1 } from '../environment/validation.js';
export const AI_CHAT_GROUNDING_LIMITS_V1 = Object.freeze({
    claims: 128,
    citationsPerClaim: 32,
    identifierScalars: 128,
    figures: 128,
    figureTextScalars: 96,
});
export const AI_CHAT_GROUNDING_REASON_CODES_V1 = [
    'grounding.not-required',
    'grounding.claim-extraction-failed',
    'grounding.missing-citation',
    'grounding.source-unavailable',
    'grounding.source-stale',
    'grounding.generation-mismatch',
    'grounding.value-mismatch',
    'grounding.unsupported-claim',
    'grounding.figure-unreferenced',
    'grounding.reference-unresolved',
];
/**
 * HTML attribute the API puts on the element wrapping each figure in the answer. Its value is the figure's
 * `figureId`, so clients anchor provenance without matching text.
 */
export const AI_CHAT_GROUNDED_FIGURE_ANCHOR_ATTRIBUTE_V1 = 'data-spotto-figure';
const COVERAGE_STATUSES = new Set(['complete', 'partial', 'unavailable', 'stale', 'not-collected']);
const FIGURE_KINDS = new Set(['money', 'percentage', 'quantity', 'date']);
const FIGURE_ONLY_REASON_CODES = new Set(['grounding.figure-unreferenced', 'grounding.reference-unresolved']);
const GROUNDING_REASON_CODES = new Set(AI_CHAT_GROUNDING_REASON_CODES_V1);
const FAILURE_REASON_CODES = new Set(AI_CHAT_GROUNDING_REASON_CODES_V1.filter(code => code !== 'grounding.not-required'));
const CLAIM_FAILURE_REASON_CODES = new Set([...FAILURE_REASON_CODES].filter(code => !FIGURE_ONLY_REASON_CODES.has(code)));
const isIdentifier = (value) => isBoundedString(value, AI_CHAT_GROUNDING_LIMITS_V1.identifierScalars, { trimmed: true, controls: true });
const isCitationIds = (value, requireOne) => Array.isArray(value) &&
    value.length <= AI_CHAT_GROUNDING_LIMITS_V1.citationsPerClaim &&
    (!requireOne || value.length > 0) &&
    value.every(isIdentifier) &&
    new Set(value).size === value.length;
/** Strictly validates client-safe environment evidence metadata. */
export const isAIEnvironmentEvidenceMatch = (value) => isRecord(value) &&
    hasExactKeys(value, ['safeLabel', 'portalRoute', 'artifactKind', 'sourceCompletedAt', 'coverageStatus', 'truncated', 'citationIds']) &&
    isEnvironmentSafeLabelV1(value.safeLabel) &&
    isEnvironmentPortalRouteV1(value.portalRoute) &&
    isEnvironmentArtifactKindV1(value.artifactKind) &&
    isCanonicalUtcTimestamp(value.sourceCompletedAt) &&
    typeof value.coverageStatus === 'string' &&
    COVERAGE_STATUSES.has(value.coverageStatus) &&
    typeof value.truncated === 'boolean' &&
    isCitationIds(value.citationIds, true);
const isAIChatClaimVerificationV1 = (value) => {
    if (!isRecord(value) ||
        !hasExactKeys(value, ['claimId', 'status', 'citationIds'], ['reasonCode']) ||
        !isIdentifier(value.claimId) ||
        (value.status !== 'verified' && value.status !== 'unverified')) {
        return false;
    }
    if (value.status === 'verified') {
        return value.reasonCode === undefined && isCitationIds(value.citationIds, true);
    }
    return typeof value.reasonCode === 'string' && CLAIM_FAILURE_REASON_CODES.has(value.reasonCode) && isCitationIds(value.citationIds, false);
};
/** Strictly validates one grounded figure. */
export const isAIChatGroundedFigureV1 = (value) => {
    if (!isRecord(value) ||
        !hasExactKeys(value, ['figureId', 'status', 'kind', 'text', 'citationIds'], ['reasonCode']) ||
        !isIdentifier(value.figureId) ||
        typeof value.kind !== 'string' ||
        !FIGURE_KINDS.has(value.kind) ||
        !isBoundedString(value.text, AI_CHAT_GROUNDING_LIMITS_V1.figureTextScalars, { trimmed: true, controls: true })) {
        return false;
    }
    if (value.status === 'verified') {
        return value.reasonCode === undefined && isCitationIds(value.citationIds, true);
    }
    return (value.status === 'unverified' &&
        value.reasonCode === 'grounding.figure-unreferenced' &&
        Array.isArray(value.citationIds) &&
        value.citationIds.length === 0);
};
const isClaimSummary = (value) => {
    if (value.figures !== undefined ||
        (value.status !== 'verified' && value.status !== 'unverified' && value.status !== 'not-required') ||
        !isNonNegativeInteger(value.totalClaimCount) ||
        !isNonNegativeInteger(value.verifiedClaimCount) ||
        !Array.isArray(value.claims) ||
        value.claims.length > AI_CHAT_GROUNDING_LIMITS_V1.claims ||
        !value.claims.every(isAIChatClaimVerificationV1) ||
        new Set(value.claims.map(claim => claim.claimId)).size !== value.claims.length ||
        value.totalClaimCount !== value.claims.length) {
        return false;
    }
    const verifiedClaimCount = value.claims.filter(claim => claim.status === 'verified').length;
    if (value.verifiedClaimCount !== verifiedClaimCount)
        return false;
    if (value.status === 'verified') {
        return value.totalClaimCount > 0 && value.verifiedClaimCount === value.totalClaimCount && value.reasonCode === undefined;
    }
    if (value.status === 'not-required') {
        return value.totalClaimCount === 0 && value.verifiedClaimCount === 0 && value.reasonCode === 'grounding.not-required';
    }
    if (typeof value.reasonCode !== 'string' || !CLAIM_FAILURE_REASON_CODES.has(value.reasonCode))
        return false;
    if (value.totalClaimCount === 0)
        return value.reasonCode === 'grounding.claim-extraction-failed';
    return value.verifiedClaimCount < value.totalClaimCount;
};
const isFigureSummary = (value) => {
    if (value.totalClaimCount !== 0 ||
        value.verifiedClaimCount !== 0 ||
        !Array.isArray(value.claims) ||
        value.claims.length !== 0 ||
        !Array.isArray(value.figures) ||
        value.figures.length > AI_CHAT_GROUNDING_LIMITS_V1.figures ||
        !value.figures.every(isAIChatGroundedFigureV1) ||
        new Set(value.figures.map(figure => figure.figureId)).size !== value.figures.length) {
        return false;
    }
    const verified = value.figures.filter(figure => figure.status === 'verified').length;
    const unverified = value.figures.length - verified;
    const failureReason = typeof value.reasonCode === 'string' && FAILURE_REASON_CODES.has(value.reasonCode);
    switch (value.status) {
        case 'not-required':
            return value.figures.length === 0 && value.reasonCode === 'grounding.not-required';
        case 'verified':
            return verified > 0 && unverified === 0 && value.reasonCode === undefined;
        case 'partial':
            return verified > 0 && unverified > 0 && failureReason;
        case 'unverified':
            // Also reached with no figures left, for example when every statement with an unresolved reference was removed.
            return verified === 0 && failureReason;
        default:
            return false;
    }
};
/** Strictly validates deterministic summary, claim-level and figure-level citation invariants. */
export const isAIChatGroundingSummary = (value) => {
    if (!isRecord(value) ||
        !hasExactKeys(value, ['status', 'method', 'totalClaimCount', 'verifiedClaimCount', 'claims'], ['reasonCode', 'figures']) ||
        (value.reasonCode !== undefined && (typeof value.reasonCode !== 'string' || !GROUNDING_REASON_CODES.has(value.reasonCode)))) {
        return false;
    }
    if (value.method === 'deterministic-citation-and-value')
        return isClaimSummary(value);
    if (value.method === 'server-rendered-figures')
        return isFigureSummary(value);
    return false;
};
