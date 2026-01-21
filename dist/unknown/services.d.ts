export type UnknownServiceStatus = 'new' | 'triaged' | 'ignored' | 'mapped';
export interface UnknownServiceItem {
    resourceType: string;
    resourceId?: string;
    firstSeen: string;
    lastSeen: string;
    count: number;
    status?: UnknownServiceStatus;
    sampleActivity?: Record<string, unknown>;
    notes?: string;
}
//# sourceMappingURL=services.d.ts.map