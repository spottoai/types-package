import type {
  ArtifactAttemptOutcome,
  ArtifactCoverageVerdict,
  ArtifactFreshnessVerdict,
  ArtifactObservedRange,
  ArtifactSupportVerdict,
} from './artifactEvidence';
import type { ArtifactGeneration } from './artifactGeneration';
import type { ProviderScope } from './provider';
import type { CapabilitySourceId, ProviderResourceType } from './resourceIdentity';

/** Shared logical names. Physical paths, collection and provider mappings belong to the engine. */
export const RESOURCE_HEALTH_EVENTS_PORTAL_FILE_NAME = 'health-events.json' as const;
export const RESOURCE_HEALTH_AVAILABILITY_STATUSES_PORTAL_FILE_NAME = 'health-availability-statuses.json' as const;

export type ResourceHealthEventType =
  'ServiceIssue' | 'PlannedMaintenance' | 'HealthAdvisory' | 'SecurityAdvisory' | 'RCA' | 'EmergingIssues' | 'Billing' | (string & {});

/** Upcoming is a future event, never an active incident. Unknown is not proof of resolution. */
export type ResourceHealthEventStatus = 'Upcoming' | 'Active' | 'Resolved' | 'Unknown' | (string & {});
export type ResourceHealthEventLevel = 'Critical' | 'Error' | 'Warning' | 'Informational' | (string & {});
export type ResourceHealthAvailabilityState = 'Available' | 'Unavailable' | 'Degraded' | 'Unknown' | (string & {});
export type ResourceHealthEventScope = 'account-specific' | 'public' | 'unknown';

/** Collection and resource matching are separate. An empty resource array alone conveys neither verdict. */
export type ResourceHealthEventResourceCoverage =
  { status: 'complete' | 'not-applicable'; reasonCode?: never } | { status: 'partial' | 'unresolved'; reasonCode: string };

/** Exact inventory matches only; never fabricate an ARN or resource ID from an unresolved native entity. */
export interface ResourceHealthImpactedResourceSummary {
  resourceId?: string;
  resourceType?: ProviderResourceType;
  resourceName?: string;
  region?: string;
}

/** Optional provider-published incident review. Missing sections must not be synthesized. */
export interface ResourceHealthPostIncidentReview {
  hasPreliminaryPir?: boolean;
  hasFinalPir?: boolean;
  whatHappened?: string;
  whatWentWrongAndWhy?: string;
  howDidProviderRespond?: string;
  howProviderIsReducingRecurrence?: string;
  /** @deprecated Existing Azure wire field; shared readers use howDidProviderRespond with this as an Azure fallback. */
  howDidMicrosoftRespond?: string;
  /** @deprecated Existing Azure wire field; shared readers use howProviderIsReducingRecurrence with this as an Azure fallback. */
  howMicrosoftIsReducingRecurrence?: string;
  howCustomersCanReduceImpact?: string;
}

/** One presentation shape for every provider. The source parameter preserves existing Azure source literals. */
export interface ResourceHealthEventSummary<Source extends string = CapabilitySourceId> {
  /** Stable within the provider/account; consumers qualify row/board identity with scope and company. */
  id: string;
  trackingId: string;
  /** Existing transport alias: Azure subscription ID or AWS account ID; equals providerScope.providerScopeId when supplied. */
  subscriptionId: string;
  /** Omitted only by existing Azure producers; new provider-aware producers must include the envelope's exact scope. */
  providerScope?: ProviderScope;
  nativeEventId?: string;
  nativeEventType?: string;
  nativeStatus?: string;
  eventScope?: ResourceHealthEventScope;
  eventType: ResourceHealthEventType;
  status: ResourceHealthEventStatus;
  level?: ResourceHealthEventLevel;
  title?: string;
  summary?: string;
  impactStartTime?: string;
  impactMitigationTime?: string;
  lastUpdateTime?: string;
  durationSeconds?: number;
  priority?: number;
  impactedServices: string[];
  impactedRegions: string[];
  /** Known affected resource count, which may exceed retained matches. Omit when unknown; never infer zero from no matches. */
  impactedResourceCount?: number;
  impactedResources?: ResourceHealthImpactedResourceSummary[];
  resourceCoverage?: ResourceHealthEventResourceCoverage;
  postIncidentReview?: ResourceHealthPostIncidentReview;
  recommendedActions?: string[];
  source: Source;
}

