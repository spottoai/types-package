import { ProviderName } from '../common/provider';
import type {
  GetRecommendationAuditQuery,
  GetRecommendationAuditQueryCanonical,
  RecommendationAuditEventRowColumns,
  RecommendationAuditQueryResponse,
  RecommendationAuditRowKind,
  RecommendationAuditTimelineEvent,
  RecommendationWorkflowAuditDetails,
} from './recommendationAudit';

const resourceTargetQuery: GetRecommendationAuditQuery = {
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  scope: 'resource',
  view: 'target',
  recommendationId: 'rec-123',
  resourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/store1',
  trackView: true,
};

const subscriptionTargetQuery: GetRecommendationAuditQuery = {
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  scope: 'subscription',
  view: 'target',
  recommendationId: 'rec-123',
};

const resourceFeedQuery: GetRecommendationAuditQuery = {
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  scope: 'resource',
  view: 'providerScope-feed',
  recommendationId: 'rec-123',
  limit: 500,
};

const subscriptionFeedQuery: GetRecommendationAuditQuery = {
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  scope: 'subscription',
  view: 'providerScope-feed',
  from: '2026-03-01T00:00:00.000Z',
  to: '2026-03-17T00:00:00.000Z',
  recommendationId: 'rec-123',
};

const canonicalResourceTarget: GetRecommendationAuditQueryCanonical = resourceTargetQuery;
const canonicalSubscriptionFeed: GetRecommendationAuditQueryCanonical = subscriptionFeedQuery;

const rowKind: RecommendationAuditRowKind = 'resource-view:target';

const rowColumns: RecommendationAuditEventRowColumns = {
  CompanyId: 'comp-123',
  ProviderName: ProviderName.Azure,
  ProviderScopeId: 'sub-123',
  SubscriptionId: 'sub-123',
  RowKind: 'resource-view:target',
  ResourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/store1',
  RecommendationId: 'rec-123',
  EventType: 'Viewed',
  EventDetails: '{"trackView":true}',
  UserId: 'user-1',
  UserDisplayName: 'Reader One',
  Source: 'api',
  Date: '2026-03-17T00:00:00.000Z',
  EventId: 'evt-1',
};

const rowColumnsWithNullableDisplayName: RecommendationAuditEventRowColumns = {
  ...rowColumns,
  EventId: 'evt-2',
  UserDisplayName: null,
};

const rowColumnsWithAddedEventType: RecommendationAuditEventRowColumns = {
  ...rowColumns,
  EventId: 'evt-3',
  EventType: 'Added',
};

const rowColumnsWithArchivedEventType: RecommendationAuditEventRowColumns = {
  ...rowColumns,
  EventId: 'evt-4',
  EventType: 'Archived',
};

const timelineItem: RecommendationAuditTimelineEvent = {
  eventId: 'evt-1',
  eventType: 'Viewed',
  date: '2026-03-17T00:00:00.000Z',
  companyId: 'comp-123',
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  subscriptionId: 'sub-123',
  resourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/store1',
  recommendationId: 'rec-123',
  eventDetails: '{"trackView":true}',
  userId: 'user-1',
  userDisplayName: 'Reader One',
  source: 'api',
  rowKind,
};

const timelineItemWithNullableDisplayName: RecommendationAuditTimelineEvent = {
  ...timelineItem,
  eventId: 'evt-2',
  userDisplayName: null,
};

const timelineItemWithAddedEventType: RecommendationAuditTimelineEvent = {
  ...timelineItem,
  eventId: 'evt-3',
  eventType: 'Added',
};

const timelineItemWithArchivedEventType: RecommendationAuditTimelineEvent = {
  ...timelineItem,
  eventId: 'evt-4',
  eventType: 'Archived',
};

const timelineItemWithImplementationFailedEventType: RecommendationAuditTimelineEvent = {
  ...timelineItem,
  eventId: 'evt-5',
  eventType: 'ImplementationFailed',
};

const workflowBlockedDetails: RecommendationWorkflowAuditDetails = {
  schemaVersion: 1,
  eventType: 'WorkflowBlocked',
  flowItemId: 'flow-sub-123-rec-123',
  blockedReason: 'Waiting for a maintenance window.',
  reviewAt: '2026-04-01T00:00:00.000Z',
};

const timelineItemWithWorkflowBlockedEventType: RecommendationAuditTimelineEvent = {
  ...timelineItem,
  eventId: 'evt-6',
  eventType: 'WorkflowBlocked',
  eventDetails: JSON.stringify(workflowBlockedDetails),
};

const returnedToSuggestionsDetails: RecommendationWorkflowAuditDetails = {
  schemaVersion: 1,
  eventType: 'ReturnedToSuggestions',
  flowItemId: 'flow-sub-123-rec-123',
  systemTrackId: 'resource-hygiene',
};

const repairedDetails: RecommendationWorkflowAuditDetails = {
  schemaVersion: 1,
  eventType: 'WorkflowRepaired',
  flowItemId: 'flow-sub-123-rec-123',
  repairId: 'repair-123',
  repairedSurfaces: ['workflow', 'projection'],
};

const sourceChangedDetails: RecommendationWorkflowAuditDetails = {
  schemaVersion: 1,
  eventType: 'WorkflowSourceChanged',
  flowItemId: 'flow-sub-123-rec-123',
  systemTrackId: 'resource-hygiene',
  previousSourceFingerprint: 'sha256:before',
  sourceFingerprint: 'sha256:after',
  sourceChangeKind: 'changed',
};

