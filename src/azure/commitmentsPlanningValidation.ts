/** Dependency-free runtime guards for Azure commitments planning freshness evidence. */
import {
  COMMITMENTS_FRESHNESS_REASON_CODES,
  type CommitmentsFreshnessEntry,
  type CommitmentsFreshnessReasonCode,
  type CommitmentsFreshnessStatus,
  type CommitmentsFreshnessSummary,
  type CommitmentsSourceKind,
} from './commitmentsPlanning.js';
import { isDateTime, isFiniteNumber, isOptionalString, isRecord, isString, isStringArray, type JsonRecord } from '../common/validationHelpers.js';

const FRESHNESS_STATUSES: readonly CommitmentsFreshnessStatus[] = ['current', 'stale', 'partial', 'unavailable'];
const SOURCE_KINDS: readonly CommitmentsSourceKind[] = ['azure-native', 'aws-native', 'spotto-derived', 'fallback-heuristic', 'manual', 'unknown'];

export const isCommitmentsFreshnessStatus = (value: unknown): value is CommitmentsFreshnessStatus =>
  typeof value === 'string' && (FRESHNESS_STATUSES as readonly string[]).includes(value);

export const isCommitmentsFreshnessReasonCode = (value: unknown): value is CommitmentsFreshnessReasonCode =>
  typeof value === 'string' && (COMMITMENTS_FRESHNESS_REASON_CODES as readonly string[]).includes(value);

/** Finite, non-negative and rounded to one decimal place. */
export const isCommitmentsFreshnessAgeHours = (value: unknown): value is number =>
  isFiniteNumber(value) && value >= 0 && Number(value.toFixed(1)) === value;

/**
 * Checks only the diagnostic fields shared by every commitments freshness producer:
 * `ageHours` requires `lastSuccessfulSyncAt` and is a non-negative one-decimal number;
 * `reasonCode` is a known code, and `collection-stale` appears only with status `stale`.
 */
export const hasValidCommitmentsFreshnessDiagnostics = (entry: JsonRecord): boolean =>
  (entry.ageHours === undefined || (isCommitmentsFreshnessAgeHours(entry.ageHours) && entry.lastSuccessfulSyncAt !== undefined)) &&
  (entry.reasonCode === undefined ||
    (isCommitmentsFreshnessReasonCode(entry.reasonCode) && (entry.reasonCode !== 'collection-stale' || entry.status === 'stale')));

/** Throwing form of `hasValidCommitmentsFreshnessDiagnostics` for exact public-artifact validators. */
export function assertCommitmentsFreshnessDiagnostics(entry: JsonRecord, field: string): void {
  if (!hasValidCommitmentsFreshnessDiagnostics(entry)) {
    throw new Error(
      `${field} ageHours must be a non-negative one-decimal number with lastSuccessfulSyncAt, and reasonCode must be a known code (collection-stale only with status stale).`
    );
  }
}

const isOptionalDateTime = (value: unknown): boolean => value === undefined || isDateTime(value);

export const isCommitmentsFreshnessEntry = (value: unknown): value is CommitmentsFreshnessEntry =>
  isRecord(value) &&
  isString(value.section) &&
  isCommitmentsFreshnessStatus(value.status) &&
  isOptionalDateTime(value.generatedAt) &&
  isOptionalDateTime(value.observedAt) &&
  isOptionalDateTime(value.lastSuccessfulSyncAt) &&
  isOptionalString(value.reason) &&
  (value.sourceKind === undefined || (typeof value.sourceKind === 'string' && (SOURCE_KINDS as readonly string[]).includes(value.sourceKind))) &&
  hasValidCommitmentsFreshnessDiagnostics(value);

export const isCommitmentsFreshnessSummary = (value: unknown): value is CommitmentsFreshnessSummary =>
  isRecord(value) &&
  isCommitmentsFreshnessStatus(value.status) &&
  isDateTime(value.generatedAt) &&
  Array.isArray(value.entries) &&
  value.entries.every(isCommitmentsFreshnessEntry) &&
  (value.warnings === undefined || isStringArray(value.warnings));
