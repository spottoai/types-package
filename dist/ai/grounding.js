"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAIChatGroundingSummary = exports.isAIEnvironmentEvidenceMatch = exports.AI_CHAT_GROUNDING_REASON_CODES_V1 = exports.AI_CHAT_GROUNDING_LIMITS_V1 = void 0;
const internal_js_1 = require("../environment/internal.js");
const validation_js_1 = require("../environment/validation.js");
exports.AI_CHAT_GROUNDING_LIMITS_V1 = Object.freeze({
    claims: 128,
    citationsPerClaim: 32,
    identifierScalars: 128,
});
exports.AI_CHAT_GROUNDING_REASON_CODES_V1 = [
    'grounding.not-required',
    'grounding.claim-extraction-failed',
    'grounding.missing-citation',
    'grounding.source-unavailable',
    'grounding.source-stale',
    'grounding.generation-mismatch',
    'grounding.value-mismatch',
    'grounding.unsupported-claim',
];
const COVERAGE_STATUSES = new Set(['complete', 'partial', 'unavailable', 'stale', 'not-collected']);
const GROUNDING_REASON_CODES = new Set(exports.AI_CHAT_GROUNDING_REASON_CODES_V1);
const FAILURE_REASON_CODES = new Set(exports.AI_CHAT_GROUNDING_REASON_CODES_V1.filter(code => code !== 'grounding.not-required'));
const isIdentifier = (value) => (0, internal_js_1.isBoundedString)(value, exports.AI_CHAT_GROUNDING_LIMITS_V1.identifierScalars, { trimmed: true, controls: true });
const isCitationIds = (value, requireOne) => Array.isArray(value) &&
    value.length <= exports.AI_CHAT_GROUNDING_LIMITS_V1.citationsPerClaim &&
    (!requireOne || value.length > 0) &&
    value.every(isIdentifier) &&
    new Set(value).size === value.length;
/** Strictly validates client-safe environment evidence metadata. */
const isAIEnvironmentEvidenceMatch = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['safeLabel', 'portalRoute', 'artifactKind', 'sourceCompletedAt', 'coverageStatus', 'truncated', 'citationIds']) &&
    (0, validation_js_1.isEnvironmentSafeLabelV1)(value.safeLabel) &&
    (0, validation_js_1.isEnvironmentPortalRouteV1)(value.portalRoute) &&
    (0, validation_js_1.isEnvironmentArtifactKindV1)(value.artifactKind) &&
    (0, internal_js_1.isCanonicalUtcTimestamp)(value.sourceCompletedAt) &&
    typeof value.coverageStatus === 'string' &&
    COVERAGE_STATUSES.has(value.coverageStatus) &&
    typeof value.truncated === 'boolean' &&
    isCitationIds(value.citationIds, true);
exports.isAIEnvironmentEvidenceMatch = isAIEnvironmentEvidenceMatch;
const isAIChatClaimVerificationV1 = (value) => {
    if (!(0, internal_js_1.isRecord)(value) ||
        !(0, internal_js_1.hasExactKeys)(value, ['claimId', 'status', 'citationIds'], ['reasonCode']) ||
        !isIdentifier(value.claimId) ||
        (value.status !== 'verified' && value.status !== 'unverified')) {
        return false;
    }
    if (value.status === 'verified') {
        return value.reasonCode === undefined && isCitationIds(value.citationIds, true);
    }
    return typeof value.reasonCode === 'string' && FAILURE_REASON_CODES.has(value.reasonCode) && isCitationIds(value.citationIds, false);
};
/** Strictly validates deterministic summary and claim-level citation invariants. */
const isAIChatGroundingSummary = (value) => {
    if (!(0, internal_js_1.isRecord)(value) ||
        !(0, internal_js_1.hasExactKeys)(value, ['status', 'method', 'totalClaimCount', 'verifiedClaimCount', 'claims'], ['reasonCode']) ||
        value.method !== 'deterministic-citation-and-value' ||
        (value.status !== 'verified' && value.status !== 'unverified' && value.status !== 'not-required') ||
        !(0, internal_js_1.isNonNegativeInteger)(value.totalClaimCount) ||
        !(0, internal_js_1.isNonNegativeInteger)(value.verifiedClaimCount) ||
        !Array.isArray(value.claims) ||
        value.claims.length > exports.AI_CHAT_GROUNDING_LIMITS_V1.claims ||
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
    if (typeof value.reasonCode !== 'string' || !GROUNDING_REASON_CODES.has(value.reasonCode) || value.reasonCode === 'grounding.not-required') {
        return false;
    }
    if (value.totalClaimCount === 0)
        return value.reasonCode === 'grounding.claim-extraction-failed';
    return value.verifiedClaimCount < value.totalClaimCount;
};
exports.isAIChatGroundingSummary = isAIChatGroundingSummary;
//# sourceMappingURL=grounding.js.map