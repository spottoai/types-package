import type { AzureDashboardView, AzureResourcePortalItem } from './views';
import type {
  AzurePortalHealthEventsSummary,
  AzureResourceHealthAvailabilityStatusPortalCollection,
  AzureResourceHealthAvailabilityStatusSummary,
  AzureResourceHealthEvent,
  AzureResourceHealthEventCollection,
  AzureResourceHealthEventPortalCollection,
  AzureResourceHealthImpactedResourceCollection,
  AzureServiceHealthEventSummary,
} from './resourceHealth';
import { AZURE_RESOURCE_HEALTH_AVAILABILITY_STATUSES_SOURCE, AZURE_RESOURCE_HEALTH_EVENTS_SOURCE } from './resourceHealth';

const rawEvent: AzureResourceHealthEvent = {
  id: '/subscriptions/sub-1/providers/microsoft.resourcehealth/events/evt-1',
  name: 'evt-1',
  type: AZURE_RESOURCE_HEALTH_EVENTS_SOURCE,
  properties: {
    eventType: 'ServiceIssue',
    status: 'Active',
    eventLevel: 'Critical',
    title: 'Storage issue',
    description: '<h3>What happened?</h3><p>A dependency failed.</p>',
    eventSource: 'ServiceHealth',
    eventTags: ['Preliminary PIR'],
    impactStartTime: '2026-06-15T00:00:00.000Z',
    lastUpdateTime: '2026-06-15T01:00:00.000Z',
    impact: [
      {
        impactedService: 'Storage',
        impactedRegions: [
          {
            impactedRegion: 'East US',
            impactedSubscriptions: ['sub-1'],
            status: 'Active',
            updates: [
              {
                updateDateTime: '2026-06-15T01:00:00.000Z',
                summary: 'Mitigation is in progress.',
                eventTags: ['Action Recommended'],
              },
            ],
          },
        ],
      },
    ],
    recommendedActions: {
      message: 'Review failover design.',
      actions: [{ actionText: 'Validate resiliency configuration.', groupId: 1 }],
    },
    article: {
      articleContent: 'What happened? A dependency failed.',
      articleId: 'article-1',
    },
  },
};

const eventSummary: AzureServiceHealthEventSummary = {
  id: '/subscriptions/sub-1/providers/microsoft.resourcehealth/events/evt-1',
  trackingId: 'evt-1',
  subscriptionId: 'sub-1',
  eventType: 'ServiceIssue',
  status: 'Active',
  level: 'Critical',
  title: 'Storage issue',
  summary: 'Storage availability was affected.',
  impactStartTime: '2026-06-15T00:00:00.000Z',
  lastUpdateTime: '2026-06-15T01:00:00.000Z',
  impactedServices: ['Storage'],
  impactedRegions: ['East US'],
  impactedResourceCount: 1,
  impactedResources: [
    {
      resourceId: '/subscriptions/sub-1/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/storage1',
      resourceType: 'Microsoft.Storage/storageAccounts',
      region: 'eastus',
    },
  ],
  postIncidentReview: {
    hasPreliminaryPir: true,
    whatHappened: 'A dependency failed.',
  },
  recommendedActions: ['Review failover design.'],
  source: AZURE_RESOURCE_HEALTH_EVENTS_SOURCE,
};

const healthEvents: AzurePortalHealthEventsSummary = {
  totalEvents: 1,
  activeEvents: 1,
  resolvedEvents: 0,
  finalPirEvents: 0,
  preliminaryPirEvents: 1,
  latestEvent: {
    id: eventSummary.id,
    trackingId: eventSummary.trackingId,
    eventType: eventSummary.eventType,
    status: eventSummary.status,
    level: eventSummary.level,
    title: eventSummary.title,
    lastUpdateTime: eventSummary.lastUpdateTime,
    impactStartTime: eventSummary.impactStartTime,
  },
};

