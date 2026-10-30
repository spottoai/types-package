/** Existing account-lifecycle work-lease policy, shared by CAS storage adapters. */
export declare const AWS_ACCOUNT_LIFECYCLE_MAX_WORK_LEASES = 32;
export interface AwsAccountLifecycleWorkLeaseRecord {
    leaseId: string;
    owner: string;
    acquiredAt: string;
    expiresAt: string;
}
/** The policy does not authorize company/connection membership; adapters must. */
export interface AwsAccountLifecycleWorkLeaseOwnership {
    awsAccountId: string;
    incarnationId?: string;
    state: 'provisioning' | 'active' | 'offboarding' | 'offboarded';
    workLeases?: AwsAccountLifecycleWorkLeaseRecord[];
}
export interface AwsAccountLifecycleWorkLeaseIdentity {
    accountId: string;
    incarnationId: string;
    leaseId: string;
    owner: string;
}
export interface AwsAccountLifecycleWorkLeaseAcquireRequest extends AwsAccountLifecycleWorkLeaseIdentity {
    leaseDurationMs?: number;
}
type StaleWorkLeaseDecision = {
    status: 'settled-stale';
    reason: 'ownership-missing' | 'ownership-account-mismatch' | 'ownership-inactive' | 'incarnation-mismatch';
};
export type AwsAccountLifecycleWorkLeaseDecision = {
    status: 'acquired';
    lease: AwsAccountLifecycleWorkLeaseRecord;
} | StaleWorkLeaseDecision;
export type AwsAccountLifecycleWorkLeaseReleaseDecision = {
    status: 'released';
    released: boolean;
} | StaleWorkLeaseDecision;
export interface AwsAccountLifecycleWorkLeasePlan<Decision> {
    decision: Decision;
    writeRequired: boolean;
    /** Replace this field alone after a successful ETag CAS; preserve the outer saga. */
    workLeases?: AwsAccountLifecycleWorkLeaseRecord[];
}
export declare class AwsAccountLifecycleWorkLeaseError extends Error {
    readonly code: 'aws-account-work-lease-capacity' | 'aws-account-work-lease-conflict';
    readonly retryable = true;
    constructor(code: 'aws-account-work-lease-capacity' | 'aws-account-work-lease-conflict');
}
export declare function isAwsAccountLifecycleIncarnationId(value: unknown): value is string;
/** Same acceptance policy as the engine's account lifecycle saga storage reader. */
export declare function isAwsAccountLifecycleWorkLeases(value: unknown): value is AwsAccountLifecycleWorkLeaseRecord[] | undefined;
export declare function normalizeAwsAccountLifecycleWorkLeaseIdentity(request: AwsAccountLifecycleWorkLeaseIdentity): AwsAccountLifecycleWorkLeaseIdentity;
export declare function normalizeAwsAccountLifecycleWorkLeaseDuration(value: number | undefined): number;
export declare function hasUnexpiredAwsAccountLifecycleWorkLeases(ownership: Pick<AwsAccountLifecycleWorkLeaseOwnership, 'workLeases'>, now: Date): boolean;
/** A plan never writes storage. Publish workLeases only after the adapter's CAS succeeds. */
export declare function planAwsAccountLifecycleWorkLeaseAcquire(ownership: AwsAccountLifecycleWorkLeaseOwnership | undefined, identity: AwsAccountLifecycleWorkLeaseIdentity, leaseDurationMs: number, now: Date): AwsAccountLifecycleWorkLeasePlan<AwsAccountLifecycleWorkLeaseDecision>;
export declare function planAwsAccountLifecycleWorkLeaseRelease(ownership: AwsAccountLifecycleWorkLeaseOwnership | undefined, identity: AwsAccountLifecycleWorkLeaseIdentity, now: Date): AwsAccountLifecycleWorkLeasePlan<AwsAccountLifecycleWorkLeaseReleaseDecision>;
export {};
//# sourceMappingURL=awsAccountLifecycleWorkLease.d.ts.map