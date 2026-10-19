import type { PortalActivityLogClassification } from './activityLogAnalysis';

export const PORTAL_ACTIVITY_LOG_SCHEMA_VERSION = '2026-05-02.change-monitoring-v1' as const;

export const PORTAL_ACTIVITY_LOG_FILE = 'activity-logs.json' as const;

export type PortalActivityLogActorType = 'user' | 'servicePrincipal' | 'managedIdentity' | 'platform' | 'unknown';

export type PortalActivityLogActorResolutionSource = 'caller' | 'arg' | 'entra-signin' | 'entra-audit' | 'derived' | 'tenant-principals';

export type PortalActivityLogKind = 'change' | 'security' | 'operation' | 'health';

export type PortalActivityLogImportance = 'high' | 'medium' | 'low';

export type PortalActivityLogFeedMode = 'all-advanced' | 'changes-default' | 'security' | 'health';

export type PortalActivityLogSuppressionReason = 'autoscale' | 'operational-lookup' | 'platform' | 'non-change';

/** Committed source collection proof, independent of event classification. */
export interface ActivityLogCollectionCoverage {
  state: 'complete' | 'partial' | 'unavailable';
  timeWindow: { start: string; end: string };
  expectedRegions: string[];
  gaps: Array<{
    region?: string;
    start: string;
    end: string;
    reason: 'not-collected' | 'coverage-gap' | 'revision-unavailable' | 'expected-regions-unavailable';
  }>;
  /** Total merged gap intervals, including details omitted by the 128-row bound. */
  gapCount: number;
  gapsTruncated: boolean;
}

export interface PortalActivityLogSource {
  collectionCoverage?: ActivityLogCollectionCoverage;
  rawEventCount: number;
  retainedEventCount: number;
  changeCount: number;
  securityCount: number;
  healthCount: number;
  suppressedCount: number;
  latestRawTimestamp?: string;
  classification?: {
    taxonomyVersion: PortalActivityLogClassification['taxonomyVersion'];
    classifiedRetainedEventCount: number;
    unclassifiedRetainedEventCount: number;
    state: 'complete' | 'partial' | 'unavailable';
  };
}

export interface PortalActivityLogEntry {
  /**
   * Stable identity for the collapsed activity group within one subscription.
   * Consumers must scope this value by subscription before using it as a
   * cross-subscription entity or persistence key.
   */
  activityGroupId?: string;
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
  classification?: PortalActivityLogClassification;
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