const availabilityStatus: AzureResourceHealthAvailabilityStatusSummary = {
  id: '/subscriptions/sub-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-1/providers/Microsoft.ResourceHealth/availabilityStatuses/current',
  resourceId: '/subscriptions/sub-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-1',
  availabilityState: 'Degraded',
  title: 'VM health degraded',
  summary: 'Resource is affected by a platform event.',
  detailedStatus: 'Storage latency is elevated.',
  reasonType: 'PlatformInitiated',
  reasonChronicity: 'Persistent',
  occurredTime: '2026-06-15T00:00:00.000Z',
  reportedTime: '2026-06-15T00:05:00.000Z',
  recentlyResolved: {
    unavailableOccurredTime: '2026-06-14T23:00:00.000Z',
    resolvedTime: '2026-06-15T00:00:00.000Z',
    unavailabilitySummary: 'Resolved after platform mitigation.',
  },
  recommendedActions: ['Monitor the workload.'],
  serviceImpactingEvents: [
    {
      eventTrackingId: 'evt-1',
      eventStatus: 'Active',
      eventType: 'ServiceIssue',
      impactedService: 'Virtual Machines',
      impactedRegion: 'East US',
      title: 'Platform issue',
    },
  ],
  source: AZURE_RESOURCE_HEALTH_AVAILABILITY_STATUSES_SOURCE,
};

const rawEventCollection: AzureResourceHealthEventCollection = {
  schemaVersion: 1,
  generatedAt: '2026-06-16T00:00:00.000Z',
  subscriptionId: 'sub-1',
  source: AZURE_RESOURCE_HEALTH_EVENTS_SOURCE,
  queryStartTime: '2026-06-01T00:00:00.000Z',
  highWatermark: rawEvent.properties?.lastUpdateTime,
  events: [rawEvent],
};

const impactedResourceCollection: AzureResourceHealthImpactedResourceCollection = {
  schemaVersion: 1,
  generatedAt: '2026-06-16T00:00:00.000Z',
  subscriptionId: 'sub-1',
  source: 'Microsoft.ResourceHealth/events/impactedResources',
  events: [
    {
      trackingId: rawEvent.name,
      eventId: rawEvent.id,
      generatedAt: '2026-06-16T00:00:00.000Z',
      resources: [
        {
          id: `${rawEvent.id}/impactedResources/storage1`,
          name: 'storage1',
          type: 'Microsoft.ResourceHealth/events/impactedResources',
          properties: {
            targetRegion: 'eastus',
            targetResourceId: '/subscriptions/sub-1/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/storage1',
            targetResourceType: 'Microsoft.Storage/storageAccounts',
            info: [{ key: 'sku', value: 'Standard_LRS' }],
          },
        },
      ],
    },
  ],
};

const eventCollection: AzureResourceHealthEventPortalCollection = {
  schemaVersion: 1,
  generatedAt: '2026-06-16T00:00:00.000Z',
  subscriptionId: 'sub-1',
  source: AZURE_RESOURCE_HEALTH_EVENTS_SOURCE,
  highWatermark: eventSummary.lastUpdateTime,
  events: [eventSummary],
};

const availabilityCollection: AzureResourceHealthAvailabilityStatusPortalCollection = {
  schemaVersion: 1,
  generatedAt: '2026-06-16T00:00:00.000Z',
  subscriptionId: 'sub-1',
  source: AZURE_RESOURCE_HEALTH_AVAILABILITY_STATUSES_SOURCE,
  statuses: [availabilityStatus],
};

const dashboard = {
  subscription: {} as AzureDashboardView['subscription'],
  timestamp: '2026-06-16T00:00:00.000Z',
  healthEvents,
} satisfies AzureDashboardView;

const portalResource = {
  id: availabilityStatus.resourceId,
  name: 'vm-1',
  type: 'Microsoft.Compute/virtualMachines',
  location: 'East US',
  spend: 0,
  spendAmortized: 0,
  recommendations: [],
  customRecommendations: [],
  resourceHealth: availabilityStatus,
} satisfies AzureResourcePortalItem;

void rawEventCollection;
void impactedResourceCollection;
void eventCollection;
void availabilityCollection;
void dashboard;
void portalResource;
