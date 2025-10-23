export interface EventStatusRecord {
    eventId: string;
    objectKey: string;
    label: string;
    event: string;
    eventDomain: string;
    objectType: string;
    objectId?: string;
    subjectId?: string;
    scope?: string;
    status: string;
    statusAt: string;
    statusHistory: Array<{
        status: string;
        occurredAt: string;
    }>;
    subscriptionId?: string;
    tenantId?: string;
    companyId?: string;
    errorMessage?: string;
    errorStack?: string[];
    sharedWith?: string[];
    channel?: string;
    userId?: string;
    context?: Record<string, unknown>;
}
export interface UserEventRecord {
    userId: string;
    eventId: string;
    objectKey?: string;
    label: string;
    event: string;
    eventDomain: string;
    objectType: string;
    objectId?: string;
    subjectId?: string;
    status: string;
    statusAt: string;
    subscriptionId?: string;
    tenantId?: string;
    companyId?: string;
    errorMessage?: string;
    channel?: string;
    sharedWith?: string[];
    lastStatusRead: boolean;
}
//# sourceMappingURL=eventStatus.d.ts.map