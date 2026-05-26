export type AlertDefinitionRunStatus = 'running' | 'success' | 'failed';
/**
 * Runtime metadata for alert definition evaluation runs.
 * Stored as a blob so the API scheduler can decide when to enqueue the next run.
 */
export interface AlertDefinitionRunState {
    companyId: string;
    definitionId: string;
    lastStartedAt?: string;
    lastCompletedAt?: string;
    lastStatus?: AlertDefinitionRunStatus;
    lastDurationMs?: number;
    lastError?: string;
    lastCorrelationId?: string;
    /**
     * Optional debug: what subscriptions the definition scope resolved to.
     * This is useful for tag-scoped definitions where subscription discovery can fail.
     */
    lastScopeResolvedAt?: string;
    lastScopeSubscriptionIdsCount?: number;
    lastScopeSubscriptionIdsSample?: string[];
}
//# sourceMappingURL=alertDefinitionRun.d.ts.map