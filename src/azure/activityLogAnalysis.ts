export const ACTIVITY_LOG_TAXONOMY_VERSION = 'v1' as const;
export const ACTIVITY_LOG_ANALYSIS_VERSION = 'v1' as const;
export const CONFORMED_ACTIVITY_ANALYSIS_SCHEMA_VERSION = 1 as const;
export const PORTAL_ACTIVITY_ANALYSIS_RESPONSE_SCHEMA_VERSION = 1 as const;

export const CONFORMED_ACTIVITY_ANALYSIS_LIMITS_V1 = Object.freeze({
  sourceShardFingerprintCodeUnits: 512 * 1024,
} as const);

export const PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1 = Object.freeze({
  tagAssignmentsPerEvent: 32,
  facetTagRows: 64,
  facetOperationRows: 4_096,
  facetProviderRows: 512,
  facetResourceTypeRows: 4_096,
  facetResultRows: 256,
  facetOperationEffectRows: 8,
  facetExecutionOriginRows: 8,
  activitySeries: 10_000,
  resourceSummaries: 10_000,
  operationSummaries: 4_096,
  securitySensitive: 4_096,
  powerPatterns: 4_096,
  operationCountsPerItem: 256,
  resultCountsPerItem: 256,
  tagCountsPerItem: 64,
  executionOriginCountsPerItem: 8,
  evidenceIdsPerItem: 20,
  reasonCodesPerItem: 32,
  resourceIdCodeUnits: 2_048,
  operationCodeUnits: 512,
  providerCodeUnits: 256,
  resourceTypeCodeUnits: 512,
  resourceNameCodeUnits: 512,
  reasonCodeUnits: 128,
  responseUtf8Bytes: 33_554_432,
} as const);

export const ACTIVITY_LOG_TAG_IDS = [
  'actor.manual',
  'actor.workload-automation',
  'actor.azure-platform',
  'actor.unknown',
  'change.material',
  'intent.credential-access',
  'intent.remote-execution',
  'intent.power-control',
  'security.sensitive-operation',
  'security.credential-access',
  'security.remote-execution',
  'security.privileged-access-change',
  'security.security-boundary-change',
  'security.protection-control-change',
  'security.destructive-action',
  'scheduler.power-operation',
] as const;

export type ActivityLogTagId = (typeof ACTIVITY_LOG_TAG_IDS)[number];
export type ActivityLogTagDimension = 'actor' | 'change' | 'intent' | 'security' | 'scheduler';
export type ActivityLogClassificationConfidence = 'high' | 'medium' | 'low';
export type ActivityLogExecutionOrigin = 'manual' | 'workloadAutomation' | 'azurePlatform' | 'unknown';
export type ActivityLogOperationEffect = 'write' | 'delete' | 'action' | 'read' | 'other';
export type ActivityLogScopeLevel = 'subscription' | 'resourceGroup' | 'resource' | 'unknown';
export type ActivityLogPowerDataSufficiency = 'oneSided' | 'oneOff' | 'sameDayRepeat' | 'repeated';
export type ActivityLogClassificationState = 'complete' | 'partial' | 'unavailable';
export type PortalActivityEvidenceId = `aev1_${string}`;
export type PortalActivityAnalysisGroupId = `aag1_${string}`;

export type PortalActivityAnalysisReasonCode =
  | 'derived.operation-summary'
  | 'derived.security-sensitive-activity'
  | 'derived.power-pattern-evidence'
  | `tag.${ActivityLogTagId}`;

export interface PortalActivityLogAnalysisScope {
  subscriptionId: string;
  level: ActivityLogScopeLevel;
  resourceId?: string;
  resourceGroup?: string;
  provider?: string;
  resourceType?: string;
  resourceName?: string;
}

export interface PortalActivityLogTagAssignment {
  tagId: ActivityLogTagId;
  dimension: ActivityLogTagDimension;
  confidence: ActivityLogClassificationConfidence;
}

export interface PortalActivityLogClassification {
  taxonomyVersion: typeof ACTIVITY_LOG_TAXONOMY_VERSION;
  executionOrigin: ActivityLogExecutionOrigin;
  operationEffect: ActivityLogOperationEffect;
  scope: PortalActivityLogAnalysisScope;
  tags: PortalActivityLogTagAssignment[];
}