/** Support, last attempt, collection completeness and freshness are independent observations. */
export interface ResourceHealthSourceCoverage {
  /** Open engine-owned source identifier. Region and declared filters distinguish separate collection scopes. */
  sourceId: CapabilitySourceId;
  region?: string;
  support: ArtifactSupportVerdict;
  attempt: ArtifactAttemptOutcome;
  coverage: ArtifactCoverageVerdict;
  freshness: ArtifactFreshnessVerdict;
  /** Last successful source collection, never the publication time. Omit when no successful collection exists. */
  lastSuccessfulRefreshAt?: string;
  observedRange?: ArtifactObservedRange;
  /** Accepted source-record count before UI filtering. Omit when unknown. */
  itemCount?: number;
  /** Declare the collection's filters; complete coverage never claims uncollected event/resource types or scopes. */
  eventTypes?: ResourceHealthEventType[];
  eventScopes?: ResourceHealthEventScope[];
  resourceTypes?: ProviderResourceType[];
  /** Safe reason code; raw provider errors, credentials and request bodies are excluded. */
  reasonCode?: string;
}

/**
 * Include every selected source, even unsupported, failed or unattempted sources. Missing coverage is unknown.
 * Empty rows prove an empty source only with successful, complete, current collection within the declared bounds.
 */
export interface ResourceHealthCollectionCoverage {
  sources: ResourceHealthSourceCoverage[];
}

/** Shared envelope for health-events.json; schema and presentation fields preserve the Azure wire shape. */
export interface ResourceHealthEventPortalCollection<Source extends string = CapabilitySourceId> {
  schemaVersion: 1;
  /** UTC ISO 8601 publication timestamp, not evidence of source freshness. */
  generatedAt: string;
  subscriptionId: string;
  /** Optional for existing Azure payloads. Required on AWS emission and equal to every nested event's scope. */
  providerScope?: ProviderScope;
  artifactGeneration?: ArtifactGeneration;
  source: Source;
  highWatermark?: string;
  /** New provider-aware producers must report coverage, including stream-only and unavailable-source limitations. */
  coverage?: ResourceHealthCollectionCoverage;
  events: ResourceHealthEventSummary<Source>[];
}

export interface ResourceHealthRecentlyResolved {
  unavailableOccurredTime?: string;
  resolvedTime?: string;
  unavailabilitySummary?: string;
}

export interface ResourceHealthServiceImpactingEvent {
  eventStartTime?: string;
  eventStatus?: ResourceHealthEventStatus;
  eventTrackingId?: string;
  eventType?: ResourceHealthEventType;
  impactedService?: string;
  impactedRegion?: string;
  title?: string;
}

/** Native resource observations only; absence of a Health incident never proves resource availability. */
export interface ResourceHealthAvailabilityStatusSummary<Source extends string = CapabilitySourceId> {
  id: string;
  /** Known resource in the envelope's account/subscription. Producers/readers must validate its ownership. */
  resourceId: string;
  resourceName?: string;
  resourceType?: ProviderResourceType;
  region?: string;
  availabilityState: ResourceHealthAvailabilityState;
  nativeStatus?: string;
  title?: string;
  summary?: string;
  detailedStatus?: string;
  reasonType?: string;
  reasonChronicity?: string;
  occurredTime?: string;
  reportedTime?: string;
  recentlyResolved?: ResourceHealthRecentlyResolved;
  recommendedActions?: string[];
  serviceImpactingEvents?: ResourceHealthServiceImpactingEvent[];
  source: Source;
}

/** Unassessed resource types are coverage gaps, never fabricated Available rows. */
export interface ResourceHealthAvailabilityStatusPortalCollection<Source extends string = CapabilitySourceId> {
  schemaVersion: 1;
  generatedAt: string;
  subscriptionId: string;
  /** Same identity rules as ResourceHealthEventPortalCollection. */
  providerScope?: ProviderScope;
  artifactGeneration?: ArtifactGeneration;
  source: Source;
  coverage?: ResourceHealthCollectionCoverage;
  statuses: ResourceHealthAvailabilityStatusSummary<Source>[];
}

/** Counts cover retained observations, not the whole estate unless collection evidence establishes that. */
export interface PortalHealthEventsSummary {
  totalEvents: number;
  activeEvents: number;
  resolvedEvents: number;
  upcomingEvents?: number;
  unknownStatusEvents?: number;
  finalPirEvents: number;
  preliminaryPirEvents: number;
  latestEvent?: PortalHealthLatestEventSummary;
}

export interface PortalHealthLatestEventSummary {
  id: string;
  trackingId: string;
  eventType: ResourceHealthEventType;
  status: ResourceHealthEventStatus;
  level?: ResourceHealthEventLevel;
  title?: string;
  lastUpdateTime?: string;
  impactStartTime?: string;
  impactMitigationTime?: string;
}
