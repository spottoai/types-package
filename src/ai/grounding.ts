import type { EnvironmentArtifactKindV1, EnvironmentCoverageStateV1 } from '../environment/contracts.js';
import { hasExactKeys, isBoundedString, isCanonicalUtcTimestamp, isNonNegativeInteger, isRecord } from '../environment/internal.js';
import { isEnvironmentArtifactKindV1, isEnvironmentPortalRouteV1, isEnvironmentSafeLabelV1 } from '../environment/validation.js';

export const AI_CHAT_GROUNDING_LIMITS_V1 = Object.freeze({
  claims: 128,
  citationsPerClaim: 32,
  identifierScalars: 128,
  figures: 128,
  figureTextScalars: 96,
} as const);

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
] as const;

export type AIChatGroundingReasonCodeV1 = (typeof AI_CHAT_GROUNDING_REASON_CODES_V1)[number];
/** `partial` is produced only by the `server-rendered-figures` method. */
export type AIChatGroundingStatusV1 = 'verified' | 'partial' | 'unverified' | 'not-required';
export type AIChatClaimVerificationStatusV1 = 'verified' | 'unverified';
export type AIEnvironmentEvidenceCoverageStatusV1 = EnvironmentCoverageStateV1['status'];

/**
 * `deterministic-citation-and-value`: the model restated each value and declared claims that the server compared.
 * `server-rendered-figures`: the model wrote figure references and the server rendered every verified figure from
 * bound evidence, so `claims` is empty and `figures` carries the per-figure result.
 */
export type AIChatGroundingMethodV1 = 'deterministic-citation-and-value' | 'server-rendered-figures';

export type AIChatGroundedFigureKindV1 = 'money' | 'percentage' | 'quantity' | 'date';
export type AIChatGroundedFigureStatusV1 = 'verified' | 'unverified';

/**
 * HTML attribute the API puts on the element wrapping each figure in the answer. Its value is the figure's
 * `figureId`, so clients anchor provenance without matching text.
 */
export const AI_CHAT_GROUNDED_FIGURE_ANCHOR_ATTRIBUTE_V1 = 'data-spotto-figure';

/** Client-safe environment evidence metadata with no scope, generation, storage, or runtime-handle identity. */
export interface AIEnvironmentEvidenceMatch {
  safeLabel: string;
  portalRoute: string;
  artifactKind: EnvironmentArtifactKindV1;
  sourceCompletedAt: string;
  coverageStatus: AIEnvironmentEvidenceCoverageStatusV1;
  truncated: boolean;
  citationIds: string[];
}

export interface AIChatClaimVerificationV1 {
  claimId: string;
  status: AIChatClaimVerificationStatusV1;
  citationIds: string[];
  reasonCode?: Exclude<AIChatGroundingReasonCodeV1, 'grounding.not-required' | AIChatFigureOnlyReasonCodeV1>;
}

type AIChatFigureOnlyReasonCodeV1 = 'grounding.figure-unreferenced' | 'grounding.reference-unresolved';

/**
 * One figure visible in the final answer. A verified figure was rendered by the server from the cited evidence;
 * an unverified figure was typed by the model and was not checked.
 */
export interface AIChatGroundedFigureV1 {
  figureId: string;
  status: AIChatGroundedFigureStatusV1;
  kind: AIChatGroundedFigureKindV1;
  /** Exact visible text of the figure, for example `NZ$705.72 per month`. */
  text: string;
  /** At least one citation when verified; empty when unverified. */
  citationIds: string[];
  /** Required when unverified. */
  reasonCode?: 'grounding.figure-unreferenced';
}

/** Deterministic grounding result. This is evidence verification, never model confidence. */
export interface AIChatGroundingSummary {
  status: AIChatGroundingStatusV1;
  method: AIChatGroundingMethodV1;
  totalClaimCount: number;
  verifiedClaimCount: number;
  claims: AIChatClaimVerificationV1[];
  /** Present only, and always, with the `server-rendered-figures` method. */
  figures?: AIChatGroundedFigureV1[];
  reasonCode?: AIChatGroundingReasonCodeV1;
}

const COVERAGE_STATUSES = new Set<string>(['complete', 'partial', 'unavailable', 'stale', 'not-collected']);
const FIGURE_KINDS = new Set<string>(['money', 'percentage', 'quantity', 'date']);
const FIGURE_ONLY_REASON_CODES = new Set<string>(['grounding.figure-unreferenced', 'grounding.reference-unresolved']);
const GROUNDING_REASON_CODES = new Set<string>(AI_CHAT_GROUNDING_REASON_CODES_V1);
const FAILURE_REASON_CODES = new Set<string>(AI_CHAT_GROUNDING_REASON_CODES_V1.filter(code => code !== 'grounding.not-required'));
const CLAIM_FAILURE_REASON_CODES = new Set<string>([...FAILURE_REASON_CODES].filter(code => !FIGURE_ONLY_REASON_CODES.has(code)));

const isIdentifier = (value: unknown): value is string =>
  isBoundedString(value, AI_CHAT_GROUNDING_LIMITS_V1.identifierScalars, { trimmed: true, controls: true });