export interface ActivityLogAnalysisCount<T extends string = string> {
  value: T;
  count: number;
}

export interface ConformedActivityAnalysisFacets {
  tags: ActivityLogAnalysisCount<ActivityLogTagId>[];
  operations: ActivityLogAnalysisCount[];
  providers: ActivityLogAnalysisCount[];
  resourceTypes: ActivityLogAnalysisCount[];
  results: ActivityLogAnalysisCount[];
  operationEffects: ActivityLogAnalysisCount<ActivityLogOperationEffect>[];
  executionOrigins: ActivityLogAnalysisCount<ActivityLogExecutionOrigin>[];
}

export interface ConformedActivitySeries {
  id: string;
  analysisVersion: typeof ACTIVITY_LOG_ANALYSIS_VERSION;
  taxonomyVersion: typeof ACTIVITY_LOG_TAXONOMY_VERSION;
  subscriptionId: string;
  month: string;
  scope: PortalActivityLogAnalysisScope;
  operation: string;
  result: string;
  executionOrigin: ActivityLogExecutionOrigin;
  operationEffect: ActivityLogOperationEffect;
  tagIds: ActivityLogTagId[];
  eventCount: number;
  firstTimestamp: string;
  lastTimestamp: string;
  dailyCounts: Array<{ date: string; count: number }>;
  utcWeekdayHourDistribution: Array<{ weekday: number; hour: number; count: number }>;
  distinctActorCount: number;
  confidence: ActivityLogClassificationConfidence;
  evidenceEventKeys: string[];
  evidenceTruncated: boolean;
}

export interface ConformedActivityAnalysisGroupBase {
  id: string;
  analysisVersion: typeof ACTIVITY_LOG_ANALYSIS_VERSION;
  taxonomyVersion: typeof ACTIVITY_LOG_TAXONOMY_VERSION;
  subscriptionId: string;
  month: string;
  scope: PortalActivityLogAnalysisScope;
  eventCount: number;
  firstTimestamp: string;
  lastTimestamp: string;
  confidence: ActivityLogClassificationConfidence;
  reasons: string[];
  tagIds: ActivityLogTagId[];
  evidenceEventKeys: string[];
  evidenceTruncated: boolean;
}

export interface ConformedActivityOperationSummary extends ConformedActivityAnalysisGroupBase {
  type: 'operation-summary';
  operation: string;
  provider?: string;
  resourceType?: string;
  operationEffect: ActivityLogOperationEffect;
  executionOrigin: ActivityLogExecutionOrigin;
  distinctResourceCount: number;
  resultCounts: Record<string, number>;
}

export interface ConformedActivitySecuritySensitiveEvidence extends ConformedActivityAnalysisGroupBase {
  type: 'security-sensitive-activity';
  capabilityTag: Exclude<
    ActivityLogTagId,
    `actor.${string}` | `change.${string}` | `intent.${string}` | `scheduler.${string}` | 'security.sensitive-operation'
  >;
  operation: string;
  executionOrigin: ActivityLogExecutionOrigin;
  resultCounts: Record<string, number>;
}

export interface ConformedActivityPowerPatternEvidence extends ConformedActivityAnalysisGroupBase {
  type: 'power-pattern-evidence';
  patternId: string;
  resourceId: string;
  startCount: number;
  stopCount: number;
  opposingPairCount: number;
  utcActiveDayCount: number;
  utcHourDistribution: Record<string, number>;
  executionOriginCounts: Partial<Record<ActivityLogExecutionOrigin, number>>;
  resultCounts: Record<string, number>;
  dataSufficiency: ActivityLogPowerDataSufficiency;
}

export type ConformedActivityAnalysisGroup =
  | ConformedActivityOperationSummary
  | ConformedActivitySecuritySensitiveEvidence
  | ConformedActivityPowerPatternEvidence;

export interface ConformedActivityResourceSummary {
  scope: PortalActivityLogAnalysisScope & { level: 'resource'; resourceId: string };
  eventCount: number;
  operationCounts: ActivityLogAnalysisCount[];
  resultCounts: ActivityLogAnalysisCount[];
  tagCounts: ActivityLogAnalysisCount<ActivityLogTagId>[];
  executionOriginCounts: ActivityLogAnalysisCount<ActivityLogExecutionOrigin>[];
  relatedEvidenceIds: string[];
}

