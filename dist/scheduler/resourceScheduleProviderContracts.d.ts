import type { ResourceScheduleTransition, ResourceSchedulingCapabilityRef, ResourceSchedulingReadinessState, ScheduledResourceTransitionV1 } from './resourceStrategyContracts';
/**
 * Cross-engine resource-schedule execution. The scheduling kernel keeps all
 * schedule state and sends one request per readiness check or transition to the
 * provider engine; the provider engine replies with exactly one result.
 * AWS: request on `aws-request` (SessionId = AWS account ID), result on
 * `azure-request` (no session).
 */
export declare const RESOURCE_SCHEDULE_PROVIDER_CONTRACT_LIMITS: {
    readonly messageBytes: 16384;
    readonly reasonCodes: 32;
    readonly missingActions: 64;
};
export declare const RESOURCE_SCHEDULE_PROVIDERS: readonly ["aws"];
export type ResourceScheduleProvider = (typeof RESOURCE_SCHEDULE_PROVIDERS)[number];
export type ResourceScheduleProviderAction = 'check' | 'transition';
export type ResourceScheduleProviderIntent = 'ordinary' | 'owed-restore';
export type ResourceScheduleProviderOutcome = 'succeeded' | 'no-op' | 'blocked' | 'in-progress' | 'failed';
export interface ResourceScheduleProviderRequestV1 {
    schemaVersion: 1;
    provider: ResourceScheduleProvider;
    entity: 'resource-schedule';
    action: ResourceScheduleProviderAction;
    /** Broker message identity. Transition: sha256 of scheduleRunId and attempt count. */
    requestId: string;
    correlationId: string;
    requestedAt: string;
    companyId: string;
    cloudAccountId: string;
    /** Provider account scope; for AWS the 12-digit account ID (= providerScopeId). */
    accountId: string;
    /** Provider resource identity; for AWS the instance ARN. */
    resourceId: string;
    capability: ResourceSchedulingCapabilityRef;
    direction: ResourceScheduleTransition;
    intent: ResourceScheduleProviderIntent;
    /** Transition only. */
    transition?: ScheduledResourceTransitionV1;
    /** Transition only: the kernel lease owner that dispatched the command. */
    leaseOwnerId?: string;
}
export interface ResourceScheduleProviderResultV1 {
    schemaVersion: 1;
    provider: ResourceScheduleProvider;
    entity: 'scheduler';
    action: 'provider-result';
    /** The request, echoed unchanged. */
    request: ResourceScheduleProviderRequestV1;
    readiness: {
        state: ResourceSchedulingReadinessState;
        reasonCodes: string[];
        missingActions?: string[];
    };
    /** Transition only. */
    outcome?: ResourceScheduleProviderOutcome;
    /** True when a Stop/Start call was sent in this delivery. */
    submitted?: boolean;
    failure?: {
        reasonCode: string;
        retryable: boolean;
        code?: string;
        statusCode?: number;
        retryAfterSeconds?: number;
    };
    observed: {
        state: string;
        instanceType?: string;
        availabilityZone?: string;
        observedAtUtc: string;
    };
    providerRequestId?: string;
    completedAtUtc: string;
}
//# sourceMappingURL=resourceScheduleProviderContracts.d.ts.map