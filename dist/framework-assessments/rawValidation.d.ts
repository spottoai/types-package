import type { AssessmentJsonValue, AssessmentNativeScope, ParsedScopeScanRawFinding } from './contracts';
/** Only this check emits one row per credential for a single app identity. */
/**
 * Repeated results for one resource and check are summarised (FAIL over MANUAL over PASS) instead of failing the scan:
 * per-credential app results in a tenant, and AWS account scans, where some checks report a resource once per region.
 */
export declare const isAggregatedScopeScanCheck: (scopeType: string, checkId: string) => boolean;
export declare const SCOPE_SCAN_FINDING_STATUS_PRIORITY: Readonly<{
    PASS: 0;
    MANUAL: 1;
    FAIL: 2;
}>;
/** Use the page envelope so single-item acceptance and eventual page parsing have identical depth limits. */
export declare const parseScopeScanRawItem: (value: unknown) => AssessmentJsonValue;
/**
 * An AWS resource belongs to the scanned account when it is the account itself, or an ARN whose account segment is
 * empty (global resources such as S3 buckets) or equal to the account. ARNs are case-sensitive and are not folded.
 */
export declare const isAwsResourceInAccount: (uid: string, accountId: string) => boolean;
/** Positive native-scope contradictions are terminal even when another field would quarantine the row. */
export declare const parseScopeScanRawFinding: (value: unknown, expected: {
    scope: AssessmentNativeScope;
    sourceVersion: string;
    selectedCheckIds: readonly string[];
}) => ParsedScopeScanRawFinding | null;
//# sourceMappingURL=rawValidation.d.ts.map