export interface ConformedActivityAnalysisArtifact {
  schemaVersion: typeof CONFORMED_ACTIVITY_ANALYSIS_SCHEMA_VERSION;
  analysisVersion: typeof ACTIVITY_LOG_ANALYSIS_VERSION;
  taxonomyVersion: typeof ACTIVITY_LOG_TAXONOMY_VERSION;
  projection: 'activity-analysis';
  subscriptionId: string;
  month: string;
  generatedAt: string;
  source: {
    portalProjectionSchemaVersion: number;
    sourceHighWatermark?: string;
    sourceShardFingerprint?: string;
    retainedEventCount: number;
    classifiedRetainedEventCount: number;
    unclassifiedRetainedEventCount: number;
    classificationState: ActivityLogClassificationState;
  };
  facets: ConformedActivityAnalysisFacets;
  activitySeries: ConformedActivitySeries[];
  resources: ConformedActivityResourceSummary[];
  groups: ConformedActivityAnalysisGroup[];
}

export interface PortalActivityAnalysisCollection<T> {
  totalCount: number;
  returnedCount: number;
  truncated: boolean;
  items: T[];
}

export type PortalActivityAnalysisLimitationCode =
  | 'source-coverage-partial'
  | 'unclassified-events'
  | 'facet-values-truncated'
  | 'resource-summaries-truncated'
  | 'operation-summaries-truncated'
  | 'security-sensitive-truncated'
  | 'power-patterns-truncated'
  | 'artifact-size-budget'
  | 'month-missing'
  | 'month-partial'
  | 'month-stale'
  | 'month-freshness-unknown'
  | 'nested-values-truncated'
  | 'mixed-analysis-versions'
  | 'mixed-taxonomy-versions'
  | 'response-truncated';

export interface PortalActivityAnalysisFacets {
  tags: PortalActivityAnalysisCollection<ActivityLogAnalysisCount<ActivityLogTagId>>;
  operations: PortalActivityAnalysisCollection<ActivityLogAnalysisCount>;
  providers: PortalActivityAnalysisCollection<ActivityLogAnalysisCount>;
  resourceTypes: PortalActivityAnalysisCollection<ActivityLogAnalysisCount>;
  results: PortalActivityAnalysisCollection<ActivityLogAnalysisCount>;
  operationEffects: PortalActivityAnalysisCollection<ActivityLogAnalysisCount<ActivityLogOperationEffect>>;
  executionOrigins: PortalActivityAnalysisCollection<ActivityLogAnalysisCount<ActivityLogExecutionOrigin>>;
}

export interface PortalActivitySeries {
  seriesId: PortalActivityAnalysisGroupId;
  scope: PortalActivityLogAnalysisScope;
  operation: string;
  result: string;
  executionOrigin: ActivityLogExecutionOrigin;
  operationEffect: ActivityLogOperationEffect;
  tagIds: ActivityLogTagId[];
  eventCount: number;
  firstTimestamp: string;
  lastTimestamp: string;
  monthCounts: ActivityLogAnalysisCount[];
  dailyCounts: Array<{ date: string; count: number }>;
  utcWeekdayHourDistribution: Array<{ weekday: number; hour: number; count: number }>;
  confidence: ActivityLogClassificationConfidence;
  evidenceIds: PortalActivityEvidenceId[];
  evidenceTruncated: boolean;
}

export interface PortalActivityResourceSummary {
  scope: PortalActivityLogAnalysisScope & { level: 'resource'; resourceId: string };
  eventCount: number;
  firstTimestamp: string;
  lastTimestamp: string;
  operationCounts: ActivityLogAnalysisCount[];
  resultCounts: ActivityLogAnalysisCount[];
  tagCounts: ActivityLogAnalysisCount<ActivityLogTagId>[];
  executionOriginCounts: ActivityLogAnalysisCount<ActivityLogExecutionOrigin>[];
  relatedGroupIds: PortalActivityAnalysisGroupId[];
  confidence: ActivityLogClassificationConfidence;
}

