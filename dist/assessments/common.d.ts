export interface AssessmentTraceabilityReference {
    evidenceIds?: string[];
    findingIds?: string[];
    recommendationIds?: string[];
    actionItemIds?: string[];
}
export interface AssessmentStorageReference {
    storageArea: 'accounts-data';
    path: string;
    etag?: string;
}
export interface AssessmentFailureMetadata {
    code: string;
    message: string;
    retryable?: boolean;
    failedAt: string;
}
export interface AssessmentScope {
    cloudAccountIds: string[];
    subscriptionIds: string[];
    tenantId?: string;
}
export interface AssessmentActorMetadata {
    userId?: string;
    displayName?: string;
}
//# sourceMappingURL=common.d.ts.map