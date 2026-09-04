import type { ArtifactGeneration } from '../common/artifactGeneration';

export const FINANCIAL_EVIDENCE_COVERAGE_CONTRACT_VERSION_V1 = 'financial-evidence-coverage/v1' as const;

export type FinancialEvidenceCoverageStateV1 = 'complete' | 'partial' | 'stale' | 'missing' | 'unavailable' | 'unknown';

export const FINANCIAL_EVIDENCE_COVERAGE_REASONS_V1 = [
  'coverage-complete',
  'capability-passport-missing',
  'capability-passport-invalid',
  'capability-passport-ownership-mismatch',
  'capability-passport-read-failed',
  'billing-capability-partial',
  'billing-capability-stale',
  'billing-capability-missing',
  'billing-capability-unavailable',
  'billing-capability-unknown',
  'billing-dependency-partial',
  'billing-dependency-stale',
  'billing-dependency-missing',
  'billing-dependency-unavailable',
  'billing-dependency-unverified',
  'billing-dependency-wrong-generation',
  'subscription-coverage-missing',
  'subscription-coverage-invalid',
  'filtered-scope-coverage-unproven',
] as const;

export type FinancialEvidenceCoverageReasonV1 = (typeof FINANCIAL_EVIDENCE_COVERAGE_REASONS_V1)[number];

export interface FinancialEvidenceCoverageSourceV1 {
  state: FinancialEvidenceCoverageStateV1;
  reasons: [FinancialEvidenceCoverageReasonV1, ...FinancialEvidenceCoverageReasonV1[]];
  generationId?: string;
  completeThrough?: string;
}

/**
 * Generation-bound, non-monetary qualification of one subscription's financial
 * evidence. It can explain or restrict confidence, but never supplies or
 * overrides a Financial Authority amount.
 */
export interface FinancialEvidenceCoverageProjectionV1 {
  contractVersion: typeof FINANCIAL_EVIDENCE_COVERAGE_CONTRACT_VERSION_V1;
  provider: 'azure';
  subscriptionId: string;
  publicationId: string;
  artifactGeneration: ArtifactGeneration;
  scope: { kind: 'subscription'; subscriptionId: string };
  state: FinancialEvidenceCoverageStateV1;
  reasons: [FinancialEvidenceCoverageReasonV1, ...FinancialEvidenceCoverageReasonV1[]];
  sources: {
    capabilityPassport: FinancialEvidenceCoverageSourceV1;
    billingDependency: FinancialEvidenceCoverageSourceV1;
  };
}

const STATES = new Set<string>(['complete', 'partial', 'stale', 'missing', 'unavailable', 'unknown']);
const STATE_PRIORITY: Record<FinancialEvidenceCoverageStateV1, number> = {
  complete: 0,
  partial: 1,
  stale: 2,
  unknown: 3,
  missing: 4,
  unavailable: 5,
};
const REASONS = new Set<string>(FINANCIAL_EVIDENCE_COVERAGE_REASONS_V1);
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasExactFields = (value: Record<string, unknown>, required: readonly string[], optional: readonly string[] = []): boolean => {
  const allowed = new Set([...required, ...optional]);
  return required.every(field => Object.prototype.hasOwnProperty.call(value, field)) && Object.keys(value).every(field => allowed.has(field));
};

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim() === value && value.length > 0;

const isCanonicalTimestamp = (value: unknown): value is string =>
  typeof value === 'string' &&
  ISO_TIMESTAMP_PATTERN.test(value) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(Date.parse(value)).toISOString() === value;

const isReasonList = (value: unknown): value is [FinancialEvidenceCoverageReasonV1, ...FinancialEvidenceCoverageReasonV1[]] =>
  Array.isArray(value) && value.length > 0 && new Set(value).size === value.length && value.every(reason => typeof reason === 'string' && REASONS.has(reason));

const isSource = (value: unknown): value is FinancialEvidenceCoverageSourceV1 => {
  if (!isRecord(value) || !hasExactFields(value, ['state', 'reasons'], ['generationId', 'completeThrough'])) return false;
  if (typeof value.state !== 'string' || !STATES.has(value.state) || !isReasonList(value.reasons)) return false;
  if (value.state === 'complete' ? value.reasons.length !== 1 || value.reasons[0] !== 'coverage-complete' : value.reasons.includes('coverage-complete')) {
    return false;
  }
  if (value.generationId !== undefined && !isNonEmptyString(value.generationId)) return false;
  return value.completeThrough === undefined || isCanonicalTimestamp(value.completeThrough);
};

/** Exact dependency-free validator for the API/UI coverage boundary. */
export const isFinancialEvidenceCoverageProjectionV1 = (value: unknown): value is FinancialEvidenceCoverageProjectionV1 => {
  if (
    !isRecord(value) ||
    !hasExactFields(value, [
      'contractVersion',
      'provider',
      'subscriptionId',
      'publicationId',
      'artifactGeneration',
      'scope',
      'state',
      'reasons',
      'sources',
    ]) ||
    value.contractVersion !== FINANCIAL_EVIDENCE_COVERAGE_CONTRACT_VERSION_V1 ||
    value.provider !== 'azure' ||
    !isNonEmptyString(value.subscriptionId) ||
    !isNonEmptyString(value.publicationId) ||
    typeof value.state !== 'string' ||
    !STATES.has(value.state) ||
    !isReasonList(value.reasons)
  ) {
    return false;
  }
  if (
    !isRecord(value.artifactGeneration) ||
    !hasExactFields(value.artifactGeneration, ['runId', 'generatedAt']) ||
    !isNonEmptyString(value.artifactGeneration.runId) ||
    !isCanonicalTimestamp(value.artifactGeneration.generatedAt)
  ) {
    return false;
  }
  if (
    !isRecord(value.scope) ||
    !hasExactFields(value.scope, ['kind', 'subscriptionId']) ||
    value.scope.kind !== 'subscription' ||
    value.scope.subscriptionId !== value.subscriptionId
  ) {
    return false;
  }
  if (
    !isRecord(value.sources) ||
    !hasExactFields(value.sources, ['capabilityPassport', 'billingDependency']) ||
    !isSource(value.sources.capabilityPassport) ||
    !isSource(value.sources.billingDependency)
  ) {
    return false;
  }
  const sources = [value.sources.capabilityPassport, value.sources.billingDependency];
  const expectedState = sources.reduce<FinancialEvidenceCoverageStateV1>(
    (current, candidate) => (STATE_PRIORITY[candidate.state] > STATE_PRIORITY[current] ? candidate.state : current),
    'complete'
  );
  if (value.state !== expectedState) return false;
  const expectedReasons = new Set(
    expectedState === 'complete'
      ? ['coverage-complete' as const]
      : sources.flatMap(candidate => candidate.reasons).filter(reason => reason !== 'coverage-complete')
  );
  return expectedReasons.size === value.reasons.length && value.reasons.every(reason => expectedReasons.has(reason));
};