interface PortalActivityDerivedEvidenceBase {
  scope: PortalActivityLogAnalysisScope;
  eventCount: number;
  firstTimestamp: string;
  lastTimestamp: string;
  confidence: ActivityLogClassificationConfidence;
  tagIds: ActivityLogTagId[];
  reasons: PortalActivityAnalysisReasonCode[];
  evidenceIds: PortalActivityEvidenceId[];
  evidenceTruncated: boolean;
}

export interface PortalActivityOperationSummary extends PortalActivityDerivedEvidenceBase {
  groupId: PortalActivityAnalysisGroupId;
  derivedType: 'operationSummary';
  operation: string;
  provider?: string;
  resourceType?: string;
  operationEffect: ActivityLogOperationEffect;
  executionOrigin: ActivityLogExecutionOrigin;
  distinctResourceCount: number;
  resultCounts: ActivityLogAnalysisCount[];
}

export interface PortalActivitySecuritySensitiveEvidence extends PortalActivityDerivedEvidenceBase {
  groupId: PortalActivityAnalysisGroupId;
  derivedType: 'securitySensitiveActivity';
  capabilityTag: Exclude<
    ActivityLogTagId,
    `actor.${string}` | `change.${string}` | `intent.${string}` | `scheduler.${string}` | 'security.sensitive-operation'
  >;
  operation: string;
  executionOrigin: ActivityLogExecutionOrigin;
  resultCounts: ActivityLogAnalysisCount[];
}

export interface PortalActivityPowerPatternEvidence extends PortalActivityDerivedEvidenceBase {
  patternId: PortalActivityAnalysisGroupId;
  derivedType: 'powerPatternEvidence';
  startCount: number;
  stopCount: number;
  opposingPairCount: number;
  utcActiveDayCount: number;
  utcHourDistribution: Array<{ hour: number; count: number }>;
  executionOriginCounts: ActivityLogAnalysisCount<ActivityLogExecutionOrigin>[];
  resultCounts: ActivityLogAnalysisCount[];
  dataSufficiency: ActivityLogPowerDataSufficiency;
}

export type PortalActivityDerivedEvidence =
  | PortalActivityOperationSummary
  | PortalActivitySecuritySensitiveEvidence
  | PortalActivityPowerPatternEvidence;

export interface PortalActivityAnalysisResponse {
  schemaVersion: typeof PORTAL_ACTIVITY_ANALYSIS_RESPONSE_SCHEMA_VERSION;
  generatedAt: string;
  subscriptionId: string;
  fromMonth: string;
  toMonth: string;
  resourceId?: string;
  requestedMonths: string[];
  availableMonths: string[];
  missingMonths: string[];
  partialMonths: string[];
  staleMonths: string[];
  freshnessUnknownMonths: string[];
  analysisVersions: string[];
  taxonomyVersions: string[];
  facets: PortalActivityAnalysisFacets;
  activitySeries: PortalActivityAnalysisCollection<PortalActivitySeries>;
  resources: PortalActivityAnalysisCollection<PortalActivityResourceSummary>;
  operationSummaries: PortalActivityAnalysisCollection<PortalActivityOperationSummary>;
  securitySensitive: PortalActivityAnalysisCollection<PortalActivitySecuritySensitiveEvidence>;
  powerPatterns: PortalActivityAnalysisCollection<PortalActivityPowerPatternEvidence>;
  limitations: PortalActivityAnalysisLimitationCode[];
}

const CANONICAL_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const CONFORMED_ACTIVITY_ANALYSIS_NAME = /^activity-logs\/activity_analysis-(\d{4}-(?:0[1-9]|1[0-2]))\.json$/;

export function buildConformedActivityAnalysisLogicalName(month: string): string {
  if (!CANONICAL_MONTH.test(month)) {
    throw new Error('Activity Analysis month must use canonical YYYY-MM format.');
  }
  return `activity-logs/activity_analysis-${month}.json`;
}

export function parseConformedActivityAnalysisLogicalName(logicalName: string): string | undefined {
  return CONFORMED_ACTIVITY_ANALYSIS_NAME.exec(logicalName)?.[1];
}
