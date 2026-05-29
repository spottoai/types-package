export declare const PORTAL_ACTIVITY_LOG_SCHEMA_VERSION: "2026-05-02.change-monitoring-v1";
export declare const PORTAL_ACTIVITY_LOG_FILE: "activity-logs.json";
export type PortalActivityLogActorType = 'user' | 'servicePrincipal' | 'managedIdentity' | 'platform' | 'unknown';
export type PortalActivityLogActorResolutionSource = 'caller' | 'arg' | 'entra-signin' | 'entra-audit' | 'derived' | 'tenant-principals';
export type PortalActivityLogKind = 'change' | 'security' | 'operation' | 'health';
export type PortalActivityLogImportance = 'high' | 'medium' | 'low';
export type PortalActivityLogFeedMode = 'all-advanced' | 'changes-default' | 'security' | 'health';
export type PortalActivityLogSuppressionReason = 'autoscale' | 'operational-lookup' | 'platform' | 'non-change';
export interface PortalActivityLogSource {
    rawEventCount: number;
    retainedEventCount: number;
    changeCount: number;
    securityCount: number;
    healthCount: number;
    suppressedCount: number;
    latestRawTimestamp?: string;
}
export interface PortalActivityLogEntry {
    eventTimestamp: string;
    firstEventTimestamp: string;
    lastEventTimestamp: string;
    eventCount: number;
    statusCounts: Record<string, number>;
    collapsed: boolean;
    category: string;
    level: string;
    status: string;
    statusDetail?: string;
    operationName: string;
    operation: string;
    caller: string;
    resourceId?: string;
    resourceName?: string;
    eventId?: string;
    description?: string;
    feedModes: PortalActivityLogFeedMode[];
    actorType: PortalActivityLogActorType;
    actorDisplay: string;
    actorRaw: string;
    actorId?: string;
    actorResolutionSource: PortalActivityLogActorResolutionSource;
    clientType?: string;
    kind: PortalActivityLogKind;
    subtype: string;
    isMaterialChange: boolean;
    isSecuritySensitive: boolean;
    isPlatformEvent: boolean;
    importance: PortalActivityLogImportance;
}
export interface PortalActivityLogSuppressedSummary {
    reason: PortalActivityLogSuppressionReason;
    count: number;
    sampleOperation?: string;
    sampleResourceName?: string;
}
export interface PortalActivityLog {
    schemaVersion: typeof PORTAL_ACTIVITY_LOG_SCHEMA_VERSION;
    generatedAt: string;
    source: PortalActivityLogSource;
    changes: PortalActivityLogEntry[];
    security: PortalActivityLogEntry[];
    health: PortalActivityLogEntry[];
    suppressed: PortalActivityLogSuppressedSummary[];
}
//# sourceMappingURL=activityLogs.d.ts.map