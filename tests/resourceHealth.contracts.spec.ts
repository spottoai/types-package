import {
  ProviderName,
  AZURE_RESOURCE_HEALTH_EVENTS_SOURCE,
  AZURE_RESOURCE_HEALTH_AVAILABILITY_STATUSES_SOURCE,
  RESOURCE_HEALTH_EVENTS_PORTAL_FILE_NAME,
  RESOURCE_HEALTH_AVAILABILITY_STATUSES_PORTAL_FILE_NAME,
  type AzureResourceHealthEventPortalCollection,
  type AzureResourceHealthAvailabilityStatusPortalCollection,
  type ResourceHealthEventPortalCollection,
  type ResourceHealthAvailabilityStatusPortalCollection,
  type ResourceHealthSourceCoverage,
  type ResourceHealthEventSummary,
  type ResourceHealthEventResourceCoverage,
  type PortalHealthEventsSummary,
} from '../src';

const providerScope = { providerName: ProviderName.Aws, providerScopeId: '123456789012' };
const sourceCoverage = {
  sourceId: 'aws-health-eventbridge',
  support: 'supported',
  attempt: 'succeeded',
  coverage: 'partial',
  freshness: 'current',
  lastSuccessfulRefreshAt: '2026-10-05T00:00:00.000Z',
  itemCount: 1,
  eventTypes: ['ServiceIssue', 'PlannedMaintenance'],
  eventScopes: ['account-specific'],
  reasonCode: 'stream-without-inventory-reconciliation',
} satisfies ResourceHealthSourceCoverage;

const event = {
  id: '123456789012:incident-1',
  trackingId: 'incident-1',
  nativeEventId: 'arn:aws:health:us-east-1::event/EC2/incident-1',
  nativeEventType: 'native-incident-type',
  nativeStatus: 'open',
  eventScope: 'account-specific',
  providerScope,
  subscriptionId: providerScope.providerScopeId,
  eventType: 'ServiceIssue',
  status: 'Active',
  impactedServices: ['EC2'],
  impactedRegions: ['us-east-1'],
  // The event remains actionable without a known inventory resource or a fabricated zero count.
  impactedResources: [],
  resourceCoverage: { status: 'unresolved', reasonCode: 'unmatched-native-entity' },
  postIncidentReview: { howDidProviderRespond: 'The provider restored the affected dependency.' },
  source: 'aws-health',
} satisfies ResourceHealthEventSummary;

const awsEvents = {
  schemaVersion: 1,
  generatedAt: '2026-10-05T00:00:00.000Z',
  artifactGeneration: { runId: 'health-run-1', generatedAt: '2026-10-05T00:00:00.000Z' },
  providerScope,
  subscriptionId: providerScope.providerScopeId,
  source: 'aws-health',
  coverage: { sources: [sourceCoverage] },
  events: [event, { ...event, id: '123456789012:maintenance-1', status: 'Upcoming', nativeStatus: 'upcoming', eventType: 'PlannedMaintenance' }],
} satisfies ResourceHealthEventPortalCollection;

const unavailableSource = {
  sourceId: 'resource-status',
  support: 'supported',
  attempt: 'failed',
  coverage: 'none',
  freshness: 'unknown',
  reasonCode: 'source-access-denied',
} satisfies ResourceHealthSourceCoverage;

const staleSource = {
  ...sourceCoverage,
  attempt: 'failed',
  coverage: 'complete',
  freshness: 'stale',
  reasonCode: 'latest-refresh-failed',
} satisfies ResourceHealthSourceCoverage;

const unsupportedSource = {
  ...unavailableSource,
  support: 'unsupported',
  attempt: 'not-attempted',
  resourceTypes: ['unassessed-native-resource-type'],
  reasonCode: 'resource-type-not-supported',
} satisfies ResourceHealthSourceCoverage;

