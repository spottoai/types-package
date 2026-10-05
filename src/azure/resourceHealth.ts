import type {
  PortalHealthEventsSummary,
  PortalHealthLatestEventSummary,
  ResourceHealthAvailabilityState,
  ResourceHealthAvailabilityStatusPortalCollection,
  ResourceHealthAvailabilityStatusSummary,
  ResourceHealthEventLevel,
  ResourceHealthEventPortalCollection,
  ResourceHealthEventStatus,
  ResourceHealthEventSummary,
  ResourceHealthEventType,
  ResourceHealthImpactedResourceSummary,
  ResourceHealthPostIncidentReview,
  ResourceHealthRecentlyResolved,
  ResourceHealthServiceImpactingEvent,
} from '../common/resourceHealth';

export { RESOURCE_HEALTH_EVENTS_PORTAL_FILE_NAME, RESOURCE_HEALTH_AVAILABILITY_STATUSES_PORTAL_FILE_NAME } from '../common/resourceHealth';

export const RESOURCE_HEALTH_EVENTS_FILE_NAME = 'microsoft.resourcehealth-events.json' as const;
export const RESOURCE_HEALTH_EVENTS_IMPACTED_RESOURCES_FILE_NAME = 'microsoft.resourcehealth-events-impactedresources.json' as const;
export const RESOURCE_HEALTH_AVAILABILITY_STATUSES_FILE_NAME = 'microsoft.resourcehealth-availabilitystatuses.json' as const;
export const RESOURCE_HEALTH_INDEX_FILE_NAME = 'history/resource-health/index.json' as const;

export const AZURE_RESOURCE_HEALTH_EVENTS_SOURCE = 'Microsoft.ResourceHealth/events' as const;
export const AZURE_RESOURCE_HEALTH_IMPACTED_RESOURCES_SOURCE = 'Microsoft.ResourceHealth/events/impactedResources' as const;
export const AZURE_RESOURCE_HEALTH_AVAILABILITY_STATUSES_SOURCE = 'Microsoft.ResourceHealth/availabilityStatuses' as const;

export const RESOURCE_HEALTH_EVENTS_SOURCE = AZURE_RESOURCE_HEALTH_EVENTS_SOURCE;
export const RESOURCE_HEALTH_EVENTS_IMPACTED_RESOURCES_SOURCE = AZURE_RESOURCE_HEALTH_IMPACTED_RESOURCES_SOURCE;
export const RESOURCE_HEALTH_AVAILABILITY_STATUSES_SOURCE = AZURE_RESOURCE_HEALTH_AVAILABILITY_STATUSES_SOURCE;

export type AzureResourceHealthEventType = ResourceHealthEventType;

export type AzureResourceHealthEventStatus = ResourceHealthEventStatus;

export type AzureResourceHealthEventLevel = ResourceHealthEventLevel;

export type AzureResourceHealthEventSource = 'ResourceHealth' | 'ServiceHealth' | (string & {});

export type AzureResourceHealthAvailabilityState = ResourceHealthAvailabilityState;

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

export interface AzureServiceHealthEventSummary extends ResourceHealthEventSummary<typeof AZURE_RESOURCE_HEALTH_EVENTS_SOURCE> {
  impactedResources?: AzureServiceHealthImpactedResourceSummary[];
  postIncidentReview?: AzureServiceHealthPostIncidentReview;
}

export type AzureServiceHealthImpactedResourceSummary = ResourceHealthImpactedResourceSummary;

export type AzureServiceHealthPostIncidentReview = ResourceHealthPostIncidentReview;

export interface AzurePortalHealthEventsSummary extends PortalHealthEventsSummary {
  latestEvent?: AzurePortalHealthLatestEventSummary;
}

export type AzurePortalHealthLatestEventSummary = PortalHealthLatestEventSummary;

export interface AzureResourceHealthEventPortalCollection extends ResourceHealthEventPortalCollection<typeof AZURE_RESOURCE_HEALTH_EVENTS_SOURCE> {
  events: AzureServiceHealthEventSummary[];
}

export type AzureResourceHealthAvailabilityStatusSummary = ResourceHealthAvailabilityStatusSummary<
  typeof AZURE_RESOURCE_HEALTH_AVAILABILITY_STATUSES_SOURCE
>;

export type AzureResourceHealthRecentlyResolved = ResourceHealthRecentlyResolved;

export type AzureResourceHealthServiceImpactingEvent = ResourceHealthServiceImpactingEvent;

export type AzureResourceHealthAvailabilityStatusPortalCollection = ResourceHealthAvailabilityStatusPortalCollection<
  typeof AZURE_RESOURCE_HEALTH_AVAILABILITY_STATUSES_SOURCE
>;

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