const response: RecommendationAuditQueryResponse = [
  timelineItem,
  timelineItemWithNullableDisplayName,
  timelineItemWithAddedEventType,
  timelineItemWithArchivedEventType,
  timelineItemWithImplementationFailedEventType,
  timelineItemWithWorkflowBlockedEventType,
];

void resourceTargetQuery;
void subscriptionTargetQuery;
void resourceFeedQuery;
void subscriptionFeedQuery;
void canonicalResourceTarget;
void canonicalSubscriptionFeed;
void rowColumns;
void rowColumnsWithNullableDisplayName;
void rowColumnsWithAddedEventType;
void rowColumnsWithArchivedEventType;
void timelineItemWithImplementationFailedEventType;
void workflowBlockedDetails;
void returnedToSuggestionsDetails;
void repairedDetails;
void sourceChangedDetails;
void response;

// @ts-expect-error target view requires recommendationId.
const invalidTargetWithoutRecommendationId: GetRecommendationAuditQuery = {
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  scope: 'subscription',
  view: 'target',
};

// @ts-expect-error resource target view requires resourceId.
const invalidResourceTargetWithoutResourceId: GetRecommendationAuditQuery = {
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  scope: 'resource',
  view: 'target',
  recommendationId: 'rec-123',
};

// @ts-expect-error provider-scope feed queries must not include resource identity.
const invalidFeedWithResourceId: GetRecommendationAuditQuery = {
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  scope: 'subscription',
  view: 'providerScope-feed',
  resourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/store1',
};

const invalidCanonicalAliasScope: GetRecommendationAuditQueryCanonical = {
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  // @ts-expect-error canonical scope contract does not accept providerScope alias.
  scope: 'providerScope',
  view: 'target',
  recommendationId: 'rec-123',
};

// @ts-expect-error provider-scope feed queries require recommendationId.
const invalidFeedWithoutRecommendationId: GetRecommendationAuditQuery = {
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  scope: 'subscription',
  view: 'providerScope-feed',
};

// @ts-expect-error row kind is constrained to the four storage row prefixes.
const invalidRowKind: RecommendationAuditRowKind = 'target';

const invalidTrackViewType: GetRecommendationAuditQuery = {
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  scope: 'subscription',
  view: 'providerScope-feed',
  recommendationId: 'rec-123',
  // @ts-expect-error trackView must be boolean.
  trackView: 'true',
};

const invalidEnvelopeAsCanonicalResponse: RecommendationAuditQueryResponse = {
  // @ts-expect-error canonical response contract is a raw array, not an envelope object.
  items: [timelineItem],
};

const invalidTimelineDisplayName: RecommendationAuditTimelineEvent = {
  ...timelineItem,
  // @ts-expect-error userDisplayName must be string | null | undefined.
  userDisplayName: 123,
};

const invalidRowColumnsDisplayName: RecommendationAuditEventRowColumns = {
  ...rowColumns,
  // @ts-expect-error UserDisplayName must be string | null | undefined.
  UserDisplayName: 123,
};

const invalidWorkflowAuditDetailsVersion: RecommendationWorkflowAuditDetails = {
  // @ts-expect-error workflow detail schema version is fixed.
  schemaVersion: 2,
  eventType: 'WorkflowAssigned',
  flowItemId: 'flow-sub-123-rec-123',
};

// @ts-expect-error workflow blocked details require a blocked reason.
const invalidWorkflowBlockedDetails: RecommendationWorkflowAuditDetails = {
  schemaVersion: 1,
  eventType: 'WorkflowBlocked',
  flowItemId: 'flow-sub-123-rec-123',
};

const invalidWorkflowUnblockedDestination: RecommendationWorkflowAuditDetails = {
  schemaVersion: 1,
  eventType: 'WorkflowUnblocked',
  flowItemId: 'flow-sub-123-rec-123',
  // @ts-expect-error unblock audit destinations cannot remain Blocked.
  toLane: 'blocked',
};

const invalidWorkflowRepairDetails: RecommendationWorkflowAuditDetails = {
  schemaVersion: 1,
  eventType: 'WorkflowRepaired',
  flowItemId: 'flow-sub-123-rec-123',
  repairId: 'repair-123',
  // @ts-expect-error applied repair audit details require at least one repaired surface.
  repairedSurfaces: [],
};

// @ts-expect-error source-change audit details preserve the prior fingerprint.
const invalidWorkflowSourceChangedDetails: RecommendationWorkflowAuditDetails = {
  schemaVersion: 1,
  eventType: 'WorkflowSourceChanged',
  flowItemId: 'flow-sub-123-rec-123',
  systemTrackId: 'resource-hygiene',
  sourceFingerprint: 'sha256:after',
  sourceChangeKind: 'changed',
};

void invalidTargetWithoutRecommendationId;
void invalidResourceTargetWithoutResourceId;
void invalidFeedWithResourceId;
void invalidCanonicalAliasScope;
void invalidFeedWithoutRecommendationId;
void invalidRowKind;
void invalidTrackViewType;
void invalidEnvelopeAsCanonicalResponse;
void invalidTimelineDisplayName;
void invalidRowColumnsDisplayName;
void invalidWorkflowAuditDetailsVersion;
void invalidWorkflowBlockedDetails;
void invalidWorkflowUnblockedDestination;
void invalidWorkflowRepairDetails;
void invalidWorkflowSourceChangedDetails;
