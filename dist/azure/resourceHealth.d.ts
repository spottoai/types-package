export declare const RESOURCE_HEALTH_EVENTS_FILE_NAME: "microsoft.resourcehealth-events.json";
export declare const RESOURCE_HEALTH_EVENTS_IMPACTED_RESOURCES_FILE_NAME: "microsoft.resourcehealth-events-impactedresources.json";
export declare const RESOURCE_HEALTH_AVAILABILITY_STATUSES_FILE_NAME: "microsoft.resourcehealth-availabilitystatuses.json";
export declare const RESOURCE_HEALTH_EVENTS_PORTAL_FILE_NAME: "health-events.json";
export declare const RESOURCE_HEALTH_AVAILABILITY_STATUSES_PORTAL_FILE_NAME: "health-availability-statuses.json";
export declare const RESOURCE_HEALTH_INDEX_FILE_NAME: "history/resource-health/index.json";
export declare const AZURE_RESOURCE_HEALTH_EVENTS_SOURCE: "Microsoft.ResourceHealth/events";
export declare const AZURE_RESOURCE_HEALTH_IMPACTED_RESOURCES_SOURCE: "Microsoft.ResourceHealth/events/impactedResources";
export declare const AZURE_RESOURCE_HEALTH_AVAILABILITY_STATUSES_SOURCE: "Microsoft.ResourceHealth/availabilityStatuses";
export declare const RESOURCE_HEALTH_EVENTS_SOURCE: "Microsoft.ResourceHealth/events";
export declare const RESOURCE_HEALTH_EVENTS_IMPACTED_RESOURCES_SOURCE: "Microsoft.ResourceHealth/events/impactedResources";
export declare const RESOURCE_HEALTH_AVAILABILITY_STATUSES_SOURCE: "Microsoft.ResourceHealth/availabilityStatuses";
export type AzureResourceHealthEventType = 'ServiceIssue' | 'PlannedMaintenance' | 'HealthAdvisory' | 'SecurityAdvisory' | 'RCA' | 'EmergingIssues' | 'Billing' | (string & {});
export type AzureResourceHealthEventStatus = 'Active' | 'Resolved' | (string & {});
export type AzureResourceHealthEventLevel = 'Critical' | 'Error' | 'Warning' | 'Informational' | (string & {});
export type AzureResourceHealthEventSource = 'ResourceHealth' | 'ServiceHealth' | (string & {});
export type AzureResourceHealthAvailabilityState = 'Available' | 'Unavailable' | 'Degraded' | 'Unknown' | (string & {});
export interface AzureResourceHealthEvent {
    id: string;
    name: string;
    type: string;
    properties?: AzureResourceHealthEventProperties;
}
export interface AzureResourceHealthEventProperties {
    eventType?: AzureResourceHealthEventType;
    status?: AzureResourceHealthEventStatus;
    eventLevel?: AzureResourceHealthEventLevel;
    level?: AzureResourceHealthEventLevel;
    title?: string;
    summary?: string;
    description?: string;
    header?: string;
    eventSource?: AzureResourceHealthEventSource;
    eventTags?: string[];
    impactStartTime?: string;
    impactMitigationTime?: string;
    lastUpdateTime?: string;
    duration?: number;
    priority?: number;
    reason?: string;
    impact?: AzureResourceHealthImpact[];
    recommendedActions?: AzureResourceHealthRecommendedActions;
    links?: unknown[];
    article?: AzureResourceHealthArticle;
    isEventSensitive?: boolean;
    isHIR?: boolean;
    hirStage?: string;
}
export interface AzureResourceHealthArticle {
    articleContent?: string;
    articleId?: string;
}
export interface AzureResourceHealthImpact {
    impactedService?: string;
    impactedServiceGuid?: string;
    impactedRegions?: AzureResourceHealthImpactedRegion[];
}
export interface AzureResourceHealthImpactedRegion {
    impactedRegion?: string;
    impactedSubscriptions?: string[];
    impactedTenants?: string[];
    status?: string;
    lastUpdateTime?: string;
    updates?: AzureResourceHealthRegionUpdate[];
}
export interface AzureResourceHealthRegionUpdate {
    updateDateTime?: string;
    summary?: string;
    eventTags?: string[];
}
export interface AzureResourceHealthRecommendedActions {
    message?: string;
    localeCode?: string;
    actions?: AzureResourceHealthRecommendedAction[];
}
export interface AzureResourceHealthRecommendedAction {
    actionText?: string;
    groupId?: number;
}
export interface AzureResourceHealthImpactedResource {
    id: string;
    name: string;
    type: string;
    properties?: AzureResourceHealthImpactedResourceProperties;
}
export interface AzureResourceHealthImpactedResourceProperties {
    targetRegion?: string;
    targetResourceId?: string;
    targetResourceType?: string;
    info?: AzureResourceHealthImpactedResourceInfo[];
}
export interface AzureResourceHealthImpactedResourceInfo {
    key: string;
    value: string;
}
export interface AzureResourceHealthAvailabilityStatus {
    id: string;
    name: string;
    type: string;
    location?: string;
    properties?: AzureResourceHealthAvailabilityStatusProperties;
}
export interface AzureResourceHealthAvailabilityStatusProperties {
    availabilityState?: AzureResourceHealthAvailabilityState;
    title?: string;
    summary?: string;
    detailedStatus?: string;
    reasonType?: string;
    reasonChronicity?: string;
    occurredTime?: string;
    reportedTime?: string;
    targetResourceId?: string;
    recentlyResolved?: AzureResourceHealthRecentlyResolved;
    recommendedActions?: AzureResourceHealthRecommendedActions;
    serviceImpactingEvents?: AzureResourceHealthServiceImpactingEvent[];
}
export interface AzureServiceHealthEventSummary {
    id: string;
    trackingId: string;
    subscriptionId: string;
    eventType: AzureResourceHealthEventType;
    status: AzureResourceHealthEventStatus;
    level?: AzureResourceHealthEventLevel;
    title?: string;
    summary?: string;
    impactStartTime?: string;
    impactMitigationTime?: string;
    lastUpdateTime?: string;
    durationSeconds?: number;
    priority?: number;
    impactedServices: string[];
    impactedRegions: string[];
    impactedResourceCount?: number;
    impactedResources?: AzureServiceHealthImpactedResourceSummary[];
    postIncidentReview?: AzureServiceHealthPostIncidentReview;
    recommendedActions?: string[];
    source: typeof AZURE_RESOURCE_HEALTH_EVENTS_SOURCE;
}
export interface AzureServiceHealthImpactedResourceSummary {
    resourceId?: string;
    resourceType?: string;
    region?: string;
}
export interface AzureServiceHealthPostIncidentReview {
    hasPreliminaryPir?: boolean;
    hasFinalPir?: boolean;
    whatHappened?: string;
    whatWentWrongAndWhy?: string;
    howDidMicrosoftRespond?: string;
    howMicrosoftIsReducingRecurrence?: string;
    howCustomersCanReduceImpact?: string;
}
export interface AzurePortalHealthEventsSummary {
    totalEvents: number;
    activeEvents: number;
    resolvedEvents: number;
    finalPirEvents: number;
    preliminaryPirEvents: number;
    latestEvent?: AzurePortalHealthLatestEventSummary;
}
export interface AzurePortalHealthLatestEventSummary {
    id: string;
    trackingId: string;
    eventType: AzureResourceHealthEventType;
    status: AzureResourceHealthEventStatus;
    level?: AzureResourceHealthEventLevel;
    title?: string;
    lastUpdateTime?: string;
    impactStartTime?: string;
    impactMitigationTime?: string;
}
export interface AzureResourceHealthEventPortalCollection {
    schemaVersion: 1;
    generatedAt: string;
    subscriptionId: string;
    source: typeof AZURE_RESOURCE_HEALTH_EVENTS_SOURCE;
    highWatermark?: string;
    events: AzureServiceHealthEventSummary[];
}
export interface AzureResourceHealthAvailabilityStatusSummary {
    id: string;
    resourceId: string;
    availabilityState: AzureResourceHealthAvailabilityState;
    title?: string;
    summary?: string;
    detailedStatus?: string;
    reasonType?: string;
    reasonChronicity?: string;
    occurredTime?: string;
    reportedTime?: string;
    recentlyResolved?: AzureResourceHealthRecentlyResolved;
    recommendedActions?: string[];
    serviceImpactingEvents?: AzureResourceHealthServiceImpactingEvent[];
    source: typeof AZURE_RESOURCE_HEALTH_AVAILABILITY_STATUSES_SOURCE;
}
export interface AzureResourceHealthRecentlyResolved {
    unavailableOccurredTime?: string;
    resolvedTime?: string;
    unavailabilitySummary?: string;
}
export interface AzureResourceHealthServiceImpactingEvent {
    eventStartTime?: string;
    eventStatus?: AzureResourceHealthEventStatus;
    eventTrackingId?: string;
    eventType?: AzureResourceHealthEventType;
    impactedService?: string;
    impactedRegion?: string;
    title?: string;
}
export interface AzureResourceHealthAvailabilityStatusPortalCollection {
    schemaVersion: 1;
    generatedAt: string;
    subscriptionId: string;
    source: typeof AZURE_RESOURCE_HEALTH_AVAILABILITY_STATUSES_SOURCE;
    statuses: AzureResourceHealthAvailabilityStatusSummary[];
}
export interface AzureResourceHealthEventCollection {
    schemaVersion: 1;
    generatedAt: string;
    subscriptionId: string;
    source: typeof AZURE_RESOURCE_HEALTH_EVENTS_SOURCE;
    queryStartTime: string;
    highWatermark?: string;
    events: AzureResourceHealthEvent[];
}
export interface AzureResourceHealthImpactedResourcesForEvent {
    trackingId: string;
    eventId?: string;
    generatedAt: string;
    resources: AzureResourceHealthImpactedResource[];
}
export interface AzureResourceHealthImpactedResourceCollection {
    schemaVersion: 1;
    generatedAt: string;
    subscriptionId: string;
    source: typeof AZURE_RESOURCE_HEALTH_IMPACTED_RESOURCES_SOURCE;
    events: AzureResourceHealthImpactedResourcesForEvent[];
}
export interface AzureResourceHealthAvailabilityStatusCollection {
    schemaVersion: 1;
    generatedAt: string;
    subscriptionId: string;
    source: typeof AZURE_RESOURCE_HEALTH_AVAILABILITY_STATUSES_SOURCE;
    statuses: AzureResourceHealthAvailabilityStatus[];
}
export interface AzureResourceHealthIndex {
    schemaVersion: 1;
    source: typeof AZURE_RESOURCE_HEALTH_EVENTS_SOURCE;
    subscriptionId: string;
    generatedAt: string;
    lastSuccessfulSyncTime: string;
    queryStartTime: string;
    highWatermark?: string;
    eventCount: number;
}
export interface AzureResourceHealthSyncResult {
    fetchedEventCount: number;
    totalEventCount: number;
    impactedResourcesFetchedEventCount?: number;
    impactedResourcesTotalEventCount?: number;
    availabilityStatusCount?: number;
    highWatermark?: string;
}
//# sourceMappingURL=resourceHealth.d.ts.map