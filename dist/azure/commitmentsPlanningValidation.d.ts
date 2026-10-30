/** Dependency-free runtime guards for Azure commitments planning freshness evidence. */
import { type CommitmentsFreshnessEntry, type CommitmentsFreshnessReasonCode, type CommitmentsFreshnessStatus, type CommitmentsFreshnessSummary } from './commitmentsPlanning.js';
import { type JsonRecord } from '../common/validationHelpers.js';
export declare const isCommitmentsFreshnessStatus: (value: unknown) => value is CommitmentsFreshnessStatus;
export declare const isCommitmentsFreshnessReasonCode: (value: unknown) => value is CommitmentsFreshnessReasonCode;
/** Finite, non-negative and rounded to one decimal place. */
export declare const isCommitmentsFreshnessAgeHours: (value: unknown) => value is number;
/**
 * Checks only the diagnostic fields shared by every commitments freshness producer:
 * `ageHours` requires `lastSuccessfulSyncAt` and is a non-negative one-decimal number;
 * `reasonCode` is a known code, and `collection-stale` appears only with status `stale`.
 */
export declare const hasValidCommitmentsFreshnessDiagnostics: (entry: JsonRecord) => boolean;
/** Throwing form of `hasValidCommitmentsFreshnessDiagnostics` for exact public-artifact validators. */
export declare function assertCommitmentsFreshnessDiagnostics(entry: JsonRecord, field: string): void;
export declare const isCommitmentsFreshnessEntry: (value: unknown) => value is CommitmentsFreshnessEntry;
export declare const isCommitmentsFreshnessSummary: (value: unknown) => value is CommitmentsFreshnessSummary;
//# sourceMappingURL=commitmentsPlanningValidation.d.ts.map