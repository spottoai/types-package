export declare const RESOURCE_STRATEGY_CONTRACT_LIMITS: {
    readonly textLength: 500;
    readonly rules: 64;
    readonly ruleDays: 7;
    readonly resourceTypes: 64;
    readonly metadataItems: 64;
    readonly evidenceReferences: 32;
    readonly draftPeriodKeys: 64;
    readonly grantGroups: 128;
    readonly permissionOperations: 8192;
    readonly listResults: 100;
    readonly dryRunChecks: 7;
    readonly dryRunReasonCodes: 32;
    readonly dryRunDtoBytes: 16384;
    readonly dryRunMaxTtlMs: number;
    readonly parameterBytes: 32768;
    readonly publicDtoBytes: 262144;
};
export type ResourceSchedulingStrategy = 'on-off' | 'sku-change' | 'dial' | 'recreate';
export type ResourceStrategy = ResourceSchedulingStrategy;
export type ResourceScheduleTransition = 'reduce' | 'restore';
export type ResourceStrategyTransition = ResourceScheduleTransition;
export type SchedulingBillingClass = 'A-meter-stops' | 'B-meter-reduces' | 'C-no-material-saving';
export type ResourceScheduleWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export interface ResourceSchedulingCapabilityRef {
    capabilityId: string;
    capabilityVersion: number;
}
export interface ResourceSchedulingCapabilityProjection {
    capability: ResourceSchedulingCapabilityRef;
    contentHash: string;
    publishedAtUtc: string;
    provider: string;
    resourceTypes: string[];
    strategy: ResourceSchedulingStrategy;
    displayName: string;
    description: string;
    presentation: {
        resourceKindLabel: string;
        reduceTransitionLabel: string;
        restoreTransitionLabel: string;
        reducedStateLabel: string;
        restoredStateLabel: string;
    };
    configurationSchemaKind: string;
    configurationSchema: Record<string, unknown>;
    recommendationMaturity: 'unsupported' | 'candidate' | 'supported';
    lifecycleStatus: 'published' | 'deprecated' | 'withdrawn';
    executionPolicy: {
        authoring: 'allowed' | 'blocked';
        reduce: 'allowed' | 'blocked';
        restore: 'allowed' | 'blocked';
        disableReason?: string;
        supersededBy?: ResourceSchedulingCapabilityRef;
    };
    baseline: {
        policy: 'none' | 'capture-selected-state' | 'capture-resource-snapshot';
        mutationDomains: string[];
        coupledValueLabels?: string[];
        driftPolicy: 'block' | 'adopt-before-reduce' | 'restore-captured' | 'capability-defined';
    };
    cost: {
        billingClass: SchedulingBillingClass;
        reducedMeters: string[];
        retainedMeters: string[];
        billingGranularityMinutes?: number;
        minimumUsefulReducedMinutes?: number;
        commitmentInteraction: 'none' | 'may-reduce-invoice-saving' | 'unknown';
    };
    cadence: {
        minimumTransitionIntervalMinutes: number;
        maximumChangesPerRollingWindow?: {
            changes: number;
            windowMinutes: number;
        };
        maximumReducedDurationMinutes?: number;
        preferredBillingBoundary?: 'none' | 'start-of-hour';
        reduceFlexMinutes?: number;
    };
    disruption: {
        reversibility: 'reversible' | 'conditional' | 'destructive';
        risk: 'low' | 'medium' | 'high';
        affectedScopeLabel: string;
        expectedDowntimeMinutes?: {
            minimum: number;
            maximum: number;
        };
        supportedBusyPolicies: Array<'skip' | 'wait-until-deadline' | 'force'>;
    };
    restore: {
        restoreLeadMinutes: number;
        capacityReturnRisk: 'none-known' | 'possible' | 'high' | 'unknown';
        retryPolicyLabel: string;
        escalationClass: string;
    };
    automation: {
        ownership: 'spotto' | 'native' | 'coexistence-proven' | 'unsupported-conflict';
        conflictingControllerLabels: string[];
    };
    dependencies: {
        hasDependencies: boolean;
        summary?: string;
        mutableIdentityRisk?: boolean;
    };
    acknowledgement?: {
        version: string;
        severity: 'info' | 'warning' | 'destructive';
        message: string;
    };
}
export type ResourceSchedulingReadinessState = 'ready' | 'blocked' | 'pending-permission-propagation' | 'missing-permission' | 'scope-mismatch' | 'manifest-outdated' | 'credential-unavailable' | 'permission-check-unavailable' | 'blocked-by-lock' | 'blocked-by-deny-assignment' | 'blocked-by-policy' | 'target-missing' | 'dependency-unready' | 'conflicting-automation' | 'unsupported-resource-state';
export interface ResourceSchedulingReadinessProjection {
    companyId: string;
    cloudAccountId: string;
    providerScopeId: string;
    resourceId: string;
    capability: ResourceSchedulingCapabilityRef;
    state: ResourceSchedulingReadinessState;
    checkedAtUtc: string;
    expiresAtUtc: string;
    reasonCodes: string[];
    missingActions?: string[];
    requiredScopes?: string[];
    offendingScopes?: string[];
    repairLink?: string;
}
export interface ResourceStrategyWeeklyRule {
    ruleId: string;
    transition: ResourceScheduleTransition;
    daysOfWeek: ResourceScheduleWeekday[];
    desiredStateAtLocal: string;
    parameters?: Record<string, unknown>;
}
export interface ResourceStrategyWeeklyScheduleSuggestion {
    definitionType: 'resource-strategy-weekly';
    capability: ResourceSchedulingCapabilityRef;
    providerScopeId?: never;
    cloudAccountId?: never;
    resourceId?: never;
    name?: never;
    timezone?: never;
    initialMode?: never;
    notificationPolicyId?: never;
    notes?: never;
    defaultParameters?: Record<string, unknown>;
    rules: ResourceStrategyWeeklyRule[];
    busyPolicy?: {
        mode: 'skip' | 'wait-until-deadline' | 'force';
        maxDelayMinutes?: number;
    };
    blackoutDatesLocal?: string[];
    activeFromUtc?: string;
    activeUntilUtc?: string;
    acknowledgementVersion?: string;
    firstExecutionAcknowledgementVersion?: string;
}
export interface ResourceStrategyWeeklyScheduleWriteRequest {
    definitionType: 'resource-strategy-weekly';
    providerScopeId: string;
    cloudAccountId: string;
    resourceId: string;
    capability: ResourceSchedulingCapabilityRef;
    name: string;
    timezone: string;
    defaultParameters?: Record<string, unknown>;
    rules: ResourceStrategyWeeklyRule[];
    busyPolicy?: {
        mode: 'skip' | 'wait-until-deadline' | 'force';
        maxDelayMinutes?: number;
    };
    blackoutDatesLocal?: string[];
    activeFromUtc?: string;
    activeUntilUtc?: string;
    initialMode: 'draft' | 'dry-run' | 'active';
    notificationPolicyId: string;
    acknowledgementVersion?: string;
    firstExecutionAcknowledgementVersion?: string;
    notes?: string;
}
export interface ResourceStrategyWeeklyScheduleProjection {
    scheduleId: string;
    definitionRevision: number;
    controlGeneration: number;
    etag: string;
    status: 'draft' | 'dry-run' | 'active' | 'paused' | 'restore-only';
    definition: ResourceStrategyWeeklyScheduleWriteRequest;
    permissionManifest: ResourceSchedulePermissionManifestRef;
    createdAtUtc: string;
    createdBy: string;
    updatedAtUtc: string;
    updatedBy: string;
    acknowledgement?: {
        version: string;
        acknowledgedAtUtc: string;
        acknowledgedBy: string;
    };
    firstExecutionAcknowledgement?: {
        version: string;
        acknowledgedAtUtc: string;
        acknowledgedBy: string;
    };
}
export interface ResourceStrategyWeeklyScheduleListResponse {
    results: ResourceStrategyWeeklyScheduleProjection[];
    continuation?: {
        cursor: string;
    };
}
export type ResourceScheduleDryRunCheckName = 'ownership' | 'readiness' | 'mutation-contention' | 'busy-policy' | 'blackout' | 'admission-budgets' | 'notification-routing';
export interface ResourceScheduleDryRunCheckProjection {
    name: ResourceScheduleDryRunCheckName;
    status: 'ready' | 'blocked';
    reasonCodes: string[];
}
export interface ResourceScheduleDryRunProjection {
    scheduleId: string;
    definitionRevision: number;
    controlGeneration: number;
    evaluatedAtUtc: string;
    expiresAtUtc: string;
    freshness: 'fresh' | 'stale';
    windowStartUtc: string;
    windowEndUtc: string;
    occurrenceCount: number;
    status: 'ready' | 'blocked';
    checks: ResourceScheduleDryRunCheckProjection[];
    permissionConsent: ResourceSchedulePermissionManifestConsent;
}
export type ResourceScheduleDryRunEvaluationStatus = 'queued' | 'running' | 'retrying' | 'ready' | 'blocked' | 'failed';
export interface ResourceScheduleDryRunEvaluationError {
    code: string;
    message: string;
}
export interface ResourceScheduleDryRunEvaluationProjection {
    scheduleId: string;
    definitionRevision: number;
    controlGeneration: number;
    evaluationId: string;
    status: ResourceScheduleDryRunEvaluationStatus;
    queuedAtUtc: string;
    startedAtUtc?: string;
    updatedAtUtc: string;
    completedAtUtc?: string;
    attemptCount: number;
    nextAttemptAtUtc?: string;
    result?: ResourceScheduleDryRunProjection;
    error?: ResourceScheduleDryRunEvaluationError;
}
export interface ScheduledResourceTransitionV1 {
    schemaVersion: 1;
    companyId: string;
    providerScopeId: string;
    cloudAccountId: string;
    resourceId: string;
    scheduleId: string;
    definitionRevision: number;
    controlGeneration: number;
    ruleId: string;
    occurrenceKey: string;
    scheduleRunId: string;
    desiredStateAtUtc: string;
    dispatchNotBeforeUtc: string;
    reduceDeadlineUtc?: string;
    capability: ResourceSchedulingCapabilityRef;
    transition: ResourceScheduleTransition;
    parameters: Record<string, unknown>;
    permissionManifest: ResourceSchedulePermissionManifestRef;
    correlationId: string;
}
export type ResourceSchedulingLifecycleState = 'unknown' | 'normal' | 'reducing' | 'reduced' | 'restoring' | 'reduce-failed' | 'restore-failed' | 'drifted' | 'target-missing' | 'stranded';
export type ResourceSchedulingRunPhase = 'queued' | 'leased' | 'preflight' | 'capturing-baseline' | 'executing' | 'polling' | 'verifying';
export type ResourceSchedulingRunOutcome = 'succeeded' | 'no-op' | 'skipped' | 'blocked' | 'failed' | 'superseded' | 'expired';
export interface ResourceSchedulingExecutionProjection {
    companyId: string;
    resourceId: string;
    scheduleId?: string;
    definitionRevision?: number;
    controlGeneration: number;
    lifecycleState: ResourceSchedulingLifecycleState;
    activeRecoveryCycleId?: string;
    restoreOwed: boolean;
    lastRun?: {
        scheduleRunId: string;
        transition: ResourceScheduleTransition;
        phase?: ResourceSchedulingRunPhase;
        outcome?: ResourceSchedulingRunOutcome;
        desiredStateAtUtc: string;
        updatedAtUtc: string;
        reasonCode?: string;
    };
    allowedCommands: Array<'pause' | 'resume' | 'restore-now' | 'restore-and-delete' | 'leave-current-state'>;
    updatedAtUtc: string;
}
export interface ResourceSchedulingExecutionHistoryItem {
    scheduleRunId: string;
    resourceId: string;
    transition: ResourceScheduleTransition;
    desiredStateAtUtc: string;
    claimedAtUtc: string;
    completedAtUtc?: string;
    outcome?: ResourceSchedulingRunOutcome;
    reasonCode?: string;
    attemptCount: number;
}
export interface ResourceSchedulingExecutionHistoryResponse {
    execution: ResourceSchedulingExecutionProjection;
    runs: ResourceSchedulingExecutionHistoryItem[];
}
export type ResourceScheduleMoneyBasis = 'billed' | 'amortized';
export type ResourceScheduleMoneyProvenance = 'billing-backed' | 'estimated' | 'blended';
export type ResourceScheduleMoneyAdditivity = 'scenario' | 'portfolio';
export interface ResourceScheduleMoneyPeriod {
    startDate: string;
    endDate: string;
}
export interface ResourceScheduleMoneyProjection {
    measure: 'savings';
    amount: string;
    basis: ResourceScheduleMoneyBasis;
    provenance: ResourceScheduleMoneyProvenance;
    period: ResourceScheduleMoneyPeriod;
    currency: string;
    additivity: ResourceScheduleMoneyAdditivity;
    evidenceObservedAtUtc: string;
    coverage: 'complete' | 'partial';
    components: ResourceScheduleMoneyComponentProjection[];
}
export interface ResourceScheduleMoneyComponentProjection {
    componentId: string;
    amount: string;
    unit: string;
    tier?: string;
}
export interface ResourceScheduleScenarioMoneyProjection extends Omit<ResourceScheduleMoneyProjection, 'additivity'> {
    additivity: 'scenario';
}
export type ResourceSchedulePreviewAvailability = 'available' | 'unavailable';
export type ResourceSchedulePreviewUnavailableReason = 'missing-evidence' | 'stale-evidence' | 'mixed-currency' | 'unsupported' | 'calculation-failed';
export interface ResourceSchedulePreviewRequest {
    draft: ResourceStrategyWeeklyScheduleWriteRequest;
    draftHash: string;
    evidenceReferences: string[];
    concurrency: {
        requestVersion: number;
        evidenceVersion?: string;
    };
    draftPeriodKeys?: string[];
}
export interface ResourceScheduleAvailableWindowPreview {
    draftPeriodKey: string;
    availability: 'available';
    projection: ResourceScheduleScenarioMoneyProjection;
}
export interface ResourceScheduleUnavailableWindowPreview {
    draftPeriodKey: string;
    availability: 'unavailable';
    unavailableReason: ResourceSchedulePreviewUnavailableReason;
}
export type ResourceScheduleWindowPreview = ResourceScheduleAvailableWindowPreview | ResourceScheduleUnavailableWindowPreview;
interface ResourceSchedulePreviewResponseBase {
    draftHash: string;
    requestVersion: number;
    windows: ResourceScheduleWindowPreview[];
}
export type ResourceSchedulePreviewResponse = (ResourceSchedulePreviewResponseBase & {
    availability: 'available';
    aggregate: ResourceScheduleScenarioMoneyProjection;
}) | (ResourceSchedulePreviewResponseBase & {
    availability: 'unavailable';
    unavailableReason: ResourceSchedulePreviewUnavailableReason;
});
interface ResourceSchedulingOpportunityBase {
    opportunityId: string;
    provider: string;
    providerScopeId: string;
    cloudAccountId?: string;
    resourceId: string;
    capability: ResourceSchedulingCapabilityRef;
    suggestedDefinition?: ResourceStrategyWeeklyScheduleSuggestion;
    observedAtUtc: string;
}
export type ResourceSchedulingOpportunity = ResourceSchedulingOpportunityBase & ({
    projectionAvailability: 'available';
    projection: ResourceScheduleScenarioMoneyProjection;
} | {
    projectionAvailability: 'unavailable';
    projectionUnavailableReason: ResourceSchedulePreviewUnavailableReason;
});
export interface ResourceSchedulePermissionManifestRef {
    version: string;
    contentHash: string;
}
export interface ResourceSchedulePermissionOperationProjection {
    operation: string;
    permissionSetRefs: string[];
    reason: string;
    evidenceUrl: string;
}
export interface ResourceSchedulePermissionGrantGroupProjection {
    groupHash: string;
    provider: string;
    providerScopeId: string;
    exactAssignmentScope: string;
    operationSetHash: string;
    principalRef: string;
    roleDefinitionRef: string;
    roleName: string;
    roleDefinitionScope: string;
    roleAssignmentRef: string;
    actions: ResourceSchedulePermissionOperationProjection[];
    dataActions: ResourceSchedulePermissionOperationProjection[];
    disclosureKeys?: string[];
}
export interface ResourceSchedulePermissionChangeOperationProjection {
    groupHash: string;
    providerScopeId: string;
    exactAssignmentScope: string;
    operationKind: 'action' | 'data-action';
    operation: string;
}
export interface ResourceSchedulePermissionManifestProjection {
    schemaVersion: 1;
    provider: string;
    version: string;
    contentHash: string;
    capabilityVersions: ResourceSchedulingCapabilityRef[];
    orderedGrantGroupHashes: string[];
    grantGroups: ResourceSchedulePermissionGrantGroupProjection[];
    generatedAtUtc: string;
    evidenceObservedAtUtc: string;
    expiresAtUtc: string | null;
    reviewStatus: 'current' | 'review-required' | 'expired';
    change: {
        status: 'new' | 'unchanged' | 'expanding' | 'narrowing' | 'missing';
        addedOperations: ResourceSchedulePermissionChangeOperationProjection[];
        removedOperations: ResourceSchedulePermissionChangeOperationProjection[];
    };
}
export interface ResourceSchedulePermissionManifestConsent extends ResourceSchedulePermissionManifestRef {
    orderedGrantGroupHashes: string[];
}
export type ResourceStrategyScheduleCommand = {
    command: 'pause';
    idempotencyKey: string;
} | {
    command: 'resume';
    idempotencyKey: string;
} | {
    command: 'rerun-dry-run';
    idempotencyKey: string;
} | {
    command: 'restore-now';
    idempotencyKey: string;
} | {
    command: 'restore-and-delete';
    idempotencyKey: string;
} | {
    command: 'leave-current-state';
    idempotencyKey: string;
    acknowledgement: string;
};
export {};
//# sourceMappingURL=resourceStrategyContracts.d.ts.map