const awsAvailability = {
  schemaVersion: 1,
  generatedAt: awsEvents.generatedAt,
  subscriptionId: providerScope.providerScopeId,
  providerScope,
  source: 'resource-status',
  coverage: { sources: [unavailableSource, unsupportedSource] },
  statuses: [
    {
      id: '123456789012:us-east-1:instance-1',
      resourceId: 'arn:aws:ec2:us-east-1:123456789012:instance/i-1234567890abcdef0',
      resourceType: 'AWS::EC2::Instance',
      resourceName: 'application-server',
      region: 'us-east-1',
      availabilityState: 'Degraded',
      nativeStatus: 'impaired',
      source: 'resource-status',
    },
  ],
} satisfies ResourceHealthAvailabilityStatusPortalCollection;

const azureEvents: AzureResourceHealthEventPortalCollection = {
  schemaVersion: 1,
  generatedAt: awsEvents.generatedAt,
  subscriptionId: 'sub-1',
  source: AZURE_RESOURCE_HEALTH_EVENTS_SOURCE,
  events: [
    {
      id: 'azure-incident-1',
      trackingId: 'azure-incident-1',
      subscriptionId: 'sub-1',
      eventType: 'ServiceIssue',
      status: 'Active',
      impactedServices: [],
      impactedRegions: [],
      source: AZURE_RESOURCE_HEALTH_EVENTS_SOURCE,
      postIncidentReview: { howDidMicrosoftRespond: 'Mitigated by Microsoft.' },
    },
  ],
};
const commonAzureEvents: ResourceHealthEventPortalCollection = azureEvents;
const azureReview = commonAzureEvents.events[0].postIncidentReview;
const providerResponse: string | undefined = azureReview?.howDidProviderRespond ?? azureReview?.howDidMicrosoftRespond;
const azureAvailability: AzureResourceHealthAvailabilityStatusPortalCollection = {
  schemaVersion: 1,
  generatedAt: awsEvents.generatedAt,
  subscriptionId: 'sub-1',
  source: AZURE_RESOURCE_HEALTH_AVAILABILITY_STATUSES_SOURCE,
  statuses: [],
};
const commonAzureAvailability: ResourceHealthAvailabilityStatusPortalCollection = azureAvailability;
const summary: PortalHealthEventsSummary = {
  totalEvents: 2,
  activeEvents: 1,
  upcomingEvents: 1,
  resolvedEvents: 0,
  finalPirEvents: 0,
  preliminaryPirEvents: 0,
};

// @ts-expect-error Resource matching has a closed vocabulary independent of source coverage.
const invalidMatching: ResourceHealthEventResourceCoverage = { status: 'available' };
// @ts-expect-error Unresolved matching must state why.
const unexplainedMatching: ResourceHealthEventResourceCoverage = { status: 'unresolved' };
// @ts-expect-error Provider identity must include the native account/subscription ID.
const incompleteScope: ResourceHealthEventPortalCollection = { ...awsEvents, providerScope: { providerName: ProviderName.Aws } };
// @ts-expect-error Schema version is unchanged.
const wrongSchema: ResourceHealthEventPortalCollection = { ...awsEvents, schemaVersion: 2 };
// @ts-expect-error Source coverage never conflates unsupported collection with healthy resources.
const invalidCoverage: ResourceHealthSourceCoverage = { ...sourceCoverage, coverage: 'healthy' };
// @ts-expect-error Azure source specializations remain narrow.
const wrongAzureSource: AzureResourceHealthEventPortalCollection = { ...azureEvents, source: 'aws-health' };
// @ts-expect-error Raw provider payloads do not belong in the public event projection.
const rawPayload: ResourceHealthEventSummary = { ...event, rawResponse: { arbitrary: 'data' } };

void [
  RESOURCE_HEALTH_EVENTS_PORTAL_FILE_NAME,
  RESOURCE_HEALTH_AVAILABILITY_STATUSES_PORTAL_FILE_NAME,
  awsEvents,
  awsAvailability,
  staleSource,
  commonAzureEvents,
  providerResponse,
  commonAzureAvailability,
  summary,
  invalidMatching,
  unexplainedMatching,
  incompleteScope,
  wrongSchema,
  invalidCoverage,
  wrongAzureSource,
  rawPayload,
];