const isCitationIds = (value: unknown, requireOne: boolean): value is string[] =>
  Array.isArray(value) &&
  value.length <= AI_CHAT_GROUNDING_LIMITS_V1.citationsPerClaim &&
  (!requireOne || value.length > 0) &&
  value.every(isIdentifier) &&
  new Set(value).size === value.length;

/** Strictly validates client-safe environment evidence metadata. */
export const isAIEnvironmentEvidenceMatch = (value: unknown): value is AIEnvironmentEvidenceMatch =>
  isRecord(value) &&
  hasExactKeys(value, ['safeLabel', 'portalRoute', 'artifactKind', 'sourceCompletedAt', 'coverageStatus', 'truncated', 'citationIds']) &&
  isEnvironmentSafeLabelV1(value.safeLabel) &&
  isEnvironmentPortalRouteV1(value.portalRoute) &&
  isEnvironmentArtifactKindV1(value.artifactKind) &&
  isCanonicalUtcTimestamp(value.sourceCompletedAt) &&
  typeof value.coverageStatus === 'string' &&
  COVERAGE_STATUSES.has(value.coverageStatus) &&
  typeof value.truncated === 'boolean' &&
  isCitationIds(value.citationIds, true);

const isAIChatClaimVerificationV1 = (value: unknown): value is AIChatClaimVerificationV1 => {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ['claimId', 'status', 'citationIds'], ['reasonCode']) ||
    !isIdentifier(value.claimId) ||
    (value.status !== 'verified' && value.status !== 'unverified')
  ) {
    return false;
  }
  if (value.status === 'verified') {
    return value.reasonCode === undefined && isCitationIds(value.citationIds, true);
  }
  return typeof value.reasonCode === 'string' && CLAIM_FAILURE_REASON_CODES.has(value.reasonCode) && isCitationIds(value.citationIds, false);
};

/** Strictly validates one grounded figure. */
export const isAIChatGroundedFigureV1 = (value: unknown): value is AIChatGroundedFigureV1 => {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ['figureId', 'status', 'kind', 'text', 'citationIds'], ['reasonCode']) ||
    !isIdentifier(value.figureId) ||
    typeof value.kind !== 'string' ||
    !FIGURE_KINDS.has(value.kind) ||
    !isBoundedString(value.text, AI_CHAT_GROUNDING_LIMITS_V1.figureTextScalars, { trimmed: true, controls: true })
  ) {
    return false;
  }
  if (value.status === 'verified') {
    return value.reasonCode === undefined && isCitationIds(value.citationIds, true);
  }
  return (
    value.status === 'unverified' &&
    value.reasonCode === 'grounding.figure-unreferenced' &&
    Array.isArray(value.citationIds) &&
    value.citationIds.length === 0
  );
};

const isClaimSummary = (value: Record<string, unknown>): boolean => {
  if (
    value.figures !== undefined ||
    (value.status !== 'verified' && value.status !== 'unverified' && value.status !== 'not-required') ||
    !isNonNegativeInteger(value.totalClaimCount) ||
    !isNonNegativeInteger(value.verifiedClaimCount) ||
    !Array.isArray(value.claims) ||
    value.claims.length > AI_CHAT_GROUNDING_LIMITS_V1.claims ||
    !value.claims.every(isAIChatClaimVerificationV1) ||
    new Set(value.claims.map(claim => claim.claimId)).size !== value.claims.length ||
    value.totalClaimCount !== value.claims.length
  ) {
    return false;
  }

  const verifiedClaimCount = value.claims.filter(claim => claim.status === 'verified').length;
  if (value.verifiedClaimCount !== verifiedClaimCount) return false;

  if (value.status === 'verified') {
    return value.totalClaimCount > 0 && value.verifiedClaimCount === value.totalClaimCount && value.reasonCode === undefined;
  }
  if (value.status === 'not-required') {
    return value.totalClaimCount === 0 && value.verifiedClaimCount === 0 && value.reasonCode === 'grounding.not-required';
  }
  if (typeof value.reasonCode !== 'string' || !CLAIM_FAILURE_REASON_CODES.has(value.reasonCode)) return false;
  if (value.totalClaimCount === 0) return value.reasonCode === 'grounding.claim-extraction-failed';
  return value.verifiedClaimCount < value.totalClaimCount;
};

const isFigureSummary = (value: Record<string, unknown>): boolean => {
  if (
    value.totalClaimCount !== 0 ||
    value.verifiedClaimCount !== 0 ||
    !Array.isArray(value.claims) ||
    value.claims.length !== 0 ||
    !Array.isArray(value.figures) ||
    value.figures.length > AI_CHAT_GROUNDING_LIMITS_V1.figures ||
    !value.figures.every(isAIChatGroundedFigureV1) ||
    new Set(value.figures.map(figure => figure.figureId)).size !== value.figures.length
  ) {
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
export const isAIChatGroundingSummary = (value: unknown): value is AIChatGroundingSummary => {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ['status', 'method', 'totalClaimCount', 'verifiedClaimCount', 'claims'], ['reasonCode', 'figures']) ||
    (value.reasonCode !== undefined && (typeof value.reasonCode !== 'string' || !GROUNDING_REASON_CODES.has(value.reasonCode)))
  ) {
    return false;
  }
  if (value.method === 'deterministic-citation-and-value') return isClaimSummary(value);
  if (value.method === 'server-rendered-figures') return isFigureSummary(value);
  return false;
};
