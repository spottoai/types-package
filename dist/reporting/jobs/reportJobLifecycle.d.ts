import { type ReportJobRowV1 } from './reportJobRow';
/** Runtime ownership, verified artifact and recovery budget must come from trusted service state. */
export type ReportJobUpdateContextV1 = {
    expectedEtag: string;
    actualEtag: string;
    nowUtc: string;
} & ({
    writer: 'producer';
    publicationOutcome?: 'definitively-rejected';
} | {
    writer: 'worker';
    workerId: string;
} | {
    writer: 'notifier';
    verifiedArtifactContentSha256: string;
} | {
    writer: 'notification-blocker';
    blockedArtifactContentSha256: string;
    notificationAttemptCount: number;
} | {
    writer: 'maintenance';
    minimumAgeMs: number;
    recoveryAttempts: number;
    maximumRecoveryAttempts: number;
});
export type ReportJobUpdateResultV1 = {
    ok: true;
    row: ReportJobRowV1;
    expectedEtag: string;
} | {
    ok: false;
    errors: string[];
};
/**
 * Pure lifecycle boundary, not a storage lock. The caller MUST conditionally replace the returned full row with
 * If-Match expectedEtag; a read/validate followed by an unconditional write remains unsafe. No wildcard ETags.
 * Parsing both rows preserves all default field groups and rejects malformed stored requests.
 */
export declare const validateReportJobUpdateV1: (current: unknown, next: unknown, context: ReportJobUpdateContextV1) => Promise<ReportJobUpdateResultV1>;
//# sourceMappingURL=reportJobLifecycle.d.ts.map