import {
  ACTIVITY_LOG_ANALYSIS_VERSION,
  ACTIVITY_LOG_TAXONOMY_VERSION,
  PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1,
  PORTAL_ACTIVITY_ANALYSIS_RESPONSE_SCHEMA_VERSION,
  isPortalActivityLogClassification,
  type PortalActivityAnalysisResponse,
  type PortalActivityAnalysisLimitationCode,
  type PortalActivityEvidenceId,
  type PortalActivityAnalysisGroupId,
  type PortalActivityLogClassification,
} from '../index';

const evidenceId = 'aev1_0000000000000000000000000000000000000000000000000000000000000001' satisfies PortalActivityEvidenceId;
const groupId = 'aag1_0000000000000000000000000000000000000000000000000000000000000001' satisfies PortalActivityAnalysisGroupId;

const classification = {
  taxonomyVersion: ACTIVITY_LOG_TAXONOMY_VERSION,
  executionOrigin: 'manual',
  operationEffect: 'action',
  scope: {
    subscriptionId: 'sub-a',
    level: 'resource',
    resourceId: '/subscriptions/sub-a/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-a',
  },
  tags: [
    { tagId: 'actor.manual', dimension: 'actor', confidence: 'high' },
    { tagId: 'scheduler.power-operation', dimension: 'scheduler', confidence: 'high' },
  ],
} satisfies PortalActivityLogClassification;

const emptyCollection = {
  totalCount: 0,
  returnedCount: 0,
  truncated: false,
  items: [],
};

const response = {
  schemaVersion: PORTAL_ACTIVITY_ANALYSIS_RESPONSE_SCHEMA_VERSION,
  generatedAt: '2026-09-02T05:00:00.000Z',
  subscriptionId: 'sub-a',
  fromMonth: '2026-08',
  toMonth: '2026-09',
  requestedMonths: ['2026-08', '2026-09'],
  availableMonths: ['2026-08', '2026-09'],
  missingMonths: [],
  partialMonths: [],
  staleMonths: [],
  freshnessUnknownMonths: ['2026-09'],
  analysisVersions: [ACTIVITY_LOG_ANALYSIS_VERSION],
  taxonomyVersions: [ACTIVITY_LOG_TAXONOMY_VERSION],
  facets: {
    tags: { ...emptyCollection },
    operations: { ...emptyCollection },
    providers: { ...emptyCollection },
    resourceTypes: { ...emptyCollection },
    results: { ...emptyCollection },
    operationEffects: { ...emptyCollection },
    executionOrigins: { ...emptyCollection },
  },
  activitySeries: {
    totalCount: 1,
    returnedCount: 1,
    truncated: false,
    items: [
      {
        seriesId: groupId,
        scope: classification.scope,
        operation: 'microsoft.compute/virtualmachines/start/action',
        result: 'succeeded',
        executionOrigin: 'manual',
        operationEffect: 'action',
        tagIds: ['actor.manual', 'scheduler.power-operation'],
        eventCount: 1,
        firstTimestamp: '2026-09-01T08:00:00.000Z',
        lastTimestamp: '2026-09-01T08:00:00.000Z',
        monthCounts: [{ value: '2026-09', count: 1 }],
        dailyCounts: [{ date: '2026-09-01', count: 1 }],
        utcWeekdayHourDistribution: [{ weekday: 2, hour: 8, count: 1 }],
        confidence: 'high',
        evidenceIds: [evidenceId],
        evidenceTruncated: false,
      },
    ],
  },
  resources: {
    totalCount: 1,
    returnedCount: 1,
    truncated: false,
    items: [
      {
        scope: classification.scope,
        eventCount: 1,
        firstTimestamp: '2026-09-01T08:00:00.000Z',
        lastTimestamp: '2026-09-01T08:00:00.000Z',
        operationCounts: [{ value: 'microsoft.compute/virtualmachines/start/action', count: 1 }],
        resultCounts: [{ value: 'succeeded', count: 1 }],
        tagCounts: [{ value: 'actor.manual', count: 1 }],
        executionOriginCounts: [{ value: 'manual', count: 1 }],
        relatedGroupIds: [groupId],
        confidence: 'high',
      },
    ],
  },
  operationSummaries: {
    totalCount: 1,
    returnedCount: 1,
    truncated: false,
    items: [
      {
        groupId,
        derivedType: 'operationSummary',
        scope: classification.scope,
        eventCount: 1,
        firstTimestamp: '2026-09-01T08:00:00.000Z',
        lastTimestamp: '2026-09-01T08:00:00.000Z',
        confidence: 'high',
        tagIds: ['actor.manual'],
        reasons: ['derived.operation-summary'],
        evidenceIds: [evidenceId],
        evidenceTruncated: false,
        operation: 'microsoft.compute/virtualmachines/start/action',
        provider: 'microsoft.compute',
        resourceType: 'microsoft.compute/virtualmachines',
        operationEffect: 'action',
        executionOrigin: 'manual',
        distinctResourceCount: 1,
        resultCounts: [{ value: 'succeeded', count: 1 }],
      },
    ],
  },
  securitySensitive: {
    totalCount: 1,
    returnedCount: 1,
    truncated: false,
    items: [
      {
        groupId,
        derivedType: 'securitySensitiveActivity',
        scope: classification.scope,
        eventCount: 1,
        firstTimestamp: '2026-09-01T08:00:00.000Z',
        lastTimestamp: '2026-09-01T08:00:00.000Z',
        confidence: 'high',
        tagIds: ['security.remote-execution'],
        reasons: ['derived.security-sensitive-activity'],
        evidenceIds: [evidenceId],
        evidenceTruncated: false,
        capabilityTag: 'security.remote-execution',
        operation: 'microsoft.compute/virtualmachines/runcommand/action',
        executionOrigin: 'manual',
        resultCounts: [{ value: 'succeeded', count: 1 }],
      },
    ],
  },
  powerPatterns: {
    totalCount: 1,
    returnedCount: 1,
    truncated: false,
    items: [
      {
        patternId: groupId,
        derivedType: 'powerPatternEvidence',
        scope: classification.scope,
        eventCount: 2,
        firstTimestamp: '2026-09-01T08:00:00.000Z',
        lastTimestamp: '2026-09-01T17:00:00.000Z',
        confidence: 'high',
        tagIds: ['scheduler.power-operation'],
        reasons: ['derived.power-pattern-evidence'],
        evidenceIds: [evidenceId],
        evidenceTruncated: false,
        startCount: 1,
        stopCount: 1,
        opposingPairCount: 1,
        utcActiveDayCount: 1,
        utcHourDistribution: [
          { hour: 8, count: 1 },
          { hour: 17, count: 1 },
        ],
        executionOriginCounts: [{ value: 'manual', count: 2 }],
        resultCounts: [{ value: 'succeeded', count: 2 }],
        dataSufficiency: 'oneOff',
      },
    ],
  },
  limitations: ['month-freshness-unknown'],
} satisfies PortalActivityAnalysisResponse;

const activitySeriesLimit: 10_000 = PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.activitySeries;
const responseLimit: 33_554_432 = PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.responseUtf8Bytes;
const classificationIsValid: boolean = isPortalActivityLogClassification(classification);
const nestedValuesTruncated: PortalActivityAnalysisLimitationCode = 'nested-values-truncated';

void classification;
void response;
void activitySeriesLimit;
void responseLimit;
void classificationIsValid;
void nestedValuesTruncated;
